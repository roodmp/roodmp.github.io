/**
 * main.js — Shared site JavaScript.
 * Handles: Feather icon init, current-page nav highlighting,
 * and mobile menu open/close.
 */

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
    if (link.getAttribute("href") === location.pathname.split("/").pop() && !link.classList.contains("active")) {
      link.classList.add("underline", "decoration-wavy", "underline-offset-2");
    }
  });

  // Mobile menu functionality
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileMenuClose = document.querySelector('.mobile-menu-close');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.add('open');
      document.body.style.overflow = 'hidden';
    });

    if (mobileMenuClose) {
      mobileMenuClose.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    }

    // Close on nav link click
    mobileMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }
});