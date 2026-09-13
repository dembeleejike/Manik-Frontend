import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ImageOff, MessageCircle } from "lucide-react";
import { api } from "./api";
import { C, WHATSAPP_NUMBER, ImageSlot, Loading, QuoteForm } from "./shared";

export default function ProductPage() {
  const { ref } = useParams();
  const [product, setProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [allProducts, s] = await Promise.all([api.getProducts(), api.getSettings().catch(() => null)]);
        setProducts(allProducts);
        setSettings(s);
        const found = allProducts.find(p => p.ref === ref);
        if (!found) {
          setNotFound(true);
        } else {
          setProduct(found);
          // Sets the browser tab title and helps link previews when shared —
          // a real per-page title, not just the site's generic one.
          document.title = `${found.name} (${found.ref}) — MANIK`;
        }
      } catch (err) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [ref]);

  return (
    <div className="ff-body min-h-screen" style={{ background: C.concrete }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .ff-display { font-family: 'Space Grotesk', sans-serif; }
        .ff-body { font-family: 'IBM Plex Sans', sans-serif; }
        .ff-mono { font-family: 'IBM Plex Mono', monospace; }
      `}</style>

      <header className="sticky top-0 z-40" style={{ background: C.steel, borderBottom: `1px solid ${C.steelLine}` }}>
        <div className="max-w-3xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 ff-mono text-sm" style={{ color: C.cream }}>
            <ArrowLeft size={16} /> Back to MANIK
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 md:px-8 py-12">
        {loading ? (
          <Loading />
        ) : notFound ? (
          <div className="text-center py-24">
            <p className="ff-display text-xl font-semibold mb-3" style={{ color: C.ink }}>Product not found</p>
            <p className="ff-body text-sm mb-6" style={{ color: "#6B6960" }}>This product may have been removed or the link is incorrect.</p>
            <Link to="/" className="ff-mono text-xs uppercase tracking-wide underline" style={{ color: C.safety }}>Return to the shop</Link>
          </div>
        ) : (
          <>
            <span className="ff-mono text-xs" style={{ color: C.blueprint }}>REF {product.ref}</span>
            <h1 className="ff-display text-2xl md:text-3xl font-semibold mt-2 mb-5" style={{ color: C.ink }}>{product.name}</h1>

            <div className="mb-6"><ImageSlot src={product.images?.[0]} alt={product.name} height={280} /></div>

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

            {product.colors?.length > 0 && (
              <div className="flex items-center gap-2 mb-8">
                {product.colors.map((c, i) => (
                  <span key={i} style={{ width: 20, height: 20, background: c, border: "1px solid #00000022" }} />
                ))}
              </div>
            )}

            <p className="ff-mono text-xs uppercase tracking-wide mb-3" style={{ color: "#6B6960" }}>Request a price for this item</p>
            <QuoteForm presetProduct={product.name} products={products} />

            <a
              href={`https://wa.me/${settings?.whatsapp || WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hello, I'm interested in ${product.name} (${product.ref}). Please send me the price.`)}`}
              target="_blank" rel="noreferrer"
              className="mt-4 flex items-center justify-center gap-2 p-4 text-sm font-medium text-white"
              style={{ background: "#25D366" }}
            >
              <MessageCircle size={16} /> Ask about this on WhatsApp
            </a>
          </>
        )}
      </main>
    </div>
  );
}
