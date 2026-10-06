// Kiểm tra dòng「Nói dễ hiểu」: đây là đoạn hiển thị to nhất trên thẻ của trang
// tra cứu, phần lớn người đọc chỉ đọc mỗi dòng này.
// 2026-09-28 issue #42 phàn nàn văn phong đậm mùi AI, dẫn ví dụ phần 1 mục 33:
// một dòng chứa cả số bệnh viện, số ca bệnh, cách chia nhóm, còn dùng những
// cách nói kiểu "đầu kia", "đầu ra" bắt người đọc tự dịch lại.
// Đó đều là kiểu viết CLAUDE.md đã cấm từ lâu, chỉ là không có kiểm tra bằng
// máy nên viết một thời gian lại quay về.
//
//   node tools/check-plain.mjs            # liệt kê mọi "Nói dễ hiểu" không đạt, có thì exit code 1 (CI dùng)
//   node tools/check-plain.mjs --stat     # chỉ đếm theo từng rule
//   node tools/check-plain.mjs --numbers  # kiểm thêm mục ③, dùng để rà thủ công
//
// Mặc định kiểm ①②④, mục ③ phải thêm --numbers mới kiểm. Nó báo nhầm quá
// nhiều, không vào CI: số hotline (113, 115), số tiền ví dụ trong các mục
// luật và tiền bạc ("vay 1 triệu") đều bị tính là số mới, trong khi đó là
// cách viết hợp lệ.
// Kiểm bốn thứ:
// ① Độ dài: trong vòng 60 từ (đếm theo khoảng trắng).
// ② Jargon nghiên cứu: viết tắt thống kê, thiết kế nghiên cứu, cỡ mẫu.
//    Người đọc quan tâm hướng và độ lớn, không quan tâm ai làm, làm trên
//    bao nhiêu người.
// ③ Số mới: mỗi con số trong "Nói dễ hiểu" phải đã xuất hiện trong tiêu đề,
//    field Chi phí hoặc Lợi ích của cùng mục. "Nói dễ hiểu" chỉ dịch lại
//    field Lợi ích, không được thêm số. Cách viết số bằng chữ như "bốn phần
//    mười", "một phần tư" không kiểm.
// ④ Văn mơ hồ: ẩn dụ và sáo ngữ bắt người đọc tự dịch lại, danh sách ở VAGUE.
//    Chỉ thu từ đã từng gây lỗi thật, thà sót còn hơn báo nhầm — báo nhầm
//    nhiều thì không ai thèm đọc.
// Tách dòng bằng /\r?\n/, lý do xem comment đầu check-refs.mjs.
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const STAT = process.argv.includes('--stat');
const NUMBERS = process.argv.includes('--numbers');
const MAX = 60;

const JARGON = [
  [/\b(HR|RR|OR|CI|RCT)\b/, 'viết tắt thống kê'],
  [/đoàn hệ|tổng quan|tổng hợp|ngẫu nhiên|nhóm đối chứng|giả dược|mù đôi|cỡ mẫu|meta[- ]?analysis/i, 'thiết kế nghiên cứu'],
  [/\d[\d.,]*\s*(ca|người tham gia|bệnh viện|nghiên cứu|quốc gia)/i, 'cỡ mẫu'],
  [/nhóm đó|hai nhóm|mỗi nhóm/i, 'nhóm'],
];
const VAGUE = ['đầu kia', 'phía kia', 'đầu ra', 'nói chung là'];

