# Security Policy

## Supported Versions

The following versions of Modo are currently being supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| 1.0.x   | :x:                |

## Reporting a Vulnerability

We take the security of Modo seriously. If you believe you've found a security vulnerability in the application, please follow these steps to report it:

1. **Do not disclose the vulnerability publicly** until it has been addressed by the maintainers.
2. Email your findings to [security@modo-live.netlify.app](mailto:security@modo-live.netlify.app) or create a private issue on GitHub.
3. Include detailed information about the vulnerability:
   - The type of issue
   - The path or component affected
   - Steps to reproduce
   - Potential impact
   - Suggested fixes (if any)

## What to Expect

- You will receive acknowledgment of your report within 48 hours.
- The team will investigate and provide an initial assessment within 7 days.
- We will keep you informed about the progress towards a fix.
- After the issue is resolved, we may publicly acknowledge your responsible disclosure (unless you prefer to remain anonymous).

## Scope

This security policy covers:
- The Modo web application (modo-live.netlify.app)
- Firebase database security rules
- Authentication mechanisms
- File upload vulnerabilities
- Cross-site scripting (XSS) issues
- Cross-site request forgery (CSRF) issues

## Out of Scope

The following are considered out of scope:
- Issues in third-party services (ImgBB, Firebase, Netlify)
- Social engineering attacks
- Physical security attacks
- DOS/DDOS attacks

## Security Measures

Modo implements several security measures:
- User data is stored in Firebase with proper authentication rules
- Image uploads are handled through ImgBB's secure API
- Authentication is managed through Firebase Authentication
- User passwords are never stored in plaintext

## Responsible Disclosure

We appreciate your efforts to responsibly disclose your findings and will make every effort to acknowledge your contributions. Depending on the severity of the vulnerability, we may offer recognition in our repository or website.

## Updates to this Policy

This security policy may be updated or revised from time to time. The most current version will be posted in the repository.

Last updated: March 23, 2025