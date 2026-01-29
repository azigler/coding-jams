/**
 * Exhibit Quiz
 *
 * A fun quiz that tests visitors' knowledge of the Genuary prompts.
 * Questions are based on prompt themes, techniques, and history.
 */

// ============================================================================
// Types
// ============================================================================

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  dayRelated?: number;
  explanation?: string;
}

export interface QuizSession {
  questions: QuizQuestion[];
  currentIndex: number;
  score: number;
  answers: (number | null)[];
}

export interface QuizSystem {
  container: HTMLElement;
  popup: HTMLElement | null;
  isOpen: boolean;
  currentSession: QuizSession | null;
  highScore: number;
  totalQuizzesTaken: number;
  cleanup: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = 'genuary-museum-quiz';
const QUESTIONS_PER_QUIZ = 5;

// ============================================================================
// Quiz Questions Database
// ============================================================================

const QUESTION_POOL: QuizQuestion[] = [
  {
    question: 'What is Genuary?',
    options: [
      'A generative art challenge in January',
      'A programming conference',
      'A type of calendar',
      'A music genre',
    ],
    correctIndex: 0,
    explanation: 'Genuary is an annual generative art challenge held every January.',
  },
  {
    question: 'How many prompts are in a complete Genuary?',
    options: ['28', '30', '31', '365'],
    correctIndex: 2,
    explanation: 'Genuary has 31 prompts, one for each day of January.',
  },
  {
    question: 'What technique uses randomness to create variety?',
    options: ['Determinism', 'Procedural generation', 'Manual drawing', 'Photography'],
    correctIndex: 1,
    explanation: 'Procedural generation uses algorithms and randomness to create content.',
  },
  {
    question: 'What does "generative art" mean?',
    options: [
      'Art made by AI only',
      'Art created using autonomous systems or algorithms',
      'Art about nature',
      'Art that generates income',
    ],
    correctIndex: 1,
    explanation: 'Generative art is created through autonomous systems, often with code.',
  },
  {
    question: 'What is Perlin noise commonly used for?',
    options: [
      'Creating audio static',
      'Natural-looking random patterns',
      'Encrypting data',
      'Compressing images',
    ],
    correctIndex: 1,
    explanation: 'Perlin noise creates smooth, natural-looking gradients and patterns.',
  },
  {
    question: 'Which library is popular for creative coding?',
    options: ['React', 'p5.js', 'jQuery', 'Bootstrap'],
    correctIndex: 1,
    explanation: 'p5.js is designed specifically for creative coding and visual art.',
  },
  {
    question: 'What is a "seed" in generative art?',
    options: [
      'A plant reference',
      'An initial value for randomness',
      'A type of brush',
      'A file format',
    ],
    correctIndex: 1,
    explanation: 'A seed initializes random number generators for reproducible results.',
  },
  {
    question: 'What is a flow field?',
    options: [
      'A type of spreadsheet',
      'A water simulation',
      'A grid of vectors guiding movement',
      'A social media trend',
    ],
    correctIndex: 2,
    explanation: 'Flow fields are grids of vectors that guide particle movement.',
  },
  {
    question: 'What does HSB stand for in color?',
    options: [
      'High Speed Blue',
      'Hue Saturation Brightness',
      'Hardware Software Base',
      'Horizontal Spatial Balance',
    ],
    correctIndex: 1,
    explanation: 'HSB (Hue, Saturation, Brightness) is an intuitive color model.',
  },
  {
    question: 'What is recursion in programming?',
    options: [
      'Repeating mistakes',
      'A function calling itself',
      'Going backwards',
      'A type of loop',
    ],
    correctIndex: 1,
    explanation: 'Recursion is when a function calls itself to solve sub-problems.',
  },
  {
    question: 'What creates the "marching ants" effect in selections?',
    options: [
      'Actual ants',
      'Animated dashed borders',
      'AI detection',
      'Optical illusion',
    ],
    correctIndex: 1,
    explanation: 'Marching ants are animated dashed lines showing selection boundaries.',
  },
  {
    question: 'What is GLSL?',
    options: [
      'A social network',
      'A shader programming language',
      'A file format',
      'A graphics card brand',
    ],
    correctIndex: 1,
    explanation: 'GLSL (OpenGL Shading Language) is used to write GPU shaders.',
  },
  {
    question: 'What is the purpose of lerp() in animation?',
    options: [
      'To make things jump',
      'To smoothly interpolate between values',
      'To add sound effects',
      'To delete frames',
    ],
    correctIndex: 1,
    explanation: 'Lerp (linear interpolation) smoothly transitions between values.',
  },
  {
    question: 'What is a shader?',
    options: [
      'A sunblock for screens',
      'A program that runs on the GPU',
      'A type of monitor',
      'A drawing tool',
    ],
    correctIndex: 1,
    explanation: 'Shaders are small programs that run on graphics hardware.',
  },
  {
    question: 'What does FPS stand for in graphics?',
    options: [
      'First Person Shooter',
      'Frames Per Second',
      'Fast Processing Speed',
      'Final Picture Size',
    ],
    correctIndex: 1,
    explanation: 'FPS measures how many frames are rendered each second.',
  },
  {
    question: 'What is creative coding?',
    options: [
      'Writing code creatively',
      'Using code as a creative medium for art',
      'Making code look pretty',
      'Coding while being creative',
    ],
    correctIndex: 1,
    explanation: 'Creative coding uses programming as a tool for artistic expression.',
  },
  {
    question: 'What is a particle system?',
    options: [
      'A physics theory',
      'A collection of small objects with behaviors',
      'A file compression method',
      'A networking protocol',
    ],
    correctIndex: 1,
    explanation: 'Particle systems manage many small objects that follow rules.',
  },
  {
    question: 'What does "render" mean in graphics?',
    options: [
      'To tear apart',
      'To generate the final image from data',
      'To submit for approval',
      'To translate text',
    ],
    correctIndex: 1,
    explanation: 'Rendering converts scene data into a visible image.',
  },
  {
    question: 'What is Three.js used for?',
    options: [
      'Playing videos',
      '3D graphics in the browser',
      'Database management',
      'Text editing',
    ],
    correctIndex: 1,
    explanation: 'Three.js is a JavaScript library for 3D graphics in web browsers.',
  },
  {
    question: 'What is a bezier curve?',
    options: [
      'A French pastry',
      'A smooth curve defined by control points',
      'A type of ruler',
      'A hair styling technique',
    ],
    correctIndex: 1,
    explanation: 'Bezier curves are smooth curves controlled by anchor points.',
  },
];

// ============================================================================
// Quiz System Creation
// ============================================================================

/**
 * Create the quiz system
 */
export function createQuizSystem(container: HTMLElement): QuizSystem {
  const saved = loadQuizState();

  const system: QuizSystem = {
    container,
    popup: null,
    isOpen: false,
    currentSession: null,
    highScore: saved.highScore,
    totalQuizzesTaken: saved.totalQuizzesTaken,
    cleanup: () => {
      if (system.popup) {
        system.popup.remove();
        system.popup = null;
      }
    },
  };

  // Open with Shift+Q
  const keyHandler = (event: KeyboardEvent) => {
    if (event.code === 'KeyQ' && event.shiftKey) {
      event.preventDefault();
      if (system.isOpen) {
        closeQuiz(system);
      } else {
        openQuiz(system);
      }
    }
  };
  document.addEventListener('keydown', keyHandler);

  const originalCleanup = system.cleanup;
  system.cleanup = () => {
    document.removeEventListener('keydown', keyHandler);
    originalCleanup();
  };

  return system;
}

/**
 * Open the quiz
 */
export function openQuiz(system: QuizSystem): void {
  if (system.popup) return;

  system.isOpen = true;

  // Show start screen or continue existing session
  if (system.currentSession) {
    showQuestion(system);
  } else {
    showStartScreen(system);
  }
}

/**
 * Show the quiz start screen
 */
function showStartScreen(system: QuizSystem): void {
  const popup = document.createElement('div');
  popup.id = 'quiz-popup';
  popup.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 420px;
    background: rgba(15, 15, 25, 0.98);
    border: 1px solid rgba(255, 200, 100, 0.4);
    border-radius: 16px;
    font-family: system-ui, sans-serif;
    color: #e0e0e0;
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.3s;
    overflow: hidden;
  `;

  popup.innerHTML = `
    <div style="
      padding: 30px;
      text-align: center;
    ">
      <div style="font-size: 50px; margin-bottom: 15px;">🧠</div>
      <h2 style="margin: 0 0 10px 0; font-size: 22px; color: white;">Exhibit Quiz</h2>
      <p style="margin: 0 0 20px 0; font-size: 13px; color: #888;">
        Test your knowledge of generative art!
      </p>

      <div style="
        background: rgba(40, 40, 60, 0.5);
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 20px;
      ">
        <div style="display: flex; justify-content: space-around;">
          <div>
            <div style="font-size: 24px; color: #ffd700; font-weight: bold;">${system.highScore}</div>
            <div style="font-size: 10px; color: #888;">High Score</div>
          </div>
          <div>
            <div style="font-size: 24px; color: #4a9eff; font-weight: bold;">${system.totalQuizzesTaken}</div>
            <div style="font-size: 10px; color: #888;">Quizzes Taken</div>
          </div>
        </div>
      </div>

      <div style="font-size: 11px; color: #666; margin-bottom: 20px;">
        ${QUESTIONS_PER_QUIZ} questions • Multiple choice
      </div>

      <div style="display: flex; gap: 10px; justify-content: center;">
        <button id="quiz-cancel" style="
          background: rgba(100, 100, 120, 0.5);
          border: none;
          border-radius: 8px;
          padding: 12px 24px;
          color: white;
          font-size: 14px;
          cursor: pointer;
        ">Close</button>
        <button id="quiz-start" style="
          background: linear-gradient(135deg, #ffd700, #ff8c00);
          border: none;
          border-radius: 8px;
          padding: 12px 24px;
          color: #1a1a2e;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
        ">Start Quiz</button>
      </div>
    </div>
  `;

  system.container.appendChild(popup);
  system.popup = popup;

  // Fade in
  requestAnimationFrame(() => {
    popup.style.opacity = '1';
  });

  // Wire up buttons
  setTimeout(() => {
    const cancelBtn = document.getElementById('quiz-cancel');
    const startBtn = document.getElementById('quiz-start');

    if (cancelBtn) {
      cancelBtn.onclick = () => closeQuiz(system);
    }

    if (startBtn) {
      startBtn.onclick = () => {
        startQuizSession(system);
      };
    }
  }, 0);

  // Close on Escape
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeQuiz(system);
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Start a new quiz session
 */
function startQuizSession(system: QuizSystem): void {
  // Select random questions
  const shuffled = [...QUESTION_POOL].sort(() => Math.random() - 0.5);
  const questions = shuffled.slice(0, QUESTIONS_PER_QUIZ);

  system.currentSession = {
    questions,
    currentIndex: 0,
    score: 0,
    answers: new Array(questions.length).fill(null),
  };

  showQuestion(system);
}

/**
 * Show the current question
 */
function showQuestion(system: QuizSystem): void {
  if (!system.currentSession || !system.popup) return;

  const session = system.currentSession;
  const question = session.questions[session.currentIndex];
  const questionNum = session.currentIndex + 1;
  const totalQuestions = session.questions.length;

  system.popup.innerHTML = `
    <div style="
      padding: 15px 20px;
      border-bottom: 1px solid rgba(255, 200, 100, 0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
    ">
      <div style="font-size: 12px; color: #888;">
        Question ${questionNum} of ${totalQuestions}
      </div>
      <div style="font-size: 12px; color: #ffd700;">
        Score: ${session.score}
      </div>
    </div>

    <div style="padding: 25px;">
      <div style="
        font-size: 16px;
        color: white;
        margin-bottom: 25px;
        line-height: 1.5;
      ">${question.question}</div>

      <div id="quiz-options" style="display: flex; flex-direction: column; gap: 10px;">
        ${question.options.map((option, i) => `
          <button class="quiz-option" data-index="${i}" style="
            background: rgba(40, 40, 60, 0.5);
            border: 1px solid rgba(100, 100, 120, 0.5);
            border-radius: 8px;
            padding: 12px 16px;
            color: white;
            font-size: 14px;
            text-align: left;
            cursor: pointer;
            transition: all 0.2s;
          ">${option}</button>
        `).join('')}
      </div>

      <div style="
        margin-top: 20px;
        height: 4px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
        overflow: hidden;
      ">
        <div style="
          width: ${(questionNum / totalQuestions) * 100}%;
          height: 100%;
          background: linear-gradient(90deg, #ffd700, #ff8c00);
          transition: width 0.3s;
        "></div>
      </div>
    </div>
  `;

  // Wire up options
  setTimeout(() => {
    const options = system.popup?.querySelectorAll('.quiz-option');
    options?.forEach(btn => {
      (btn as HTMLElement).onmouseover = () => {
        (btn as HTMLElement).style.borderColor = 'rgba(255, 200, 100, 0.5)';
        (btn as HTMLElement).style.background = 'rgba(60, 60, 80, 0.5)';
      };
      (btn as HTMLElement).onmouseout = () => {
        (btn as HTMLElement).style.borderColor = 'rgba(100, 100, 120, 0.5)';
        (btn as HTMLElement).style.background = 'rgba(40, 40, 60, 0.5)';
      };
      (btn as HTMLElement).onclick = () => {
        const index = parseInt((btn as HTMLElement).dataset.index || '0', 10);
        answerQuestion(system, index);
      };
    });
  }, 0);
}

/**
 * Handle answer selection
 */
function answerQuestion(system: QuizSystem, answerIndex: number): void {
  if (!system.currentSession || !system.popup) return;

  const session = system.currentSession;
  const question = session.questions[session.currentIndex];
  const isCorrect = answerIndex === question.correctIndex;

  session.answers[session.currentIndex] = answerIndex;
  if (isCorrect) {
    session.score++;
  }

  // Show feedback
  showAnswerFeedback(system, isCorrect, question);
}

/**
 * Show answer feedback before moving to next question
 */
function showAnswerFeedback(system: QuizSystem, isCorrect: boolean, question: QuizQuestion): void {
  if (!system.popup) return;

  const options = system.popup.querySelectorAll('.quiz-option');
  options.forEach((btn, i) => {
    (btn as HTMLElement).style.pointerEvents = 'none';

    if (i === question.correctIndex) {
      (btn as HTMLElement).style.background = 'rgba(74, 222, 128, 0.3)';
      (btn as HTMLElement).style.borderColor = 'rgba(74, 222, 128, 0.6)';
    } else if (!isCorrect && i === system.currentSession?.answers[system.currentSession.currentIndex]) {
      (btn as HTMLElement).style.background = 'rgba(255, 100, 100, 0.3)';
      (btn as HTMLElement).style.borderColor = 'rgba(255, 100, 100, 0.6)';
    }
  });

  // Add feedback message
  const feedbackDiv = document.createElement('div');
  feedbackDiv.style.cssText = `
    margin-top: 20px;
    padding: 15px;
    border-radius: 8px;
    background: ${isCorrect ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255, 100, 100, 0.1)'};
    border: 1px solid ${isCorrect ? 'rgba(74, 222, 128, 0.3)' : 'rgba(255, 100, 100, 0.3)'};
  `;

  feedbackDiv.innerHTML = `
    <div style="font-size: 14px; color: ${isCorrect ? '#4ade80' : '#ff6b6b'}; margin-bottom: 8px;">
      ${isCorrect ? '✓ Correct!' : '✗ Incorrect'}
    </div>
    ${question.explanation ? `
      <div style="font-size: 12px; color: #888;">${question.explanation}</div>
    ` : ''}
    <button id="quiz-next" style="
      margin-top: 12px;
      background: linear-gradient(135deg, #ffd700, #ff8c00);
      border: none;
      border-radius: 6px;
      padding: 8px 20px;
      color: #1a1a2e;
      font-size: 13px;
      font-weight: bold;
      cursor: pointer;
    ">${system.currentSession && system.currentSession.currentIndex < system.currentSession.questions.length - 1 ? 'Next Question' : 'See Results'}</button>
  `;

  const optionsDiv = system.popup.querySelector('#quiz-options');
  optionsDiv?.parentElement?.appendChild(feedbackDiv);

  // Wire up next button
  setTimeout(() => {
    const nextBtn = document.getElementById('quiz-next');
    if (nextBtn) {
      nextBtn.onclick = () => {
        if (system.currentSession) {
          system.currentSession.currentIndex++;
          if (system.currentSession.currentIndex < system.currentSession.questions.length) {
            showQuestion(system);
          } else {
            showResults(system);
          }
        }
      };
    }
  }, 0);
}

/**
 * Show quiz results
 */
function showResults(system: QuizSystem): void {
  if (!system.currentSession || !system.popup) return;

  const session = system.currentSession;
  const isNewHighScore = session.score > system.highScore;

  if (isNewHighScore) {
    system.highScore = session.score;
  }
  system.totalQuizzesTaken++;
  saveQuizState(system);

  const percentage = Math.round((session.score / session.questions.length) * 100);

  let message = '';
  let emoji = '';
  if (percentage === 100) {
    message = 'Perfect score! You\'re a generative art expert!';
    emoji = '🏆';
  } else if (percentage >= 80) {
    message = 'Excellent! You know your stuff!';
    emoji = '🌟';
  } else if (percentage >= 60) {
    message = 'Good job! Keep exploring!';
    emoji = '👍';
  } else if (percentage >= 40) {
    message = 'Not bad! There\'s more to discover.';
    emoji = '📚';
  } else {
    message = 'Keep learning! The museum has much to teach.';
    emoji = '🎓';
  }

  system.popup.innerHTML = `
    <div style="padding: 30px; text-align: center;">
      <div style="font-size: 60px; margin-bottom: 15px;">${emoji}</div>
      <h2 style="margin: 0 0 5px 0; font-size: 24px; color: white;">Quiz Complete!</h2>

      ${isNewHighScore ? `
        <div style="
          font-size: 14px;
          color: #ffd700;
          margin-bottom: 15px;
          animation: pulse 1s ease-in-out infinite;
        ">🏆 New High Score! 🏆</div>
      ` : ''}

      <div style="
        font-size: 48px;
        color: #ffd700;
        font-weight: bold;
        margin: 20px 0;
      ">${session.score} / ${session.questions.length}</div>

      <div style="
        font-size: 14px;
        color: #888;
        margin-bottom: 25px;
      ">${message}</div>

      <div style="display: flex; gap: 10px; justify-content: center;">
        <button id="quiz-close-results" style="
          background: rgba(100, 100, 120, 0.5);
          border: none;
          border-radius: 8px;
          padding: 12px 24px;
          color: white;
          font-size: 14px;
          cursor: pointer;
        ">Close</button>
        <button id="quiz-retry" style="
          background: linear-gradient(135deg, #ffd700, #ff8c00);
          border: none;
          border-radius: 8px;
          padding: 12px 24px;
          color: #1a1a2e;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
        ">Try Again</button>
      </div>
    </div>
    <style>
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
    </style>
  `;

  // Clear session
  system.currentSession = null;

  // Wire up buttons
  setTimeout(() => {
    const closeBtn = document.getElementById('quiz-close-results');
    const retryBtn = document.getElementById('quiz-retry');

    if (closeBtn) {
      closeBtn.onclick = () => closeQuiz(system);
    }

    if (retryBtn) {
      retryBtn.onclick = () => startQuizSession(system);
    }
  }, 0);
}

/**
 * Close the quiz
 */
export function closeQuiz(system: QuizSystem): void {
  if (!system.popup) return;

  system.popup.style.opacity = '0';
  const popup = system.popup;

  setTimeout(() => {
    popup.remove();
    if (system.popup === popup) {
      system.popup = null;
    }
  }, 300);

  system.isOpen = false;
}

/**
 * Get quiz stats
 */
export function getQuizStats(system: QuizSystem): { highScore: number; totalQuizzes: number } {
  return {
    highScore: system.highScore,
    totalQuizzes: system.totalQuizzesTaken,
  };
}

// ============================================================================
// Persistence
// ============================================================================

interface QuizState {
  highScore: number;
  totalQuizzesTaken: number;
}

function loadQuizState(): QuizState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // localStorage may not be available
  }
  return { highScore: 0, totalQuizzesTaken: 0 };
}

function saveQuizState(system: QuizSystem): void {
  try {
    const state: QuizState = {
      highScore: system.highScore,
      totalQuizzesTaken: system.totalQuizzesTaken,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage may not be available
  }
}

// ============================================================================
// Cleanup
// ============================================================================

export function disposeQuizSystem(system: QuizSystem): void {
  system.cleanup();
}
