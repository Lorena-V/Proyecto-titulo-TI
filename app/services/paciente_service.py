# Trabaja con tabla paciente, se creó para crear paciente, listar pacientes
import re # expresiones regulares
from app.repositories import paciente_repository
from sqlalchemy.exc import IntegrityError

#validacion de datos
class ValidationError(Exception):
    pass

#rut duplicado
class DuplicateRUTError(Exception):
    pass

# --- Validaciones (backend) ---
_RE_NOMBRE = re.compile(r"^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]{3,}$")
_RE_RUT = re.compile(r"^\d{7,8}-[0-9kK]$")
_RE_CONTACTO = re.compile(r"^\d{9}$")

# Servicio para crear paciente
def crear_paciente(nombre: str, rut: str, contacto: str) -> int:
    nombre = (nombre or "").strip()
    rut = (rut or "").strip()
    contacto = (contacto or "").strip()

    # Nombre: solo letras/acentos/espacios, min 3
    if not _RE_NOMBRE.fullmatch(nombre):
        raise ValidationError("Nombre inválido: mínimo 3 letras, sin números.")

    # RUT: sin puntos y con guion
    # Ej: 12345678-9 o 12345678-K
    if not _RE_RUT.fullmatch(rut):
        raise ValidationError("RUT inválido: ingrésalo sin puntos y con guión (Ej: 12345678-9).")

    # Contacto: 9 dígitos
    if not _RE_CONTACTO.fullmatch(contacto):
        raise ValidationError("Contacto inválido: deben ser 9 dígitos numéricos.")

    try:
        return paciente_repository.create_paciente(nombre, rut, contacto)
    except IntegrityError:
        raise DuplicateRUTError(f"El RUT '{rut}' ya existe.")


def obtener_pacientes() -> list[dict]:
    return paciente_repository.list_pacientes()
