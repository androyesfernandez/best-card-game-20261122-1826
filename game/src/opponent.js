// The opponent: Duchess Ashenvale's brain. She plays the best damage she can
// afford, prefers lethal, keeps one guard or heal in reserve when she is hurt,
// and never stalls — she always ends her turn once nothing good is left to play.
import { canPlay, playCard } from './rules.js';

/** Score a card for the AI: damage first, survival when hurt, draw when cheap. */
export function scoreCard(state, card) {
  const me = state.opponent;
  const rival = state.player;
  let score = card.power * 2 - card.cost;
  if (card.power >= rival.life) score += 100;
  if (card.text.startsWith('Heal') && me.life <= 12) score += 8;
  if (card.text.startsWith('Gain') && me.life <= 15) score += 6;
  if (card.text.startsWith('Draw')) score += 2;
  if (card.cost > me.ember) score -= 50;
  return score;
}

/**
 * Play the Duchess's whole turn: keep playing her best affordable card while
 * one beats doing nothing, then hand the turn back. Returns the cards played.
 */
export function takeOpponentTurn(state) {
  const played = [];
  for (let guard = 0; guard < 10; guard += 1) {
    if (state.phase !== 'play') break;
    let best = null;
    let bestScore = 0;
    for (const card of state.opponent.hand) {
      if (!canPlay(state, 'opponent', card)) continue;
      const score = scoreCard(state, card);
      if (score > bestScore) {
        bestScore = score;
        best = card;
      }
    }
    if (!best) break;
    if (playCard(state, 'opponent', best)) played.push(best.name);
    else break;
  }
  return played;
}
