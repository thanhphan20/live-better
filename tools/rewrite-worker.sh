#!/usr/bin/env bash
# Phát lệnh "viết lại giọng" cho một CLI worker — giữ prompt chuẩn, cờ headless
# của từng CLI và bước kiểm chứng ở một chỗ, để orchestrator khỏi tự ráp. Spec:
# docs/superpowers/specs/2026-10-03-giong-van-nguoi-thay-design.md
#
#   tools/rewrite-worker.sh <claude|agy|grok|devin> <NN>            # viết lại chương NN
#   tools/rewrite-worker.sh <claude|agy|grok|devin> <NN> <loi.txt>  # sửa đúng các lỗi liệt kê trong loi.txt
#   tools/rewrite-worker.sh review <NN>    # claude review bản trong worktree (KHÔNG sửa file)
#   tools/rewrite-worker.sh verify <NN>    # chạy lại kiểm chứng độc lập trong worktree
#   tools/rewrite-worker.sh take <NN>      # kiểm chứng lần cuối, chép file về working tree chính, xóa worktree
#   tools/rewrite-worker.sh drop <NN>      # bỏ worktree của chương (CLI chết giữa chừng, giao lại)
#   tools/rewrite-worker.sh -n <cli|review> <NN>   # chỉ in prompt + lệnh, không chạy
#
# Mỗi chương viết trong một git worktree riêng (mặc định ../.<tên-kho>-rewrite/NN,
# đổi bằng REWRITE_WT_ROOT). Lý do: check-plain.mjs và check-refs.mjs quét cả
# book/; nếu nhiều worker cùng viết trong một working tree, worker này thấy lỗi
# ở chương đang dở của worker kia rồi "tự sửa" sang file không phải của nó.
# Worktree tách ra từ HEAD lúc phát việc; chỉ một file thay đổi nên chép về
# working tree chính bằng `take` là an toàn dù nhánh đã có commit chương khác.
#
# Worker chỉ sửa file và chạy checker; KHÔNG commit — commit do orchestrator làm
# sau `take`, khi verify đạt và review đạt.
set -euo pipefail
cd "$(dirname "$0")/.."
MAIN=$PWD

DRY=0
[ "${1:-}" = "-n" ] && { DRY=1; shift; }
CLI=${1:-}
CH=${2:-}
FIX=${3:-}
[ -n "$CLI" ] && [ -n "$CH" ] || { echo "cần: <claude|agy|grok|devin|review|verify|take|drop> <NN> [loi.txt]" >&2; exit 2; }
[[ $CH =~ ^[0-9]{2}$ ]] || { echo "số chương phải đủ hai chữ số: 05, 22" >&2; exit 2; }

FILE=$(ls "book/${CH}-"*.md 2>/dev/null | head -1)
[ -n "$FILE" ] || { echo "không thấy book/${CH}-*.md" >&2; exit 2; }

WT_ROOT=${REWRITE_WT_ROOT:-"$(cd .. && pwd)/.$(basename "$MAIN")-rewrite"}
WT="$WT_ROOT/$CH"
REFS_FILE="$WT_ROOT/$CH.refs"
mkdir -p "$WT_ROOT/logs"

# Tổng số trích dẫn check-refs đếm được. Viết lại văn dẫn có thể đặt tên pháp
# quy sát trước "mục N" làm trích dẫn bị coi là điều luật và lặng lẽ rơi khỏi
# bảng — --check vẫn xanh, chỉ tổng số tụt (CLAUDE.md).
refs_total() { (cd "$1" && node tools/check-refs.mjs --check 2>/dev/null | sed -n 's/.*cả \([0-9][0-9]*\) trích dẫn.*/\1/p'); }

