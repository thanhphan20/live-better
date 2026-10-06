# Spec: Chuyển toàn bộ repo 《高性价比人生指南》 sang tiếng Việt

Ngày: 2026-09-30 · Nhánh làm việc: `ban-tieng-viet`

## 1. Mục đích

Chuyển thể toàn bộ repo thành một cuốn sách tiếng Việt, thay thế sạch mọi
ngôn ngữ khác (trừ ngoại lệ ghi ở mục 6). Độc giả mục tiêu: **người sống ở
Việt Nam**. Đây là bản dịch trung thực 1-1 của bản gốc, không phải bản viết
lại theo luật Việt Nam.

## 2. Quyết định phạm vi (đã chốt với người dùng)

- **Mục gắn luật/chế độ Trung Quốc:** dịch nguyên văn, đánh dấu
  `Chỉ tham khảo TQ:` ở đầu Ghi chú. Không viết lại theo luật VN.
- **Mục mới đặc thù VN:** không thêm. Cấu trúc giữ 1-1 với bản gốc.
- **docs/核实记录 (~95 file):** xóa toàn bộ. Nhật ký kiểm chứng mới của bản
  VN ghi vào `docs/ghi-chep-kiem-chung/` (tạo mới, rỗng ban đầu).
- **Bản gốc tiếng Trung:** xóa sạch khi xong. Repo cuối cùng = bản VN.
- **Tên sách:** 《Cẩm nang sống đáng giá》.
- **ads/ + FUNDING.yml:** xóa hẳn (quảng cáo và mã quyên góp của tác giả
  upstream, không phải của chủ repo).
- **Dòng Nguồn:** giữ nguyên văn tên tài liệu tiếng Trung + link — đây là
  bằng chứng xuất xứ để đối chiếu (tương đương nguyên tắc「来源栏除外」).

## 3. Quy ước ngôn ngữ

### 3.1 Ánh xạ field trong mục

Format mục giữ nguyên, chỉ đổi nhãn và dùng dấu `:` ASCII thay `：`:

| Tiếng Trung | Tiếng Việt |
| --- | --- |
| `### N. <tiêu đề>` | giữ nguyên format |
| `成本：` | `Chi phí:` |
| `说人话：` | `Nói dễ hiểu:` |
| `收益：` | `Lợi ích:` |
| `证据等级：` | `Mức chứng cứ:` (giá trị A / B / C giữ nguyên) |
| `来源：` | `Nguồn:` |
| `备注：` | `Ghi chú:` |
| `争议` (tiền tố ghi chú) | `Tranh cãi` |
| `待核实` | `Cần xác minh` (tool đếm cả `TODO`) |
| `第 X 节第 Y 条` (trích chéo) | `phần X, mục Y` |
| `第 N 条` (trích cùng phần) | `mục N` |
| `第 X 到 Y 条` (khoảng) | `mục X đến Y` |
| `极高 / 高 / 一般` (性价比) | `Cực cao / Cao / Trung bình` |
| 节 / 条 | phần / mục |

**Không dùng chữ `điều` cho mục** — va chạm với trích dẫn điều luật
(《Điều 30》…) vốn xuất hiện dày trong dòng Nguồn.

Nháy kép trong bản dịch dùng `"..."` ASCII (regex/grep đơn giản, tránh rối
font). Link quay về mục lục đầu mỗi file: `[← Mục lục](../README.md)`.

### 3.2 Cost-tag comment

```
<!-- 成本标签: 钱=0 时间=少 毅力=否 收益=大 口径=金钱 -->
→
<!-- nhan-chi-phi: tien=0|it|nhieu thoi-gian=it|vua|nhieu y-chi=khong|chut|nhieu loi-ich=lon|vua|nho quy-mo=tu-vong|tien|thoi-gian|tu-do -->
```

Tag dùng ASCII không dấu. Ánh xạ giá trị:

- `钱=0|少|多` → `tien=0|it|nhieu`
- `时间=少|中|多` → `thoi-gian=it|vua|nhieu`
- `毅力=否|些|是` → `y-chi=khong|chut|nhieu`
- `收益=大|中|小` → `loi-ich=lon|vua|nho`
- `口径=死亡率|金钱|时间|自由` → `quy-mo=tu-vong|tien|thoi-gian|tu-do`

### 3.3 Marker mục chỉ tham khảo TQ

