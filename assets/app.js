import { load as parseYaml } from "./vendor/js-yaml.esm.min.js";
import { vCardForCredential } from "./vcard.js";

const VERSION = "BM3";
const AVATAR_RENDERER_VERSION = "BM3-avatar-v2";
const SUPPORTED_LOCALES = Object.freeze(["en", "de", "es"]);
const AVATAR_BADGE_COLOR = "#FFFCF6";
const AVATAR_MIN_CONTRAST_RATIO = 7;
const AVATAR_THEMES = Object.freeze([
  Object.freeze({ background: "#FCE4E8", pattern: "#D7A2AC", ink: "#672E3B" }),
  Object.freeze({ background: "#E4F3E8", pattern: "#A8CDB2", ink: "#28533D" }),
  Object.freeze({ background: "#E3F0FC", pattern: "#A6C8E8", ink: "#24466A" }),
  Object.freeze({ background: "#EFE7FB", pattern: "#C0AEE0", ink: "#503675" }),
  Object.freeze({ background: "#FFF0DD", pattern: "#E6BE8C", ink: "#69451D" }),
  Object.freeze({ background: "#DFF3F1", pattern: "#9FCFC9", ink: "#20534F" })
]);
const LETTER_RE = /^\p{L}$/u;
const MARK_RE = /^\p{M}$/u;
const graphemeSegmenter = typeof Intl.Segmenter === "function"
  ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
  : null;
const encoder = new TextEncoder();
const el = id => document.getElementById(id);

const FALLBACK_TEXT = Object.freeze({
  catalog_loading: "Loading English word catalog…",
  generate_button: "Generate my alias ✦",
  generating: "Generating…",
  error_fields: "Please correct the highlighted fields.",
  error_day: "Choose a day from 01 to 31.",
  error_siblings: "Choose a sibling-count option.",
  error_pet_choice: "Choose Yes or No.",
  error_two_letters: "Enter exactly two Unicode letters, with no spaces or punctuation.",
  error_generation: "Generation failed. Check the word catalog and use a secure HTTPS or localhost context.",
  action_copied: "Copied to clipboard.",
  action_clipboard_error: "Clipboard unavailable. Select and copy the displayed alias and PIN manually.",
  validator_checking: "Checking…",
  validator_matches: "✓ Matches the BM3 public checksum. This does not authenticate a person.",
  validator_no_match: "✕ PIN does not match this BM3 word pair, or a word is not in the dictionary.",
  validator_input_error: "Enter an adjective, a noun, and a six-digit PIN.",
  validator_failure: "Couldn't check the PIN. Use a secure HTTPS or localhost context.",
  catalog_error: "Couldn't load the English word catalog. Serve this site from localhost or HTTPS, then reload.",
  contact_card_edition: "BM3 identity card",
  contact_card_pin_notice: "Public checksum — not a password.",
  contact_card_qr_aria: "QR code link to download the Brave Monkey contact",
  contact_card_scan: "Scan to download contact",
  contact_card_privacy: "The QR link carries only your alias, PIN, and interface language in its URL fragment, which is not sent in the page request. It contains no answers, email, or phone number. The link requires this site to be online.",
  contact_card_ready: "Contact link is ready. Scan it to open the page and download your contact file.",
  contact_card_png_working: "Preparing your card image…",
  contact_card_png_done: "PNG identity card downloaded.",
  contact_card_png_error: "Could not create the PNG card. Try again or use Print.",
  contact_card_vcard_done: "Contact file downloaded. Open the .vcf file to add it to your contacts.",
  contact_card_vcard_error: "Could not create the contact file.",
  contact_card_qr_error: "The contact QR could not be generated. You can still download the .vcf contact file or reload and try again.",
  avatar_title: "{pair} · Brave Monkey avatar",
  avatar_description: "Initials {initials} from {pair} on a patterned pastel background."
});

let messages = null;
let localeCatalogLoaded = false;
let localeReady = false;
let activeLocale = detectBrowserLocale();
let wordCatalogLoaded = false;
let adjectives = Object.freeze([]);
let nouns = Object.freeze([]);
let catalogState = "loading";
let formErrorKey = "";
let actionNoticeKey = "";
let verifyResultKey = "";
let verifyResultClass = "";
let verifyErrorKey = "";
let verifyAttempt = 0;
let isGenerating = false;
let latestCredential = null;
let latestSvg = null;
let latestVCard = null;
let contactCardReady = false;
let contactCardStatusKey = "";
let contactCardErrorKey = "";
let avatarRenderToken = 0;

