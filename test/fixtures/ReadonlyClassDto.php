<?php
namespace App\Components;

/**
 * PHP 8.2 readonly class: all properties are automatically readonly.
 * The readonly keyword on the class prevents any mutable properties.
 */
readonly class ReadonlyClassDto {
    public function __construct(
        public string $name,
        public string $email,
        public int $age = 30,
        public string $role = 'member',
    ) {}

    public function render(): string {
        $roleColors = [
            'admin' => '#ef4444',
            'editor' => '#f59e0b',
            'member' => '#3b82f6',
            'guest' => '#6b7280',
        ];
        $color = $roleColors[$this->role] ?? '#6b7280';
        return <<<HTML
        <div class="user-dto" style="display: flex; align-items: center; gap: 16px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 12px; font-family: system-ui;">
            <div style="width: 48px; height: 48px; border-radius: 50%; background: {$color}; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px;">
                {$this->name[0]}
            </div>
            <div>
                <div style="font-weight: 600; color: #111827;">{$this->name}</div>
                <div style="font-size: 13px; color: #6b7280;">{$this->email}</div>
                <div style="font-size: 12px; margin-top: 2px;">
                    <span style="background: {$color}; color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px;">{$this->role}</span>
                    <span style="color: #9ca3af; margin-left: 8px;">Age: {$this->age}</span>
                </div>
            </div>
        </div>
        HTML;
    }
}
