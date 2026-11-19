import { ContactForm } from '@/components/contact-form';
import { site } from '@/lib/config';
import { pageTitle, useTitle } from '@/lib/hooks';

export default function Contact() {
  useTitle(pageTitle('Contact'), 'Describe the problem and get a direct reply within two working days.');

  return (
    <>
      <section className="wrap page-hero split" style={{ alignItems: 'end' }}>
        <div>
          <h1 className="disp">
            Start a <span className="gold">project.</span>
          </h1>
          <p className="lede" style={{ marginTop: 24 }}>
            Tell me what the problem is, rather than what you think the solution should be. The problem is usually the more useful half.
          </p>
        </div>
        <dl className="facts">
          <div><dt>Location</dt><dd>{site.location}</dd></div>
          <div><dt>Email</dt><dd><a href={`mailto:${site.email}`} style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44 }}>{site.email}</a></dd></div>
          <div><dt>Reply</dt><dd>Within two working days</dd></div>
        </dl>
      </section>

      <section className="sec">
        <div className="wrap split">
          <div>
            <p className="p"><strong>What I take on:</strong> websites for businesses, internal systems, and platforms that need their data organised properly.</p>
            <p className="p"><strong>What I don’t:</strong> anything I can’t do well. I’ll say so directly rather than take the work.</p>
            <p className="p">
              Messages arrive with me, not with a team. You’ll get a reply within two working days, and it will be an actual answer rather than a
              link to book a call.
            </p>
          </div>
          <div className="card paper" style={{ padding: 28 }}>
            <h2 className="mono mu" style={{ margin: '0 0 8px', fontSize: 11 }}>Message · to Adrian</h2>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
