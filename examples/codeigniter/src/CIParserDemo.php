<?php

namespace App\Components;

class CIParserDemo
{
    public function __construct(
        public string $heading = 'Dashboard Stats',
        public string $description = 'Overview of key metrics',
        public array $metrics = [],
    ) {
        if (empty($this->metrics)) {
            $this->metrics = [
                ['name' => 'Users', 'count' => '1,234', 'change' => '+12%'],
                ['name' => 'Sales', 'count' => '567', 'change' => '+8%'],
                ['name' => 'Revenue', 'count' => '$89K', 'change' => '+15%'],
            ];
        }
    }

    public function render(): string
    {
        $template = file_get_contents($GLOBALS['__storybook_ci4_template_path'] . 'parser_demo.php');

        // Simple variable replacement: {variable}
        $template = str_replace('{heading}', htmlspecialchars($this->heading), $template);
        $template = str_replace('{description}', htmlspecialchars($this->description), $template);

        // Pair tag replacement: {metrics}...{/metrics}
        if (preg_match('/\{metrics\}(.*?)\{\/metrics\}/s', $template, $matches)) {
            $rowTemplate = $matches[1];
            $rows = '';
            foreach ($this->metrics as $metric) {
                $row = $rowTemplate;
                $row = str_replace('{name}', htmlspecialchars($metric['name']), $row);
                $row = str_replace('{count}', htmlspecialchars($metric['count']), $row);
                $row = str_replace('{change}', htmlspecialchars($metric['change']), $row);
                $rows .= $row;
            }
            $template = preg_replace('/\{metrics\}.*?\{\/metrics\}/s', $rows, $template);
        }

        return $template;
    }
}
