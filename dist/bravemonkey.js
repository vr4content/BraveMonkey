/*!
 * Brave Monkey — standalone browser library
 * Project: https://github.com/vr4content/BraveMonkey
 * Live demo: https://vr4content.github.io/BraveMonkey/
 *
 * This generated single-file library is a browser-global script; it has no
 * imports, network requests, storage, or other runtime dependencies. It adds
 * `BraveMonkeyIdentity` to `globalThis`.
 *
 * Quick start:
 *   <script src="/path/to/bravemonkey.js"></script>
 *   <script>
 *     (async () => {
 *       const valid = await BraveMonkeyIdentity.validatePin(
 *         "Uplifted", "Jewel", "179752"
 *       );
 *       const svg = await BraveMonkeyIdentity.avatarSvg("Uplifted", "Jewel");
 *       document.querySelector("#avatar").innerHTML = svg;
 *     })();
 *   </script>
 *
 * API (all methods return Promises because browser SHA-256 is asynchronous):
 *   pinFromWords(adjective, noun) -> Promise<string>
 *     Computes the six-digit checksum for words in the bundled catalog.
 *   validatePin(adjective, noun, pin) -> Promise<boolean>
 *     Checks catalog membership and whether the supplied six-digit PIN matches.
 *   avatarSvg(adjective, noun, options?) -> Promise<string>
 *     Returns the deterministic SVG. Optional options: `lang`, `title`, and
 *     `description`. The title and description are XML-escaped.
 *
 * Requires browser Web Crypto (`crypto.subtle`) and `TextEncoder`, normally in
 * an HTTPS or localhost secure context. The PIN is a public checksum, not a
 * password, authentication factor, or proof of account ownership.
 *
 * Generated from src/libraries/bravemonkey.js.in and assets/words.yaml by
 * scripts/build-libraries.mjs. Edit the source/template, not the dist file.
 *
 * MIT License
 * Copyright (c) 2026 vr4content
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
(function (root) {
  "use strict";

  const IDENTITY_PROTOCOL_VERSION = "identity-v1";
  const AVATAR_RENDERER_VERSION = "initials-avatar-v1";
  const AVATAR_BADGE_COLOR = "#FFFCF6";
  const AVATAR_MIN_CONTRAST_RATIO = 7;
  const ADJECTIVES = Object.freeze([
    "Adorable",
    "Active",
    "Adventurous",
    "Agile",
    "Alert",
    "Amused",
    "Ancient",
    "Angelic",
    "Aquatic",
    "Arctic",
    "Artistic",
    "Ashen",
    "Balanced",
    "Bashful",
    "Beaming",
    "Beloved",
    "Bold",
    "Bouncy",
    "Brave",
    "Breezy",
    "Bright",
    "Brilliant",
    "Bubbly",
    "Calm",
    "Candid",
    "Caring",
    "Celestial",
    "Cheerful",
    "Chipper",
    "Clear",
    "Clever",
    "Cloudy",
    "Colorful",
    "Comfy",
    "Content",
    "Cozy",
    "Creative",
    "Curious",
    "Fluffy",
    "Daring",
    "Dazzling",
    "Dear",
    "Decent",
    "Delightful",
    "Dewy",
    "Sleepy",
    "Dreamy",
    "Dynamic",
    "Eager",
    "Earthy",
    "Electric",
    "Elegant",
    "Elfish",
    "Energetic",
    "Fair",
    "Faithful",
    "Fancy",
    "Fearless",
    "Festive",
    "Fiery",
    "Floral",
    "Flowing",
    "Friendly",
    "Frosty",
    "Gentle",
    "Genuine",
    "Giddy",
    "Glad",
    "Gleaming",
    "Glimmering",
    "Glowing",
    "Golden",
    "Grand",
    "Grateful",
    "Green",
    "Happy",
    "Hardy",
    "Harmonious",
    "Helpful",
    "Heroic",
    "Honest",
    "Hopeful",
    "Humble",
    "Icy",
    "Imaginative",
    "Ingenious",
    "Innocent",
    "Inspired",
    "Jolly",
    "Joyful",
    "Sunny",
    "Keen",
    "Kind",
    "Lively",
    "Luminous",
    "Lunar",
    "Magical",
    "Majestic",
    "Mellow",
    "Mighty",
    "Minty",
    "Modest",
    "Musical",
    "Neat",
    "Nimble",
    "Noble",
    "Oceanic",
    "Optimistic",
    "Huggable",
    "Patient",
    "Peaceful",
    "Perky",
    "Playful",
    "Pleasant",
    "Plucky",
    "Polished",
    "Pretty",
    "Proud",
    "Pure",
    "Purple",
    "Quick",
    "Quiet",
    "Radiant",
    "Ready",
    "Red",
    "Relaxed",
    "Reliable",
    "Resilient",
    "Wobbly",
    "Restful",
    "Rosy",
    "Round",
    "Rustic",
    "Serene",
    "Shiny",
    "Silky",
    "Silver",
    "Simple",
    "Sincere",
    "Skillful",
    "Blue",
    "Sleek",
    "Smart",
    "Smiling",
    "Smooth",
    "Snappy",
    "Snowy",
    "Soft",
    "Solar",
    "Squishy",
    "Sparkling",
    "Spirited",
    "Stable",
    "Starlit",
    "Steady",
    "Strong",
    "Superb",
    "Swift",
    "Talented",
    "Tender",
    "Thankful",
    "Thoughtful",
    "Thriving",
    "Tidy",
    "Timeless",
    "Tranquil",
    "Trusty",
    "Tuneful",
    "Twinkling",
    "Upbeat",
    "Uplifted",
    "Valiant",
    "Vibrant",
    "Wiggly",
    "Warm",
    "Welcoming",
    "Whimsical",
    "White",
    "Wild",
    "Willing",
    "Wise",
    "Witty",
    "Wonderful",
    "Youthful",
    "Zany",
    "Zesty",
    "Airy",
    "Animated",
    "Aware",
    "Blissful",
    "Blossoming",
    "Charming",
    "Cheery",
    "Classic",
    "Crisp",
    "Cushy",
    "Dapper",
    "Dashing",
    "Dependable",
    "Devoted",
    "Earnest",
    "Enchanted",
    "Endearing",
    "Flourishing",
    "Fresh",
    "Fun",
    "Gallant",
    "Generous",
    "Glittering",
    "Good",
    "Goofy",
    "Hearty",
    "Inventive",
    "Lighthearted",
    "Lovely",
    "Loyal",
    "Big",
    "Cool",
    "Cute",
    "Fast",
    "Funny",
    "Great",
    "Lucky",
    "Nice",
    "Silly",
    "Small",
    "Sweet",
    "Tiny",
  ]);
  const NOUNS = Object.freeze([
    "Puppy",
    "Antelope",
    "Badger",
    "Bat",
    "Bear",
    "Beaver",
    "Bee",
    "Beetle",
    "Bison",
    "Buffalo",
    "Butterfly",
    "Camel",
    "Canary",
    "Capybara",
    "Cat",
    "Cheetah",
    "Chicken",
    "Chinchilla",
    "Cobra",
    "Cougar",
    "Coyote",
    "Cow",
    "Crab",
    "Crane",
    "Cricket",
    "Crocodile",
    "Crow",
    "Deer",
    "Dinosaur",
    "Dog",
    "Dolphin",
    "Donkey",
    "Dove",
    "Dragon",
    "Dragonfly",
    "Duck",
    "Eagle",
    "Elk",
    "Falcon",
    "Ferret",
    "Finch",
    "Flamingo",
    "Fox",
    "Frog",
    "Gazelle",
    "Gecko",
    "Giraffe",
    "Goat",
    "Goose",
    "Gorilla",
    "Grasshopper",
    "Hamster",
    "Hare",
    "Hawk",
    "Hedgehog",
    "Heron",
    "Hippo",
    "Horse",
    "Hummingbird",
    "Hyena",
    "Iguana",
    "Jackal",
    "Jaguar",
    "Jellyfish",
    "Kangaroo",
    "Koala",
    "Lark",
    "Lemur",
    "Leopard",
    "Lion",
    "Llama",
    "Lobster",
    "Lynx",
    "Magpie",
    "Muffin",
    "Meerkat",
    "Mole",
    "Monkey",
    "Moose",
    "Moth",
    "Mouse",
    "Narwhal",
    "Newt",
    "Octopus",
    "Opossum",
    "Orangutan",
    "Orca",
    "Otter",
    "Owl",
    "Ox",
    "Panda",
    "Panther",
    "Parrot",
    "Peacock",
    "Pelican",
    "Penguin",
    "Pheasant",
    "Phoenix",
    "Pig",
    "Pigeon",
    "Platypus",
    "Porcupine",
    "Puffin",
    "Puma",
    "Quail",
    "Rabbit",
    "Raccoon",
    "Ram",
    "Raven",
    "Reindeer",
    "Rhino",
    "Robin",
    "Salamander",
    "Salmon",
    "Seal",
    "Seahorse",
    "Shark",
    "Sheep",
    "Shrimp",
    "Skunk",
    "Sloth",
    "Snail",
    "Snake",
    "Sparrow",
    "Spider",
    "Squirrel",
    "Starfish",
    "Stork",
    "Swan",
    "Tiger",
    "Toad",
    "Toucan",
    "Trout",
    "Turtle",
    "Unicorn",
    "Walrus",
    "Wasp",
    "Whale",
    "Wolf",
    "Wombat",
    "Woodpecker",
    "Yak",
    "Zebra",
    "Acorn",
    "Almond",
    "Apple",
    "Apricot",
    "Artichoke",
    "Cake",
    "Asparagus",
    "Avocado",
    "Bamboo",
    "Banana",
    "Barley",
    "Basil",
    "Bean",
    "Beet",
    "Blackberry",
    "Blueberry",
    "Bread",
    "Broccoli",
    "Cabbage",
    "Cactus",
    "Candy",
    "Cantaloupe",
    "Carrot",
    "Cashew",
    "Cauliflower",
    "Celery",
    "Cheese",
    "Cherry",
    "Chestnut",
    "Chickpea",
    "Chili",
    "Chive",
    "Cilantro",
    "Cinnamon",
    "Clementine",
    "Coconut",
    "Corn",
    "Cranberry",
    "Cucumber",
    "Currant",
    "Daisy",
    "Dandelion",
    "Date",
    "Dill",
    "Eggplant",
    "Elderberry",
    "Fig",
    "Flax",
    "Garlic",
    "Grape",
    "Grapefruit",
    "Guava",
    "Hazelnut",
    "Hibiscus",
    "Honeydew",
    "Kale",
    "Kiwi",
    "Leek",
    "Lemon",
    "Lentil",
    "Lettuce",
    "Lime",
    "Lychee",
    "Mango",
    "Maple",
    "Marigold",
    "Melon",
    "Mulberry",
    "Mushroom",
    "Nectarine",
    "Nutmeg",
    "Oat",
    "Onion",
    "Orchid",
    "Papaya",
    "Parsley",
    "Parsnip",
    "Peanut",
    "Pear",
    "Pea",
    "Pecan",
    "Pepper",
    "Persimmon",
    "Pineapple",
    "Pistachio",
    "Pomegranate",
    "Poppy",
    "Potato",
    "Pumpkin",
    "Radish",
    "Raspberry",
    "Rhubarb",
    "Rice",
    "Rosemary",
    "Sesame",
    "Shallot",
    "Spinach",
    "Squash",
    "Strawberry",
    "Sunflower",
    "Tangerine",
    "Tarragon",
    "Thyme",
    "Tomato",
    "Turnip",
    "Walnut",
    "Watermelon",
    "Wheat",
    "Yam",
    "Zucchini",
    "Aurora",
    "Beach",
    "Bubble",
    "Brook",
    "Canyon",
    "Cascade",
    "Cave",
    "Cliff",
    "Cloud",
    "Coast",
    "Comet",
    "Cosmos",
    "Creek",
    "Crystal",
    "Dawn",
    "Delta",
    "Donut",
    "Dew",
    "Dune",
    "Earth",
    "Eclipse",
    "Ember",
    "Puddle",
    "Fern",
    "Fish",
    "Flame",
    "Flint",
    "Forest",
    "Fossil",
    "Galaxy",
    "Garden",
    "Glacier",
    "Glen",
    "Grove",
    "Harbor",
    "Horizon",
    "Island",
    "Isle",
    "Lagoon",
    "Lake",
    "Lanternlight",
    "Lava",
    "Leaf",
    "Meadow",
    "Meteor",
    "Mist",
    "Moon",
    "Moonbeam",
    "Mountain",
    "Oasis",
    "Ocean",
    "Orbit",
    "Pebble",
    "Pancake",
    "Petal",
    "Planet",
    "Plateau",
    "Pond",
    "Prairie",
    "Quartz",
    "Rain",
    "Rainbow",
    "Reef",
    "Ridge",
    "River",
    "Rock",
    "Sand",
    "Savannah",
    "Sea",
    "Shadow",
    "Shore",
    "Skyline",
    "Snow",
    "Snowdrop",
    "Spring",
    "Star",
    "Starlight",
    "Stone",
    "Stream",
    "Summit",
    "Sunrise",
    "Sunset",
    "Tide",
    "Timber",
    "Tundra",
    "Valley",
    "Vapor",
    "Waterfall",
    "Wave",
    "Wetland",
    "Wind",
    "Woodland",
    "Sun",
    "Anchor",
    "Apron",
    "Arrow",
    "Atlas",
    "Backpack",
    "Badge",
    "Basket",
    "Bell",
    "Blanket",
    "Boat",
    "Book",
    "Bottle",
    "Bowl",
    "Bridge",
    "Brush",
    "Bucket",
    "Button",
    "Camera",
    "Candle",
    "Canvas",
    "Car",
    "Carriage",
    "Castle",
    "Chair",
    "Chalk",
    "Chessboard",
    "Clock",
    "Compass",
    "Crown",
    "Cup",
    "Cushion",
    "Diamond",
    "Drum",
    "Easel",
    "Envelope",
    "Feather",
    "Fence",
    "Flag",
    "Flute",
    "Fountain",
    "Frame",
    "Gate",
    "Gear",
    "Glass",
    "Globe",
    "Guitar",
    "Hammer",
    "Hat",
    "Helmet",
    "House",
    "Hinge",
    "Hourglass",
    "Ink",
    "Jar",
    "Jewel",
    "Journal",
    "Kettle",
    "Key",
    "Kite",
    "Ladder",
    "Lamp",
    "Locket",
    "Loom",
    "Magnet",
    "Marble",
    "Mask",
    "Medal",
    "Mirror",
    "Mosaic",
    "Mug",
    "Noodle",
    "Notebook",
    "Oar",
    "Paddle",
    "Paint",
    "Palette",
    "Paper",
    "Parcel",
    "Pendant",
    "Pen",
    "Phone",
    "Pencil",
    "Piano",
    "Pillow",
    "Pinwheel",
    "Pocket",
    "Puzzle",
    "Ribbon",
    "Ring",
    "Rope",
    "Saddle",
    "Sail",
    "Scarf",
    "Scroll",
    "Shield",
    "Ship",
    "Sketchbook",
    "Slipper",
    "Spoon",
    "Staircase",
    "Stamp",
    "Statue",
    "String",
    "Suitcase",
    "Sundial",
    "Telescope",
    "Thread",
    "Ticket",
    "Torch",
    "Tower",
    "Train",
    "Trumpet",
    "Umbrella",
    "Vase",
    "Violin",
    "Wagon",
    "Wheel",
    "Window",
    "Windmill",
    "Whistle",
    "Yarn",
    "Accordion",
    "Airship",
    "Alley",
    "Alpaca",
    "Pot",
    "Flower",
    "Antler",
    "Arch",
    "Archway",
    "Armadillo",
    "Asteroid",
    "Axolotl",
    "Bagel",
    "Balcony",
    "Ball",
    "Balloon",
    "Barn",
    "Lizard",
    "Beacon",
    "Bead",
    "Beagle",
    "Beehive",
    "Berry",
    "Birch",
    "Biscuit",
    "Bluejay",
    "Board",
    "Foxglove",
    "Freesia",
    "Gardenia",
    "Ginkgo",
    "Glasshouse",
    "Goldenrod",
    "Grapevine",
  ]);
  const AVATAR_THEMES = Object.freeze([
    Object.freeze({ background: "#FCE4E8", pattern: "#D7A2AC", ink: "#672E3B" }),
    Object.freeze({ background: "#E4F3E8", pattern: "#A8CDB2", ink: "#28533D" }),
    Object.freeze({ background: "#E3F0FC", pattern: "#A6C8E8", ink: "#24466A" }),
    Object.freeze({ background: "#EFE7FB", pattern: "#C0AEE0", ink: "#503675" }),
    Object.freeze({ background: "#FFF0DD", pattern: "#E6BE8C", ink: "#69451D" }),
    Object.freeze({ background: "#DFF3F1", pattern: "#9FCFC9", ink: "#20534F" })
  ]);
  const ADJECTIVE_LOOKUP = new Map(ADJECTIVES.map(word => [word.toLowerCase(), word]));
  const NOUN_LOOKUP = new Map(NOUNS.map(word => [word.toLowerCase(), word]));
  const XML_ESCAPES = Object.freeze({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&apos;"
  });
  const LANGUAGE_TAG_RE = /[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*/;

  function canonicalWord(value, lookup) {
    if (typeof value !== "string") return null;
    return lookup.get(value.trim().toLowerCase()) ?? null;
  }

  function resolvePair(adjective, noun) {
    const canonicalAdjective = canonicalWord(adjective, ADJECTIVE_LOOKUP);
    const canonicalNoun = canonicalWord(noun, NOUN_LOOKUP);
    if (canonicalAdjective === null || canonicalNoun === null) return null;
    return { adjective: canonicalAdjective, noun: canonicalNoun };
  }

  async function sha256(message) {
    if (!root.crypto?.subtle || typeof root.crypto.subtle.digest !== "function") {
      throw new Error("Web Crypto SHA-256 is unavailable; use HTTPS or localhost.");
    }
    if (typeof root.TextEncoder !== "function") {
      throw new Error("TextEncoder is unavailable in this browser.");
    }
    const bytes = new root.TextEncoder().encode(message);
    return new Uint8Array(await root.crypto.subtle.digest("SHA-256", bytes));
  }

  function readU32BigEndian(bytes) {
    return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0, false);
  }

  async function pinForPair(pair) {
    const message = `bravemonkey:pin:${IDENTITY_PROTOCOL_VERSION}:${pair.adjective.toLowerCase()}:${pair.noun.toLowerCase()}`;
    const digest = await sha256(message);
    return String(readU32BigEndian(digest) % 1000000).padStart(6, "0");
  }

  async function pinFromWords(adjective, noun) {
    const pair = resolvePair(adjective, noun);
    if (pair === null) {
      throw new TypeError("Adjective and noun must be present in the bundled word catalog.");
    }
    return pinForPair(pair);
  }

  async function validatePin(adjective, noun, pin) {
    if (typeof pin !== "string" || pin.length !== 6 || !/^[0-9]{6}$/.test(pin)) return false;
    const pair = resolvePair(adjective, noun);
    if (pair === null) return false;
    return (await pinForPair(pair)) === pin;
  }

  function escapeXml(value) {
    return value.replace(/[&<>"']/g, character => XML_ESCAPES[character]);
  }

  function relativeLuminance(color) {
    const channels = [1, 3, 5].map(offset => {
      const channel = parseInt(color.slice(offset, offset + 2), 16) / 255;
      return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  }

  function contrastRatio(firstColor, secondColor) {
    const firstLuminance = relativeLuminance(firstColor);
    const secondLuminance = relativeLuminance(secondColor);
    const lighter = Math.max(firstLuminance, secondLuminance);
    const darker = Math.min(firstLuminance, secondLuminance);
    return (lighter + 0.05) / (darker + 0.05);
  }

  function assertAvatarThemeContrast() {
    for (const theme of AVATAR_THEMES) {
      if (
        contrastRatio(theme.ink, theme.background) < AVATAR_MIN_CONTRAST_RATIO ||
        contrastRatio(theme.ink, AVATAR_BADGE_COLOR) < AVATAR_MIN_CONTRAST_RATIO
      ) {
        throw new Error("Avatar theme does not meet the minimum contrast ratio.");
      }
    }
  }

  function avatarPatternMarkup(patternIndex, color) {
    if (patternIndex === 0) {
      const dots = [];
      for (let row = 0; row < 10; row++) {
        const y = 16 + row * 24;
        const firstX = row % 2 === 0 ? 16 : 28;
        for (let x = firstX; x <= 244; x += 24) {
          dots.push(`<circle cx="${x}" cy="${y}" r="3.25"/>`);
        }
      }
      return `<g fill="${color}">${dots.join("")}</g>`;
    }

    if (patternIndex === 1) {
      const stripes = [];
      for (let x = -260; x <= 260; x += 28) {
        stripes.push(`<path d="M${x} 0L${x + 260} 260"/>`);
      }
      return `<g fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round">${stripes.join("")}</g>`;
    }

    if (patternIndex === 2) {
      const rings = [];
      for (const [cx, cy] of [[0, 0], [260, 0], [0, 260], [260, 260]]) {
        for (const radius of [24, 48, 72, 96]) {
          rings.push(`<circle cx="${cx}" cy="${cy}" r="${radius}"/>`);
        }
      }
      return `<g fill="none" stroke="${color}" stroke-width="3">${rings.join("")}</g>`;
    }

    if (patternIndex === 3) {
      const waves = [];
      for (let y = 16; y <= 240; y += 32) {
        waves.push(`<path d="M-20 ${y}Q0 ${y - 14} 0 ${y}T40 ${y}T80 ${y}T120 ${y}T160 ${y}T200 ${y}T240 ${y}T280 ${y}"/>`);
      }
      return `<g fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round">${waves.join("")}</g>`;
    }

    throw new Error("Invalid avatar pattern index.");
  }

  async function avatarSvg(adjective, noun, options = {}) {
    const pair = resolvePair(adjective, noun);
    if (pair === null) {
      throw new TypeError("Adjective and noun must be present in the bundled word catalog.");
    }
    if (options === null || typeof options !== "object" || Array.isArray(options)) {
      throw new TypeError("Avatar options must be an object.");
    }

    const lang = options.lang ?? "en";
    const langMatch = typeof lang === "string" ? LANGUAGE_TAG_RE.exec(lang) : null;
    if (langMatch === null || langMatch[0] !== lang) {
      throw new TypeError("Avatar lang must be a valid language tag such as en or en-GB.");
    }

    const pairLabel = `${pair.adjective} ${pair.noun}`;
    const initials = `${pair.adjective[0]}${pair.noun[0]}`.toUpperCase();
    const title = options.title ?? `${pairLabel} · Brave Monkey avatar`;
    const description = options.description ?? `Initials ${initials} from ${pairLabel} on a patterned pastel background.`;
    if (typeof title !== "string" || typeof description !== "string") {
      throw new TypeError("Avatar title and description must be strings.");
    }

    const digest = await sha256(
      `bravemonkey:avatar:${AVATAR_RENDERER_VERSION}:${pair.adjective.toLowerCase()}:${pair.noun.toLowerCase()}`
    );
    const theme = AVATAR_THEMES[digest[0] % AVATAR_THEMES.length];
    const patternIndex = digest[1] % 4;
    const rotation = (digest[2] % 4) * 90;
    const pattern = avatarPatternMarkup(patternIndex, theme.pattern);

    assertAvatarThemeContrast();
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 260" data-renderer-version="${AVATAR_RENDERER_VERSION}" xml:lang="${escapeXml(lang)}" role="img" aria-labelledby="avatar-title avatar-desc"><title id="avatar-title">${escapeXml(title)}</title><desc id="avatar-desc">${escapeXml(description)}</desc><defs><clipPath id="avatar-clip" clipPathUnits="userSpaceOnUse"><rect width="260" height="260" rx="36"/></clipPath></defs><rect width="260" height="260" rx="36" fill="${theme.background}"/><g clip-path="url(#avatar-clip)" transform="rotate(${rotation} 130 130)" opacity="0.58">${pattern}</g><rect x="28" y="58" width="204" height="144" rx="48" fill="${AVATAR_BADGE_COLOR}" stroke="${theme.pattern}" stroke-width="3"/><text x="130" y="130" text-anchor="middle" dominant-baseline="central" font-family="Arial,Helvetica,sans-serif" font-size="96" font-weight="800" letter-spacing="3" fill="${theme.ink}">${initials}</text></svg>`;
  }

  root.BraveMonkeyIdentity = Object.freeze({
    identityProtocolVersion: IDENTITY_PROTOCOL_VERSION,
    avatarRendererVersion: AVATAR_RENDERER_VERSION,
    dictionarySizes: Object.freeze({ adjectives: ADJECTIVES.length, nouns: NOUNS.length }),
    pinFromWords,
    validatePin,
    avatarSvg
  });
})(globalThis);
