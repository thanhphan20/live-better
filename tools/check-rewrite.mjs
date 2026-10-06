// So sánh chữ ký cấu trúc + con số của một file book/ trước và sau khi viết lại
// giọng. Phục vụ đợt refactor giọng văn 2026-10 (spec
// docs/superpowers/specs/2026-10-03-giong-van-nguoi-thay-design.md): câu chữ được
// viết lại, nhưng cấu trúc mục, field, nguồn, con số, marker phải nguyên.
//
//   node tools/check-rewrite.mjs book/22-thu-gian-the-nao.md          # so với HEAD
//   node tools/check-rewrite.mjs book/22-thu-gian-the-nao.md <ref>    # so với ref khác
//
// Chạy khi bản viết lại đang ở working tree chưa commit. Lỗi → exit 1, in từng
// chỗ lệch. Sạch → exit 0.
//
// Kiểm:
//   ① line ending: kiểu của file (LF / CRLF / lẫn) giữ nguyên
//   ② dòng "[← Mục lục]" và "# N. Tên phần" giữ nguyên từng chữ
//   ③ dãy số mục ### N. giữ nguyên; tiêu đề cũ phải là subsequence của tiêu đề
//     mới (chỉ được thêm từ, không bớt/đổi — anchor của check-refs.mjs)
//   ④ mỗi mục: dãy field (tên + thứ tự) giống hệt; "Mức chứng cứ" không đổi
//   ⑤ thẻ nhan-chi-phi giữ nguyên giá trị (đã xảy ra bị đổi lặng ở bản TQ)
//   ⑥ mọi dòng "- Nguồn:" giữ nguyên nội dung (so sau chuẩn hóa NFC)
//   ⑦ mỗi "- Ghi chú:" giữ đúng marker mở đầu: "Chỉ tham khảo TQ: Tranh cãi" /
//     "Chỉ tham khảo TQ" / "Tranh cãi" / không marker — marker lệch làm
//     sync-stats.mjs đếm sai số mục tranh cãi và số mục TQ
//   ⑧ mỗi mục: số link http(s) trong Ghi chú và số chỗ "Cần xác minh"/"TODO"
//     không đổi — sync-stats.mjs đếm cả hai vào README
//   ⑨ mỗi mục: con số của bản cũ phải còn đủ số lần trong bản mới, kiểm hai lớp:
//     - giá trị (normalize dấu ngăn nghìn/thập phân và đơn vị tỷ/triệu/nghìn kiểu
//       check-plain.mjs) — bắt "3 triệu" bị đổi thành "3 nghìn"
//     - cách viết (chuỗi số nguyên dạng như "0,58", "11.523", "45%") — bắt
//       đổi định dạng, spec đòi giữ nguyên ký hiệu số
//     Chỉ kiểm cũ→mới: số thêm là cho phép (bản dịch quy đổi kèm giá trị gốc),
//     số mất là lỗi — số biến mất gần như luôn là mất dữ kiện
// Tách dòng bằng /\r?\n/, lý do xem đầu check-refs.mjs.
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [file, ref = 'HEAD'] = process.argv.slice(2);
if (!file) { console.error('cần: <file-trong-book/> [ref-mặc-định-HEAD]'); process.exit(2); }

let oldText, newText;
try { oldText = execFileSync('git', ['show', `${ref}:${file.replace(/\\/g, '/')}`], { cwd: ROOT, encoding: 'utf8' }); }
catch { console.error(`không đọc được ${ref}:${file}`); process.exit(2); }
try { newText = readFileSync(resolve(ROOT, file), 'utf8'); }
catch { console.error(`không đọc được ${file}`); process.exit(2); }

const FIELD_RE = /^- (Chi phí|Nói dễ hiểu|Lợi ích|Mức chứng cứ|Nguồn|Ghi chú):\s*(.*)$/;

