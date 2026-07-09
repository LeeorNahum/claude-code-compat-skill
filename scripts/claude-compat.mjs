#!/usr/bin/env node
// claude-code-compat generator. Zero dependencies. Single scope: the directory
// it is run from. It maintains one managed block in ./CLAUDE.md that imports
// ./AGENTS.md and lists every skill under ./.agents/skills by name + description,
// so Claude Code sees context it does not natively discover. Idempotent.
//
// Run from the repository root:  node .agents/skills/claude-code-compat/scripts/claude-compat.mjs

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const BEGIN = '<!-- BEGIN claude-code-compat (generated, do not edit) -->';
const END = '<!-- END claude-code-compat -->';
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Read the spec startup tier: name + description. Parses top-level frontmatter
// keys only. Handles double and single quotes, plain scalars (including values
// that contain a colon), and block scalars (| literal and > folded). Nested
// keys (indented, for example under metadata) are intentionally ignored.
function parseFrontmatter(md) {
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const lines = m[1].split(/\r?\n/);
  const top = {};
  for (let i = 0; i < lines.length; i++) {
    const km = lines[i].match(/^([A-Za-z0-9_-]+):(.*)$/);
    if (!km) continue; // blank line, comment, or nested key
    const key = km[1];
    const rest = km[2].trim();
    const block = rest.match(/^([|>])[+-]?\s*$/);
    if (block) {
      const folded = block[1] === '>';
      const body = [];
      let j = i + 1;
      for (; j < lines.length; j++) {
        if (lines[j].trim() === '') { body.push(''); continue; }
        if (/^\s/.test(lines[j])) body.push(lines[j].replace(/^\s+/, ''));
        else break;
      }
      i = j - 1;
      while (body.length && body[body.length - 1] === '') body.pop();
      top[key] = folded ? body.join(' ').replace(/\s+/g, ' ').trim() : body.join('\n');
      continue;
    }
    top[key] = unquote(rest);
  }
  const name = (top.name || '').trim();
  return name ? { name, description: (top.description || '').trim() } : null;
}

// Strip matching YAML quotes; leave unquoted scalars (even with colons) as-is.
function unquote(s) {
  if (s.startsWith('"') && s.length > 1) {
    return s.slice(1).replace(/"\s*$/, '').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  }
  if (s.startsWith("'") && s.length > 1) {
    return s.slice(1).replace(/'\s*$/, '').replace(/''/g, "'");
  }
  return s;
}

function readSkills() {
  const dir = join(ROOT, '.agents', 'skills');
  if (!existsSync(dir)) return [];
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const p = join(dir, e.name, 'SKILL.md');
    if (!existsSync(p)) continue;
    const fm = parseFrontmatter(readFileSync(p, 'utf8'));
    if (fm) out.push({ ...fm, path: `.agents/skills/${e.name}/SKILL.md` });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

function buildBlock(hasAgents, skills) {
  const lines = [BEGIN, ''];
  if (hasAgents) lines.push('@AGENTS.md', '');
  lines.push(
    '# Nested AGENTS.md',
    '',
    "Before you create, edit, or run files in a directory, read that directory's `AGENTS.md` first when one exists. Only the root `AGENTS.md` is imported above; nested `AGENTS.md` files hold local rules for their own subtree and are not auto-loaded. The closest `AGENTS.md` at or above a file governs work on that file, so check for one whenever you enter a new part of the tree (a package, an app, or a skill directory).",
    ''
  );
  if (skills.length) {
    lines.push(
      '# Agent Skills Index',
      '',
      'These project skills are not Claude Code slash-command skills. When a listed skill is relevant, read its `SKILL.md` path directly instead of trying a Skill tool or slash command.',
      '',
      'Each description is the trigger. Respect it, and when it matches the task, read the skill\'s `SKILL.md` plus any relevant references, assets, scripts, or nearby root files the skill points to.',
      ''
    );
    for (const s of skills) {
      lines.push(`## ${s.name}`, '', '`' + s.path + '`', '', `> ${s.description || '(no description)'}`, '');
    }
  }
  while (lines[lines.length - 1] === '') lines.pop();
  lines.push('', END);
  return lines.join('\n');
}

const skills = readSkills();
const hasAgents = existsSync(join(ROOT, 'AGENTS.md'));
if (!hasAgents && skills.length === 0) {
  console.log('claude-code-compat: no AGENTS.md and no skills found, nothing to do.');
  process.exit(0);
}

const claudePath = join(ROOT, 'CLAUDE.md');
let content = existsSync(claudePath) ? readFileSync(claudePath, 'utf8') : '';
const existed = content !== '';

// Strip any prior managed block, then drop a stray bare @AGENTS.md from human
// content (the block owns that import now). Preserve everything else.
content = content.replace(new RegExp(`\\n*${esc(BEGIN)}[\\s\\S]*?${esc(END)}\\n*`), '\n');
content = content.replace(/^@AGENTS\.md\s*$/gm, '').replace(/\n{3,}/g, '\n\n').trim();

const block = buildBlock(hasAgents, skills);
content = content ? `${content}\n\n${block}\n` : `${block}\n`;
writeFileSync(claudePath, content);

console.log(`claude-code-compat: CLAUDE.md ${existed ? 'updated' : 'created'} (${skills.length} skill(s)${hasAgents ? ' + AGENTS.md' : ''}).`);
for (const s of skills) console.log(`  - ${s.name}`);
