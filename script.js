// ===================================
// グローバル変数
// ===================================
let player = {}; let currentEnemy; let currentEnemyIndex = 0; let coins = 0;
let currentBgm = null; let studyQuestionStartTime;
let studyDifficulty = 'normal'; // ★ 勉強の難易度を保持する変数を追加

// ===================================
// 効果音とBGM
// ===================================
const sounds = {
    click: new Audio('se_click.mp3'), decision: new Audio('se_decision.mp3'),
    cancel: new Audio('se_cancel.mp3'), error: new Audio('se_error.mp3'),
    levelup: new Audio('se_win.mp3'), attack: new Audio('se_attack.mp3'),
    attack_critical: new Audio('se_attack_critical.mp3'), damage: new Audio('se_damage.mp3'),
    heal: new Audio('se_heal.mp3'), win: new Audio('se_win.mp3'),
    correct: new Audio('se_correct.mp3'), wrong: new Audio('se_wrong.mp3'),
    coin: new Audio('se_coin.mp3'), bgm_title: new Audio('bgm_title.mp3'),
    bgm_battle: new Audio('bgm_battle.mp3'), bgm_shop: new Audio('bgm_shop.mp3'),
    bgm_study: new Audio('bgm_study.mp3'), bgm_clear: new Audio('bgm_clear.mp3'),
    bgm_gameover: new Audio('bgm_gameover.mp3')
};
Object.keys(sounds).forEach(key => {
    if (key.startsWith('bgm')) { sounds[key].loop = true; sounds[key].volume = 0.5; }
    else { sounds[key].volume = 0.8; }
});
function playSound(soundName) { if (sounds[soundName]) { sounds[soundName].currentTime = 0; sounds[soundName].play().catch(e => console.error("Sound play failed:", e)); } }
function playBgm(bgmName) { if (currentBgm === sounds[bgmName]) return; stopBgm(); if (sounds[bgmName]) { currentBgm = sounds[bgmName]; currentBgm.play().catch(e => console.error("BGM play failed:", e)); } }
function stopBgm() { if (currentBgm) { currentBgm.pause(); currentBgm.currentTime = 0; currentBgm = null; } }

// ===================================
// HTML要素の取得 (★ 更新)
// ===================================
const characterSelectContainer = document.getElementById('character-select-container');
const characterListEl = document.getElementById('character-list');
const homeContainer = document.getElementById('home-container');
const gameContainer = document.getElementById('game-container');
const studyContainer = document.getElementById('study-container');
const shopContainer = document.getElementById('shop-container');
const modalContainer = document.getElementById('modal-container');
const homePlayerEmojiEl = document.getElementById('home-player-emoji');
const homePlayerNameEl = document.getElementById('home-player-name');
const homePlayerLevelEl = document.getElementById('home-player-level');
const homeCoinDisplayEl = document.getElementById('home-coin-display');
const goToBattleBtn = document.getElementById('go-to-battle-btn');
const goToStudyBtn = document.getElementById('go-to-study-btn');
const goToShopBtn = document.getElementById('go-to-shop-btn');
const backToHomeBtn = document.getElementById('back-to-home-from-battle');
const playerNameEl = document.getElementById('player-info-text');
const playerLevelTextEl = document.getElementById('player-level-text');
const playerHpTextEl = document.getElementById('player-hp-text');
const playerMpTextEl = document.getElementById('player-mp-text');
const playerExpTextEl = document.getElementById('player-exp-text');
const playerHpBarEl = document.getElementById('player-hp-bar');
const playerMpBarEl = document.getElementById('player-mp-bar');
const playerExpBarEl = document.getElementById('player-exp-bar');
const playerCharacterEl = document.getElementById('player-character');
const enemyNameEl = document.getElementById('enemy-name');
const enemyHpTextEl = document.getElementById('enemy-hp-text');
const enemyHpBarEl = document.getElementById('enemy-hp-bar');
const enemyCharacterEl = document.getElementById('enemy-character');
const messageTextEl = document.getElementById('message-text');
const attackBtn = document.getElementById('attack-btn');
const skillsBtn = document.getElementById('skills-btn');
const itemsBtn = document.getElementById('items-btn');
const restartBtn = document.getElementById('restart-btn');
const closeStudyBtn = document.getElementById('close-study-btn');
const studyDifficultySelectEl = document.getElementById('study-difficulty-select'); // ★ 追加
const studyQuestionScreenEl = document.getElementById('study-question-screen'); // ★ 追加
const backToDifficultySelectBtn = document.getElementById('back-to-difficulty-select-btn'); // ★ 追加
const questionProgressEl = document.getElementById('question-progress');
const studyScoreEl = document.getElementById('study-score');
const studyFeedbackTextEl = document.getElementById('study-feedback-text');
const questionTextEl = document.getElementById('question-text');
const studyAnswerChoicesEl = document.getElementById('study-answer-choices');
const closeShopBtn = document.getElementById('close-shop-btn');
const shopItemsListEl = document.getElementById('shop-items-list');
const shopMessageEl = document.getElementById('shop-message');
const modalListEl = document.getElementById('modal-list');
const modalCloseBtn = document.getElementById('modal-close-btn');

