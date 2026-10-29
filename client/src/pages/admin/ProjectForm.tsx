import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Plus, UploadSimple, X } from '@phosphor-icons/react';
import { Arrow, LoadError, Win } from '@/components/hud';
import { PerfumeryMark, TechnologyMark } from '@/components/marks';
import { api, useApi } from '@/lib/api';
import { pad, slugify } from '@/lib/format';
import { pageTitle, useTitle } from '@/lib/hooks';
import { Link, navigate } from '@/lib/router';
import type { Division, Photo, Project } from '@/lib/types';
import { ConfirmDelete } from './Projects';

type Draft = Omit<Project, 'id' | 'images' | 'cover'> & { images: Photo[]; cover: number };

const EMPTY: Draft = {
  slug: '',
  name: '',
  division: 'technology',
  position: 1,
  summary: '',
  index_summary: '',
  meta_label: '',
  facts: [
    { label: 'Division', value: '' },
    { label: 'Role', value: '' },
  ],
  situation: '',
  constraint_text: '',
  result: '',
  decisions: [{ title: '', body: '' }],
  composition_top: '',
  composition_heart: '',
  composition_base: '',
  images: [],
  cover: 0,
  seo_title: '',
  seo_description: '',
};


const MAX_PHOTO = 10 * 1024 * 1024;

