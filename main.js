document.addEventListener("DOMContentLoaded", (event) => {
  // Initialize Feather icons
  feather.replace();

  // Dark mode toggle functionality
  const darkModeToggle = document.getElementById("darkModeToggle");
  const html = document.documentElement;

  // Function to set the dark mode
  function setDarkMode(isDark) {
    if (isDark) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
    localStorage.setItem("darkMode", isDark);
  }

  // Check for saved dark mode preference
  const savedDarkMode = localStorage.getItem("darkMode");
  if (savedDarkMode !== null) {
    setDarkMode(savedDarkMode === "true");
  }

  // Toggle dark mode on button click
  darkModeToggle.addEventListener("click", () => {
    const isDark = !html.classList.contains("dark");
    setDarkMode(isDark);
  });

  // Highlight current page in navigation
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    if (link.getAttribute("href") === location.pathname.split("/").pop()) {
      link.classList.add("underline", "decoration-wavy", "underline-offset-2");
    }
  });
});

// Function to fetch weather data
async function fetchWeather() {
  const city = "Denver";
  const url = `https://wttr.in/${city}?format=j1`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const temp = data.current_condition[0].temp_F;
    const description = data.current_condition[0].weatherDesc[0].value;

    document.getElementById("temperature").textContent = `${temp}°F`;
    document.getElementById("weatherDescription").textContent = description;
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
}

// Fetch weather data on page load
fetchWeather();

// Optionally, update weather data every 30 minutes
setInterval(fetchWeather, 30 * 60 * 1000);
