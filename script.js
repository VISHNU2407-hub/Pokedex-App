/* ============================================================
   FREE BUFF POKÉDEX — Vanilla JavaScript (ES6+)
   ============================================================
   Features:
   - Search by name or ID
   - Previous / Next / Random navigation
   - Animated stat bars
   - Type-colored badges
   - Local Storage persistence
   - Loading spinner with Pokéball animation
   - Graceful error handling
   ============================================================ */

/* ============================================================
   DOM References
   ============================================================ */
const DOM = {
  // Search elements
  searchInput: document.getElementById('searchInput'),
  searchBtn: document.getElementById('searchBtn'),

  // Loading
  loadingOverlay: document.getElementById('loadingOverlay'),

  // Card container
  pokedexSection: document.getElementById('pokedex'),
  pokedexCard: document.getElementById('pokedexCard'),

  // Pokémon identity
  pokemonImage: document.getElementById('pokemonImage'),
  pokemonId: document.getElementById('pokemonId'),
  pokemonName: document.getElementById('pokemonName'),

  // Type badges
  typeBadges: document.getElementById('typeBadges'),

  // Info details
  pokemonHeight: document.getElementById('pokemonHeight'),
  pokemonWeight: document.getElementById('pokemonWeight'),
  pokemonBaseExp: document.getElementById('pokemonBaseExp'),
  pokemonAbilities: document.getElementById('pokemonAbilities'),

  // Stats
  statsContainer: document.getElementById('statsContainer'),

  // Navigation
  prevBtn: document.getElementById('prevBtn'),
  nextBtn: document.getElementById('nextBtn'),
  randomBtn: document.getElementById('randomBtn'),

  // Error
  errorBanner: document.getElementById('errorBanner'),
  errorMessage: document.getElementById('errorMessage'),
  errorClose: document.getElementById('errorClose'),

  // Hints
  hintBtns: document.querySelectorAll('.hint-btn'),
};

/* ============================================================
   State
   ============================================================ */
let currentPokemonId = 1; // Tracks the currently displayed Pokémon
let isFetching = false;    // Prevents concurrent API calls

/* ============================================================
   Constants
   ============================================================ */
const API_BASE = 'https://pokeapi.co/api/v2/pokemon';
const STORAGE_KEY = 'pokedex_last_search';
const MAX_POKEMON = 1010; // Known upper limit for Pokémon species IDs
const STAT_NAMES = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  speed: 'Speed',
};

/* ============================================================
   Initialisation
   ============================================================ */

/**
 * Boot up the application: attach listeners and restore the last
 * viewed Pokémon from Local Storage.
 */
function init() {
  attachEventListeners();
  restoreLastSearch();
}

/* ============================================================
   Event Listeners
   ============================================================ */

/**
 * Wire up all interactive elements.
 */
function attachEventListeners() {
  // Search via button click
  DOM.searchBtn.addEventListener('click', () => {
    executeSearch();
  });

  // Search via Enter key
  DOM.searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeSearch();
    }
  });

  // Navigation: Previous, Next, Random
  DOM.prevBtn.addEventListener('click', () => navigatePokemon(-1));
  DOM.nextBtn.addEventListener('click', () => navigatePokemon(1));
  DOM.randomBtn.addEventListener('click', fetchRandomPokemon);

  // Dismiss error banner
  DOM.errorClose.addEventListener('click', () => {
    DOM.errorBanner.classList.add('hidden');
  });

  // Hint buttons (quick-search pills)
  DOM.hintBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const value = btn.dataset.pokemon;
      if (value) {
        DOM.searchInput.value = value;
        executeSearch();
      }
    });
  });
}

/* ============================================================
   Search
   ============================================================ */

/**
 * Read the search input, sanitise it, and trigger a lookup.
 */
function executeSearch() {
  const raw = DOM.searchInput.value.trim();

  if (!raw) {
    showError('Please enter a Pokémon name or ID!');
    DOM.searchInput.focus();
    return;
  }

  searchPokemon(raw);
}

