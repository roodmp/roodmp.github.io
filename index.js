import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

document.addEventListener('DOMContentLoaded', (event) => {
  // Initialize Feather icons
  feather.replace();

  // Dark mode toggle functionality
  const darkModeToggle = document.getElementById('darkModeToggle');
  const html = document.documentElement;

  // Function to set the dark mode
  function setDarkMode(isDark) {
      if (isDark) {
          html.classList.add('dark');
      } else {
          html.classList.remove('dark');
      }
      localStorage.setItem('darkMode', isDark);
  }

  // Check for saved dark mode preference
  const savedDarkMode = localStorage.getItem('darkMode');
  if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === 'true');
  }

  // Toggle dark mode on button click
  darkModeToggle.addEventListener('click', () => {
      const isDark = !html.classList.contains('dark');
      setDarkMode(isDark);
  });

  // Highlight current page in navigation
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
      if (link.getAttribute('href') === location.pathname.split('/').pop()) {
          link.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-900', 'dark:text-white');
      }
  });
});
