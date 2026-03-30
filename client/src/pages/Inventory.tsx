import { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Plus, X, Filter } from 'lucide-react';
import Navbar from '../components/Navbar';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

type UnitStatus = 'Available' | 'Reserved' | 'Rented' | 'Cleaning' | 'Repair' | 'Retired';

interface InventoryUnit {
  id?: number;
  sku: string;
  gown_name: string;
  designer: string;
  size: string;
  color: string;
  status: UnitStatus;
  rental_price: number;
  condition_rating: number;
  category: string;
  notes?: string;
}

const statusColors: Record<UnitStatus, { bg: string; text: string }> = {
  Available: { bg: 'rgba(34,197,94,0.12)', text: '#166534' },
  Reserved: { bg: 'rgba(59,130,246,0.12)', text: '#1e40af' },
  Rented: { bg: 'rgba(239,68,68,0.12)', text: '#991b1b' },
  Cleaning: { bg: 'rgba(168,85,247,0.12)', text: '#6b21a8' },
  Repair: { bg: 'rgba(249,115,22,0.12)', text: '#9a3412' },
  Retired: { bg: 'rgba(156,163,175,0.12)', text: '#374151' },
};

const statuses: UnitStatus[] = ['Available', 'Reserved', 'Rented', 'Cleaning', 'Repair', 'Retired'];
const categories = ['Bridal', 'Evening', 'Cocktail', 'Formal', 'Occasion'];
const designers = ['Vera Wang', 'Elie Saab', 'Zuhair Murad', 'Oscar de la Renta', 'Monique Lhuillier', 'Marchesa', 'Other'];

const emptyUnit: InventoryUnit = {
  sku: '',
  gown_name: '',
  designer: '',
  size: '',
  color: '',
  status: 'Available',
  rental_price: 0,
  condition_rating: 10,
  category: 'Bridal',
  notes: '',
};

const demoUnits: InventoryUnit[] = [
  { id: 1, sku: 'VW-KAT-01', gown_name: 'Katherine A-Line', designer: 'Vera Wang', size: '6', color: 'Ivory', status: 'Available', rental_price: 1200, condition_rating: 10, category: 'Bridal' },
  { id: 2, sku: 'ES-CEL-03', gown_name: 'Celeste Evening', designer: 'Elie Saab', size: '8', color: 'Navy', status: 'Rented', rental_price: 980, condition_rating: 9, category: 'Evening' },
  { id: 3, sku: 'ZM-AMA-02', gown_name: 'Amara Ball Gown', designer: 'Zuhair Murad', size: '4', color: 'White', status: 'Available', rental_price: 1500, condition_rating: 10, category: 'Bridal' },
  { id: 4, sku: 'OLR-ISA-01', gown_name: 'Isabella Cocktail', designer: 'Oscar de la Renta', size: '6', color: 'Champagne', status: 'Cleaning', rental_price: 750, condition_rating: 8, category: 'Cocktail' },
  { id: 5, sku: 'ML-ELG-04', gown_name: 'Elegance Column', designer: 'Monique Lhuillier', size: '10', color: 'Blush', status: 'Reserved', rental_price: 1100, condition_rating: 9, category: 'Bridal' },
  { id: 6, sku: 'VW-KAT-02', gown_name: 'Katherine A-Line', designer: 'Vera Wang', size: '10', color: 'Ivory', status: 'Available', rental_price: 1200, condition_rating: 10, category: 'Bridal' },
];

function StatusBadge({ status }: { status: UnitStatus }) {
  const colors = statusColors[status] ?? { bg: 'rgba(156,163,175,0.12)', text: '#374151' };
  return (
    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.25rem 0.6rem', borderRadius: '2px', background: colors.bg, color: colors.text }}>
      {status}
    </span>
  );
}

function ConditionDots({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: '3px' }}>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: i < rating ? '#c9a96e' : '#e5e5e5' }} />
      ))}
    </div>
  );
}

