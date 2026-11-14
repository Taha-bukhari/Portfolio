import { useEffect, useRef } from "react";
import { X } from "lucide-react";

// Overlay dialog: closes on Esc, on a click outside, or with the X button.
export default function Modal({ label, onClose, children }) {
  const closeRef = useRef(null);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);
  return (
    <div className="fade-in fixed inset-0 z-[60] overflow-y-auto bg-ink/80 backdrop-blur-md" onClick={onClose}>
      <div className="flex min-h-full items-center justify-center p-4">
        <div role="dialog" aria-modal="true" aria-label={label} onClick={(e) => e.stopPropagation()}
          className="modal-in relative w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-panel shadow-[0_30px_120px_-30px_var(--color-ember)]">
          <button ref={closeRef} onClick={onClose} aria-label="Close"
            className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-ink/70 backdrop-blur transition hover:text-ember"><X size={20} /></button>
          {children}
        </div>
      </div>
    </div>
  );
}
