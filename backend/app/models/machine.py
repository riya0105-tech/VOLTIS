from sqlalchemy import Column, String, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base


class Machine(Base):
    __tablename__ = "machines"

    id = Column(String(100), primary_key=True)  # e.g., 'compressor_02'
    factory_id = Column(String(100), ForeignKey("factories.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)  # e.g., 'Compressor #02'
    type = Column(String(100), nullable=False)  # 'Compressor', 'Furnace', 'Transformer', 'HVAC', 'Motor', etc.
    rated_power_kw = Column(Float, nullable=False)
    status = Column(String(50), nullable=False, default="NORMAL", index=True)  # NORMAL, WARNING, ANOMALY, OFFLINE
    operating_limit = Column(Float, nullable=True)
    production_association = Column(String(100), nullable=True)  # 'Line 1', 'Main Line', etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    factory = relationship("Factory", back_populates="machines")
    sensor_readings = relationship("SensorReading", back_populates="machine", cascade="all, delete-orphan")
    maintenance_records = relationship("MaintenanceRecord", back_populates="machine", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="machine", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="machine", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Machine(id='{self.id}', name='{self.name}', status='{self.status}')>"
