import os
from flask import Flask
from dotenv import load_dotenv

load_dotenv()

# Crea la aplicación y registra rutas
def create_app():
    app = Flask(__name__)
    # Para proteger datos de sesión
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev")

    # Registrar rutas (blueprints)
    from app.routes.health import health_bp
    app.register_blueprint(health_bp)

    from app.routes.paciente import paciente_bp
    app.register_blueprint(paciente_bp)

    from app.routes.views import views_bp
    app.register_blueprint(views_bp)

    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp)

    from app.context import inject_user
    app.context_processor(inject_user)

    from app.routes.gestion_pacientes_api import gestion_pacientes_api_bp
    app.register_blueprint(gestion_pacientes_api_bp)

    from app.routes.medicamentos_list_api import med_list_api_bp
    app.register_blueprint(med_list_api_bp)

    from app.routes.recetas_api import recetas_api_bp
    app.register_blueprint(recetas_api_bp)

    from app.routes.gestion_recetas_api import gestion_recetas_api_bp
    app.register_blueprint(gestion_recetas_api_bp)

    from app.routes.despachos_api import despachos_api_bp
    app.register_blueprint(despachos_api_bp)
    
    return app
