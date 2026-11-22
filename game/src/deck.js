// The deck: what a card is, how a 30-card deck is built from the card list, and
// the draw pile / discard pile bookkeeping. A card in play is a plain object
// copied from its definition, so playing one never mutates the definition.
import { CARD_DEFS, DECK_LIST } from './config.js';
import { shuffle } from './random.js';

const BY_ID = new Map(CARD_DEFS.map((def) => [def.id, def]));

/** Look a card definition up by id; throws on an unknown id, so a typo fails loud. */
export function cardDef(id) {
  const def = BY_ID.get(id);
  if (!def) throw new Error(`unknown card ${id}`);
  return def;
}

/** A fresh, playable copy of a card: its own object, stamped with a unique uid. */
export function makeCard(id, uid) {
  const def = cardDef(id);
  return { uid, id: def.id, name: def.name, suit: def.suit, cost: def.cost, power: def.power, text: def.text };
}

/** Build the 30-card deck from DECK_LIST and shuffle it with the seeded random. */
export function buildDeck(rand) {
  const ids = [];
  for (const [id, count] of DECK_LIST) {
    for (let i = 0; i < count; i += 1) ids.push(id);
  }
  const shuffled = shuffle(ids, rand);
  return shuffled.map((id, index) => makeCard(id, `c${index}`));
}

/** Draw the top card of `pile` into `hand`, or null when the pile is empty. */
export function drawFrom(pile, hand) {
  if (pile.length === 0) return null;
  const card = pile.pop();
  hand.push(card);
  return card;
}
