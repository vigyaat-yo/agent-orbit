import { Detection } from "./pii-detector.js";

export interface SanitizedElement { type: string; label: string; value?: string; sensitive: boolean; selector?: string; }
export interface SanitizedContext { page_title: string; elements: SanitizedElement[]; }
export interface AgentRequest { context: SanitizedContext; task: string; }

/** The sole creator of data permitted to cross from page code to the backend. */
export function createSanitizedRequest(task: string, elements: Element[], detections: Detection[]): AgentRequest {
  const byElement = new Map(detections.map(d => [d.element, d]));
  return { task, context: { page_title: document.title, elements: elements.map(element => {
    const input = element as HTMLInputElement;
    const detection = byElement.get(element);
    const label = detection?.label || (element.textContent || input.value || "").trim();
    const kind = element instanceof HTMLButtonElement ? "button" : (input.type || element.tagName.toLowerCase());
    return detection
      ? { type: kind, label, value: `[${detection.type}]`, sensitive: true, selector: detection.selector }
      : { type: kind, label, value: element instanceof HTMLInputElement ? input.value : undefined, sensitive: false };
  }) } };
}