/**
 * Determine whether the query is numeric (ID) or textual (name),
 * then fetch from the API.
 *
 * @param {string} query - User-supplied search term.
 */
function searchPokemon(query) {
  // If the input is a valid positive integer, use it as an ID
  const trimmed = query.trim().toLowerCase();
  const id = parseInt(trimmed, 10);

  if (!isNaN(id) && id > 0 && String(id) === trimmed) {
    getPokemon(id);
  } else {
    // Pokémon names from the API are always lowercase
    getPokemon(encodeURIComponent(trimmed));
  }
}

/* ============================================================
   API Call
   ============================================================ */

/**
 * Fetch a Pokémon from the PokéAPI.
 *
 * @param {number|string} identifier - Pokémon ID or name.
 */
async function getPokemon(identifier) {
  if (isFetching) return; // Guard against overlapping requests

  try {
    isFetching = true;
    showLoading();

    const response = await fetch(`${API_BASE}/${identifier}`);

    // 404 means the Pokémon doesn't exist
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Couldn't find a Pokémon matching "${identifier}".`);
      }
      throw new Error(`Server error (${response.status}). Please try again.`);
    }

    const data = await response.json();

    // Persist the successful ID for session recovery
    currentPokemonId = data.id;
    saveLastSearch(data.id);

    updateUI(data);
    hideLoading();
  } catch (error) {
    hideLoading();
    showError(error.message);
  } finally {
    isFetching = false;
  }
}

/* ============================================================
   UI Update
   ============================================================ */

/**
 * Populate the entire card with fresh Pokémon data.
 *
 * @param {Object} pokemon - Raw response from the PokéAPI.
 */
function updateUI(pokemon) {
  // Animate card transition (quick fade out → in)
  DOM.pokedexSection.classList.remove('hidden');
  DOM.pokedexSection.classList.add('exiting');

  // Use a microtask delay so the CSS exit animation plays
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // --- Identity ---
      DOM.pokemonImage.src =
        pokemon.sprites.other?.['official-artwork']?.front_default
        || pokemon.sprites.front_default
        || '';
      DOM.pokemonImage.alt = `${pokemon.name} official artwork`;
      DOM.pokemonId.textContent = `#${String(pokemon.id).padStart(3, '0')}`;
      DOM.pokemonName.textContent = pokemon.name;

      // --- Types ---
      updateTypeColors(pokemon.types);

      // --- Info ---
      DOM.pokemonHeight.textContent = formatMetric(pokemon.height, 'm');
      DOM.pokemonWeight.textContent = formatMetric(pokemon.weight, 'kg');
      DOM.pokemonBaseExp.textContent = pokemon.base_experience
        ? `${pokemon.base_experience} XP`
        : '—';
      DOM.pokemonAbilities.textContent = pokemon.abilities
        .map((a) => a.ability.name.replace('-', ' '))
        .join(', ');

      // --- Stats ---
      updateStats(pokemon.stats);

      // Remove exiting class to trigger entrance animation
      DOM.pokedexSection.classList.remove('exiting');
    });
  });
}

/* ============================================================
   Type Badges
   ============================================================ */

/**
 * Render coloured type badges inside the card.
 *
 * @param {Array} types - Array of { type: { name } } objects.
 */
function updateTypeColors(types) {
  DOM.typeBadges.innerHTML = types
    .map((t) => {
      const typeName = t.type.name;
      return `<span class="type-badge type-${typeName}">
        <i class="fas fa-tag" aria-hidden="true"></i>
        ${typeName}
      </span>`;
    })
    .join('');
}

/* ============================================================
   Stats (Animated Progress Bars)
   ============================================================ */

/**
 * Build and animate the stat bars.
 *
 * @param {Array} stats - Array of { base_stat, stat: { name } } objects.
 */
