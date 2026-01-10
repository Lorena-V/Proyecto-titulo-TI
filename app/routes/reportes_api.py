import csv
import io
from datetime import date, timedelta

from flask import Blueprint, Response, request
from sqlalchemy import text
from app.db import engine
from app.utils.auth import roles_required

reportes_api_bp = Blueprint("reportes_api", __name__, url_prefix="/api/reportes")

@reportes_api_bp.get("/pacientes_csv")
@roles_required("QF")
def reporte_pacientes_csv():
    # Aplicar filtros que están en el front (si es que hay)
    q = request.args.get("q", type=str, default="").strip().lower()
    estado = (request.args.get("estado") or "").strip()

    # condiciones dinámicas
    where = []
    params = {}

    if q:
        where.append("LOWER(pa.nombre) LIKE :q")
        params["q"] = f"%{q}%"

    if estado == "Vigente":
        where.append("r.fecha_vencimiento >= CURDATE()")
    elif estado == "Vencida":
        where.append("r.fecha_vencimiento < CURDATE()")
    elif estado == "Porvencer":
        # Por vencer = vence en los próximos 30 días (y aún vigente)
        where.append("r.fecha_vencimiento >= CURDATE() AND r.fecha_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)")

    where_sql = ("WHERE " + " AND ".join(where)) if where else ""

    # Query de reporte: incluye campos visibles + ocultos (rut + usuario registrador)
    sql = text(f"""
        SELECT
          pa.id AS id_paciente,
          pa.nombre AS paciente,
          pa.rut AS rut,
          pa.contacto AS contacto,

          CONCAT(
            ROW_NUMBER() OVER (PARTITION BY pa.id ORDER BY r.fecha_emision DESC),
            '/',
            COUNT(*) OVER (PARTITION BY pa.id)
          ) AS recetas,

          pat.nombre AS patologia,
          r.fecha_emision AS ingreso,
          r.duracion AS duracion_dias,
          r.fecha_vencimiento AS vencimiento,

          CASE
            WHEN r.fecha_vencimiento < CURDATE() THEN 'Vencida'
            WHEN r.fecha_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'Porvencer'
            ELSE 'Vigente'
          END AS estado,

          MAX(d.fecha) AS ultimo_despacho,
          COUNT(d.id_despacho) AS despachos_realizados,

          MAX(d.id_usuario) AS id_usuario_despacho,
          u.usuario AS registrado_por,
          u.id_rol AS id_rol
        FROM tratamiento t
        JOIN receta r ON r.id_receta = t.id_receta
        JOIN paciente pa ON pa.id = r.id_paciente
        JOIN patologia pat ON pat.id_patologia = t.id_patologia
        LEFT JOIN despacho d ON d.id_tratamiento = t.id_tratamiento
        LEFT JOIN usuario u ON u.id_usuario = r.id_usuario
        {where_sql}
        GROUP BY t.id_tratamiento, pa.id, r.fecha_emision, u.usuario, u.id_rol
        ORDER BY pa.nombre, r.fecha_emision DESC;
    """)

    with engine.connect() as conn:
        rows = conn.execute(sql, params).mappings().all()

    # Generar CSV en memoria
    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "ID_PACIENTE", "PACIENTE", "RUT", "CONTACTO", "RECETAS",
        "PATOLOGIA", "INGRESO", "DURACION_DIAS", "VENCIMIENTO", "ESTADO",
        "ULTIMO_DESPACHO", "DESPACHOS_REALIZADOS", "ID_USUARIO_DESPACHO",
        "REGISTRADO_POR", "ID_ROL"
    ])

    for r in rows:
        writer.writerow([
            r.get("id_paciente"),
            r.get("paciente"),
            r.get("rut"),
            r.get("contacto"),
            r.get("recetas"),
            r.get("patologia"),
            str(r.get("ingreso") or ""),
            r.get("duracion_dias"),
            str(r.get("vencimiento") or ""),
            r.get("estado"),
            str(r.get("ultimo_despacho") or ""),
            r.get("despachos_realizados"),
            r.get("id_usuario_despacho"),
            r.get("registrado_por"),
            r.get("id_rol"),
        ])

    csv_data = output.getvalue()
    output.close()

    return Response(
        csv_data,
        mimetype="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=reporte_pacientes.csv"
        }
    )
