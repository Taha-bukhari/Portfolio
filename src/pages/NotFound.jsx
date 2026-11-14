import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="grid min-h-[70vh] place-items-center px-5 text-center">
      <div>
        <h1 className="font-display text-5xl font-extrabold">Page not found</h1>
        <p className="mt-4 text-white/60">The page you are looking for does not exist.</p>
        <Link to="/" className="mt-8 inline-block rounded-full border border-white/20 px-6 py-3 font-semibold transition hover:border-ember hover:text-ember">Back to Home</Link>
      </div>
    </section>
  );
}