- Mục gắn luật/chế độ/hotline/cơ quan/thống kê/dịch vụ chỉ có ở Trung Quốc:
  `- Ghi chú: Chỉ tham khảo TQ: <nội dung ghi chú gốc đã dịch>`.
- Mục khoa học phổ quát không đánh dấu, kể cả khi nguồn là nghiên cứu ở TQ
  (kết quả sinh học vẫn áp dụng).
- Phần gần như toàn mục gắn TQ (VD phần 7) thêm một câu nói rõ trong đoạn
  mở đầu phần.
- `sync-stats.mjs` đếm thêm một thống kê "mục chỉ tham khảo TQ";
  `index.html` hiển thị badge `TQ` trên card.

### 3.4 Bảng đổi tên file (book/)

Prefix `NN-` giữ nguyên (tools phụ thuộc), slug ASCII không dấu:

| Gốc | Mới |
| --- | --- |
| 01-不要早死 | 01-dung-chet-som.md |
| 02-不要慢慢死 | 02-dung-chet-tu-tu.md |
| 03-不要浪费精力 | 03-dung-lang-phi-suc-luc.md |
| 04-不要浪费时间 | 04-dung-lang-phi-thoi-gian.md |
| 05-不要浪费钱 | 05-dung-lang-phi-tien.md |
| 06-反面清单 | 06-danh-sach-nen-tranh.md |
| 07-没钱的时候怎么活 | 07-song-khi-khong-co-tien.md |
| 08-别把自己搭进去 | 08-dung-tu-chuoc-hoa-vao-than.md |
| 09-普通人容易踩的法律红线 | 09-lan-san-do-phap-luat-de-vi-pham.md |
| 10-恋爱和结婚划不划算 | 10-yeu-va-cuoi-co-dang-khong.md |
| 11-程序员和技术人容易踩的红线 | 11-lan-san-do-cua-dan-ky-thuat.md |
| 12-创业与做生意 | 12-khoi-nghiep-va-lam-an.md |
| 13-紧急情况 | 13-tinh-huong-khan-cap.md |
| 14-账号与信息安全 | 14-tai-khoan-va-an-toan-thong-tin.md |
| 15-租房与买房 | 15-thue-va-mua-nha.md |
| 16-得了慢性病之后怎么活 | 16-song-sau-khi-mac-benh-man-tinh.md |
| 17-家里有老人 | 17-nha-co-nguoi-gia.md |
| 18-养孩子划不划算 | 18-nuoi-con-co-dang-khong.md |
| 19-在职离职和工伤 | 19-di-lam-nghi-viec-va-tai-nan-lao-dong.md |
| 20-刚出生的孩子怎么带 | 20-cham-tre-so-sinh.md |
| 21-出国旅行与境外安全 | 21-du-lich-va-an-toan-nuoc-ngoai.md |
| 22-怎么放松 | 22-thu-gian-the-nao.md |
| 23-学什么技能划算 | 23-hoc-ky-nang-gi-dang.md |
| 24-看病 | 24-di-kham-benh.md |
| 25-人走了以后要办什么 | 25-viec-phai-lam-khi-nguoi-than-qua-doi.md |
| 26-做一个网站或平台 | 26-lam-mot-website-hoac-nen-tang.md |
| 27-怀孕和生产 | 27-mang-thai-va-sinh-con.md |
| 28-别为了外形把身体搞坏 | 28-dung-vi-ngoai-hinh-pha-hong-suc-khoe.md |
| 29-遭遇重大打击之后 | 29-sau-khi-gap-cu-soc-lon.md |
| 30-上学以后的孩子 | 30-con-cai-tuoi-di-hoc.md |
| 31-十八岁之后有哪几条路 | 31-nhung-con-duong-sau-tuoi-muoi-tam.md |
| 32-出国留学 | 32-du-hoc-nuoc-ngoai.md |
| 33-残疾之后怎么活 | 33-song-sau-khi-khuyet-tat.md |
| 34-家里的常备药别吃出事 | 34-thuoc-san-trong-nha-dung-de-uong-thanh-hoa.md |

### 3.5 Bảng đổi tên docs/

