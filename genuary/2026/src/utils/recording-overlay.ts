/**
 * Recording overlay component for visual status feedback
 */

import type { RecordingStatus } from './recording';

export interface RecordingOverlay {
  update: (status: RecordingStatus) => void;
  destroy: () => void;
}

/**
 * Create a recording status overlay positioned over the canvas
 */
export function createRecordingOverlay(canvas: HTMLCanvasElement): RecordingOverlay {
  // Create overlay container
  const overlay = document.createElement('div');
  overlay.id = 'recording-overlay';
  overlay.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    padding: 20px;
    z-index: 100;
  `;

  // Create status box
  const statusBox = document.createElement('div');
  statusBox.id = 'recording-status-box';
  statusBox.style.cssText = `
    background: rgba(0, 0, 0, 0.8);
    border: 2px solid #ff4444;
    border-radius: 8px;
    padding: 12px 20px;
    min-width: 200px;
    text-align: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #fff;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;

  // Status message
  const statusMessage = document.createElement('div');
  statusMessage.id = 'recording-status-message';
  statusMessage.style.cssText = `
    font-size: 14px;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  `;

  // Recording indicator dot
  const recordingDot = document.createElement('span');
  recordingDot.id = 'recording-dot';
  recordingDot.style.cssText = `
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #ff4444;
    display: inline-block;
    animation: pulse 1s infinite;
  `;

  // Add pulse animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.9); }
    }
  `;
  document.head.appendChild(style);

  const messageText = document.createElement('span');
  messageText.id = 'recording-message-text';

  statusMessage.appendChild(recordingDot);
  statusMessage.appendChild(messageText);

  // Progress bar container
  const progressContainer = document.createElement('div');
  progressContainer.id = 'recording-progress-container';
  progressContainer.style.cssText = `
    width: 100%;
    height: 8px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    overflow: hidden;
  `;

  // Progress bar fill
  const progressFill = document.createElement('div');
  progressFill.id = 'recording-progress-fill';
  progressFill.style.cssText = `
    height: 100%;
    width: 0%;
    background: linear-gradient(90deg, #ff4444, #ff8866);
    border-radius: 4px;
    transition: width 0.1s ease;
  `;

  // Progress percentage text
  const progressText = document.createElement('div');
  progressText.id = 'recording-progress-text';
  progressText.style.cssText = `
    font-size: 12px;
    margin-top: 6px;
    color: rgba(255, 255, 255, 0.8);
  `;

  // Assemble the overlay
  progressContainer.appendChild(progressFill);
  statusBox.appendChild(statusMessage);
  statusBox.appendChild(progressContainer);
  statusBox.appendChild(progressText);
  overlay.appendChild(statusBox);

  // Position relative to canvas container
  const container = canvas.parentElement;
  if (container) {
    // Ensure container has relative positioning for absolute overlay
    const containerPosition = window.getComputedStyle(container).position;
    if (containerPosition === 'static') {
      container.style.position = 'relative';
    }
    container.appendChild(overlay);
  } else {
    // Fallback: position relative to canvas itself
    canvas.style.position = 'relative';
    canvas.parentNode?.insertBefore(overlay, canvas.nextSibling);
  }

  /**
   * Update the overlay with current recording status
   */
  function update(status: RecordingStatus): void {
    // Show/hide overlay based on state
    if (status.state === 'idle') {
      statusBox.style.opacity = '0';
      return;
    }

    statusBox.style.opacity = '1';

    // Update border and dot color based on state
    let color = '#ff4444'; // Recording red
    let dotAnimation = 'pulse 1s infinite';

    switch (status.state) {
      case 'recording':
        color = '#ff4444';
        dotAnimation = 'pulse 1s infinite';
        break;
      case 'encoding':
        color = '#ffaa44';
        dotAnimation = 'pulse 0.5s infinite';
        break;
      case 'complete':
        color = '#44ff44';
        dotAnimation = 'none';
        break;
      case 'error':
        color = '#ff4444';
        dotAnimation = 'none';
        break;
    }

    statusBox.style.borderColor = color;
    recordingDot.style.background = color;
    recordingDot.style.animation = dotAnimation;

    // Update message text
    messageText.textContent = status.message;

    // Update progress bar
    progressFill.style.width = `${status.progress}%`;
    progressFill.style.background = status.state === 'encoding'
      ? 'linear-gradient(90deg, #ffaa44, #ffcc66)'
      : status.state === 'complete'
        ? 'linear-gradient(90deg, #44ff44, #66ff88)'
        : 'linear-gradient(90deg, #ff4444, #ff8866)';

    // Update progress text
    if (status.state === 'complete' && status.fileSize) {
      const sizeKB = (status.fileSize / 1024).toFixed(0);
      progressText.textContent = `File size: ${sizeKB} KB`;
    } else {
      progressText.textContent = `${Math.round(status.progress)}%`;
    }
  }

  /**
   * Clean up and remove the overlay
   */
  function destroy(): void {
    overlay.remove();
    style.remove();
  }

  return { update, destroy };
}