function detectBrowserLocale() {
  const preferences = Array.isArray(navigator.languages) ? [...navigator.languages] : [];
  if (navigator.language) preferences.push(navigator.language);
  for (const preference of preferences) {
    const base = String(preference).toLowerCase().split("-")[0];
    if (SUPPORTED_LOCALES.includes(base)) return base;
  }
  return "en";
}

function t(key, values = {}) {
  const localized = messages?.[key];
  let text = localized?.[activeLocale] ?? localized?.en ?? FALLBACK_TEXT[key] ?? key;
  return text.replace(/\{([A-Za-z0-9_]+)\}/g, (match, name) =>
    Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : match
  );
}

function validateTranslations(catalog) {
  if (!catalog || typeof catalog !== "object" || Array.isArray(catalog) || Object.keys(catalog).length === 0) {
    throw new Error("Locale catalog must be a non-empty flat mapping");
  }
  const expected = SUPPORTED_LOCALES.slice().sort().join(",");
  for (const [key, translations] of Object.entries(catalog)) {
    if (!key || !translations || typeof translations !== "object" || Array.isArray(translations)) {
      throw new Error(`Invalid locale entry: ${key}`);
    }
    if (Object.keys(translations).sort().join(",") !== expected) {
      throw new Error(`Translation ${key} must contain en, de, and es`);
    }
    for (const locale of SUPPORTED_LOCALES) {
      if (typeof translations[locale] !== "string" || translations[locale].length === 0) {
        throw new Error(`Missing ${locale} translation for ${key}`);
      }
    }
  }
}

function applyLocale() {
  document.documentElement.lang = activeLocale;
  el("languageSelect").value = activeLocale;
  el("languageSelect").disabled = !localeCatalogLoaded;

  if (localeCatalogLoaded) {
    for (const node of document.querySelectorAll("[data-i18n]")) {
      node.textContent = t(node.dataset.i18n);
    }
    for (const node of document.querySelectorAll("[data-i18n-placeholder]")) {
      node.setAttribute("placeholder", t(node.dataset.i18nPlaceholder));
    }
    for (const node of document.querySelectorAll("[data-i18n-aria-label]")) {
      node.setAttribute("aria-label", t(node.dataset.i18nAriaLabel));
    }
    for (const node of document.querySelectorAll("[data-i18n-attribute]")) {
      const separator = node.dataset.i18nAttribute.indexOf(":");
      if (separator < 1) continue;
      node.setAttribute(
        node.dataset.i18nAttribute.slice(0, separator),
        t(node.dataset.i18nAttribute.slice(separator + 1))
      );
    }
    document.title = t("page_title");
  }

  updateCatalogStatus();
  refreshDynamicMessages();
  updateActionAvailability();
  if (latestCredential) void renderLatestAvatar();
}

async function loadLocaleCatalog() {
  try {
    const url = new URL("locales/web.yaml", document.baseURI);
    if (url.origin !== location.origin) throw new Error("Locale catalog must be same-origin");
    const response = await fetch(url, { credentials: "same-origin", cache: "no-cache", redirect: "error" });
    if (!response.ok) throw new Error(`Locale catalog request failed (${response.status})`);
    const parsed = parseYaml(await response.text());
    validateTranslations(parsed);
    messages = parsed;
    localeCatalogLoaded = true;
    activeLocale = detectBrowserLocale();
  } catch (error) {
    activeLocale = "en";
    console.error("Brave Monkey localization error", error);
  }
  localeReady = true;
  applyLocale();
  return localeCatalogLoaded;
}

function validateWordCatalog(catalog) {
  if (!catalog || typeof catalog !== "object" || Array.isArray(catalog)) {
    throw new Error("Word catalog must be an object");
  }
  if (Object.keys(catalog).sort().join(",") !== "adjectives,nouns") {
    throw new Error("Word catalog must contain only adjectives and nouns");
  }
  const readWords = (entries, label) => {
    if (!Array.isArray(entries) || entries.length === 0) throw new Error(`${label} list is empty or invalid`);
    const values = entries.map((word, index) => {
      if (typeof word !== "string" || !/^[A-Z][A-Za-z]*$/.test(word)) {
        throw new Error(`Invalid English ${label} at index ${index}`);
      }
      return word;
    });
    if (new Set(values.map(word => word.toLowerCase())).size !== values.length) {
      throw new Error(`${label} values must be unique ignoring case`);
    }
    return Object.freeze(values);
  };

  const wordAdjectives = readWords(catalog.adjectives, "adjective");
  const wordNouns = readWords(catalog.nouns, "noun");
  if (wordAdjectives.length !== 228 || wordNouns.length !== 500) {
    throw new Error("BM3 word list sizes changed; version the catalog before changing it");
  }
  const nounSet = new Set(wordNouns.map(word => word.toLowerCase()));
  if (wordAdjectives.some(word => nounSet.has(word.toLowerCase()))) {
    throw new Error("A word cannot appear in both lists");
  }
  return { adjectives: wordAdjectives, nouns: wordNouns };
}

