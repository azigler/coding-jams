/**
 * Genuary 2026 Virtual Museum
 *
 * A WebXR virtual museum that showcases all 31 days of Genuary
 * as a unified, navigable 3D experience.
 *
 * The art doesn't hang on walls - it BECOMES the architecture.
 */

import * as THREE from 'three';
import { createScene, updateScene, disposeScene, setQuality, type MuseumScene } from './scene';
import { createNavigation, updateNavigation, disposeNavigation, type Navigation } from './navigation';
import {
  initAudio,
  startAmbient,
  disposeAudio,
  setAudioMuted,
  isAudioMuted,
  playDiscoveryChime,
  playAchievementUnlock,
  playCameraShutter,
  playZoomIn,
  playZoomOut,
  playFavoriteToggle,
  playTeleport,
  updateAmbientForWing,
} from './audio';
import {
  createInteraction,
  updateInteraction,
  disposeInteraction,
  registerExhibits,
  sortExhibitsByDay,
  type InteractionSystem,
} from './interaction';
import {
  createTourSystem,
  startTour,
  stopTour,
  toggleTour,
  updateTour,
  disposeTour,
  type TourSystem,
} from './tour';
import { updateArtworkVisibility } from './exhibits/artwork';
import {
  createTouchControls,
  disposeTouchControls,
  isTouchDevice,
  type TouchControls,
} from './touch';
import {
  createMinimap,
  updateMinimap,
  disposeMinimap,
  type Minimap,
} from './minimap';
import {
  createSettingsPanel,
  disposeSettingsPanel,
  type SettingsPanel,
  type Settings,
} from './settings';
import {
  createDiscoveryTracker,
  markDayDiscovered,
  refreshDiscoveryBadge,
  disposeDiscoveryTracker,
  type DiscoveryTracker,
} from './discovery';
import {
  createFavoritesSystem,
  toggleFavorite,
  isFavorite,
  getFavorites,
  disposeFavoritesSystem,
  type FavoritesSystem,
} from './favorites';
import {
  createTipsSystem,
  markTipShown,
  disposeTipsSystem,
  type TipsSystem,
} from './tips';
import {
  createStatsTracker,
  getWelcomeMessage,
  recordExhibitView,
  recordFavoriteAdded,
  recordScreenshot,
  recordSharedView,
  recordMovement,
  recordTourStarted,
  checkSpeedRun,
  showStatsPopup,
  disposeStatsTracker,
  type StatsTracker,
} from './stats';
import {
  createDaySelector,
  disposeDaySelector,
  type DaySelector,
} from './dayselect';
import {
  createAchievementsSystem,
  checkAchievements,
  unlockAchievement,
  showAchievementNotification,
  showAchievementsPopup,
  disposeAchievementsSystem,
  type AchievementsSystem,
} from './achievements';
import {
  createCreditsSystem,
  disposeCreditsSystem,
  type CreditsSystem,
} from './credits';
import {
  createHelpSystem,
  toggleHelp,
  disposeHelpSystem,
  type HelpSystem,
} from './help';
import {
  createCompass,
  updateCompass,
  disposeCompass,
  type Compass,
} from './compass';
import {
  createExhibitInfoPanel,
  showExhibitInfo,
  hideExhibitInfo,
  disposeExhibitInfoPanel,
  type ExhibitInfoPanel,
} from './exhibit-info';
import {
  createPhotoGallery,
  addPhotoToGallery,
  toggleGallery,
  disposePhotoGallery,
  type PhotoGallery,
} from './gallery';
import {
  createBreadcrumbTrail,
  addBreadcrumb,
  disposeBreadcrumbTrail,
  type BreadcrumbTrail,
} from './breadcrumbs';
import {
  createParticleSystem,
  updateParticles,
  disposeParticleSystem,
  type ParticleSystem,
} from './particles';
import {
  createSpotlight,
  activateSpotlight,
  deactivateSpotlight,
  disposeSpotlight,
  type Spotlight,
} from './spotlight';
import { getDailyRecommendation } from './daily';
import {
  createRatingsSystem,
  rateExhibit,
  getRating,
  disposeRatingsSystem,
  type RatingsSystem,
} from './ratings';
import {
  createAutoWalk,
  toggleAutoWalk,
  updateAutoWalk,
  stopAutoWalk,
  disposeAutoWalk,
  type AutoWalk,
} from './autowalk';
import {
  createGuestbook,
  disposeGuestbook,
  type Guestbook,
} from './guestbook';
import {
  createSearchSystem,
  disposeSearchSystem,
  type SearchSystem,
} from './search';
import {
  createAccessibilitySystem,
  disposeAccessibilitySystem,
  type AccessibilitySystem,
} from './accessibility';
import {
  createSessionSummary,
  recordExhibitViewed as recordSessionExhibit,
  recordScreenshotTaken as recordSessionScreenshot,
  recordFavoriteAdded as recordSessionFavorite,
  disposeSessionSummary,
  type SessionSummary,
} from './session-summary';
import {
  createCuratorNoteSystem,
  checkCuratorNotes,
  disposeCuratorNoteSystem,
  type CuratorNoteSystem,
  type NoteContext,
} from './curator-notes';
import {
  createTimeLighting,
  disposeTimeLighting,
  getTimePeriodDescription,
  type TimeLighting,
} from './time-lighting';
import {
  createCollectionsSystem,
  openCollectionsWithContext,
  disposeCollectionsSystem,
  type CollectionsSystem,
} from './collections';
import {
  createQuickFactsSystem,
  showQuickFact,
  hideQuickFact,
  disposeQuickFactsSystem,
  type QuickFactsSystem,
} from './quick-facts';
import {
  createPhotoBooth,
  openPhotoBooth,
  disposePhotoBooth,
  type PhotoBooth,
} from './photo-booth';
import {
  createSuggestedNext,
  registerExhibitsForSuggestion,
  updateSuggestedNext,
  hideSuggestion,
  disposeSuggestedNext,
  type SuggestedNext,
} from './suggested-next';
import {
  createCompletionSystem,
  checkCompletion,
  disposeCompletionSystem,
  type CompletionSystem,
} from './completion';
import {
  createPostcardSystem,
  openPostcardCreator,
  disposePostcardSystem,
  type PostcardSystem,
} from './postcards';
import {
  createLandmarkSystem,
  updateLandmarks,
  disposeLandmarkSystem,
  type LandmarkSystem,
} from './landmarks';
import {
  createFootstepSystem,
  initFootstepAudio,
  updateFootsteps,
  disposeFootstepSystem,
  type FootstepSystem,
} from './footsteps';
// REMOVED: Gamification feature - speedrun
// import {
//   createSpeedRunSystem,
//   recordSpeedRunExhibit,
//   disposeSpeedRunSystem,
//   type SpeedRunSystem,
// } from './speedrun';
import {
  createJournalSystem,
  openJournalEntry,
  getJournalCount,
  disposeJournalSystem,
  type JournalSystem,
} from './journal';
import {
  createMoodSystem,
  disposeMoodSystem,
  type MoodSystem,
} from './mood';
// REMOVED: Gamification feature - quiz
// import {
//   createQuizSystem,
//   disposeQuizSystem,
//   type QuizSystem,
// } from './quiz';
// REMOVED: Gamification feature - scavenger hunt
// import {
//   createScavengerSystem,
//   checkScavengerProgress,
//   disposeScavengerSystem,
//   type ScavengerSystem,
// } from './scavenger';
import {
  createHistorySystem,
  recordHistoryView,
  recordHistoryExit,
  disposeHistorySystem,
  type HistorySystem,
} from './history';
// REMOVED: Gamification feature - daily challenges
// import {
//   createChallengeSystem,
//   updateChallengeProgress,
//   disposeChallengeSystem,
//   type ChallengeSystem,
// } from './challenge';
import {
  createComparatorSystem,
  disposeComparatorSystem,
  type ComparatorSystem,
} from './comparator';
import {
  createSocialSystem,
  openSharePopup,
  disposeSocialSystem,
  type SocialSystem,
} from './social';
import {
  createBookmarksSystem,
  addBookmark,
  disposeBookmarksSystem,
  type BookmarksSystem,
  type Bookmark,
} from './bookmarks';
import {
  createFocusSystem,
  toggleFocusMode,
  disposeFocusSystem,
  type FocusSystem,
} from './focus';
// REMOVED: Visitor counter (social proof gamification)
// import {
//   createVisitorSystem,
//   recordDayView,
//   disposeVisitorSystem,
//   type VisitorSystem,
// } from './visitors';
import {
  createSoundMixerSystem,
  initMixerAudio,
  disposeSoundMixerSystem,
  type SoundMixerSystem,
} from './soundmixer';
import {
  createQuickMenuSystem,
  disposeQuickMenuSystem,
  type QuickMenuSystem,
} from './quickmenu';
import {
  createRelatedSystem,
  showRelated,
  hideRelated,
  disposeRelatedSystem,
  type RelatedSystem,
} from './related';
import {
  createWeatherSystem,
  disposeWeatherSystem,
  type WeatherSystem,
} from './weather';
import {
  createTimerSystem,
  startViewing,
  endViewing,
  disposeTimerSystem,
  type TimerSystem,
} from './timer';
import {
  createMusicPlayerSystem,
  disposeMusicPlayerSystem,
  type MusicPlayerSystem,
} from './musicplayer';
import {
  createGiftShopSystem,
  showAddItemMenu,
  disposeGiftShopSystem,
  type GiftShopSystem,
} from './giftshop';
import {
  createMeditationSystem,
  disposeMeditationSystem,
  type MeditationSystem,
} from './meditation';
import {
  createHotSpotsSystem,
  recordHotSpotView,
  disposeHotSpotsSystem,
  type HotSpotsSystem,
} from './hotspots';
import {
  createProfileSystem,
  disposeProfileSystem,
  type ProfileSystem,
} from './profile';
import {
  createTimeCapsuleSystem,
  openCreateCapsule,
  disposeTimeCapsuleSystem,
  type TimeCapsuleSystem,
  type Capsule,
} from './timecapsule';
import {
  createArtStylesSystem,
  showStyleGuide,
  closeStyleGuide,
  disposeArtStylesSystem,
  type ArtStylesSystem,
} from './artstyles';
import {
  createAnnotationsSystem,
  showAnnotations,
  hideAnnotations,
  enterAddMode,
  disposeAnnotationsSystem,
  type AnnotationsSystem,
} from './annotations';
import {
  createDailyQuoteSystem,
  disposeDailyQuoteSystem,
  type DailyQuoteSystem,
} from './dailyquote';
import {
  createReactionsSystem,
  showReactionsPanel,
  hideReactionsPanel,
  disposeReactionsSystem,
  type ReactionsSystem,
} from './reactions';
import {
  createPaletteSystem,
  showPalette,
  closePalette,
  disposePaletteSystem,
  type PaletteSystem,
} from './palette';
import {
  createFloorPlanSystem,
  toggleFloorPlan,
  disposeFloorPlanSystem,
  type FloorPlanSystem,
} from './floorplan';
import {
  createNightModeSystem,
  toggleNightMode,
  disposeNightModeSystem,
  type NightModeSystem,
} from './nightmode';
import {
  createLabelsSystem,
  registerExhibitsForLabels,
  toggleLabels,
  updateLabels,
  disposeLabelsSystem,
  type LabelsSystem,
} from './labels';
import {
  createTrailSystem,
  recordTrailPosition,
  toggleTrail,
  updateTrail,
  disposeTrailSystem,
  type TrailSystem,
} from './trail';
import {
  createAudioGuideSystem,
  speakNarration,
  stopNarration,
  disposeAudioGuideSystem,
  type AudioGuideSystem,
} from './audioguide';
import {
  createPhotoFiltersSystem,
  disposePhotoFiltersSystem,
  type PhotoFiltersSystem,
} from './photofilters';
// REMOVED: Virtual presence (social proof gamification)
// import {
//   createPresenceSystem,
//   disposePresenceSystem,
//   type PresenceSystem,
// } from './presence';
import {
  createVisitLogSystem,
  logExhibitView,
  logFavorite,
  logScreenshot,
  logAchievement,
  toggleVisitLog,
  disposeVisitLogSystem,
  type VisitLogSystem,
} from './visitlog';
import {
  createRandomWalkSystem,
  selectRandom,
  disposeRandomWalkSystem,
  type RandomWalkSystem,
} from './randomwalk';
import {
  createShareCardSystem,
  showShareCard,
  disposeShareCardSystem,
  type ShareCardSystem,
} from './sharecard';
// REMOVED: Gamification feature - streaks
// import {
//   createStreaksSystem,
//   disposeStreaksSystem,
//   type StreaksSystem,
// } from './streaks';
import {
  createAmbientPresetsSystem,
  togglePresetsPanel,
  getCurrentPreset,
  disposeAmbientPresetsSystem,
  type AmbientPresetsSystem,
} from './ambientpresets';
import {
  createWishListSystem,
  toggleWishListItem,
  toggleWishList,
  isInWishList,
  disposeWishListSystem,
  type WishListSystem,
} from './wishlist';
import {
  createHeatmapSystem,
  recordHeatmapView,
  recordHeatmapTime,
  toggleHeatmap,
  disposeHeatmapSystem,
  type HeatmapSystem,
} from './heatmap';
import {
  createTimeWarpSystem,
  cycleTimeWarp,
  getTimeWarpSpeed,
  showTimeWarpSelector,
  disposeTimeWarpSystem,
  type TimeWarpSystem,
} from './timewarp';
import {
  createCommentsSystem,
  openComments,
  disposeCommentsSystem,
  type CommentsSystem,
} from './comments';
import {
  createTagsSystem,
  openTagManager,
  openTagBrowser,
  disposeTagsSystem,
  type TagsSystem,
} from './tags';
import {
  createMemoryLaneSystem,
  recordFirstView,
  recordFavoriteMemory,
  toggleMemoryLane,
  disposeMemoryLaneSystem,
  type MemoryLaneSystem,
} from './memory';
import {
  createMilestonesSystem,
  checkMilestones,
  showMilestoneNotification,
  toggleMilestones,
  disposeMilestonesSystem,
  type MilestonesSystem,
} from './milestones';
import {
  createPhotoFrameSystem,
  showPhotoInFrame,
  disposePhotoFrameSystem,
  type PhotoFrameSystem,
} from './photoframe';
import {
  createInsightsSystem,
  toggleInsights,
  disposeInsightsSystem,
  type InsightsSystem,
  type InsightsData,
} from './insights';
import {
  createSoundscapeSystem,
  initSoundscapeAudio,
  cycleSoundscape,
  disposeSoundscapeSystem,
  type SoundscapeSystem,
} from './soundscape';
import {
  createTriviaSystem,
  showRandomTrivia,
  disposeTriviaSystem,
  type TriviaSystem,
} from './trivia';
import {
  createWaypointsSystem,
  toggleWaypoints,
  addCustomWaypoint,
  disposeWaypointsSystem,
  type WaypointsSystem,
} from './waypoints';
import {
  createZoomSystem,
  zoomIn,
  zoomOut,
  resetZoom,
  getZoomFov,
  disposeZoomSystem,
  type ZoomSystem,
} from './zoom';
import {
  createPlaylistSystem,
  togglePlaylistPanel,
  playlistNext,
  playlistPrev,
  disposePlaylistSystem,
  type PlaylistSystem,
} from './playlist';
import {
  createCuratorSystem,
  toggleCuratorComment,
  openTourPanel as openCuratorTourPanel,
  curatorNext,
  curatorPrev,
  disposeCuratorSystem,
  type CuratorSystem,
} from './curator';
import {
  createAtmosphericsSystem,
  cycleAtmosphericPreset,
  disposeAtmosphericsSystem,
  type AtmosphericsSystem,
} from './atmospherics';
import {
  createComparisonSystem,
  addToComparison,
  toggleComparisonPanel,
  disposeComparisonSystem,
  type ComparisonSystem,
} from './comparisons';
import {
  createTimelineSystem,
  recordTimelineVisit,
  recordTimelineFavorite,
  recordTimelineScreenshot,
  recordTimelineAchievement,
  toggleTimelinePanel,
  disposeTimelineSystem,
  type TimelineSystem,
} from './timeline';
import {
  createThemesSystem,
  cycleTheme,
  toggleThemesPanel,
  disposeThemesSystem,
  type ThemesSystem,
} from './themes';
// REMOVED: Gamification feature - collectible badges
// import {
//   createBadgesSystem,
//   unlockBadge,
//   toggleBadgesPanel,
//   disposeBadgesSystem,
//   type BadgesSystem,
// } from './badges';
// REMOVED: Gamification feature - visitor leaderboard
// import {
//   createLeaderboardSystem,
//   updateLeaderboardStats,
//   toggleLeaderboardPanel,
//   disposeLeaderboardSystem,
//   type LeaderboardSystem,
// } from './leaderboard';
import {
  createTutorialsSystem,
  shouldShowFirstTimeTutorial,
  startTutorial,
  openTutorialPanel,
  disposeTutorialsSystem,
  type TutorialsSystem,
} from './tutorials';
import {
  createExhibitionsSystem,
  toggleExhibitionsPanel,
  disposeExhibitionsSystem,
  type ExhibitionsSystem,
} from './exhibitions';
import {
  createRecommendationsSystem,
  recordView as recordRecView,
  recordFavoriteForRec,
  toggleRecommendationsPanel,
  disposeRecommendationsSystem,
  type RecommendationsSystem,
} from './recommendations';

