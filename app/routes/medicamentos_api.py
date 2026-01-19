import re
from flask import Blueprint, request, jsonify
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from app.db import engine
from app.utils.auth import roles_required

med_api_bp = Blueprint("med_api", __name__, url_prefix="/api/medicamentos")


@med_api_bp.post("")
@roles_required("QF", "AUXILIAR")
def crear_medicamento():
    data = request.get_json(silent=True) or {}
    nombre = (data.get("nombre") or "").strip()

    # Validación mínima (alineada con tu DB)
    if not nombre:
        return jsonify({"error": "El nombre del medicamento es obligatorio."}), 400

    if len(nombre) < 3:
        return jsonify({"error": "El nombre debe tener al menos 3 caracteres."}), 400

    # (Opcional) Bloquear caracteres raros
    if not re.fullmatch(r"[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9\s\.\-\/]+", nombre):
        return jsonify({"error": "El nombre contiene caracteres inválidos."}), 400

    try:
        with engine.begin() as conn:
            r = conn.execute(
                text("INSERT INTO medicamento (nombre) VALUES (:nombre)"),
                {"nombre": nombre}
            )
            new_id = r.lastrowid

        return jsonify({"ok": True, "id_medicamento": new_id, "nombre": nombre}), 201

    except IntegrityError:
        # nombre es UNIQUE
        return jsonify({"error": f"El medicamento '{nombre}' ya existe."}), 409

    except Exception:
        return jsonify({"error": "Error interno al crear medicamento."}), 500
