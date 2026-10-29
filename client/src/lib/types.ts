export type Division = 'perfumery' | 'technology';

export interface Photo {
  path: string;
  alt: string;
  url: string;
}

export interface ProjectSummary {
  id: number;
  slug: string;
  name: string;
  division: Division;
  summary: string;
  index_summary: string | null;
  meta_label: string | null;
  cover: { url: string; alt: string } | null;
}

export interface Project {
  id: number;
  slug: string;
  name: string;
  division: Division;
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
}

export interface CaseStudy extends Project {
  number: number;
  next: { slug: string; name: string; number: number } | null;
}

export type InquiryStatus = 'new' | 'read' | 'replied' | 'archived';

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  division: Division | 'unsure';
  message: string;
  status: InquiryStatus;
  ip_address?: string | null;
  user_agent?: string | null;
  read_at?: string | null;
  replied_at?: string | null;
  created_at: string;
}

export interface InboxResponse {
  items: Inquiry[];
  counts: Record<InquiryStatus, number>;
  total: number;
  filter: InquiryStatus | null;
  q: string;
}
