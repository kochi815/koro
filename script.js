// --- グローバル変数等 ---
let currentStage = 1; let gameMode = ''; let playerMaxHP = 15; let playerHP = playerMaxHP;
let currentEnemy = {}; let enemyMaxHP = 10; let enemyHP = enemyMaxHP;
let problems = []; let currentProblemIndex = 0; let questionStartTime;
let battleInProgress = false; let comboCount = 0; let isBgmEnabled = true;
const BGM_KEY = 'nekobattle_bgmEnabled_v1'; let questionsForThisStage = 15;
const HIGHEST_STAGE_KEY_PREFIX = 'nekobattle_highestStage_'; let highestClearedStage = 0;
let trainingType = ''; let trainingTimeLimit = 50; let trainingTimeRemaining = trainingTimeLimit; let trainingScore = 0; let trainingTimerInterval = null; const BEST_SCORE_KEY_PREFIX = 'nekobattle_bestScore_'; let currentTrainingProblem = null;
let comboDisplayTimeoutId = null;

// --- DOM要素取得 (変更なし) ---
const modeSelectScreen = document.getElementById("modeSelectScreen"); const grade1ModeBtn = document.getElementById("grade1ModeBtn"); const grade2ModeBtn = document.getElementById("grade2ModeBtn"); const grade3ModeBtn = document.getElementById("grade3ModeBtn"); const grade4ModeBtn = document.getElementById("grade4ModeBtn"); const grade5ModeBtn = document.getElementById("grade5ModeBtn"); const trainingModeBtn = document.getElementById("trainingModeBtn"); const startMethodScreen = document.getElementById("startMethodScreen"); const startFromBeginningBtn = document.getElementById("startFromBeginningBtn"); const continueFromLastBtn = document.getElementById("continueFromLastBtn"); const battleScreen = document.getElementById("battleScreen"); const startBtn = document.getElementById("startBtn"); const questionDiv = document.getElementById("question"); const answerChoicesDiv = document.getElementById("answerChoices"); const battleLog = document.getElementById("battleLog"); const enemyArea = document.getElementById("enemyArea"); const enemyName = document.getElementById("enemyName"); const enemyHPText = document.getElementById("enemyHPText"); const enemyHPBar = document.getElementById("enemyHPBar"); const enemyCharacter = document.getElementById("enemyCharacter"); const playerArea = document.getElementById("playerArea"); const playerHPText = document.getElementById("playerHPText"); const playerHPBar = document.getElementById("playerHPBar"); const playerCharacter = document.getElementById("playerCharacter"); const feedbackDisplay = document.getElementById("feedbackDisplay"); const comboDisplay = document.getElementById("comboDisplay"); const bgmToggleBtn = document.getElementById("bgmToggleBtn");
const damageEffectContainer = document.getElementById('damageEffectContainer');
const trainingTypeSelectScreen = document.getElementById("trainingTypeSelectScreen"); const trainingScreen = document.getElementById("trainingScreen"); const trainingTimer = document.getElementById("trainingTimer"); const trainingScoreDisplay = document.getElementById("trainingScore"); const trainingEnemyDisplay = document.getElementById("trainingEnemyDisplay"); const trainingQuestion = document.getElementById("trainingQuestion"); const trainingAnswerChoices = document.getElementById("trainingAnswerChoices"); const trainingResultScreen = document.getElementById("trainingResultScreen"); const finalScore = document.getElementById("finalScore"); const personalBest = document.getElementById("personalBest"); const retryTrainingBtn = document.getElementById("retryTrainingBtn"); const backToModeSelectBtn = document.getElementById("backToModeSelectBtn"); const backToModeSelectBtnFromTraining = document.getElementById("backToModeSelectBtnFromTraining");
const bossDefeatedOverlay = document.getElementById('bossDefeatedOverlay');
const bossDefeatedMessage = document.getElementById('bossDefeatedMessage');

// --- ★ 効果音とBGMの定義を更新 ★ ---
const sounds = {
    // UI & System
    tap: new Audio('se_click.mp3'),
    decision: new Audio('se_decision.mp3'),
    cancel: new Audio('se_cancel.mp3'),
    error: new Audio('se_error.mp3'),

    // Battle - Player Actions
    attackNormal: new Audio('se_attack.mp3'),
    attackCritical: new Audio('se_attack_critical.mp3'),
    attackFire: new Audio('se_attack_fire.mp3'), // 炎攻撃（将来用）
    attackIce: new Audio('se_attack_ice.mp3'),   // 氷攻撃（将来用）
    heal: new Audio('se_heal.mp3'),

    // Battle - Results
    hitPlayer: new Audio('se_damage.mp3'),
    win: new Audio('se_win.mp3'),
    correct: new Audio('se_correct.mp3'),
    wrong: new Audio('se_wrong.mp3'),

    // Training & Shop
    coin: new Audio('se_coin.mp3'),

    // BGM
    bgmTitle: new Audio('bgm_title.mp3'),
    bgmNormal: new Audio('bgm_battle.mp3'),
    bgmBoss: new Audio('bgm_boss.mp3'),
    bgmStudy: new Audio('bgm_study.mp3'),
    bgmShop: new Audio('bgm_shop.mp3'), // ショップ機能追加時に使用
    bgmClear: new Audio('bgm_clear.mp3'),
    bgmGameover: new Audio('bgm_gameover.mp3')
};
// BGMのループと音量設定
Object.keys(sounds).forEach(key => {
    if (key.startsWith('bgm')) {
        sounds[key].loop = true;
        sounds[key].volume = 0.4; // 基本の音量を40%に
    }
});
sounds.bgmBoss.volume = 0.35; // ボス戦は少し音量控えめ

