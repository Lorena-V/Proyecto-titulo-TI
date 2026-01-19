
// Agrega funcionalidad de búsqueda y filtros para gestión de medicamentos
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchMedicamento");
  const tbody = document.getElementById("tablaMedicamentosBody");
  const filtroSelect = document.getElementById("filtroPeriodo");
  const btnFiltrar = document.getElementById("btnFiltrar");

  if (!searchInput || !tbody) return;

  function refrescarTabla() {
    const q = searchInput.value || "";
    const periodo = filtroSelect ? filtroSelect.value : "mes";
    cargarMedicamentos(q, periodo);
  }

  async function cargarMedicamentos(query = "", periodo = "mes") {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (periodo) params.set("periodo", periodo);

    const res = await fetch(`/api/medicamentos/lista?${params.toString()}`);
    const data = await res.json();

    tbody.innerHTML = "";

    data.forEach((m) => {
      const proyeccion = Math.max(0, Number(m.proyeccion ?? 0));

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${m.id_medicamento}</td>
        <td>${m.nombre}</td>
        <td>${m.recetas ?? 0}</td>
        <td>${m.despachos ?? 0}</td>
        <td>${proyeccion}</td>
      `;
      tbody.appendChild(tr);
    });

    if (data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-muted">Sin resultados</td>
        </tr>
      `;
    }
  }

  // Cargar inicial
  refrescarTabla();

  // Exponer función globalmente (para recarga externa)
  window.refrescarMedicamentos = refrescarTabla;

  // Evento: búsqueda dinámica
  searchInput.addEventListener("input", refrescarTabla);

  // Evento: cambio de periodo
  if (filtroSelect) {
    filtroSelect.addEventListener("change", refrescarTabla);
  }

  // Evento: botón filtrar 
  if (btnFiltrar) {
    btnFiltrar.addEventListener("click", refrescarTabla);
  }
});

// Agrega funcionalidad de búsqueda y filtros para gestión de pacientes
document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("tablaPacientesBody");
  if (!tbody) return;

  // Elementos de filtro
  const searchInput = document.getElementById("searchPaciente");
  const filtroEstado = document.getElementById("filtroEstado");
  const btnFiltrar = document.getElementById("btnFiltrarPacientes");
  const btnReporte = document.getElementById("btnReportePacientes");

  let allData = []; // cache

  

  function estadoCalculado(row) {
    // fecha de vencimiento para decidir Vigente / Vencida / Porvencer
    // Por vencer = vigente y vence dentro de 30 días
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (!row.vencimiento) return row.estado || "Vigente";

    const [y, m, d] = row.vencimiento.split("-").map(Number);
    const venc = new Date(y, m - 1, d);
    venc.setHours(0, 0, 0, 0);

    if (venc < hoy) return "Vencida";

    const diffDias = Math.ceil((venc - hoy) / (1000 * 60 * 60 * 24));
    if (diffDias <= 30) return "Porvencer";

    return "Vigente";
  }

  // Renderiza la tabla con los datos dados (del filtro)
  function render(data) {
    tbody.innerHTML = "";

    data.forEach((row) => {
      const est = estadoCalculado(row);
      const badgeClass =
        est === "Vigente" ? "bg-success" :
        est === "Porvencer" ? "bg-warning text-dark" :
        "bg-danger";

      // Crear fila  
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.paciente}</td>
        <td>${row.rut ?? "-"}</td>
        <td>${row.contacto ?? "-"}</td>
        <td>${row.recetas}</td>
        <td>${row.patologia}</td>
        <td>${formatFecha(row.ingreso)}</td>
        <td>${formatFecha(row.vencimiento)}</td>
        <td><span class="badge ${badgeClass}">${est}</span></td>
        <td>${row.ultimo_despacho ? formatFecha(row.ultimo_despacho) : "-"}</td>
        <td>${row.despachos_realizados}</td>
      `;
      tbody.appendChild(tr);
    });

    if (data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" class="text-center text-muted">Sin resultados</td>
        </tr>
      `;
    }
  }

  function aplicarFiltros() {
    const q = (searchInput?.value || "").toLowerCase().trim();
    const estadoSel = filtroEstado?.value || "";

    const filtrados = allData.filter((row) => {
      // Buscador: solo por nombre de paciente
      if (q && !(row.paciente || "").toLowerCase().includes(q)) {
        return false;
      }

      // Filtro estado
      if (estadoSel) {
        const est = estadoCalculado(row);
        if (estadoSel !== est) return false;
      }

      return true;
    });

    render(filtrados);
  }

  // Carga inicial de datos de pacientes
  async function cargarPacientes() {
    // Obtener datos del servidor
    try {
      // Fetch API
      const res = await fetch("/api/gestion_pacientes");
      const data = await res.json();
      allData = Array.isArray(data) ? data : [];
      aplicarFiltros(); // render inicial
    } catch (err) {
      console.error("Error cargando pacientes:", err);
    }
  }
  // Exponer función globalmente (para recarga externa)
  window.cargarPacientes = cargarPacientes;
  // Iniciar carga (actualiza allData)
  cargarPacientes();

  // Eventos de filtros para pacientes
  if (searchInput) {
    searchInput.addEventListener("input", aplicarFiltros);
  }
  if (filtroEstado) {
    filtroEstado.addEventListener("change", aplicarFiltros);
  }
  if (btnFiltrar) {
    btnFiltrar.addEventListener("click", aplicarFiltros);
  }

  // Evento: botón reporte CSV
  btnReporte?.addEventListener("click", () => {
    const q = (document.getElementById("searchPaciente")?.value || "").trim();
    const estado = (document.getElementById("filtroEstado")?.value || "").trim();

    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (estado) params.set("estado", estado);

    // Fuerza descarga del CSV con los filtros aplicados
    window.location.href = `/api/reportes/pacientes_csv?${params.toString()}`;
  });
});

