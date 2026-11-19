import type { ReactNode } from 'react';
import { EmbossMark, Photo, ProjectCta } from '@/components/ui';
import { pad } from '@/lib/format';
import { photos } from '@/lib/config';
import { pageTitle, useTitle } from '@/lib/hooks';
import { Link } from '@/lib/router';

// Perfumery and Technology share one page shape: a hero with the embossed mark, three offers, then its sections.
interface DivisionPageProps {
  name: string;
  kind: 'perfumery' | 'technology';
  line: ReactNode;
  description: string;
  short: string;
  photo: { src: string | null; alt: string };
  callouts: { title: string; body: string }[];
  window: { title: string; body: ReactNode };
  children: ReactNode;
}

function DivisionPage({ name, kind, line, description, short, photo, callouts, window: win, children }: DivisionPageProps) {
  useTitle(pageTitle(name), description);
  return (
    <>
      <section className="wrap div-hero" aria-label="Introduction">
        <div>
          <h1 className="disp">{name}</h1>
          <p className="line">{line}</p>
          <p className="lede" style={{ marginTop: 18 }}>{short}</p>
          <div className="status">
            <p className="mono mu" style={{ margin: '0 0 6px' }}>{win.title}</p>
            <p className="mono" style={{ margin: 0 }}>{win.body}</p>
          </div>
        </div>
        <div className="div-mark">
          <span className="ring" style={{ width: '92%' }} aria-hidden="true" />
          <span className="ring" aria-hidden="true" />
          <EmbossMark kind={kind} />
        </div>
      </section>
      <section className="wrap" aria-labelledby="offers" style={{ paddingBottom: 72 }}>
        <h2 id="offers" className="sr">What it offers</h2>
        <div className="cards">
          {callouts.map((callout) => (
            <div key={callout.title} className="card">
              <h3>{callout.title}</h3>
              <p>{callout.body}</p>
            </div>
          ))}
        </div>
      </section>
      {children}
      {photo.src && (
        <section className="sec">
          <div className="wrap">
            <Photo src={photo.src} alt={photo.alt} ratio="21 / 9" />
          </div>
        </section>
      )}
    </>
  );
}

function Split({ label, aside, lead, children }: { label: string; aside: string; lead: ReactNode; children: ReactNode }) {
  return (
    <section className="sec">
      <div className="wrap split">
        <div>
          {lead}
          <p className="mono mu" style={{ margin: '14px 0 0' }}>{label} · {aside}</p>
        </div>
        <div>{children}</div>
      </div>
    </section>
  );
}

export function Perfumery() {
  return (
    <DivisionPage
      name="Perfumery"
      line={<>Fragrance, explained rather than <span className="gold">sold.</span></>}
      description="A platform for understanding fragrance: houses, notes, and how a composition unfolds. Explained rather than sold."
      short="Perfumery is the culture side of the group. It exists to make scent understandable, not to move product."
      kind="perfumery"
      photo={photos.perfumery}
      callouts={[
        { title: 'Explore fragrances', body: 'Browse by house, by note, or by how a scent is put together.' },
        { title: 'Understand notes', body: 'What a note is, what it does inside a composition, and why it behaves differently in different hands.' },
        { title: 'Academy', body: 'The vocabulary and structure of perfumery, for people starting out.' },
      ]}
      window={{
        title: 'Status',
        body: (
          <>
            Platform · live, ongoing
            <br />
            Own fragrance · learning stage
            <br />
            <span className="gold">Nothing for sale.</span>
          </>
        ),
      }}
    >
      <Split label="What it is" aside="Built first" lead={<h2 className="disp">Built without a client, a deadline, or a business plan.</h2>}>
        <p className="p">
          Ralph de Vinca Perfumery is a platform for people who want to know what they are smelling. Houses, notes, and the way a composition changes
          over the hours it is worn, laid out as structured information rather than marketing copy.
        </p>
        <p className="p">It was the first thing built under this name.</p>
      </Split>
      <Split label="The approach" aside="No rankings" lead={<h2 className="disp">There is no best <span className="gold">fragrance.</span></h2>}>
        <p className="p">
          There is only the right one for a person, a climate, and an occasion, and in Bali that usually means heat and humidity, which changes the
          answer considerably.
        </p>
        <p className="p">Nothing on the platform is ranked to serve a sale, because nothing on the platform is for sale.</p>
      </Split>
      <Split label="What comes next" aside="Learning stage" lead={<h2 className="disp">The category was studied first.</h2>}>
        <p className="p">
          Perfumery will become the home of a niche fragrance composed in-house. That work is at the learning stage. There is no product, no release
          date, and nothing to reserve.
        </p>
        <p className="p">
          The order is deliberate. Most independent brands release a bottle first and learn the category afterward. Here the category was studied
          first, and nothing has been added to it yet.
        </p>
      </Split>
      <Split label="A note on independence" aside="Kept separate" lead={null}>
        <p className="p">
          When there is eventually something to sell, it will be kept structurally separate from everything above, and own products will never appear
          in rankings or recommendations.
        </p>
        <Link className="tl" href="/about#editorial-commitment">Read the editorial commitment</Link>
      </Split>
    </DivisionPage>
  );
}

