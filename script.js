document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const passwordInput = document.getElementById("password");
  const togglePassword = document.getElementById("toggle-password");
  const errorMessage = document.getElementById("error-message");
  const loadingIndicator = document.getElementById("loading-spinner");

  function updatePasswordIcon() {
    if (passwordInput.type === "password") {
      togglePassword.src = "Images/eye-slash.svg";
    } else {
      togglePassword.src = "Images/eye.svg";
    }
  }

  updatePasswordIcon();

  togglePassword.addEventListener("click", () => {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
    } else {
      passwordInput.type = "password";
    }
    updatePasswordIcon();
  });

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorMessage.textContent = "";
    loadingIndicator.style.display = 'block';

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      const result = await response.json();

      if (response.ok) {
        window.location.href = result.redirect;
      } else {
        errorMessage.textContent = result.error || "Error al iniciar sesión. Por favor, intente de nuevo.";
      }
    } catch (error) {
      errorMessage.textContent = "Error en la conexión. Por favor, intente de nuevo.";
    } finally {
      loadingIndicator.style.display = 'none';
    }
  });
});
