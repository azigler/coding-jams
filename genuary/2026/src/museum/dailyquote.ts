/**
 * Daily Quote
 *
 * Shows an inspirational quote about art, creativity, or technology
 * that changes each day.
 */

// ============================================================================
// Types
// ============================================================================

export interface Quote {
  text: string;
  author: string;
  category: 'art' | 'creativity' | 'technology' | 'life';
}

export interface DailyQuoteSystem {
  container: HTMLElement;
  quote: Quote;
  indicator: HTMLElement | null;
  popup: HTMLElement | null;
  isPopupOpen: boolean;
  cleanup: () => void;
}

// ============================================================================
// Quotes Database
// ============================================================================

const QUOTES: Quote[] = [
  { text: "Art is not what you see, but what you make others see.", author: "Edgar Degas", category: 'art' },
  { text: "Creativity takes courage.", author: "Henri Matisse", category: 'creativity' },
  { text: "The purpose of art is washing the dust of daily life off our souls.", author: "Pablo Picasso", category: 'art' },
  { text: "Every artist was first an amateur.", author: "Ralph Waldo Emerson", category: 'creativity' },
  { text: "Art enables us to find ourselves and lose ourselves at the same time.", author: "Thomas Merton", category: 'art' },
  { text: "The chief enemy of creativity is good sense.", author: "Pablo Picasso", category: 'creativity' },
  { text: "To create one's own world takes courage.", author: "Georgia O'Keeffe", category: 'creativity' },
  { text: "Art is the lie that enables us to realize the truth.", author: "Pablo Picasso", category: 'art' },
  { text: "The computer is a bicycle for the mind.", author: "Steve Jobs", category: 'technology' },
  { text: "Technology is nothing. What's important is faith in people.", author: "Steve Jobs", category: 'technology' },
  { text: "The best way to predict the future is to create it.", author: "Abraham Lincoln", category: 'creativity' },
  { text: "Logic will get you from A to B. Imagination will take you everywhere.", author: "Albert Einstein", category: 'creativity' },
  { text: "Art is the most intense mode of individualism the world has known.", author: "Oscar Wilde", category: 'art' },
  { text: "Have no fear of perfection - you'll never reach it.", author: "Salvador Dalí", category: 'creativity' },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: 'life' },
  { text: "Art is not a mirror held up to reality but a hammer with which to shape it.", author: "Bertolt Brecht", category: 'art' },
  { text: "Creativity is intelligence having fun.", author: "Albert Einstein", category: 'creativity' },
  { text: "Art speaks where words are unable to explain.", author: "Mathiole", category: 'art' },
  { text: "Every child is an artist. The problem is staying an artist when you grow up.", author: "Pablo Picasso", category: 'creativity' },
  { text: "The desire to create is one of the deepest yearnings of the human soul.", author: "Dieter F. Uchtdorf", category: 'creativity' },
  { text: "In art, the hand can never execute anything higher than the heart can imagine.", author: "Ralph Waldo Emerson", category: 'art' },
  { text: "Life beats down and crushes the soul and art reminds you that you have one.", author: "Stella Adler", category: 'art' },
  { text: "Great things are done by a series of small things brought together.", author: "Vincent Van Gogh", category: 'life' },
  { text: "Code is poetry.", author: "WordPress", category: 'technology' },
  { text: "Art is the elimination of the unnecessary.", author: "Pablo Picasso", category: 'art' },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci", category: 'art' },
  { text: "The artist is nothing without the gift, but the gift is nothing without work.", author: "Émile Zola", category: 'creativity' },
  { text: "Art washes away from the soul the dust of everyday life.", author: "Pablo Picasso", category: 'art' },
  { text: "I dream my painting and I paint my dream.", author: "Vincent Van Gogh", category: 'creativity' },
  { text: "Art is the only way to run away without leaving home.", author: "Twyla Tharp", category: 'art' },
  { text: "The true work of art is but a shadow of divine perfection.", author: "Michelangelo", category: 'art' },
];

// ============================================================================
// Daily Quote System Creation
// ============================================================================

/**
 * Create the daily quote system
 */
export function createDailyQuoteSystem(container: HTMLElement): DailyQuoteSystem {
  // Get quote based on day of year
  const dayOfYear = getDayOfYear();
  const quote = QUOTES[dayOfYear % QUOTES.length];

  const system: DailyQuoteSystem = {
    container,
    quote,
    indicator: null,
    popup: null,
    isPopupOpen: false,
    cleanup: () => {
      if (system.indicator) {
        system.indicator.remove();
        system.indicator = null;
      }
      if (system.popup) {
        system.popup.remove();
        system.popup = null;
      }
    },
  };

  // Create indicator
  createQuoteIndicator(system);

  // Show full quote popup on first visit of the day
  if (isFirstVisitToday()) {
    setTimeout(() => showQuotePopup(system), 4000);
  }

  return system;
}