const STAGES = [
  { title: 'A conversation', body: 'You describe the problem. No commitment and no charge at this stage.' },
  { title: 'Scope and estimate', body: 'What will be built, what will not, and what it costs. In writing, before anything begins.' },
  { title: 'Building', body: 'Regular updates, so you always know where things stand without having to ask.' },
  { title: 'Handover and support', body: 'You receive the working system, and a period of support after it goes live.' },
];

export function Technology() {
  return (
    <DivisionPage
      name="Technology"
      line={<>Systems that <span className="gold">hold.</span></>}
      description="Websites and internal systems for businesses and institutions in Bali, built so the decisions hold."
      short="Technology builds websites and internal systems for businesses and institutions."
      kind="technology"
      photo={photos.technology}
      callouts={[
        { title: 'A website for a business', body: 'A place people can find you, understand what you offer, and get in touch or book.' },
        { title: 'An internal system', body: 'Attendance, records, bookings, scheduling. Anything held together by spreadsheets, paper, and memory.' },
        { title: 'A data-driven platform', body: 'For information that needs structure rather than pages: catalogues, directories, archives.' },
      ]}
      window={{
        title: 'Method',
        body: (
          <>
            Delivery time · decided by scope
            <br />
            Architecture · decided at the start
            <br />
            <span className="gold">Nothing torn down halfway.</span>
          </>
        ),
      }}
    >
      <Split label="What this division does" aside="The whole job" lead={<h2 className="disp">That is the whole <span className="gold">job.</span></h2>}>
        <p className="p">
          Most small businesses and institutions do not need something impressive. They need something that works on the day it matters, and keeps
          working afterward without anyone thinking about it.
        </p>
      </Split>
      <Split label="How the work is made" aside="Method, not speed" lead={<h2 className="disp">Delivery time is not promised in advance. The method is.</h2>}>
        <p className="p">Scope decides delivery time, and every project has a different one.</p>
        <p className="p">
          Architectural decisions are made correctly at the start, so nothing has to be torn down halfway through. This removes rework, and it is the
          reason a system can still be finished when there is very little time left.
        </p>
        <p className="p">
          The PKKMB attendance system was finished in one week because the deadline left one week. That shows what is possible when circumstances
          demand it. It is not a service standard.
        </p>
      </Split>
      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <h2 className="mono gold" style={{ margin: 0 }}>How a project runs</h2>
            <p className="mono mu" style={{ margin: 0 }}>Four stages</p>
          </div>
          <ol className="rows">
            {STAGES.map((stage, index) => (
              <li key={stage.title}>
                <span className="n">{pad(index + 1)}</span>
                <h3>{stage.title}</h3>
                <p>{stage.body}</p>
              </li>
            ))}
          </ol>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '8px 24px', marginTop: 32 }}>
            <h3 className="mono" style={{ margin: 0 }}>Tools</h3>
            <p className="mono mu" style={{ margin: 0 }}>React · TypeScript · NestJS · PostgreSQL · Supabase · Laravel</p>
          </div>
        </div>
      </section>
      <ProjectCta
        heading={<>Describe the problem, not the <span className="gold">solution.</span></>}
        body="The problem is usually more useful. Tell me what is slow, manual, or missing, and I'll tell you whether it's something I can fix."
      />
    </DivisionPage>
  );
}
