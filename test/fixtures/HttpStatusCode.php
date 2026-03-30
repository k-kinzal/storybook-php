<?php
namespace App\Components;

enum HttpStatusCode: int {
    case OK = 200;
    case Created = 201;
    case MovedPermanently = 301;
    case NotFound = 404;
    case Forbidden = 403;
    case InternalServerError = 500;

    public function category(): string {
        return match (true) {
            $this->value >= 200 && $this->value < 300 => 'Success',
            $this->value >= 300 && $this->value < 400 => 'Redirect',
            $this->value >= 400 && $this->value < 500 => 'Client Error',
            $this->value >= 500 => 'Server Error',
            default => 'Unknown',
        };
    }

    public function badge(): string {
        return "<span class=\"badge\">{$this->value} {$this->name} ({$this->category()})</span>";
    }

    public static function table(): string {
        $rows = '';
        foreach (self::cases() as $case) {
            $rows .= "<tr><td>{$case->value}</td><td>{$case->name}</td></tr>";
        }
        return "<table>{$rows}</table>";
    }
}
