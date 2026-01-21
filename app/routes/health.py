from flask import Blueprint, jsonify
from sqlalchemy import text
from app.db import engine

health_bp = Blueprint("health", __name__)

@health_bp.get("/health")
def home():
    return jsonify({"status": "ok", "message": "Flask funcionando (estructura por capas)"})

@health_bp.get("/health/db")
def health_db():
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1")).scalar()
    return jsonify({"db": "ok", "select_1": result})
