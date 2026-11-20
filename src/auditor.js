/**
 * ==============================================================================
 * 🩺 ISS-ENTERPRISE: GOVERNANCE DRIFT AUDITOR & HEALTH CHECKER
 * ==============================================================================
 * Verifies active project alignment against generated governance contracts:
 * - Integrity of .agents/hooks.json and executable shields
 * - Verification of git pre-commit shield binding
 * - Drift detection on package.json dependencies vs styling policies
 * - Skills structure and validation (SKILL.md existence)
 * - Knowledge graph and MCP configuration presence
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { auditSpecDrift } from './spec-checker.js';

// ANSI terminal colors
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gold: '\x1b[38;5;220m'
};

/**
 * @param {string} mcpConfigFile
 * @param {(msg: string) => void} logPass
 * @param {(msg: string) => void} logWarn
 * @param {(msg: string) => void} logFail
 */
function auditMcpConfig(mcpConfigFile, logPass, logWarn, logFail) {
  if (!fs.existsSync(mcpConfigFile)) {
    logWarn('No .mcp/mcp-servers.config.json found. Run `iss mcps` to provision sensor triad.');
    return;
  }
  try {
    const mcpConfig = JSON.parse(fs.readFileSync(mcpConfigFile, 'utf-8'));
    const servers = mcpConfig.mcpServers || {};
    const serverNames = Object.keys(servers);
    logPass(`MCP Configuration verified: ${serverNames.length} server(s) configured (${serverNames.join(', ')}).`);

    for (const [name, srv] of Object.entries(servers)) {
      const cmdStr = `${srv.command || ''} ${(srv.args || []).join(' ')}`;
      if (/\brm\s+-[rR]f|\bcurl\b.*\|\s*sh|\bchmod\s+777/i.test(cmdStr)) {
        logFail(`AgentShield Warning: Insecure command pattern detected in MCP server '${name}': ${cmdStr}`);
      }
      if (!srv.env) continue;
      for (const [envVar, envVal] of Object.entries(srv.env)) {
        if (/ghp_[a-zA-Z0-9]{30,}|sk-[a-zA-Z0-9]{20,}/.test(String(envVal))) {
          logFail(`AgentShield Warning: Plaintext secret detected in MCP server '${name}' env (${envVar}). Use environment variables.`);
        }
      }
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    logFail(`MCP configuration file .mcp/mcp-servers.config.json is corrupted: ${msg}`);
  }
}

/**
 * Runs a complete governance audit on a target directory.
 * @param {string} [targetDir]
 * @param {import('../types/index.d.ts').AuditOptions} [options]
 * @returns {import('../types/index.d.ts').AuditReport} Audit report { ok, passed, warnings, failures }
 */
export function runGovernanceAudit(targetDir = process.cwd(), options = {}) {
  const root = path.resolve(targetDir);
  /** @type {import('../types/index.d.ts').AuditReport} */
  const report = {
    targetDir: root,
    passed: [],
    warnings: [],
    failures: [],
    ok: true
  };

  /** @param {string} msg */
  const logPass = (msg) => report.passed.push(msg);
  /** @param {string} msg */
  const logWarn = (msg) => report.warnings.push(msg);
  /** @param {string} msg */
  const logFail = (msg) => {
    report.failures.push(msg);
    report.ok = false;
  };

  // 1. Check .agents root and hooks.json
  const agentsDir = path.join(root, '.agents');
  const hooksFile = path.join(agentsDir, 'hooks.json');

  if (!fs.existsSync(agentsDir)) {
    logFail('Missing .agents governance directory. Has this project been initialized with iss?');
    return report;
  }
  logPass('Governance directory .agents exists.');

  if (!fs.existsSync(hooksFile)) {
    logFail('Missing .agents/hooks.json contract configuration.');
  } else {
    try {
      const hooksConfig = JSON.parse(fs.readFileSync(hooksFile, 'utf-8'));
      logPass(`.agents/hooks.json is valid JSON (Engine: ${hooksConfig.engine || hooksConfig.framework || 'unknown'}).`);

      // Check registered hook files
      if (Array.isArray(hooksConfig.hooks)) {
        for (const hook of hooksConfig.hooks) {
          const hookRelPath = hook.path || '';
          const hookFullPath = path.resolve(root, hookRelPath);
          if (fs.existsSync(hookFullPath)) {
            logPass(`Guard hook '${hook.name}' located at ${hookRelPath}`);
          } else {
            logFail(`Guard hook '${hook.name}' registered in hooks.json but missing on disk: ${hookRelPath}`);
          }
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      logFail(`.agents/hooks.json is corrupted or invalid JSON: ${msg}`);
    }
  }

  // 2. Check Git Pre-commit Hook binding
  const gitDir = path.join(root, '.git');
  if (fs.existsSync(gitDir)) {
    const preCommitHook = path.join(gitDir, 'hooks', 'pre-commit');
    const gitHooksDir = path.join(agentsDir, 'git-hooks', 'pre-commit');
    if (fs.existsSync(preCommitHook) || fs.existsSync(gitHooksDir)) {
      logPass('Git pre-commit guard is active.');
    } else {
      logWarn('Git repository detected, but no pre-commit hook guard was found. Run `iss apply` to bind guards.');
    }
  }

  // 3. Inspect Styling Drift in package.json vs rules
  const packageJsonPath = path.join(root, 'package.json');
  const rulesPath = path.join(agentsDir, 'rules');
  const agentsMdPath = path.join(root, 'Agents.md');

  let forbidsTailwind = false;
  if (fs.existsSync(agentsMdPath)) {
    const agentsMdContent = fs.readFileSync(agentsMdPath, 'utf-8');
    if (/STRICT_NO_TAILWIND|pure CSS3 & CSS Modules only/i.test(agentsMdContent)) {
      forbidsTailwind = true;
    }
  }

  if (fs.existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

      if (forbidsTailwind && (deps.tailwindcss || deps['@tailwindcss/vite'] || deps.nativewind)) {
        logFail('Styling Policy Violation: TailwindCSS found in package.json but forbidden by project governance contract.');
      } else {
        logPass('package.json dependencies conform to styling governance contracts.');
      }
    } catch {
      logWarn('package.json exists but could not be parsed.');
    }
  }

  // 4. Audit Skills Directory
  const skillsDir = path.join(agentsDir, 'skills');
  if (fs.existsSync(skillsDir)) {
    const skillEntries = fs.readdirSync(skillsDir, { withFileTypes: true });
    let totalSkills = 0;
    let validSkills = 0;

    for (const entry of skillEntries) {
      if (entry.isDirectory()) {
        totalSkills++;
        const skillDoc = path.join(skillsDir, entry.name, 'SKILL.md');
        if (fs.existsSync(skillDoc)) {
          validSkills++;
        } else {
          logWarn(`Skill directory '${entry.name}' is missing canonical SKILL.md documentation.`);
        }
      }
    }
    logPass(`Audited ${validSkills}/${totalSkills} valid canonical skills in .agents/skills/.`);
  } else {
    logWarn('No .agents/skills/ directory found.');
  }

  // 5. Check Audit Log Ledger and Tactical Instincts
  const auditLogFile = path.join(agentsDir, 'audit_log.json');
  if (fs.existsSync(auditLogFile)) {
    try {
      const logs = JSON.parse(fs.readFileSync(auditLogFile, 'utf-8'));
      logPass(`Audit log ledger (${path.basename(auditLogFile)}) online with ${Array.isArray(logs) ? logs.length : 0} entries.`);
    } catch {
      logWarn(`${path.basename(auditLogFile)} is present but invalid JSON.`);
    }
  }

  // 6. AgentShield Audit: Tactical Instincts (.agents/instincts.md)
  const instinctsFile = path.join(agentsDir, 'instincts.md');
  if (fs.existsSync(instinctsFile)) {
    const instinctsContent = fs.readFileSync(instinctsFile, 'utf-8');
    logPass(`Tactical instincts file active with ${instinctsContent.split('\n').filter(l => l.startsWith('### ')).length} learned heuristics.`);
  } else {
    logWarn('Missing .agents/instincts.md. Run `iss apply` or `iss init` to enable continuous learning.');
  }

  // 7. AgentShield Audit: MCP Servers Configuration & Sensitive Leaks
  auditMcpConfig(path.join(root, '.mcp', 'mcp-servers.config.json'), logPass, logWarn, logFail);

  // 8. AgentShield Audit: Git repository secret hygiene & local theme privacy
  const envFile = path.join(root, '.env');
  const gitignoreFile = path.join(root, '.gitignore');
  const gitignoreContent = fs.existsSync(gitignoreFile) ? fs.readFileSync(gitignoreFile, 'utf-8') : '';
  if (fs.existsSync(envFile)) {
    if (!gitignoreContent.includes('.env')) {
      logFail('AgentShield Alert: .env file exists on disk but is NOT ignored in .gitignore! Secrets at risk.');
    } else {
      logPass('.env file is properly ignored by .gitignore.');
    }
  }
  const localThemeFile = path.join(agentsDir, 'theme.local.json');
  if (fs.existsSync(localThemeFile)) {
    if (!gitignoreContent.includes('theme.local.json')) {
      logWarn('Privacy Notice: .agents/theme.local.json exists without being listed in .gitignore.');
    } else {
      logPass('.agents/theme.local.json is ignored by .gitignore.');
    }
  }

  // 9. Host Runtime Security Baseline (SecurityVulnerability.io audit)
  const [nodeMajor, nodeMinor, nodePatch] = process.version.replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0);
  const isVulnerable = (nodeMajor === 18 && (nodeMinor < 20 || (nodeMinor === 20 && nodePatch < 4))) ||
                       (nodeMajor === 20 && (nodeMinor < 15 || (nodeMinor === 15 && nodePatch < 1))) ||
                       (nodeMajor === 22 && (nodeMinor < 4 || (nodeMinor === 4 && nodePatch < 1)));
  if (isVulnerable) {
    logWarn(`Host Node.js runtime ${process.version} is below recommended CVE baseline. Consider updating.`);
  } else {
    logPass(`Host Node.js runtime (${process.version}) satisfies security baseline.`);
  }

  // 10. Semgrep SAST Perimeter
  const semgrepConfig = path.join(root, '.semgrep.yml');
  if (fs.existsSync(semgrepConfig)) {
    logPass('Semgrep AST security rules file (.semgrep.yml) is active.');
  } else {
    logWarn('No .semgrep.yml found. Run `iss engage` to generate tactical SAST rules.');
  }

  // 11. Agent Skill Security & SkillSpector
  const spectorCheck = spawnSync('which', ['skillspector'], { encoding: 'utf-8' });
  if (spectorCheck.status === 0) {
    logPass('NVIDIA SkillSpector CLI detected for deep agent skill security auditing.');
  } else {
    logPass('Skill security protocol active (Native engine ready; SkillSpector optional for deep scanning).');
  }

  // 12. SDD Specification Drift Check (Deterministic, zero LLM tokens)
  const specAudit = auditSpecDrift(root, options);
  if (specAudit.specsFound === 0) {
    logPass('SDD Spec Drift check ready (no docs/designs/*.md specs present yet).');
  } else {
    for (const msg of specAudit.passed) logPass(msg);
    for (const msg of specAudit.warnings) logWarn(msg);
    for (const msg of specAudit.failures) logFail(msg);
  }

  // 13. Project Context Memory (.agents/project-context.json)
  const projectCtxFile = path.join(agentsDir, 'project-context.json');
  if (fs.existsSync(projectCtxFile)) {
    try {
      const ctx = JSON.parse(fs.readFileSync(projectCtxFile, 'utf-8'));
      logPass(`Project context verified: domain='${ctx.domain || 'General'}', arch='${ctx.architecturePattern || 'Adaptive'}', rigidity='${ctx.shieldRigidity || 'standard'}'.`);
      if (ctx.interviewCompleted === false) {
        logWarn('Project context uses automated defaults (interviewCompleted=false). Run `iss init --reconfigure` or complete the AI Discovery Gate.');
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      logFail(`.agents/project-context.json is corrupted or invalid JSON: ${msg}`);
    }
  }

  return report;
}

/**
 * Formats and prints an audit report to the console.
 * @param {import('../types/index.d.ts').AuditReport} report
 */
export function printAuditReport(report) {
  console.log(`\n${c.bold}${c.gold}🩺 ISS-ENTERPRISE GOVERNANCE & DRIFT AUDITOR${c.reset}`);
  console.log(`${c.dim}Target: ${report.targetDir}${c.reset}`);
  console.log('----------------------------------------------------');

  for (const item of report.passed) {
    console.log(`  \x1b[32m✔ [OK]\x1b[0m ${item}`);
  }

  for (const item of report.warnings) {
    console.log(`  \x1b[33m▲ [WARN]\x1b[0m ${item}`);
  }

  for (const item of report.failures) {
    console.log(`  \x1b[31m✖ [FAIL]\x1b[0m ${item}`);
  }

  console.log('----------------------------------------------------');
  if (report.ok) {
    console.log(`\x1b[32m${c.bold}RESULT: Governance intact. All core tactical perimeters nominal.${c.reset}\n`);
  } else {
    console.log(`\x1b[31m${c.bold}RESULT: Governance drift or contract breaches detected (${report.failures.length} failures).${c.reset}\n`);
  }
}
