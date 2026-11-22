// The renderer: turns the duel state into the table the player sees. Plain DOM
// and CSS (no canvas): every card is real text — name, cost, power, suit and
// effect — so the values stay readable at any size and the screenshots show a
// real game, not a painting of one.
import { SUITS } from './config.js';
import { emberPips, lifeBar, scoreLine } from './hud.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_WON = 'won';
export const SCREEN_LOST = 'lost';

/** Inline-SVG suit marks, drawn from the suit name — original art, no files. */
export function suitIcon(glyph, size, colour) {
  const paths = {
    flame: '<path d="M12 2c1.5 3.5-2 4.5-.5 7.5.8-.8 1.3-1.6 1.5-2.5 1.8 1.8 2.8 3.6 2.8 5.5a7.2 7.2 0 1 1-14.4 0c0-2.6 2.4-4.4 3.6-6.8.8 1.2 1.2 2.3 1.6 2.8.4-1.8.8-3.6 2.4-5.5z"/>',
    tide: '<path d="M2 9q3-3.5 6 0t6 0 6 0M2 14q3-3.5 6 0t6 0 6 0M2 19q3-3.5 6 0t6 0 6 0" fill="none" stroke-width="2.4" stroke-linecap="round"/>',
    thorn: '<path d="M12 2C7 7 5.5 12 12 22 18.5 12 17 7 12 2z"/><path d="M12 8v12M12 12l-3.5 2.5M12 15l3.5 2.5" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>',
    gale: '<path d="M3 8h11a3 3 0 1 0-3-3M3 13h15a3 3 0 1 1-3 3M3 18h8" fill="none" stroke-width="2.4" stroke-linecap="round"/>',
  };
  const fill = glyph === 'tide' || glyph === 'gale' ? 'none' : colour;
  const stroke = glyph === 'tide' || glyph === 'gale' ? colour : 'none';
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}" stroke="${stroke}" aria-hidden="true">${paths[glyph] || ''}</svg>`;
}

/** One face-up card: cost, suit, name, power and effect — all readable text. */
export function cardHtml(card, opts = {}) {
  const suit = SUITS[card.suit];
  const afford = opts.affordable === false ? ' unaffordable' : '';
  const selected = opts.selected ? ' selected' : '';
  return `<div class="card${afford}${selected}" data-uid="${card.uid}" style="--suit:${suit.colour};--suit-dark:${suit.dark}">
    <div class="card-top"><span class="cost" title="Ember cost">${card.cost}</span>
    <span class="suit-mark">${suitIcon(suit.glyph, 26, '#fff')}<span class="suit-name">${suit.name.toUpperCase()}</span></span></div>
    <div class="card-art">${suitIcon(suit.glyph, 64, suit.colour)}</div>
    <div class="card-name">${card.name}</div>
    <div class="card-power"><span class="power-num">${card.power}</span><span class="power-label">DAMAGE</span></div>
    <div class="card-text">${card.text || 'A plain strike.'}</div>
    <div class="card-key">${opts.key || ''}</div>
  </div>`;
}

/** One face-down card back, showing only that the Duchess holds a card. */
export function cardBackHtml(key) {
  return `<div class="card back"><div class="back-mark">✦</div><div class="back-name">EMBER<br>COURT</div><div class="card-key">${key || ''}</div></div>`;
}

/** The two most recent plays, one per side, on the table. */
function tableHtml(state) {
  const you = state.lastPlayerPlay;
  const foe = state.lastOpponentPlay;
  const log = state.log.slice(-4).map((line) => `<div class="log-line">${line}</div>`).join('');
  return `<div class="table-mid">
    <div class="played"><div class="played-label">YOUR LAST PLAY</div>${you ? cardHtml(you, {}) : '<div class="played-empty">— no card yet —</div>'}</div>
    <div class="versus">VS</div>
    <div class="played"><div class="played-label">DUCHESS LAST PLAY</div>${foe ? cardHtml(foe, {}) : '<div class="played-empty">— no card yet —</div>'}</div>
    <div class="log"><div class="log-title">DUEL LOG</div>${log}</div>
  </div>`;
}

