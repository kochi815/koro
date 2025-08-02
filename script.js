// ===================================
// グローバル変数
// ===================================
let player = {}; let currentEnemy; let currentEnemyIndex = 0; let coins = 0;
let currentBgm = null; let studyQuestionStartTime;
// ===================================
// HTML要素の取得
// ===================================
const characterSelectContainer = document.getElementById('character-select-container');
const characterListEl = document.getElementById('character-list');
const homeContainer = document.getElementById('home-container');
const gameContainer = document.getElementById('game-container');
const studyContainer = document.getElementById('study-container');
const shopContainer = document.getElementById('shop-container');
const modalContainer = document.getElementById('modal-container');
// --- ホーム画面 ---
const homePlayerEmojiEl = document.getElementById('home-player-emoji');
const homePlayerNameEl = document.getElementById('home-player-name');
const homeCoinDisplayEl = document.getElementById('home-coin-display');
const goToBattleBtn = document.getElementById('go-to-battle-btn');
const goToStudyBtn = document.getElementById('go-to-study-btn');
const goToShopBtn = document.getElementById('go-to-shop-btn');
// --- バトル画面 ---
const backToHomeBtn = document.getElementById('back-to-home-from-battle');
const playerNameEl = document.getElementById('player-info-text');
const playerHpTextEl = document.getElementById('player-hp-text');
const playerMpTextEl = document.getElementById('player-mp-text');
const playerHpBarEl = document.getElementById('player-hp-bar');
const playerMpBarEl = document.getElementById('player-mp-bar');
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
// --- 勉強モード ---
const closeStudyBtn = document.getElementById('close-study-btn');
const questionProgressEl = document.getElementById('question-progress');
const studyScoreEl = document.getElementById('study-score');
const studyFeedbackTextEl = document.getElementById('study-feedback-text');
const questionTextEl = document.getElementById('question-text');
const studyAnswerChoicesEl = document.getElementById('study-answer-choices');
// --- ショップ ---
const closeShopBtn = document.getElementById('close-shop-btn');
const shopItemsListEl = document.getElementById('shop-items-list');
const shopMessageEl = document.getElementById('shop-message');
// --- モーダル ---
const modalListEl = document.getElementById('modal-list');
const modalCloseBtn = document.getElementById('modal-close-btn');

// ===================================
// ゲームの初期化・画面遷移
// ===================================
function switchScreen(screenId) {
    [characterSelectContainer, homeContainer, gameContainer, studyContainer, shopContainer].forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
}

function initializeCharacterSelection() {
    characterListEl.innerHTML = '';
    CHARACTERS.forEach(char => {
        const card = document.createElement('div');
        card.className = 'character-card';
        card.innerHTML = `<div class="char-emoji">${char.emoji}</div><div class="char-name">${char.name}</div><div class="char-description">${char.description}</div>`;
        card.addEventListener('click', () => selectCharacter(char.id));
        characterListEl.appendChild(card);
    });
}
function selectCharacter(charId) {
    const data = CHARACTERS.find(c => c.id === charId);
    player = {
        ...JSON.parse(JSON.stringify(data)), hp: data.maxHp, mp: data.maxMp, weapon: null, armor: null,
        items: [{ id: 'herb', name: 'やくそう', count: 2, emoji: '🌿' }],
        get attack() { return this.baseAttack + (this.weapon ? this.weapon.power : 0); },
        get defense() { return this.baseDefense + (this.armor ? this.armor.power : 0); },
    };
    currentEnemyIndex = 0;
    showHomeScreen();
}
function showHomeScreen() {
    switchScreen('home-container');
    homePlayerEmojiEl.textContent = player.emoji;
    homePlayerNameEl.textContent = player.name;
    homeCoinDisplayEl.textContent = `💰 ${coins} コイン`;
}
function openBattleMode() {
    switchScreen('game-container');
    setupNextEnemy();
}
function openStudyMode() {
    switchScreen('study-container');
    studySessionTotal = 0;
    studySessionScore = 0;
    studyScoreEl.textContent = `SCORE: 0`;
    displayNextStudyQuestion();
}
function openShop() {
    switchScreen('shop-container');
    shopMessageEl.textContent = `現在の所持コイン: ${coins}コイン`;
    renderShopItems();
}

// ===================================
// 表示更新
// ===================================
function updatePlayerStatus() {
    playerNameEl.textContent = player.name;
    playerCharacterEl.textContent = player.emoji;
    playerHpTextEl.textContent = `${player.hp} / ${player.maxHp}`;
    playerMpTextEl.textContent = `${player.mp} / ${player.maxMp}`;
    playerHpBarEl.style.width = `${(player.hp / player.maxHp) * 100}%`;
    playerMpBarEl.style.width = `${(player.mp / player.maxMp) * 100}%`;
}
function updateEnemyStatus() {
    if (!currentEnemy) return;
    enemyNameEl.textContent = currentEnemy.name;
    enemyHpTextEl.textContent = currentEnemy.hp;
    enemyHpBarEl.style.width = `${(currentEnemy.hp / currentEnemy.maxHp) * 100}%`;
    enemyCharacterEl.textContent = currentEnemy.emoji;
}
function displayMessage(message) { messageTextEl.innerHTML = message; }

