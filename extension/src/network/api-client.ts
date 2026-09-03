import { AgentRequest } from "../privacy/privacy-gate.js";
export async function callLocalAgent(request: AgentRequest): Promise<unknown> {
  const response = await fetch("http://127.0.0.1:8000/agent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(request) });
  if (!response.ok) throw new Error(`Local server error: ${response.status}`);
  return response.json();
}
