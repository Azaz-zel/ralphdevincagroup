{{-- One slot: a file and the sentence that describes it. Without JavaScript
     there is one slot per save; with it, "Add another" adds more. --}}
<div class="flex flex-col gap-3 rounded-[20px] border border-dashed border-[rgb(27_26_23/0.28)] bg-white/30 p-4" data-repeat-row>
    <img alt="" class="shot-thumb max-w-[8.5rem]" width="136" height="68" hidden data-preview-image>
    <div>
        <label for="upload-{{ $i }}" class="field-label">Screenshot file</label>
        <input id="upload-{{ $i }}" name="uploads[{{ $i }}]" type="file" accept="image/jpeg,image/png,image/webp" class="block w-full text-[0.9375rem] file:mr-4 file:min-h-11 file:cursor-pointer file:rounded-full file:border-0 file:bg-ink file:px-5 file:text-paper" data-preview @error("uploads.{$i}") aria-invalid="true" aria-describedby="upload-{{ $i }}-error" @enderror>
        @error("uploads.{$i}") <p id="upload-{{ $i }}-error" class="error-text">{{ $message }}</p> @enderror
    </div>
    <div>
        <label for="upload-alt-{{ $i }}" class="field-label">Description for screen readers</label>
        <input id="upload-alt-{{ $i }}" name="upload_alts[{{ $i }}]" type="text" maxlength="300" placeholder="What the screenshot shows, in one sentence." class="field{{ $errors->has("upload_alts.{$i}") ? ' field-error' : '' }}" @error("upload_alts.{$i}") aria-invalid="true" aria-describedby="upload-alt-{{ $i }}-error" @enderror>
        @error("upload_alts.{$i}") <p id="upload-alt-{{ $i }}-error" class="error-text">{{ $message }}</p> @enderror
    </div>
    <div class="flex flex-wrap items-center justify-between gap-2">
        <label class="flex min-h-11 cursor-pointer items-center gap-2.5 text-[0.9375rem]">
            <input type="radio" name="cover" value="new:{{ $i }}" @checked($first && ($cover === null || $cover === 'new:0'))>
            Cover image
        </label>
        <button type="button" class="add-button needs-js" data-repeat-remove>Remove this slot</button>
    </div>
</div>
