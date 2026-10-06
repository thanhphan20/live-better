// Bảng đối chiếu trích dẫn chéo: parse mọi trích "phần X, mục Y" / "mục N"
// trong thân bài thành tiêu đề mục mà nó thực sự trỏ tới, ghi vào
// docs/bang-doi-chieu-trich-dan.md. File đó được commit, nên khi thêm/xóa mục
// làm các trích trỏ lệch, git diff sẽ phơi ra ngay — số mục không đổi mà tiêu
// đề đổi, tức là trích đã bị dồn số đẩy lệch.
//
//   node tools/check-refs.mjs            # sinh lại bảng (sync-stats.mjs tự gọi)
//   node tools/check-refs.mjs --check    # chỉ kiểm không ghi file; có trích hỏng thì exit 1 (CI dùng)
//   node tools/check-refs.mjs --suspect  # liệt kê thêm các trích mà lời văn quanh không khớp
//                                        # tiêu đề đích — nhiều false positive, chỉ dùng khi rà soát
//
// Tại sao cần tool này: số mục phụ thuộc vị trí, trích trong thân bài chỉ ghi
// vị trí chứ không ghi nội dung. Ngày 2026-09-19 phần 7 của bản TQ phát hiện 6
// trích trỏ sai (trợ cấp y tế trỏ vào trợ cấp tối thiểu, trạm cứu trợ trỏ sai
// mục) — tất cả đều nằm trong phạm vi số mục, kiểm vượt biên không bắt được
// cái nào.
// Chú ý: tách dòng bắt buộc dùng /\r?\n/, không được dùng '\n'. File trong
// book/ có cả CRLF lẫn LF, mà '.' trong regex JS không khớp '\r' (CR cũng là
// ký tự kết thúc dòng — điểm này khác Python và Perl); để sót '\r' sẽ khiến
// /^### (\d+)\. (.*)$/ trên file CRLF không khớp được mục nào.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CHECK_ONLY = process.argv.includes('--check');

// Trích trần cùng phần ("xem mục 8") chỉ quét trong mấy field này: "mục N" trong
// field Nguồn phần lớn là số điều luật (bản VN viết "Điều N" nên ít va chạm
// hơn bản TQ, nhưng dòng Nguồn vẫn đầy trích luật), quét vào toàn false positive.
const FIELDS = /^- (Nói dễ hiểu|Lợi ích|Ghi chú|Chi phí):/;
// Còn trích chéo phần có kèm số phần ("xem phần 11, mục 16") không thể nhầm với
// điều luật, trong Nguồn cũng có, nên quét cả Nguồn. Bản TQ từng suýt bỏ sót
// một trích như vậy nằm trong field nguồn ở phần 26.
const CROSS_FIELDS = /^- (Nói dễ hiểu|Lợi ích|Ghi chú|Chi phí|Nguồn):/;

const files = readdirSync(resolve(ROOT, 'book')).filter(f => /^\d\d-.*\.md$/.test(f)).sort();
// Các bài dài trong docs/ cũng quét. Chúng từng nằm ngoài phạm vi quét rất lâu
// giống đoạn mở đầu phần: khi số mục bị dồn lệch, --check vẫn báo đạt và diff
// của bảng cũng không thấy các trích này. Ngày 2026-09-21 kiểm kê lại, ba bài
// dài của bản TQ có 23 trích chéo phần chưa từng được kiểm.
// Chỉ lấy .md ngay dưới docs/. Thư mục con (ghi chép kiểm chứng, superpowers)
// không quét: đó là tài liệu quy trình/trạng thái lịch sử, không đi theo thân
// bài. Bản thân file bảng đối chiếu (cả tên cũ 引用对照.md) cũng loại trừ.
const docs = readdirSync(resolve(ROOT, 'docs'))
  .filter(f => f.endsWith('.md') && f !== 'bang-doi-chieu-trich-dan.md' && f !== '引用对照.md')
  .sort();

