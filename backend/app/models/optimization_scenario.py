from sqlalchemy import Column, String, Float, DateTime, func
from app.database import Base


class OptimizationScenario(Base):
    __tablename__ = "optimization_scenarios"

    id = Column(String(100), primary_key=True)  # e.g., 'scenario_001'
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    current_energy_kwh = Column(Float, nullable=False)
    optimized_energy_kwh = Column(Float, nullable=False)
    current_cost = Column(Float, nullable=False)  # in INR
    optimized_cost = Column(Float, nullable=False)  # in INR
    current_co2 = Column(Float, nullable=False)  # in Tonnes
    optimized_co2 = Column(Float, nullable=False)  # in Tonnes
    production_change_percent = Column(Float, nullable=False, default=0.0)
    status = Column(String(50), nullable=False, default="DRAFT", index=True)  # DRAFT, SIMULATED, APPROVED

    def __repr__(self) -> str:
        return f"<OptimizationScenario(id='{self.id}', name='{self.name}', status='{self.status}')>"
