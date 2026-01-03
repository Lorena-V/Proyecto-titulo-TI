# Rol estará visible en todos los templates
from flask import session

def inject_user():
    return {
        "rol": session.get("rol"),
        "usuario": session.get("usuario"),
    }
