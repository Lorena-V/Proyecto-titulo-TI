from app.utils.auth import login_required, roles_required
from flask import Blueprint, render_template, session
# Vistas HTML

views_bp = Blueprint("views", __name__)

@views_bp.get("/home")
@login_required
def home():
    rol = session.get("rol")

    menu_por_rol = {
        "QF": [
            ("Administración de Usuarios", "/usuarios"),
            ("Reportes", "/reportes"),
            ("Gestión de Medicamentos", "/gestion_medicamentos"),
            ("Gestión de Recetas", "/gestion_recetas"),
            ("Gestión de Pacientes", "/gestion_pacientes"),
        ],
        "AUXILIAR": [
            ("Reportes", "/reportes"),
            ("Gestión de Medicamentos", "/gestion_medicamentos"),
            ("Gestión de Recetas", "/gestion_recetas"),
            ("Gestión de Pacientes", "/gestion_pacientes"),
        ],
        "ABASTECIMIENTO": [
            ("Reportes", "/reportes"),
            ("Gestión de Medicamentos", "/gestion_medicamentos"),
        ],
    }
    menu = menu_por_rol.get(rol, [])
    return render_template("home.html", rol=rol) #para que el html sepa con que rol está logueado

@views_bp.get("/gestion_medicamentos")
@roles_required("QF", "AUXILIAR", "ABASTECIMIENTO")
def gestion_medicamentos():
    return render_template("medicamentos.html")

@views_bp.get("/gestion_pacientes")
@roles_required("QF", "AUXILIAR")
def gestion_pacientes():
    return render_template("pacientes.html")

@views_bp.get("/gestion_recetas")
@roles_required("QF", "AUXILIAR")
def gestion_recetas():
    return render_template("recetas.html")

@views_bp.get("/reportes")
@roles_required("QF", "AUXILIAR", "ABASTECIMIENTO")
def reportes():
    return render_template("reportes.html")

@views_bp.get("/usuarios")
@roles_required("QF")
def usuarios():
    return render_template("usuarios.html")
