import { callLocalAgent } from "../network/api-client.js";
import { AgentRequest } from "../privacy/privacy-gate.js";

chrome.runtime.onMessage.addListener((message, _sender, reply) => {
  if (message?.kind !== "SANITIZED_AGENT_REQUEST") return;
  const request = message.request as AgentRequest;
  // Only privacy-gate-shaped, sanitized context messages are accepted here.
  if (!request?.context?.page_title || !Array.isArray(request.context.elements) || typeof request.task !== "string") { reply({ error: "Privacy gate rejected request" }); return; }
  chrome.storage.local.set({ lastSentPayload: request });
  callLocalAgent(request).then(action => reply({ action })).catch(error => reply({ error: error.message }));
  return true;
});
