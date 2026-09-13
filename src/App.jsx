import React, { useState, useMemo, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ProductPage from "./ProductPage";
import { C, WHATSAPP_NUMBER, ImageSlot, Loading, SolidBtn, Field, inputStyle, QuoteForm } from "./shared";
import {
  Menu, X, Phone, MessageCircle, MapPin, Clock, ChevronRight, ArrowRight,
  CheckCircle2, Package, Wrench, Truck, Users, Building2, Layers,
  ShieldCheck, Mail, Send, ArrowLeft, Sliders, DoorOpen, Grip, Plus, ImageOff
} from "lucide-react";
import { api } from "./api";

/* ---------------------------------------------------------------
   TOKENS
   Ink        #171A1C  primary text / darkest surface
   Steel      #21262B  header / footer / dark sections
   Concrete   #EFEBE3  light page background
   ConcreteD  #E4DFD3  secondary light panels
   Aluminum   #AFB6BC  metal accent, hairlines on dark
   Safety     #E2591F  primary accent (hazard-orange, not clay/terracotta)
   Blueprint  #133A55  secondary accent, technical blue
------------------------------------------------------------------ */
const FONTS = (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
    .ff-display { font-family: 'Space Grotesk', sans-serif; }
    .ff-body { font-family: 'IBM Plex Sans', sans-serif; }
    .ff-mono { font-family: 'IBM Plex Mono', monospace; }
    .crop::before, .crop::after, .crop-b::before, .crop-b::after { content: ""; position: absolute; width: 14px; height: 14px; }
    .crop::before { top: -1px; left: -1px; border-top: 2px solid ${C.ink}; border-left: 2px solid ${C.ink}; }
    .crop::after { top: -1px; right: -1px; border-top: 2px solid ${C.ink}; border-right: 2px solid ${C.ink}; }
    .crop-b::before { bottom: -1px; left: -1px; border-bottom: 2px solid ${C.ink}; border-left: 2px solid ${C.ink}; }
    .crop-b::after { bottom: -1px; right: -1px; border-bottom: 2px solid ${C.ink}; border-right: 2px solid ${C.ink}; }
    .grid-bg {
      background-image:
        linear-gradient(${C.aluLight}22 1px, transparent 1px),
        linear-gradient(90deg, ${C.aluLight}22 1px, transparent 1px);
      background-size: 32px 32px;
    }
    .stamp { transform: rotate(-3deg); }
    .stamp:hover { transform: rotate(0deg); }
    ::selection { background: ${C.safety}; color: white; }
  `}</style>
);

/* ---------------------------------------------------------------
   CATEGORY ICONS — matched by slug. The backend only stores category
   names/slugs, not icons, so this maps known slugs to a look. Anything
   not listed here (a brand-new category the owner adds) falls back
   to the generic Package icon automatically.
------------------------------------------------------------------ */
const CATEGORY_ICONS = {
  "aluminium-profiles": Sliders,
  "aluminum-profiles": Sliders,
  "profiles": Sliders,
  "windows": Layers,
  "doors": DoorOpen,
  "accessories": Grip,
};
function iconForCategory(slug) {
  return CATEGORY_ICONS[slug] || Package;
}

const SERVICES = [
  { icon: Wrench, name: "Fabrication", desc: "Custom-cut aluminium windows, doors and frames built to your exact measurements." },
  { icon: Truck, name: "Installation", desc: "Professional on-site fitting by an experienced installation team." },
  { icon: Package, name: "Supply", desc: "Bulk and retail supply of profiles, glass and accessories for contractors." },
  { icon: Users, name: "Consultation", desc: "Guidance on the right materials, finishes and specs for your project." },
];


/* ---------------------------------------------------------------
   SMALL UI PRIMITIVES
------------------------------------------------------------------ */
function Eyebrow({ children }) {
  return (
    <div className="ff-mono flex items-center gap-2 mb-3" style={{ color: C.safety }}>
      <span style={{ width: 18, height: 2, background: C.safety, display: "inline-block" }} />
      <span className="text-xs tracking-widest uppercase">{children}</span>
    </div>
  );
}

function SectionHead({ eyebrow, title, sub, dark }) {
  return (
    <div className="max-w-2xl mb-10">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="ff-display text-3xl md:text-4xl font-semibold leading-tight" style={{ color: dark ? C.cream : C.ink }}>
        {title}
      </h2>
      {sub && <p className="ff-body mt-4 text-base leading-relaxed" style={{ color: dark ? C.aluLight : "#54524C" }}>{sub}</p>}
    </div>
  );
}

function Stamp({ children, onClick, small }) {
  return (
    <button
      onClick={onClick}
      className={`stamp ff-mono uppercase tracking-wide font-medium transition-transform ${small ? "text-xs px-4 py-2" : "text-sm px-6 py-3"}`}
      style={{ border: `2px dashed ${C.safety}`, color: C.safety, background: "transparent" }}
    >
      {children}
    </button>
  );
}

function GhostBtn({ children, onClick, dark }) {
  return (
    <button
      onClick={onClick}
      className="ff-body inline-flex items-center gap-2 px-6 py-3 text-sm font-medium border transition-colors"
      style={{ borderColor: dark ? C.aluLight : C.ink, color: dark ? C.cream : C.ink }}
    >
      {children} <ArrowRight size={15} />
    </button>
  );
}

// Shows the first real photo if one exists, otherwise an honest
// placeholder — never a stock/demo photo standing in for the real thing.
function LoadError({ message }) {
  return (
    <div className="py-24 text-center max-w-md mx-auto">
      <p className="ff-body text-sm" style={{ color: C.safetyDark }}>
        Couldn't reach the server. {message || "Please try again shortly."}
      </p>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="py-16 text-center ff-body text-sm" style={{ color: "#8A877D" }}>
      {message}
    </div>
  );
}

/* ---------------------------------------------------------------
   HEADER / FOOTER
------------------------------------------------------------------ */
function Header({ page, setPage, menuOpen, setMenuOpen }) {
  const links = [
    ["home", "Home"], ["products", "Products"], ["services", "Services"],
    ["projects", "Projects"], ["about", "About"], ["contact", "Contact"],
  ];
  return (
    <header className="sticky top-0 z-40" style={{ background: C.steel, borderBottom: `1px solid ${C.steelLine}` }}>
      <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
        <button onClick={() => { setPage("home"); setMenuOpen(false); }} className="flex items-center gap-2">
          <span style={{ width: 10, height: 10, background: C.safety }} />
          <span className="ff-display text-lg tracking-tight font-semibold" style={{ color: C.cream }}>MANIK</span>
        </button>
        <nav className="hidden md:flex items-center gap-7">
          {links.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setPage(id)}
              className="ff-body text-sm transition-colors"
              style={{ color: page === id ? C.safety : C.aluLight }}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="hidden md:block">
          <button onClick={() => setPage("contact")} className="ff-mono text-xs uppercase tracking-wide px-4 py-2" style={{ border: `1px solid ${C.safety}`, color: C.safety }}>
            Request a quote
          </button>
        </div>
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} style={{ color: C.cream }}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {menuOpen && (
        <div className="md:hidden px-5 pb-5 flex flex-col gap-4" style={{ borderTop: `1px solid ${C.steelLine}` }}>
          {links.map(([id, label]) => (
            <button key={id} onClick={() => { setPage(id); setMenuOpen(false); }} className="ff-body text-left text-sm pt-4" style={{ color: page === id ? C.safety : C.aluLight }}>
              {label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

function Footer({ setPage, settings }) {
  const phone = settings?.phone || "+234 806 098 4868";
  const phone2 = settings?.phone2 || "";
  const email = settings?.email || "hello@manikmaterials.ng";
  const locations = settings?.locations?.length ? settings.locations : [{ label: "", address: "Gwaraka, Aluminum Village, Habitat Plaza" }];
  const hours = settings?.hours || "Mon – Sat, 8am – 6pm";
  const hoursSunday = settings?.hoursSunday || "Closed";
  return (
    <footer style={{ background: C.steel, color: C.aluLight }}>
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span style={{ width: 10, height: 10, background: C.safety }} />
            <span className="ff-display text-lg font-semibold" style={{ color: C.cream }}>{settings?.businessName || "MANIK"}</span>
          </div>
          <p className="ff-body text-sm leading-relaxed">{settings?.tagline || "Aluminium and building materials for modern construction. Supply, fabrication and installation."}</p>
        </div>
        <div>
          <p className="ff-mono text-xs uppercase tracking-widest mb-4" style={{ color: C.safety }}>Sitemap</p>
          {["home", "products", "services", "projects", "about", "contact"].map(id => (
            <button key={id} onClick={() => setPage(id)} className="ff-body block text-sm mb-2 capitalize hover:underline">{id}</button>
          ))}
        </div>
        <div>
          <p className="ff-mono text-xs uppercase tracking-widest mb-4" style={{ color: C.safety }}>Contact</p>
          <p className="ff-body text-sm mb-2 flex items-center gap-2"><Phone size={14} /> {phone}{phone2 && ` / ${phone2}`}</p>
          <p className="ff-body text-sm mb-2 flex items-center gap-2"><Mail size={14} /> {email}</p>
          {locations.map((loc, i) => (
            <p key={i} className="ff-body text-sm flex items-start gap-2 mb-1"><MapPin size={14} className="mt-1 shrink-0" /> {loc.label && <strong>{loc.label}: </strong>}{loc.address}</p>
          ))}
        </div>
        <div>
          <p className="ff-mono text-xs uppercase tracking-widest mb-4" style={{ color: C.safety }}>Hours</p>
          <p className="ff-body text-sm mb-2 flex items-center gap-2"><Clock size={14} /> {hours}</p>
          <p className="ff-body text-sm">Sunday: {hoursSunday}</p>
        </div>
      </div>
      <div className="ff-mono text-xs text-center py-5" style={{ borderTop: `1px solid ${C.steelLine}`, color: "#6B7076" }}>
        PROTOTYPE — sample content, replace with real catalogue &amp; photos
      </div>
    </footer>
  );
}

function WhatsAppFloat({ settings }) {
  const number = settings?.whatsapp || WHATSAPP_NUMBER;
  return (
    <a
      href={`https://wa.me/${number}`}
      target="_blank" rel="noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center rounded-full shadow-lg"
      style={{ width: 54, height: 54, background: "#25D366" }}
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle color="white" size={26} />
    </a>
  );
}

