<div class="repeat-row" data-repeat-row>
    <div class="repeat-label">
        <label for="fact-label-{{ $i }}" class="field-label">Label</label>
        <input id="fact-label-{{ $i }}" name="facts[{{ $i }}][label]" type="text" value="{{ $fact['label'] ?? '' }}" maxlength="40" class="field{{ $errors->has("facts.{$i}.label") ? ' field-error' : '' }}" @error("facts.{$i}.label") aria-invalid="true" aria-describedby="fact-label-{{ $i }}-error" @enderror>
        @error("facts.{$i}.label") <p id="fact-label-{{ $i }}-error" class="error-text">{{ $message }}</p> @enderror
    </div>
    <div>
        <label for="fact-value-{{ $i }}" class="field-label">Value</label>
        <input id="fact-value-{{ $i }}" name="facts[{{ $i }}][value]" type="text" value="{{ $fact['value'] ?? '' }}" maxlength="120" class="field{{ $errors->has("facts.{$i}.value") ? ' field-error' : '' }}" @error("facts.{$i}.value") aria-invalid="true" aria-describedby="fact-value-{{ $i }}-error" @enderror>
        @error("facts.{$i}.value") <p id="fact-value-{{ $i }}-error" class="error-text">{{ $message }}</p> @enderror
    </div>
    <button type="button" class="icon-button needs-js" aria-label="Remove this fact" data-repeat-remove>
        <svg width="18" height="18" viewBox="0 0 256 256" aria-hidden="true"><path d="M64 64l128 128M192 64L64 192" fill="none" stroke="currentColor" stroke-width="16" stroke-linecap="round"/></svg>
    </button>
</div>