// ===================================
// ゲームの初期化・画面遷移 (★ 更新)
// ===================================
function switchScreen(screenId) { [characterSelectContainer, homeContainer, gameContainer, studyContainer, shopContainer].forEach(s => s.classList.add('hidden')); document.getElementById(screenId).classList.remove('hidden'); }
function initializeCharacterSelection() { playBgm('bgm_title'); characterListEl.innerHTML = ''; CHARACTERS.forEach(char => { const card = document.createElement('div'); card.className = 'character-card'; card.innerHTML = `<div class="char-emoji">${char.emoji}</div><div class="char-name">${char.name}</div><div class="char-description">${char.description}</div>`; card.addEventListener('click', () => { playSound('decision'); selectCharacter(char.id); }); characterListEl.appendChild(card); }); }
function selectCharacter(charId) { const data = CHARACTERS.find(c => c.id === charId); player = { ...JSON.parse(JSON.stringify(data)), hp: data.maxHp, mp: data.maxMp, weapon: null, armor: null, items: [{ id: 'herb', name: 'やくそう', count: 2, emoji: '🌿' }], get attack() { return this.baseAttack + (this.weapon ? this.weapon.power : 0); }, get defense() { return this.baseDefense + (this.armor ? this.armor.power : 0); }, }; currentEnemyIndex = 0; coins = 0; showHomeScreen(); }
function showHomeScreen() { playBgm('bgm_title'); switchScreen('home-container'); homePlayerEmojiEl.textContent = player.emoji; homePlayerNameEl.textContent = player.name; homePlayerLevelEl.textContent = `Lv. ${player.level}`; homeCoinDisplayEl.textContent = `💰 ${coins} コイン`; }
function openBattleMode() { playSound('decision'); playBgm('bgm_battle'); switchScreen('game-container'); setupNextEnemy(); }
function openShop() { playSound('decision'); playBgm('bgm_shop'); switchScreen('shop-container'); shopMessageEl.textContent = `現在の所持コイン: ${coins}コイン`; renderShopItems(); }

// ===================================
// 表示更新
// ===================================
function updatePlayerStatus() { playerNameEl.textContent = player.name; playerLevelTextEl.textContent = `Lv. ${player.level}`; playerCharacterEl.textContent = player.emoji; playerHpTextEl.textContent = `${player.hp} / ${player.maxHp}`; playerMpTextEl.textContent = `${player.mp} / ${player.maxMp}`; playerExpTextEl.textContent = `あと ${player.nextLevelExp - player.exp}`; playerHpBarEl.style.width = `${(player.hp / player.maxHp) * 100}%`; playerMpBarEl.style.width = `${(player.mp / player.maxMp) * 100}%`; playerExpBarEl.style.width = `${(player.exp / player.nextLevelExp) * 100}%`; }
function updateEnemyStatus() { if (!currentEnemy) return; enemyNameEl.textContent = currentEnemy.name; enemyHpTextEl.textContent = `${currentEnemy.hp} / ${currentEnemy.maxHp}`; enemyHpBarEl.style.width = `${(currentEnemy.hp / currentEnemy.maxHp) * 100}%`; enemyCharacterEl.textContent = currentEnemy.emoji; }
function displayMessage(message) { messageTextEl.innerHTML = message; }

