import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const checkOnly = process.argv.includes("--check");

function fail(message) {
  throw new Error(message);
}

function matchesEntire(value, expression) {
  const match = expression.exec(value);
  return match !== null && match[0] === value;
}

function validateProtocol(protocol) {
  const requiredKeys = [
    "adjectiveCount",
    "avatarRendererVersion",
    "identityProtocolVersion",
    "nounCount"
  ];
  if (
    !protocol || typeof protocol !== "object" || Array.isArray(protocol) ||
    Object.keys(protocol).sort().join(",") !== requiredKeys.join(",")
  ) {
    fail("src/libraries/protocol.json has an unexpected shape.");
  }
  for (const key of ["identityProtocolVersion", "avatarRendererVersion"]) {
    if (typeof protocol[key] !== "string" || !matchesEntire(protocol[key], /^[a-z0-9-]+$/)) {
      fail(`Invalid ${key} in src/libraries/protocol.json.`);
    }
  }
  for (const key of ["adjectiveCount", "nounCount"]) {
    if (!Number.isInteger(protocol[key]) || protocol[key] < 1) {
      fail(`Invalid ${key} in src/libraries/protocol.json.`);
    }
  }
}

function validateCatalog(catalog, protocol) {
  if (!catalog || typeof catalog !== "object" || Array.isArray(catalog)) {
    fail("assets/words.yaml must contain an object.");
  }
  if (Object.keys(catalog).sort().join(",") !== "adjectives,nouns") {
    fail("assets/words.yaml must contain only adjectives and nouns.");
  }

  for (const [key, expectedCount] of [
    ["adjectives", protocol.adjectiveCount],
    ["nouns", protocol.nounCount]
  ]) {
    const words = catalog[key];
    if (!Array.isArray(words) || words.length !== expectedCount) {
      fail(`${key} must contain exactly ${expectedCount} words.`);
    }
    if (words.some(word => typeof word !== "string" || !matchesEntire(word, /^[A-Z][A-Za-z]*$/))) {
      fail(`${key} contains a word that is not a capitalized ASCII English word.`);
    }
    if (new Set(words.map(word => word.toLowerCase())).size !== words.length) {
      fail(`${key} contains duplicate words (case-insensitive).`);
    }
  }

  const adjectiveSet = new Set(catalog.adjectives.map(word => word.toLowerCase()));
  if (catalog.nouns.some(word => adjectiveSet.has(word.toLowerCase()))) {
    fail("A word cannot appear in both the adjective and noun lists.");
  }
}

function renderArray(words, itemIndentation, closingIndentation) {
  return [
    "[",
    ...words.map(word => `${itemIndentation}${JSON.stringify(word)},`),
    `${closingIndentation}]`
  ].join("\n");
}

function replaceOnce(source, marker, value, label) {
  const firstIndex = source.indexOf(marker);
  if (firstIndex < 0 || source.indexOf(marker, firstIndex + marker.length) >= 0) {
    fail(`${label} must contain exactly one ${marker} placeholder.`);
  }
  return source.slice(0, firstIndex) + value + source.slice(firstIndex + marker.length);
}

function renderTemplate(template, replacements, label) {
  let output = template;
  for (const [marker, value] of Object.entries(replacements)) {
    output = replaceOnce(output, marker, value, label);
  }
  return output;
}

async function main() {
  const protocolPath = resolve(projectRoot, "src/libraries/protocol.json");
  const protocol = JSON.parse(await readFile(protocolPath, "utf8"));
  validateProtocol(protocol);

  const yamlParserPath = resolve(projectRoot, "assets/vendor/js-yaml.esm.min.js");
  const { load } = await import(pathToFileURL(yamlParserPath).href);
  const catalog = load(await readFile(resolve(projectRoot, "assets/words.yaml"), "utf8"));
  validateCatalog(catalog, protocol);

  const sharedReplacements = {
    "__IDENTITY_PROTOCOL_VERSION__": JSON.stringify(protocol.identityProtocolVersion),
    "__AVATAR_RENDERER_VERSION__": JSON.stringify(protocol.avatarRendererVersion)
  };
  const targets = [
    {
      template: "src/libraries/bravemonkey.js.in",
      output: "dist/bravemonkey.js",
      replacements: {
        ...sharedReplacements,
        "__ADJECTIVES__": renderArray(catalog.adjectives, "    ", "  "),
        "__NOUNS__": renderArray(catalog.nouns, "    ", "  ")
      }
    },
    {
      template: "src/libraries/BraveMonkey.php.in",
      output: "dist/BraveMonkey.php",
      replacements: {
        ...sharedReplacements,
        "__ADJECTIVES__": renderArray(catalog.adjectives, "        ", "    "),
        "__NOUNS__": renderArray(catalog.nouns, "        ", "    ")
      }
    }
  ];

  let staleFiles = false;
  for (const target of targets) {
    const template = await readFile(resolve(projectRoot, target.template), "utf8");
    const output = renderTemplate(template, target.replacements, target.template);
    const outputPath = resolve(projectRoot, target.output);

    if (checkOnly) {
      let existing;
      try {
        existing = await readFile(outputPath, "utf8");
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
      if (existing !== output) {
        console.error(`${target.output} is missing or out of date. Run node scripts/build-libraries.mjs.`);
        staleFiles = true;
      }
      continue;
    }

    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, output, "utf8");
    console.log(`Generated ${target.output}`);
  }

  if (staleFiles) process.exitCode = 1;
  else if (checkOnly) console.log("Standalone library distributions are up to date.");
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