function updateCatalogStatus() {
  const status = el("catalogStatus");
  if (catalogState === "ready") {
    status.hidden = true;
    return;
  }
  status.hidden = false;
  status.textContent = t(catalogState === "error" ? "catalog_error" : "catalog_loading");
  status.classList.toggle("text-danger", catalogState === "error");
  status.classList.toggle("text-muted-strong", catalogState !== "error");
}

function updateActionAvailability() {
  const ready = wordCatalogLoaded && localeReady;
  el("generateBtn").disabled = !ready || isGenerating;
  el("verifyBtn").disabled = !ready;
}

function refreshDynamicMessages() {
  if (formErrorKey) el("formError").textContent = t(formErrorKey);
  if (actionNoticeKey) el("actionNotice").textContent = t(actionNoticeKey);
  if (verifyResultKey) {
    const result = el("verifyResult");
    result.className = `small fw-semibold ${verifyResultClass}`;
    result.textContent = t(verifyResultKey);
  }
  if (verifyErrorKey) el("verifyError").textContent = t(verifyErrorKey);
  if (contactCardStatusKey) el("contactCardStatus").textContent = t(contactCardStatusKey);
  if (contactCardErrorKey) el("contactCardError").textContent = t(contactCardErrorKey);
  el("generateBtn").textContent = t(isGenerating ? "generating" : "generate_button");
}

function setFormError(key) {
  formErrorKey = key;
  el("formError").textContent = t(key);
  el("formError").hidden = false;
}

function setOption(select, value, label) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  select.appendChild(option);
}

function populateDayOptions() {
  const select = el("birthdayDay");
  for (let day = 1; day <= 31; day++) {
    const value = String(day).padStart(2, "0");
    setOption(select, value, String(day));
  }
}

async function loadWordCatalog() {
  catalogState = "loading";
  updateCatalogStatus();
  try {
    const url = new URL("assets/words.yaml", document.baseURI);
    if (url.origin !== location.origin) throw new Error("Word catalog must be same-origin");
    const response = await fetch(url, { credentials: "same-origin", cache: "no-cache", redirect: "error" });
    if (!response.ok) throw new Error(`Word catalog request failed (${response.status})`);
    const parsed = parseYaml(await response.text());
    const catalog = validateWordCatalog(parsed);
    adjectives = catalog.adjectives;
    nouns = catalog.nouns;
    wordCatalogLoaded = true;
    catalogState = "ready";
  } catch (error) {
    catalogState = "error";
    console.error("Brave Monkey BM3 catalog error", error);
  }
  updateCatalogStatus();
  updateActionAvailability();
  return wordCatalogLoaded;
}

function canonicalizeTwoLetters(raw) {
  const normalized = String(raw).normalize("NFC");
  const letters = [];
  for (const character of normalized) {
    if (LETTER_RE.test(character)) {
      letters.push(character);
    } else if (MARK_RE.test(character) && letters.length > 0) {
      letters[letters.length - 1] += character;
    } else {
      return null;
    }
  }
  if (letters.length !== 2) return null;
  return letters.map(letter => letter.toUpperCase()).join("").normalize("NFC");
}

function inputCharacterCount(value) {
  const text = String(value);
  if (graphemeSegmenter) return [...graphemeSegmenter.segment(text)].length;
  let count = 0;
  for (const character of text.normalize("NFC")) {
    if (!MARK_RE.test(character) || count === 0) count++;
  }
  return count;
}

function limitToTwoCharacters(value) {
  const text = String(value);
  if (graphemeSegmenter) {
    let result = "";
    let count = 0;
    for (const item of graphemeSegmenter.segment(text)) {
      if (count === 2) break;
      result += item.segment;
      count++;
    }
    return result;
  }
  let result = "";
  let count = 0;
  for (const character of text) {
    if (MARK_RE.test(character) && count > 0) {
      result += character;
      continue;
    }
    if (count === 2) break;
    result += character;
    count++;
  }
  return result;
}

