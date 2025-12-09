if (!localStorage.getItem("logged")) {
  window.location.href = "login.html";
}
// --------------------
// 1. Estadísticas falsas (simulación)
// --------------------
document.getElementById("statUsers").textContent = 128;
document.getElementById("statSales").textContent = 342;
document.getElementById("statAlerts").textContent = 5;

// --------------------
// 2. Gráfico de actividad (Chart.js)
// --------------------
const ctx = document.getElementById("activityChart").getContext("2d");

new Chart(ctx, {
  type: "line",
  data: {
    labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
    datasets: [
      {
        label: "Actividad",
        data: [10, 25, 18, 40, 32, 50],
        borderWidth: 2,
        tension: 0.3,
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
  },
});

// --------------------
// 3. Datos de ejemplo para la tabla
// --------------------
function randomStatus() {
  return Math.random() > 0.2 ? "activo" : "inactivo";
}

function randomRole() {
  return Math.random() > 0.7 ? "admin" : "user";
}

const users = Array.from({ length: 20 }, (_, i) => ({
  name: `Usuario ${i + 1}`,
  role: randomRole(),
  status: randomStatus(),
}));


// --------------------
// 4. Renderizar tabla
// --------------------
function renderTable(data) {
  const tbody = document.getElementById("userTableBody");
  tbody.innerHTML = "";

  data.forEach((u) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${u.name}</td>
      <td>${u.role}</td>
      <td>${u.status}</td>
    `;

    tbody.appendChild(tr);
  });
}

renderTable(users);

// --------------------
// 5. Buscador
// --------------------
document.getElementById("searchInput").addEventListener("input", (e) => {
  const text = e.target.value.toLowerCase();
  filterTable(text, document.getElementById("roleFilter").value);
});

// --------------------
// 6. Filtro por rol
// --------------------
document.getElementById("roleFilter").addEventListener("change", (e) => {
  const role = e.target.value;
  filterTable(document.getElementById("searchInput").value.toLowerCase(), role);
});

// --------------------
// 7. Función combinada para filtros
// --------------------
function filterTable(search, role) {
  let filtered = users;

  if (search) {
    filtered = filtered.filter((u) =>
      u.name.toLowerCase().includes(search)
    );
  }

  if (role) {
    filtered = filtered.filter((u) => u.role === role);
  }

  renderTable(filtered);
}
document.getElementById("exportBtn").addEventListener("click", () => {
  const rows = [["Nombre", "Rol", "Estado"]];

  users.forEach(u => {
    rows.push([u.name, u.role, u.status]);
  });

  const csvContent = rows.map(r => r.join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "usuarios.csv";
  link.click();
});
<a onclick="logout()">Cerrar sesión</a>
function logout() {
  localStorage.removeItem("logged");
  window.location.href = "login.html";
}

