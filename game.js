// ===================================
// グローバル変数
// ===================================
let player = {}; // プレイヤーのデータはキャラクター選択時にここに入る
let currentEnemy;
let currentEnemyIndex = 0;
let coins = 0;

// ===================================
// HTML要素の取得
// ===================================
const characterSelectContainer = document.getElementById('character-select-container');
const characterListEl = document.getElementById('character-list');
// (他の要素の取得は変更なし)
const gameContainer = document.getElementById('game-container');
const studyContainer = document.getElementById('study-container');
const shopContainer = document.getElementById('shop-container');
const playerNameEl = document.getElementById('player-name');
const playerHpTextEl = document.getElementById('player-hp-text');
const playerMpTextEl = document.getElementById('player-mp-text');
const playerHpValueEl = document.getElementById('player-hp-value');
const playerMpValueEl = document.getElementById('player-mp-value');
const enemyNameEl = document.getElementById('enemy-name');
const enemyEmojiEl = document.getElementById('enemy-emoji');
const enemyHpTextEl = document.getElementById('enemy-hp-text');
const enemyHpValueEl = document.getElementById('enemy-hp-value');
const messageTextEl = document.getElementById('message-text');
const attackBtn = document.getElementById('attack-btn');
const skillsBtn = document.getElementById('skills-btn');
const itemsBtn = document.getElementById('items-btn');
const restartBtn = document.getElementById('restart-btn');
const skillsModal = document.getElementById('skills-modal');
const skillsList = document.getElementById('skills-list');
const closeSkillsModalBtn = document.getElementById('close-skills-modal-btn');
const itemsModal = document.getElementById('items-modal');
const itemsList = document.getElementById('items-list');
const closeItemsModalBtn = document.getElementById('close-items-modal-btn');
const coinDisplayEl = document.getElementById('coin-display');
const studyModeBtn = document.getElementById('study-mode-btn');
const shopBtn = document.getElementById('shop-btn');
const questionProgressEl = document.getElementById('question-progress');
const questionTextEl = document.getElementById('question-text');
const answerInput = document.getElementById('answer-input');
const submitAnswerBtn = document.getElementById('submit-answer-btn');
const feedbackTextEl = document.getElementById('feedback-text');
const shopItemsListEl = document.getElementById('shop-items-list');
const shopMessageEl = document.getElementById('shop-message');
const closeShopBtn = document.getElementById('close-shop-btn');


// ===================================
// 初期化処理
// ===================================
function initializeCharacterSelection() {
    characterListEl.innerHTML = '';
    CHARACTERS.forEach(char => {
        const card = document.createElement('div');
        card.className = 'character-card';
        card.dataset.charId = char.id;
        card.innerHTML = `
            <div class="char-emoji">${char.emoji}</div>
            <div class="char-name">${char.name}</div>
            <div class="char-description">${char.description}</div>
        `;
        card.addEventListener('click', () => selectCharacter(char.id));
        characterListEl.appendChild(card);
    });
}

function selectCharacter(charId) {
    const selectedCharData = CHARACTERS.find(c => c.id === charId);
    
    // プレイヤーオブジェクトを生成
    player = {
        ...JSON.parse(JSON.stringify(selectedCharData)), // データの深いコピー
        hp: selectedCharData.maxHp,
        mp: selectedCharData.maxMp,
        weapon: null,
        armor: null,
        items: [{ id: 'herb', name: 'やくそう', count: 1, emoji: '🌿' }],
        get attack() { return this.baseAttack + (this.weapon ? this.weapon.power : 0); },
        get defense() { return this.baseDefense + (this.armor ? this.armor.power : 0); },
    };

    characterSelectContainer.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    
    startGame();
}

// ゲーム開始処理（キャラクター選択後）
function startGame() {
    currentEnemyIndex = 0;
    updatePlayerStatus();
    updateCoinDisplay();
    showBattleCommands(true);
    setupNextEnemy();
}

// リスタート処理（ゲームオーバー後）
function restartGame() {
    player.hp = player.maxHp;
    player.mp = player.maxMp;
    startGame();
}

// (ここから下の関数の多くは、データソースが外部ファイルになった以外はほぼ同じです)
// (playerオブジェクトの参照方法などが少し変わっています)