/**
 * Get day of year (1-366)
 */
function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/**
 * Check if first visit today
 */
function isFirstVisitToday(): boolean {
  const today = new Date().toDateString();
  const lastVisit = localStorage.getItem('genuary-museum-quote-date');
  if (lastVisit !== today) {
    localStorage.setItem('genuary-museum-quote-date', today);
    return true;
  }
  return false;
}

/**
 * Create the quote indicator
 */
function createQuoteIndicator(system: DailyQuoteSystem): void {
  const indicator = document.createElement('div');
  indicator.id = 'quote-indicator';
  indicator.style.cssText = `
    position: fixed;
    bottom: 60px;
    right: 20px;
    background: rgba(20, 20, 30, 0.8);
    border: 1px solid rgba(200, 180, 255, 0.2);
    border-radius: 20px;
    padding: 6px 12px;
    font-family: system-ui, sans-serif;
    font-size: 10px;
    color: #c8b4ff;
    z-index: 400;
    cursor: pointer;
    transition: all 0.3s;
    max-width: 180px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `;
  indicator.innerHTML = `💭 "${system.quote.text.slice(0, 25)}..."`;
  indicator.title = 'Click for today\'s quote';

  indicator.onclick = () => {
    if (system.isPopupOpen) {
      closeQuotePopup(system);
    } else {
      showQuotePopup(system);
    }
  };

  indicator.onmouseover = () => {
    indicator.style.borderColor = 'rgba(200, 180, 255, 0.5)';
  };
  indicator.onmouseout = () => {
    indicator.style.borderColor = 'rgba(200, 180, 255, 0.2)';
  };

  system.container.appendChild(indicator);
  system.indicator = indicator;
}

/**
 * Show the full quote popup
 */
export function showQuotePopup(system: DailyQuoteSystem): void {
  if (system.popup) return;

  system.isPopupOpen = true;

  const popup = document.createElement('div');
  popup.id = 'quote-popup';
  popup.style.cssText = `
    position: fixed;
    bottom: 100px;
    right: 20px;
    width: 300px;
    background: rgba(20, 20, 35, 0.98);
    border: 1px solid rgba(200, 180, 255, 0.3);
    border-radius: 12px;
    padding: 20px;
    font-family: system-ui, sans-serif;
    color: #e0e0e0;
    z-index: 600;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.3s;
  `;

  const categoryColors: Record<string, string> = {
    art: '#ff8c8c',
    creativity: '#8cffb8',
    technology: '#8cb8ff',
    life: '#ffdd8c',
  };

  popup.innerHTML = `
    <div style="
      position: absolute;
      top: 10px;
      right: 12px;
      font-size: 9px;
      text-transform: uppercase;
      color: ${categoryColors[system.quote.category]};
      letter-spacing: 1px;
    ">${system.quote.category}</div>
    <div style="
      font-size: 16px;
      line-height: 1.6;
      color: white;
      font-style: italic;
      margin-bottom: 15px;
    ">"${system.quote.text}"</div>
    <div style="
      font-size: 12px;
      color: #c8b4ff;
      text-align: right;
    ">— ${system.quote.author}</div>
    <div style="
      margin-top: 15px;
      padding-top: 12px;
      border-top: 1px solid rgba(200, 180, 255, 0.1);
      font-size: 10px;
      color: #666;
      text-align: center;
    ">Daily Quote · ${new Date().toLocaleDateString()}</div>
  `;

  system.container.appendChild(popup);
  system.popup = popup;

  requestAnimationFrame(() => {
    popup.style.opacity = '1';
    popup.style.transform = 'translateY(0)';
  });

  // Click outside to close
  const clickHandler = (e: MouseEvent) => {
    if (!popup.contains(e.target as Node) && e.target !== system.indicator) {
      closeQuotePopup(system);
      document.removeEventListener('click', clickHandler);
    }
  };
  setTimeout(() => {
    document.addEventListener('click', clickHandler);
  }, 100);

  // Auto-close after 15 seconds
  setTimeout(() => {
    if (system.popup === popup) {
      closeQuotePopup(system);
    }
  }, 15000);
}

/**
 * Close the quote popup
 */
export function closeQuotePopup(system: DailyQuoteSystem): void {
  if (!system.popup) return;

  system.popup.style.opacity = '0';
  system.popup.style.transform = 'translateY(10px)';
  const popup = system.popup;

  setTimeout(() => {
    popup.remove();
    if (system.popup === popup) {
      system.popup = null;
    }
  }, 300);

  system.isPopupOpen = false;
}

/**
 * Get today's quote
 */
export function getTodaysQuote(system: DailyQuoteSystem): Quote {
  return system.quote;
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeDailyQuoteSystem(system: DailyQuoteSystem): void {
  system.cleanup();
}