/** Rebuild the whole table from `state`; call after every move. */
export function render(state, screen) {
  const root = document.getElementById('app');
  const opp = state.opponent;
  const me = state.player;
  const oppBacks = opp.hand.map((_, i) => cardBackHtml('')).join('');
  const myCards = me.hand.map((card, i) => cardHtml(card, {
    affordable: card.cost <= me.ember,
    key: `${i + 1}`,
  })).join('');
  const turnNote = state.phase === 'won' || state.phase === 'lost'
    ? 'DUEL OVER — press R for a rematch'
    : state.active === 'player'
      ? 'YOUR TURN — click a card to play it, or end your turn'
      : 'THE DUCHESS IS THINKING…';
  root.innerHTML = `
  <header class="topbar">
    <div class="brand">EMBER COURT</div>
    <div class="score">${scoreLine(state)}</div>
    <div class="deck-counts">YOUR DECK ${me.deck.length} · DUCHESS DECK ${opp.deck.length}</div>
  </header>
  <section class="foe-zone">
    <div class="duelist foe">
      <div class="portrait foe-portrait">DA</div>
      <div class="duelist-info"><div class="duelist-name">${opp.name}</div>${lifeBar(opp, 'foe')}${emberPips(opp)}</div>
    </div>
    <div class="foe-hand">${oppBacks}<div class="hand-count">${opp.hand.length} CARDS IN HAND</div></div>
  </section>
  ${tableHtml(state)}
  <section class="my-zone">
    <div class="duelist me">
      <div class="portrait me-portrait">WR</div>
      <div class="duelist-info"><div class="duelist-name">${me.name} — YOU</div>${lifeBar(me, 'me')}${emberPips(me)}</div>
      <button id="end-turn" class="end-turn" ${state.active === 'player' && state.phase === 'play' ? '' : 'disabled'}>END TURN ⏎</button>
    </div>
    <div class="my-hand">${myCards}</div>
  </section>
  <div class="hint">${turnNote} · keys 1–7 play a card · Space ends turn · R rematch</div>
  <div id="overlay" class="overlay ${screen === SCREEN_PLAY ? 'hidden' : ''}">${overlayHtml(state, screen)}</div>`;
  wireOverlay(state, screen);
  window.__shotReady = true;
}

/** The big panel over the table: title, victory or defeat. */
function overlayHtml(state, screen) {
  if (screen === SCREEN_WON) {
    return `<div class="panel win">
      <div class="panel-kicker">THE DUEL IS WON</div>
      <h1>VICTORY</h1>
      <p>The Duchess yields the Ember Court. ${state.player.name} stands with ${state.player.life} life remaining.</p>
      <p class="panel-stats">${scoreLine(state)}</p>
      <button id="again" class="big-btn">PLAY AGAIN (R)</button>
      <p class="panel-note">You dealt ${state.player.damageDealt} damage in ${state.turn} turns.</p></div>`;
  }
  if (screen === SCREEN_LOST) {
    return `<div class="panel loss">
      <div class="panel-kicker">THE DUEL IS LOST</div>
      <h1>DEFEAT</h1>
      <p>The embers fade. ${state.opponent.name} keeps the Court — your life reached zero on turn ${state.turn}.</p>
      <p class="panel-stats">${scoreLine(state)}</p>
      <button id="again" class="big-btn">TRY AGAIN (R)</button>
      <p class="panel-note">You dealt ${state.player.damageDealt} damage. The Duchess had ${state.opponent.life} life left.</p></div>`;
  }
  return `<div class="panel title">
    <div class="panel-kicker">A DUEL OF CARDS · FLAME · TIDE · THORN · GALE</div>
    <h1>EMBER<br>COURT</h1>
    <p class="tagline">Outplay the Duchess, card by card. Reduce her 30 life to zero before she does the same to you.</p>
    <div class="howto">
      <div><b>1 · DRAW</b> — a card each turn, ember grows to 10</div>
      <div><b>2 · PLAY</b> — click a card (or press 1–7) to spend ember and strike</div>
      <div><b>3 · SURVIVE</b> — heal, guard and draw your way to her last life</div>
    </div>
    <button id="start" class="big-btn">START THE DUEL</button>
    <p class="panel-note">Your hand is below — five cards, costs in ember, damage in plain numbers.</p></div>`;
}

/** Wire the overlay's buttons to the handlers main.js registered. */
function wireOverlay(state, screen) {
  const start = document.getElementById('start');
  if (start) start.addEventListener('click', () => window.__emberStart && window.__emberStart());
  const again = document.getElementById('again');
  if (again) again.addEventListener('click', () => window.__emberAgain && window.__emberAgain());
}
