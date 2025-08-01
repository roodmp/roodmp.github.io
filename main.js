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
        background: linear-gradient(135deg, #2563EB, #4F9FFF); 
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
    const colors = ['#2563EB', '#4F9FFF', '#7AB8FF', '#A6D0FF', '#D1E7FF'];
    
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


});