// Chia thành các mục theo "### N.". Phần trước mục 1 là mục 0 (mở đầu chương).
function parse(text) {
  const muc = new Map(); // no -> { title, order: [field], fields: {name: line}, tag, raw }
  let cur = { no: 0, title: '', order: [], fields: {}, tag: '', raw: [] };
  muc.set(0, cur);
  for (const line of text.normalize('NFC').split(/\r?\n/)) {
    const h = line.match(/^### (\d+)\. (.*)$/);
    if (h) { cur = { no: Number(h[1]), title: h[2].trim(), order: [], fields: {}, tag: '', raw: [] }; muc.set(cur.no, cur); cur.raw.push(line); continue; }
    cur.raw.push(line);
    const f = line.match(FIELD_RE);
    if (f) { cur.order.push(f[1]); cur.fields[f[1]] = line; }
    if (/^<!--\s*nhan-chi-phi/.test(line)) cur.tag = line.trim();
  }
  return muc;
}

// Lớp giá trị: normalize số kiểu check-plain.mjs — "." ngăn nghìn, "," thập phân,
// đơn vị đếm. Đơn vị phải đứng riêng một từ: không có lookahead thì "tr" khớp cả
// "trước/trở/trong", "k" khớp "kg/khoản", viết lại câu tự nhiên là báo lỗi giả.
function numbers(s) {
  let t = s, prev;
  do { prev = t; t = t.replace(/(\d)\.(\d{3})/g, '$1$2'); } while (t !== prev);
  t = t.replace(/(\d),(\d)/g, '$1.$2');
  const mult = { 'tỷ': 1e9, 'triệu': 1e6, 'tr': 1e6, 'nghìn': 1e3, 'k': 1e3 };
  return [...t.matchAll(/(\d*\.?\d+)\s*(?:(tỷ|triệu|tr|nghìn|k)(?![\p{L}\p{N}]))?/giu)]
    .map(m => Number(m[1]) * (mult[(m[2] || '').toLowerCase()] || 1));
}
// Lớp cách viết: chuỗi số nguyên dạng, kèm dấu ngăn và % nếu có.
const tokens = s => s.match(/\d+(?:[.,]\d+)*%?/g) ?? [];
const bag = arr => { const m = new Map(); for (const n of arr) m.set(n, (m.get(n) || 0) + 1); return m; };
const missing = (o, n) => [...o.entries()].filter(([k, c]) => (n.get(k) || 0) < c).map(([k, c]) => `${k}×${c}`);

// Tiêu đề mới phải chứa mọi từ của tiêu đề cũ theo đúng thứ tự (subsequence).
const isSubseq = (oldW, newW) => {
  let i = 0;
  for (const w of newW) if (w === oldW[i]) i++;
  return i === oldW.length;
};

const marker = line => {
  const v = (line || '').replace(/^- Ghi chú:\s*/, '');
  const tq = v.match(/^Chỉ tham khảo TQ[:：]\s*/);
  const rest = tq ? v.slice(tq[0].length) : v;
  const tc = rest.startsWith('Tranh cãi');
  return tq ? (tc ? 'TQ+Tranh cãi' : 'TQ') : (tc ? 'Tranh cãi' : 'không');
};
const countRe = (s, re) => (s.match(re) ?? []).length;

const bad = [];
const eol = t => { const crlf = countRe(t, /\r\n/g), lf = countRe(t, /\n/g); return crlf === 0 ? 'LF' : crlf === lf ? 'CRLF' : 'lẫn'; };
if (eol(oldText) !== eol(newText))
  bad.push(`line ending đổi: cũ ${eol(oldText)} / mới ${eol(newText)}`);

const a = parse(oldText), b = parse(newText);
const aNos = [...a.keys()], bNos = [...b.keys()];
if (aNos.join(',') !== bNos.join(','))
  bad.push(`dãy số mục đổi: cũ [${aNos.join(',')}] / mới [${bNos.join(',')}]`);

// Dòng điều hướng và tên phần: tools/lib/book.mjs và index.html đọc chúng.
const fixedLines = m => m.get(0).raw.filter(l => /^\[← Mục lục\]|^# \d+\. /.test(l));
const fo = fixedLines(a), fn = fixedLines(b);
if (fo.join('\n') !== fn.join('\n'))
  bad.push(`mở đầu chương: dòng "[← Mục lục]" hoặc "# N. Tên phần" bị đổi`);

for (const no of aNos) {
  const x = a.get(no), y = b.get(no);
  if (!y) continue; // đã báo ở dãy số mục
  const where = no === 0 ? 'mở đầu chương' : `mục ${no}`;
  if (no && x.title && !isSubseq(x.title.split(/\s+/), (y.title || '').split(/\s+/)))
    bad.push(`${where}: tiêu đề mới "${y.title}" mất từ của tiêu đề cũ "${x.title}"`);
  if (x.order.join('|') !== y.order.join('|'))
    bad.push(`${where}: dãy field đổi: cũ [${x.order.join(', ')}] / mới [${y.order.join(', ')}]`);
  if (x.tag !== y.tag)
    bad.push(`${where}: thẻ nhan-chi-phi đổi "${x.tag}" → "${y.tag}"`);
  if (x.fields['Nguồn'] != null && x.fields['Nguồn'] !== (y.fields['Nguồn'] || ''))
    bad.push(`${where}: dòng Nguồn bị động vào`);
  if (x.fields['Mức chứng cứ'] != null && x.fields['Mức chứng cứ'].trim() !== (y.fields['Mức chứng cứ'] || '').trim())
    bad.push(`${where}: Mức chứng cứ đổi "${x.fields['Mức chứng cứ'].trim()}" → "${(y.fields['Mức chứng cứ'] || '').trim()}"`);
  if (x.fields['Ghi chú'] != null && marker(x.fields['Ghi chú']) !== marker(y.fields['Ghi chú']))
    bad.push(`${where}: marker Ghi chú đổi "${marker(x.fields['Ghi chú'])}" → "${marker(y.fields['Ghi chú'])}"`);
  const lo = countRe(x.fields['Ghi chú'] || '', /https?:\/\//g), ln = countRe(y.fields['Ghi chú'] || '', /https?:\/\//g);
  if (lo !== ln) bad.push(`${where}: số link trong Ghi chú đổi ${lo} → ${ln}`);
  const xs = x.raw.join('\n'), ys = y.raw.join('\n');
  const vo = countRe(xs, /Cần xác minh|TODO/g), vn = countRe(ys, /Cần xác minh|TODO/g);
  if (vo !== vn) bad.push(`${where}: số chỗ "Cần xác minh"/"TODO" đổi ${vo} → ${vn}`);
  const mv = missing(bag(numbers(xs)), bag(numbers(ys)));
  if (mv.length) bad.push(`${where}: giá trị số mất hoặc ít đi: ${mv.join(', ')}`);
  const mt = missing(bag(tokens(xs)), bag(tokens(ys)));
  if (mt.length) bad.push(`${where}: cách viết số mất hoặc đổi định dạng: ${mt.join(', ')}`);
}

if (bad.length) {
  console.log(bad.map(s => `LỖI ${s}`).join('\n'));
  console.log(`\n${file}: ${bad.length} lỗi`);
  process.exit(1);
}
console.log(`${file}: sạch (${aNos.length - 1} mục, cấu trúc và số nguyên vẹn)`);