// Đọc trước tiêu đề các mục của từng phần: sections[số phần] = { file, titles: { số mục: tiêu đề } }
const sections = new Map();
for (const f of files) {
  const num = Number(f.slice(0, 2));
  const titles = new Map();
  for (const line of readFileSync(resolve(ROOT, 'book', f), 'utf8').split(/\r?\n/)) {
    const m = /^### (\d+)\. (.*)$/.exec(line);
    if (m) titles.set(Number(m[1]), m[2].trim());
  }
  sections.set(num, { file: f, titles });
}

// Một trích có thể viết "mục 3, 10 và 11" — tách ra nhiều số mục. Cũng nhận
// viết khoảng "mục 11 đến 14", "mục 5 đến mục 10": bản TQ từng không khớp cả
// cụm khoảng (coi như không quét), toàn sách có 5 chỗ viết kiểu đó.
const RANGE = /^\s*(?:(?:mục|phần)\s+)?(\d+)\s*đến\s*(?:(?:mục|phần)\s+)?(\d+)\s*$/;
// Trả về [số mục, có phải bung từ khoảng không]. Khoảng trỏ cả một khối mục
// ("mấy mục về ..."), không gán anchor riêng cho từng mục trong khối được, nên
// số bung ra miễn kiểm anchor — chúng vẫn vào bảng, bị dồn lệch thì nhìn diff
// tiêu đề để phát hiện.
const nums = s => {
  const out = [];
  for (const part of s.split(/,|và/)) {
    const r = RANGE.exec(part);
    if (r) {
      const [a, b] = [Number(r[1]), Number(r[2])];
      if (b >= a && b - a <= 30) for (let i = a; i <= b; i++) out.push([i, true]);
      continue;
    }
    const clean = part.trim().replace(/^(?:mục|phần)\s+/, '');
    if (!clean) continue;
    const n = Number(clean);
    if (Number.isFinite(n)) out.push([n, false]);
  }
  return out;
};
// Dạng viết của đoạn số mục: "3", "3, 10", "3, 10 và 11", "11 đến 14",
// "5 đến mục 10". "phần"/"mục" không khớp khi không kèm số, nên "mục lục",
// "mục tiêu" tự an toàn.
const NUMS = '\\d+(?:\\s*(?:,|và)\\s*(?:mục\\s*)?\\d+|\\s*đến\\s*(?:(?:mục|phần)\\s*)?\\d+)*';
// Lưu ý: sau `,`/`và` chỉ cho "mục" lặng lại, KHÔNG cho "phần" — nếu cho,
// "phần 3, mục 4, phần 5, mục 6" sẽ bị CROSS gộp NUMS thành "4, phần 5,
// mục 6", sinh row gán sai cho phần 3 và nuốt mất trích "phần 5, mục 6".
// Sau "đến" mới cho cả hai ("mục 5 đến mục 10", "phần 5 đến phần 10").
// Chéo phần: "phần X, mục Y" — cũng chấp nhận không phẩy "phần X mục Y".
const CROSS = new RegExp(`phần\\s*(\\d+)\\s*,?\\s*mục\\s*(${NUMS})`, 'g');
// Cả phần: "phần X", "phần 8, 9". Phải đứng SAU CROSS trong thứ tự strip: NUMS
// cho phép "mục" lặng sau dấu phẩy nên "phần 7, mục 3" cũng khớp WHOLE; nếu
// quét WHOLE trước sẽ nuốt cả trích chéo thành danh sách phần.
const WHOLE = new RegExp(`phần\\s*(${NUMS})`, 'g');
// Cùng phần: "mục N" (quét sau khi đã strip hai dạng trên).
const SAME = new RegExp(`mục\\s*(${NUMS})`, 'g');
// Chỉ đường tương đối bị cấm.
const REL = /(mục\s+(?:ngay\s+)?(?:trên|dưới|trước|sau|kế|tiếp theo|cuối|đầu))/g;

const out = [];
const problems = [];
const suspects = [];
const weak = [];
let total = 0;

// Đơn vị quét: mỗi phần trong book/ một đơn vị, mỗi bài dài trong docs/ một đơn vị.
const targets = [
  ...files.map(f => ({ f, dir: 'book', isDoc: false })),
  ...docs.map(f => ({ f, dir: 'docs', isDoc: true })),
];

