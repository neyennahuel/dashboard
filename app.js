// app.js
// ----------------------------------------
// 0. Verificación de sesión (completa al cargar el DOM)
// ----------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  if (!localStorage.getItem("logged")) {
    window.location.href = "login.html";
    return;
  }

  // ----------------------------
  // 1) Datos simulados (ventas + clientes)
  // ----------------------------
  const metodosPago = ["Efectivo", "Débito", "Crédito", "Transferencia"];
  const vendedores = ["Juan Pérez", "Ana López", "Marcos Díaz", "Julia Soto"];

  function randomDate() {
    const start = new Date(2024, 0, 1);
    const end = new Date(2024, 11, 31);
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
      .toISOString()
      .split("T")[0];
  }

  const ventas = Array.from({ length: 32 }, (_, i) => {
    const cantidad = Math.floor(Math.random() * 4) + 1;
    const precioUnit = Math.floor(Math.random() * 900) + 100;
    const subtotal = cantidad * precioUnit;
    const iva = Math.round(subtotal * 0.21);
    const total = subtotal + iva;

    return {
      id: i + 1001,
      cliente: `Cliente ${i + 1}`,
      producto: ["Laptop", "Mouse", "Teclado", "Monitor", "Impresora"][Math.floor(Math.random() * 5)],
      cantidad,
      subtotal,
      iva,
      total,
      monto: total,
      fecha: randomDate(),
      estado: Math.random() > 0.25 ? "pagado" : "pendiente",
      metodoPago: metodosPago[Math.floor(Math.random() * metodosPago.length)],
      vendedor: vendedores[Math.floor(Math.random() * vendedores.length)],
      observaciones: "Sin observaciones",
      comprobante: `CMP-${10000 + i}`
    };
  });

  const clientes = Array.from({ length: 12 }, (_, i) => ({
    nombre: `Cliente ${i + 1}`,
    segmento: ["Retail", "PyME", "Corporativo"][i % 3],
    ciudad: ["Buenos Aires", "Córdoba", "Rosario", "Mendoza"][i % 4],
    ultima: randomDate()
  }));

  // ----------------------------
  // 2) Estado global de tabla (filtros + paginación)
  // ----------------------------
  const PAGE_SIZE = 6;
  let currentPage = 1;
  let filteredVentas = ventas.slice();
  let currencySymbol = "$";
  let activeSale = null;

  // ----------------------------
  // 3) Helpers UI (seguridad de querySelector)
  // ----------------------------
  const $ = (id) => document.getElementById(id);
  const formatMoney = (value) => `${currencySymbol}${value.toLocaleString("es-AR")}`;

  // ----------------------------
  // 4) Estadísticas del dashboard (ventas)
  // ----------------------------
  function updateStats() {
    $("statSalesCount").textContent = ventas.length.toLocaleString("es-AR");

    const ingresosTotales = ventas
      .filter(v => v.estado === "pagado")
      .reduce((sum, v) => sum + v.total, 0);

    $("statRevenue").textContent = formatMoney(ingresosTotales);
    $("statPending").textContent = ventas.filter(v => v.estado === "pendiente").length;
  }

  // ----------------------------
  // 5) Gráfico (ingresos por mes)
  // ----------------------------
  const ctx = $("activityChart").getContext("2d");
  const monthlyRevenue = Array(12).fill(0);

  ventas.forEach(v => {
    const m = new Date(v.fecha).getMonth();
    if (v.estado === "pagado") monthlyRevenue[m] += v.total;
  });

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"],
      datasets: [{
        label: "Ingresos",
        data: monthlyRevenue,
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: "rgba(255, 107, 44, 0.65)",
        hoverBackgroundColor: "rgba(255, 107, 44, 0.85)"
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: "rgba(15, 23, 42, 0.08)" } }
      }
    }
  });

  // ----------------------------
  // 6) Render tabla ventas (con paginación)
  // ----------------------------
  function renderSalesTable() {
    const tbody = $("salesTableBody");
    tbody.innerHTML = "";

    const totalPages = Math.max(1, Math.ceil(filteredVentas.length / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = filteredVentas.slice(start, start + PAGE_SIZE);

    pageItems.forEach(v => {
      const tr = document.createElement("tr");
      const statusLabel = v.estado === "pagado" ? "Pagado" : "Pendiente";
      const statusClass = v.estado === "pagado" ? "status--ok" : "status--warn";
      tr.innerHTML = `
        <td>${v.id}</td>
        <td>${v.cliente}</td>
        <td>${v.producto}</td>
        <td>${formatMoney(v.total)}</td>
        <td>${v.fecha}</td>
        <td><span class="status ${statusClass}">${statusLabel}</span></td>
      `;
      tr.addEventListener("click", () => openModal(v));
      tbody.appendChild(tr);
    });

    $("pageLabel").textContent = `Página ${currentPage} / ${totalPages}`;
  }

  // ----------------------------
  // 7) Filtros (buscador + estado)
  // ----------------------------
  function applyFilters() {
    const search = $("searchInput").value.toLowerCase();
    const status = $("statusFilter").value;

    filteredVentas = ventas.filter(v =>
      v.cliente.toLowerCase().includes(search) &&
      (status ? v.estado === status : true)
    );

    currentPage = 1;
    renderSalesTable();
  }

  $("searchInput").addEventListener("input", applyFilters);
  $("statusFilter").addEventListener("change", applyFilters);

  // ----------------------------
  // 8) Export CSV (sobre el conjunto filtrado)
  // ----------------------------
  $("exportBtn").addEventListener("click", () => {
    const rows = [["ID","Cliente","Producto","Cantidad","Subtotal","IVA","Total","Fecha","Estado","Método Pago","Vendedor","Comprobante"]];
    filteredVentas.forEach(v => {
      rows.push([v.id, v.cliente, v.producto, v.cantidad, v.subtotal, v.iva, v.total, v.fecha, v.estado, v.metodoPago, v.vendedor, v.comprobante]);
    });

    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "ventas.csv";
    a.click();

    URL.revokeObjectURL(url);
  });

  // ----------------------------
  // 9) Paginación botones
  // ----------------------------
  $("prevPage").addEventListener("click", () => {
    if (currentPage > 1) { currentPage--; renderSalesTable(); }
  });

  $("nextPage").addEventListener("click", () => {
    const totalPages = Math.ceil(filteredVentas.length / PAGE_SIZE);
    if (currentPage < totalPages) { currentPage++; renderSalesTable(); }
  });

  // ----------------------------
  // 10) Modal de detalle (abrir/cerrar)
  // ----------------------------
  const modal = $("detailModal");

  function openModal(v) {
    activeSale = v;
    $("mId").textContent = v.id;
    $("mCliente").textContent = v.cliente;
    $("mProducto").textContent = v.producto;
    $("mCantidad").textContent = v.cantidad;
    $("mMetodoPago").textContent = v.metodoPago;
    $("mFecha").textContent = v.fecha;

    $("mSubtotal").textContent = formatMoney(v.subtotal);
    $("mIva").textContent = formatMoney(v.iva);
    $("mTotal").textContent = formatMoney(v.total);

    $("mEstado").textContent = v.estado;
    $("mVendedor").textContent = v.vendedor;
    $("mObs").textContent = v.observaciones;
    $("mComp").textContent = v.comprobante;

    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");
  }

  $("closeModal").addEventListener("click", () => closeModal());
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && modal.style.display === "flex") closeModal(); });

  function closeModal() {
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    activeSale = null;
  }

  // ----------------------------
  // 11) Navegación del sidebar (vistas)
  // ----------------------------
  const navButtons = Array.from(document.querySelectorAll(".nav-link[data-view]"));
  const views = {
    dashboard: $("view-dashboard"),
    clients: $("view-clients"),
    reports: $("view-reports"),
    settings: $("view-settings")
  };

  function setView(viewKey) {
    // active nav
    navButtons.forEach(btn => btn.classList.toggle("active", btn.dataset.view === viewKey));

    // show view
    Object.keys(views).forEach(k => views[k].classList.toggle("active", k === viewKey));

    // titles (simple mapping)
    const titleMap = {
      dashboard: ["Dashboard de Ventas", "Vista general de ingresos, estado de cobros y ventas recientes."],
      clients: ["Clientes", "Listado de clientes (simulado) para navegación y tablas."],
      reports: ["Reportes", "Módulo de reportes (mock) para ampliar con fuentes reales."],
      settings: ["Configuración", "Preferencias de visualización (demo)."]
    };
    const [t, s] = titleMap[viewKey] || titleMap.dashboard;
    $("pageTitle").textContent = t;
    $("pageSubtitle").textContent = s;
  }

  navButtons.forEach(btn => {
    btn.addEventListener("click", () => setView(btn.dataset.view));
  });

  // logout action
  document.querySelector(".nav-link[data-action='logout']")?.addEventListener("click", () => {
    localStorage.removeItem("logged");
    window.location.href = "login.html";
  });

  // ----------------------------
  // 12) Clientes (tabla simple)
  // ----------------------------
  function renderClients() {
    const tbody = $("clientsTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";
    clientes.forEach(c => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${c.nombre}</td>
        <td>${c.segmento}</td>
        <td>${c.ciudad}</td>
        <td>${c.ultima}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // ----------------------------
  // 13) Settings (demo: tema + moneda)
  // ----------------------------
  $("themeSelect")?.addEventListener("change", (e) => {
    const isDark = e.target.value === "dark";
    document.documentElement.style.setProperty("--bg", isDark ? "#0b1020" : "#f2f4f8");
    document.documentElement.style.setProperty("--panel", isDark ? "#111827" : "#ffffff");
    document.documentElement.style.setProperty("--panel-2", isDark ? "#0f172a" : "#f8fafc");
    document.documentElement.style.setProperty("--ink", isDark ? "#f3f4f6" : "#0f172a");
    document.documentElement.style.setProperty("--muted", isDark ? "#cbd5e1" : "#556070");
    document.documentElement.style.setProperty("--border", isDark ? "rgba(148, 163, 184, 0.2)" : "rgba(15, 23, 42, 0.08)");
  });

  $("currency")?.addEventListener("change", (e) => {
    currencySymbol = e.target.value || "$";
    renderSalesTable();
    updateStats();
    if (activeSale) openModal(activeSale);
  });

  // ----------------------------
  // 14) Inicialización final
  // ----------------------------
  renderSalesTable();
  renderClients();
  updateStats();
  setView("dashboard");
});
