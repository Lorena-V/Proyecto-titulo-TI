# Trabaja con tabla paciente, se creó para crear paciente, listar pacientes
# GET POST: lista pacientes y crea pacientes
import re
from flask import Blueprint, jsonify, request
from app.services.paciente_service import (
    crear_paciente,
    obtener_pacientes,
    existe_paciente_por_rut,
    ValidationError,
    DuplicateRUTError,
)

paciente_bp = Blueprint("paciente", __name__, url_prefix="/pacientes")

#RUTAS
# Listar pacientes
@paciente_bp.get("")
def listar():
    return jsonify(obtener_pacientes()), 200

# Verificar existencia por RUT
@paciente_bp.get("/existe")
def existe():
    rut = (request.args.get("rut") or "").strip()
    if not rut:
        return jsonify({"exists": False, "error": "RUT requerido"}), 400
    return jsonify({"exists": existe_paciente_por_rut(rut)}), 200

# Crear paciente
@paciente_bp.post("")
def crear():
    data = request.get_json(silent=True) or {}
    try:
        new_id = crear_paciente(data.get("nombre"), data.get("rut"), data.get("contacto"))
        return jsonify({"message": "Paciente creado", "id": new_id}), 201

    except ValidationError as e:
        return jsonify({"error": str(e)}), 400

    except DuplicateRUTError as e:
        return jsonify({"error": str(e)}), 409

    except Exception:
        return jsonify({"error": "Error interno al crear paciente"}), 500