// Formatea una fecha AAAA-MM-DD a DD/MM/AAAA
function formatFecha(fecha) {
  if (!fecha) return "-";
  const [y, m, d] = fecha.split("-");
  return `${d}/${m}/${y}`;
}

// Agrega JS para el formulario de nuevo paciente y validaciones en vivo
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formNuevoPaciente");
  if (!form) return;

  const nombreInput = form.querySelector('input[name="nombre"]');
  const rutInput = form.querySelector('input[name="rut"]');
  const contactoInput = form.querySelector('input[name="contacto"]');
  const btnGuardar = document.querySelector('button[form="formNuevoPaciente"]');

  function validarNombreEnVivo() {
    if (!nombreInput) return true;
    const nombreRaw = (nombreInput.value || "").trim();
    const nombreOk = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]{3,}$/.test(nombreRaw);
    nombreInput.classList.toggle("is-invalid", !nombreOk);
    nombreInput.classList.toggle("is-valid", nombreOk);
    return nombreOk;
  }

  if (nombreInput) {
    nombreInput.addEventListener("input", () => {
      validarNombreEnVivo();
      actualizarEstadoGuardar();
    });
  }

  function validarRutEnVivo() {
    if (!rutInput) return true; 
    const rutRaw = (rutInput.value || "").trim(); // Validación simple
    const rutOk = /^\d{7,8}-[0-9kK]$/.test(rutRaw); // Ej: 12345678-9
    rutInput.classList.toggle("is-invalid", !rutOk);
    rutInput.classList.toggle("is-valid", rutOk);
    return rutOk;
  }

  if (rutInput) {
    rutInput.addEventListener("input", () => {
      validarRutEnVivo();
      actualizarEstadoGuardar();
    });
  }

  function validarContactoEnVivo() {
    if (!contactoInput) return true;
    const contactoRaw = (contactoInput.value || "").trim();
    const contactoOk = /^\d{9}$/.test(contactoRaw);
    contactoInput.classList.toggle("is-invalid", !contactoOk);
    contactoInput.classList.toggle("is-valid", contactoOk);
    return contactoOk;
  }

  if (contactoInput) {
    contactoInput.addEventListener("input", () => {
      validarContactoEnVivo();
      actualizarEstadoGuardar();
    });
  }

  function actualizarEstadoGuardar() {
    const nombreRaw = (nombreInput?.value || "").trim();
    const rutRaw = (rutInput?.value || "").trim();
    const contactoRaw = (contactoInput?.value || "").trim();

    const nombreOk = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]{3,}$/.test(nombreRaw);
    const rutOk = /^\d{7,8}-[0-9kK]$/.test(rutRaw); // Ej: 12345678-9
    const contactoOk = /^\d{9}$/.test(contactoRaw);
    if (btnGuardar) {
      btnGuardar.disabled = !(nombreOk && rutOk && contactoOk);
    }
  }

  actualizarEstadoGuardar();

  // Maneja el envío del formulario
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    // --- VALIDACIONES FRONTEND (Nuevo Paciente) ---
    const nombreRaw = (formData.get("nombre") || "").trim();
    const rutRaw = (formData.get("rut") || "").trim();
    const contactoRawRaw = (formData.get("contacto") || "").trim();

    // 1) Nombre: mínimo 3 letras, solo letras/espacios/acentos
    const nombreOk = validarNombreEnVivo();
    if (!nombreOk) {
      alert("Nombre inválido: usa solo letras y mínimo 3 caracteres.");
      return;
    }

    // 2) RUT: validación simple para datos de prueba
    const rutOk = validarRutEnVivo();
    if (!rutOk) {
      alert("RUT inválido: ingresa rut sin puntos y con guión");
      return;
    }

    // 2) Contacto: exactamente 9 dígitos
    const contactoOk = validarContactoEnVivo();
    if (!contactoOk) {
      alert("Contacto inválido: deben ser 9 dígitos numéricos.");
      return;
    }

    const payload = {
      nombre: nombreRaw,
      rut: rutRaw,
      contacto: contactoRawRaw,
    };

    // Enviar a servidor
    try {
      const res = await fetch("/pacientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Error al crear paciente");
        return;
      }

      const data = await res.json();
      const modalEl = document.getElementById("modalNuevoPaciente");
      const modal = bootstrap.Modal.getInstance(modalEl);

      // Esperar a que el modal se cierre completamente
      modalEl.addEventListener(
        "hidden.bs.modal",
        async () => {
          mostrarConfirmacionPaciente(data.id);
          form.reset();
        },
        { once: true } // importante: solo una vez
      );

      modal.hide();

    } catch (err) {
      console.error("Error real: ", err);
      alert("Error (ver consola).");
    }
  });
});

