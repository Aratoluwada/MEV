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
