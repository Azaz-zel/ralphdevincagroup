import { Transform } from 'class-transformer';
import { IsEmail, IsIn, IsOptional, IsString, Length, MaxLength } from 'class-validator';

export const STATUSES = ['new', 'read', 'replied', 'archived'] as const;
export const DIVISIONS = ['perfumery', 'technology', 'unsure'] as const;

export type InquiryStatus = (typeof STATUSES)[number];

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  division: (typeof DIVISIONS)[number];
  message: string;
  status: InquiryStatus;
  ip_address: string | null;
  user_agent: string | null;
  read_at: string | null;
  replied_at: string | null;
  created_at: string;
}

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class CreateInquiryDto {
  @Transform(trim)
  @IsString()
  @Length(1, 120, { message: 'Enter your name, so the reply can be addressed to you.' })
  name: string;

  @Transform(trim)
  @IsEmail({}, { message: 'Enter an email address in the format name@example.com.' })
  @MaxLength(254)
  email: string;

  @IsOptional()
  @IsIn(DIVISIONS)
  division?: (typeof DIVISIONS)[number];

  @Transform(trim)
  @IsString()
  @Length(1, 5000, { message: 'Write a message of up to 5,000 characters.' })
  message: string;

  /** Honeypot: hidden from people, filled in by bots. */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  company_website?: string;
}

export class UpdateStatusDto {
  @IsIn(STATUSES)
  status: InquiryStatus;
}

/** Makes a search term safe to place inside a quoted PostgREST filter value. */
export function toSearchTerm(q: unknown): string {
  return typeof q === 'string' ? q.replace(/["\\*]/g, '').trim().slice(0, 100) : '';
}