// So số theo giá trị, không theo chữ viết: "0,28" và ".28", "11.523" và
// "11,5 nghìn" là cùng một số. Tiếng Việt: "." ngăn nghìn, "," thập phân
// (ngược tiếng Anh).
function numbers(s) {
  // "." ngăn nghìn có thể chồng nhau (1.130.040): một lượt replace chỉ gỡ
  // được cụm đầu vì match không chồng lấn, nên lặp tới khi chuỗi ngừng đổi.
  let t = s, prev;
  do { prev = t; t = t.replace(/(\d)\.(\d{3})/g, '$1$2'); } while (t !== prev);
  t = t.replace(/(\d),(\d)/g, '$1.$2');          // 86,5 → 86.5
  const mult = { 'tỷ': 1e9, 'triệu': 1e6, 'tr': 1e6, 'nghìn': 1e3, 'k': 1e3 };
  return [...t.matchAll(/(\d*\.?\d+)\s*(tỷ|triệu|tr|nghìn|k)?/gi)]
    .map(m => Number(m[1]) * (mult[(m[2] || '').toLowerCase()] || 1));
}
// n trong "Nói dễ hiểu" có được coi là dịch lại từ p trong Lợi ích không:
// làm tròn (45,6 → 46, 5801 → 5800), hoặc tỉ lệ rủi ro đổi thành mức giảm
// (0,72 → giảm 28%, 0,53 → giảm 47%). Lệch trong 5% đều tính.
function derived(n, p) {
  const near = (a, b) => a === b || Math.abs(a - b) <= 0.05 * Math.max(Math.abs(a), Math.abs(b));
  return near(n, p) || near(n / 100, p) || (p < 1 && near(n / 100, 1 - p)) || (p > 1 && p < 100 && near(n, 100 - p));
}

const bad = [];
const count = { 'độ dài': 0, jargon: 0, 'số mới': 0, 'mơ hồ': 0 };
let total = 0;

const files = readdirSync(resolve(ROOT, 'book')).filter(f => /^\d\d-.*\.md$/.test(f)).sort();
for (const f of files) {
  const sec = Number(f.slice(0, 2));
  // normalize NFC: file markdown viết bằng công cụ khác nhau có thể lưu dấu
  // tiếng Việt dạng tổ hợp (NFD), nếu không chuẩn hóa thì nhãn "Nói dễ hiểu"
  // khớp trật và tool âm thầm bỏ qua toàn bộ mục.
  const lines = readFileSync(resolve(ROOT, 'book', f), 'utf8').normalize('NFC').split(/\r?\n/);
  let no = 0, title = '', fields = {};
  const flush = () => {
    const plain = fields['Nói dễ hiểu'];
    if (!no || plain == null) return;
    total++;
    const where = `phần ${sec}, mục ${no}`;
    const problems = [];
    const len = plain.trim().split(/\s+/).length;
    if (len > MAX) { problems.push(`${len} từ, vượt quá ${MAX}`); count['độ dài']++; }
    const jar = JARGON.filter(([re]) => re.test(plain)).map(([re, name]) => `${name} "${plain.match(re)[0]}"`);
    if (jar.length) { problems.push(...jar); count.jargon++; }
    if (NUMBERS) {
      const pool = numbers([title, fields['Chi phí'] ?? '', fields['Lợi ích'] ?? ''].join(' '));
      const fresh = [...new Set(numbers(plain))].filter(n => !pool.some(p => derived(n, p)));
      if (fresh.length) { problems.push(`số không có trong tiêu đề/Chi phí/Lợi ích: ${fresh.join(', ')}`); count['số mới']++; }
    }
    const vague = VAGUE.filter(w => plain.toLowerCase().includes(w));
    if (vague.length) { problems.push(`cách nói mơ hồ "${vague.join('", "')}"`); count['mơ hồ']++; }
    if (problems.length) bad.push(`${f}  ${where}: ${problems.join('; ')}`);
  };
  for (const line of lines) {
    const h = line.match(/^### (\d+)\. (.*)$/);
    if (h) { flush(); no = Number(h[1]); title = h[2]; fields = {}; continue; }
    const m = line.match(/^- (Nói dễ hiểu|Chi phí|Lợi ích|Ghi chú):\s*(.*)$/);
    if (m && no) fields[m[1]] = m[2];
  }
  flush();
}

if (!STAT) for (const b of bad) console.log(b);
console.log(`\n"Nói dễ hiểu" tổng ${total} dòng, không đạt ${bad.length}:` +
  Object.entries(count).map(([k, v]) => `${k} ${v}`).join(', '));
if (bad.length && !STAT) process.exit(1);
