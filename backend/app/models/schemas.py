from enum import Enum
from pydantic import BaseModel, Field

class VerdictEnum(str, Enum):
    REGISTERED_MATCH = "REGISTERED_MATCH"
    REGISTERED_MISMATCH = "REGISTERED_MISMATCH"
    NOT_FOUND = "NOT_FOUND"
    INACTIVE = "INACTIVE"
    UNREADABLE = "UNREADABLE"

class ConfidenceTier(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    CONFLICT = "CONFLICT"

class FieldComparison(BaseModel):
    submitted: str | list[str] | None = None
    registry: str | list[str] | None = None
    matches: bool | None = None
    notes: str | None = None

class ComparisonBreakdown(BaseModel):
    nrn: FieldComparison = Field(default_factory=FieldComparison)
    product_name: FieldComparison = Field(default_factory=FieldComparison)
    active_ingredients: FieldComparison = Field(default_factory=FieldComparison)
    strength: FieldComparison = Field(default_factory=FieldComparison)
    dosage_form: FieldComparison = Field(default_factory=FieldComparison)
    status: FieldComparison = Field(default_factory=FieldComparison)

class ExplanationBlock(BaseModel):
    language: str = Field(default="en", description="'en' for English or 'pcm' for Nigerian Pidgin")
    summary: str
    pidgin_summary: str | None = None
    action_recommendation: str

from app.models.registry import RegistryRecord

class CheckRequest(BaseModel):
    nrn: str | None = Field(default=None, description="NAFDAC Registration Number")
    product_name: str | None = Field(default=None, description="Brand or trade name")
    active_ingredients: list[str] | None = Field(default=None, description="List of active pharmaceutical ingredients")
    strength: str | None = Field(default=None, description="Strength (e.g., '500 mg')")
    dosage_form: str | None = Field(default=None, description="Dosage form (e.g., 'Tablet')")
    language: str = Field(default="en", description="'en' for English, 'pcm' for Nigerian Pidgin")

class CheckResponse(BaseModel):
    verdict: VerdictEnum
    confidence_percentage: int
    confidence_tier: ConfidenceTier
    reasons: list[str] = Field(default_factory=list)
    comparison: ComparisonBreakdown
    matched_record: RegistryRecord | None = None
    explanation: ExplanationBlock
    dataset_metadata: dict | None = None

class TextCheckRequest(BaseModel):
    query: str = Field(..., description="Free-text packaging description")
    language: str = Field(default="en", description="'en' for English or 'pcm' for Nigerian Pidgin")