// ===================================
// ショップの処理
// ===================================
function openShop() {
    gameContainer.classList.add('hidden');
    shopContainer.classList.remove('hidden');
    shopMessageEl.textContent = `現在の所持コイン: ${coins}G`;
    renderShopItems();
}

function closeShop() {
    shopContainer.classList.add('hidden');
    gameContainer.classList.remove('hidden');
}

function renderShopItems() {
    shopItemsListEl.innerHTML = '';
    SHOP_ITEMS.forEach(item => { // データソースを変更
        const itemEl = document.createElement('div');
        itemEl.className = 'shop-item';
        
        let currentStatus = '';
        if (item.type === 'weapon' && player.weapon && player.weapon.id === item.id) {
            currentStatus = ' (そうびちゅう)';
        }
        if (item.type === 'armor' && player.armor && player.armor.id === item.id) {
            currentStatus = ' (そうびちゅう)';
        }

        itemEl.innerHTML = `
            <span class="shop-item-name">${item.emoji} ${item.name}${currentStatus}</span>
            <button class="shop-item-buy-btn" data-item-id="${item.id}">${item.cost}Gでかう</button>
        `;
        shopItemsListEl.appendChild(itemEl);
    });
    document.querySelectorAll('.shop-item-buy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => buyItem(e.target.dataset.itemId));
    });
}

function buyItem(itemId) {
    const item = SHOP_ITEMS.find(i => i.id === itemId); // データソースを変更
    if (coins < item.cost) {
        shopMessageEl.textContent = 'コインがたりないよ！';
        return;
    }
    coins -= item.cost;
    updateCoinDisplay();
    shopMessageEl.textContent = `${item.name} をてにいれた！ (のこり: ${coins}G)`;
    if (item.type === 'weapon') {
        player.weapon = item;
    } else if (item.type === 'armor') {
        player.armor = item;
    } else if (item.type === 'item') {
        const existingItem = player.items.find(i => i.id === item.id);
        if (existingItem) {
            existingItem.count++;
        } else {
            player.items.push({ ...item, count: 1 });
        }
    }
    renderShopItems();
}

// ===================================
// 勉強モードの処理 (変更なし)
// ===================================
let studyQuestions = [];
let currentStudyQuestionIndex = 0;
let correctAnswers = 0;
const TOTAL_QUESTIONS = 10;
function startStudyMode(){/*...*/} function generateQuestion(){/*...*/} function displayNextQuestion(){/*...*/} function handleSubmitAnswer(){/*...*/} function endStudyMode(){/*...*/}

// (簡略化のため、変更のない勉強モード関数の中身は省略しています。実際には前のコードをそのままここにコピーしてください)
function startStudyMode() {
    gameContainer.classList.add('hidden');
    studyContainer.classList.remove('hidden');
    currentStudyQuestionIndex = 0;
    correctAnswers = 0;
    studyQuestions = [];
    for (let i = 0; i < TOTAL_QUESTIONS; i++) {
        studyQuestions.push(generateQuestion());
    }
    displayNextQuestion();
}
function generateQuestion() {
    const num1 = Math.floor(Math.random() * 90) + 10;
    const num2 = Math.floor(Math.random() * 90) + 10;
    if (Math.random() < 0.5) {
        return { text: `${num1} + ${num2} = ?`, answer: num1 + num2 };
    } else {
        return num1 < num2 ? { text: `${num2} - ${num1} = ?`, answer: num2 - num1 } : { text: `${num1} - ${num2} = ?`, answer: num1 - num2 };
    }
}
function displayNextQuestion() {
    if (currentStudyQuestionIndex < TOTAL_QUESTIONS) {
        const q = studyQuestions[currentStudyQuestionIndex];
        questionTextEl.textContent = q.text;
        questionProgressEl.textContent = `${currentStudyQuestionIndex + 1} / ${TOTAL_QUESTIONS} 問目`;
        answerInput.value = '';
        feedbackTextEl.textContent = '';
        answerInput.focus();
        submitAnswerBtn.disabled = false;
    } else {
        endStudyMode();
    }
}
function handleSubmitAnswer() {
    submitAnswerBtn.disabled = true;
    const userAnswer = parseInt(answerInput.value, 10);
    const correctAnswer = studyQuestions[currentStudyQuestionIndex].answer;
    if (userAnswer === correctAnswer) {
        feedbackTextEl.textContent = "せいかい！⭕️";
        feedbackTextEl.className = 'feedback-correct';
        correctAnswers++;
    } else {
        feedbackTextEl.textContent = `ざんねん！正解は ${correctAnswer} ❌`;
        feedbackTextEl.className = 'feedback-wrong';
    }
    currentStudyQuestionIndex++;
    setTimeout(displayNextQuestion, 1500);
}
function endStudyMode() {
    const earnedCoins = correctAnswers * 10;
    coins += earnedCoins;
    questionTextEl.textContent = "おつかれさま！";
    feedbackTextEl.textContent = `${TOTAL_QUESTIONS}問中 ${correctAnswers}問 せいかい！ ${earnedCoins}コイン もらえたよ！`;
    setTimeout(() => {
        gameContainer.classList.remove('hidden');
        studyContainer.classList.add('hidden');
        updateCoinDisplay();
    }, 3000);
}


