"""Copilot Pydantic schemas for VOLTIS AI energy assistant."""

from typing import List
from pydantic import BaseModel, Field


class CopilotRequest(BaseModel):
    """Incoming user message/question for the AI Copilot."""

    message: str = Field(
        ...,
        min_length=1,
        description="User query regarding factory energy consumption, machine performance, alerts, or recommendations.",
    )


class MachineContributor(BaseModel):
    """Machine breakdown of energy increase, waste, or consumption."""

    machine: str = Field(..., description="Machine type or name")
    contribution_percent: float = Field(
        ...,
        description="Calculated percentage contribution to energy increase, excess waste, or total consumption.",
    )


class CopilotResponse(BaseModel):
    """Grounded AI Copilot response matching system-design.md contract."""

    answer: str = Field(
        ...,
        description="Factual, grounded response answering the query based on PostgreSQL database data.",
    )
    contributors: List[MachineContributor] = Field(
        default_factory=list,
        description="Machine-by-machine breakdown of energy impact.",
    )
    recommendations: List[str] = Field(
        default_factory=list,
        description="Actionable recommendations derived from active factory alerts and optimization records.",
    )
