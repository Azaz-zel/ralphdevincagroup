import { useEffect, useRef, useState, type DragEvent, type FormEvent, type ReactNode } from 'react';
import { ArrowDown, ArrowLeft, ArrowUp, Check, Plus, X } from '@phosphor-icons/react';
import { useToast } from '@/components/admin-shell';
import { LoadError, SlideBody } from '@/components/ui';
import { api, useApi } from '@/lib/api';
import { slugify } from '@/lib/format';
import { pageTitle, useTitle } from '@/lib/hooks';
import { Link, navigate } from '@/lib/router';
import type { Division, Photo, Project } from '@/lib/types';

type Draft = Omit<Project, 'id'>;
type Errors = Partial<Record<'name' | 'slug' | 'summary' | 'situation' | 'result' | 'decisions' | 'composition' | 'photos', string>>;

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
const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** The same rules the server applies, checked first so mistakes show beside their field. */
function check(d: Draft): Errors {
  const e: Errors = {};
  if (!d.name.trim()) e.name = 'Give the project a name.';
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(d.slug)) e.slug = 'Use lowercase letters, numbers and single hyphens.';
  if (!d.summary.trim()) e.summary = 'Write one line that says what it is.';
  if (!d.situation.trim()) e.situation = 'Describe the situation the work started from.';
  if (!d.result.trim()) e.result = 'Say what the work produced.';
  if (!d.decisions.some((x) => x.title.trim() && x.body.trim())) e.decisions = 'Add at least one decision with a title and a reason.';
  if (![d.composition_top, d.composition_heart, d.composition_base].every((v) => v.trim())) e.composition = 'Fill all three layers.';
  if (d.images.some((image) => !image.alt.trim())) e.photos = 'Every photo needs a description.';
  return e;
}

const SECTIONS: { id: string; label: string; errors: (keyof Errors)[]; done: (d: Draft) => boolean }[] = [
  { id: 'basics', label: 'Basics', errors: ['name', 'slug', 'summary'], done: (d) => !!(d.name.trim() && d.slug && d.summary.trim()) },
  { id: 'facts', label: 'Facts', errors: [], done: (d) => d.facts.some((f) => f.label.trim() && f.value.trim()) },
  { id: 'story', label: 'Story', errors: ['situation', 'result'], done: (d) => !!(d.situation.trim() && d.result.trim()) },
  { id: 'decisions', label: 'Decisions', errors: ['decisions'], done: (d) => d.decisions.some((x) => x.title.trim() && x.body.trim()) },
  { id: 'composition', label: 'Composition', errors: ['composition'], done: (d) => [d.composition_top, d.composition_heart, d.composition_base].every((v) => v.trim()) },
  { id: 'photos', label: 'Photos', errors: ['photos'], done: (d) => d.images.length > 0 },
  { id: 'search', label: 'Search and sharing', errors: [], done: () => true },
];

