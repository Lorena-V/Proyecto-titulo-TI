# api para la pantalla gestion de pacientes del sistema
# API de consulta (SELECT) para llenar la tabla de gestion de pacientes
from flask import Blueprint, jsonify
from sqlalchemy import text
from datetime import date, datetime
from app.db import engine
from app.utils.auth import roles_required

gestion_pacientes_api_bp = Blueprint(
    "gestion_pacientes_api",
    __name__,
    url_prefix="/api/gestion_pacientes"
)

def to_json_value(v):
    if isinstance(v, (datetime, date)):
        return v.isoformat()
    if isinstance(v, (bytes, bytearray)):
        return v.decode("utf-8", errors="replace").strip()
    return v

@gestion_pacientes_api_bp.get("")
@roles_required("QF", "AUXILIAR")
def listar_gestion_pacientes():
    sql = text("""
        SELECT
          pa.id AS id_paciente,
          pa.nombre AS paciente,
          pa.rut AS rut,
          pa.contacto AS contacto,
          CASE
            WHEN r.id_receta IS NULL THEN '0/0'
            ELSE CONCAT(
              ROW_NUMBER() OVER (PARTITION BY pa.id ORDER BY r.fecha_emision DESC),
              '/',
              COUNT(r.id_receta) OVER (PARTITION BY pa.id)
            )
          END AS recetas,
          COALESCE(MAX(pat.nombre), '-') AS patologia,
          r.fecha_emision AS ingreso,
          r.duracion AS duracion_dias,
          r.fecha_vencimiento AS vencimiento,
          CASE
            WHEN r.fecha_vencimiento IS NULL THEN '-'
            WHEN r.fecha_vencimiento >= CURDATE() THEN 'Vigente'
            ELSE 'Vencida'
          END AS estado,
          MAX(d.fecha) AS ultimo_despacho,
          COUNT(d.id_despacho) AS despachos_realizados
        FROM paciente pa
        LEFT JOIN receta r ON r.id_paciente = pa.id
        LEFT JOIN tratamiento t ON t.id_receta = r.id_receta
        LEFT JOIN patologia pat ON pat.id_patologia = t.id_patologia
        LEFT JOIN despacho d ON d.id_tratamiento = t.id_tratamiento
        GROUP BY pa.id, r.id_receta, r.fecha_emision
        ORDER BY pa.nombre, r.fecha_emision DESC;
    """)

    with engine.connect() as conn:
        rows = conn.execute(sql).mappings().all()

    data = []
    for r in rows:
        item = {k: to_json_value(v) for k, v in dict(r).items()}
        data.append(item)

    return jsonify(data), 200
