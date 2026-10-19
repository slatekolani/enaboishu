<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Support\Audit;
use Inertia\Inertia;

class MessageController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Messages', [
            'messages' => Message::latest()->get(),
        ]);
    }

    public function read(Message $message)
    {
        $message->update(['read_at' => $message->read_at ?? now()]);

        return back();
    }

    public function destroy(Message $message)
    {
        Audit::log('Deleted a message from “'.$message->name.'”', null, [], 'deleted');
        $message->delete();

        return back()->with('success', 'Message deleted.');
    }
}
