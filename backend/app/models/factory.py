from sqlalchemy import Column, String, Float, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base


class Factory(Base):
    __tablename__ = "factories"

    id = Column(String(100), primary_key=True)
    name = Column(String(255), nullable=False)
    industry = Column(String(100), nullable=True)
    location = Column(String(255), nullable=True)
    production_capacity = Column(Float, nullable=True)
    electricity_tariff = Column(Float, nullable=False, default=8.0)  # INR / kWh
    production_target = Column(Float, nullable=True)
    operating_hours = Column(Float, nullable=True, default=24.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    machines = relationship("Machine", back_populates="factory", cascade="all, delete-orphan")
    production_records = relationship("ProductionRecord", back_populates="factory", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Factory(id='{self.id}', name='{self.name}')>"
