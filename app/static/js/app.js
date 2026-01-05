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

document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("tablaPacientesBody");
  if (!tbody) return;

  fetch("/api/gestion_pacientes")
    .then(res => res.json())
    .then(data => {
      tbody.innerHTML = "";

      data.forEach(row => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
          <td>${row.paciente}</td>
          <td>${row.contacto ?? "-"}</td>
          <td>${row.recetas}</td>
          <td>${row.patologia}</td>
          <td>${formatFecha(row.ingreso)}</td>
          <td>${row.duracion_dias} días</td>
          <td>${formatFecha(row.vencimiento)}</td>
          <td>
            <span class="badge ${row.estado === "Vigente" ? "bg-success" : "bg-danger"}">
              ${row.estado}
            </span>
          </td>
          <td>${row.ultimo_despacho ? formatFecha(row.ultimo_despacho) : "-"}</td>
          <td>${row.despachos_realizados}</td>
        `;

        tbody.appendChild(tr);
      });
    })
    .catch(err => {
      console.error("Error cargando pacientes:", err);
      tbody.innerHTML = `
        <tr>
          <td colspan="10" class="text-center text-danger">
            Error al cargar datos
          </td>
        </tr>
      `;
    });
});

function formatFecha(fecha) {
  if (!fecha) return "-";
  const [y, m, d] = fecha.split("-");
  return `${d}/${m}/${y}`;
}
