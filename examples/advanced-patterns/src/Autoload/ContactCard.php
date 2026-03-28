<?php
namespace App\Components\Autoload;

class ContactCard {
    public function __construct(
        private string $name,
        private Address $address,
        private string $phone = '',
    ) {}

    public function render(): string {
        $flag = match ($this->address->country->code) {
            'US' => '🇺🇸', 'GB' => '🇬🇧', 'JP' => '🇯🇵', 'FR' => '🇫🇷', 'DE' => '🇩🇪',
            default => '🌍',
        };
        $phoneHtml = $this->phone !== ''
            ? "<div style=\"margin-top: 8px; font-size: 13px; color: #6b7280;\">📞 {$this->phone}</div>"
            : '';
        return <<<HTML
        <div class="contact-card" style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 10px; font-family: system-ui; max-width: 350px;">
            <div style="font-weight: 700; font-size: 16px; margin-bottom: 8px;">{$this->name}</div>
            <div style="font-size: 14px; color: #374151; line-height: 1.6;">
                <div>{$this->address->street}</div>
                <div>{$this->address->city}</div>
                <div>{$flag} {$this->address->country->name} ({$this->address->country->code})</div>
            </div>
            {$phoneHtml}
        </div>
        HTML;
    }
}
