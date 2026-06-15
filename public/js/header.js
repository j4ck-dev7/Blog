const mode = document.getElementById("icon-dark-light");
const body = document.body;

// Carregar preferência salva ou usar preferência do sistema
function loadThemePreference() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    body.classList.add('light');
    mode.classList.remove('fa-sun');
    mode.classList.add('fa-moon');
  } else if (savedTheme === 'dark') {
    body.classList.remove('light');
    mode.classList.remove('fa-moon');
    mode.classList.add('fa-sun');
  } else {
    // Verificar preferência do sistema
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    if (prefersLight) {
      body.classList.add('light');
      mode.classList.remove('fa-sun');
      mode.classList.add('fa-moon');
    } else {
      body.classList.remove('light');
      mode.classList.remove('fa-moon');
      mode.classList.add('fa-sun');
    }
  }
}

// Salvar preferência
function saveThemePreference(theme) {
  localStorage.setItem('theme', theme);
}

// Alternar entre modos
mode.addEventListener("click", () => {
  if (body.classList.contains("light")) {
    body.classList.remove("light");
    mode.classList.remove("fa-moon");
    mode.classList.add("fa-sun");
    saveThemePreference('dark');
  } else {
    body.classList.add("light");
    mode.classList.remove("fa-sun");
    mode.classList.add("fa-moon");
    saveThemePreference('light');
  }
});

// Carregar tema ao iniciar
loadThemePreference();
