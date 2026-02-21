// ─── SCRIPT.JS — Shared across all doc pages ─────────────────────────────────

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuBtn && mobileMenu) {
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });
}

function copyCode(id) {
  const el = document.getElementById(id);
  if (!el) return;
  navigator.clipboard.writeText(el.innerText).then(() => {
    document.querySelectorAll(`[onclick="copyCode('${id}')"]`).forEach(btn => {
      const orig = btn.innerHTML;
      btn.innerHTML = `<svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg> Copied!`;
      btn.style.color = "#86efac";
      setTimeout(() => { btn.innerHTML = orig; btn.style.color = ""; }, 2000);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (typeof hljs !== "undefined") {
    document.querySelectorAll("pre code").forEach(b => hljs.highlightElement(b));
  }
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".doc-nav a").forEach(link => {
    if ((link.getAttribute("href") || "") === currentPage) link.classList.add("active");
  });
});
