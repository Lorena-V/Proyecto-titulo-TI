from flask import Blueprint, request, jsonify, session
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timedelta
from app.db import engine
from app.utils.auth import roles_required

recetas_api_bp = Blueprint("recetas_api", __name__, url_prefix="/api/recetas")

@recetas_api_bp.post("")
@roles_required("QF", "AUXILIAR")
def crear_receta():
    data = request.get_json(force=True)

    id_paciente = int(data.get("id_paciente"))
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