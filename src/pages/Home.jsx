import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Reveal, Counter } from "../hooks";
import {
  Section,
  Head,
  card,
  btnPrimary,
  btnGhost,
} from "../components/Layout";
import { Thumb, Tags, ProjectLinks } from "../components/Project";
import { offers, techs } from "../data";
import { useContent } from "../lib/content";

function Hero() {
  const { profile, t } = useContent();
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-12 pt-6 md:grid-cols-2 md:pt-10">
      <div className="order-2 md:order-1">
        <span className="inline-flex items-center gap-2 rounded-full border border-ember/40 bg-ember/10 px-4 py-1.5 text-sm font-semibold text-ember">
          <span className="h-2 w-2 animate-pulse rounded-full bg-ember" />
          {profile.badge}
        </span>
        <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.05] md:text-7xl">
          {profile.name}
        </h1>
        <p className="mt-4 bg-gradient-to-r from-ember to-volt bg-clip-text font-display text-2xl font-bold text-transparent">
          {profile.title}
        </p>
        <p className="mt-5 max-w-md text-lg text-white/70">{profile.tagline}</p>
        <a href="#projects" className={`${btnPrimary} mt-8`}>
          {t("homeCta")}
        </a>
      </div>
      <div className="order-1 mx-auto w-full max-w-[18rem] md:order-2 md:max-w-sm">
        <div className="unveil relative aspect-square">
          {/* soft glow */}
          <div className="absolute -inset-4 animate-pulse rounded-full bg-gradient-to-br from-ember/50 to-volt/50 blur-3xl" />
          {/* thin outer orbit ring */}
          <div className="absolute -inset-3 rounded-full border border-ember/30" />
          {/* gradient ring + photo */}
          <div className="relative h-full w-full rounded-full bg-gradient-to-br from-ember to-volt p-[3px]">
            <div className="h-full w-full overflow-hidden rounded-full bg-gradient-to-b from-panel to-ink">
              <img
                src={profile.photo}
                alt={`Portrait of ${profile.name}`}
                className="h-full w-full object-cover object-top"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const { stats } = useContent();
  return (
    <Section pad="py-10">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal
            key={s.label}
            delay={i * 100}
            className={`${card} p-6 text-center`}
          >
            <p className="bg-gradient-to-r from-ember to-volt bg-clip-text font-display text-4xl font-extrabold text-transparent md:text-5xl">
              <Counter to={s.to} suffix={s.suffix} />
            </p>
            <p className="mt-2 text-sm text-white/60">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function Teaser() {
  const { t } = useContent();
  return (
    <Section>
      <Head title={t("homeTeaserTitle")} text={t("homeTeaserText")} />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {offers.map(({ icon: Icon, title, text }, i) => (
          <Reveal key={title} delay={i * 90}>
            <div className={`${card} h-full p-6`}>
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-gradient-to-br from-ember/25 to-volt/25 text-ember">
                <Icon size={22} />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
              <p className="mt-1 text-sm text-white/65">{text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function Featured() {
  const { projects, t } = useContent();
  return (
    <Section id="projects">
      <Head title={t("homeFeaturedTitle")} text={t("homeFeaturedText")} />
      <div className="grid gap-6 md:grid-cols-2">
        {projects
          .filter((p) => p.featured)
          .map((p, i) => (
            <Reveal key={p.title} delay={(i % 2) * 120}>
              <article className={`group overflow-hidden ${card} h-full`}>
                <Thumb p={p} zoom />
                <div className="p-6">
                  <h3 className="font-display text-xl font-bold">{p.title}</h3>
                  <p className="mt-2 text-sm text-white/65">{p.description}</p>
                  <div className="mt-4">
                    <Tags tags={p.tags} />
                  </div>
                  <div className="mt-6">
                    <ProjectLinks p={p} />
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
      </div>
      <Reveal className="mt-12 text-center">
        <Link to="/projects" className={btnPrimary}>
          {t("homeViewAll")}
        </Link>
      </Reveal>
    </Section>
  );
}

function Experience() {
  const { experience, t } = useContent();
  return (
    <Section>
      <Head title={t("homeExperienceTitle")} />
      <ol className="relative max-w-3xl border-l border-white/15 pl-8">
        {experience.map((e, i) => (
          <li
            key={`${e.title}-${e.dates}`}
            className="relative pb-10 last:pb-0"
          >
            <span className="absolute -left-[2.4rem] top-7 h-3 w-3 rounded-full bg-ember ring-4 ring-ember/25" />
            <Reveal from="left" delay={i * 80}>
              <div className={`${card} p-6`}>
                <p className="text-sm font-semibold text-volt">{e.dates}</p>
                <h3 className="mt-1 font-display text-xl font-bold">
                  {e.title}
                </h3>
                <p className="text-sm text-white/50">{e.org}</p>
                <p className="mt-3 text-white/70">{e.text}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function HowIWork() {
  const { principles, t } = useContent();
  const [i, setI] = useState(0);
  const n = principles.length;
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % n), 5000);
    return () => clearInterval(t);
  }, [i, n]);
  return (
    <Section>
      <Head title={t("homeHowTitle")} />
      <Reveal className="max-w-2xl">
        <div className="overflow-hidden rounded-2xl">
          <div
            className="flex transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${i * 100}%)` }}
          >
            {principles.map((p, k) => (
              <button
                key={p.title}
                onClick={() => setI((k + 1) % n)}
                aria-label={`${p.title}. Show next`}
                className="w-full shrink-0 border border-white/10 bg-panel/70 p-10 text-left backdrop-blur"
              >
                <h3 className="font-display text-2xl font-bold">{p.title}</h3>
                <p className="mt-3 text-white/70">{p.text}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          {principles.map((p, k) => (
            <button
              key={p.title}
              onClick={() => setI(k)}
              aria-label={`Show ${p.title}`}
              className={`h-2 rounded-full transition-all ${k === i ? "w-8 bg-ember" : "w-2 bg-white/25"}`}
            />
          ))}
        </div>
      </Reveal>
    </Section>
  );
}

function TechMarquee() {
  const { t } = useContent();
  const row = [...techs, ...techs];
  return (
    <Section pad="py-16">
      <Head title={t("homeTechTitle")} />
      <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
        <div className="marquee-track flex w-max">
          {row.map((t, k) => (
            <span
              key={k}
              aria-hidden={k >= techs.length}
              className="mr-4 whitespace-nowrap rounded-lg border border-white/15 bg-panel/70 px-6 py-3 font-display text-sm font-semibold text-white/80"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </Section>
  );
}

function Closing() {
  const { profile, t } = useContent();
  return (
    <Section>
      <Reveal className="rounded-3xl border border-white/10 bg-gradient-to-br from-ember/15 via-panel/80 to-volt/15 p-10 backdrop-blur md:p-16">
        <h2 className="max-w-2xl font-display text-3xl font-extrabold md:text-5xl">
          {t("homeClosingTitle")}
        </h2>
        <p className="mt-4 max-w-xl text-white/70">{t("homeClosingText")}</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link to="/contact" className={btnPrimary}>
            Get in touch
          </Link>
          <a href={`mailto:${profile.socials.email}`} className={btnGhost}>
            Email me
          </a>
        </div>
      </Reveal>
    </Section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <Teaser />
      <Featured />
      <Experience />
      <HowIWork />
      <TechMarquee />
      <Closing />
    </>
  );
}
