import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SUPABASE, must, type Db } from '../supabase.js';
import { type CreateInquiryDto, type Inquiry, type InquiryStatus, STATUSES, toSearchTerm } from './inquiry.entity.js';

const LIST_COLUMNS = 'id, name, email, division, message, status, created_at';

@Injectable()
export class InquiriesService {
  constructor(@Inject(SUPABASE) private readonly db: Db) {}

  async create(dto: CreateInquiryDto, meta: { ip?: string; userAgent?: string }): Promise<void> {
    must(
      await this.db.from('inquiries').insert({
        name: dto.name,
        email: dto.email,
        division: dto.division ?? 'unsure',
        message: dto.message,
        ip_address: meta.ip ?? null,
        user_agent: meta.userAgent?.slice(0, 500) ?? null,
      }),
    );
  }

  async list(status?: string, q?: string) {
    // shortcut: newest 200 only, no paging; add paging if the inbox ever outgrows that.
    let query = this.db.from('inquiries').select(LIST_COLUMNS).order('created_at', { ascending: false }).limit(200);
    const filter = STATUSES.includes(status as InquiryStatus) ? (status as InquiryStatus) : null;
    if (filter) query = query.eq('status', filter);
    const term = toSearchTerm(q);
    if (term) query = query.or(`name.ilike."*${term}*",email.ilike."*${term}*",message.ilike."*${term}*"`);

    const items = must(await query);
    const statuses = must(await this.db.from('inquiries').select('status')) as { status: InquiryStatus }[];
    const counts = Object.fromEntries(STATUSES.map((s) => [s, statuses.filter((row) => row.status === s).length]));

    return { items, counts, total: statuses.length, filter, q: term };
  }

  /** Opening a message is what marks it read; the first reading time is kept. */
  async open(id: string): Promise<Inquiry> {
    const inquiry = await this.find(id);
    if (inquiry.status !== 'new') return inquiry;
    return this.write(id, { status: 'read', read_at: inquiry.read_at ?? new Date().toISOString() });
  }

  async setStatus(id: string, status: InquiryStatus): Promise<Inquiry> {
    const inquiry = await this.find(id);
    const changes: Partial<Inquiry> = { status };
    if (status === 'replied' && !inquiry.replied_at) changes.replied_at = new Date().toISOString();
    return this.write(id, changes);
  }

  private async find(id: string): Promise<Inquiry> {
    const inquiry = must(await this.db.from('inquiries').select('*').eq('id', id).maybeSingle()) as Inquiry | null;
    if (!inquiry) throw new NotFoundException('That message no longer exists.');
    return inquiry;
  }

  private async write(id: string, changes: Partial<Inquiry>): Promise<Inquiry> {
    return must(await this.db.from('inquiries').update(changes).eq('id', id).select('*').single()) as Inquiry;
  }
}
