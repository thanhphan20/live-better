# Kế hoạch chuyển repo sang tiếng Việt (《Cẩm nang sống đáng giá》)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chuyển toàn bộ repo thành bản tiếng Việt 1-1 của《高性价比人生指南》, gồm nội dung 641 mục, hạ tầng kiểm chứng (3 tool), trang tra cứu, pipeline sách và toàn bộ file quy trình.

**Architecture:** Port hạ tầng sang quy ước tiếng Việt trước, dịch pilot một phần để duyệt giọng, rồi dịch lần lượt 34 file `book/` — mỗi file một commit, rename bằng `git mv`. Cuối cùng dịch vỏ ngoài (README/CLAUDE.md/docs/skills/CI), xóa phần Trung Quốc còn sót, chạy toàn bộ tool xanh rồi bàn giao.

**Tech Stack:** Markdown, Node.js (script `.mjs` không dep ngoài trừ epub/marked), index.html thuần JS, pandoc+typst cho PDF (CI).

**Spec:** `docs/superpowers/specs/2026-09-30-chuyen-sang-tieng-viet-design.md` — đọc spec trước khi làm; mọi quy ước ngôn ngữ lấy từ spec mục 3.

## Global Constraints

- Nhánh làm việc: `ban-tieng-viet`. Commit message tiếng Việt. Mỗi file book = 1 commit. **Yêu cầu `git config user.name` + `user.email` đã có trước khi bắt đầu** (chưa có thì dừng hỏi người dùng).
- Field mục: `Chi phí:` / `Nói dễ hiểu:` / `Lợi ích:` / `Mức chứng cứ:` / `Nguồn:` / `Ghi chú:` — dấu `:` ASCII, không dùng `：`.
- Cost-tag: `<!-- nhan-chi-phi: tien=.. thoi-gian=.. y-chi=.. loi-ich=.. quy-mo=.. -->`, giá trị ASCII theo spec 3.2.
- Trích chéo: `phần X, mục Y` (khác phần), `mục N` (cùng phần), `mục X đến Y` (khoảng), `phần X` (cả phần). Cấm `mục trên/dưới/trước/sau/kế/cuối/đầu` làm chỉ đường tương đối. Luật pháp luôn viết `Điều N`.
- Mục gắn TQ: `- Ghi chú: Chỉ tham khảo TQ: ...`. Mục khoa học phổ quát không đánh dấu dù nguồn là nghiên cứu TQ.
- `Nguồn:` giữ nguyên văn (tên tài liệu tiếng Trung + link). Ngoài `Nguồn:` ra, file `.md` không được còn chữ Hán.
- Số liệu/ngày/tên luật/DOI giữ nguyên văn; số trong văn VN viết kiểu Việt: chấm ngăn nghìn (`1.130.040`), phẩy thập phân (`86,5`), tiền TQ ghi `nhân dân tệ`.
- `Nói dễ hiểu:` ≤ 60 từ, không thuật ngữ nghiên cứu, không số mới ngoài `Lợi ích`/`Chi phí`/tiêu đề.
- KHÔNG dịch: `LICENSE`, `LICENSE-CODE`, `.gitignore`, `.nojekyll`, lockfile, tên biến/hàm trong code, nội dung dòng `Nguồn:`.
- Không push lên remote; không merge main — bàn giao cuối cho người dùng.

## Review Focus

1. `Nguồn:` là nơi duy nhất được còn chữ Hán — sweep cuối phải whitelist đúng dòng này, nhầm chỗ khác là sót tiếng Trung. (Test: Task 51.)
2. `Điều N` (luật) vs `mục N` (trích mục) — regex check-refs phải không nhầm; index.html XREF_RE không được link hóa `Điều 30`. (Test: Task 2 bước kiểm.)
3. Phẩy thập phân VN `86,5` bị `numbers()` bản TQ đọc sai thành `865` — check-plain VN phải parse đúng. (Test: Task 3 bước 2.)
4. README đổi heading làm `lib/book.mjs readBook()` vỡ — heading VN phải khớp từng ký tự với hằng trong lib. (Pin ở Task 6 + Task 42.)
5. index.html lấy danh sách file từ link `book/*.md` trong README — giữa chừng site hỏng là đúng, nhưng sau Task 42 phải fetch đủ 34 file. (Test: Task 49.)
6. Font `fonts-noto-cjk` có thể thiếu dấu tổ hợp VN trong PDF — đổi `fonts-noto` trong workflow và kiểm `template.typ`. (Task 45/51.)

---

## Pha 1 — Hạ tầng + pilot

### Task 1: tools/check-migration.mjs (tool kiểm chứng chuyển đổi)

**Files:**
- Create: `tools/check-migration.mjs`

**Interfaces:**
- Produces: CLI `node tools/check-migration.mjs <file-vn> <file-goc-tren-main>` — so sánh số mục/field/link/tag giữa file VN và bản gốc `main:book/...`, quét chữ Hán sót. Mọi task dịch (Task 7–40, 41) gọi nó.

- [ ] **Step 1: Viết script**

