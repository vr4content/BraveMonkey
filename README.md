# 🐒 Brave Monkey

**Same answers. Same alias.**

Brave Monkey is a static, browser-only generator for a reproducible English adjective–noun pseudonym, a six-digit public checksum, and a matching initials avatar. The active implementation is **BM3 only**; there are no BM1/BM2 compatibility paths.

> **Not authentication:** the PIN is calculated from the public word pair. It is a checksum, not a password, proof of identity, or proof of account ownership. A service using these aliases must provide its own authentication and account IDs.

## Run locally

Serve the repository over localhost (opening `index.html` directly as a `file:` URL is not supported):

```sh
python -m http.server 8000
```

Then visit <http://localhost:8000/>. The app uses the browser's SHA-256 Web Crypto API, which requires a secure context; localhost qualifies. No package install or build step is needed.

```text
index.html                         Page markup and styles
assets/app.js                      BM3 application and protocol
contact.html                       Contact download page opened by the QR
assets/contact.js                  Local contact download-page behavior
assets/vcard.js                    Shared vCard 3.0 serializer
assets/words.yaml                  Ordered English-only word catalog
assets/vendor/js-yaml.esm.min.js   Locally bundled YAML parser
assets/vendor/js-yaml-LICENSE.txt  Parser license
assets/vendor/qrcodejs.min.js      Local QRCode.js 1.0.0 contact QR generator
assets/vendor/qrcodejs-LICENSE.txt QR generator license
locales/web.yaml                   English, German, and Spanish UI text
```

Bootstrap is loaded from its pinned jsDelivr CDN URL with subresource integrity. The YAML parser and QR generator are local. The app and its static catalogs are served from the same origin; questionnaire answers are not included in network requests.

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

## BM3 protocol

All protocol fields are strings. Prefixes below are already NFC-normalized and uppercased by the app. The canonical answers are serialized in this exact order with JavaScript `JSON.stringify`:

```js
const canonical = JSON.stringify([
  "BM3",
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

For each word list, BM3 selects an index independently:

```text
seed = "bravemonkey:identity:BM3:adjective:" + canonical
     or "bravemonkey:identity:BM3:noun:" + canonical
```

Hash the UTF-8 seed with SHA-256 and read the first four digest bytes as an unsigned big-endian 32-bit integer. To avoid modulo bias, accept values below `floor(2^32 / count) * count` and return `value % count`. If a value is rejected, retry with `seed + ":retry:" + attempt`, starting at `attempt = 1`. The current ordered catalog contains **228 adjectives** and **500 nouns**. Its contents and order determine BM3 outputs; the page uses the current catalog only and does not support earlier catalog revisions.

The displayed alias is the selected English adjective and noun, uppercased and separated by one space. The six-digit PIN is a public checksum of that pair alone:

```text
message = UTF8("bravemonkey:pin:BM3:" + lowercase(trim(adjective))
                                      + ":" + lowercase(trim(noun)))
PIN = pad6(UINT32_BE(SHA256(message)[0..3]) mod 1,000,000)
```

The independent PIN checker also requires the adjective and noun to be present in their respective English catalog lists. A matching PIN proves only that the checksum is consistent with the submitted word pair.

### Reference test vector

After NFC normalization and uppercasing, this canonical answer array:

```json
["BM3","07","PÉ","JO","KA","BO","1","YES","MÜ"]
```

must select adjective index `74` (`Green`) and noun index `245` (`Tomato`), display **`GREEN TOMATO`**, and produce PIN **`088852`**. Its initials are **`GT`**. For example, lowercase `pé` and decomposed `mu\u0308` normalize to `PÉ` and `MÜ` respectively before serialization.

## Avatar

The renderer version is **`BM3-avatar-v2`**. It derives the pastel theme, background pattern, pattern orientation, and initial-letter color from the English adjective–noun pair alone. Alias generation and the PIN are unchanged.

```text
seed = UTF8("bravemonkey:avatar:BM3-avatar-v2:" + lowercase(trim(adjective))
                                         + ":" + lowercase(trim(noun)))