verify() {
  [ -d "$WT" ] || { echo "chưa có worktree $WT" >&2; return 2; }
  local ok=1 other base now
  echo "== kiểm chứng $FILE trong $WT"
  other=$(cd "$WT" && git -c core.quotepath=false status --porcelain | grep -v " ${FILE}\$" || true)
  [ -z "$other" ] || { echo "LỖI worker động vào file khác:"; echo "$other"; ok=0; }
  (cd "$WT" && node tools/check-rewrite.mjs "$FILE") || ok=0
  (cd "$WT" && node tools/check-plain.mjs | tail -1) || ok=0
  (cd "$WT" && node tools/sync-stats.mjs --check | tail -1) || ok=0
  base=$(cat "$REFS_FILE" 2>/dev/null || true)
  now=$(refs_total "$WT")
  if [ -z "$now" ]; then
    echo "LỖI check-refs --check không đạt:"; (cd "$WT" && node tools/check-refs.mjs --check | tail -12) || true; ok=0
  elif [ "$now" != "$base" ]; then
    echo "LỖI tổng trích dẫn đổi: lúc phát việc $base, bây giờ $now"; ok=0
  else
    echo "check-refs: đạt, tổng $now trích dẫn như lúc phát việc"
  fi
  [ $ok = 1 ] && { echo "KẾT QUẢ: ĐẠT"; return 0; }
  echo "KẾT QUẢ: KHÔNG ĐẠT"; return 1
}

case $CLI in
  verify) verify; exit $? ;;
  drop)
    git worktree remove --force "$WT" 2>/dev/null || true
    rm -f "$REFS_FILE"; echo "đã bỏ worktree chương $CH"; exit 0 ;;
  take)
    verify || { echo "chưa đạt, không chép" >&2; exit 1; }
    git diff --quiet HEAD -- "$FILE" || { echo "$FILE ở working tree chính đang có thay đổi chưa commit, không ghi đè" >&2; exit 1; }
    cp "$WT/$FILE" "$FILE"
    git worktree remove --force "$WT"; rm -f "$REFS_FILE"
    echo "đã chép $FILE về working tree chính, worktree đã xóa"; exit 0 ;;
esac

# Bản gốc tiếng Trung: file bị xóa trong cùng commit thêm file VN.
ADD=$(git log --diff-filter=A --format=%H -n1 -- "$FILE")
OLD=$(git -c core.quotepath=false show "$ADD" --name-status --format= | awk -F'\t' '$1=="D"{print $2}' | grep -F "book/${CH}-" | head -1)
[ -n "$OLD" ] || { echo "$FILE: không tìm được bản gốc TQ trong $ADD" >&2; exit 2; }

SPEC=docs/superpowers/specs/2026-10-03-giong-van-nguoi-thay-design.md

# Mốc giọng: chương pilot đã được chủ sách duyệt và commit trên nhánh này.
PILOT=""
if [ "$CH" != 22 ]; then
  P=$(git log --format=%H -n1 --grep='^Viết lại giọng chương 22' HEAD || true)
  [ -n "$P" ] && PILOT="Mốc giọng đã được chủ sách duyệt: git show $P:$(ls book/22-*.md)
Đọc 3-4 mục bất kỳ trong đó trước khi làm, bám nhịp câu và mức thân mật của nó."
fi

REFS_NOW=$( [ -f "$REFS_FILE" ] && cat "$REFS_FILE" || refs_total "$MAIN" )

if [ "$CLI" = "review" ]; then
  read -r -d '' PROMPT <<EOF || true
Review file $FILE trong thư mục hiện tại — bản vừa được viết lại giọng "người
thầy trò chuyện". KHÔNG sửa file, KHÔNG chạy git ngoài git show/diff.

Đọc trước: $SPEC (giọng văn, bảng di trừ, danh mục không-được-động).
$PILOT

Đối chiếu từng mục, cả chương:
1. Giọng: so với spec — câu có chủ ngữ rõ, nhịp tự nhiên, không calque nhóm
   "luôn đổi", không văn điện báo, không câu kết thăng hoa, không chùm gạch
   ngang dài, không dấu cảm thán, không dạy đời.
