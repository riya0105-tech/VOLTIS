from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.database import Base


class ProductionRecord(Base):
    __tablename__ = "production_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    factory_id = Column(String(100), ForeignKey("factories.id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    line_id = Column(String(100), nullable=True)
    batch_id = Column(String(100), nullable=True)
    units_produced = Column(Float, nullable=False)
    operating_state = Column(String(50), nullable=True)

    __table_args__ = (
        Index("ix_production_records_factory_timestamp", "factory_id", "timestamp"),
    )

    # Relationship
    factory = relationship("Factory", back_populates="production_records")

    def __repr__(self) -> str:
        return f"<ProductionRecord(factory_id='{self.factory_id}', timestamp='{self.timestamp}', units={self.units_produced})>"
