# ruta para listar medicamentos en un endpoint separado (modal form en gestión de recetas)
from flask import Blueprint, jsonify
from sqlalchemy import text
from app.db import engine
from app.utils.auth import roles_required

med_list_api_bp = Blueprint(
    "med_list_api",
    __name__,
    url_prefix="/api/medicamentos/lista"
)

@med_list_api_bp.get("")
@roles_required("QF", "AUXILIAR")
def listar_medicamentos():
    sql = text("""
        SELECT id_medicamento, nombre
        FROM medicamento
        ORDER BY nombre
    """)
    with engine.connect() as conn:
        rows = conn.execute(sql).mappings().all()

    return jsonify([dict(r) for r in rows]), 200
