<?php

declare(strict_types=1);

if ($argc < 4) {
    fwrite(STDERR, "Usage: php tools/php/assert-coverage.php <clover.xml> <target-file> <minimum-percent>\n");
    exit(1);
}

$coverageFile = $argv[1];
$targetInput = $argv[2];
$minimumPercent = (float) $argv[3];

$targetPath = realpath($targetInput);
if ($targetPath === false) {
    fwrite(STDERR, "Target file not found: {$targetInput}\n");
    exit(1);
}

$xml = simplexml_load_file($coverageFile);
if ($xml === false || !isset($xml->project)) {
    fwrite(STDERR, "Failed to parse Clover report: {$coverageFile}\n");
    exit(1);
}

foreach ($xml->project->file as $file) {
    $filePath = realpath((string) $file['name']);
    if ($filePath !== $targetPath || !isset($file->metrics)) {
        continue;
    }

    $statements = (int) $file->metrics['statements'];
    $coveredStatements = (int) $file->metrics['coveredstatements'];
    $percent = $statements === 0 ? 100.0 : ($coveredStatements / $statements) * 100.0;

    if ($percent + 0.00001 < $minimumPercent) {
        fwrite(
            STDERR,
            sprintf(
                "Coverage for %s is %.2f%% (%d/%d statements), expected at least %.2f%%\n",
                $targetInput,
                $percent,
                $coveredStatements,
                $statements,
                $minimumPercent,
            ),
        );
        exit(1);
    }

    fwrite(
        STDOUT,
        sprintf(
            "Coverage for %s is %.2f%% (%d/%d statements)\n",
            $targetInput,
            $percent,
            $coveredStatements,
            $statements,
        ),
    );
    exit(0);
}

fwrite(STDERR, "Target file not present in Clover report: {$targetInput}\n");
exit(1);
