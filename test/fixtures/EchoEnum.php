<?php
namespace App\Fixtures;

enum EchoEnum: string {
    case Success = 'success';
    case Error = 'error';
    case Warning = 'warning';

    public function alert(string $message, bool $loud = false): void {
        $label = $loud ? strtoupper($this->name) : $this->name;
        echo "<div class=\"echo-enum-{$this->value}\"><strong>{$label}:</strong> {$message}</div>";
    }
}
