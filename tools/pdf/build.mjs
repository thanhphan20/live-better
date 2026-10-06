// Xếp README + book/*.md + docs/*.md thành một cuốn PDF: pandoc chuyển
// Markdown sang typst, typst dàn trang.
// Dùng: node tools/pdf/build.mjs [đường dẫn output]   mặc định dist/HowToLiveBetter.pdf
// Cần pandoc (≥3.1, có output typst) và typst (≥0.13) trong PATH, hoặc chỉ
// đường dẫn qua biến môi trường PANDOC, TYPST.
// Layout nằm ở tools/pdf/template.typ; nội dung không đổi một chữ, chỉ làm
// ba việc: bỏ «← Mục lục», gắn anchor cho heading của từng phần, đổi link
// trong repo thành nhảy nội bộ trong sách hoặc URL GitHub.
import { writeFileSync, mkdirSync, statSync } from 'node:fs';
import { resolve, dirname, posix, basename } from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT, REPO, SITE, TITLE, read, readBook, gitCommit, buildStamp, stripBackLink } from '../lib/book.mjs';

const OUT = resolve(ROOT, process.argv[2] ?? 'dist/HowToLiveBetter.pdf');
const WORK = resolve(ROOT, 'dist/pdf-build.md');
const PANDOC = process.env.PANDOC ?? 'pandoc';
const TYPST = process.env.TYPST ?? 'typst';
const STAMP = buildStamp();          // «(giờ Việt Nam)» viết trong template và trang thông tin phiên bản, giá trị truyền cho pandoc giữ nguyên ASCII
const COMMIT = gitCommit();

const { description, frontMd, contentsMd, bookFiles, docFiles } = readBook();

// ---------- Trang (mỗi trang một heading cấp 1, heading cấp 1 trong typst ngắt trang mới) ----------
const anchorOf = new Map();
bookFiles.forEach(f => anchorOf.set(f, 'sec-' + (basename(f).match(/^\d+/)?.[0] ?? anchorOf.size + 1)));
docFiles.forEach((f, i) => anchorOf.set(f, `doc-${i + 1}`));

const pages = [
  { src: 'README.md', md: `# Lời nói đầu\n\n${description}\n\n${frontMd}`, anchor: 'front' },
  { src: 'README.md', md: contentsMd.replace(/^## Mục lục/, '# Giới thiệu các phần'), anchor: 'contents' },
  ...[...bookFiles, ...docFiles].map(src => ({ src, md: stripBackLink(read(src)), anchor: anchorOf.get(src) })),
  { src: 'README.md', md: aboutMd(), anchor: 'about' },
];

function aboutMd() {
  const commitLine = COMMIT ? `- Bản nội dung tương ứng: ${COMMIT.slice(0, 7)}\n` : '';
  return `# Thông tin phiên bản

Cuốn PDF này được dàn trang tự động từ nội dung Markdown trong repo; nội dung đổi là dàn lại một bản mới. Bản bạn đang cầm:

- Thời điểm tạo: ${STAMP} (giờ Việt Nam)
${commitLine}- Tải bản mới nhất, tra cứu online, góp ý: ${REPO}
- Trang tra cứu online (lọc theo từ khóa, phần, mức chứng cứ và chi phí, cũng lưu được thành một file xem offline): ${SITE}

Các link trong nội dung trỏ tới phần khác của sách đã đổi thành nhảy nội bộ; link trỏ tới ghi chép kiểm chứng, giấy phép — những file không dàn vào sách — đã đổi thành URL GitHub.

Nội dung phát hành theo CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Có thể đăng lại, chuyển thể, dùng thương mại; phải ghi nguồn «Cẩm nang sống đáng giá» kèm link repo, nội dung đã sửa phải ghi chú là đã sửa.`;
}

// ---------- Link: trong sách đổi thành anchor, ngoài sách đổi thành URL tuyệt đối ----------
function rewriteLinks(md, src) {
  return md.replace(/\]\(([^)\s]+)(\s+"[^"]*")?\)/g, (all, href, title) => {
    if (/^(https?:|mailto:)/.test(href)) return all;
    // Anchor trỏ tới mục của chính README (kiểu #mục-lục) trong sách chưa chắc
    // có, trỏ ngược về README trên GitHub
    if (href.startsWith('#')) return `](${REPO}/blob/main/README.md${href}${title ?? ''})`;
    const [path] = href.split('#');
    const target = posix.normalize(posix.join(posix.dirname(src), path));
    const anchor = anchorOf.get(target);
    if (anchor) return `](#${anchor}${title ?? ''})`;
    const kind = target.endsWith('/') ? 'tree' : 'blob';
    return `](${REPO}/${kind}/main/${target}${title ?? ''})`;
  });
}

const body = pages.map(p => {
  const md = rewriteLinks(p.md, p.src)
    .replace(/<!--[\s\S]*?-->/g, '')                       // comment HTML kiểu tag chi phí không vào PDF
    .replace(/^(# .+?)\s*$/m, `$1 {#${p.anchor}}`);        // gắn anchor cho heading cấp 1 của trang này
  if (!md.includes(`{#${p.anchor}}`)) throw new Error(`không tìm thấy heading cấp 1 trong ${p.src}, không gắn được anchor`);
  return md.trim();
}).join('\n\n');

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(WORK, body);

// ---------- pandoc → typst → pdf ----------
const run = (cmd, args) => {
  try {
    return execFileSync(cmd, args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (err) {
    if (err.code === 'ENOENT') throw new Error(`không tìm thấy ${cmd}, cài nó hoặc chỉ đường dẫn tới file chạy qua biến môi trường ${cmd === PANDOC ? 'PANDOC' : 'TYPST'}`);
    throw new Error(`${cmd} thất bại:\n${err.stderr || err.stdout || err.message}`);
  }
};

const typFile = resolve(ROOT, 'dist/pdf-build.typ');
run(PANDOC, [
  '--from=gfm+attributes', '--to=typst', '--wrap=none',
  `--template=${resolve(ROOT, 'tools/pdf/template.typ')}`,
  '-V', `booktitle=${TITLE}`, '-V', `subtitle=${description}`,
  '-V', `builddate=${STAMP}`, '-V', `commit=${COMMIT.slice(0, 7) || 'không rõ'}`,
  '-V', `site=${SITE}`, '-V', `repo=${REPO}`,
  '-o', typFile, WORK,
]);
const log = run(TYPST, ['compile', typFile, OUT, '--root', ROOT]);
if (log.trim()) console.log(log.trim());

const entries = pages.filter(p => bookFiles.includes(p.src))
  .reduce((n, p) => n + p.md.split('\n').filter(l => l.startsWith('### ')).length, 0);
console.log(`Đã tạo ${OUT}: ${bookFiles.length} phần ${entries} mục, phụ lục ${docFiles.length} bài, ${(statSync(OUT).size / 1048576).toFixed(1)} MB`);
