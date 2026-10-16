from datetime import date
from enum import StrEnum
from pydantic import BaseModel, Field


class RecordStatus(StrEnum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    SUSPENDED = "SUSPENDED"
    EXPIRED = "EXPIRED"


class RegistryRecord(BaseModel):
    id: int | None = None
    nrn: str = Field(description="NAFDAC Registration Number (e.g. 04-1234, A4-0199)")
    normalized_nrn: str = Field(description="Normalized alphanumeric NRN for indexing")
    product_name: str = Field(description="Brand or trade name as registered")
    generic_name: str = Field(description="Generic chemical or pharmacological name")
    active_ingredients: list[str] = Field(default_factory=list, description="List of active pharmaceutical ingredients")
    strength: str = Field(description="Dosage strength (e.g. 500 mg, 80mg/480mg)")
    dosage_form: str = Field(description="Form of drug: Tablet, Capsule, Syrup, etc.")
    manufacturer: str | None = Field(default=None, description="Manufacturer when explicitly provided by the registry")
    applicant_name: str | None = Field(default=None, description="Applicant listed in the registry; not necessarily the manufacturer")
    country_of_origin: str = Field(default="Nigeria", description="Country of manufacturing origin")
    status: RecordStatus = Field(default=RecordStatus.ACTIVE, description="Registration status")
    status_reason: str | None = Field(default=None, description="Reason if status is not ACTIVE (e.g. expired, revoked)")
    approval_date: str | None = Field(default=None, description="Date initially registered (YYYY-MM-DD)")
    expiry_date: str | None = Field(default=None, description="Date registration expires (YYYY-MM-DD)")
    dataset_source: str = Field(default="NAFDAC Sample Snapshot", description="Source provenance of the record")
    dataset_date: str = Field(default="2024-06-01", description="Date this dataset snapshot was captured")
