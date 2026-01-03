import os
from dotenv import load_dotenv
from sqlalchemy import create_engine

load_dotenv()

#Conecta con la base de datos
def get_engine():
    db_user = os.getenv("DB_USER")
    db_password = os.getenv("DB_PASSWORD", "")
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = os.getenv("DB_PORT", "3306")
    db_name = os.getenv("DB_NAME")

    database_url = f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    return create_engine(database_url, pool_pre_ping=True)

engine = get_engine()
