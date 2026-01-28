/**
 * Exhibit System Index
 *
 * Exports all exhibit-related functionality.
 */

export {
  createExhibitFrame,
  setFrameTexture,
  setPlaceholderTexture,
  createTextureFromCanvas,
  disposeExhibitFrame,
  defaultFrameConfig,
  type ExhibitFrame,
  type FrameConfig,
} from './frame';

export {
  createPlacard,
  disposePlacard,
  getDayInfo,
  dayInfoMap,
  defaultPlacardConfig,
  type Placard,
  type PlacardConfig,
  type DayInfo,
} from './placard';
