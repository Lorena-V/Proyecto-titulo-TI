from flask import Blueprint, jsonify, session
from sqlalchemy import text
from datetime import date, datetime
from app.db import engine
from app.utils.auth import roles_required

gestion_recetas_api_bp = Blueprint(
    "gestion_recetas_api",
    __name__,
    url_prefix="/api/gestion_recetas"
)

@gestion_recetas_api_bp.get("")
@roles_required("QF", "AUXILIAR")
def listar_recetas():
    sql = text("""
        SELECT
            r.id_receta AS id_receta,
            p.nombre AS paciente,
            pa.nombre AS patologia,
            r.fecha_emision,
            r.duracion,
            r.fecha_vencimiento,
            COUNT(d.id_despacho) AS despachos_realizados,
            MAX(d.fecha) AS ultimo_despacho
        FROM receta r
        JOIN paciente p ON p.id = r.id_paciente
        JOIN tratamiento t ON t.id_receta = r.id_receta
        JOIN patologia pa ON pa.id_patologia = t.id_patologia
        LEFT JOIN despacho d ON d.id_tratamiento = t.id_tratamiento
        GROUP BY
            r.id_receta, p.nombre, pa.nombre,
            r.fecha_emision, r.duracion, r.fecha_vencimiento
        ORDER BY r.fecha_vencimiento ASC
    """)

    with engine.connect() as conn:
        rows = conn.execute(sql).mappings().all()

    data = []
    hoy = date.today()

    for r in rows:
        venc = r["fecha_vencimiento"]
        estado = "Vigente"

        if venc:
            if venc < hoy:
                estado = "Vencida"
            elif (venc - hoy).days <= 30:
                estado = "Por vencer"

        def fmt(v):
            if isinstance(v, (date, datetime)):
                return v.isoformat()
            return v

        data.append({
            "id_receta": r["id_receta"],
            "paciente": r["paciente"],
            "patologia": r["patologia"],
            "fecha_emision": fmt(r["fecha_emision"]),
            "duracion": r["duracion"],
            "fecha_vencimiento": fmt(r["fecha_vencimiento"]),
            "estado": estado,
            "despachos": r["despachos_realizados"],
            "ultimo_despacho": fmt(r["ultimo_despacho"]),
        })

    return jsonify(data), 200
