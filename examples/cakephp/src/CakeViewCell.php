<?php

namespace App\Components;

class CakeViewCell
{
    public function __construct(
        public string $period = 'monthly',
        public int $userCount = 1250,
        public int $orderCount = 340,
        public string $revenue = '$12,500',
    ) {}

    public function render(): string
    {
        // Simulate View Cell — a mini-controller that fetches/prepares its own data
        $stats = $this->fetchStats();

        $period = $this->period;
        $items = $stats;

        ob_start();
        include $GLOBALS['__storybook_cake_template_path'] . 'cell/StatsCell/display.php';
        return ob_get_clean();
    }

    /**
     * Simulates the View Cell's data-fetching logic.
     * In real CakePHP, this would query models/services.
     */
    private function fetchStats(): array
    {
        return [
            ['label' => 'Users', 'value' => number_format($this->userCount), 'trend' => 'up'],
            ['label' => 'Orders', 'value' => number_format($this->orderCount), 'trend' => 'up'],
            ['label' => 'Revenue', 'value' => $this->revenue, 'trend' => 'stable'],
        ];
    }
}
