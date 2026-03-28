<?php

declare(strict_types=1);

namespace StorybookPhp\EnumFixture;

enum Status: string
{
    case Draft = 'draft';
    case Published = 'published';

    public function render(string $suffix = ''): string
    {
        echo 'enum:';

        return $this->name . $suffix;
    }
}

enum UnitStatus
{
    case Pending;
    case Done;
}

function acceptsStatus(Status $status): Status
{
    return $status;
}

/**
 * @phpstan-param list<Status> $statuses
 * @return list<Status>
 */
function acceptsStatuses(array $statuses): array
{
    return $statuses;
}
