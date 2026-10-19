<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class DemoClear extends Command
{
    protected $signature = 'demo:clear';

    protected $description = 'Remove all demo content added by demo:seed and restore the previous settings';

    public function handle(): int
    {
        return $this->call('demo:seed', ['--clear' => true]);
    }
}