function updateStats(stats) {
  DOM.statsContainer.innerHTML = stats
    .map((s) => {
      const label = STAT_NAMES[s.stat.name] || s.stat.name;
      const value = s.base_stat;
      // Cap the bar at 255 (the theoretical max base stat)
      const percent = Math.min((value / 255) * 100, 100);
      const statClass = s.stat.name.replace('special-attack', 'spatk')
                                   .replace('special-defense', 'spdef');

      return `
        <div class="stat-row stat-${statClass}">
          <span class="stat-label">${label}</span>
          <div class="stat-bar-track">
            <div class="stat-bar-fill" style="width: ${percent}%"></div>
          </div>
          <span class="stat-value">${value}</span>
        </div>
      `;
    })
    .join('');
}

/* ============================================================
   Navigation
   ============================================================ */

/**
 * Move to the previous or next Pokémon (wrapping at boundaries).
 *
 * @param {number} direction - -1 for previous, +1 for next.
 */
function navigatePokemon(direction) {
  const nextId = currentPokemonId + direction;

  // Clamp between 1 and MAX_POKEMON
  if (nextId < 1) {
    showError("You're at the very first Pokémon!");
    return;
  }
  if (nextId > MAX_POKEMON) {
    showError("You've reached the end of the Pokédex!");
    return;
  }

  getPokemon(nextId);
}

/**
 * Fetch a random Pokémon between 1 and MAX_POKEMON.
 */
function fetchRandomPokemon() {
  const randomId = Math.floor(Math.random() * MAX_POKEMON) + 1;
  getPokemon(randomId);
}

/* ============================================================
   Loading State
   ============================================================ */

function showLoading() {
  DOM.loadingOverlay.classList.remove('hidden');
  DOM.searchBtn.disabled = true;
}

function hideLoading() {
  DOM.loadingOverlay.classList.add('hidden');
  DOM.searchBtn.disabled = false;
}

/* ============================================================
   Error Handling
   ============================================================ */

/**
 * Display an error banner at the top of the card.
 *
 * @param {string} message - Human-readable error text.
 */
function showError(message) {
  DOM.errorMessage.textContent = message;
  DOM.errorBanner.classList.remove('hidden');

  // Auto-dismiss after 6 seconds
  setTimeout(() => {
    DOM.errorBanner.classList.add('hidden');
  }, 6000);
}

/* ============================================================
   Local Storage
   ============================================================ */

/**
 * Persist the last-searched Pokémon ID so it can be restored
 * on the next visit.
 *
 * @param {number} id - Pokémon ID.
 */
function saveLastSearch(id) {
  try {
    localStorage.setItem(STORAGE_KEY, String(id));
  } catch {
    // Silently ignore quota exceeded errors in private browsing
  }
}

/**
 * On page load, fetch the last-searched Pokémon from Local Storage
 * and display it.
 */
function restoreLastSearch() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const id = parseInt(saved, 10);
      if (!isNaN(id) && id > 0 && id <= MAX_POKEMON) {
        getPokemon(id);
        return;
      }
    }
  } catch {
    // Ignore storage read errors
  }

  // Default: show the first Pokémon (Bulbasaur)
  getPokemon(1);
}

/* ============================================================
   Utility Helpers
   ============================================================ */

/**
 * Convert a PokéAPI measurement into a human-readable string.
 *
 * Height comes in decimetres → converted to metres.
 * Weight comes in hectograms → converted to kilograms.
 *
 * @param {number} value - Raw API value.
 * @param {'m'|'kg'} unit - Target unit.
 * @returns {string} Formatted string (e.g. "0.7 m" or "6.9 kg").
 */
function formatMetric(value, unit) {
  if (value == null) return '—';
  if (unit === 'm') {
    return `${(value / 10).toFixed(1)} m`;
  }
  if (unit === 'kg') {
    return `${(value / 10).toFixed(1)} kg`;
  }
  return String(value);
}

/* ============================================================
   Bootstrap
   ============================================================ */
document.addEventListener('DOMContentLoaded', init);
