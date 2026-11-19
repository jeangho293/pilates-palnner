#!/usr/bin/env node
// apps/core-api 변경 전에 반드시 사용자 승인을 받게 하는 PreToolUse 훅.
// - Edit/Write/MultiEdit/NotebookEdit: 대상이 apps/core-api/ 안이면 승인 요청(ask)
// - Bash: apps/core-api 를 건드리는 쓰기성 명령, 또는 --filter core-api 의 의존성 변경·실행 명령이면 승인 요청
// 사용: node require-core-api-approval.mjs          (경로로 판정 — 메인 세션·모든 에이전트)
//       node require-core-api-approval.mjs --all    (core-api-dev 에이전트: 모든 쓰기 동작을 승인 요청)
import path from 'node:path';

const all = process.argv.includes('--all');

let raw = '';
for await (const chunk of process.stdin) raw += chunk;
let input;
try {
  input = JSON.parse(raw);
} catch {
  process.exit(0);
}

const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
const coreDir = path.resolve(root, 'apps', 'core-api');
const tool = input.tool_name;
const ti = input.tool_input || {};

function ask(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'ask',
        permissionDecisionReason: `[core-api 변경 승인 필요] ${reason}`,
      },
    }),
  );
  process.exit(0);
}

if (['Edit', 'Write', 'MultiEdit', 'NotebookEdit'].includes(tool)) {
  const target = ti.file_path || ti.notebook_path;
  if (!target) process.exit(0);
  const abs = path.resolve(input.cwd || root, target);
  if (all || abs === coreDir || abs.startsWith(coreDir + path.sep)) {
    ask(`${path.relative(root, abs) || abs} 수정`);
  }
  process.exit(0);
}

if (tool === 'Bash') {
  const cmd = String(ti.command || '')
    .replace(/\d?>&\d/g, ' ')
    .replace(/\d?>>?\s*\/dev\/null/g, ' ');
  const writeOp =
    /(>|\btee\b|\brm\b|\bmv\b|\bcp\b|\bsed\s+-i|\bperl\s+-p?i|\btouch\b|\bmkdir\b|\bln\b|\bchmod\b|\btruncate\b|\bgit\s+(checkout|restore|rm|mv|clean|commit|reset)\b|\bnpx\b|\bpnpm\s+dlx\b|\bnest\s+g)/;
  const pkgWrite = /\b(add|remove|rm|uninstall|update|up|install|i|exec|dlx)\b/;
  const touchesDir = /(^|[\s'"=/])apps\/core-api(\/|\b)/.test(cmd);
  const filtersPkg = /(--filter[=\s]+|-F\s+)['"]?core-api['"]?(\s|$)/.test(cmd);
  const inCoreCwd = path.resolve(input.cwd || root).startsWith(coreDir);
  if (
    ((touchesDir || inCoreCwd || all) && writeOp.test(cmd)) ||
    ((filtersPkg || inCoreCwd || all) && pkgWrite.test(cmd))
  ) {
    ask(`명령 실행: ${ti.command}`);
  }
  process.exit(0);
}

process.exit(0);
