// gamedata.js

// ===================================
// キャラクターのデータ
// ===================================
const CHARACTERS = [
    {
        id: 'cat',
        name: 'ねこ勇者',
        emoji: '🐱',
        description: 'バランスがとれたゆうしゃ',
        maxHp: 50, maxMp: 20,
        baseAttack: 8, baseDefense: 5,
        skills: [
            { id: 'hikkaki', name: 'ひっかき', cost: 3, power: 1.2 },
            { id: 'taiatari', name: 'たいあたり', cost: 8, power: 1.8 }
        ]
    },
    {
        id: 'dragon',
        name: 'ちびドラゴン',
        emoji: '🐉',
        description: 'こうげきがたかいせんし',
        maxHp: 45, maxMp: 15,
        baseAttack: 12, baseDefense: 3,
        skills: [
            { id: 'fire', name: 'ちいさなほのお', cost: 5, power: 1.5 },
            { id: 'hard_claw', name: 'かたいツメ', cost: 9, power: 2.0 }
        ]
    },
    {
        id: 'bear',
        name: 'もりのおう',
        emoji: '🐻',
        description: 'たいりょくじまんのナイト',
        maxHp: 70, maxMp: 10,
        baseAttack: 6, baseDefense: 8,
        skills: [
            { id: 'slam', name: 'からだでつぶす', cost: 4, power: 1.1 },
            { id: 'rock_throw', name: 'いわなげ', cost: 7, power: 1.6 }
        ]
    },
    {
        id: 'fox',
        name: 'きつね魔導士',
        emoji: '🦊',
        description: 'まりょくがたかいまどうし',
        maxHp: 40, maxMp: 30,
        baseAttack: 5, baseDefense: 4,
        skills: [
            { id: 'wind', name: 'かまいたち', cost: 4, power: 1.4 },
            { id: 'heal', name: 'いやしのかぜ', cost: 10, power: 0, type: 'heal', amount: 25 } // 回復とくぎ
        ]
    }
];


// ===================================
// 敵のデータ
// ===================================
const ENEMIES = [
    { name: 'スライム', emoji: '💧', maxHp: 30, attack: 6, defense: 3 },
    { name: 'こうもり', emoji: '🦇', maxHp: 45, attack: 9, defense: 4 },
    { name: 'ちびドラゴン', emoji: '🐉', maxHp: 70, attack: 12, defense: 8 },
];


// ===================================
// ショップのアイテムリスト
// ===================================
const SHOP_ITEMS = [
    { id: 'wood_stick', type: 'weapon', name: 'きのぼう', power: 3, cost: 50, emoji: '🪵' },
    { id: 'copper_sword', type: 'weapon', name: 'どうのつるぎ', power: 8, cost: 200, emoji: '⚔️' },
    { id: 'cloth_armor', type: 'armor', name: 'ぬののふく', power: 2, cost: 40, emoji: '👕' },
    { id: 'leather_shield', type: 'armor', name: 'かわのたて', power: 6, cost: 180, emoji: '🛡️' },
    { id: 'herb', type: 'item', name: 'やくそう', description: 'HPを30かいふく', cost: 20, emoji: '🌿' },
];