```js
// Kiểm chứng một file đã chuyển sang tiếng Việt:
//   node tools/check-migration.mjs book/18-nuoi-con-co-dang-khong.md "book/18-养孩子划不划算.md"
// Đối chiếu bản gốc lấy từ `git show main:<đường dẫn cũ>` — số mục, số field
// mỗi loại, số cost-tag, số link trong Nguồn/Ghi chú phải bằng nhau.
// Chữ Hán chỉ được nằm trong dòng `- Nguồn:`. Lỗi → exit 1.
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [vnPath, oldPath] = process.argv.slice(2);
if (!vnPath || !oldPath) { console.error('cần: <file-vn> <file-goc-tren-main>'); process.exit(2); }

const vn = readFileSync(resolve(ROOT, vnPath), 'utf8');
let old;
try { old = execSync(`git show main:${oldPath.replace(/\\/g, '/')}`, { cwd: ROOT }).toString(); }
catch { console.error(`không đọc được main:${oldPath}`); process.exit(2); }

const OLD_FIELDS = { '成本': 'Chi phí', '说人话': 'Nói dễ hiểu', '收益': 'Lợi ích', '证据等级': 'Mức chứng cứ', '来源': 'Nguồn', '备注': 'Ghi chú' };
const count = (s, re) => (s.match(re) ?? []).length;
const links = s => s.split(/\r?\n/).filter(l => /^- (来源|备注|Nguồn|Ghi chú)[:：]/.test(l)).reduce((n, l) => n + count(l, /https?:\/\//g), 0);

let bad = 0;
const eq = (name, a, b) => { if (a !== b) { console.log(`LỆCH ${name}: gốc ${a} / VN ${b}`); bad++; } };
eq('số mục ###', count(old, /^### /gm), count(vn, /^### /gm));
for (const [o, v] of Object.entries(OLD_FIELDS))
  eq(`field ${v}`, count(old, new RegExp(`^- ${o}：`, 'gm')), count(vn, new RegExp(`^- ${v}:`, 'gm')));
eq('cost-tag', count(old, /<!--\s*成本标签/g), count(vn, /<!--\s*nhan-chi-phi/g));
eq('link trong Nguồn/Ghi chú', links(old), links(vn));

vn.split(/\r?\n/).forEach((l, i) => {
  if (/^- Nguồn:/.test(l)) return;
  const han = l.match(/[一-鿿]/g);
  if (han) { console.log(`CHỮ HÁN dòng ${i + 1}: ${l.slice(0, 80)}`); bad++; }
});
console.log(bad ? `${bad} điểm lệch/sót` : 'khớp bản gốc');
process.exit(bad ? 1 : 0);
```

- [ ] **Step 2: Chạy thử trên file TQ — phải báo lệch**

Run: `node tools/check-migration.mjs "book/18-养孩子划不划算.md" "book/18-养孩子划不划算.md"`
Expected: FAIL — `LỆCH field ...` (file cũ không có field VN). Exit 1.

- [ ] **Step 3: Commit**

```powershell
git add tools/check-migration.mjs
git commit -m "Thêm tools/check-migration.mjs kiểm chứng file đã chuyển sang tiếng Việt"
```

### Task 2: Port tools/check-refs.mjs sang tiếng Việt

**Files:**
- Modify: `tools/check-refs.mjs` (toàn bộ — comment, regex, tên output)

**Interfaces:**
- Produces: `node tools/check-refs.mjs [--check|--suspect]` sinh `docs/bang-doi-chieu-trich-dan.md`. Pattern trích dẫn VN: `phần X, mục Y` / `mục N` / `mục X đến Y` / `mục a, b và c` / `phần X`.

- [ ] **Step 1: Đổi bộ nhận dạng field và file**

```js
const FIELDS = /^- (Nói dễ hiểu|Lợi ích|Ghi chú|Chi phí):/;
const CROSS_FIELDS = /^- (Nói dễ hiểu|Lợi ích|Ghi chú|Chi phí|Nguồn):/;
```
`docs` filter đổi loại `bang-doi-chieu-trich-dan.md` thay `引用对照.md`. Quét `docs/*.md` giữ nguyên (bỏ qua `docs/ghi-chep-kiem-chung/` và `docs/superpowers/` — chỉ lấy file `.md` ngay dưới `docs/` như hiện tại, vì readdirSync không đệ quy đã đúng).

- [ ] **Step 2: Đổi ngữ pháp trích dẫn**

```js
// Danh sách số sau "mục": "3" | "3, 10" | "3, 10 và 11" | "11 đến 14"
const NUMS = '\\d+(?:\\s*(?:,|và|đến)\\s*\\d+)*';
// Khác phần:
new RegExp(`phần\\s*(\\d+)\\s*,\\s*mục\\s*(${NUMS})`, 'g')
// Cùng phần (chạy trên `stripped` đã loại đoạn "phần X, mục ..."):
new RegExp(`mục\\s*(${NUMS})`, 'g')
// Cả phần ("xem phần 9", "theo phần 8, 9"): /phần\s+([\d,\s]+)/
```
`nums()` mới: tách theo `,` hoặc `và`; khoảng `X đến Y` bung ra từng số với cờ range. Cụm `mục cuối/đầu` KHÔNG khớp vì NUMS đòi số.
Tương đương lệnh cấm chỉ đường tương đối (thay `上一条|下一条…`):
```js
/(mục\s+(?:ngay\s+)?(?:trên|dưới|trước|sau|kế|tiếp theo|cuối|đầu))/g
```
CITE-skip giữ ý tưởng cũ nhưng đổi marker VN: bỏ qua `mục N` đứng ngay sau `Điều\s*\d+\s*` cùng câu? — KHÔNG: đơn giản hơn, luật viết `Điều N` nên `mục N` gần như không va; chỉ giữ skip khi `mục` đi kèm `lục|tiêu|đích` ngay sau (không có số nên tự thoát). Bỏ regex CITE phức tạp của bản TQ, thay bằng skip khi trước `mục` là `phần\s*\d+\s*,\s*$` (đã xử lý nhờ stripped).

