@props([
    'layers' => [],
    'note' => null,
    'staged' => false,
])

{{--
    The signature element. A perfume formula is written in three layers, and so
    is a system: top is what a person meets first, heart is the logic working
    underneath, base is the foundation that outlasts both.

    `staged` reveals the layers in order and is used once, in the home hero.
--}}

<div {{ $attributes->merge(['class' => 'composition' . ($staged ? ' composition-staged' : '')]) }}>

    <dl class="contents">
        @foreach ($layers as $layer)
            <div class="composition-row">
                <dt class="composition-layer">{{ $layer['layer'] }}</dt>
                <dd class="composition-value m-0">{{ $layer['value'] }}</dd>
            </div>
        @endforeach
    </dl>

</div>

@if ($note)
    <p class="small muted measure-narrow mt-4">{{ $note }}</p>
@endif
