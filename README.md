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
DB_NAME=farmaciaDB
SECRET_KEY=tu_clave_secreta
```

## Instalacion
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Base de datos (dump.sql)
El proyecto incluye un dump completo en `dump.sql`.

### 1) Crear usuario (opcional) y permisos
Si quieres usar un usuario dedicado para la app:

```sql
CREATE USER 'farmacia_user'@'localhost' IDENTIFIED BY 'tu_password';
GRANT ALL PRIVILEGES ON farmaciaDB.* TO 'farmacia_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2) Importar el dump
Desde la raiz del proyecto:

```bash
mysql -u root -p < dump.sql
```

Notas:
- El dump ya contiene `CREATE DATABASE farmaciaDB` y `USE farmaciaDB`.
- Si ya tenias tablas previas, el dump las reemplaza (`DROP TABLE IF EXISTS`).

### 3) Configurar `.env` para la DB
Asegura que los valores coincidan con tu servidor MySQL/MariaDB:

```env
DB_USER=farmacia_user
DB_PASSWORD=tu_password
DB_HOST=localhost
DB_PORT=3306
DB_NAME=farmaciaDB
```

### 4) Verificar que cargo correctamente
Puedes validar tablas y datos basicos:

```bash
mysql -u farmacia_user -p -D farmaciaDB -e "SHOW TABLES;"
mysql -u farmacia_user -p -D farmaciaDB -e "SELECT COUNT(*) AS usuarios FROM usuario;"
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
- La app requiere que la base de datos este cargada desde `dump.sql`.
- El debug esta habilitado por defecto en `app.py`.
