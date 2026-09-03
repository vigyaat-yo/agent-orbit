from typing import Literal, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="Agent Orbit Local Planner", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost", "http://127.0.0.1", "null"],
    allow_origin_regex=r"chrome-extension://.*",
    allow_credentials=False,
    allow_methods=["POST"],
    allow_headers=["*"],
)

class PageElement(BaseModel):
    type: str
    label: str
    value: Optional[str] = None
    sensitive: bool
    selector: Optional[str] = None

class SanitizedContext(BaseModel):
    page_title: str
    elements: list[PageElement]

class AgentRequest(BaseModel):
    context: SanitizedContext
    task: str = Field(min_length=1, max_length=500)

class Target(BaseModel):
    text: Optional[str] = None
    selector: Optional[str] = None

class AgentAction(BaseModel):
    action: Literal["click", "scroll", "focus", "inspect"]
    target: Optional[Target] = None
    direction: Optional[Literal["up", "down"]] = None

def plan(task: str, elements: list[PageElement]) -> AgentAction:
    """Deterministic MVP planner. It never receives raw browser PII."""
    normalized = task.lower()
    if "scroll" in normalized:
        return AgentAction(action="scroll", direction="up" if "up" in normalized else "down")
    if "inspect" in normalized or "look" in normalized:
        return AgentAction(action="inspect")
    for keyword in ("submit", "continue", "show balance"):
        if keyword in normalized:
            matching = next((e for e in elements if e.type == "button" and keyword in e.label.lower()), None)
            if matching:
                return AgentAction(action="click", target=Target(text=matching.label))
    if "focus" in normalized:
        for element in elements:
            if element.type not in ("button", "submit") and element.label:
                return AgentAction(action="focus", target=Target(text=element.label))
    raise HTTPException(status_code=422, detail="I can safely click Submit/Continue/Show Balance, scroll, focus, or inspect.")

@app.post("/agent", response_model=AgentAction)
def agent(request: AgentRequest) -> AgentAction:
    return plan(request.task, request.context.elements)

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "privacy": "sanitized-context-only"}