- [ ] **Step 3: Đổi logic anchor cho tiếng Việt**

Hai chữ Hán liên tiếp không còn là đơn vị — chuẩn hóa rồi so chuỗi con chung dài nhất (LCS) trên ký tự:

```js
const norm = s => s.toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')
  .replace(/\s+/g, ' ');
// longest(): LCS trên chuỗi đã norm, trả về độ dài ký tự.
// Ngưỡng: wide (ctx+after) ≥ 12 ký tự = thật; narrow+after ≥ 8 ký tự = thật;
// chỉ wide ≥ 8 = weak. token() giữ /[0-9A-Za-z]{2,}/ cho AED/BMI/12356.
```

- [ ] **Step 4: Đổi ranh giới ngữ cảnh và text output**

`ctxOf`/`narrowOf`/`afterOf`: dấu câu ASCII `[. ; ! ? : ,]` thay `。；！？：，`. Tên đơn vị: `mục ${cur}` / `Mở đầu phần` / `Phần đầu` (docs). Output `docs/bang-doi-chieu-trich-dan.md`, header `# Bảng đối chiếu trích dẫn`, cột `| Nơi trích | Cú pháp | Mục trỏ tới | Ngữ cảnh |`, toàn bộ message/console/comment → tiếng Việt.

- [ ] **Step 5: Chạy thử — kỳ vọng quét được pilot sau Task 7**

Run: `node tools/check-refs.mjs` — lúc này chưa có file VN nên sinh bảng 0 trích dẫn, không crash. `--check` exit 0 (không có trích nào). Commit.

### Task 3: Port tools/check-plain.mjs sang tiếng Việt

**Files:**
- Modify: `tools/check-plain.mjs`

- [ ] **Step 1: Đổi field và quy tắc**

```js
const MAX_WORDS = 60;                       // field kiểm tra: fields['Nói dễ hiểu']
const JARGON = [
  [/\b(HR|RR|OR|CI|RCT)\b/, 'viết tắt thống kê'],
  [/đoàn hệ|tổng quan|tổng hợp|ngẫu nhiên|nhóm đối chứng|giả dược|mù đôi|cỡ mẫu|meta[- ]?analysis/i, 'thiết kế nghiên cứu'],
  [/\d[\d.,]*\s*(ca|người tham gia|bệnh viện|nghiên cứu|quốc gia)/, 'cỡ mẫu'],
  [/nhóm đó|hai nhóm|mỗi nhóm/, 'nhóm'],
];
const VAGUE = ['đầu kia', 'phía kia', 'đầu ra', 'nói chung là'];   // khởi đầu nhỏ, bổ sung khi thấy lỗi lặp
```
Độ dài đếm từ: `s.trim().split(/\s+/).length > MAX_WORDS`.

- [ ] **Step 2: Đổi numbers() cho kiểu số Việt** (quan trọng — phẩy là thập phân)

```js
function numbers(s) {
  // 1.130.040 → 1130040 (chấm ngăn nghìn) rồi 86,5 → 86.5 (phẩy thập phân)
  const t = s.replace(/(\d)\.(\d{3})/g, '$1$2').replace(/(\d),(\d)/g, '$1.$2');
  return [...t.matchAll(/(\d*\.?\d+)\s*(tỷ|triệu|tr|nghìn|k)?/gi)]
    .map(m => Number(m[1]) * ({ 'tỷ': 1e9, 'triệu': 1e6, 'tr': 1e6, 'nghìn': 1e3, 'k': 1e3 }[(m[2] || '').toLowerCase()] || 1));
}
```
`derived()` giữ nguyên. Message/count/comment → tiếng Việt.

- [ ] **Step 3: Chạy** — `node tools/check-plain.mjs` exit 0 (chưa có file VN). Commit.

### Task 4: Port index.html

**Files:**
- Modify: `index.html` (parse + toàn bộ UI text)

- [ ] **Step 1: Meta/head** — `<title>` → `Cẩm nang sống đáng giá · Dùng ít tiền, thời gian và sức lực nhất đổi lấy tuổi thọ, tiền và tự do`; `description`, `og:*`, `twitter:*`, JSON-LD (`name`/`description`, `numberOfPages` giữ key) → tiếng Việt; domain `eternity4719.github.io`/`github.com/eternity4719` → `chuanman2707` ở mọi nơi trong file.

- [ ] **Step 2: Parse entry** (~dòng 547–567):
```js
// tag: /^<!--\s*nhan-chi-phi:\s*(.*?)\s*-->/
// field: /^- (Chi phí|Nói dễ hiểu|Lợi ích|Mức chứng cứ|Nguồn|Ghi chú):(.*)$/
// e.human lấy từ 'Nói dễ hiểu'; grade từ 'Mức chứng cứ';
// marker TQ: e.tq = /^- Ghi chú:\s*Chỉ tham khảo TQ[:：]/.test(line)
```
`COST_W` → `{ money:{'0':0,'it':1,'nhieu':2}, time:{'it':0,'vua':1,'nhieu':2}, will:{'khong':0,'chut':1,'nhieu':2} }`; `e.ratio` → `e.level === 'lon' ? (e.cs === 0 ? 'Cực cao' : e.cs <= 2 ? 'Cao' : 'Trung bình') : (e.level === 'vua' && e.cs === 0 ? 'Cao' : 'Trung bình')`. Badge map `{'Cực cao':'3','Cao':'2','Trung bình':'1'}`; badge mới `TQ` khi `e.tq`.