// ============================================================================
// Types
// ============================================================================

export interface MuseumContext {
  scene: MuseumScene;
  navigation: Navigation;
  interaction: InteractionSystem;
  tour: TourSystem;
  touch: TouchControls | null;
  minimap: Minimap;
  settings: SettingsPanel;
  discovery: DiscoveryTracker;
  favorites: FavoritesSystem;
  tips: TipsSystem;
  stats: StatsTracker;
  daySelector: DaySelector;
  achievements: AchievementsSystem;
  credits: CreditsSystem;
  help: HelpSystem;
  compass: Compass;
  exhibitInfo: ExhibitInfoPanel;
  photoGallery: PhotoGallery;
  breadcrumbs: BreadcrumbTrail;
  particles: ParticleSystem;
  spotlight: Spotlight;
  ratings: RatingsSystem;
  autoWalk: AutoWalk;
  guestbook: Guestbook;
  search: SearchSystem;
  accessibility: AccessibilitySystem;
  sessionSummary: SessionSummary;
  curatorNotes: CuratorNoteSystem;
  timeLighting: TimeLighting;
  collections: CollectionsSystem;
  quickFacts: QuickFactsSystem;
  photoBooth: PhotoBooth;
  suggestedNext: SuggestedNext;
  completion: CompletionSystem;
  postcards: PostcardSystem;
  landmarks: LandmarkSystem;
  footsteps: FootstepSystem;
  // REMOVED: speedrun: SpeedRunSystem;
  journal: JournalSystem;
  mood: MoodSystem;
  // REMOVED: quiz: QuizSystem;
  // REMOVED: scavenger: ScavengerSystem;
  history: HistorySystem;
  // REMOVED: dailyChallenge: ChallengeSystem;
  comparator: ComparatorSystem;
  social: SocialSystem;
  bookmarks: BookmarksSystem;
  focus: FocusSystem;
  // REMOVED: visitors: VisitorSystem;
  soundMixer: SoundMixerSystem;
  quickMenu: QuickMenuSystem;
  related: RelatedSystem;
  weather: WeatherSystem;
  exhibitTimer: TimerSystem;
  musicPlayer: MusicPlayerSystem;
  giftShop: GiftShopSystem;
  meditation: MeditationSystem;
  hotSpots: HotSpotsSystem;
  visitorProfile: ProfileSystem;
  timeCapsule: TimeCapsuleSystem;
  artStyles: ArtStylesSystem;
  annotations: AnnotationsSystem;
  dailyQuote: DailyQuoteSystem;
  reactions: ReactionsSystem;
  palette: PaletteSystem;
  floorPlan: FloorPlanSystem;
  nightMode: NightModeSystem;
  exhibitLabels: LabelsSystem;
  visitorTrail: TrailSystem;
  audioGuide: AudioGuideSystem;
  photoFilters: PhotoFiltersSystem;
  // REMOVED: virtualPresence: PresenceSystem;
  visitLog: VisitLogSystem;
  randomWalk: RandomWalkSystem;
  shareCard: ShareCardSystem;
  // REMOVED: streaks: StreaksSystem;
  ambientPresets: AmbientPresetsSystem;
  wishList: WishListSystem;
  heatmap: HeatmapSystem;
  timeWarp: TimeWarpSystem;
  exhibitComments: CommentsSystem;
  exhibitTags: TagsSystem;
  memoryLane: MemoryLaneSystem;
  milestones: MilestonesSystem;
  photoFrame: PhotoFrameSystem;
  visitorInsights: InsightsSystem;
  soundscape: SoundscapeSystem;
  trivia: TriviaSystem;
  waypoints: WaypointsSystem;
  cameraZoom: ZoomSystem;
  exhibitPlaylist: PlaylistSystem;
  virtualCurator: CuratorSystem;
  atmospherics: AtmosphericsSystem;
  comparisons: ComparisonSystem;
  visitTimeline: TimelineSystem;
  uiThemes: ThemesSystem;
  // REMOVED: visitorBadges: BadgesSystem;
  // REMOVED: leaderboard: LeaderboardSystem;
  tutorials: TutorialsSystem;
  exhibitions: ExhibitionsSystem;
  personalRecs: RecommendationsSystem;
  container: HTMLElement;
  isRunning: boolean;
  lastTime: number;
  animationId: number | null;
}

// ============================================================================
// State
// ============================================================================

let context: MuseumContext | null = null;

// ============================================================================
// Loading Indicator
// ============================================================================

/**
 * Show loading overlay while museum initializes
 */
function showLoadingOverlay(container: HTMLElement): HTMLElement {
  const overlay = document.createElement('div');
  overlay.id = 'museum-loading';
  overlay.innerHTML = `
    <div style="
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0a0a12 0%, #1a1a2e 100%);
      color: white;
      font-family: system-ui, sans-serif;
      z-index: 1000;
      transition: opacity 0.5s;
    ">
      <div style="font-size: 28px; font-weight: bold; margin-bottom: 8px;">
        GENUARY 2026
      </div>
      <div style="font-size: 16px; color: #888; margin-bottom: 24px;">
        Virtual Museum
      </div>
      <div style="
        width: 200px;
        height: 4px;
        background: rgba(255,255,255,0.1);
        border-radius: 2px;
        overflow: hidden;
      ">
        <div id="loading-bar" style="
          width: 0%;
          height: 100%;
          background: linear-gradient(90deg, #4a9eff, #a855f7);
          border-radius: 2px;
          transition: width 0.3s;
          animation: loading-pulse 1.5s ease-in-out infinite;
        "></div>
      </div>
      <div id="loading-text" style="
        margin-top: 12px;
        font-size: 12px;
        color: #666;
      ">Loading...</div>
      <style>
        @keyframes loading-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      </style>
    </div>
  `;
  container.appendChild(overlay);
  return overlay;
}

/**
 * Update loading progress
 */
function updateLoadingProgress(percent: number, status: string): void {
  const bar = document.getElementById('loading-bar');
  const text = document.getElementById('loading-text');
  if (bar) bar.style.width = `${percent}%`;
  if (text) text.textContent = status;
}

/**
 * Hide loading overlay with fade out
 */
function hideLoadingOverlay(): void {
  const overlay = document.getElementById('museum-loading');
  if (overlay) {
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 500);
  }
}

// ============================================================================
// Museum Lifecycle
// ============================================================================

/**
 * Create the location indicator showing current area and session timer
 */
function createLocationIndicator(container: HTMLElement): HTMLElement {
  const indicator = document.createElement('div');
  indicator.id = 'museum-location';
  indicator.innerHTML = `
    <div style="
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.5);
      color: #a0a0b0;
      padding: 8px 12px;
      border-radius: 4px;
      font-family: system-ui, sans-serif;
      font-size: 12px;
      pointer-events: none;
      z-index: 100;
    ">
      <span id="location-text">Entrance</span>
      <span style="margin-left: 12px; opacity: 0.7;" id="session-timer">0:00</span>
    </div>
  `;
  container.appendChild(indicator);

  // Update session timer every second
  const startTime = Date.now();
  const timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const timerEl = document.getElementById('session-timer');
    if (timerEl) {
      timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  }, 1000);

  // Store interval for cleanup
  (indicator as unknown as Record<string, unknown>).timerInterval = timerInterval;

  return indicator;
}

/**
 * Determine the current wing/location based on position
 */
function getWingFromPosition(z: number, x: number): string {
  // Gallery center is at z = -32
  if (z < -20 && z > -45) {
    if (Math.abs(x) < 8) {
      return 'gallery';
    } else if (x < -8) {
      return 'west';
    } else if (x > 8) {
      return 'east';
    }
  } else if (z <= -45) {
    return 'north';
  } else if (z >= -20) {
    // South is the entrance area
    return 'south';
  }
  return 'gallery';
}

/**
 * Update the location indicator based on camera position
 */
function updateLocationIndicator(z: number, x: number): void {
  const textEl = document.getElementById('location-text');
  if (!textEl) return;

  let location = 'Entrance';

  // Determine location based on camera position
  // Gallery center is at z = -32
  if (z < -20 && z > -45) {
    if (Math.abs(x) < 8) {
      location = 'Main Gallery';
    } else if (x < -8) {
      location = 'West Wing';
    } else if (x > 8) {
      location = 'East Wing';
    }
  } else if (z <= -45) {
    location = 'North Wing';
  } else if (z >= -5) {
    location = 'Entrance';
  } else {
    location = 'Entrance Hallway';
  }

  textEl.textContent = location;
}

/**
 * Take a screenshot of the current view
 */
function takeScreenshot(
  canvas: HTMLCanvasElement,
  gallery: PhotoGallery | null,
  dayNumber: number
): void {
  try {
    const dataUrl = canvas.toDataURL('image/png');

    // Create a link element for download
    const link = document.createElement('a');
    link.download = `genuary-museum-day-${dayNumber > 0 ? dayNumber : 'view'}-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();

    // Save to gallery if available
    if (gallery && dayNumber > 0) {
      addPhotoToGallery(gallery, dataUrl, dayNumber);
      showNotification('Screenshot saved to gallery! (Shift+G to view)');
    } else {
      showNotification('Screenshot saved!');
    }
  } catch (e) {
    console.error('Screenshot failed:', e);
    showNotification('Screenshot failed');
  }
}

/**
 * Generate and copy a shareable link with current view position
 */
function shareView(camera: THREE.PerspectiveCamera): void {
  const pos = camera.position;
  const euler = new THREE.Euler().setFromQuaternion(camera.quaternion);

  // Encode position and rotation in URL hash
  const params = new URLSearchParams({
    x: pos.x.toFixed(1),
    y: pos.y.toFixed(1),
    z: pos.z.toFixed(1),
    rx: euler.x.toFixed(2),
    ry: euler.y.toFixed(2),
  });

  const url = `${window.location.origin}${window.location.pathname}#museum?${params.toString()}`;

  // Copy to clipboard
  navigator.clipboard.writeText(url).then(() => {
    showNotification('View link copied to clipboard!');
  }).catch(() => {
    // Fallback: show the URL
    showNotification('Share: ' + url.slice(-50));
  });
}

/**
 * Parse shared view parameters from URL
 */
function parseSharedView(): { x: number; y: number; z: number; rx: number; ry: number } | null {
  const hash = window.location.hash;
  if (!hash.includes('museum?')) return null;

  try {
    const queryString = hash.split('?')[1];
    if (!queryString) return null;

    const params = new URLSearchParams(queryString);
    const x = parseFloat(params.get('x') || '');
    const y = parseFloat(params.get('y') || '');
    const z = parseFloat(params.get('z') || '');
    const rx = parseFloat(params.get('rx') || '');
    const ry = parseFloat(params.get('ry') || '');

    if (isNaN(x) || isNaN(y) || isNaN(z)) return null;

    return { x, y, z, rx: rx || 0, ry: ry || 0 };
  } catch {
    return null;
  }
}

/**
 * Toggle photo mode (hides UI for clean screenshots)
 */
let photoModeActive = false;

function togglePhotoMode(container: HTMLElement): void {
  photoModeActive = !photoModeActive;

  // List of UI element IDs to hide/show
  const uiElements = [
    'museum-location',
    'minimap-canvas',
    'museum-help',
    'discovery-badge',
    'settings-button',
    'museum-tip',
    'tour-progress',
  ];

  uiElements.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.display = photoModeActive ? 'none' : '';
    }
  });

  // Also hide any div with settings-panel class
  const settingsPanel = container.querySelector('[id^="settings-panel"]');
  if (settingsPanel) {
    (settingsPanel as HTMLElement).style.display = photoModeActive ? 'none' : '';
  }

  showNotification(photoModeActive ? 'Photo mode ON - UI hidden' : 'Photo mode OFF');
}

/**
 * Toggle fullscreen mode
 */
function toggleFullscreen(container: HTMLElement): void {
  if (!document.fullscreenElement) {
    container.requestFullscreen().then(() => {
      showNotification('Entered fullscreen');
    }).catch((err) => {
      console.warn('Fullscreen request failed:', err);
    });
  } else {
    document.exitFullscreen().then(() => {
      showNotification('Exited fullscreen');
    }).catch((err) => {
      console.warn('Exit fullscreen failed:', err);
    });
  }
}

/**
 * Trigger confetti celebration for Easter egg
 */
