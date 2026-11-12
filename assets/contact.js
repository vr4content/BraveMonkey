import { load as parseYaml } from "./vendor/js-yaml.esm.min.js";
import { vCardForCredential } from "./vcard.js";

const SUPPORTED_LOCALES = Object.freeze(["en", "de", "es"]);
const FALLBACK_TEXT = Object.freeze({
  contact_import_page_title: "Brave Monkey · Add this contact",
  contact_import_meta_description: "Download a Brave Monkey contact with its PIN note.",
  contact_import_title: "Save this contact",
  contact_import_description: "Download the contact file, then open it to add the alias and PIN to your phone's contacts.",
  contact_import_company: "Company: Brave Monkey",
  contact_import_instructions: "After downloading, open the .vcf file and add it to Contacts.",
  contact_import_privacy: "The contact contains only your alias, Brave Monkey, and PIN—no answers, email, or phone number. Your phone may sync saved contacts to a cloud account.",
  contact_import_error: "This contact link is incomplete or invalid. Scan the QR code again from the card.",
  contact_import_home: "Return to Brave Monkey",
  contact_card_pin_notice: "Public checksum — not a password.",
  contact_card_download_vcard: "Download contact (.vcf)"
});

const params = new URLSearchParams(window.location.hash.slice(1));
const credential = {
  username: params.get("alias") ?? "",
  pin: params.get("pin") ?? ""
};
const requestedLocale = params.get("lang");

if (window.location.hash) {
  window.history.replaceState(window.history.state, "", `${window.location.pathname}${window.location.search}`);
}

function detectBrowserLocale() {
  const preferences = Array.isArray(navigator.languages) ? [...navigator.languages] : [];
  if (navigator.language) preferences.push(navigator.language);
  for (const preference of preferences) {
    const base = String(preference).toLowerCase().split("-")[0];
    if (SUPPORTED_LOCALES.includes(base)) return base;
  }
  return "en";
}

const activeLocale = SUPPORTED_LOCALES.includes(requestedLocale) ? requestedLocale : detectBrowserLocale();
let messages = null;

function t(key) {
  return messages?.[key]?.[activeLocale] ?? messages?.[key]?.en ?? FALLBACK_TEXT[key] ?? key;
}

function applyLocale() {
  document.documentElement.lang = activeLocale;
  for (const node of document.querySelectorAll("[data-i18n]")) {
    node.textContent = t(node.dataset.i18n);
  }
  for (const node of document.querySelectorAll("[data-i18n-attribute]")) {
    const separator = node.dataset.i18nAttribute.indexOf(":");
    if (separator < 1) continue;
    node.setAttribute(
      node.dataset.i18nAttribute.slice(0, separator),
      t(node.dataset.i18nAttribute.slice(separator + 1))
    );
  }
  document.title = t("contact_import_page_title");
}

async function loadLocaleCatalog() {
  try {
    const url = new URL("../locales/web.yaml", import.meta.url);
    const response = await fetch(url, { credentials: "same-origin", cache: "no-cache", redirect: "error" });
    if (!response.ok) throw new Error(`Locale catalog request failed (${response.status})`);
    messages = parseYaml(await response.text());
  } catch (error) {
    console.error("Brave Monkey contact-page localization error", error);
  }
  applyLocale();
}

function isValidCredential(value) {
  return /^[A-Z]+ [A-Z]+$/.test(value.username) && /^\d{6}$/.test(value.pin);
}

function showContactDownload() {
  document.getElementById("contactAlias").textContent = credential.username;
  document.getElementById("contactPin").textContent = `PIN CODE: ${credential.pin}`;

  const blob = new Blob([vCardForCredential(credential)], { type: "text/vcard;charset=utf-8" });
  const downloadLink = document.getElementById("downloadContactLink");
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = `brave-monkey-${credential.username.toLowerCase().replace(/\s+/g, "-")}-BM3.vcf`;
  downloadLink.hidden = false;
  document.getElementById("contactImportContent").hidden = false;
}

async function initialize() {
  await loadLocaleCatalog();
  if (!isValidCredential(credential)) {
    document.getElementById("contactImportError").hidden = false;
    return;
  }
  showContactDownload();
}

void initialize();
