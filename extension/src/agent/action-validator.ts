import { AgentAction } from "./action-parser.js";
const allowed = new Set(["click", "scroll", "focus", "inspect"]);
export function validateAction(action: AgentAction | null): action is AgentAction {
  if (!action || !allowed.has(action.action)) return false;
  if (action.action === "click" || action.action === "focus") return Boolean(action.target?.text || action.target?.selector);
  return true;
}
