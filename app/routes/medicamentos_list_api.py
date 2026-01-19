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

# Función para calcular fechas de inicio y fin según el período
def _mes_inicio_fin(periodo: str) -> tuple[date, date]:
    meses_atras = {
        "mes": 0,
        "1m": 1,
        "2m": 2,
    }.get(periodo, 0)
    hoy = date.today()
    total_meses = (hoy.year * 12 + (hoy.month - 1)) - meses_atras
    year = total_meses // 12
    month = total_meses % 12 + 1
    inicio = date(year, month, 1)
    if periodo == "mes":
        fin = hoy
    else:
        next_month = month + 1
        next_year = year
        if next_month == 13:
            next_month = 1
            next_year += 1
        fin = date(next_year, next_month, 1) - timedelta(days=1)
    return inicio, fin

# Endpoint para listar medicamentos con estadísticas
@med_list_api_bp.get("")
@roles_required("QF", "AUXILIAR", "ABASTECIMIENTO")
def listar_medicamentos():
    q = (request.args.get("q") or "").strip().lower()
    periodo = (request.args.get("periodo") or "mes").strip()
    inicio, fin = _mes_inicio_fin(periodo)

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
          WHERE r.fecha_emision <= :fin
            AND r.fecha_vencimiento >= :inicio
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
            ROUND(AVG(mensual.cant_mes)) AS promedio_3m
          FROM tratamiento_medicamento tm
          JOIN tratamiento t ON t.id_tratamiento = tm.id_tratamiento
          JOIN despacho d ON d.id_tratamiento = t.id_tratamiento
          JOIN (
            SELECT
              tm2.id_medicamento,
              YEAR(d2.fecha) AS anio,
              MONTH(d2.fecha) AS mes,
              COUNT(d2.id_despacho) AS cant_mes
            FROM tratamiento_medicamento tm2
            JOIN tratamiento t2 ON t2.id_tratamiento = tm2.id_tratamiento
            JOIN despacho d2 ON d2.id_tratamiento = t2.id_tratamiento
            WHERE d2.fecha >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 2 MONTH)
              AND d2.fecha <= CURDATE()
            GROUP BY tm2.id_medicamento, anio, mes
          ) mensual ON mensual.id_medicamento = tm.id_medicamento
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
            "q": q,
            "q_like": f"%{q}%",
        }).mappings().all()

    return jsonify([dict(r) for r in rows]), 200