// ===================================
// バトル処理 (変更は少ない)
// ===================================
function setupNextEnemy() {
    if (currentEnemyIndex < ENEMIES.length) {
        const data = ENEMIES[currentEnemyIndex];
        currentEnemy = { ...data, hp: data.maxHp };
        updatePlayerStatus();
        updateEnemyStatus();
        displayMessage(`${currentEnemy.name} があらわれた！`);
        showBattleCommands(true);
    } else {
        gameClear();
    }
}
function playerTurn(action, id = null) {
    if (player.hp <= 0) return;
    closeModal();
    let message = ''; let isTurnEnd = true;
    if (action === 'attack') {
        const damage = Math.max(0, player.attack - currentEnemy.defense);
        message = `${player.name}のこうげき！ ${currentEnemy.name}に ${damage} のダメージ！`;
        currentEnemy.hp = Math.max(0, currentEnemy.hp - damage);
    } else if (action === 'skill') {
        const skill = player.skills.find(s => s.id === id);
        if (player.mp < skill.cost) { displayMessage('MPがたりない！'); isTurnEnd = false; }
        else {
            player.mp -= skill.cost;
            if (skill.type === 'heal') {
                player.hp = Math.min(player.maxHp, player.hp + skill.amount);
                message = `${player.name}は「${skill.name}」をつかった！ HPが ${skill.amount} かいふく！`;
            } else {
                const damage = Math.max(0, Math.floor(player.attack * skill.power) - currentEnemy.defense);
                message = `${player.name}は「${skill.name}」をつかった！ ${currentEnemy.name}に ${damage} のダメージ！`;
                currentEnemy.hp = Math.max(0, currentEnemy.hp - damage);
            }
        }
    } else if (action === 'item') {
        const item = player.items.find(i => i.id === id);
        if (item.id === 'herb') { player.hp = Math.min(player.maxHp, player.hp + 30); message = `${player.name}は ${item.name} をつかった！ HPが 30 かいふく！`; }
        else if (item.id === 'magic_nut') { player.mp = Math.min(player.maxMp, player.mp + 20); message = `${player.name}は ${item.name} をつかった！ MPが 20 かいふく！`; }
        item.count--;
        if (item.count <= 0) player.items = player.items.filter(i => i.id !== id);
    }
    if (isTurnEnd) {
        displayMessage(message);
        updatePlayerStatus();
        updateEnemyStatus();
        enemyCharacterEl.classList.add('shake');
        setTimeout(() => { enemyCharacterEl.classList.remove('shake'); }, 300);
        if (currentEnemy.hp <= 0) { setTimeout(winBattle, 1000); }
        else { showBattleCommands(false); setTimeout(enemyTurn, 1500); }
    }
}
function enemyTurn() {
    if (currentEnemy.hp <= 0) return;
    const damage = Math.max(0, currentEnemy.attack - player.defense);
    player.hp = Math.max(0, player.hp - damage);
    displayMessage(`${currentEnemy.name}のこうげき！ ${player.name}は ${damage} のダメージをうけた！`);
    updatePlayerStatus();
    playerCharacterEl.classList.add('shake');
    setTimeout(() => { playerCharacterEl.classList.remove('shake'); }, 300);
    if (player.hp <= 0) { setTimeout(loseBattle, 1000); }
    else { showBattleCommands(true); }
}
function winBattle() {
    displayMessage(`${currentEnemy.name}をやっつけた！`);
    currentEnemyIndex++;
    if (currentEnemyIndex >= ENEMIES.length) { gameClear(); }
    else { setupNextEnemy(); }
}
function loseBattle() { displayMessage(`${player.name}はたおれてしまった... GAME OVER`); showBattleCommands(false); }
function gameClear() { displayMessage('魔王をやっつけて、姫を救いだした！<br>おめでとう！GAME CLEAR！'); enemyCharacterEl.textContent = '👸'; showBattleCommands(false); }
function showBattleCommands(show) {
    const isBattleActive = show && player.hp > 0 && currentEnemyIndex < ENEMIES.length;
    attackBtn.classList.toggle('hidden', !isBattleActive);
    skillsBtn.classList.toggle('hidden', !isBattleActive);
    itemsBtn.classList.toggle('hidden', !isBattleActive);
    restartBtn.classList.toggle('hidden', isBattleActive);
}
function restartBattle() { player.hp = player.maxHp; player.mp = player.maxMp; setupNextEnemy(); }

// ===================================
// ★勉強モード (新ロジック)
// ===================================
let currentStudyQuestion = {}; let studySessionScore = 0; let studySessionTotal = 0;
const TOTAL_STUDY_QUESTIONS = 20;