| Gốc | Mới |
| --- | --- |
| 做平台要办哪些证.md | lam-nen-tang-can-nhung-giay-phep-gi.md |
| 家庭应急装备清单.md | danh-muc-do-dung-khan-cap-gia-dinh.md |
| 生物钟和夜班.md | nhip-dong-ho-sinh-hoc-va-ca-dem.md |
| 结婚划不划算.md | cuoi-co-dang-khong.md |
| 遇到陌生人出事该不该停.md | gap-nguoi-la-bi-nan-co-nen-dung-lai.md |
| 引用对照.md | bang-doi-chieu-trich-dan.md (check-refs sinh lại) |
| 核实记录/ (~95 file) | xóa; nhật ký mới vào docs/ghi-chep-kiem-chung/ |

## 4. Hạ tầng cần port

### 4.1 tools/check-refs.mjs

- FIELDS: `/^- (Nói dễ hiểu|Lợi ích|Ghi chú|Chi phí):/`
- CROSS_FIELDS: `/^- (Nói dễ hiểu|Lợi ích|Ghi chú|Chi phí|Nguồn):/`
- Cùng phần: `mục\s+<danh sách số>` (tách `,`/`và`, khoảng `X đến Y`).
  Không khớp "mục lục/mục tiêu" vì yêu cầu số đứng sau.
- Chéo phần: `phần\s+(\d+)[,，]?\s*mục\s+<danh sách số>`.
- So khớp anchor tiêu đề: bản TQ so hai chữ Hán liên tiếp; bản VN so hai
  từ liên tiếp đã normalize (bỏ dấu, lowercase). Chi tiết cụ thể chốt trong
  plan, giữ nguyên tinh thần "phát hiện trích dẫn bị lệch khi renumber".
- Sinh `docs/bang-doi-chieu-trich-dan.md` thay `docs/引用对照.md`; bỏ quét
  thư mục nhật ký kiểm chứng.
- Comment và message đầu file viết lại bằng tiếng Việt.

### 4.2 tools/check-plain.mjs

- Field kiểm tra: `Nói dễ hiểu`.
- Độ dài: ≤ 60 từ (đếm theo khoảng trắng). Ngưỡng tinh chỉnh khi pilot xong.
- Jargon: `/\b(HR|RR|OR|CI|RCT)\b/`; từ thiết kế nghiên cứu:
  `đoàn hệ|tổng quan|tổng hợp|ngẫu nhiên|nhóm đối chứng|giả dược|mù đôi|cỡ mẫu|meta[- ]?analysis`
  (case-insensitive); cỡ mẫu: `\d+\s*(ca|người tham gia|bệnh viện|nghiên cứu|quốc gia)`;
  nhóm: `nhóm đó|hai nhóm|mỗi nhóm`.
- Số mới: giữ logic `numbers()`/`derived()`, đổi hậu tố nhân
  `万`→`nghìn|triệu|tỷ` (×10³ / ×10⁶ / ×10⁹), và `k` = ×10³.
- VAGUE: danh sách từ mơ hồ tiếng Việt khởi đầu nhỏ, bổ sung dần khi dịch
  thấy lỗi lặp (nguyên tắc: chỉ thu từ đã từng gây lỗi, tránh false positive).
- Vẫn tách `--numbers` khỏi CI vì false positive (hotline, số tiền ví dụ).

### 4.3 tools/sync-stats.mjs

- Đếm theo field mới: `### ` = mục; `- Mức chứng cứ:([ABC])`;
  `- Ghi chú:Tranh cãi` = tranh cãi; `Cần xác minh|TODO`;
  link trong `- (Nguồn|Ghi chú):`; tag `nhan-chi-phi`; thêm đếm
  `- Ghi chú:Chỉ tham khảo TQ`.
- `W` map giá trị mới: money `{'0':0,'it':1,'nhieu':2}`,
  time `{'it':0,'vua':1,'nhieu':2}`, will `{'khong':0,'chut':1,'nhieu':2}`;
  tiers `Cực cao / Cao / Trung bình`.
- Hai dòng guard (`COST_W_LINE`, `RATIO_LINE`) cập nhật theo nội dung mới
  của index.html — giữ cơ chế "đổi một bên thì bên kia phải đổi".
- EDITS viết lại toàn bộ cho chuỗi tiếng Việt trong README/index/og
  (badge shields URL-encode lại nhãn VN không dấu).
- og.html dịch text, xuất lại og.png (Chrome trên Windows; CI chỉ
  `--check` không chụp — giữ nguyên thiết kế đó).
- Comment đầu file viết lại bằng tiếng Việt.

### 4.4 index.html

