<?php

namespace App\Support;

use GdImage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Turns an uploaded screenshot into the set of files <x-figure> expects:
 * {name}.{jpg,webp} at full width and {name}-{800,1200,1600}w.{jpg,webp}.
 *
 * Every file is re-encoded by GD, never copied. That strips metadata and
 * leaves nothing of the upload's original bytes on a public path.
 */
class Screenshots
{
    public const WIDTHS = [800, 1200, 1600];

    public const DISK = 'work';

    /**
     * Public path of one size of a screenshot, relative to the site root.
     * Uploads live behind the storage link; shipped ones in images/work.
     */
    public static function path(string $file, bool $uploaded, string $suffix = '.jpg'): string
    {
        return ($uploaded ? 'storage/work/' : 'images/work/').basename($file).$suffix;
    }

    /**
     * @return array{file: string, width: int, height: int, uploaded: true}
     */
    public function store(UploadedFile $upload, string $slug): array
    {
        $source = $this->open($upload->getRealPath());
        $width = imagesx($source);
        $height = imagesy($source);

        // Server-chosen name: nothing from the client reaches the filesystem.
        $name = Str::limit($slug, 60, '').'-'.Str::lower(Str::random(8));
        $disk = Storage::disk(self::DISK);

        foreach (self::WIDTHS as $target) {
            $scaled = $this->scale($source, $width, $height, $target);

            foreach (['jpg', 'webp'] as $format) {
                $bytes = $this->encode($scaled, $format);
                $disk->put("{$name}-{$target}w.{$format}", $bytes);

                if ($target === max(self::WIDTHS)) {
                    $disk->put("{$name}.{$format}", $bytes);
                }
            }

            imagedestroy($scaled);
        }

        imagedestroy($source);

        $full = max(self::WIDTHS);

        return [
            'file' => $name,
            'width' => $full,
            'height' => (int) round($height * $full / $width),
            'uploaded' => true,
        ];
    }

    /**
     * Removes every size of an uploaded screenshot. Screenshots that ship with
     * the repository are never touched, so deleting a seeded project cannot
     * break the share images other pages point at.
     *
     * @param  array<string, mixed>  $image
     */
    public function delete(array $image): void
    {
        if (empty($image['uploaded']) || ! is_string($image['file'] ?? null)) {
            return;
        }

        $name = basename($image['file']);
        $files = [];

        foreach (['jpg', 'webp'] as $format) {
            $files[] = "{$name}.{$format}";

            foreach (self::WIDTHS as $width) {
                $files[] = "{$name}-{$width}w.{$format}";
            }
        }

        Storage::disk(self::DISK)->delete($files);
    }

    private function open(string $path): GdImage
    {
        $type = @getimagesize($path)[2] ?? null;

        $image = match ($type) {
            IMAGETYPE_JPEG => @imagecreatefromjpeg($path),
            IMAGETYPE_PNG => @imagecreatefrompng($path),
            IMAGETYPE_WEBP => @imagecreatefromwebp($path),
            default => false,
        };

        if (! $image instanceof GdImage) {
            throw new RuntimeException('The file could not be read as an image.');
        }

        return $image;
    }

    private function scale(GdImage $source, int $width, int $height, int $target): GdImage
    {
        // Never upscale: validation already requires the full width.
        $target = min($target, $width);
        $targetHeight = max(1, (int) round($height * $target / $width));

        $canvas = imagecreatetruecolor($target, $targetHeight);

        // Transparent PNG areas become paper rather than black in the JPEG.
        imagefill($canvas, 0, 0, imagecolorallocate($canvas, 247, 245, 240));
        imagecopyresampled($canvas, $source, 0, 0, 0, 0, $target, $targetHeight, $width, $height);

        return $canvas;
    }

    private function encode(GdImage $image, string $format): string
    {
        ob_start();

        $ok = $format === 'webp' ? imagewebp($image, null, 82) : imagejpeg($image, null, 84);

        $bytes = ob_get_clean();

        if (! $ok || $bytes === false || $bytes === '') {
            throw new RuntimeException("The screenshot could not be saved as {$format}.");
        }

        return $bytes;
    }
}