function preventExcessPrefixInput(event) {
  const inputType = event.inputType ?? "";
  if (event.isComposing || inputType.startsWith("delete") || inputType === "insertFromPaste" || inputType === "insertFromDrop") return;
  const inserted = event.data ?? event.dataTransfer?.getData("text/plain");
  if (typeof inserted !== "string") return;
  const input = event.currentTarget;
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? start;
  const nextValue = input.value.slice(0, start) + inserted + input.value.slice(end);
  if (inputCharacterCount(nextValue) > 2) event.preventDefault();
}

function canonicalAnswers(answers) {
  return JSON.stringify([
    VERSION,
    answers.birthdayDay,
    answers.familyPrefix,
    answers.fatherPrefix,
    answers.motherPrefix,
    answers.birthplacePrefix,
    answers.siblings,
    answers.hadPet,
    answers.petPrefix
  ]);
}

async function sha256(input) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(input)));
}

function readU32(bytes, start = 0) {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(start, false);
}

function normalizeWord(word) {
  return String(word).trim().toLowerCase();
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
      throw new Error("BM3 avatar theme does not meet the minimum contrast ratio");
    }
  }
}

assertAvatarThemeContrast();

async function unbiasedIndex(seed, count) {
  if (!Number.isInteger(count) || count < 1 || count > 0x100000000) {
    throw new Error("Invalid BM3 dictionary size");
  }
  const range = 0x100000000;
  const limit = Math.floor(range / count) * count;
  for (let attempt = 0; ; attempt++) {
    const digest = await sha256(attempt === 0 ? seed : `${seed}:retry:${attempt}`);
    const value = readU32(digest);
    if (value < limit) return value % count;
  }
}

async function deriveCredential(answers) {
  if (!wordCatalogLoaded) throw new Error("The English word catalog is not ready");
  const canonical = canonicalAnswers(answers);
  const adjectiveIndex = await unbiasedIndex(
    `bravemonkey:identity:${VERSION}:adjective:${canonical}`,
    adjectives.length
  );
  const nounIndex = await unbiasedIndex(
    `bravemonkey:identity:${VERSION}:noun:${canonical}`,
    nouns.length
  );
  const adjective = adjectives[adjectiveIndex];
  const noun = nouns[nounIndex];
  return {
    adjective,
    noun,
    username: `${adjective} ${noun}`.toUpperCase(),
    pin: await pinFromWords(adjective, noun),
    adjectiveIndex,
    nounIndex,
    version: VERSION
  };
}

async function pinFromWords(adjective, noun) {
  const digest = await sha256(`bravemonkey:pin:${VERSION}:${normalizeWord(adjective)}:${normalizeWord(noun)}`);
  return String(readU32(digest) % 1000000).padStart(6, "0");
}

async function verifyPin(adjective, noun, pin) {
  if (!wordCatalogLoaded || !/^\d{6}$/.test(String(pin))) return false;
  if (!adjectives.some(word => word.toLowerCase() === normalizeWord(adjective))) return false;
  if (!nouns.some(word => word.toLowerCase() === normalizeWord(noun))) return false;
  return (await pinFromWords(adjective, noun)) === String(pin);
}

function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&apos;"
  })[character]);
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

  throw new Error("Invalid BM3 avatar pattern index");
}

