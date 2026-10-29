import { useState, type FormEvent } from 'react';
import { Check, WarningCircle } from '@phosphor-icons/react';
import { Arrow, SectionLabel, Win } from '@/components/hud';
import { api, ApiError } from '@/lib/api';
import { site } from '@/lib/config';
import { validate, type Errors } from '@/lib/contact';
import { pageTitle, useTitle } from '@/lib/hooks';
import { Link } from '@/lib/router';

const DIVISIONS = [
  { value: 'unsure', label: 'Not sure' },
  { value: 'technology', label: 'Technology' },
  { value: 'perfumery', label: 'Perfumery' },
];


export default function Contact() {
  useTitle(pageTitle('Contact'), 'Describe the problem and get a direct reply within two working days.');
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
    if (Object.keys(found).length) {
      form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }

    setState('sending');
    try {
      await api('/inquiries', {
        method: 'POST',
        json: { ...values, division, company_website: String(data.get('company_website') ?? '') },
      });
      form.reset();
      setDivision('unsure');
      setState('sent');
    } catch (caught) {
      setFailure(caught instanceof ApiError && caught.status === 429 ? 'Too many messages in a short time. Wait a minute and try again.' : (caught as Error).message);
      setState('failed');
    }
  };

  const count = Object.keys(errors).length;
  const field = (name: keyof Errors) => ({
    id: name,
    name,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
    onBlur: () => errors[name] && setErrors((e) => ({ ...e, [name]: undefined })),
  });

  return (
    <>
      <section className="intro" style={{ paddingBottom: 88 }}>
        <div className="wrap g12 end">
          <div className="span-8">
            <p className="m" style={{ margin: '0 0 16px' }}>[ Contact ]</p>
            <h1 className="h1" style={{ fontSize: 'clamp(56px, 8vw, 128px)' }}>
              Start a <span className="ac">project.</span>
            </h1>
            <p className="lede" style={{ marginTop: 24 }}>
              Tell me what the problem is, rather than what you think the solution should be. The problem is usually the more useful half.
            </p>
          </div>
          <Win className="span-r4" title="Direct line" tag="/04">
            <dl className="facts m">
              <dt className="mu">Location</dt>
              <dd>{site.location}</dd>
              <dt className="mu">Email</dt>
              <dd style={{ textTransform: 'none' }}>
                <a href={`mailto:${site.email}`} style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44 }}>{site.email}</a>
              </dd>
              <dt className="mu">Reply</dt>
              <dd>Within two working days</dd>
            </dl>
          </Win>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <SectionLabel label="The form" aside="The one form on the site" />
          <div className="g12" style={{ rowGap: 40, alignItems: 'start' }}>
            <div className="c-l">
              <p className="p"><strong>What I take on:</strong> websites for businesses, internal systems, and platforms that need their data organised properly.</p>
              <p className="p"><strong>What I don’t:</strong> anything I can’t do well. I’ll say so directly rather than take the work.</p>
              <p className="p">
                Messages arrive with me, not with a team. You’ll get a reply within two working days, and it will be an actual answer rather than a
                link to book a call.
              </p>
            </div>
            <Win className="c-r" title="Message · to Adrian" bodyClass="win-c lg">
              {state === 'sent' && (
                <div className="note" role="status" style={{ marginBottom: 28 }}>
                  <Check size={20} aria-hidden="true" />
                  <p><strong>Message sent.</strong> You’ll get a reply within two working days.</p>
                </div>
              )}
              {state === 'failed' && (
                <div className="note bad" role="alert" style={{ marginBottom: 28 }}>
                  <WarningCircle size={20} aria-hidden="true" />
                  <p>
                    {failure} You can also email <a href={`mailto:${site.email}`}>{site.email}</a> directly.
                  </p>
                </div>
              )}
              {count > 0 && (
                <div className="note bad" role="alert" style={{ marginBottom: 28 }}>
                  <WarningCircle size={20} aria-hidden="true" />
                  <p>{count === 1 ? 'One field needs' : `${count} fields need`} attention before this can be sent. Each one is marked below.</p>
                </div>
              )}
              <form className="stack" onSubmit={submit} noValidate>
                {/* Hidden from people; a bot that fills every field fills this one too. */}
                <div className="sr" aria-hidden="true">
                  <label htmlFor="company_website">Company website</label>
                  <input id="company_website" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
                </div>
                <div className="two">
                  <div>
                    <label className="lbl" htmlFor="name">Name</label>
                    <input className="field" type="text" autoComplete="name" required maxLength={120} {...field('name')} />
                    {errors.name && <p className="err" id="name-error">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="lbl" htmlFor="email">Email</label>
                    <input className="field" type="email" autoComplete="email" required maxLength={254} {...field('email')} />
                    {errors.email && <p className="err" id="email-error">{errors.email}</p>}
                  </div>
                </div>
                <fieldset>
                  <legend className="lbl" style={{ marginBottom: 10 }}>Which division?</legend>
                  <div className="seg">
                    {DIVISIONS.map((option) => (
                      <label key={option.value} className={'chip t' + (division === option.value ? ' on' : '')}>
                        <input
                          type="radio"
                          name="division"
                          value={option.value}
                          checked={division === option.value}
                          onChange={() => setDivision(option.value)}
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div>
                  <label className="lbl" htmlFor="message">Message</label>
                  <textarea
                    className="field"
                    rows={6}
                    required
                    maxLength={5000}
                    placeholder="What are you trying to build, or what's currently getting in the way?"
                    {...field('message')}
                  />
                  {errors.message && <p className="err" id="message-error">{errors.message}</p>}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <button className="btn" type="submit" disabled={state === 'sending'}>
                    {state === 'sending' ? 'Sending…' : 'Send message'} <Arrow />
                  </button>
                  <p className="mu" style={{ margin: 0, fontSize: 14, maxWidth: '40ch' }}>
                    Your name, email, and message are stored so they can be replied to. Nothing else is done with them.{' '}
                    <Link href="/privacy">Privacy</Link>
                  </p>
                </div>
              </form>
            </Win>
          </div>
        </div>
      </section>
    </>
  );
}