- Parse `### `, comment `nhan-chi-phi`, `- Nói dễ hiểu:` cho card.
- `COST_W`, `e.ratio`, DIMS, nhãn filter, badge, TOC link tới tên file mới.
- Toàn bộ UI text → tiếng Việt (tiêu đề, mô tả, meta/OG tag,
  `numberOfPages`, placeholder search, legend, nút dark mode…).
- Thêm badge `TQ` cho mục có `Chỉ tham khảo TQ:`.
- Gỡ block quảng cáo mcyyy và ảnh QR WeChat.

### 4.5 tools/epub, tools/offline, tools/pdf, tools/lib

- Metadata sách (tên, tác giả/mô tả nếu có), tiêu đề mục lục, chuỗi UI,
  comment → tiếng Việt.
- `tools/offline/build.mjs`: gỡ đoạn embed `ads/mcyyy-side.webp` và
  `ads/wechat-reward.png`.
- PDF: kiểm tra `template.typ` và CI font — `fonts-noto-cjk` có thể thiếu
  dấu tổ hợp tiếng Việt; nếu thiếu thì đổi sang `fonts-noto` trong
  workflow và chỉnh font trong template. Xác minh khi build thật.

### 4.6 .github/

- `workflows/book.yml`: name `电子书` → `Sách điện tử`; job names
  (`交叉引用检查` → `Kiểm tra trích dẫn chéo`, `说人话检查` →
  `Kiểm tra "Nói dễ hiểu"`, `统计数字检查` → `Kiểm tra số liệu`),
  comment, release title/notes → tiếng Việt. Bỏ `ads/**` khỏi paths.
  Tên artifact `HowToLiveBetter.*` giữ nguyên (theo tên repo).
- `ISSUE_TEMPLATE/1-纠错.yml` → `1-sua-loi.yml`,
  `2-新内容.yml` → `2-noi-dung-moi.yml`, `config.yml` — dịch toàn bộ
  nhãn/mô tả trong file.
- `FUNDING.yml`: xóa.

### 4.7 skills/

- `skills/life-decision-guide/SKILL.md` + `README.md`: dịch, cập nhật tên
  sách, cú pháp trích `phần X, mục Y`, trigger tiếng Việt (có nên, đáng
  không, chọn thế nào, có phạm luật không, được nhận tiền gì…). Giữ cơ chế
  "đọc SKILL.md rồi làm theo".
- `.claude/skills/life-decision-guide/SKILL.md` (stub): dịch description
  frontmatter và phần hướng dẫn; URL raw cập nhật theo repo của chủ mới
  nếu publish (nếu chưa publish thì ghi TODO).

### 4.8 File gốc

- `README.md`: viết lại tiếng Việt — giữ cấu trúc (banner og.png, badges,
  bảng link, câu hỏi→phần, mục lục, bảng thuật ngữ, phân hạng chứng cứ,
  giấy phép). Gỡ bảng "其他语言" (link bản dịch của người khác), gỡ ad và
  QR; link file `book/` cập nhật tên mới.
- `CLAUDE.md`: viết lại tiếng Việt — giữ nguyên tinh thần toàn bộ quy tắc
  (định vị dự án, 4 tầng người hưởng lợi, chi phí quá trình, phân hạng
  chứng cứ A/B/C, quy tắc trích nguồn, format mục với field VN, chuẩn câu
  chữ ~30 từ một câu, chống văn AI với ví dụ VN, nghi thức sync-stats /
  check-refs / soi diff đối chiếu, ngưỡng lợi ích theo quy mô). Điều chỉnh:
  ngưỡng độ dài câu cho tiếng Việt; ví dụ dẫn chứng trong quy tắc đổi sang
  tình huống tương đương; mục "lịch sử sự cố" giữ nguyên sự kiện nhưng
  kể bằng tiếng Việt.
- `AGENTS.md`: dịch, cập nhật trỏ tới CLAUDE.md và skill.
- `sitemap.xml`: cập nhật nếu có URL tới file đổi tên; `robots.txt` giữ.
- `tools/og.html` + `og.png`: chữ VN, số liệu do sync-stats ghi, xuất lại
  ảnh bằng Chrome headless.
- `tools/ad-mcyyy*.html`, `tools/ad-mcyyy-bg.webp`: xóa.
- `LICENSE`, `LICENSE-CODE`, `.gitignore`, `.nojekyll`, lockfile: giữ nguyên.

## 5. Pha thực thi

