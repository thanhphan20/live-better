// Đóng index.html + README + book/*.md thành một file HTML tự chứa: double
// click là xem, không cần server, không cần mạng.
// Dùng: node tools/offline/build.mjs [đường dẫn output]   mặc định dist/HowToLiveBetter.html
// Nội dung nhúng vào window.__CORPUS__, init() của index.html thấy biến này
// là không fetch nữa; link tương đối trong site đổi thành địa chỉ online, các
// phần còn lại giữ nguyên từng chữ.
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { ROOT, REPO, SITE, read, gitCommit, buildStamp } from '../lib/book.mjs';

const OUT = resolve(ROOT, process.argv[2] ?? 'dist/HowToLiveBetter.html');
const STAMP = buildStamp();
const COMMIT = gitCommit();

// ---------- Nội dung ----------
const readme = read('README.md');
const files = [...new Set([...readme.matchAll(/\]\((book\/[^)]+\.md)\)/g)].map(m => m[1]))].sort();
if (!files.length) throw new Error('mục lục README không có file book/ nào, bản offline sẽ rỗng');
// Bài dài (docs/*.md) cũng phải đem theo: popup bài dài của trang tra cứu render
// ngay tại chỗ, bản offline thiếu chúng thì chỉ còn một link GitHub không mở
// được. Danh sách lấy từ README, cùng một chỗ với hai bộ build EPUB và PDF.
const docs = [...new Set([...readme.matchAll(/\]\((docs\/[^)#/]+\.md)\)/g)].map(m => m[1]))].sort();
const corpus = {
  readme,
  parts: Object.fromEntries(files.map(f => [f, read(f)])),
  docs: Object.fromEntries(docs.map(f => [f, read(f)])),
};
// </script sẽ đóng thẻ script sớm; \/ trong chuỗi JS chính là /, nội dung không đổi
const corpusJson = JSON.stringify(corpus).replace(/<\/script/gi, '<\\/script');

// ---------- Trang ----------
let html = read('index.html');
const must = (needle, label) => {
  if (!html.includes(needle)) throw new Error(`không tìm thấy ${label} trong index.html, script bản offline phải sửa theo: ${needle}`);
};

// Đoạn thống kê không đi theo bản offline: bản sao người khác double click mở
// không nên bắn request ra ngoài, mất mạng còn phải chờ timeout
const GA_START = '<!-- ga:start', GA_END = '<!-- ga:end -->';
must(GA_START, 'marker đầu đoạn GA');
must(GA_END, 'marker cuối đoạn GA');
html = html.slice(0, html.indexOf(GA_START)) + html.slice(html.indexOf(GA_END) + GA_END.length);
// Chỉ quét domain ngoài: track() trong script chính có guard typeof, không có
// gtag vẫn chạy, không tính là sót lại
if (/googletagmanager|google-analytics/.test(html)) throw new Error('sau khi bóc nội dung giữa hai marker vẫn còn sót domain thống kê, bản offline sẽ bắn request ra ngoài');

// Link tương đối mở ở local là link chết, đổi thành địa chỉ online
must('href="README.md"', 'link README.md');
must('href="book/"', 'link book/');
html = html
  .replaceAll('href="README.md"', `href="${REPO}/blob/main/README.md"`)
  .replaceAll('href="book/"', `href="${REPO}/tree/main/book"`)
  .replaceAll('<a class="title" href="./"', `<a class="title" href="${SITE}"`);

// Footer ghi chú đây là bản offline của phiên bản nào
const foot = '<div class="foot">';
must(foot, 'footer');
const commitNote = COMMIT ? `, nội dung ở commit ${COMMIT.slice(0, 7)}` : '';
html = html.replace(foot, `${foot}Bản offline, tạo lúc ${STAMP} (giờ Việt Nam)${commitNote}; nội dung tiếp tục cập nhật, lấy <a href="${SITE}">bản online</a> làm chuẩn.<br>`);

// Nội dung phải có sẵn trước script chính
const mainScript = '\n<script>\n/* ---------- Bảng debug';
must(mainScript, 'điểm đầu của script chính');
html = html.replace(mainScript, `\n<script>window.__CORPUS__=${corpusJson}</script>${mainScript}`);

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, html);
const kb = n => (n / 1024 | 0) + ' KB';
console.log(`Đã tạo ${OUT}: ${files.length} file nội dung, ${docs.length} bài dài, ${kb(Buffer.byteLength(html))} (trong đó nội dung ${kb(Buffer.byteLength(corpusJson))})`);