async function avatarSvg(credential) {
  const digest = await sha256(
    `bravemonkey:avatar:${AVATAR_RENDERER_VERSION}:${normalizeWord(credential.adjective)}:${normalizeWord(credential.noun)}`
  );
  const theme = AVATAR_THEMES[digest[0] % AVATAR_THEMES.length];
  const patternIndex = digest[1] % 4;
  const rotation = (digest[2] % 4) * 90;
  const pair = `${credential.adjective} ${credential.noun}`;
  const initials = `${credential.adjective[0]}${credential.noun[0]}`.toUpperCase();
  const title = escapeXml(t("avatar_title", { pair }));
  const description = escapeXml(t("avatar_description", { pair, initials }));
  const pattern = avatarPatternMarkup(patternIndex, theme.pattern);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 260" data-renderer-version="${AVATAR_RENDERER_VERSION}" xml:lang="${activeLocale}" role="img" aria-labelledby="avatar-title avatar-desc"><title id="avatar-title">${title}</title><desc id="avatar-desc">${description}</desc><defs><clipPath id="avatar-clip" clipPathUnits="userSpaceOnUse"><rect width="260" height="260" rx="36"/></clipPath></defs><rect width="260" height="260" rx="36" fill="${theme.background}"/><g clip-path="url(#avatar-clip)" transform="rotate(${rotation} 130 130)" opacity="0.58">${pattern}</g><rect x="28" y="58" width="204" height="144" rx="48" fill="${AVATAR_BADGE_COLOR}" stroke="${theme.pattern}" stroke-width="3"/><text x="130" y="130" text-anchor="middle" dominant-baseline="central" font-family="Arial,Helvetica,sans-serif" font-size="96" font-weight="800" letter-spacing="3" fill="${theme.ink}">${initials}</text></svg>`;
}

async function renderLatestAvatar() {
  if (!latestCredential) return;
  const credential = latestCredential;
  const token = ++avatarRenderToken;
  try {
    const svg = await avatarSvg(credential);
    if (token !== avatarRenderToken || credential !== latestCredential) return;
    latestSvg = svg;
    el("svgPreview").innerHTML = svg;
    el("contactCardAvatar").innerHTML = svg;
  } catch (error) {
    console.error("Brave Monkey avatar rendering error", error);
  }
}

function contactUrlForCredential(credential) {
  const url = new URL("contact.html", document.baseURI);
  const payload = new URLSearchParams({
    alias: credential.username,
    pin: credential.pin,
    lang: activeLocale
  });
  url.hash = payload.toString();
  return url.href;
}

function setContactCardStatus(key) {
  contactCardStatusKey = key;
  contactCardErrorKey = "";
  el("contactCardStatus").textContent = t(key);
  el("contactCardStatus").hidden = false;
  el("contactCardError").textContent = "";
  el("contactCardError").hidden = true;
}

function setContactCardError(key) {
  contactCardStatusKey = "";
  contactCardErrorKey = key;
  el("contactCardStatus").textContent = "";
  el("contactCardStatus").hidden = true;
  el("contactCardError").textContent = t(key);
  el("contactCardError").hidden = false;
}

function renderContactCard(credential, svg) {
  latestVCard = vCardForCredential(credential);
  el("contactCardAlias").textContent = credential.username;
  el("contactCardPin").textContent = `PIN CODE: ${credential.pin}`;
  el("contactCardAvatar").innerHTML = svg;

  const QRCodeConstructor = window.QRCode;
  if (typeof QRCodeConstructor !== "function" || !QRCodeConstructor.CorrectLevel) {
    throw new Error("The local QR code generator is unavailable");
  }
  const qrHost = el("contactQr");
  qrHost.replaceChildren();
  new QRCodeConstructor(qrHost, {
    text: contactUrlForCredential(credential),
    width: 320,
    height: 320,
    colorDark: "#16352e",
    colorLight: "#ffffff",
    correctLevel: QRCodeConstructor.CorrectLevel.M
  });
  if (!qrHost.querySelector("canvas, img")) throw new Error("The QR code could not be rendered");

  qrHost.removeAttribute("title");
  qrHost.setAttribute("aria-label", t("contact_card_qr_aria"));
  for (const graphic of qrHost.querySelectorAll("canvas, img, svg")) graphic.setAttribute("aria-hidden", "true");
  contactCardReady = true;
  el("downloadCardBtn").disabled = false;
  el("printCardBtn").disabled = false;
  el("downloadVCardBtn").disabled = false;
  setContactCardStatus("contact_card_ready");
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image could not be loaded"));
    image.src = url;
  });
}

