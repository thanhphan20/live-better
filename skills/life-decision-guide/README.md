# Skill quyết định đời sống (life-decision-guide)

Cho trợ lý AI theo 《Cẩm nang sống đáng giá》 trả lời câu hỏi cụ thể: có nên làm không, đáng không, chọn thế nào, xảy chuyện trước làm gì, được nhận khoản tiền nào, làm vậy có phạm luật không.

Việc nó làm chỉ một: **trước đem mục liên quan từ chính văn tra ra, rồi theo cách tính sổ của sách sắp xếp trả lời**, mỗi mục ghi rõ trích từ phần mấy mục mấy. Tra không ra thì nói tra không ra, không theo trí nhớ biên số.

Quy tắc toàn ở [SKILL.md](SKILL.md), hai công cụ dùng chung một file, không duy trì hai phần.

## Cài vào Claude Code

Mở Claude Code trong kho này, không cần cài — `.claude/skills/life-decision-guide/` đã trỏ tới phần quy tắc này.

Muốn dùng ở thư mục nào cũng được, chép vào thư mục skill cá nhân:

```bash
mkdir -p ~/.claude/skills/life-decision-guide && curl -fsSL -o ~/.claude/skills/life-decision-guide/SKILL.md "https://raw.githubusercontent.com/chuanman2707/HowToLiveBetter/ban-tieng-viet/skills/life-decision-guide/SKILL.md"
```

Sau đó trực tiếp hỏi "mỗi ngày đi làm hai tiếng đáng không" "bạn bắt tôi thay y bảo lãnh, ký không" sẽ kích hoạt; cũng có thể nói rõ "dùng life-decision-guide trả lời".

## Cài vào Codex

Mở Codex trong kho này, không cần cài — `AGENTS.md` thư mục gốc đã chỉ nó ra.

Muốn dùng ở thư mục nào cũng được, chép vào thư mục skill cá nhân của Codex `~/.agents/skills`:

```bash
mkdir -p ~/.agents/skills/life-decision-guide && curl -fsSL -o ~/.agents/skills/life-decision-guide/SKILL.md "https://raw.githubusercontent.com/chuanman2707/HowToLiveBetter/ban-tieng-viet/skills/life-decision-guide/SKILL.md"
```

Sau đó trực tiếp hỏi câu hỏi sẽ theo mô tả tự kích hoạt, cũng có thể gõ `$life-decision-guide` gọi rõ ràng. Chú ý là `$` không phải `/`, Codex bản mới gõ `/life-decision-guide` sẽ báo `Unrecognized command`. Không thấy thì khởi động lại Codex một lần.

Codex bản cũ chưa có skill, chỉ dùng được prompt tùy định: đem file để vào `~/.codex/prompts/life-decision-guide.md`, rồi dùng `/life-decision-guide` gọi. Codex đã tuyên bỏ bỏ cách viết này ([openai/codex#10848](https://github.com/openai/codex/issues/10848)), bản mới dùng cách cài skill ở trên.

## Chính văn lấy từ đâu

Bản địa có kho này thì đọc `book/` bản địa; không có thì lấy tạm (nội dung tiếng Việt ở nhánh `ban-tieng-viet`):

```bash
git clone --depth 1 -b ban-tieng-viet https://github.com/chuanman2707/HowToLiveBetter.git "${TMPDIR:-/tmp}/hltb"
```

Cả cuốn khoảng 1.3 MB, clone nông một lần vài giây. Lấy không được mạng thì nói thật lấy không được, không thay thế chính văn.

## Cần biết khi sửa

Trong SKILL.md không giữ danh sách và giá trị nào sẽ theo chính văn trôi: danh sách phần đi đọc bảng "Cuốn sách này trả lời những câu hỏi nào" của README, thuật toán mức hiệu quả chi phí đi đọc hai dòng `COST_W` và `e.ratio` trong `index.html`. Nên thêm bớt phần, đổi quy tắc bậc đều không cần động thư mục này.