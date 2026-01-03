from functools import wraps
from flask import session, redirect, url_for, abort

def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if "user_id" not in session:
            return redirect(url_for("auth.login"))
        return view(*args, **kwargs)
    return wrapped

def roles_required(*roles):
    def decorator(view):
        @wraps(view)
        def wrapped(*args, **kwargs):
            if "user_id" not in session:
                return redirect(url_for("auth.login"))

            rol = session.get("rol")
            if rol not in roles:
                return abort(403)

            return view(*args, **kwargs)
        return wrapped
    return decorator