for (const { f, dir, isDoc } of targets) {
  const num = isDoc ? 0 : Number(f.slice(0, 2));
  const self = isDoc ? null : sections.get(num);
  const lines = readFileSync(resolve(ROOT, dir, f), 'utf8').split(/\r?\n/);
  const rows = [];
  // cur là số của mục đang đứng trong đó, 0 nghĩa là chưa vào mục nào (đoạn mở
  // đầu phần của book, hoặc mọi vị trí trong docs). unit là tên hiển thị ở cột
  // "Nơi trích": trong mục ghi "mục N", mở đầu phần ghi "Mở đầu phần", bài dài
  // ghi tiêu đề nhỏ gần nhất.
  let cur = 0;
  let unit = isDoc ? 'Phần đầu' : 'Mở đầu phần';

  // Câu đứng trước trích thường nói luôn nó muốn trỏ cái gì ("trợ cấp y tế (xem
  // mục 11)") — liệt kê cả cụm đó ra để người soi bảng khỏi phải lật thân bài.
  // Cắt theo dấu câu gần nhất chứ không cắt cố định độ dài — bản TQ từng cắt
  // cố định 14 chữ khiến vài trích đúng trông như sai (cụm còn lại chỉ còn nửa
  // từ, không còn gì khớp tiêu đề).
  const ctxOf = (line, idx) => {
    const before = line.slice(0, idx);
    let start = -1;
    for (const p of ['.', ';', '!', '?', ':']) start = Math.max(start, before.lastIndexOf(p));
    return before.slice(start + 1).slice(-44).replace(/\|/g, '\\|');
  };
  // Cửa sổ kiểm anchor hẹp hơn: chỉ lấy cụm phẩy chứa trích. Trong cửa sổ rộng
  // cả câu, các từ phổ biến rất dễ trùng ngẫu nhiên với tiêu đề mục khác và
  // anchor thành giả — bản TQ có sự cố 2026-09-20: phần 31 chèn mục, một trích
  // cũ bị dồn sang mục mới, và một cụm nằm cách hai dấu phẩy tình cờ trùng từ
  // trong tiêu đề mới khiến --check báo đạt dù trích đã lệch.
  // Cụm quá ngắn ("..., xem mục 11" — cửa sổ chỉ còn chữ "xem") thì lùi lấy
  // thêm cụm trước, nếu không trích đúng cũng bị xử như trích trần.
  // Ngoặc kép/ngoặc đơn không tính là ranh giới cụm: anchor có thể nằm trong
  // ngoặc ("... (mục 3 phần này)" hay ghi chú dạng '... xem mục 24'), cắt theo
  // ngoặc sẽ chặt đứt anchor đúng.
  // Bản TQ lọc cụm ngắn bằng cách xóa các chữ lệ thuộc theo ký tự — với tiếng
  // Việt cách đó sẽ xóa gần hết chữ cái, nên đổi sang xóa theo từ nối nguyên
  // từ. Lưu ý \b của JS không coi chữ có dấu là ký tự từ (\bđó\b, \bở\b không
  // bao giờ khớp) nên phải tự làm ranh giới bằng lookaround \p{L}.
  const CLAUSE = ['.', ';', '!', '?', ':', ','];
  const STOP = /(?<![\p{L}\p{N}])(?:xem|theo|như|của|và|mục|phần|này|đó|kia|ở|trong|tham khảo)(?![\p{L}\p{N}])/giu;
  const narrowOf = (line, idx) => {
    const before = line.slice(0, idx);
    const cut = s => {
      let start = -1;
      for (const p of CLAUSE) start = Math.max(start, s.lastIndexOf(p));
      return { head: s.slice(0, start + 1), tail: s.slice(start + 1) };
    };
    const last = cut(before);
    if (last.tail.replace(STOP, '').replace(/\s+/g, '').length >= 8) return last.tail.slice(-24);
    return (cut(last.head.slice(0, -1)).tail + last.tail).slice(-24);
  };
  // Chữ đứng SAU trích cũng tính anchor: "mục 16 (giấy vay và bảo lãnh)" ghi
  // từ khóa sau số mục. Lấy tới dấu câu đầu tiên sau trích (tối đa 40 ký tự).
  // Không dùng độ dài cố định: trích có chuỗi số dài ("xem phần 1, mục 7, 8,
  // 14, 17...") sẽ đẩy phần ghi chú ra khỏi cửa sổ.
  const LEAD = `^(?:phần\\s*${NUMS}(?:\\s*,?\\s*mục\\s*${NUMS})?|mục\\s*${NUMS})`;
  const afterOf = (line, idx) => {
    const rest = line.slice(idx).replace(new RegExp(LEAD), '');
    const end = rest.search(/[.;!?]/);
    return (end === -1 ? rest : rest.slice(0, end)).slice(0, 40).replace(/\|/g, '\\|');
  };

  lines.forEach((line, i) => {
    if (isDoc) {
      const h = /^#{1,6}\s+(.+?)\s*$/.exec(line);
      if (h) { unit = h[1].slice(0, 24); return; }
    } else {
      const t = /^### (\d+)\. (.*)$/.exec(line);
      if (t) { cur = Number(t[1]); unit = `mục ${cur}`; return; }
    }
    // Thân mục chỉ quét mấy field đã nêu (Nguồn chỉ tính cho trích chéo phần).
    // Đoạn mở đầu phần và thân bài dài là đoạn văn thường, không khớp tiền tố
    // field, nên mọi dòng không rỗng đều quét — vốn chúng đã bị bỏ qua âm thầm
    // suốt thời gian dài.
    const inEntry = !isDoc && cur > 0;
    if (inEntry ? !CROSS_FIELDS.test(line) : !line.trim()) return;

    // Chỉ đường tương đối ("xem mục sau", "phạt ở mục trước") cấm hẳn: nó không
    // mang số mục, chèn mục mới là nó trôi theo, trỏ lệch mà diff bảng cũng
    // không thấy, kiểm trích trần của --check càng không với tới. Bản TQ chỉ
    // một lần quét 2026-09-20 đã bắt ba chỗ trỏ sai từ lâu bằng lỗi này.
    for (const m of line.matchAll(REL)) {
      problems.push(`${f}:${i + 1} ${unit} dùng chỉ đường tương đối "${m[1]}" — đổi thành "mục N (từ khóa)"`);
    }

    // Chéo phần: "phần N, mục X" / "phần N mục X"
    for (const m of line.matchAll(CROSS)) {
      const target = sections.get(Number(m[1]));
      for (const [x, range] of nums(m[2])) {
        const title = target?.titles.get(x);
        rows.push({ from: unit, range, ref: `phần ${m[1]}, mục ${x}`, title, line: i + 1, ctx: ctxOf(line, m.index), narrow: narrowOf(line, m.index), after: afterOf(line, m.index) });
        if (!title) problems.push(`${f}:${i + 1} ${unit} trích "phần ${m[1]}, mục ${x}" — phần đó không có mục này`);
      }
    }

    // Cả phần: "phần X" / "phần 8, 9". Quét trên dòng đã strip trích chéo —
    // WHOLE cũng khớp được "phần 7, mục 3" (xem comment tại WHOLE). Trích cả
    // phần trỏ một khối lớn, không ghép anchor được (range=true), đích là tên
    // file phần đó để soi diff.
    const noCross = line.replace(CROSS, '');
    for (const m of noCross.matchAll(WHOLE)) {
      for (const [x] of nums(m[1])) {
        const target = sections.get(x);
        const title = target ? `${basename(target.file, '.md')} (cả phần)` : undefined;
        rows.push({ from: unit, range: true, ref: `phần ${x}`, title, line: i + 1, ctx: ctxOf(noCross, m.index), narrow: narrowOf(noCross, m.index), after: afterOf(noCross, m.index) });
        if (!target) problems.push(`${f}:${i + 1} ${unit} trích "phần ${x}" — không có phần này`);
      }
    }

    // Bài dài không có khái niệm "phần này", "mục N" trần trong bài dài không
    // tham chiếu mục sách nên không quét (bản VN trích luật viết "Điều N" nên
    // ít va hơn bản TQ, nhưng nguyên tắc giữ nguyên).
    if (isDoc) return;

    // Cùng phần: quét mọi "mục X", không giới hạn từ dẫn — bản TQ từng chỉ nhận
    // ba từ dẫn nên sót hàng loạt cách viết ("làm theo mục 1", "chọn một trong
    // mục 4"). Trong thân mục chỉ quét dòng FIELDS (Nguồn toàn trích luật).
    // Đoạn mở đầu phần không bị giới hạn field: "mục N" ở đó là dẫn đọc, bị
    // dồn lệch y hệt, cũng phải vào bảng.
    // Bản TQ phải đoán "đây là số điều luật hay trích mục" bằng heuristic dấu
    // hiệu kèm theo (《…》, "法", "号"), từng nuốt nhầm 12 trích thật một cách
    // âm thầm. Bản VN điều luật viết "Điều N", "mục N" gần như không va chạm
    // nên bỏ hẳn lớp đoán đó: trong mục chỉ quét dòng FIELDS, còn "mục N" vượt
    // số mục của phần vẫn liệt kê để người xem quyết.
    if (inEntry && !FIELDS.test(line)) return;
    const stripped = noCross.replace(WHOLE, '');
    for (const m of stripped.matchAll(SAME)) {
      for (const [x, range] of nums(m[1])) {
        const title = self.titles.get(x);
        rows.push({ from: unit, range, ref: `mục ${x}`, title, line: i + 1, ctx: ctxOf(stripped, m.index), narrow: narrowOf(stripped, m.index), after: afterOf(stripped, m.index) });
        // Trích cùng phần vượt số mục của phần: có thể là trích lỗi hoặc nhắc
        // tới nội dung ngoài danh sách — liệt kê để người xem quyết.
        if (!title) problems.push(`${f}:${i + 1} ${unit} trích "mục ${x}" — phần này chỉ có ${self.titles.size} mục`);
        if (inEntry && x === cur) problems.push(`${f}:${i + 1} mục ${cur} tự trích chính nó`);
      }
    }
  });

  // Kiểm tự động một trích có trỏ đúng không: chữ quanh trích có đoạn nào cũng
  // xuất hiện trong tiêu đề mục đích không. Có → trích tự mang anchor, bị dồn
  // lệch sẽ bị phát hiện; không → đó là trích trần ("thuật toán xem mục 34"),
  // sai cũng không ai thấy, phải bổ sung ghi chú tường minh.
  // Bản TQ so "chuỗi chữ Hán liên tiếp" — không áp dụng được cho tiếng Việt,
  // nên chuẩn hóa (lowercase, NFD bỏ dấu tổ hợp, đ→d) rồi so chuỗi con chung
  // dài nhất (LCS) trên KÝ TỰ. Trùng ngẫu nhiên vẫn dễ xảy ra nên phân ngưỡng
  // theo độ dài và khoảng cách: chung ≥12 ký tự trong cửa sổ rộng là anchor
  // thật; ≥8 ký tự thì chỉ tính khi nằm trong cụm chứa trích — khớp 8+ ký tự
  // nhưng nằm ngoài cụm chính là dạng đã làm --check báo đạt sai ở sự cố
  // 2026-09-20 kể trên.
  const norm = s => s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')
    .replace(/\s+/g, ' ');
  const longest = (text, title) => {
    let best = 0;
    for (let i = 0; i < text.length; i++) {
      for (let n = 1; i + n <= text.length; n++) {
        const seg = text.slice(i, i + n);
        if (!title.includes(seg)) break;
        best = Math.max(best, n);
      }
    }
    return best;
  };
  // Số và chuỗi ASCII cũng là anchor: 12356, AED, CT, BMI... thường chính là
  // thứ trích muốn chỉ.
  const token = (text, title) => (text.match(/[0-9A-Za-z]{2,}/g) ?? []).some(t => title.includes(t));
  for (const r of rows) {
    if (!r.title || r.range) continue;
    const t = norm(r.title);
    const wide = norm(r.ctx + ' ' + r.after);
    if (token(wide, t) || longest(wide, t) >= 12) continue;
    if (longest(norm(r.narrow + ' ' + r.after), t) >= 8) continue;
    // Chỉ khớp 8+ ký tự ngoài cụm chứa trích → xếp anchor yếu riêng; cách sửa
    // giống trích trần: bổ sung ghi chú tường minh.
    const list = longest(wide, t) >= 8 ? weak : suspects;
    list.push(`${f}:${r.line} ${r.from} → "${r.ref}" ${r.title.slice(0, 30)}… ‖ …${r.ctx}【${r.ref}】${r.after}…`);
  }

  if (!rows.length) continue;
  total += rows.length;
  out.push(`## ${isDoc ? 'docs/' : ''}${basename(f, '.md')}\n`);
  out.push('| Nơi trích | Cú pháp | Mục trỏ tới | Ngữ cảnh |');
  out.push('| --- | --- | --- | --- |');
  for (const r of rows) {
    const title = r.title ? r.title : '**Trỏ tới mục không tồn tại**';
    out.push(`| ${r.from} | ${r.ref} | ${title} | …${r.ctx}… |`);
  }
  out.push('');
}

