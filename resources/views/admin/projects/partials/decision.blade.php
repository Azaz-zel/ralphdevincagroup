<div class="flex flex-col gap-3 border-t border-line py-5 first:border-t-0 first:pt-0" data-repeat-row>
    <div class="flex items-center justify-between gap-3">
        <label for="decision-title-{{ $i }}" class="field-label !mb-0">Decision</label>
        <button type="button" class="icon-button needs-js" aria-label="Remove this decision" data-repeat-remove>
            <svg width="18" height="18" viewBox="0 0 256 256" aria-hidden="true"><path d="M64 64l128 128M192 64L64 192" fill="none" stroke="currentColor" stroke-width="16" stroke-linecap="round"/></svg>
        </button>
    </div>
    <input id="decision-title-{{ $i }}" name="decisions[{{ $i }}][title]" type="text" value="{{ $decision['title'] ?? '' }}" maxlength="160" placeholder="Story before booking." class="field{{ $errors->has("decisions.{$i}.title") ? ' field-error' : '' }}" @error("decisions.{$i}.title") aria-invalid="true" aria-describedby="decision-title-{{ $i }}-error" @enderror>
    @error("decisions.{$i}.title") <p id="decision-title-{{ $i }}-error" class="error-text">{{ $message }}</p> @enderror

    <label for="decision-body-{{ $i }}" class="field-label !mb-0">Why</label>
    <textarea id="decision-body-{{ $i }}" name="decisions[{{ $i }}][body]" rows="3" maxlength="2000" class="field{{ $errors->has("decisions.{$i}.body") ? ' field-error' : '' }}" @error("decisions.{$i}.body") aria-invalid="true" aria-describedby="decision-body-{{ $i }}-error" @enderror>{{ $decision['body'] ?? '' }}</textarea>
    @error("decisions.{$i}.body") <p id="decision-body-{{ $i }}-error" class="error-text">{{ $message }}</p> @enderror
</div>