// Muestra una alerta de confirmación al crear un paciente
function mostrarConfirmacionPaciente(idPaciente) {
  const container = document.createElement("div");
  container.className =
    "alert alert-success d-flex justify-content-between align-items-center mt-3";

  container.innerHTML = `
    <div>
      <strong>Paciente creado correctamente.</strong>
    </div>
    <div class="d-flex gap-2">
      <a href="/gestion_recetas?paciente=${idPaciente}"
         class="btn btn-sm btn-outline-primary">
        Crear receta
      </a>
      <button class="btn btn-sm btn-outline-secondary" id="btnCerrarConfirmacion">
        Volver al listado
      </button>
    </div>
  `;

  const card = document.querySelector(".card-body");
  card.prepend(container);

  // BOTÓN cerrar confirmación → refresca lista
  container
    .querySelector("#btnCerrarConfirmacion")
    .addEventListener("click", async () => {
      container.remove();

      // Recargar lista de pacientes (No los muestra ???  CORREGIR!!)
      if (window.cargarPacientes) {
        await window.cargarPacientes();
      }
    });
}

// Carga la lista de medicamentos en el formulario de "nueva receta"
document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("listaMedicamentos");
  if (!contenedor) return;

  fetch("/api/medicamentos/lista")
    .then(res => res.json())
    .then(data => {
      contenedor.innerHTML = "";

      data.forEach(m => {
        const div = document.createElement("div");
        div.className = "form-check";

        div.innerHTML = `
          <input class="form-check-input"
                 type="checkbox"
                 name="medicamentos"
                 value="${m.id_medicamento}"
                 id="med_${m.id_medicamento}">
          <label class="form-check-label" for="med_${m.id_medicamento}">
            ${m.nombre}
          </label>
        `;

        contenedor.appendChild(div);
      });
    })
    .catch(err => {
      console.error("Error cargando medicamentos:", err);
      contenedor.innerHTML =
        `<div class="text-danger small">Error al cargar medicamentos</div>`;
    });
});

