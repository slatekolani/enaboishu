<x-mail::message>
# {{ $heading }}

<x-mail::table>
| | |
|:--|:--|
@foreach ($details as $label => $value)
@if (filled($value))
| **{{ $label }}** | {{ str_replace(["\r", "\n", '|'], [' ', ' ', '/'], $value) }} |
@endif
@endforeach
</x-mail::table>

<x-mail::button :url="$actionUrl">
{{ $actionLabel }}
</x-mail::button>

This alert was sent by the {{ config('app.name') }} website.
</x-mail::message>
