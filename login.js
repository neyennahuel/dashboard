document.getElementById("loginBtn").addEventListener("click", () => {
  const user = document.getElementById("loginUser").value;
  const pass = document.getElementById("loginPass").value;

  if (user === "admin" && pass === "1234") {
    localStorage.setItem("logged", "true");
    window.location.href = "index.html";
  } else {
    alert("Credenciales incorrectas");
  }
});
