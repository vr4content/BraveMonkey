# 🐒 BraveMonkey

**Same answers. Same alias.**  
*A tiny, privacy-conscious, deterministic pseudonym generator that runs entirely in your browser and always produces an English adjective–noun pseudonym.*

> **Status:** working prototype **v0.1**, algorithm **BM1**. **Working name:** BraveMonkey (not trademark-cleared).  
> **Important:** BraveMonkey generates **pseudonymous labels**, **not secure login credentials**. Its numeric PIN is a **public checksum**; anybody can calculate it from the words. A platform must use a **separate authenticator** (such as a passkey) to protect accounts.  
> **Approved next step:** externalize interface and questionnaire translations, maintain a curated English-only word catalog, add local SVG assets, and specify Unicode initials for a future protocol version. BM1 remains English-only and one-file; translating the interface never translates the generated words.

## Read this first (2 minutes)

Imagine answering a handful of memorable questions, then receiving:

```text
Brave Monkey 2445      ← early concept; not a computed BM1 test vector
```

BraveMonkey's actual **BM1** output is **`Adjective Noun 000000`** (six digits), together with an SVG icon. The current prototype displays English words. The same *canonical* answers always produce the same result, even on a different device running the **same version** of BraveMonkey.

The generator does **not** request an email address, create an account, call a backend to process answers, or save answers in a database. Everything runs in the browser. The output is intended as a memorable, reproducible **pseudonym** for another application, which remains responsible for user registration and real authentication.

**What makes this unusual:** BraveMonkey has *no user registry*, no administrator account, and no secret cryptographic key. The current BM1 prototype is one static HTML file served via GitHub Pages. The approved refactor will remain a static, browser-only site, adding same-origin interface locale files, an English-only word catalog, and local SVG assets. An external platform can use the exact English word pair and matching assets to reconstruct the avatar without sending a request to BraveMonkey.

### Get running now

Current BM1 prototype files:

```text
bravemonkey/
├── index.html       # Complete app: markup + CSS + JS + word lists
├── README.md        # This product and implementation specification
└── .nojekyll        # Tell GitHub Pages to serve static files as-is
```

Approved target layout for interface localization and the avatar refactor:

```text
bravemonkey/
├── index.html
├── README.md
├── .nojekyll
├── locales/
│   ├── en.json       # English interface translations only
│   ├── de.json       # German interface translations only
│   └── es.json       # Spanish interface translations only
├── assets/
│   ├── words.json    # English-only adjective and noun catalog
│   └── icons/
│       ├── monkey.svg  # Shared, language-independent BraveMonkey mascot
│       ├── dog.svg     # Example noun pictogram referenced by words.json
│       └── ...         # Other language-independent noun pictograms
```

The target layout is a design decision, not a description of files already present in the BM1 prototype. Noun entries in `words.json` reference local pictogram assets. The word catalog contains English identifiers and labels only, regardless of interface language. The pruned catalog is a candidate for a future protocol version; it does not replace BM1's frozen dictionaries embedded in `index.html`.

There is no npm install, Composer, PHP, Laravel, Blade, database, application backend, or build step. The interface locale files, English-only word catalog, and SVG files are ordinary static assets; local development still uses a static file server.

1. Open the folder in your editor.
2. Serve it locally with `python3 -m http.server 8000` (or `npx serve .`).
3. Visit **http://localhost:8000/** and fill in the questionnaire.
4. Generate a pseudonym, download its SVG, and try the **Check a PIN** panel.
5. Repeat with the same answers to confirm the same result.

Use `localhost` for local development or HTTPS in production. The browser's native SHA-256 API requires a secure context (localhost normally qualifies).

**Bootstrap:** the app pins **Bootstrap 5.3.8**, the latest stable release verified on **2026-11-02**, via jsDelivr CDN with subresource-integrity checks. Bootstrap 6.0.0-alpha.1 exists but is **not** the stable choice for this prototype. The app also uses some inline custom CSS and JavaScript. The Bootstrap CDN is the only third-party asset requested by the app; it is not fully offline on a first load.

## Why this project exists

