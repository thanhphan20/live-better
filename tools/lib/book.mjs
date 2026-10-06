// Phân tích cấu trúc README và lấy danh sách file: dùng chung cho hai bộ build
// EPUB (tools/epub) và PDF (tools/pdf). Chỉ đọc cấu trúc trong README, không
// duy trì danh sách file riêng — thêm một phần hay một bài dài, cả hai bộ
// build tự động theo kịp.
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const REPO = 'https://github.com/chuanman2707/HowToLiveBetter';
export const SITE = 'https://chuanman2707.github.io/HowToLiveBetter/';
export const TITLE = 'Cẩm nang sống đáng giá';
export const RELEASE = `${REPO}/releases/download/epub-latest`;

// Luôn chuẩn hóa về LF trước khi đưa cho các bộ build: trên Windows với
// core.autocrlf=true thì checkout ra CRLF, script bản offline đem needle viết
// bằng '\n' đi tìm trong index.html sẽ không trúng neo nào, build local báo
// lỗi «không tìm thấy điểm đầu của script chính» (CI chạy Linux nên chưa từng
// gặp). Phần parse nội dung cũng khỏi phải tự xử \r.
export const read = p => readFileSync(resolve(ROOT, p), 'utf8').replace(/\r\n/g, '\n');
export const unique = arr => [...new Set(arr)];

export function gitCommit() {
  try {
    return execSync('git rev-parse HEAD', { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return process.env.GITHUB_SHA ?? '';
  }
}

// Nội dung một ngày có thể sửa nhiều lần, chỉ ghi ngày không phân biệt được là
// bản nào, nên chính xác tới phút. CI chạy trên UTC, quy về giờ Việt Nam hết
// để người tải không lệch ngày theo múi giờ của mình.
export function buildStamp() {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh', dateStyle: 'short', timeStyle: 'short' }).format(new Date());
}

export function stripBackLink(md) {
  return md.replace(/^\[← Mục lục\]\([^)]*\)\s*\n/, '');
}

// Đoạn trong README nằm giữa một heading và heading kế tiếp
export function readBook() {
  const readme = read('README.md');
  const lines = readme.split('\n');
  const between = (from, to) => {
    const a = lines.findIndex(l => l.startsWith(from));
    const b = lines.findIndex((l, i) => i > a && l.startsWith(to));
    if (a < 0 || b < 0) throw new Error(`không tìm thấy đoạn từ ${from} tới ${to} trong README`);
    return lines.slice(a, b).join('\n');
  };
  const description = between('# Cẩm nang sống đáng giá', '[![')
    .split('\n').slice(1).map(l => l.replace(/<[^>]+>/g, '').trim()).filter(Boolean).join('');
  const frontMd = between('## Cuốn sách này trả lời những câu hỏi nào', '## Mục lục');
  const contentsMd = between('## Mục lục', '## Nội dung')
    .split('\n\n').filter(p => !p.includes('index.html')).join('\n\n');
  const bookFiles = unique([...contentsMd.matchAll(/\]\((book\/[^)#]+\.md)\)/g)].map(m => m[1]));
  const docFiles = unique([...readme.matchAll(/\]\((docs\/[^)#/]+\.md)\)/g)].map(m => m[1]));
  if (bookFiles.length === 0) throw new Error('mục lục README không có file book/ nào');
  return { readme, description, frontMd, contentsMd, bookFiles, docFiles };
}
