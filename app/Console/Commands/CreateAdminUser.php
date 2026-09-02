<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

/*
 * There is no registration route on this site. This command is the only way
 * an account comes into existence.
 */
#[Signature('admin:create')]
#[Description('Create or update the single account that can read the inbox')]
class CreateAdminUser extends Command
{
    public function handle(): int
    {
        $email = $this->ask('Admin email', config('site.email'));
        $password = $this->secret('Admin password (min 8 characters)');
        $confirmation = $this->secret('Confirm password');

        $validator = Validator::make(
            ['email' => $email, 'password' => $password, 'password_confirmation' => $confirmation],
            ['email' => ['required', 'email'], 'password' => ['required', 'string', 'min:8', 'confirmed']],
        );

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }

            return self::FAILURE;
        }

        $user = User::updateOrCreate(
            ['email' => $email],
            ['name' => 'Admin', 'password' => Hash::make($password)],
        );

        $this->info("Admin user ready: {$user->email}");

        return self::SUCCESS;
    }
}
