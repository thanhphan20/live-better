# Thiết kế: làm mới giao diện Cẩm nang sống đáng giá

Ngày: 2026-10-06  
Trạng thái: chờ chủ dự án duyệt tài liệu thiết kế  
Phạm vi: giao diện tra cứu trong `index.html`, không đổi nội dung sách hay hành vi sản phẩm.

## Mục tiêu

Tạo nhận diện ấm, có chất biên tập như Claude nhưng vẫn là giao diện riêng của Cẩm nang sống đáng giá. Giữ nguyên cách tìm, lọc và đọc 641 mục; người đọc không phải học lại luồng hiện có.

Thiết kế đã được duyệt trong hội thoại:

- Hướng `Clay & paper`: nền giấy sáng, chữ màu mực, nhấn đất nung.
- Tham khảo kiểu chữ Anthropic Sans và Serif bằng `Source Sans 3` và `Source Serif 4`, đều có giấy phép mở và hỗ trợ tiếng Việt.
- Giữ dấu ✓ hiện có của dự án. Không dùng biểu tượng, logo hay wordmark của Claude/Anthropic.
- Làm mới nhận diện, không tái cấu trúc ứng dụng hay thêm tính năng.

## Đọc thiết kế

Đây là một công cụ tra cứu nội dung biên tập bằng tiếng Việt, dành cho người đọc phổ thông. Giao diện nên tạo cảm giác đáng tin, dễ đọc lâu và có bản sắc riêng, không giống dashboard dữ liệu.

- `DESIGN_VARIANCE: 5`: tạo điểm nhấn ở typography và phân cấp, giữ bố cục tra cứu quen thuộc.
- `MOTION_INTENSITY: 3`: chuyển động nhỏ để phản hồi trạng thái; không thêm animation trang trí.
- `VISUAL_DENSITY: 4`: giữ sidebar và các bộ lọc, nhưng tăng khoảng thở cho phần đọc.

## Hiện trạng cần giữ

`index.html` là trang tĩnh chứa CSS, markup và JavaScript. Trang có thanh tìm kiếm, phím `/`, sidebar bộ lọc, điều hướng 34 phần, 641 thẻ lời khuyên, chế độ sáng/tối, tooltip thuật ngữ, popup trích chéo và modal bài dài. Sidebar chuyển thành drawer trên màn hình hẹp.

`tools/offline/build.mjs` đóng trang, README, sách và bài dài thành một file HTML không cần mạng. Mọi thay đổi font phải tiếp tục hỗ trợ đầu ra tự chứa này.

## Hệ thống hình ảnh

### Màu

| Token | Light | Dark | Dùng cho |
|---|---|---|---|
| Nền chính | `#FAF9F5` | `#141413` | Nền trang |
| Nền phụ | `#F5F4ED` | `#262624` | Sidebar và nhóm nội dung phụ |
| Bề mặt | `#FFFEFA` | `#30302E` | Search, card và modal |
| Chữ chính | `#141413` | `#FAF9F5` | Tiêu đề và nội dung |
| Chữ phụ | `#3D3D3A` | `#C2C0B6` | Mô tả và metadata |
| Nhấn đất nung | `#C96442` | `#E08B6F` | Liên kết, trạng thái chọn, dấu ✓ |
| Viền | `#E7E4DB` | `#45443F` | Phân cách và viền control |

Badge cấp chứng cứ và `Disputed` tiếp tục dùng màu ngữ nghĩa riêng để không làm mất ý nghĩa. Kiểm tra tương phản WCAG AA cho chữ thường, focus ring và trạng thái đã chọn trước khi chốt mã màu.

### Chữ

- Dùng `Source Sans 3` cho UI và nội dung thường.
- Dùng `Source Serif 4` có giới hạn cho tiêu đề trang/phần, không dùng cho đoạn nội dung dài.
- Tự lưu file WOFF2 đã chọn trong `assets/fonts/`; kiểm tra đủ dấu tiếng Việt và trọng lượng cần dùng.
- Dùng system font làm fallback. Không tải font từ Google hoặc dịch vụ ngoài lúc chạy.
- Giữ nội dung dài ở cỡ đọc được và line-height khoảng 1.6-1.75; phân cấp tiêu đề không vượt quá ba cấp rõ ràng.

### Mark, shape và chuyển động

- Giữ hình dấu ✓ trong favicon và brand mark đang có, chỉ đổi nền từ xanh sang đất nung.
- Giữ radius nhất quán: control nhỏ 6-8px, card/modal 8-10px, chip dùng dạng pill.
- Ưu tiên viền mảnh và khoảng cách thay cho shadow nặng.
- Giữ chuyển động hiện có nếu cần phản hồi thao tác. Tôn trọng `prefers-reduced-motion`; không thêm animation tự chạy.

