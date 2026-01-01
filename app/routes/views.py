from flask import Blueprint, render_template

views_bp = Blueprint("views", __name__)

@views_bp.get("/home")
def home():
    # Simulación temporal de rol (luego se obtiene desde sesión/usuario autenticado)
    rol = "QF"  # valores posibles: "QF", "AUXILIAR", "ABASTECIMIENTO"

    # Menú permitido por rol
    menu_por_rol = {
        "QF": [
            ("Administración de Usuarios", "#"),
            ("Reportes", "#"),
            ("Gestión de Medicamentos", "#"),
            ("Gestión de Recetas", "#"),
            ("Gestión de Pacientes", "#"),
        ],
        "AUXILIAR": [
            ("Reportes", "#"),
            ("Gestión de Medicamentos", "#"),
            ("Gestión de Recetas", "#"),
            ("Gestión de Pacientes", "#"),
        ],
        "ABASTECIMIENTO": [
            ("Proyección de stock", "#"),
        ],
    }

    menu = menu_por_rol.get(rol, [])
    return render_template("home.html", menu=menu, rol=rol)
