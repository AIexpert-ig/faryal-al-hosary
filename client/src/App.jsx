import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Diamond, Package, Users, Calendar, Plus, X, Pencil, Trash2,
  Search, Loader2, AlertCircle, CheckCircle, ChevronLeft, ChevronRight,
  Phone, Mail, Ruler, Eye, ArrowUpRight
} from 'lucide-react';

// ── API Config ──────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:3001/api';

// ── Design Tokens ───────────────────────────────────────────
const FONT = {
  heading: "'Playfair Display', serif",
  body: "'DM Sans', sans-serif",
};
const C = {
  charcoal: '#1A1A1A',
  gold: '#D4AF37',
  goldMuted: '#C4A035',
  goldLight: 'rgba(212,175,55,0.10)',
  goldGlow: 'rgba(212,175,55,0.18)',
  bone: '#F9F9F9',
  surface: '#FFFFFF',
  border: 'rgba(0,0,0,0.06)',
  borderHover: 'rgba(0,0,0,0.10)',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textMuted: '#9A9A9A',
  textFaint: '#BFBFBF',
  success: '#2D8A56',
  successBg: '#EDF7F0',
  successBorder: '#C6E7D1',
  error: '#C0392B',
  errorBg: '#FDF0EE',
  errorBorder: '#F0C9C4',
  warnBg: '#FEF9EE',
  warnBorder: '#F0DEB0',
  warnText: '#92750A',
};

