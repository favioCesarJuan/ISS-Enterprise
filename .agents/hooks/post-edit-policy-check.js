#!/usr/bin/env node
/**
 * ==============================================================================
 * POST-EDIT POLICY & HYGIENE CHECK (postInvocation Hook)
 * ==============================================================================
 * Static deterministic checks on generated or modified files:
 * 1. Prohibition of continuous HTTP polling via setInterval
 * 2. Adaptive styling policy enforcement (Tailwind/NativeWind vs CSS Modules)
 * 3. Debug console.log hygiene warnings
 * 4. KISS complexity & error-handling heuristics (warnings only, 0 dependencies)
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { getHookLabel } from './theme-loader.js';

const policyLabel = () => getHookLabel('policy');
const simLabel = () => getHookLabel('sim');

export const POLICY_RULES = [
  {
    id: 'NO_CONTINUOUS_POLLING',
    name: 'Prohibition of Continuous Polling',
    regex: /setInterval\s*\(\s*(async\s*)?\(\s*\)\s*=>.*(fetch|axios|api\b)/s,
    message: 'Continuous HTTP polling with setInterval is forbidden. Use WebSockets, SSE, or event-driven revalidation.',
    severity: 'ERROR'
  },
  {
    id: 'NO_TAILWIND_IMPORT',
    name: 'Strict CSS3 & StyleSheet Governance',
    regex: /(from\s+['"]tailwindcss['"]|from\s+['"]nativewind['"])/,
    message: 'TailwindCSS/NativeWind are forbidden by project policy. Use CSS Modules (*.module.css) or React Native StyleSheet.create.',
    severity: 'ERROR'
  },
  {
    id: 'NO_RAW_CONSOLE_LOG_PRODUCTION',
    name: 'Clean Code Hygiene',
    regex: /console\.log\s*\(/,
    message: 'Raw console.log left in domain code. Use structured logger or remove before completing.',
    severity: 'WARNING'
  }
];

export const HEALTH_RULES = POLICY_RULES;

export const KISS_DEFAULTS = {
  maxFileLines: 400,
  maxControlNesting: 4,
  maxParams: 5,
  maxFunctionLines: 80
};

export const KISS_RULES = [
  {
    id: 'KISS_EXCESSIVE_FILE_LENGTH',
    name: 'KISS Module Size Limit',
    message: 'Module exceeds recommended line limit. Split responsibilities into smaller cohesive modules.',
    severity: 'WARNING'
  },
  {
    id: 'KISS_DEEP_NESTING',
    name: 'KISS Shallow Control Flow',
    message: 'Deep control-flow nesting detected. Prefer early returns or extract small helper functions.',
    severity: 'WARNING'
  },
  {
    id: 'KISS_EXCESSIVE_PARAMS',
    name: 'KISS Narrow Function Signature',
    message: 'Function accepts too many positional parameters. Prefer an options object or split responsibilities.',
    severity: 'WARNING'
  },
  {
    id: 'KISS_LONG_FUNCTION',
    name: 'KISS Single-Purpose Function Length',
    message: 'Function exceeds recommended length. Break long routines into focused, testable helpers.',
    severity: 'WARNING'
  },
  {
    id: 'KISS_SWALLOWED_ERROR',
    name: 'KISS Explicit Failure Handling',
    message: 'Empty catch block swallows errors silently. Handle the failure explicitly or document intent.',
    severity: 'WARNING'
  }
];

const CODE_EXTENSIONS = new Set([
  '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx',
  '.py', '.go', '.rs', '.java', '.cs', '.kt', '.rb', '.php'
]);

const CLI_CONSOLE_EXEMPT_REGEX = /(?:^|\/)(?:bin|examples|scripts|\.agents\/hooks)\/|(?:^|\/)(?:cli|themes|auditor)\.js$/i;

const CONTROL_KEYWORDS = new Set(['if', 'else', 'for', 'while', 'switch', 'catch', 'with', 'return', 'typeof', 'delete']);

/**
 * Replaces comments and string/template literals with spaces while preserving
 * newline positions so line counts and brace depth remain accurate.
 * @param {string} code
 * @returns {string}
 */