let currentBgm = null;
function playSound(soundName) { if (!sounds[soundName]) return; sounds[soundName].currentTime = 0; sounds[soundName].play().catch(error => console.log(`Sound play failed (${soundName}):`, error)); }
function playBgm(bgmName) { if (!isBgmEnabled || !sounds[bgmName]) return; stopBgm(); sounds[bgmName].play().catch(error => console.log(`BGM play failed (${bgmName}):`, error)); currentBgm = sounds[bgmName]; }
function stopBgm() { if (currentBgm) { currentBgm.pause(); currentBgm.currentTime = 0; currentBgm = null; } }
function updateBgmButton() { if (isBgmEnabled) { bgmToggleBtn.classList.remove('muted'); bgmToggleBtn.textContent = '🔊'; } else { bgmToggleBtn.classList.add('muted'); bgmToggleBtn.textContent = '🔇'; } }
function loadBgmSetting() { const savedSetting = localStorage.getItem(BGM_KEY); isBgmEnabled = (savedSetting !== null) ? JSON.parse(savedSetting) : true; updateBgmButton(); }
bgmToggleBtn.addEventListener('click', () => { isBgmEnabled = !isBgmEnabled; localStorage.setItem(BGM_KEY, JSON.stringify(isBgmEnabled)); updateBgmButton(); if (isBgmEnabled) { if (!currentBgm && (battleScreen.style.display === 'flex' || trainingScreen.style.display === 'flex')) { if (trainingScreen.style.display === 'flex') playBgm('bgmStudy'); else if(modeSelectScreen.style.display === 'flex') playBgm('bgmTitle'); else if (currentEnemy && typeof currentEnemy.type !== 'undefined') playBgm(currentEnemy.type === 'boss' ? 'bgmBoss' : 'bgmNormal'); } } else { stopBgm(); } playSound('tap'); });


// (ここから下のコードは、関数の中身を一部変更しています)

// --- 敵データ (変更なし) ---
const enemies = { 1: { name: "ぷるぷるスライム", emoji: "💧", hp: 12, type: "normal" }, 2: { name: "スライム", emoji: "💧", hp: 12, type: "normal" }, 3: { name: "おおきなスライム", emoji: "💧", hp: 13, type: "normal" }, 4: { name: "ぶきみなコウモリ", emoji: "🦇", hp: 14, type: "normal" }, 5: { name: "ボス コウモリロード", emoji: "🦇👑", hp: 20, type: "boss" }, 6: { name: "さまようゴースト", emoji: "👻", hp: 16, type: "normal" }, 7: { name: "ゴーストチーフ", emoji: "👻", hp: 17, type: "normal" }, 8: { name: "ホネホネスケルトン", emoji: "💀", hp: 18, type: "normal" }, 9: { name: "スケルトンナイト", emoji: "💀", hp: 20, type: "normal" }, 10: { name: "ボス ゴブリンシャーマン", emoji: "👺✨", hp: 26, type: "boss" }, 11: { name: "くさったしたい", emoji: "🧟", hp: 21, type: "normal" }, 12: { name: "マッドハンド", emoji: "✋", hp: 22, type: "normal" }, 13: { name: "マッドハンドリーダー", emoji: "✋", hp: 24, type: "normal" }, 14: { name: "ガーゴイル", emoji: "🗿🦇", hp: 26, type: "normal" }, 15: { name: "ボス サイクロプス", emoji: "👁️", hp: 34, type: "boss" }, 16: { name: "オーク", emoji: "🐗", hp: 28, type: "normal" }, 17: { name: "オークリーダー", emoji: "🐗", hp: 30, type: "normal" }, 18: { name: "ミノタウロス", emoji: "🐂", hp: 32, type: "normal" }, 19: { name: "ミノタウロス（兄）", emoji: "🐂", hp: 35, type: "normal" }, 20: { name: "ボス リッチ", emoji: "💀👑", hp: 42, type: "boss" }, 21: { name: "アイスゴーレム", emoji: "🧊🗿", hp: 36, type: "normal" }, 22: { name: "フレイムゴーレム", emoji: "🔥🗿", hp: 38, type: "normal" }, 23: { name: "キメラ", emoji: "🦁🐐🐍", hp: 41, type: "normal" }, 24: { name: "キメラ（変異種）", emoji: "🦁🐐🐍", hp: 44, type: "normal" }, 25: { name: "ボス グリフォン", emoji: "🦅🦁", hp: 55, type: "boss" }, 26: { name: "レッサーデーモン", emoji: "👿", hp: 48, type: "normal" }, 27: { name: "アークデーモン", emoji: "🔥👿", hp: 52, type: "normal" }, 28: { name: "ダークナイト", emoji: "🛡️⚔️", hp: 56, type: "normal" }, 29: { name: "デスナイト", emoji: "💀⚔️", hp: 60, type: "normal" }, 30: { name: "ボス ドラゴンゾンビ", emoji: "💀🐉", hp: 72, type: "boss" }, 31: { name: "メタルスライム", emoji: "⚙️💧", hp: 20, type: "normal" }, 32: { name: "はぐれメタル", emoji: "✨💧", hp: 25, type: "normal" }, 33: { name: "魔界の騎士", emoji: "😈⚔️", hp: 65, type: "normal" }, 34: { name: "魔界の魔道士", emoji: "😈🧙", hp: 70, type: "normal" }, 35: { name: "ボス ヒドラ", emoji: "🐍🐍🐍", hp: 95, type: "boss" }, 36: { name: "魔王のしもべ・炎", emoji: "🔥しもべ", hp: 85, type: "normal" }, 37: { name: "魔王のしもべ・氷", emoji: "🧊しもべ", hp: 90, type: "normal" }, 38: { name: "魔王のしもべ・雷", emoji: "⚡しもべ", hp: 100, type: "normal" }, 39: { name: "魔王親衛隊長", emoji: "👑🛡️⚔️", hp: 115, type: "normal" }, 40: { name: "大魔王ニャンゾーマ", emoji: "😈👑🐈", hp: 141, type: "boss" } };
const maxStage = Object.keys(enemies).length;