- [ ] **Step 3: XREF_RE clickable refs** (~dòng 743):
```js
const NUMS = '\\d+(?:\\s*(?:,|và|đến)\\s*\\d+)*';
const XREF_RE = new RegExp(
  `phần\\s*(\\d+)\\s*,\\s*mục\\s*(${NUMS})` +   // phần 7, mục 3
  `|mục\\s*(${NUMS})` +                        // mục 3 (cùng phần)
  `|phần\\s*([\\d,\\s]+)` , 'g');              // phần 9 (cả phần) — đặt cuối
```
Text hiển thị `Phần ${e.sec}, mục ${e.n}` (thay `第 X 节第 Y 条` ~dòng 792). `Điều N` không khớp — đúng mong muốn.

- [ ] **Step 4: UI text** — dịch toàn bộ chữ hiển thị: nhóm chip (章节→Phần, 性价比→Hiệu quả chi phí, 口径→Quy mô, 证据→Chứng cứ, 花钱→Tiền, 时间→Thời gian, 毅力→Ý chí), nhãn giá trị chip hiển thị VN (mapping từ giá trị tag ASCII → nhãn có dấu: `0→Không tốn`, `it→Ít`, `nhieu→Nhiều`, `vua→Vừa`, `khong→Không cần`, `chut→Một chút`; quy-mo `tu-vong→Tỷ lệ tử vong`, `tien→Tiền`, `thoi-gian→Thời gian`, `tu-do→Tự do`), ô search placeholder, noscript, progress/error message (~1456), chú thích footer (~477), text `N 个文件`→`N file`, doc-links (~466–467) trỏ docs tên mới + URL repo mới. Gỡ 2 khối quảng cáo (~453 banner mcyyy-side, ~490 wechat-reward) và mọi đoạn JS/CSS chỉ phục vụ chúng.

- [ ] **Step 5: Kiểm** — sau khi có file VN (Task 7): mở bằng server tĩnh `npx serve .` hoặc `python -m http.server`, xác nhận card render, filter chạy, ref click được. Commit riêng.

### Task 5: Port tools/sync-stats.mjs

**Files:**
- Modify: `tools/sync-stats.mjs`; `tools/og.html` (text VN)

- [ ] **Step 1: Pattern đếm** — grade `^- Mức chứng cứ:([ABC])`; tranh cãi `^- Ghi chú:Tranh cãi`; todo `/Cần xác minh|TODO/`; links `^- (Nguồn|Ghi chú):`; tag `/<!--\s*nhan-chi-phi:\s*tien=(\S+)\s+thoi-gian=(\S+)\s+y-chi=(\S+)\s+loi-ich=(\S+)\s+quy-mo=/`; thêm `tqCount` đếm `^- Ghi chú:Chỉ tham khảo TQ`. `W` = `{ money:{'0':0,'it':1,'nhieu':2}, time:{'it':0,'vua':1,'nhieu':2}, will:{'khong':0,'chut':1,'nhieu':2} }`; `ratioOf` theo `lon/vua` → `'Cực cao'/'Cao'/'Trung bình'`.

- [ ] **Step 2: Guard lines** — `COST_W_LINE`/`RATIO_LINE` đổi thành đúng chuỗi mới trong index.html (sao chép nguyên dòng từ Task 4 step 2); giữ cơ chế throw nếu không khớp.

- [ ] **Step 3: EDITS cho chuỗi VN** — canonical phrasing (README Task 42 và og.html phải dùng đúng các câu này):
  - README dòng đếm: `(\d+) mục lời khuyên` → `${entries} mục lời khuyên`
  - badge entry (URL-encoded, không dấu): `%E2%80%A6` — định dạng badge `muc-N%20muc`; viết regex theo nhãn thực tế đặt trong README VN; **ghi trong EDITS comment chỗ nào cần khớp**
  - đoạn phân hạng: `Trong (\d+) mục: A [\d,]+ · B [\d,]+ · C [\d,]+` (khớp format README VN chọn ở Task 42 — Task 42 phải viết đúng mẫu `Trong N mục: A x · B y · C z, có d mục đánh dấu tranh cãi, e chỗ cần xác minh`)
  - index.html: các chuỗi mô tả chứa số (meta description `(\d+) mục`, `N file`, `numberOfPages`), header count
  - og.html: `<b>641</b> mục lời khuyên`, `A <b>425</b>`, `<b>1443</b>` link nguồn
  - Nguyên tắc giữ: mỗi số chỉ viết một nơi; EDITS có regex cho mọi chỗ.

- [ ] **Step 4: og.html** — dịch text: tagline `Dùng ít tiền, thời gian và sức lực nhất, đổi lấy tuổi thọ, tiền và tự do`; hàng chip `Sống lâu khỏe · Cấp cứu · Tiết kiệm · Ranh giới pháp luật · Phòng thất nghiệp · Yêu & hôn nhân · Ra nước ngoài · Kỹ năng`; `<b>N</b> mục lời khuyên` / `Chứng cứ A <b>N</b> mục` / `<b>N</b> link nguồn sơ cấp` / `Lọc theo hiệu quả chi phí`. Comment đầu file (lệnh chụp) → VN. Chưa chụp og.png ở task này — Task 48 làm.

