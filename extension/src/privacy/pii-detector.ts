export type PiiType = "PERSON" | "EMAIL" | "PHONE_NUMBER" | "AADHAAR" | "PAN" | "CARD_NUMBER" | "ACCOUNT_NUMBER" | "REDACTED_PASSWORD";
export interface Detection { type: PiiType; confidence: number; selector: string; value: string; label: string; element: Element; }

const patterns: Array<[PiiType, RegExp, number]> = [
  ["EMAIL", /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i, .99],
  ["PHONE_NUMBER", /(?:\+91[\s-]?)?[6-9]\d{9}\b/, .96],
  ["AADHAAR", /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, .94],
  ["PAN", /\b[A-Z]{5}\d{4}[A-Z]\b/i, .98],
  ["CARD_NUMBER", /\b(?:\d[ -]?){13,19}\b/, .92],
  ["ACCOUNT_NUMBER", /\b\d{9,18}\b/, .82]
];

export function cssPath(element: Element): string {
  if (element.id) return `#${CSS.escape(element.id)}`;
  const tag = element.tagName.toLowerCase();
  const name = element.getAttribute("name");
  return name ? `${tag}[name="${CSS.escape(name)}"]` : tag;
}

export function labelFor(element: Element): string {
  const id = element.getAttribute("id");
  const associated = id ? document.querySelector(`label[for="${CSS.escape(id)}"]`) : null;
  return (associated?.textContent || element.getAttribute("aria-label") || element.getAttribute("name") || element.getAttribute("placeholder") || "").trim();
}

export function detectPii(element: Element, value: string): Omit<Detection, "element"> | null {
  const label = labelFor(element);
  const input = element as HTMLInputElement;
  const type = (input.type || "").toLowerCase();
  let result: [PiiType, number] | null = null;
  if (type === "password") result = ["REDACTED_PASSWORD", 1];
  else if (type === "email") result = ["EMAIL", 1];
  else if (/account\s*(number|no)?/i.test(label) && /\d{6,}/.test(value)) result = ["ACCOUNT_NUMBER", .98];
  else for (const [piiType, regex, confidence] of patterns) if (regex.test(value)) { result = [piiType, confidence]; break; }
  if (!result && /^(name|full name|account holder)$/i.test(label) && value.trim()) result = ["PERSON", .78];
  return result ? { type: result[0], confidence: result[1], selector: cssPath(element), value, label } : null;
}
