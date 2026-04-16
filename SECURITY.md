# Security Policy

## Supported branch

This project currently supports security fixes on the latest state of the `wind` branch.

Because the toolkit is still in active pre-v1 development:

- security fixes are applied to the current default branch first
- older snapshots and historical commits should be treated as unsupported
- consumers should stay close to the latest default-branch state

## Reporting a vulnerability

Please prefer **private disclosure**.

Recommended path:

1. Use GitHub's **private vulnerability reporting** for `xepoctpat/wwm_toolkit` if it is enabled.
2. If private reporting is not available yet, do **not** open a public issue with exploit details, secrets, or a weaponized proof of concept.
3. Instead, open a minimal hardening issue only for non-sensitive concerns, or contact the maintainer through GitHub and wait for confirmation before posting technical details publicly.

Please include:

- affected file(s) or feature(s)
- impact summary
- reproduction steps
- whether the issue requires malicious local state, a crafted content pack, or a normal browser session
- any proposed fix if you already have one

## What counts as in scope

Examples of security-relevant findings for this repo include:

- XSS or HTML/script injection through content, local persistence, or imported state
- unsafe file upload or image handling in local map overlays
- dangerous URL handling such as `javascript:` or other unsafe schemes
- dependency vulnerabilities affecting shipped or development workflows
- GitHub Actions or automation supply-chain risks
- insecure persistence or migration logic that could expose or corrupt user data unexpectedly

## What is usually out of scope

The following are generally not treated as security vulnerabilities in this repo by themselves:

- missing rate limits for non-existent backend APIs
- attacks that require a compromised browser extension or a fully compromised local machine
- purely theoretical issues with no plausible exploitation path in the current architecture
- cosmetic lint-only issues with no security impact

## Disclosure expectations

Please give the maintainer reasonable time to investigate and patch before public disclosure.

For confirmed issues, the preferred order is:

1. private report
2. fix prepared and verified
3. coordinated disclosure in release notes, commit history, or advisory notes

## Security posture notes

This toolkit is intentionally:

- offline-first
- static/browser-driven rather than backend-driven
- cautious about third-party assets and copied map content
- built to keep user notes and custom overlays local to the browser

That reduces some categories of risk, but it increases the importance of:

- input sanitization
- safe URL handling
- careful local persistence parsing
- dependency hygiene
- workflow hardening for an open-source repository