- [ ] **Step 5: Chạy** `node tools/sync-stats.mjs --check` — kỳ vọng FAIL/đỏ vì README chưa viết lại (đúng, ghi nhận); `--no-screenshot` chạy không crash. Commit.

### Task 6: Port tools/lib + epub + offline + pdf

**Files:**
- Modify: `tools/lib/book.mjs`, `tools/epub/build.mjs`, `tools/offline/build.mjs`, `tools/pdf/build.mjs`, `tools/pdf/template.typ`

- [ ] **Step 1: lib/book.mjs** — `TITLE = 'Cẩm nang sống đáng giá'`; `REPO = 'https://github.com/chuanman2707/HowToLiveBetter'`; `SITE = 'https://chuanman2707.github.io/HowToLiveBetter/'`; `stripBackLink` → `/^\[← Mục lục\]\([^)]*\)\s*\n/`; `readBook()` key heading — **pin đúng chuỗi** (Task 42 README phải dùng y hệt):
```js
between('# Cẩm nang sống đáng giá', '[![')
between('## Cuốn sách này trả lời những câu hỏi nào', '## Mục lục')
between('## Mục lục', '## Nội dung')
```
`buildStamp()` giữ (đổi `timeZone` sang `Asia/Ho_Chi_Minh`, comment sửa lại). Comment → VN.

- [ ] **Step 2: epub/build.mjs** — `contentsMd.replace(/^## Mục lục/, '# Giới thiệu các phần')`; page title `前言`→`Lời nói đầu`, `各节简介`→`Giới thiệu các phần`, `版本说明`→`Thông tin phiên bản`; `aboutMd()` viết lại VN (múi giờ `giờ Việt Nam`, bản quyền CC BY 4.0 ghi tên sách `Cẩm nang sống đáng giá`); comment → VN; giữ uuid, giữ tên output `HowToLiveBetter.epub`.

- [ ] **Step 3: offline/build.mjs** — gỡ block embed `ads/mcyyy-side.webp`+`ads/wechat-reward.png` (~dòng 51); needle tìm trong index.html phải khớp bản VN (chạy thử sẽ thấy); chuỗi UI/comment → VN.

- [ ] **Step 4: pdf** — `template.typ`: đổi font sang font có đủ dấu VN (`Noto Serif`/`Noto Sans` — bỏ CJK nếu không cần), metadata title VN; `build.mjs` chuỗi/comment → VN.

- [ ] **Step 5: Kiểm** — `node tools/epub/build.mjs dist/test.epub` chạy được (README chưa VN thì readBook fail — chấp nhận, đánh dấu verify lại ở Task 51; nếu muốn test sớm, tạm checkout README từ nhánh sau Task 42). Commit.

### Task 7: Pilot — dịch phần 18, người dùng duyệt giọng

**Files:**
- `book/18-养孩子划不划算.md` → `book/18-nuoi-con-co-dang-khong.md`

- [ ] **Step 1:** `git mv "book/18-养孩子划不划算.md" book/18-nuoi-con-co-dang-khong.md`
- [ ] **Step 2:** Dịch theo **Quy trình A** (mục dưới Pha 2). Phần này gắn chế độ TQ (trợ cấp sinh con, phí học) — đánh dấu `Chỉ tham khảo TQ:` đúng quy tắc; intro thêm câu báo nội dung chế độ theo TQ nếu phần lớn mục gắn TQ.
- [ ] **Step 3:** `node tools/check-migration.mjs book/18-nuoi-con-co-dang-khong.md "book/18-养孩子划不划算.md"` → `khớp bản gốc`.
- [ ] **Step 4:** `node tools/check-refs.mjs` + `node tools/check-plain.mjs` — không crash; warning về anchor/mục chưa dịch là bình thường (giữa chừng).
- [ ] **Step 5:** Commit `Dịch phần 18 sang tiếng Việt (pilot)`. **DỪNG — hỏi người dùng review bản mẫu, chỉnh giọng/thuật ngữ nếu cần rồi mới qua Pha 2.**

---

## Quy trình A — dịch một file `book/` (dùng cho mọi task Pha 2)

1. `git mv "<file-gốc>" "<file-mới>"` (slug theo spec 3.4).
2. Dịch toàn bộ, giữ nguyên cấu trúc: dòng đầu `[← Mục lục](../README.md)`; `# N. <tên phần VN>`; đoạn mở đầu; từng `### M. <tiêu đề>`; tag `nhan-chi-phi`; bảy field theo Global Constraints.
3. Trong thân mục: tên luật TQ dịch sang VN kèm `(TQ)` lần đầu trong mục nếu cần rõ nguồn gốc; điều luật viết `Điều N`; hotline giữ số gốc; trích chéo đổi `第 X 节第 Y 条`→`phần X, mục Y`, `本节第 N 条`/`第 N 条`→`mục N`, khoảng→`mục X đến Y`; giữ anchor: từ khóa trong ngoặc/ngữ cảnh phải trùng ít nhất một cụm với **tiêu đề VN** của mục đích (nếu chưa biết tiêu đề VN vì phần kia chưa dịch, cứ dịch sát nghĩa — Task 50 sẽ bắt sót).
4. Đánh dấu `Chỉ tham khảo TQ:` cho mục gắn luật/chế độ/hotline/cơ quan/thống kê/dịch vụ chỉ-TQ; phần gần như toàn TQ thêm câu nói rõ ở đoạn mở đầu.
5. Chạy `node tools/check-migration.mjs <file-mới> "<file-gốc>"` → phải `khớp bản gốc`.
6. Commit: `git add book/` + `git commit -m "Dịch phần NN sang tiếng Việt"`.

