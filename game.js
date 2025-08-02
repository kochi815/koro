// ===================================
// ゲームの基本的な設定
// ===================================

// 主人公のデータ
// 今回はネコに固定しますが、将来的にはここを選べるようにします。
const player = {
    name: 'ねこ勇者',
    emoji: '🐱',
    hp: 50,
    maxHp: 50,
    mp: 20,
    maxMp: 20,
    attack: 8,
    defense: 5,
    skills: [
        { id: 'hikkaki', name: 'ひっかき', cost: 3, power: 1.2, description: 'するどいツメでひっかく！' },
        { id: 'taiatari', name: 'たいあたり', cost: 8, power: 1.8, description: 'からだごとぶつかる！' }
    ]
};

// 敵のデータ
// ここに倒していくモンスターを追加していきます。
const enemies = [
    { name: 'スライム', emoji: '💧', hp: 30, maxHp: 30, attack: 6, defense: 3, gold: 5, exp: 3 },
    { name: 'こうもり', emoji: '🦇', hp: 45, maxHp: 45, attack: 9, defense: 4, gold: 8, exp: 5 },
    { name: 'ちびドラゴン', emoji: '🐉', hp: 70, maxHp: 70, attack: 12, defense: 8, gold: 15, exp: 10 },
];
let currentEnemy; // 現在戦っている敵

// ===================================
// HTML要素の取得
// ===================================
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
const skillsModal = document.getElementById('skills-modal');
const skillsList = document.getElementById('skills-list');
const closeSkillsModalBtn = document.getElementById('close-skills-modal-btn');

// ===================================
// ゲームの処理を書く関数
// ===================================

// ゲームの初期化
function initGame() {
    // 最初の敵を設定
    currentEnemy = { ...enemies[0] };
    
    // 表示を更新
    updatePlayerStatus();
    updateEnemyStatus();
    displayMessage(`${currentEnemy.name}があらわれた！`);

    // 「たたかう」ボタンのイベント
    attackBtn.addEventListener('click', () => {
        playerTurn('attack');
    });

    // 「とくぎ」ボタンのイベント
    skillsBtn.addEventListener('click', openSkillsModal);
    closeSkillsModalBtn.addEventListener('click', closeSkillsModal);
}

// プレイヤーのステータス表示を更新
function updatePlayerStatus() {
    playerNameEl.textContent = player.name;
    playerHpTextEl.textContent = `${player.hp} / ${player.maxHp}`;
    playerMpTextEl.textContent = `${player.mp} / ${player.maxMp}`;
    // HPバーの幅を計算
    playerHpValueEl.style.width = `${(player.hp / player.maxHp) * 100}%`;
    playerMpValueEl.style.width = `${(player.mp / player.maxMp) * 100}%`;
}

// 敵のステータス表示を更新
function updateEnemyStatus() {
    enemyNameEl.textContent = currentEnemy.name;
    enemyEmojiEl.textContent = currentEnemy.emoji;
    enemyHpTextEl.textContent = `${currentEnemy.hp} / ${currentEnemy.maxHp}`;
    // HPバーの幅を計算
    enemyHpValueEl.style.width = `${(currentEnemy.hp / currentEnemy.maxHp) * 100}%`;
}

// メッセージを表示
function displayMessage(message) {
    messageTextEl.innerHTML = message; // innerHTMLを使って改行も反映できるようにする
}

// プレイヤーのターン
function playerTurn(action, skillId = null) {
    closeSkillsModal(); // とくぎモーダルが開いていれば閉じる

    let damage = 0;
    let message = '';

    if (action === 'attack') {
        // 通常攻撃
        damage = Math.max(0, player.attack - currentEnemy.defense);
        message = `${player.name}のこうげき！<br>`;
    } else if (action === 'skill') {
        // とくぎ攻撃
        const skill = player.skills.find(s => s.id === skillId);
        if (player.mp < skill.cost) {
            displayMessage('MPがたりない！');
            return; // MPが足りなければターン終了
        }
        player.mp -= skill.cost;
        damage = Math.max(0, Math.floor(player.attack * skill.power) - currentEnemy.defense);
        message = `${player.name}は${skill.name}をつかった！<br>`;
    }
    
    currentEnemy.hp = Math.max(0, currentEnemy.hp - damage);
    message += `${currentEnemy.name}に${damage}のダメージ！`;
    displayMessage(message);
    updatePlayerStatus();
    updateEnemyStatus();

    // 敵を倒したかチェック
    if (currentEnemy.hp <= 0) {
        winBattle();
    } else {
        // 敵のターンへ
        disableCommands();
        setTimeout(enemyTurn, 1500); // 1.5秒後に敵のターン
    }
}

// 敵のターン
function enemyTurn() {
    let damage = Math.max(0, currentEnemy.attack - player.defense);
    player.hp = Math.max(0, player.hp - damage);
    
    displayMessage(`${currentEnemy.name}のこうげき！<br>${player.name}は${damage}のダメージをうけた！`);
    updatePlayerStatus();

    // プレイヤーがやられたかチェック
    if (player.hp <= 0) {
        loseBattle();
    } else {
        enableCommands();
    }
}

// 戦闘に勝利した時
function winBattle() {
    displayMessage(`${currentEnemy.name}をたおした！`);
    disableCommands();
    // ここで次の敵を出す処理などを後で追加します
}

// 戦闘に敗北した時
function loseBattle() {
    displayMessage(`${player.name}はたおれてしまった...`);
    disableCommands();
}

// コマンドボタンを無効化
function disableCommands() {
    attackBtn.disabled = true;
    skillsBtn.disabled = true;
}

// コマンドボタンを有効化
function enableCommands() {
    attackBtn.disabled = false;
    skillsBtn.disabled = false;
}

// とくぎモーダルを開く
function openSkillsModal() {
    skillsList.innerHTML = ''; // 中身を一旦空にする
    player.skills.forEach(skill => {
        const skillBtn = document.createElement('button');
        skillBtn.innerHTML = `${skill.name}<br>(MP: ${skill.cost})`;
        if (player.mp < skill.cost) {
            skillBtn.disabled = true; // MPが足りない技は押せなくする
        }
        skillBtn.addEventListener('click', () => {
            playerTurn('skill', skill.id);
        });
        skillsList.appendChild(skillBtn);
    });
    skillsModal.classList.remove('hidden');
}

// とくぎモーダルを閉じる
function closeSkillsModal() {
    skillsModal.classList.add('hidden');
}


// ===================================
// ゲーム開始
// ===================================
initGame();