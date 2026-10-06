# Viết lại giọng văn toàn sách: "người thầy trò chuyện"

Ngày: 2026-10-03
Phạm vi: `book/01`–`book/34` (34 chương, khoảng 306 nghìn từ theo `wc -w`). Không động `docs/`
(trừ `docs/bang-doi-chieu-trich-dan.md`, xem Quy trình), `README.md`, `tools/`, `index.html`.

## Bối cảnh

Bản dịch hiện tại đúng nghĩa nhưng đọc biết ngay là dịch máy. Chủ sách yêu cầu viết lại câu chữ
thành văn của "một giáo sư viết sách khuyên người trẻ" — người thật viết, câu có nhịp, tôn trọng
người đọc. Đây là viết lại **văn phong**, không phải dịch lại nội dung: mọi dữ kiện, con số,
kết luận giữ nguyên.

Spec này là văn bản điều khiển toàn bộ công việc. Orchestrator (một phiên claude do chủ sách
mở trong kho này) đọc spec này cùng `CLAUDE.md` rồi tự điều phối các CLI worker; mọi lời gọi
worker đi qua `tools/rewrite-worker.sh` để dùng chung một prompt chuẩn và một bước kiểm chứng.

## Giọng văn mục tiêu

Người thầy ngồi nói chuyện với người trẻ mình tin tưởng: thẳng, rõ, thương người đọc, không
nói lý thuyết. Nhận diện bằng các tín hiệu sau.

- **Xưng "bạn"** với người đọc. Tác giả không tự xưng; khi cần nêu chủ kiến, dùng "theo tác giả"
  hoặc lồng vào lời khuyên ("phần khó duy nhất là ngại").
- **Mỗi câu có chủ ngữ rõ** (bạn, quán, công ty, tòa án, bác sĩ, luật). Cấm câu trôi không chủ
  kiểu "Làm không được là vi phạm" — phải thành "Chủ quán làm không được là vi phạm" hoặc
  "Nếu quán không làm, đó là vi phạm".
