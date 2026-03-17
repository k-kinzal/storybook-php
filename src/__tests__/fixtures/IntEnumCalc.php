<?php
namespace App\Components;

/**
 * Int-backed enum with methods that use the integer value for computations.
 * Demonstrates that the runner correctly resolves int-backed enum cases
 * and methods can operate on the integer backing value.
 */
enum HttpPort: int {
    case Http = 80;
    case Https = 443;
    case Dev = 3000;
    case Alt = 8080;
    case Proxy = 8443;

    public function render(): string {
        $secure = $this->value === 443 || $this->value === 8443;
        $icon = $secure ? '&#128274;' : '&#127760;';
        $bg = $secure ? '#dcfce7' : '#fef3c7';
        $text = $secure ? '#166534' : '#92400e';
        return <<<HTML
        <div class="port-badge" style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; background: {$bg}; border-radius: 8px; font-family: system-ui;">
            <span style="font-size: 18px;">{$icon}</span>
            <span style="font-weight: 600; color: {$text};">{$this->name}</span>
            <span style="color: {$text}; opacity: 0.7;">:{$this->value}</span>
        </div>
        HTML;
    }

    public static function table(): string {
        $rows = '';
        foreach (self::cases() as $port) {
            $secure = $port->value === 443 || $port->value === 8443;
            $label = $secure ? 'Secure' : 'Standard';
            $color = $secure ? '#22c55e' : '#f59e0b';
            $rows .= "<tr><td style=\"padding: 8px;\">{$port->name}</td><td style=\"padding: 8px; font-family: monospace;\">{$port->value}</td><td style=\"padding: 8px; color: {$color};\">{$label}</td></tr>";
        }
        return <<<HTML
        <table class="port-table" style="border-collapse: collapse; font-family: system-ui; width: 100%;">
            <thead><tr style="border-bottom: 2px solid #e5e7eb;">
                <th style="padding: 8px; text-align: left;">Protocol</th>
                <th style="padding: 8px; text-align: left;">Port</th>
                <th style="padding: 8px; text-align: left;">Security</th>
            </tr></thead>
            <tbody>{$rows}</tbody>
        </table>
        HTML;
    }
}