The original goal is to allow returning visitors to recognize their own pseudonyms **without giving an email, phone number, full name, or other direct identifier to the identity generator**. Example use cases include experimental communities, participation systems, surveys, and privacy-first account experiences.

The project explores three distinct properties that should **not** be confused:

| Property | BM1 result |
| --- | --- |
| **Reproducibility** | Yes: same canonical answers + same version ⇒ same output. |
| **Pseudonymity** | Yes: the output is a friendly label rather than a name or email. Not guaranteed legal anonymity. |
| **Uniqueness** | **No.** Different answers and different people can produce the same output. |
| **Authentication** | **No.** A public name + checksum does not prove account ownership. |
| **PIN verification without API** | Yes: the receiving platform can recompute the public checksum. |
| **SVG icon reproducibility** | Yes: identical adjective–noun pairs produce identical SVGs. |

An external platform may register the alias as a *display label*, but it **must not** use `Adjective Noun PIN` by itself as a password or unique account key. A recommended design is **internal random account ID + BraveMonkey display alias + passkey authentication**.

## Brand and voice

- **Working name:** **BraveMonkey** (playful, approachable, mascot-friendly).
- **Main tagline:** **Same answers. Same alias.**
- **Other explored slogans:** “Your identity. Your adventure.” · “No email. Just your alias.”
- **Brand style:** warm cream/soft green, friendly monkey mascot, rounded cards, accessible typography, not intimidating cybersecurity aesthetics.
- **Previously explored names:** **EchoID** (captures repeatability but existing identity-industry name conflicts), **AliasSeed** (seed metaphor), **Nymble**, **Wordloom**, **RiddleID**, **AliasMint**.
- **Naming caution:** BraveMonkey is a *working name*, not a cleared trademark or domain. Investigate GitHub namespace, domains, and trademark classes before public branding or commercial release.

## Scope and requirements

### Required (BM1 prototype)

- [x] **One `index.html`** containing the complete user interface and logic.
- [x] **Bootstrap stable via CDN**, with a mobile-first responsive layout.
- [x] **No backend, database, user accounts, admin credentials, or API calls** for generation.
- [x] Browser-native **SHA-256** via `crypto.subtle.digest()`.
- [x] A stable, repeatable questionnaire with constrained inputs.
- [x] Curated dictionaries of **512 nouns** and **256 adjectives** (embedded in the HTML).
- [x] Deterministic **adjective + noun + six-digit checksum PIN**.
- [x] **Deterministic SVG identicon** derived from adjective + noun, with download button.
- [x] **External/offline PIN validation formula** and on-page demonstration checker.
- [x] Copy result to clipboard, subject to browser permission.
- [x] No storage of questionnaire answers in localStorage, cookies, or a database.
- [x] Version identifier: **BM1**.

### Out of scope for BM1

- Secure standalone login, passwordless authentication, passkey registration, account recovery beyond re-answering questions, guaranteed global uniqueness, collision resolution, server-side verification of issued credentials, identity proofing, or a database of generated aliases.
- Collecting users' legal identities or claiming their results are legally anonymous.
- An API that proves a specific person answered the questions: a purely static site cannot do this.

## Approved interface localization and English-only word catalog (planned)

This section records the approved target. It does **not** change the current BM1 implementation or the exact BM1 data contract below.

### Interface translations

- Store interface and questionnaire messages in `locales/en.json`, `locales/de.json`, and `locales/es.json`. Each file contains only that language's translations, with the same language-neutral message keys in all three files. These files contain UI text, not adjective or noun dictionaries.
- Choose the initial interface language from the browser's preferred languages: support English, German, and Spanish, including regional tags, and fall back to English. Offer a language selector and do not persist its selection in cookies or local storage.
- Translate all visible and assistive interface text, including question prompts, option labels, errors, status messages, page metadata, and SVG accessibility text. Set the document's `lang` attribute to the selected language.
- Translate displayed option labels, but keep BM1's canonical option values and order unchanged. The selected UI language must not change BM1 canonical answers or the generated English word pair.
- Fetch only static, same-origin locale files, the English-only word catalog, and local SVG assets. These requests must not contain questionnaire answers.

### One English-only adjective-and-noun catalog

