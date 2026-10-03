import logging
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.config import get_settings

logger = logging.getLogger("voltis.database")
settings = get_settings()

database_url = settings.DATABASE_URL

# Handle connect_args appropriately depending on dialect
connect_args = {}
if database_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    database_url,
    connect_args=connect_args,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """Dependency for providing database sessions per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_connection() -> bool:
    """Check if the database connection is functional."""
    try:
        with engine.connect() as connection:
            logger.info("Database connection successfully established.")
            return True
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        return False


def create_tables():
    """Create all registered SQLAlchemy tables in the database."""
    import app.models  # noqa: F401 - ensure models are imported to register metadata
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables verified/created successfully.")

