import { randomUUID } from 'node:crypto';
import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BUCKET, SUPABASE, must, photoUrl, type Db } from '../supabase.js';
import { keepOwnPhotos, sniffPhoto, type Photo, type Project, type ProjectDto } from './project.entity.js';

const withUrls = (images: Photo[]) => images.map((image) => ({ ...image, url: photoUrl(image.path) }));

@Injectable()
export class ProjectsService {
  constructor(@Inject(SUPABASE) private readonly db: Db) {}

  async listPublic() {
    const rows = must(
      await this.db
        .from('projects')
        .select('id, slug, name, division, summary, index_summary, meta_label, images, cover')
        .order('position')
        .order('id'),
    ) as Pick<Project, 'id' | 'slug' | 'name' | 'division' | 'summary' | 'index_summary' | 'meta_label' | 'images' | 'cover'>[];

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
    const next = all.length > 1 ? all[(index + 1) % all.length] : null;
    return {
      ...project,
      number: index + 1,
      images: withUrls(project.images),
      next: next ? { slug: next.slug, name: next.name, number: ((index + 1) % all.length) + 1 } : null,
    };
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
    const result = await this.db.from('projects').insert(this.columns(dto, [], 0)).select('id').single();
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

  async remove(id: number): Promise<void> {
    const project = await this.find(id);
    must(await this.db.from('projects').delete().eq('id', id));
    await this.removeFiles(project.images.map((image) => image.path));
  }

  async addPhoto(id: number, file: Express.Multer.File | undefined, alt: string) {
    if (!file) throw new BadRequestException('Choose a photo to upload.');
    const type = sniffPhoto(file.buffer);
    if (!type) throw new BadRequestException('Upload a JPG, PNG or WebP file.');

    const project = await this.find(id);
    if (project.images.length >= 12) throw new BadRequestException('A project can hold up to 12 photos.');

    const path = `${project.id}/${randomUUID()}.${type.extension}`;
    must(await this.db.storage.from(BUCKET).upload(path, file.buffer, { contentType: type.mime, upsert: false }));
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
      position: dto.position,
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