Keep the adjective and noun catalog in one `assets/words.json` file, separate from the interface message files. Each `id` is the English word, stable identifier, and displayed credential label. Do not add German or Spanish word translations. For example:

```json
{
  "adjectives": [
    { "id": "Brave" }
  ],
  "nouns": [
    {
      "id": "Dog",
      "icon": "/assets/icons/dog.svg"
    }
  ]
}
```

`id` is the exact English canonical name and is unique within its list; it is both the label and the identifier. The generated adjective–noun pair remains English in every interface language, so no localized-word lookup, gender metadata, or adjective inflection is required. The interface locale is not part of the credential or PIN. The candidate list excludes common personal-name readings and adjective/noun overlaps from the adjective list, plus nouns with common standalone adjective senses; merely appearing in a noun compound does not qualify. This is a curation policy, not a claim that English words can never be used as names. The pruned catalog is for a future version, not an index-compatible copy of BM1: BM1 continues to use its frozen 256-adjective and 512-noun arrays in `index.html`. Do not substitute this catalog into BM1; adopting a changed list requires a new protocol version.

### Unicode initials and protocol versioning

BM1 continues to accept exactly the ASCII values in its data contract below. A future protocol version may accept Unicode initials encoded as UTF-8; “extended ASCII” is not a single character set and does not cover all European scripts.

For that future version, accept an initial—not a full name—and freeze the canonicalization with cross-platform test vectors: normalize to NFC, convert using locale-independent Unicode uppercase rules, and discard whitespace, punctuation, symbols, and control/format characters while retaining Unicode letters. Retain accents and letters from scripts such as Greek and Cyrillic; do not transliterate to A–Z. Combining marks that belong to a letter remain part of that letter. If uppercase conversion expands a character, use the resulting canonical string. Pin the Unicode/case-mapping behavior so implementations agree.

Changing BM1's allowed initials or canonical serialization changes generated identities. Preserve BM1 generation and validation; version expanded Unicode input rather than silently changing BM1.

### Shared SVG assets, avatar colors, and external reconstruction

- Use `/assets/icons/monkey.svg` as the shared BraveMonkey mascot in every language. It is language-independent artwork, not translated content.
- Store language-independent noun pictograms as local SVG assets under `/assets/icons/`; each noun entry references its asset. Use a simple monochrome silhouette that the renderer can tint. Inline the selected pictogram geometry in a downloaded composite SVG so it remains usable without the repository's other files.
- Treat leading-slash asset paths as repository-root paths and resolve them against the deployed site base. In particular, GitHub Pages project sites run below a repository subpath, so the app must not treat `/assets/...` as a domain-root URL.
- A versioned deterministic avatar renderer maps the stable English adjective and noun identifiers to the noun pictogram and its colors. The monochrome shape can be tinted with a foreground color; the renderer chooses a background with sufficient contrast. The canonical renderer derives both colors deterministically from the word identifiers, not from the interface language, questionnaire answers, or PIN.
- The renderer may be tuned to use different foreground colors. If users can choose arbitrary colors, carry those choices as explicit avatar-style metadata; they cannot be reconstructed from the word pair alone. Style choices must not alter the canonical word pair or PIN.
- Target at least **3:1 contrast** for meaningful icon graphics and **4.5:1** for normal-sized text, using WCAG AA as the baseline. The background-selection algorithm must check actual contrast and fall back to a passing color rather than assuming arbitrary color pairs are accessible.
- An external platform needs the matching English word catalog, SVG assets, and avatar-renderer version to reconstruct or compare the expected image; the interface locale is not needed. It does not need questionnaire answers or the PIN to do so. This checks deterministic consistency only; it does not prove issuance, ownership, or authentication.
- Color variation can make repeated noun pictograms more distinctive but cannot guarantee unique artwork for every word pair. The current BM1 identicon and its uniqueness claim remain unchanged; any replacement renderer must state its own guarantee and version.

The PIN remains a public, recomputable checksum as specified below. It is not a secret and is not used to derive or validate the avatar.

## How the website feels

**Responsive, single-page flow:**

