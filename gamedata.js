// gamedata.js

// ===================================
// キャラクターのデータ
// ===================================
const CHARACTERS = [
    {
        id: 'cat',
        name: 'ねこ勇者',
        emoji: '🐱',
        description: 'バランスがとれた勇者',
        level: 1, exp: 0, nextLevelExp: 10, // ★ 追加
        maxHp: 50, maxMp: 20,
        baseAttack: 8, baseDefense: 5,
        skills: [ { id: 'claw', name: 'するどいツメ', cost: 4, power: 1.3 }, { id: 'tackle', name: 'たいあたり', cost: 8, power: 1.8 } ]
    },
    {
        id: 'dragon',
        name: 'ちびドラゴン',
        emoji: '🐉',
        description: '攻撃こそ最大の防御！',
        level: 1, exp: 0, nextLevelExp: 12, // ★ 追加
        maxHp: 45, maxMp: 15,
        baseAttack: 12, baseDefense: 3,
        skills: [ { id: 'fire_breath', name: 'ほのおのいき', cost: 5, power: 1.6 }, { id: 'hard_claw', name: 'かたいツメ', cost: 9, power: 2.0 } ]
    },
    {
        id: 'bear',
        name: 'もりのかみ',
        emoji: '🐻',
        description: 'タフな守りのスペシャリスト',
        level: 1, exp: 0, nextLevelExp: 15, // ★ 追加
        maxHp: 70, maxMp: 10,
        baseAttack: 6, baseDefense: 8,
        skills: [ { id: 'body_slam', name: 'のしかかり', cost: 4, power: 1.1 }, { id: 'rock_throw', name: 'いわなげ', cost: 7, power: 1.5 } ]
    },
    {
        id: 'fox',
        name: 'ものしりキツネ',
        emoji: '🦊',
        description: '多彩な魔法をあやつる',
        level: 1, exp: 0, nextLevelExp: 9, // ★ 追加
        maxHp: 40, maxMp: 30,
        baseAttack: 5, baseDefense: 4,
        skills: [ { id: 'wind_cutter', name: 'かまいたち', cost: 5, power: 1.4 }, { id: 'heal', name: 'いやしのかぜ', cost: 10, power: 0, type: 'heal', amount: 25 } ]
    }
];

// ===================================
// 敵のデータ
// ===================================
const ENEMIES = [
    { name: "スライム", emoji: "💧", maxHp: 30, attack: 6, defense: 3, exp: 3, gold: 5 },       // ★ 変更
    { name: "こうもり", emoji: "🦇", maxHp: 45, attack: 9, defense: 5, exp: 5, gold: 8 },      // ★ 変更
    { name: "ゴブリン", emoji: "👺", maxHp: 60, attack: 12, defense: 4, exp: 8, gold: 12 },    // ★ 変更
    { name: "ゴーレム", emoji: "🗿", maxHp: 80, attack: 15, defense: 8, exp: 15, gold: 20 },   // ★ 変更
    { name: "魔王", emoji: "😈", maxHp: 120, attack: 20, defense: 12, exp: 0, gold: 0 }        // ★ 変更
];

// ===================================
// ショップのアイテムリスト
// ===================================
const SHOP_ITEMS = [
    { id: 'wood_stick', type: 'weapon', name: 'きのぼう', power: 4, cost: 50, emoji: '🪵' },
    { id: 'copper_sword', type: 'weapon', name: 'どうのつるぎ', power: 10, cost: 200, emoji: '⚔️' },
    { id: 'cloth_armor', type: 'armor', name: 'ぬののふく', power: 3, cost: 40, emoji: '👕' },
    { id: 'leather_shield', type: 'armor', name: 'かわのたて', power: 8, cost: 180, emoji: '🛡️' },
    { id: 'herb', type: 'item', name: 'やくそう', description: 'HPを30かいふく', cost: 20, emoji: '🌿' },
    { id: 'magic_nut', type: 'item', name: 'まほうのきのみ', description: 'MPを20かいふく', cost: 30, emoji: '🌰' },
];