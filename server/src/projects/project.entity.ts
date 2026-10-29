import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export const DIVISIONS = ['perfumery', 'technology'] as const;

export interface Photo {
  path: string;
  alt: string;
}

export interface Project {
  id: number;
  slug: string;
  name: string;
  division: (typeof DIVISIONS)[number];
  position: number;
  summary: string;
  index_summary: string | null;
  meta_label: string | null;
  facts: { label: string; value: string }[];
  situation: string;
  constraint_text: string | null;
  result: string;
  decisions: { title: string; body: string }[];
  composition_top: string;
  composition_heart: string;
  composition_base: string;
  images: Photo[];
  cover: number;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
const emptyToNull = ({ value }: { value: unknown }) => {
  const trimmed = typeof value === 'string' ? value.trim() : value;
  return trimmed === '' ? null : trimmed;
};

class FactDto {
  @Transform(trim) @IsString() @MaxLength(40) label: string;
  @Transform(trim) @IsString() @MaxLength(80) value: string;
}

class DecisionDto {
  @Transform(trim) @IsString() @MaxLength(160) title: string;
  @Transform(trim) @IsString() @MaxLength(1200) body: string;
}

class PhotoDto {
  @IsString() @MaxLength(300) path: string;
  @Transform(trim) @IsString() @MaxLength(300) alt: string;
}

export class ProjectDto {
  @Transform(trim)
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, { message: 'Use lowercase letters, numbers and single hyphens.' })
  @MaxLength(80)
  slug: string;

  @Transform(trim) @IsString() @Length(1, 120, { message: 'Give the project a name.' }) name: string;
  @IsIn(DIVISIONS, { message: 'Choose a division.' }) division: (typeof DIVISIONS)[number];
  @Type(() => Number) @IsInt() @Min(1) @Max(999) position: number;
  @Transform(trim) @IsString() @Length(1, 200, { message: 'Write a one-line summary.' }) summary: string;
  @IsOptional() @Transform(emptyToNull) @IsString() @MaxLength(240) index_summary: string | null;
  @IsOptional() @Transform(emptyToNull) @IsString() @MaxLength(80) meta_label: string | null;

  @IsArray() @ArrayMaxSize(8) @ValidateNested({ each: true }) @Type(() => FactDto) facts: FactDto[];

  @Transform(trim) @IsString() @Length(1, 6000, { message: 'Describe the situation.' }) situation: string;
  @IsOptional() @Transform(emptyToNull) @IsString() @MaxLength(6000) constraint_text: string | null;
  @Transform(trim) @IsString() @Length(1, 6000, { message: 'Describe the result.' }) result: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Add at least one decision.' })
  @ArrayMaxSize(8)
  @ValidateNested({ each: true })
  @Type(() => DecisionDto)
  decisions: DecisionDto[];

  @Transform(trim) @IsString() @Length(1, 120) composition_top: string;
  @Transform(trim) @IsString() @Length(1, 120) composition_heart: string;
  @Transform(trim) @IsString() @Length(1, 120) composition_base: string;

  /** The photos to keep, in order. Only paths already stored on the project are accepted. */
  @IsOptional() @IsArray() @ArrayMaxSize(12) @ValidateNested({ each: true }) @Type(() => PhotoDto) images?: PhotoDto[];
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) cover?: number;

  @IsOptional() @Transform(emptyToNull) @IsString() @MaxLength(120) seo_title: string | null;
  @IsOptional() @Transform(emptyToNull) @IsString() @MaxLength(300) seo_description: string | null;
}

/**
 * The file's real type, read from its first bytes. The browser's declared type is
 * not trusted: anything that is not a JPEG, PNG or WebP is refused.
 */
export function sniffPhoto(buffer: Buffer): { mime: string; extension: string } | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return { mime: 'image/jpeg', extension: 'jpg' };
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { mime: 'image/png', extension: 'png' };
  }
  if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    return { mime: 'image/webp', extension: 'webp' };
  }
  return null;
}

/** Keeps only photos already stored on the project, in the requested order and with the new alt text. */
export function keepOwnPhotos(current: Photo[], requested: Photo[] | undefined): Photo[] {
  if (!requested) return current;
  const stored = new Set(current.map((image) => image.path));
  const seen = new Set<string>();
  return requested.filter((image) => stored.has(image.path) && !seen.has(image.path) && seen.add(image.path));
}
