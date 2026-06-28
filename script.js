// Misión Ecuación - versión mejorada con sonido, niveles, mapa, poderes y logros.

const screens = document.querySelectorAll('.screen');
const charactersContainer = document.getElementById('characters');
const startGameBtn = document.getElementById('startGameBtn');
const goCharactersBtn = document.getElementById('goCharactersBtn');
const howToPlayBtn = document.getElementById('howToPlayBtn');
const questionLimitSelect = document.getElementById('questionLimit');
const secondsSelect = document.getElementById('secondsPerQuestion');
const gameModeSelect = document.getElementById('gameMode');
const bestScoreStart = document.getElementById('bestScoreStart');
const bestScoreEnd = document.getElementById('bestScoreEnd');

const playerAvatar = document.getElementById('playerAvatar');
const playerName = document.getElementById('playerName');
const levelText = document.getElementById('levelText');
const scoreText = document.getElementById('scoreText');
const livesText = document.getElementById('livesText');
const streakText = document.getElementById('streakText');
const coinsText = document.getElementById('coinsText');
const questionCounter = document.getElementById('questionCounter');
const timerText = document.getElementById('timerText');
const timerBar = document.getElementById('timerBar');
const equationText = document.getElementById('equationText');
const questionLabel = document.querySelector('.question-label');
const feedbackText = document.getElementById('feedbackText');
const comboText = document.getElementById('comboText');
const answersContainer = document.getElementById('answers');
const levelMap = document.getElementById('levelMap');
const levelBadge = document.getElementById('levelBadge');
const missionType = document.getElementById('missionType');

