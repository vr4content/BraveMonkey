<?php
/**
 * Brave Monkey — standalone PHP library
 * Project: https://github.com/vr4content/BraveMonkey
 * Live demo: https://vr4content.github.io/BraveMonkey/
 *
 * This generated single-file library has no Composer or runtime dependencies.
 *
 * Quick start:
 *   require_once __DIR__ . '/BraveMonkey.php';
 *   $valid = \BraveMonkey\Identity::validatePin('Uplifted', 'Jewel', '179752');
 *   $svg = \BraveMonkey\Identity::avatarSvg('Uplifted', 'Jewel');
 *   echo $svg;
 *
 * API:
 *   Identity::pinFromWords(string $adjective, string $noun): string
 *     Computes the six-digit checksum for words in the bundled catalog.
 *   Identity::validatePin(string $adjective, string $noun, string $pin): bool
 *     Checks catalog membership and whether the supplied six-digit PIN matches.
 *   Identity::avatarSvg(string $adjective, string $noun, array $options = []): string
 *     Returns the deterministic SVG. Optional keys: `lang`, `title`, and
 *     `description`. The title and description are XML-escaped.
 *   Identity::IDENTITY_PROTOCOL_VERSION and Identity::AVATAR_RENDERER_VERSION
 *     Public constants identifying the checksum and SVG renderer versions.
 *
 * The PIN is a public checksum, not a password, authentication factor, or
 * proof of account ownership. This library recreates the icon from the word
 * pair; it does not need questionnaire answers or the PIN to render the SVG.
 *
 * Generated from src/libraries/BraveMonkey.php.in and assets/words.yaml by
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
declare(strict_types=1);

namespace BraveMonkey;

final class Identity
{
    public const IDENTITY_PROTOCOL_VERSION = "identity-v1";
    public const AVATAR_RENDERER_VERSION = "initials-avatar-v1";
    private const AVATAR_BADGE_COLOR = '#FFFCF6';
    private const AVATAR_MIN_CONTRAST_RATIO = 7;
    private const ADJECTIVES = [
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
    ];
    private const NOUNS = [
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
    ];
    private const AVATAR_THEMES = [
        ['background' => '#FCE4E8', 'pattern' => '#D7A2AC', 'ink' => '#672E3B'],
        ['background' => '#E4F3E8', 'pattern' => '#A8CDB2', 'ink' => '#28533D'],
        ['background' => '#E3F0FC', 'pattern' => '#A6C8E8', 'ink' => '#24466A'],
        ['background' => '#EFE7FB', 'pattern' => '#C0AEE0', 'ink' => '#503675'],
        ['background' => '#FFF0DD', 'pattern' => '#E6BE8C', 'ink' => '#69451D'],
        ['background' => '#DFF3F1', 'pattern' => '#9FCFC9', 'ink' => '#20534F'],
    ];

    /** Compute the six-digit public checksum for a catalog adjective–noun pair. */
    public static function pinFromWords(string $adjective, string $noun): string
    {
        $pair = self::resolvePair($adjective, $noun);
        if ($pair === null) {
            throw new \InvalidArgumentException('Adjective and noun must be present in the bundled word catalog.');
        }

        return self::pinForPair($pair);
    }

    /** Return true only when the words are in the catalog and the six-digit PIN matches. */
    public static function validatePin(string $adjective, string $noun, string $pin): bool
    {
        if (preg_match('/\A[0-9]{6}\z/', $pin) !== 1) {
            return false;
        }

        $pair = self::resolvePair($adjective, $noun);
        if ($pair === null) {
            return false;
        }

        return self::pinForPair($pair) === $pin;
    }

    /** Return the deterministic SVG for a catalog adjective–noun pair. */
    public static function avatarSvg(string $adjective, string $noun, array $options = []): string
    {
        $pair = self::resolvePair($adjective, $noun);
        if ($pair === null) {
            throw new \InvalidArgumentException('Adjective and noun must be present in the bundled word catalog.');
        }

        $lang = $options['lang'] ?? 'en';
        if (!is_string($lang) || preg_match('/\A[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*\z/', $lang) !== 1) {
            throw new \InvalidArgumentException('Avatar lang must be a valid language tag such as en or en-GB.');
        }

        $pairLabel = $pair['adjective'] . ' ' . $pair['noun'];
        $initials = strtoupper($pair['adjective'][0] . $pair['noun'][0]);
        $title = $options['title'] ?? ($pairLabel . ' · Brave Monkey avatar');
        $description = $options['description'] ?? ('Initials ' . $initials . ' from ' . $pairLabel . ' on a patterned pastel background.');
        if (!is_string($title) || !is_string($description)) {
            throw new \InvalidArgumentException('Avatar title and description must be strings.');
        }

        $message = 'bravemonkey:avatar:' . self::AVATAR_RENDERER_VERSION . ':'
            . strtolower($pair['adjective']) . ':' . strtolower($pair['noun']);
        $digest = hash('sha256', $message, true);
        $theme = self::AVATAR_THEMES[ord($digest[0]) % count(self::AVATAR_THEMES)];
        $patternIndex = ord($digest[1]) % 4;
        $rotation = (ord($digest[2]) % 4) * 90;
        $pattern = self::avatarPatternMarkup($patternIndex, $theme['pattern']);

        self::assertAvatarThemeContrast();

        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 260" data-renderer-version="'
            . self::AVATAR_RENDERER_VERSION . '" xml:lang="' . self::escapeXml($lang)
            . '" role="img" aria-labelledby="avatar-title avatar-desc"><title id="avatar-title">'
            . self::escapeXml($title) . '</title><desc id="avatar-desc">'
            . self::escapeXml($description)
            . '</desc><defs><clipPath id="avatar-clip" clipPathUnits="userSpaceOnUse"><rect width="260" height="260" rx="36"/></clipPath></defs><rect width="260" height="260" rx="36" fill="'
            . $theme['background'] . '"/><g clip-path="url(#avatar-clip)" transform="rotate('
            . $rotation . ' 130 130)" opacity="0.58">' . $pattern
            . '</g><rect x="28" y="58" width="204" height="144" rx="48" fill="'
            . self::AVATAR_BADGE_COLOR . '" stroke="' . $theme['pattern']
            . '" stroke-width="3"/><text x="130" y="130" text-anchor="middle" dominant-baseline="central" font-family="Arial,Helvetica,sans-serif" font-size="96" font-weight="800" letter-spacing="3" fill="'
            . $theme['ink'] . '">' . $initials . '</text></svg>';
    }

    /** @return array{adjective: string, noun: string}|null */
    private static function resolvePair(string $adjective, string $noun): ?array
    {
        $canonicalAdjective = self::canonicalWord($adjective, self::ADJECTIVES);
        $canonicalNoun = self::canonicalWord($noun, self::NOUNS);
        if ($canonicalAdjective === null || $canonicalNoun === null) {
            return null;
        }

        return ['adjective' => $canonicalAdjective, 'noun' => $canonicalNoun];
    }

    private static function canonicalWord(string $word, array $catalog): ?string
    {
        $trimmed = preg_replace(
            '/\A[\x{0009}\x{000A}\x{000B}\x{000C}\x{000D}\x{0020}\x{00A0}\x{1680}\x{2000}-\x{200A}\x{2028}\x{2029}\x{202F}\x{205F}\x{3000}\x{FEFF}]+|[\x{0009}\x{000A}\x{000B}\x{000C}\x{000D}\x{0020}\x{00A0}\x{1680}\x{2000}-\x{200A}\x{2028}\x{2029}\x{202F}\x{205F}\x{3000}\x{FEFF}]+\z/u',
            '',
            $word
        );
        if (!is_string($trimmed)) {
            return null;
        }

        $normalized = strtolower($trimmed);
        foreach ($catalog as $candidate) {
            if (strtolower($candidate) === $normalized) {
                return $candidate;
            }
        }

        return null;
    }

    private static function pinForPair(array $pair): string
    {
        $message = 'bravemonkey:pin:' . self::IDENTITY_PROTOCOL_VERSION . ':'
            . strtolower($pair['adjective']) . ':' . strtolower($pair['noun']);
        $digest = hash('sha256', $message, true);

        // Streaming the first four big-endian bytes modulo one million avoids
        // unsigned 32-bit overflow on 32-bit PHP builds.
        $remainder = 0;
        for ($index = 0; $index < 4; $index++) {
            $remainder = ($remainder * 256 + ord($digest[$index])) % 1000000;
        }

        return str_pad((string) $remainder, 6, '0', STR_PAD_LEFT);
    }

    private static function escapeXml(string $value): string
    {
        return htmlspecialchars($value, ENT_QUOTES | ENT_XML1 | ENT_SUBSTITUTE, 'UTF-8');
    }

    private static function relativeLuminance(string $color): float
    {
        $channels = [];
        foreach ([1, 3, 5] as $offset) {
            $channel = hexdec(substr($color, $offset, 2)) / 255;
            $channels[] = $channel <= 0.04045
                ? $channel / 12.92
                : (($channel + 0.055) / 1.055) ** 2.4;
        }

        return 0.2126 * $channels[0] + 0.7152 * $channels[1] + 0.0722 * $channels[2];
    }

    private static function contrastRatio(string $firstColor, string $secondColor): float
    {
        $firstLuminance = self::relativeLuminance($firstColor);
        $secondLuminance = self::relativeLuminance($secondColor);
        $lighter = max($firstLuminance, $secondLuminance);
        $darker = min($firstLuminance, $secondLuminance);

        return ($lighter + 0.05) / ($darker + 0.05);
    }

    private static function assertAvatarThemeContrast(): void
    {
        foreach (self::AVATAR_THEMES as $theme) {
            if (
                self::contrastRatio($theme['ink'], $theme['background']) < self::AVATAR_MIN_CONTRAST_RATIO
                || self::contrastRatio($theme['ink'], self::AVATAR_BADGE_COLOR) < self::AVATAR_MIN_CONTRAST_RATIO
            ) {
                throw new \RuntimeException('Avatar theme does not meet the minimum contrast ratio.');
            }
        }
    }

    private static function avatarPatternMarkup(int $patternIndex, string $color): string
    {
        if ($patternIndex === 0) {
            $dots = [];
            for ($row = 0; $row < 10; $row++) {
                $y = 16 + $row * 24;
                $firstX = $row % 2 === 0 ? 16 : 28;
                for ($x = $firstX; $x <= 244; $x += 24) {
                    $dots[] = '<circle cx="' . $x . '" cy="' . $y . '" r="3.25"/>';
                }
            }

            return '<g fill="' . $color . '">' . implode('', $dots) . '</g>';
        }

        if ($patternIndex === 1) {
            $stripes = [];
            for ($x = -260; $x <= 260; $x += 28) {
                $stripes[] = '<path d="M' . $x . ' 0L' . ($x + 260) . ' 260"/>';
            }

            return '<g fill="none" stroke="' . $color . '" stroke-width="5" stroke-linecap="round">'
                . implode('', $stripes) . '</g>';
        }

        if ($patternIndex === 2) {
            $rings = [];
            foreach ([[0, 0], [260, 0], [0, 260], [260, 260]] as [$cx, $cy]) {
                foreach ([24, 48, 72, 96] as $radius) {
                    $rings[] = '<circle cx="' . $cx . '" cy="' . $cy . '" r="' . $radius . '"/>';
                }
            }

            return '<g fill="none" stroke="' . $color . '" stroke-width="3">'
                . implode('', $rings) . '</g>';
        }

        if ($patternIndex === 3) {
            $waves = [];
            for ($y = 16; $y <= 240; $y += 32) {
                $waves[] = '<path d="M-20 ' . $y . 'Q0 ' . ($y - 14) . ' 0 ' . $y
                    . 'T40 ' . $y . 'T80 ' . $y . 'T120 ' . $y . 'T160 ' . $y
                    . 'T200 ' . $y . 'T240 ' . $y . 'T280 ' . $y . '"/>';
            }

            return '<g fill="none" stroke="' . $color . '" stroke-width="4" stroke-linecap="round">'
                . implode('', $waves) . '</g>';
        }

        throw new \InvalidArgumentException('Invalid avatar pattern index.');
    }
}
