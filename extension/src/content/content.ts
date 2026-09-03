import { scanDom, ScanResult } from "./dom-scanner.js";
import { observePage } from "./page-observer.js";
import { createSanitizedRequest } from "../privacy/privacy-gate.js";
import { parseAction } from "../agent/action-parser.js";
import { validateAction } from "../agent/action-validator.js";
import { executeAction } from "../agent/action-executor.js";
import { LocalVisualFallback } from "../vision/visual-detector.js";

let result: ScanResult = { detections: [], elements: [] };
const log = (message: string) => chrome.storage.local.get({ eventLog: [] }, data => chrome.storage.local.set({ eventLog: [`[${new Date().toLocaleTimeString()}] ${message}`, ...data.eventLog].slice(0, 30) }));
function scan(): void { result = scanDom(); chrome.storage.local.set({ piiDetected: result.detections.length, piiRedacted: result.detections.length, status: "Protected", localProcessing: "ACTIVE ✓" }); log(`${result.detections.length} sensitive elements detected; local redaction completed`); }
function toast(message: string): void { const el = document.createElement("div"); el.textContent = `Agent executed: ${message}`; Object.assign(el.style, { position: "fixed", right: "22px", bottom: "22px", zIndex: "2147483647", background: "#102a43", color: "white", padding: "14px 18px", borderRadius: "10px", font: "600 14px system-ui", boxShadow: "0 8px 30px #0005" }); document.documentElement.append(el); setTimeout(() => el.remove(), 4500); }

function initialize(): void {
  scan();
  observePage(scan);
  new LocalVisualFallback().detect();
  log("Page scanned");
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
else initialize();
chrome.runtime.onMessage.addListener((message, _sender, reply) => {
  if (message?.kind !== "RUN_AGENT") return;
  const request = createSanitizedRequest(message.task || "Inspect the page", result.elements, result.detections);
  chrome.storage.local.set({ lastSentPayload: request }); log("Sanitized context generated; context sent to local server");
  chrome.runtime.sendMessage({ kind: "SANITIZED_AGENT_REQUEST", request }, response => {
    if (response?.error) { log(`Server error: ${response.error}`); reply(response); return; }
    const action = parseAction(response.action);
    if (!validateAction(action)) { log("Unsafe action rejected"); reply({ error: "Unsafe action rejected" }); return; }
    try { const summary = executeAction(action); chrome.storage.local.set({ lastAction: summary }); log(`Action received: ${summary}; action executed locally`); toast(summary); reply({ action: summary }); } catch (error) { reply({ error: error instanceof Error ? error.message : "Action failed" }); }
  });
  return true;
});