// --- localStorage関連 (変更なし) ---
function getHighestStageKey(mode) { return `${HIGHEST_STAGE_KEY_PREFIX}${mode}_v2`; }
function saveHighestStage(mode, stage) { const key = getHighestStageKey(mode); const currentHighest = loadHighestStage(mode); if (stage > currentHighest && stage <= maxStage) { localStorage.setItem(key, stage.toString()); } }
function loadHighestStage(mode) { const key = getHighestStageKey(mode); const savedStage = localStorage.getItem(key); return savedStage ? parseInt(savedStage, 10) : 0; }
function getBestScoreKey(type) { return `${BEST_SCORE_KEY_PREFIX}${type}`; }
function saveBestScore(type, score) { const key = getBestScoreKey(type); const currentBest = loadBestScore(type); if (score > currentBest) { localStorage.setItem(key, score.toString()); return true; } return false; }
function loadBestScore(type) { const key = getBestScoreKey(type); const savedScore = localStorage.getItem(key); return savedScore ? parseInt(savedScore, 10) : 0; }

// --- 問題生成関数 (変更なし) ---
function generateProblems(stage, mode, count) { const generatedProblems = []; let num1, num2, num3, answer, questionText, type, correctAnswerValue; function generateAdditionUpTo99() { correctAnswerValue = Math.floor(Math.random() * 90) + 10; num1 = Math.floor(Math.random() * (correctAnswerValue - 1)) + 1; num2 = correctAnswerValue - num1; questionText = `${num1} + ${num2}`; type = '+'; return { q: questionText, a: correctAnswerValue, type: type }; } function generateSubtractionNoNegative() { num1 = Math.floor(Math.random() * 80) + 20; num2 = Math.floor(Math.random() * (num1 - 10)) + 10; correctAnswerValue = num1 - num2; questionText = `${num1} - ${num2}`; type = '-'; return { q: questionText, a: correctAnswerValue, type: type }; } function generateMul2DigitBy1Digit() { num1 = Math.floor(Math.random() * 80) + 20; num2 = Math.floor(Math.random() * 8) + 2; correctAnswerValue = num1 * num2; questionText = `${num1} × ${num2}`; type = '×'; return { q: questionText, a: correctAnswerValue, type: type }; } function generateDivAnswer2Digit() { correctAnswerValue = Math.floor(Math.random() * 90) + 10; num2 = Math.floor(Math.random() * 8) + 2; num1 = correctAnswerValue * num2; questionText = `${num1} ÷ ${num2}`; type = '÷'; return { q: questionText, a: correctAnswerValue, type: type }; } for (let i = 0; i < count; i++) { correctAnswerValue = null; questionText = ''; type = ''; let problemTypeRand = Math.random(); try { if (mode === 'grade1') { if (stage <= 10) { type = '+'; do { num1 = Math.floor(Math.random() * 11); num2 = Math.floor(Math.random() * (11 - num1)); } while (num1 === 0 && num2 === 0); correctAnswerValue = num1 + num2; questionText = `${num1} + ${num2}`; } else if (stage <= 20) { type = '-'; num1 = Math.floor(Math.random() * 10) + 1; num2 = Math.floor(Math.random() * num1); correctAnswerValue = num1 - num2; questionText = `${num1} - ${num2}`; } else if (stage <= 30) { type = '+'; do { num1 = Math.floor(Math.random() * 9) + 1; num2 = Math.floor(Math.random() * 9) + 1; } while (num1 + num2 < 10); correctAnswerValue = num1 + num2; questionText = `${num1} + ${num2}`; } else { if (problemTypeRand < 0.5) { type = '+'; num2 = Math.floor(Math.random() * 9) + 1; num1 = Math.floor(Math.random() * 10) + 1; if (num1 <= num2) { num1 = num2 + Math.floor(Math.random() * (10 - num2)) + 1; if(num1 > 10) num1 = 10;} correctAnswerValue = num1 - num2; questionText = `? + ${num2} = ${num1}`; } else { type = '-'; num1 = Math.floor(Math.random() * 9) + 2; correctAnswerValue = Math.floor(Math.random() * (num1 - 1)) + 1; num2 = num1 - correctAnswerValue; questionText = `${num1} - ? = ${num2}`; } } } else if (mode === 'grade2') { if (stage <= 10) { if (problemTypeRand < 0.5) { type = '+'; do { num1 = Math.floor(Math.random() * 9) + 1; num2 = Math.floor(Math.random() * 9) + 1; } while (num1 + num2 < 10); correctAnswerValue = num1 + num2; questionText = `${num1} + ${num2}`; } else { type = '-'; num1 = Math.floor(Math.random() * 10) + 10; num2 = Math.floor(Math.random() * (num1 - 9)) + 1; correctAnswerValue = num1 - num2; questionText = `${num1} - ${num2}`; } } else if (stage <= 20) { type = '×'; num1 = Math.floor(Math.random() * 5) + 1; num2 = Math.floor(Math.random() * 9) + 1; if(Math.random() < 0.5) [num1, num2] = [num2, num1]; correctAnswerValue = num1 * num2; questionText = `${num1} × ${num2}`; } else if (stage <= 30) { type = '×'; num1 = Math.floor(Math.random() * 9) + 1; num2 = Math.floor(Math.random() * 9) + 1; correctAnswerValue = num1 * num2; questionText = `${num1} × ${num2}`; } else { if (problemTypeRand < 0.5) { type = '+'; num1 = Math.floor(Math.random() * 9) + 1; num2 = Math.floor(Math.random() * 9) + 10; correctAnswerValue = num2 - num1; questionText = `${num1} + ? = ${num2}`; } else { type = '-'; num1 = Math.floor(Math.random() * 10) + 10; num2 = Math.floor(Math.random() * 9) + 1; correctAnswerValue = num1 - num2; questionText = `${num1} - ? = ${num2}`; } } } else if (mode === 'grade3') { if (stage <= 10) { type = '÷'; num2 = Math.floor(Math.random() * 8) + 2; correctAnswerValue = Math.floor(Math.random() * 8) + 2; num1 = num2 * correctAnswerValue; questionText = `${num1} ÷ ${num2}`; } else if (stage <= 20) { const problemData = generateAdditionUpTo99(); questionText = problemData.q; correctAnswerValue = problemData.a; type = problemData.type; } else if (stage <= 30) { const problemData = generateSubtractionNoNegative(); questionText = problemData.q; correctAnswerValue = problemData.a; type = problemData.type; } else { if (problemTypeRand < 0.5) { type = '×'; num2 = Math.floor(Math.random() * 8) + 2; correctAnswerValue = Math.floor(Math.random() * 8) + 2; num1 = num2 * correctAnswerValue; if (Math.random() < 0.5) { questionText = `? × ${num2} = ${num1}`; } else { questionText = `${correctAnswerValue} × ? = ${num1}`; correctAnswerValue = num2; } } else { type = '÷'; num2 = Math.floor(Math.random() * 8) + 2; num3 = Math.floor(Math.random() * 8) + 2; num1 = num2 * num3; if (Math.random() < 0.5) { questionText = `${num1} ÷ ? = ${num3}`; correctAnswerValue = num2; } else { questionText = `? ÷ ${num2} = ${num3}`; correctAnswerValue = num1; } } } } else if (mode === 'grade4') { if (stage <= 10) { if (problemTypeRand < 0.5) { const problemData = generateAdditionUpTo99(); questionText = problemData.q; correctAnswerValue = problemData.a; type = problemData.type; } else { const problemData = generateSubtractionNoNegative(); questionText = problemData.q; correctAnswerValue = problemData.a; type = problemData.type; } } else if (stage <= 20) { const problemData = generateMul2DigitBy1Digit(); questionText = problemData.q; correctAnswerValue = problemData.a; type = problemData.type; } else if (stage <= 30) { const problemData = generateDivAnswer2Digit(); questionText = problemData.q; correctAnswerValue = problemData.a; type = problemData.type; } else { const randType = Math.random(); if (randType < 0.25) { type = '+'; let p = generateAdditionUpTo99(); num1 = Math.min(p.a - 1, Math.max(10, Math.floor(Math.random()*p.a))); correctAnswerValue = p.a - num1; questionText = `${num1} + ? = ${p.a}`; } else if (randType < 0.5) { type = '-'; let p = generateSubtractionNoNegative(); num1 = p.a + p.q.split(' - ')[1]*1; correctAnswerValue = parseInt(p.q.split(' - ')[1]); questionText = `${num1} - ? = ${p.a}`; } else if (randType < 0.75) { type = '×'; let p = generateMul2DigitBy1Digit(); num2 = parseInt(p.q.split(' × ')[1]); correctAnswerValue = parseInt(p.q.split(' × ')[0]); questionText = `? × ${num2} = ${p.a}`; } else { type = '÷'; let p = generateDivAnswer2Digit(); num1 = p.a * parseInt(p.q.split(' ÷ ')[1]); correctAnswerValue = parseInt(p.q.split(' ÷ ')[1]); questionText = `${num1} ÷ ? = ${p.a}`; } } } else { if (stage <= 10) { if (problemTypeRand < 0.5) { const problemData = generateMul2DigitBy1Digit(); questionText = problemData.q; correctAnswerValue = problemData.a; type = problemData.type; } else { const problemData = generateDivAnswer2Digit(); questionText = problemData.q; correctAnswerValue = problemData.a; type = problemData.type; } } else if (stage <= 20) { if (problemTypeRand < 0.5) { type = '+'; num1 = Math.floor(Math.random() * 90) + 10; num2 = Math.floor(Math.random() * 90) + 10; correctAnswerValue = num1 + num2; questionText = `${num1} + ${num2}`; } else { const problemData = generateSubtractionNoNegative(); questionText = problemData.q; correctAnswerValue = problemData.a; type = problemData.type; } } else if (stage <= 30) { const randType = Math.random(); if (randType < 0.25) { const problemData = generateAdditionUpTo99(); questionText = problemData.q; correctAnswerValue = problemData.a; type = problemData.type; } else if (randType < 0.5) { const problemData = generateSubtractionNoNegative(); questionText = problemData.q; correctAnswerValue = problemData.a; type = problemData.type; } else if (randType < 0.75) { const problemData = generateMul2DigitBy1Digit(); questionText = problemData.q; correctAnswerValue = problemData.a; type = problemData.type; } else { const problemData = generateDivAnswer2Digit(); questionText = problemData.q; correctAnswerValue = problemData.a; type = problemData.type; } } else { const randType = Math.random(); if (randType < 0.25) { type = '+'; let p = generateAdditionUpTo99(); num1 = Math.min(p.a - 1, Math.max(10, Math.floor(Math.random()*p.a))); correctAnswerValue = p.a - num1; questionText = `${num1} + ? = ${p.a}`; } else if (randType < 0.5) { type = '-'; let p = generateSubtractionNoNegative(); num1 = p.a + p.q.split(' - ')[1]*1; correctAnswerValue = parseInt(p.q.split(' - ')[1]); questionText = `${num1} - ? = ${p.a}`; } else if (randType < 0.75) { type = '×'; let p = generateMul2DigitBy1Digit(); num2 = parseInt(p.q.split(' × ')[1]); correctAnswerValue = parseInt(p.q.split(' × ')[0]); questionText = `? × ${num2} = ${p.a}`; } else { type = '÷'; let p = generateDivAnswer2Digit(); num1 = p.a * parseInt(p.q.split(' ÷ ')[1]); correctAnswerValue = parseInt(p.q.split(' ÷ ')[1]); questionText = `${num1} ÷ ? = ${p.a}`; } } } if (questionText && correctAnswerValue !== null && typeof correctAnswerValue === 'number' && !isNaN(correctAnswerValue)) { generatedProblems.push({ q: questionText, a: correctAnswerValue }); } else { console.error("ERROR: Failed to generate valid problem!", {stage, mode, i, type, num1, num2, num3, questionText, correctAnswerValue}); generatedProblems.push({ q: "1 + 1", a: 2 }); } } catch (error) { console.error("ERROR during problem generation:", {stage, mode, i, error}); generatedProblems.push({ q: "2 + 2", a: 4 }); } } for (let i = generatedProblems.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [generatedProblems[i], generatedProblems[j]] = [generatedProblems[j], generatedProblems[i]]; } return generatedProblems; }

