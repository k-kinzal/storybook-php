<?php

declare(strict_types=1);

namespace StorybookPhp\Tools\PhpStan;

use PhpParser\Node\Expr\MethodCall;
use PHPStan\Analyser\Scope;
use PHPStan\Reflection\MethodReflection;
use PHPStan\Type\DynamicMethodThrowTypeExtension;
use PHPStan\Type\ObjectType;
use PHPStan\Type\Type;
use ReflectionClass;
use ReflectionException;

/**
 * Describes Reflection's documented allocation failure for PHPStan.
 * Its built-in ReflectionClass stub currently omits this exception.
 * https://www.php.net/manual/en/reflectionclass.newinstancewithoutconstructor.php
 */
final class ReflectionAllocationThrowTypeExtension implements DynamicMethodThrowTypeExtension
{
    public function isMethodSupported(MethodReflection $methodReflection): bool
    {
        return $methodReflection->getDeclaringClass()->getName() === ReflectionClass::class
            && $methodReflection->getName() === 'newInstanceWithoutConstructor';
    }

    public function getThrowTypeFromMethodCall(MethodReflection $methodReflection, MethodCall $methodCall, Scope $scope): Type
    {
        return new ObjectType(ReflectionException::class);
    }
}
