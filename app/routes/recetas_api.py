# API para crear recetas
import re
from flask import Blueprint, request, jsonify, session
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timedelta
from app.db import engine
from app.utils.auth import roles_required

recetas_api_bp = Blueprint("recetas_api", __name__, url_prefix="/api/recetas")

@recetas_api_bp.post("")
# Crear una nueva receta
@roles_required("QF", "AUXILIAR")
def crear_receta():
    data = request.get_json(force=True)

    rut_paciente = (data.get("rut_paciente") or "").strip().upper()
    if not rut_paciente:
        return jsonify({"error": "RUT requerido"}), 400
    # Formato simple: 7-8 dígitos + guión + DV (0-9 o K)
    if not re.match(r"^\d{7,8}-[0-9Kk]$", rut_paciente):
        return jsonify({"error": "RUT con formato inválido"}), 400
    fecha_emision = data.get("fecha_emision")  # 'YYYY-MM-DD'
    duracion = int(data.get("duracion"))
    id_patologia = int(data.get("id_patologia"))
    medicamentos = data.get("medicamentos", [])  # lista de ids
    id_usuario = session.get("user_id") # obtener del usuario autenticado
    if not id_usuario:
        return jsonify({"error": "No autenticado"}), 401 # protección extra

    # calcular vencimiento (en días)
    fecha_dt = datetime.strptime(fecha_emision, "%Y-%m-%d")
    fecha_vencimiento = (fecha_dt + timedelta(days=duracion)).strftime("%Y-%m-%d")

    with engine.begin() as conn:
        # Buscar id_paciente por RUT
        row = conn.execute(
            text("SELECT id FROM paciente WHERE rut = :rut"),
            {"rut": rut_paciente}
        ).fetchone()
        if not row:
            return jsonify({"error": "Paciente no encontrado para ese RUT"}), 400
        id_paciente = row[0]

        # 1) tabla receta
        r = conn.execute(
            text("""
            INSERT INTO receta (
                id_paciente,
                id_usuario,
                fecha_emision,
                duracion,
                fecha_vencimiento
            )
            VALUES (
                :id_paciente,
                :id_usuario,
                :fecha_emision,
                :duracion,
                :fecha_vencimiento
            )
        """),
        {
        "id_paciente": id_paciente,
        "id_usuario": int(id_usuario),
        "fecha_emision": fecha_emision,
        "duracion": duracion,
        "fecha_vencimiento": fecha_vencimiento,
        }
    )
        id_receta = r.lastrowid

        # 2) tabla tratamiento
        t = conn.execute(
            text("""
                INSERT INTO tratamiento (id_receta, id_patologia)
                VALUES (:id_receta, :id_patologia)
            """),
            {"id_receta": id_receta, "id_patologia": id_patologia}
        )
        id_tratamiento = t.lastrowid

        # 3) tabla tratamiento_medicamento (0..n)
        for id_med in medicamentos:
            conn.execute(
                text("""
                    INSERT INTO tratamiento_medicamento (id_tratamiento, id_medicamento)
                    VALUES (:id_tratamiento, :id_medicamento)
                """),
                {"id_tratamiento": id_tratamiento, "id_medicamento": int(id_med)}
            )

    return jsonify({
        "ok": True,
        "id_receta": id_receta,
        "id_tratamiento": id_tratamiento
    }), 201

@recetas_api_bp.get("/<int:id_receta>/medicamentos")
@roles_required("QF", "AUXILIAR")
def medicamentos_por_receta(id_receta):
    sql = text("""
        SELECT
          m.id_medicamento,
          m.nombre
        FROM tratamiento t
        JOIN tratamiento_medicamento tm
          ON tm.id_tratamiento = t.id_tratamiento
        JOIN medicamento m
          ON m.id_medicamento = tm.id_medicamento
        WHERE t.id_receta = :id_receta
        ORDER BY m.nombre
    """)

    with engine.connect() as conn:
        rows = conn.execute(sql, {"id_receta": id_receta}).mappings().all()

    return jsonify([dict(r) for r in rows]), 200