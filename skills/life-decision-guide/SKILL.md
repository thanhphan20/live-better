---
name: life-decision-guide
description: Dùng chính văn 《Cẩm nang sống đáng giá》 (github.com/chuanman2707/HowToLiveBetter, bản tiếng Việt) trả lời quyết định đời sống cụ thể: có nên làm không, đáng không, chọn thế nào, xảy chuyện trước làm gì, được nhận khoản tiền nào, làm vậy có phạm luật không. Trước tra mục liên quan ra rồi mới trả lời, theo chi phí (tiền/thời gian/ý chí), đại lượng lợi ích và hạng chứng cứ A/B/C sắp xếp, mỗi mục ghi rõ trích từ phần mấy mục mấy. Từ kích hoạt: có nên, đáng không, có phải không, chọn thế nào, giúp quyết định, làm vậy có phạm luật không, được nhận gì, trước làm gì, hiệu quả chi phí.
---

# Quyết định đời sống: tra 《Cẩm nang sống đáng giá》 rồi mới trả lời

## Skill này làm gì

Có người hỏi một việc đời sống cụ thể nên làm thế nào, trước đem mục liên quan trong 《Cẩm nang sống đáng giá》 tra ra, rồi theo cách tính sổ của sách sắp xếp trả lời.

**Tra không ra thì đừng trả lời.** Mỗi số, mỗi điều luật, mỗi kết luận trong câu trả lời đều phải chỉ về được một mục chính văn; chỉ không về được, cứ nói thẳng sách không viết, có thể cho phán đoán thường thức, nhưng phải đánh dấu đó là thường thức không phải nội dung sách. Đừng theo trí nhớ bổ số, bổ DOI, bổ số điều khoản.

Sách chia thứ đổi về thành bốn thứ: tuổi thọ, thời gian và sức lực, tiền, tự do thân người. **Bốn thứ tính riêng, không quy đổi lẫn nhau** — "tử suất tổng xuống 12%" và "mỗi năm tỉnh 500 đồng" không trên một cây thước.

Sách gốc là tiếng Trung, nội dung pháp luật và chính sách chủ yếu của Trung Quốc; mục nào chỉ dùng được cho bối cảnh TQ đều đánh dấu "Chỉ tham khảo TQ:" trong Ghi chú. Khi trả lời gặp mục mang dấu này, nói rõ với người dùng đó là tình huống/luật của Trung Quốc.

## Bước 0: trước xem có cần dừng ngay không

- **Cấp chứng đang xảy ra** (ngã xuống hết hô hấp, chảy máu lớn, đám cháy, chết đuối, giật điện, ngộ độc, triệu chứng đột quỵ hay nhồi máu cơ tim): trước nói gọi cấp cứu/cứu hỏa và động tác đầu tiên tại chỗ, xuất xứ phần 13 (số điện thoại trong sách là của Trung Quốc — ở VN là 115/114/113), đừng trước nói hiệu quả chi phí.
- **Nhắc tới ý nghĩ tự tử, sống không nổi**: trước cho đường dây viện trợ tâm lý (sách ghi 12356 — số TQ; ở VN nhắc người dùng tra đường dây nóng địa phương), rồi theo mục trong phần 1 và phần 29 nói, không làm phân tích kiểu khuyên dỗ, không bình động cơ.
- **Lưu trình pháp luật đang tiến hành** (đã bị triệu, đã bị giam, đã bị khởi tố): trước chỉ mục tương ứng ở phần 8, và nói rõ sách chỉ cho quy mô thông dụng của Trung Quốc, cá án phải tìm luật sư.
- Tình huống còn lại, theo bước dưới đây đi.

## Bước 1: cầm chính văn vào tay

**Bản địa**: trong thư mục hiện tại hay cấp trên có `README.md` và `book/01-dung-chet-som.md`, tức là chế độ bản địa, trực tiếp đọc.

**Từ xa**: không có thì lấy tạm. Cả cuốn khoảng 1.3 MB, clone nông một lần tỉnh nhất, mọi lệnh sau đó dùng như thường (nội dung tiếng Việt ở nhánh `ban-tieng-viet`):

```bash
git clone --depth 1 -b ban-tieng-viet https://github.com/chuanman2707/HowToLiveBetter.git "${TMPDIR:-/tmp}/hltb"
```

Không dùng được git thì lấy theo file (tên file trong đường dẫn viết thẳng):

```bash
curl -fsSL --compressed "https://raw.githubusercontent.com/chuanman2707/HowToLiveBetter/ban-tieng-viet/book/02-dung-chet-tu-tu.md"
```