function stripCommentsAndStrings(code = '') {
  const len = code.length;
  const out = [];
  let i = 0;

  while (i < len) {
    const ch = code[i];
    const next = code[i + 1];

    // Block comment /* ... */
    if (ch === '/' && next === '*') {
      out.push(' ', ' ');
      i += 2;
      while (i < len && !(code[i] === '*' && code[i + 1] === '/')) {
        out.push(code[i] === '\n' ? '\n' : ' ');
        i++;
      }
      if (i < len) {
        out.push(' ', ' ');
        i += 2;
      }
      continue;
    }

    // Line comment // ...
    if (ch === '/' && next === '/') {
      while (i < len && code[i] !== '\n') {
        out.push(' ');
        i++;
      }
      continue;
    }

    // String or template literal: '...', "...", `...`
    if (ch === "'" || ch === '"' || ch === '`') {
      const quote = ch;
      out.push(' ');
      i++;
      while (i < len) {
        const cur = code[i];
        if (cur === '\\') {
          out.push(' ');
          i++;
          if (i < len) {
            out.push(code[i] === '\n' ? '\n' : ' ');
            i++;
          }
          continue;
        }
        if (cur === quote) {
          out.push(' ');
          i++;
          break;
        }
        out.push(cur === '\n' ? '\n' : ' ');
        i++;
      }
      continue;
    }

    out.push(ch);
    i++;
  }

  return out.join('');
}

/**
 * @typedef {{ ruleId: string, ruleName: string, message: string, severity: string, file: string }} PolicyIssue
 * @typedef {{
 *   maxFileLines?: number,
 *   maxControlNesting?: number,
 *   maxParams?: number,
 *   maxFunctionLines?: number
 * }} KissOptions
 * @typedef {KissOptions & {
 *   allowTailwind?: boolean,
 *   rigidity?: string,
 *   strictConsoleLog?: boolean,
 *   enableKiss?: boolean
 * }} PolicyCheckOptions
 */

/**
 * Extracts content inside balanced parentheses starting at openIdx.
 * @param {string} text
 * @param {number} openIdx
 * @returns {string}
 */
function extractBalancedParens(text, openIdx) {
  let depth = 0;
  for (let i = openIdx; i < text.length; i++) {
    if (text[i] === '(') depth++;
    else if (text[i] === ')') {
      depth--;
      if (depth === 0) {
        return text.slice(openIdx + 1, i);
      }
    }
  }
  return '';
}

/**
 * Counts top-level comma-separated parameters, ignoring commas inside <>, (), [], {}.
 */
function countTopLevelParams(paramText = '') {
  const trimmed = paramText.trim();
  if (!trimmed) return 0;

  let count = 1;
  let paren = 0;
  let bracket = 0;
  let brace = 0;
  let angle = 0;

  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    const prev = trimmed[i - 1];
    const next = trimmed[i + 1];

    if (ch === '(') paren++;
    else if (ch === ')') paren = Math.max(0, paren - 1);
    else if (ch === '[') bracket++;
    else if (ch === ']') bracket = Math.max(0, bracket - 1);
    else if (ch === '{') brace++;
    else if (ch === '}') brace = Math.max(0, brace - 1);
    else if (ch === '<' && next !== '=' && prev !== '=') angle++;
    else if (ch === '>' && prev !== '=' && angle > 0) angle--;
    else if (ch === ',' && paren === 0 && bracket === 0 && brace === 0 && angle === 0) {
      count++;
    }
  }

  return count;
}

/**
 * Runs deterministic KISS simplicity & complexity heuristics on code content.
 * @param {string} filePath
 * @param {string} [content]
 * @param {KissOptions} [options]
 * @returns {PolicyIssue[]}
 */
