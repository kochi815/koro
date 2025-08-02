// ===================================
// グローバル変数
// ===================================
let player = {}; let currentEnemy; let currentEnemyIndex = 0; let coins = 0;
// ===================================
// HTML要素の取得
// ===================================
const characterSelectContainer = document.getElementById('character-select-container');
const characterListEl = document.getElementById('character-list');
const gameContainer = document.getElementById('game-container');
const studyContainer = document.getElementById('study-container');
const shopContainer = document.getElementById('shop-container');
const modalContainer = document.getElementById('modal-container');
// --- キャラクター表示 ---
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
// --- ボタン・メッセージなど ---
const messageTextEl = document.getElementById('message-text');
const attackBtn = document.getElementById('attack-btn');
const skillsBtn = document.getElementById('skills-btn');
const itemsBtn = document.getElementById('items-btn');
const restartBtn = document.getElementById('restart-btn');
const studyBtn = document.getElementById('study-btn');
const shopBtn = document.getElementById('shop-btn');
const coinDisplayEl = document.getElementById('coin-display');
// --- 勉強モード ---
const closeStudyBtn = document.getElementById('close-study-btn');
const questionProgressEl = document.getElementById('question-progress');
const questionTextEl = document.getElementById('question-text');
const answerInput = document.getElementById('answer-input');
const submitAnswerBtn = document.getElementById('submit-answer-btn');
const feedbackTextEl = document.getElementById('feedback-text');
// --- ショップ ---
const closeShopBtn = document.getElementById('close-shop-btn');
const shopItemsListEl = document.getElementById('shop-items-list');
const shopMessageEl = document.getElementById('shop-message');
// --- モーダル ---
const modalContentEl = document.getElementById('modal-content');
const modalListEl = document.getElementById('modal-list');
const modalCloseBtn = document.getElementById('modal-close-btn');

// ===================================
// ゲームの初期化・画面遷移
// ===================================
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
        items: [{ id: 'healing_cupcake', name: 'いやしのカップケーキ', count: 2, emoji: '🧁' }],
        get attack() { return this.baseAttack + (this.weapon ? this.weapon.power : 0); },
        get defense() { return this.baseDefense + (this.armor ? this.armor.power : 0); },
    };
    characterSelectContainer.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    startGame();
}
function startGame() {
    currentEnemyIndex = 0;
    setupNextEnemy();
}
function restartGame() {
    player.hp = player.maxHp;
    player.mp = player.maxMp;
    startGame();
}
// ===================================
// 表示更新
// ===================================
function updateAllDisplays() {
    updatePlayerStatus();
    updateEnemyStatus();
    updateCoinDisplay();
}
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
function updateCoinDisplay() { coinDisplayEl.textContent = `💰 ${coins} コイン`; }
function displayMessage(message) { messageTextEl.innerHTML = message; }
// ===================================
// バトル処理
// ===================================
function setupNextEnemy() {
    if (currentEnemyIndex < ENEMIES.length) {
        const data = ENEMIES[currentEnemyIndex];
        currentEnemy = { ...data, hp: data.maxHp };
        updateAllDisplays();
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
        if (item.id === 'healing_cupcake') {
            player.hp = Math.min(player.maxHp, player.hp + 30);
            message = `${player.name}は ${item.name} をつかった！ HPが 30 かいふく！`;
        } else if (item.id === 'magic_macaron') {
            player.mp = Math.min(player.maxMp, player.mp + 20);
            message = `${player.name}は ${item.name} をつかった！ MPが 20 かいふく！`;
        }
        item.count--;
        if (item.count <= 0) player.items = player.items.filter(i => i.id !== id);
    }
    if (isTurnEnd) {
        displayMessage(message);
        updateAllDisplays();
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
    setTimeout(setupNextEnemy, 2000);
}
function loseBattle() {
    displayMessage(`${player.name}はたおれてしまった... GAME OVER`);
    showBattleCommands(false);
}
function gameClear() {
    displayMessage('すべてのモンスターをやっつけた！おめでとう！');
    showBattleCommands(false);
}
function showBattleCommands(show) {
    const isBattleActive = show && player.hp > 0 && currentEnemyIndex < ENEMIES.length;
    attackBtn.classList.toggle('hidden', !isBattleActive);
    skillsBtn.classList.toggle('hidden', !isBattleActive);
    itemsBtn.classList.toggle('hidden', !isBattleActive);
    restartBtn.classList.toggle('hidden', isBattleActive);
}
// ===================================
// 勉強・ショップ・モーダル
// ===================================
function openStudyMode() { studyContainer.classList.remove('hidden'); gameContainer.classList.add('hidden'); displayNextQuestion(); }
function closeStudyMode() { studyContainer.classList.add('hidden'); gameContainer.classList.remove('hidden'); }
function openShop() { shopContainer.classList.remove('hidden'); gameContainer.classList.add('hidden'); shopMessageEl.textContent = `現在の所持コイン: ${coins}G`; renderShopItems(); }
function closeShop() { shopContainer.classList.add('hidden'); gameContainer.classList.remove('hidden'); }
function openModal(type) {
    modalContainer.classList.remove('hidden');
    modalListEl.innerHTML = '';
    let listData;
    if (type === 'skills') listData = player.skills;
    else if (type === 'items') listData = player.items.filter(i => i.count > 0);
    if (!listData || listData.length === 0) { modalListEl.innerHTML = '<p>つかえるものがありません</p>'; return; }
    listData.forEach(item => {
        const btn = document.createElement('button');
        const countText = item.count ? `(のこり:${item.count})` : `(MP:${item.cost})`;
        btn.innerHTML = `${item.emoji || ''} ${item.name}<br>${countText}`;
        btn.disabled = type === 'skills' && player.mp < item.cost;
        btn.onclick = () => playerTurn(type === 'skills' ? 'skill' : 'item', item.id);
        modalListEl.appendChild(btn);
    });
}
function closeModal() { modalContainer.classList.add('hidden'); }
let currentStudyQuestion = {}; let studySessionCorrect = 0; let studySessionTotal = 0;
function displayNextQuestion() {
    if (studySessionTotal >= 10) { endStudySession(); return; }
    studySessionTotal++;
    const num1 = Math.floor(Math.random() * 90) + 10;
    const num2 = Math.floor(Math.random() * 90) + 10;
    currentStudyQuestion = { text: `${num1} + ${num2} = ?`, answer: num1 + num2 };
    questionTextEl.textContent = currentStudyQuestion.text;
    questionProgressEl.textContent = `${studySessionTotal} / 10 問目`;
    answerInput.value = ''; feedbackTextEl.textContent = ''; answerInput.focus();
}
function handleSubmitAnswer() {
    if (parseInt(answerInput.value) === currentStudyQuestion.answer) {
        feedbackTextEl.textContent = "せいかい！⭕️"; studySessionCorrect++;
    } else {
        feedbackTextEl.textContent = `ざんねん！正解は ${currentStudyQuestion.answer} ❌`;
    }
    setTimeout(displayNextQuestion, 1200);
}
function endStudySession() {
    const earnedCoins = studySessionCorrect * 10;
    coins += earnedCoins;
    feedbackTextEl.textContent = `おつかれさま！ ${studySessionCorrect}問せいかいで ${earnedCoins}コイン GET！`;
    updateCoinDisplay();
    studySessionCorrect = 0; studySessionTotal = 0;
}
function renderShopItems() {
    shopItemsListEl.innerHTML = '';
    SHOP_ITEMS.forEach(item =>