// --- 選択肢生成関数 (変更なし) ---
function generateChoices(correct) { const choices = new Set(); if (typeof correct !== 'number' || isNaN(correct)) { console.error("Invalid 'correct' answer:", correct); correct = 0; } correct = Math.round(correct); choices.add(correct); const maxAttempts = 50; let attempts = 0; while (choices.size < 6 && attempts < maxAttempts) { let wrongAnswer; const magnitude = Math.max(1, Math.abs(correct)); const range = Math.min(10, Math.ceil(magnitude * 0.4) + 4); let delta = Math.floor(Math.random() * (range * 2 + 1)) - range; if (Math.random() < 0.15) { delta += (Math.random() < 0.5 ? 1 : -1) * (Math.floor(Math.random() * 10) + 5); } if (delta === 0) delta = Math.random() < 0.5 ? 1 : -1; wrongAnswer = correct + delta; wrongAnswer = Math.round(wrongAnswer); if (wrongAnswer >= 0 && !choices.has(wrongAnswer)) { choices.add(wrongAnswer); } attempts++; } let filler = 1; while (choices.size < 6) { let fillChoice1 = Math.max(0, correct + filler); let fillChoice2 = Math.max(0, correct - filler); if (!choices.has(fillChoice1)) choices.add(fillChoice1); if (choices.size < 6 && fillChoice2 >= 0 && !choices.has(fillChoice2)) choices.add(fillChoice2); filler++; if (filler > correct + 20) break; } const choiceArray = Array.from(choices); choiceArray.sort(() => Math.random() - 0.5); return choiceArray; }