// Agrega funcionalidad al formulario de nueva receta
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formNuevaReceta");
  if (!form) return;

  const fechaInput = form.querySelector('input[name="fecha_emision"]');
  const duracionInput = form.querySelector('input[name="duracion"]');
  const patologiaSelect = form.querySelector('select[name="id_patologia"]');
  const listaMedicamentos = document.getElementById("listaMedicamentos");
  const medicamentosFeedback = document.getElementById("medicamentosFeedback");
  const rutInput = document.getElementById("rutPacienteReceta");
  const rutFeedback = document.getElementById("rutPacienteFeedback");
  const rutRegex = /^\d{7,8}-[0-9Kk]$/;
  let rutExiste = false; 
  let rutUltimo = ""; // para evitar consultas repetidas
  let rutTimer = null; // para no saturar el servidor (espera a que el paciente escriba)
  let rutSeq = 0; // secuencia para evitar respuestas fuera de orden

  function setRutFeedback(msg) {
    if (rutFeedback) rutFeedback.textContent = msg;
  }

  function marcarRutInvalido(msg) {
    if (rutInput) {
      rutInput.classList.add("is-invalid");
      rutInput.classList.remove("is-valid");
    }
    if (msg) setRutFeedback(msg);
  }

  function marcarRutValido() {
    if (rutInput) {
      rutInput.classList.add("is-valid");
      rutInput.classList.remove("is-invalid");
    }
  }

  async function validarRutEnSubmit() {
    if (!rutInput) return true;
    const v = (rutInput.value || "").trim();

    if (!v) {
      rutExiste = false;
      rutUltimo = "";
      marcarRutInvalido("RUT requerido.");
      return false;
    }

    if (!rutRegex.test(v)) {
      rutExiste = false;
      rutUltimo = "";
      marcarRutInvalido("Ingresa un rut válido (sin puntos y con guión).");
      return false;
    }

    if (v === rutUltimo && rutExiste) {
      marcarRutValido();
      return true;
    }

    try {
      const res = await fetch(`/pacientes/existe?rut=${encodeURIComponent(v)}`);
      const data = await res.json();
      rutUltimo = v;
      rutExiste = !!data.exists;
      if (!rutExiste) {
        marcarRutInvalido("RUT no existe en nuestros registros. Debe crear paciente.");
        return false;
      }
      marcarRutValido();
      return true;
    } catch (err) {
      rutUltimo = v;
      rutExiste = false;
      marcarRutInvalido("No se pudo validar el RUT.");
      return false;
    }
  }

  function validarRutEnVivo() {
    if (!rutInput) return true;
    const v = (rutInput.value || "").trim();

    if (!v) {
      rutExiste = false;
      rutUltimo = "";
      marcarRutInvalido("RUT requerido.");
      return false;
    }

    if (!rutRegex.test(v)) {
      rutExiste = false;
      rutUltimo = "";
      marcarRutInvalido("Ingresa un rut válido (sin puntos y con guión).");
      return false;
    }

    if (v === rutUltimo && rutExiste) {
      marcarRutValido();
      return true;
    }

    rutExiste = false;
    rutUltimo = "";
    if (rutInput) {
      rutInput.classList.remove("is-valid", "is-invalid");
    }

    if (rutTimer) clearTimeout(rutTimer);
    const seq = ++rutSeq;
    rutTimer = setTimeout(async () => {
      try {
        const res = await fetch(`/pacientes/existe?rut=${encodeURIComponent(v)}`);
        const data = await res.json();
        if (seq !== rutSeq) return;
        rutUltimo = v;
        rutExiste = !!data.exists;
        if (!rutExiste) {
          marcarRutInvalido("RUT no existe en nuestros registros, debe crear nuevo paciente.");
        } else {
          marcarRutValido();
        }
      } catch (err) {
        if (seq !== rutSeq) return;
        rutUltimo = v;
        rutExiste = false;
        marcarRutInvalido("No se pudo validar el RUT.");
      }
    }, 300);

    return false;
  }

  if (rutInput) {
    rutInput.addEventListener("input", validarRutEnVivo);
    rutInput.addEventListener("blur", validarRutEnVivo);
  }

  function validarFechaEnVivo() {
    if (!fechaInput) return true;
    const v = (fechaInput.value || "").trim();
    if (!v) {
      fechaInput.classList.add("is-invalid");
      fechaInput.classList.remove("is-valid");
      return false;
    }
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const [y, m, d] = v.split("-").map(Number);
    const f = new Date(y, m - 1, d);
    f.setHours(0, 0, 0, 0);
    const ok = !Number.isNaN(f.getTime()) && f <= hoy;
    fechaInput.classList.toggle("is-invalid", !ok);
    fechaInput.classList.toggle("is-valid", ok);
    return ok;
  }

  if (fechaInput) {
    fechaInput.addEventListener("change", validarFechaEnVivo);
    fechaInput.addEventListener("blur", validarFechaEnVivo);
  }

  function validarDuracionEnVivo() {
    if (!duracionInput) return true;
    const v = (duracionInput.value || "").trim();
    const n = Number(v);
    const ok = Number.isInteger(n) && n >= 30 && n <= 180;
    duracionInput.classList.toggle("is-invalid", !ok);
    duracionInput.classList.toggle("is-valid", ok);
    return ok;
  }

  if (duracionInput) {
    duracionInput.addEventListener("input", validarDuracionEnVivo);
    duracionInput.addEventListener("blur", validarDuracionEnVivo);
  }

  // Validar patología seleccionada
  function validarPatologiaEnVivo() {
    if (!patologiaSelect) return true;
    const valuePatología = (patologiaSelect.value || "").trim(); // debe ser id seleccionado
    const ok = valuePatología !== ""; // alguna opción seleccionada
    patologiaSelect.classList.toggle("is-invalid", !ok);
    patologiaSelect.classList.toggle("is-valid", ok);
    return ok;
  }

  if (patologiaSelect) {
    patologiaSelect.addEventListener("change", validarPatologiaEnVivo);
    patologiaSelect.addEventListener("blur", validarPatologiaEnVivo);
  }

  function validarMedicamentosEnVivo() {
    if (!listaMedicamentos) return true;
    const seleccionados = listaMedicamentos.querySelectorAll('input[name="medicamentos"]:checked').length;
    const ok = seleccionados > 0;
    listaMedicamentos.classList.toggle("border-danger", !ok);
    listaMedicamentos.classList.toggle("border-success", ok);
    if (medicamentosFeedback) {
      medicamentosFeedback.style.display = ok ? "none" : "block";
    }
    return ok;
  }

  if (listaMedicamentos) {
    listaMedicamentos.addEventListener("change", (e) => {
      if (e.target && e.target.matches('input[name="medicamentos"]')) {
        validarMedicamentosEnVivo();
      }
    });
  }

  // Maneja el envío del formulario
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    const medicamentosSeleccionados = [];
    form.querySelectorAll('input[name="medicamentos"]:checked')
      .forEach(chk => medicamentosSeleccionados.push(chk.value));

    const fechaOk = validarFechaEnVivo();
    if (!fechaOk) {
      alert("Fecha inválida: no se pueden ingresar futuros despachos");
      return;
    }

    const duracionOk = validarDuracionEnVivo();
    if (!duracionOk) {
      alert("Duración inválida: debe ser entre 30 y 180 días.");
      return;
    }

    const patologiaOk = validarPatologiaEnVivo();
    if (!patologiaOk) {
      alert("Selecciona una patología.");
      return;
    }

    const medicamentosOk = validarMedicamentosEnVivo();
    if (!medicamentosOk) {
      alert("Selecciona al menos un medicamento.");
      return;
    }

    const rutOk = await validarRutEnSubmit();
    if (!rutOk) {
      alert("RUT inválido o no encontrado.");
      return;
    }

    const payload = {
      rut_paciente: (rutInput?.value || "").trim(),
      fecha_emision: formData.get("fecha_emision"),
      duracion: formData.get("duracion"),
      id_patologia: formData.get("id_patologia"),
      medicamentos: medicamentosSeleccionados,
    };

    try {
      const res = await fetch("/api/recetas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Error al crear receta");
        return;
      }

      // cerrar modal
      const modalEl = document.getElementById("modalNuevaReceta");
      const modal = bootstrap.Modal.getInstance(modalEl);
      modal.hide();

      alert("Receta creada correctamente");

      form.reset();
      // desmarcar medicamentos
      form.querySelectorAll('input[name="medicamentos"]')
        .forEach(chk => chk.checked = false);

      if (window.cargarRecetas) {
        window.cargarRecetas();
      }

    } catch (err) {
      console.error(err);
      alert("Error (ver consola).");
    }
  });
});

