# ruta para listar medicamentos en un endpoint separado (modal form en gestión de recetas)
from datetime import date, timedelta
from flask import Blueprint, jsonify, request
from sqlalchemy import text
from app.db import engine
from app.utils.auth import roles_required

med_list_api_bp = Blueprint(
    "med_list_api",
    __name__,
    url_prefix="/api/medicamentos/lista"
)

# Función para determinar la fecha de inicio según el período seleccionado
def inicio_por_periodo(periodo: str) -> date:
    dias = {
        "mes": 30,
        "2m": 60,
        "3m": 90,
        "6m": 180,
    }.get(periodo, 30)
    return date.today() - timedelta(days=dias)

# Endpoint para listar medicamentos con estadísticas
@med_list_api_bp.get("")
@roles_required("QF", "AUXILIAR", "ABASTECIMIENTO")
def listar_medicamentos():
    q = (request.args.get("q") or "").strip().lower()
    periodo = (request.args.get("periodo") or "mes").strip()
    inicio = inicio_por_periodo(periodo)
    fin = date.today()

    sql = text("""
        SELECT
          m.id_medicamento,
          m.nombre,
          COALESCE(r.recetas, 0) AS recetas, 
          COALESCE(d.despachos, 0) AS despachos, 
          COALESCE(p.promedio_3m, 0) AS proyeccion
        FROM medicamento m
        LEFT JOIN (
          SELECT
            tm.id_medicamento,
            COUNT(DISTINCT t.id_tratamiento) AS recetas
          FROM tratamiento_medicamento tm
          JOIN tratamiento t ON t.id_tratamiento = tm.id_tratamiento
          JOIN receta r ON r.id_receta = t.id_receta
          WHERE r.fecha_emision BETWEEN :inicio AND :fin
            AND r.fecha_vencimiento >= :hoy
          GROUP BY tm.id_medicamento
        ) r ON r.id_medicamento = m.id_medicamento
        LEFT JOIN (
          SELECT
            tm.id_medicamento,
            COUNT(d.id_despacho) AS despachos
          FROM tratamiento_medicamento tm
          JOIN tratamiento t ON t.id_tratamiento = tm.id_tratamiento
          JOIN despacho d ON d.id_tratamiento = t.id_tratamiento
          WHERE d.fecha BETWEEN :inicio AND :fin
          GROUP BY tm.id_medicamento
        ) d ON d.id_medicamento = m.id_medicamento
        LEFT JOIN (
          SELECT
            tm.id_medicamento,
            CEIL(COUNT(d.id_despacho) / 3) AS promedio_3m
          FROM tratamiento_medicamento tm
          JOIN tratamiento t ON t.id_tratamiento = tm.id_tratamiento
          JOIN despacho d ON d.id_tratamiento = t.id_tratamiento
          WHERE d.fecha >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
          GROUP BY tm.id_medicamento
        ) p ON p.id_medicamento = m.id_medicamento
        WHERE (:q = '' OR LOWER(m.nombre) LIKE :q_like)
        ORDER BY m.nombre
    """)
    # Ejecutar la consulta
    with engine.connect() as conn:
        rows = conn.execute(sql, {
            "inicio": inicio,
            "fin": fin,
            "hoy": fin,
            "q": q,
            "q_like": f"%{q}%",
        }).mappings().all()

    return jsonify([dict(r) for r in rows]), 200