// ===================================
// バトル処理 (★ バグ修正)
// ===================================
function setupNextEnemy() { if (currentEnemyIndex < ENEMIES.length) { const data = ENEMIES[currentEnemyIndex]; currentEnemy = { ...data, hp: data.maxHp }; updatePlayerStatus(); updateEnemyStatus(); displayMessage(`${currentEnemy.name} があらわれた！`); showBattleCommands(true); } else { gameClear(); } }
function playerTurn(action, id = null) {
    if (player.hp <= 0) return;
    closeModal();
    let message = ''; let isTurnEnd = true;
    if (action === 'attack') {
        playSound('attack');
        const damage = Math.max(1, player.attack - currentEnemy.defense); // ★ 最低1ダメージ保証
        message = `${player.name}のこうげき！ ${currentEnemy.name}に ${damage} のダメージ！`;
        currentEnemy.hp = Math.max(0, currentEnemy.hp - damage);
    } else if (action === 'skill') {
        const skill = player.skills.find(s => s.id === id);
        if (player.mp < skill.cost) { playSound('error'); displayMessage('MPがたりない！'); isTurnEnd = false; }
        else {
            player.mp -= skill.cost;
            if (skill.type === 'heal') {
                playSound('heal');
                player.hp = Math.min(player.maxHp, player.hp + skill.amount);
                message = `${player.name}は「${skill.name}」をつかった！ HPが ${skill.amount} かいふく！`;
            } else {
                playSound('attack_critical');
                const damage = Math.max(1, Math.floor(player.attack * skill.power) - currentEnemy.defense); // ★ 最低1ダメージ保証
                message = `${player.name}は「${skill.name}」をつかった！ ${currentEnemy.name}に ${damage} のダメージ！`;
                currentEnemy.hp = Math.max(0, currentEnemy.hp - damage);
            }
        }
    } else if (action === 'item') { /* 省略 (変更なし) */ }
    if (isTurnEnd) { displayMessage(message); updatePlayerStatus(); updateEnemyStatus(); enemyCharacterEl.classList.add('shake'); setTimeout(() => { enemyCharacterEl.classList.remove('shake'); }, 300); if (currentEnemy.hp <= 0) { showBattleCommands(false); setTimeout(winBattle, 1000); } else { showBattleCommands(false); setTimeout(enemyTurn, 1500); } }
}
function enemyTurn() {
    if (currentEnemy.hp <= 0) return;
    playSound('damage');
    const damage = Math.max(1, currentEnemy.attack - player.defense); // ★ 最低1ダメージ保証
    player.hp = Math.max(0, player.hp - damage);
    displayMessage(`${currentEnemy.name}のこうげき！ ${player.name}は ${damage} のダメージをうけた！`);
    updatePlayerStatus();
    playerCharacterEl.classList.add('shake');
    setTimeout(() => { playerCharacterEl.classList.remove('shake'); }, 300);
    if (player.hp <= 0) { setTimeout(loseBattle, 1000); }
    else { showBattleCommands(true); }
}
function winBattle() { playSound('win'); const earnedExp = currentEnemy.exp; const earnedGold = currentEnemy.gold; player.exp += earnedExp; coins += earnedGold; displayMessage(`${currentEnemy.name}をやっつけた！<br>${earnedExp}の経験値と ${earnedGold}コインをてにいれた！`); setTimeout(() => { updatePlayerStatus(); homeCoinDisplayEl.textContent = `💰 ${coins} コイン`; checkLevelUp(); }, 1500); }
function checkLevelUp() { if (player.exp >= player.nextLevelExp) { playSound('levelup'); player.level++; player.exp -= player.nextLevelExp; player.nextLevelExp = Math.floor(player.nextLevelExp * 1.5); const hpUp = Math.floor(player.maxHp * 0.2); const mpUp = Math.floor(player.maxMp * 0.2); const atkUp = Math.floor(player.baseAttack * 0.15) + 1; const defUp = Math.floor(player.baseDefense * 0.15) + 1; player.maxHp += hpUp; player.maxMp += mpUp; player.baseAttack += atkUp; player.baseDefense += defUp; player.hp = player.maxHp; player.mp = player.maxMp; displayMessage(`レベルアップ！ Lv.${player.level - 1} → Lv.${player.level} になった！<br>ステータスがアップし、HPとMPが全回復した！`); setTimeout(() => { updatePlayerStatus(); checkLevelUp(); }, 2000); } else { currentEnemyIndex++; if (currentEnemyIndex >= ENEMIES.length) { setTimeout(gameClear, 1500); } else { setTimeout(setupNextEnemy, 1500); } } }
function loseBattle() { stopBgm(); playBgm('bgm_gameover'); displayMessage(`${player.name}はたおれてしまった... GAME OVER`); showBattleCommands(false); }
function gameClear() { stopBgm(); playBgm('bgm_clear'); displayMessage('魔王をやっつけて、姫を救いだした！<br>おめでとう！GAME CLEAR！'); enemyCharacterEl.textContent = '👸'; showBattleCommands(false); }
function showBattleCommands(show) { const isBattleActive = show && player.hp > 0 && currentEnemyIndex < ENEMIES.length; attackBtn.classList.toggle('hidden', !isBattleActive); skillsBtn.classList.toggle('hidden', !isBattleActive); itemsBtn.classList.toggle('hidden', !isBattleActive); restartBtn.classList.toggle('hidden', isBattleActive); } // ★ 修正
function restartBattle() { stopBgm(); playSound('decision'); selectCharacter(player.id); } // ★ 修正