export default function ProjectForm({ id }: { id?: string }) {
  const editing = id !== undefined;
  const loaded = useApi<Project>(editing ? `/admin/projects/${encodeURIComponent(id)}` : null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [dirty, setDirty] = useState(false);
  const [slugTouched, setSlugTouched] = useState(editing);
  const [state, setState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [failure, setFailure] = useState('');
  useTitle(pageTitle(editing ? `Edit ${loaded.data?.name ?? 'project'}` : 'New project'));

  useEffect(() => {
    if (loaded.data) setDraft({ ...EMPTY, ...loaded.data });
  }, [loaded.data]);

  // Leaving with unsaved changes asks first.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setDirty(true);
    setState('idle');
  };

  const setName = (name: string) => {
    set('name', name);
    if (!slugTouched) setDraft((current) => ({ ...current, name, slug: slugify(name) }));
  };

  const save = async (event?: FormEvent) => {
    event?.preventDefault();
    setState('saving');
    setFailure('');
    const body = { ...draft, images: draft.images.map(({ path, alt }) => ({ path, alt })) };
    const { created_at: _c, updated_at: _u, id: _id, ...json } = body as Draft & { created_at?: string; updated_at?: string; id?: number };
    try {
      if (editing) {
        const saved = await api<Project>(`/admin/projects/${id}`, { method: 'PUT', json });
        setDraft({ ...EMPTY, ...saved });
        setDirty(false);
        setState('saved');
      } else {
        const { id: newId } = await api<{ id: number }>('/admin/projects', { method: 'POST', json });
        setDirty(false);
        navigate(`/admin/projects/${newId}?created=1`, { replace: true });
      }
    } catch (caught) {
      setFailure((caught as Error).message);
      setState('idle');
    }
  };

  if (editing && loaded.error) {
    return (
      <>
        <Link className="tl plain" href="/admin/projects"><Arrow back /> All projects</Link>
        <div style={{ marginTop: 24 }}><LoadError message={loaded.error.message} retry={loaded.error.status === 404 ? undefined : loaded.reload} /></div>
      </>
    );
  }
  if (editing && !loaded.data) return <div className="ph" style={{ height: 480 }} aria-busy="true" aria-label="Loading the project" />;

  const justCreated = editing && window.location.search.includes('created=1');
  const statusText = state === 'saving' ? 'Saving…' : dirty ? 'Unsaved changes' : editing ? 'All changes saved' : 'Not saved yet';

  return (
    <>
      <Link className="tl plain" href="/admin/projects"><Arrow back /> All projects</Link>
      <p className="m" style={{ margin: '28px 0 12px' }}>[ {editing ? `Edit project ${pad(draft.position)}` : 'New project'} ]</p>
      <h1 className="h1" style={{ fontSize: 'clamp(40px, 4.8vw, 72px)', marginBottom: 32 }}>{draft.name || 'New project'}</h1>

      {justCreated && !dirty && state === 'idle' && (
        <p className="note" role="status" style={{ marginBottom: 24 }}>Project added. Photos can be uploaded below.</p>
      )}
      {failure && <p className="note bad" role="alert" style={{ marginBottom: 24 }}>{failure}</p>}

      <div className="form-row">
        <form id="project-form" className="form-main" onSubmit={save} noValidate>
          <Group number="01" title="Basics" help="What the work list and the top of the case study show.">
            <div className="two">
              <Field label="Project name" id="name">
                <input className="field" id="name" value={draft.name} onChange={(e) => setName(e.target.value)} maxLength={120} required />
              </Field>
              <Field label="Address" id="slug" help="Lowercase letters, numbers and hyphens. The case study lives at /work/your-address.">
                <input
                  className="field fm"
                  id="slug"
                  value={draft.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set('slug', e.target.value.toLowerCase());
                  }}
                  maxLength={80}
                  pattern="[a-z0-9]+(-[a-z0-9]+)*"
                  required
                />
              </Field>
            </div>
            <fieldset>
              <legend className="lbl" style={{ marginBottom: 10 }}>Division</legend>
              <div className="two" style={{ gap: 12 }}>
                {(['perfumery', 'technology'] as Division[]).map((division) => (
                  <label key={division} className="radio">
                    <input type="radio" name="division" checked={draft.division === division} onChange={() => set('division', division)} />
                    {division === 'perfumery' ? <PerfumeryMark size={24} className="ac" /> : <TechnologyMark size={24} />}
                    {division === 'perfumery' ? 'Perfumery' : 'Technology'}
                  </label>
                ))}
              </div>
            </fieldset>
            <Field label="One-line summary" id="summary" help="Opens the case study, and is used by search engines when the description below is empty.">
              <input className="field" id="summary" value={draft.summary} onChange={(e) => set('summary', e.target.value)} maxLength={200} required />
            </Field>
            <Field label="Summary on the work list" optional id="index_summary" help="Leave empty to reuse the one-line summary.">
              <input className="field" id="index_summary" value={draft.index_summary ?? ''} onChange={(e) => set('index_summary', e.target.value)} maxLength={240} />
            </Field>
            <div className="two">
              <Field label="Short label" optional id="meta_label" help="Above the name on the work list, for example the division and how long it took.">
                <input className="field" id="meta_label" value={draft.meta_label ?? ''} onChange={(e) => set('meta_label', e.target.value)} maxLength={80} />
              </Field>
              <Field label="Position" id="position" help="1 is shown first. Numbers on the site follow this order.">
                <input
                  className="field fm"
                  id="position"
                  type="number"
                  min={1}
                  max={999}
                  value={draft.position}
                  onChange={(e) => set('position', Number(e.target.value) || 1)}
                  required
                />
              </Field>
            </div>
          </Group>

          <Group number="02" title="Facts" help="The strip beside the title, such as role and duration. Two to four read best. Empty rows are ignored.">
            {draft.facts.map((fact, index) => (
              <div key={index} className="two" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) auto', alignItems: 'end' }}>
                <Field label="Label" id={`fl${index}`}>
                  <input className="field" id={`fl${index}`} value={fact.label} maxLength={40} onChange={(e) => set('facts', draft.facts.map((f, i) => (i === index ? { ...f, label: e.target.value } : f)))} />
                </Field>
                <Field label="Value" id={`fv${index}`}>
                  <input className="field" id={`fv${index}`} value={fact.value} maxLength={80} onChange={(e) => set('facts', draft.facts.map((f, i) => (i === index ? { ...f, value: e.target.value } : f)))} />
                </Field>
                <button type="button" className="qb" aria-label={`Remove row ${index + 1}`} onClick={() => set('facts', draft.facts.filter((_, i) => i !== index))}>
                  <X size={18} aria-hidden="true" />
                </button>
              </div>
            ))}
            {draft.facts.length < 8 && (
              <button type="button" className="addb" onClick={() => set('facts', [...draft.facts, { label: '', value: '' }])}>
                <Plus size={12} aria-hidden="true" /> Add a row
              </button>
            )}
          </Group>

          <Group number="03" title="Story" help="Leave a blank line between paragraphs. On the case study, the first paragraph of each part becomes its heading when there is more than one.">
            <Field label="Situation" id="situation">
              <textarea className="field" id="situation" rows={6} maxLength={6000} value={draft.situation} onChange={(e) => set('situation', e.target.value)} required />
            </Field>
            <Field label="Constraint" optional id="constraint_text">
              <textarea className="field" id="constraint_text" rows={4} maxLength={6000} value={draft.constraint_text ?? ''} onChange={(e) => set('constraint_text', e.target.value)} />
            </Field>
            <Field label="Result" id="result">
              <textarea className="field" id="result" rows={5} maxLength={6000} value={draft.result} onChange={(e) => set('result', e.target.value)} required />
            </Field>
          </Group>

          <Group number="04" title="Decisions" help="What was decided, and why. At least one.">
            {draft.decisions.map((decision, index) => (
              <div key={index} className="numbered">
                <span className="n" style={{ fontSize: 28 }}>{pad(index + 1)}</span>
                <div className="stack" style={{ gap: 16 }}>
                  <Field label="Title" id={`d${index}t`}>
                    <input className="field" id={`d${index}t`} value={decision.title} maxLength={160} onChange={(e) => set('decisions', draft.decisions.map((d, i) => (i === index ? { ...d, title: e.target.value } : d)))} />
                  </Field>
                  <Field label="Why" id={`d${index}b`}>
                    <textarea className="field" id={`d${index}b`} rows={3} maxLength={1200} value={decision.body} onChange={(e) => set('decisions', draft.decisions.map((d, i) => (i === index ? { ...d, body: e.target.value } : d)))} />
                  </Field>
                  {draft.decisions.length > 1 && (
                    <button type="button" className="qb danger" style={{ alignSelf: 'flex-start' }} onClick={() => set('decisions', draft.decisions.filter((_, i) => i !== index))}>
                      Remove decision {pad(index + 1)}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {draft.decisions.length < 8 && (
              <button type="button" className="addb" onClick={() => set('decisions', [...draft.decisions, { title: '', body: '' }])}>
                <Plus size={12} aria-hidden="true" /> Add a decision
              </button>
            )}
          </Group>

          <Group number="05" title="Composition" help="The stack, written as a perfume formula. Top is what a person meets, heart is the logic, base is the foundation.">
            <div style={{ display: 'grid', gridTemplateColumns: '100px minmax(0, 1fr)', alignItems: 'center', gap: '4px 20px' }}>
              {(['top', 'heart', 'base'] as const).map((layer) => {
                const key = `composition_${layer}` as const;
                return (
                  <div key={layer} style={{ display: 'contents' }}>
                    <label className="m" htmlFor={key}>{layer}</label>
                    <input className="field fm" id={key} value={draft[key]} maxLength={120} onChange={(e) => set(key, e.target.value)} required />
                  </div>
                );
              })}
            </div>
          </Group>

          <Group number="06" title="Photos" help="JPG, PNG or WebP, under 10 MB each. The cover is used on the work list. Removing a photo deletes it when you save.">
            {!editing ? (
              <p className="p sm">Save the project first. Photos can be uploaded once it exists.</p>
            ) : (
              <Photos
                projectId={id}
                images={draft.images}
                cover={draft.cover}
                onChange={(images, cover) => {
                  set('images', images);
                  set('cover', cover);
                }}
                onUploaded={(project) => setDraft((current) => ({ ...current, images: project.images }))}
              />
            )}
          </Group>

          <Group number="07" title="Search and sharing" help="Optional. Leave empty to build them from the name and the summary.">
            <Field label="Page title" id="seo_title">
              <input className="field" id="seo_title" value={draft.seo_title ?? ''} maxLength={120} onChange={(e) => set('seo_title', e.target.value)} />
            </Field>
            <Field label="Description" id="seo_description">
              <textarea className="field" id="seo_description" rows={3} maxLength={300} value={draft.seo_description ?? ''} onChange={(e) => set('seo_description', e.target.value)} />
            </Field>
          </Group>
        </form>

        <aside className="form-side" aria-label="Save">
          <Win title="Save">
            <div className="stack" style={{ gap: 14 }}>
              <p role="status" className="m" style={{ display: 'flex', alignItems: 'center', gap: 10, margin: 0 }}>
                <span className="status-dot" aria-hidden="true" style={{ background: dirty ? 'var(--accent)' : 'transparent' }} />
                {statusText}
              </p>
              <button className="btn full" type="submit" form="project-form" disabled={state === 'saving'}>
                {editing ? 'Save changes' : 'Add project'} <Arrow />
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--line)', paddingTop: 4 }}>
                {editing && <Link className="m" href={`/work/${draft.slug}`} style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44 }}>View on the site</Link>}
                <Link className="m" href="/admin/projects" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44 }}>Back to all projects</Link>
                {editing && (
                  <ConfirmDelete
                    name={draft.name}
                    label="Delete this project"
                    onConfirm={async () => {
                      try {
                        await api(`/admin/projects/${id}`, { method: 'DELETE' });
                        setDirty(false);
                        navigate('/admin/projects', { replace: true });
                      } catch (caught) {
                        setFailure((caught as Error).message);
                      }
                    }}
                  />
                )}
              </div>
            </div>
          </Win>
        </aside>
      </div>
    </>
  );
}

