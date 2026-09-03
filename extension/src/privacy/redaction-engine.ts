import { Detection } from "./pii-detector.js";

export const placeholder = (type: Detection["type"]) => `[${type}]`;
export function visuallyRedact(detection: Detection): void {
  const el = detection.element as HTMLElement & { dataset: DOMStringMap };
  if (el.dataset.agentOrbitRedacted) return;
  el.dataset.agentOrbitRedacted = "true";
  el.dataset.agentOrbitOriginal = detection.value; // stays in this page process; never transmitted
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    el.classList.add("agent-orbit-redacted");
    el.style.webkitTextFillColor = "transparent";
    el.style.textShadow = "0 0 8px #4b5563";
    el.title = `${placeholder(detection.type)} — protected locally`;
  } else {
    el.textContent = placeholder(detection.type);
    el.classList.add("agent-orbit-redacted");
  }
}