// --- 表示更新・演出系関数 (変更なし) ---
function updateHPBar(elementId, currentHP, maxHP) { const bar = document.getElementById(elementId); const percentage = Math.max(0, (currentHP / maxHP) * 100); bar.style.width = `${percentage}%`; }
function shakeCharacter(elementId) { const characterElement = document.getElementById(elementId); characterElement.classList.add('shake-animation'); setTimeout(() => { characterElement.classList.remove('shake-animation'); }, 200); }
function showFeedback(text, type) { feedbackDisplay.textContent = text; feedbackDisplay.className = 'show ' + type; setTimeout(() => { feedbackDisplay.className = ''; }, 800); }
function updateComboDisplay() { if (comboDisplayTimeoutId) { clearTimeout(comboDisplayTimeoutId); comboDisplayTimeoutId = null; } if (comboCount >= 3) { comboDisplay.textContent = `${comboCount} Combo!`; comboDisplay.classList.remove('great-combo', 'amazing-combo'); if (comboCount >= 10) { comboDisplay.classList.add('amazing-combo'); } else if (comboCount >= 5) { comboDisplay.classList.add('great-combo'); } comboDisplay.classList.add('show'); comboDisplayTimeoutId = setTimeout(() => { comboDisplay.classList.remove('show'); comboDisplayTimeoutId = null; }, 1500); } else { comboDisplay.classList.remove('show'); } }
function showDamageEffect(damage, isCritical) { if (!damageEffectContainer || damage <= 0) return; const damageText = document.createElement('span'); damageText.textContent = `-${damage}`; damageText.className = 'damage-popup'; if (isCritical) { damageText.classList.add('critical-damage'); } const randomOffsetX = Math.random() * 40 - 20; damageText.style.left = `calc(50% + ${randomOffsetX}px)`; damageEffectContainer.appendChild(damageText); setTimeout(() => { if (damageText.parentNode === damageEffectContainer) { damageEffectContainer.removeChild(damageText); } }, 800); }

// --- showQuestion関数 (変更なし) ---
function showQuestion() { battleInProgress = false; if (currentProblemIndex >= questionsForThisStage || playerHP <= 0 || enemyHP <= 0) { endBattle(); return; } if (!problems || problems.length <= currentProblemIndex) { console.error("Error: problems array invalid.", problems, currentProblemIndex); battleLog.textContent = "エラー：問題準備エラー"; endBattle(); return; } const p = problems[currentProblemIndex]; if (!p || typeof p.q === 'undefined' || typeof p.a === 'undefined') { console.error("Error: Invalid problem data.", p); battleLog.textContent = "エラー：問題データ不正"; endBattle(); return; } questionDiv.textContent = p.q; questionStartTime = Date.now(); battleLog.textContent = `Lv${currentStage} (${currentProblemIndex + 1}/${questionsForThisStage}) 問題！`; const choices = generateChoices(p.a); answerChoicesDiv.innerHTML = ""; if (Array.isArray(choices)) { choices.forEach(choice => { const btn = document.createElement("button"); btn.textContent = choice; btn.className = "choice-btn"; btn.onclick = () => handleAnswer(choice); answerChoicesDiv.appendChild(btn); }); } else { console.error("Error: choices not an array.", choices); battleLog.textContent = "エラー：選択肢生成失敗"; endBattle(); } }

