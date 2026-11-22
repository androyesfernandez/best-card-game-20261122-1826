// The duel's state: one object that holds everything a frame needs — both
// duelists' life, guard, ember and cards, whose turn it is, the log, and how the
// duel ended. Rendering reads it; the rules are the only code that writes it.
import { MAX_LIFE, PLAYER_NAME, OPPONENT_NAME, START_LIFE } from './config.js';
import { buildDeck, drawFrom } from './deck.js';
import { sortHand } from './hand.js';

export const PHASE_TITLE = 'title';
export const PHASE_PLAY = 'play';
export const PHASE_WON = 'won';
export const PHASE_LOST = 'lost';

/** One duelist: life, guard, ember, deck, hand and discard pile. */
export function makeDuelist(name, isHuman, rand) {
  return {
    name,
    isHuman,
    life: START_LIFE,
    maxLife: MAX_LIFE,
    guard: 0,
    ember: 0,
    emberMax: 0,
    deck: buildDeck(rand),
    hand: [],
    discard: [],
    damageDealt: 0,
    cardsPlayed: 0,
  };
}

/** Build the state object for a duel with the given seed. */
export function createState(seed, rand) {
  const player = makeDuelist(PLAYER_NAME, true, rand);
  const opponent = makeDuelist(OPPONENT_NAME, false, rand);
  for (let i = 0; i < 5; i += 1) {
    drawFrom(player.deck, player.hand);
    drawFrom(opponent.deck, opponent.hand);
  }
  sortHand(player.hand);
  sortHand(opponent.hand);
  const state = {
    seed,
    turn: 1,
    active: 'player',
    phase: PHASE_TITLE,
    player,
    opponent,
    log: [`The duel begins. ${PLAYER_NAME} holds 5 cards; the Duchess holds 5.`],
    lastPlay: null,
    lastPlayerPlay: null,
    lastOpponentPlay: null,
    winner: null,
    duelsWon: 0,
    duelsLost: 0,
  };
  player.ember = 1;
  player.emberMax = 1;
  opponent.ember = 1;
  opponent.emberMax = 1;
  return state;
}

/** Push a line to the duel log, keeping only the newest six. */
export function addLog(state, line) {
  state.log.push(line);
  while (state.log.length > 6) state.log.shift();
}
