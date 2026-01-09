# API para crear despachos
from flask import Blueprint, jsonify, request, session
from sqlalchemy import text
from datetime import date
from app.db import engine
from app.utils.auth import login_required, roles_required

despachos_api_bp = Blueprint(
    "despachos_api",
    __name__,
    url_prefix="/api/despachos"
)

@despachos_api_bp.post("")
@login_required
@roles_required("QF", "AUXILIAR")
def crear_despacho():
    data = request.get_json()
    id_tratamiento = data.get("id_tratamiento")

    if not id_tratamiento:
        return jsonify({"error": "Tratamiento requerido"}), 400

    id_usuario = session.get("user_id")
    fecha = date.today()

    sql = text("""
        INSERT INTO despacho (id_tratamiento, id_usuario, fecha)
        VALUES (:id_tratamiento, :id_usuario, :fecha)
    """)

    with engine.begin() as conn:
        conn.execute(sql, {
            "id_tratamiento": id_tratamiento,
            "id_usuario": id_usuario,
            "fecha": fecha
        })

    return jsonify({"ok": True}), 201