<?php
namespace App\Components;

class Toggle {
    public function __construct(
        private string $label,
        private bool $checked = false,
        private bool $disabled = false,
        private string $size = 'medium',
    ) {}

    public function render(): string {
        $sizes = [
            'small' => ['track' => 'width: 36px; height: 20px;', 'thumb' => 'width: 16px; height: 16px;', 'translate' => 'translateX(16px)'],
            'medium' => ['track' => 'width: 44px; height: 24px;', 'thumb' => 'width: 20px; height: 20px;', 'translate' => 'translateX(20px)'],
            'large' => ['track' => 'width: 52px; height: 28px;', 'thumb' => 'width: 24px; height: 24px;', 'translate' => 'translateX(24px)'],
        ];
        $s = $sizes[$this->size] ?? $sizes['medium'];
        $trackColor = $this->checked ? '#3b82f6' : '#d1d5db';
        $opacity = $this->disabled ? '0.5' : '1';
        $cursor = $this->disabled ? 'not-allowed' : 'pointer';
        $transform = $this->checked ? "transform: {$s['translate']};" : '';
        $checkedAttr = $this->checked ? ' checked' : '';
        $disabledAttr = $this->disabled ? ' disabled' : '';

        return <<<HTML
        <label class="toggle toggle-{$this->size}" style="display: inline-flex; align-items: center; gap: 8px; cursor: {$cursor}; opacity: {$opacity};">
            <span class="toggle-track" style="{$s['track']} background-color: {$trackColor}; border-radius: 999px; position: relative; display: inline-block;">
                <span class="toggle-thumb" style="{$s['thumb']} background: white; border-radius: 50%; position: absolute; top: 2px; left: 2px; {$transform} transition: transform 0.2s;"></span>
            </span>
            <input type="checkbox" style="display: none;"{$checkedAttr}{$disabledAttr} />
            <span class="toggle-label" style="font-size: 14px;">{$this->label}</span>
        </label>
        HTML;
    }
}