1. **Welcome:** simple explanation, privacy promise with caveats, “Create my alias” button.
2. **Stable facts:** day and month of birth, family name initial, birthplace initial, parents' initials (unknown permitted), sibling count.
3. **Personal associations:** two preferred colors in order, whether the visitor ever had a pet, and first pet's initial if applicable.
4. **Chosen anchors:** one personal symbol and an ordered pair of two different symbols.
5. **Result:** English adjective–noun pair, six-digit checksum PIN, geometric SVG icon, copy button, SVG download. The interface around it may be localized.
6. **Check a PIN:** enter adjective + noun + PIN and recompute the checksum with no request to BraveMonkey.

The questionnaire does **not** ask the visitor to type full names. BM1 initials are chosen from a controlled A–Z list; colors and symbols are enumerated to avoid spelling and capitalization disagreements. All labels should use plain, neutral, accessible language. The questions should remain precisely worded between versions. Planned translations change displayed wording only; BM1 canonical values remain fixed.

## BM1 questionnaire: exact data contract

The public algorithm serializes this **ordered array** using JavaScript `JSON.stringify`. All fields are **strings**, including day and month, which have two ASCII digits. *Never rearrange or silently rename values inside BM1.*

| Index | Field | Allowed canonical values / rule |
| --- | --- | --- |
| 0 | `VERSION` | `"BM1"` |
| 1 | `birthdayDay` | `"01"`…`"31"` |
| 2 | `birthdayMonth` | `"01"`…`"12"` |
| 3 | `surnameInitial` | `"A"`…`"Z"` |
| 4 | `cityInitial` | `"A"`…`"Z"` |
| 5 | `fatherInitial` | `"A"`…`"Z"` or `"UNKNOWN"` |
| 6 | `motherInitial` | `"A"`…`"Z"` or `"UNKNOWN"` |
| 7 | `siblings` | `"0"`, `"1"`, `"2"`, `"3"`, or `"4PLUS"` |
| 8 | `color1` | First color from fixed list |
| 9 | `color2` | Second **different** color from fixed list |
| 10 | `hadPet` | `"YES"` or `"NO"` |
| 11 | `petInitial` | `"A"`…`"Z"` / `"UNKNOWN"` if yes; always `"NONE"` if no |
| 12 | `personalSymbol` | One item from 16-symbol list |
| 13 | `icon1` | First item from 16-symbol list |
| 14 | `icon2` | Second, different item from 16-symbol list |

**Colors** in fixed order: `RED`, `ORANGE`, `YELLOW`, `GREEN`, `BLUE`, `PURPLE`, `PINK`, `BLACK`.

**Symbols** in fixed order: `SUN`, `MOON`, `STAR`, `HEART`, `CLOUD`, `FLAME`, `LEAF`, `FLOWER`, `MOUNTAIN`, `WAVE`, `TREE`, `SNOWFLAKE`, `COMPASS`, `FEATHER`, `DIAMOND`, `SHELL`.

This table is the frozen BM1 contract. The planned Unicode-initial behavior applies only to a new protocol version; it must not be added to BM1 in place.

Interpret “first pet” as **the first pet the person personally considered theirs**; not necessarily the current or favorite pet. If multiple interpretations are possible, reproducibility may suffer. Note also that color and symbol preferences may change with time.

**Potential questions for a future version (requires version BM2):** oldest/middle/youngest/only-child status; whether the childhood home had a garden; first school initial; childhood landscape; writing hand; a chosen 4-digit memory number; a favorite childhood season; or additional ordered icon choices. Prefer durable, non-sensitive anchors. More questions **do not automatically imply security** and can make regeneration less reliable.

## BM1 algorithm: generation

All code is in `index.html`; the following is the **normative description**. Cryptographic hashing is used for deterministic distribution, **not** for secrecy.

```js
const canonical = JSON.stringify([
  "BM1", birthdayDay, birthdayMonth, surnameInitial, cityInitial,
  fatherInitial, motherInitial, siblings, color1, color2, hadPet,
  petInitial, personalSymbol, icon1, icon2
]);

const digest = SHA256(UTF8("bravemonkey:identity:BM1:" + canonical));
const adjectiveIndex = UINT32_BE(digest[0..3]) % 256;
const nounIndex      = UINT32_BE(digest[4..7]) % 512;
const adjective = ADJECTIVES[adjectiveIndex];
const noun      = NOUNS[nounIndex];
```