function updateCoinDisplay() {
    coinDisplayEl.textContent = `💰 ${coins} コイン`;
}

// ===================================
// バトル画面の処理
// ===================================
function setupNextEnemy() {
    if (currentEnemyIndex < ENEMIES.length) { // データソースを変更
        const enemyData = ENEMIES[currentEnemyIndex];
        currentEnemy = { ...enemyData, hp: enemyData.maxHp };
        updateEnemyStatus();
        displayMessage(`${currentEnemy.name} があらわれた！`);
        showBattleCommands(true);
    } else {
        gameClear();
    }
}

function updatePlayerStatus() {
    playerNameEl.textContent = player.name; // playerオブジェクトから表示
    playerHpTextEl.textContent = `${player.hp} / ${player.maxHp}`;
    playerMpTextEl.textContent = `${player.mp} / ${player.maxMp}`;
    playerHpValueEl.style.width = `${(player.hp / player.maxHp) * 100}%`;
    playerMpValueEl.style.width = `${(player.mp / player.maxMp) * 100}%`;
}

function updateEnemyStatus() {
    enemyNameEl.textContent = currentEnemy.name;
    enemyEmojiEl.textContent = currentEnemy.emoji;
    enemyHpTextEl.textContent = `${currentEnemy.hp} / ${currentEnemy.maxHp}`;
    enemyHpValueEl.style.width = `${(currentEnemy.hp / currentEnemy.maxHp) * 100}%`;
}

function displayMessage(message) {
    messageTextEl.innerHTML = message;
}

function playerTurn(action, id = null) {
    if (player.hp <= 0) return;
    closeSkillsModal();
    closeItemsModal();

    let message = '';
    let isTurnEnd = true; // ターンが終了するかどうか

    if (action === 'attack') {
        const damage = Math.max(0, player.attack - currentEnemy.defense);
        message = `${player.name}のこうげき！<br>${currentEnemy.name}に ${damage} のダメージ！`;
        currentEnemy.hp = Math.max(0, currentEnemy.hp - damage);
    } else if (action === 'skill') {
        const skill = player.skills.find(s => s.id === id);
        if (player.mp < skill.cost) {
            displayMessage('MPがたりない！');
            isTurnEnd = false; // MP不足はターンを消費しない
        } else {
            player.mp -= skill.cost;
            if (skill.type === 'heal') {
                player.hp = Math.min(player.maxHp, player.hp + skill.amount);
                message = `${player.name}は「${skill.name}」をつかった！<br>HPが ${skill.amount} かいふくした！`;
            } else {
                const damage = Math.max(0, Math.floor(player.attack * skill.power) - currentEnemy.defense);
                message = `${player.name}は「${skill.name}」をつかった！<br>${currentEnemy.name}に ${damage} のダメージ！`;
                currentEnemy.hp = Math.max(0, currentEnemy.hp - damage);
            }
        }
    } else if (action === 'item') {
        const item = player.items.find(i => i.id === id);
        if (item.id === 'herb') {
            player.hp = Math.min(player.maxHp, player.hp + 30);
            message = `${player.name}はやくそうをつかった！<br>HPが 30 かいふくした！`;
        }
        item.count--;
        if (item.count <= 0) {
            player.items = player.items.filter(i => i.id !== id);
        }
    }
    
    if (isTurnEnd) {
        displayMessage(message);
        updatePlayerStatus();
        updateEnemyStatus();
        if (currentEnemy.hp <= 0) {
            setTimeout(winBattle, 1000);
        } else {
            showBattleCommands(false);
            setTimeout(enemyTurn, 1500);
        }
    }
}