// --- handleAnswer関数 (★効果音の追加★) ---
function handleAnswer(selectedAnswer) {
    if (battleInProgress) return;
    battleInProgress = true;
    const choiceButtons = answerChoicesDiv.querySelectorAll('.choice-btn');
    choiceButtons.forEach(btn => btn.disabled = true);
    // playSound('tap'); // ★ボタンクリック音はここから移動
    const elapsed = (Date.now() - questionStartTime) / 1000;
    const p = problems[currentProblemIndex];
    let feedbackClass = ''; let damageToEnemy = 0; let damageToPlayer = 0; let logMessage = ""; let feedbackText = ""; let feedbackType = ""; let isCritical = false;
    let criticalTime, perfectTime, greatTime, goodTime, slowPenalty, wrongPenalty, baseDmgCrit, baseDmgPerf, baseDmgGreat, baseDmgGood;
    switch (gameMode) {
        case 'grade1': criticalTime = 3.0; perfectTime = 5.0; greatTime = 7.0; goodTime = 10.0; slowPenalty = 0; wrongPenalty = 1; baseDmgCrit = 6; baseDmgPerf = 4; baseDmgGreat = 2; baseDmgGood = 1; break;
        case 'grade2': criticalTime = 2.0; perfectTime = 3.5; greatTime = 5.0; goodTime = 7.5; slowPenalty = 1; wrongPenalty = 1; baseDmgCrit = 6; baseDmgPerf = 4; baseDmgGreat = 2; baseDmgGood = 1; break;
        case 'grade3': criticalTime = 2.0; perfectTime = 3.5; greatTime = 5.0; goodTime = 7.5; slowPenalty = 1; wrongPenalty = 1; baseDmgCrit = 6; baseDmgPerf = 4; baseDmgGreat = 2; baseDmgGood = 1; break;
        case 'grade4': criticalTime = 3.0; perfectTime = 5.0; greatTime = 8.0; goodTime = 12.0; slowPenalty = 0; wrongPenalty = 1; baseDmgCrit = 6; baseDmgPerf = 4; baseDmgGreat = 2; baseDmgGood = 1; break;
        case 'grade5': criticalTime = 3.0; perfectTime = 5.0; greatTime = 9.0; goodTime = 14.0; slowPenalty = 0; wrongPenalty = 1; baseDmgCrit = 6; baseDmgPerf = 4; baseDmgGreat = 2; baseDmgGood = 1; break;
        default: criticalTime = 1.5; perfectTime = 2.5; greatTime = 4.0; goodTime = 6.0; slowPenalty = 1; wrongPenalty = 2; baseDmgCrit = 5; baseDmgPerf = 3; baseDmgGreat = 2; baseDmgGood = 1;
    }

    if (selectedAnswer === p.a) {
        playSound('correct'); // ★正解音を鳴らす
        comboCount++;
        let baseDamage = 0;
        if (elapsed < criticalTime) { baseDamage = baseDmgCrit; logMessage = `✨Critical Hit!✨ (${elapsed.toFixed(1)}秒) `; feedbackText = "Critical Hit!"; feedbackType = "critical"; isCritical = true; }
        else if (elapsed < perfectTime) { baseDamage = baseDmgPerf; logMessage = `Perfect! (${elapsed.toFixed(1)}秒) `; feedbackText = "Perfect!"; feedbackType = "perfect"; }
        else if (elapsed < greatTime) { baseDamage = baseDmgGreat; logMessage = `Great! (${elapsed.toFixed(1)}秒) `; feedbackText = "Great!"; feedbackType = "great"; }
        else if (elapsed < goodTime) { baseDamage = baseDmgGood; logMessage = `Good (${elapsed.toFixed(1)}秒) `; feedbackText = "Good"; feedbackType = "good"; }
        else { damageToPlayer = slowPenalty; logMessage = `Too slow... (${elapsed.toFixed(1)}秒) ${damageToPlayer > 0 ? `自分に${damageToPlayer}ダメージ!` : 'ダメージなし'}`; feedbackText = "Too Slow..."; feedbackType = "slow"; comboCount = 0; if (comboDisplayTimeoutId) { clearTimeout(comboDisplayTimeoutId); comboDisplayTimeoutId = null; } }
        let comboBonus = 0;
        if (comboCount >= 5) comboBonus = 2; else if (comboCount >= 3) comboBonus = 1;
        damageToEnemy = baseDamage + comboBonus;
        if (damageToEnemy > 0) {
            logMessage += `敵に${damageToEnemy}ダメージ!`;
            if (comboCount >= 3) logMessage += ` (${comboCount} Combo!)`;
            feedbackClass = 'feedback-flash';
            shakeCharacter('enemyCharacter');
            // ★攻撃音を鳴らす
            if (isCritical) { playSound('attackCritical'); } else { playSound('attackNormal'); }
            showDamageEffect(damageToEnemy, isCritical);
            // コンボ達成音は既存のものを流用
            if (sounds.comboMilestone && (comboCount === 5 || comboCount === 10 || comboCount === 15)) { playSound('comboMilestone'); }
        } else if (damageToPlayer > 0) { feedbackClass = 'feedback-damage-player'; shakeCharacter('playerCharacter'); playSound('hitPlayer'); }
        else { feedbackClass = 'feedback-correct'; }
    } else {
        playSound('wrong');
        damageToPlayer = wrongPenalty;
        logMessage = `Wrong! 自分に${damageToPlayer}ダメージ!`;
        feedbackText = "Wrong!"; feedbackType = "wrong"; feedbackClass = 'feedback-wrong';
        comboCount = 0; if (comboDisplayTimeoutId) { clearTimeout(comboDisplayTimeoutId); comboDisplayTimeoutId = null; }
        shakeCharacter('playerCharacter');
        playSound('hitPlayer');
    }
    updateComboDisplay();
    enemyHP -= damageToEnemy;
    playerHP -= damageToPlayer;
    enemyHPText.textContent = Math.max(0, enemyHP);
    playerHPText.textContent = Math.max(0, playerHP);
    updateHPBar('enemyHPBar', enemyHP, enemyMaxHP);
    updateHPBar('playerHPBar', playerHP, playerMaxHP);
    battleLog.textContent = logMessage;
    if(feedbackText) showFeedback(feedbackText, feedbackType);
    if (feedbackClass) { document.body.classList.add(feedbackClass); setTimeout(() => { document.body.classList.remove(feedbackClass); }, 150); }
    currentProblemIndex++;
    setTimeout(() => { if (playerHP <= 0 || enemyHP <= 0 || currentProblemIndex >= questionsForThisStage) { endBattle(); } else { showQuestion(); } }, 1000);
}

