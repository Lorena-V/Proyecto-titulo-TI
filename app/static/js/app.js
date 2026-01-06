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

    const res = await fetch(`/api/medicamentos?${params.toString()}`);
    const data = await res.json();

    tbody.innerHTML = "";

    data.forEach((m) => {
      const proyeccion = Math.max(
        0,
        (m.recetas ?? 0) - (m.despachos ?? 0)
      );

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${m.id}</td>
        <td>${m.nombre}</td>
        <td>${m.recetas ?? 0}</td>
        <td>${m.despachos ?? 0}</td>
        <td>${proyeccion}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Cargar inicial
  refrescarTabla();

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

// document.addEventListener("DOMContentLoaded", () => {
//   const tbody = document.getElementById("tablaPacientesBody");
//   if (!tbody) return;

//   fetch("/api/gestion_pacientes")
//     .then(res => res.json())
//     .then(data => {
//       tbody.innerHTML = "";

//       data.forEach(row => {
//         const tr = document.createElement("tr");

//         tr.innerHTML = `
//           <td>${row.paciente}</td>
//           <td>${row.contacto ?? "-"}</td>
//           <td>${row.recetas}</td>
//           <td>${row.patologia}</td>
//           <td>${formatFecha(row.ingreso)}</td>
//           <td>${row.duracion_dias} días</td>
//           <td>${formatFecha(row.vencimiento)}</td>
//           <td>
//             <span class="badge ${row.estado === "Vigente" ? "bg-success" : "bg-danger"}">
//               ${row.estado}
//             </span>
//           </td>
//           <td>${row.ultimo_despacho ? formatFecha(row.ultimo_despacho) : "-"}</td>
//           <td>${row.despachos_realizados}</td>
//         `;

//         tbody.appendChild(tr);
//       });
//     })
//     .catch(err => {
//       console.error("Error cargando pacientes:", err);
//       tbody.innerHTML = `
//         <tr>
//           <td colspan="10" class="text-center text-danger">
//             Error al cargar datos
//           </td>
//         </tr>
//       `;
//     });
// });

// Agrega funcionalidad de búsqueda y filtros para gestión de pacientes
document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("tablaPacientesBody");
  if (!tbody) return;

  // Elementos de filtro
  const searchInput = document.getElementById("searchPaciente");
  const filtroEstado = document.getElementById("filtroEstado");
  const btnFiltrar = document.getElementById("btnFiltrarPacientes");

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
        <td>${row.contacto ?? "-"}</td>
        <td>${row.recetas}</td>
        <td>${row.patologia}</td>
        <td>${formatFecha(row.ingreso)}</td>
        <td>${row.duracion_dias} días</td>
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
});

// Formatea una fecha AAAA-MM-DD a DD/MM/AAAA
function formatFecha(fecha) {
  if (!fecha) return "-";
  const [y, m, d] = fecha.split("-");
  return `${d}/${m}/${y}`;
}

// Agrega JS para el formulario de nuevo paciente
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formNuevoPaciente");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const payload = {
      nombre: formData.get("nombre"),
      rut: formData.get("rut"),
      contacto: formData.get("contacto"),
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

