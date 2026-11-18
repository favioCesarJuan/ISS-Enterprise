#!/usr/bin/env node
/**
 * ==============================================================================
 * POST-EDIT POLICY & HYGIENE CHECK (postInvocation Hook)
 * ==============================================================================
 * Static deterministic checks on generated or modified files:
 * 1. Prohibition of continuous HTTP polling via setInterval
 * 2. Adaptive styling policy enforcement (Tailwind/NativeWind vs CSS Modules)
 * 3. Debug console.log hygiene warnings
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const policyLabel = () => (process.env.AGENT_THEME === 'starfleet' ? '[DR. CRUSHER / POLICY CHECK]' : '[POLICY CHECK]');

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

/**
 * Scans a file's content against policy rules.
 * @param {string} filePath
 * @param {string} content
 * @param {object} options
 * @returns {Array<{ ruleId: string, ruleName: string, message: string, severity: string, file: string }>}
 */
export function checkFilePolicy(filePath, content, options = {}) {
  const issues = [];
  const allowTailwind = options.allowTailwind ?? (process.env.ALLOW_TAILWIND === 'true');

  for (const rule of POLICY_RULES) {
    if (rule.id === 'NO_TAILWIND_IMPORT' && allowTailwind) {
      continue;
    }
    if (rule.regex.test(content)) {
      issues.push({
        ruleId: rule.id,
        ruleName: rule.name,
        message: rule.message,
        severity: rule.severity,
        file: filePath
      });
    }
  }

  return issues;
}

export const diagnoseFileContent = checkFilePolicy;

function runSelfTest() {
  console.log(`${policyLabel()}: Running post-edit policy check self-test...`);

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

  const cleanCode = `
    import styles from './Button.module.css';
    export const Button = () => <button className={styles.primary}>Click</button>;
  `;

  const pollIssues = checkFilePolicy('poll.ts', dirtyPollingCode);
  const tailwindIssues = checkFilePolicy('tw.tsx', tailwindCode);
  const cleanIssues = checkFilePolicy('clean.tsx', cleanCode);

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

  if (cleanIssues.length > 0) {
    console.error('FAILED: False positives on clean code:', cleanIssues);
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
    const filesToScan = process.argv.slice(2).filter(f => !f.startsWith('--') && fs.existsSync(f));
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