`UINT32_BE` is a four-byte unsigned integer in **big-endian** order. Because 256 and 512 are powers of two, this selection has no modulo bias for uniformly distributed 32-bit inputs.

The dictionaries have been curated for this prototype, but **should receive a cultural/inclusivity and readability review before production**. Their **exact order is part of the BM1 protocol**. Alphabetizing, removing, or adding a word in BM1 changes results. Add a new algorithm version for any such change and preserve the old renderer to support returning users.


**Reference test vector (BM1):** Given the exact canonical answers below, the expected result is **`Angelic Whale 738045`** (`adjectiveIndex = 8`, `nounIndex = 135`). This was checked against the actual browser-script derivation in a JavaScript test harness.

```json
["BM1","07","05","P","B","A","K","1","BLUE","GREEN","YES","M","MOON","SUN","STAR"]
```

Expected pin independently recomputed from words: `738045`. Preserve this vector when porting or refactoring BM1.

### Public checksum PIN (the externally verifiable formula)

**The PIN depends only on the adjective and noun—not on the original answers.**

```text
message = UTF8(
  "bravemonkey:pin:BM1:" +
  lowercase(trim(adjective)) + ":" + lowercase(trim(noun))
)
hash = SHA256(message)
number = UINT32_BE(hash[0..3]) mod 1,000,000
PIN = six_decimal_digits_with_leading_zeroes(number)
```

For example, `pinFromWords("Brave", "Monkey")` produces the same result on any device following the formula. `2445` is an **illustrative number from the original conversation**, not an asserted output of BM1. The browser demo calculates the real value.

**Validation:**

1. Check that the input adjective and noun are entries in the fixed English BM1 dictionaries, ignoring ASCII capitalization and surrounding spaces. Credential words are never translated; the interface locale does not affect dictionary membership or the checksum formula.
2. Check that the supplied PIN is **exactly six decimal digits**, including possible leading zeroes.
3. Recompute the formula and compare strings.
4. Return `true` or `false` for *checksum consistency only*.

Minimal standalone JavaScript (works in a secure browser context):

```js
async function expectedBm1Pin(adjective, noun) {
  const message = "bravemonkey:pin:BM1:" +
    adjective.trim().toLowerCase() + ":" + noun.trim().toLowerCase();
  const digest = await crypto.subtle.digest(
    "SHA-256", new TextEncoder().encode(message)
  );
  const integer = new DataView(digest).getUint32(0, false); // big-endian
  return String(integer % 1_000_000).padStart(6, "0");
}
// Also enforce dictionary membership and exact six-digit PIN syntax.
```


**PHP/Laravel-compatible checksum example** (use after checking membership in the published BM1 dictionaries):

```php
function braveMonkeyPin(string $adjective, string $noun): string
{
    $message = 'bravemonkey:pin:BM1:'
        . strtolower(trim($adjective)) . ':' . strtolower(trim($noun));
    $digest = hash('sha256', $message, true);
    $value = unpack('N', substr($digest, 0, 4))[1]; // unsigned big-endian
    return str_pad((string) ($value % 1000000), 6, '0', STR_PAD_LEFT);
}

// braveMonkeyPin('Angelic', 'Whale') === '738045'
```

This code checks the formula, **not** whether a user is entitled to use a pair. The published dictionaries must still be consulted to reject unknown words.

Other platforms can implement the same formula in PHP/Laravel, Python, Go, etc. **No request to BraveMonkey or shared server secret is needed.**

### Security consequence of public PIN validation

Because everyone can derive the PIN from `Adjective Noun`, the PIN contributes **zero additional secret entropy** and **zero additional distinct identities**. In BM1 there are only:

```text
256 adjectives × 512 nouns = 131,072 distinct word pairs
131,072 word pairs × 1 valid PIN each = 131,072 distinct full outputs
```

Not 131 billion. Increasing the number of checksum digits does **not** improve uniqueness or authentication security if the digits remain a function of the pair.