function triggerConfetti(container: HTMLElement): void {
  const confettiCount = 100;
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#686de0', '#7bed9f'];

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;
    const delay = Math.random() * 2;
    const duration = 2 + Math.random() * 2;
    const size = 6 + Math.random() * 8;

    confetti.style.cssText = `
      position: fixed;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      left: ${left}%;
      top: -20px;
      z-index: 10000;
      pointer-events: none;
      animation: confetti-fall ${duration}s ease-out ${delay}s forwards;
      transform: rotate(${Math.random() * 360}deg);
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
    `;

    container.appendChild(confetti);

    // Remove after animation
    setTimeout(() => confetti.remove(), (duration + delay) * 1000 + 100);
  }

  // Add keyframes if not already present
  if (!document.getElementById('confetti-style')) {
    const style = document.createElement('style');
    style.id = 'confetti-style';
    style.textContent = `
      @keyframes confetti-fall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Show a temporary notification
 */
function showNotification(message: string): void {
  const existing = document.getElementById('museum-notification');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.id = 'museum-notification';
  notification.style.cssText = `
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(74, 158, 255, 0.9);
    color: white;
    padding: 10px 20px;
    border-radius: 20px;
    font-family: system-ui, sans-serif;
    font-size: 14px;
    z-index: 1000;
    animation: fadeInOut 2s ease-in-out;
  `;
  notification.textContent = message;

  // Add animation style
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInOut {
      0% { opacity: 0; transform: translateX(-50%) translateY(10px); }
      15% { opacity: 1; transform: translateX(-50%) translateY(0); }
      85% { opacity: 1; transform: translateX(-50%) translateY(0); }
      100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(notification);

  // Remove after animation
  setTimeout(() => {
    notification.remove();
    style.remove();
  }, 2000);
}

/**
 * Create the help overlay showing controls
 */
function createHelpOverlay(container: HTMLElement, permanent: boolean = false): HTMLElement {
  // Remove existing help overlay
  const existing = document.getElementById('museum-help');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'museum-help';
  overlay.innerHTML = `
    <div style="
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.7);
      color: #b0b0c0;
      padding: 15px 25px;
      border-radius: 8px;
      font-family: system-ui, sans-serif;
      font-size: 14px;
      pointer-events: none;
      transition: opacity 0.5s;
      z-index: 100;
    ">
      <div style="text-align: center; margin-bottom: 8px; color: #fff; font-weight: bold;">
        Controls
      </div>
      <div style="display: flex; gap: 16px; flex-wrap: wrap; justify-content: center;">
        <div><b>WASD</b> Move</div>
        <div><b>Drag</b> Look</div>
        <div><b>0-5</b> Teleport</div>
        <div><b>Q</b> Gallery</div>
        <div><b>G</b> Go to Day</div>
        <div><b>Click</b> Zoom</div>
        <div><b>[ ]</b> Browse</div>
        <div><b>R</b> Random</div>
        <div><b>U</b> Unvisited</div>
        <div><b>T</b> Tour</div>
        <div><b>F</b> Fav/Full</div>
        <div><b>J</b> Jump Fav</div>
        <div><b>P</b> Photo</div>
        <div><b>S</b> Share</div>
        <div><b>I</b> Stats</div>
        <div><b>A</b> Awards</div>
        <div><b>M</b> Mute</div>
        <div><b>C</b> Credits</div>
        <div><b>H</b> Help</div>
      </div>
    </div>
  `;
  container.style.position = 'relative';
  container.appendChild(overlay);

  // Fade out after 5 seconds unless permanent
  if (!permanent) {
    setTimeout(() => {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 500);
    }, 5000);
  }

  return overlay;
}

/**
 * Toggle help overlay visibility
 */
function toggleHelpOverlay(container: HTMLElement): void {
  const existing = document.getElementById('museum-help');
  if (existing) {
    existing.style.opacity = '0';
    setTimeout(() => existing.remove(), 300);
  } else {
    createHelpOverlay(container, true);
  }
}

/**
 * Initialize the museum
 */
export function initMuseum(container: HTMLElement): MuseumContext {
  // Show loading overlay
  showLoadingOverlay(container);
  updateLoadingProgress(10, 'Initializing scene...');

  // Create Three.js scene
  const scene = createScene(container);
  updateLoadingProgress(40, 'Setting up navigation...');

  // Create navigation system
  const navigation = createNavigation(scene.camera, scene.renderer.domElement);
  updateLoadingProgress(60, 'Registering exhibits...');

  // Create interaction system for click-to-zoom
  const interaction = createInteraction(scene.camera, scene.scene, scene.renderer.domElement);

  // Register all exhibits for interaction
  if (scene.galleryZone) {
    registerExhibits(interaction, scene.galleryZone.exhibits);
  }
  scene.wingZones.forEach(wing => {
    registerExhibits(interaction, wing.exhibits);
  });

  // Sort exhibits by day number for logical browsing
  sortExhibitsByDay(interaction);

  // Register exhibits for suggestion system (after suggestedNext is created later)
  // This will be done after suggestedNext is created

  // Create guided tour system
  const tour = createTourSystem(navigation, interaction);

  // Create touch controls for mobile devices
  const touch = isTouchDevice() ? createTouchControls(container, navigation) : null;

  // Create minimap
  const minimap = createMinimap(container);

  // Create settings panel
  const settings = createSettingsPanel(container);

  // Handle settings changes
  settings.onSettingsChange = (newSettings: Settings) => {
    // Toggle minimap visibility
    minimap.canvas.style.display = newSettings.minimapVisible ? 'block' : 'none';

    // Toggle sound
    setAudioMuted(!newSettings.soundEnabled);

    // Apply quality settings
    setQuality(scene, newSettings.qualityLevel);
  };

  // Apply initial settings
  if (!settings.settings.minimapVisible) {
    minimap.canvas.style.display = 'none';
  }
  if (!settings.settings.soundEnabled) {
    setAudioMuted(true);
  }
  // Apply initial quality (default is medium, which matches our defaults)
  if (settings.settings.qualityLevel !== 'medium') {
    setQuality(scene, settings.settings.qualityLevel);
  }

  // Create favorites system (before discovery, so we can wire them up)
  const favorites = createFavoritesSystem();

  // Create discovery tracker
  const discovery = createDiscoveryTracker(container);

  // Wire up discovery to access favorites
  discovery.getFavoritesCount = () => getFavorites(favorites).length;
  discovery.isFavorite = (dayNumber: number) => isFavorite(favorites, dayNumber);

  // Wire up interaction to track discoveries
  interaction.onExhibitViewed = (dayNumber: number) => {
    const wasNew = !discovery.viewedDays.has(dayNumber);
    markDayDiscovered(discovery, dayNumber);
    // Play discovery chime for new exhibits
    if (wasNew) {
      playDiscoveryChime();
    }
    // Record stat
    recordExhibitView(stats);
  };

  // Wire up interaction to toggle favorites
  interaction.onFavoriteToggle = (dayNumber: number) => {
    const nowFavorite = toggleFavorite(favorites, dayNumber);
    playFavoriteToggle(nowFavorite);
    showNotification(nowFavorite ? `Day ${dayNumber} added to favorites` : `Day ${dayNumber} removed from favorites`);
    // Update discovery badge to show new favorites count
    refreshDiscoveryBadge(discovery);
    // Mark tip as used
    markTipShown(tips, 'favorite');
    // Record stat if adding
    if (nowFavorite) {
      recordFavoriteAdded(stats);
    }
  };

  // Wire up interaction to check favorite status
  interaction.isFavorite = (dayNumber: number) => {
    return isFavorite(favorites, dayNumber);
  };

  // Wire up interaction to get all favorites
  interaction.getFavorites = () => {
    return getFavorites(favorites);
  };

  // Wire up double-click teleport
  interaction.onTeleport = (_x: number, _z: number) => {
    playTeleport();
    showNotification('Teleported!');
  };

  // Wire up visited check for "next unvisited" feature
  interaction.isVisited = (dayNumber: number) => {
    return discovery.viewedDays.has(dayNumber);
  };

  // Create tips system for contextual help
  const tips = createTipsSystem(container);

  // Create stats tracker
  const stats = createStatsTracker();

  // Show welcome message (different for first-time vs returning visitors)
  const welcomeMessage = getWelcomeMessage(stats);
  setTimeout(() => {
    if (welcomeMessage) {
      showNotification(welcomeMessage);
    } else if (stats.stats.sessionCount === 1) {
      showNotification('Welcome to the Genuary 2026 Museum! Press H for help.');
    }
  }, 3000); // Show after 3 seconds to let things settle

  // Show daily recommendation after welcome
  setTimeout(() => {
    const daily = getDailyRecommendation();
    showNotification(`Today's pick: Day ${daily.dayNumber} — ${daily.reason}. Press G to go there.`);
  }, 8000); // Show after 8 seconds

  // Create day selector for quick navigation
  const daySelector = createDaySelector(container);

  // Wire up day selector to zoom to exhibit
  daySelector.onDaySelected = (dayNumber: number) => {
    // Find the exhibit mesh for this day
    const mesh = interaction.exhibitMeshes.find(
      m => m.userData.dayNumber === dayNumber
    );
    if (mesh) {
      // Trigger zoom to this exhibit
      const meshIndex = interaction.exhibitMeshes.indexOf(mesh);
      interaction.currentExhibitIndex = meshIndex;

      // Store original position if not already zoomed
      if (!interaction.isZoomed) {
        interaction.originalPosition.copy(scene.camera.position);
        interaction.originalQuaternion.copy(scene.camera.quaternion);
      }

      // Calculate zoom target (similar to zoomToExhibitMesh logic)
      const worldPos = new THREE.Vector3();
      mesh.getWorldPosition(worldPos);
      const normal = new THREE.Vector3(0, 0, 1);
      const worldQuat = new THREE.Quaternion();
      mesh.getWorldQuaternion(worldQuat);
      normal.applyQuaternion(worldQuat);

      interaction.zoomTarget.copy(worldPos).addScaledVector(normal, 1.2);
      interaction.zoomTarget.y = scene.camera.position.y;
      interaction.zoomLookAt.copy(worldPos);
      interaction.zoomLookAt.y = scene.camera.position.y;

      interaction.isZoomed = true;
      interaction.animating = true;
      interaction.zoomProgress = 0;
      interaction.currentDayNumber = dayNumber;

      // Mark as discovered
      markDayDiscovered(discovery, dayNumber);
      recordExhibitView(stats);

      showNotification(`Viewing Day ${dayNumber}`);
    } else {
      showNotification(`Day ${dayNumber} exhibit not found`);
    }
  };

  // Create achievements system
  const achievements = createAchievementsSystem();

  // Show notification when achievement unlocks
  achievements.onAchievementUnlocked = (achievement) => {
    playAchievementUnlock();
    showAchievementNotification(achievement);
  };

  // Create credits system (C key to open)
  const credits = createCreditsSystem(container);

  // Create help system (H/? key to open)
  const help = createHelpSystem(container);

  // Create compass (shows facing direction)
  const compass = createCompass(container);

  // Create exhibit info panel (shows when zoomed)
  const exhibitInfo = createExhibitInfoPanel(container);

  // Create photo gallery (Shift+G to open)
  const photoGallery = createPhotoGallery(container);

  // Create breadcrumb trail
  const breadcrumbs = createBreadcrumbTrail(container);

  // Create ambient particles
  const particles = createParticleSystem(scene.scene);

  // Create spotlight system for exhibit focus
  const spotlight = createSpotlight(scene.scene);

  // Create ratings system
  const ratings = createRatingsSystem();

  // Create auto-walk system
  const autoWalk = createAutoWalk();

  // Wire up auto-walk to mark exhibits as viewed
  autoWalk.onExhibitReached = (dayNumber: number) => {
    interaction.onExhibitViewed?.(dayNumber);
  };

  // Create guestbook (L key to open)
  const guestbook = createGuestbook(container);

  // Create search system (/ key to open)
  const search = createSearchSystem(container);

  // Create accessibility system (Alt+H/T/R for high contrast, large text, reduced motion)
  const accessibility = createAccessibilitySystem(container);

  // Create session summary (Shift+Escape to show)
  const sessionSummary = createSessionSummary(container);

  // Create curator notes system (shows contextual notes as you explore)
  const curatorNotes = createCuratorNoteSystem(container);

  // Create time-of-day lighting system
  const timeLighting = createTimeLighting(scene.scene);

  // Create collections system (C key to browse themed collections)
  const collections = createCollectionsSystem(container);

  // Wire up collections to use session summary for viewed days
  collections.onNavigate = (dayNumber: number) => {
    // Same navigation logic as search
    const mesh = interaction.exhibitMeshes.find(
      m => m.userData.dayNumber === dayNumber
    );
    if (mesh) {
      const meshIndex = interaction.exhibitMeshes.indexOf(mesh);
      interaction.currentExhibitIndex = meshIndex;

      if (!interaction.isZoomed) {
        interaction.originalPosition.copy(scene.camera.position);
        interaction.originalQuaternion.copy(scene.camera.quaternion);
      }

      const worldPos = new THREE.Vector3();
      mesh.getWorldPosition(worldPos);
      const normal = new THREE.Vector3(0, 0, 1);
      if (mesh.parent) {
        normal.applyQuaternion(mesh.parent.quaternion);
      }

      interaction.zoomTarget.copy(worldPos).addScaledVector(normal, 1.2);
      interaction.zoomTarget.y = scene.camera.position.y;
      interaction.zoomLookAt.copy(worldPos);
      interaction.zoomLookAt.y = scene.camera.position.y;

      interaction.isZoomed = true;
      interaction.animating = true;
      interaction.zoomProgress = 0;
      interaction.currentDayNumber = dayNumber;
      interaction.onExhibitViewed?.(dayNumber);
      interaction.onZoomIn?.(dayNumber);
    }
  };

  // Create quick facts system (shows facts when hovering near exhibits)
  const quickFacts = createQuickFactsSystem(container);

  // Create photo booth (Shift+P when not in photo mode)
  const photoBooth = createPhotoBooth(container);
  photoBooth.onCapture = (dataUrl: string, dayNumber: number) => {
    // Download the styled photo
    const link = document.createElement('a');
    link.download = `genuary-2026-day${dayNumber.toString().padStart(2, '0')}-styled.png`;
    link.href = dataUrl;
    link.click();
    showNotification('Styled photo saved!');
  };

  // Create suggested next system (helps find unvisited exhibits)
  const suggestedNext = createSuggestedNext(container);
  registerExhibitsForSuggestion(suggestedNext, interaction.exhibitMeshes);

  // Wire up suggested next click to navigate
  if (suggestedNext.indicator) {
    suggestedNext.indicator.onclick = () => {
      const dayNumber = suggestedNext.lastSuggestion;
      if (dayNumber) {
        const mesh = interaction.exhibitMeshes.find(m => m.userData.dayNumber === dayNumber);
        if (mesh) {
          const meshIndex = interaction.exhibitMeshes.indexOf(mesh);
          interaction.currentExhibitIndex = meshIndex;

          if (!interaction.isZoomed) {
            interaction.originalPosition.copy(scene.camera.position);
            interaction.originalQuaternion.copy(scene.camera.quaternion);
          }

          const worldPos = new THREE.Vector3();
          mesh.getWorldPosition(worldPos);
          const normal = new THREE.Vector3(0, 0, 1);
          if (mesh.parent) {
            normal.applyQuaternion(mesh.parent.quaternion);
          }

          interaction.zoomTarget.copy(worldPos).addScaledVector(normal, 1.2);
          interaction.zoomTarget.y = scene.camera.position.y;
          interaction.zoomLookAt.copy(worldPos);
          interaction.zoomLookAt.y = scene.camera.position.y;

          interaction.isZoomed = true;
          interaction.animating = true;
          interaction.zoomProgress = 0;
          interaction.currentDayNumber = dayNumber;
          interaction.onExhibitViewed?.(dayNumber);
          interaction.onZoomIn?.(dayNumber);
          hideSuggestion(suggestedNext);
        }
      }
    };
  }

  // Create completion system (celebration for viewing all 31)
  const completion = createCompletionSystem(container);

  // Create postcards system (Shift+C to create postcard when viewing)
  const postcards = createPostcardSystem(container);
  postcards.onSave = (dataUrl: string) => {
    const link = document.createElement('a');
    link.download = `genuary-2026-postcard.png`;
    link.href = dataUrl;
    link.click();
    showNotification('Postcard saved!');
  };

  // Create landmarks system (Shift+L to toggle)
  const landmarks = createLandmarkSystem(container);

  // Create footsteps sound system
  const footsteps = createFootstepSystem();

  // REMOVED: Speed run challenge (gamification)
  // const speedrun = createSpeedRunSystem(container);

  // Create visitor journal system (Ctrl+J to write, Shift+J to browse)
  const journal = createJournalSystem(container);

  // Create mood filter system (Shift+M to change atmosphere)
  const mood = createMoodSystem(container, scene.scene);

  // REMOVED: Quiz system (gamification)
  // const quiz = createQuizSystem(container);

  // REMOVED: Scavenger hunt (gamification)
  // const scavenger = createScavengerSystem(container);

  // Create viewing history system (Shift+Y to view history)
  const history = createHistorySystem(container);

  // REMOVED: Daily challenge (gamification)
  // const dailyChallenge = createChallengeSystem(container);

  // Create exhibit comparator (Shift+X to compare)
  const comparator = createComparatorSystem(container);

  // Create social share system (Shift+S when viewing exhibit)
  const social = createSocialSystem(container);

  // Create bookmarks system (Shift+B to view, Ctrl+B to save)
  const bookmarks = createBookmarksSystem(container);

  // Create focus mode system (Shift+F to toggle)
  const focus = createFocusSystem(container);

  // REMOVED: Visitor counter (social proof gamification)
  // const visitors = createVisitorSystem(container);

  // Create sound mixer system (Shift+A to open)
  const soundMixer = createSoundMixerSystem(container);

  // Create quick menu system (Shift+Space to open, right-click)
  const quickMenu = createQuickMenuSystem(container);

  // Wire up quick menu actions
  quickMenu.onAction = (actionId: string) => {
    switch (actionId) {
      case 'screenshot':
        playCameraShutter();
        takeScreenshot(scene.renderer.domElement, photoGallery, interaction.currentDayNumber);
        recordScreenshot(stats);
        recordSessionScreenshot(sessionSummary);
        break;
      case 'favorite':
        if (interaction.currentDayNumber > 0) {
          interaction.onFavoriteToggle?.(interaction.currentDayNumber);
        } else {
          showNotification('View an exhibit first to favorite it');
        }
        break;
      case 'bookmark':
        addBookmark(bookmarks, scene.camera, interaction.currentDayNumber || null);
        showNotification('Bookmark saved!');
        break;
      case 'share':
        if (interaction.currentDayNumber > 0) {
          openSharePopup(social, scene.renderer.domElement, {
            dayNumber: interaction.currentDayNumber,
            promptTitle: '',
            exhibitsViewed: sessionSummary.exhibitsViewed.size,
            favoritesCount: getFavorites(favorites).length,
            timeSpent: stats.stats.totalTimeSpent,
          });
        } else {
          shareView(scene.camera);
          recordSharedView(stats);
        }
        break;
      case 'journal':
        if (interaction.currentDayNumber > 0) {
          openJournalEntry(journal, interaction.currentDayNumber);
        } else {
          showNotification('View an exhibit first to write in your journal');
        }
        break;
      case 'tour':
        if (!interaction.isZoomed) {
          const wasActive = tour.isActive;
          toggleTour(tour);
          if (!wasActive && tour.isActive) {
            recordTourStarted(stats);
          }
        }
        break;
      case 'help':
        toggleHelp(help);
        break;
      case 'focus':
        toggleFocusMode(focus);
        break;
    }
  };

  // Create related exhibits system (shows when viewing)
  const related = createRelatedSystem(container);

  // Wire up related navigation
  related.onNavigate = (dayNumber: number) => {
    const mesh = interaction.exhibitMeshes.find(m => m.userData.dayNumber === dayNumber);
    if (mesh) {
      const meshIndex = interaction.exhibitMeshes.indexOf(mesh);
      interaction.currentExhibitIndex = meshIndex;

      if (!interaction.isZoomed) {
        interaction.originalPosition.copy(scene.camera.position);
        interaction.originalQuaternion.copy(scene.camera.quaternion);
      }

      const worldPos = new THREE.Vector3();
      mesh.getWorldPosition(worldPos);
      const normal = new THREE.Vector3(0, 0, 1);
      if (mesh.parent) {
        normal.applyQuaternion(mesh.parent.quaternion);
      }

      interaction.zoomTarget.copy(worldPos).addScaledVector(normal, 1.2);
      interaction.zoomTarget.y = scene.camera.position.y;
      interaction.zoomLookAt.copy(worldPos);
      interaction.zoomLookAt.y = scene.camera.position.y;

      interaction.isZoomed = true;
      interaction.animating = true;
      interaction.zoomProgress = 0;
      interaction.currentDayNumber = dayNumber;
      interaction.onExhibitViewed?.(dayNumber);
      interaction.onZoomIn?.(dayNumber);
    }
  };

  // Create weather effects system (Shift+W to cycle)
  const weather = createWeatherSystem(container);

  // Create exhibit timer system (Shift+T to view insights)
  const exhibitTimer = createTimerSystem(container);

  // Create music player system (Shift+M to toggle, Shift+[/] to change tracks)
  const musicPlayer = createMusicPlayerSystem(container);

  // Create gift shop system (Shift+G to view collection)
  const giftShop = createGiftShopSystem(container);

  // Create meditation system (Shift+Z for zen mode)
  const meditation = createMeditationSystem(container);

  // Create hot spots indicator (shows trending exhibits)
  const hotSpots = createHotSpotsSystem(container);

  // Create visitor profile system (Ctrl+Shift+P to open)
  const visitorProfile = createProfileSystem(container);

  // Create time capsule system (Shift+K to view, Ctrl+K to create)
  const timeCapsule = createTimeCapsuleSystem(container);

  // Wire up time capsule navigation
  timeCapsule.onNavigate = (capsule: Capsule) => {
    scene.camera.position.set(capsule.position.x, capsule.position.y, capsule.position.z);
    navigation.euler.set(capsule.rotation.x, capsule.rotation.y, capsule.rotation.z, 'YXZ');
    scene.camera.quaternion.setFromEuler(navigation.euler);
    showNotification(`Returned to Day ${capsule.dayNumber} memory`);
  };

  // Create art styles guide system (E key when viewing)
  const artStyles = createArtStylesSystem(container);

  // Create annotations system (Shift+N to add annotations)
  const annotations = createAnnotationsSystem(container);

  // Create daily quote system (inspirational quotes)
  const dailyQuote = createDailyQuoteSystem(container);

  // Create reactions system (R key when viewing)
  const reactions = createReactionsSystem(container);

  // Create color palette system (K key when viewing)
  const palette = createPaletteSystem(container);

  // Create floor plan system (O key to toggle)
  const floorPlan = createFloorPlanSystem(container);

  // Create night mode system (Shift+D to toggle)
  const nightMode = createNightModeSystem(container);

  // Create exhibit labels system (Shift+L to toggle)
  const exhibitLabels = createLabelsSystem(container);
  registerExhibitsForLabels(exhibitLabels, interaction.exhibitMeshes);

  // Create visitor trail system (Shift+T to toggle)
  const visitorTrail = createTrailSystem(scene.scene);

  // Create audio guide system (Shift+A to toggle)
  const audioGuide = createAudioGuideSystem(container);

  // Create photo filters system
  const photoFilters = createPhotoFiltersSystem(container);

  // REMOVED: Virtual presence (social proof gamification)
  // const virtualPresence = createPresenceSystem(container);

  // Create visit log system (L key to view session activity)
  const visitLog = createVisitLogSystem(container);

  // Create random walk system (R key to jump to random exhibit)
  const randomWalk = createRandomWalkSystem(container);

  // Wire up random walk navigation
  randomWalk.onRandomSelect = (dayNumber: number) => {
    const mesh = interaction.exhibitMeshes.find(m => m.userData.dayNumber === dayNumber);
    if (mesh) {
      const meshIndex = interaction.exhibitMeshes.indexOf(mesh);
      interaction.currentExhibitIndex = meshIndex;

      if (!interaction.isZoomed) {
        interaction.originalPosition.copy(scene.camera.position);
        interaction.originalQuaternion.copy(scene.camera.quaternion);
      }

      const worldPos = new THREE.Vector3();
      mesh.getWorldPosition(worldPos);
      const normal = new THREE.Vector3(0, 0, 1);
      if (mesh.parent) {
        normal.applyQuaternion(mesh.parent.quaternion);
      }

      interaction.zoomTarget.copy(worldPos).addScaledVector(normal, 1.2);
      interaction.zoomTarget.y = scene.camera.position.y;
      interaction.zoomLookAt.copy(worldPos);
      interaction.zoomLookAt.y = scene.camera.position.y;

      interaction.isZoomed = true;
      interaction.animating = true;
      interaction.zoomProgress = 0;
      interaction.currentDayNumber = dayNumber;
      interaction.onExhibitViewed?.(dayNumber);
      interaction.onZoomIn?.(dayNumber);

      showNotification(`🎲 Random jump to Day ${dayNumber}!`);
    }
  };

  // Create share card system (generates social share cards)
  const shareCard = createShareCardSystem(container);

  // REMOVED: Streaks system (gamification)
  // const streaks = createStreaksSystem(container);

  // Create ambient presets system (A key to change ambient lighting)
  const ambientPresets = createAmbientPresetsSystem(container);

  // Wire up ambient presets to apply filter to canvas
  ambientPresets.onPresetChange = (preset) => {
    scene.renderer.domElement.style.filter = preset.filter;
    showNotification(`Ambient: ${preset.name}`);
  };

  // Create wish list system (W key when viewing to add, Shift+W to view list)
  const wishList = createWishListSystem(container);

  // Wire up wish list navigation
  wishList.onNavigate = (dayNumber: number) => {
    const mesh = interaction.exhibitMeshes.find(m => m.userData.dayNumber === dayNumber);
    if (mesh) {
      const meshIndex = interaction.exhibitMeshes.indexOf(mesh);
      interaction.currentExhibitIndex = meshIndex;

      if (!interaction.isZoomed) {
        interaction.originalPosition.copy(scene.camera.position);
        interaction.originalQuaternion.copy(scene.camera.quaternion);
      }

      const worldPos = new THREE.Vector3();
      mesh.getWorldPosition(worldPos);
      const normal = new THREE.Vector3(0, 0, 1);
      if (mesh.parent) {
        normal.applyQuaternion(mesh.parent.quaternion);
      }

      interaction.zoomTarget.copy(worldPos).addScaledVector(normal, 1.2);
      interaction.zoomTarget.y = scene.camera.position.y;
      interaction.zoomLookAt.copy(worldPos);
      interaction.zoomLookAt.y = scene.camera.position.y;

      interaction.isZoomed = true;
      interaction.animating = true;
      interaction.zoomProgress = 0;
      interaction.currentDayNumber = dayNumber;
      interaction.onExhibitViewed?.(dayNumber);
      interaction.onZoomIn?.(dayNumber);
    }
  };

  // Create heatmap system (Shift+H to view engagement heatmap)
  const heatmap = createHeatmapSystem(container);

  // Create time warp system (T key to change animation speed)
  const timeWarp = createTimeWarpSystem(container);

  // Create comments system (C key when viewing to add personal notes)
  const exhibitComments = createCommentsSystem(container);

  // Create tags system (G key when viewing to add tags, Shift+G to browse)
  const exhibitTags = createTagsSystem(container);

  // Wire up tags navigation
  exhibitTags.onNavigate = (dayNumber: number) => {
    const mesh = interaction.exhibitMeshes.find(m => m.userData.dayNumber === dayNumber);
    if (mesh) {
      const meshIndex = interaction.exhibitMeshes.indexOf(mesh);
      interaction.currentExhibitIndex = meshIndex;

      if (!interaction.isZoomed) {
        interaction.originalPosition.copy(scene.camera.position);
        interaction.originalQuaternion.copy(scene.camera.quaternion);
      }

      const worldPos = new THREE.Vector3();
      mesh.getWorldPosition(worldPos);
      const normal = new THREE.Vector3(0, 0, 1);
      if (mesh.parent) {
        normal.applyQuaternion(mesh.parent.quaternion);
      }

      interaction.zoomTarget.copy(worldPos).addScaledVector(normal, 1.2);
      interaction.zoomTarget.y = scene.camera.position.y;
      interaction.zoomLookAt.copy(worldPos);
      interaction.zoomLookAt.y = scene.camera.position.y;

      interaction.isZoomed = true;
      interaction.animating = true;
      interaction.zoomProgress = 0;
      interaction.currentDayNumber = dayNumber;
      interaction.onExhibitViewed?.(dayNumber);
      interaction.onZoomIn?.(dayNumber);
    }
  };

  // Create memory lane system (M key to view memories)
  const memoryLane = createMemoryLaneSystem(container);

  // Wire up memory lane navigation
  memoryLane.onNavigate = (dayNumber: number) => {
    const mesh = interaction.exhibitMeshes.find(m => m.userData.dayNumber === dayNumber);
    if (mesh) {
      const meshIndex = interaction.exhibitMeshes.indexOf(mesh);
      interaction.currentExhibitIndex = meshIndex;

      if (!interaction.isZoomed) {
        interaction.originalPosition.copy(scene.camera.position);
        interaction.originalQuaternion.copy(scene.camera.quaternion);
      }

      const worldPos = new THREE.Vector3();
      mesh.getWorldPosition(worldPos);
      const normal = new THREE.Vector3(0, 0, 1);
      if (mesh.parent) {
        normal.applyQuaternion(mesh.parent.quaternion);
      }

      interaction.zoomTarget.copy(worldPos).addScaledVector(normal, 1.2);
      interaction.zoomTarget.y = scene.camera.position.y;
      interaction.zoomLookAt.copy(worldPos);
      interaction.zoomLookAt.y = scene.camera.position.y;

      interaction.isZoomed = true;
      interaction.animating = true;
      interaction.zoomProgress = 0;
      interaction.currentDayNumber = dayNumber;
      interaction.onExhibitViewed?.(dayNumber);
      interaction.onZoomIn?.(dayNumber);
    }
  };

  // Create milestones system (Shift+M to view progress)
  const milestones = createMilestonesSystem(container);

  // Wire up milestone notifications
  milestones.onMilestoneUnlocked = (milestone) => {
    showMilestoneNotification(container, milestone);
  };

  // Create photo frame system (F key when viewing screenshot)
  const photoFrame = createPhotoFrameSystem(container);

  // Create visitor insights system (I key to view analytics)
  const visitorInsights = createInsightsSystem(container);

  // Create soundscape system (backslash key to cycle)
  const soundscape = createSoundscapeSystem(container);

  // Create trivia system (? key to show random trivia)
  const trivia = createTriviaSystem(container);

  // Create waypoints system (P key to open waypoints panel)
  const waypoints = createWaypointsSystem(container);

  // Wire up waypoint teleportation
  waypoints.onTeleport = (waypoint) => {
    scene.camera.position.set(waypoint.position.x, waypoint.position.y, waypoint.position.z);
    navigation.euler.set(waypoint.rotation.x, waypoint.rotation.y, waypoint.rotation.z, 'YXZ');
    scene.camera.quaternion.setFromEuler(navigation.euler);
    showNotification(`Teleported to ${waypoint.name}`);
  };

  // Create zoom system (scroll wheel and +/- keys)
  const cameraZoom = createZoomSystem(container);

  // Create playlist system (Shift+P to open)
  const exhibitPlaylist = createPlaylistSystem(container);

  // Create curator system (G key for commentary)
  const virtualCurator = createCuratorSystem(container);

  // Create atmospherics system (particle effects)
  const atmospherics = createAtmosphericsSystem(container);

  // Create comparisons system (side-by-side view)
  const comparisons = createComparisonSystem(container);

  // Create timeline system (visit history visualization)
  const visitTimeline = createTimelineSystem(container);

  // Create themes system (UI customization)
  const uiThemes = createThemesSystem(container);

  // REMOVED: Badges system (gamification)
  // const visitorBadges = createBadgesSystem(container);

  // REMOVED: Leaderboard system (gamification)
  // const leaderboard = createLeaderboardSystem(container);

  // Create tutorials system (guided tours for new users)
  const tutorials = createTutorialsSystem(container);

  // Create exhibitions system (themed collections)
  const exhibitions = createExhibitionsSystem(container);

  // Create recommendations system (personalized suggestions)
  const personalRecs = createRecommendationsSystem(container);

  // Wire up playlist navigation
  exhibitPlaylist.onNavigate = (dayNumber: number) => {
    const mesh = interaction.exhibitMeshes.find(m => m.userData.dayNumber === dayNumber);
    if (mesh) {
      const meshIndex = interaction.exhibitMeshes.indexOf(mesh);
      interaction.currentExhibitIndex = meshIndex;

      if (!interaction.isZoomed) {
        interaction.originalPosition.copy(scene.camera.position);
        interaction.originalQuaternion.copy(scene.camera.quaternion);
      }

      const worldPos = new THREE.Vector3();
      mesh.getWorldPosition(worldPos);
      const normal = new THREE.Vector3(0, 0, 1);
      if (mesh.parent) {
        normal.applyQuaternion(mesh.parent.quaternion);
      }

      interaction.zoomTarget.copy(worldPos).addScaledVector(normal, 1.2);
      interaction.zoomTarget.y = scene.camera.position.y;
      interaction.zoomLookAt.copy(worldPos);
      interaction.zoomLookAt.y = scene.camera.position.y;

      interaction.isZoomed = true;
      interaction.animating = true;
      interaction.zoomProgress = 0;
      interaction.currentDayNumber = dayNumber;
      interaction.onExhibitViewed?.(dayNumber);
      interaction.onZoomIn?.(dayNumber);
    }
  };

  // Wire up floor plan navigation
  floorPlan.onNavigate = (dayNumber: number) => {
    const mesh = interaction.exhibitMeshes.find(m => m.userData.dayNumber === dayNumber);
    if (mesh) {
      const meshIndex = interaction.exhibitMeshes.indexOf(mesh);
      interaction.currentExhibitIndex = meshIndex;

      if (!interaction.isZoomed) {
        interaction.originalPosition.copy(scene.camera.position);
        interaction.originalQuaternion.copy(scene.camera.quaternion);
      }

      const worldPos = new THREE.Vector3();
      mesh.getWorldPosition(worldPos);
      const normal = new THREE.Vector3(0, 0, 1);
      if (mesh.parent) {
        normal.applyQuaternion(mesh.parent.quaternion);
      }

      interaction.zoomTarget.copy(worldPos).addScaledVector(normal, 1.2);
      interaction.zoomTarget.y = scene.camera.position.y;
      interaction.zoomLookAt.copy(worldPos);
      interaction.zoomLookAt.y = scene.camera.position.y;

      interaction.isZoomed = true;
      interaction.animating = true;
      interaction.zoomProgress = 0;
      interaction.currentDayNumber = dayNumber;
      interaction.onExhibitViewed?.(dayNumber);
      interaction.onZoomIn?.(dayNumber);
    }
  };

  // Wire up bookmark navigation
  bookmarks.onNavigate = (bookmark: Bookmark) => {
    scene.camera.position.set(bookmark.position.x, bookmark.position.y, bookmark.position.z);
    navigation.euler.set(bookmark.rotation.x, bookmark.rotation.y, bookmark.rotation.z, 'YXZ');
    scene.camera.quaternion.setFromEuler(navigation.euler);
    showNotification(`Jumped to "${bookmark.name}"`);
  };

  // Wire up history navigation
  history.onNavigate = (dayNumber: number) => {
    const mesh = interaction.exhibitMeshes.find(m => m.userData.dayNumber === dayNumber);
    if (mesh) {
      const meshIndex = interaction.exhibitMeshes.indexOf(mesh);
      interaction.currentExhibitIndex = meshIndex;

      if (!interaction.isZoomed) {
        interaction.originalPosition.copy(scene.camera.position);
        interaction.originalQuaternion.copy(scene.camera.quaternion);
      }

      const worldPos = new THREE.Vector3();
      mesh.getWorldPosition(worldPos);
      const normal = new THREE.Vector3(0, 0, 1);
      if (mesh.parent) {
        normal.applyQuaternion(mesh.parent.quaternion);
      }

      interaction.zoomTarget.copy(worldPos).addScaledVector(normal, 1.2);
      interaction.zoomTarget.y = scene.camera.position.y;
      interaction.zoomLookAt.copy(worldPos);
      interaction.zoomLookAt.y = scene.camera.position.y;

      interaction.isZoomed = true;
      interaction.animating = true;
      interaction.zoomProgress = 0;
      interaction.currentDayNumber = dayNumber;
      interaction.onExhibitViewed?.(dayNumber);
      interaction.onZoomIn?.(dayNumber);
    }
  };

  // Wire up curator tour navigation
  virtualCurator.onNavigate = (dayNumber: number) => {
    const mesh = interaction.exhibitMeshes.find(m => m.userData.dayNumber === dayNumber);
    if (mesh) {
      const meshIndex = interaction.exhibitMeshes.indexOf(mesh);
      interaction.currentExhibitIndex = meshIndex;

      if (!interaction.isZoomed) {
        interaction.originalPosition.copy(scene.camera.position);
        interaction.originalQuaternion.copy(scene.camera.quaternion);
      }

      const worldPos = new THREE.Vector3();
      mesh.getWorldPosition(worldPos);
      const normal = new THREE.Vector3(0, 0, 1);
      if (mesh.parent) {
        normal.applyQuaternion(mesh.parent.quaternion);
      }

      interaction.zoomTarget.copy(worldPos).addScaledVector(normal, 1.2);
      interaction.zoomTarget.y = scene.camera.position.y;
      interaction.zoomLookAt.copy(worldPos);
      interaction.zoomLookAt.y = scene.camera.position.y;

      interaction.isZoomed = true;
      interaction.animating = true;
      interaction.zoomProgress = 0;
      interaction.currentDayNumber = dayNumber;
      interaction.onExhibitViewed?.(dayNumber);
      interaction.onZoomIn?.(dayNumber);
    }
  };

  // Wire up comparisons navigation
  comparisons.onNavigate = (dayNumber: number) => {
    const mesh = interaction.exhibitMeshes.find(m => m.userData.dayNumber === dayNumber);
    if (mesh) {
      const meshIndex = interaction.exhibitMeshes.indexOf(mesh);
      interaction.currentExhibitIndex = meshIndex;

      if (!interaction.isZoomed) {
        interaction.originalPosition.copy(scene.camera.position);
        interaction.originalQuaternion.copy(scene.camera.quaternion);
      }

      const worldPos = new THREE.Vector3();
      mesh.getWorldPosition(worldPos);
      const normal = new THREE.Vector3(0, 0, 1);
      if (mesh.parent) {
        normal.applyQuaternion(mesh.parent.quaternion);
      }

      interaction.zoomTarget.copy(worldPos).addScaledVector(normal, 1.2);
      interaction.zoomTarget.y = scene.camera.position.y;
      interaction.zoomLookAt.copy(worldPos);
      interaction.zoomLookAt.y = scene.camera.position.y;

      interaction.isZoomed = true;
      interaction.animating = true;
      interaction.zoomProgress = 0;
      interaction.currentDayNumber = dayNumber;
      interaction.onExhibitViewed?.(dayNumber);
      interaction.onZoomIn?.(dayNumber);
    }
  };

  // Wire up timeline navigation
  visitTimeline.onNavigate = (dayNumber: number) => {
    const mesh = interaction.exhibitMeshes.find(m => m.userData.dayNumber === dayNumber);
    if (mesh) {
      const meshIndex = interaction.exhibitMeshes.indexOf(mesh);
      interaction.currentExhibitIndex = meshIndex;

      if (!interaction.isZoomed) {
        interaction.originalPosition.copy(scene.camera.position);
        interaction.originalQuaternion.copy(scene.camera.quaternion);
      }

      const worldPos = new THREE.Vector3();
      mesh.getWorldPosition(worldPos);
      const normal = new THREE.Vector3(0, 0, 1);
      if (mesh.parent) {
        normal.applyQuaternion(mesh.parent.quaternion);
      }

      interaction.zoomTarget.copy(worldPos).addScaledVector(normal, 1.2);
      interaction.zoomTarget.y = scene.camera.position.y;
      interaction.zoomLookAt.copy(worldPos);
      interaction.zoomLookAt.y = scene.camera.position.y;

      interaction.isZoomed = true;
      interaction.animating = true;
      interaction.zoomProgress = 0;
      interaction.currentDayNumber = dayNumber;
      interaction.onExhibitViewed?.(dayNumber);
      interaction.onZoomIn?.(dayNumber);
    }
  };

  // Wire up search to zoom to exhibits
  search.onSelect = (dayNumber: number) => {
    // Find the exhibit mesh for this day
    const mesh = interaction.exhibitMeshes.find(
      m => m.userData.dayNumber === dayNumber
    );
    if (mesh) {
      const meshIndex = interaction.exhibitMeshes.indexOf(mesh);
      interaction.currentExhibitIndex = meshIndex;

      // Store original position if not already zoomed
      if (!interaction.isZoomed) {
        interaction.originalPosition.copy(scene.camera.position);
        interaction.originalQuaternion.copy(scene.camera.quaternion);
      }

      // Get world position and normal
      const worldPos = new THREE.Vector3();
      mesh.getWorldPosition(worldPos);
      const normal = new THREE.Vector3(0, 0, 1);
      if (mesh.parent) {
        normal.applyQuaternion(mesh.parent.quaternion);
      }

      // Set zoom target
      interaction.zoomTarget.copy(worldPos).addScaledVector(normal, 1.2);
      interaction.zoomTarget.y = scene.camera.position.y;
      interaction.zoomLookAt.copy(worldPos);
      interaction.zoomLookAt.y = scene.camera.position.y;

      interaction.isZoomed = true;
      interaction.animating = true;
      interaction.zoomProgress = 0;
      interaction.currentDayNumber = dayNumber;
      interaction.onExhibitViewed?.(dayNumber);
      interaction.onZoomIn?.(dayNumber);
    }
  };

  // Wire up breadcrumb navigation to zoom to exhibits
  breadcrumbs.onNavigate = (dayNumber: number) => {
    // Find the exhibit mesh for this day
    const mesh = interaction.exhibitMeshes.find(
      m => m.userData.dayNumber === dayNumber
    );
    if (mesh) {
      const meshIndex = interaction.exhibitMeshes.indexOf(mesh);
      interaction.currentExhibitIndex = meshIndex;

      // Store original position if not already zoomed
      if (!interaction.isZoomed) {
        interaction.originalPosition.copy(scene.camera.position);
        interaction.originalQuaternion.copy(scene.camera.quaternion);
      }

      // Get world position and normal
      const worldPos = new THREE.Vector3();
      mesh.getWorldPosition(worldPos);
      const normal = new THREE.Vector3(0, 0, 1);
      if (mesh.parent) {
        normal.applyQuaternion(mesh.parent.quaternion);
      }

      // Set zoom target
      interaction.zoomTarget.copy(worldPos).addScaledVector(normal, 1.2);
      interaction.zoomTarget.y = scene.camera.position.y;
      interaction.zoomLookAt.copy(worldPos);
      interaction.zoomLookAt.y = scene.camera.position.y;

      interaction.isZoomed = true;
      interaction.animating = true;
      interaction.zoomProgress = 0;
      interaction.currentDayNumber = dayNumber;
      interaction.onExhibitViewed?.(dayNumber);
      interaction.onZoomIn?.(dayNumber);
    }
  };

  // Wire up zoom callbacks for exhibit info panel and spotlight
  interaction.onZoomIn = (dayNumber: number) => {
    showExhibitInfo(exhibitInfo, dayNumber);
    addBreadcrumb(breadcrumbs, dayNumber);
    playZoomIn();
    recordHistoryView(history, dayNumber);
    startViewing(exhibitTimer, dayNumber);
    showAnnotations(annotations, dayNumber);

    // Show related exhibits after a short delay
    setTimeout(() => showRelated(related, dayNumber), 1500);

    // Start audio guide narration after a brief pause
    setTimeout(() => speakNarration(audioGuide, dayNumber), 2000);

    // Activate spotlight on the exhibit
    const exhibitMesh = interaction.exhibitMeshes.find(m => m.userData.dayNumber === dayNumber);
    if (exhibitMesh) {
      const exhibitPos = new THREE.Vector3();
      exhibitMesh.getWorldPosition(exhibitPos);
      activateSpotlight(spotlight, exhibitPos, scene.camera.position);
    }
  };

  interaction.onZoomOut = () => {
    hideExhibitInfo(exhibitInfo);
    playZoomOut();
    deactivateSpotlight(spotlight);
    recordHistoryExit(history);
    hideRelated(related);
    stopNarration(audioGuide);
    endViewing(exhibitTimer);
    hideAnnotations(annotations);
    closeStyleGuide(artStyles);
    hideReactionsPanel(reactions);
    closePalette(palette);
  };

  // Override onExhibitViewed to also check speed run and track session
  const originalOnExhibitViewed = interaction.onExhibitViewed;
  interaction.onExhibitViewed = (dayNumber: number) => {
    originalOnExhibitViewed?.(dayNumber);
    // Check for speed run after each exhibit view
    if (checkSpeedRun(stats)) {
      unlockAchievement(achievements, 'speed-run');
    }
    // Track in session summary
    recordSessionExhibit(sessionSummary, dayNumber);
    // REMOVED: Speed run tracking (gamification)
    // recordSpeedRunExhibit(speedrun, dayNumber);
    // REMOVED: Scavenger hunt tracking (gamification)
    // checkScavengerProgress(scavenger, dayNumber);
    // REMOVED: Record simulated view (gamification)
    // recordDayView(visitors, dayNumber);
    recordHotSpotView(hotSpots, dayNumber);

    // Check for curator notes
    const exhibitMesh = interaction.exhibitMeshes.find(m => m.userData.dayNumber === dayNumber);
    if (exhibitMesh) {
      const meshPos = new THREE.Vector3();
      exhibitMesh.getWorldPosition(meshPos);
      const noteContext: NoteContext = {
        currentDay: dayNumber,
        currentWing: getWingFromPosition(meshPos.z, meshPos.x),
        exhibitsViewed: sessionSummary.exhibitsViewed,
        isFirstVisit: stats.stats.sessionCount === 1,
      };
      // Delay note check to let other UI settle
      setTimeout(() => checkCuratorNotes(curatorNotes, noteContext), 1500);
    }

    // Check for completion
    checkCompletion(completion, sessionSummary.exhibitsViewed);
  };

  // Override onFavoriteToggle to track favorites in session summary
  const originalOnFavoriteToggle = interaction.onFavoriteToggle;
  interaction.onFavoriteToggle = (dayNumber: number) => {
    const wasFavorite = isFavorite(favorites, dayNumber);
    originalOnFavoriteToggle?.(dayNumber);
    // Track new favorites in session summary
    if (!wasFavorite) {
      recordSessionFavorite(sessionSummary);
    }
  };

  updateLoadingProgress(80, 'Preparing gallery...');

  // Show help overlay and location indicator (skip on touch devices - they get their own help)
  if (!isTouchDevice()) {
    createHelpOverlay(container);
  }
  createLocationIndicator(container);
  updateLoadingProgress(100, 'Welcome!');

  // Initialize audio on first user interaction (browser autoplay policy)
  const startAudioOnInteraction = () => {
    initAudio();
    startAmbient();
    initFootstepAudio(footsteps);
    initMixerAudio(soundMixer);
    // Remove listeners after first interaction
    document.removeEventListener('click', startAudioOnInteraction);
    document.removeEventListener('keydown', startAudioOnInteraction);
  };
  document.addEventListener('click', startAudioOnInteraction, { once: true });
  document.addEventListener('keydown', startAudioOnInteraction, { once: true });

  // Help toggle with H key
  const helpToggleHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyH') {
      toggleHelpOverlay(container);
    }
  };
  document.addEventListener('keydown', helpToggleHandler);

  // Tour toggle with T key
  const tourToggleHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyT' && !interaction.isZoomed) {
      const wasActive = tour.isActive;
      toggleTour(tour);
      // Record stat if starting a new tour
      if (!wasActive && tour.isActive) {
        recordTourStarted(stats);
      }
    }
  };
  document.addEventListener('keydown', tourToggleHandler);

  // Quick return to gallery center with Q key
  const galleryReturnHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyQ' && !interaction.isZoomed) {
      // Gallery center position
      scene.camera.position.set(0, 1.6, -32);
      navigation.euler.set(0, 0, 0, 'YXZ');
      scene.camera.quaternion.setFromEuler(navigation.euler);
      playTeleport();
      showNotification('Returned to gallery center');
    }
  };
  document.addEventListener('keydown', galleryReturnHandler);

  // Screenshot with P key, Photo mode with Shift+P, Photo booth with Ctrl+P when viewing exhibit
  const screenshotHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyP') {
      if (event.ctrlKey && interaction.currentDayNumber > 0) {
        // Open photo booth when viewing an exhibit
        event.preventDefault();
        openPhotoBooth(photoBooth, scene.renderer.domElement, interaction.currentDayNumber);
      } else if (event.shiftKey) {
        togglePhotoMode(container);
      } else {
        playCameraShutter();
        takeScreenshot(scene.renderer.domElement, photoGallery, interaction.currentDayNumber);
        recordScreenshot(stats);
        recordSessionScreenshot(sessionSummary);
      }
    }
  };
  document.addEventListener('keydown', screenshotHandler);

  // Share view with S key
  const shareHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyS' && !interaction.isZoomed) {
      shareView(scene.camera);
      recordSharedView(stats);
    }
  };
  document.addEventListener('keydown', shareHandler);

  // Stats with I key (I for Info)
  const statsHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyI' && !interaction.isZoomed) {
      showStatsPopup(stats, container);
    }
  };
  document.addEventListener('keydown', statsHandler);

  // Achievements with A key
  const achievementsHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyA' && !interaction.isZoomed) {
      showAchievementsPopup(achievements, container);
    }
  };
  document.addEventListener('keydown', achievementsHandler);

  // Quick facts with F key (F for Fun Fact)
  const quickFactsHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyF' && !event.ctrlKey && !event.metaKey) {
      const dayNumber = interaction.currentDayNumber;
      if (dayNumber > 0) {
        // Get screen center for tooltip position
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2 - 100;
        showQuickFact(quickFacts, dayNumber, centerX, centerY);
        // Auto-hide after 4 seconds
        setTimeout(() => hideQuickFact(quickFacts), 4000);
      }
    }
  };
  document.addEventListener('keydown', quickFactsHandler);

  // Postcards with Shift+C (only when viewing an exhibit)
  const postcardHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyC' && event.shiftKey && interaction.currentDayNumber > 0) {
      event.preventDefault();
      openPostcardCreator(postcards, scene.renderer.domElement, interaction.currentDayNumber);
    }
  };
  document.addEventListener('keydown', postcardHandler);

  // Journal entry with Ctrl+J (only when viewing an exhibit)
  const journalHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyJ' && event.ctrlKey && interaction.currentDayNumber > 0) {
      event.preventDefault();
      openJournalEntry(journal, interaction.currentDayNumber);
    }
  };
  document.addEventListener('keydown', journalHandler);

  // Enhanced social share with Shift+S (only when viewing an exhibit)
  const socialShareHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyS' && event.shiftKey && interaction.currentDayNumber > 0) {
      event.preventDefault();
      openSharePopup(social, scene.renderer.domElement, {
        dayNumber: interaction.currentDayNumber,
        promptTitle: '', // Will use built-in lookup
        exhibitsViewed: sessionSummary.exhibitsViewed.size,
        favoritesCount: getFavorites(favorites).length,
        timeSpent: stats.stats.totalTimeSpent,
      });
    }
  };
  document.addEventListener('keydown', socialShareHandler);

  // Save bookmark with Ctrl+B
  const bookmarkSaveHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyB' && event.ctrlKey) {
      event.preventDefault();
      addBookmark(bookmarks, scene.camera, interaction.currentDayNumber || null);
      showNotification('Bookmark saved!');
    }
  };
  document.addEventListener('keydown', bookmarkSaveHandler);

  // Rate exhibits with +/- keys (only when zoomed)
  const ratingHandler = (event: KeyboardEvent) => {
    if (!interaction.isZoomed || interaction.currentDayNumber < 1) return;

    const dayNumber = interaction.currentDayNumber;
    let newRating: 'up' | 'down' | null = null;

    if (event.code === 'Equal' || event.code === 'NumpadAdd') {
      // + key for thumbs up
      newRating = rateExhibit(ratings, dayNumber, 'up');
      if (newRating === 'up') {
        showNotification(`👍 Liked Day ${dayNumber}!`);
      } else {
        showNotification(`Removed like from Day ${dayNumber}`);
      }
    } else if (event.code === 'Minus' || event.code === 'NumpadSubtract') {
      // - key for thumbs down
      newRating = rateExhibit(ratings, dayNumber, 'down');
      if (newRating === 'down') {
        showNotification(`👎 Disliked Day ${dayNumber}`);
      } else {
        showNotification(`Removed dislike from Day ${dayNumber}`);
      }
    }
  };
  document.addEventListener('keydown', ratingHandler);

  // Gift shop add item with * key (when viewing exhibit)
  const giftShopAddHandler = (event: KeyboardEvent) => {
    if (!interaction.isZoomed || interaction.currentDayNumber < 1) return;

    if (event.code === 'Digit8' && event.shiftKey) {
      // Shift+8 = * for gift shop
      event.preventDefault();
      showAddItemMenu(giftShop, interaction.currentDayNumber, window.innerWidth / 2, window.innerHeight / 2);
    }
  };
  document.addEventListener('keydown', giftShopAddHandler);

  // Time capsule create with Ctrl+K (when viewing exhibit)
  const timeCapsuleCreateHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyK' && event.ctrlKey && interaction.currentDayNumber > 0) {
      event.preventDefault();
      const pos = scene.camera.position;
      const euler = navigation.euler;
      openCreateCapsule(
        timeCapsule,
        interaction.currentDayNumber,
        { x: pos.x, y: pos.y, z: pos.z },
        { x: euler.x, y: euler.y, z: euler.z }
      );
    }
  };
  document.addEventListener('keydown', timeCapsuleCreateHandler);

  // Art style guide with E key (when viewing exhibit)
  const artStylesHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyE' && !event.shiftKey && !event.ctrlKey) {
      if (interaction.currentDayNumber > 0) {
        event.preventDefault();
        if (artStyles.isOpen) {
          closeStyleGuide(artStyles);
        } else {
          showStyleGuide(artStyles, interaction.currentDayNumber);
        }
      }
    }
  };
  document.addEventListener('keydown', artStylesHandler);

  // Annotations with Shift+N (when viewing exhibit)
  const annotationsHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyN' && event.shiftKey && !event.ctrlKey) {
      if (interaction.currentDayNumber > 0) {
        event.preventDefault();
        enterAddMode(annotations, interaction.currentDayNumber);
      }
    }
  };
  document.addEventListener('keydown', annotationsHandler);

  // Reactions with Shift+R (when viewing exhibit)
  const reactionsHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyR' && event.shiftKey && !event.ctrlKey) {
      if (interaction.currentDayNumber > 0) {
        event.preventDefault();
        if (reactions.currentDay === interaction.currentDayNumber) {
          hideReactionsPanel(reactions);
        } else {
          showReactionsPanel(reactions, interaction.currentDayNumber);
        }
      }
    }
  };
  document.addEventListener('keydown', reactionsHandler);

  // Color palette with K key (when viewing exhibit)
  const paletteHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyK' && !event.shiftKey && !event.ctrlKey) {
      if (interaction.currentDayNumber > 0) {
        event.preventDefault();
        if (palette.isOpen) {
          closePalette(palette);
        } else {
          showPalette(palette, interaction.currentDayNumber);
        }
      }
    }
  };
  document.addEventListener('keydown', paletteHandler);

  // Floor plan with O key (museum overview)
  const floorPlanHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyO' && !event.shiftKey && !event.ctrlKey) {
      event.preventDefault();
      toggleFloorPlan(
        floorPlan,
        sessionSummary.exhibitsViewed,
        interaction.currentDayNumber,
        scene.camera.position.x,
        scene.camera.position.z
      );
    }
  };
  document.addEventListener('keydown', floorPlanHandler);

  // Night mode with Shift+D (Day/Night toggle)
  const nightModeHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyD' && event.shiftKey && !event.ctrlKey) {
      event.preventDefault();
      toggleNightMode(nightMode);
    }
  };
  document.addEventListener('keydown', nightModeHandler);

  // Exhibit labels with V key (View labels)
  const labelsHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyV' && !event.shiftKey && !event.ctrlKey && !interaction.isZoomed) {
      event.preventDefault();
      toggleLabels(exhibitLabels);
    }
  };
  document.addEventListener('keydown', labelsHandler);

  // Visitor trail with Shift+V (View trail)
  const trailHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyV' && event.shiftKey && !event.ctrlKey) {
      event.preventDefault();
      toggleTrail(visitorTrail);
      showNotification(visitorTrail.isVisible ? 'Trail visible' : 'Trail hidden');
    }
  };
  document.addEventListener('keydown', trailHandler);

  // Auto-walk mode with B key (Browse/wander)
  const autoWalkHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyB' && !event.shiftKey && !interaction.isZoomed) {
      const active = toggleAutoWalk(autoWalk, scene.camera, interaction.exhibitMeshes);
      if (active) {
        showNotification('🚶 Auto-walk started. Press B to stop.');
        // Stop tour if running
        stopTour(tour);
      } else {
        showNotification('Auto-walk stopped.');
      }
    }
  };
  document.addEventListener('keydown', autoWalkHandler);

  // Mute toggle with M key
  const muteHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyM') {
      const newMuted = !isAudioMuted();
      setAudioMuted(newMuted);
      showNotification(newMuted ? 'Sound muted' : 'Sound enabled');
    }
  };
  document.addEventListener('keydown', muteHandler);

  // Fullscreen toggle with F key (when not zoomed, to avoid conflicts)
  const fullscreenHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyF' && !interaction.isZoomed && !event.shiftKey) {
      toggleFullscreen(container);
    }
  };
  document.addEventListener('keydown', fullscreenHandler);

  // Visual filter Easter eggs
  let activeFilter: 'none' | 'matrix' | 'invert' | 'grayscale' | 'random' = 'none';
  const randomFilters = [
    { filter: 'sepia(80%)', name: 'Vintage' },
    { filter: 'saturate(200%)', name: 'Vivid' },
    { filter: 'contrast(150%)', name: 'High Contrast' },
    { filter: 'hue-rotate(90deg)', name: 'Shifted Hues' },
    { filter: 'brightness(120%) contrast(110%)', name: 'Bright' },
    { filter: 'blur(1px)', name: 'Dreamy' },
  ];

  const filterHandler = (event: KeyboardEvent) => {
    const canvas = scene.renderer.domElement;

    if (event.code === 'Backquote') {
      // Matrix mode
      if (activeFilter === 'matrix') {
        activeFilter = 'none';
        canvas.style.filter = '';
        showNotification('Matrix mode off');
      } else {
        activeFilter = 'matrix';
        canvas.style.filter = 'sepia(100%) hue-rotate(70deg) saturate(150%)';
        showNotification('Matrix mode on');
      }
    } else if (event.code === 'KeyN' && !interaction.isZoomed) {
      // Negative/Invert mode
      if (activeFilter === 'invert') {
        activeFilter = 'none';
        canvas.style.filter = '';
        showNotification('Normal colors');
      } else {
        activeFilter = 'invert';
        canvas.style.filter = 'invert(1) hue-rotate(180deg)';
        showNotification('Inverted colors');
      }
    } else if (event.code === 'KeyB' && event.shiftKey) {
      // Grayscale/B&W mode
      if (activeFilter === 'grayscale') {
        activeFilter = 'none';
        canvas.style.filter = '';
        showNotification('Color mode');
      } else {
        activeFilter = 'grayscale';
        canvas.style.filter = 'grayscale(100%)';
        showNotification('Black & white mode');
      }
    } else if (event.code === 'KeyX' && !interaction.isZoomed) {
      // Random filter mode - cycles through fun filters
      const randomChoice = randomFilters[Math.floor(Math.random() * randomFilters.length)];
      activeFilter = 'random';
      canvas.style.filter = randomChoice.filter;
      showNotification(`${randomChoice.name} filter`);
    }
  };
  document.addEventListener('keydown', filterHandler);

  // Visit log with L key (when not zoomed)
  const visitLogHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyL' && !event.shiftKey && !event.ctrlKey && !interaction.isZoomed) {
      event.preventDefault();
      toggleVisitLog(visitLog);
    }
  };
  document.addEventListener('keydown', visitLogHandler);

  // Random walk with R key (surprise me button also works)
  const randomWalkHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyR' && !event.shiftKey && !event.ctrlKey && !interaction.isZoomed) {
      event.preventDefault();
      selectRandom(randomWalk);
    }
  };
  document.addEventListener('keydown', randomWalkHandler);

  // Share card with Shift+C (when viewing exhibit)
  const shareCardHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyC' && event.shiftKey && !event.ctrlKey) {
      event.preventDefault();
      showShareCard(shareCard, {
        exhibitsViewed: sessionSummary.exhibitsViewed.size,
        favoritesCount: getFavorites(favorites).length,
        timeSpent: Math.floor((Date.now() - sessionSummary.sessionStart) / 1000),
        topExhibit: interaction.currentDayNumber > 0 ? interaction.currentDayNumber : undefined,
        screenshotsTaken: stats.stats.screenshotsTaken,
      });
    }
  };
  document.addEventListener('keydown', shareCardHandler);

  // Ambient presets with A key (when not viewing exhibit)
  const ambientPresetsHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyA' && !event.shiftKey && !event.ctrlKey && !interaction.isZoomed) {
      event.preventDefault();
      togglePresetsPanel(ambientPresets);
    }
  };
  document.addEventListener('keydown', ambientPresetsHandler);

  // Wish list with W key when viewing exhibit, Shift+W to view list
  const wishListHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyW' && !event.ctrlKey) {
      if (event.shiftKey) {
        // Open wish list panel
        event.preventDefault();
        toggleWishList(wishList);
      } else if (interaction.isZoomed && interaction.currentDayNumber > 0) {
        // Add to wish list
        event.preventDefault();
        const added = toggleWishListItem(wishList, interaction.currentDayNumber);
        showNotification(added ? '📌 Added to wish list' : '📌 Removed from wish list');
      }
    }
  };
  document.addEventListener('keydown', wishListHandler);

  // Heatmap with Shift+H
  const heatmapHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyH' && event.shiftKey && !event.ctrlKey) {
      event.preventDefault();
      toggleHeatmap(heatmap);
    }
  };
  document.addEventListener('keydown', heatmapHandler);

  // Time warp with T key (cycle), Shift+T (panel)
  const timeWarpHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyT' && !event.ctrlKey && !interaction.isZoomed) {
      event.preventDefault();
      if (event.shiftKey) {
        showTimeWarpSelector(timeWarp);
      } else {
        const newSpeed = cycleTimeWarp(timeWarp);
        showNotification(`Time: ${newSpeed}×`);
      }
    }
  };
  document.addEventListener('keydown', timeWarpHandler);

  // Comments with C key when viewing exhibit (no shift, no ctrl)
  const commentsHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyC' && !event.shiftKey && !event.ctrlKey && interaction.isZoomed && interaction.currentDayNumber > 0) {
      event.preventDefault();
      openComments(exhibitComments, interaction.currentDayNumber);
    }
  };
  document.addEventListener('keydown', commentsHandler);

  // Tags with # key when viewing, Shift+# to browse all tags
  const tagsHandler = (event: KeyboardEvent) => {
    if (event.code === 'Digit3' && event.shiftKey && !event.ctrlKey) {
      // Shift+3 = #
      event.preventDefault();
      if (interaction.isZoomed && interaction.currentDayNumber > 0) {
        openTagManager(exhibitTags, interaction.currentDayNumber);
      } else {
        openTagBrowser(exhibitTags);
      }
    }
  };
  document.addEventListener('keydown', tagsHandler);

  // Memory lane with M key (when not viewing)
  const memoryLaneHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyM' && !event.shiftKey && !event.ctrlKey && !interaction.isZoomed) {
      event.preventDefault();
      toggleMemoryLane(memoryLane);
    }
  };
  document.addEventListener('keydown', memoryLaneHandler);

  // Milestones with Shift+M
  const milestonesHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyM' && event.shiftKey && !event.ctrlKey) {
      event.preventDefault();
      toggleMilestones(milestones);
    }
  };
  document.addEventListener('keydown', milestonesHandler);

  // Insights with I key (when not viewing)
  const insightsHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyI' && !event.shiftKey && !event.ctrlKey && !interaction.isZoomed) {
      event.preventDefault();
      // Gather insights data
      const insightsData: InsightsData = {
        viewsByDay: new Map(Array.from(sessionSummary.exhibitsViewed).map(d => [d, 1])),
        viewsByHour: new Map([[new Date().getHours(), 1]]),
        timeSpentByDay: new Map(),
        favorites: getFavorites(favorites),
        totalVisits: stats.stats.sessionCount,
        totalTime: Math.floor((Date.now() - sessionSummary.sessionStart) / 1000),
      };
      toggleInsights(visitorInsights, insightsData);
    }
  };
  document.addEventListener('keydown', insightsHandler);

  // Soundscape with backslash key
  const soundscapeHandler = (event: KeyboardEvent) => {
    if (event.code === 'Backslash' && !event.shiftKey && !event.ctrlKey) {
      event.preventDefault();
      initSoundscapeAudio(soundscape);
      const name = cycleSoundscape(soundscape);
      showNotification(`Soundscape: ${name}`);
    }
  };
  document.addEventListener('keydown', soundscapeHandler);

  // Trivia with ? key (Shift+/)
  const triviaHandler = (event: KeyboardEvent) => {
    if (event.code === 'Slash' && event.shiftKey && !event.ctrlKey) {
      event.preventDefault();
      showRandomTrivia(trivia, interaction.currentDayNumber > 0 ? interaction.currentDayNumber : undefined);
    }
  };
  document.addEventListener('keydown', triviaHandler);

  // Waypoints with P key (when not viewing)
  const waypointsHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyP' && !event.shiftKey && !event.ctrlKey && !interaction.isZoomed) {
      event.preventDefault();
      toggleWaypoints(waypoints);
    }
  };
  document.addEventListener('keydown', waypointsHandler);

  // Save current position as waypoint with Ctrl+P
  const saveWaypointHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyP' && event.ctrlKey && !event.shiftKey) {
      event.preventDefault();
      const name = `Location ${waypoints.customWaypoints.length + 1}`;
      addCustomWaypoint(
        waypoints,
        name,
        {
          x: scene.camera.position.x,
          y: scene.camera.position.y,
          z: scene.camera.position.z,
        },
        {
          x: navigation.euler.x,
          y: navigation.euler.y,
          z: navigation.euler.z,
        }
      );
      showNotification(`Waypoint saved: ${name}`);
    }
  };
  document.addEventListener('keydown', saveWaypointHandler);

  // Zoom with + and - keys (when viewing exhibit)
  const zoomKeyHandler = (event: KeyboardEvent) => {
    if (interaction.isZoomed) {
      if (event.code === 'Equal' && !event.ctrlKey) {
        // + key (Equal without shift, or with shift)
        event.preventDefault();
        const newZoom = zoomIn(cameraZoom);
        scene.camera.fov = getZoomFov(cameraZoom);
        scene.camera.updateProjectionMatrix();
        showNotification(`Zoom: ${Math.round(newZoom * 100)}%`);
      } else if (event.code === 'Minus' && !event.ctrlKey) {
        event.preventDefault();
        const newZoom = zoomOut(cameraZoom);
        scene.camera.fov = getZoomFov(cameraZoom);
        scene.camera.updateProjectionMatrix();
        showNotification(`Zoom: ${Math.round(newZoom * 100)}%`);
      } else if (event.code === 'Digit0' && !event.ctrlKey) {
        event.preventDefault();
        resetZoom(cameraZoom);
        scene.camera.fov = getZoomFov(cameraZoom);
        scene.camera.updateProjectionMatrix();
        showNotification('Zoom reset');
      }
    }
  };
  document.addEventListener('keydown', zoomKeyHandler);

  // Playlist with Shift+P
  const playlistHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyP' && event.shiftKey && !event.ctrlKey) {
      event.preventDefault();
      togglePlaylistPanel(exhibitPlaylist);
    }
  };
  document.addEventListener('keydown', playlistHandler);

  // Playlist navigation with [ and ] when playlist is active
  const playlistNavHandler = (event: KeyboardEvent) => {
    if (exhibitPlaylist.isPlaying) {
      if (event.code === 'BracketLeft' && !event.ctrlKey) {
        event.preventDefault();
        playlistPrev(exhibitPlaylist);
      } else if (event.code === 'BracketRight' && !event.ctrlKey) {
        event.preventDefault();
        playlistNext(exhibitPlaylist);
      }
    }
  };
  document.addEventListener('keydown', playlistNavHandler);

  // Curator with G key (show commentary when viewing)
  const curatorHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyG' && !event.ctrlKey && !event.metaKey) {
      if (event.shiftKey) {
        // Shift+G opens tour selection
        event.preventDefault();
        openCuratorTourPanel(virtualCurator);
      } else if (interaction.isZoomed && interaction.currentDayNumber) {
        // G shows curator comment when viewing
        event.preventDefault();
        toggleCuratorComment(virtualCurator, interaction.currentDayNumber);
      }
    }
  };
  document.addEventListener('keydown', curatorHandler);

  // Atmospherics with Shift+F key (cycle particle effects)
  const atmosphericsHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyF' && event.shiftKey && !event.ctrlKey) {
      event.preventDefault();
      const preset = cycleAtmosphericPreset(atmospherics);
      showNotification(`Atmosphere: ${preset === 'none' ? 'Off' : preset}`);
    }
  };
  document.addEventListener('keydown', atmosphericsHandler);

  // Comparison with = key (add to comparison when viewing)
  const comparisonHandler = (event: KeyboardEvent) => {
    if (event.code === 'Equal' && !event.ctrlKey && !event.shiftKey) {
      if (interaction.isZoomed && interaction.currentDayNumber) {
        event.preventDefault();
        const result = addToComparison(comparisons, interaction.currentDayNumber);
        if (result === 'left') {
          showNotification(`Added Day ${interaction.currentDayNumber} to comparison (left)`);
        } else if (result === 'right') {
          showNotification(`Added Day ${interaction.currentDayNumber} to comparison (right)`);
        } else {
          showNotification(`Replaced right with Day ${interaction.currentDayNumber}`);
        }
      }
    } else if (event.code === 'Equal' && event.shiftKey && !event.ctrlKey) {
      // Shift+= opens comparison panel
      event.preventDefault();
      toggleComparisonPanel(comparisons);
    }
  };
  document.addEventListener('keydown', comparisonHandler);

  // Timeline with Shift+T key (when not already used by timewarp)
  const timelineHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyY' && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
      event.preventDefault();
      toggleTimelinePanel(visitTimeline);
    }
  };
  document.addEventListener('keydown', timelineHandler);

  // Wire up timeline tracking for visits and favorites
  const timelineViewHandler = interaction.onExhibitViewed;
  interaction.onExhibitViewed = (dayNumber: number) => {
    timelineViewHandler?.(dayNumber);
    recordTimelineVisit(visitTimeline, dayNumber);
  };

  const timelineFavoriteHandler = interaction.onFavoriteToggle;
  interaction.onFavoriteToggle = (dayNumber: number) => {
    const wasFavorite = isFavorite(favorites, dayNumber);
    timelineFavoriteHandler?.(dayNumber);
    if (!wasFavorite) {
      recordTimelineFavorite(visitTimeline, dayNumber);
    }
  };

  // Themes with Ctrl+Shift+T
  const themesHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyT' && event.ctrlKey && event.shiftKey) {
      event.preventDefault();
      const theme = cycleTheme(uiThemes);
      showNotification(`Theme: ${theme.name}`);
    }
  };
  document.addEventListener('keydown', themesHandler);

  // REMOVED: Badges system (gamification)
  // const badgesHandler = (event: KeyboardEvent) => {
  //   if (event.code === 'KeyB' && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
  //     event.preventDefault();
  //     toggleBadgesPanel(visitorBadges);
  //   }
  // };
  // document.addEventListener('keydown', badgesHandler);
  // unlockBadge(visitorBadges, 'first_visit');
  // ... badge tracking removed ...

  // REMOVED: Leaderboard system (gamification)
  // const leaderboardHandler = (event: KeyboardEvent) => {
  //   if (event.code === 'KeyL' && event.shiftKey && !event.ctrlKey) {
  //     event.preventDefault();
  //     toggleLeaderboardPanel(leaderboard);
  //   }
  // };
  // document.addEventListener('keydown', leaderboardHandler);
  // ... leaderboard tracking removed ...

  // Tutorials with Shift+? (Shift+/)
  const tutorialHandler = (event: KeyboardEvent) => {
    if (event.code === 'Slash' && event.shiftKey && event.ctrlKey) {
      event.preventDefault();
      openTutorialPanel(tutorials);
    }
  };
  document.addEventListener('keydown', tutorialHandler);

  // Check if should show first-time tutorial
  if (shouldShowFirstTimeTutorial(tutorials)) {
    setTimeout(() => {
      startTutorial(tutorials, 'basics');
    }, 2000);
  }

  // Wire up memory lane to track discoveries
  const memoryViewHandler = interaction.onExhibitViewed;
  interaction.onExhibitViewed = (dayNumber: number) => {
    // Check if this is first view
    const wasNew = !sessionSummary.exhibitsViewed.has(dayNumber);
    memoryViewHandler?.(dayNumber);
    if (wasNew) {
      recordFirstView(memoryLane, dayNumber);
    }
  };

  // Wire up memory lane to track favorites
  const memoryFavoriteHandler = interaction.onFavoriteToggle;
  interaction.onFavoriteToggle = (dayNumber: number) => {
    const wasFavorite = isFavorite(favorites, dayNumber);
    memoryFavoriteHandler?.(dayNumber);
    if (!wasFavorite) {
      recordFavoriteMemory(memoryLane, dayNumber);
    }
  };

  // Wire up milestones to check on exhibit view
  const milestoneViewHandler = interaction.onExhibitViewed;
  interaction.onExhibitViewed = (dayNumber: number) => {
    milestoneViewHandler?.(dayNumber);
    // Check milestones periodically
    checkMilestones(milestones, {
      exhibitsViewed: sessionSummary.exhibitsViewed.size,
      totalVisits: stats.stats.sessionCount,
      screenshotsTaken: stats.stats.screenshotsTaken,
      favoritesCount: getFavorites(favorites).length,
      timeSpentMinutes: Math.floor((Date.now() - sessionSummary.sessionStart) / 60000),
      streakDays: 1, // Would get from streaks system
      commentsAdded: 0, // Would get from comments system
    });
  };

  // Wire up heatmap to track views (extend exhibit viewed handler)
  const heatmapViewHandler = interaction.onExhibitViewed;
  interaction.onExhibitViewed = (dayNumber: number) => {
    heatmapViewHandler?.(dayNumber);
    recordHeatmapView(heatmap, dayNumber);
  };

  // Wire up visit log to track activities
  const prevOnExhibitViewed = interaction.onExhibitViewed;
  interaction.onExhibitViewed = (dayNumber: number) => {
    prevOnExhibitViewed?.(dayNumber);
    logExhibitView(visitLog, dayNumber);
  };

  const prevOnFavoriteToggle = interaction.onFavoriteToggle;
  interaction.onFavoriteToggle = (dayNumber: number) => {
    const wasFavorite = isFavorite(favorites, dayNumber);
    prevOnFavoriteToggle?.(dayNumber);
    if (!wasFavorite) {
      logFavorite(visitLog, dayNumber);
    }
  };

  // Wire up achievement logging to visit log
  const prevOnAchievementUnlocked = achievements.onAchievementUnlocked;
  achievements.onAchievementUnlocked = (achievement) => {
    prevOnAchievementUnlocked?.(achievement);
    logAchievement(visitLog, achievement.name);
  };

  // Konami code Easter egg: up up down down left right left right b a
  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
  let konamiIndex = 0;
  let konamiTriggered = false;

  const konamiHandler = (event: KeyboardEvent) => {
    if (konamiTriggered) return;

    if (event.code === konamiCode[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === konamiCode.length) {
        konamiTriggered = true;
        triggerConfetti(container);
        showNotification('You found the secret!');
        unlockAchievement(achievements, 'konami');
      }
    } else {
      konamiIndex = 0;
      // Check if current key starts the sequence
      if (event.code === konamiCode[0]) {
        konamiIndex = 1;
      }
    }
  };
  document.addEventListener('keydown', konamiHandler);

  // Apply shared view if present in URL
  const sharedView = parseSharedView();
  if (sharedView) {
    scene.camera.position.set(sharedView.x, sharedView.y, sharedView.z);
    navigation.euler.set(sharedView.rx, sharedView.ry, 0, 'YXZ');
    scene.camera.quaternion.setFromEuler(navigation.euler);
    showNotification('Loaded shared view');
  }

  // Check for auto-tour URL parameter
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const autoTour = urlParams.get('tour') === '1' || urlParams.get('autoTour') === 'true';
  if (autoTour) {
    // Start tour after a brief delay to allow scene to load
    setTimeout(() => {
      startTour(tour);
      recordTourStarted(stats);
      showNotification('Tour starting...');
    }, 2000);
  }

  // Time milestone notifications
  const timeNotifications = [
    { time: 5 * 60 * 1000, message: '5 minutes exploring! Take your time.' },
    { time: 15 * 60 * 1000, message: '15 minutes! You\'re a dedicated visitor.' },
    { time: 30 * 60 * 1000, message: '30 minutes! You\'ve unlocked Art Enthusiast!' },
  ];
  timeNotifications.forEach(({ time, message }) => {
    setTimeout(() => showNotification(message), time);
  });

  context = {
    scene,
    navigation,
    interaction,
    tour,
    touch,
    minimap,
    settings,
    discovery,
    favorites,
    tips,
    stats,
    daySelector,
    achievements,
    credits,
    help,
    compass,
    exhibitInfo,
    photoGallery,
    breadcrumbs,
    particles,
    spotlight,
    ratings,
    autoWalk,
    guestbook,
    search,
    accessibility,
    sessionSummary,
    curatorNotes,
    timeLighting,
    collections,
    quickFacts,
    photoBooth,
    suggestedNext,
    completion,
    postcards,
    landmarks,
    footsteps,
    // REMOVED: speedrun,
    journal,
    mood,
    // REMOVED: quiz,
    // REMOVED: scavenger,
    history,
    // REMOVED: dailyChallenge,
    comparator,
    social,
    bookmarks,
    focus,
    // REMOVED: visitors,
    soundMixer,
    quickMenu,
    related,
    weather,
    exhibitTimer,
    musicPlayer,
    giftShop,
    meditation,
    hotSpots,
    visitorProfile,
    timeCapsule,
    artStyles,
    annotations,
    dailyQuote,
    reactions,
    palette,
    floorPlan,
    nightMode,
    exhibitLabels,
    visitorTrail,
    audioGuide,
    photoFilters,
    // REMOVED: virtualPresence,
    visitLog,
    randomWalk,
    shareCard,
    // REMOVED: streaks,
    ambientPresets,
    wishList,
    heatmap,
    timeWarp,
    exhibitComments,
    exhibitTags,
    memoryLane,
    milestones,
    photoFrame,
    visitorInsights,
    soundscape,
    trivia,
    waypoints,
    cameraZoom,
    exhibitPlaylist,
    virtualCurator,
    atmospherics,
    comparisons,
    visitTimeline,
    uiThemes,
    // REMOVED: visitorBadges,
    // REMOVED: leaderboard,
    tutorials,
    exhibitions,
    personalRecs,
    container,
    isRunning: false,
    lastTime: 0,
    animationId: null,
  };

  // Expose debug API
  if (typeof window !== 'undefined') {
    (window as unknown as Record<string, unknown>).museumSetCamera = (x: number, y: number, z: number) => {
      if (context) {
        context.scene.camera.position.set(x, y, z);
      }
    };
    (window as unknown as Record<string, unknown>).museumLookAt = (x: number, y: number, z: number) => {
      if (context) {
        context.scene.camera.lookAt(x, y, z);
        // Update navigation euler to match new camera orientation
        context.navigation.euler.setFromQuaternion(context.scene.camera.quaternion);
      }
    };
    (window as unknown as Record<string, unknown>).museumGetFPS = () => {
      if (context && context.lastTime) {
        return Math.round(1000 / context.lastTime);
      }
      return 0;
    };
  }

  // Hide loading overlay after a short delay
  setTimeout(() => {
    hideLoadingOverlay();
    console.log('Museum loaded. Use WASD to move, click and drag to look around.');
  }, 500);

  return context;
}