digest = SHA256(seed)
themeIndex = digest[0] mod 6
patternIndex = digest[1] mod 4
rotationDegrees = 90 × (digest[2] mod 4)   // 0, 90, 180, or 270
```

Reference selections: `GREEN TOMATO` has digest bytes `75, 141, 159` (theme `3`, pattern `1`, rotation `270°`); `BRAVE MONKEY` has bytes `131, 72, 183` (theme `5`, pattern `0`, rotation `270°`).

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

After generating an alias, users can download a PNG identity card, print a wallet-sized version, or download a `.vcf` contact file. The QR opens the same site's `contact.html` page, which offers a `.vcf` download. The alias, PIN, and interface language are carried in the URL fragment; fragments are not sent in the HTTP request, and the page removes the fragment from browser history before displaying the contact. The page builds the vCard locally. Its `N`/`FN` fields contain the alias, `ORG` is `Brave Monkey`, and `NOTE` is exactly `PIN CODE: <six digits>`. No questionnaire answers, email address, or telephone number are included. This extra download step avoids the iPhone Camera contact importer dropping the vCard `NOTE` field. Because the QR is a link, generate final cards from the hosted HTTPS site; a localhost link cannot be opened by other phones. The QR graphic uses QRCode.js 1.0.0, bundled locally under its included MIT license.

The alias and PIN in a contact file are still a pseudonymous label and public checksum, not authentication. A phone may sync saved contacts to its cloud account, so the UI warns users before saving or printing the card.

## Privacy and limitations

- Answers are processed in the current browser tab. This app does not submit or persist them in cookies, local storage, or a database. They remain visible in the page until it is closed or reloaded; browser autofill and extensions are outside the app's control.
- The static locale and word files contain no answers. Hosting, the Bootstrap CDN, the browser, and extensions can still observe ordinary network or webpage metadata.
- Biographical answers are not secrets. Anyone who knows them and the public algorithm can derive the same alias.
- There are `228 × 500 = 114,000` possible word pairs. Collisions are expected as usage grows; the checksum and avatar add no unique identities.
- Use the result as a memorable display pseudonym only. A receiving service should use an independent random account identifier and a real authenticator, such as a passkey.

## Development checks

At minimum, after changing the app or its protocol inputs:

```sh
node --check assets/app.js
node --check assets/contact.js
node --check assets/vcard.js
```

Serve the site over localhost and check:

- Repeating the reference vector and any questionnaire answers yields the same English pair, PIN, and visible avatar.
- Each letter field limits entry to two Unicode grapheme characters, normalizes canonically equivalent input to the same result, rejects non-letter content, and highlights all incorrect fields with focus on the first one.
- Selecting `NO` for pets uses `NONE`; selecting `YES` requires the first pet's two-letter prefix. Sibling values outside the fixed choices are rejected.
- The validator accepts the correct six-digit PIN and rejects an incorrect PIN or a word outside the catalog.
- The `BM3-avatar-v2` reference selections match the documented digest bytes; theme, pattern, rotation, and initials stay identical when the interface language changes. All six theme ink colors pass the `7:1` contrast checks.
- English, German, Spanish, regional browser language tags, English fallback, manual selection, translated status/errors, and `document.documentElement.lang` behave correctly.
- Changing language does not change canonical answers, the English pair, PIN, initials, or visible avatar artwork.
- The QR link resolves correctly at the site root and under an HTTPS project subpath. Scan it on current iOS and Android, download/open the `.vcf`, and verify the imported alias, `ORG:Brave Monkey`, and `NOTE: PIN CODE: <PIN>`.
- The contact link carries only alias, PIN, and locale in its fragment; confirm the contact page clears the fragment and that no contact data is sent in the HTTP request. The generated `.vcf` must contain no questionnaire answers, email, or telephone number.
- The PNG download includes a readable QR, alias, and PIN; print preview fits the wallet-card page size, and the `.vcf` fallback imports the same contact.
- The YAML files load under localhost and an HTTPS project subpath, and no questionnaire answers are sent in network requests or saved in persistent browser storage.

Changes to canonical answer order, normalization, hash namespaces, PIN formula, or visible avatar derivation change reproducibility and require a protocol/renderer version change. Catalog edits also change generated aliases; this project intentionally uses the current catalog only, with no compatibility for earlier catalog revisions.
