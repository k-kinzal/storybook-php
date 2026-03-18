<?php
namespace App\Components;

/**
 * Demonstrates an enum method that uses echo (void return) instead of returning a string.
 * The runner captures output via ob_start()/ob_get_clean() for enum methods too.
 */
enum EchoEnum: string {
    case Success = 'success';
    case Error = 'error';
    case Warning = 'warning';
    case Info = 'info';

    public function alert(string $message, bool $dismissible = false): void {
        $colors = [
            'success' => ['#22c55e', '#f0fdf4', '#166534'],
            'error'   => ['#ef4444', '#fef2f2', '#991b1b'],
            'warning' => ['#f59e0b', '#fffbeb', '#92400e'],
            'info'    => ['#3b82f6', '#eff6ff', '#1e40af'],
        ];
        [$accent, $bg, $fg] = $colors[$this->value] ?? ['#6b7280', '#f9fafb', '#374151'];
        $label = ucfirst($this->value);
        $close = $dismissible ? '<button style="background:none;border:none;font-size:18px;cursor:pointer;color:' . $fg . ';">&times;</button>' : '';

        echo '<div class="echo-enum echo-enum-' . $this->value . '" style="';
        echo "display:flex;align-items:center;justify-content:space-between;";
        echo "padding:12px 16px;border-left:4px solid {$accent};background:{$bg};";
        echo 'border-radius:0 6px 6px 0;font-family:system-ui;">';
        echo "<div><strong style=\"color:{$fg};\">{$label}:</strong> ";
        echo "<span style=\"color:{$fg};\">{$message}</span></div>";
        echo $close;
        echo '</div>';
    }
}