## Bố cục

### Desktop

- Giữ thanh trên cùng với tên dự án, tìm kiếm, liên kết hiện có và công tắc theme.
- Giữ sidebar trái cho mục lục phần và các nhóm lọc.
- Giữ nội dung đọc ở cột chính, có giới hạn chiều rộng để tránh dòng quá dài.
- Mỗi section mở bằng nhãn phần, tiêu đề serif, mô tả ngắn và số lượng kết quả.
- Thẻ lời khuyên giữ thứ tự thông tin hiện có. Dùng bề mặt sáng và viền mảnh thay cho cảm giác bảng điều khiển.
- Dùng đất nung cho mục đang chọn và điểm nhấn; không tô mọi badge cùng một màu.

### Mobile

- Giữ nút mở drawer cho bộ lọc và lớp nền đóng drawer.
- Giữ một cột nội dung, chip tự xuống dòng và các hàng thông tin xếp dọc.
- Không thêm thanh điều hướng mới hoặc thay cách serialize bộ lọc vào URL.
- Dùng target chạm tối thiểu 44px cho control tương tác.

## Phạm vi thay đổi

### Có trong phạm vi

- `index.html`: CSS token, typography, favicon/theme color, phân cấp bố cục và trạng thái focus/hover/chọn.
- `assets/fonts/`: file WOFF2 tự lưu của hai font đã chọn.
- `tools/offline/build.mjs`: nhúng font cục bộ vào CSS đầu ra để file offline không cần mạng.
- Sinh lại `dist/HowToLiveBetter.html` để kiểm tra. `dist/` đang bị git ignore nên không commit file sinh ra.

### Không đổi

- Văn bản và dữ liệu trong `book/*.md`, README và glossary.
- ID và `data-dim`/`data-v` của control; tên query parameter, bookmark và giá trị nội bộ `e.ratio`.
- Logic tìm kiếm, lọc, mở/đóng section, modal, tooltip, popup trích chéo và URL history.
- Analytics, canonical URL, Open Graph metadata và `og.png`.
- `tools/sync-stats.mjs`. Script này kiểm tra nguyên văn dòng `e.ratio` trong `index.html`; giữ nguyên dòng đó để CI tiếp tục chạy.
- EPUB/PDF, vì đợt này chỉ đổi giao diện web, không đổi nội dung sách hay stylesheet xuất bản.

## Kiểm thử và tiêu chí hoàn tất

1. Chạy `node tools/sync-stats.mjs --check`, `node tools/check-refs.mjs --check` và `node tools/check-plain.mjs`; tất cả phải đạt.
2. Chạy `node tools/offline/build.mjs`; mở file tạo ra khi mạng bị ngắt, xác nhận font, search, lọc, tooltip và card vẫn hiển thị.
3. QA tại desktop 1440px, tablet 820px, mobile 375px và 320px. Không có tràn ngang; sidebar/drawer và card giữ được hierarchy.
4. Kiểm tra light/dark mode, trạng thái đã chọn, `:focus-visible`, phím `/`, chọn chip, reset lọc và URL query.
5. So sánh số lượng mục với bản trước: tổng 641, Grade A 424, bộ lọc ROI Very high 109 và Moderate 240. Việc làm mới không được đổi kết quả lọc.
6. Đo tương phản chữ và control ở cả hai theme. Chữ thường đạt tối thiểu 4.5:1; focus ring phải nhìn rõ trên nền cạnh bên.
7. Xác nhận favicon vẫn là dấu ✓ của dự án và không có logo/biểu tượng Claude trong trang hoặc đầu ra offline.

## Giả định và rủi ro

- Palette đất nung đã được duyệt qua mockup. Mã màu trong tài liệu là điểm xuất phát; phải kiểm tương phản thực tế và chỉ tinh chỉnh giá trị nếu cần để đạt WCAG AA.
- Cần xác minh file WOFF2 và giấy phép đi kèm trước khi thêm vào repo. Không dùng font riêng của Anthropic.
- Nhúng font có thể tăng kích thước file offline. Chỉ đưa các weight cần dùng vào bản build.
- Trang GitHub Pages lấy canonical URL hiện tại. Đợt UI này không chuyển domain, sitemap, SEO metadata hay các link nội dung.

## Bước tiếp theo

Sau khi chủ dự án duyệt tài liệu này, tạo implementation plan với các bước sửa, thứ tự kiểm thử và cập nhật offline build. Chưa sửa mã sản phẩm trong giai đoạn thiết kế.