/* ---------------------------------------------------------------
   PRODUCT CARD — the "cut sheet" signature element
------------------------------------------------------------------ */
function ProductCard({ p, onOpen }) {
  return (
    <div className="relative crop crop-b p-5 flex flex-col" style={{ border: `1px solid ${C.ink}22`, background: C.cream }}>
      <div className="mb-5">
        <ImageSlot src={p.images?.[0]} alt={p.name} />
      </div>
      <div className="flex items-center justify-between mb-4">
        <span className="ff-mono text-xs tracking-wide" style={{ color: C.blueprint }}>REF {p.ref}</span>
        <span className="ff-mono text-[10px] uppercase px-2 py-1" style={{ background: p.status === "In stock" ? "#E4EFE0" : "#F3E7DA", color: p.status === "In stock" ? "#2F5D2A" : C.safetyDark }}>
          {p.status}
        </span>
      </div>
      <h3 className="ff-display font-semibold text-lg mb-2" style={{ color: C.ink }}>{p.name}</h3>
      <p className="ff-body text-sm mb-4" style={{ color: "#54524C" }}>{p.description}</p>
      {p.specs?.length > 0 && (
        <div className="ff-mono text-xs mb-4" style={{ color: "#6B6960" }}>
          {p.specs.map((s, i) => (
            <div key={i} className="flex justify-between py-1" style={{ borderBottom: "1px dotted #C9C5BA" }}>
              <span>{s.label}</span><span style={{ color: C.ink }}>{s.value}</span>
            </div>
          ))}
        </div>
      )}
      {p.colors?.length > 0 && (
        <div className="flex items-center gap-1.5 mb-5">
          {p.colors.map((c, i) => (
            <span key={i} style={{ width: 16, height: 16, background: c, border: "1px solid #00000022" }} />
          ))}
        </div>
      )}
      <div className="mt-auto flex flex-wrap gap-3 items-center">
        <button onClick={() => onOpen(p)} className="ff-mono text-xs uppercase tracking-wide inline-flex items-center gap-1.5 self-start px-4 py-2" style={{ border: `1px solid ${C.ink}`, color: C.ink }}>
          Request price <ChevronRight size={13} />
        </button>
        <Link to={`/products/${p.ref}`} className="ff-mono text-xs uppercase tracking-wide underline" style={{ color: C.blueprint }}>
          View full details
        </Link>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   PAGES
------------------------------------------------------------------ */
function Home({ setPage, openProduct, products, categories, projects, loading, settings }) {
  const featured = products.slice(0, 4);
  return (
    <div>
      {/* HERO */}
      <section className="grid-bg relative" style={{ background: C.steel }}>
        <div className="max-w-6xl mx-auto px-5 md:px-8 pt-20 pb-24 md:pt-28 md:pb-32 relative">
          <Eyebrow>REF 00 — INTRODUCTION</Eyebrow>
          <h1 className="ff-display font-semibold leading-[1.05] tracking-tight" style={{ color: C.cream, fontSize: "clamp(2.4rem, 6vw, 4.2rem)" }}>
            BUILD BETTER.<br />BUILD WITH ALUMINIUM.
          </h1>
          <p className="ff-body max-w-xl mt-6 text-base md:text-lg" style={{ color: C.aluLight }}>
            Premium aluminium profiles, windows, doors and building materials — supplied, fabricated and installed for contractors, builders and homeowners.
          </p>
          <div className="flex flex-wrap gap-4 mt-9">
            <SolidBtn onClick={() => setPage("products")} icon={ArrowRight}>Explore products</SolidBtn>
            <GhostBtn onClick={() => setPage("contact")} dark>Request a quote</GhostBtn>
          </div>
          <div className="mt-10 max-w-2xl overflow-hidden" style={{ border: `1px solid ${C.steelLine}` }}>
            {settings?.heroImageUrl ? (
              <img src={settings.heroImageUrl} alt={settings?.businessName || "MANIK"} className="w-full h-56 md:h-72 object-cover" />
            ) : (
              <div className="w-full h-56 md:h-72 flex flex-col items-center justify-center gap-2 ff-mono text-xs uppercase tracking-widest" style={{ background: C.steelLine, color: C.aluLight }}>
                <ImageOff size={22} /> Hero photo pending
              </div>
            )}
          </div>
        </div>
        <div style={{ borderTop: `1px solid ${C.steelLine}` }}>
          <div className="max-w-6xl mx-auto px-5 md:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              [settings?.stats?.years || "10+", "Years experience"],
              [settings?.stats?.projects || "500+", "Projects supplied"],
              [settings?.stats?.quality || "100%", "Quality materials"],
              [settings?.stats?.support || "24/7", "Customer support"],
            ].map(([n, l]) => (
              <div key={l}>
                <p className="ff-display text-2xl md:text-3xl font-semibold" style={{ color: C.safety }}>{n}</p>
                <p className="ff-mono text-xs uppercase tracking-wide mt-1" style={{ color: C.aluLight }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 py-20">
        <SectionHead eyebrow="REF 01 — WHY CHOOSE US" title="Why builders choose us" sub="Numbers and claims here should reflect what's genuinely true for the business — swap these in during setup." />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            [ShieldCheck, "Quality products", "Materials sourced from trusted, reliable manufacturers."],
            [Package, "Competitive pricing", "Fair market pricing without compromising on quality."],
            [Users, "Expert assistance", "Guidance on choosing the right materials for your project."],
            [Truck, "Reliable supply", "Consistent stock for contractors, builders and individuals."],
          ].map(([Icon, t, d]) => (
            <div key={t} className="relative crop crop-b p-6" style={{ border: `1px solid ${C.ink}22` }}>
              <Icon size={22} style={{ color: C.safety }} className="mb-4" />
              <h3 className="ff-display font-semibold mb-2" style={{ color: C.ink }}>{t}</h3>
              <p className="ff-body text-sm" style={{ color: "#54524C" }}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORY STRIP */}
      {categories.length > 0 && (
        <section style={{ background: C.concreteD }}>
          <div className="max-w-6xl mx-auto px-5 md:px-8 py-20">
            <SectionHead eyebrow="REF 02 — CATALOGUE" title="Browse by category" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {categories.map(c => {
                const Icon = iconForCategory(c.slug);
                return (
                  <button key={c._id} onClick={() => setPage("products", c._id)} className="text-left p-6 flex flex-col gap-4 transition-colors hover:bg-white" style={{ border: `1px solid ${C.ink}22`, background: C.cream }}>
                    <Icon size={22} style={{ color: C.blueprint }} />
                    <span className="ff-display font-semibold" style={{ color: C.ink }}>{c.name}</span>
                    <span className="ff-mono text-xs inline-flex items-center gap-1" style={{ color: C.safety }}>View all <ChevronRight size={12} /></span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* FEATURED PRODUCTS */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 py-20">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <SectionHead eyebrow="REF 03 — FEATURED" title="A few of our cut sheets" />
        </div>
        {loading ? (
          <Loading />
        ) : featured.length === 0 ? (
          <EmptyState message="Products are being added — check back soon, or get in touch directly for what you need." />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 -mt-10">
              {featured.map(p => <ProductCard key={p._id} p={p} onOpen={openProduct} />)}
            </div>
            <div className="mt-10">
              <GhostBtn onClick={() => setPage("products")}>View full catalogue</GhostBtn>
            </div>
          </>
        )}
      </section>

      {/* PROJECTS PREVIEW */}
      {projects.length > 0 && (
        <section style={{ background: C.steel }}>
          <div className="max-w-6xl mx-auto px-5 md:px-8 py-20">
            <SectionHead eyebrow="REF 04 — PROOF OF WORK" title="Recently supplied" dark />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {projects.slice(0, 3).map(pr => (
                <div key={pr._id} className="p-6" style={{ border: `1px solid ${C.steelLine}` }}>
                  <div className="flex items-center gap-2 mb-4 ff-mono text-xs" style={{ color: C.safety }}>
                    <MapPin size={13} /> {pr.location}
                  </div>
                  <h3 className="ff-display font-semibold mb-1" style={{ color: C.cream }}>{pr.name}</h3>
                  <p className="ff-body text-sm" style={{ color: C.aluLight }}>{pr.tag}</p>
                </div>
              ))}
            </div>
            <div className="mt-8"><GhostBtn onClick={() => setPage("projects")} dark>See all projects</GhostBtn></div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-5 md:px-8 py-20 text-center">
        <h2 className="ff-display text-2xl md:text-3xl font-semibold mb-4" style={{ color: C.ink }}>Have a project in mind?</h2>
        <p className="ff-body mb-8" style={{ color: "#54524C" }}>Tell us what you need — we'll put a quote together.</p>
        <SolidBtn onClick={() => setPage("contact")} icon={ArrowRight}>Request a quote</SolidBtn>
      </section>
    </div>
  );
}

function Products({ initialCat, openProduct, products, categories, loading, onSearch }) {
  const [active, setActive] = useState(initialCat || "all");
  const [searchInput, setSearchInput] = useState("");
  const list = active === "all" ? products : products.filter(p => (p.category?._id || p.category) === active);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-16">
      <SectionHead eyebrow="CATALOGUE" title="Products" sub="Prices aren't listed since materials pricing shifts — request a price and we'll respond directly." />
      <form onSubmit={handleSearch} className="flex gap-3 mb-8 max-w-md">
        <input
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          placeholder="Search products..."
          className="flex-1 px-4 py-2.5 text-sm"
          style={{ border: "1px solid #C9C5BA", background: "white" }}
        />
        <button type="submit" className="ff-mono text-xs uppercase px-4 py-2.5" style={{ background: C.ink, color: "white" }}>
          Search
        </button>
        {searchInput && (
          <button type="button" onClick={() => { setSearchInput(""); onSearch(""); }} className="ff-mono text-xs uppercase px-3" style={{ color: "#6B6960" }}>
            Clear
          </button>
        )}
      </form>
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-10">
          <button onClick={() => setActive("all")} className="ff-mono text-xs uppercase px-4 py-2" style={{ border: `1px solid ${active === "all" ? C.safety : "#C9C5BA"}`, color: active === "all" ? C.safety : "#6B6960" }}>All</button>
          {categories.map(c => {
            const Icon = iconForCategory(c.slug);
            return (
              <button key={c._id} onClick={() => setActive(c._id)} className="ff-mono text-xs uppercase px-4 py-2 inline-flex items-center gap-2" style={{ border: `1px solid ${active === c._id ? C.safety : "#C9C5BA"}`, color: active === c._id ? C.safety : "#6B6960" }}>
                <Icon size={13} /> {c.name}
              </button>
            );
          })}
        </div>
      )}
      {loading ? (
        <Loading />
      ) : list.length === 0 ? (
        <EmptyState message="No products here yet — check back soon, or reach out directly for what you need." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map(p => <ProductCard key={p._id} p={p} onOpen={openProduct} />)}
        </div>
      )}
    </div>
  );
}

function ProductModal({ product, onClose, products }) {
  if (!product) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "#00000088" }} onClick={onClose}>
      <div className="max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 md:p-8" style={{ background: C.cream }} onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-5">
          <span className="ff-mono text-xs" style={{ color: C.blueprint }}>REF {product.ref}</span>
          <button onClick={onClose}><X size={20} color={C.ink} /></button>
        </div>
        <div className="mb-5"><ImageSlot src={product.images?.[0]} alt={product.name} height={220} /></div>
        <h2 className="ff-display text-2xl font-semibold mb-3" style={{ color: C.ink }}>{product.name}</h2>
        <p className="ff-body text-sm mb-6" style={{ color: "#54524C" }}>{product.description}</p>
        {product.specs?.length > 0 && (
          <div className="ff-mono text-xs mb-6" style={{ color: "#6B6960" }}>
            {product.specs.map((s, i) => (
              <div key={i} className="flex justify-between py-2" style={{ borderBottom: "1px dotted #C9C5BA" }}>
                <span>{s.label}</span><span style={{ color: C.ink }}>{s.value}</span>
              </div>
            ))}
          </div>
        )}
        <p className="ff-mono text-xs uppercase tracking-wide mb-3" style={{ color: "#6B6960" }}>Request a price for this item</p>
        <QuoteForm presetProduct={product.name} products={products} />
      </div>
    </div>
  );
}

function Services({ setPage }) {
  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-16">
      <SectionHead eyebrow="WHAT WE DO" title="Services" sub="Beyond supply — we fabricate, install and advise on materials for your build." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {SERVICES.map(s => (
          <div key={s.name} className="relative crop crop-b p-7 flex gap-5" style={{ border: `1px solid ${C.ink}22` }}>
            <s.icon size={28} style={{ color: C.safety }} className="shrink-0 mt-1" />
            <div>
              <h3 className="ff-display font-semibold text-lg mb-2" style={{ color: C.ink }}>{s.name}</h3>
              <p className="ff-body text-sm" style={{ color: "#54524C" }}>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="p-8 text-center" style={{ background: C.concreteD }}>
        <p className="ff-body mb-5" style={{ color: C.ink }}>Not sure what you need? Talk to us about your project.</p>
        <SolidBtn onClick={() => setPage("contact")} icon={ArrowRight}>Get in touch</SolidBtn>
      </div>
    </div>
  );
}

function Projects({ projects, loading }) {
  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-16">
      <SectionHead eyebrow="PROOF OF WORK" title="Projects" sub="Completed work from around Gauraka and the surrounding area." />
      {loading ? (
        <Loading />
      ) : projects.length === 0 ? (
        <EmptyState message="Project photos are being added — check back soon." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map(pr => (
            <div key={pr._id} className="relative crop crop-b" style={{ border: `1px solid ${C.ink}22` }}>
              <ImageSlot src={pr.images?.[0]} alt={pr.name} height={160} />
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2 ff-mono text-xs" style={{ color: C.safety }}>
                  <MapPin size={12} /> {pr.location}
                </div>
                <h3 className="ff-display font-semibold mb-1" style={{ color: C.ink }}>{pr.name}</h3>
                <p className="ff-body text-sm" style={{ color: "#6B6960" }}>{pr.tag}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function About({ setPage, settings }) {
  const aboutText = settings?.aboutText ||
    "We supply, fabricate and install aluminium profiles, windows, doors and accessories for contractors, builders, businesses and homeowners in Gwaraka and surrounding areas.";
  return (
    <div>
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-16">
        <SectionHead eyebrow="OUR STORY" title="About MANIK" sub="Replace this with the owner's real history, values and what makes the business different." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
          <div>
            <h3 className="ff-display font-semibold text-lg mb-3" style={{ color: C.ink }}>What we do</h3>
            <p className="ff-body text-sm leading-relaxed" style={{ color: "#54524C" }}>
              {aboutText}
            </p>
          </div>
          <div>
            <h3 className="ff-display font-semibold text-lg mb-3" style={{ color: C.ink }}>Our approach</h3>
            <p className="ff-body text-sm leading-relaxed" style={{ color: "#54524C" }}>
              Every project starts with the right materials for the job — we help customers choose finishes, profiles and glass suited to their budget and building.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {[["10+", "Years"], ["500+", "Projects"], ["1000+", "Products moved"], ["50+", "Contractors served"]].map(([n, l]) => (
            <div key={l} className="p-6 text-center" style={{ background: C.concreteD }}>
              <p className="ff-display text-2xl font-semibold" style={{ color: C.safety }}>{n}</p>
              <p className="ff-mono text-xs uppercase tracking-wide mt-1" style={{ color: "#6B6960" }}>{l}</p>
            </div>
          ))}
        </div>
        <SolidBtn onClick={() => setPage("contact")} icon={ArrowRight}>Work with us</SolidBtn>
      </div>
    </div>
  );
}

function Contact({ products, settings }) {
  const address = settings?.address || "Gwaraka, Aluminum Village, Habitat Plaza";
  const phone = settings?.phone || "+234 806 098 4868";
  const phone2 = settings?.phone2 || "";
  const email = settings?.email || "hello@manikmaterials.ng";
  const hours = settings?.hours || "Mon – Sat, 8am – 6pm";
  const whatsapp = settings?.whatsapp || WHATSAPP_NUMBER;
  const locations = settings?.locations?.length ? settings.locations : [{ label: "", address: "Gwaraka, Aluminum Village, Habitat Plaza" }];
  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-16">
      <SectionHead eyebrow="GET IN TOUCH" title="Request a quote" sub="Tell us what you need — quantity, colour, size, deadline — and we'll get back to you." />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-2">
          <QuoteForm products={products} />
        </div>
        <div className="space-y-6">
          <div className="p-6" style={{ background: C.concreteD }}>
            <p className="ff-mono text-xs uppercase tracking-widest mb-4" style={{ color: C.safety }}>Visit us</p>
            {locations.map((loc, i) => (
              <p key={i} className="ff-body text-sm mb-3 flex items-start gap-2" style={{ color: C.ink }}>
                <MapPin size={15} className="mt-0.5 shrink-0" /> {loc.label && <strong>{loc.label}: </strong>}{loc.address}
              </p>
            ))}
            <p className="ff-body text-sm mb-3 flex items-center gap-2" style={{ color: C.ink }}><Phone size={15} /> {phone}{phone2 && ` / ${phone2}`}</p>
            <p className="ff-body text-sm mb-3 flex items-center gap-2" style={{ color: C.ink }}><Mail size={15} /> {email}</p>
            <p className="ff-body text-sm flex items-center gap-2" style={{ color: C.ink }}><Clock size={15} /> {hours}</p>
          </div>
          <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 p-4 text-sm font-medium text-white" style={{ background: "#25D366" }}>
            <MessageCircle size={16} /> Chat on WhatsApp
          </a>
          {settings?.mapEmbedUrl && (
            <div className="overflow-hidden" style={{ border: `1px solid ${C.ink}22` }}>
              <iframe
                src={settings.mapEmbedUrl}
                width="100%" height="200" style={{ border: 0 }}
                loading="lazy" title="MANIK location map"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------
   ROOT
------------------------------------------------------------------ */
function MainApp() {
  const [page, setPageRaw] = useState("home");
  const [presetCat, setPresetCat] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [projects, setProjects] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    async function loadAll() {
      try {
        const [p, c, pr, s] = await Promise.all([
          api.getProducts(),
          api.getCategories(),
          api.getProjects(),
          api.getSettings(),
        ]);
        setProducts(p);
        setCategories(c);
        setProjects(pr);
        setSettings(s);
      } catch (err) {
        setLoadError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  // Re-fetch products whenever a search is run, without re-fetching everything else
  const handleSearch = async (term) => {
    setSearchTerm(term);
    try {
      const p = await api.getProducts(term);
      setProducts(p);
    } catch (err) {
      setLoadError(err.message);
    }
  };

  const setPage = (p, cat) => {
    setPageRaw(p);
    setPresetCat(cat || null);
    setMenuOpen(false);
    window.scrollTo?.({ top: 0, behavior: "instant" });
  };

  // A lightweight per-section title update — helps the browser tab and any
  // link preview that executes JS, even though this stays a single URL.
  useEffect(() => {
    const titles = {
      home: "MANIK | Aluminium & Building Materials",
      products: "Products — MANIK",
      services: "Services — MANIK",
      projects: "Projects — MANIK",
      about: "About — MANIK",
      contact: "Contact — MANIK",
    };
    document.title = titles[page] || titles.home;
  }, [page]);

  return (
    <div className="ff-body min-h-screen" style={{ background: C.concrete }}>
      {FONTS}
      <Header page={page} setPage={setPage} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      {loadError ? (
        <LoadError message={loadError} />
      ) : (
        <>
          {page === "home" && <Home setPage={setPage} openProduct={setModalProduct} products={products} categories={categories} projects={projects} loading={loading} settings={settings} />}
          {page === "products" && <Products initialCat={presetCat} openProduct={setModalProduct} products={products} categories={categories} loading={loading} onSearch={handleSearch} />}
          {page === "services" && <Services setPage={setPage} />}
          {page === "projects" && <Projects projects={projects} loading={loading} />}
          {page === "about" && <About setPage={setPage} settings={settings} />}
          {page === "contact" && <Contact products={products} settings={settings} />}
        </>
      )}
      <Footer setPage={setPage} settings={settings} />
      <WhatsAppFloat settings={settings} />
      <ProductModal product={modalProduct} onClose={() => setModalProduct(null)} products={products} />
    </div>
  );
}

// The site's internal navigation (Home/Products/Services/etc.) is unchanged
// above — it still works exactly as it always has. This just adds ONE new,
// real, shareable URL per product alongside it: /products/:ref.
// Everything else still lives at "/", switching sections internally.
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/products/:ref" element={<ProductPage />} />
        <Route path="/*" element={<MainApp />} />
      </Routes>
    </BrowserRouter>
  );
}
