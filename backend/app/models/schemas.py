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
