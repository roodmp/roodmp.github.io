document.addEventListener("DOMContentLoaded", (event) => {
  // Initialize Feather icons
  feather.replace();

  // Highlight current page in navigation
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    if (link.getAttribute("href") === location.pathname.split("/").pop()) {
      link.classList.add("underline", "decoration-wavy", "underline-offset-2");
    }
  });

  const darkModeToggle = document.getElementById("darkModeToggle");
  const themeDropdown = document.getElementById("themeDropdown");
  const themeIcon = document.getElementById("themeIcon");
  const html = document.documentElement;

  function setTheme(theme) {
    if (theme === "dark") {
      html.classList.add("dark");
      updateThemeIcon("dark");
    } else if (theme === "light") {
      html.classList.remove("dark");
      updateThemeIcon("light");
    } else if (theme === "system") {
      if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        html.classList.add("dark");
      } else {
        html.classList.remove("dark");
      }
      updateThemeIcon("system");
    }
    localStorage.setItem("theme", theme);
  }

  function updateThemeIcon(theme) {
    const iconPaths = {
      light:
        "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z",
      dark: "M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z",
      system:
        "M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25",
    };
    themeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" d="${iconPaths[theme]}" />`;
  }

  // Function to apply system theme without changing the icon
  function applySystemTheme() {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }

  // Check for saved theme preference or default to 'system'
  const savedTheme = localStorage.getItem("theme") || "system";
  setTheme(savedTheme);

  darkModeToggle.addEventListener("click", () => {
    themeDropdown.classList.toggle("hidden");
  });

  themeDropdown.addEventListener("click", (e) => {
    if (e.target.tagName === "A" || e.target.parentElement.tagName === "A") {
      const selectedTheme = e.target.closest("a").getAttribute("data-theme");
      setTheme(selectedTheme);
      themeDropdown.classList.add("hidden");
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (
      !darkModeToggle.contains(e.target) &&
      !themeDropdown.contains(e.target)
    ) {
      themeDropdown.classList.add("hidden");
    }
  });

  // Listen for system theme changes
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addListener((e) => {
      if (localStorage.getItem("theme") === "system") {
        applySystemTheme();
      }
    });
  }

  // Initial setup
  if (savedTheme === "system") {
    applySystemTheme();
    updateThemeIcon("system");
  } else {
    setTheme(savedTheme);
  }
});
