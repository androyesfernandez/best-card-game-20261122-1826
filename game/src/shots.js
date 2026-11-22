// The screenshot scenes behind ?shot=cover|play|win|loss. Each one plays the
// real rules forward from a fresh duel for a fixed number of turns, steered by
// a simple autopilot (both sides play their best affordable card, then end the
// turn), so every frame is what a real duel looks like and the same seed always
// gives the same frame. Win and loss are staged by dealing a finishing hand and
// playing it through the rules — the screens are the game's own.
import { createState } from './state.js';
import { endTurn, playCard, rematch, startTurn } from './rules.js';
import { takeOpponentTurn } from './opponent.js';
import { makeRandom } from './random.js';
import { SCREEN_LOST, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WON } from './render.js';

/** The autopilot: play the highest-damage affordable card until none is good. */
function autopilotPlay(state, side) {
  for (let guard = 0; guard < 10; guard += 1) {
    if (state.phase !== 'play') return;
    let best = null;
    for (const card of (side === 'player' ? state.player : state.opponent).hand) {
      if (card.cost > (side === 'player' ? state.player : state.opponent).ember) continue;
      if (!best || card.power > best.power) best = card;
    }
    if (!best || best.power === 0) return;
    playCard(state, side, best);
  }
}

/** Run `turns` full rounds (player then Duchess) of autopilot duelling. */
function playRounds(state, turns) {
  for (let i = 0; i < turns; i += 1) {
    if (state.phase !== 'play') return;
    autopilotPlay(state, 'player');
    if (state.phase !== 'play') return;
    endTurn(state);
    if (state.phase !== 'play') return;
    takeOpponentTurn(state);
    if (state.phase !== 'play') return;
    endTurn(state);
  }
}

/** The cover: a mid-duel table under the title panel — title, both hands, score. */
function stageCover(state) {
  state.phase = 'play';
  playRounds(state, 2);
  return { screen: SCREEN_TITLE };
}

/** A live mid-game table, both hands full, life totals already dented. */
function stagePlay(state) {
  state.phase = 'play';
  playRounds(state, 4);
  return { screen: SCREEN_PLAY };
}

/** Find a damaging card for `side`, pulling one from the deck if the hand lacks it. */
function findFinisher(state, side) {
  const duelist = side === 'player' ? state.player : state.opponent;
  let finisher = duelist.hand.reduce((best, card) => (!best || card.power > best.power ? card : best), null);
  if (finisher && finisher.power >= 4) return finisher;
  const fromDeck = duelist.deck.find((card) => card.power >= 5);
  if (fromDeck) {
    duelist.deck.splice(duelist.deck.indexOf(fromDeck), 1);
    duelist.hand.push(fromDeck);
    return fromDeck;
  }
  return finisher;
}

/** Victory: the Duchess left with exactly the finisher's damage — played. */
function stageWin(state) {
  state.phase = 'play';
  playRounds(state, 3);
  const finisher = findFinisher(state, 'player');
  state.opponent.life = Math.max(1, finisher.power);
  state.opponent.guard = 0;
  state.player.ember = Math.max(state.player.ember, finisher.cost);
  playCard(state, 'player', finisher);
  return { screen: state.phase === 'won' ? SCREEN_WON : SCREEN_PLAY };
}

/** Defeat: Wren left with exactly the finisher's damage — played by the Duchess. */
function stageLoss(state) {
  state.phase = 'play';
  playRounds(state, 3);
  const finisher = findFinisher(state, 'opponent');
  state.player.life = Math.max(1, finisher.power);
  state.player.guard = 0;
  state.opponent.ember = Math.max(state.opponent.ember, finisher.cost);
  startTurn(state, 'opponent');
  playCard(state, 'opponent', finisher);
  return { screen: state.phase === 'lost' ? SCREEN_LOST : SCREEN_PLAY };
}

/**
 * Set `state` to the named scene (cover, play, win or loss; any other name is
 * cover) and return the screen to draw over it.
 */
export function stageShot(name, seed) {
  const rand = makeRandom(seed);
  const state = createState(seed, rand);
  if (name === 'play') return { state, ...stagePlay(state) };
  if (name === 'win') return { state, ...stageWin(state) };
  if (name === 'loss') return { state, ...stageLoss(state) };
  return { state, ...stageCover(state) };
}

/** Re-exported so main.js can rebuild a fresh duel after a rematch. */
export { createState, rematch };
