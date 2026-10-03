import sys
from sqlalchemy import inspect
from app.database import engine, Base, create_tables, check_db_connection
from app.models import (
    Factory,
    Machine,
    SensorReading,
    ProductionRecord,
    MaintenanceRecord,
    Alert,
    Recommendation,
    OptimizationScenario,
)

def run_verification():
    print("--- STEP 1: Verify model imports ---")
    models = [
        Factory, Machine, SensorReading, ProductionRecord,
        MaintenanceRecord, Alert, Recommendation, OptimizationScenario
    ]
    for m in models:
        print(f"Imported model: {m.__name__} -> table: {m.__tablename__}")

    print("\n--- STEP 2: Verify Base.metadata table count ---")
    table_names = list(Base.metadata.tables.keys())
    print("Tables in metadata:", table_names)
    assert len(table_names) == 8, f"Expected 8 tables, got {len(table_names)}"

    print("\n--- STEP 3: Verify create_tables and DB connection ---")
    create_tables()
    assert check_db_connection(), "Database connection check failed"

    print("\n--- STEP 4: Inspect created tables in database ---")
    inspector = inspect(engine)
    created_tables = inspector.get_table_names()
    print("Tables created in database:", created_tables)
    assert set(table_names).issubset(set(created_tables)), "Not all tables were created in the database!"

    print("\n--- STEP 5: Verify SensorReading indexes (machine_id, timestamp) ---")
    sensor_indexes = inspector.get_indexes("sensor_readings")
    print("SensorReading indexes:")
    for idx in sensor_indexes:
        print(f"  {idx['name']} -> columns: {idx['column_names']}")

    has_composite_index = any(
        "machine_id" in idx["column_names"] and "timestamp" in idx["column_names"]
        for idx in sensor_indexes
    )
    print("Composite index (machine_id, timestamp) verified:", has_composite_index)
    assert has_composite_index, "Missing composite index on (machine_id, timestamp)!"

    print("\n--- STEP 6: Verify Foreign Keys ---")
    for t in created_tables:
        fks = inspector.get_foreign_keys(t)
        if fks:
            print(f"Table {t} foreign keys:")
            for fk in fks:
                print(f"  constrained: {fk.get('constrained_columns')} -> referred: {fk.get('referred_table')}.{fk.get('referred_columns')}")

    print("\nPHASE 2 DATABASE LAYER VERIFICATION SUCCESSFUL!")

if __name__ == "__main__":
    run_verification()
