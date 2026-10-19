<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ $meta['title'] }}</title>
        <meta name="description" content="{{ $meta['description'] }}" inertia="description">
        <meta name="robots" content="{{ $meta['robots'] }}">
        <link rel="canonical" href="{{ $meta['url'] }}">
@foreach ($meta['alternates'] as $alt)
        <link rel="alternate" hreflang="{{ $alt['hreflang'] }}" href="{{ $alt['href'] }}">
@endforeach
@foreach ($meta['verification'] as $name => $code)
        <meta name="{{ $name }}" content="{{ $code }}">
@endforeach

        <!-- Link previews (WhatsApp, Facebook, X, LinkedIn) -->
        <meta property="og:type" content="{{ $meta['type'] }}">
        <meta property="og:site_name" content="{{ $meta['site_name'] }}">
        <meta property="og:title" content="{{ $meta['title'] }}">
        <meta property="og:description" content="{{ $meta['description'] }}">
        <meta property="og:image" content="{{ $meta['image'] }}">
@if ($meta['image_size'])
        <meta property="og:image:width" content="{{ $meta['image_size']['width'] }}">
        <meta property="og:image:height" content="{{ $meta['image_size']['height'] }}">
        <meta property="og:image:type" content="image/jpeg">
        <meta property="og:image:alt" content="{{ $meta['image_size']['alt'] }}">
@endif
        <meta property="og:url" content="{{ $meta['url'] }}">
        <meta property="og:locale" content="{{ $meta['locale'] }}">
        <meta property="og:locale:alternate" content="{{ $meta['locale'] === 'sw_TZ' ? 'en_GB' : 'sw_TZ' }}">
@if ($meta['published'])
        <meta property="article:published_time" content="{{ $meta['published'] }}">
@endif
@if ($meta['modified'])
        <meta property="article:modified_time" content="{{ $meta['modified'] }}">
@endif
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ $meta['title'] }}">
        <meta name="twitter:description" content="{{ $meta['description'] }}">
        <meta name="twitter:image" content="{{ $meta['image'] }}">

        <!-- Icons -->
        <link rel="icon" href="{{ $meta['icons']['favicon.ico'] }}" sizes="48x48">
        <link rel="icon" type="image/png" sizes="32x32" href="{{ $meta['icons']['favicon-32x32.png'] }}">
        <link rel="icon" type="image/png" sizes="16x16" href="{{ $meta['icons']['favicon-16x16.png'] }}">
        <link rel="apple-touch-icon" sizes="180x180" href="{{ $meta['icons']['apple-touch-icon.png'] }}">
        <link rel="manifest" href="{{ route('manifest') }}">
        <meta name="theme-color" content="{{ $meta['theme'] }}">
        <meta name="application-name" content="{{ $meta['site_name'] }}">
        <meta name="apple-mobile-web-app-title" content="{{ $meta['site_name'] }}">

@foreach ($meta['jsonld'] as $schema)
        <script type="application/ld+json">{!! json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP) !!}</script>
@endforeach

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=cormorant-garamond:500,500i,600,600i,700|source-sans-3:400,500,600,700&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans">
        @inertia
    </body>
</html>