2. Cấu trúc: so với bản VN cũ (git show HEAD:$FILE) — danh mục không-được-động.
3. Nghĩa: so với bản gốc tiếng Trung (git show ${ADD}^:"${OLD}") — chỗ nào lệch
   nghĩa, thêm hoặc mất dữ kiện, nói mạnh hơn hay yếu hơn gốc (thêm "nhiều",
   "luôn", "chắc chắn"…), làm nhẹ hay nặng hậu quả pháp lý.

Mức báo lỗi (để vòng sửa không lặp vô tận):
- "Nói dễ hiểu" bị giới hạn 2-4 câu, ≤60 từ, nên ngắn hơn 说人话 của gốc là
  bình thường. Chỉ báo thiếu ý khi việc thiếu làm đổi phạm vi, điều kiện,
  chủ thể, mức hậu quả hay làm câu nói mạnh/yếu hơn gốc; không báo việc lược
  chi tiết phụ (tên vụ án, số tiền minh họa). Đề xuất sửa phải vừa 60 từ.
- Từ "tác giả" chỉ ai thì xem Nguồn: nhóm tác giả bài báo được trích là
  "nhóm nghiên cứu", không bắt đổi lại thành "tác giả".
- Lỗi có từ bản VN cũ vẫn báo nếu lệch gốc; gắn "(có từ bản cũ)".

Liệt kê lỗi theo dạng: [giọng|cấu trúc|nghĩa] mục N: <vấn đề> → <đề xuất sửa
ngắn>. Nếu không có vấn đề gì thì trả lời đúng một chữ "SẠCH".
EOF
elif [ -n "$FIX" ]; then
  [ -f "$FIX" ] || { echo "không thấy file lỗi $FIX" >&2; exit 2; }
  read -r -d '' PROMPT <<EOF || true
File $FILE trong thư mục hiện tại là bản viết lại giọng đang dở, còn các lỗi
dưới đây. Sửa đúng các chỗ được nêu, không viết lại phần khác, không động file
nào khác ngoài $FILE, KHÔNG git add, KHÔNG git commit.

Quy tắc: $SPEC và CLAUDE.md. Bản gốc tiếng Trung: git show ${ADD}^:"${OLD}"

Lỗi cần sửa:
$(cat "$FIX")

Sửa xong chạy:
  node tools/check-rewrite.mjs $FILE && node tools/check-plain.mjs && node tools/check-refs.mjs --check
tới khi sạch; tổng trích dẫn check-refs in ra phải còn đúng $REFS_NOW.
EOF
else
  read -r -d '' PROMPT <<EOF || true
Đọc ba file này trước khi làm:
- CLAUDE.md — quy tắc dự án
- $SPEC — giọng văn "người thầy trò chuyện", bảng di trừ, danh mục không-được-động
- /Users/binhan/.agents/skills/no-ai-slop/SKILL.md — mẫu văn AI cần di trừ
$PILOT

Việc: viết lại văn phong TOÀN BỘ file $FILE theo giọng trong spec.
Đây là viết lại câu chữ, không phải dịch lại nội dung — mọi dữ kiện, con số,
kết luận, nguồn trích giữ nguyên. Bản gốc tiếng Trung để đối chiếu nghĩa:
  git show ${ADD}^:"${OLD}"

Ba lỗi dễ mắc nhất, tránh ngay từ đầu:
- Không nói mạnh hơn hay yếu hơn gốc: không tự thêm "nhiều", "luôn", "chắc chắn".
- Không đổi thuật ngữ hậu quả pháp lý sang từ nhẹ hơn hay nặng hơn (xem spec).
- Không dùng gạch ngang dài thay dấu phẩy, dấu chấm; tối đa một cái mỗi mục.

Hai lỗi review bắt nhiều nhất ở các chương đầu, kiểm từng mục trước khi xong:
- Dòng "Nói dễ hiểu" cũng phải viết lại thành câu trọn, có chủ ngữ (bạn, ai,
  công an, tòa…), không giữ kiểu điện báo "X: tạm giữ…, nặng hơn…". Đối chiếu
  nó với dòng 说人话 của gốc: không làm rơi ý (điều kiện, chủ thể, "có thể",
  "gần", "từ … trở lên"), nhưng chỉ dùng dữ kiện có trong cột Lợi ích.