async function imageFromSvg(svg) {
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
  try {
    return await loadImage(url);
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function qrImageSource() {
  const host = el("contactQr");
  const canvas = host.querySelector("canvas");
  if (canvas && canvas.width > 0 && canvas.height > 0) return canvas;

  const image = host.querySelector("img");
  if (!image) throw new Error("The QR image is unavailable");
  if (!image.complete || image.naturalWidth === 0) {
    await new Promise((resolve, reject) => {
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", reject, { once: true });
    });
  }
  if (image.naturalWidth === 0) throw new Error("The QR image is unavailable");
  return image;
}

function roundedRect(context, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + width - r, y);
  context.quadraticCurveTo(x + width, y, x + width, y + r);
  context.lineTo(x + width, y + height - r);
  context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  context.lineTo(x + r, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
  context.closePath();
}

function setFittedFont(context, text, maxWidth, startingSize, weight = 800) {
  let size = startingSize;
  while (size > 24) {
    context.font = `${weight} ${size}px system-ui, -apple-system, "Segoe UI", sans-serif`;
    if (context.measureText(text).width <= maxWidth) return size;
    size -= 2;
  }
  context.font = `${weight} ${size}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  return size;
}

function drawWrappedText(context, text, x, y, maxWidth, lineHeight) {
  const words = String(text).split(/\s+/);
  let line = "";
  let lineY = y;
  for (const word of words) {
    const nextLine = line ? `${line} ${word}` : word;
    if (line && context.measureText(nextLine).width > maxWidth) {
      context.fillText(line, x, lineY);
      line = word;
      lineY += lineHeight;
    } else {
      line = nextLine;
    }
  }
  if (line) context.fillText(line, x, lineY);
}

async function createContactCardPng() {
  if (!contactCardReady || !latestCredential || !latestSvg) throw new Error("Contact card is not ready");
  const [avatar, qr] = await Promise.all([imageFromSvg(latestSvg), qrImageSource()]);
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 1010;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable");

  context.fillStyle = "#f2f6f3";
  context.fillRect(0, 0, canvas.width, canvas.height);
  roundedRect(context, 30, 30, 1540, 950, 48);
  context.fillStyle = "#ffffff";
  context.fill();
  context.strokeStyle = "#dbe6df";
  context.lineWidth = 3;
  context.stroke();

  context.fillStyle = "#fce6d1";
  roundedRect(context, 92, 86, 76, 76, 20);
  context.fill();
  context.fillStyle = "#16352e";
  context.font = '700 46px system-ui, -apple-system, "Segoe UI", sans-serif';
  context.fillText("🐒", 105, 143);
  context.font = '850 42px system-ui, -apple-system, "Segoe UI", sans-serif';
  context.fillText("Brave Monkey", 190, 128);
  context.fillStyle = "#5b6b65";
  context.font = '500 24px system-ui, -apple-system, "Segoe UI", sans-serif';
  context.fillText(t("contact_card_edition"), 192, 166);

  context.drawImage(avatar, 92, 292, 250, 250);
  context.fillStyle = "#16352e";
  setFittedFont(context, latestCredential.username, 700, 70, 850);
  context.fillText(latestCredential.username, 390, 382);
  context.font = '800 43px system-ui, -apple-system, "Segoe UI", sans-serif';
  context.fillText(`PIN CODE: ${latestCredential.pin}`, 392, 474);
  context.fillStyle = "#5b6b65";
  context.font = '500 23px system-ui, -apple-system, "Segoe UI", sans-serif';
  context.fillText(t("contact_card_pin_notice"), 392, 520);

  const qrX = 1170;
  const qrY = 275;
  const qrSize = 330;
  context.fillStyle = "#ffffff";
  context.fillRect(qrX, qrY, qrSize, qrSize);
  context.drawImage(qr, qrX + 28, qrY + 28, qrSize - 56, qrSize - 56);
  context.fillStyle = "#5b6b65";
  context.font = '600 21px system-ui, -apple-system, "Segoe UI", sans-serif';
  context.textAlign = "center";
  context.fillText(t("contact_card_scan"), qrX + qrSize / 2, qrY + qrSize + 38);
  context.textAlign = "left";

  context.fillStyle = "#5b6b65";
  context.font = '500 18px system-ui, -apple-system, "Segoe UI", sans-serif';
  drawWrappedText(context, t("contact_card_privacy"), 92, 870, 1410, 26);

  const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("PNG encoding failed");
  return blob;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function clearFieldError(id) {
  const input = el(id);
  input.classList.remove("is-invalid");
  input.removeAttribute("aria-invalid");
}

function setFieldError(id, key) {
  const input = el(id);
  input.classList.add("is-invalid");
  input.setAttribute("aria-invalid", "true");
  el(`${id}Error`).textContent = t(key);
}

let questionnaireSubmitted = false;

function validateQuestionnaire({ focusFirst = false } = {}) {
  const day = el("birthdayDay").value;
  const siblings = el("siblings").value;
  const hadPet = el("hadPet").value;

  const invalidFields = [];
  const setFieldValidity = (id, isValid, key) => {
    if (isValid) {
      clearFieldError(id);
    } else {
      setFieldError(id, key);
      invalidFields.push(id);
    }
  };

  const validDay = /^(?:0[1-9]|[12][0-9]|3[01])$/.test(day);
  setFieldValidity("birthdayDay", validDay, "error_day");

  const prefixes = {};
  for (const [field, id] of [
    ["familyPrefix", "familyPrefix"],
    ["fatherPrefix", "fatherPrefix"],
    ["motherPrefix", "motherPrefix"],
    ["birthplacePrefix", "birthplacePrefix"]
  ]) {
    const input = el(id);
    const limitedValue = limitToTwoCharacters(input.value);
    if (limitedValue !== input.value) input.value = limitedValue;
    const prefix = canonicalizeTwoLetters(input.value);
    setFieldValidity(id, prefix !== null, "error_two_letters");
    prefixes[field] = prefix;
  }

  setFieldValidity("siblings", ["0", "1", "2", "3", "4PLUS"].includes(siblings), "error_siblings");
  setFieldValidity("hadPet", ["YES", "NO"].includes(hadPet), "error_pet_choice");

  let petPrefix = "NONE";
  if (hadPet === "YES") {
    const petInput = el("petPrefix");
    const limitedValue = limitToTwoCharacters(petInput.value);
    if (limitedValue !== petInput.value) petInput.value = limitedValue;
    petPrefix = canonicalizeTwoLetters(petInput.value);
    setFieldValidity("petPrefix", petPrefix !== null, "error_two_letters");
  } else {
    clearFieldError("petPrefix");
  }

  if (invalidFields.length > 0) {
    setFormError("error_fields");
    if (focusFirst) el(invalidFields[0]).focus();
    return null;
  }

  clearFormError();
  return {
    birthdayDay: day,
    familyPrefix: prefixes.familyPrefix,
    fatherPrefix: prefixes.fatherPrefix,
    motherPrefix: prefixes.motherPrefix,
    birthplacePrefix: prefixes.birthplacePrefix,
    siblings,
    hadPet,
    petPrefix
  };
}

function clearFormError() {
  formErrorKey = "";
  el("formError").hidden = true;
}

function clearVerifyMessages() {
  verifyAttempt++;
  verifyErrorKey = "";
  verifyResultKey = "";
  verifyResultClass = "";
  el("verifyError").hidden = true;
  el("verifyError").textContent = "";
  el("verifyResult").className = "small fw-semibold";
  el("verifyResult").textContent = "";
}

el("languageSelect").addEventListener("change", event => {
  const selected = event.currentTarget.value;
  if (!localeCatalogLoaded || !SUPPORTED_LOCALES.includes(selected)) return;
  activeLocale = selected;
  applyLocale();
});

el("questionnaire").addEventListener("submit", async event => {
  event.preventDefault();
  questionnaireSubmitted = true;
  const answers = validateQuestionnaire({ focusFirst: true });
  if (!answers) return;

  isGenerating = true;
  contactCardReady = false;
  latestVCard = null;
  contactCardStatusKey = "";
  contactCardErrorKey = "";
  el("contactCardStatus").hidden = true;
  el("contactCardError").hidden = true;
  el("downloadCardBtn").disabled = true;
  el("printCardBtn").disabled = true;
  el("downloadVCardBtn").disabled = true;
  updateActionAvailability();
  refreshDynamicMessages();
  try {
    const credential = await deriveCredential(answers);
    const svg = await avatarSvg(credential);
    latestCredential = credential;
    latestSvg = svg;
    avatarRenderToken++;
    el("resultAlias").textContent = credential.username;
    el("resultPin").textContent = credential.pin;
    el("svgPreview").innerHTML = svg;
    el("verifyAdjective").value = credential.adjective.toUpperCase();
    el("verifyNoun").value = credential.noun.toUpperCase();
    el("verifyPin").value = credential.pin;
    clearVerifyMessages();
    el("resultSection").hidden = false;
    try {
      renderContactCard(credential, svg);
    } catch (error) {
      contactCardReady = false;
      el("downloadCardBtn").disabled = true;
      el("printCardBtn").disabled = true;
      el("downloadVCardBtn").disabled = !latestVCard;
      setContactCardError("contact_card_qr_error");
      console.error("Brave Monkey contact QR rendering error", error);
    }
    actionNoticeKey = "";
    el("actionNotice").textContent = "";
    el("resultSection").focus();
    el("resultSection").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    setFormError("error_generation");
    console.error("Brave Monkey BM3 generation error", error);
  } finally {
    isGenerating = false;
    updateActionAvailability();
    refreshDynamicMessages();
  }
});

el("hadPet").addEventListener("change", () => {
  const hasPet = el("hadPet").value === "YES";
  el("petPrefixGroup").hidden = !hasPet;
  el("petPrefix").required = hasPet;
  if (!hasPet) el("petPrefix").value = "";
  if (questionnaireSubmitted) validateQuestionnaire();
});

document.querySelectorAll(".unicode-prefix").forEach(input => {
  input.addEventListener("beforeinput", preventExcessPrefixInput);
  const enforcePrefixLength = event => {
    if (event.isComposing) return;
    const field = event.currentTarget;
    const limitedValue = limitToTwoCharacters(field.value);
    if (limitedValue !== field.value) field.value = limitedValue;
    if (questionnaireSubmitted) validateQuestionnaire();
  };
  input.addEventListener("input", enforcePrefixLength);
  input.addEventListener("compositionend", enforcePrefixLength);
});

for (const id of ["birthdayDay", "siblings"]) {
  el(id).addEventListener("change", () => {
    if (questionnaireSubmitted) validateQuestionnaire();
  });
}

el("copyBtn").addEventListener("click", async () => {
  if (!latestCredential) return;
  try {
    await navigator.clipboard.writeText(`${latestCredential.username} ${latestCredential.pin}`);
    actionNoticeKey = "action_copied";
  } catch {
    actionNoticeKey = "action_clipboard_error";
  }
  refreshDynamicMessages();
});

el("downloadBtn").addEventListener("click", () => {
  if (!latestSvg || !latestCredential) return;
  const url = URL.createObjectURL(new Blob([latestSvg], { type: "image/svg+xml;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `brave-monkey-${latestCredential.adjective.toLowerCase()}-${latestCredential.noun.toLowerCase()}-${VERSION}.svg`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
});

el("downloadCardBtn").addEventListener("click", async () => {
  if (!contactCardReady || !latestCredential) return;
  setContactCardStatus("contact_card_png_working");
  el("downloadCardBtn").disabled = true;
  try {
    const blob = await createContactCardPng();
    downloadBlob(blob, `brave-monkey-${latestCredential.adjective.toLowerCase()}-${latestCredential.noun.toLowerCase()}-BM3.png`);
    setContactCardStatus("contact_card_png_done");
  } catch (error) {
    setContactCardError("contact_card_png_error");
    console.error("Brave Monkey PNG export error", error);
  } finally {
    el("downloadCardBtn").disabled = !contactCardReady;
  }
});

el("printCardBtn").addEventListener("click", () => {
  if (contactCardReady) window.print();
});

el("downloadVCardBtn").addEventListener("click", () => {
  if (!latestVCard || !latestCredential) return;
  try {
    const blob = new Blob([latestVCard], { type: "text/vcard;charset=utf-8" });
    downloadBlob(blob, `brave-monkey-${latestCredential.adjective.toLowerCase()}-${latestCredential.noun.toLowerCase()}-BM3.vcf`);
    setContactCardStatus("contact_card_vcard_done");
  } catch (error) {
    setContactCardError("contact_card_vcard_error");
    console.error("Brave Monkey vCard download error", error);
  }
});

el("verifyForm").addEventListener("submit", async event => {
  event.preventDefault();
  clearVerifyMessages();
  const attempt = ++verifyAttempt;
  const adjective = el("verifyAdjective").value;
  const noun = el("verifyNoun").value;
  const pin = el("verifyPin").value;
  if (!adjective || !noun || !/^\d{6}$/.test(pin)) {
    verifyErrorKey = "validator_input_error";
    el("verifyError").textContent = t(verifyErrorKey);
    el("verifyError").hidden = false;
    return;
  }
  verifyResultKey = "validator_checking";
  verifyResultClass = "";
  refreshDynamicMessages();
  try {
    const matches = await verifyPin(adjective, noun, pin);
    if (attempt !== verifyAttempt) return;
    verifyResultKey = matches ? "validator_matches" : "validator_no_match";
    verifyResultClass = matches ? "text-success" : "text-danger";
  } catch (error) {
    if (attempt !== verifyAttempt) return;
    verifyResultKey = "";
    verifyErrorKey = "validator_failure";
    el("verifyError").hidden = false;
    console.error("Brave Monkey BM3 PIN verification error", error);
  }
  refreshDynamicMessages();
});

el("verifyForm").addEventListener("input", clearVerifyMessages);

populateDayOptions();
const localeReadyPromise = loadLocaleCatalog();
const wordsReadyPromise = loadWordCatalog();
const appReady = Promise.all([localeReadyPromise, wordsReadyPromise]).then(
  ([localeLoaded, wordsLoaded]) => localeLoaded && wordsLoaded
);

window.BraveMonkey = Object.freeze({
  VERSION,
  avatarRendererVersion: AVATAR_RENDERER_VERSION,
  ready: appReady,
  deriveCredential,
  pinFromWords,
  verifyPin,
  avatarSvg,
  canonicalAnswers,
  contactUrlForCredential,
  vCardForCredential,
  get dictionarySizes() {
    return { adjectives: adjectives.length, nouns: nouns.length };
  }
});
