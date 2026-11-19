import { randomUUID } from 'node:crypto';
import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BUCKET, SUPABASE, must, photoUrl, type Db } from '../supabase.js';
import { keepOwnPhotos, sniffPhoto, toWebp, type Photo, type Project, type ProjectDto } from './project.entity.js';

const withUrls = (images: Photo[]) => images.map((image) => ({ ...image, url: photoUrl(image.path) }));

@Injectable()
export class ProjectsService {
  constructor(@Inject(SUPABASE) private readonly db: Db) {}

  async listPublic() {
    const rows = must(
      await this.db
        .from('projects')
        .select('id, slug, name, division, summary, index_summary, meta_label, facts, decisions, result, images, cover')
        .order('position')
        .order('id'),
    ) as Pick<Project, 'id' | 'slug' | 'name' | 'division' | 'summary' | 'index_summary' | 'meta_label' | 'facts' | 'decisions' | 'result' | 'images' | 'cover'>[];

    return rows.map(({ images, cover, ...row }) => {
      const image = images[cover] ?? images[0];
      return { ...row, cover: image ? { url: photoUrl(image.path), alt: image.alt } : null };
    });
  }

  async bySlug(slug: string) {
    const all = must(await this.db.from('projects').select('*').order('position').order('id')) as Project[];
    const index = all.findIndex((project) => project.slug === slug);
    if (index === -1) throw new NotFoundException('That case study does not exist.');
    const project = all[index];
    const near = (step: number) => {
      if (all.length < 2) return null;
      const at = (index + step + all.length) % all.length;
      return { slug: all[at].slug, name: all[at].name, division: all[at].division, number: at + 1 };
    };
    const next = near(1);
    // With two projects, previous and next are the same one; show it once.
    const prev = all.length > 2 ? near(-1) : null;
    return { ...project, number: index + 1, images: withUrls(project.images), next, prev };
  }

  async listAdmin() {
    const rows = must(
      await this.db.from('projects').select('id, slug, name, division, position, images, cover').order('position').order('id'),
    ) as Pick<Project, 'id' | 'slug' | 'name' | 'division' | 'position' | 'images' | 'cover'>[];
    return rows.map((row) => ({ ...row, images: withUrls(row.images) }));
  }

  async get(id: number) {
    const project = await this.find(id);
    return { ...project, images: withUrls(project.images) };
  }

  async create(dto: ProjectDto) {
    // A new project goes to the end of the list.
    const last = must(await this.db.from('projects').select('position').order('position', { ascending: false }).limit(1)) as { position: number }[];
    const position = Math.min((last[0]?.position ?? 0) + 1, 999);
    const result = await this.db.from('projects').insert({ ...this.columns(dto, [], 0), position }).select('id').single();
    this.throwIfSlugTaken(result.error);
    return must(result) as { id: number };
  }

  async update(id: number, dto: ProjectDto) {
    const current = await this.find(id);
    // Only photos that already belong to this project can be kept; anything else in the request is ignored.
    const keep = keepOwnPhotos(current.images, dto.images);
    const removed = current.images.filter((image) => !keep.some((kept) => kept.path === image.path));
    const cover = Math.min(dto.cover ?? current.cover, Math.max(keep.length - 1, 0));

    const result = await this.db.from('projects').update(this.columns(dto, keep, cover)).eq('id', id);
    this.throwIfSlugTaken(result.error);
    must(result);
    await this.removeFiles(removed.map((image) => image.path));
    return this.get(id);
  }

  /** Sets the order from a full list of ids. A list that is not exactly the current projects is refused. */
  async reorder(ids: number[]) {
    const rows = must(await this.db.from('projects').select('id')) as { id: number }[];
    const known = new Set(rows.map((row) => row.id));
    if (ids.length !== known.size || new Set(ids).size !== ids.length || !ids.every((id) => known.has(id))) {
      throw new BadRequestException('The list changed while you were ordering it. Reload the page and try again.');
    }
    for (const [index, id] of ids.entries()) {
      must(await this.db.from('projects').update({ position: index + 1 }).eq('id', id));
    }
    return this.listAdmin();
  }

  async remove(id: number): Promise<void> {
    const project = await this.find(id);
    must(await this.db.from('projects').delete().eq('id', id));
    await this.removeFiles(project.images.map((image) => image.path));
  }

  async addPhoto(id: number, file: Express.Multer.File | undefined, alt: string) {
    if (!file) throw new BadRequestException('Choose a photo to upload.');
    if (!sniffPhoto(file.buffer)) throw new BadRequestException('Upload a JPG, PNG or WebP file.');

    const project = await this.find(id);
    if (project.images.length >= 12) throw new BadRequestException('A project can hold up to 12 photos.');

    const webp = await toWebp(file.buffer).catch(() => {
      throw new BadRequestException('That photo could not be read. Try exporting it again.');
    });
    const path = `${project.id}/${randomUUID()}.webp`;
    must(await this.db.storage.from(BUCKET).upload(path, webp, { contentType: 'image/webp', upsert: false }));
    const images = [...project.images, { path, alt: alt.trim().slice(0, 300) }];
    must(await this.db.from('projects').update({ images }).eq('id', id));
    return this.get(id);
  }

  private async find(id: number): Promise<Project> {
    const project = must(await this.db.from('projects').select('*').eq('id', id).maybeSingle()) as Project | null;
    if (!project) throw new NotFoundException('That project no longer exists.');
    return project;
  }

  private columns(dto: ProjectDto, images: Photo[], cover: number) {
    return {
      slug: dto.slug,
      name: dto.name,
      division: dto.division,
      summary: dto.summary,
      index_summary: dto.index_summary ?? null,
      meta_label: dto.meta_label ?? null,
      // Empty rows in the form are ignored rather than stored.
      facts: dto.facts.filter((fact) => fact.label && fact.value),
      situation: dto.situation,
      constraint_text: dto.constraint_text ?? null,
      result: dto.result,
      decisions: dto.decisions.filter((decision) => decision.title && decision.body),
      composition_top: dto.composition_top,
      composition_heart: dto.composition_heart,
      composition_base: dto.composition_base,
      images,
      cover,
      seo_title: dto.seo_title ?? null,
      seo_description: dto.seo_description ?? null,
    };
  }

  private throwIfSlugTaken(error: { code?: string } | null): void {
    if (error?.code === '23505') throw new ConflictException('That address is already used by another project.');
  }

  private async removeFiles(paths: string[]): Promise<void> {
    if (paths.length === 0) return;
    const { error } = await this.db.storage.from(BUCKET).remove(paths);
    // The row is already saved; a leftover file only costs storage, so log it rather than fail the request.
    if (error) console.error('Could not remove photos', paths, error);
  }
}
