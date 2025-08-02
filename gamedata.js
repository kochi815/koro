// gamedata.js

// ===================================
// キャラクターのデータ
// ===================================
const CHARACTERS = [
    {
        id: 'cat',
        name: 'みならいパティシエ',
        emoji: '😺',
        description: 'バランスがとれた主人公',
        maxHp: 50, maxMp: 20,
        baseAttack: 8, baseDefense: 5,
        skills: [ { id: 'cream_whip', name: 'クリームしぼり', cost: 4, power: 1.3 }, { id: 'rolling_pin', name: 'めんぼうラッシュ', cost: 8, power: 1.8 } ]
    },
    {
        id: 'dragon',
        name: 'くいしんぼうドラゴン',
        emoji: '🐉',
        description: '攻撃こそ最大のスイーツ！',
        maxHp: 45, maxMp: 15,
        baseAttack: 12, baseDefense: 3,
        skills: [ { id: 'candy_breath', name: 'あめだまブレス', cost: 5, power: 1.6 }, { id: 'gummy_claw', name: 'グミクロー', cost: 9, power: 2.0 } ]
    },
    {
        id: 'bear',
        name: 'はちみつガードマン',
        emoji: '🐻',
        description: 'はちみつの盾で守り抜く',
        maxHp: 70, maxMp: 10,
        baseAttack: 6, baseDefense: 8,
        skills: [ { id: 'honey_shield', name: 'はちみつの盾', cost: 4, power: 1.1 }, { id: 'pancake_press', name: 'パンケーキプレス', cost: 7, power: 1.5 } ]
    },
    {
        id: 'fox',
        name: 'マジカルきつね',
        emoji: '🦊',
        description: '魔法のトッピングが得意',
        maxHp: 40, maxMp: 30,
        baseAttack: 5, baseDefense: 4,
        skills: [ { id: 'choco_magic', name: 'チョコまほう', cost: 5, power: 1.4 }, { id: 'heal_cupcake', name: 'いやしのカップケーキ', cost: 10, power: 0, type: 'heal', amount: 25 } ]
    }
];

// ===================================
// 敵（おかしモンスター）のデータ
// ===================================
const ENEMIES = [
    { name: "チョコっとスライム", emoji: "🍫", maxHp: 30, attack: 6, defense: 3 },
    { name: "クッキーゴーレム", emoji: "🍪", maxHp: 45, attack: 9, defense: 5 },
    { name: "あめだまトリオ", emoji: "🍬", maxHp: 60, attack: 12, defense: 4 },
    { name: "ドーナツまじん", emoji: "🍩", maxHp: 80, attack: 15, defense: 8 },
    { name: "魔王モンブラン", emoji: "🌰", maxHp: 120, attack: 20, defense: 12 }
];

// ===================================
// ショップのアイテムリスト
// ===================================
const SHOP_ITEMS = [
    { id: 'candy_sword', type: 'weapon', name: 'ペロペロけん', power: 4, cost: 50, emoji: '🍭' },
    { id: 'choco_sword', type: 'weapon', name: 'チョコのつるぎ', power: 10, cost: 200, emoji: '⚔️' },
    { id: 'biscuit_shield', type: 'armor', name: 'ビスケットのたて', power: 3, cost: 40, emoji: '🛡️' },
    { id: 'wafer_armor', type: 'armor', name: 'ウエハースのよろい', power: 8, cost: 180, emoji: '🎽' },
    { id: 'healing_cupcake', type: 'item', name: 'いやしのカップケーキ', description: 'HPを30かいふく', cost: 20, emoji: '🧁' },
    { id: 'magic_macaron', type: 'item', name: 'まりょくマカロン', description: 'MPを20かいふく', cost: 30, emoji: '🍥' },
];