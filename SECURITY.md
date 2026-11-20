# Security Policy

## Supported Versions

We actively provide security fixes and guardrail updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| < 2.0.0 | :x:                |

## Reporting a Vulnerability

The ISS-Enterprise maintainer team takes security seriously. If you discover a vulnerability, please report it responsibly.

### Private Vulnerability Reporting (Recommended)

Please submit your report through GitHub's **Private Vulnerability Reporting**:
[Report a Security Vulnerability](https://github.com/favioCesarJuan/ISS-Enterprise/security/advisories/new)

Submitting through this private channel ensures:
- The issue stays confidential until a patch is developed and verified.
- Direct collaboration with the maintainer inside a private advisory workspace.

### What to Include in Your Report
1. Clear description of the potential vulnerability.
2. Minimal Proof of Concept (PoC) or reproducible steps.
3. Affected component or hook (e.g., `pre-tool-shell-guard.js`, `generator.js`, `skill-engine.js`, CLI commands).
4. Any suggested remediation or mitigation.

### Response Timeline
- **Initial Acknowledgment**: Within 48 hours.
- **Triage and Assessment**: Within 5 business days.
- **Patch Release**: Coordinated as soon as validation passes automated CI security checks.