// Agrega funcionalidad de búsqueda y filtros para gestión de recetas
document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("tablaRecetasBody");
  if (!tbody) return;

  const searchInput = document.getElementById("searchReceta");
  const filtroEstado = document.getElementById("filtroEstadoReceta");
  const btnFiltrar = document.getElementById("btnFiltrarRecetas");

  let allData = []; // cache

  function badgeEstado(estado) {
    if (estado === "Vigente") return "bg-success";
    if (estado === "Por vencer") return "bg-warning text-dark";
    return "bg-danger";
  }

  function render(data) {
    tbody.innerHTML = "";

    if (!data.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" class="text-center text-muted">Sin resultados</td>
        </tr>
      `;
      return;
    }

    data.forEach((r) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${r.paciente}</td>
        <td>${r.patologia}</td>
        <td>${formatFecha(r.fecha_emision)}</td>
        <td>${r.duracion} días</td>
        <td>${formatFecha(r.fecha_vencimiento)}</td>
        <td><span class="badge ${badgeEstado(r.estado)}">${r.estado}</span></td>
        <td>${r.despachos ?? 0}</td>
        <td>${r.ultimo_despacho ? formatFecha(r.ultimo_despacho) : "-"}</td>
        <td class="text-center">
          <button
            class="btn btn-outline-secondary btn-sm"
            title="Ver medicamentos"
            aria-label="Ver medicamentos de la receta"
            onclick="verMedicamentosReceta(${r.id_receta})">
            <i class="bi bi-capsule"></i>
          </button>
        </td>
        <td class="text-end">
          <button
            class="btn btn-outline-primary btn-sm"
            type="button"
            onclick="abrirModalDespacho(${r.id_receta})">
              Registrar despacho
          </button>
        </td>
      `;

      tbody.appendChild(tr);
    });
  }

  function aplicarFiltros() {
    const q = (searchInput?.value || "").toLowerCase().trim();
    const estadoSel = filtroEstado?.value || "";

    const filtrados = allData.filter((r) => {
      if (q && !(r.paciente || "").toLowerCase().includes(q)) return false;
      if (estadoSel && r.estado !== estadoSel) return false;
      return true;
    });

    render(filtrados);
  }

  async function cargarRecetas() {
    try {
      const res = await fetch("/api/gestion_recetas");
      const data = await res.json();
      allData = Array.isArray(data) ? data : [];
      aplicarFiltros();
    } catch (err) {
      console.error("Error cargando recetas:", err);
      tbody.innerHTML = `
        <tr>
          <td colspan="9" class="text-center text-danger">
            Error al cargar datos
          </td>
        </tr>
      `;
    }
  }

  // Inicial
  cargarRecetas();

  // Eventos
  if (searchInput) searchInput.addEventListener("input", aplicarFiltros);
  if (filtroEstado) filtroEstado.addEventListener("change", aplicarFiltros);
  if (btnFiltrar) btnFiltrar.addEventListener("click", aplicarFiltros);

  // (opcional) exponer para recargar desde otros flujos
  window.cargarRecetas = cargarRecetas;
});

