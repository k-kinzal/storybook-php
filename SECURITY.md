# Security Policy

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
