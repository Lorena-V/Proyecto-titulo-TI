# Proyecto-titulo-TI
Sistema web para la gestion de pacientes, recetas, medicamentos y despachos en farmacia.
Proyecto de titulacion de la carrera de Tecnico en Informatica (Instituto Iplacex).

## Caracteristicas principales
- Autenticacion con roles (QF, AUXILIAR, ABASTECIMIENTO).
- Gestion de pacientes y recetas con validaciones de RUT y contacto.
- Gestion de medicamentos y estadisticas por periodo.
- Registro de despachos por tratamiento.
- Reporte CSV de pacientes con filtros.

## Stack
- Backend: Flask + SQLAlchemy (MySQL/MariaDB).
- Frontend: Jinja2 + HTML/CSS/JS.
- DB: script `farmaciaDB_completa.sql`.

## Estructura del proyecto
- `app.py`: punto de entrada.
- `app/__init__.py`: factory de la app y registro de blueprints.
- `app/routes/`: rutas web y API.
- `app/templates/`: vistas HTML.
- `app/static/`: CSS y JS.
- `app/services/` y `app/repositories/`: logica de negocio y acceso a datos.

## Requisitos
- Python 3.10+ (recomendado).
- MySQL/MariaDB.

## Configuracion (.env)
Crear un archivo `.env` en la raiz con:

```env
SECRET_KEY=dev
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_HOST=localhost
DB_PORT=3306
DB_NAME=farmacia_db
```

## Base de datos
1) Crear la base de datos.
2) Importar el schema/datos:

```bash
mysql -u <usuario> -p <nombre_db> < farmaciaDB_completa.sql
```

El script incluye roles y usuarios de ejemplo. Las contrasenas estan hasheadas (bcrypt).

## Ejecutar en local
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

App disponible en `http://127.0.0.1:5000`.

## Rutas web principales
- `/login`: inicio de sesion.
- `/home`: dashboard con menu segun rol.
- `/gestion_pacientes`, `/gestion_recetas`, `/gestion_medicamentos`, `/reportes`, `/usuarios`.

## Endpoints API (resumen)
- `GET /` y `GET /health/db` (healthcheck).
- Pacientes:
  - `GET /pacientes`
  - `GET /pacientes/existe?rut=...`
  - `POST /pacientes`
- Gestion pacientes: `GET /api/gestion_pacientes`
- Medicamentos:
  - `POST /api/medicamentos`
  - `GET /api/medicamentos/lista?periodo=mes|1m|2m&q=...`
- Recetas:
  - `POST /api/recetas`
  - `GET /api/recetas/<id_receta>/medicamentos`
  - `GET /api/gestion_recetas`
- Despachos: `POST /api/despachos`
- Reportes: `GET /api/reportes/pacientes_csv`

## Notas de permisos
Los endpoints y vistas usan `login_required` y `roles_required` para restringir acceso segun rol.