- Bản VN cũ có chỗ đã nói mạnh hơn gốc ("bị" thay cho 可以/能, "10 ngày" thay
  cho 10 日以内, bỏ 一律/近) — so với gốc và sửa luôn, đừng chép lại.

Danh mục không-được-động trong spec là cứng: tiêu đề mục, tên field và thứ tự
field, thẻ nhan-chi-phi, cột Nguồn, Mức chứng cứ, mọi con số và cách viết số,
marker Ghi chú, "Cần xác minh"/"TODO", dòng "[← Mục lục]" và "# N. Tên phần".

Chỉ sửa đúng file $FILE. Không tạo hay sửa file nào khác, không chạy
sync-stats.mjs hay check-refs.mjs khi không có --check (chúng ghi file),
KHÔNG git add, KHÔNG git commit. Chương dài thì sửa theo từng nhóm vài mục
bằng công cụ edit, đừng ghi đè cả file trong một lần.

Sau khi sửa xong chạy:
  node tools/check-rewrite.mjs $FILE && node tools/check-plain.mjs && node tools/check-refs.mjs --check
và tự sửa tới khi sạch; tổng trích dẫn check-refs in ra phải còn đúng $REFS_NOW.
Cuối cùng in ra: số mục đã viết lại, lỗi checker còn lại (phải là 0).
EOF
fi

# Model cho worker claude và review; đổi bằng biến môi trường CLAUDE_MODEL.
CLAUDE_MODEL=${CLAUDE_MODEL:-claude-sonnet-5-5}

case $CLI in
  claude) CMD=(claude -p "$PROMPT" --model "$CLAUDE_MODEL" --dangerously-skip-permissions) ;;
  agy)    CMD=(agy -p "$PROMPT" --dangerously-skip-permissions) ;;
  grok)   CMD=(grok -p "$PROMPT" --always-approve) ;;
  devin)  CMD=(devin -p "$PROMPT" --permission-mode dangerous --respect-workspace-trust false) ;;
  review) CMD=(claude -p "$PROMPT" --model "$CLAUDE_MODEL" --dangerously-skip-permissions) ;;
  *) echo "cli không biết: $CLI" >&2; exit 2 ;;
esac

if [ $DRY = 1 ]; then
  echo "# chạy trong: $WT"
  printf '%q ' "${CMD[@]}"; echo
  echo "---PROMPT---"
  printf '%s\n' "$PROMPT"
  exit 0
fi

# Worktree: viết mới thì tạo (đã có là còn việc dở — drop trước nếu muốn làm lại);
# sửa lỗi và review thì phải có sẵn.
if [ "$CLI" = review ] || [ -n "$FIX" ]; then
  [ -d "$WT" ] || { echo "chưa có worktree $WT — chương này chưa được phát việc" >&2; exit 2; }
else
  [ ! -d "$WT" ] || { echo "$WT đã tồn tại (việc dở); chạy 'drop $CH' trước nếu muốn làm lại từ đầu" >&2; exit 2; }
  for i in 1 2 3; do git worktree add -q --detach "$WT" HEAD && break; sleep "$i"; done
  [ -d "$WT" ] || { echo "không tạo được worktree $WT" >&2; exit 2; }
  refs_total "$WT" > "$REFS_FILE"
  [ -s "$REFS_FILE" ] || { echo "check-refs --check không đạt ngay từ HEAD, dừng" >&2; exit 2; }
fi

LOG="$WT_ROOT/logs/$CH-$CLI-$(date +%Y%m%d-%H%M%S).log"
echo "chạy $CLI cho chương $CH trong $WT, log: $LOG"
(cd "$WT" && "${CMD[@]}") 2>&1 | tee "$LOG" || echo "CLI $CLI thoát với mã lỗi" | tee -a "$LOG"

[ "$CLI" = review ] && exit 0
verify 2>&1 | tee -a "$LOG"
