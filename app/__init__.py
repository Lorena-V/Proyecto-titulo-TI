import os
from flask import Flask
from dotenv import load_dotenv
from sqlalchemy import create_engine

load_dotenv()

# Creamos el engine una sola vez (compartido)
def get_engine():
    db_user = os.getenv("DB_USER")
    db_password = os.getenv("DB_PASSWORD", "")
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = os.getenv("DB_PORT", "3306")
    db_name = os.getenv("DB_NAME")

    database_url = f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    return create_engine(database_url, pool_pre_ping=True)

engine = get_engine()

def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev")

    # Registrar rutas (blueprints)
    from app.routes.health import health_bp
    app.register_blueprint(health_bp)

    from app.routes.paciente import paciente_bp
    app.register_blueprint(paciente_bp)

    from app.routes.views import views_bp
    app.register_blueprint(views_bp)

    from app.routes.medicamentos_api import med_api_bp
    app.register_blueprint(med_api_bp)



    return app
