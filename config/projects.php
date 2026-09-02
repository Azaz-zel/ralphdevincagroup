<?php

/*
|--------------------------------------------------------------------------
| Work
|--------------------------------------------------------------------------
|
| Three projects, and every case study is rendered from this array by one
| template. Adding a fourth project means adding a fourth entry here.
|
| `composition` is the signature element: the stack written in the grammar of
| a perfume formula. Top is the layer a person feels directly, heart is the
| logic underneath, base is the foundation that outlasts everything above it.
|
*/

return [

    [
        'slug' => 'ralph-de-vinca-perfumery',
        'number' => '01',
        'name' => 'Ralph de Vinca Perfumery',
        'division' => 'perfumery',
        'eyebrow' => '01 — Perfumery',
        'summary' => 'A fragrance platform built before anyone asked for it.',
        'index_summary' => 'A fragrance platform built before anyone asked for it.',
        'meta_label' => 'Perfumery',
        'meta' => [
            ['label' => 'Division', 'value' => 'Perfumery'],
            ['label' => 'Role', 'value' => 'Design and development'],
            ['label' => 'Status', 'value' => 'Live, ongoing'],
        ],
        'situation' => [
            'Fragrance information online is mostly either marketing copy written by the brands or unstructured opinion in forums. Someone trying to learn what a chypre is, or why an iris note behaves differently in two different houses, has to assemble the answer out of fragments.',
            'Nobody asked for this to be fixed. It was built because the problem was irritating.',
        ],
        'constraint' => [
            'No client, no deadline, and no revenue. That sounds like freedom, but it is its own constraint: nothing external forces a decision, and nothing stops the scope from growing forever. Discipline had to come from inside the project.',
        ],
        'decisions' => [
            [
                'title' => 'Structure before volume.',
                'body' => 'The data model for houses, fragrances, and notes was designed first, and content was added into it afterward. The opposite order — writing pages and normalising later — is why most sites like this never grow past a few dozen entries.',
            ],
            [
                'title' => 'No rankings.',
                'body' => 'Ranking is what turns an information site into a sales channel. Leaving it out costs engagement and protects the one thing that makes the site worth visiting.',
            ],
            [
                'title' => 'Education kept separate from the catalogue.',
                'body' => 'Academy sits apart from the browsing experience. Someone arriving to look one thing up and someone arriving to learn need differently shaped pages, and merging them serves neither.',
            ],
        ],
        'result' => [
            'A working platform covering houses, fragrances, and notes, with a separate education section. It has no revenue and was never intended to have any yet.',
            'What it produced instead is the standard everything else in the group is measured against — and, indirectly, the work that came after it.',
        ],
        'composition' => [
            ['layer' => 'TOP', 'value' => 'Blade · Tailwind CSS'],
            ['layer' => 'HEART', 'value' => 'Laravel · PHP'],
            ['layer' => 'BASE', 'value' => 'MySQL'],
        ],
        'composition_note' => 'Top is the layer a person feels directly. Heart is the logic working underneath. Base is the foundation that outlasts everything above it.',
        'images' => [
            [
                'file' => 'ralph-home',
                'alt' => 'Home page of the Ralph de Vinca Perfumery platform, showing the fragrance discovery entry points.',
            ],
            [
                'file' => 'ralph-detail',
                'alt' => 'The Ralph de Vinca Perfumery platform explaining why fragrance is worth understanding, beside the raw materials a composition is built from.',
            ],
        ],
        'index_image' => [
            'file' => 'ralph-home',
            'alt' => 'Home page of the Ralph de Vinca Perfumery platform.',
        ],
        'title' => 'Ralph de Vinca Perfumery — Work',
        'description' => 'A fragrance platform built with no client and no deadline, and the decisions that kept it in scope.',
    ],

    [
        'slug' => 'bali-cebelok-gesiuh',
        'number' => '02',
        'name' => 'Bali Cebelok Gesiuh',
        'division' => 'technology',
        'eyebrow' => '02 — Technology',
        'summary' => 'A booking platform for a traditional coconut oil experience.',
        'index_summary' => 'A booking platform for a traditional coconut oil experience. The first paid work.',
        'meta_label' => 'Technology · Two weeks',
        'meta' => [
            ['label' => 'Division', 'value' => 'Technology'],
            ['label' => 'Role', 'value' => 'Design and development'],
            ['label' => 'Duration', 'value' => 'Two weeks'],
        ],
        'situation' => [
            'A traditional coconut oil practice, passed down through generations, with no way for a visitor to find it or book it. The knowledge existed. The path to it did not.',
        ],
        'constraint' => [
            'Two weeks, and a first client. A first client is a particular kind of pressure. The scope has to be clear enough that nobody ends up disappointed, and the result has to keep working without ongoing help.',
        ],
        'decisions' => [
            [
                'title' => 'Story before booking.',
                'body' => 'A visitor who does not understand what cebelok gesiuh is will not book it. The page explains first and asks second.',
            ],
            [
                'title' => 'One path through the page.',
                'body' => 'No menu of options and no branching. Bookings for a traditional experience usually come from people who have just discovered it exists, and choice at that moment produces hesitation rather than confidence.',
            ],
            [
                'title' => 'Built to be handed over.',
                'body' => 'The owner is not technical. Anything that would need regular changing was kept out of places that require a developer to reach.',
            ],
        ],
        'result' => [
            'A live platform that introduces the experience and takes bookings. First paid work, delivered in two weeks.',
        ],
        'composition' => [
            ['layer' => 'TOP', 'value' => 'Blade · Tailwind CSS'],
            ['layer' => 'HEART', 'value' => 'Laravel · PHP'],
            ['layer' => 'BASE', 'value' => 'MySQL'],
        ],
        'composition_note' => 'Top is the layer a person feels directly. Heart is the logic working underneath. Base is the foundation that outlasts everything above it.',
        'images' => [
            [
                'file' => 'balicebelok',
                'alt' => 'Bali Cebelok Gesiuh home page, introducing the traditional coconut oil experience.',
            ],
            [
                'file' => 'cebelok-story',
                'alt' => 'The story section of Bali Cebelok Gesiuh, introducing the family whose tradition the experience comes from.',
            ],
        ],
        'index_image' => [
            'file' => 'balicebelok',
            'alt' => 'Bali Cebelok Gesiuh home page.',
        ],
        'title' => 'Bali Cebelok Gesiuh — Work',
        'description' => 'A booking platform for a traditional Balinese coconut oil experience, delivered in two weeks.',
    ],

    [
        'slug' => 'pkkmb-instiki',
        'number' => '03',
        'name' => 'PKKMB INSTIKI 2026',
        'division' => 'technology',
        'eyebrow' => '03 — Technology',
        'summary' => 'A centralised attendance system for a campus orientation.',
        'index_summary' => 'An attendance system for a campus orientation, built in the time that was left.',
        'meta_label' => 'Technology · One week',
        'meta' => [
            ['label' => 'Division', 'value' => 'Technology'],
            ['label' => 'Role', 'value' => 'Design and development'],
            ['label' => 'Duration', 'value' => 'One week'],
        ],
        'situation' => [
            'PKKMB is a campus orientation involving hundreds of students, spread across many classes and sessions over several days. Attendance was recorded on paper and reconciled by hand afterward: slow while it was happening, and slower once it was over.',
        ],
        'constraint' => [
            'The committee began work on 20 August. The event started on 4 September. Fifteen days, and the system had to be correct on the first morning, because there is no second attempt at an orientation week.',
        ],
        'decisions' => [
            [
                'title' => 'Roles before features.',
                'body' => 'Two roles, admin and session PJ, were defined before any screen was designed. Access rules retrofitted onto a finished interface are where systems like this usually break.',
            ],
            [
                'title' => 'Session PJs see every session at once.',
                'body' => 'The obvious design asks a PJ to choose a session before doing anything. In a crowded hall with students waiting, an extra navigation step is a real cost. The selector was removed for PJs and kept for admins, who genuinely need it.',
            ],
            [
                'title' => 'Attendance recorded as it happens.',
                'body' => 'Marking is done live rather than typed up later. This removes the reconciliation step entirely, which was the slowest part of the old process.',
            ],
            [
                'title' => 'Automated tests on the access rules.',
                'body' => 'With no time for thorough manual checking, the role-based rules were covered by tests. Those rules are where a mistake would do the most damage and be the hardest to notice.',
            ],
        ],
        'result' => [
            'A centralised system managing students, classes, attendance sessions, and administrative roles, used across the event. Paper recording and the manual reconciliation that followed it were removed.',
        ],
        'composition' => [
            ['layer' => 'TOP', 'value' => 'Blade · Tailwind CSS'],
            ['layer' => 'HEART', 'value' => 'Laravel · PHP'],
            ['layer' => 'BASE', 'value' => 'MySQL'],
        ],
        'composition_note' => 'Top is the layer a person feels directly. Heart is the logic working underneath. Base is the foundation that outlasts everything above it.',
        'images' => [
            [
                'file' => 'absensi-mahasiswa',
                'alt' => 'An attendance session in the PKKMB INSTIKI 2026 system, listing one class for live marking. Student names and ID numbers are obscured.',
            ],
        ],
        'index_image' => [
            'file' => 'absensi-mahasiswa',
            'alt' => 'An attendance session in the PKKMB INSTIKI 2026 system, with student names and ID numbers obscured.',
        ],
        'title' => 'PKKMB INSTIKI 2026 — Work',
        'description' => 'A centralised attendance system for a campus orientation, built in the fifteen days available.',
    ],

];
