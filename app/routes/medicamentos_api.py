from flask import Blueprint, jsonify, request
from datetime import date
from datetime import datetime, timedelta

med_api_bp = Blueprint("med_api", __name__, url_prefix="/api/medicamentos")

# Datos de prueba (luego reemplazar por DB)
# DATA = [
#     {"id": 1, "nombre": "Paracetamol 500mg", "recetas": 12, "despachos": 4, "fecha": "2025-12-20"},
#     {"id": 2, "nombre": "Ibuprofeno 400mg", "recetas": 15, "despachos": 5, "fecha": "2025-10-10"},
#     {"id": 3, "nombre": "Amoxicilina 500mg", "recetas": 11, "despachos": 20, "fecha": "2025-08-01"},
# ]

MEDS = {
    1: {"id": 1, "nombre": "Paracetamol 500mg"},
    2: {"id": 2, "nombre": "Ibuprofeno 400mg"},
    3: {"id": 3, "nombre": "Amoxicilina 500mg"},
}

# Recetas = tratamientos (crónicos) identificables.
# tratamiento_id representa "un tratamiento activo" (por ej. paciente+medicamento).
RECETAS_EVENTOS = [
    # Paracetamol: dos tratamientos activos (T1 y T2)
    {"med_id": 1, "tratamiento_id": "T1", "fecha": "2025-12-10", "activa": True},

    # Ibuprofeno: un tratamiento activo
    {"med_id": 2, "tratamiento_id": "T3", "fecha": "2025-12-05", "activa": True},

    # Amoxicilina: tratamiento NO crónico / inactivo (ejemplo)
    {"med_id": 3, "tratamiento_id": "T4", "fecha": "2025-11-01", "activa": False},
]

# Despachos = eventos acumulables
DESPACHOS_EVENTOS = [
    # Paracetamol: 2 despachos en diciembre, 2 en noviembre => últimos 2 meses = 4
    {"med_id": 1, "fecha": "2025-12-03"},
    {"med_id": 1, "fecha": "2025-11-05"},
    {"med_id": 1, "fecha": "2025-10-05"},
    

    {"med_id": 2, "fecha": "2025-12-02"},
    {"med_id": 2, "fecha": "2025-10-10"},
]

def parse_fecha(s: str) -> datetime:
    return datetime.strptime(s, "%Y-%m-%d")

def inicio_por_periodo(periodo: str) -> datetime:
    hoy = datetime.now()
    if periodo == "mes":
        return hoy - timedelta(days=30)
    if periodo == "2m":
        return hoy - timedelta(days=60)
    if periodo == "3m":
        return hoy - timedelta(days=90)
    if periodo == "6m":
        return hoy - timedelta(days=180)
    return hoy - timedelta(days=30)

@med_api_bp.get("")
def listar():
    q = (request.args.get("q") or "").lower().strip()
    periodo = (request.args.get("periodo") or "mes").strip()

    inicio = inicio_por_periodo(periodo)
    fin = datetime.now()

    # 1) Filtrar medicamentos por búsqueda
    meds_filtrados = [
        m for m in MEDS.values()
        if not q or q in m["nombre"].lower()
    ]

    # 2) Agregar métricas por medicamento
    respuesta = []
    for m in meds_filtrados:
        med_id = m["id"]

        # RECETAS "activas" dentro del rango:
        # contamos tratamientos únicos activos que tengan evento en el rango
        tratamientos = set()
        for e in RECETAS_EVENTOS:
            if e["med_id"] != med_id:
                continue
            if not e.get("activa", False):
                continue
            fecha = parse_fecha(e["fecha"])
            if inicio <= fecha <= fin:
                tratamientos.add(e["tratamiento_id"])

        recetas_activas = len(tratamientos)

        # DESPACHOS acumulados dentro del rango:
        despachos = 0
        for d in DESPACHOS_EVENTOS:
            if d["med_id"] != med_id:
                continue
            fecha = parse_fecha(d["fecha"])
            if inicio <= fecha <= fin:
                despachos += 1

        respuesta.append({
            "id": med_id,
            "nombre": m["nombre"],
            "recetas": recetas_activas,
            "despachos": despachos,
        })

    return jsonify(respuesta), 200
