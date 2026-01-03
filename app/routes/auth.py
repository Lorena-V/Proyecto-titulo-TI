from flask import Blueprint, render_template, request, redirect, url_for, session
import bcrypt
from sqlalchemy import text
from app.db import engine 

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        usuario = request.form["usuario"]
        password = request.form["password"].encode()

        sql = text("""
            SELECT u.id_usuario, u.usuario, u.password, r.nombre AS rol
            FROM usuario u
            JOIN rol r ON r.id_rol = u.id_rol
            WHERE u.usuario = :usuario AND u.activo = 1
        """)

        with engine.connect() as conn:
            row = conn.execute(sql, {"usuario": usuario}).mappings().first()
        
        print("DEBUG LOGIN:", row)

        # Verificar credenciales (.strip() para eliminar espacios en blanco que se guardaron por error)
        if row and bcrypt.checkpw(password, row["password"].strip().encode()):
            session["user_id"] = row["id_usuario"]
            session["usuario"] = row["usuario"]
            session["rol"] = row["rol"]
            return redirect(url_for("views.home"))

        return render_template("login.html", error="Usuario o contraseña incorrectos")

    return render_template("login.html")


@auth_bp.get("/logout")
def logout():
    session.clear()
    return redirect(url_for("auth.login"))
