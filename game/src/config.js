// Ember Court — the numbers that define a duel. One file, one job: every tunable
// constant lives here so the rules, the AI and the screenshot staging all read the
// same values and a balance change never has to hunt through the code.
export const PLAYER_NAME = 'Wren of the Ember Court';
export const OPPONENT_NAME = 'Duchess Ashenvale';
export const START_LIFE = 30;
export const MAX_LIFE = 30;
export const MAX_EMBER = 10;
export const START_HAND = 5;
export const MAX_HAND = 7;
export const DECK_SIZE = 30;
export const FATIGUE_DAMAGE = 2;

// The four suits of the Ember Court. Each has a colour, a one-word name and a
// small inline-SVG mark drawn by render.js — no borrowed art, no network.
export const SUITS = {
  flame: { name: 'Flame', colour: '#e8491d', dark: '#8f1f05', glyph: 'flame' },
  tide: { name: 'Tide', colour: '#1d8fe8', dark: '#0b4d85', glyph: 'tide' },
  thorn: { name: 'Thorn', colour: '#3fae4a', dark: '#145c22', glyph: 'thorn' },
  gale: { name: 'Gale', colour: '#c98a1d', dark: '#7a5205', glyph: 'gale' },
};

// A card's whole identity: which suit it belongs to, what it costs in ember,
// how hard it hits, and the one-line effect that fires when it is played.
export const CARD_DEFS = [
  { id: 'cinder-imp', name: 'Cinder Imp', suit: 'flame', cost: 1, power: 2, text: '' },
  { id: 'spark-sprite', name: 'Spark Sprite', suit: 'flame', cost: 1, power: 1, text: 'Draw 1 card.' },
  { id: 'ember-knight', name: 'Ember Knight', suit: 'flame', cost: 3, power: 4, text: '' },
  { id: 'pyre-drake', name: 'Pyre Drake', suit: 'flame', cost: 6, power: 8, text: 'Draw 1 card.' },
  { id: 'ripple-mage', name: 'Ripple Mage', suit: 'tide', cost: 2, power: 3, text: '' },
  { id: 'tidecaller', name: 'Tidecaller', suit: 'tide', cost: 2, power: 2, text: 'Heal 3 life.' },
  { id: 'spring-nymph', name: 'Spring Nymph', suit: 'tide', cost: 2, power: 1, text: 'Heal 5 life.' },
  { id: 'deep-leviathan', name: 'Deep Leviathan', suit: 'tide', cost: 7, power: 9, text: '' },
  { id: 'seedling', name: 'Seedling', suit: 'thorn', cost: 1, power: 1, text: 'Gain 3 guard.' },
  { id: 'briar-wolf', name: 'Briar Wolf', suit: 'thorn', cost: 2, power: 3, text: '' },
  { id: 'thornwall', name: 'Thornwall', suit: 'thorn', cost: 2, power: 0, text: 'Gain 6 guard.' },
  { id: 'vine-assassin', name: 'Vine Assassin', suit: 'thorn', cost: 4, power: 6, text: '' },
  { id: 'breeze-dancer', name: 'Breeze Dancer', suit: 'gale', cost: 1, power: 2, text: '' },
  { id: 'zephyr-hawk', name: 'Zephyr Hawk', suit: 'gale', cost: 3, power: 4, text: 'Draw 1 card.' },
  { id: 'gale-rider', name: 'Gale Rider', suit: 'gale', cost: 4, power: 5, text: '' },
  { id: 'storm-herald', name: 'Storm Herald', suit: 'gale', cost: 5, power: 7, text: '' },
];

// How many copies of each card go into one 30-card deck.
export const DECK_LIST = [
  ['cinder-imp', 3], ['spark-sprite', 2], ['ember-knight', 2], ['pyre-drake', 1],
  ['ripple-mage', 2], ['tidecaller', 2], ['spring-nymph', 2], ['deep-leviathan', 1],
  ['seedling', 2], ['briar-wolf', 2], ['thornwall', 2], ['vine-assassin', 1],
  ['breeze-dancer', 2], ['zephyr-hawk', 2], ['gale-rider', 2], ['storm-herald', 2],
];