If the project eventually needs **truly distinct accounts** or **strong authentication**, it must change the architecture. Good options: keep BraveMonkey as the display alias, assign a random internal account ID at the destination platform, and authenticate with a passkey; or introduce an independent high-entropy secret (not just a public checksum). A static client cannot securely hide a signing key.

## BM1 unique deterministic SVG identicon

Every BM1 word pair maps to a colorful **7 × 7 mirrored geometric identicon**, produced as an **inline SVG string** and downloadable as an `.svg` file. The icon is based exclusively on the adjective + noun and version, so it is reproducible without the questions or PIN. This section documents the current BM1 renderer; the planned noun-pictogram renderer is a separate, versioned presentation design.

To make **the actual geometric pattern unique for all 131,072 BM1 word pairs**, not merely “probably unique” from a short hash:

1. Take `pairIndex = adjectiveIndex * 512 + nounIndex` (between 0 and 131,071).
2. Scramble it bijectively using `encoded = (pairIndex * 40503 + 19181) mod 131072`. The multiplier is odd, so it is invertible modulo `2^17`.
3. Lay out the **17 bits** of `encoded` in fixed positions of a mirrored 7×7 grid (which has 28 independently selectable positions).
4. Use SHA-256 of `"bravemonkey:icon:BM1:" + adjective.lower() + ":" + noun.lower()` for the remaining 11 pattern bits and colors.
5. Render an accessible SVG containing `<title>`, `<desc>`, and the readable word pair.

**Guarantee scope:** within the *unchanged BM1 256×512 dictionaries*, different word pairs have different **filled-cell geometry**. This does not provide unique identities for people: anyone sharing a word pair also shares its icon, and an SVG is not a security credential. Future dictionary capacities must revise this encoding and version.

## Collisions and privacy: limitations you must understand

### Collisions

If word pairs were selected uniformly and independently, the approximate probability of *at least one repeated pair among `n` users* is `1 - exp(-n(n-1)/(2 × 131072))`.

| People | Probability of at least one pair collision |
| ---: | ---: |
| 100 | ~3.7% |
| 500 | ~61.4% |
| 1,000 | ~97.8% |
| 10,000 | Essentially 100% |

The **true** rate may be higher because inputs are not independent or uniform, and people can give identical answers. This is a prototype for repeatable **labels**, not unique logins. The receiving service should not assume that two equal labels are the same person.

### Privacy and threats

- No answers are submitted to a BraveMonkey backend; the current JavaScript contains no questionnaire submission or analytics requests.
- GitHub Pages and the Bootstrap CDN necessarily see normal network requests and may collect IP addresses or request metadata; the user's browser, extensions, clipboard, and download folder are also outside the generator's control.
- No cookies or persistent browser storage are used by the prototype. Data remains visible in the page until the tab is closed or reloaded; browser autofill and browser-level behavior can vary.
- Biographical facts are **not secrets**. Someone who knows or guesses the answers can regenerate the same words.
- A stable pseudonym can correlate someone across sites; use **different derivation namespaces** in a future version if cross-site unlinkability is a requirement.
- Pseudonymous data may still be **personal data** under applicable privacy laws.
- The public PIN proves **only mathematical consistency**, never issuance, human identity, or account ownership.

Never use BM1 results alone to sign in to a sensitive application. Do not market the project as verified anonymity or strong authentication.

## Deploy to GitHub Pages

1. Create a GitHub repository named e.g. `bravemonkey` under **your own** GitHub account or organization. (The brand name and exact GitHub username need not match.)
2. For the current prototype, upload/commit `index.html`, `README.md`, and `.nojekyll` in the repository root. When the approved refactor is implemented, also commit the complete `locales/` and `assets/` directories, including every referenced SVG.
3. In the repository, navigate to **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**, select **`main`** and **`/(root)`**, then **Save**.
5. Visit `https://YOUR-USERNAME.github.io/bravemonkey/` when publishing is complete.
6. Verify the page is served over HTTPS and generate the same alias on at least two browsers.

The hosting service serves static assets only; it cannot run Laravel, PHP, or a validation endpoint. A separate authentication platform remains independent. You do not need GitHub Actions for this particular single-page prototype.

```bash
# A possible starting point, after creating your empty GitHub repository:
git init
git add index.html README.md .nojekyll locales assets
git commit -m "Initial BraveMonkey BM1 prototype"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/bravemonkey.git
git push -u origin main
```

