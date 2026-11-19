import type { ReactNode } from 'react';
import { Photo } from '@/components/ui';
import { PerfumeryMark } from '@/components/marks';
import { photos, principles, site } from '@/lib/config';
import { pad } from '@/lib/format';
import { pageTitle, useTitle } from '@/lib/hooks';

const NAME = [
  {
    term: 'Ralph',
    body: (
      <>
        From the Old Germanic <em>Radulf</em>: <em>rād</em>, counsel, and <em>wulf</em>, wolf. Literally, wise counsel. The wolf here is not a
        symbol of aggression. Wolves hunt by calculation, and live in a group.
      </>
    ),
  },
  { term: 'de', body: <>French and Italian for “of”. It marks where something comes from.</> },
  {
    term: 'Vinca',
    body: (
      <>
        The plant genus <em>Vinca</em>, known in Indonesia as tapak dara. From the Latin <em>vincire</em>, to bind. Vinca is evergreen, grows in
        shade, spreads slowly, and is almost impossible to kill.
      </>
    ),
  },
];

const SUBSTANCES = [
  {
    title: 'The first came from an interest.',
    body: 'Ralph de Vinca Perfumery was built not as a shop but as a place to understand scent: the structure of notes, the houses, the way a composition unfolds on skin. A project born from a hobby, built to a standard nobody was asking for.',
  },
  {
    title: 'The second came from outside.',
    body: 'An uncle asked for a website for his business, and Bali Cebelok Gesiuh followed: a booking platform for a traditional coconut oil experience passed down through generations. For the first time, the name was used to solve someone else’s problem.',
  },
  {
    title: 'The third came from campus.',
    body: 'Before PKKMB, a manual paper-based attendance process was replaced with a system that worked. Not a project that was requested. A project that was obviously needed.',
  },
];

const RULES = [
  {
    title: 'Own products never appear in editorial.',
    body: 'Not in rankings, not in recommendations, not in Academy material. This holds even if the product turns out to be the best one made.',
  },
  {
    title: 'Scent descriptions are written as they are, weaknesses included.',
    body: 'If it lasts four hours, it says four hours. This will look like a disadvantage at first. That is the point.',
  },
  {
    title: 'Ownership is stated openly.',
    body: 'Ralph de Vinca Perfumery owns its own fragrance house, and never reviews its own products.',
  },
];

