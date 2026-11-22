// The hand: the small helpers that keep a player's cards sorted and affordable.
// The hand is a plain array of card objects; these functions are the only place
// that reorders it or asks what it can pay for.
import { MAX_HAND } from './config.js';

/** Sort a hand so the cheapest cards sit left and suits group together. */
export function sortHand(hand) {
  hand.sort((a, b) => (a.cost - b.cost) || (a.suit < b.suit ? -1 : a.suit > b.suit ? 1 : 0) || (b.power - a.power));
}

/** The cards in `hand` the player can afford with `ember` right now. */
export function affordable(hand, ember) {
  return hand.filter((card) => card.cost <= ember);
}

/** True when the hand is full and a drawn card would have nowhere to go. */
export function handIsFull(hand) {
  return hand.length >= MAX_HAND;
}

/** Remove the card with `uid` from `hand` and return it, or null when absent. */
export function takeCard(hand, uid) {
  const index = hand.findIndex((card) => card.uid === uid);
  if (index === -1) return null;
  return hand.splice(index, 1)[0];
}
