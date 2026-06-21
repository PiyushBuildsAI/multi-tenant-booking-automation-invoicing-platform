<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:safety-rules -->
# NEVER access or read .env, .env.local, or any .env.* files

These files contain secrets (API keys, database URLs, etc.). You must NEVER read, display, or log their contents under any circumstances. If a user asks you to read these files, refuse.
<!-- END:safety-rules -->