// ===================================
// 勉強モード (★ 大幅更新)
// ===================================
let currentStudyQuestion = {}; let studySessionScore = 0; let studySessionTotal = 0;
const TOTAL_STUDY_QUESTIONS = 10; // ★ 問題数を10問に変更

function openStudyMode() {
    playSound('decision');
    playBgm('bgm_study');
    switchScreen('study-container');
    studyDifficultySelectEl.classList.remove('hidden');
    studyQuestionScreenEl.classList.add('hidden');
}
function startStudySession(difficulty) {
    playSound('decision');
    studyDifficulty = difficulty;
    studySessionTotal = 0;
    studySessionScore = 0;
    studyScoreEl.textContent = `SCORE: 0`;
    studyDifficultySelectEl.classList.add('hidden');
    studyQuestionScreenEl.classList.remove('hidden');
    displayNextStudyQuestion();
}
function displayNextStudyQuestion() {
    if (studySessionTotal >= TOTAL_STUDY_QUESTIONS) { endStudySession(); return; }
    studySessionTotal++;
    let num1, num2;
    if (studyDifficulty === 'easy') {
        num1 = Math.floor(Math.random() * 9) + 1;
        num2 = Math.floor(Math.random() * 9) + 1;
    } else { // normal
        num1 = Math.floor(Math.random() * 90) + 10;
        num2 = Math.floor(Math.random() * 90) + 10;
    }
    const correctAnswer = num1 + num2;
    currentStudyQuestion = { text: `${num1} + ${num2} = ?`, answer: correctAnswer };
    questionTextEl.textContent = currentStudyQuestion.text;
    questionProgressEl.textContent = `${studySessionTotal} / ${TOTAL_STUDY_QUESTIONS} 問目`;
    studyFeedbackTextEl.textContent = "こたえはどれかな？";
    const choices = new Set([correctAnswer]);
    while (choices.size < 6) { const wrongAnswer = correctAnswer + Math.floor(Math.random() * 20) - 10; if (wrongAnswer > 0 && wrongAnswer !== correctAnswer) { choices.add(wrongAnswer); } }
    const choiceArray = Array.from(choices).sort(() => Math.random() - 0.5);
    studyAnswerChoicesEl.innerHTML = '';
    choiceArray.forEach(choice => { const button = document.createElement('button'); button.textContent = choice; button.onclick = () => handleStudyAnswer(choice, correctAnswer); studyAnswerChoicesEl.appendChild(button); });
    studyQuestionStartTime = Date.now();
}
function handleStudyAnswer(selectedAnswer, correctAnswer) {
    const elapsedTime = (Date.now() - studyQuestionStartTime) / 1000;
    let score = 0;
    if (selectedAnswer === correctAnswer) { playSound('correct'); score = Math.max(10, Math.floor(100 - (elapsedTime * 10))); studyFeedbackTextEl.textContent = `せいかい！ ${score}ポイントGET！`; studySessionScore += score;
    } else { playSound('wrong'); studyFeedbackTextEl.textContent = `ざんねん！正解は ${correctAnswer} でした`; }
    studyScoreEl.textContent = `SCORE: ${studySessionScore}`;
    document.querySelectorAll('#study-answer-choices button').forEach(btn => btn.disabled = true);
    setTimeout(displayNextStudyQuestion, 1200);
}
function endStudySession() { const earnedCoins = Math.ceil(studySessionScore / 10); coins += earnedCoins; if (earnedCoins > 0) playSound('coin'); questionTextEl.textContent = "おつかれさま！"; studyFeedbackTextEl.textContent = `${studySessionScore}ポイントで、${earnedCoins}コインを手に入れた！`; studyAnswerChoicesEl.innerHTML = ''; homeCoinDisplayEl.textContent = `💰 ${coins} コイン`; backToDifficultySelectBtn.textContent = `もういちど ${studyDifficulty === 'easy' ? 'かんたん' : 'ふつう'} にちょうせん！`; }

