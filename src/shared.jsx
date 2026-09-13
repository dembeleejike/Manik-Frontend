import React, { useState, useMemo } from "react";
import { CheckCircle2, MessageCircle, Send, ImageOff } from "lucide-react";
import { api } from "./api";

/* ---------------------------------------------------------------
   SHARED — used by both App.jsx (main site) and ProductPage.jsx
   (dedicated product URLs). Kept in its own file with no dependency
   on either of them, so there's no circular import between the two.
------------------------------------------------------------------ */
export const C = {
  ink: "#171A1C",
  steel: "#21262B",
  steelLine: "#3A4148",
  concrete: "#EFEBE3",
  concreteD: "#E4DFD3",
  alu: "#AFB6BC",
  aluLight: "#C7CCD1",
  safety: "#E2591F",
  safetyDark: "#B8430F",
  blueprint: "#133A55",
  cream: "#F7F5F0",
};

export const WHATSAPP_NUMBER = "2348060984868";

export function ImageSlot({ src, alt, height = 180 }) {
  if (src) {
    return (
      <div className="overflow-hidden" style={{ height, background: C.concreteD }}>
        <img src={src} alt={alt} className="w-full h-full object-cover" loading="lazy" />
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center gap-2 ff-mono text-[10px] uppercase tracking-widest" style={{ height, background: C.concreteD, color: "#8A877D" }}>
      <ImageOff size={18} />
      Photo pending
    </div>
  );
}

export function Loading() {
  return (
    <div className="py-24 text-center ff-mono text-xs uppercase tracking-widest" style={{ color: "#8A877D" }}>
      Loading…
    </div>
  );
}

export function SolidBtn({ children, onClick, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      className="ff-body inline-flex items-center gap-2 px-6 py-3 text-sm font-medium transition-opacity hover:opacity-90"
      style={{ background: C.safety, color: "white" }}
    >
      {children} {Icon && <Icon size={16} />}
    </button>
  );
}

export function Field({ label, children, full }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="ff-mono text-xs uppercase tracking-wide block mb-2" style={{ color: "#6B6960" }}>{label}</label>
      {children}
    </div>
  );
}

export const inputStyle = {
  fontFamily: "'IBM Plex Sans', sans-serif",
  fontSize: 14,
  padding: "10px 12px",
  border: "1px solid #C9C5BA",
  background: "white",
  color: "#171A1C",
};

const REQUEST_TYPES = ["Material", "Fabrication", "Installation", "Delivery", "Full project"];

export function QuoteForm({ presetProduct, products = [] }) {
  const [form, setForm] = useState({
    requestType: "Material", name: "", phone: "", product: presetProduct || "", qty: "", location: "", notes: "", contact: "WhatsApp",
  });
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const waLink = useMemo(() => {
    const text = `Quote request (${form.requestType})\nName: ${form.name}\nPhone: ${form.phone}\nProduct: ${form.product}\nQuantity: ${form.qty}\nLocation: ${form.location}\nNotes: ${form.notes}\nPreferred contact: ${form.contact}`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  }, [form]);

  const submit = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      setErr("Fill in your name and phone number before sending.");
      return;
    }
    if (form.requestType === "Material" && !form.product.trim()) {
      setErr("Let us know which product you need.");
      return;
    }
    setErr("");
    setSubmitting(true);
    try {
      await api.submitQuote({
        requestType: form.requestType,
        name: form.name,
        phone: form.phone,
        product: form.product,
        quantity: form.qty,
        location: form.location,
        notes: form.notes,
        preferredContact: form.contact,
      });
      setSent(true);
    } catch (e) {
      setErr("Couldn't send that just now — check your connection and try again, or use WhatsApp below.");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="p-8 flex flex-col items-center text-center" style={{ background: C.cream, border: `1px solid ${C.ink}22` }}>
        <CheckCircle2 size={36} style={{ color: C.safety }} className="mb-4" />
        <h3 className="ff-display text-xl font-semibold mb-2" style={{ color: C.ink }}>Request received</h3>
        <p className="ff-body text-sm mb-6 max-w-sm" style={{ color: "#54524C" }}>
          Your request has been sent — we'll get back to you shortly. You can also reach us directly on WhatsApp:
        </p>
        <a href={waLink} target="_blank" rel="noreferrer" className="ff-body inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white" style={{ background: "#25D366" }}>
          <MessageCircle size={16} /> Message on WhatsApp
        </a>
        <button onClick={() => setSent(false)} className="ff-mono text-xs uppercase tracking-wide mt-6 underline" style={{ color: "#6B6960" }}>Send another request</button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8" style={{ background: C.cream, border: `1px solid ${C.ink}22` }}>
      <Field label="What do you need?">
        <div className="flex flex-wrap gap-2 mb-1">
          {REQUEST_TYPES.map(t => (
            <button key={t} onClick={() => update("requestType", t)} className="ff-mono text-xs uppercase px-3 py-2" style={{ border: `1px solid ${form.requestType === t ? C.safety : "#C9C5BA"}`, color: form.requestType === t ? C.safety : "#6B6960" }}>
              {t}
            </button>
          ))}
        </div>
      </Field>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
        <Field label="Name">
          <input value={form.name} onChange={e => update("name", e.target.value)} placeholder="Your full name" className="w-full" style={inputStyle} />
        </Field>
        <Field label="Phone number">
          <input value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="080..." className="w-full" style={inputStyle} />
        </Field>
        <Field label={form.requestType === "Material" ? "Product" : "Product (if applicable)"}>
          {products.length > 0 ? (
            <select value={form.product} onChange={e => update("product", e.target.value)} className="w-full" style={inputStyle}>
              <option value="">Select a product</option>
              {products.map(p => <option key={p._id} value={p.name}>{p.name}</option>)}
            </select>
          ) : (
            <input value={form.product} onChange={e => update("product", e.target.value)} placeholder="What are you looking for?" className="w-full" style={inputStyle} />
          )}
        </Field>
        <Field label="Quantity">
          <input value={form.qty} onChange={e => update("qty", e.target.value)} placeholder="e.g. 20 pieces" className="w-full" style={inputStyle} />
        </Field>
        {form.requestType !== "Material" && (
          <Field label="Project location" full>
            <input value={form.location} onChange={e => update("location", e.target.value)} placeholder="Where is the work/delivery needed?" className="w-full" style={inputStyle} />
          </Field>
        )}
        <Field label="Additional requirements" full>
          <textarea value={form.notes} onChange={e => update("notes", e.target.value)} placeholder="Colour, size, delivery location, timeline..." rows={3} className="w-full" style={inputStyle} />
        </Field>
        <Field label="Preferred contact method" full>
          <div className="flex gap-3">
            {["WhatsApp", "Phone call", "Email"].map(m => (
              <button key={m} onClick={() => update("contact", m)} className="ff-mono text-xs uppercase px-3 py-2" style={{ border: `1px solid ${form.contact === m ? C.safety : "#C9C5BA"}`, color: form.contact === m ? C.safety : "#6B6960" }}>
                {m}
              </button>
            ))}
          </div>
        </Field>
      </div>
      {err && <p className="ff-body text-sm mt-4" style={{ color: "#B8430F" }}>{err}</p>}
      <div className="mt-6">
        <SolidBtn onClick={submit} icon={Send}>{submitting ? "Sending…" : "Send request"}</SolidBtn>
      </div>
    </div>
  );
}