export default function About() {
  useTitle(pageTitle('About'), 'The name, the thinking behind it, and how a group that covers fragrance and software came to exist.');

  return (
    <>
      <section className="wrap page-hero">
        <h1 className="disp">
          Wisdom that binds, and <span className="gold">endures.</span>
        </h1>
        <p className="lede" style={{ marginTop: 24 }}>The name came before anything it now stands for. This is what it turned out to mean.</p>
      </section>

      <Section id="the-name" label="The name" aside="Three parts">
        <dl style={{ margin: 0 }}>
          {NAME.map((part) => (
            <div key={part.term} className="name-row">
              <dt className="disp" style={{ fontSize: 'clamp(28px, 3vw, 44px)' }}>{part.term}</dt>
              <dd className="p" style={{ margin: 0 }}>{part.body}</dd>
            </div>
          ))}
        </dl>
        <p className="mono gold" style={{ margin: '28px 0 0' }}>Put together: wisdom that binds, and endures.</p>
      </Section>

      <Section id="what-this-is-built-on" label="What this is built on" aside="One roof">
        <div className="split">
          <p className="disp">Both are hidden compositions with consequences you can feel.</p>
          <div>
            <p className="p">
              Any group that covers more than one field has to answer one question before anything else: why do these things belong under one roof?
              Without an answer, a group is only a name attached to unrelated work.
            </p>
            <p className="p">
              The answer here is that perfume is invisible architecture that changes how a person feels, and good software works exactly the same
              way. Nobody sees a database schema or the decisions behind it, but everybody feels the difference between something that runs
              smoothly and something that hurts to use.
            </p>
            <p className="p">
              This was not decided first and proven later. It had already happened. The first thing built under this name was software about
              perfume.
            </p>
          </div>
        </div>
      </Section>

      <Section id="how-it-happened" label="How it happened" aside="Name first">
        <div className="split" style={{ marginBottom: 40 }}>
          <p className="disp">The name existed first. The substance came after.</p>
          <div>
            <p className="p">
              The name was chosen while changing a username in a game. It was picked because it sounded French, like something with a long history,
              at a point when it had no history at all.
            </p>
            <p className="p">What followed ran opposite to the way most companies begin.</p>
          </div>
        </div>
        <div className="cards" style={{ marginBottom: 40 }}>
          {SUBSTANCES.map((item, index) => (
            <div key={item.title} className={'card ' + ['goldfill', 'night', 'paper'][index]}>
              <span className="mono">Substance {pad(index + 1)}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
        <div className="split">
          <span />
          <div>
            <p className="p">
              The three look unrelated: fragrance, tourism, a campus system. The pattern is clear from a distance: all three are invisible
              structures that change how people experience something.
            </p>
            <p className="p">Ralph de Vinca Group was not designed on paper. It was noticed, after the pattern had already happened.</p>
            <p className="p">
              One detail is worth keeping. Perfumery was built first, and paid work arrived afterward. The work came because the hobby was taken
              seriously, not the other way around.
            </p>
          </div>
        </div>
      </Section>

      <Section id="four-principles" label="Four principles" aside="Taken from the name">
        <div className="cards">
          {principles.map((principle) => (
            <div key={principle.name} className="card">
              <h3>{principle.name}</h3>
              <p>{principle.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="the-founder" label="The founder" aside="Not a team · just me">
        <div className="split">
          <div>
            <p className="disp" style={{ marginBottom: 28 }}>
              Ralph de Vinca is run by <span className="gold">one person.</span>
            </p>
            <Photo
              src={photos.founder.src}
              alt={photos.founder.alt}
              ratio="3 / 4"
              style={{ maxWidth: 340 }}
              fallback={<PerfumeryMark size={96} className="gold" />}
            />
          </div>
          <div>
            <p className="p">
              Adrian, based in {site.location}. Studying Informatics at INSTIKI, with a focus on data and information management. Perfumery is the
              interest taken seriously. Technology is the training put to use. The group exists so neither one has to be given up.
            </p>
            <p className="p">
              There is no team here, and no reason to pretend there is. A message sent through this site reaches the person who will do the work.
            </p>
          </div>
        </div>
      </Section>

      <Section id="editorial-commitment" label="Editorial commitment" aside="Three rules">
        <div className="split" style={{ marginBottom: 32 }}>
          <p className="disp">Honesty only means something when it costs something.</p>
          <div>
            <p className="p">
              Ralph de Vinca Perfumery will eventually sell a fragrance of its own. That creates a conflict worth naming before it exists, rather
              than after someone points it out.
            </p>
            <p className="p">Three rules apply without exception.</p>
          </div>
        </div>
        <ol className="rows">
          {RULES.map((rule, index) => (
            <li key={rule.title}>
              <span className="n">{pad(index + 1)}</span>
              <h3>{rule.title}</h3>
              <p>{rule.body}</p>
            </li>
          ))}
        </ol>
        <p className="p" style={{ marginTop: 32 }}>
          Discovery and education stay structurally separate from anything for sale. A visitor always knows which side of the line they are on.
        </p>
      </Section>
    </>
  );
}

function Section({ id, label, aside, children }: { id: string; label: string; aside: string; children: ReactNode }) {
  return (
    <section className="sec" id={id}>
      <div className="wrap">
        <div className="sec-head">
          <h2 className="mono gold" style={{ margin: 0 }}>{label}</h2>
          <p className="mono mu" style={{ margin: 0 }}>{aside}</p>
        </div>
        {children}
      </div>
    </section>
  );
}
