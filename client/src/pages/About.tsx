import { Photo, SectionLabel, Win } from '@/components/hud';
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
      <section className="intro">
        <div className="wrap g12 end">
          <div className="span-8">
            <p className="m" style={{ margin: '0 0 16px' }}>[ About the group ]</p>
            <h1 className="h1">
              Wisdom that binds, and <span className="ac">endures.</span>
            </h1>
          </div>
          <Win className="span-r4" title="Ralph de Vinca" tag="/00">
            <p className="p sm">The name came before anything it now stands for. This is what it turned out to mean.</p>
            <div className="bars" aria-hidden="true" />
          </Win>
        </div>
      </section>

      <section className="sec" id="the-name">
        <div className="wrap">
          <SectionLabel label="01 / The name" aside="Three parts" />
          <dl style={{ margin: 0 }}>
            {NAME.map((part) => (
              <div key={part.term} className="row base">
                <dt className="h2" style={{ gridColumn: '1 / 6' }}>{part.term}</dt>
                <dd className="p" style={{ gridColumn: '6 / 13', margin: 0 }}>{part.body}</dd>
              </div>
            ))}
          </dl>
          <p className="m ac" style={{ margin: '28px 0 0' }}>→ Put together: wisdom that binds, and endures.</p>
        </div>
      </section>

      <section className="sec" id="what-this-is-built-on">
        <div className="wrap">
          <SectionLabel label="02 / What this is built on" aside="One roof" />
          <div className="g12">
            <p className="h3 lg c-l">Both are hidden compositions with consequences you can feel.</p>
            <div className="c-r">
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
        </div>
      </section>

      <section className="sec" id="how-it-happened">
        <div className="wrap">
          <SectionLabel label="03 / How it happened" aside="Name first" />
          <div className="g12" style={{ marginBottom: 56 }}>
            <p className="h3 lg c-l">The name existed first. The substance came after.</p>
            <div className="c-r">
              <p className="p">
                The name was chosen while changing a username in a game. It was picked because it sounded French, like something with a long history,
                at a point when it had no history at all.
              </p>
              <p className="p">What followed ran opposite to the way most companies begin.</p>
            </div>
          </div>
          <div className="cards" style={{ marginBottom: 56 }}>
            {SUBSTANCES.map((item, index) => (
              <Win key={item.title} title={`Substance ${pad(index + 1)}`}>
                <h3 className="h3" style={{ fontSize: 22, marginBottom: 10 }}>{item.title}</h3>
                <p className="p sm">{item.body}</p>
              </Win>
            ))}
          </div>
          <div className="g12">
            <div className="c-r">
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
        </div>
      </section>

      <section className="sec" id="four-principles">
        <div className="wrap">
          <SectionLabel label="04 / Four principles" aside="Taken from the name" />
          <div className="cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '32px 24px' }}>
            {principles.map((principle, index) => (
              <div key={principle.name} className="rule-top">
                <p className="m ac" style={{ margin: '0 0 20px' }}>{pad(index + 1)}</p>
                <h3 className="h3" style={{ marginBottom: 10 }}>{principle.name}</h3>
                <p className="p sm">{principle.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" id="the-founder">
        <div className="wrap">
          <SectionLabel label="05 / The founder" aside="Not a team · just me" />
          <div className="g12" style={{ rowGap: 32 }}>
            <div className="c-l">
              <p className="h3 lg" style={{ marginBottom: 28 }}>
                Ralph de Vinca is run by <span className="ac">one person.</span>
              </p>
              <Photo
                src={photos.founder.src}
                alt={photos.founder.alt}
                ratio="4 / 5"
                style={{ maxWidth: 340 }}
                fallback={<PerfumeryMark size={96} className="ac" />}
              />
            </div>
            <div className="c-r">
              <p className="p">
                Adrian, based in {site.location}. Studying Informatics at INSTIKI, with a focus on data and information management. Perfumery is the
                interest taken seriously. Technology is the training put to use. The group exists so neither one has to be given up.
              </p>
              <p className="p">
                There is no team here, and no reason to pretend there is. A message sent through this site reaches the person who will do the work.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="sec" id="editorial-commitment">
        <div className="wrap">
          <SectionLabel label="06 / Editorial commitment" aside="Three rules" />
          <div className="g12" style={{ marginBottom: 48 }}>
            <p className="h3 lg c-l">Honesty only means something when it costs something.</p>
            <div className="c-r">
              <p className="p">
                Ralph de Vinca Perfumery will eventually sell a fragrance of its own. That creates a conflict worth naming before it exists, rather
                than after someone points it out.
              </p>
              <p className="p">Three rules apply without exception.</p>
            </div>
          </div>
          <ol className="list">
            {RULES.map((rule, index) => (
              <li key={rule.title} className="row">
                <span className="n" style={{ gridColumn: '1 / 3' }}>{pad(index + 1)}</span>
                <div style={{ gridColumn: '3 / 12' }}>
                  <h3 className="h3" style={{ marginBottom: 8 }}>{rule.title}</h3>
                  <p className="p">{rule.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="p" style={{ marginTop: 32 }}>
            Discovery and education stay structurally separate from anything for sale. A visitor always knows which side of the line they are on.
          </p>
        </div>
      </section>
    </>
  );
}