**Do not put private keys, real questionnaire answers, test users' personal data, or secrets in the repository.** Anything shipped to a static site can be inspected by users. If you intend to describe it as *open source*, choose and add an appropriate license (for example MIT or Apache-2.0) before publication.

## Development guide

### Change the look safely

Modify the **HTML markup and CSS** for branding or responsiveness without changing BM1 outputs. The site uses Bootstrap's `.container`, `.row`, `.col-*`, forms, spacing, and buttons, with additional inline brand CSS. Once interface catalogs are implemented, translate UI and questionnaire copy in the appropriate locale file; keep the same message keys in every language file. Credential words remain English.

### Change English words and artwork safely

`assets/words.json` is an English-only candidate catalog: each `id` is the displayed English word as well as its stable identifier. It is separate from the UI message catalogs. The current BM1 generator still uses the original embedded arrays; the pruned catalog must not replace them or be used to validate BM1 indices. Any generator adopting a changed word list must be versioned separately.

Noun records reference local, language-independent SVG pictograms under `/assets/icons/`. Keep the shared mascot at `/assets/icons/monkey.svg`. Do not make an external platform depend on an unversioned color choice or remote image URL; publish the avatar derivation and exact asset set needed to reproduce it.

### Change the generator safely

**Do not change BM1 in place.** These are protocol inputs, not merely presentation details:

- `VERSION`, canonical field order or encoding, fixed option IDs, word list order and contents.
- Hash-prefix strings and byte order.
- Dictionary sizes or index selection.
- PIN digit length and formula.
- SVG pair index, permutation, and encoding.

Version incompatible changes as **BM2** and preserve BM1 generation/validation for returning users and downstream platforms.

### Quick manual test plan

- [ ] Generate twice from identical answers ⇒ same adjective, noun, PIN, SVG string.
- [ ] Test in a second browser/device ⇒ identical result for BM1.
- [ ] Change a color or symbol ⇒ result should usually change (but collisions are possible).
- [ ] Ensure `NO` pet always maps to `petInitial = "NONE"`.
- [ ] Ensure `YES` pet requires initial or `UNKNOWN`.
- [ ] Reject the same two colors or the same ordered-pair symbols.
- [ ] Confirm `UNKNOWN` is distinct from the literal letter `U`.
- [ ] Verify PIN with the on-page checker; an edited digit should fail (except if changed back to the correct one).
- [ ] Confirm SVG download opens as a standalone file and shows the correct alias.
- [ ] After interface localization is implemented, verify browser-language detection, English fallback, manual language selection, translated accessibility text, and `document.documentElement.lang`.
- [ ] Verify that changing UI language changes interface text only: the credential words stay English and BM1 canonical answers, indices, PIN, and identicon remain unchanged.
- [ ] Verify that the English-only catalog has unique IDs, no `de`/`es` word labels, and is never mistaken for BM1's frozen index lists.
- [ ] For the future Unicode protocol, test NFC normalization, locale-independent uppercase conversion, symbol/punctuation removal, accented letters, Greek/Cyrillic initials, and uppercase expansions with fixed cross-platform vectors.
- [ ] For the noun-avatar renderer, verify the same English ID pair produces the same pictogram and colors in every locale and on an external implementation.
- [ ] Check foreground/background contrast (at least 3:1 for meaningful icon graphics and 4.5:1 for normal text) and confirm downloaded SVGs include their pictogram geometry.
- [ ] Check mobile layout, keyboard-only navigation, screen reader labels, reduced-motion preference.
- [ ] Validate on HTTPS and localhost, including any special browser privacy settings.
- [ ] Confirm no answers are present in network payloads, localStorage, cookies, or query strings.
- [ ] Add **fixed test vectors** to tests/CI before any BM2 refactor.

The browser console exposes `window.BraveMonkey` with `deriveCredential`, `pinFromWords`, `verifyPin`, `identiconSvg`, `canonicalAnswers`, and the dictionary sizes for development and future cross-language conformance tests.

## Roadmap

