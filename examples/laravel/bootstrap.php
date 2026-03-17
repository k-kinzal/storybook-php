<?php

declare(strict_types=1);

/**
 * Standalone Blade bootstrap for storybook-php Laravel example.
 *
 * Sets up illuminate/view Container so that Illuminate\View\Component
 * subclasses can render Blade templates without the full Laravel framework.
 */

require_once __DIR__ . '/vendor/autoload.php';

use Illuminate\Container\Container;
use Illuminate\Events\Dispatcher;
use Illuminate\Filesystem\Filesystem;
use Illuminate\View\Compilers\BladeCompiler;
use Illuminate\View\Engines\CompilerEngine;
use Illuminate\View\Engines\EngineResolver;
use Illuminate\View\Engines\PhpEngine;
use Illuminate\View\Factory as ViewFactory;
use Illuminate\View\FileViewFinder;

// Only bootstrap once per process
if (Container::getInstance()->bound(ViewFactory::class)) {
    return;
}

$viewPaths = [__DIR__ . '/src/views'];
$cachePath = sys_get_temp_dir() . '/storybook-php-blade-cache';

if (! is_dir($cachePath)) {
    mkdir($cachePath, 0755, true);
}

$container  = new Container();
$filesystem = new Filesystem();
$dispatcher = new Dispatcher($container);

// Engine resolver
$resolver = new EngineResolver();
$resolver->register('php', fn () => new PhpEngine($filesystem));

$compiler = new BladeCompiler($filesystem, $cachePath);
$resolver->register('blade', fn () => new CompilerEngine($compiler, $filesystem));

// View finder & factory
$finder  = new FileViewFinder($filesystem, $viewPaths);
$factory = new ViewFactory($resolver, $finder, $dispatcher);

// Wire into Container so Component::view() works
$container->instance('view', $factory);
$container->instance(ViewFactory::class, $factory);
Container::setInstance($container);