export default function ProjectForm({ id }: { id?: string }) {
  const editing = id !== undefined;
  const loaded = useApi<Project>(editing ? `/admin/projects/${encodeURIComponent(id)}` : null);
  const [saved, setSaved] = useState<Draft>(EMPTY);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [slugTouched, setSlugTouched] = useState(editing);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState('');
  const toast = useToast();
  const dialog = useRef<HTMLDialogElement>(null);
  useTitle(pageTitle(editing ? `Edit ${loaded.data?.name ?? 'project'}` : 'New project'));

  useEffect(() => {
    if (!loaded.data) return;
    const { id: _id, ...rest } = loaded.data;
    setDraft({ ...EMPTY, ...rest });
    setSaved({ ...EMPTY, ...rest });
  }, [loaded.data]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  // Leaving with unsaved changes asks first.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  // Once a save has failed, errors update as the fields are fixed.
  useEffect(() => {
    if (Object.keys(errors).length) setErrors(check(draft));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  const save = async (event?: FormEvent) => {
    event?.preventDefault();
    const found = check(draft);
    setErrors(found);
    if (Object.keys(found).length) {
      const first = SECTIONS.find((section) => section.errors.some((key) => found[key]));
      document.getElementById('ed-' + first?.id)?.scrollIntoView({ block: 'start' });
      return;
    }
    setSaving(true);
    setFailure('');
    const { created_at: _c, updated_at: _u, ...body } = { ...draft, images: draft.images.map(({ path, alt }) => ({ path, alt })) } as Draft & { created_at?: string; updated_at?: string };
    try {
      if (editing) {
        const { id: _id, ...rest } = await api<Project>(`/admin/projects/${id}`, { method: 'PUT', json: body });
        setDraft({ ...EMPTY, ...rest });
        setSaved({ ...EMPTY, ...rest });
        toast.show('Saved. The site shows the new version now.');
      } else {
        const { id: newId } = await api<{ id: number }>('/admin/projects', { method: 'POST', json: body });
        setSaved(draft);
        navigate(`/admin/projects/${newId}?created=1`, { replace: true });
      }
    } catch (caught) {
      setFailure((caught as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    try {
      await api(`/admin/projects/${id}`, { method: 'DELETE' });
      setSaved(draft);
      navigate('/admin/projects', { replace: true });
    } catch (caught) {
      setFailure((caught as Error).message);
    }
  };

  if (editing && loaded.error) {
    return (
      <>
        <Link className="tl" href="/admin/projects"><ArrowLeft size={14} aria-hidden="true" /> All projects</Link>
        <LoadError message={loaded.error.message} retry={loaded.error.status === 404 ? undefined : loaded.reload} />
      </>
    );
  }
  if (editing && !loaded.data) return <span className="ghost" style={{ height: 480 }} aria-busy="true" aria-label="Loading the project" />;

  const justCreated = editing && window.location.search.includes('created=1') && !dirty;
  const errorCount = Object.keys(errors).length;
  const sectionsWithErrors = SECTIONS.filter((section) => section.errors.some((key) => errors[key])).length;
  const invalid = (key: keyof Errors) => (errors[key] ? { 'aria-invalid': true as const, 'aria-describedby': `e-${key}` } : {});
  const cover = draft.images[draft.cover] ?? draft.images[0];
  const seoTitle = draft.seo_title || `${draft.name || 'Project name'} | Ralph de Vinca Group`;
  const updateList = <T,>(key: 'facts' | 'decisions', index: number, patch: Partial<T>) =>
    set(key, draft[key].map((item, i) => (i === index ? { ...item, ...patch } : item)) as never);
  const swap = <T,>(list: T[], i: number, j: number) => {
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  };

  return (
    <>
      <Link className="tl" href="/admin/projects"><ArrowLeft size={14} aria-hidden="true" /> All projects</Link>
      <div className="a-head" style={{ marginTop: 4 }}>
        <h1 className="disp">{draft.name || 'New project'}</h1>
      </div>
      {justCreated && <p className="note" role="status" style={{ marginBottom: 16 }}>Project added. Photos can be uploaded now.</p>}
      {failure && <div style={{ marginBottom: 16 }}><LoadError message={failure} /></div>}

      <div className="editor">
        <nav className="toc" aria-label="Sections">
          {SECTIONS.map((section) => {
            const bad = section.errors.some((key) => errors[key]);
            const done = section.done(draft) && !bad;
            return (
              <a key={section.id} href={`#ed-${section.id}`}>
                <span className={'tick' + (bad ? ' bad' : done ? ' on' : '')} aria-hidden="true">
                  {done && <Check size={10} weight="bold" />}
                  {bad && <X size={10} weight="bold" />}
                </span>
                {section.label}
                <span className="sr">{bad ? ', needs attention' : done ? ', complete' : ', not finished'}</span>
              </a>
            );
          })}
        </nav>

        <form id="project-form" onSubmit={save} noValidate>
          <Group id="basics" number="01" title="Basics" help="What the work list, the wheel and the top of the case study show.">
            <div className="stack">
              <Field label="Project name" id="name" error={errors.name}>
                <input
                  className="field"
                  id="name"
                  value={draft.name}
                  maxLength={120}
                  {...invalid('name')}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value, ...(slugTouched ? {} : { slug: slugify(e.target.value) }) }))}
                />
              </Field>
              <Field label="Address" note={slugTouched ? undefined : 'Made from the name until you change it'} id="slug" error={errors.slug}>
                <span className="prefix">
                  <span aria-hidden="true">/work/</span>
                  <input
                    id="slug"
                    value={draft.slug}
                    maxLength={80}
                    {...invalid('slug')}
                    onChange={(e) => {
                      setSlugTouched(true);
                      set('slug', e.target.value.toLowerCase());
                    }}
                  />
                </span>
              </Field>
              <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
                <legend className="lbl">Division</legend>
                <div className="radio-cards">
                  {(['perfumery', 'technology'] as Division[]).map((division) => (
                    <label key={division}>
                      <input type="radio" name="division" checked={draft.division === division} onChange={() => set('division', division)} />
                      {division === 'perfumery' ? 'Perfumery' : 'Technology'}
                    </label>
                  ))}
                </div>
              </fieldset>
              <Field label="One-line summary" note={`${draft.summary.length} / 200`} id="summary" error={errors.summary}>
                <input className="field" id="summary" value={draft.summary} maxLength={200} {...invalid('summary')} onChange={(e) => set('summary', e.target.value)} />
              </Field>
              <div className="two">
                <Field label="Summary on the work list" note="Optional" id="index_summary" help="Empty reuses the one-line summary.">
                  <input className="field" id="index_summary" value={draft.index_summary ?? ''} maxLength={240} onChange={(e) => set('index_summary', e.target.value)} />
                </Field>
                <Field label="Short label" note="Optional" id="meta_label" help="For example: Technology · Two weeks">
                  <input className="field" id="meta_label" value={draft.meta_label ?? ''} maxLength={80} onChange={(e) => set('meta_label', e.target.value)} />
                </Field>
              </div>
            </div>
          </Group>

          <Group id="facts" number="02" title="Facts" help="Short pairs beside the title, like Role or Duration. Two to four read best; empty rows are ignored.">
            <div className="stack" style={{ gap: 10 }}>
              {draft.facts.map((fact, index) => (
                <div key={index} className="rep-row">
                  <Field label="Label" id={`fl${index}`}>
                    <input className="field" id={`fl${index}`} value={fact.label} maxLength={40} onChange={(e) => updateList('facts', index, { label: e.target.value })} />
                  </Field>
                  <Field label="Value" id={`fv${index}`}>
                    <input className="field" id={`fv${index}`} value={fact.value} maxLength={80} onChange={(e) => updateList('facts', index, { value: e.target.value })} />
                  </Field>
                  <button type="button" className="icon-btn" aria-label={`Remove fact ${fact.label || index + 1}`} onClick={() => set('facts', draft.facts.filter((_, i) => i !== index))}>
                    <X size={14} aria-hidden="true" />
                  </button>
                </div>
              ))}
              {draft.facts.length < 8 && (
                <div><button type="button" className="btn line" onClick={() => set('facts', [...draft.facts, { label: '', value: '' }])}><Plus size={12} aria-hidden="true" /> Add a fact</button></div>
              )}
            </div>
          </Group>

          <Group id="story" number="03" title="Story" help="Leave a blank line between paragraphs. When a part has more than one paragraph, the first becomes its heading.">
            <div className="stack">
              <Field label="Situation" note={`${draft.situation.length} / 6000`} id="situation" error={errors.situation}>
                <textarea className="field" id="situation" rows={5} maxLength={6000} value={draft.situation} {...invalid('situation')} onChange={(e) => set('situation', e.target.value)} />
              </Field>
              <Field label="Constraint" note="Optional" id="constraint_text">
                <textarea className="field" id="constraint_text" rows={4} maxLength={6000} value={draft.constraint_text ?? ''} onChange={(e) => set('constraint_text', e.target.value)} />
              </Field>
              <Field label="Result" note={`${draft.result.length} / 6000`} id="result" error={errors.result}>
                <textarea className="field" id="result" rows={4} maxLength={6000} value={draft.result} {...invalid('result')} onChange={(e) => set('result', e.target.value)} />
              </Field>
            </div>
          </Group>

          <Group id="decisions" number="04" title="Decisions" help="What was decided, and why. The order here is the order on the decisions slide.">
            <div className="stack" style={{ gap: 10 }}>
              {draft.decisions.map((decision, index) => (
                <div key={index} className="dec-card">
                  <header>
                    <span className="mono gold">Decision {index + 1}</span>
                    <span>
                      <button type="button" className="icon-btn" aria-label={`Move decision ${index + 1} up`} disabled={index === 0} onClick={() => set('decisions', swap(draft.decisions, index, index - 1))}>
                        <ArrowUp size={14} aria-hidden="true" />
                      </button>
                      <button type="button" className="icon-btn" aria-label={`Move decision ${index + 1} down`} disabled={index === draft.decisions.length - 1} onClick={() => set('decisions', swap(draft.decisions, index, index + 1))}>
                        <ArrowDown size={14} aria-hidden="true" />
                      </button>
                      <button type="button" className="icon-btn" aria-label={`Remove decision ${index + 1}`} disabled={draft.decisions.length === 1} onClick={() => set('decisions', draft.decisions.filter((_, i) => i !== index))}>
                        <X size={14} aria-hidden="true" />
                      </button>
                    </span>
                  </header>
                  <Field label="Title" id={`d${index}t`}>
                    <input className="field" id={`d${index}t`} value={decision.title} maxLength={160} onChange={(e) => updateList('decisions', index, { title: e.target.value })} />
                  </Field>
                  <Field label="Why" id={`d${index}b`}>
                    <textarea className="field" id={`d${index}b`} rows={3} maxLength={1200} value={decision.body} onChange={(e) => updateList('decisions', index, { body: e.target.value })} />
                  </Field>
                </div>
              ))}
              {errors.decisions && <p className="err" id="e-decisions" style={{ margin: 0 }}>{errors.decisions}</p>}
              {draft.decisions.length < 8 && (
                <div><button type="button" className="btn line" onClick={() => set('decisions', [...draft.decisions, { title: '', body: '' }])}><Plus size={12} aria-hidden="true" /> Add a decision</button></div>
              )}
            </div>
          </Group>

          <Group id="composition" number="05" title="Composition" help="The stack, written as a perfume formula. Top is what a person meets, heart is the logic, base is the foundation.">
            <div className="layers">
              {(['top', 'heart', 'base'] as const).map((layer) => {
                const key = `composition_${layer}` as const;
                return (
                  <label key={layer}>
                    <span>{layer.toUpperCase()}</span>
                    <input className="field" value={draft[key]} maxLength={120} aria-invalid={errors.composition && !draft[key].trim() ? true : undefined} onChange={(e) => set(key, e.target.value)} />
                  </label>
                );
              })}
              {errors.composition && <p className="err" style={{ margin: 0 }}>{errors.composition}</p>}
            </div>
          </Group>

          <Group id="photos" number="06" title="Photos" help="JPG, PNG or WebP, under 10 MB each, up to 12. The cover shows on the work list and the wheel. Removing a photo deletes it when you save.">
            {editing ? (
              <Photos
                projectId={id}
                images={draft.images}
                cover={draft.cover}
                error={errors.photos}
                onChange={(images, cover) => setDraft((d) => ({ ...d, images, cover }))}
                onUploaded={(project) => {
                  // An upload is saved straight away; keep any unsaved edits to the rest of the form.
                  setDraft((d) => ({ ...d, images: [...d.images, ...project.images.filter((p) => !d.images.some((q) => q.path === p.path))] }));
                  setSaved((s) => ({ ...s, images: project.images, cover: project.cover }));
                }}
              />
            ) : (
              <p className="mu" style={{ margin: 0 }}>Save the project first. Photos can be uploaded once it exists.</p>
            )}
          </Group>

          <Group id="search" number="07" title="Search and sharing" help="Optional. Left empty, these are built from the name and the summary.">
            <div className="stack">
              <Field label="Page title" note="Optional" id="seo_title">
                <input className="field" id="seo_title" value={draft.seo_title ?? ''} maxLength={120} placeholder={seoTitle} onChange={(e) => set('seo_title', e.target.value)} />
              </Field>
              <Field label="Description" note={`${(draft.seo_description ?? '').length} / 300`} id="seo_description">
                <textarea className="field" id="seo_description" rows={2} maxLength={300} value={draft.seo_description ?? ''} onChange={(e) => set('seo_description', e.target.value)} />
              </Field>
              <div>
                <p className="mono mu" style={{ margin: 0 }}>How a search result may look</p>
                <div className="serp">
                  <div style={{ fontSize: 13, color: 'var(--text)' }}>ralphdevinca · work · {draft.slug || 'address'}</div>
                  <div className="t">{seoTitle}</div>
                  <div className="d">{draft.seo_description || draft.summary || 'The one-line summary shows here.'}</div>
                </div>
              </div>
            </div>
          </Group>

          {editing && (
            <section className="grp danger" aria-labelledby="del-title">
              <header>
                <div>
                  <h2 id="del-title">Delete this project</h2>
                  <p className="help">Removes the case study and its photos from the site. This cannot be undone.</p>
                </div>
              </header>
              <button type="button" className="btn danger" onClick={() => dialog.current?.showModal()}>Delete project</button>
            </section>
          )}
        </form>

        <aside className="save" aria-label="Save">
          <div className="save-box">
            <p className={'save-state' + (dirty ? ' dirty' : '')} role="status">
              <i aria-hidden="true" />
              {saving ? 'Saving' : dirty ? 'Unsaved changes' : editing ? 'All changes saved' : 'Not saved yet'}
            </p>
            {errorCount > 0 && (
              <p className="note bad" role="alert">
                {sectionsWithErrors === 1 ? 'One section needs' : `${sectionsWithErrors} sections need`} attention before saving. Look for the red marks.
              </p>
            )}
            <button className="btn ink full" type="submit" form="project-form" disabled={saving}>
              {saving ? 'Saving' : editing ? 'Save changes' : 'Add project'}
            </button>
            <button type="button" className="btn line full" disabled={!dirty || saving} onClick={() => { setDraft(saved); setErrors({}); }}>
              Discard changes
            </button>
            {editing && <Link className="tl" href={`/work/${saved.slug}`}>View on the site</Link>}
          </div>
          <div className="preview-wrap">
            <p className="mono mu" style={{ margin: '6px 0 10px' }}>Preview on the wheel</p>
            <div className="slide t-gold preview" aria-hidden="true">
              <SlideBody
                kind="cover"
                number={editing ? draft.position : 0}
                project={{
                  id: 0,
                  slug: draft.slug,
                  name: draft.name || 'Project name',
                  division: draft.division,
                  summary: draft.summary || 'One-line summary',
                  index_summary: null,
                  meta_label: null,
                  facts: [],
                  decisions: [],
                  result: '',
                  cover: cover ? { url: cover.url, alt: cover.alt } : null,
                }}
              />
            </div>
          </div>
        </aside>
      </div>

      {editing && (
        <dialog
          ref={dialog}
          className="confirm"
          aria-labelledby="dlg-title"
          onClose={(event) => {
            const choice = event.currentTarget.returnValue;
            event.currentTarget.returnValue = '';
            if (choice === 'delete') remove();
          }}
        >
          <h2 id="dlg-title">Delete {saved.name}?</h2>
          <p>The case study and its photos are removed from the site. This cannot be undone.</p>
          <form method="dialog">
            <button className="btn line" value="cancel" autoFocus>Keep it</button>
            <button className="btn danger" value="delete">Delete project</button>
          </form>
        </dialog>
      )}
      {toast.node}
    </>
  );
}

function Group({ id, number, title, help, children }: { id: string; number: string; title: string; help: string; children: ReactNode }) {
  return (
    <section className="grp" id={`ed-${id}`} aria-labelledby={`ed-${id}-t`}>
      <header>
        <div>
          <h2 id={`ed-${id}-t`}>{title}</h2>
          <p className="help">{help}</p>
        </div>
        <span className="mono mu">{number}</span>
      </header>
      {children}
    </section>
  );
}

function Field({ label, note, id, help, error, children }: { label: string; note?: string; id: string; help?: string; error?: string; children: ReactNode }) {
  const key = id === 'name' || id === 'slug' || id === 'summary' || id === 'situation' || id === 'result' ? `e-${id}` : undefined;
  return (
    <div>
      <label className="lbl" htmlFor={id}>
        {label} {note && <small>{note}</small>}
      </label>
      {children}
      {help && <p className="help">{help}</p>}
      {error && <p className="err" id={key}>{error}</p>}
    </div>
  );
}

function Photos({ projectId, images, cover, error, onChange, onUploaded }: {
  projectId: string;
  images: Photo[];
  cover: number;
  error?: string;
  onChange: (images: Photo[], cover: number) => void;
  onUploaded: (project: Project) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState('');
  const [problem, setProblem] = useState('');
  const [over, setOver] = useState(false);

  // Files go up one at a time, so a failure names the file that failed.
  const upload = async (files: File[]) => {
    setProblem('');
    const skipped = files.filter((file) => !TYPES.includes(file.type) || file.size > MAX_PHOTO);
    const room = Math.max(0, 12 - images.length);
    const good = files.filter((file) => !skipped.includes(file)).slice(0, room);
    for (const [index, file] of good.entries()) {
      setBusy(`Uploading ${index + 1} of ${good.length}`);
      const body = new FormData();
      body.append('file', file);
      body.append('alt', '');
      try {
        onUploaded(await api<Project>(`/admin/projects/${projectId}/photos`, { method: 'POST', body }));
      } catch (caught) {
        setProblem(`${file.name}: ${(caught as Error).message}`);
        break;
      }
    }
    setBusy('');
    if (input.current) input.current.value = '';
    if (skipped.length) setProblem(`${skipped.length} ${skipped.length === 1 ? 'file was' : 'files were'} skipped: only JPG, PNG or WebP under 10 MB.`);
    else if (files.length > good.length + skipped.length) setProblem('A project holds up to 12 photos; the rest were skipped.');
  };
  const drop = (event: DragEvent) => {
    event.preventDefault();
    setOver(false);
    if (!busy) upload([...event.dataTransfer.files]);
  };

  return (
    <>
      <div
        className={'drop' + (over ? ' over' : '')}
        onDragOver={(event) => {
          event.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={drop}
      >
        <p>{busy || 'Drop photos here, or'}</p>
        <input ref={input} id="upload" type="file" accept={TYPES.join(',')} multiple className="sr" disabled={!!busy || images.length >= 12} onChange={(e) => upload([...(e.target.files ?? [])])} />
        <label className="btn line" htmlFor="upload" aria-disabled={!!busy || images.length >= 12}>Choose photos</label>
        <span className="mono mu">{images.length} of 12</span>
      </div>
      {(problem || error) && <p className="err" role="alert">{problem || error}</p>}
      {images.length > 0 && (
        <div className="shots">
          {images.map((image, index) => (
            <div key={image.path} className="shot">
              <img src={image.url} alt="" />
              <div>
                <label className="lbl" htmlFor={`alt${index}`}>Description for screen readers</label>
                <input
                  className="field"
                  id={`alt${index}`}
                  value={image.alt}
                  maxLength={300}
                  placeholder="Describe what the photo shows"
                  aria-invalid={error && !image.alt.trim() ? true : undefined}
                  onChange={(e) => onChange(images.map((img, i) => (i === index ? { ...img, alt: e.target.value } : img)), cover)}
                />
              </div>
              <div className="r">
                <label>
                  <input type="radio" name="cover" checked={cover === index} onChange={() => onChange(images, index)} style={{ accentColor: 'var(--ink)' }} />
                  Cover
                </label>
                <button
                  type="button"
                  className="btn line sm"
                  aria-label={`Remove photo ${index + 1}`}
                  onClick={() => onChange(images.filter((_, i) => i !== index), cover === index ? 0 : cover > index ? cover - 1 : cover)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