Trên nhánh `ban-tieng-viet`, commit theo từng đơn vị để resume được:

- **Pha 0:** spec này được duyệt (file này).
- **Pha 1 — hạ tầng + pilot:** port index.html + 3 tools +
  epub/offline/pdf/lib theo quy ước mục 3–4. Dịch phần 18
  (`18-nuoi-con-co-dang-khong.md`, nhỏ nhất ~7.5KB) làm pilot.
  Người dùng review bản dịch mẫu → chốt giọng văn/thuật ngữ → mới quét
  phần còn lại.
- **Pha 2 — nội dung:** lần lượt 01→34 (trừ 18). Mỗi file: dịch hết mục →
  đánh dấu `Chỉ tham khảo TQ:` → đổi tên file → sửa link nội file →
  1 commit/file. Giai đoạn này repo lẫn hai ngôn ngữ là bình thường
  (tool VN chỉ nhận file đã chuyển; file TQ không khớp pattern nên bị
  bỏ qua, không gây lỗi).
- **Pha 3 — vỏ ngoài:** 5 bài docs dài + README + CLAUDE.md + AGENTS.md +
  skills + .github + sitemap + xóa 核实记录/ads/FUNDING/ad-tools.
- **Pha 4 — dọn sót + bàn giao:** `sync-stats` chạy full (sinh
  `bang-doi-chieu-trich-dan.md` + og.png); grep `[\u4e00-\u9fff]` toàn
  repo — chỉ được còn trong dòng `Nguồn:`; build thử EPUB/offline nếu
  dep cài được, ngược lại nhờ CI; cuối cùng để người dùng merge.

Lưu ý: `sync-stats` chỉ chạy full ở pha 4 (và lần kiểm sau pilot). Giữa
chừng số liệu lẫn hai ngôn ngữ vô nghĩa — đây là ngoại lệ có ý thức so với
nghi thức "chạy mỗi lần sửa" của bản gốc, chỉ trong thời gian chuyển đổi.

## 6. Phạm vi ngoài / ngoại lệ "mọi ngôn ngữ khác"

Không chuyển (giữ nguyên): tên tài liệu và link trong dòng `Nguồn:`;
LICENSE / LICENSE-CODE; tên repo/artifact `HowToLiveBetter`; tên thư mục
kỹ thuật ASCII sẵn có (`book/`, `docs/`, `tools/`, `skills/`,
`life-decision-guide`); chuỗi kỹ thuật trong code không hiển thị cho người
đọc (biến, tên hàm — giữ ASCII); comment code → dịch tiếng Việt.
`docs/superpowers/` là artefact quy trình, không tính vào nội dung sách.

## 7. Kiểm chứng

- Sau pilot và cuối mỗi nhóm phần: `node tools/check-refs.mjs` (chế độ
  thường, sinh bảng đối chiếu) và `node tools/check-plain.mjs`.
- Pha 4: `node tools/sync-stats.mjs` full + `--check` xanh; grep Han toàn
  repo sạch (whitelist dòng `Nguồn:`); `node tools/epub/build.mjs` và
  `tools/offline/build.mjs` chạy được nếu npm dep cài được.
- Fidelity: số liệu, tên điều luật, DOI/link giữ nguyên văn; pilot là cửa
  duyệt giọng dịch. Người dùng có thể review theo từng commit phần.

## 8. Rủi ro

- Khối lượng ~1.4MB chữ Hán → nhiều phiên làm việc; commit theo phần để
  resume, trạng thái nhìn được qua `git log`.
- Font PDF cho dấu tiếng Việt — kiểm tra build thật, đổi `fonts-noto` nếu
  thiếu.
- Anchor-matching của check-refs cho tiếng Việt cần thiết kế lại (so từ,
  không so ký tự Hán) — chốt chi tiết trong plan.
- Ngưỡng 60 từ của `Nói dễ hiểu` là ước lượng; tinh chỉnh sau pilot.

## 9. Tiêu chí hoàn thành

- Toàn bộ file ở mục 4 đã chuyển/xóa; không còn chữ Hán ngoài dòng
  `Nguồn:` và file LICENSE.
- Ba tool chạy xanh (`check-refs`, `check-plain`, `sync-stats --check`).
- index.html render đủ 641 mục với nhãn/badge tiếng Việt và badge TQ.
- CI `book.yml` xanh trên nhánh (refs, plain, stats, build).
