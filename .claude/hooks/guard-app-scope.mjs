#!/usr/bin/env node
// 앱 전용 에이전트의 수정 범위를 apps/<app>/ 로 제한하는 PreToolUse 훅.
// 사용: node guard-app-scope.mjs <app>   (app = web | back-office | core-api)
// - Edit/Write/MultiEdit/NotebookEdit: 대상 경로가 apps/<app>/ 밖이면 차단
// - Bash: 다른 앱 폴더를 대상으로 하는 쓰기성 명령이면 차단 (읽기 명령은 허용)
// 차단 시 exit 2 + stderr 메시지 → Claude에게 사유가 전달된다.
import path from 'node:path';

const APPS = ['web', 'back-office', 'core-api'];
const app = process.argv[2];
if (!APPS.includes(app)) {
  console.error(`guard-app-scope: 알 수 없는 앱 "${app}"`);
  process.exit(2);
}

let raw = '';
for await (const chunk of process.stdin) raw += chunk;
let input;
try {
  input = JSON.parse(raw);
} catch {
  process.exit(0); // 입력을 못 읽으면 막지 않는다
}

const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
const allowedDir = path.resolve(root, 'apps', app);
const tool = input.tool_name;
const ti = input.tool_input || {};

function deny(msg) {
  console.error(
    `[${app} 에이전트 범위 제한] ${msg}\n` +
      `이 에이전트는 apps/${app}/ 만 수정할 수 있고, 다른 폴더는 읽기만 가능합니다. ` +
      `범위 밖 변경이 필요하면 작업을 멈추고 메인 세션(사용자)에게 필요한 변경 내용을 보고하세요.`,
  );
  process.exit(2);
}

if (['Edit', 'Write', 'MultiEdit', 'NotebookEdit'].includes(tool)) {
  const target = ti.file_path || ti.notebook_path;
  if (!target) process.exit(0);
  const abs = path.resolve(input.cwd || root, target);
  if (abs !== allowedDir && !abs.startsWith(allowedDir + path.sep)) {
    deny(`${path.relative(root, abs) || abs} 는 수정할 수 없습니다.`);
  }
  process.exit(0);
}

if (tool === 'Bash') {
  // 2>&1, >/dev/null 같은 무해한 리다이렉션은 판정에서 제외
  const cmd = String(ti.command || '')
    .replace(/\d?>&\d/g, ' ')
    .replace(/\d?>>?\s*\/dev\/null/g, ' ');
  const writeOp =
    /(>|\btee\b|\brm\b|\bmv\b|\bcp\b|\bsed\s+-i|\bperl\s+-p?i|\btouch\b|\bmkdir\b|\bln\b|\bchmod\b|\btruncate\b|\bgit\s+(checkout|restore|rm|mv|clean)\b|\bnpx\b|\bpnpm\s+dlx\b)/;
  const pkgWrite = /\b(add|remove|rm|uninstall|update|up|install|i|exec|dlx)\b/;
  for (const other of APPS.filter((a) => a !== app)) {
    const esc = other.replace(/[-]/g, '\\-');
    const touchesDir = new RegExp(`(^|[\\s'"=/])apps/${esc}(/|\\b)`).test(cmd);
    const filtersPkg = new RegExp(`(--filter[=\\s]+|-F\\s+)['"]?${esc}['"]?(\\s|$)`).test(cmd);
    if ((touchesDir && writeOp.test(cmd)) || (filtersPkg && pkgWrite.test(cmd))) {
      deny(`다른 앱(apps/${other})을 변경할 수 있는 명령은 실행할 수 없습니다: ${ti.command}`);
    }
  }
  process.exit(0);
}

process.exit(0);
