import { Win } from '@/components/hud';
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
    body: 'Messages are stored in a MySQL database reachable only by the server that runs this site.',
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
      <section className="intro" style={{ paddingBottom: 88 }}>
        <div className="wrap g12 end">
          <div className="span-8">
            <p className="m" style={{ margin: '0 0 16px' }}>[ Privacy ]</p>
            <h1 className="h1" style={{ fontSize: 'clamp(48px, 6.4vw, 100px)' }}>What happens to your information.</h1>
          </div>
          <Win className="span-r4" title="Scope" tag="/05">
            <p className="m" style={{ margin: '0 0 12px' }}>
              This page covers the only information this site collects.
              <br />
              <span className="ac">→ Tracking cookies · none</span>
            </p>
            <div className="bars" aria-hidden="true" />
          </Win>
        </div>
      </section>
      <section className="sec">
        <div className="wrap">
          {ITEMS.map((item, index) => (
            <div key={item.title} className="row base">
              <span className="m mu" style={{ gridColumn: '1 / 2' }}>{pad(index + 1)}</span>
              <h2 className="h3" style={{ gridColumn: '2 / 6' }}>{item.title}</h2>
              <p className="p" style={{ gridColumn: '6 / 13', margin: 0 }}>{item.body}</p>
            </div>
          ))}
          <p className="m mu" style={{ margin: '28px 0 0' }}>Last updated: October 2026</p>
        </div>
      </section>
    </>
  );
}
