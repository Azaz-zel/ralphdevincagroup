<?php

/*
|--------------------------------------------------------------------------
| Site content and brand facts
|--------------------------------------------------------------------------
|
| Every fact the site is allowed to state lives here or in config/divisions.php
| and config/projects.php. Nothing factual is written directly into a Blade
| view, so a change is made in one place and cannot drift between pages.
|
*/

return [

    'name' => 'Ralph de Vinca Group',
    'wordmark' => 'Ralph de Vinca',
    'wordmark_line' => 'GROUP',
    'tagline' => 'Wisdom that binds, and endures.',
    'thesis' => 'Things that are not seen, but felt.',
    'location' => 'Bali, Indonesia',
    'email' => env('SITE_CONTACT_EMAIL', 'mangadrian2@gmail.com'),

    /*
    | Outbound links. Empty string hides the link rather than shipping a dead one.
    */
    'links' => [
        'portfolio' => env('SITE_PORTFOLIO_URL', 'http://portofolio.test'),
        'perfumery' => env('SITE_PERFUMERY_URL', 'http://ralphdevincaperfumary.test'),
    ],

    'founder' => [
        'name' => 'Adrian',
        'location' => 'Bali, Indonesia',
        'study' => 'Informatics at INSTIKI, with a focus on data and information management',
    ],

    /*
    | The four principles, taken from the name itself. Used on Home and About,
    | which the copy deck requires to be word-for-word identical.
    */
    'principles' => [
        [
            'name' => 'Composition',
            'body' => 'Nothing is made of a single ingredient. Everything is layers that resolve into one impression. This is as true of a system as it is of a scent.',
        ],
        [
            'name' => 'Precision',
            'body' => 'From <em>rād</em>, counsel. Decisions are made by weighing them, not by moving quickly. This is what separates work that was thought through from work that was copied.',
        ],
        [
            'name' => 'Binding',
            'body' => 'From <em>vincire</em>, to bind. The goal is not to be visited once. It is to be worth returning to.',
        ],
        [
            'name' => 'Endurance',
            'body' => 'From the vinca plant, which grows in shade, spreads slowly, and is almost impossible to kill. The opposite of burning bright and going out.',
        ],
    ],

    /*
    | The signature Composition element in the Home hero. Three layers, revealed
    | in order, in the grammar a perfume formula is written in.
    */
    'composition' => [
        ['layer' => 'TOP', 'value' => 'Perfumery · Technology'],
        ['layer' => 'HEART', 'value' => 'Composition, Precision, Binding, Endurance'],
        ['layer' => 'BASE', 'value' => 'Things that are not seen, but felt'],
    ],

    /*
    | Per-route meta, resolved in the layout by route name.
    */
    'meta' => [
        'home' => [
            'title' => 'Ralph de Vinca Group | Fragrance and software, built in Bali',
            'description' => 'An independent group with two divisions: a fragrance platform and a software practice. Both build things that are not seen, but felt.',
            'image' => 'images/work/ralph-home.jpg',
        ],
        'about' => [
            'title' => 'The Group | Ralph de Vinca',
            'description' => 'The name, the thinking behind it, and how a group that covers fragrance and software came to exist.',
            'image' => 'images/work/ralph-home.jpg',
        ],
        'perfumery' => [
            'title' => 'Perfumery | Ralph de Vinca Group',
            'description' => 'A platform for understanding fragrance: houses, notes, and how a composition unfolds. Explained rather than sold.',
            'image' => 'images/work/ralph-detail.jpg',
        ],
        'technology' => [
            'title' => 'Technology | Ralph de Vinca Group',
            'description' => 'Websites and internal systems for businesses and institutions in Bali, built so the decisions hold.',
            'image' => 'images/work/absensi-mahasiswa.jpg',
        ],
        'work' => [
            'title' => 'Work | Ralph de Vinca Group',
            // WorkController supplies the real description with the count derived;
            // this is only the fallback if the page is ever rendered without it.
            'description' => 'Projects across fragrance and software, with the decisions behind each one.',
            'image' => 'images/work/balicebelok.jpg',
        ],
        'contact' => [
            'title' => 'Contact | Ralph de Vinca Group',
            'description' => 'Describe the problem and get a direct reply within two working days.',
            'image' => 'images/work/ralph-home.jpg',
        ],
        'privacy' => [
            'title' => 'Privacy | Ralph de Vinca Group',
            'description' => 'What this site collects, why, and how to have it removed.',
            'image' => 'images/work/ralph-home.jpg',
        ],
    ],

    'privacy_updated' => 'September 2026',

    /*
    | Words from real clients, shown on the home page. The block stays hidden
    | while this is empty: a quote is only ever added once it was really said.
    | Each entry: ['quote' => '...', 'name' => '...', 'role' => '...', 'project' => '...'].
    */
    'testimonials' => [],

];
