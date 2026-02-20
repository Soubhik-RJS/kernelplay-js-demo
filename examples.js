// examples.js - Enhanced functionality for the examples page

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuBtn && mobileMenu) {
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });
}

// Settings Dropdown
const settingsBtn = document.getElementById('settings-btn');
const settingsDropdown = document.getElementById('settings-dropdown');

if (settingsBtn && settingsDropdown) {
  settingsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    settingsDropdown.classList.toggle('hidden');
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', () => {
    if (!settingsDropdown.classList.contains('hidden')) {
      settingsDropdown.classList.add('hidden');
    }
  });
}

// Main Tab Switching (Demo / Code)
const mainTabs = document.querySelectorAll('.main-tab');
const demoContent = document.getElementById('demo-content');
const codeContent = document.getElementById('code-content');

mainTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const tabName = tab.dataset.tab;
    
    // Update active state
    mainTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    // Show/hide content
    if (tabName === 'demo') {
      demoContent.classList.remove('hidden');
      codeContent.classList.add('hidden');
    } else {
      demoContent.classList.add('hidden');
      codeContent.classList.remove('hidden');
      
      // Highlight code when switching to code tab
      highlightAllCode();
    }
  });
});

// Code File Tab Switching
const codeTabs = document.querySelectorAll('.code-tab');
const codeFiles = document.querySelectorAll('.code-file');

codeTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const fileName = tab.dataset.file;
    
    // Update active state
    codeTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    // Show/hide code files
    codeFiles.forEach(file => {
      if (file.dataset.file === fileName) {
        file.classList.remove('hidden');
        file.classList.add('active');
      } else {
        file.classList.add('hidden');
        file.classList.remove('active');
      }
    });
    
    // Highlight the visible code
    highlightAllCode();
  });
});

// Code Copy Functionality
function copyCodeFile(event, codeId) {
  const codeElement = document.getElementById(codeId);
  if (!codeElement) return;
  
  const code = codeElement.textContent;
  
  // Use Clipboard API if available
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(code).then(() => {
      showCopyFeedback(event.target);
    }).catch(err => {
      console.error('Failed to copy:', err);
      fallbackCopy(code);
    });
  } else {
    fallbackCopy(code);
  }
}

// Fallback copy method
function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  
  textarea.select();
  textarea.setSelectionRange(0, 99999);
  
  try {
    document.execCommand('copy');
    showCopyFeedback(event.target);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
  
  document.body.removeChild(textarea);
}

// Show copy feedback
function showCopyFeedback(button) {
  const originalText = button.textContent;
  button.textContent = 'Copied!';
  button.classList.add('text-green-400');
  
  setTimeout(() => {
    button.textContent = originalText;
    button.classList.remove('text-green-400');
  }, 2000);
}

// Highlight.js initialization
function highlightAllCode() {
  // Only highlight visible code blocks to save performance
  document.querySelectorAll('.code-file.active pre code').forEach((block) => {
    hljs.highlightElement(block);
  });
}

// Initial highlighting
document.addEventListener('DOMContentLoaded', () => {
  highlightAllCode();
});

// Console functionality
const consoleOutput = document.getElementById('console-output');
const clearConsoleBtn = document.getElementById('clear-console');

// Override console.log to capture output
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.log = function(...args) {
  originalConsoleLog.apply(console, args);
  addConsoleMessage('log', args.join(' '));
};

console.error = function(...args) {
  originalConsoleError.apply(console, args);
  addConsoleMessage('error', args.join(' '));
};

console.warn = function(...args) {
  originalConsoleWarn.apply(console, args);
  addConsoleMessage('warn', args.join(' '));
};

function addConsoleMessage(type, message) {
  if (!consoleOutput) return;
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'mb-1';
  
  const timestamp = new Date().toLocaleTimeString();
  const prefix = type === 'error' ? '✖' : type === 'warn' ? '⚠' : '›';
  const color = type === 'error' ? 'text-red-400' : type === 'warn' ? 'text-yellow-400' : 'text-green-400';
  
  messageDiv.innerHTML = `<span class="text-gray-500">[${timestamp}]</span> <span class="${color}">${prefix}</span> ${escapeHtml(message)}`;
  
  consoleOutput.appendChild(messageDiv);
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
  
  // Limit console messages to prevent memory issues
  const messages = consoleOutput.children;
  if (messages.length > 100) {
    consoleOutput.removeChild(messages[1]); // Keep the first "Console ready..." message
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Clear console
if (clearConsoleBtn) {
  clearConsoleBtn.addEventListener('click', () => {
    if (consoleOutput) {
      consoleOutput.innerHTML = '<div class="text-gray-500">&gt; Console cleared...</div>';
    }
  });
}

// Canvas container responsive handling
const container = document.getElementById('canvas-container');

function adjustCanvasContainer() {
  const canvas = container.querySelector('canvas');
  if (canvas) {
    canvas.style.display = 'block';
    canvas.style.maxWidth = '100%';
    canvas.style.height = 'auto';
    
    const containerRect = container.parentElement.getBoundingClientRect();
    const availableWidth = containerRect.width - 32;
    const availableHeight = containerRect.height - 32;
    
    const canvasWidth = 800;
    const canvasHeight = 600;
    
    const scaleX = availableWidth / canvasWidth;
    const scaleY = availableHeight / canvasHeight;
    const scale = Math.min(scaleX, scaleY, 1);
    
    if (scale < 1) {
      canvas.style.width = `${canvasWidth * scale}px`;
      canvas.style.height = `${canvasHeight * scale}px`;
    } else {
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;
    }
    
    container.style.width = canvas.style.width;
    container.style.height = canvas.style.height;
  }
}

// Observe canvas addition
const observer = new MutationObserver((mutations) => {
  for (let mutation of mutations) {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      adjustCanvasContainer();
    }
  }
});

if (container) {
  observer.observe(container, { 
    childList: true, 
    subtree: true,
    attributes: true 
  });
}

// Check periodically for canvas
let checkCount = 0;
const checkInterval = setInterval(() => {
  if (container && container.querySelector('canvas')) {
    adjustCanvasContainer();
    clearInterval(checkInterval);
  }
  checkCount++;
  if (checkCount > 50) clearInterval(checkInterval);
}, 100);

// Adjust on window resize (throttled for performance)
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(adjustCanvasContainer, 150);
});

// Performance monitoring (optional)
let frameCount = 0;
let lastTime = performance.now();
let fps = 0;

function updatePerformanceStats() {
  frameCount++;
  const currentTime = performance.now();
  const delta = currentTime - lastTime;
  
  if (delta >= 1000) {
    fps = Math.round((frameCount * 1000) / delta);
    frameCount = 0;
    lastTime = currentTime;
    
    // Log FPS occasionally (every 5 seconds)
    if (Math.random() < 0.2) {
      console.log(`FPS: ${fps}`);
    }
  }
  
  // Use requestAnimationFrame sparingly to reduce CPU usage
  if (document.getElementById('demo-content').classList.contains('hidden') === false) {
    requestAnimationFrame(updatePerformanceStats);
  }
}

// Start performance monitoring when demo is visible
if (demoContent && !demoContent.classList.contains('hidden')) {
  requestAnimationFrame(updatePerformanceStats);
}

// Log initial message
console.log('KernelPlay.js Examples loaded');
console.log('Use arrow keys to move the player');