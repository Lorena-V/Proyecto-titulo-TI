document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchMedicamento");
  const tbody = document.getElementById("tablaMedicamentosBody");
  const filtroSelect = document.getElementById("filtroPeriodo");
  const btnFiltrar = document.getElementById("btnFiltrar");

  if (!searchInput || !tbody) return;

  let allData = []; // cache

  function parseFechaYYYYMMDD(s) {
    // "2025-12-20" -> Date
    const [y, m, d] = (s || "").split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  }

  function dentroDelPeriodo(fechaStr, periodo) {
    const fecha = parseFechaYYYYMMDD(fechaStr);
    if (!fecha) return true; // si no hay fecha, no bloquea

    const hoy = new Date();
    const inicio = new Date(hoy);

    if (periodo === "mes") {
      inicio.setMonth(hoy.getMonth() - 1);
    } else if (periodo === "3m") {
      inicio.setMonth(hoy.getMonth() - 3);
    } else if (periodo === "6m") {
      inicio.setMonth(hoy.getMonth() - 6);
    } else {
      return true;
    }

    return fecha >= inicio && fecha <= hoy;
  }

  function render(data) {
    tbody.innerHTML = "";

    data.forEach((m) => {
      const proyeccion = Math.max(0, (m.resetas || 0) - (m.despachos || 0));

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

  function aplicarFiltros() {
    const q = (searchInput.value || "").toLowerCase().trim();
    const periodo = filtroSelect ? filtroSelect.value : "mes";

    const filtrado = allData
      .filter((m) => (q ? m.nombre.toLowerCase().includes(q) : true))
      .filter((m) => dentroDelPeriodo(m.fecha, periodo));

    render(filtrado);
  }

  async function cargarInicial() {
    const res = await fetch("/api/medicamentos");
    allData = await res.json();
    aplicarFiltros();
  }

  // Cargar al entrar
  cargarInicial();

  // Evento: búsqueda dinámica
  searchInput.addEventListener("input", aplicarFiltros);

  // Evento: cambio del select (filtra al cambiar)
  if (filtroSelect) {
    filtroSelect.addEventListener("change", aplicarFiltros);
  }

  // Evento: botón filtrar (por si quieres “demostrar click”)
  if (btnFiltrar) {
    btnFiltrar.addEventListener("click", aplicarFiltros);
  }
});
