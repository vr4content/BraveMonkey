<?php
declare(strict_types=1);

require_once __DIR__ . '/../dist/BraveMonkey.php';

use BraveMonkey\Identity;

$input = json_decode(file_get_contents('php://stdin'), true, 512, JSON_THROW_ON_ERROR);
if (!is_array($input)) {
    throw new RuntimeException('Expected a JSON object on standard input.');
}

$results = [
    'identityProtocolVersion' => Identity::IDENTITY_PROTOCOL_VERSION,
    'avatarRendererVersion' => Identity::AVATAR_RENDERER_VERSION,
    'pinCodes' => [],
    'validations' => [],
    'avatarSvgs' => [],
];

foreach ($input['pinCases'] as $case) {
    $results['pinCodes'][] = Identity::pinFromWords($case['adjective'], $case['noun']);
}

foreach ($input['validationCases'] as $case) {
    $results['validations'][] = Identity::validatePin($case['adjective'], $case['noun'], $case['pin']);
}

foreach ($input['avatarCases'] as $case) {
    $results['avatarSvgs'][] = Identity::avatarSvg(
        $case['adjective'],
        $case['noun'],
        $case['options'] ?? []
    );
}

try {
    Identity::pinFromWords('Uplifted', 'NotInCatalog');
    throw new RuntimeException('pinFromWords accepted a word outside the catalog.');
} catch (InvalidArgumentException $error) {
    // Expected: the library must not compute credentials for unlisted words.
}

try {
    Identity::avatarSvg('Uplifted', 'NotInCatalog');
    throw new RuntimeException('avatarSvg accepted a word outside the catalog.');
} catch (InvalidArgumentException $error) {
    // Expected: icons are only defined for official word pairs.
}

try {
    Identity::avatarSvg('Uplifted', 'Jewel', ['lang' => "en\n"]);
    throw new RuntimeException('avatarSvg accepted a malformed language tag.');
} catch (InvalidArgumentException $error) {
    // Expected: the lang attribute must be a valid language tag.
}

echo json_encode($results, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR), PHP_EOL;