// --- startBattle関数 (変更なし) ---
function startBattle() { currentEnemy = enemies[currentStage] || enemies[maxStage]; if (!currentEnemy) { console.error("Error: Cannot find enemy data for stage", currentStage); return; } enemyMaxHP = currentEnemy.hp; if (currentEnemy.type === 'boss') { enemyMaxHP = Math.floor(enemyMaxHP * 1.5); } let hpMultiplier = 1.0; switch (gameMode) { case 'grade1': hpMultiplier = 0.7; break; case 'grade2': hpMultiplier = 0.7; break; case 'grade3': hpMultiplier = 0.9; break; case 'grade4': hpMultiplier = 0.95; break; case 'grade5': hpMultiplier = 1.0; break; } enemyMaxHP = Math.max(5, Math.floor(enemyMaxHP * hpMultiplier)); enemyHP = enemyMaxHP; playerHP = playerMaxHP; currentProblemIndex = 0; comboCount = 0; updateComboDisplay(); questionsForThisStage = (currentEnemy.type === 'boss') ? 35 : 25; problems = generateProblems(currentStage, gameMode, questionsForThisStage); if (!problems || problems.length === 0) { console.error("Error: generateProblems returned empty!", {currentStage, gameMode, questionsForThisStage}); battleLog.textContent = "エラー：問題生成失敗"; return; } enemyName.textContent = `${currentEnemy.emoji} ${currentEnemy.name} (Lv${currentStage})`; enemyHPText.textContent = enemyHP; playerHPText.textContent = playerHP; updateHPBar('enemyHPBar', enemyHP, enemyMaxHP); updateHPBar('playerHPBar', playerHP, playerMaxHP); enemyCharacter.textContent = currentEnemy.emoji; enemyCharacter.classList.remove('defeated'); stopBgm(); if (currentEnemy.type === 'boss') { document.body.classList.add('boss-battle-bg'); battleLog.textContent = `🔥ボス出現！ ${currentEnemy.name} があらわれた！🔥`; playBgm('bgmBoss'); } else { document.body.classList.remove('boss-battle-bg'); battleLog.textContent = `Lv${currentStage} ${currentEnemy.name} があらわれた！`; playBgm('bgmNormal'); } startBtn.style.display = "none"; battleInProgress = false; setTimeout(showQuestion, 1500); }

// --- endBattle関数 (★効果音・BGMの追加★) ---
function endBattle() {
    battleInProgress = true;
    answerChoicesDiv.innerHTML = "";
    questionDiv.textContent = "Battle End!";
    comboDisplay.classList.remove('show');
    if (comboDisplayTimeoutId) { clearTimeout(comboDisplayTimeoutId); comboDisplayTimeoutId = null; }
    stopBgm(); // ★まずBGMを止める

    let resultMessage = "";
    let nextButtonText = "";
    let isVictory = false;

    if (enemyHP <= 0) {
        isVictory = true;
        enemyCharacter.classList.add('defeated');

        if (currentEnemy.type === 'boss') {
            playSound('win'); // ★ボス撃破音
            if (bossDefeatedMessage) { bossDefeatedMessage.textContent = `🎉  ${currentEnemy.name} 撃破！ 🎉`; }
            if (bossDefeatedOverlay) { bossDefeatedOverlay.style.display = 'flex'; bossDefeatedOverlay.style.opacity = '1'; if (bossDefeatedMessage) { bossDefeatedMessage.style.opacity = '1'; bossDefeatedMessage.style.transform = 'scale(1)'; } }
            setTimeout(() => { if (bossDefeatedOverlay) { bossDefeatedOverlay.style.opacity = '0'; if (bossDefeatedMessage) { bossDefeatedMessage.style.opacity = '0'; bossDefeatedMessage.style.transform = 'scale(0.5)'; } setTimeout(() => { bossDefeatedOverlay.style.display = 'none'; }, 500); } }, 3000);
            resultMessage = `すごい！ボス ${currentEnemy.name} をたおした！🏆`;
        } else {
            playSound('win'); // ★通常勝利音
            resultMessage = `🎉勝利！ ${currentEnemy.name} をたおした！🎉`;
        }

        saveHighestStage(gameMode, currentStage);
        currentStage++;

        if (currentStage > maxStage) {
            resultMessage += " 🏆全ステージクリア！おめでとう！🏆";
            playBgm('bgmClear'); // ★全クリBGM
            if (startBtn) { startBtn.style.display = "none"; }
        } else {
            nextButtonText = `次の敵 (Lv${currentStage}) と戦う！`;
            if (startBtn) { startBtn.style.display = "inline-block"; }
        }

    } else {
        isVictory = false;
        resultMessage = playerHP <= 0 ? "😭敗北...また挑戦してね！" : "時間切れ...もう一度挑戦！";
        playBgm('bgmGameover'); // ★ゲームオーバーBGM
        nextButtonText = "再挑戦！";
        if (startBtn) { startBtn.style.display = "inline-block"; }
    }

    if (battleLog) { battleLog.textContent = resultMessage; }
    if (nextButtonText) { if (startBtn) { startBtn.textContent = nextButtonText; } }
    document.body.classList.add(isVictory ? 'feedback-correct' : 'feedback-wrong');
    setTimeout(() => { document.body.classList.remove('feedback-correct', 'feedback-wrong'); }, 1000);
    if (document.body.classList.contains('boss-battle-bg')) { setTimeout(() => { document.body.classList.remove('boss-battle-bg'); }, 500); }
}

