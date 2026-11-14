import { useState } from "react";
import { Mail, Phone, MapPin, MessageCircle, Github, Linkedin, Copy, Check, Send, Loader2 } from "lucide-react";
import { Reveal } from "../hooks";
import { Section, card, btnPrimary, btnGhost } from "../components/Layout";
import { inquiryTypes } from "../data";
import { useContent } from "../lib/content";
import { submitContact } from "../lib/submitContact";

const EMPTY = { name: "", email: "", company: "", type: "", message: "", website: "" };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(v) {
  const e = {};
  if (!v.name.trim()) e.name = "Please enter your name.";
  if (!v.email.trim()) e.email = "Please enter your email address.";
  else if (!EMAIL.test(v.email.trim())) e.email = "That email address does not look right.";
  if (!v.type) e.type = "Please choose an inquiry type.";
  if (!v.message.trim()) e.message = "Please write a message.";
  return e;
}

function CopyBtn({ text, label }) {
  const [ok, setOk] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const t = document.createElement("textarea");
      t.value = text;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
    setOk(true);
    setTimeout(() => setOk(false), 1800);
  };
  return (
    <button type="button" onClick={copy} aria-label={`Copy ${label}`}
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition ${ok ? "border-ember text-ember" : "border-white/15 text-white/60 hover:border-volt hover:text-volt"}`}>
      {ok ? <Check size={16} /> : <Copy size={16} />}
      <span className="sr-only" aria-live="polite">{ok ? "Copied" : ""}</span>
    </button>
  );
}

function Row({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-ember/25 to-volt/25 text-ember"><Icon size={20} /></span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-white/50">{label}</p>
        {children}
      </div>
    </div>
  );
}

function Field({ label, name, error, optional, children }) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm font-semibold text-white/80">
        {label}{optional && <span className="ml-2 font-normal text-white/45">(optional)</span>}
      </label>
      {children}
      {error && <p id={`${name}-error`} className="mt-2 text-sm text-red-300">{error}</p>}
    </div>
  );
}

export default function Contact() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const { profile, t } = useContent();
  const s = profile.socials;
  const tel = `tel:+${profile.phone.replace(/\D/g, "")}`;
  const whatsapp = `https://wa.me/${(profile.whatsapp || profile.phone).replace(/\D/g, "")}`;

  const onChange = (e) => {
    const { name, value } = e.target;
    const next = { ...values, [name]: value };
    setValues(next);
    if (submitted) setErrors(validate(next));
  };
  const bind = (n) => ({
    id: n, name: n, value: values[n], onChange,
    "aria-invalid": errors[n] ? "true" : "false",
    "aria-describedby": errors[n] ? `${n}-error` : undefined,
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (values.website) { setStatus("sent"); return; } // spam trap: real visitors never see or fill this field
    setSubmitted(true);
    const errs = validate(values);
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) { document.getElementById(first)?.focus(); return; }
    setStatus("sending");
    try {
      await submitContact({
        name: values.name.trim(), email: values.email.trim(), company: values.company.trim(),
        type: values.type, message: values.message.trim(),
      });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };
  const reset = () => { setValues(EMPTY); setErrors({}); setSubmitted(false); setStatus("idle"); };
  const firstName = values.name.trim().split(" ")[0];

  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pb-6 pt-14 md:pt-20">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-ember/40 bg-ember/10 px-4 py-1.5 text-sm font-semibold text-ember">
            <span className="h-2 w-2 animate-pulse rounded-full bg-ember" />
            {profile.badge}
          </span>
          <h1 className="mt-5 font-display text-5xl font-extrabold md:text-6xl">{t("contactTitle")}</h1>
        </Reveal>
      </section>

      <Section pad="pb-24 pt-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
          <Reveal delay={120} className="order-2 lg:order-1">
            <div className={`${card} space-y-7 p-6 md:p-8`}>
              <Row icon={Mail} label="Email">
                <div className="flex items-center gap-2">
                  <a href={`mailto:${s.email}`} className="min-w-0 break-all font-semibold transition hover:text-ember">{s.email}</a>
                  <CopyBtn text={s.email} label="email address" />
                </div>
              </Row>
              <Row icon={Phone} label="Phone & WhatsApp">
                <div className="flex items-center gap-2">
                  <a href={tel} className="font-semibold transition hover:text-ember">{profile.phone}</a>
                  <CopyBtn text={profile.phone} label="phone number" />
                </div>
                <a href={whatsapp} target="_blank" rel="noreferrer" className={`${btnPrimary} mt-4 text-sm`}><MessageCircle size={18} />Chat on WhatsApp</a>
              </Row>
              <Row icon={MapPin} label="Based in"><p className="font-semibold">{profile.location}</p></Row>
              <div className="flex gap-3 border-t border-white/10 pt-6">
                {[[Github, s.github, "GitHub"], [Linkedin, s.linkedin, "LinkedIn"]].map(([Icon, href, label]) => (
                  <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}
                    className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white/70 transition hover:border-ember hover:text-ember"><Icon size={20} /></a>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={200} className="order-1 lg:order-2">
            <div className={`${card} p-6 md:p-8`}>
              {status === "sent" ? (
                <div role="status" className="pop-in flex flex-col items-center py-10 text-center">
                  <span className="relative grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-ember to-volt text-ink">
                    <span aria-hidden className="absolute inset-0 animate-pulse rounded-full bg-volt/40 blur-xl" />
                    <Check size={30} className="relative" />
                  </span>
                  <h2 className="mt-6 font-display text-2xl font-extrabold">Message sent</h2>
                  <p className="mt-2 max-w-sm text-white/70">Thank you{firstName ? `, ${firstName}` : ""}. I will get back to you as soon as I can.</p>
                  <button onClick={reset} className={`${btnGhost} mt-8`}>Send another message</button>
                </div>
              ) : (
                <form onSubmit={onSubmit} noValidate aria-busy={status === "sending"} className="space-y-5">
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={values.website} onChange={onChange} className="absolute -left-[9999px] h-0 w-0 opacity-0" />
                  <p className="text-white/75">{t("contactIntro")}</p>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Name" name="name" error={errors.name}>
                      <input type="text" autoComplete="name" placeholder="Your name" {...bind("name")} className="field w-full" />
                    </Field>
                    <Field label="Email" name="email" error={errors.email}>
                      <input type="email" autoComplete="email" placeholder="you@example.com" {...bind("email")} className="field w-full" />
                    </Field>
                  </div>
                  <Field label="Company or Organization" name="company" optional>
                    <input type="text" autoComplete="organization" placeholder="Where you work" {...bind("company")} className="field w-full" />
                  </Field>
                  <Field label="Inquiry Type" name="type" error={errors.type}>
                    <select {...bind("type")} className={`field w-full ${values.type ? "" : "text-white/40"}`}>
                      <option value="" disabled>Select an inquiry type</option>
                      {inquiryTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </Field>
                  <Field label="Message" name="message" error={errors.message}>
                    <textarea rows={5} placeholder="Tell me a little about the role or project" {...bind("message")} className="field w-full resize-y" />
                  </Field>
                  {status === "error" && (
                    <p role="alert" className="rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                      Something went wrong and your message was not sent. Please try again, or use Email Me Directly.
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 pt-1">
                    <button type="submit" disabled={status === "sending"} className={`${btnPrimary} disabled:opacity-60 disabled:hover:translate-y-0`}>
                      {status === "sending" ? <><Loader2 size={18} className="animate-spin" />Sending</> : <><Send size={18} />Send Message</>}
                    </button>
                    <a href={`mailto:${s.email}`} className={btnGhost}><Mail size={18} />Email Me Directly</a>
                  </div>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