/**
 * Start the museum render loop
 */
export function startMuseum(): void {
  if (!context || context.isRunning) return;

  context.isRunning = true;
  context.lastTime = performance.now();

  const animate = (time: number) => {
    if (!context || !context.isRunning) return;

    const deltaTime = (time - context.lastTime) / 1000;
    context.lastTime = time;

    // Update interaction (click-to-zoom)
    const interactionActive = updateInteraction(context.interaction, deltaTime);

    // Update guided tour if active
    const tourActive = updateTour(context.tour, deltaTime);

    // Update auto-walk if active
    const autoWalkActive = updateAutoWalk(context.autoWalk, deltaTime);

    // Update navigation only if not in zoom mode, tour mode, or auto-walk mode
    if (!interactionActive && !context.interaction.isZoomed && !tourActive && !autoWalkActive) {
      updateNavigation(context.navigation, deltaTime);
    }

    // Update footstep sounds based on movement
    const isWalking = context.navigation.velocity.length() > 0.1 &&
                      !context.interaction.isZoomed &&
                      !tourActive;
    updateFootsteps(context.footsteps, isWalking, context.navigation.velocity.length());

    // Update scene (animations, etc.)
    updateScene(context.scene, deltaTime);

    // Update ambient particles
    updateParticles(context.particles, deltaTime);

    // Update artwork visibility (animate only visible exhibits)
    updateArtworkVisibility(context.scene.camera, context.interaction.exhibitMeshes);

    // Update location indicator
    const pos = context.scene.camera.position;
    updateLocationIndicator(pos.z, pos.x);

    // Update ambient audio based on wing location
    const currentWing = getWingFromPosition(pos.z, pos.x);
    updateAmbientForWing(currentWing);

    // Track movement distance for stats
    recordMovement(context.stats, pos.x, pos.z);

    // Record trail position
    recordTrailPosition(context.visitorTrail, pos);
    updateTrail(context.visitorTrail);

    // Update minimap
    updateMinimap(context.minimap, context.scene.camera);

    // Update suggested next indicator
    if (!context.interaction.isZoomed && !tourActive && !autoWalkActive) {
      const cameraDir = new THREE.Vector3(0, 0, -1).applyQuaternion(context.scene.camera.quaternion);
      updateSuggestedNext(
        context.suggestedNext,
        context.scene.camera.position,
        cameraDir,
        context.sessionSummary.exhibitsViewed
      );
    }

    // Update compass
    updateCompass(context.compass, context.scene.camera);

    // Update landmark markers
    updateLandmarks(
      context.landmarks,
      context.scene.camera,
      context.container.clientWidth,
      context.container.clientHeight
    );

    // Update exhibit labels
    updateLabels(
      context.exhibitLabels,
      context.scene.camera,
      context.container.clientWidth,
      context.container.clientHeight
    );

    // Render
    context.scene.renderer.render(context.scene.scene, context.scene.camera);

    context.animationId = requestAnimationFrame(animate);
  };

  context.animationId = requestAnimationFrame(animate);

  // Periodically check achievements
  const achievementCheckInterval = setInterval(() => {
    if (!context) return;
    checkAchievements(context.achievements, {
      exhibitsViewed: context.discovery.viewedDays.size,
      favoritesCount: getFavorites(context.favorites).length,
      screenshotsTaken: context.stats.stats.screenshotsTaken,
      toursTaken: context.stats.stats.toursTaken,
      totalTimeSpent: context.stats.stats.totalTimeSpent,
      distanceWalked: context.stats.stats.distanceWalked,
      sharedViews: context.stats.stats.sharedViews,
    });

    // Check for speed run achievement (10 exhibits in under 2 minutes)
    if (checkSpeedRun(context.stats)) {
      unlockAchievement(context.achievements, 'speed-run');
    }

    // REMOVED: Daily challenge progress (gamification)
    // updateChallengeProgress(context.dailyChallenge, {
    //   exhibitsViewed: context.sessionSummary.exhibitsViewed,
    //   favoritesCount: getFavorites(context.favorites).length,
    //   screenshotsTaken: context.stats.stats.screenshotsTaken,
    //   journalEntriesCount: getJournalCount(context.journal),
    //   timeSpent: context.stats.stats.totalTimeSpent,
    //   distanceWalked: context.stats.stats.distanceWalked,
    // });
  }, 10000); // Check every 10 seconds

  // Store interval for cleanup
  (context as unknown as Record<string, unknown>).achievementCheckInterval = achievementCheckInterval;
}

