import { AgentAction } from "./action-parser.js";

const safeSelector = (selector: string) => !/[;{}]|javascript:/i.test(selector);
function findTarget(target: NonNullable<AgentAction["target"]>): HTMLElement | null {
  if (target.selector && safeSelector(target.selector)) return document.querySelector(target.selector) as HTMLElement | null;
  const needle = target.text?.trim().toLowerCase();
  if (!needle) return null;
  return Array.from(document.querySelectorAll<HTMLElement>("button, input[type=submit], a, [role=button], input, textarea"))
    .find(el => ((el.innerText || (el as HTMLInputElement).value || el.getAttribute("aria-label") || "").trim().toLowerCase() === needle)) || null;
}
export function executeAction(action: AgentAction): string {
  if (action.action === "scroll") { window.scrollBy({ top: action.direction === "up" ? -500 : 500, behavior: "smooth" }); return `SCROLL ${action.direction || "down"}`; }
  if (action.action === "inspect") return "INSPECT page";
  const target = action.target ? findTarget(action.target) : null;
  if (!target) throw new Error("Safe local target not found");
  if (action.action === "focus") { target.focus(); return `FOCUS ${action.target?.text || "target"}`; }
  target.click(); return `CLICK ${action.target?.text || "target"}`;
}