const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const quitBtn = document.getElementById('quitBtn');
const hintBtn = document.getElementById('hintBtn');
const skipBtn = document.getElementById('skipBtn');
const shieldBtn = document.getElementById('shieldBtn');
const doubleBtn = document.getElementById('doubleBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const homeBtn = document.getElementById('homeBtn');
const soundToggleStart = document.getElementById('soundToggleStart');
const soundToggleGame = document.getElementById('soundToggleGame');
const pauseSoundBtn = document.getElementById('pauseSoundBtn');

const endTitle = document.getElementById('endTitle');
const endAvatar = document.getElementById('endAvatar');
const endMessage = document.getElementById('endMessage');
const finalScore = document.getElementById('finalScore');
const correctCount = document.getElementById('correctCount');
const finalCoins = document.getElementById('finalCoins');
const achievementList = document.getElementById('achievementList');
const achievementToast = document.getElementById('achievementToast');

const levelInfo = [
  { id: 1, icon: '🌱', name: 'Inicio', type: 'Ecuaciones: ax + b = c' },
  { id: 2, icon: '🌉', name: 'Puente', type: 'Problemas: a(x ± b) = c' },
  { id: 3, icon: '🏰', name: 'Castillo', type: 'Comparación: ax + b = cx + d' },
  { id: 4, icon: '🧪', name: 'Laboratorio', type: 'Reparto: (ax + b) ÷ n = c' },
  { id: 5, icon: '🚀', name: 'Cohete', type: 'Situaciones: a(x ± b) ± c = d' },
  { id: 6, icon: '👑', name: 'Jefe final', type: 'Reto: a(x ± b) = c(x ± d) ± e' }
];

const characters = [
  { id: 'neo', name: 'Neo', avatar: '🧑‍🚀', skill: '+10 segundos al iniciar', bonus: 'time' },
  { id: 'luna', name: 'Luna', avatar: '🧙‍♀️', skill: '1 ayuda 50/50 extra', bonus: 'hint' },
  { id: 'max', name: 'Max', avatar: '🤖', skill: '+20 puntos por acierto', bonus: 'score' },
  { id: 'sol', name: 'Sol', avatar: '🦊', skill: '1 salto extra', bonus: 'skip' },
  { id: 'kira', name: 'Kira', avatar: '🐉', skill: 'Empieza con 4 vidas', bonus: 'life' },
  { id: 'rex', name: 'Rex', avatar: '🦖', skill: '+2 monedas por acierto', bonus: 'coins' }
];

let state = {
  selectedCharacter: null,
  score: 0,
  lives: 3,
  streak: 0,
  correct: 0,
  coins: 0,
  currentQuestion: 0,
  totalQuestions: 12,
  secondsPerQuestion: 90,
  timeLeft: 90,
  timer: null,
  isPaused: false,
  currentEquation: null,
  level: 1,
  lastLevel: 1,
  answered: false,
  mode: 'aventura',
  hintUses: 1,
  skipUses: 1,
  shieldUses: 1,
  doubleUses: 1,
  shieldActive: false,
  doubleActive: false,
  achievements: new Set()
};

const audio = {
  ctx: null,
  master: null,
  musicTimer: null,
  step: 0,
  soundOn: localStorage.getItem('misionEcuacionSound') !== 'off'
};

function showScreen(id) {
  screens.forEach(screen => screen.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function getBestScore() {
  return Number(localStorage.getItem('misionEcuacionBestScore') || 0);
}

function saveBestScore(score) {
  const best = getBestScore();
  if (score > best) {
    localStorage.setItem('misionEcuacionBestScore', String(score));
  }
}

function updateBestScoreUI() {
  const best = getBestScore();
  bestScoreStart.textContent = best;
  bestScoreEnd.textContent = best;
}

function initAudio() {
  if (audio.ctx) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  audio.ctx = new AudioContext();
  audio.master = audio.ctx.createGain();
  audio.master.gain.value = 0.08;
  audio.master.connect(audio.ctx.destination);
}

function playTone(freq, duration = 0.18, type = 'sine', volume = 0.08) {
  if (!audio.soundOn) return;
  initAudio();
  if (!audio.ctx || !audio.master) return;

  const oscillator = audio.ctx.createOscillator();
  const gain = audio.ctx.createGain();
  oscillator.frequency.value = freq;
  oscillator.type = type;
  gain.gain.setValueAtTime(0.0001, audio.ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(volume, audio.ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.ctx.currentTime + duration);
  oscillator.connect(gain);
  gain.connect(audio.master);
  oscillator.start();
  oscillator.stop(audio.ctx.currentTime + duration + 0.02);
}

function playSfx(type) {
  if (!audio.soundOn) return;

  const sounds = {
    click: [330],
    correct: [523, 659, 784],
    wrong: [180, 145],
    level: [392, 523, 659, 880],
    shield: [247, 330, 494],
    achievement: [659, 784, 988],
    end: [523, 659, 784, 1046]
  };

  (sounds[type] || sounds.click).forEach((freq, index) => {
    setTimeout(() => playTone(freq, 0.16, type === 'wrong' ? 'sawtooth' : 'triangle', 0.09), index * 90);
  });
}

function startMusic() {
  if (!audio.soundOn || audio.musicTimer) return;
  initAudio();
  if (!audio.ctx) return;

  const melody = [262, 330, 392, 330, 294, 349, 440, 349, 330, 392, 523, 392];
  audio.musicTimer = setInterval(() => {
    if (!audio.soundOn || state.isPaused) return;
    const note = melody[audio.step % melody.length];
    playTone(note, 0.32, 'triangle', 0.035);
    if (audio.step % 4 === 0) playTone(note / 2, 0.38, 'sine', 0.025);
    audio.step += 1;
  }, 420);
}

function stopMusic() {
  clearInterval(audio.musicTimer);
  audio.musicTimer = null;
}

function setSound(on) {
  audio.soundOn = on;
  localStorage.setItem('misionEcuacionSound', on ? 'on' : 'off');
  updateSoundButtons();
  if (on) {
    playSfx('click');
    startMusic();
  } else {
    stopMusic();
  }
}

function toggleSound() {
  setSound(!audio.soundOn);
}

function updateSoundButtons() {
  const text = audio.soundOn ? '🔊 Sonido ON' : '🔇 Sonido OFF';
  soundToggleStart.textContent = text;
  pauseSoundBtn.textContent = text;
  soundToggleGame.textContent = audio.soundOn ? '🔊' : '🔇';
}

function renderCharacters() {
  charactersContainer.innerHTML = '';

  characters.forEach(character => {
    const card = document.createElement('button');
    card.className = 'character-card';
    card.type = 'button';
    card.innerHTML = `
      <div class="avatar">${character.avatar}</div>
      <h3>${character.name}</h3>
      <p>${character.skill}</p>
    `;

    card.addEventListener('click', () => {
      playSfx('click');
      state.selectedCharacter = character;
      document.querySelectorAll('.character-card').forEach(item => item.classList.remove('selected'));
      card.classList.add('selected');
      startGameBtn.disabled = false;
    });

    charactersContainer.appendChild(card);
  });
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function formatSigned(value) {
  return value >= 0 ? `+ ${value}` : `- ${Math.abs(value)}`;
}

function formatNumber(value) {
  return Number.isInteger(value) ? value : Number(value.toFixed(2));
}

function buildOptions(answer) {
  const options = new Set([answer]);
  const range = Math.max(10, state.level * 5);

  while (options.size < 4) {
    const variation = randomInt(-range, range);
    const candidate = answer + variation;
    if (candidate !== answer && candidate >= -60 && candidate <= 60) {
      options.add(candidate);
    }
  }

  return shuffle([...options]);
}

function createEquation(level) {
  const x = randomInt(-12, 14);
  let a, b, c, d, k, equation;

  if (level === 1) {
    a = randomInt(2, 9);
    b = randomInt(-12, 12);
    c = a * x + b;
    equation = `${a}x ${formatSigned(b)} = ${c}`;
  }

  if (level === 2) {
    a = randomInt(2, 8);
    b = randomInt(-8, 8);
    c = a * (x + b);
    equation = `${a}(x ${formatSigned(b)}) = ${c}`;
  }

  if (level === 3) {
    a = randomInt(3, 10);
    c = randomInt(1, a - 1);
    b = randomInt(-10, 10);
    d = (a - c) * x + b;
    equation = `${a}x ${formatSigned(b)} = ${c}x ${formatSigned(d)}`;
  }

  if (level === 4) {
    a = randomInt(2, 9);
    k = randomInt(2, 6);
    c = randomInt(-10, 14);
    b = c * k - a * x;
    equation = `(${a}x ${formatSigned(b)}) ÷ ${k} = ${c}`;
  }

  if (level === 5) {
    a = randomInt(2, 9);
    b = randomInt(-8, 8);
    c = randomInt(-14, 14);
    d = a * (x + b) + c;
    equation = `${a}(x ${formatSigned(b)}) ${formatSigned(c)} = ${d}`;
  }

  if (level >= 6) {
    a = randomInt(4, 11);
    c = randomInt(1, 8);
    if (a === c) c += 1;
    b = randomInt(-7, 7);
    d = randomInt(-7, 7);
    const e = a * (x + b) - c * (x + d);
    equation = `${a}(x ${formatSigned(b)}) = ${c}(x ${formatSigned(d)}) ${formatSigned(e)}`;
  }

  return {
    text: equation,
    answer: x,
    options: buildOptions(x),
    kind: 'equation'
  };
}

function createPositiveDivisionProblem() {
  let x, a, b, k, c;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    x = randomInt(2, 18);
    a = randomInt(2, 7);
    b = randomInt(3, 30);
    k = randomInt(2, 6);
    c = (a * x + b) / k;
    if (Number.isInteger(c)) break;
  }

  return { x, a, b, k, c };
}

function createWordProblem(level) {
  let x = randomInt(2, Math.min(28, 10 + level * 3));
  let a, b, c, d, e, k, text;

  if (level === 1) {
    a = randomInt(2, 6);
    b = randomInt(3, 15);
    c = a * x + b;
    const problems = [
      `En una tienda, cada paquete tiene ${a} cuadernos. Si Marco compra x paquetes y además recibe ${b} cuadernos sueltos, en total tiene ${c} cuadernos.
Ecuación: ${a}x + ${b} = ${c}. ¿Cuánto vale x?`,
      `Un número multiplicado por ${a} y aumentado en ${b} da como resultado ${c}.
Ecuación: ${a}x + ${b} = ${c}. ¿Cuál es el número x?`,
      `En una caja hay ${b} lápices extra. Si se agregan ${a} grupos de x lápices, se obtienen ${c} lápices en total.
Ecuación: ${a}x + ${b} = ${c}. ¿Cuánto vale x?`
    ];
    text = problems[randomInt(0, problems.length - 1)];
  }

  if (level === 2) {
    a = randomInt(2, 6);
    b = randomInt(2, 9);
    c = a * (x + b);
    const problems = [
      `En una actividad, se forman ${a} equipos. Cada equipo recibe x fichas y ${b} fichas adicionales. En total se entregan ${c} fichas.
Ecuación: ${a}(x + ${b}) = ${c}. ¿Cuánto vale x?`,
      `Una profesora prepara ${a} bolsas. En cada bolsa coloca x caramelos y luego agrega ${b} caramelos más. En total usa ${c} caramelos.
Ecuación: ${a}(x + ${b}) = ${c}. ¿Cuál es el valor de x?`,
      `Un juego entrega ${a} cofres. Cada cofre contiene x monedas y ${b} monedas de bono. En total hay ${c} monedas.
Ecuación: ${a}(x + ${b}) = ${c}. ¿Cuánto vale x?`
    ];
    text = problems[randomInt(0, problems.length - 1)];
  }

  if (level === 3) {
    a = randomInt(4, 9);
    c = randomInt(1, a - 1);
    b = randomInt(5, 18);
    d = (a - c) * x + b;
    const problems = [
      `Dos planes de internet cuestan lo mismo después de x meses. El Plan A cuesta ${a}x + ${b} soles y el Plan B cuesta ${c}x + ${d} soles.
Ecuación: ${a}x + ${b} = ${c}x + ${d}. ¿Cuánto vale x?`,
      `Ana y Luis juntan la misma cantidad de puntos. Ana tiene ${a}x + ${b} puntos y Luis tiene ${c}x + ${d} puntos.
Ecuación: ${a}x + ${b} = ${c}x + ${d}. ¿Cuál es x?`,
      `Dos rutas tienen el mismo costo. La ruta A cuesta ${a}x + ${b} y la ruta B cuesta ${c}x + ${d}.
Ecuación: ${a}x + ${b} = ${c}x + ${d}. ¿Cuánto vale x?`
    ];
    text = problems[randomInt(0, problems.length - 1)];
  }

  if (level === 4) {
    const data = createPositiveDivisionProblem();
    x = data.x;
    a = data.a;
    b = data.b;
    k = data.k;
    c = data.c;
    const problems = [
      `En un laboratorio se obtienen ${a}x + ${b} muestras y se reparten en ${k} bandejas iguales. Cada bandeja queda con ${c} muestras.
Ecuación: (${a}x + ${b}) ÷ ${k} = ${c}. ¿Cuánto vale x?`,
      `Un grupo reúne ${a}x + ${b} puntos y los divide entre ${k} estudiantes. Cada estudiante recibe ${c} puntos.
Ecuación: (${a}x + ${b}) ÷ ${k} = ${c}. ¿Cuál es el valor de x?`,
      `Se preparan ${a}x + ${b} tarjetas y se distribuyen por igual en ${k} sobres. Cada sobre recibe ${c} tarjetas.
Ecuación: (${a}x + ${b}) ÷ ${k} = ${c}. ¿Cuánto vale x?`
    ];
    text = problems[randomInt(0, problems.length - 1)];
    return {
      text,
      answer: x,
      options: buildOptions(x),
      kind: 'problem'
    };
  }

  if (level === 5) {
    a = randomInt(2, 7);
    b = randomInt(2, 8);
    c = randomInt(5, 20);
    d = a * (x + b) + c;
    const problems = [
      `Para una feria se arman ${a} cajas. Cada caja tiene x productos y ${b} productos adicionales. Luego se agregan ${c} productos sueltos. En total hay ${d} productos.
Ecuación: ${a}(x + ${b}) + ${c} = ${d}. ¿Cuánto vale x?`,
      `Un estudiante gana ${a} grupos de puntos. Cada grupo equivale a x + ${b} puntos, y además recibe ${c} puntos extra. Su total es ${d} puntos.
Ecuación: ${a}(x + ${b}) + ${c} = ${d}. ¿Cuál es x?`,
      `En una biblioteca hay ${a} estantes con x + ${b} libros cada uno, y aparte hay ${c} libros sobre una mesa. En total hay ${d} libros.
Ecuación: ${a}(x + ${b}) + ${c} = ${d}. ¿Cuánto vale x?`
    ];
    text = problems[randomInt(0, problems.length - 1)];
  }

  if (level >= 6) {
    a = randomInt(4, 10);
    c = randomInt(2, 8);
    if (a === c) c += 1;
    b = randomInt(2, 7);
    d = randomInt(2, 7);
    e = a * (x + b) - c * (x + d);
    const signText = e >= 0 ? `+ ${e}` : `- ${Math.abs(e)}`;
    const problems = [
      `Dos equipos deben llegar a la misma cantidad de puntos. El Equipo A logra ${a}(x + ${b}) puntos y el Equipo B logra ${c}(x + ${d}) ${signText} puntos.
Ecuación: ${a}(x + ${b}) = ${c}(x + ${d}) ${signText}. ¿Cuánto vale x?`,
      `Dos presupuestos son equivalentes. El primero es ${a}(x + ${b}) soles y el segundo es ${c}(x + ${d}) ${signText} soles.
Ecuación: ${a}(x + ${b}) = ${c}(x + ${d}) ${signText}. ¿Cuál es x?`,
      `En una competencia, dos formas de calcular el puntaje final coinciden: ${a}(x + ${b}) y ${c}(x + ${d}) ${signText}.
Ecuación: ${a}(x + ${b}) = ${c}(x + ${d}) ${signText}. ¿Cuánto vale x?`
    ];
    text = problems[randomInt(0, problems.length - 1)];
  }

  return {
    text,
    answer: x,
    options: buildOptions(x),
    kind: 'problem'
  };
}

function createChallenge(level) {
  const shouldUseProblem = state.currentQuestion % 2 === 1 || Math.random() < 0.35;
  return shouldUseProblem ? createWordProblem(level) : createEquation(level);
}

function calculateLevel() {
  if (state.mode === 'practica') {
    return Math.min(4, Math.floor(state.currentQuestion / 4) + 1);
  }

  const levels = state.mode === 'desafio' ? 6 : levelInfo.length;
  const block = Math.max(1, Math.ceil(state.totalQuestions / levels));
  return Math.min(levels, Math.floor(state.currentQuestion / block) + 1);
}

function renderLevelMap() {
  levelMap.innerHTML = '';
  levelInfo.forEach(info => {
    const node = document.createElement('div');
    node.className = 'level-node';
    if (info.id < state.level) node.classList.add('completed');
    if (info.id === state.level) node.classList.add('active');
    if (info.id > state.level) node.classList.add('locked');
    node.innerHTML = `
      <span>${info.icon}</span>
      <strong>${info.id}</strong>
      <small>${info.name}</small>
    `;
    levelMap.appendChild(node);
  });
}

function updateGameUI() {
  const info = levelInfo[state.level - 1] || levelInfo[levelInfo.length - 1];
  scoreText.textContent = state.score;
  livesText.textContent = '❤️'.repeat(state.lives) || '💔';
  streakText.textContent = state.streak;
  coinsText.textContent = state.coins;
  levelText.textContent = `Nivel ${state.level}: ${info.name}`;
  levelBadge.textContent = `${info.icon} Nivel ${state.level}`;
  missionType.textContent = info.type;
  questionCounter.textContent = `Pregunta ${state.currentQuestion + 1}/${state.totalQuestions}`;
  timerText.textContent = `${state.timeLeft}s`;
  timerBar.style.width = `${(state.timeLeft / state.secondsPerQuestion) * 100}%`;
  comboText.textContent = state.streak >= 2 ? `🔥 Racha x${state.streak}` : '';

  hintBtn.textContent = `50/50 (${state.hintUses})`;
  skipBtn.textContent = `Saltar (${state.skipUses})`;
  shieldBtn.textContent = state.shieldActive ? '🛡️ Escudo activo' : `Escudo (${state.shieldUses})`;
  doubleBtn.textContent = state.doubleActive ? '✨ x2 activo' : `x2 puntos (${state.doubleUses})`;

  hintBtn.disabled = state.hintUses <= 0 || state.answered;
  skipBtn.disabled = state.skipUses <= 0 || state.answered;
  shieldBtn.disabled = (state.shieldUses <= 0 && !state.shieldActive) || state.answered;
  doubleBtn.disabled = state.doubleUses <= 0 || state.doubleActive || state.answered;
  shieldBtn.classList.toggle('active-power', state.shieldActive);
  doubleBtn.classList.toggle('active-power', state.doubleActive);

  renderLevelMap();
}

function applyCharacterBonus() {
  if (!state.selectedCharacter) return;

  if (state.selectedCharacter.bonus === 'life') state.lives = 4;
  if (state.selectedCharacter.bonus === 'hint') state.hintUses += 1;
  if (state.selectedCharacter.bonus === 'skip') state.skipUses += 1;
  if (state.selectedCharacter.bonus === 'time') state.secondsPerQuestion += 10;
}

function startGame() {
  playSfx('click');
  startMusic();

  state.score = 0;
  state.lives = 3;
  state.streak = 0;
  state.correct = 0;
  state.coins = 0;
  state.currentQuestion = 0;
  state.totalQuestions = Number(questionLimitSelect.value);
  state.secondsPerQuestion = Number(secondsSelect.value);
  state.mode = gameModeSelect.value;
  state.timeLeft = state.secondsPerQuestion;
  state.hintUses = state.mode === 'desafio' ? 1 : 2;
  state.skipUses = state.mode === 'desafio' ? 1 : 2;
  state.shieldUses = state.mode === 'desafio' ? 1 : 2;
  state.doubleUses = state.mode === 'desafio' ? 1 : 2;
  state.shieldActive = false;
  state.doubleActive = false;
  state.isPaused = false;
  state.answered = false;
  state.achievements = new Set();
  applyCharacterBonus();

  playerAvatar.textContent = state.selectedCharacter.avatar;
  playerName.textContent = state.selectedCharacter.name;

  showScreen('gameScreen');
  loadQuestion();
}

function loadQuestion() {
  clearInterval(state.timer);
  state.level = calculateLevel();

  if (state.currentQuestion > 0 && state.level !== state.lastLevel) {
    playSfx('level');
    unlockAchievement(`nivel-${state.level}`, `Llegaste al nivel ${state.level}`);
  }
  state.lastLevel = state.level;

  state.currentEquation = createChallenge(state.level);
  state.timeLeft = state.secondsPerQuestion;
  state.answered = false;
  state.doubleActive = false;
  feedbackText.textContent = '';
  feedbackText.className = 'feedback';
  questionLabel.textContent = state.currentEquation.kind === 'problem'
    ? 'Lee el problema y encuentra el valor de x:'
    : 'Resuelve la ecuación:';
  equationText.classList.toggle('problem-text', state.currentEquation.kind === 'problem');
  equationText.textContent = state.currentEquation.text;
  answersContainer.innerHTML = '';

  state.currentEquation.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.className = 'answer-btn';
    button.type = 'button';
    button.textContent = `${index + 1}) x = ${formatNumber(option)}`;
    button.dataset.value = option;
    button.addEventListener('click', () => checkAnswer(option, button));
    answersContainer.appendChild(button);
  });

  updateGameUI();
  startTimer();
}

function startTimer() {
  state.timer = setInterval(() => {
    if (state.isPaused) return;

    state.timeLeft -= 1;
    updateGameUI();

    if (state.timeLeft <= 0) {
      clearInterval(state.timer);
      loseLife('⏱ Se acabó el tiempo.');
    }
  }, 1000);
}

function addReward(baseScore) {
  let earned = baseScore;
  if (state.selectedCharacter?.bonus === 'score') earned += 20;
  if (state.doubleActive) earned *= 2;
  state.score += earned;

  let coinsEarned = 5;
  if (state.timeLeft > state.secondsPerQuestion / 2) coinsEarned += 2;
  if (state.streak >= 3) coinsEarned += 3;
  if (state.selectedCharacter?.bonus === 'coins') coinsEarned += 2;
  state.coins += coinsEarned;

  return { earned, coinsEarned };
}

function checkAnswer(option, selectedButton) {
  if (state.answered) return;

  state.answered = true;
  clearInterval(state.timer);
  const isCorrect = option === state.currentEquation.answer;
  const buttons = document.querySelectorAll('.answer-btn');

  buttons.forEach(button => {
    button.disabled = true;
    if (Number(button.dataset.value) === state.currentEquation.answer) {
      button.classList.add('correct-answer');
    }
  });

  if (isCorrect) {
    state.correct += 1;
    state.streak += 1;
    const speedBonus = state.timeLeft * 3;
    const streakBonus = state.streak >= 3 ? 50 : 0;
    const { earned, coinsEarned } = addReward(100 + speedBonus + streakBonus);
    feedbackText.textContent = state.doubleActive
      ? `✅ ¡Correcto! x2 activado: +${earned} puntos y +${coinsEarned} monedas.`
      : `✅ ¡Correcto! +${earned} puntos y +${coinsEarned} monedas.`;
    feedbackText.classList.add('correct');
    playSfx('correct');
    checkAchievements();
  } else {
    selectedButton.classList.add('wrong-answer');
    handleMistake(`❌ Incorrecto. La respuesta era x = ${state.currentEquation.answer}.`);
  }

  state.doubleActive = false;
  updateGameUI();
  setTimeout(nextQuestion, 1500);
}

function handleMistake(message) {
  state.streak = 0;
  state.doubleActive = false;

  if (state.shieldActive) {
    state.shieldActive = false;
    feedbackText.textContent = `🛡️ ${message} El escudo te protegió y no pierdes vida.`;
    feedbackText.classList.add('correct');
    playSfx('shield');
    return;
  }

  state.lives -= 1;
  feedbackText.textContent = message;
  feedbackText.classList.add('wrong');
  playSfx('wrong');
}

function loseLife(message) {
  if (state.answered) return;

  state.answered = true;
  document.querySelectorAll('.answer-btn').forEach(button => {
    button.disabled = true;
    if (Number(button.dataset.value) === state.currentEquation.answer) {
      button.classList.add('correct-answer');
    }
  });

  handleMistake(`${message} Respuesta: x = ${state.currentEquation.answer}.`);
  updateGameUI();
  setTimeout(nextQuestion, 1600);
}

function nextQuestion() {
  if (state.lives <= 0) {
    endGame(false);
    return;
  }

  state.currentQuestion += 1;

  if (state.currentQuestion >= state.totalQuestions) {
    endGame(true);
    return;
  }

  loadQuestion();
}

function endGame(completed) {
  clearInterval(state.timer);
  playSfx('end');
  saveBestScore(state.score);
  updateBestScoreUI();

  const percentage = Math.round((state.correct / state.totalQuestions) * 100);
  if (percentage === 100) unlockAchievement('perfecto', 'Partida perfecta');
  if (state.coins >= 80) unlockAchievement('tesoro', 'Recolectaste muchas monedas');
  if (state.score > 1500) unlockAchievement('puntaje-alto', 'Puntaje poderoso');

  finalScore.textContent = state.score;
  correctCount.textContent = `${state.correct}/${state.totalQuestions}`;
  finalCoins.textContent = state.coins;
  endAvatar.textContent = completed ? '🏆' : '💪';
  endTitle.textContent = completed ? '¡Misión completada!' : 'Fin de la partida';

  let message = '';
  if (percentage >= 90) {
    message = 'Excelente trabajo. Dominas muy bien las ecuaciones y avanzaste con gran precisión.';
  } else if (percentage >= 70) {
    message = 'Muy buen avance. Sigue practicando para mejorar rapidez y seguridad.';
  } else if (percentage >= 50) {
    message = 'Vas por buen camino. Revisa con calma los pasos para despejar x.';
  } else {
    message = 'Necesitas practicar un poco más. Intenta usar los poderes estratégicamente.';
  }

  endMessage.textContent = `${state.selectedCharacter.avatar} ${message}`;
  renderAchievements();
  showScreen('endScreen');
}

function useHint() {
  if (state.hintUses <= 0 || state.answered) return;
  playSfx('click');
  state.hintUses -= 1;

  const wrongButtons = [...document.querySelectorAll('.answer-btn')]
    .filter(button => Number(button.dataset.value) !== state.currentEquation.answer && !button.disabled);

  shuffle(wrongButtons).slice(0, 2).forEach(button => {
    button.classList.add('hidden-answer');
    button.disabled = true;
  });

  unlockAchievement('estratega', 'Usaste una ayuda estratégica');
  updateGameUI();
}

function useSkip() {
  if (state.skipUses <= 0 || state.answered) return;
  playSfx('click');
  state.skipUses -= 1;
  clearInterval(state.timer);
  feedbackText.textContent = '➡️ Pregunta saltada. No pierdes vida, pero tampoco sumas puntos.';
  feedbackText.className = 'feedback';
  state.answered = true;
  state.doubleActive = false;
  updateGameUI();
  setTimeout(nextQuestion, 1000);
}

function useShield() {
  if (state.shieldUses <= 0 || state.answered || state.shieldActive) return;
  state.shieldUses -= 1;
  state.shieldActive = true;
  playSfx('shield');
  feedbackText.textContent = '🛡️ Escudo activado. Tu próximo error no quitará vida.';
  feedbackText.className = 'feedback correct';
  updateGameUI();
}

function useDouble() {
  if (state.doubleUses <= 0 || state.answered || state.doubleActive) return;
  state.doubleUses -= 1;
  state.doubleActive = true;
  playSfx('achievement');
  feedbackText.textContent = '✨ x2 activado. Si aciertas esta pregunta, duplicas tus puntos.';
  feedbackText.className = 'feedback correct';
  updateGameUI();
}

function pauseGame() {
  state.isPaused = true;
  showScreen('pauseScreen');
}

function resumeGame() {
  playSfx('click');
  state.isPaused = false;
  showScreen('gameScreen');
}

function quitGame() {
  clearInterval(state.timer);
  state.isPaused = false;
  showScreen('startScreen');
}

function unlockAchievement(id, text) {
  if (state.achievements.has(id)) return;
  state.achievements.add(id);
  achievementToast.textContent = `🏅 Logro: ${text}`;
  achievementToast.classList.add('show');
  playSfx('achievement');
  setTimeout(() => achievementToast.classList.remove('show'), 1800);
}

function checkAchievements() {
  if (state.correct === 1) unlockAchievement('primer-acierto', 'Primer acierto');
  if (state.streak === 3) unlockAchievement('racha-3', 'Racha de 3 aciertos');
  if (state.streak === 5) unlockAchievement('racha-5', 'Racha de 5 aciertos');
  if (state.timeLeft >= Math.ceil(state.secondsPerQuestion * 0.7)) unlockAchievement('velocidad', 'Respuesta veloz');
}

function renderAchievements() {
  achievementList.innerHTML = '';
  const names = {
    'primer-acierto': '✅ Primer acierto',
    'racha-3': '🔥 Racha de 3',
    'racha-5': '🚀 Racha de 5',
    velocidad: '⚡ Respuesta veloz',
    estratega: '🧩 Ayuda estratégica',
    perfecto: '👑 Partida perfecta',
    tesoro: '💰 Tesoro de monedas',
    'puntaje-alto': '⭐ Puntaje poderoso'
  };

  state.achievements.forEach(id => {
    const badge = document.createElement('span');
    badge.className = 'mini-achievement';
    badge.textContent = names[id] || `🏅 ${id.replace('-', ' ')}`;
    achievementList.appendChild(badge);
  });

  if (!state.achievements.size) {
    achievementList.innerHTML = '<p class="empty-achievements">Todavía no desbloqueaste logros. Inténtalo otra vez.</p>';
  }
}

// Eventos principales
goCharactersBtn.addEventListener('click', () => {
  playSfx('click');
  showScreen('characterScreen');
});
howToPlayBtn.addEventListener('click', () => {
  playSfx('click');
  showScreen('howToPlayScreen');
});
startGameBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
resumeBtn.addEventListener('click', resumeGame);
quitBtn.addEventListener('click', quitGame);
hintBtn.addEventListener('click', useHint);
skipBtn.addEventListener('click', useSkip);
shieldBtn.addEventListener('click', useShield);
doubleBtn.addEventListener('click', useDouble);
playAgainBtn.addEventListener('click', () => showScreen('characterScreen'));
homeBtn.addEventListener('click', () => showScreen('startScreen'));
soundToggleStart.addEventListener('click', toggleSound);
soundToggleGame.addEventListener('click', toggleSound);
pauseSoundBtn.addEventListener('click', toggleSound);

document.querySelectorAll('[data-back]').forEach(button => {
  button.addEventListener('click', () => {
    playSfx('click');
    showScreen(button.dataset.back);
  });
});

// Atajo de teclado: presionar 1, 2, 3 o 4 para responder.
document.addEventListener('keydown', event => {
  if (!document.getElementById('gameScreen').classList.contains('active')) return;
  const index = Number(event.key) - 1;
  const buttons = [...document.querySelectorAll('.answer-btn')];
  if (index >= 0 && index < buttons.length && !buttons[index].disabled) {
    buttons[index].click();
  }
});

renderCharacters();
updateBestScoreUI();
updateSoundButtons();
