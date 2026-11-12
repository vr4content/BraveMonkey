export function escapeVCardText(value) {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\n|\r/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export function vCardForCredential(credential) {
  const name = escapeVCardText(credential.username);
  const pin = escapeVCardText(credential.pin);
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:;${name};;;`,
    `FN:${name}`,
    "ORG:Brave Monkey",
    `NOTE:PIN CODE: ${pin}`,
    "END:VCARD",
    ""
  ].join("\r\n");
}