function Group({ number, title, help, children }: { number: string; title: string; help: string; children: ReactNode }) {
  return (
    <fieldset className="grp">
      <legend>
        <span className="win-b">
          <span>{number} · {title}</span>
          <i />
        </span>
      </legend>
      <div className="grp-c">
        <p className="help" style={{ margin: 0 }}>{help}</p>
        {children}
      </div>
    </fieldset>
  );
}

function Field({ label, id, help, optional, children }: { label: string; id: string; help?: string; optional?: boolean; children: ReactNode }) {
  return (
    <div>
      <label className="lbl" htmlFor={id}>
        {label} {optional && <span className="opt">(optional)</span>}
      </label>
      {children}
      {help && <p className="help">{help}</p>}
    </div>
  );
}

function Photos({ projectId, images, cover, onChange, onUploaded }: {
  projectId: string;
  images: Photo[];
  cover: number;
  onChange: (images: Photo[], cover: number) => void;
  onUploaded: (project: Project) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [alt, setAlt] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setError('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return setError('Upload a JPG, PNG or WebP file.');
    if (file.size > MAX_PHOTO) return setError('That file is over 10 MB. Export a smaller version and try again.');
    setBusy(true);
    const body = new FormData();
    body.append('file', file);
    body.append('alt', alt);
    try {
      // Uploading saves the photo straight away; the rest of the form is unaffected.
      onUploaded(await api<Project>(`/admin/projects/${projectId}/photos`, { method: 'POST', body }));
      setAlt('');
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  return (
    <>
      {images.map((image, index) => (
        <div key={image.path} className="shot">
          <span className="ph" style={{ aspectRatio: '16 / 10' }}>
            <img src={image.url} alt="" />
          </span>
          <div>
            <label className="lbl" htmlFor={`alt${index}`}>Description for screen readers</label>
            <input
              className="field"
              id={`alt${index}`}
              value={image.alt}
              maxLength={300}
              placeholder="Describe what the photo shows"
              onChange={(e) => onChange(images.map((img, i) => (i === index ? { ...img, alt: e.target.value } : img)), cover)}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 24px', marginTop: 6 }}>
              <label className="check">
                <input type="radio" name="cover" checked={cover === index} onChange={() => onChange(images, index)} />
                Cover image
              </label>
              <button
                type="button"
                className="qb danger"
                onClick={() => onChange(images.filter((_, i) => i !== index), cover === index ? 0 : cover > index ? cover - 1 : cover)}
              >
                Remove photo
              </button>
            </div>
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 20, border: '1px dashed var(--line-strong)' }}>
        <div>
          <label className="lbl" htmlFor="new-alt">Description for the next photo</label>
          <input className="field" id="new-alt" value={alt} maxLength={300} onChange={(e) => setAlt(e.target.value)} placeholder="Describe what the photo shows" />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px 20px' }}>
          <input ref={input} id="upload" type="file" accept="image/jpeg,image/png,image/webp" className="sr" onChange={(e) => upload(e.target.files?.[0])} disabled={busy} />
          <label className="addb" htmlFor="upload" style={{ borderStyle: 'solid' }}>
            <UploadSimple size={14} aria-hidden="true" /> {busy ? 'Uploading…' : 'Choose a photo'}
          </label>
          <span className="m mu" aria-live="polite">{images.length ? `${images.length} of 12` : 'No photos yet'}</span>
        </div>
        {error && <p className="err" role="alert" style={{ margin: 0 }}>{error}</p>}
      </div>
    </>
  );
}
