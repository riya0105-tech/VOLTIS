from sqlalchemy import Column, String, Text, Float, DateTime, ForeignKey, JSON, func
from sqlalchemy.orm import relationship
from app.database import Base


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String(100), primary_key=True)  # e.g., 'rec_001'
    machine_id = Column(String(100), ForeignKey("machines.id", ondelete="CASCADE"), nullable=False, index=True)
    alert_id = Column(String(100), ForeignKey("alerts.id", ondelete="SET NULL"), nullable=True, index=True)
    problem = Column(Text, nullable=False)
    likely_cause = Column(Text, nullable=False)
    recommended_actions = Column(JSON, nullable=False)  # List of actionable recommendations
    potential_saving = Column(Float, nullable=False, default=0.0)  # Estimated savings in INR
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    machine = relationship("Machine", back_populates="recommendations")
    alert = relationship("Alert", back_populates="recommendations")

    def __repr__(self) -> str:
        return f"<Recommendation(id='{self.id}', machine_id='{self.machine_id}', alert_id='{self.alert_id}')>"
