import { site } from '@/lib/config';
import { pad } from '@/lib/format';
import { pageTitle, useTitle } from '@/lib/hooks';

const ITEMS = [
  {
    title: 'What is collected',
    body: 'When you send a message through the contact form: your name, your email address, your message, the division you selected, and the IP address the message was sent from.',
  },
  {
    title: 'Why',
    body: 'Your name, email, and message exist so the message can be answered. The IP address is kept only to identify automated abuse of the form.',
  },
  {
    title: 'What is not done',
    body: 'Nothing is sold, shared, or passed to advertisers. There is no analytics tracking, no advertising pixel, and no third-party script watching what you do on this site.',
  },
  {
    title: 'Where it is stored',
    body: 'Messages are stored in a Supabase database hosted in Singapore, reachable only by the server that runs this site.',
  },
  { title: 'How long it is kept', body: 'Messages are kept while the conversation is useful, and deleted on request.' },
  {
    title: 'Your choices',
    body: (
      <>
        Write to <a href={`mailto:${site.email}`}>{site.email}</a> to ask what is held about you, to correct it, or to have it deleted. Requests are
        answered within seven days.
      </>
    ),
  },
  {
    title: 'Cookies',
    body: 'Visitors get no cookies and no tracking. The only stored session belongs to the site owner when signed in to the admin.',
  },
];

export default function Privacy() {
  useTitle(pageTitle('Privacy'), 'What this site collects, why, and how to have it removed.');
  return (
    <>
      <section className="wrap page-hero split" style={{ alignItems: 'end' }}>
        <div>
          <h1 className="disp">What happens to your information.</h1>
        </div>
        <div className="status" style={{ marginTop: 0 }}>
          <p className="mono" style={{ margin: 0 }}>This page covers the only information this site collects.</p>
          <p className="mono gold" style={{ margin: 0 }}>Tracking cookies · none</p>
        </div>
      </section>
      <section className="sec">
        <div className="wrap">
          <ol className="rows">
            {ITEMS.map((item, index) => (
              <li key={item.title}>
                <span className="n">{pad(index + 1)}</span>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>{item.title}</h2>
                <p>{item.body}</p>
              </li>
            ))}
          </ol>
          <p className="mono mu" style={{ margin: '28px 0 0' }}>Last updated: November 2026</p>
        </div>
      </section>
    </>
  );
}
