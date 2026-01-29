/**
 * Visitor Insights
 *
 * Analytics dashboard showing visit patterns
 * and personalized recommendations.
 */

// ============================================================================
// Types
// ============================================================================

export interface VisitInsight {
  type: 'peak_hours' | 'favorite_wing' | 'viewing_style' | 'recommendation';
  title: string;
  description: string;
  icon: string;
  data?: Record<string, unknown>;
}

export interface InsightsSystem {
  container: HTMLElement;
  panel: HTMLElement | null;
  isOpen: boolean;
  cleanup: () => void;
}

export interface InsightsData {
  viewsByDay: Map<number, number>;
  viewsByHour: Map<number, number>;
  timeSpentByDay: Map<number, number>;
  favorites: number[];
  totalVisits: number;
  totalTime: number;
}

// ============================================================================
// Insights System Creation
// ============================================================================

/**
 * Create the insights system
 */
export function createInsightsSystem(container: HTMLElement): InsightsSystem {
  const system: InsightsSystem = {
    container,
    panel: null,
    isOpen: false,
    cleanup: () => {
      closeInsights(system);
    },
  };

  return system;
}

/**
 * Generate insights from visitor data
 */
export function generateInsights(data: InsightsData): VisitInsight[] {
  const insights: VisitInsight[] = [];

  // Peak viewing hours
  const hourCounts = Array.from(data.viewsByHour.entries())
    .sort((a, b) => b[1] - a[1]);
  if (hourCounts.length > 0) {
    const peakHour = hourCounts[0][0];
    const hourLabel = peakHour === 0 ? '12 AM' :
                      peakHour < 12 ? `${peakHour} AM` :
                      peakHour === 12 ? '12 PM' :
                      `${peakHour - 12} PM`;
    insights.push({
      type: 'peak_hours',
      title: 'Your Peak Hours',
      description: `You're most active around ${hourLabel}`,
      icon: '⏰',
    });
  }

  // Viewing style based on time spent
  const avgTimePerExhibit = data.totalTime / Math.max(1, data.viewsByDay.size);
  let viewingStyle: VisitInsight;
  if (avgTimePerExhibit > 120) {
    viewingStyle = {
      type: 'viewing_style',
      title: 'Deep Contemplator',
      description: 'You spend quality time with each piece',
      icon: '🧘',
    };
  } else if (avgTimePerExhibit > 60) {
    viewingStyle = {
      type: 'viewing_style',
      title: 'Thoughtful Observer',
      description: 'You balance exploration with appreciation',
      icon: '🎨',
    };
  } else if (avgTimePerExhibit > 30) {
    viewingStyle = {
      type: 'viewing_style',
      title: 'Curious Explorer',
      description: 'You love discovering new exhibits',
      icon: '🔍',
    };
  } else {
    viewingStyle = {
      type: 'viewing_style',
      title: 'Speed Runner',
      description: 'You like to see everything quickly',
      icon: '🏃',
    };
  }
  insights.push(viewingStyle);

  // Favorite wing based on viewed days
  const wingCounts = {
    main: 0,    // Days 1-10
    east: 0,    // Days 11-20
    west: 0,    // Days 21-31
  };
  data.viewsByDay.forEach((_, day) => {
    if (day <= 10) wingCounts.main++;
    else if (day <= 20) wingCounts.east++;
    else wingCounts.west++;
  });
  const favoriteWing = Object.entries(wingCounts)
    .sort((a, b) => b[1] - a[1])[0];
  if (favoriteWing[1] > 0) {
    const wingNames: Record<string, string> = {
      main: 'Main Gallery',
      east: 'East Wing',
      west: 'West Wing',
    };
    insights.push({
      type: 'favorite_wing',
      title: 'Favorite Area',
      description: `You spend most time in ${wingNames[favoriteWing[0]]}`,
      icon: '🏛️',
    });
  }

  // Personalized recommendation
  const unvisited = [];
  for (let i = 1; i <= 31; i++) {
    if (!data.viewsByDay.has(i)) {
      unvisited.push(i);
    }
  }
  if (unvisited.length > 0) {
    const recommended = unvisited[Math.floor(Math.random() * unvisited.length)];
    insights.push({
      type: 'recommendation',
      title: 'Try This Next',
      description: `Day ${recommended} awaits your discovery`,
      icon: '💡',
      data: { dayNumber: recommended },
    });
  } else if (data.favorites.length > 0) {
    const revisit = data.favorites[Math.floor(Math.random() * data.favorites.length)];
    insights.push({
      type: 'recommendation',
      title: 'Revisit a Favorite',
      description: `Revisit Day ${revisit} — one of your favorites`,
      icon: '❤️',
      data: { dayNumber: revisit },
    });
  }

  return insights;
}

/**
 * Show insights panel
 */