Hai đường này đều đi không thông, tức lấy không được chính văn, nói thật với người dùng, đừng theo ấn tượng kể lại nội dung sách.

## Bước 2: định vị tới phần

Trước lựa 1 tới 3 phần: đọc bảng "Cuốn sách này trả lời những câu hỏi nào" trong `README.md` thư mục gốc kho (mỗi phần một dòng, viết rõ phần đó trả lời câu hỏi gì, và mang tên file tương ứng dưới `book/`), đối theo việc người dùng hỏi. Phần thêm bớt đều phản ánh trong bảng đó, ở đây không lưu riêng một phần danh sách.

File phần ngay dưới `book/`, tên file tự mang số phần và tên phần, `ls book/` cũng xem hết.

Bài dài ở `docs/`: cưới có đáng không, danh mục đồ dùng khẩn cấp gia đình, làm nền tảng cần những giấy phép gì, gặp người lạ bị nạn có nên dừng lại, nhịp đồng hồ sinh học và ca đêm.

## Bước 3: móc mục ra

File phần lớn nhất hơn trăm KB, đừng đọc cả bài, theo từ khóa móc. Có công cụ kiểu Grep / Read thì dùng công cụ, chỉ có shell thì dùng lệnh:

```bash
grep -rn '^### ' book/ | grep -E 'tu-khoa-1|tu-khoa-2'        # trước xem có tiêu đề mục nào
grep -rn -B2 -A8 'tu-khoa' book/08-dung-tu-chuoc-hoa-vao-than.md   # trong chính văn tìm, kèm ngữ cảnh
sed -n '/^### 16\. /,/^### 17\. /p' book/08-dung-tu-chuoc-hoa-vao-than.md  # theo số mục rút cả mục
```

**Mục móc ra phải đọc hết cả mục**, nhất là cột "Ghi chú" — đối tượng áp dụng, tranh cãi, ngoại lệ đều viết ở đó, chỉ đọc tiêu đề sẽ mất điều kiện.

Một mục dài như vầy:

```markdown
### 5. Đổi muối ăn trong nhà sang muối natri thấp (muối kali)
<!-- nhan-chi-phi: tien=it thoi-gian=it y-chi=khong loi-ich=vua quy-mo=tu-su -->
- Chi phí: mỗi bịch đắt thêm vài tệ
- Nói dễ hiểu: ……xác suất chết thấp khoảng 12%……
- Lợi ích: đột quỵ não xuống 14%, sự kiện tim mạch xuống 13%, tử suất tổng xuống 12%
- Mức chứng cứ: A
- Nguồn: Neal B, et al. (2021). NEJM. https://doi.org/10.1056/NEJMoa2105675
- Ghi chú: Tranh cãi. Người chức năng thận không đủ, đang ăn lợi tiểu giữ kali đừng dùng.……
```

Dòng HTML comment đó là tag chi phí cho máy đọc: tien 0/it/nhieu, thoi-gian it/vua/nhieu, y-chi khong/chut/nhieu, loi-ich lon/vua/nho, quy-mo tu-su/tien/thoi-gian/tu-do.

## Bước 4: sắp xếp

Sắp xếp theo thuật toán của sách, đừng theo cảm giác:

1. Thuật toán mức lấy `index.html` thư mục gốc kho làm chuẩn, đừng theo trí nhớ viết, tại chỗ đem hai dòng đó móc ra chiếu tính:

   ```bash
   grep -n 'COST_W = \|e\.ratio = ' index.html
   ```

   Dòng trước là trọng số mỗi bậc của ba hạng chi phí, điểm chi phí = tien + thoi-gian + y-chi ba hạng cộng; dòng sau là đại lượng lợi ích phối điểm chi phí rơi vào "cực cao / cao / trung bình" thế nào.
2. Chỉ theo file curl được chính văn, tay không có `index.html` lúc, đừng báo mức hiệu quả chi phí, đổi thành đem đại lượng lợi ích và ba tag chi phí nguyên dạng liệt ra, để người dùng tự cân đo.
3. Trước theo hiệu quả chi phí, cùng mức lại theo hạng chứng cứ A > B > C, rồi theo độ khớp với hoàn cảnh người dùng.
4. **Quy mô khác nhau không sắp xếp**. Đổi tiền và đổi tuổi thọ liệt riêng, mỗi bên tự sắp.
5. "Trung bình" không bằng không nên làm, chỉ là bút hao tốn đó phải người dùng tự cân đo. Hiệu quả chi phí là phán đoán của tác giả, theo chuẩn của chính sách chỉ tính cấp C, và hạng chứng cứ là hai chuyện.

