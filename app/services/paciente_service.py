# Trabaja con tabla paciente, se creó para crear paciente, listar pacientes
from app.repositories import paciente_repository
from sqlalchemy.exc import IntegrityError

class ValidationError(Exception):
    pass

#rut duplicado
class DuplicateRUTError(Exception):
    pass


def crear_paciente(nombre: str, rut: str) -> int:
    nombre = (nombre or "").strip()
    rut = (rut or "").strip()

    if not nombre:
        raise ValidationError("El nombre es obligatorio.")
    if not rut:
        raise ValidationError("El RUT es obligatorio.")
    if len(rut) < 8 or len(rut) > 12:
        raise ValidationError("El RUT debe tener entre 8 y 12 caracteres.")

    try:
        return paciente_repository.create_paciente(nombre, rut)
    except IntegrityError:
        raise DuplicateRUTError(f"El RUT '{rut}' ya existe.")
    

def obtener_pacientes() -> list[dict]:
    return paciente_repository.list_pacientes()
