$--
$-- Template typst cho pandoc (chỉ nhận $body$ và vài biến -V), không dùng
$-- conf() có sẵn của pandoc: template mặc định khóa page setup trong conf(),
$-- không sửa được header/footer, nên ở đây tự dàn.
$-- Đoạn từ đầu tới divider là các định nghĩa phụ trợ mà nội dung pandoc sinh
$-- ra cần, chép nguyên từ `pandoc -D typst`, đừng xóa.
$--
#set terms(hanging-indent: 1.5em)

#set table(inset: 6pt, stroke: none)
// pandoc nhét bảng vào align(center), ô sẽ bị căn giữa theo; bảng chữ Việt căn trái mới dễ đọc
#show table.cell: it => align(left, it)

#let horizontalRule = line(start: (25%, 0%), end: (75%, 0%))
#let divider = if "divider" in std { divider } else { horizontalRule }

#show figure.where(kind: table): set figure.caption(position: top)
#show figure.where(kind: image): set figure.caption(position: bottom)
// Bảng dài phải được ngắt trang, không thì nguyên khối không vừa sẽ chừa cả trang trắng
#show figure: set block(breakable: true)
#set smartquote(enabled: false)

// ---------- Layout ----------
#set document(title: "$booktitle$", author: "Long Trịnh (dịch)")
#set text(
  // Latin dùng Libertinus có sẵn của typst, tiếng Việt tìm theo mức có sẵn:
  // trên CI là Noto (fonts-noto), trên máy là Segoe UI/Arial — đủ dấu tiếng Việt
  font: ("Libertinus Serif", "Noto Serif", "Noto Sans", "Segoe UI", "Arial"),
  size: 10.5pt, lang: "vi",
)
#set par(justify: false, leading: 0.78em, spacing: 0.9em)
#set list(indent: 0.6em, spacing: 0.75em)
#show raw: set text(font: ("DejaVu Sans Mono", "Noto Sans Mono", "Consolas"), size: 9pt)
#show link: set text(fill: rgb("#1a4fb4"))
#show heading: set block(sticky: true, above: 1.5em, below: 0.65em)
#show heading.where(level: 1): set text(19pt)
#show heading.where(level: 2): set text(14pt)
#show heading.where(level: 3): set text(11.5pt)
// Mỗi phần ngắt sang trang mới; weak bảo đảm khi trang trước vừa khít thì không dư ra một trang trắng
#show heading.where(level: 1): it => { pagebreak(weak: true); it }

// Header: trái là tên sách, phải là tên phần đang đọc; trang đầu của một phần không in header
#let running-head = context {
  let next = query(selector(heading.where(level: 1)).after(here())).at(0, default: none)
  if next != none and next.location().page() == here().page() { return }
  let seen = query(selector(heading.where(level: 1)).before(here()))
  if seen.len() == 0 { return }
  set text(8.5pt, fill: luma(120))
  grid(columns: (1fr, auto), align(left)[$booktitle$], align(right)[#seen.last().body])
  v(-7pt)
  line(length: 100%, stroke: 0.4pt + luma(215))
}

// ---------- Bìa ----------
#set page(paper: "a4", margin: (x: 2.2cm, top: 2.2cm, bottom: 2cm), header: none, footer: none)
#align(center + horizon)[
  #image("/og.png", width: 100%)
  #v(1.2cm)
  #block(width: 80%)[#text(11.5pt, fill: luma(60))[$subtitle$]]
  #v(1.2cm)
  #text(12pt)[Dịch giả: Long Trịnh]
  #v(0.8cm)
  #text(10pt, fill: luma(90))[
    Tạo lúc $builddate$ (giờ Việt Nam)　·　nội dung ở commit $commit$ \
    Nội dung cập nhật mỗi ngày, lấy bản online làm chuẩn: $site$ \
    Tra cứu online, bản EPUB và bản PDF mới nhất đều ở $repo$
  ]
]

// ---------- Mục lục ----------
#pagebreak()
#outline(title: [Mục lục], depth: 1, indent: 1em)

// ---------- Nội dung ----------
#pagebreak(weak: true)
#set page(header: running-head, footer: context align(center, text(8.5pt, fill: luma(120))[#counter(page).at(here()).first() / #counter(page).final().first()]))
#counter(page).update(1)

$body$
