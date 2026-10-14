@props([
    'layers' => [],
    'note' => null,
    'staged' => false,
    'label' => 'Written as a perfume formula',
])

{{--
    The signature element. A perfume formula is written in three layers, and so
    is a system: top is what a person meets first, heart is the logic working
    underneath, base is the foundation that outlasts both. It is held in a
    flacon of glass, because that is what holds a formula.

    `staged` fills the layers in order and is used once, in the home hero.
--}}

<div {{ $attributes->merge(['class' => 'flacon']) }} role="group" aria-label="{{ $label }}">

    <div class="flacon-cap glass" aria-hidden="true"></div>
    <div class="flacon-neck" aria-hidden="true"></div>

    <div class="flacon-body glass">
        <dl class="composition {{ $staged ? 'composition-staged' : '' }}">
            @foreach ($layers as $layer)
                <div class="composition-row">
                    <dt class="composition-layer">{{ $layer['layer'] }}</dt>
                    <dd class="composition-value m-0">{{ $layer['value'] }}</dd>
                </div>
            @endforeach
        </dl>
        <div class="flacon-sheen" aria-hidden="true"></div>
    </div>

</div>

@if ($note)
    <p class="small muted measure-narrow mt-5 text-center">{{ $note }}</p>
@endif