## Pha 2 — 33 file book còn lại (mỗi file = 1 task = 1 commit)

Thứ tự theo số. Ghi chú riêng từng task ở cột "chú ý". Mỗi task: Step 1–6 của Quy trình A.

### Task 8: `book/01-不要早死.md` → `book/01-dung-chet-som.md`
Chú ý: phần lớn khoa học phổ quát; mục hotline/cứu trợ TQ thì đánh dấu. Checklist: bước 1–6 Quy trình A.

### Task 9: `book/02-不要慢慢死.md` → `book/02-dung-chet-tu-tu.md`
Chú ý: thuốc lá/rượu — tên thuốc/dịch vụ chỉ-TQ đánh dấu. Bước 1–6.

### Task 10: `book/03-不要浪费精力.md` → `book/03-dung-lang-phi-suc-luc.md`
Bước 1–6.

### Task 11: `book/04-不要浪费时间.md` → `book/04-dung-lang-phi-thoi-gian.md`
Bước 1–6.

### Task 12: `book/05-不要浪费钱.md` → `book/05-dung-lang-phi-tien.md`
Chú ý: nhiều số tiền — đổi `1,130,040 元` → `1.130.040 nhân dân tệ`; kênh đầu tư/lừa đảo gắn TQ đánh dấu. Bước 1–6.

### Task 13: `book/06-反面清单.md` → `book/06-danh-sach-nen-tranh.md`
Bước 1–6.

### Task 14: `book/07-没钱的时候怎么活.md` → `book/07-song-khi-khong-co-tien.md`
Chú ý: **gần như toàn phần gắn chế độ TQ** — intro phần thêm một câu nói rõ các chế độ này là của Trung Quốc, chỉ để tham khảo; từng mục vẫn đánh dấu riêng. Bước 1–6.

### Task 15: `book/08-别把自己搭进去.md` → `book/08-dung-tu-chuoc-hoa-vao-than.md`
Chú ý: pháp luật TQ dày đặc — đánh dấu rộng; tên luật dịch + `(TQ)`; `第 N 条` trong luật → `Điều N`. Bước 1–6.

### Task 16: `book/09-普通人容易踩的法律红线.md` → `book/09-lan-san-do-phap-luat-de-vi-pham.md`
Bước 1–6 (pháp luật TQ — đánh dấu).

### Task 17: `book/10-恋爱和结婚划不划算.md` → `book/10-yeu-va-cuoi-co-dang-khong.md`
Bước 1–6 (mục luật hôn nhân/tài sản TQ đánh dấu).

### Task 18: `book/11-程序员和技术人容易踩的红线.md` → `book/11-lan-san-do-cua-dan-ky-thuat.md`
Bước 1–6.

### Task 19: `book/12-创业与做生意.md` → `book/12-khoi-nghiep-va-lam-an.md`
Bước 1–6.

### Task 20: `book/13-紧急情况.md` → `book/13-tinh-huong-khan-cap.md`
Chú ý: số hotline 110/120/119 giữ nguyên + marker TQ cho mục dựa vào hệ thống cứu trợ TQ; kỹ thuật sơ cấp cứu (CPR, xương gãy) là phổ quát không đánh dấu. Bước 1–6.

### Task 21: `book/14-账号与信息安全.md` → `book/14-tai-khoan-va-an-toan-thong-tin.md`
Bước 1–6 (app/dịch vụ TQ như WeChat/Alipay giữ tên + marker khi hành động chỉ áp dụng ở TQ).

### Task 22: `book/15-租房与买房.md` → `book/15-thue-va-mua-nha.md`
Bước 1–6 (宅基地/quyền đất TQ đánh dấu).

### Task 23: `book/16-得了慢性病之后怎么活.md` → `book/16-song-sau-khi-mac-benh-man-tinh.md`
Bước 1–6 (khoa học phổ quát; mục bảo hiểm y tế TQ đánh dấu).

### Task 24: `book/17-家里有老人.md` → `book/17-nha-co-nguoi-gia.md`
Bước 1–6 (giám hộ/di chúc theo luật TQ đánh dấu).

### Task 25: `book/19-在职离职和工伤.md` → `book/19-di-lam-nghi-viec-va-tai-nan-lao-dong.md`
Chú ý: toàn phần luật lao động TQ — intro báo rõ như Task 14. Bước 1–6.

### Task 26: `book/20-刚出生的孩子怎么带.md` → `book/20-cham-tre-so-sinh.md`
Bước 1–6.

### Task 27: `book/21-出国旅行与境外安全.md` → `book/21-du-lich-va-an-toan-nuoc-ngoai.md`
Bước 1–6 (lãnh sự/visa góc nhìn TQ đánh dấu).

### Task 28: `book/22-怎么放松.md` → `book/22-thu-gian-the-nao.md`
Bước 1–6.

### Task 29: `book/23-学什么技能划算.md` → `book/23-hoc-ky-nang-gi-dang.md`
Bước 1–6 (bảng lương/nghề của TQ đánh dấu).

### Task 30: `book/24-看病.md` → `book/24-di-kham-benh.md`
Bước 1–6 (y tế TQ: bảo hiểm, bệnh viện công đánh dấu).

### Task 31: `book/25-人走了以后要办什么.md` → `book/25-viec-phai-lam-khi-nguoi-than-qua-doi.md`
Bước 1–6.

