<x-mail::message>
@foreach ($paragraphs as $paragraph)
{{ $paragraph }}

@endforeach
@if ($reference)
<x-mail::panel>
**{{ $reference }}**
</x-mail::panel>
@endif

@foreach ($signoff as $line)
{{ $line }}<br>
@endforeach
</x-mail::message>