// ── Toast System ────────────────────────────────────────────
const ToastContext = React.createContext();

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((message, type = 'error') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  }, []);

  return (
    <ToastContext.Provider value={add}>
      {children}
      <div className="fixed bottom-6 right-6 z-[999] flex flex-col gap-3 max-w-sm">
        {toasts.map(t => (
          <div
            key={t.id}
            className="flex items-start gap-3 px-5 py-4 rounded-2xl text-sm animate-[toastIn_0.35s_cubic-bezier(.16,1,.3,1)]"
            style={{
              fontFamily: FONT.body,
              background: t.type === 'error' ? C.errorBg : t.type === 'success' ? C.successBg : C.warnBg,
              border: `1px solid ${t.type === 'error' ? C.errorBorder : t.type === 'success' ? C.successBorder : C.warnBorder}`,
              color: t.type === 'error' ? C.error : t.type === 'success' ? C.success : C.warnText,
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            }}
          >
            {t.type === 'error' ? <AlertCircle size={16} className="mt-0.5 shrink-0" /> : <CheckCircle size={16} className="mt-0.5 shrink-0" />}
            <span>{t.message}</span>
            <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="ml-auto shrink-0 opacity-40 hover:opacity-100 transition-opacity">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function useToast() { return React.useContext(ToastContext); }

// ── Loading Spinner ─────────────────────────────────────────
function Spinner({ full = false }) {
  const el = (
    <div className="flex items-center justify-center gap-3" style={{ color: C.gold }}>
      <Loader2 size={20} className="animate-spin" />
      <span className="text-xs tracking-[0.25em] uppercase opacity-50" style={{ fontFamily: FONT.body }}>Loading</span>
    </div>
  );
  if (full) return <div className="fixed inset-0 bg-white/90 backdrop-blur-md z-50 flex items-center justify-center">{el}</div>;
  return <div className="py-24">{el}</div>;
}

// ── Modal ───────────────────────────────────────────────────
function Modal({ open, onClose, title, children, wide = false }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className={`relative bg-white rounded-2xl max-h-[90vh] overflow-y-auto ${wide ? 'w-full max-w-2xl' : 'w-full max-w-lg'}`}
        style={{ boxShadow: '0 32px 64px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-7 py-5" style={{ borderBottom: `1px solid ${C.border}` }}>
          <h3 className="text-xl font-medium" style={{ fontFamily: FONT.heading }}>{title}</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-black/5 transition-colors"><X size={18} style={{ color: C.textMuted }} /></button>
        </div>
        <div className="px-7 py-6">{children}</div>
      </div>
    </div>
  );
}

// ── Shared Input ────────────────────────────────────────────
function Input({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-[11px] tracking-[0.15em] uppercase mb-2 block" style={{ fontFamily: FONT.body, color: C.textMuted, fontWeight: 500 }}>{label}</span>
      <input
        className="w-full px-4 py-3 text-sm rounded-xl transition-all outline-none"
        style={{
          fontFamily: FONT.body,
          background: C.bone,
          border: `1px solid ${C.border}`,
          color: C.textPrimary,
        }}
        onFocus={e => { e.target.style.borderColor = C.gold; e.target.style.boxShadow = `0 0 0 3px ${C.goldLight}`; }}
        onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
        {...props}
      />
    </label>
  );
}

function Select({ label, children, ...props }) {
  return (
    <label className="block">
      <span className="text-[11px] tracking-[0.15em] uppercase mb-2 block" style={{ fontFamily: FONT.body, color: C.textMuted, fontWeight: 500 }}>{label}</span>
      <select
        className="w-full px-4 py-3 text-sm rounded-xl transition-all outline-none appearance-none"
        style={{
          fontFamily: FONT.body,
          background: C.bone,
          border: `1px solid ${C.border}`,
          color: C.textPrimary,
        }}
        onFocus={e => { e.target.style.borderColor = C.gold; e.target.style.boxShadow = `0 0 0 3px ${C.goldLight}`; }}
        onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none'; }}
        {...props}
      >{children}</select>
    </label>
  );
}

function Btn({ children, variant = 'primary', ...props }) {
  const base = "px-6 py-3 text-sm font-medium tracking-[0.1em] uppercase rounded-xl transition-all disabled:opacity-40 cursor-pointer";
  const styles = {
    primary: { background: C.charcoal, color: '#fff' },
    secondary: { background: C.bone, color: C.textSecondary, border: `1px solid ${C.border}` },
    danger: { background: C.errorBg, color: C.error, border: `1px solid ${C.errorBorder}` },
    gold: { background: `linear-gradient(135deg, ${C.gold}, ${C.goldMuted})`, color: '#fff' },
  };
  return (
    <button
      className={base}
      style={{ fontFamily: FONT.body, ...styles[variant] }}
      {...props}
    >{children}</button>
  );
}

// ── API Helper ──────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || `Request failed (${res.status})`);
  return data;
}

// ── Format EGP ──────────────────────────────────────────────
function formatEGP(amount) {
  return `EGP ${Number(amount || 0).toLocaleString('en-EG')}`;
}

// ════════════════════════════════════════════════════════════
// INVENTORY VIEW
// ════════════════════════════════════════════════════════════
function InventoryView() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [modal, setModal] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category !== 'all') params.set('category', category);
      const data = await apiFetch(`/inventory?${params}`);
      setItems(data);
    } catch (err) {
      toast(err.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, [search, category, toast]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    try {
      await apiFetch(`/inventory/${id}`, { method: 'DELETE' });
      toast('Gown removed from collection', 'success');
      setDeleting(null);
      load();
    } catch (err) {
      toast(err.message);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-end mb-12">
        <div>
          <p className="mb-2 tracking-[0.3em] uppercase text-[10px] font-medium" style={{ fontFamily: FONT.body, color: C.gold }}>Atelier Management</p>
          <h2 className="text-4xl font-medium tracking-tight" style={{ fontFamily: FONT.heading, color: C.charcoal }}>Bridal Collection</h2>
        </div>
        <Btn variant="gold" onClick={() => setModal('add')}>
          <span className="flex items-center gap-2"><Plus size={15} />Add Gown</span>
        </Btn>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-5 mb-10">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: C.textFaint }} />
          <input
            type="text" placeholder="Search designer, name, SKU..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-sm rounded-xl outline-none transition-all"
            style={{ fontFamily: FONT.body, background: C.surface, border: `1px solid ${C.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.03)', color: C.textPrimary }}
            onFocus={e => e.target.style.borderColor = C.gold}
            onBlur={e => e.target.style.borderColor = C.border}
          />
        </div>
        <div className="flex gap-1 rounded-xl p-1" style={{ background: C.surface, boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.04)' }}>
          {['all', 'bridal', 'evening', 'cocktail'].map(c => (
            <button
              key={c} onClick={() => setCategory(c)}
              className="px-4 py-2 text-xs font-medium capitalize rounded-lg transition-all"
              style={{
                fontFamily: FONT.body,
                background: category === c ? C.charcoal : 'transparent',
                color: category === c ? '#fff' : C.textMuted,
                letterSpacing: '0.05em',
              }}
            >{c}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? <Spinner /> : items.length === 0 ? (
        <div className="text-center py-24">
          <Package size={44} className="mx-auto mb-5" style={{ color: C.textFaint }} />
          <p className="text-sm" style={{ color: C.textMuted, fontFamily: FONT.body }}>No gowns found. Add your first piece to the collection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {items.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-2xl overflow-hidden group transition-all duration-300 hover:-translate-y-1"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)'}
            >
              {/* Color banner */}
              <div className="h-36 relative" style={{ background: colorGradient(item.color) }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl font-light opacity-[0.07]" style={{ fontFamily: FONT.heading, color: C.charcoal }}>
                    {(item.designer || 'F')[0]}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span
                    className="px-3 py-1 text-[10px] font-medium uppercase tracking-[0.15em] rounded-full backdrop-blur-md"
                    style={{
                      background: item.current_status === 'ready' ? 'rgba(45,138,86,0.15)' : 'rgba(212,175,55,0.18)',
                      color: item.current_status === 'ready' ? C.success : C.goldMuted,
                    }}
                  >{item.current_status || 'ready'}</span>
                </div>
                {/* Action buttons */}
                <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button onClick={() => setModal({ editing: item })} className="p-2 bg-white/90 rounded-xl hover:bg-white shadow-sm transition-all"><Pencil size={13} style={{ color: C.textMuted }} /></button>
                  <button onClick={() => setDeleting(item)} className="p-2 bg-white/90 rounded-xl hover:bg-white shadow-sm transition-all"><Trash2 size={13} style={{ color: C.error }} /></button>
                </div>
              </div>
              <div className="p-6">
                <p className="text-[10px] uppercase tracking-[0.25em] mb-1" style={{ fontFamily: FONT.body, color: C.textMuted, fontWeight: 500 }}>{item.designer || '—'}</p>
                <h3 className="text-xl font-medium mb-1" style={{ fontFamily: FONT.heading, color: C.charcoal }}>{item.model_name}</h3>
                <p className="text-xs mb-4" style={{ color: C.textFaint, fontFamily: FONT.body }}>{item.sku}</p>
                <div className="flex justify-between items-center pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
                  <span className="text-[10px] uppercase tracking-[0.15em]" style={{ color: C.textFaint, fontFamily: FONT.body }}>{item.size_label || '—'} · {item.color || '—'}</span>
                  <span className="text-base font-semibold" style={{ color: C.gold, fontFamily: FONT.body }}>{formatEGP(item.rental_price)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        open={modal !== null && modal !== false}
        onClose={() => setModal(null)}
        title={modal === 'add' ? 'Add New Gown' : 'Edit Gown'}
        wide
      >
        <GownForm
          initial={modal && modal.editing ? modal.editing : null}
          onSave={() => { setModal(null); load(); }}
          onCancel={() => setModal(null)}
        />
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Confirm Removal">
        <p className="text-sm mb-7" style={{ color: C.textSecondary, fontFamily: FONT.body, lineHeight: 1.7 }}>
          Remove <strong style={{ color: C.charcoal }}>{deleting?.model_name}</strong> ({deleting?.sku}) from the collection? This cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Btn variant="secondary" onClick={() => setDeleting(null)}>Cancel</Btn>
          <Btn variant="danger" onClick={() => handleDelete(deleting.id)}>Remove Gown</Btn>
        </div>
      </Modal>
    </div>
  );
}

function colorGradient(color) {
  const map = {
    white: 'linear-gradient(135deg, #F0ECE4, #FAF9F7)',
    ivory: 'linear-gradient(135deg, #F0ECE4, #FDFBF7)',
    champagne: 'linear-gradient(135deg, #ECE2D0, #F8F2E6)',
    gold: 'linear-gradient(135deg, #E6D49C, #F2EBD4)',
    blush: 'linear-gradient(135deg, #F5DCDC, #FBF0F0)',
    pink: 'linear-gradient(135deg, #F0CCCC, #F8E4E4)',
    navy: 'linear-gradient(135deg, #1A2E4A, #2A4060)',
    black: 'linear-gradient(135deg, #1A1A1A, #2D2D2D)',
    red: 'linear-gradient(135deg, #7A1A1A, #962828)',
    sage: 'linear-gradient(135deg, #CCD8C6, #DDE8D6)',
    blue: 'linear-gradient(135deg, #BCCCDC, #D0DCE8)',
  };
  const key = (color || '').toLowerCase();
  return map[key] || 'linear-gradient(135deg, #E8E2DA, #F2EDE6)';
}

// ── Gown Form ───────────────────────────────────────────────
function GownForm({ initial, onSave, onCancel }) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    sku: initial?.sku || '',
    model_name: initial?.model_name || '',
    designer: initial?.designer || '',
    category: initial?.category || 'bridal',
    size_label: initial?.size_label || '',
    color: initial?.color || '',
    rental_price: initial?.rental_price || '',
  });

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async () => {
    if (!form.sku || !form.model_name || !form.rental_price) {
      toast('SKU, name, and rental price are required', 'warn');
      return;
    }
    try {
      setSaving(true);
      if (initial) {
        await apiFetch(`/inventory/${initial.id}`, { method: 'PUT', body: form });
        toast('Gown updated', 'success');
      } else {
        await apiFetch('/inventory', { method: 'POST', body: form });
        toast('Gown added to collection', 'success');
      }
      onSave();
    } catch (err) {
      toast(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-5">
        <Input label="SKU" placeholder="VW-GEMMA-S8-001" value={form.sku} onChange={e => set('sku', e.target.value)} />
        <Input label="Model Name" placeholder="Celestial Bloom" value={form.model_name} onChange={e => set('model_name', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-5">
        <Input label="Designer" placeholder="Vera Wang" value={form.designer} onChange={e => set('designer', e.target.value)} />
        <Select label="Category" value={form.category} onChange={e => set('category', e.target.value)}>
          <option value="bridal">Bridal</option>
          <option value="evening">Evening</option>
          <option value="cocktail">Cocktail</option>
          <option value="mother_of_bride">Mother of Bride</option>
        </Select>
      </div>
      <div className="grid grid-cols-3 gap-5">
        <Input label="Size" placeholder="S8" value={form.size_label} onChange={e => set('size_label', e.target.value)} />
        <Input label="Color" placeholder="Ivory" value={form.color} onChange={e => set('color', e.target.value)} />
        <Input label="Rental Price (EGP)" type="number" placeholder="4500" value={form.rental_price} onChange={e => set('rental_price', e.target.value)} />
      </div>
      <div className="flex gap-3 justify-end pt-5" style={{ borderTop: `1px solid ${C.border}` }}>
        <Btn variant="secondary" onClick={onCancel}>Cancel</Btn>
        <Btn variant="gold" onClick={handleSubmit} disabled={saving}>
          {saving ? <Loader2 size={15} className="animate-spin" /> : initial ? 'Save Changes' : 'Add to Collection'}
        </Btn>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// BOOKINGS VIEW
// ════════════════════════════════════════════════════════════
function BookingsView() {
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [b, inv, cust] = await Promise.all([
        apiFetch('/bookings'),
        apiFetch('/inventory'),
        apiFetch('/customers'),
      ]);
      setBookings(b);
      setInventory(inv);
      setCustomers(cust);
    } catch (err) {
      toast(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const { year, month } = viewMonth;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = new Date(year, month).toLocaleDateString('en', { month: 'long', year: 'numeric' });

  const prev = () => setViewMonth(p => p.month === 0 ? { year: p.year - 1, month: 11 } : { ...p, month: p.month - 1 });
  const next = () => setViewMonth(p => p.month === 11 ? { year: p.year + 1, month: 0 } : { ...p, month: p.month + 1 });

  const getBookingsForDay = (day) => {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookings.filter(b => b.start_date <= date && b.end_date >= date);
  };

  const today = new Date();
  const isToday = (day) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  return (
    <div>
      <div className="flex justify-between items-end mb-12">
        <div>
          <p className="mb-2 tracking-[0.3em] uppercase text-[10px] font-medium" style={{ fontFamily: FONT.body, color: C.gold }}>Scheduling</p>
          <h2 className="text-4xl font-medium tracking-tight" style={{ fontFamily: FONT.heading, color: C.charcoal }}>Booking Calendar</h2>
        </div>
        <Btn variant="gold" onClick={() => setModal(true)}>
          <span className="flex items-center gap-2"><Plus size={15} />New Booking</span>
        </Btn>
      </div>

      {loading ? <Spinner /> : (
        <>
          {/* Calendar */}
          <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)' }}>
            {/* Month nav */}
            <div className="flex items-center justify-between px-7 py-5" style={{ borderBottom: `1px solid ${C.border}` }}>
              <button onClick={prev} className="p-2.5 rounded-xl hover:bg-black/5 transition-colors"><ChevronLeft size={18} style={{ color: C.textMuted }} /></button>
              <h3 className="text-xl font-medium" style={{ fontFamily: FONT.heading, color: C.charcoal }}>{monthName}</h3>
              <button onClick={next} className="p-2.5 rounded-xl hover:bg-black/5 transition-colors"><ChevronRight size={18} style={{ color: C.textMuted }} /></button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7" style={{ borderBottom: `1px solid ${C.border}` }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="px-2 py-3 text-center text-[10px] uppercase tracking-[0.2em] font-medium" style={{ color: C.textFaint, fontFamily: FONT.body }}>{d}</div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7">
              {Array.from({ length: firstDay }, (_, i) => (
                <div key={`e-${i}`} className="min-h-[100px]" style={{ borderBottom: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}` }} />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dayBookings = getBookingsForDay(day);
                return (
                  <div
                    key={day}
                    className="min-h-[100px] p-2 transition-colors"
                    style={{
                      borderBottom: `1px solid ${C.border}`,
                      borderRight: `1px solid ${C.border}`,
                      background: isToday(day) ? C.goldLight : 'transparent',
                    }}
                  >
                    <span
                      className="text-xs font-medium inline-flex items-center justify-center w-7 h-7 rounded-full"
                      style={{
                        fontFamily: FONT.body,
                        background: isToday(day) ? C.gold : 'transparent',
                        color: isToday(day) ? '#fff' : C.textSecondary,
                      }}
                    >{day}</span>
                    <div className="mt-1.5 space-y-1">
                      {dayBookings.slice(0, 2).map(b => (
                        <div key={b.id} className="text-[9px] px-2 py-1 rounded-lg font-medium truncate" style={{ background: C.goldLight, color: C.goldMuted, fontFamily: FONT.body }}>
                          {b.customer_name || `#${b.customer_id}`} — {b.model_name || b.sku}
                        </div>
                      ))}
                      {dayBookings.length > 2 && (
                        <span className="text-[9px] px-1" style={{ color: C.textFaint }}>+{dayBookings.length - 2} more</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Booking list */}
          <div className="mt-10">
            <h3 className="text-xs font-medium uppercase tracking-[0.2em] mb-5" style={{ fontFamily: FONT.body, color: C.textMuted }}>All Bookings ({bookings.length})</h3>
            {bookings.length === 0 ? (
              <p className="text-sm text-center py-12" style={{ color: C.textFaint, fontFamily: FONT.body }}>No bookings yet.</p>
            ) : (
              <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)' }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                      {['Client', 'Gown', 'Start', 'End', 'Buffer', 'Fee'].map(h => (
                        <th key={h} className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: C.textFaint, fontFamily: FONT.body }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b, idx) => (
                      <tr key={b.id} className="transition-colors hover:bg-black/[0.015]" style={{ borderBottom: idx < bookings.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                        <td className="px-6 py-4 text-sm font-medium" style={{ color: C.textPrimary, fontFamily: FONT.body }}>{b.customer_name || `ID ${b.customer_id}`}</td>
                        <td className="px-6 py-4 text-sm" style={{ color: C.textSecondary, fontFamily: FONT.body }}>{b.model_name || b.sku || `Unit ${b.inventory_unit_id}`}</td>
                        <td className="px-6 py-4 text-sm" style={{ color: C.textMuted, fontFamily: FONT.body }}>{b.start_date}</td>
                        <td className="px-6 py-4 text-sm" style={{ color: C.textMuted, fontFamily: FONT.body }}>{b.end_date}</td>
                        <td className="px-6 py-4 text-xs" style={{ color: C.textFaint, fontFamily: FONT.body }}>{b.buffer_end_date}</td>
                        <td className="px-6 py-4 text-sm font-semibold" style={{ color: C.gold, fontFamily: FONT.body }}>{formatEGP(b.total_fee)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* New Booking Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Create Booking" wide>
        <BookingForm
          customers={customers}
          inventory={inventory}
          onSave={() => { setModal(false); load(); }}
          onCancel={() => setModal(false)}
        />
      </Modal>
    </div>
  );
}

// ── Booking Form ────────────────────────────────────────────
function BookingForm({ customers, inventory, onSave, onCancel }) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    customer_id: '', inventory_unit_id: '', start_date: '', end_date: '', total_fee: ''
  });
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async () => {
    if (!form.customer_id || !form.inventory_unit_id || !form.start_date || !form.end_date) {
      toast('All fields are required', 'warn'); return;
    }
    try {
      setSaving(true);
      await apiFetch('/bookings', { method: 'POST', body: { ...form, customer_id: parseInt(form.customer_id), inventory_unit_id: parseInt(form.inventory_unit_id), total_fee: parseFloat(form.total_fee || 0) } });
      toast('Booking confirmed', 'success');
      onSave();
    } catch (err) {
      toast(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <Select label="Client" value={form.customer_id} onChange={e => set('customer_id', e.target.value)}>
        <option value="">Select a client...</option>
        {customers.map(c => <option key={c.id} value={c.id}>{c.full_name} — {c.phone}</option>)}
      </Select>
      <Select label="Gown" value={form.inventory_unit_id} onChange={e => set('inventory_unit_id', e.target.value)}>
        <option value="">Select a gown...</option>
        {inventory.filter(i => (i.current_status || 'ready') === 'ready').map(i => (
          <option key={i.id} value={i.id}>{i.designer} — {i.model_name} ({i.sku})</option>
        ))}
      </Select>
      <div className="grid grid-cols-2 gap-5">
        <Input label="Pickup Date" type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} />
        <Input label="Return Date" type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)} />
      </div>
      <Input label="Total Fee (EGP)" type="number" placeholder="4500" value={form.total_fee} onChange={e => set('total_fee', e.target.value)} />
      <div className="flex gap-3 justify-end pt-5" style={{ borderTop: `1px solid ${C.border}` }}>
        <Btn variant="secondary" onClick={onCancel}>Cancel</Btn>
        <Btn variant="gold" onClick={handleSubmit} disabled={saving}>
          {saving ? <Loader2 size={15} className="animate-spin" /> : 'Confirm Booking'}
        </Btn>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// CUSTOMERS VIEW
// ════════════════════════════════════════════════════════════
function CustomersView() {
  const toast = useToast();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const data = await apiFetch(`/customers${params}`);
      setCustomers(data);
    } catch (err) {
      toast(err.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [search, toast]);

  useEffect(() => { load(); }, [load]);

  const viewDetail = async (id) => {
    try {
      setDetailLoading(true);
      const data = await apiFetch(`/customers/${id}`);
      setDetail(data);
    } catch (err) {
      toast(err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-end mb-12">
        <div>
          <p className="mb-2 tracking-[0.3em] uppercase text-[10px] font-medium" style={{ fontFamily: FONT.body, color: C.gold }}>Client Relations</p>
          <h2 className="text-4xl font-medium tracking-tight" style={{ fontFamily: FONT.heading, color: C.charcoal }}>Customer Profiles</h2>
        </div>
        <Btn variant="gold" onClick={() => setModal('add')}>
          <span className="flex items-center gap-2"><Plus size={15} />Add Client</span>
        </Btn>
      </div>

      {/* Search */}
      <div className="relative max-w-xs mb-10">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: C.textFaint }} />
        <input
          type="text" placeholder="Search name, email, phone..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 text-sm rounded-xl outline-none transition-all"
          style={{ fontFamily: FONT.body, background: C.surface, border: `1px solid ${C.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.03)', color: C.textPrimary }}
          onFocus={e => e.target.style.borderColor = C.gold}
          onBlur={e => e.target.style.borderColor = C.border}
        />
      </div>

      {loading ? <Spinner /> : customers.length === 0 ? (
        <div className="text-center py-24">
          <Users size={44} className="mx-auto mb-5" style={{ color: C.textFaint }} />
          <p className="text-sm" style={{ color: C.textMuted, fontFamily: FONT.body }}>No clients registered.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {customers.map(c => (
            <div
              key={c.id}
              className="bg-white rounded-2xl p-6 group transition-all duration-300 hover:-translate-y-0.5"
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)'}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${C.goldLight}, ${C.goldGlow})` }}>
                    <span className="text-sm font-semibold" style={{ fontFamily: FONT.heading, color: C.goldMuted }}>
                      {(c.full_name || '?').split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: C.charcoal, fontFamily: FONT.body }}>{c.full_name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {c.phone && <span className="text-xs flex items-center gap-1" style={{ color: C.textMuted }}><Phone size={10} />{c.phone}</span>}
                      {c.email && <span className="text-xs flex items-center gap-1" style={{ color: C.textMuted }}><Mail size={10} />{c.email}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: C.textFaint, fontFamily: FONT.body }}>{c.total_bookings || 0} bookings</span>
                  <button onClick={() => viewDetail(c.id)} className="p-2 rounded-xl hover:bg-black/5 opacity-0 group-hover:opacity-100 transition-all">
                    <Eye size={14} style={{ color: C.textMuted }} />
                  </button>
                  <button onClick={() => setModal({ editing: c })} className="p-2 rounded-xl hover:bg-black/5 opacity-0 group-hover:opacity-100 transition-all">
                    <Pencil size={14} style={{ color: C.textMuted }} />
                  </button>
                </div>
              </div>

              {/* Measurements */}
              {(c.bust_cm || c.waist_cm || c.hips_cm) && (
                <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
                  <p className="text-[9px] uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5" style={{ color: C.textFaint, fontFamily: FONT.body, fontWeight: 500 }}><Ruler size={9} /> Measurements</p>
                  <div className="flex gap-3">
                    {[
                      { label: 'Bust', val: c.bust_cm },
                      { label: 'Waist', val: c.waist_cm },
                      { label: 'Hips', val: c.hips_cm },
                      { label: 'Shoe', val: c.shoe_size },
                    ].filter(m => m.val).map((m, i) => (
                      <div key={i} className="text-center rounded-xl px-4 py-2" style={{ background: C.bone }}>
                        <p className="text-xs font-semibold" style={{ color: C.charcoal, fontFamily: FONT.body }}>{m.val}{m.label !== 'Shoe' ? 'cm' : ''}</p>
                        <p className="text-[8px] uppercase tracking-wider" style={{ color: C.textFaint }}>{m.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {c.wedding_date && (
                <div className="mt-3 text-[10px]" style={{ color: C.textMuted, fontFamily: FONT.body }}>
                  Event: {new Date(c.wedding_date).toLocaleDateString('en-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      <Modal open={modal !== null && modal !== false} onClose={() => setModal(null)} title={modal === 'add' ? 'Register Client' : 'Edit Client'} wide>
        <CustomerForm
          initial={modal && modal.editing ? modal.editing : null}
          onSave={() => { setModal(null); load(); }}
          onCancel={() => setModal(null)}
        />
      </Modal>

      {/* Detail Modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.full_name || 'Client Profile'} wide>
        {detailLoading ? <Spinner /> : detail && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-5 text-sm">
              <div><span className="text-[10px] uppercase tracking-[0.15em]" style={{ color: C.textFaint, fontFamily: FONT.body }}>Phone</span><p className="font-medium mt-0.5" style={{ color: C.charcoal }}>{detail.phone || '—'}</p></div>
              <div><span className="text-[10px] uppercase tracking-[0.15em]" style={{ color: C.textFaint, fontFamily: FONT.body }}>Email</span><p className="font-medium mt-0.5" style={{ color: C.charcoal }}>{detail.email || '—'}</p></div>
              <div><span className="text-[10px] uppercase tracking-[0.15em]" style={{ color: C.textFaint, fontFamily: FONT.body }}>Wedding Date</span><p className="font-medium mt-0.5" style={{ color: C.charcoal }}>{detail.wedding_date || '—'}</p></div>
              <div><span className="text-[10px] uppercase tracking-[0.15em]" style={{ color: C.textFaint, fontFamily: FONT.body }}>Shoe Size</span><p className="font-medium mt-0.5" style={{ color: C.charcoal }}>{detail.shoe_size || '—'}</p></div>
            </div>
            {detail.bookings && detail.bookings.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-[0.2em] mb-4 font-medium" style={{ color: C.textMuted, fontFamily: FONT.body }}>Booking History</p>
                <div className="space-y-3">
                  {detail.bookings.map(b => (
                    <div key={b.id} className="flex items-center justify-between rounded-xl px-5 py-3.5" style={{ background: C.bone }}>
                      <div>
                        <p className="text-sm font-medium" style={{ color: C.charcoal, fontFamily: FONT.body }}>{b.designer} — {b.model_name}</p>
                        <p className="text-xs mt-0.5" style={{ color: C.textFaint }}>{b.sku} · {b.color}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs" style={{ color: C.textMuted }}>{b.start_date} → {b.end_date}</p>
                        <p className="text-sm font-semibold mt-0.5" style={{ color: C.gold, fontFamily: FONT.body }}>{formatEGP(b.total_fee)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

// ── Customer Form ───────────────────────────────────────────
function CustomerForm({ initial, onSave, onCancel }) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: initial?.full_name || '',
    email: initial?.email || '',
    phone: initial?.phone || '',
    wedding_date: initial?.wedding_date ? initial.wedding_date.slice(0, 10) : '',
    bust_cm: initial?.bust_cm || '',
    waist_cm: initial?.waist_cm || '',
    hips_cm: initial?.hips_cm || '',
    shoe_size: initial?.shoe_size || '',
  });
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async () => {
    if (!form.full_name) { toast('Name is required', 'warn'); return; }
    try {
      setSaving(true);
      const body = { ...form, bust_cm: form.bust_cm || null, waist_cm: form.waist_cm || null, hips_cm: form.hips_cm || null, wedding_date: form.wedding_date || null };
      if (initial) {
        await apiFetch(`/customers/${initial.id}`, { method: 'PUT', body });
        toast('Client updated', 'success');
      } else {
        await apiFetch('/customers', { method: 'POST', body });
        toast('Client registered', 'success');
      }
      onSave();
    } catch (err) {
      toast(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-5">
        <Input label="Full Name" placeholder="Layla Al Maktoum" value={form.full_name} onChange={e => set('full_name', e.target.value)} />
        <Input label="Email" type="email" placeholder="layla@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-5">
        <Input label="Phone" placeholder="+20 10 123 4567" value={form.phone} onChange={e => set('phone', e.target.value)} />
        <Input label="Wedding / Event Date" type="date" value={form.wedding_date} onChange={e => set('wedding_date', e.target.value)} />
      </div>
      <div className="pt-3">
        <p className="text-[10px] uppercase tracking-[0.2em] mb-3 flex items-center gap-1.5" style={{ color: C.textFaint, fontFamily: FONT.body, fontWeight: 500 }}><Ruler size={10} /> Measurement Vault (cm)</p>
        <div className="grid grid-cols-4 gap-4">
          <Input label="Bust" type="number" value={form.bust_cm} onChange={e => set('bust_cm', e.target.value)} />
          <Input label="Waist" type="number" value={form.waist_cm} onChange={e => set('waist_cm', e.target.value)} />
          <Input label="Hips" type="number" value={form.hips_cm} onChange={e => set('hips_cm', e.target.value)} />
          <Input label="Shoe Size" placeholder="38" value={form.shoe_size} onChange={e => set('shoe_size', e.target.value)} />
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-5" style={{ borderTop: `1px solid ${C.border}` }}>
        <Btn variant="secondary" onClick={onCancel}>Cancel</Btn>
        <Btn variant="gold" onClick={handleSubmit} disabled={saving}>
          {saving ? <Loader2 size={15} className="animate-spin" /> : initial ? 'Save Changes' : 'Register Client'}
        </Btn>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// MAIN APP
// ════════════════════════════════════════════════════════════
export default function App() {
  const [view, setView] = useState('inventory');
  const [stats, setStats] = useState(null);
  const [apiOnline, setApiOnline] = useState(null);

  useEffect(() => {
    apiFetch('/health')
      .then(() => setApiOnline(true))
      .catch(() => setApiOnline(false));
    apiFetch('/stats')
      .then(d => setStats(d))
      .catch(() => { });
  }, []);

  const nav = [
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'customers', label: 'Customers', icon: Users },
  ];

  return (
    <ToastProvider>
      <div className="min-h-screen" style={{ fontFamily: FONT.body, background: C.bone, color: C.textPrimary }}>

        {/* Global Animations */}
        <style>{`
          @keyframes toastIn {
            from { transform: translateX(100%) scale(0.95); opacity: 0; }
            to { transform: translateX(0) scale(1); opacity: 1; }
          }
        `}</style>

        {/* ── Header ─────────────────────────────────────── */}
        <header className="sticky top-0 z-40" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${C.border}` }}>
          <div className="max-w-7xl mx-auto px-8 lg:px-10">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center gap-4">
                <Diamond size={28} style={{ color: C.gold }} strokeWidth={1.3} />
                <div>
                  <h1 className="text-xl tracking-[0.12em] uppercase font-medium" style={{ fontFamily: FONT.heading }}>{`Faryal Al Hosary`}</h1>
                  <p className="text-[9px] tracking-[0.35em] uppercase -mt-0.5" style={{ color: C.textFaint }}>Luxury Bridal Atelier</p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                {/* Quick stats */}
                {stats && (
                  <div className="hidden lg:flex items-center gap-6 text-xs" style={{ color: C.textMuted }}>
                    <span><strong style={{ color: C.charcoal }}>{stats.inventory?.total_gowns || 0}</strong> gowns</span>
                    <span className="w-px h-3" style={{ background: C.border }} />
                    <span><strong style={{ color: C.charcoal }}>{stats.customers || 0}</strong> clients</span>
                    <span className="w-px h-3" style={{ background: C.border }} />
                    <span><strong style={{ color: C.gold }}>{formatEGP(stats.revenue)}</strong> revenue</span>
                  </div>
                )}

                {/* API Status */}
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: apiOnline === true ? C.success : apiOnline === false ? C.error : C.textFaint }} />
                  <span className="text-[10px]" style={{ color: C.textFaint }}>{apiOnline === true ? 'Engine Online' : apiOnline === false ? 'Offline' : 'Checking...'}</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex gap-1 -mb-px">
              {nav.map(n => (
                <button
                  key={n.id}
                  onClick={() => setView(n.id)}
                  className="flex items-center gap-2.5 px-6 py-3.5 text-sm font-medium tracking-[0.1em] uppercase transition-all border-b-2"
                  style={{
                    fontFamily: FONT.body,
                    borderColor: view === n.id ? C.gold : 'transparent',
                    color: view === n.id ? C.charcoal : C.textMuted,
                  }}
                >
                  <n.icon size={15} />
                  {n.label}
                </button>
              ))}
            </nav>
          </div>
        </header>

        {/* ── API Down Banner ────────────────────────────── */}
        {apiOnline === false && (
          <div className="px-8 py-4 text-center" style={{ background: C.errorBg, borderBottom: `1px solid ${C.errorBorder}` }}>
            <p className="text-sm flex items-center justify-center gap-2" style={{ color: C.error, fontFamily: FONT.body }}>
              <AlertCircle size={15} />
              <span>Cannot connect to the Faryal Engine. Data operations are unavailable.</span>
              <button
                onClick={() => { setApiOnline(null); apiFetch('/health').then(() => setApiOnline(true)).catch(() => setApiOnline(false)); }}
                className="underline font-medium ml-2"
              >Retry</button>
            </p>
          </div>
        )}

        {/* ── Content ────────────────────────────────────── */}
        <main className="max-w-7xl mx-auto px-8 lg:px-10 py-12">
          {view === 'inventory' && <InventoryView />}
          {view === 'bookings' && <BookingsView />}
          {view === 'customers' && <CustomersView />}
        </main>

        {/* ── Footer ─────────────────────────────────────── */}
        <footer className="py-8 text-center" style={{ borderTop: `1px solid ${C.border}` }}>
          <p className="text-[10px] tracking-[0.25em] uppercase" style={{ color: C.textFaint }}>Faryal Al Hosary · Luxury Bridal & Occasion · Powered by Travel Expert™</p>
        </footer>
      </div>
    </ToastProvider>
  );
}