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
