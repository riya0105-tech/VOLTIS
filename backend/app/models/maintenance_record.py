from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    machine_id = Column(String(100), ForeignKey("machines.id", ondelete="CASCADE"), nullable=False, index=True)
    maintenance_date = Column(DateTime(timezone=True), nullable=False)
    issue = Column(String(255), nullable=False)
    severity = Column(String(50), nullable=False, default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    notes = Column(Text, nullable=True)

    # Relationship
    machine = relationship("Machine", back_populates="maintenance_records")

    def __repr__(self) -> str:
        return f"<MaintenanceRecord(machine_id='{self.machine_id}', issue='{self.issue}', severity='{self.severity}')>"
