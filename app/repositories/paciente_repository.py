from sqlalchemy import text
from app import engine

def create_paciente(nombre: str, rut: str) -> int:
    sql = text("""
        INSERT INTO paciente (nombre, rut)
        VALUES (:nombre, :rut)
    """)
    with engine.begin() as conn:
        result = conn.execute(sql, {"nombre": nombre, "rut": rut})
        return result.lastrowid

""" def list_pacientes() -> list[dict]:
    sql = text("SELECT id, nombre, rut, created_at FROM paciente ORDER BY id DESC")
    with engine.connect() as conn:
        rows = conn.execute(sql).mappings().all()
        return [dict(r) for r in rows] """

def list_pacientes() -> list[dict]:
    sql = text("SELECT id, nombre, rut, created_at FROM paciente ORDER BY id DESC")
    with engine.connect() as conn:
        rows = conn.execute(sql).mappings().all()

    data: list[dict] = []
    for r in rows:
        d = dict(r)
        # Convertir datetime -> string para JSON
        if d.get("created_at") is not None:
            d["created_at"] = d["created_at"].isoformat(sep=" ", timespec="seconds")
        data.append(d)

    return data