// --- トレーニングモード関連関数 (★効果音の追加★) ---
function handleTrainingAnswer(selectedAnswer) {
    if (battleInProgress || trainingTimeRemaining <= 0) return;
    battleInProgress = true;
    const choiceButtons = trainingAnswerChoices.querySelectorAll('.choice-btn');
    choiceButtons.forEach(btn => btn.disabled = true);
    // playSound('tap'); // ここでは鳴らさない
    if (selectedAnswer === currentTrainingProblem.a) {
        playSound('correct'); // ★正解音
        showFeedback("Correct!", "perfect");
        trainingScore++;
        trainingScoreDisplay.textContent = `たおした数: ${trainingScore}`;
        trainingEnemyDisplay.classList.add('defeated');
    } else {
        playSound('wrong'); // ★不正解音
        showFeedback("Wrong!", "wrong");
        trainingTimeRemaining = Math.max(0, trainingTimeRemaining - 1);
        trainingTimer.textContent = `のこり時間: ${trainingTimeRemaining}秒`;
    }
    setTimeout(showTrainingQuestion, 200);
}
function startTraining(type) {
    gameMode = 'training'; trainingType = type; trainingScore = 0; trainingTimeRemaining = trainingTimeLimit; battleInProgress = false;
    modeSelectScreen.style.display = 'none'; trainingTypeSelectScreen.style.display = 'none'; battleScreen.style.display = 'none'; trainingScreen.style.display = 'flex'; trainingResultScreen.style.display = 'none';
    document.body.className = 'training-bg';
    trainingTimer.textContent = `のこり時間: ${trainingTimeRemaining}秒`;
    trainingScoreDisplay.textContent = `たおした数: ${trainingScore}`;
    trainingEnemyDisplay.textContent = '💧';
    stopBgm();
    playBgm('bgmStudy'); // ★勉強モードBGM
    showTrainingQuestion();
    trainingTimerInterval = setInterval(updateTrainingTimer, 1000);
}
function endTraining() {
    clearInterval(trainingTimerInterval); battleInProgress = true;
    stopBgm();
    playSound('coin'); // ★コイン獲得音
    finalScore.textContent = `${trainingScore} ひき たおした！`;
    const bestScore = loadBestScore(trainingType);
    personalBest.textContent = `じこベスト: ${bestScore} ひき`;
    if (saveBestScore(trainingType, trainingScore)) { personalBest.textContent += " ✨新記録！✨"; }
    trainingScreen.style.display = 'none'; trainingResultScreen.style.display = 'flex';
}

// --- モード選択/スタート方法選択 関連 (★効果音・BGMの追加★) ---
function showModeSelect() {
    stopBgm();
    playBgm('bgmTitle'); // ★タイトルBGM
    document.body.className = '';
    modeSelectScreen.style.display = 'flex';
    startMethodScreen.style.display = 'none'; battleScreen.style.display = 'none'; trainingTypeSelectScreen.style.display = 'none'; trainingScreen.style.display = 'none'; trainingResultScreen.style.display = 'none';
}
function selectMode(selectedMode) {
    playSound('decision'); // ★決定音
    gameMode = selectedMode;
    highestClearedStage = loadHighestStage(gameMode);
    modeSelectScreen.style.display = 'none';
    startMethodScreen.style.display = 'flex';
    if (highestClearedStage > 0 && highestClearedStage < maxStage) { const nextStage = highestClearedStage + 1; continueFromLastBtn.textContent = `つづきから (Lv ${nextStage})`; continueFromLastBtn.style.display = 'inline-block'; continueFromLastBtn.disabled = false; } else { continueFromLastBtn.style.display = 'none'; continueFromLastBtn.disabled = true; }
    loadBgmSetting();
}
function startGameFlow() {
    playSound('decision'); // ★決定音
    startMethodScreen.style.display = 'none';
    battleScreen.style.display = 'flex';
    document.body.className = '';
    startBattle();
}
// --- イベントリスナー (★効果音の追加★) ---
grade1ModeBtn.addEventListener("click", () => selectMode('grade1'));
grade2ModeBtn.addEventListener("click", () => selectMode('grade2'));
grade3ModeBtn.addEventListener("click", () => selectMode('grade3'));
grade4ModeBtn.addEventListener("click", () => selectMode('grade4'));
grade5ModeBtn.addEventListener("click", () => selectMode('grade5'));
trainingModeBtn.addEventListener("click", () => {
    playSound('tap');
    modeSelectScreen.style.display = 'none';
    trainingTypeSelectScreen.style.display = 'flex';
    stopBgm();
});
startFromBeginningBtn.addEventListener('click', () => { currentStage = 1; startGameFlow(); });
continueFromLastBtn.addEventListener('click', () => { currentStage = highestClearedStage + 1; if (currentStage > maxStage) currentStage = maxStage; startGameFlow(); });
startBtn.addEventListener("click", () => {
    playSound('decision'); // ★決定音
    enemyCharacter.classList.remove('defeated');
    startBattle();
});
document.querySelectorAll('.training-type-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        playSound('tap');
        const type = e.target.dataset.trainingType;
        startTraining(type);
    });
});
retryTrainingBtn.addEventListener('click', () => {
    playSound('decision'); // ★決定音
    trainingResultScreen.style.display = 'none';
    startTraining(trainingType);
});
backToModeSelectBtn.addEventListener('click', () => {
    playSound('cancel'); // ★キャンセル音
    showModeSelect();
});
backToModeSelectBtnFromTraining.addEventListener('click', () => {
    playSound('cancel'); // ★キャンセル音
    showModeSelect();
});
// --- 初期化処理 ---
loadBgmSetting();
playerHPText.textContent = playerHP;
updateHPBar('playerHPBar', playerHP, playerMaxHP);
showModeSelect();