### Task 32: `book/26-做一个网站或平台.md` → `book/26-lam-mot-website-hoac-nen-tang.md`
Bước 1–6 (ICP/giấy phép TQ đánh dấu).

### Task 33: `book/27-怀孕和生产.md` → `book/27-mang-thai-va-sinh-con.md`
Bước 1–6.

### Task 34: `book/28-别为了外形把身体搞坏.md` → `book/28-dung-vi-ngoai-hinh-pha-hong-suc-khoe.md`
Bước 1–6.

### Task 35: `book/29-遭遇重大打击之后.md` → `book/29-sau-khi-gap-cu-soc-lon.md`
Bước 1–6.

### Task 36: `book/30-上学以后的孩子.md` → `book/30-con-cai-tuoi-di-hoc.md`
Bước 1–6 (hệ giáo dục TQ đánh dấu).

### Task 37: `book/31-十八岁之后有哪几条路.md` → `book/31-nhung-con-duong-sau-tuoi-muoi-tam.md`
Bước 1–6 (đường lối học vấn/quân ngũ TQ đánh dấu).

### Task 38: `book/32-出国留学.md` → `book/32-du-hoc-nuoc-ngoai.md`
Bước 1–6.

### Task 39: `book/33-残疾之后怎么活.md` → `book/33-song-sau-khi-khuyet-tat.md`
Bước 1–6 (trợ cấp khuyết tật TQ đánh dấu).

### Task 40: `book/34-家里的常备药别吃出事.md` → `book/34-thuoc-san-trong-nha-dung-de-uong-thanh-hoa.md`
Bước 1–6.

---

## Pha 3 — vỏ ngoài

### Task 41: Dịch 5 bài docs dài + đổi tên

**Files:** `docs/` — `做平台要办哪些证.md`→`lam-nen-tang-can-nhung-giay-phep-gi.md`; `家庭应急装备清单.md`→`danh-muc-do-dung-khan-cap-gia-dinh.md`; `生物钟和夜班.md`→`nhip-dong-ho-sinh-hoc-va-ca-dem.md`; `结婚划不划算.md`→`cuoi-co-dang-khong.md`; `遇到陌生人出事该不该停.md`→`gap-nguoi-la-bi-nan-co-nen-dung-lai.md`

- [ ] **Step 1–5:** mỗi file một step — `git mv`, dịch toàn văn (trích chéo trong docs PHẢI viết đủ `phần X, mục Y` vì docs không có "cùng phần"; dòng `Nguồn:`/bảng nguồn giữ nguyên văn), check Han whitelist, commit riêng `Dịch docs/<tên> sang tiếng Việt`.
- [ ] **Step 6:** `node tools/check-refs.mjs` — bảng đối chiếu sinh ra có section docs tên mới.

### Task 42: Viết lại README.md

- [ ] **Step 1:** Dịch toàn bộ với **heading pin cứng** (lib/book.mjs khớp): `# Cẩm nang sống đáng giá`, `## Cuốn sách này trả lời những câu hỏi nào`, `## Cách đọc`, `## Tự chạy một bản`, `## Bốn loại tài nguyên`, `## Phân hạng chứng cứ`, `## Các mức hiệu quả chi phí`, `## Đọc hiểu con số (bảng thuật ngữ)`, `## Mục lục`, `## Nội dung`, `## Giấy phép`, `## Lịch sử Star`.
- [ ] **Step 2:** Câu chứa số liệu dùng đúng mẫu EDITS ở Task 5 (`N mục lời khuyên`, `Trong N mục: A x · B y · C z, có d mục đánh dấu tranh cãi, e chỗ cần xác minh`); badge shields nhãn VN không dấu URL-encoded.
- [ ] **Step 3:** Mục lục = bảng link `](book/NN-slug.md)` đủ 34 file + docs 5 file tên mới (index.html fetch qua đây — bắt buộc đúng); gỡ bảng `其他语言`, mục `赞赏` (QR upstream), `广告位`, ảnh mcyyy/wechat; domain link → `chuanman2707`.
- [ ] **Step 4:** Commit `Viết lại README tiếng Việt`.

### Task 43: Viết lại CLAUDE.md tiếng Việt

