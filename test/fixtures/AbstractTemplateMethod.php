<?php
namespace App\Components;

/**
 * Template Method design pattern: abstract class defines the skeleton,
 * concrete subclasses implement the variable parts. This tests that
 * the runner correctly resolves the inherited render() method while
 * using the concrete class's overridden helper methods.
 */
abstract class AbstractNotification {
    public function __construct(
        protected string $message,
        protected string $recipient = 'User',
    ) {}

    public function render(): string {
        $icon = $this->icon();
        $color = $this->color();
        $channel = $this->channel();
        return <<<HTML
        <div class="notification notification-{$channel}" style="display: flex; align-items: flex-start; gap: 12px; padding: 14px 18px; background: {$color}15; border-left: 4px solid {$color}; border-radius: 0 8px 8px 0; font-family: system-ui;">
            <span style="font-size: 20px;">{$icon}</span>
            <div>
                <div style="font-size: 11px; color: {$color}; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">{$channel} notification</div>
                <div style="font-weight: 600; color: #111827; margin-top: 2px;">To: {$this->recipient}</div>
                <div style="color: #4b5563; font-size: 14px; margin-top: 4px;">{$this->message}</div>
            </div>
        </div>
        HTML;
    }

    abstract protected function icon(): string;
    abstract protected function color(): string;
    abstract protected function channel(): string;
}

class EmailNotification extends AbstractNotification {
    protected function icon(): string { return '&#9993;'; }
    protected function color(): string { return '#3b82f6'; }
    protected function channel(): string { return 'email'; }
}

class SmsNotification extends AbstractNotification {
    protected function icon(): string { return '&#128241;'; }
    protected function color(): string { return '#22c55e'; }
    protected function channel(): string { return 'sms'; }
}

class PushNotification extends AbstractNotification {
    protected function icon(): string { return '&#128276;'; }
    protected function color(): string { return '#f59e0b'; }
    protected function channel(): string { return 'push'; }
}
