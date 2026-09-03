# Agent Orbit MVP architecture

```text
Web page DOM → content scanner → local PII detector/redaction
                                 ↓
                           Privacy Gate (sanitized JSON only)
                                 ↓
Chrome service worker → localhost FastAPI planner → action JSON
                                 ↓
content action validator → allowlisted local DOM executor
```

The raw DOM and original input values never leave the tab. Redaction changes display only for inputs, preserving their values for browser-side interaction. The FastAPI server accepts a strict Pydantic schema and returns only `click`, `scroll`, `focus`, or `inspect` actions; it cannot return JavaScript.

`VisualDetector` is deliberately isolated behind an interface. The current `LocalVisualFallback` is a local no-op suitable for an immediate DOM-first demo. A bundled ONNX Runtime Web/WebGPU detector can replace it without changing the privacy gate or server contract.