const body = [
  '# Bảng đối chiếu trích dẫn',
  '',
  'File này do `node tools/check-refs.mjs` sinh ra, đừng sửa tay.',
  '',
  'Các trích "mục X" trong thân bài chỉ ghi số mục chứ không ghi nội dung. Thêm',
  'hay xóa một mục sẽ làm các trích phía sau trỏ lệch hàng loạt, mà số mục sau',
  'khi lệch thường vẫn nằm trong phạm vi — chỉ kiểm vượt biên không bắt được.',
  'Vì vậy mỗi trích được ghi kèm **tiêu đề mục nó thực sự trỏ tới** vào đây và',
  'commit cùng repo: sau khi đổi mục chạy lại tool, trong `git diff` chỗ nào số',
  'mục không đổi mà tiêu đề đổi là trích đã bị dồn số đẩy lệch.',
  '',
  'Phạm vi quét: thân các mục và đoạn mở đầu của từng phần trong `book/`, cộng',
  'các bài dài ngay dưới `docs/`. Bài dài không có khái niệm "phần này" — "mục N"',
  'trần trong bài dài không quét, nên trích ở đó phải viết đủ "phần X, mục Y".',
  'Cột "Nơi trích": trong mục ghi "mục N", mở đầu phần ghi "Mở đầu phần", bài',
  'dài ghi tiêu đề nhỏ gần nhất.',
  '',
  'Lớp bảo hiểm thứ hai là **anchor**: quanh mỗi trích phải có ít nhất một đoạn',
  'chữ trùng với tiêu đề mục đích ("trợ cấp y tế xem mục 11" có "trợ cấp y tế",',
  'hoặc viết tường minh "xem mục 16 (giấy vay và bảo lãnh)").',
  '`node tools/check-refs.mjs --check` coi trích không anchor là fail — loại đó',
  'bị dồn lệch thì diff của bảng cũng không thấy gì, chỉ có anchor chặn được.',
  'Trích khoảng ("mục 11 đến 14") và trích cả phần ("phần 8") là ngoại lệ: trỏ',
  'cả một khối, không ghép anchor từng mục được, chỉ trông vào diff.',
  '',
  'Anchor đủ hay không xét theo độ dài và khoảng cách, sau khi chuẩn hóa bỏ dấu:',
  'chuỗi con chung dài nhất giữa ngữ cảnh và tiêu đề ≥ 12 ký tự trong cả câu,',
  'hoặc ≥ 8 ký tự trong cụm chứa trích, mới tính là anchor thật; chỉ khớp 8+ ký',
  'tự ngoài cụm thì coi như không có anchor (đa số là từ phổ biến trùng ngẫu',
  'nhiên). Đợt siết này bắt nguồn từ sự cố 2026-09-20 của bản TQ: chèn mục làm',
  'một trích trôi sang mục mới, và một cụm nằm cách hai dấu phẩy tình cờ trùng',
  'chữ trong tiêu đề mới, `--check` khi đó báo đạt.',
  '',
  `Tổng cộng ${total} trích dẫn.`,
  '',
  ...out,
].join('\n');