Giữ nguyên tinh thần 10 mục của bản gốc, dịch và đổi chi tiết kỹ thuật:
- [ ] **Step 1:** Các mục gốc → VN: định vị dự án; 4 tầng người hưởng lợi; quy tắc "viết cả chi phí quá trình khi dẫn luật"; phân hạng chứng cứ A/B/C; quy tắc trích nguồn (chỉ nguồn sơ cấp — bản VN bổ sung cho phép nguồn TQ vì nội dung là chuyển thể, giữ nguyên văn trong `Nguồn:`); format mục với field VN + tag `nhan-chi-phi`; chuẩn câu đơn giản (đổi ngưỡng: một câu ~30 từ, tối đa 50; `Nói dễ hiểu` 2–4 câu ≤60 từ); chống văn AI (giữ các nguyên tắc, đổi ví dụ sang lỗi hay gặp khi dịch: câu dài ngập ngừng, thuật ngữ để nguyên Hán, "đầu kia"-style mơ hồ); quy tắc `Tranh cãi` đầu Ghi chú; nghi thức sync-stats/check-refs/soi diff bảng đối chiếu; ngưỡng lợi ích theo `quy-mo`; quy tắc marker `Chỉ tham khảo TQ:` (quy tắc mới của bản VN — ghi thành mục riêng); mục lục repo + số liệu do sync-stats quản.
- [ ] **Step 2:** Lịch sử sự cố (issue #42, drift trích dẫn 2026-09-19…) — kể lại ngắn bằng tiếng Việt, giữ ngày và bài học.
- [ ] **Step 3:** Commit `Viết lại CLAUDE.md tiếng Việt`.

### Task 44: AGENTS.md + skills + .github

- [ ] **Step 1:** `AGENTS.md` — dịch, trỏ CLAUDE.md và `skills/life-decision-guide/`.
- [ ] **Step 2:** `skills/life-decision-guide/SKILL.md` + `README.md` + `.claude/skills/life-decision-guide/SKILL.md` — dịch; đổi trích `phần X, mục Y`; trigger tiếng Việt (`có nên`, `đáng không`, `chọn thế nào`, `có phạm luật không`, `được nhận tiền gì`, `hiệu quả chi phí`); URL raw GitHub → `chuanman2707`.
- [ ] **Step 3:** `.github/workflows/book.yml` — name `Sách điện tử`; job name `Kiểm tra trích dẫn chéo` / `Kiểm tra "Nói dễ hiểu"` / `Kiểm tra số liệu`; comment → VN; bỏ `ads/**` khỏi paths; bước font đổi `fonts-noto-cjk` → `fonts-noto` + cập nhật dòng kiểm `typst fonts | grep`; release title `Sách điện tử (EPUB / PDF / HTML offline, tự cập nhật)`, notes VN, múi giờ `'+7 hours'` (giờ VN).
- [ ] **Step 4:** `.github/ISSUE_TEMPLATE/` — `1-纠错.yml`→`1-sua-loi.yml`, `2-新内容.yml`→`2-noi-dung-moi.yml` (git mv + dịch nhãn/mô tả); `config.yml` dịch + URL → chuanman2707; xóa `FUNDING.yml`.
- [ ] **Step 5:** `sitemap.xml` — domain → `chuanman2707.github.io`, lastmod hôm nay.
- [ ] **Step 6:** Commit `Dịch AGENTS/skill/CI template sang tiếng Việt`.

### Task 45: Xóa phần upstream

- [ ] **Step 1:** `git rm -r docs/核实记录 ads` ; `git rm tools/ad-mcyyy.html tools/ad-mcyyy-side.html tools/ad-mcyyy-bg.webp .github/FUNDING.yml`.
- [ ] **Step 2:** Tạo `docs/ghi-chep-kiem-chung/README.md`: một đoạn giải thích đây là nhật ký kiểm chứng nguồn của bản tiếng Việt (thay `核实记录` của bản gốc), quy ước đặt tên file theo phần/chủ đề.
- [ ] **Step 3:** Commit `Xóa quảng cáo/FUNDING của upstream và nhật ký kiểm chứng tiếng Trung`.

---

## Pha 4 — dọn sót + bàn giao

### Task 46: (gộp vào Task 48 nếu og.html xong ở Task 5) — kiểm tra lại og.html

- [ ] `node tools/sync-stats.mjs` full: ghi số liệu vào README/index/og.html, sinh `docs/bang-doi-chieu-trich-dan.md`, chụp `og.png` (Chrome; không thấy Chrome thì `set CHROME=<đường dẫn>`).
- [ ] Verify: `git diff README.md` chỉ đổi số; `ls -la og.png` mới; `node tools/sync-stats.mjs --check` exit 0.

### Task 47: Quét sót chữ Hán

- [ ] `git grep -n -P "[\x{4e00}-\x{9fff}]"` — từng hit phải là: dòng `^- Nguồn:` trong `book/`/`docs/*.md`, hoặc `LICENSE`, hoặc file spec/plan này. Còn lại → dịch/xóa. Đếm 0 hit ngoài whitelist.

### Task 48–50 (gộp thực tế, tách checklist):

- [ ] **Task 48:** `node tools/check-refs.mjs --check` — fix hết `suspects`/`weak` bằng cách thêm anchor `(từ khóa tiêu đề)` vào chỗ trích; `node tools/check-plain.mjs` — fix `Nói dễ hiểu` quá dài/jargon; commit.
- [ ] **Task 49:** smoke test index.html bằng server tĩnh — fetch đủ 34 file, card/badge/filter/ref chạy, badge TQ hiện.
- [ ] **Task 50:** `cd tools/epub && npm ci && node build.mjs` → EPUB sinh ra; `node tools/offline/build.mjs` → HTML offline; PDF nếu typst có sẵn, không thì để CI.
- [ ] **Task 51:** Rà cuối: `git status` sạch, `git log` đủ commit từng phần; tổng kết giao người dùng merge/push (KHÔNG tự push).

---

## Self-review đã làm

- Spec coverage: quy ước ngôn ngữ (spec §3) → Tasks 2–7 + Quy trình A; đổi tên file (§3.4–3.5) → Tasks 7–41; hạ tầng (§4) → Tasks 2–6, 44–45; xóa (§5/§2) → Task 45; kiểm chứng (§7) → Tasks 46–51; rủi ro font → Task 44/50; `Nguồn:` verbatim → Quy trình A bước 2 + Task 47.
- Placeholder: không TBD. Hai điểm "khớp mẫu README↔EDITS" được pin bằng chuỗi canonical ở Task 5 Step 3 + Task 42 Step 2.
- Type/consistency: `nhan-chi-phi`, `Chỉ tham khảo TQ`, `phần X, mục Y`, `Mức chứng cứ`… dùng một bộ tên xuyên suốt spec/plan/tool.
