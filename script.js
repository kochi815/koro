// ===================================
// グローバル変数
// ===================================
let player = {}; let currentEnemy; let currentEnemyIndex = 0; let coins = 0;

// ===================================
// 効果音とBGM
// ===================================
const sounds = {
    // UI & System
    click: new Audio('se_click.mp3'),
    decision: new Audio('se_decision.mp3'),
    cancel: new Audio('se_cancel.mp3'),
    error: new Audio('se_error.mp3'),

    // Battle
    attack: new Audio('se_attack.mp3'),
    attack_critical: new Audio('se_attack_critical.mp3'),
    damage: new Audio('se_damage.mp3'),
    heal: new Audio('se_heal.mp3'),
    win: new Audio('se_win.mp3'),

    // Study
    correct: new Audio('se_correct.mp3'),
    wrong: new Audio('se_wrong.mp3'),
    coin: new Audio('se_coin.mp3'),

    // BGM
    bgm_title: new Audio('bgm_title.mp3'),
    bgm_battle: new Audio('bgm_battle.mp3'),
    bgm_shop: new Audio('bgm_shop.mp3'),
    bgm_study: new Audio('bgm_study.mp3'),
    bgm_clear: new Audio('bgm_clear.mp3'),
    bgm_gameover: new Audio('bgm_gameover.mp3')
};

let currentBgm = null;
Object.keys(sounds).forEach(key => {
    if (key.startsWith('bgm')) {
        sounds[key].loop = true;
        sounds[key].volume = 0.5;
    } else {
        sounds[key].volume = 0.8;
    }
});

function playSound(soundName) {
    if (sounds[soundName]) {
        sounds[soundName].currentTime = 0;
        sounds[soundName].play().catch(e => console.error("Sound play failed:", e));
    }
}

function playBgm(bgmName) {
    if (currentBgm === sounds[bgmName]) return;
    stopBgm();
    if (sounds[bgmName]) {
        currentBgm = sounds[bgmName];
        currentBgm.play().catch(e => console.error("BGM play failed:", e));
    }
}

function stopBgm() {
    if (currentBgm) {
        currentBgm.pause();
        currentBgm.currentTime = 0;
        currentBgm = null;
    }
}


// ===================================
// HTML要素の取得 (変更なし)
// ===================================
const characterSelectContainer = document.getElementById('character-select-container');
const characterListEl = document.getElementById('character-list');
const gameContainer = document.getElementById('game-container');
const studyContainer = document.getElementById('study-container');
const shopContainer = document.getElementById('shop-container');
const modalContainer = document.getElementById('modal-container');
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
const studyBtn = document.getElementById('study-btn');
const shopBtn = document.getElementById('shop-btn');
const coinDisplayEl = document.getElementById('coin-display');
const closeStudyBtn = document.getElementById('close-study-btn');
const questionProgressEl = document.getElementById('question-progress');
const questionTextEl = document.getElementById('question-text');
const answerInput = document.getElementById('answer-input');
const submitAnswerBtn = document.getElementById('submit-answer-btn');
const feedbackTextEl = document.getElementById('feedback-text');
const closeShopBtn = document.getElementById('close-shop-btn');
const shopItemsListEl = document.getElementById('shop-items-list');
const shopMessageEl = document.getElementById('shop-message');
const modalListEl = document.getElementById('modal-list');
const modalCloseBtn = document.getElementById('modal-close-btn');