if (problems.length) {
  console.log('Cần người xác nhận:');
  for (const p of problems) console.log('  ' + p);
  console.log('');
}

// Heuristic anchor thời bản TQ từng false positive rất cao (trích đúng hoàn
// toàn nhưng không trùng chữ nào với tiêu đề; một lần quét báo hơn nửa số
// trích); sau đó toàn sách bổ sung anchor cho từng trích nên bình thường cả
// hai danh sách phải bằng 0, báo ra nghĩa là thật sự có chỗ cần ghi chú.
// Nó chỉ đảm bảo "lệch thì nhìn thấy", không đảm bảo "lệch thì chặn được":
// mô phỏng dồn trích cùng phần đi một số, chặn ngay được khoảng bảy phần,
// phần còn lại (hai mục kề nói cùng một việc, tiêu đề dùng chung từ) vẫn
// phải nhờ diff của bảng.
if (process.argv.includes('--suspect') && suspects.length) {
  console.log(`Lời văn chỗ trích không khớp tiêu đề đích (${suspects.length} chỗ, nhiều false positive, chỉ để soi tay):`);
  for (const s of suspects) console.log('  ' + s);
  console.log('');
}

if (process.argv.includes('--suspect') && weak.length) {
  console.log(`Anchor chỉ khớp ngoài cụm chứa trích (${weak.length} chỗ, đa số là từ phổ biến trùng ngẫu nhiên, coi như không anchor):`);
  for (const s of weak) console.log('  ' + s);
  console.log('');
}

