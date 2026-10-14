<?php

/*
|--------------------------------------------------------------------------
| Divisions
|--------------------------------------------------------------------------
|
| The two divisions of the group. `accent` selects the colour a division is
| allowed to use: brass for Technology, vinca for Perfumery. The only place
| both accents appear together is the two-division section on the home page.
|
*/

return [

    'perfumery' => [
        'key' => 'perfumery',
        'name' => 'Ralph de Vinca Perfumery',
        'short_name' => 'Perfumery',
        'accent' => 'vinca',
        'route' => 'perfumery',
        'eyebrow' => 'Ralph de Vinca Perfumery',
        'summary' => 'A platform for understanding fragrance: houses, notes, and how a composition unfolds over the hours it is worn. Built from an interest, and kept free of anything for sale.',
        'link_label' => 'Enter Perfumery',
    ],

    'technology' => [
        'key' => 'technology',
        'name' => 'Ralph de Vinca Technology',
        'short_name' => 'Technology',
        'accent' => 'brass',
        'route' => 'technology',
        'eyebrow' => 'Ralph de Vinca Technology',
        'summary' => 'Websites and internal systems for businesses and institutions. Built so the decisions hold, and nothing has to be torn down halfway.',
        'link_label' => 'Enter Technology',
    ],

];
