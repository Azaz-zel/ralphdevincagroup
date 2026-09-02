@props([
    'title' => null,
    'description' => null,
    'image' => null,
    'bodyClass' => '',
])

@php
    $routeName = request()->route()?->getName();
    $defaults = config('site.meta.'.$routeName, []);

    $pageTitle = $title ?? ($defaults['title'] ?? config('site.name'));
    $pageDescription = $description ?? ($defaults['description'] ?? config('site.tagline'));
    $pageImage = asset($image ?? ($defaults['image'] ?? 'images/work/ralph-home.jpg'));
@endphp

<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    {{-- Set before paint, so the reveal styles never hide content from a
         visitor without JavaScript. --}}
    <script>document.documentElement.classList.add('js');</script>

    <title>{{ $pageTitle }}</title>

    <meta name="description" content="{{ $pageDescription }}">
    <link rel="canonical" href="{{ url()->current() }}">
    <meta name="theme-color" content="#1B1A17">

    <link rel="icon" type="image/svg+xml" href="{{ asset('favicon.svg') }}">
    <link rel="alternate icon" href="{{ asset('favicon.ico') }}">

    <meta property="og:type" content="website">
    <meta property="og:site_name" content="{{ config('site.name') }}">
    <meta property="og:url" content="{{ url()->current() }}">
    <meta property="og:title" content="{{ $pageTitle }}">
    <meta property="og:description" content="{{ $pageDescription }}">
    <meta property="og:image" content="{{ $pageImage }}">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ $pageTitle }}">
    <meta name="twitter:description" content="{{ $pageDescription }}">
    <meta name="twitter:image" content="{{ $pageImage }}">

    {{ Vite::fonts() }}

    @vite(['resources/css/app.css', 'resources/js/app.js'])

</head>

<body class="{{ $bodyClass }}">

    <a class="skip-link" href="#main">Skip to content</a>

    <x-navbar />

    <main id="main">
        {{ $slot }}
    </main>

    <x-footer />

</body>

</html>