if (CHECK_ONLY) {
  const fatal = problems.filter(p => p.includes('không có mục này') || p.includes('không có phần này') || p.includes('tự trích chính nó') || p.includes('chỉ đường tương đối'));
  for (const p of fatal) console.log('  ' + p);
  // Trích trần (quanh trích không đoạn nào khớp tiêu đề đích) cũng tính fail:
  // loại đó bị dồn lệch là không ai nhìn ra. Cách sửa là thêm anchor —
  // "xem mục 16 (giấy vay và bảo lãnh)", chữ trong ngoặc lấy từ tiêu đề đích.
  if (suspects.length) {
    console.log(`${suspects.length} trích dẫn không có anchor, lệch cũng không thấy — hãy bổ sung anchor (chạy --suspect xem danh sách):`);
    for (const s of suspects.slice(0, 10)) console.log('  ' + s.split('‖')[0]);
    if (suspects.length > 10) console.log(`  … còn ${suspects.length - 10} chỗ nữa`);
  }
  // Anchor yếu cũng tính fail: chỉ trùng được một đoạn ngắn ngoài cụm chứa
  // trích, ngang không có anchor.
  if (weak.length) {
    console.log(`${weak.length} trích dẫn có anchor chỉ khớp ngoài cụm chứa trích, coi như không anchor — hãy bổ sung ghi chú tường minh (chạy --suspect xem danh sách):`);
    for (const s of weak.slice(0, 10)) console.log('  ' + s.split('‖')[0]);
    if (weak.length > 10) console.log(`  … còn ${weak.length - 10} chỗ nữa`);
  }
  const bad = fatal.length + suspects.length + weak.length;
  console.log(bad ? `Còn ${bad} chỗ cần xử lý` : `Kiểm tra trích dẫn đạt: cả ${total} trích dẫn đều trỏ đúng và có anchor`);
  process.exit(bad ? 1 : 0);
}

writeFileSync(resolve(ROOT, 'docs/bang-doi-chieu-trich-dan.md'), body, 'utf8');
console.log(`Đã ghi docs/bang-doi-chieu-trich-dan.md — ${total} trích dẫn`);
