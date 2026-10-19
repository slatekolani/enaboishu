<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\Audit;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public const ROLES = ['admin', 'editor'];

    public function index()
    {
        return Inertia::render('Admin/Users', [
            'users' => User::with('roles')->orderBy('name')->get()->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->roles->pluck('name')->intersect(self::ROLES)->first(),
                'created_at' => $u->created_at?->toDateString(),
                'is_me' => $u->id === auth()->id(),
            ]),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'email' => 'required|email|max:160|unique:users,email',
            'role' => ['required', Rule::in(self::ROLES)],
            'password' => ['required', 'confirmed', Password::min(10)],
        ]);

        $user = User::create(['name' => $data['name'], 'email' => $data['email'], 'password' => $data['password']]);
        $user->assignRole(Role::findOrCreate($data['role']));
        Audit::log("Created {$data['role']} account for {$user->name}", $user, [], 'created');

        return back()->with('success', "Account created for {$user->name}. Share the password with them privately; they can change it under their profile.");
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'email' => ['required', 'email', 'max:160', Rule::unique('users', 'email')->ignore($user->id)],
            'role' => ['required', Rule::in(self::ROLES)],
            'password' => ['nullable', 'confirmed', Password::min(10)],
        ]);

        if ($data['role'] !== 'admin' && $user->hasRole('admin') && $this->lastAdmin($user)) {
            return back()->withErrors(['role' => 'This is the only administrator. Make someone else an administrator first.']);
        }

        $user->update(array_filter(['name' => $data['name'], 'email' => $data['email'], 'password' => $data['password'] ?: null]));
        $user->syncRoles([Role::findOrCreate($data['role'])]);
        Audit::log("Updated account of {$user->name} (role: {$data['role']}".($data['password'] ? ', new password' : '').')', $user);

        return back()->with('success', "Account of {$user->name} saved.");
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->withErrors(['user' => 'You cannot delete your own account.']);
        }
        if ($user->hasRole('admin') && $this->lastAdmin($user)) {
            return back()->withErrors(['user' => 'You cannot delete the only administrator.']);
        }

        Audit::log("Deleted the account of {$user->name}", null, [], 'deleted');
        $user->delete();

        return back()->with('success', 'Account deleted.');
    }

    private function lastAdmin(User $user): bool
    {
        return User::role('admin')->where('id', '!=', $user->id)->doesntExist();
    }
}
