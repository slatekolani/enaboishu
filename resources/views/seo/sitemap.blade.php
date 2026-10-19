{!! '<'.'?xml version="1.0" encoding="UTF-8"?'.'>' !!}
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
@foreach ($urls as $u)
    <url>
        <loc>{{ $u['loc'] }}</loc>
        <xhtml:link rel="alternate" hreflang="en" href="{{ $u['loc'] }}?lang=en"/>
        <xhtml:link rel="alternate" hreflang="sw" href="{{ $u['loc'] }}?lang=sw"/>
        <xhtml:link rel="alternate" hreflang="x-default" href="{{ $u['loc'] }}"/>
@if ($u['lastmod'])
        <lastmod>{{ $u['lastmod'] }}</lastmod>
@endif
        <changefreq>{{ $u['freq'] }}</changefreq>
        <priority>{{ $u['priority'] }}</priority>
    </url>
@endforeach
</urlset>