// Funcionalidad para el modal de registrar despacho
let recetaSeleccionada = null;
// Abre el modal de despacho para la receta dada
function abrirModalDespacho(idReceta) {
  recetaSeleccionada = idReceta;
  const modal = new bootstrap.Modal(
    document.getElementById("modalDespacho")
  );
  modal.show();
}

// Maneja el envío del formulario de despacho
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btnConfirmarDespacho");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    try {
      const res = await fetch("/api/despachos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_tratamiento: recetaSeleccionada }),
      });

      if (!res.ok) {
        alert("Error al registrar despacho");
        return;
      }

      const modalEl = document.getElementById("modalDespacho");
      bootstrap.Modal.getInstance(modalEl).hide();

      if (window.cargarRecetas) {
        window.cargarRecetas();
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión");
    }
  });
});

// Función para ver medicamentos de una receta en un modal
async function verMedicamentosReceta(idReceta) {
  const contenedor = document.getElementById("contenidoMedicamentosReceta");
  contenedor.innerHTML = `<p class="text-muted mb-0">Cargando medicamentos...</p>`;

  try {
    const res = await fetch(`/api/recetas/${idReceta}/medicamentos`);
    const data = await res.json();

    if (!res.ok) {
      contenedor.innerHTML = `<p class="text-danger">Error al cargar medicamentos</p>`;
      return;
    }

    if (data.length === 0) {
      contenedor.innerHTML = `<p class="text-muted">No hay medicamentos asociados.</p>`;
    } else {
      contenedor.innerHTML = `
        <ul class="list-group list-group-flush">
          ${data.map(m => `
            <li class="list-group-item">
              ${m.nombre}
            </li>
          `).join("")}
        </ul>
      `;
    }

    const modal = new bootstrap.Modal(document.getElementById("modalMedicamentosReceta"));
    modal.show();

  } catch (err) {
    console.error(err);
    contenedor.innerHTML = `<p class="text-danger">Error de conexión</p>`;
  }
}