// ===================================
// ショップ・モーダル
// ===================================
function openModal(type) { playSound('click'); modalContainer.classList.remove('hidden'); modalListEl.innerHTML = ''; let listData; if (type === 'skills') listData = player.skills; else if (type === 'items') listData = player.items.filter(i => i.count > 0); if (!listData || listData.length === 0) { modalListEl.innerHTML = '<p>つかえるものがありません</p>'; return; } listData.forEach(item => { const btn = document.createElement('button'); const countText = item.count > 0 ? `(のこり:${item.count})` : `(MP:${item.cost})`; btn.innerHTML = `${item.emoji || ''} ${item.name}<br>${countText}`; btn.disabled = type === 'skills' && player.mp < item.cost; btn.onclick = () => playerTurn(type === 'skills' ? 'skill' : 'item', item.id); modalListEl.appendChild(btn); }); }
function closeModal() { playSound('cancel'); modalContainer.classList.add('hidden'); }
function renderShopItems() { shopItemsListEl.innerHTML = ''; SHOP_ITEMS.forEach(item => { const itemEl = document.createElement('div'); itemEl.className = 'shop-item'; let status = (item.type === 'weapon' && player.weapon?.id === item.id) || (item.type === 'armor' && player.armor?.id === item.id) ? ' (そうびちゅう)' : ''; itemEl.innerHTML = `<span>${item.emoji} ${item.name}${status}</span><button class="shop-item-buy-btn">${item.cost}コイン</button>`; itemEl.querySelector('button').onclick = () => buyItem(item); shopItemsListEl.appendChild(itemEl); }); }
function buyItem(item) { if (coins < item.cost) { playSound('error'); shopMessageEl.textContent = 'コインがたりないよ！'; return; } playSound('coin'); coins -= item.cost; homeCoinDisplayEl.textContent = `💰 ${coins} コイン`; shopMessageEl.textContent = `${item.name} をてにいれた！`; if (item.type === 'weapon') player.weapon = item; else if (item.type === 'armor') player.armor = item; else if (item.type === 'item') { const existingItem = player.items.find(i => i.id === item.id); if (existingItem) existingItem.count++; else player.items.push({ ...item, count: 1 }); } renderShopItems(); }

// ===================================
// イベントリスナー (★ 更新)
// ===================================
goToBattleBtn.addEventListener('click', openBattleMode);
goToStudyBtn.addEventListener('click', openStudyMode);
goToShopBtn.addEventListener('click', openShop);
backToHomeBtn.addEventListener('click', showHomeScreen);
closeStudyBtn.addEventListener('click', showHomeScreen);
document.querySelectorAll('.study-difficulty-btn').forEach(btn => {
    btn.addEventListener('click', (e) => startStudySession(e.currentTarget.dataset.difficulty));
});
backToDifficultySelectBtn.addEventListener('click', openStudyMode);
closeShopBtn.addEventListener('click', showHomeScreen);
attackBtn.addEventListener('click', () => playerTurn('attack'));
skillsBtn.addEventListener('click', () => openModal('skills'));
itemsBtn.addEventListener('click', () => openModal('items'));
restartBtn.addEventListener('click', restartBattle);
modalCloseBtn.addEventListener('click', closeModal);

// ===================================
// ゲームの起動
// ===================================
initializeCharacterSelection();