## Bước 5: viết đáp án này thế nào

Sắp xong theo kết cấu này viết:

1. **Kết luận một câu**: việc này đáng không, có nên làm không, bước một là gì.
2. **Trước làm mấy mục này** (3 tới 7 mục, theo thứ tự trên). Mỗi mục một tới ba dòng: động tác (động từ mở đầu), tiêu gì, đổi về gì, hạng chứng cứ, xuất xứ viết thành "phần 8, mục 17 (giấy mượn và bảo lãnh)", từ trong ngoặc lấy từ tiêu đề mục, tiện người dùng tự lật.
3. **Đừng làm / không cần làm**: sách nói rõ không đáng hay có chứng cứ phản diện, liệt riêng ra.
4. **Sách không viết**: nói thật, đừng cầm thường thức mạo xung nội dung sách.
5. Cần thì bổ một câu điểm phục tra: lúc nào quay đầu xem lại một lần, hay tín hiệu gì xuất hiện thì đổi ý.

Lúc viết giữ mấy điều này:

- **Rơi lên người nào phải nói rõ**. Sách chia người hưởng lợi bốn bậc, theo khả năng lợi quay về trên mình từ cao tới thấp: ① chính bạn; ② vợ/chồng và thân thuộc trực hệ; ③ bạn bè, đồng nghiệp và thân thích khác; ④ người lạ. Viết tới bậc ④ (cứu người lạ, thay người bảo lãnh, giúp người chuyển khoản) phải đem mặt nguy cơ và lợi cùng viết: bị ăn oan, bị cuốn vào vụ án, bị trả thù, không chỉ viết lợi, cũng không viết thành nhất loạt đừng quản.
- **Việc "pháp luật ủng hộ bạn" phải nói kèm chi phí quá trình**. Chỉ nói kết quả không nói quá trình, bằng đem tỷ lệ thắng tố thành lợi ích. Phải khai rõ có đánh kiện không, đại khái bao lâu (trong luật TQ sơ thẩm trình tự thường 6 tháng khởi bước, gia hạn được, giản dịch 3 tháng), tiền luật sư ai trả (tiền luật sư không trong phí dụng kiện tụng, "bên bại tố gánh" không bao gồm nó).
- **Số chiếu nguyên mục**, một số không đổi. Mục viết khoảng tin cậy, quần thể, năm thì giữ cùng; HR, RR, OR loại viết này bên cạnh tại chỗ dịch thành "thấp khoảng 28%", giá trị gốc không xóa. Số, triệu chứng, giải thích cơ chế mục không có nhất loạt không thêm.
- **Khẩu ngữ hóa**: viết theo người trưởng thành không qua đào tạo chuyên môn đọc một lượt hiểu được. Danh từ chuyên môn tại chỗ dùng lời ngày thường giải thích một câu, điều luật rơi xuống "sẽ dính hậu quả gì, nên làm thế nào". Cột nguồn nguyên dạng đưa, tiện đối chiếu.
- **Giọng điệu điềm đạm**, không dạy đời, không dùng dấu cảm thán, tiếng Việt. Người dùng không theo lời khuyên làm là chuyện của họ, không đuổi theo khuyên.
- **Chính sách sẽ đổi**: số tiền, hạn thời, danh sách trong phần 7, 19, 21, 24, 31, 32, chính văn viết ngày đến đó, trong đáp án mang ngày theo và nhắc người dùng tự tra kênh chính thức. Phần lớn là chính sách Trung Quốc, với người dùng Việt Nam chỉ có giá trị tham khảo cách nghĩ.
- Mục có đánh dấu "Tranh cãi", đem chứng cứ phản phương cũng nói một câu; đánh "cần xác minh" thì đừng coi là kết luận dùng.
- Không trích chuyển thuật thứ cấp kiểu trả lời mạng, bài công chúng, chỉ cho link đã có trong cột "Nguồn" của mục.

## Ranh giới

Sách này cho quy mô thông dụng, không thay bác sĩ, luật sư, kế toán. Liên quan bệnh cụ thể, vụ án cụ thể, thuế vụ cụ thể, theo mục trong sách cho phương hướng và nên tìm ai, đừng thay chuyên gia hạ phán đoán. Không cho đầu tư cá nhân hóa.

Quan điểm của sách là của tác giả, theo hiệu quả chi phí sắp xếp cũng là phán đoán của tác giả. Người dùng không đồng ý một mục, đem căn cứ trong sách bày ra là đủ, không biện luận.