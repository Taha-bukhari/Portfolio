import { Github, ExternalLink } from "lucide-react";

const ghost = "inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold transition";
const isSet = (u) => Boolean(u) && u !== "#";

export function Thumb({ p, zoom = false }) {
  const z = zoom ? "transition duration-700 group-hover:scale-110" : "";
  return (
    <div className="aspect-video overflow-hidden bg-panel">
      {p.image ? (
        <img src={p.image} alt={`${p.title} screenshot`} className={`h-full w-full object-cover ${z}`} />
      ) : (
        <div className={`grid h-full w-full place-items-center bg-gradient-to-br from-ember/30 via-panel to-volt/30 px-4 text-center ${z}`}>
          <span className="font-display text-3xl font-extrabold text-white/90">{p.title}</span>
        </div>
      )}
    </div>
  );
}

export const Tags = ({ tags }) => (
  <div className="flex flex-wrap gap-2">
    {tags.map((t) => (
      <span key={t} className="rounded-md border border-volt/30 bg-volt/10 px-2.5 py-1 text-xs font-semibold text-volt">{t}</span>
    ))}
  </div>
);

// A link that has not been set yet ("#" or empty) shows as a dimmed button.
function Btn({ href, icon: Icon, children }) {
  if (!isSet(href)) {
    return <span aria-disabled="true" title="Link coming soon" className={`${ghost} cursor-not-allowed opacity-45`}><Icon size={16} />{children}</span>;
  }
  return <a href={href} target="_blank" rel="noreferrer" className={`${ghost} hover:border-volt hover:text-volt`}><Icon size={16} />{children}</a>;
}

export const ProjectLinks = ({ p }) => (
  <div className="flex flex-wrap gap-3">
    <Btn href={p.github} icon={Github}>GitHub</Btn>
    <Btn href={p.live} icon={ExternalLink}>Live Demo</Btn>
  </div>
);