- **Một câu một việc**, dài khoảng 30 từ, tối đa 50 từ (giữ nguyên chuẩn cứng CLAUDE.md).
- **Nhịp ngắn-vừa xen nhau.** Bản hiện tại bị hai lỗi đối lập: câu cụt lủn kiểu điện báo
  ("Mở miệng đòi một lần đơn") xen câu lùi dồn một hơi ("Mấy thứ dưới đây chiếm một là đổi
  chỗ"). Bản mới viết trọn ý, dùng "vì", "nên", "nhưng", "còn" nối hai ý có nhân quả.
- **Được phán đoán ngắn** trong giọng người thầy: "đáng", "đừng tiếc", "phần khó nhất là".
  Cấm thêm sự thật mới, cấm triết lý hóa, cấm câu kết thăng hoa, cấm an ủi sáo rỗng.
- **Điềm đạm, không dạy đời** (CLAUDE.md): người thầy khuyên chứ không răn. Không dấu cảm thán,
  không "bạn phải hiểu rằng", không nhắc đi nhắc lại một lời khuyên trong cùng mục.
- **Không nói mạnh hơn hay yếu hơn gốc.** Không tự thêm "nhiều", "luôn", "chắc chắn", "tuyệt
  đối", cũng không tự bớt "gần như", "phần lớn", "có thể". Gốc nói "nặng hơn" thì viết "nặng
  hơn", không viết "nặng hơn nhiều".
- **Gạch ngang dài (—) dùng dè sẻn**: tối đa một cái mỗi mục, chỉ khi nó rõ hơn hẳn dấu phẩy
  hay dấu chấm. Không dùng nó thay "tức là", không nối hai mệnh đề bằng chùm gạch ngang. Đây là
  dấu hiệu văn AI mà skill no-ai-slop bắt; sách hiện chỉ có 99 cái trên khoảng 306 nghìn từ.
- **Vẫn đọc-một-lượt-hiểu.** Giọng giáo sư không có nghĩa là văn hoa. Người đọc chậm, người già
  vẫn đọc từng chữ một được — đây là lý do các chuẩn cứng bên dưới vẫn giữ.

## Danh mục không-được-động (cứng, vi phạm là làm lại)

Mục nào có ghi "(máy kiểm)" thì `tools/check-rewrite.mjs` bắt; còn lại dựa vào review.

1. **Tiêu đề mục** (`### N.`): chỉ được thêm từ giải thích, không bớt từ, không đổi từ
   (làm anchor cho `tools/check-refs.mjs`). Tốt nhất giữ nguyên. (máy kiểm)
2. **Tên field và thứ tự field**: `- Chi phí:`, `- Nói dễ hiểu:`, `- Lợi ích:`, `- Mức chứng cứ:`,
   `- Nguồn:`, `- Ghi chú:` — giữ nguyên chữ, nguyên thứ tự, nguyên dạng gạch đầu dòng, mỗi
   field một dòng. (máy kiểm)
3. **Thẻ `<!-- nhan-chi-phi: ... -->`**: byte-identical, không đổi giá trị nào. (máy kiểm)
4. **Cột `- Nguồn:` và `- Mức chứng cứ:`**: giữ nguyên toàn bộ — nguyên văn tiếng Trung, số điều,
   link. Không dịch, không sửa chính tả, không rút gọn. (máy kiểm)
5. **Mọi con số** trong toàn mục: năm, phần trăm, OR/RR/HR, khoảng tin cậy, cỡ mẫu, tiền,
   thời hạn, số điện thoại. Giá trị và cách viết đều giữ nguyên (45%, 0,58, 11.523); không đổi
   "2 lần" thành "hai lần" hay "0,58" thành "0.58". Một con số rớt hoặc đổi = làm lại.
   Thêm số mới thì được, nhưng chỉ khi là bản quy đổi kèm giá trị gốc. (máy kiểm)
6. **Marker mở đầu Ghi chú**: `Chỉ tham khảo TQ:` đứng đầu; `Tranh cãi` đứng ngay sau marker
   hoặc đứng đầu khi không có marker. Không được đẩy xuống giữa câu, không đổi thành "có tranh
   cãi". `sync-stats.mjs` đếm theo vị trí này. (máy kiểm)
7. **Trích chéo** "phần X, mục Y (từ khóa)": giữ số phần/số mục; từ khóa trong ngoặc phải còn
   khớp tiêu đề đích. Được phép viết lại phần văn dẫn quanh nó, nhưng **không đặt tên pháp quy,
   số hiệu văn bản hay "điều luật đó" sát trước trích dẫn**: check-refs sẽ coi nó là điều luật,
   trích dẫn lặng lẽ rơi khỏi bảng mà `--check` vẫn xanh. Tổng trích dẫn hiện là **765** và
   phải giữ nguyên sau mỗi chương. (máy kiểm qua `rewrite-worker.sh verify`)
8. **Link và "Cần xác minh"/"TODO"**: số link trong mỗi Ghi chú giữ nguyên (hiện là 0), không
   chuyển link giữa Nguồn và Ghi chú; mỗi chỗ "Cần xác minh"/"TODO" giữ nguyên chữ, vì
   `sync-stats.mjs` đếm cả hai vào README. **Không rút gọn Ghi chú dài** trong đợt này: rút là
   cắt nội dung, còn đưa phần dài sang `docs/` là việc của một đợt khác. (máy kiểm)
9. **Cấu trúc file**: dòng `[← Mục lục](../README.md)` và dòng `# N. Tên phần` giữ từng chữ
   (`tools/lib/book.mjs` và index.html đọc chúng); một dòng trống giữa các mục; thứ tự mục và số
   thứ tự `### N.` không đổi. Line ending giữ nguyên — hiện cả 34 file đều là LF. (máy kiểm)
10. **Nội dung mục đầu chương** (đoạn mở sau `# NN.`): được viết lại giọng như mọi văn khác,
    nhưng giữ mọi chỉ đường "phần X, mục Y" và con số.

## Bảng di trừ calque và văn dịch-máy

Nguyên tắc: **dịch chức năng, không dịch mặt chữ**. Bảng chia hai nhóm, vì áp máy móc một từ
tiếng Việt vốn tự nhiên chỉ làm diff phình ra và tăng rủi ro lệch nghĩa.

**Nhóm 1 — luôn đổi** (không ai nói tiếng Việt như vậy):

| Mẫu hiện tại | Gốc | Cách viết lại (tùy câu) |
|---|---|---|
| nhất loạt | 一律 | "đều", "cứ … là", "hễ … thì" |
| ký lục | 记录 (danh từ) | "hồ sơ", "bản ghi" |
| đình nghiệp (chỉnh đốn) | 停业(整顿) | "phải nghỉ kinh doanh (để chấn chỉnh)", "bị đình chỉ kinh doanh" |
| bộ phận liên quan | 有关部门 | ghi tên cơ quan cụ thể nếu văn bản có; không rõ thì "cơ quan quản lý" |
| tiến hành + danh động từ | 进行 | động từ trực tiếp: "tiến hành kiểm tra" → "kiểm tra" |
| dồn qua, thất thủ, cào tuyên truyền | từ vựng TQ vay thẳng | dịch theo nghĩa: "dồn qua" → "cho qua chuyện", "cào tuyên truyền" → "làm số liệu ảo để quảng cáo" |
| tức / tức là (lạm dụng) | 即 | "nghĩa là", hoặc tách thành câu riêng; không thay bằng gạch ngang dài |
| bản thân (làm chủ từ) | 本身 | cắt; khi cần nhấn: "chính nó", "riêng việc đó" |
| lặp chữ trong câu ("bán dịch vụ bán hàng", "ký lục lưu") | | viết lại để không lặp |

**Nhóm 2 — chỉ đổi khi câu đọc gượng** (từ tiếng Việt bình thường, giữ nếu câu đã tự nhiên):

| Mẫu | Gốc | Gợi ý khi cần đổi |
|---|---|---|
| cấu thành | 构成 | "tính là", "là phạm tội …"; "không cấu thành lời khuyên đầu tư" → "đây không phải lời khuyên đầu tư" |
| tình tiết (nghiêm trọng/trọng đại) | 情节 | "trường hợp nặng"; là thuật ngữ án thì giữ "tình tiết" |
| kịp thời | 及时 | "ngay", "kịp lúc"; thường cắt được |
| đơn vị | 单位 | theo thực thể: "công ty", "cơ sở", "nơi làm việc"; "đơn vị và cá nhân" → "tổ chức lẫn cá nhân" |
| tiện | 顺便 | "nhân tiện", "luôn thể", "tiện tay" |
| gánh (trách nhiệm) | 承担 | "chịu trách nhiệm", "phải bồi" |
| thực hiện (hợp đồng) | 履行 | "giữ đúng hợp đồng" |
| phát sinh, tương đương, đối đãi | 发生, 相当于, 对待 | "xảy ra", "bằng", "đối xử" |
| chủ động | 主动 | cắt khi thừa; **giữ khi gốc nhấn 主动** ("phải chủ động đưa bảng giá") |
| người làm nghề | 从业人员 | "nhân viên quán", "người phục vụ" |

Những từ như "đảm bảo/bảo đảm", "quan tâm", "áp dụng", "công nhận", "suy sụp" không phải calque,
không đổi chỉ vì có mặt trong câu.

**Thuật ngữ hậu quả pháp lý — giữ đúng mức, không làm nhẹ hay nặng.** Người đọc Việt hiểu từ
theo luật Việt Nam, nên đổi sang từ "đời thường" dễ làm sai mức hậu quả:

| Gốc | Không viết | Viết |
|---|---|---|
| 治安(管理)处罚 | "phạt hành chính" (người Việt hiểu là phạt tiền, trong khi hình phạt này gồm cả giữ người) | "bị công an xử phạt trị an"; lần đầu trong mục có thể giải thích "(gồm phạt tiền và tạm giữ)" |
| 行政拘留 | "tạm giam" (ở VN là giam người đã bị bắt để chờ xét xử) | "bị tạm giữ X ngày", "bị giam hành chính X ngày" |
| 刑事拘留 | "tạm giam" | "bị tạm giữ hình sự" |
| 逮捕 | "tạm giữ" | "bị bắt tạm giam" |

Khi không chắc, giữ nguyên từ đang có và để review quyết.

**Thêm hai lỗi câu hay gặp:**

- **Câu xếp chồng không liên kết**: "Mấy thứ dưới đây chiếm một là đổi chỗ: phòng tầng hầm, chỉ
  một lối ra…" — viết lại thành câu có nhịp: "Chỉ cần chỗ đó trúng một trong mấy điểm sau thì
  đổi quán khác: phòng ở tầng hầm, chỉ có một lối ra…"
- **Chỉ đường mơ hồ**: "mấy thứ dưới đây", "loại chỗ này", "đầu kia" — nêu rõ thứ đang nói.

## Quy tắc theo field

- **Chi phí**: 1-3 câu, được phép giọng thầy thoải mái nhất ("Không tốn đồng nào, chỉ tốn một
  câu hỏi"). Vẫn ghi đủ tiền/thời gian/sức chịu đựng như bản gốc.
- **Nói dễ hiểu**: 2-4 câu, ≤60 từ, chỉ dịch lại Lợi ích — không thêm số, không thêm fact,
  không jargon nghiên cứu (`check-plain.mjs` kiểm). Đây là dòng người đọc thấy đầu tiên trên
  trang tra cứu — viết tự nhiên nhất có thể trong khung đó.
- **Lợi ích**: giữ mọi con số, CI, tên quần thể, năm. Được viết lại câu chữ và thêm bản dịch
  ngay cạnh giá trị gốc ("OR 0,58 (thấp khoảng 42%)") — giá trị gốc không đổi. Trích nguyên
  văn điều luật được viết lại trôi chảy nhưng giữ đúng nội dung (khoản mục, con số, điều kiện).
- **Ghi chú**: marker giữ đầu dòng; sau marker viết tự do trong giọng thầy — đây là nơi phán
  đoán của tác giả được phép nghe rõ nhất, nhưng không thêm fact mới, không đổi số link.
- **Mức chứng cứ, Nguồn**: không động.

## Ví dụ trước/sau

Các ví dụ "Sau" là mẫu worker sẽ bắt chước sát nhất, nên chúng phải tự tuân thủ mọi quy tắc
ở trên: không gạch ngang dài, không nói mạnh hơn gốc, không làm nhẹ hậu quả pháp lý.

### Luật (chương 22, mục 2)

Trước:
> - Chi phí: Không tốn tiền. Mở miệng đòi một lần đơn. Khó ở chỗ hỏi giá trước mặt người ta, hơi ngại.
> - Nói dễ hiểu: Cơ sở giải trí bán dịch vụ bán hàng phải niêm yết giá và chủ động đưa bảng giá. "Rượu giá trên trời" gần như đều ra ở chỗ chưa xem bảng giá, tính theo giá nói miệng. Vào phòng đòi đơn chụp ảnh, tranh chấp gọi ngay 12315 (đường dây nóng người tiêu dùng TQ).

Sau:
> - Chi phí: Không tốn đồng nào, chỉ tốn một câu hỏi. Phần khó nhất là phải hỏi giá ngay trước mặt người phục vụ, nên hơi ngại một chút.
> - Nói dễ hiểu: Quán giải trí phải niêm yết giá và chủ động đưa bảng giá. Vụ "rượu giá trên trời" gần như đều xảy ra khi khách chưa xem bảng giá, để quán tính theo giá nói miệng. Vào phòng, bạn đòi bảng giá rồi chụp ảnh; có tranh chấp thì gọi ngay 12315 (đường dây nóng người tiêu dùng TQ).

("chủ động" giữ lại vì gốc viết `主动把价目表拿给你看`: quán phải tự đưa, không đợi khách hỏi.)

### Luật — Ghi chú (chương 22, mục 3)

Trước:
> - Ghi chú: Chỉ tham khảo TQ: Chỉ cần có người lấy ra bột không rõ, viên, đầu pod thuốc lá điện tử, mời bạn "thử một chút", là rời ngay, đừng ở lại xem náo nhiệt. Rủi ro cá nhân bạn gánh nặng hơn cơ sở. Tự mình hút, bản thân đã phải chịu xử phạt trị an. Ở phòng mình đặt hay chỗ ở của mình "để bạn bè dùng một chút ở đây", cấu thành chứa người khác hút ma túy, thuộc tội hình sự

Sau:
> - Ghi chú: Chỉ tham khảo TQ: Chỉ cần có người móc ra bột không rõ, viên thuốc hay đầu pod thuốc lá điện tử rồi mời bạn "thử một chút", bạn hãy rời đi ngay, đừng ở lại xem cho vui. Rủi ro riêng bạn phải chịu còn nặng hơn rủi ro của quán. Bạn tự hút thì chính bạn đã bị công an xử phạt trị an. Còn nếu bạn để bạn bè "dùng một chút" trong phòng bạn đặt hay chỗ bạn ở, bạn đã phạm tội chứa người khác hút ma túy, và đó là tội hình sự.

(Gốc: `你个人担的风险比场所更重` — "nặng hơn", không phải "nặng hơn nhiều". `治安处罚` giữ là "xử
phạt trị an", vì chính chương này ở mục 4 ghi người hút bị giữ 10 tới 15 ngày, không chỉ bị phạt tiền.
Mục 4 hiện viết `拘留` là "tạm giam"; đó là chỗ bảng thuật ngữ hậu quả pháp lý ở trên phải sửa.)

### Tiền bạc (chương 5, mục 1)

Trước:
> - Chi phí: Không tốn tiền. Lật một lượt danh sách "tự động trừ tiền" của Alipay, WeChat, Apple và Android, một lần mất 10 đến 20 phút. Sau này mỗi lần gia hạn phải tự bấm thêm một lần.

Sau:
> - Chi phí: Không tốn tiền. Bạn lật một lượt danh sách "tự động trừ tiền" của Alipay, WeChat, Apple và Android, mỗi lần mất chừng 10 đến 20 phút. Về sau, mỗi lần gia hạn bạn phải tự bấm thêm một lần.

### Mở đầu chương (chương 22)

Trước:
> Nửa đầu phần nói trong chỗ giải trí tiền nào bỏ oan, lối thoát an toàn ở đâu, thước là tiền và tự do thân thể. Nửa sau nói giảm áp lực thế nào, thước là tinh lực và tổng tử vong.

Sau:
> Nửa đầu phần này nói về những khoản tiền dễ bỏ oan ở chỗ giải trí và cách tìm lối thoát an toàn, nên được đo bằng tiền và tự do thân thể. Nửa sau nói cách giảm áp lực, đo bằng tinh lực và tổng tử vong.

### Lặp công thức (chương 5, 13 Ghi chú)

Trước (lặp máy móc ở cuối 13 Ghi chú của chương 5):
> Không cấu thành lời khuyên đầu tư.

Sau: viết mỗi chỗ một cách, hợp câu đang đứng:
> Đây không phải lời khuyên đầu tư. / Phần này chỉ đưa cách tính sổ, không phải lời khuyên đầu tư. / Nói trước: đây là cách nhìn, không phải lời khuyên đầu tư.

## Quy trình thực thi

### Điều phối đa CLI

**Orchestrator là claude** (2.1.282): chủ sách mở một phiên claude trong kho này, đưa nó lời
khởi động ở cuối spec; claude tự điều phối — phát chương cho worker, đọc kết quả kiểm chứng,
gọi review, commit. Session Devin viết bản đầu của spec này chỉ là tác giả spec và công cụ,
không nằm trong vòng chạy.

| CLI | Vai trò |
|---|---|
| **claude** (2.1.282), phiên orchestrator | Điều phối; **tự viết đúng một chương: pilot 22**, ngay trong phiên, để định hình giọng |
| **claude** qua `rewrite-worker.sh claude NN` | Worker cho các chương nặng — một tiến trình `claude -p` riêng, context riêng; cũng là reviewer (`review NN`) |
| **agy** (1.2.14), **grok** (1.0.46), **devin** (3000.11.3) | Worker cho các chương còn lại |

Mọi worker: mỗi lượt gọi nhận đúng một chương, viết lại file trong worktree riêng, chạy checker
tới sạch, báo cáo. Không commit.

**Quy tắc chia việc**: mỗi lần gọi CLI chỉ giao **một chương** (context sạch, lỗi dễ truy,
retry rẻ). Chương lớn (trên khoảng 15 nghìn từ) hoặc dày trích luật giao cho worker claude:
**01, 02, 05, 06, 08, 09, 13** (08 lớn nhất, khoảng 25 nghìn từ). Chương còn lại chia đều cho
agy, grok, devin. Orchestrator **không** tự viết các chương này trong phiên của mình: riêng
01, 02, 05 đã khoảng 55 nghìn từ, cộng bản gốc tiếng Trung và phần viết ra thì context
orchestrator cạn trước khi xong. Một CLI hết quota hoặc lỗi giữa chừng thì hàng đợi của nó
chuyển cho CLI khác, không giữ chỗ.

**Chạy song song trong worktree riêng**: `check-plain.mjs` và `check-refs.mjs` quét cả `book/`.
Nếu nhiều worker cùng viết trong một working tree, worker này thấy lỗi ở chương đang dở của
worker kia rồi "tự sửa" sang file không phải của nó. Vì vậy `rewrite-worker.sh` tạo cho mỗi
chương một git worktree tách từ HEAD (mặc định `../.HowToLiveBetter-rewrite/NN`), worker chỉ
chạy trong đó. Orchestrator mở tối đa 3-4 tiến trình nền, mỗi tiến trình một CLI × một chương.
Khi đạt, `take NN` chép đúng một file về working tree chính; vì chỉ file đó đổi nên chép là an
toàn dù nhánh đã có commit chương khác. Commit do orchestrator làm tuần tự.

### Công cụ dựng sẵn (orchestrator chỉ gọi — không tự ráp prompt)

```bash
tools/rewrite-worker.sh <claude|agy|grok|devin> <NN>            # tạo worktree, worker viết lại chương NN, tự verify
tools/rewrite-worker.sh <claude|agy|grok|devin> <NN> loi.txt    # worker sửa đúng các lỗi trong loi.txt, tự verify
tools/rewrite-worker.sh review <NN>                             # claude review bản trong worktree, KHÔNG sửa file
tools/rewrite-worker.sh verify <NN>                             # chạy lại kiểm chứng độc lập
tools/rewrite-worker.sh take <NN>                               # verify lần cuối, chép file về working tree chính, xóa worktree
tools/rewrite-worker.sh drop <NN>                               # bỏ worktree (CLI chết, giao chương cho CLI khác)
tools/rewrite-worker.sh -n <cli|review> <NN>                    # chỉ in prompt + lệnh, không chạy

node tools/check-rewrite.mjs book/NN-*.md                       # chữ ký cấu trúc + số, so với HEAD
```

`rewrite-worker.sh` tự tra commit dịch và đường dẫn bản TQ, ráp prompt chuẩn, gọi đúng cờ
headless của từng CLI, ghi log vào `../.HowToLiveBetter-rewrite/logs/`. Nếu prompt cần sửa thì
sửa trong script — mọi lời gọi cùng dùng một prompt, không ai được viết lách tự do. Prompt chuẩn
(tóm tắt): đọc `CLAUDE.md` + spec này + `~/.agents/skills/no-ai-slop/SKILL.md`; sau khi pilot
được duyệt, đọc thêm 3-4 mục của pilot đã commit làm mốc giọng (script tự tìm commit
"Viết lại giọng chương 22"); viết lại toàn bộ file; đối chiếu gốc TQ qua
`git show <commit>^:<path>`; giữ cứng danh mục không-được-động; chỉ sửa đúng file của mình;
chương dài thì sửa theo nhóm vài mục, không ghi đè cả file một lần; chạy checker tới sạch;
không commit.

`verify NN` là kiểm chứng độc lập, worker không tự chấm mình. Nó chạy trong worktree và đòi đủ:
worker không động file nào khác; `check-rewrite.mjs` sạch; `check-plain.mjs` sạch;
`sync-stats.mjs --check` khớp; `check-refs.mjs --check` đạt **và** tổng trích dẫn bằng đúng
con số lúc phát việc (765). In `KẾT QUẢ: ĐẠT` hoặc `KẾT QUẢ: KHÔNG ĐẠT`.

`check-rewrite.mjs` kiểm (chi tiết ở đầu file script): line ending; dòng mục lục và tên phần;
dãy số mục; tiêu đề mục chỉ thêm từ; dãy field theo thứ tự; giá trị thẻ `nhan-chi-phi`; dòng
`Nguồn` nguyên nội dung; `Mức chứng cứ`; marker `Ghi chú` (phân biệt cả `Chỉ tham khảo TQ:
Tranh cãi`); số link trong Ghi chú; số chỗ "Cần xác minh"/"TODO"; và mọi con số của bản cũ còn
đủ trong bản mới ở cả hai lớp: giá trị (bắt "3 triệu" thành "3 nghìn") và cách viết (bắt
"0,58" thành "0.58"). Số mới xuất hiện thì cho phép.

### Vòng làm việc của một chương

1. Orchestrator phát việc: `rewrite-worker.sh <cli> NN` (chạy nền). Script tạo worktree, ghi
   tổng trích dẫn lúc phát việc, gọi worker, rồi tự chạy `verify`.
2. `verify` không đạt → orchestrator chép các dòng `LỖI` vào một file và gọi
   `rewrite-worker.sh <cli> NN loi.txt`. Tối đa hai lượt; vẫn không đạt thì `drop NN` và giao
   chương cho worker claude.
3. `verify` đạt → `rewrite-worker.sh review NN`. Review trả "SẠCH" hoặc danh sách lỗi
   [giọng|cấu trúc|nghĩa]. Có lỗi → quay lại bước 2 với danh sách đó (chung giới hạn hai lượt).
   Mọi chương đều qua review, kể cả chương do worker claude viết; chỉ pilot thì chủ sách duyệt.
4. Review sạch → orchestrator tự đối chiếu **3 mục chọn ngẫu nhiên** với bản gốc TQ
   (`git show <commit>^:<path>`, chỉ đọc đúng 3 mục đó). Lệch nghĩa → quay lại bước 2.
5. Đạt → `rewrite-worker.sh take NN`, rồi ở working tree chính:
   - `node tools/check-refs.mjs` (không `--check`): ghi lại `docs/bang-doi-chieu-trich-dan.md`.
     Cột ngữ cảnh sẽ đổi vì văn quanh trích dẫn đổi, đó là bình thường. **Cột "mục trỏ tới"
     không được đổi**, tổng vẫn là 765. Đổi thì dừng và truy.
   - `node tools/sync-stats.mjs --check`: số liệu phải khớp (không cần chạy bản ghi, vì số
     liệu không được đổi).
   - `git status --porcelain` chỉ còn `book/NN-*.md` và `docs/bang-doi-chieu-trich-dan.md`.
6. Commit hai file đó: "Viết lại giọng chương NN (<cli>)".

### Rollout

- Nhánh `giong-van-nguoi-thay` (từ main), một chương một commit, message ghi rõ CLI nào viết
  (ví dụ "Viết lại giọng chương 22 (claude)") để truy chất lượng theo nguồn.
- **Pilot**: orchestrator tự viết chương 22 ngay trong working tree chính, chạy
  `check-rewrite.mjs` + `check-plain` + `check-refs --check` (tổng 765) tới sạch → **DỪNG**,
  trình diff cho chủ sách duyệt → duyệt xong mới commit pilot với đúng message
  "Viết lại giọng chương 22 (claude)" (script tìm mốc giọng theo message này), rồi mới điều
  phối 33 chương còn lại.
- Nếu pilot lệch giọng: chỉnh spec trước, viết lại pilot, duyệt lại — không chạy hàng loạt
  trên giọng chưa duyệt.
- **Trạng thái & resume**: tiến độ = git log nhánh, việc dở = các thư mục trong
  `../.HowToLiveBetter-rewrite/` (`git worktree list`). Session orchestrator hết context hay
  chết giữa chừng → mở phiên claude mới, bảo "đọc spec + `git log --oneline main..HEAD` +
  `git worktree list`, tiếp tục". Worktree nào còn đó thì `verify NN` để biết nó đã xong hay
  phải `drop NN` làm lại.
- Sau chương cuối: `node tools/sync-stats.mjs --check` và `node tools/check-refs.mjs --check`
  một lần nữa trên nhánh; `git worktree list` không còn worktree viết lại nào. Merge hay mở PR
  theo ý chủ sách.

### Lời khởi động (chủ sách paste vào phiên claude)

```text
Đọc docs/superpowers/specs/2026-10-03-giong-van-nguoi-thay-design.md, CLAUDE.md
và /Users/binhan/.agents/skills/no-ai-slop/SKILL.md. Bạn là orchestrator của đợt
viết lại giọng toàn sách theo spec đó: tạo nhánh giong-van-nguoi-thay từ main,
TỰ viết pilot chương 22 trong working tree chính (bạn là chuẩn — không giao cho
worker), chạy node tools/check-rewrite.mjs book/22-*.md + check-plain +
check-refs --check (tổng phải là 765) tới sạch, rồi DỪNG trình diff cho tôi
duyệt. Tôi duyệt xong bạn commit pilot, rồi điều phối 33 chương còn lại bằng
tools/rewrite-worker.sh theo "Vòng làm việc của một chương" trong spec. Bạn
không tự viết chương nào khác ngoài 22; chương nặng giao cho worker claude.
```

## Rủi ro và cách bắt

- **Rớt/đổi con số**: check-rewrite.mjs so toàn bộ số cũ→mới ở cả giá trị lẫn cách viết. Đây
  là rủi ro nặng nhất vì khó thấy bằng mắt trong 10 nghìn từ một chương.
- **Đổi tiêu đề mục làm gãy anchor**: check-refs.mjs --check + cột "mục trỏ tới" của bảng
  đối chiếu.
- **Trích dẫn lặng lẽ rơi khỏi bảng** (tên pháp quy đặt sát trước "mục N"): `verify` so tổng
  trích dẫn với con số lúc phát việc; bảng đối chiếu sau `take` phải vẫn 765.
- **Marker Tranh cãi trôi khỏi đầu Ghi chú**: check-rewrite.mjs phân biệt bốn trạng thái
  marker; `sync-stats.mjs --check` sau mỗi chương là lưới thứ hai.
- **Lệch nghĩa so với gốc TQ, nói mạnh hơn gốc, làm nhẹ hậu quả pháp lý**: review đối chiếu cả
  chương với gốc; orchestrator đối chiếu thêm 3 mục ngẫu nhiên; pilot là nơi chỉnh thói quen này.
- **Giọng trôi giữa các chương**: prompt worker và review đều nhúng pilot đã duyệt làm mốc ngay
  từ chương đầu tiên, không đợi giọng trôi mới thêm.
- **Chùm gạch ngang dài, văn AI**: quy tắc trong "Giọng văn mục tiêu" + review. Có thể đếm nhanh
  `grep -o '—' book/NN-*.md | wc -l` trước và sau; tăng mạnh là tín hiệu.
- **Worker động sang file khác**: mỗi chương một worktree; `verify` báo nếu worktree có file
  khác thay đổi; `take` chỉ chép đúng một file.
- **Line ending**: check-rewrite.mjs phân biệt LF / CRLF / lẫn; hiện mọi file là LF.
- **CLI không nạp context giống nhau**: claude tự nạp CLAUDE.md, các CLI khác có thể nạp
  AGENTS.md hoặc không nạp gì — nên prompt bắt buộc đọc CLAUDE.md + spec + skill bằng đường
  dẫn tường minh, không trông đợi auto-load.
- **Quá tải review**: claude review mọi chương — nếu nó chậm thành nút thắt, giảm còn review
  mẫu 30% mục mỗi chương, các chương đầu của mỗi worker vẫn review toàn phần.
- **CLI chết giữa chừng / hết quota**: file trong worktree có thể nửa viết — `verify` bắt ngay
  (số mục, số liệu lệch); `drop NN` rồi giao chương cho CLI khác. Working tree chính không bị
  ảnh hưởng; mất tối đa một chương công.
- **Orchestrator tự viết thay vì điều phối**: nếu claude ôm chương tự viết, context của nó cạn
  trước — lời khởi động đã ghi rõ chỉ pilot mới tự viết, còn lại phát qua `rewrite-worker.sh`.
  Thấy nó lệch thì chủ sách nhắc lại.
- **Orchestrator hết context giữa chừng**: tiến độ nằm trong git log nhánh và `git worktree
  list`, mở phiên mới là tiếp được (xem Rollout).

## Ngoài phạm vi

- Không dịch lại từ gốc TQ — chỉ viết lại văn phong tiếng Việt, đối chiếu gốc để không lệch nghĩa.
- Không sửa `docs/` (trừ `docs/bang-doi-chieu-trich-dan.md` do `check-refs.mjs` ghi lại),
  `README.md`, trang `index.html`, `skills/`, các tool hiện có trong `tools/`. Riêng
  `tools/rewrite-worker.sh` được phép sửa khi prompt chuẩn cần điều chỉnh;
  `tools/check-rewrite.mjs` chỉ sửa khi phát hiện nó bắt sai.
- Không thêm mục mới, không xóa mục, không đổi thứ tự mục, không đổi mức chứng cứ.
- Không rút gọn Ghi chú, không chuyển nội dung sang `docs/`.
- Không "Việt hóa" nội dung TQ (luật, hotline, giá tiền nhân dân tệ) — đó là bản chất cuốn sách.
- Không thống nhất thuật ngữ toàn sách (ví dụ "tổng tử vong" so với "tử suất tổng" của
  CLAUDE.md) trong đợt này; ghi lại để làm một đợt riêng.
