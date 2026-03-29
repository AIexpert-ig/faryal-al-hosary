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
      <div className="fixed bottom-6 right-6 z-[999] flex flex-col gap-2 max-w-sm">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm animate-[slideIn_0.3s_ease] ${t.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-800'
                : t.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
          >
            {t.type === 'error' ? <AlertCircle size={16} className="mt-0.5 shrink-0" /> : <CheckCircle size={16} className="mt-0.5 shrink-0" />}
            <span>{t.message}</span>
            <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="ml-auto shrink-0 opacity-50 hover:opacity-100">
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
    <div className="flex items-center justify-center gap-3 text-[#B4A074]">
      <Loader2 size={20} className="animate-spin" />
      <span className="text-sm tracking-wider uppercase opacity-60" style={{ fontFamily: 'Outfit, sans-serif' }}>Loading</span>
    </div>
  );
  if (full) return <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">{el}</div>;
  return <div className="py-20">{el}</div>;
}

// ── Modal ───────────────────────────────────────────────────
function Modal({ open, onClose, title, children, wide = false }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className={`relative bg-white rounded-xl shadow-2xl border border-stone-200/50 max-h-[90vh] overflow-y-auto ${wide ? 'w-full max-w-2xl' : 'w-full max-w-lg'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h3 className="text-lg font-medium" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors"><X size={18} className="text-stone-400" /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ── Shared Input ────────────────────────────────────────────
function Input({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-stone-400 mb-1.5 block" style={{ fontFamily: 'Outfit, sans-serif' }}>{label}</span>
      <input
        className="w-full px-3 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-[#B4A074] focus:ring-1 focus:ring-[#B4A074]/30 transition-all placeholder:text-stone-300"
        {...props}
      />
    </label>
  );
}

function Select({ label, children, ...props }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-stone-400 mb-1.5 block" style={{ fontFamily: 'Outfit, sans-serif' }}>{label}</span>
      <select
        className="w-full px-3 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-[#B4A074] focus:ring-1 focus:ring-[#B4A074]/30 transition-all"
        {...props}
      >{children}</select>
    </label>
  );
}

function Btn({ children, variant = 'primary', ...props }) {
  const styles = {
    primary: 'bg-[#2D2926] text-white hover:bg-[#B4A074]',
    secondary: 'bg-stone-100 text-stone-600 hover:bg-stone-200',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200',
    gold: 'text-white hover:opacity-90',
  };
  return (
    <button
      className={`px-5 py-2.5 text-sm font-medium tracking-wider uppercase rounded-lg transition-all disabled:opacity-50 ${styles[variant]}`}
      style={variant === 'gold' ? { background: 'linear-gradient(135deg, #B4A074, #8C7A5A)' } : undefined}
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

// ════════════════════════════════════════════════════════════
// INVENTORY VIEW
// ════════════════════════════════════════════════════════════
function InventoryView() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [modal, setModal] = useState(null); // null | 'add' | { editing: item }
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
      <div className="flex justify-between items-end mb-10">
        <div>
          <p className="text-[#B4A074] font-medium mb-1 tracking-[0.25em] uppercase text-[10px]" style={{ fontFamily: 'Outfit, sans-serif' }}>Atelier Management</p>
          <h2 className="text-3xl font-light tracking-tight" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Bridal Collection</h2>
        </div>
        <Btn variant="gold" onClick={() => setModal('add')}>
          <span className="flex items-center gap-2"><Plus size={15} />Add Gown</span>
        </Btn>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-8">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" />
          <input
            type="text" placeholder="Search designer, name, SKU..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-[#B4A074] transition-all"
          />
        </div>
        <div className="flex gap-1 bg-white rounded-lg border border-stone-200 p-0.5">
          {['all', 'bridal', 'evening', 'cocktail'].map(c => (
            <button
              key={c} onClick={() => setCategory(c)}
              className={`px-3.5 py-1.5 text-xs font-medium capitalize rounded-md transition-all ${category === c ? 'bg-[#2D2926] text-white' : 'text-stone-400 hover:text-stone-600'
                }`}
            >{c}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? <Spinner /> : items.length === 0 ? (
        <div className="text-center py-20">
          <Package size={40} className="mx-auto text-stone-200 mb-4" />
          <p className="text-stone-400 text-sm">No gowns found. Add your first piece to the collection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <div key={item.id} className="bg-white border border-stone-200/70 rounded-xl overflow-hidden group hover:shadow-lg transition-all duration-300">
              {/* Color banner */}
              <div className="h-32 relative" style={{ background: colorGradient(item.color) }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl font-light opacity-10 text-black" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                    {(item.designer || 'F')[0]}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className={`px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider rounded-full backdrop-blur-sm ${item.current_status === 'ready' ? 'bg-emerald-500/20 text-emerald-800' : 'bg-amber-500/20 text-amber-800'
                    }`}>{item.current_status || 'ready'}</span>
                </div>
                {/* Action buttons */}
                <div className="absolute top-3 left-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setModal({ editing: item })} className="p-1.5 bg-white/90 rounded-lg hover:bg-white shadow-sm"><Pencil size={13} className="text-stone-500" /></button>
                  <button onClick={() => setDeleting(item)} className="p-1.5 bg-white/90 rounded-lg hover:bg-white shadow-sm"><Trash2 size={13} className="text-red-400" /></button>
                </div>
              </div>
              <div className="p-5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400" style={{ fontFamily: 'Outfit, sans-serif' }}>{item.designer || '—'}</p>
                <h3 className="text-lg font-medium mt-0.5 mb-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{item.model_name}</h3>
                <p className="text-xs text-stone-400 mb-3">{item.sku}</p>
                <div className="flex justify-between items-center pt-3 border-t border-stone-100">
                  <span className="text-[10px] uppercase tracking-wider text-stone-300">{item.size_label || '—'} · {item.color || '—'}</span>
                  <span className="text-base font-medium" style={{ color: '#B4A074' }}>AED {Number(item.rental_price || 0).toLocaleString()}</span>
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
        <p className="text-sm text-stone-600 mb-6">
          Remove <strong>{deleting?.model_name}</strong> ({deleting?.sku}) from the collection? This cannot be undone.
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
    white: 'linear-gradient(135deg, #F5F0E8, #FAFAF7)',
    ivory: 'linear-gradient(135deg, #F5F0E8, #FDFBF7)',
    champagne: 'linear-gradient(135deg, #F0E8D8, #FAF5EA)',
    gold: 'linear-gradient(135deg, #EBD9A8, #F5EDD8)',
    blush: 'linear-gradient(135deg, #FAE5E5, #FDF0F0)',
    pink: 'linear-gradient(135deg, #F5D5D5, #FAE8E8)',
    navy: 'linear-gradient(135deg, #1e3a5f, #2d4a6f)',
    black: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)',
    red: 'linear-gradient(135deg, #8B2020, #A03030)',
    sage: 'linear-gradient(135deg, #D5E0D0, #E5EDE0)',
    blue: 'linear-gradient(135deg, #C5D5E5, #D5E0EA)',
  };
  const key = (color || '').toLowerCase();
  return map[key] || 'linear-gradient(135deg, #EDE8E0, #F5F0E8)';
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
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="SKU" placeholder="VW-GEMMA-S8-001" value={form.sku} onChange={e => set('sku', e.target.value)} />
        <Input label="Model Name" placeholder="Celestial Bloom" value={form.model_name} onChange={e => set('model_name', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Designer" placeholder="Vera Wang" value={form.designer} onChange={e => set('designer', e.target.value)} />
        <Select label="Category" value={form.category} onChange={e => set('category', e.target.value)}>
          <option value="bridal">Bridal</option>
          <option value="evening">Evening</option>
          <option value="cocktail">Cocktail</option>
          <option value="mother_of_bride">Mother of Bride</option>
        </Select>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Input label="Size" placeholder="S8" value={form.size_label} onChange={e => set('size_label', e.target.value)} />
        <Input label="Color" placeholder="Ivory" value={form.color} onChange={e => set('color', e.target.value)} />
        <Input label="Rental Price (AED)" type="number" placeholder="4500" value={form.rental_price} onChange={e => set('rental_price', e.target.value)} />
      </div>
      <div className="flex gap-3 justify-end pt-4 border-t border-stone-100">
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

  // Calendar helpers
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
      <div className="flex justify-between items-end mb-10">
        <div>
          <p className="text-[#B4A074] font-medium mb-1 tracking-[0.25em] uppercase text-[10px]" style={{ fontFamily: 'Outfit, sans-serif' }}>Scheduling</p>
          <h2 className="text-3xl font-light tracking-tight" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Booking Calendar</h2>
        </div>
        <Btn variant="gold" onClick={() => setModal(true)}>
          <span className="flex items-center gap-2"><Plus size={15} />New Booking</span>
        </Btn>
      </div>

      {loading ? <Spinner /> : (
        <>
          {/* Calendar */}
          <div className="bg-white rounded-xl border border-stone-200/70 overflow-hidden">
            {/* Month nav */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <button onClick={prev} className="p-2 hover:bg-stone-50 rounded-lg transition-colors"><ChevronLeft size={18} className="text-stone-400" /></button>
              <h3 className="text-lg font-medium" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{monthName}</h3>
              <button onClick={next} className="p-2 hover:bg-stone-50 rounded-lg transition-colors"><ChevronRight size={18} className="text-stone-400" /></button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-stone-100">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="px-2 py-2 text-center text-[10px] uppercase tracking-wider text-stone-300 font-medium">{d}</div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7">
              {Array.from({ length: firstDay }, (_, i) => (
                <div key={`e-${i}`} className="min-h-[90px] border-b border-r border-stone-50" />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dayBookings = getBookingsForDay(day);
                return (
                  <div key={day} className={`min-h-[90px] border-b border-r border-stone-50 p-1.5 ${isToday(day) ? 'bg-amber-50/40' : 'hover:bg-stone-50/50'} transition-colors`}>
                    <span className={`text-xs font-medium inline-block w-6 h-6 rounded-full flex items-center justify-center ${isToday(day) ? 'bg-[#B4A074] text-white' : 'text-stone-500'}`}>{day}</span>
                    <div className="mt-1 space-y-0.5">
                      {dayBookings.slice(0, 2).map(b => (
                        <div key={b.id} className="text-[9px] px-1.5 py-0.5 rounded bg-[#B4A074]/10 text-[#8C7A5A] truncate font-medium">
                          {b.customer_name || `#${b.customer_id}`} — {b.model_name || b.sku}
                        </div>
                      ))}
                      {dayBookings.length > 2 && (
                        <span className="text-[9px] text-stone-400 px-1">+{dayBookings.length - 2} more</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Booking list below calendar */}
          <div className="mt-8">
            <h3 className="text-sm font-medium uppercase tracking-wider text-stone-400 mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>All Bookings ({bookings.length})</h3>
            {bookings.length === 0 ? (
              <p className="text-sm text-stone-300 text-center py-10">No bookings yet.</p>
            ) : (
              <div className="bg-white rounded-xl border border-stone-200/70 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-stone-100">
                      {['Client', 'Gown', 'Start', 'End', 'Buffer', 'Fee'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-stone-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {bookings.map(b => (
                      <tr key={b.id} className="hover:bg-stone-50/40 transition-colors">
                        <td className="px-5 py-3 text-sm font-medium text-stone-700">{b.customer_name || `ID ${b.customer_id}`}</td>
                        <td className="px-5 py-3 text-sm text-stone-600">{b.model_name || b.sku || `Unit ${b.inventory_unit_id}`}</td>
                        <td className="px-5 py-3 text-sm text-stone-500">{b.start_date}</td>
                        <td className="px-5 py-3 text-sm text-stone-500">{b.end_date}</td>
                        <td className="px-5 py-3 text-xs text-stone-400">{b.buffer_end_date}</td>
                        <td className="px-5 py-3 text-sm font-medium" style={{ color: '#B4A074' }}>AED {Number(b.total_fee || 0).toLocaleString()}</td>
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
    <div className="space-y-4">
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
      <div className="grid grid-cols-2 gap-4">
        <Input label="Pickup Date" type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} />
        <Input label="Return Date" type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)} />
      </div>
      <Input label="Total Fee (AED)" type="number" placeholder="4500" value={form.total_fee} onChange={e => set('total_fee', e.target.value)} />
      <div className="flex gap-3 justify-end pt-4 border-t border-stone-100">
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
      <div className="flex justify-between items-end mb-10">
        <div>
          <p className="text-[#B4A074] font-medium mb-1 tracking-[0.25em] uppercase text-[10px]" style={{ fontFamily: 'Outfit, sans-serif' }}>Client Relations</p>
          <h2 className="text-3xl font-light tracking-tight" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Customer Profiles</h2>
        </div>
        <Btn variant="gold" onClick={() => setModal('add')}>
          <span className="flex items-center gap-2"><Plus size={15} />Add Client</span>
        </Btn>
      </div>

      {/* Search */}
      <div className="relative max-w-xs mb-8">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" />
        <input
          type="text" placeholder="Search name, email, phone..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-[#B4A074] transition-all"
        />
      </div>

      {loading ? <Spinner /> : customers.length === 0 ? (
        <div className="text-center py-20">
          <Users size={40} className="mx-auto text-stone-200 mb-4" />
          <p className="text-stone-400 text-sm">No clients registered.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {customers.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-stone-200/70 p-5 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #EDE8E0, #D5CEC2)' }}>
                    <span className="text-sm font-semibold" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#7A6F5E' }}>
                      {(c.full_name || '?').split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-800">{c.full_name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {c.phone && <span className="text-xs text-stone-400 flex items-center gap-1"><Phone size={10} />{c.phone}</span>}
                      {c.email && <span className="text-xs text-stone-400 flex items-center gap-1"><Mail size={10} />{c.email}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-400">{c.total_bookings || 0} bookings</span>
                  <button onClick={() => viewDetail(c.id)} className="p-1.5 rounded-lg hover:bg-stone-100 opacity-0 group-hover:opacity-100 transition-all">
                    <Eye size={14} className="text-stone-400" />
                  </button>
                  <button onClick={() => setModal({ editing: c })} className="p-1.5 rounded-lg hover:bg-stone-100 opacity-0 group-hover:opacity-100 transition-all">
                    <Pencil size={14} className="text-stone-400" />
                  </button>
                </div>
              </div>

              {/* Measurements */}
              {(c.bust_cm || c.waist_cm || c.hips_cm) && (
                <div className="mt-3 pt-3 border-t border-stone-100">
                  <p className="text-[9px] uppercase tracking-wider text-stone-300 mb-1.5 flex items-center gap-1"><Ruler size={9} /> Measurements</p>
                  <div className="flex gap-3">
                    {[
                      { label: 'Bust', val: c.bust_cm },
                      { label: 'Waist', val: c.waist_cm },
                      { label: 'Hips', val: c.hips_cm },
                      { label: 'Shoe', val: c.shoe_size },
                    ].filter(m => m.val).map((m, i) => (
                      <div key={i} className="text-center bg-stone-50 rounded-lg px-3 py-1.5">
                        <p className="text-xs font-semibold text-stone-700">{m.val}{m.label !== 'Shoe' ? 'cm' : ''}</p>
                        <p className="text-[8px] text-stone-400 uppercase">{m.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {c.wedding_date && (
                <div className="mt-2 text-[10px] text-stone-400">
                  Event: {new Date(c.wedding_date).toLocaleDateString('en-AE', { day: 'numeric', month: 'long', year: 'numeric' })}
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
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-stone-400 text-xs uppercase">Phone</span><p className="font-medium">{detail.phone || '—'}</p></div>
              <div><span className="text-stone-400 text-xs uppercase">Email</span><p className="font-medium">{detail.email || '—'}</p></div>
              <div><span className="text-stone-400 text-xs uppercase">Wedding Date</span><p className="font-medium">{detail.wedding_date || '—'}</p></div>
              <div><span className="text-stone-400 text-xs uppercase">Shoe Size</span><p className="font-medium">{detail.shoe_size || '—'}</p></div>
            </div>
            {detail.bookings && detail.bookings.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wider text-stone-400 mb-3 font-medium">Booking History</p>
                <div className="space-y-2">
                  {detail.bookings.map(b => (
                    <div key={b.id} className="flex items-center justify-between bg-stone-50 rounded-lg px-4 py-2.5">
                      <div>
                        <p className="text-sm font-medium text-stone-700">{b.designer} — {b.model_name}</p>
                        <p className="text-xs text-stone-400">{b.sku} · {b.color}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-stone-500">{b.start_date} → {b.end_date}</p>
                        <p className="text-sm font-medium" style={{ color: '#B4A074' }}>AED {Number(b.total_fee || 0).toLocaleString()}</p>
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
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Full Name" placeholder="Layla Al Maktoum" value={form.full_name} onChange={e => set('full_name', e.target.value)} />
        <Input label="Email" type="email" placeholder="layla@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Phone" placeholder="+971 50 123 4567" value={form.phone} onChange={e => set('phone', e.target.value)} />
        <Input label="Wedding / Event Date" type="date" value={form.wedding_date} onChange={e => set('wedding_date', e.target.value)} />
      </div>
      <div className="pt-2">
        <p className="text-[10px] uppercase tracking-wider text-stone-300 mb-3 flex items-center gap-1"><Ruler size={10} /> Measurement Vault (cm)</p>
        <div className="grid grid-cols-4 gap-3">
          <Input label="Bust" type="number" value={form.bust_cm} onChange={e => set('bust_cm', e.target.value)} />
          <Input label="Waist" type="number" value={form.waist_cm} onChange={e => set('waist_cm', e.target.value)} />
          <Input label="Hips" type="number" value={form.hips_cm} onChange={e => set('hips_cm', e.target.value)} />
          <Input label="Shoe Size" placeholder="38" value={form.shoe_size} onChange={e => set('shoe_size', e.target.value)} />
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-4 border-t border-stone-100">
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

  // Health check on mount
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
      <div className="min-h-screen" style={{ fontFamily: 'Outfit, sans-serif', background: '#FDFBF7', color: '#2D2926' }}>

        {/* Global CSS */}
        <style>{`
          @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        `}</style>

        {/* ── Header ─────────────────────────────────────── */}
        <header className="border-b border-[#E5E1DA] bg-white/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between py-5">
              <div className="flex items-center gap-3">
                <Diamond size={26} style={{ color: '#B4A074' }} strokeWidth={1.5} />
                <div>
                  <h1 className="text-xl tracking-[0.15em] uppercase font-light" style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 500 }}>Faryal Al Hosary</h1>
                  <p className="text-[9px] tracking-[0.3em] uppercase text-stone-400 -mt-0.5">Luxury Bridal Atelier</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {/* Quick stats */}
                {stats && (
                  <div className="hidden lg:flex items-center gap-5 text-xs text-stone-400">
                    <span><strong className="text-stone-600">{stats.inventory?.total_gowns || 0}</strong> gowns</span>
                    <span className="w-px h-3 bg-stone-200" />
                    <span><strong className="text-stone-600">{stats.customers || 0}</strong> clients</span>
                    <span className="w-px h-3 bg-stone-200" />
                    <span><strong style={{ color: '#B4A074' }}>AED {(stats.revenue || 0).toLocaleString()}</strong> revenue</span>
                  </div>
                )}

                {/* API Status */}
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${apiOnline === true ? 'bg-emerald-400' : apiOnline === false ? 'bg-red-400' : 'bg-stone-300'}`} />
                  <span className="text-[10px] text-stone-400">{apiOnline === true ? 'Engine Online' : apiOnline === false ? 'Offline' : 'Checking...'}</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex gap-1 -mb-px">
              {nav.map(n => (
                <button
                  key={n.id}
                  onClick={() => setView(n.id)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium tracking-wider uppercase transition-all border-b-2 ${view === n.id
                      ? 'border-[#B4A074] text-stone-800'
                      : 'border-transparent text-stone-400 hover:text-stone-600 hover:border-stone-300'
                    }`}
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
          <div className="bg-red-50 border-b border-red-200 px-6 py-3 text-center">
            <p className="text-sm text-red-700 flex items-center justify-center gap-2">
              <AlertCircle size={15} />
              <span>Cannot connect to the Faryal Engine. Data operations are unavailable.</span>
              <button onClick={() => { setApiOnline(null); apiFetch('/health').then(() => setApiOnline(true)).catch(() => setApiOnline(false)); }} className="underline font-medium ml-2">Retry</button>
            </p>
          </div>
        )}

        {/* ── Content ────────────────────────────────────── */}
        <main className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
          {view === 'inventory' && <InventoryView />}
          {view === 'bookings' && <BookingsView />}
          {view === 'customers' && <CustomersView />}
        </main>

        {/* ── Footer ─────────────────────────────────────── */}
        <footer className="border-t border-stone-100 py-6 text-center">
          <p className="text-[10px] tracking-[0.2em] uppercase text-stone-300">Faryal Al Hosary · Luxury Bridal & Occasion · Powered by Travel Expert™</p>
        </footer>
      </div>
    </ToastProvider>
  );
}