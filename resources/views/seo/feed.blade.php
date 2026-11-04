{!! '<'.'?xml version="1.0" encoding="UTF-8"?'.'>' !!}
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/" xmlns:dc="http://purl.org/dc/elements/1.1/">
    <channel>
        <title>{{ $site['site_name'] ?? config('app.name') }}</title>
        <link>{{ url('/') }}</link>
        <atom:link href="{{ route('feed') }}" rel="self" type="application/rss+xml"/>
        <description>{{ \App\Support\Meta::clean($site['meta_description'] ?? '') }}</description>
        <language>en</language>
        <lastBuildDate>{{ $updated->toRssString() }}</lastBuildDate>
        <image>
            <url>{{ asset('images/crest.png') }}</url>
            <title>{{ $site['site_name'] ?? config('app.name') }}</title>
            <link>{{ url('/') }}</link>
        </image>
@foreach ($items as $item)
        <item>
            <title>{{ $item['title'] }}</title>
            <link>{{ $item['url'] }}</link>
            <guid isPermaLink="true">{{ $item['url'] }}</guid>
            <pubDate>{{ \Illuminate\Support\Carbon::parse($item['date'])->toRssString() }}</pubDate>
            <category>{{ $item['category'] }}</category>
@if (! empty($item['author']))
            <dc:creator>{{ $item['author'] }}</dc:creator>
@endif
            <description>{{ \App\Support\Meta::clean($item['text'], 300) }}</description>
@if ($item['image'])
            <media:content url="{{ asset('uploads/'.$item['image']) }}" medium="image"/>
@endif
        </item>
@endforeach
    </channel>
</rss>
