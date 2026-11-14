import { Reveal } from "../hooks";

export const card = "rounded-xl border border-white/10 bg-panel/60 backdrop-blur";
export const btnPrimary = "inline-flex items-center gap-2 rounded-full bg-ember px-7 py-3.5 font-bold text-ink shadow-[0_0_40px_-8px_var(--color-ember)] transition hover:-translate-y-0.5";
export const btnGhost = "inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 font-semibold transition hover:border-volt hover:text-volt";

export const Section = ({ id, pad = "py-20", children }) => (
  <section id={id} className={`mx-auto max-w-6xl scroll-mt-20 px-5 ${pad}`}>{children}</section>
);

export const Head = ({ title, text }) => (
  <Reveal className="mb-10 max-w-2xl">
    <h2 className="font-display text-3xl font-extrabold md:text-4xl">{title}</h2>
    {text && <p className="mt-3 text-white/60">{text}</p>}
  </Reveal>
);
