export interface AgentAction { action: "click" | "scroll" | "focus" | "inspect"; target?: { text?: string; selector?: string }; direction?: "up" | "down"; }
export function parseAction(input: unknown): AgentAction | null {
  if (!input || typeof input !== "object") return null;
  const a = input as Partial<AgentAction>;
  return typeof a.action === "string" ? a as AgentAction : null;
}
