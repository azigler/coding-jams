/**
 * Daily Exhibit Recommendations
 *
 * Suggests exhibits based on the current date.
 */

// ============================================================================
// Types
// ============================================================================

export interface DailyRecommendation {
  dayNumber: number;
  reason: string;
}

// ============================================================================
// Daily Recommendation Logic
// ============================================================================

/**
 * Get today's recommended exhibit
 */
export function getDailyRecommendation(): DailyRecommendation {
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth() + 1; // 1-12
  const dayOfWeek = now.getDay(); // 0=Sunday

  // During January, recommend the day's exhibit
  if (month === 1 && day >= 1 && day <= 31) {
    return {
      dayNumber: day,
      reason: `Today's Genuary prompt`,
    };
  }

  // Day-of-week themes
  const weekdayThemes: Record<number, DailyRecommendation> = {
    0: { dayNumber: 26, reason: 'Sunday Symmetry' }, // Symmetry
    1: { dayNumber: 12, reason: 'Monday Minimalism' }, // Subdivision
    2: { dayNumber: 17, reason: 'Tuesday Flow' }, // Wind
    3: { dayNumber: 7, reason: 'Wednesday Luck' }, // Use the digit 7
    4: { dayNumber: 19, reason: 'Thursday Illusion' }, // Op Art
    5: { dayNumber: 31, reason: 'Friday Celebration' }, // Celebrate
    6: { dayNumber: 15, reason: 'Saturday Comfort' }, // Design a rug
  };

  // Use day-of-week theme
  const weekdayRec = weekdayThemes[dayOfWeek];
  if (weekdayRec) {
    return weekdayRec;
  }

  // Fallback: use date as day number (wrap around)
  const fallbackDay = ((day - 1) % 31) + 1;
  return {
    dayNumber: fallbackDay,
    reason: 'Featured exhibit',
  };
}

/**
 * Get a themed suggestion based on time of day
 */
export function getTimeBasedSuggestion(): DailyRecommendation | null {
  const hour = new Date().getHours();

  if (hour >= 0 && hour < 6) {
    // Late night: dark themes
    return { dayNumber: 4, reason: 'Night owl viewing: Black on Black' };
  } else if (hour >= 6 && hour < 9) {
    // Early morning: gentle
    return { dayNumber: 22, reason: 'Morning calm: Gradients Only' };
  } else if (hour >= 17 && hour < 20) {
    // Evening: warm
    return { dayNumber: 16, reason: 'Evening viewing: Movie palette' };
  } else if (hour >= 20) {
    // Night: abstract
    return { dayNumber: 30, reason: 'Night mood: Abstract Emotion' };
  }

  return null;
}

/**
 * Get multiple suggestions for variety
 */
export function getRecommendations(count: number = 3): DailyRecommendation[] {
  const recommendations: DailyRecommendation[] = [];

  // Add daily recommendation
  recommendations.push(getDailyRecommendation());

  // Add time-based suggestion if applicable
  const timeBased = getTimeBasedSuggestion();
  if (timeBased && timeBased.dayNumber !== recommendations[0].dayNumber) {
    recommendations.push(timeBased);
  }

  // Add some variety picks
  const varietyPicks: DailyRecommendation[] = [
    { dayNumber: 8, reason: 'Impressive scale' }, // One million
    { dayNumber: 21, reason: 'Interactive physics' }, // Collision detection
    { dayNumber: 25, reason: 'Mesmerizing path' }, // One line
    { dayNumber: 13, reason: 'Geometric beauty' }, // Triangles
    { dayNumber: 6, reason: 'Scenic view' }, // Landscape
  ];

  // Shuffle variety picks
  for (let i = varietyPicks.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [varietyPicks[i], varietyPicks[j]] = [varietyPicks[j], varietyPicks[i]];
  }

  // Add variety picks until we have enough
  for (const pick of varietyPicks) {
    if (recommendations.length >= count) break;
    if (!recommendations.find(r => r.dayNumber === pick.dayNumber)) {
      recommendations.push(pick);
    }
  }

  return recommendations.slice(0, count);
}
