// The HUD: the small readouts that never stop mattering — life bars, ember pips
// and the duel score. render.js asks for these strings; this file owns their
// exact wording and arithmetic, so a number is never formatted twice.
import { MAX_EMBER, MAX_LIFE } from './config.js';

/** A life bar: a heart, the number, and a fill sized to the life left. */
export function lifeBar(duelist, side) {
  const pct = Math.max(0, Math.min(100, (duelist.life / MAX_LIFE) * 100));
  const low = duelist.life <= 8 ? ' low' : '';
  const guard = duelist.guard > 0 ? `<span class="guard">GUARD ${duelist.guard}</span>` : '';
  return `<div class="lifebar${low}" data-side="${side}">
    <span class="heart">♥</span><span class="life-num">${duelist.life}</span>
    <span class="life-track"><span class="life-fill" style="width:${pct}%"></span></span>
    <span class="life-max">/ ${MAX_LIFE}</span>${guard}</div>`;
}

/** Ember pips: filled dots for ember held, hollow dots for the turn's maximum. */
export function emberPips(duelist) {
  let pips = '';
  for (let i = 0; i < MAX_EMBER; i += 1) {
    const cls = i < duelist.ember ? 'pip on' : i < duelist.emberMax ? 'pip' : 'pip dim';
    pips += `<span class="${cls}"></span>`;
  }
  return `<div class="ember" title="Ember — spend it to play cards">${pips}<span class="ember-num">${duelist.ember} / ${duelist.emberMax} ember</span></div>`;
}

/** The score strip: duels won and lost, damage dealt, cards played, turn count. */
export function scoreLine(state) {
  return `DUELS WON ${state.duelsWon} · LOST ${state.duelsLost} · TURN ${state.turn} · YOUR DAMAGE ${state.player.damageDealt} · CARDS PLAYED ${state.player.cardsPlayed}`;
}
