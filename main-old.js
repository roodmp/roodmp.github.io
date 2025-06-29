// Easter egg game trigger
let keySequence = [];
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
const pandaCode = ['KeyP', 'KeyA', 'KeyN', 'KeyD', 'KeyA'];

document.addEventListener('keydown', (e) => {
    keySequence.push(e.code);
    
    // Keep only the last 10 keys for Konami code
    if (keySequence.length > 10) {
        keySequence.shift();
    }
    
    // Check for Konami code or PANDA code
    if (arraysEqual(keySequence.slice(-10), konamiCode) || 
        arraysEqual(keySequence.slice(-5), pandaCode)) {
        triggerEasterEgg();
        keySequence = []; // Reset sequence
    }
});

function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

function triggerEasterEgg() {
    // Create celebration effect
    createConfetti();
    
    // Show easter egg notification
    const notification = document.createElement('div');
    
    // Create modal container
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
        background: linear-gradient(135deg, #FF6B35, #F7931E); 
        color: white; padding: 30px; border-radius: 20px; 
        text-align: center; z-index: 10000; box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        animation: bounceIn 0.6s ease-out;
    `;
    
    // Create title
    const title = document.createElement('h2');
    title.textContent = '🐾 Easter Egg Found!';
    title.style.cssText = 'margin: 0 0 15px 0; font-size: 24px;';
    
    // Create description
    const description = document.createElement('p');
    description.textContent = 'You discovered the Red Panda Flight game!';
    description.style.cssText = 'margin: 0 0 20px 0; font-size: 16px;';
    
    // Create play button
    const playButton = document.createElement('button');
    playButton.textContent = 'Play Game! 🎮';
    playButton.style.cssText = `
        background: #fff; color: #FF6B35; border: none; padding: 12px 24px; 
        border-radius: 25px; font-size: 16px; font-weight: bold; cursor: pointer;
        transition: all 0.3s ease; margin-right: 10px;
    `;
    playButton.addEventListener('click', () => {
        window.open('red-panda-flappy.html', '_blank');
        notification.remove();
    });
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Maybe Later';
    closeButton.style.cssText = `
        background: transparent; color: white; border: 2px solid white; 
        padding: 10px 20px; border-radius: 25px; font-size: 14px; cursor: pointer;
        transition: all 0.3s ease;
    `;
    closeButton.addEventListener('click', () => notification.remove());
    
    // Assemble modal
    modal.appendChild(title);
    modal.appendChild(description);
    modal.appendChild(playButton);
    modal.appendChild(closeButton);
    notification.appendChild(modal);
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes bounceIn {
            0% { transform: translate(-50%, -50%) scale(0.3); opacity: 0; }
            50% { transform: translate(-50%, -50%) scale(1.1); }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
    `;
    notification.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Auto-remove after 10 seconds if no action
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 10000);
}

function createConfetti() {
    const colors = ['#FF6B35', '#F7931E', '#FFD23F', '#06FFA5', '#A663CC'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            top: -10px;
            left: ${Math.random() * 100}%;
            z-index: 9999;
            pointer-events: none;
            animation: confettiFall ${2 + Math.random() * 3}s linear forwards;
        `;
        
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 5000);
    }
}

// Add confetti animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes confettiFall {
        to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

document.addEventListener("DOMContentLoaded", (event) => {
  // Initialize Feather icons with error handling
  try {
    if (typeof feather !== 'undefined') {
      feather.replace();
    }
  } catch (error) {
    console.warn('Feather icons failed to load:', error);
  }

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

  // Check if required elements exist
  if (!darkModeToggle || !themeDropdown || !themeIcon) {
    console.warn('Theme toggle elements not found');
    return;
  }

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
    
    if (!themeIcon) return;
    
    // Check if we already have the correct path
    const existingPath = themeIcon.querySelector('path');
    if (existingPath && existingPath.getAttribute('d') === iconPaths[theme]) {
      return; // Already correct, don't change anything
    }
    
    // Only update if needed
    themeIcon.innerHTML = '';
    
    // Create new path element
    const path = document.createElement('path');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('d', iconPaths[theme]);
    
    // Ensure SVG has proper attributes
    themeIcon.setAttribute('fill', 'none');
    themeIcon.setAttribute('stroke', 'currentColor');
    
    // Preserve existing classes and add our color classes
    if (!themeIcon.classList.contains('w-5')) {
      themeIcon.classList.add('w-5', 'h-5');
    }
    if (!themeIcon.classList.contains('text-gray-700')) {
      themeIcon.classList.add('text-gray-700', 'dark:text-gray-200');
    }
    
    themeIcon.appendChild(path);
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

  darkModeToggle.addEventListener("click", (e) => {
    e.preventDefault();
    const isExpanded = themeDropdown.classList.contains("hidden");
    themeDropdown.classList.toggle("hidden");
    darkModeToggle.setAttribute("aria-expanded", isExpanded ? "true" : "false");
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
      darkModeToggle.setAttribute("aria-expanded", "false");
    }
  });

  // Handle escape key to close dropdown
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !themeDropdown.classList.contains("hidden")) {
      themeDropdown.classList.add("hidden");
      darkModeToggle.setAttribute("aria-expanded", "false");
      darkModeToggle.focus();
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
