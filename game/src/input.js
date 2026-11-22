// Input: mouse and keyboard, both driving the same actions. Clicking a card or
// pressing its number plays it; Space ends the turn; R starts a rematch. The
// handler never touches the state directly — it calls the rules through the
// callbacks main.js hands it, so a key and a click can never disagree.
import { canPlay } from './rules.js';

/**
 * Attach the game's input. `actions` carries playCard(index), endTurn() and
 * rematch(), which main.js owns; `getState` returns the live duel state.
 */
export function attachInput(actions, getState) {
  document.addEventListener('click', (event) => {
    const cardEl = event.target.closest('.card[data-uid]');
    if (cardEl) {
      const state = getState();
      const index = state.player.hand.findIndex((card) => card.uid === cardEl.dataset.uid);
      if (index !== -1) actions.playCard(index);
      return;
    }
    if (event.target.closest('#end-turn')) actions.endTurn();
  });

  document.addEventListener('keydown', (event) => {
    const state = getState();
    if (event.key >= '1' && event.key <= '7') {
      const index = Number(event.key) - 1;
      if (index < state.player.hand.length) actions.playCard(index);
      return;
    }
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      if (state.phase === 'play') actions.endTurn();
      return;
    }
    if (event.key === 'r' || event.key === 'R') actions.rematch();
  });
}

/** True when the card at `index` is one the player may legally play now. */
export function playable(state, index) {
  const card = state.player.hand[index];
  return Boolean(card) && canPlay(state, 'player', card);
}
