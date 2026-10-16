from enum import StrEnum
from pydantic import BaseModel, Field

from app.models.registry import RegistryRecord


class VerdictEnum(StrEnum):
    REGISTERED_MATCH = "REGISTERED_MATCH"
    REGISTERED_MISMATCH = "REGISTERED_MISMATCH"
    INACTIVE = "INACTIVE"
    NOT_FOUND = "NOT_FOUND"
    UNREADABLE = "UNREADABLE"


class ConfidenceTier(StrEnum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    CONFLICT = "CONFLICT"


class CheckRequest(BaseModel):
    nrn: str | None = Field(default=None, description="NAFDAC Registration Number as printed on the label")
    product_name: str | None = Field(default=None, description="Brand or trade name as printed on label")
    active_ingredients: list[str] | None = Field(default=None, description="Active pharmaceutical ingredients")
    strength: str | None = Field(default=None, description="Strength (e.g., 500mg, 80/480mg)")
    dosage_form: str | None = Field(default=None, description="Dosage form (e.g., Tablet, Capsule, Syrup)")
    language: str = Field(default="en", description="Explanation language: 'en' for English or 'pcm' for Nigerian Pidgin")


class TextCheckRequest(BaseModel):
    query: str = Field(..., description="Free-form user text, message, or transcribed speech")
    language: str = Field(default="en", description="Explanation language: 'en' for English or 'pcm' for Nigerian Pidgin")


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
    language: str = "en"
    summary: str
    pidgin_summary: str | None = None
    action_recommendation: str


class DatasetMetadata(BaseModel):
    source: str = "NAFDAC Greenbook"
    snapshot_date: str = "2026-10-16T13:48:56+00:00"
    records_loaded: int = 7460
    disclaimer: str = (
        "This tool provides a registry cross-check against the official NAFDAC Greenbook snapshot, "
        "not a clinical test of physical medicine authenticity, chemical composition, or safety."
    )


class CheckResponse(BaseModel):
    verdict: VerdictEnum
    confidence_percentage: int = Field(ge=0, le=100)
    confidence_tier: ConfidenceTier
    reasons: list[str] = Field(default_factory=list)
    comparison: ComparisonBreakdown
    matched_record: RegistryRecord | None = None
    explanation: ExplanationBlock
    dataset_metadata: DatasetMetadata = Field(default_factory=DatasetMetadata)


class BasketCheckRequest(BaseModel):
    nrns: list[str] = Field(default_factory=list, description="List of NAFDAC numbers in patient's basket")
    product_names: list[str] = Field(default_factory=list, description="List of product names in patient's basket")


class DuplicateIngredientAlert(BaseModel):
    ingredient: str
    conflicting_products: list[str]
    warning: str


class BasketCheckResponse(BaseModel):
    total_medicines_checked: int
    has_duplicate_ingredients: bool
    alerts: list[DuplicateIngredientAlert] = Field(default_factory=list)
    disclaimer: str = (
        "Basket checks detect duplicate active ingredients across medicines to help prevent accidental overdose. "
        "Always follow prescribing advice from a doctor or pharmacist."
    )
