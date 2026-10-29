import type { ReactNode } from 'react';
import { Arrow, Photo, ProjectCta, SectionLabel, Stage } from '@/components/hud';
import { PerfumeryMark, TechnologyMark } from '@/components/marks';
import { photos } from '@/lib/config';
import { pageTitle, useTitle } from '@/lib/hooks';
import { Link } from '@/lib/router';

// Perfumery and Technology share one page shape: a stage, then numbered sections.
interface DivisionPageProps {
  index: string;
  name: string;
  line: ReactNode;
  description: string;
  short: string;
  mark: ReactNode;
  photo: { src: string | null; alt: string };
  callouts: { title: string; body: string }[];
  window: { title: string; body: ReactNode };
  children: ReactNode;
}

function DivisionPage({ index, name, line, description, short, mark, photo, callouts, window: win, children }: DivisionPageProps) {
  useTitle(pageTitle(name), description);
  return (
    <>
      <Stage
        title={
          <>
            <p className="m" style={{ margin: '0 0 10px' }}>
              Ralph de Vinca <span className="mu">[ division {index} ]</span>
            </p>
            <h1 className="h1" style={{ fontSize: 'clamp(48px, 5.6vw, 84px)' }}>{name}</h1>
            <p className="h3" style={{ marginTop: 14, maxWidth: '18ch' }}>{line}</p>
          </>
        }
        caption={`Fig. ${index} · ${name} mark`}
        objects={mark}
        callouts={callouts}
        window={{ title: win.title, tag: `/${index}`, body: win.body }}
        corner={
          <>
            <p className="m" style={{ margin: '0 0 10px' }}>[ In short ]</p>
            <p className="p sm rule-top">{short}</p>
            <div className="bars" aria-hidden="true" style={{ width: 180 }} />
          </>
        }
      />
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
      <div className="wrap">
        <SectionLabel label={label} aside={aside} />
        <div className="g12">
          <div className="c-l">{lead}</div>
          <div className="c-r">{children}</div>
        </div>
      </div>
    </section>
  );
}

export function Perfumery() {
  return (
    <DivisionPage
      index="01"
      name="Perfumery"
      line={<>Fragrance, explained rather than <span className="ac">sold.</span></>}
      description="A platform for understanding fragrance: houses, notes, and how a composition unfolds. Explained rather than sold."
      short="Perfumery is the culture side of the group. It exists to make scent understandable, not to move product."
      mark={
        <div className="obj on ac">
          <PerfumeryMark size={440} label="The Perfumery mark: a five-petal vinca flower" />
        </div>
      }
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
            <span className="ac">→ Nothing for sale.</span>
          </>
        ),
      }}
    >
      <Split label="01 / What it is" aside="Built first" lead={<p className="h3 lg">Built without a client, a deadline, or a business plan.</p>}>
        <p className="p">
          Ralph de Vinca Perfumery is a platform for people who want to know what they are smelling. Houses, notes, and the way a composition changes
          over the hours it is worn, laid out as structured information rather than marketing copy.
        </p>
        <p className="p">It was the first thing built under this name.</p>
      </Split>
      <Split label="02 / The approach" aside="No rankings" lead={<p className="h2" style={{ fontSize: 52 }}>There is no best <span className="ac">fragrance.</span></p>}>
        <p className="p">
          There is only the right one for a person, a climate, and an occasion, and in Bali that usually means heat and humidity, which changes the
          answer considerably.
        </p>
        <p className="p">Nothing on the platform is ranked to serve a sale, because nothing on the platform is for sale.</p>
      </Split>
      <Split label="03 / What comes next" aside="Learning stage" lead={<p className="h3 lg">The category was studied first.</p>}>
        <p className="p">
          Perfumery will become the home of a niche fragrance composed in-house. That work is at the learning stage. There is no product, no release
          date, and nothing to reserve.
        </p>
        <p className="p">
          The order is deliberate. Most independent brands release a bottle first and learn the category afterward. Here the category was studied
          first, and nothing has been added to it yet.
        </p>
      </Split>
      <Split label="04 / A note on independence" aside="Kept separate" lead={null}>
        <p className="p">
          When there is eventually something to sell, it will be kept structurally separate from everything above, and own products will never appear
          in rankings or recommendations.
        </p>
        <Link className="tl" href="/about#editorial-commitment">Read the editorial commitment <Arrow /></Link>
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
      index="02"
      name="Technology"
      line={<>Systems that <span className="ac">hold.</span></>}
      description="Websites and internal systems for businesses and institutions in Bali, built so the decisions hold."
      short="Technology builds websites and internal systems for businesses and institutions."
      mark={
        <div className="obj on">
          <TechnologyMark size={440} label="The Technology mark: the vinca drawn as a faceted structure" />
        </div>
      }
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
            <span className="ac">→ Nothing torn down halfway.</span>
          </>
        ),
      }}
    >
      <Split label="01 / What this division does" aside="The whole job" lead={<p className="h2" style={{ fontSize: 52 }}>That is the whole <span className="ac">job.</span></p>}>
        <p className="p">
          Most small businesses and institutions do not need something impressive. They need something that works on the day it matters, and keeps
          working afterward without anyone thinking about it.
        </p>
      </Split>
      <Split label="02 / How the work is made" aside="Method, not speed" lead={<p className="h3 lg">Delivery time is not promised in advance. The method is.</p>}>
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
          <SectionLabel label="03 / How a project runs" aside="Four stages" />
          <ol className="list">
            {STAGES.map((stage, index) => (
              <li key={stage.title} className="row base">
                <span className="n" style={{ gridColumn: '1 / 3' }}>0{index + 1}</span>
                <h3 className="h3" style={{ gridColumn: '3 / 7' }}>{stage.title}</h3>
                <p className="p" style={{ gridColumn: '7 / 13', margin: 0 }}>{stage.body}</p>
              </li>
            ))}
          </ol>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '8px 24px', marginTop: 40 }}>
            <h3 className="m" style={{ margin: 0 }}>[ Tools ]</h3>
            <p className="m mu" style={{ margin: 0 }}>React · TypeScript · NestJS · PostgreSQL · Supabase · Laravel</p>
          </div>
        </div>
      </section>
      <ProjectCta
        label="04 / Start a project"
        heading={<>Describe the problem, not the <span className="ac">solution.</span></>}
        body="The problem is usually more useful. Tell me what is slow, manual, or missing, and I'll tell you whether it's something I can fix."
      />
    </DivisionPage>
  );
}
