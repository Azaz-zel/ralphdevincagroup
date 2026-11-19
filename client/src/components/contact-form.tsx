import { useState, type FormEvent } from 'react';
import { Check, WarningCircle } from '@phosphor-icons/react';
import { api, ApiError } from '@/lib/api';
import { site } from '@/lib/config';
import { validate, type Errors } from '@/lib/contact';
import { Link } from '@/lib/router';

const DIVISIONS = [
  { value: 'unsure', label: 'Not sure' },
  { value: 'technology', label: 'Technology' },
  { value: 'perfumery', label: 'Perfumery' },
];

/** The one contact form, used on the contact page and at the end of the home page. */
export function ContactForm({ idPrefix = '' }: { idPrefix?: string }) {
  const [division, setDivision] = useState('unsure');
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const [failure, setFailure] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const values = {
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      message: String(data.get('message') ?? ''),
    };
    const found = validate(values);
    setErrors(found);
    const first = (['name', 'email', 'message'] as const).find((key) => found[key]);
    if (first) {
      // The error marks render after this; focus by name so the first wrong field is reached now.
      (form.elements.namedItem(first) as HTMLElement | null)?.focus();
      return;
    }
    setState('sending');
    try {
      await api('/inquiries', { method: 'POST', json: { ...values, division, company_website: String(data.get('company_website') ?? '') } });
      form.reset();
      setDivision('unsure');
      setState('sent');
    } catch (caught) {
      setFailure(caught instanceof ApiError && caught.status === 429 ? 'Too many messages in a short time. Wait a minute and try again.' : (caught as Error).message);
      setState('failed');
    }
  };

  const id = (name: string) => idPrefix + name;
  const field = (name: keyof Errors) => ({
    id: id(name),
    name,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? id(name) + '-error' : undefined,
    onBlur: () => errors[name] && setErrors((e) => ({ ...e, [name]: undefined })),
  });
  const count = Object.keys(errors).filter((key) => errors[key as keyof Errors]).length;

  return (
    <form className="stack" onSubmit={submit} noValidate>
      {state === 'sent' && (
        <div className="note" role="status">
          <Check size={20} aria-hidden="true" />
          <p><strong>Message sent.</strong> You’ll get a reply within two working days.</p>
        </div>
      )}
      {state === 'failed' && (
        <div className="note bad" role="alert">
          <WarningCircle size={20} aria-hidden="true" />
          <p>{failure} You can also email <a href={`mailto:${site.email}`}>{site.email}</a> directly.</p>
        </div>
      )}
      {count > 0 && (
        <div className="note bad" role="alert">
          <WarningCircle size={20} aria-hidden="true" />
          <p>{count === 1 ? 'One field needs' : `${count} fields need`} attention before this can be sent.</p>
        </div>
      )}
      {/* Hidden from people; a bot that fills every field fills this one too. */}
      <div className="sr" aria-hidden="true">
        <label htmlFor={id('company_website')}>Company website</label>
        <input id={id('company_website')} name="company_website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="two">
        <div>
          <label className="lbl" htmlFor={id('name')}>Name</label>
          <input className="field" type="text" autoComplete="name" required maxLength={120} {...field('name')} />
          {errors.name && <p className="err" id={id('name-error')}>{errors.name}</p>}
        </div>
        <div>
          <label className="lbl" htmlFor={id('email')}>Email</label>
          <input className="field" type="email" autoComplete="email" required maxLength={254} {...field('email')} />
          {errors.email && <p className="err" id={id('email-error')}>{errors.email}</p>}
        </div>
      </div>
      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="lbl">Which division?</legend>
        <div className="seg">
          {DIVISIONS.map((option) => (
            <label key={option.value}>
              <input type="radio" name="division" value={option.value} checked={division === option.value} onChange={() => setDivision(option.value)} />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label className="lbl" htmlFor={id('message')}>The problem</label>
        <textarea
          className="field"
          rows={5}
          required
          maxLength={5000}
          placeholder="What are you trying to build, or what is getting in the way?"
          {...field('message')}
        />
        {errors.message && <p className="err" id={id('message-error')}>{errors.message}</p>}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <button className="btn ink" type="submit" disabled={state === 'sending'}>
          {state === 'sending' ? 'Sending' : 'Send message'}
        </button>
        <p className="mu" style={{ margin: 0, fontSize: 14, maxWidth: '40ch' }}>
          Your name, email, and message are stored so they can be replied to. Nothing else is done with them. <Link href="/privacy">Privacy</Link>
        </p>
      </div>
    </form>
  );
}
