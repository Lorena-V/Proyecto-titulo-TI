from flask import Blueprint, jsonify, request

med_api_bp = Blueprint("med_api", __name__, url_prefix="/api/medicamentos")

# Datos de prueba (luego reemplazar por DB)
DATA = [
    {"id": 1, "nombre": "Paracetamol 500mg", "recetas": 12, "despachos": 4, "fecha": "2025-12-20"},
    {"id": 2, "nombre": "Ibuprofeno 400mg", "recetas": 15, "despachos": 5, "fecha": "2025-10-10"},
    {"id": 3, "nombre": "Amoxicilina 500mg", "recetas": 11, "despachos": 20, "fecha": "2025-08-01"},
]

@med_api_bp.get("")
def listar():
    q = (request.args.get("q") or "").lower().strip()

    resultados = DATA
    if q:
        resultados = [m for m in DATA if q in m["nombre"].lower()]

    return jsonify(resultados), 200

