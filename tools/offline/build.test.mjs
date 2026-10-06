// Bản offline phải tự chứa font: hai font cục bộ được nhúng thẳng vào HTML
// bằng data URL, không còn request nào ra host font ngoài lúc mở file.
// Chạy: node --test tools/offline/build.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

test('offline output embeds local fonts without external font requests', () => {
  const dir = mkdtempSync(join(tmpdir(), 'offline-font-'));
  const out = join(dir, 'HowToLiveBetter.html');
  try {
    execFileSync(process.execPath, [join(ROOT, 'tools/offline/build.mjs'), out], { cwd: ROOT, stdio: 'pipe' });
    const html = readFileSync(out, 'utf8');
    const embedded = html.match(/data:font\/woff2;base64,/g) ?? [];
    assert.equal(embedded.length, 2, `cần đúng 2 data:font/woff2;base64, nhưng gặp ${embedded.length}`);
    assert.ok(html.includes('Source Sans 3'), 'bản offline thiếu family Source Sans 3');
    assert.ok(html.includes('Source Serif 4'), 'bản offline thiếu family Source Serif 4');
    assert.ok(!html.includes('fonts.googleapis.com'), 'bản offline còn trỏ tới fonts.googleapis.com');
    assert.ok(!html.includes('fonts.gstatic.com'), 'bản offline còn trỏ tới fonts.gstatic.com');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
