<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Enquiry;
use App\Support\Audit;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class EnquiryController extends Controller
{
    public function index(Request $request)
    {
        $status = in_array($request->query('status'), Enquiry::STATUSES, true) ? $request->query('status') : null;
        $search = trim((string) $request->query('q'));

        $enquiries = Enquiry::query()
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($search, fn ($q) => $q->where(fn ($w) => $w
                ->where('reference', 'like', "%{$search}%")
                ->orWhere('student_name', 'like', "%{$search}%")
                ->orWhere('guardian_name', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%")))
            ->latest()
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Admin/Enquiries', [
            'enquiries' => $enquiries,
            'statuses' => Enquiry::STATUSES,
            'counts' => Enquiry::selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status'),
            'filters' => ['status' => $status, 'q' => $search, 'open' => (int) $request->query('open')],
        ]);
    }

    public function update(Request $request, Enquiry $enquiry)
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(Enquiry::STATUSES)],
            'notes' => 'nullable|string|max:5000',
        ]);

        $from = $enquiry->status;
        if ($from !== $data['status']) {
            $data['status_changed_at'] = now();
        }
        $enquiry->update($data);

        Audit::log(
            $from !== $data['status']
                ? "Moved enquiry {$enquiry->reference} from “{$from}” to “{$data['status']}”"
                : "Updated notes on enquiry {$enquiry->reference}",
            $enquiry,
        );

        return back()->with('success', "Enquiry {$enquiry->reference} saved.");
    }

    public function destroy(Enquiry $enquiry)
    {
        Audit::log("Deleted enquiry {$enquiry->reference} ({$enquiry->student_name})", null, [], 'deleted');
        $enquiry->delete();

        return redirect()->route('admin.enquiries')->with('success', 'Enquiry deleted.');
    }

    /** All enquiries (or one status) as a spreadsheet file (CSV, opens in Excel). */
    public function export(Request $request): StreamedResponse
    {
        $status = in_array($request->query('status'), Enquiry::STATUSES, true) ? $request->query('status') : null;
        Audit::log('Exported admission enquiries'.($status ? " ({$status})" : ''), null, [], 'exported');

        $columns = [
            'reference' => 'Reference', 'created_at' => 'Received', 'status' => 'Status', 'student_name' => 'Student',
            'gender' => 'Gender', 'date_of_birth' => 'Date of birth', 'class_applying' => 'Class applying for',
            'current_school' => 'Current school', 'guardian_name' => 'Parent / guardian', 'relationship' => 'Relationship',
            'phone' => 'Phone', 'email' => 'Email', 'address' => 'Home area', 'heard_from' => 'Heard about us from',
            'message' => 'Message', 'notes' => 'Office notes',
        ];

        return response()->streamDownload(function () use ($columns, $status) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF"); // so Excel reads Kiswahili and other characters correctly
            fputcsv($out, array_values($columns));
            Enquiry::when($status, fn ($q) => $q->where('status', $status))->latest()->chunk(200, function ($rows) use ($out, $columns) {
                foreach ($rows as $row) {
                    fputcsv($out, array_map(function ($key) use ($row) {
                        $value = $row->{$key};
                        $value = $value instanceof \DateTimeInterface ? $value->format($key === 'created_at' ? 'Y-m-d H:i' : 'Y-m-d') : (string) $value;
                        // Stop spreadsheet programs treating a cell as a formula.
                        return preg_match('/^[=+\-@]/', $value) ? "'".$value : $value;
                    }, array_keys($columns)));
                }
            });
            fclose($out);
        }, 'admission-enquiries-'.now()->format('Y-m-d').'.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }
}