export function evaluateKissHeuristics(filePath, content = '', options = {}) {
  const ext = path.extname(String(filePath || '')).toLowerCase();
  if (ext && !CODE_EXTENSIONS.has(ext)) {
    return [];
  }

  const maxFileLines = options.maxFileLines ?? KISS_DEFAULTS.maxFileLines;
  const maxControlNesting = options.maxControlNesting ?? KISS_DEFAULTS.maxControlNesting;
  const maxParams = options.maxParams ?? KISS_DEFAULTS.maxParams;
  const maxFunctionLines = options.maxFunctionLines ?? KISS_DEFAULTS.maxFunctionLines;

  /** @type {PolicyIssue[]} */
  const issues = [];
  /** @param {string} ruleId @param {string} [detail] */
  const pushIssue = (ruleId, detail) => {
    const rule = KISS_RULES.find(r => r.id === ruleId);
    if (!rule) return;
    issues.push({
      ruleId: rule.id,
      ruleName: rule.name,
      message: detail ? `${rule.message} (${detail})` : rule.message,
      severity: rule.severity,
      file: filePath
    });
  };

  // 1. Module length (non-empty lines)
  const rawLines = content.split(/\r?\n/);
  const nonEmptyLines = rawLines.filter(l => l.trim().length > 0).length;
  if (nonEmptyLines > maxFileLines) {
    pushIssue('KISS_EXCESSIVE_FILE_LENGTH', `${nonEmptyLines} > ${maxFileLines} non-empty lines`);
  }

  // 2. Undocumented empty catch blocks (inspected on raw content so catch { /* reason */ } is allowed)
  if (/\bcatch\s*(?:\([^)]*\))?\s*\{\s*\}/.test(content)) {
    pushIssue('KISS_SWALLOWED_ERROR', 'empty catch block');
  }

  // Strip comments and literals for structural parameter, nesting, and length checks
  const stripped = stripCommentsAndStrings(content);

  // 3. Excessive positional parameters
  let maxObservedParams = 0;
  const sigRegex = /(?:^|[^\w$.])(?:function\b\s*[A-Za-z0-9_$]*|def\s+[A-Za-z0-9_]+|(?:const|let|var)\s+[A-Za-z0-9_$]+\s*=\s*(?:async\s*)?|(?:(?:public|private|protected|static|async)\s+)*([A-Za-z_$][A-Za-z0-9_$]*))\s*\(/g;
  let sigMatch;
  while ((sigMatch = sigRegex.exec(stripped)) !== null) {
    const methodName = sigMatch[1];
    if (methodName && CONTROL_KEYWORDS.has(methodName)) {
      continue;
    }
    const openParenIdx = stripped.indexOf('(', sigMatch.index + sigMatch[0].length - 1);
    if (openParenIdx === -1) continue;
    const paramText = extractBalancedParens(stripped, openParenIdx);
    const paramCount = countTopLevelParams(paramText);
    if (paramCount > maxObservedParams) {
      maxObservedParams = paramCount;
    }
  }
  if (maxObservedParams > maxParams) {
    pushIssue('KISS_EXCESSIVE_PARAMS', `${maxObservedParams} > ${maxParams} params`);
  }

  // 4 & 5. Deep control-flow nesting and overly long functions
  const strippedLines = stripped.split(/\r?\n/);
  let braceDepth = 0;
  /** @type {number[]} */
  const controlStack = [];
  /** @type {Array<{ startLine: number, openDepth: number }>} */
  const fnStack = [];
  let maxObservedNesting = 0;
  let maxObservedFnLines = 0;

  for (let idx = 0; idx < strippedLines.length; idx++) {
    const line = strippedLines[idx];
    let pendingControl = /(?:^|[^\w$.])(?:if|for|while|switch|try|catch)\b/.test(line);
    const hasFnSyntax =
      /(?:^|[^\w$.])(?:function\b|=>\s*\{)/.test(line) ||
      /^\s*(?:(?:export|public|private|protected|static|async)\s+)*([A-Za-z_$][A-Za-z0-9_$]*)\s*\([^;]*\)\s*(?::[^{;]+)?\{/.test(line);
    const startsWithControl = /^\s*(?:else\s+)?(?:if|for|while|switch|try|catch)\b/.test(line);
    let pendingFn = hasFnSyntax && !startsWithControl;

    for (let j = 0; j < line.length; j++) {
      const ch = line[j];
      if (ch === '{') {
        braceDepth++;
        if (pendingControl) {
          controlStack.push(braceDepth);
          pendingControl = false;
          if (controlStack.length > maxObservedNesting) {
            maxObservedNesting = controlStack.length;
          }
        }
        if (pendingFn) {
          fnStack.push({ startLine: idx + 1, openDepth: braceDepth });
          pendingFn = false;
        }
      } else if (ch === '}') {
        braceDepth = Math.max(0, braceDepth - 1);
        while (controlStack.length > 0 && controlStack[controlStack.length - 1] > braceDepth) {
          controlStack.pop();
        }
        while (fnStack.length > 0 && fnStack[fnStack.length - 1].openDepth > braceDepth) {
          const fn = fnStack.pop();
          if (!fn) continue;
          const fnLen = (idx + 1) - fn.startLine + 1;
          if (fnLen > maxObservedFnLines) {
            maxObservedFnLines = fnLen;
          }
        }
      }
    }
  }

  if (maxObservedNesting > maxControlNesting) {
    pushIssue('KISS_DEEP_NESTING', `depth ${maxObservedNesting} > ${maxControlNesting}`);
  }
  if (maxObservedFnLines > maxFunctionLines) {
    pushIssue('KISS_LONG_FUNCTION', `${maxObservedFnLines} > ${maxFunctionLines} lines`);
  }

  return issues;
}

/**
 * Scans a file's content against policy rules and KISS simplicity heuristics.
 * @param {string} filePath
 * @param {string} content
 * @param {PolicyCheckOptions} [options]
 * @returns {PolicyIssue[]}
 */
export function checkFilePolicy(filePath, content, options = {}) {
  /** @type {PolicyIssue[]} */
  const issues = [];
  const allowTailwind = options.allowTailwind ?? (process.env.ALLOW_TAILWIND === 'true');
  const rigidity = String(options.rigidity || process.env.SHIELD_RIGIDITY || 'standard').toLowerCase();
  const normalizedPath = String(filePath || '').replace(/\\/g, '/');
  const stripped = stripCommentsAndStrings(content);
  const isCliEntrypoint = CLI_CONSOLE_EXEMPT_REGEX.test(normalizedPath) && options.strictConsoleLog !== true;

  for (const rule of POLICY_RULES) {
    if (rule.id === 'NO_TAILWIND_IMPORT' && allowTailwind) {
      continue;
    }
    if (rule.id === 'NO_RAW_CONSOLE_LOG_PRODUCTION' && isCliEntrypoint) {
      continue;
    }
    const targetText = rule.id === 'NO_TAILWIND_IMPORT' ? content : stripped;
    if (rule.regex.test(targetText)) {
      issues.push({
        ruleId: rule.id,
        ruleName: rule.name,
        message: rule.message,
        severity: rigidity === 'fast-track' && rule.severity === 'ERROR' ? 'WARNING' : rule.severity,
        file: filePath
      });
    }
  }

  if (options.enableKiss !== false) {
    issues.push(...evaluateKissHeuristics(filePath, content, options));
  }

  return issues;
}

export const diagnoseFileContent = checkFilePolicy;

function runSelfTest() {
  console.log(`${simLabel()} ${policyLabel()}: Running post-edit policy check self-test...`);

  const dirtyPollingCode = `
    useEffect(() => {
      const interval = setInterval(async () => {
        await api.get('/workdays');
      }, 5000);
      return () => clearInterval(interval);
    }, []);
  `;

  const tailwindCode = `
    import { twMerge } from 'tailwindcss';
    export const Button = () => <div className="p-4 bg-blue-500" />;
  `;

  const kissViolationCode = `
    export function overComplicated(a, b, c, d, e, f) {
      try {
        if (a) {
          for (const x of b) {
            if (c) {
              while (d) {
                if (e) {
                  return f;
                }
              }
            }
          }
        }
      } catch {}
    }
  `;

  const cleanCode = `
    import styles from './Button.module.css';
    export const Button = () => <button className={styles.primary}>Click</button>;
  `;

  const docTemplateCode = `
    export const doc = \`BAN continuous polling: setInterval(() => fetch('/x'), 1000)\`;
  `;

  const pollIssues = checkFilePolicy('poll.ts', dirtyPollingCode);
  const tailwindIssues = checkFilePolicy('tw.tsx', tailwindCode);
  const kissIssues = checkFilePolicy('complex.ts', kissViolationCode);
  const cleanIssues = checkFilePolicy('clean.tsx', cleanCode);
  const docIssues = checkFilePolicy('generator.js', docTemplateCode);

  let passed = true;

  if (!pollIssues.some(i => i.ruleId === 'NO_CONTINUOUS_POLLING')) {
    console.error('FAILED: Did not catch continuous polling.');
    passed = false;
  } else {
    console.log('CAUGHT continuous polling violation.');
  }

  if (!tailwindIssues.some(i => i.ruleId === 'NO_TAILWIND_IMPORT')) {
    console.error('FAILED: Did not catch forbidden Tailwind import.');
    passed = false;
  } else {
    console.log('CAUGHT forbidden Tailwind import.');
  }

  const hasKissNesting = kissIssues.some(i => i.ruleId === 'KISS_DEEP_NESTING');
  const hasKissParams = kissIssues.some(i => i.ruleId === 'KISS_EXCESSIVE_PARAMS');
  const hasKissCatch = kissIssues.some(i => i.ruleId === 'KISS_SWALLOWED_ERROR');
  if (!hasKissNesting || !hasKissParams || !hasKissCatch) {
    console.error('FAILED: Did not catch KISS complexity/error-handling violations.', kissIssues);
    passed = false;
  } else {
    console.log('CAUGHT KISS heuristics (deep nesting, >5 params, swallowed error).');
  }

  if (cleanIssues.length > 0 || docIssues.length > 0) {
    console.error('FAILED: False positives on clean or template-doc code:', [...cleanIssues, ...docIssues]);
    passed = false;
  } else {
    console.log('CLEAN code passed with 0 policy issues.');
  }

  if (passed) {
    console.log(`${policyLabel()}: All policy checks PASSED.`);
    process.exit(0);
  } else {
    console.error(`${policyLabel()}: Policy check detected anomalies.`);
    process.exit(1);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  if (process.argv.includes('--test')) {
    runSelfTest();
  } else {
    const filesToScan = process.argv.slice(2).filter(f => {
      if (f.startsWith('--') || !fs.existsSync(f)) return false;
      return !/(?:^|\/)\.agents\/hooks\/post-edit-policy-check\.js$/.test(f.replace(/\\/g, '/'));
    });
    /** @type {PolicyIssue[]} */
    let totalIssues = [];

    for (const file of filesToScan) {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const issues = checkFilePolicy(file, content);
        totalIssues = totalIssues.concat(issues);
      } catch {}
    }

    if (totalIssues.length > 0) {
      console.log(JSON.stringify({
        healthy: false,
        issues: totalIssues,
        summary: `Policy check found ${totalIssues.length} issue(s).`
      }, null, 2));

      const hasErrors = totalIssues.some(i => i.severity === 'ERROR');
      process.exit(hasErrors ? 1 : 0);
    } else {
      console.log(JSON.stringify({ healthy: true, issues: [] }));
      process.exit(0);
    }
  }
}