// ===================================
// ゲームの初期化・画面遷移
// ===================================
function initializeCharacterSelection() {
    playBgm('bgm_title');
    characterListEl.innerHTML = '';
    CHARACTERS.forEach(char => {
        const card = document.createElement('div');
        card.className = 'character-card';
        card.innerHTML = `<div class="char-emoji">${char.emoji}</div><div class="char-name">${char.name}</div><div class="char-description">${char.description}</div>`;
        card.addEventListener('click', () => {
            playSound('decision');
            selectCharacter(char.id)
        });
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
    characterSelectContainer.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    startGame();
}
function startGame() {
    currentEnemyIndex = 0;
    displayMessage("わるい魔王😈に、おともだちの『姫』👸がさらわれた！<br>けいさんパワーでモンスターをやっつけて、姫を助けにいこう！");
    playBgm('bgm_battle');
    setTimeout(() => {
        setupNextEnemy();
    }, 4000);
}
function restartGame() {
    playSound('decision');
    player.hp = player.maxHp;
    player.mp = player.maxMp;
    currentEnemyIndex = 0;
    playBgm('bgm_battle');
    setupNextEnemy();
}
// ===================================
// 表示更新 (変更なし)
// ===================================
function updateAllDisplays() { updatePlayerStatus(); updateEnemyStatus(); updateCoinDisplay(); }
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
        playSound('attack');
        const damage = Math.max(0, player.attack - currentEnemy.defense);
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
                playSound('attack_critical'); // スキルは派手な音に
                const damage = Math.max(0, Math.floor(player.attack * skill.power) - currentEnemy.defense);
                message = `${player.name}は「${skill.name}」をつかった！ ${currentEnemy.name}に ${damage} のダメージ！`;
                currentEnemy.hp = Math.max(0, currentEnemy.hp - damage);
            }
        }
    } else if (action === 'item') {
        const item = player.items.find(i => i.id === id);
        if (item.id === 'herb') {
            playSound('heal');
            player.hp = Math.min(player.maxHp, player.hp + 30);
            message = `${player.name}は ${item.name} をつかった！ HPが 30 かいふく！`;
        } else if (item.id === 'magic_nut') {
            playSound('heal');
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
    playSound('damage');
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
    playSound('win');
    displayMessage(`${currentEnemy.name}をやっつけた！`);
    currentEnemyIndex++;
    setTimeout(setupNextEnemy, 2000);
}
function loseBattle() {
    stopBgm();
    playBgm('bgm_gameover');
    displayMessage(`${player.name}はたおれてしまった... GAME OVER`);
    showBattleCommands(false);
}
function gameClear() {
    stopBgm();
    playBgm('bgm_clear');
    displayMessage('魔王をやっつけて、姫を救いだした！<br>おめでとう！GAME CLEAR！');
    enemyCharacterEl.textContent = '👸';
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
function openStudyMode() { playSound('click'); stopBgm(); playBgm('bgm_study'); studyContainer.classList.remove('hidden'); gameContainer.classList.add('hidden'); studySessionTotal = 0; studySessionCorrect = 0; displayNextQuestion(); }
function closeStudyMode() { playSound('cancel'); stopBgm(); playBgm('bgm_battle'); studyContainer.classList.add('hidden'); gameContainer.classList.remove('hidden'); }
function openShop() { playSound('click'); stopBgm(); playBgm('bgm_shop'); shopContainer.classList.remove('hidden'); gameContainer.classList.add('hidden'); shopMessageEl.textContent = `現在の所持コイン: ${coins}コイン`; renderShopItems(); }
function closeShop() { playSound('cancel'); stopBgm(); playBgm('bgm_battle'); shopContainer.classList.add('hidden'); gameContainer.classList.remove('hidden'); }
function openModal(type) {
    playSound('click');
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
function closeModal() { playSound('cancel'); modalContainer.classList.add('hidden'); }
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
        playSound('correct');
        feedbackTextEl.textContent = "せいかい！⭕️"; studySessionCorrect++;
    } else {
        playSound('wrong');
        feedbackTextEl.textContent = `ざんねん！正解は ${currentStudyQuestion.answer} ❌`;
    }
    setTimeout(displayNextQuestion, 1200);
}
function endStudySession() {
    const earnedCoins = studySessionCorrect * 10;
    coins += earnedCoins;
    if (earnedCoins > 0) playSound('coin');
    feedbackTextEl.textContent = `おつかれさま！ ${studySessionCorrect}問せいかいで ${earnedCoins}コイン GET！`;
    updateCoinDisplay();
}
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
    if (coins < item.cost) { playSound('error'); shopMessageEl.textContent = 'コインがたりないよ！'; return; }
    playSound('coin');
    coins -= item.cost;
    updateCoinDisplay();
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
attackBtn.addEventListener('click', () => playerTurn('attack'));
skillsBtn.addEventListener('click', () => openModal('skills'));
itemsBtn.addEventListener('click', () => openModal('items'));
restartBtn.addEventListener('click', restartGame);
studyBtn.addEventListener('click', openStudyMode);
shopBtn.addEventListener('click', openShop);
closeStudyBtn.addEventListener('click', closeStudyMode);
submitAnswerBtn.addEventListener('click', handleSubmitAnswer);
answerInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleSubmitAnswer(); });
closeShopBtn.addEventListener('click', closeShop);
modalCloseBtn.addEventListener('click', closeModal);
// ===================================
// ゲームの起動
// ===================================
initializeCharacterSelection();