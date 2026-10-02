#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

export function appendLog(entry = {}) {
  const file = path.resolve('.agents/captains_log.json');
  let list = [];
  try { list = JSON.parse(fs.readFileSync(file, 'utf-8')); } catch {}
  list.push({ timestamp: new Date().toISOString(), ...entry });
  fs.writeFileSync(file, JSON.stringify(list, null, 2), 'utf-8');
}

if (process.argv.includes('--test')) {
  console.log('📜  [COMPUTER]: Captain Log writer online.');
  process.exit(0);
}
