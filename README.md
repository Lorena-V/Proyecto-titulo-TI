# Proyecto de Titulacion TI

Aplicacion web para la gestion de pacientes, recetas, medicamentos y despachos, desarrollada como proyecto de titulacion para la carrera de Tecnico en Informatica (Instituto Iplacex). Esta app usa Flask y una base de datos MySQL.

## Funcionalidades principales
- Autenticacion por usuario y rol (QF, AUXILIAR, ABASTECIMIENTO).
- Gestion de pacientes, recetas y medicamentos.
- Calculo de estadisticas y proyecciones de medicamentos.
- Reportes y vistas por rol.

## Requisitos
- Python 3.10+
- MySQL / MariaDB

## Configuracion
Crea un archivo `.env` en la raiz del proyecto con:

```env
DB_USER=usuario_db
DB_PASSWORD=clave_db
DB_HOST=localhost
DB_PORT=3306
DB_NAME=nombre_db
SECRET_KEY=tu_clave_secreta
```

## Instalacion
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Ejecucion
```bash
python app.py
```

Luego abre `http://localhost:5000/login`.

## Estructura del proyecto
- `app/` contiene la aplicacion Flask (rutas, templates, static).
- `app/routes/` contiene blueprints y endpoints API.
- `app/static/` contiene JS y estilos.
- `app/templates/` contiene las vistas HTML.
- `app/db.py` define la conexion a la base de datos.

## Notas
- La app asume una base de datos existente con las tablas correspondientes.
- El debug esta habilitado por defecto en `app.py`.
