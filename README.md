# Agent Orbit — SIH 2026 MVP

Agent Orbit is a privacy-preserving, on-device browser-agent prototype for SIH26171, **On-device Visual Perception for Light-weight Browser Agents** (ISRO). This is an MVP built for a reliable local demonstration, not a production banking product.

## Solution and privacy model

The Chrome extension scans the current page locally, detects PII from DOM semantics, input types, and regexes, and visually masks it. A dedicated Privacy Gate produces a separate sanitized page representation. It is the only request shape accepted for server planning. Raw page values and original password/input values remain in the browser tab and are never sent to FastAPI.

```text
Webpage → local PII scan/redaction → sanitized context → local FastAPI planner
        ← safe structured action ←                             ↓
                  local validated DOM execution ←───────────────┘
```

The server returns only allowlisted structured actions (`click`, `scroll`, `focus`, `inspect`), never executable JavaScript. The content script validates each returned action and resolves targets locally.

## Tech stack

TypeScript, Chrome Extension Manifest V3, DOM APIs, MutationObserver, Chrome Storage; Python FastAPI/Uvicorn; and a local `VisualDetector` abstraction ready for future ONNX Runtime Web/WebGPU integration.

## Install and run (Windows)

Backend, from the project root:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r server\requirements.txt
cd server
uvicorn main:app --reload --port 8000
```

If PowerShell blocks activation, run `Set-ExecutionPolicy -Scope Process Bypass`, then activate again.

Extension, in a second terminal from the project root:

```powershell
cd extension
npm.cmd install
npm.cmd run build
```

Load it in Chrome: open `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and select `AGENT-ORBIT\extension\dist`.

## Demo

Serve the root with `python -m http.server 8080`, then open `http://localhost:8080/demo/banking.html` in Chrome. Reload the page after loading the extension. (If you open the file directly instead, enable **Allow access to file URLs** in the extension’s Details page.) Inputs for name, email, phone, account number, and password are detected and visually protected. Click the extension icon, enter **Submit the form**, and click **Run**.

The popup’s **DATA SENT TO SERVER** panel is the network privacy proof: it shows placeholders such as `[EMAIL]` and `[REDACTED_PASSWORD]`, never raw values. The page will show the local submit result and the content script displays `Agent executed: CLICK Submit`.

Example planner request (sanitized):

```json
{"task":"Submit the form","context":{"page_title":"Secure Banking","elements":[{"type":"email","label":"Email","value":"[EMAIL]","sensitive":true},{"type":"button","label":"Submit","sensitive":false}]}}
```

Response:

```json
{"action":"click","target":{"text":"Submit"},"direction":null}
```

## Project layout

`extension/` is the MV3 browser agent, `server/` the local planner, `demo/` the safe fake banking page, and `docs/architecture.md` the design note.

## Known limitations and next SIH steps

This MVP uses DOM-first detection and has a no-op local visual fallback; text rendered solely in images/canvas is not detected. Regex classifications are intentionally simple and may need locale-specific tuning. The planner is deterministic and only recognizes a small command set. Next: package a quantized local ONNX visual model, add screenshot-region masking, improve semantic/entity classification, introduce per-action user confirmation, and add robust audit export—all while preserving the sanitized-only server boundary.
