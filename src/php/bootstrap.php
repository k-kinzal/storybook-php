<?php

declare(strict_types=1);

require_once __DIR__ . '/Runtime/Contract/DocTypeParser.php';
require_once __DIR__ . '/Runtime/Contract/RuntimeTypeResolver.php';
require_once __DIR__ . '/Runtime/Casting/ArrayCaster.php';
require_once __DIR__ . '/Runtime/Casting/InlineCaster.php';
require_once __DIR__ . '/Runtime/Casting/ObjectInstantiator.php';
require_once __DIR__ . '/Runtime/Casting/TypeScorer.php';
require_once __DIR__ . '/Runtime/Casting/ValueCaster.php';
require_once __DIR__ . '/Runtime/Execution/ArgumentDefinitionMap.php';
require_once __DIR__ . '/Runtime/Execution/ArgumentResolver.php';
require_once __DIR__ . '/Runtime/Execution/ExecutionContextHydrator.php';
require_once __DIR__ . '/Runtime/Execution/ExecutionResultBuilder.php';
require_once __DIR__ . '/Runtime/Execution/Invoker.php';
require_once __DIR__ . '/Runtime/Execution/Planner.php';
require_once __DIR__ . '/Runtime/Execution/PublicArgumentMapper.php';
require_once __DIR__ . '/Runtime/Execution/RequestHandler.php';
require_once __DIR__ . '/Runtime/Transport/AdapterChain.php';
require_once __DIR__ . '/Runtime/Transport/OutputNormalizer.php';
require_once __DIR__ . '/Runtime/Transport/RequestDecoder.php';
require_once __DIR__ . '/Runtime/Transport/ResponseEncoder.php';
require_once __DIR__ . '/Runtime/Runner.php';
