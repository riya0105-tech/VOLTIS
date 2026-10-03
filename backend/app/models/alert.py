from sqlalchemy import Column, String, Text, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String(100), primary_key=True)  # e.g., 'alert_001'
    machine_id = Column(String(100), ForeignKey("machines.id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    severity = Column(String(50), nullable=False, default="WARNING", index=True)  # NORMAL, WARNING, ANOMALY, HIGH, CRITICAL
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    estimated_waste_kwh = Column(Float, nullable=False, default=0.0)
    estimated_cost = Column(Float, nullable=False, default=0.0)  # Waste in INR
    status = Column(String(50), nullable=False, default="ACTIVE", index=True)  # ACTIVE, ACKNOWLEDGED, RESOLVED

    # Relationships
    machine = relationship("Machine", back_populates="alerts")
    recommendations = relationship("Recommendation", back_populates="alert", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Alert(id='{self.id}', machine_id='{self.machine_id}', severity='{self.severity}', status='{self.status}')>"
