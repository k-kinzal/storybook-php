# Security Policy

## Runtime Security Updates

The Node.js compatibility range follows [Storybook 10](https://storybook.js.org/docs/releases/migration-guide). Use a maintained Node.js release with current security updates when running Storybook, installing dependencies, or building and publishing this package. The compatibility minimum is not a security baseline.

The [October 21, 2026 Node.js security releases](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases) address the Brotli decoder vulnerability (CVE-2026-111497) and the compromised eMudhra intermediate CA keys. The first fixed versions are 22.23.4, 24.22.1, and 26.12.1 in their respective release lines. Upgrade older or end-of-life Node.js installations to a maintained, patched release and restart running Storybook processes. Updating npm dependencies alone does not update Node.js's decoder or certificate verification.

Repository development, CI, VRT, and publishing share the exact Node.js version in `.nvmrc`. Run `nvm install && nvm use` before working on this repository, and update `.nvmrc` when adopting newer security releases.

Other HTTPS clients used during development and CI, including PHP/Composer, Git, and curl, may use separate trust stores. Apply their vendor's certificate updates as well. On macOS, Apple's browser protections do not cover every CLI trust store; follow [Apple's eMudhra guidance](https://support.apple.com/en-us/149555). Never disable certificate verification to work around a rejected certificate.

## Reporting a Vulnerability

If you discover a security vulnerability in storybook-php, please report it through [GitHub Security Advisories](https://github.com/k-kinzal/storybook-php/security/advisories/new).

**Please do not report security vulnerabilities through public GitHub issues.**

## Scope

storybook-php is a **development tool** that executes PHP code to render components as Storybook stories. By design, it runs arbitrary PHP code in your development environment.

Security concerns in scope include:

- Vulnerabilities in the build pipeline or Vite plugin that could affect the development server
- Issues that could lead to unintended code execution outside the expected PHP rendering flow
- Dependencies with known vulnerabilities

Out of scope:

- The fact that this tool executes PHP code (this is its intended purpose)
- Security of the PHP code written by users in their own stories/components
