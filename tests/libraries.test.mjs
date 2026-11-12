import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolve } from "node:path";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const vectors = JSON.parse(await readFile(resolve(projectRoot, "tests/protocol-vectors.json"), "utf8"));
const protocol = JSON.parse(await readFile(resolve(projectRoot, "src/libraries/protocol.json"), "utf8"));

await import(pathToFileURL(resolve(projectRoot, "dist/bravemonkey.js")).href);
const library = globalThis.BraveMonkeyIdentity;
assert.ok(library, "browser distribution should expose BraveMonkeyIdentity globally");
assert.equal(library.identityProtocolVersion, vectors.identityProtocolVersion);
assert.equal(library.avatarRendererVersion, vectors.avatarRendererVersion);
assert.deepEqual(library.dictionarySizes, {
  adjectives: protocol.adjectiveCount,
  nouns: protocol.nounCount
});

const pinCodes = [];
for (const vector of vectors.pinCases) {
  const pin = await library.pinFromWords(vector.adjective, vector.noun);
  assert.equal(pin, vector.pin, `${vector.adjective} ${vector.noun} PIN`);
  pinCodes.push(pin);
}

const validations = [];
for (const vector of vectors.validationCases) {
  const valid = await library.validatePin(vector.adjective, vector.noun, vector.pin);
  assert.equal(valid, vector.expected, `validation for ${vector.adjective} ${vector.noun}`);
  validations.push(valid);
}

await assert.rejects(
  library.pinFromWords("Uplifted", "NotInCatalog"),
  /bundled word catalog/
);
await assert.rejects(
  library.avatarSvg("Uplifted", "NotInCatalog"),
  /bundled word catalog/
);
await assert.rejects(
  library.avatarSvg("Uplifted", "Jewel", { lang: "bad language" }),
  /language tag/
);
await assert.rejects(
  library.avatarSvg("Uplifted", "Jewel", { lang: "en\n" }),
  /language tag/
);

const avatarSvgs = [];
const encoder = new TextEncoder();
const avatarThemes = [
  "#FCE4E8",
  "#E4F3E8",
  "#E3F0FC",
  "#EFE7FB",
  "#FFF0DD",
  "#DFF3F1"
];
const patternProbes = [
  '<circle cx="16" cy="16" r="3.25"/>',
  '<path d="M-260 0L0 260"/>',
  '<circle cx="0" cy="0" r="24"/>',
  '<path d="M-20 16Q0 2 0 16T40 16'
];

for (const vector of vectors.avatarCases) {
  const message = `bravemonkey:avatar:${vectors.avatarRendererVersion}:${vector.adjective.toLowerCase()}:${vector.noun.toLowerCase()}`;
  const digest = new Uint8Array(await globalThis.crypto.subtle.digest("SHA-256", encoder.encode(message)));
  assert.deepEqual(Array.from(digest.slice(0, 3)), vector.digestBytes, `${vector.adjective} ${vector.noun} avatar digest`);
  assert.equal(digest[0] % avatarThemes.length, vector.themeIndex);
  assert.equal(digest[1] % 4, vector.patternIndex);
  assert.equal((digest[2] % 4) * 90, vector.rotationDegrees);

  const svg = await library.avatarSvg(vector.adjective, vector.noun, vector.options);
  assert.ok(svg.includes(`data-renderer-version="${vectors.avatarRendererVersion}"`));
  assert.ok(svg.includes(`fill="${vector.background}"`), "SVG should use the reference theme");
  assert.ok(svg.includes(`rotate(${vector.rotationDegrees} 130 130)`), "SVG should use the reference rotation");
  assert.ok(svg.includes(patternProbes[vector.patternIndex]), "SVG should use the reference pattern");
  avatarSvgs.push(svg);
}

assert.ok(avatarSvgs[0].includes("Green &amp; &lt;Tomato&gt; &apos;test&apos; &quot;title&quot;"));
assert.ok(avatarSvgs[0].includes("A &quot;bright&quot; demo &amp; SVG &lt;safe&gt;."));

const php = spawnSync("php", [resolve(projectRoot, "tests/php-conformance.php")], {
  encoding: "utf8",
  input: JSON.stringify(vectors),
  // On Windows, PHP may be installed as a .bat shim which needs cmd.exe.
  shell: process.platform === "win32"
});
if (php.error) throw php.error;
assert.equal(php.status, 0, `PHP conformance failed:\n${php.stderr || php.stdout}`);
const phpResults = JSON.parse(php.stdout);

assert.deepEqual(phpResults, {
  identityProtocolVersion: library.identityProtocolVersion,
  avatarRendererVersion: library.avatarRendererVersion,
  pinCodes,
  validations,
  avatarSvgs
}, "PHP and browser JavaScript must produce identical results");
console.log(`Passed ${vectors.pinCases.length} PIN vectors, ${vectors.validationCases.length} validations, and ${vectors.avatarCases.length} cross-language SVG vectors.`);
