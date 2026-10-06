// Đồng bộ số liệu: sửa mục xong chạy một lần. Theo thứ tự làm bốn việc:
// ① Tính lại các con số thống kê của cả sách, ghi lại vào README.md, index.html, tools/og.html;
// ② Gọi check-refs.mjs tính lại docs/bang-doi-chieu-trich-dan.md;
// ③ Gọi check-plain.mjs kiểm tra Nói dễ hiểu, không đạt chỉ nhắc chứ không ngắt;
// ④ Dùng Chrome headless chụp lại tools/og.html thành og.png.
//
//   node tools/sync-stats.mjs                   # làm hết
//   node tools/sync-stats.mjs --no-screenshot   # không chụp ảnh
//   node tools/sync-stats.mjs --check           # chỉ so sánh ① không ghi, có số đã cũ thì exit code 1 (dùng cho CI)
//
// Chrome được tìm theo các vị trí cài đặt thường gặp, cài ở chỗ khác thì đặt biến môi
// trường CHROME trỏ tới file chạy.
// og.html dùng font Microsoft YaHei, Linux không có sẽ đổi sang font khác, ảnh chụp
// ra sẽ khác với trên Windows; CI chỉ chạy --check không chụp, cũng vì lý do này.
//
// 2026-09-29 port từ sync-stats.ps1 sang, ps1 đã xóa: nó chỉ chạy trên Windows,
// PR bên ngoài merge trực tiếp trên web hoàn toàn không đi qua nó, số liệu cũ cũng
// không có kiểm tra nào báo đỏ.
// ① chỉ thay chính con số, không động vào chữ khác.
// Cách đếm: số mục = số tiêu đề ### trong book/*.md; số phần = số file book/*.md;
// A/B/C = chữ cái sau「Mức chứng cứ:」(dòng có kèm tranh cãi vẫn tính); tranh cãi =
// số mục mà Ghi chú bắt đầu bằng「Tranh cãi」; TODO = số dòng chứa「Cần xác minh」
// hoặc「TODO」; link = tổng số http(s) trong các dòng「- Nguồn:」và「- Ghi chú:」;
// TQ = số mục mà Ghi chú bắt đầu bằng「Chỉ tham khảo TQ」;
// ba mức hiệu quả chi phí theo quy tắc chép từ index.html.
// Tách dòng bằng /\r?\n/, lý do xem đầu file check-refs.mjs.
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdtempSync, rmSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
const read = f => readFileSync(join(ROOT, f), 'utf8');

// Quy tắc mức giống hai dòng COST_W, e.ratio trong index.html; hai dòng đó đổi thì
// đây phải đổi theo, nên so sánh trước một lần
const indexText = read('index.html');
const COST_W_LINE = "const COST_W = { money:{'0':0,'it':1,'nhieu':2}, time:{'it':0,'vua':1,'nhieu':2}, will:{'khong':0,'chut':1,'nhieu':2} };";
const RATIO_LINE = "    e.ratio = e.level === 'lon' ? (e.cs === 0 ? 'Cực cao' : (e.cs <= 2 ? 'Cao' : 'Trung bình'))";
if (!indexText.includes(COST_W_LINE)) throw new Error('Dòng COST_W trong index.html đã đổi, hãy đồng bộ trọng số chi phí trong script này');
if (!indexText.includes(RATIO_LINE)) throw new Error('Dòng e.ratio trong index.html đã đổi, hãy đồng bộ quy tắc mức trong script này');

const W = {
  money: { '0': 0, 'it': 1, 'nhieu': 2 },
  time: { 'it': 0, 'vua': 1, 'nhieu': 2 },
  will: { 'khong': 0, 'chut': 1, 'nhieu': 2 },
};

function ratioOf(cost, level) {
  if (level === 'lon') return cost === 0 ? 'Cực cao' : cost <= 2 ? 'Cao' : 'Trung bình';
  return level === 'vua' && cost === 0 ? 'Cao' : 'Trung bình';
}

