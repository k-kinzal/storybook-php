<?php

require_once __DIR__ . '/TypeMapTemplateHelpers.php';
require_once __DIR__ . (
    PHP_VERSION_ID >= 80100
        ? '/TypeMapTemplateToneEnum.php'
        : '/TypeMapTemplateToneClass.php'
);
