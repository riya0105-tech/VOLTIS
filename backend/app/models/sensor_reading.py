from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.database import Base


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    machine_id = Column(String(100), ForeignKey("machines.id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    power_kw = Column(Float, nullable=False)
    voltage = Column(Float, nullable=True)
    current = Column(Float, nullable=True)
    temperature = Column(Float, nullable=True)
    vibration = Column(Float, nullable=True)
    runtime_hours = Column(Float, nullable=True)
    production_units = Column(Float, nullable=True)

    # Composite Index on (machine_id, timestamp) for high performance time-series queries
    __table_args__ = (
        Index("ix_sensor_readings_machine_id_timestamp", "machine_id", "timestamp"),
    )

    # Relationship
    machine = relationship("Machine", back_populates="sensor_readings")

    def __repr__(self) -> str:
        return f"<SensorReading(machine_id='{self.machine_id}', timestamp='{self.timestamp}', power_kw={self.power_kw})>"
