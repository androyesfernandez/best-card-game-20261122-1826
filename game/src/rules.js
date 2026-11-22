// The rules: the whole game loop in one place — starting a turn, playing a
// card, dealing damage through guard, drawing, fatigue, and ending the duel.
// Rendering and input call in here; nothing else mutates life, guard or ember.
import {
  FATIGUE_DAMAGE, MAX_EMBER, MAX_HAND, MAX_LIFE,
} from './config.js';
import { drawFrom } from './deck.js';
import { sortHand, takeCard } from './hand.js';
import { PHASE_LOST, PHASE_PLAY, PHASE_WON, addLog, createState } from './state.js';

/** True when `card` may be played by `side` right now. */
export function canPlay(state, side, card) {
  if (state.phase !== PHASE_PLAY) return false;
  if (state.active !== side) return false;
  const duelist = side === 'player' ? state.player : state.opponent;
  return duelist.hand.some((c) => c.uid === card.uid) && card.cost <= duelist.ember;
}

/** Deal `amount` damage to `target`, guard soaking it first; returns life damage. */
export function dealDamage(state, target, amount, sourceName) {
  const soaked = Math.min(target.guard, amount);
  target.guard -= soaked;
  const through = amount - soaked;
  target.life = Math.max(0, target.life - through);
  return { soaked, through, sourceName };
}

/** Apply a card's text effect for its owner; returns a short description. */
export function applyEffect(state, owner, card) {
  const bits = [];
  if (card.text.startsWith('Draw')) {
    const drawn = drawFrom(owner.deck, owner.hand);
    if (drawn) {
      sortHand(owner.hand);
      bits.push(`drew ${drawn.name}`);
    } else {
      bits.push('deck empty — no card to draw');
    }
  }
  if (card.text.startsWith('Heal')) {
    const amount = Number(card.text.match(/\d+/)[0]);
    const healed = Math.min(amount, MAX_LIFE - owner.life);
    owner.life += healed;
    bits.push(`healed ${healed}`);
  }
  if (card.text.startsWith('Gain')) {
    const amount = Number(card.text.match(/\d+/)[0]);
    owner.guard += amount;
    bits.push(`gained ${amount} guard`);
  }
  return bits.join(', ');
}

/**
 * Play `card` from `side`'s hand: pay its ember, hit the rival, fire its
 * effect, and end the duel when a life total reaches zero.
 */
export function playCard(state, side, card) {
  const owner = side === 'player' ? state.player : state.opponent;
  const rival = side === 'player' ? state.opponent : state.player;
  if (!canPlay(state, side, card)) return false;
  const played = takeCard(owner.hand, card.uid);
  if (!played) return false;
  owner.ember -= played.cost;
  owner.cardsPlayed += 1;
  owner.discard.push(played);
  let line = `${owner.name} plays ${played.name} (${played.power} damage)`;
  if (played.power > 0) {
    const hit = dealDamage(state, rival, played.power, played.name);
    owner.damageDealt += hit.through;
    if (hit.soaked > 0) line += ` — guard soaks ${hit.soaked}`;
    line += ` — ${rival.name} loses ${hit.through} life`;
  }
  const effect = applyEffect(state, owner, played);
  if (effect) line += ` · ${effect}`;
  state.lastPlay = { by: side, card: played, line };
  if (side === 'player') state.lastPlayerPlay = played;
  else state.lastOpponentPlay = played;
  addLog(state, line);
  checkEnd(state);
  return true;
}

/** Begin a turn for `side`: +1 ember (to a max), refill, draw a card. */
export function startTurn(state, side) {
  const duelist = side === 'player' ? state.player : state.opponent;
  duelist.emberMax = Math.min(MAX_EMBER, duelist.emberMax + 1);
  duelist.ember = duelist.emberMax;
  if (duelist.hand.length < MAX_HAND) {
    const drawn = drawFrom(duelist.deck, duelist.hand);
    if (drawn) {
      sortHand(duelist.hand);
      addLog(state, `${duelist.name} draws ${drawn.name}.`);
    } else {
      duelist.life = Math.max(0, duelist.life - FATIGUE_DAMAGE);
      addLog(state, `${duelist.name}'s deck is empty — fatigue bites for ${FATIGUE_DAMAGE}.`);
    }
  }
  state.active = side;
  checkEnd(state);
}

/** Hand the turn to the other duelist and start their turn. */
export function endTurn(state) {
  if (state.phase !== PHASE_PLAY) return;
  const next = state.active === 'player' ? 'opponent' : 'player';
  if (next === 'player') state.turn += 1;
  addLog(state, `— Turn ${state.turn}: ${next === 'player' ? state.player.name : state.opponent.name} —`);
  startTurn(state, next);
}

/** Set the phase to won/lost when a life total hits zero; returns true if over. */
export function checkEnd(state) {
  if (state.phase !== PHASE_PLAY) return false;
  if (state.opponent.life <= 0) {
    state.phase = PHASE_WON;
    state.winner = 'player';
    state.duelsWon += 1;
    addLog(state, `${state.opponent.name} falls. Victory for the Ember Court!`);
    return true;
  }
  if (state.player.life <= 0) {
    state.phase = PHASE_LOST;
    state.winner = 'opponent';
    state.duelsLost += 1;
    addLog(state, `${state.player.name} falls. The Duchess keeps the Court.`);
    return true;
  }
  return false;
}

/** Reset the duel for a rematch with a fresh seed, keeping the duel score. */
export function rematch(state, seed, rand) {
  const fresh = createState(seed, rand);
  fresh.duelsWon = state.duelsWon;
  fresh.duelsLost = state.duelsLost;
  fresh.phase = PHASE_PLAY;
  for (const key of Object.keys(fresh)) state[key] = fresh[key];
  addLog(state, `A new duel begins — seed ${seed}.`);
}