function enemyTurn() { /* ...変更なし... */ }
function winBattle() { /* ...変更なし... */ }
function loseBattle() { /* ...変更なし... */ }
function gameClear() { /* ...変更なし... */ }
// (簡略化のため、変更のないバトル関数の中身は省略しています。実際には前のコードをそのままここにコピーしてください)
function enemyTurn() {
    if (currentEnemy.hp <= 0) return;
    const damage = Math.max(0, currentEnemy.attack - player.defense);
    player.hp = Math.max(0, player.hp - damage);
    displayMessage(`${currentEnemy.name}のこうげき！<br>${player.name}は ${damage} のダメージをうけた！`);
    updatePlayerStatus();
    if (player.hp <= 0) {
        setTimeout(loseBattle, 1000);
    } else {
        showBattleCommands(true);
    }
}
function winBattle() {
    displayMessage(`${currentEnemy.name}をやっつけた！`);
    currentEnemyIndex++;
    setTimeout(setupNextEnemy, 2000);
}
function loseBattle() {
    displayMessage(`${player.name}はたおれてしまった...<br>GAME OVER`);
    showBattleCommands(false);
}
function gameClear() {
    enemyEmojiEl.textContent = '👑';
    displayMessage('すべてのてきをたおした！<br>おめでとう！GAME CLEAR！');
    showBattleCommands(false);
}


function showBattleCommands(show) {
    const isBattleActive = show && player.hp > 0 && currentEnemyIndex < ENEMIES.length;
    attackBtn.classList.toggle('hidden', !isBattleActive);
    skillsBtn.classList.toggle('hidden', !isBattleActive);
    itemsBtn.classList.toggle('hidden', !isBattleActive);
    restartBtn.classList.toggle('hidden', isBattleActive);
}

function openSkillsModal() { /* ...変更なし... */ }
function closeSkillsModal() { /* ...変更なし... */ }
function openItemsModal() { /* ...変更なし... */ }
function closeItemsModal() { /* ...変更なし... */ }
// (簡略化のため、変更のないモーダル関数の中身は省略しています。実際には前のコードをそのままここにコピーしてください)
function openSkillsModal() {
    skillsList.innerHTML = ''; 
    player.skills.forEach(skill => {
        const skillBtn = document.createElement('button');
        skillBtn.innerHTML = `${skill.name}<br>(MP: ${skill.cost})`;
        skillBtn.disabled = player.mp < skill.cost;
        skillBtn.addEventListener('click', () => playerTurn('skill', skill.id));
        skillsList.appendChild(skillBtn);
    });
    skillsModal.classList.remove('hidden');
}
function closeSkillsModal() {
    skillsModal.classList.add('hidden');
}
function openItemsModal() {
    itemsList.innerHTML = '';
    const availableItems = player.items.filter(item => item.count > 0);
    if (availableItems.length === 0) {
        itemsList.innerHTML = '<p>つかえるどうぐがない...</p>';
    } else {
        availableItems.forEach(item => {
            const itemBtn = document.createElement('button');
            itemBtn.innerHTML = `${item.emoji} ${item.name} (のこり:${item.count})`;
            itemBtn.addEventListener('click', () => playerTurn('item', item.id));
            itemsList.appendChild(itemBtn);
        });
    }
    itemsModal.classList.remove('hidden');
}
function closeItemsModal() {
    itemsModal.classList.add('hidden');
}


// ===================================
// イベントリスナーの設定
// ===================================
attackBtn.addEventListener('click', () => playerTurn('attack'));
skillsBtn.addEventListener('click', openSkillsModal);
itemsBtn.addEventListener('click', openItemsModal);
closeSkillsModalBtn.addEventListener('click', closeSkillsModal);
closeItemsModalBtn.addEventListener('click', closeItemsModal);
restartBtn.addEventListener('click', restartGame);
studyModeBtn.addEventListener('click', startStudyMode);
shopBtn.addEventListener('click', openShop);
closeShopBtn.addEventListener('click', closeShop);
submitAnswerBtn.addEventListener('click', handleSubmitAnswer);
answerInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSubmitAnswer();
});

// ===================================
// ゲームの起動
// ===================================
initializeCharacterSelection();