const ORDER = ['Cực cao', 'Cao', 'Trung bình'];

const bookFiles = readdirSync(join(ROOT, 'book')).filter(f => f.endsWith('.md')).sort();
const sections = bookFiles.length;
let entries = 0, dispute = 0, todo = 0, links = 0, tqCount = 0;
const grade = { A: 0, B: 0, C: 0 };
const ratio = { 'Cực cao': 0, 'Cao': 0, 'Trung bình': 0 };

for (const f of bookFiles) {
  for (const line of read(join('book', f)).split(/\r?\n/)) {
    if (line.startsWith('### ')) entries++;
    const g = line.match(/^- Mức chứng cứ:\s*([ABC])/);
    if (g) grade[g[1]]++;
    if (/^- Ghi chú:\s*(?:Chỉ tham khảo TQ[:：]\s*)?Tranh cãi/.test(line)) dispute++;
    if (/Cần xác minh|TODO/.test(line)) todo++;
    if (/^- (Nguồn|Ghi chú):\s*/.test(line)) links += (line.match(/https?:\/\//g) ?? []).length;
    if (/^- Ghi chú:\s*Chỉ tham khảo TQ/.test(line)) tqCount++;
    const t = line.match(/<!--\s*nhan-chi-phi:\s*tien=(\S+)\s+thoi-gian=(\S+)\s+y-chi=(\S+)\s+loi-ich=(\S+)\s+quy-mo=/);
    if (t) ratio[ratioOf(W.money[t[1]] + W.time[t[2]] + W.will[t[3]], t[4])]++;
  }
}

const tagged = ratio['Cực cao'] + ratio['Cao'] + ratio['Trung bình'];
if (tagged !== entries) console.warn(`Cảnh báo: có ${entries - tagged} mục thiếu tag nhan-chi-phi, ba mức hiệu quả chi phí không khớp số mục`);
if (grade.A + grade.B + grade.C !== entries) console.warn('Cảnh báo: số dòng Mức chứng cứ không khớp số mục, kiểm tra có mục nào quên ghi Mức chứng cứ không');

// Phần trăm ba mức phân bổ theo phương pháp số dư lớn nhất: lấy phần nguyên trước,
// phần trăm còn thiếu bù theo phần thập phân từ lớn xuống nhỏ.
// Ba số mỗi cái tự làm tròn sẽ ra 99 hoặc 101 (gặp khi thêm phần 33 ngày 2026-09-21),
// ở đây bảo đảm cộng lại đúng 100.
const pct = {}, rem = {};
for (const k of ORDER) {
  const exact = ratio[k] * 100 / entries;
  pct[k] = Math.floor(exact);
  rem[k] = exact - pct[k];
}
const short = 100 - ORDER.reduce((s, k) => s + pct[k], 0);
for (const k of [...ORDER].sort((a, b) => rem[b] - rem[a]).slice(0, Math.max(short, 0))) pct[k]++;

console.log(`Mục ${entries} ｜ phần ${sections} ｜ A ${grade.A} B ${grade.B} C ${grade.C} ｜ tranh cãi ${dispute} ｜ TODO ${todo} ｜ link ${links} ｜ TQ ${tqCount}`);
console.log(`Hiệu quả chi phí: cực cao ${ratio['Cực cao']} (${pct['Cực cao']}%) cao ${ratio['Cao']} (${pct['Cao']}%) trung bình ${ratio['Trung bình']} (${pct['Trung bình']}%)`);
console.log('');

const EDITS = [
  // README.md lúc này vẫn là bản TQ; các mẫu README dưới đây khớp sau khi Task 42
  // viết README tiếng Việt. Task 42 bắt buộc dùng đúng các mẫu đã pin ở đây,
  // sai mẫu thì script báo không tìm thấy.
  ['README.md', 'số mục dòng giới thiệu', /(\d+) mục lời khuyên/g, `${entries} mục lời khuyên`], // khớp sau khi Task 42 viết README
  // badge shields URL-encoded, nhãn ASCII không dấu "muc-N%20muc"
  ['README.md', 'badge số mục', /muc-(\d+)%20muc/g, `muc-${entries}%20muc`], // khớp sau khi Task 42 viết README
  ['README.md', 'badge mức chứng cứ', /A%20(\d+)%20%C2%B7%20B%20\d+%20%C2%B7%20C%20\d+/g, `A%20${grade.A}%20%C2%B7%20B%20${grade.B}%20%C2%B7%20C%20${grade.C}`], // khớp sau khi Task 42 viết README
  ['README.md', 'badge link nguồn', /(\d+)%20link%20nguon/g, `${links}%20link%20nguon`], // khớp sau khi Task 42 viết README — README phải dùng mẫu badge "N%20link%20nguon"
  ['README.md', 'câu phân hạng chứng cứ', /Trong (\d+) mục[^.]*A [\d,]+[^.]*B [\d,]+[^.]*C [\d,]+[^.]*/g,
    `Trong ${entries} mục: A ${grade.A} · B ${grade.B} · C ${grade.C}, có ${dispute} mục đánh dấu tranh cãi, ${todo} chỗ cần xác minh`], // khớp sau khi Task 42 viết README — Task 42 bắt buộc viết đúng mẫu này
  ['README.md', 'câu hiệu quả chi phí', /Trong (\d+) mục[^.]*hiệu quả[^.]*/g,
    `Trong ${entries} mục theo hiệu quả chi phí: cực cao ${ratio['Cực cao']} (${pct['Cực cao']}%), cao ${ratio['Cao']} (${pct['Cao']}%), trung bình ${ratio['Trung bình']} (${pct['Trung bình']}%)`], // khớp sau khi Task 42 viết README — chuỗi thay phải chứa "hiệu quả" để --check lần sau vẫn khớp
  ['README.md', 'số file markdown', /(\d+) file markdown/g, `${sections} file markdown`], // khớp sau khi Task 42 viết README (nếu README VN có câu này)
  ['index.html', 'meta/JSON-LD mô tả', /(\d+) mục lời khuyên/g, `${entries} mục lời khuyên`],
  ['index.html', 'numberOfPages', /numberOfPages":(\d+)/g, `numberOfPages":${entries}`],
  ['index.html', 'số phần/mục đầu trang', /(\d+) phần (\d+) mục/g, `${sections} phần ${entries} mục`],
  ['index.html', 'số file chân trang', /từ (\d+) file/g, `từ ${sections} file`],
  ['tools/og.html', 'og số mục', /<b>(\d+)<\/b> mục lời khuyên/g, `<b>${entries}</b> mục lời khuyên`],
  ['tools/og.html', 'og số mục chứng cứ A', /Chứng cứ A <b>(\d+)<\/b> mục/g, `Chứng cứ A <b>${grade.A}</b> mục`],
  ['tools/og.html', 'og số link nguồn', /<b>(\d+)<\/b> link nguồn sơ cấp/g, `<b>${links}</b> link nguồn sơ cấp`],
];

const texts = new Map();
const stale = [];
for (const [file, label, pattern, repl] of EDITS) {
  const text = texts.get(file) ?? read(file);
  const found = [...text.matchAll(pattern)];
  if (found.length === 0) throw new Error(`Không tìm thấy「${label}」trong ${file}, mẫu: ${pattern}`);
  const old = found[0][1];
  // Dùng hàm làm giá trị thay thế, tránh $ trong chuỗi thay bị hiểu thành tham chiếu nhóm
  const updated = text.replace(pattern, () => repl);
  texts.set(file, updated);
  if (updated === text) {
    console.log(`  ${file} ${label}: ${old} (không đổi)`);
    continue;
  }
  stale.push(`${file} ${label}`);
  console.log(`  ${file} ${label}: ${old} -> ${CHECK ? 'đã cũ' : `đã cập nhật (${found.length} chỗ)`}`);
}

if (CHECK) {
  if (stale.length === 0) {
    console.log('\nSố liệu thống kê đã khớp');
    process.exit(0);
  }
  console.log(`\nCó ${stale.length} chỗ số liệu đã cũ. Chạy node tools/sync-stats.mjs ở máy (đồng thời xuất lại og.png) rồi commit.`);
  process.exit(1);
}

for (const [file, text] of texts) if (text !== read(file)) writeFileSync(join(ROOT, file), text);

// ② Tính lại bảng đối chiếu trích dẫn chéo: thêm hoặc xóa mục làm các「mục X」phía sau
// dồn số hàng loạt, mà số bị dồn thường vẫn nằm trong khoảng (6 chỗ ở phần 7 ngày
// 2026-09-19 là vậy), chỉ khi trải「trích dẫn → tiêu đề đích」ra file thì diff mới
// nhìn thấy. Đặt trước phần chụp ảnh, --no-screenshot cũng phải chạy tới
const runTool = name => spawnSync(process.execPath, [join(ROOT, 'tools', name)], { stdio: 'inherit' }).status;
console.log('');
if (runTool('check-refs.mjs') !== 0) throw new Error('check-refs.mjs thất bại');
console.log('Trước khi commit lướt qua diff của docs/bang-doi-chieu-trich-dan.md: số mục không đổi mà cột「mục trỏ tới」đổi, tức trích dẫn bị dồn lệch.');

// ③ Kiểm tra Nói dễ hiểu chỉ nhắc không ngắt: số liệu đã đồng bộ xong, kẹt ở đây
// người đọc lại tưởng thống kê chưa cập nhật. Trong CI nó sẽ báo đỏ
console.log('');
if (runTool('check-plain.mjs') !== 0) console.log('Các chỗ Nói dễ hiểu không đạt liệt kê ở trên, sửa trước khi commit (quy tắc xem đầu file tools/check-plain.mjs).');

if (process.argv.includes('--no-screenshot')) process.exit(0);

// ④ Chụp og.png
const CHROME_PATHS = [
  process.env.CHROME,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
];
const chrome = CHROME_PATHS.find(p => p && existsSync(p));
if (!chrome) throw new Error('Không tìm thấy Chrome, đặt biến môi trường CHROME trỏ tới nó, hoặc thêm --no-screenshot để bỏ qua chụp ảnh');

// Mỗi lần dùng một user-data-dir mới tinh: nếu không Chrome sẽ render og.html trong
// cache, ảnh chụp ra vẫn là số cũ.
// --screenshot bắt buộc đường dẫn tuyệt đối: cho đường dẫn tương đối Chrome không
// ghi gì mà vẫn trả về 0
const profile = mkdtempSync(join(tmpdir(), 'og-shot-'));
const target = join(ROOT, 'og.png');
const startedAt = Date.now();
// Chrome ghi thông tin kiểu "xxx bytes written" ra stderr, không phải lỗi, bỏ đi
spawnSync(chrome, [
  '--headless', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
  '--window-size=1200,630', `--user-data-dir=${profile}`, `--screenshot=${target}`,
  pathToFileURL(join(ROOT, 'tools', 'og.html')).href,
], { stdio: 'ignore' });
rmSync(profile, { recursive: true, force: true });

// Tự kiểm: file là lần chạy này ghi, kích thước nằm trong khoảng bình thường. Qua hai
// cửa này thì không cần mở ảnh xem nữa, tiết kiệm một lần đọc ảnh
const png = statSync(target);
if (png.mtimeMs < startedAt - 1000) throw new Error('og.png không được ghi trong lần chạy này, chụp ảnh thất bại');
if (png.size < 120 * 1024 || png.size > 400 * 1024) throw new Error(`og.png kích thước bất thường (${png.size} byte), bình thường trong khoảng 120KB tới 400KB, mở ra xem có bị render hỏng không`);
console.log(`\nĐã xuất lại og.png: ${png.size} byte, tự kiểm đạt. Chỉ khi đổi layout của tools/og.html mới cần mở ảnh kiểm tra.`);