/**
 * Stop the museum render loop
 */
export function stopMuseum(): void {
  if (!context) return;

  context.isRunning = false;

  if (context.animationId !== null) {
    cancelAnimationFrame(context.animationId);
    context.animationId = null;
  }

  // Clear achievement check interval
  const interval = (context as unknown as Record<string, unknown>).achievementCheckInterval as number | undefined;
  if (interval) {
    clearInterval(interval);
  }
}

/**
 * Clean up the museum
 */
export function disposeMuseum(): void {
  if (!context) return;

  stopMuseum();
  disposeAudio();
  if (context.touch) {
    disposeTouchControls(context.touch);
  }
  disposeMinimap(context.minimap);
  disposeSettingsPanel(context.settings);
  disposeDiscoveryTracker(context.discovery);
  disposeFavoritesSystem(context.favorites);
  disposeTipsSystem(context.tips);
  disposeStatsTracker(context.stats);
  disposeDaySelector(context.daySelector);
  disposeAchievementsSystem(context.achievements);
  disposeCreditsSystem(context.credits);
  disposeHelpSystem(context.help);
  disposeCompass(context.compass);
  disposeExhibitInfoPanel(context.exhibitInfo);
  disposePhotoGallery(context.photoGallery);
  disposeBreadcrumbTrail(context.breadcrumbs);
  disposeParticleSystem(context.particles);
  disposeSpotlight(context.spotlight);
  disposeRatingsSystem(context.ratings);
  disposeAutoWalk(context.autoWalk);
  disposeGuestbook(context.guestbook);
  disposeSearchSystem(context.search);
  disposeAccessibilitySystem(context.accessibility);
  disposeSessionSummary(context.sessionSummary);
  disposeCuratorNoteSystem(context.curatorNotes);
  disposeTimeLighting(context.timeLighting);
  disposeCollectionsSystem(context.collections);
  disposeQuickFactsSystem(context.quickFacts);
  disposePhotoBooth(context.photoBooth);
  disposeSuggestedNext(context.suggestedNext);
  disposeCompletionSystem(context.completion);
  disposePostcardSystem(context.postcards);
  disposeLandmarkSystem(context.landmarks);
  disposeFootstepSystem(context.footsteps);
  // REMOVED: disposeSpeedRunSystem(context.speedrun);
  disposeJournalSystem(context.journal);
  disposeMoodSystem(context.mood);
  // REMOVED: disposeQuizSystem(context.quiz);
  // REMOVED: disposeScavengerSystem(context.scavenger);
  disposeHistorySystem(context.history);
  // REMOVED: disposeChallengeSystem(context.dailyChallenge);
  disposeComparatorSystem(context.comparator);
  disposeSocialSystem(context.social);
  disposeBookmarksSystem(context.bookmarks);
  disposeFocusSystem(context.focus);
  // REMOVED: disposeVisitorSystem(context.visitors);
  disposeSoundMixerSystem(context.soundMixer);
  disposeQuickMenuSystem(context.quickMenu);
  disposeRelatedSystem(context.related);
  disposeWeatherSystem(context.weather);
  disposeTimerSystem(context.exhibitTimer);
  disposeMusicPlayerSystem(context.musicPlayer);
  disposeGiftShopSystem(context.giftShop);
  disposeMeditationSystem(context.meditation);
  disposeHotSpotsSystem(context.hotSpots);
  disposeProfileSystem(context.visitorProfile);
  disposeTimeCapsuleSystem(context.timeCapsule);
  disposeArtStylesSystem(context.artStyles);
  disposeAnnotationsSystem(context.annotations);
  disposeDailyQuoteSystem(context.dailyQuote);
  disposeReactionsSystem(context.reactions);
  disposePaletteSystem(context.palette);
  disposeFloorPlanSystem(context.floorPlan);
  disposeNightModeSystem(context.nightMode);
  disposeLabelsSystem(context.exhibitLabels);
  disposeTrailSystem(context.visitorTrail);
  disposeAudioGuideSystem(context.audioGuide);
  disposePhotoFiltersSystem(context.photoFilters);
  // REMOVED: disposePresenceSystem(context.virtualPresence);
  disposeVisitLogSystem(context.visitLog);
  disposeRandomWalkSystem(context.randomWalk);
  disposeShareCardSystem(context.shareCard);
  // REMOVED: disposeStreaksSystem(context.streaks);
  disposeAmbientPresetsSystem(context.ambientPresets);
  disposeWishListSystem(context.wishList);
  disposeHeatmapSystem(context.heatmap);
  disposeTimeWarpSystem(context.timeWarp);
  disposeCommentsSystem(context.exhibitComments);
  disposeTagsSystem(context.exhibitTags);
  disposeMemoryLaneSystem(context.memoryLane);
  disposeMilestonesSystem(context.milestones);
  disposePhotoFrameSystem(context.photoFrame);
  disposeInsightsSystem(context.visitorInsights);
  disposeSoundscapeSystem(context.soundscape);
  disposeTriviaSystem(context.trivia);
  disposeWaypointsSystem(context.waypoints);
  disposeZoomSystem(context.cameraZoom);
  disposePlaylistSystem(context.exhibitPlaylist);
  disposeCuratorSystem(context.virtualCurator);
  disposeAtmosphericsSystem(context.atmospherics);
  disposeComparisonSystem(context.comparisons);
  disposeTimelineSystem(context.visitTimeline);
  disposeThemesSystem(context.uiThemes);
  // REMOVED: disposeBadgesSystem(context.visitorBadges);
  // REMOVED: disposeLeaderboardSystem(context.leaderboard);
  disposeTutorialsSystem(context.tutorials);
  disposeExhibitionsSystem(context.exhibitions);
  disposeRecommendationsSystem(context.personalRecs);
  disposeTour(context.tour);
  disposeInteraction(context.interaction);
  disposeNavigation(context.navigation);
  disposeScene(context.scene);

  // Clean up location indicator timer
  const locationEl = document.getElementById('museum-location');
  if (locationEl) {
    const interval = (locationEl as unknown as Record<string, unknown>).timerInterval as number | undefined;
    if (interval) clearInterval(interval);
  }

  // Remove debug API
  if (typeof window !== 'undefined') {
    delete (window as unknown as Record<string, unknown>).museumSetCamera;
    delete (window as unknown as Record<string, unknown>).museumGetFPS;
  }

  context = null;
}

/**
 * Get the current museum context (for testing)
 */
export function getMuseumContext(): MuseumContext | null {
  return context;
}

/**
 * Get the canvas element
 */
export function getMuseumCanvas(): HTMLCanvasElement | null {
  return context?.scene.renderer.domElement ?? null;
}
