import { randomUUID } from 'node:crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Db } from '../db.js';
import { type CreateInquiryDto, type Inquiry, type InquiryStatus, STATUSES, toSearchTerm } from './inquiry.entity.js';

const LIST_COLUMNS = 'id, name, email, division, message, status, created_at';

@Injectable()
export class InquiriesService {
  constructor(private readonly db: Db) {}

  async create(dto: CreateInquiryDto, meta: { ip?: string; userAgent?: string }): Promise<void> {
    await this.db.query('INSERT INTO inquiries SET ?', [
      {
        id: randomUUID(),
        name: dto.name,
        email: dto.email,
        division: dto.division ?? 'unsure',
        message: dto.message,
        ip_address: meta.ip ?? null,
        user_agent: meta.userAgent?.slice(0, 500) ?? null,
      },
    ]);
  }

  async list(status?: string, q?: string) {
    const where: string[] = [];
    const values: unknown[] = [];
    const filter = STATUSES.includes(status as InquiryStatus) ? (status as InquiryStatus) : null;
    if (filter) {
      where.push('status = ?');
      values.push(filter);
    }
    const term = toSearchTerm(q);
    if (term) {
      const like = `%${term.replace(/[%_]/g, (wildcard) => `\\${wildcard}`)}%`;
      where.push('(name LIKE ? OR email LIKE ? OR message LIKE ?)');
      values.push(like, like, like);
    }

    // shortcut: newest 200 only, no paging; add paging if the inbox ever outgrows that.
    const items = await this.db.query(
      `SELECT ${LIST_COLUMNS} FROM inquiries ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY created_at DESC LIMIT 200`,
      values,
    );
    const grouped = await this.db.query<{ status: InquiryStatus; n: number }[]>('SELECT status, COUNT(*) AS n FROM inquiries GROUP BY status');
    const counts = Object.fromEntries(STATUSES.map((s) => [s, Number(grouped.find((row) => row.status === s)?.n ?? 0)]));
    const total = Object.values(counts).reduce((sum, n) => sum + n, 0);

    return { items, counts, total, filter, q: term };
  }

  /** Opening a message is what marks it read; the first reading time is kept. */
  async open(id: string): Promise<Inquiry> {
    const inquiry = await this.find(id);
    if (inquiry.status !== 'new') return inquiry;
    await this.db.query("UPDATE inquiries SET status = 'read', read_at = COALESCE(read_at, CURRENT_TIMESTAMP) WHERE id = ?", [id]);
    return this.find(id);
  }

  async setStatus(id: string, status: InquiryStatus): Promise<Inquiry> {
    await this.find(id);
    await this.db.query(
      "UPDATE inquiries SET status = ?, replied_at = IF(? = 'replied', COALESCE(replied_at, CURRENT_TIMESTAMP), replied_at) WHERE id = ?",
      [status, status, id],
    );
    return this.find(id);
  }

  private async find(id: string): Promise<Inquiry> {
    const [inquiry] = await this.db.query<Inquiry[]>('SELECT * FROM inquiries WHERE id = ?', [id]);
    if (!inquiry) throw new NotFoundException('That message no longer exists.');
    return inquiry;
  }
}
