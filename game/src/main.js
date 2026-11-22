// Ember Court — the bootstrap. It reads ?shot=…&seed=… for the screenshot
// scenes, otherwise starts a live duel; it owns the screen (title / play / won
// / lost), hands the input its actions, and runs the Duchess's turn after the
// player ends theirs. The rules live in rules.js — this file only conducts.
import { makeRandom } from './random.js';
import { createState, PHASE_LOST, PHASE_PLAY, PHASE_WON } from './state.js';
import { endTurn, playCard, rematch, startTurn } from './rules.js';
import { takeOpponentTurn } from './opponent.js';
import { attachInput } from './input.js';
import { render, SCREEN_LOST, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WON } from './render.js';
import { stageShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const seed = Number(params.get('seed') || 7);

let state;
let screen = SCREEN_TITLE;

if (shotName) {
  const staged = stageShot(shotName, seed);
  state = staged.state;
  screen = staged.screen;
} else {
  state = createState((Date.now() % 100000) + 1, makeRandom((Date.now() % 100000) + 1));
  screen = SCREEN_TITLE;
}

/** Redraw the table for the current screen. */
function draw() {
  render(state, screen);
}

/** The Duchess takes her turn, then the turn returns to the player. */
function runOpponentTurn() {
  if (state.phase !== PHASE_PLAY) {
    draw();
    return;
  }
  takeOpponentTurn(state);
  if (state.phase === PHASE_PLAY) endTurn(state);
  settlePhase();
  draw();
}

/** Match the visible screen to the duel's phase after any move. */
function settlePhase() {
  if (state.phase === PHASE_WON) screen = SCREEN_WON;
  else if (state.phase === PHASE_LOST) screen = SCREEN_LOST;
  else if (screen !== SCREEN_TITLE) screen = SCREEN_PLAY;
}

const actions = {
  playCard(index) {
    if (state.phase !== PHASE_PLAY || screen === SCREEN_TITLE) return;
    const card = state.player.hand[index];
    if (!card) return;
    if (playCard(state, 'player', card)) {
      settlePhase();
      draw();
    }
  },
  endTurn() {
    if (state.phase !== PHASE_PLAY || state.active !== 'player') return;
    endTurn(state);
    settlePhase();
    draw();
    if (state.phase === PHASE_PLAY && state.active === 'opponent') {
      window.setTimeout(runOpponentTurn, 650);
    }
  },
  rematch() {
    const nextSeed = (Date.now() % 100000) + 1;
    rematch(state, nextSeed, makeRandom(nextSeed));
    screen = SCREEN_PLAY;
    draw();
  },
};

window.__emberStart = () => {
  state.phase = PHASE_PLAY;
  screen = SCREEN_PLAY;
  startTurn(state, 'player');
  draw();
};
window.__emberAgain = () => actions.rematch();

attachInput(actions, () => state);
draw();
