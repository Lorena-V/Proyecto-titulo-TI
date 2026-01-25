from sqlalchemy import text
from app.db import engine


def obtener_recetas_mes(rol):
    if rol != "QF":
        return 0

    sql = text("""
        SELECT COUNT(*) AS total
        FROM receta
        WHERE YEAR(fecha_emision) = YEAR(CURDATE())
          AND MONTH(fecha_emision) = MONTH(CURDATE())
    """)
    with engine.connect() as conn:
        return conn.execute(sql).scalar() or 0
