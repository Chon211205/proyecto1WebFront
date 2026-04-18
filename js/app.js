const API_URL = "http://localhost:8080";
const themeToggle = document.querySelector("#themeToggle");

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function setStatus(element, text, className = "") {
  if (!element) return;
  element.textContent = text;
  element.className = `status ${className}`.trim();
}

function getPlaceholderImage() {
  return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='400' viewBox='0 0 640 400'%3E%3Crect width='640' height='400' fill='%23dfe8eb'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' font-family='Arial' font-size='28' fill='%2352616b'%3ESin imagen%3C/text%3E%3C/svg%3E";
}

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.body.classList.add("dark");
}

themeToggle?.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");

  themeToggle.textContent = isDark ? "☀️" : "🌙";
});

if (document.body.classList.contains("dark")) {
  themeToggle.textContent = "☀️";
}