**BM1 — Current prototype:** one-file Bootstrap questionnaire, SHA-256 alias generation, public six-digit checksum, unique per-pair identicon, local checker, copy and SVG export.

**BM1.x — Compatible polish:** accessibility audit, improve inclusive wording, review a future English-only word catalog for name and part-of-speech ambiguity, add cross-browser fixed test vectors, externalize English/German/Spanish interface translations without changing BM1 canonical values, add the shared `/assets/icons/monkey.svg` mascot, and check name/domain/trademark status.

**BM2 — Expanded input and curated English-only words:** specify Unicode initials and their canonicalization with fixed vectors; version any curated word-list changes; add local noun pictograms and a deterministic, contrast-checked avatar renderer. Generated adjective–noun pairs remain English regardless of UI language. Preserve BM1 generation, validation, dictionary order, PIN semantics, and BM1 identicons for returning users. The PIN remains a public checksum and does not participate in avatar reconstruction.

**Authentication and ownership (separate platform concern):** keep pseudonyms as display labels, provide a privacy-preserving *real* authentication method on the destination platform (e.g. WebAuthn passkeys) and random internal account IDs; decide whether the questionnaire should be optional or replaced by user-held recovery material.

**Possible later exploration:** per-platform derivation namespaces to reduce cross-service correlation; richer identicons or downloadable avatar sets; accessibility-friendly pictorial selectors; offline-first distribution with pinned local Bootstrap assets (would no longer be one HTML + CDN); independent checksum libraries in PHP, Python, and Go.

## Design decisions / trade-offs recorded

1. **Static GitHub Pages over Laravel/Blade** for BM1: easier publishing, no server administration, browser-local answers. Laravel remains relevant to the receiving platform or any later secure server-based credential system.
2. **Pinned stable Bootstrap CDN** over a build framework: no build step, fast start, reliable CSS version, fewer moving parts; CDN still receives normal network traffic.
3. **Fixed-format questions** over arbitrary typed names: less ambiguity, less accidental personal-data collection, easier deterministic encoding.
4. **Six-digit public checksum** rather than a four-digit “password”: gives a recognizable consistency check but explicitly **no security gain**. A shorter or longer public checksum can be introduced only in a new protocol version.
5. **256 adjectives + 512 nouns**: reasonable for a playful prototype; fundamentally insufficient as a guaranteed unique-account namespace at scale, with PIN adding no capacity.
6. **Unique geometry for each pair**: use a reversible mapping of the pair index in 17 bits rather than hoping hash art will not collide.
7. **Clear versioning**: reproducibility is a long-term user promise. Stability takes precedence over changing dictionaries casually.
8. **Separate translation layers:** locale JSON files translate only interface and questionnaire text; the word catalog contains English-only IDs and labels; noun SVG assets are shared across interface languages.
9. **Unicode, not extended ASCII:** future initials retain Unicode letters, including accented and non-Latin letters, while discarding punctuation and symbols. BM1's ASCII contract remains frozen.
10. **Pair-derived avatar styling:** the stable adjective/noun identifiers determine the pictogram and reproducible colors; the PIN remains independent and public. Contrast is checked rather than assumed.

## References

- [Bootstrap stable CDN and SRI](https://getbootstrap.com/docs/5.3/getting-started/download/) — pinned at 5.3.8 for BM1.
- [Bootstrap 6 alpha announcement](https://blog.getbootstrap.com/2026/10/08/bootstrap-6-alpha/) — why BM1 is not using an alpha release.
- [GitHub Pages: creating a site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).
- [GitHub Pages: publishing from a branch](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).
- [MDN: SubtleCrypto.digest()](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest) — secure context and SHA-256 browser API.

---

**Current BM1 summary:** **BraveMonkey is a one-file, browser-only pseudonym generator, intended for open-source publication. Same canonical answers → same English word pair, public checksum PIN, and SVG identicon; the receiving platform must independently provide secure login.**

**Approved direction:** **Add English, German, and Spanish interface and questionnaire translations while keeping credential words English-only; maintain a separately versioned curated word catalog, the shared `/assets/icons/monkey.svg` mascot, local noun pictograms, and a reproducible contrast-checked avatar renderer—without changing BM1 or making the PIN secret.**
