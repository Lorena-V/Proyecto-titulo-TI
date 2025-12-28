from flask import Blueprint, jsonify, request
from app.services.paciente_service import (crear_paciente, obtener_pacientes, ValidationError, DuplicateRUTError)

paciente_bp = Blueprint("paciente", __name__, url_prefix="/pacientes")

#rutas
@paciente_bp.get("")
def listar():
    return jsonify(obtener_pacientes()), 200

@paciente_bp.post("")
def crear():
    data = request.get_json(silent=True) or {}
    try:
        new_id = crear_paciente(data.get("nombre"), data.get("rut"))
        return jsonify({"message": "Paciente creado", "id": new_id}), 201

    except ValidationError as e:
        return jsonify({"error": str(e)}), 400

    except DuplicateRUTError as e:
        return jsonify({"error": str(e)}), 409

    except Exception:
        return jsonify({"error": "Error interno al crear paciente"}), 500
