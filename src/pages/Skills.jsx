import { Link } from "react-router-dom";
import { Reveal } from "../hooks";
import { Section, btnPrimary, btnGhost } from "../components/Layout";
import { Tags } from "../components/Project";
import { createElement } from "react";
import { useContent } from "../lib/content";
import { ICONS } from "../lib/icons";


function UsedIn({ items }) {
  const { projects } = useContent();
  const titles = new Set(projects.map((p) => p.title));
  return (
    <p className="mt-auto border-t border-white/10 pt-4 text-sm text-white/60">
      <span className="font-semibold text-white/80">Used in: </span>
      {items.map((it, i) => (
        <span key={it}>
          {i > 0 && (i === items.length - 1 ? " and " : ", ")}
          {titles.has(it) ? <Link to="/projects" className="font-semibold text-volt hover:underline">{it}</Link> : it}
        </span>
      ))}
    </p>
  );
}

export default function Skills() {
  const { skillAreas, t } = useContent();
  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pb-6 pt-14 md:pt-20">
        <Reveal>
          <h1 className="font-display text-5xl font-extrabold md:text-6xl">{t("skillsTitle")}</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/70">{t("skillsIntro")}</p>
        </Reveal>
      </section>

      <Section pad="py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {skillAreas.map(({ icon, title, description, technologies, usedIn }, i) => (
            <Reveal key={title} delay={(i % 3) * 110} className="h-full">
              <article className="flex h-full flex-col rounded-xl border border-white/10 bg-panel/60 p-6 backdrop-blur transition duration-300 hover:-translate-y-1.5 hover:border-ember/50 hover:shadow-[0_24px_70px_-24px_var(--color-ember)]">
                <span className="grid h-12 w-12 place-items-center rounded-lg bg-gradient-to-br from-ember/25 to-volt/25 text-ember">{createElement(ICONS[icon] ?? ICONS.Code2, { size: 24 })}</span>
                <h2 className="mt-5 font-display text-xl font-bold">{title}</h2>
                <p className="mt-2 text-sm text-white/65">{description}</p>
                {technologies.length > 0 && <div className="mt-4"><Tags tags={technologies} /></div>}
                <div className="mt-6 flex flex-1 flex-col justify-end"><UsedIn items={usedIn} /></div>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section pad="pb-24 pt-6">
        <Reveal className="flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-white/10 bg-gradient-to-br from-ember/15 via-panel/80 to-volt/15 p-8 backdrop-blur md:p-12">
          <h2 className="max-w-md font-display text-2xl font-extrabold md:text-3xl">{t("skillsClosingTitle")}</h2>
          <div className="flex flex-wrap gap-4">
            <Link to="/projects" className={btnPrimary}>View My Projects</Link>
            <Link to="/contact" className={btnGhost}>Get in touch</Link>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