function displayNextStudyQuestion() {
    if (studySessionTotal >= TOTAL_STUDY_QUESTIONS) { endStudySession(); return; }
    studySessionTotal++;
    
    const num1 = Math.floor(Math.random() * 90) + 10;
    const num2 = Math.floor(Math.random() * 90) + 10;
    const correctAnswer = num1 + num2;
    currentStudyQuestion = { text: `${num1} + ${num2} = ?`, answer: correctAnswer };

    questionTextEl.textContent = currentStudyQuestion.text;
    questionProgressEl.textContent = `${studySessionTotal} / ${TOTAL_STUDY_QUESTIONS} 問目`;
    studyFeedbackTextEl.textContent = "こたえはどれかな？";

    const choices = new Set([correctAnswer]);
    while (choices.size < 6) {
        const wrongAnswer = correctAnswer + Math.floor(Math.random() * 20) - 10;
        if (wrongAnswer > 0 && wrongAnswer !== correctAnswer) { choices.add(wrongAnswer); }
    }
    const choiceArray = Array.from(choices).sort(() => Math.random() - 0.5);

    studyAnswerChoicesEl.innerHTML = '';
    choiceArray.forEach(choice => {
        const button = document.createElement('button');
        button.textContent = choice;
        button.onclick = () => handleStudyAnswer(choice, correctAnswer);
        studyAnswerChoicesEl.appendChild(button);
    });
    studyQuestionStartTime = Date.now();
}
function handleStudyAnswer(selectedAnswer, correctAnswer) {
    const elapsedTime = (Date.now() - studyQuestionStartTime) / 1000;
    let score = 0;
    if (selectedAnswer === correctAnswer) {
        score = Math.max(10, Math.floor(100 - (elapsedTime * 10))); // 速いほど高得点
        studyFeedbackTextEl.textContent = `せいかい！ ${score}ポイントGET！`;
        studySessionScore += score;
    } else {
        studyFeedbackTextEl.textContent = `ざんねん！正解は ${correctAnswer} でした`;
    }
    studyScoreEl.textContent = `SCORE: ${studySessionScore}`;
    document.querySelectorAll('#study-answer-choices button').forEach(btn => btn.disabled = true);
    setTimeout(displayNextStudyQuestion, 1200);
}
function endStudySession() {
    const earnedCoins = Math.ceil(studySessionScore / 10);
    coins += earnedCoins;
    questionTextEl.textContent = "おつかれさま！";
    studyFeedbackTextEl.textContent = `${studySessionScore}ポイントで、${earnedCoins}コインを手に入れた！`;
    studyAnswerChoicesEl.innerHTML = '';
}

// ===================================
// ショップ・モーダル (変更なし)
// ===================================
function openModal(type) {
    modalContainer.classList.remove('hidden');
    modalListEl.innerHTML = '';
    let listData;
    if (type === 'skills') listData = player.skills;
    else if (type === 'items') listData = player.items.filter(i => i.count > 0);
    if (!listData || listData.length === 0) { modalListEl.innerHTML = '<p>つかえるものがありません</p>'; return; }
    listData.forEach(item => {
        const btn = document.createElement('button');
        const countText = item.count > 0 ? `(のこり:${item.count})` : `(MP:${item.cost})`;
        btn.innerHTML = `${item.emoji || ''} ${item.name}<br>${countText}`;
        btn.disabled = type === 'skills' && player.mp < item.cost;
        btn.onclick = () => playerTurn(type === 'skills' ? 'skill' : 'item', item.id);
        modalListEl.appendChild(btn);
    });
}
function closeModal() { modalContainer.classList.add('hidden'); }
function renderShopItems() {
    shopItemsListEl.innerHTML = '';
    SHOP_ITEMS.forEach(item => {
        const itemEl = document.createElement('div'); itemEl.className = 'shop-item';
        let status = (item.type === 'weapon' && player.weapon?.id === item.id) || (item.type === 'armor' && player.armor?.id === item.id) ? ' (そうびちゅう)' : '';
        itemEl.innerHTML = `<span>${item.emoji} ${item.name}${status}</span><button class="shop-item-buy-btn">${item.cost}コイン</button>`;
        itemEl.querySelector('button').onclick = () => buyItem(item);
    });
}
function buyItem(item) {
    if (coins < item.cost) { shopMessageEl.textContent = 'コインがたりないよ！'; return; }
    coins -= item.cost;
    homeCoinDisplayEl.textContent = `💰 ${coins} コイン`;
    shopMessageEl.textContent = `${item.name} をてにいれた！`;
    if (item.type === 'weapon') player.weapon = item;
    else if (item.type === 'armor') player.armor = item;
    else if (item.type === 'item') {
        const existingItem = player.items.find(i => i.id === item.id);
        if (existingItem) existingItem.count++;
        else player.items.push({ ...item, count: 1 });
    }
    renderShopItems();
}
// ===================================
// イベントリスナー
// ===================================
goToBattleBtn.addEventListener('click', openBattleMode);
goToStudyBtn.addEventListener('click', openStudyMode);
goToShopBtn.addEventListener('click', openShop);
backToHomeBtn.addEventListener('click', showHomeScreen);
closeStudyBtn.addEventListener('click', showHomeScreen);
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