export function showInsights(system: InsightsSystem, data: InsightsData): void {
  closeInsights(system);

  system.isOpen = true;

  const insights = generateInsights(data);

  const panel = document.createElement('div');
  panel.id = 'insights-panel';
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 380px;
    background: rgba(15, 15, 25, 0.98);
    border: 1px solid rgba(100, 200, 255, 0.3);
    border-radius: 16px;
    font-family: system-ui, sans-serif;
    color: #e0e0e0;
    z-index: 800;
    opacity: 0;
    transition: opacity 0.3s;
    overflow: hidden;
  `;

  const completionPercent = Math.round((data.viewsByDay.size / 31) * 100);

  panel.innerHTML = `
    <div style="
      padding: 15px 20px;
      border-bottom: 1px solid rgba(100, 200, 255, 0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
    ">
      <div>
        <div style="font-size: 16px; font-weight: bold; color: white;">
          📊 Your Insights
        </div>
        <div style="font-size: 11px; color: #888; margin-top: 4px;">
          Based on ${data.totalVisits} visits
        </div>
      </div>
      <button id="insights-close" style="
        background: none;
        border: none;
        color: #888;
        font-size: 20px;
        cursor: pointer;
      ">×</button>
    </div>

    <!-- Summary stats -->
    <div style="
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      padding: 15px;
      background: rgba(100, 200, 255, 0.05);
    ">
      <div style="text-align: center;">
        <div style="font-size: 24px; font-weight: bold; color: #64c8ff;">
          ${data.viewsByDay.size}
        </div>
        <div style="font-size: 10px; color: #888;">Exhibits</div>
      </div>
      <div style="text-align: center;">
        <div style="font-size: 24px; font-weight: bold; color: #64c8ff;">
          ${Math.round(data.totalTime / 60)}m
        </div>
        <div style="font-size: 10px; color: #888;">Total Time</div>
      </div>
      <div style="text-align: center;">
        <div style="font-size: 24px; font-weight: bold; color: #64c8ff;">
          ${completionPercent}%
        </div>
        <div style="font-size: 10px; color: #888;">Complete</div>
      </div>
    </div>

    <!-- Insights -->
    <div style="padding: 15px;">
      ${insights.map(insight => `
        <div class="insight-card" data-type="${insight.type}" ${insight.data?.dayNumber ? `data-day="${insight.data.dayNumber}"` : ''} style="
          display: flex;
          gap: 12px;
          padding: 12px;
          background: rgba(100, 200, 255, 0.08);
          border-radius: 8px;
          margin-bottom: 10px;
          ${insight.type === 'recommendation' ? 'cursor: pointer;' : ''}
          transition: all 0.2s;
        ">
          <div style="font-size: 24px;">${insight.icon}</div>
          <div>
            <div style="font-size: 13px; font-weight: bold; color: white;">
              ${insight.title}
            </div>
            <div style="font-size: 11px; color: #888; margin-top: 4px;">
              ${insight.description}
            </div>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Activity chart (simplified) -->
    <div style="
      padding: 15px;
      border-top: 1px solid rgba(100, 200, 255, 0.1);
    ">
      <div style="font-size: 11px; color: #888; margin-bottom: 10px;">
        Activity by Hour
      </div>
      <div style="display: flex; gap: 2px; height: 40px; align-items: flex-end;">
        ${Array.from({ length: 24 }, (_, hour) => {
          const count = data.viewsByHour.get(hour) || 0;
          const maxCount = Math.max(...Array.from(data.viewsByHour.values()), 1);
          const height = Math.max(4, (count / maxCount) * 40);
          return `
            <div style="
              flex: 1;
              height: ${height}px;
              background: rgba(100, 200, 255, ${0.3 + (count / maxCount) * 0.7});
              border-radius: 2px 2px 0 0;
            " title="${hour}:00 - ${count} views"></div>
          `;
        }).join('')}
      </div>
      <div style="
        display: flex;
        justify-content: space-between;
        font-size: 9px;
        color: #666;
        margin-top: 4px;
      ">
        <span>12 AM</span>
        <span>12 PM</span>
        <span>11 PM</span>
      </div>
    </div>
  `;

  system.container.appendChild(panel);
  system.panel = panel;

  // Animate in
  requestAnimationFrame(() => {
    panel.style.opacity = '1';
  });

  // Wire up close
  const closeBtn = panel.querySelector('#insights-close') as HTMLButtonElement;
  closeBtn.onclick = () => closeInsights(system);

  // Wire up recommendation clicks
  const recommendations = panel.querySelectorAll('.insight-card[data-day]');
  recommendations.forEach(card => {
    (card as HTMLElement).onmouseover = () => {
      (card as HTMLElement).style.background = 'rgba(100, 200, 255, 0.15)';
    };
    (card as HTMLElement).onmouseout = () => {
      (card as HTMLElement).style.background = 'rgba(100, 200, 255, 0.08)';
    };
  });

  // Escape to close
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeInsights(system);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Close insights panel
 */
function closeInsights(system: InsightsSystem): void {
  if (!system.panel) return;

  system.panel.style.opacity = '0';
  const panel = system.panel;

  setTimeout(() => {
    panel.remove();
    if (system.panel === panel) {
      system.panel = null;
    }
  }, 300);

  system.isOpen = false;
}

/**
 * Toggle insights panel
 */
export function toggleInsights(system: InsightsSystem, data: InsightsData): void {
  if (system.isOpen) {
    closeInsights(system);
  } else {
    showInsights(system, data);
  }
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeInsightsSystem(system: InsightsSystem): void {
  system.cleanup();
}
