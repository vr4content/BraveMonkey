# 🐒 Brave Monkey

**Same answers. Same alias.**

Brave Monkey is a static, browser-only generator for a reproducible English adjective–noun pseudonym, a six-digit public checksum, and a matching initials avatar. Its deterministic scheme is the **Brave Monkey Identity Protocol v1** (`identity-v1`).

> **Not authentication:** the PIN is calculated from the public word pair. It is a checksum, not a password, proof of identity, or proof of account ownership. A service using these aliases must provide its own authentication and account IDs.

**[Try the live demo](https://vr4content.github.io/BraveMonkey/) · [Browse the source on GitHub](https://github.com/vr4content/BraveMonkey)**

Brave Monkey is a public, open-source project released under the MIT License. Explore how it works, reuse the code, or adapt it to help your project create an anonymous alias. The MIT license requires retaining its copyright and permission notice; bundled third-party components retain their own licenses.

## Project files

```text
index.html                         Page markup and styles
assets/app.js                      Browser-side application and interface
dist/bravemonkey.js                Standalone browser PIN/SVG library
dist/BraveMonkey.php               Standalone PHP PIN/SVG library
assets/vcard.js                    Shared vCard 3.0 serializer
assets/words.yaml                  Ordered English-only word catalog
assets/vendor/js-yaml.esm.min.js   Locally bundled YAML parser
assets/vendor/js-yaml-LICENSE.txt  Parser license
assets/vendor/qrcodejs.min.js      Local QRCode.js 1.0.0 contact QR generator
assets/vendor/qrcodejs-LICENSE.txt QR generator license
locales/web.yaml                   English, German, and Spanish UI text
```

Bootstrap is loaded from its pinned jsDelivr CDN URL with subresource integrity. The YAML parser and QR generator are bundled with the project. Questionnaire answers are processed in the browser and are not included in network requests.

## Standalone libraries

The `dist` directory contains two self-contained files for third-party integrations:

- [`dist/bravemonkey.js`](dist/bravemonkey.js) exposes the browser global `BraveMonkeyIdentity` for PIN calculation/validation and deterministic SVG generation.
- [`dist/BraveMonkey.php`](dist/BraveMonkey.php) provides the equivalent `BraveMonkey\Identity` PHP class.

Both files include quick-start examples, project links, API notes, and the MIT license in their comments. The JavaScript file uses browser Web Crypto and therefore needs HTTPS or localhost. The PIN remains a public checksum, not authentication.

The libraries are generated from `assets/words.yaml`, `src/libraries/protocol.json`, and the source templates in `src/libraries/`. To rebuild them locally, run `node scripts/build-libraries.mjs`; to check the generated files and test JavaScript/PHP parity, run `node scripts/build-libraries.mjs --check` and `node tests/libraries.test.mjs`. GitHub Actions runs these checks on pull requests and publishes the two files as assets for `v*` GitHub Releases.

## Questionnaire

The single questionnaire asks for:

1. Birthday **day only**, from `01` through `31`.
2. Exactly two Unicode letters from the family name.
3. Exactly two Unicode letters from the father's first name.
4. Exactly two Unicode letters from the mother's first name.
5. Exactly two Unicode letters from the birthplace.
6. Sibling count: `0`, `1`, `2`, `3`, or `4 or more`.
7. Whether the person has ever had a pet (`YES` or `NO`). If `YES`, exactly two Unicode letters from the first pet's name are required.

Letter fields accept Unicode letters, including accented and non-Latin letters. The input must contain exactly two Unicode letters; it is normalized to NFC, with following combining marks attached to their letter, then uppercased with Unicode's default, locale-independent mapping. If an uppercase mapping expands a letter (for example, `ß` to `SS`), the expansion is retained. Letters are never transliterated. Spaces, punctuation, symbols, and digits are rejected. Enter only the first two letters, not a full name. The same answers and normalization must be used on every visit.

Each letter field limits entry to two Unicode grapheme characters (including paste); combining marks stay with their letter. On submit, every invalid field is highlighted with its own message, and focus moves to the first invalid field. Once validation has run, field errors update as answers are corrected.

If the pet answer is `NO`, the pet-name field is hidden and the protocol value is always `NONE`. There is no `UNKNOWN` value. The app does not ask for a birth month, colors, symbols, or other personal facts.

## Brave Monkey Identity Protocol v1

The protocol identifier is `identity-v1`. All protocol fields are strings. Prefixes below are already NFC-normalized and uppercased by the app. The canonical answers are serialized in this exact order with JavaScript `JSON.stringify`:

```js
const canonical = JSON.stringify([
  "identity-v1",
  birthdayDay,       // "01" through "31"
  familyPrefix,      // uppercase mapping of two input Unicode letters
  fatherPrefix,      // uppercase mapping of two input Unicode letters
  motherPrefix,      // uppercase mapping of two input Unicode letters
  birthplacePrefix,  // uppercase mapping of two input Unicode letters
  siblings,          // "0", "1", "2", "3", or "4PLUS"
  hadPet,            // "YES" or "NO"
  petPrefix          // uppercase mapping of two letters for YES; "NONE" for NO
]);
```

For each word list, the protocol selects an index independently:

```text
seed = "bravemonkey:identity:identity-v1:adjective:" + canonical
     or "bravemonkey:identity:identity-v1:noun:" + canonical
```

Hash the UTF-8 seed with SHA-256 and read the first four digest bytes as an unsigned big-endian 32-bit integer. To avoid modulo bias, accept values below `floor(2^32 / count) * count` and return `value % count`. If a value is rejected, retry with `seed + ":retry:" + attempt`, starting at `attempt = 1`. The current ordered catalog contains **228 adjectives** and **501 nouns**. Catalog contents and order determine the generated aliases.

The displayed alias is the selected English adjective and noun, uppercased and separated by one space. The six-digit PIN is a public checksum of that pair alone:

```text
message = UTF8("bravemonkey:pin:identity-v1:" + lowercase(trim(adjective))
                                      + ":" + lowercase(trim(noun)))
PIN = pad6(UINT32_BE(SHA256(message)[0..3]) mod 1,000,000)
```

The independent PIN checker also requires the adjective and noun to be present in their respective English catalog lists. A matching PIN proves only that the checksum is consistent with the submitted word pair.

### Reference test vector

After NFC normalization and uppercasing, this canonical answer array:

```json
["identity-v1","07","PÉ","JO","KA","BO","1","YES","MÜ"]
```

must select adjective index `170` (`Uplifted`) and noun index `400` (`Jewel`), display **`UPLIFTED JEWEL`**, and produce PIN **`179752`**. Its initials are **`UJ`**. For example, lowercase `pé` and decomposed `mu\u0308` normalize to `PÉ` and `MÜ` respectively before serialization.

## Avatar

The initials-avatar renderer identifier is **`initials-avatar-v1`**. It derives the pastel theme, background pattern, pattern orientation, and initial-letter color from the English adjective–noun pair alone.

```text
seed = UTF8("bravemonkey:avatar:initials-avatar-v1:" + lowercase(trim(adjective))
                                         + ":" + lowercase(trim(noun)))
digest = SHA256(seed)
themeIndex = digest[0] mod 6
patternIndex = digest[1] mod 4
rotationDegrees = 90 × (digest[2] mod 4)   // 0, 90, 180, or 270
```

Reference selections: `GREEN TOMATO` has digest bytes `51, 70, 239` (theme `3`, pattern `2`, rotation `270°`); `BRAVE MONKEY` has bytes `139, 239, 129` (theme `1`, pattern `3`, rotation `90°`).

The theme table order is fixed:

| Theme | Background | Pattern | Initials |
| ---: | --- | --- | --- |
| 0 | `#FCE4E8` | `#D7A2AC` | `#672E3B` |
| 1 | `#E4F3E8` | `#A8CDB2` | `#28533D` |
| 2 | `#E3F0FC` | `#A6C8E8` | `#24466A` |
| 3 | `#EFE7FB` | `#C0AEE0` | `#503675` |
| 4 | `#FFF0DD` | `#E6BE8C` | `#69451D` |
| 5 | `#DFF3F1` | `#9FCFC9` | `#20534F` |

Pattern indices are also fixed: `0` is a dot grid (radius `3.25`, rows at `y = 16 + 24r`, alternating first `x` of `16`/`28`, then every `24` through `244`); `1` is diagonal lines (`M x 0 L x+260 260`, `x` from `-260` through `260` in steps of `28`, stroke width `5`); `2` is concentric circles of radii `24, 48, 72, 96` around each corner of the viewBox (stroke width `3`); `3` is a wave row at each `y = 16 + 32r` through `240`, using `M-20 y Q0 y-14 0 y T40 y T80 y T120 y T160 y T200 y T240 y T280 y` (stroke width `4`). Patterns use the theme's pattern color at opacity `0.58`; round line caps are used for the diagonal and wave patterns.

The `260 × 260` SVG has a rounded background (`rx=36`). Patterns are clipped to that rounded square and rotated around `(130,130)` by the selected angle. A fixed warm-white plaque (`x=28`, `y=58`, `width=204`, `height=144`, `rx=48`, fill `#FFFCF6`, 3px stroke in the theme's pattern color) sits above the pattern. The initials use the theme's ink color; every theme ink has at least `7:1` contrast against both its pastel background and the plaque. The SVG renderer checks this palette constraint.

The letters are centered at `(130,130)` in `Arial, Helvetica, sans-serif`, `96px`, weight `800`, with `3px` letter spacing. The initial characters are the English adjective and noun's first letters, uppercased. SVG text uses the platform's available font, so glyph shapes can vary slightly between platforms even though the initials, colors, patterns, and geometry are deterministic. SVG title and description are localized for accessibility and can differ between downloaded files; visible artwork does not depend on interface language or PIN.

## Languages and word catalog

`locales/web.yaml` is a flat per-message catalog: each top-level key maps to `en`, `de`, and `es` translations. The page detects a supported language from browser preferences (including regional tags), falls back to English, and keeps a visible language selector for the current page. The selection is not saved. The site name stays exactly **Brave Monkey** in every locale; generated words and avatar initials remain English.

`assets/words.yaml` contains only the ordered `adjectives` and `nouns` scalar lists. It has no localized word labels or icon paths. The page validates the YAML shape, word syntax, counts, and uniqueness before enabling generation.

## Save and print a contact card

After generating an alias, users can download a PNG identity card, print a wallet-sized version, or download a `.vcf` contact file. The QR directly encodes a vCard 3.0, and the `.vcf` download uses the same payload. `N`/`FN` contain the alias, `ORG` is `vr4content`, `URL` is `https://vr4content.github.io/BraveMonkey/`, and both `TITLE` and `NOTE` contain exactly `PIN CODE: <six digits>`. The `TITLE` duplicate is a non-callable fallback to try on iPhone Camera scans, which have been observed to omit `NOTE`; it is not guaranteed to be imported. The PIN is deliberately not placed in `TEL`. No questionnaire answers, email address, or telephone number are included. The direct QR uses the phone's native contact-add flow, and the `.vcf` remains available if the Camera importer drops a field. The QR graphic uses QRCode.js 1.0.0, bundled locally under its included MIT license.

The alias and PIN in a contact file are still a pseudonymous label and public checksum, not authentication. A phone may sync saved contacts to its cloud account, so the UI warns users before saving or printing the card.

## Privacy and limitations

- Answers are processed in the current browser tab. This app does not submit or persist them in cookies, local storage, or a database. They remain visible in the page until it is closed or reloaded; browser autofill and extensions are outside the app's control.
- The static locale and word files contain no answers. Hosting, the Bootstrap CDN, the browser, and extensions can still observe ordinary network or webpage metadata.
- Biographical answers are not secrets. Anyone who knows them and the public algorithm can derive the same alias.
- There are `228 × 501 = 114,228` possible word pairs. Collisions are expected as usage grows; the checksum and avatar add no unique identities.
- Use the result as a memorable display pseudonym only. A receiving service should use an independent random account identifier and a real authenticator, such as a passkey.

## Protocol maintenance

The ordered word catalog, canonical answer order, normalization rules, protocol and renderer identifiers, PIN formula, and avatar derivation all affect reproducibility. Update the reference vectors whenever any of these change. The protocol uses the current word catalog; changes to its contents or order change generated aliases.
