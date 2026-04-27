<?php
namespace App\Components;

/**
 * Surfaces values controlled by FrameworkOptions.phpOptions / phpEnv.
 * Used to visually confirm that the framework plumbed those settings
 * through to the spawned PHP process.
 */
class PhpEnv {
    public function __construct(
        private string $envName = 'APP_ENV',
        private string $iniName = 'memory_limit',
    ) {}

    public function render(): string {
        $envValue = getenv($this->envName);
        $iniValue = ini_get($this->iniName);

        $envDisplay = $envValue === false ? '(not set)' : $envValue;
        $iniDisplay = $iniValue === false ? '(unknown)' : $iniValue;

        return '<dl class="php-env">'
            . '<dt>getenv(' . htmlspecialchars($this->envName) . ')</dt>'
            . '<dd>' . htmlspecialchars((string) $envDisplay) . '</dd>'
            . '<dt>ini_get(' . htmlspecialchars($this->iniName) . ')</dt>'
            . '<dd>' . htmlspecialchars((string) $iniDisplay) . '</dd>'
            . '</dl>';
    }
}