export default function Inventory() {
  const [units, setUnits] = useState<InventoryUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<InventoryUnit>(emptyUnit);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/inventory`);
      setUnits(res.data);
    } catch {
      setUnits(demoUnits);
    }
    setLoading(false);
  };

  useEffect(() => { fetchUnits(); }, []);

  const filteredUnits = units.filter((u) => {
    const matchSearch = search === '' ||
      u.gown_name.toLowerCase().includes(search.toLowerCase()) ||
      u.sku.toLowerCase().includes(search.toLowerCase()) ||
      u.designer.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || u.status === statusFilter;
    const matchCat = categoryFilter === 'All' || u.category === categoryFilter;
    return matchSearch && matchStatus && matchCat;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      if (formData.id) {
        await axios.put(`${API_BASE}/api/inventory/${formData.id}`, formData);
      } else {
        await axios.post(`${API_BASE}/api/inventory`, formData);
      }
      setShowForm(false);
      setFormData(emptyUnit);
      await fetchUnits();
    } catch {
      setFormError('Failed to save. Please try again.');
    }
    setSaving(false);
  };

  const handleEdit = (unit: InventoryUnit) => {
    setFormData(unit);
    setShowForm(true);
  };

  const inputStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: '0.875rem',
    color: 'var(--color-dark)',
    background: '#f9f9f9',
    border: '1px solid #e5e5e5',
    borderRadius: '2px',
    padding: '0.625rem 0.875rem',
    width: '100%',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#888',
    display: 'block',
    marginBottom: '0.375rem',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Navbar />

      <div style={{ padding: '2.5rem 3rem', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1.75rem', color: 'var(--color-dark)', marginBottom: '0.25rem' }}>
              Inventory
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: '#888' }}>
              {units.length} units in collection
            </p>
          </div>
          <button
            onClick={() => { setFormData(emptyUnit); setShowForm(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-body)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', background: '#0d1310', color: 'white', border: 'none', padding: '0.75rem 1.5rem', cursor: 'pointer', borderRadius: '2px', transition: 'background 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#1a2a24'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#0d1310'; }}
          >
            <Plus size={16} />
            Add New Unit
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
            <Search size={16} color="#aaa" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search gowns, SKU, designer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...inputStyle, paddingLeft: '2.5rem' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="#aaa" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ ...inputStyle, width: 'auto', cursor: 'pointer' }}
            >
              <option value="All">All Status</option>
              {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ ...inputStyle, width: 'auto', cursor: 'pointer' }}
          >
            <option value="All">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', fontFamily: 'var(--font-body)', color: '#888' }}>
            Loading inventory...
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {filteredUnits.map((unit) => (
              <div
                key={unit.sku}
                style={{ background: 'white', borderRadius: '2px', padding: '1.5rem', boxShadow: '0 1px 10px rgba(0,0,0,0.05)', transition: 'box-shadow 0.2s', cursor: 'pointer' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 10px rgba(0,0,0,0.05)'; }}
                onClick={() => handleEdit(unit)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: '#c9a96e', letterSpacing: '0.15em', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                      {unit.sku}
                    </span>
                    <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1rem', color: 'var(--color-dark)', lineHeight: 1.3 }}>
                      {unit.gown_name}
                    </h3>
                  </div>
                  <StatusBadge status={unit.status} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1rem', marginBottom: '1rem' }}>
                  {[
                    { label: 'Designer', value: unit.designer },
                    { label: 'Category', value: unit.category },
                    { label: 'Size', value: unit.size },
                    { label: 'Color', value: unit.color },
                  ].map((item) => (
                    <div key={item.label}>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>{item.label}</span>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: '#555' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-dark)' }}>
                      ${unit.rental_price.toLocaleString()}
                    </span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#aaa', marginLeft: '4px' }}>/rental</span>
                  </div>
                  <ConditionDots rating={unit.condition_rating} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflow: 'auto', borderRadius: '4px', padding: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-dark)' }}>
                {formData.id ? 'Edit Inventory Unit' : 'Add New Unit'}
              </h2>
              <button
                onClick={() => { setShowForm(false); setFormError(null); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '4px', padding: '0.75rem 1rem', marginBottom: '1rem', fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: '#991b1b' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                {[
                  { label: 'SKU', key: 'sku', type: 'text', required: true },
                  { label: 'Gown Name', key: 'gown_name', type: 'text', required: true },
                  { label: 'Color', key: 'color', type: 'text', required: true },
                  { label: 'Size', key: 'size', type: 'text', required: true },
                  { label: 'Rental Price ($)', key: 'rental_price', type: 'number', required: true },
                  { label: 'Condition Rating (1-10)', key: 'condition_rating', type: 'number', required: true },
                ].map((field) => (
                  <div key={field.key}>
                    <label style={labelStyle}>{field.label}</label>
                    <input
                      type={field.type}
                      required={field.required}
                      value={formData[field.key as keyof InventoryUnit] as string | number}
                      min={field.key === 'condition_rating' ? 1 : field.key === 'rental_price' ? 0 : undefined}
                      max={field.key === 'condition_rating' ? 10 : undefined}
                      onChange={(e) => setFormData((prev) => ({ ...prev, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value }))}
                      style={inputStyle}
                    />
                  </div>
                ))}

                <div>
                  <label style={labelStyle}>Designer</label>
                  <select
                    value={formData.designer}
                    onChange={(e) => setFormData((prev) => ({ ...prev, designer: e.target.value }))}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="">Select Designer</option>
                    {designers.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as UnitStatus }))}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem' }}>
                <label style={labelStyle}>Notes</label>
                <textarea
                  value={formData.notes ?? ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  placeholder="Any special notes about this piece..."
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setFormError(null); }}
                  style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', padding: '0.75rem 1.5rem', background: 'none', border: '1px solid #ddd', cursor: 'pointer', borderRadius: '2px', color: '#555' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 600, padding: '0.75rem 2rem', background: '#0d1310', color: 'white', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', borderRadius: '2px', opacity: saving ? 0.7 : 1 }}
                >
                  {saving ? 'Saving...' : formData.id ? 'Save Changes' : 'Add Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
