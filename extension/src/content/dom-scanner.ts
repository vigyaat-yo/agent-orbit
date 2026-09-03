import { detectPii, Detection } from "../privacy/pii-detector.js";
import { visuallyRedact } from "../privacy/redaction-engine.js";

export interface ScanResult { detections: Detection[]; elements: Element[]; }
export function scanDom(): ScanResult {
  const elements = Array.from(document.querySelectorAll("input, textarea, button, [data-agent-orbit-value]"));
  const detections: Detection[] = [];
  for (const element of elements) {
    const input = element as HTMLInputElement;
    const value = element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement ? input.value : (element.getAttribute("data-agent-orbit-value") || "");
    const result = detectPii(element, value);
    if (result) { const detection = { ...result, element }; detections.push(detection); visuallyRedact(detection); }
  }
  return { detections, elements };
}
