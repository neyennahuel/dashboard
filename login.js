// login.js
document.addEventListener("DOMContentLoaded", () => {
  // Si ya está logueado, enviarlo directo al panel
  if (localStorage.getItem("logged") === "true") {
    window.location.href = "index.html";
    return;
  }

  const userEl = document.getElementById("loginUser");
  const passEl = document.getElementById("loginPass");
  const btn = document.getElementById("loginBtn");
  const msg = document.getElementById("loginMsg");

  function tryLogin() {
    const user = userEl.value.trim();
    const pass = passEl.value.trim();

    // Credenciales válidas
    if (user === "admin" && pass === "1234") {
      localStorage.setItem("logged", "true");
      window.location.href = "index.html";
      return;
    }

    // Error de login
    msg.textContent = "Credenciales incorrectas.";
    msg.style.display = "block";
  }

  btn.addEventListener("click", tryLogin);

  [userEl, passEl].forEach(el => el.addEventListener("keydown", (e) => {
    if (e.key === "Enter") tryLogin();
  }));
});