// Agrega funcionalidad al formulario de nuevo medicamento
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formNuevoMedicamento");
  if (!form) return;

  const inputNombre = document.getElementById("nombreMedicamento");
  const btnGuardar = document.getElementById("btnGuardarMedicamento");

  function validarNombre() {
    const v = (inputNombre.value || "").trim();
    const ok = v.length >= 3;
    inputNombre.classList.toggle("is-invalid", !ok);
    inputNombre.classList.toggle("is-valid", ok);
    if (btnGuardar) btnGuardar.disabled = !ok;
    return ok;
  }

  inputNombre?.addEventListener("input", validarNombre);
  validarNombre();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validarNombre()) return;

    const nombre = (inputNombre.value || "").trim();

    try {
      const res = await fetch("/api/medicamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error al crear medicamento");
        return;
      }

      // cerrar modal
      const modalEl = document.getElementById("modalNuevoMedicamento");
      const modal = bootstrap.Modal.getInstance(modalEl);
      modal.hide();

      // limpiar
      form.reset();
      inputNombre.classList.remove("is-valid", "is-invalid");
      validarNombre();

      // refrescar tabla medicamentos (reusa tu flujo actual)
      if (window.refrescarMedicamentos) {
        await window.refrescarMedicamentos();
      } else {
        // fallback: recarga la página si no tenemos función global
        location.reload();
      }

    } catch (err) {
      console.error(err);
      alert("Error de conexión con el servidor");
    }
  });
});
