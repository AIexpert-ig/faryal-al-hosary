import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, X, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import { formatCurrency, formatDate } from '../utils/format';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

type RentalStatus = 'Inquiry' | 'Reserved' | 'Confirmed' | 'Out' | 'Returned' | 'Complete' | 'Cancelled';

interface Rental {
  id?: number;
  rental_code: string;
  customer_name: string;
  gown_sku: string;
  pickup_date: string;
  return_date: string;
  status: RentalStatus;
  total_amount: number;
  deposit_amount: number;
  notes?: string;
}

const statusColors: Record<RentalStatus, { bg: string; text: string }> = {
  Inquiry: { bg: 'rgba(156,163,175,0.15)', text: '#374151' },
  Reserved: { bg: 'rgba(59,130,246,0.12)', text: '#1e40af' },
  Confirmed: { bg: 'rgba(16,185,129,0.12)', text: '#065f46' },
  Out: { bg: 'rgba(201,169,110,0.15)', text: '#a07840' },
  Returned: { bg: 'rgba(168,85,247,0.12)', text: '#6b21a8' },
  Complete: { bg: 'rgba(34,197,94,0.12)', text: '#166534' },
  Cancelled: { bg: 'rgba(239,68,68,0.12)', text: '#991b1b' },
};

const allStatuses: RentalStatus[] = ['Inquiry', 'Reserved', 'Confirmed', 'Out', 'Returned', 'Complete', 'Cancelled'];

const demoRentals: Rental[] = [
  { id: 1, rental_code: 'RNT-2024-001', customer_name: 'Sarah Mitchell', gown_sku: 'VW-KAT-01', pickup_date: '2024-06-15', return_date: '2024-06-17', status: 'Complete', total_amount: 25000, deposit_amount: 10000 },
  { id: 2, rental_code: 'RNT-2024-002', customer_name: 'Amara Hassan', gown_sku: 'ES-CEL-03', pickup_date: '2024-07-20', return_date: '2024-07-22', status: 'Out', total_amount: 20000, deposit_amount: 8000 },
  { id: 3, rental_code: 'RNT-2024-003', customer_name: 'Elena Rodriguez', gown_sku: 'ZM-AMA-02', pickup_date: '2024-08-10', return_date: '2024-08-12', status: 'Confirmed', total_amount: 32000, deposit_amount: 12000 },
  { id: 4, rental_code: 'RNT-2024-004', customer_name: 'Fatima Al-Rashid', gown_sku: 'OLR-ISA-01', pickup_date: '2024-09-05', return_date: '2024-09-07', status: 'Reserved', total_amount: 15000, deposit_amount: 6000 },
  { id: 5, rental_code: 'RNT-2024-005', customer_name: 'Maya Johnson', gown_sku: 'ML-ELG-04', pickup_date: '2024-10-12', return_date: '2024-10-14', status: 'Inquiry', total_amount: 22000, deposit_amount: 9000 },
];

const emptyRental: Rental = {
  rental_code: '', customer_name: '', gown_sku: '', pickup_date: '', return_date: '',
  status: 'Inquiry', total_amount: 0, deposit_amount: 0, notes: '',
};

function StatusBadge({ status }: { status: RentalStatus }) {
  const { t } = useTranslation();
  const colors = statusColors[status] ?? { bg: 'rgba(156,163,175,0.12)', text: '#374151' };
  return (
    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.25rem 0.6rem', borderRadius: '2px', background: colors.bg, color: colors.text }}>
      {t(`status.${status}`, status)}
    </span>
  );
}

function StatusDropdown({ current, onChange }: { current: RentalStatus; onChange: (s: RentalStatus) => void }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={() => setOpen((o) => !o)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
        <StatusBadge status={current} />
        <ChevronDown size={12} color="#888" />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', [isRtl ? 'right' : 'left']: 0, background: 'white', border: '1px solid #e5e5e5', borderRadius: '4px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', zIndex: 50, minWidth: '140px', overflow: 'hidden' }}>
          {allStatuses.map((s) => (
            <button key={s} onClick={() => { onChange(s); setOpen(false); }} style={{ display: 'block', width: '100%', textAlign: isRtl ? 'right' : 'left', padding: '0.5rem 0.875rem', fontFamily: isRtl ? 'var(--font-arabic)' : 'var(--font-body)', fontSize: '0.8rem', color: '#555', background: 'none', border: 'none', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#f9f9f9'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}>
              {t(`status.${s}`, s)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Rentals() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const lang = i18n.language;

  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('All');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Rental>(emptyRental);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchRentals = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/rentals`);
      setRentals(res.data);
    } catch {
      setRentals(demoRentals);
    }
    setLoading(false);
  };

  useEffect(() => { fetchRentals(); }, []);

  const tabLabels = [t('rentals.tabAll'), ...allStatuses.map((s) => t(`status.${s}`, s))];
  const tabValues = ['All', ...allStatuses];
  const filteredRentals = activeTab === 'All' ? rentals : rentals.filter((r) => r.status === activeTab);

  const handleStatusUpdate = async (rental: Rental, newStatus: RentalStatus) => {
    try {
      if (rental.id) await axios.put(`${API_BASE}/api/rentals/${rental.id}`, { ...rental, status: newStatus });
      setRentals((prev) => prev.map((r) => r.id === rental.id ? { ...r, status: newStatus } : r));
    } catch {
      setRentals((prev) => prev.map((r) => r.id === rental.id ? { ...r, status: newStatus } : r));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      if (formData.id) {
        await axios.put(`${API_BASE}/api/rentals/${formData.id}`, formData);
      } else {
        await axios.post(`${API_BASE}/api/rentals`, formData);
      }
      setShowForm(false);
      setFormData(emptyRental);
      await fetchRentals();
    } catch {
      setFormError(t('rentals.failedSave'));
    }
    setSaving(false);
  };

  const inputStyle: React.CSSProperties = {
    fontFamily: isRtl ? 'var(--font-arabic)' : 'var(--font-body)',
    fontSize: '0.875rem',
    color: 'var(--color-dark)',
    background: '#f9f9f9',
    border: '1px solid #e5e5e5',
    borderRadius: '2px',
    padding: '0.625rem 0.875rem',
    width: '100%',
    outline: 'none',
    textAlign: isRtl ? 'right' : 'left',
    direction: isRtl ? 'rtl' : 'ltr',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: isRtl ? 'var(--font-arabic)' : 'var(--font-body)',
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: isRtl ? '0' : '0.08em',
    textTransform: isRtl ? 'none' : 'uppercase' as const,
    color: '#888',
    display: 'block',
    marginBottom: '0.375rem',
    textAlign: isRtl ? 'right' : 'left',
  };

  const tableHeaders = [
    t('rentals.rentalCode'), t('rentals.customer'), t('rentals.gownSku'),
    t('rentals.pickup'), t('rentals.return'), t('rentals.status'),
    t('rentals.total'), t('rentals.deposit'),
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', direction: isRtl ? 'rtl' : 'ltr', fontFamily: isRtl ? 'var(--font-arabic)' : undefined }}>
      <Navbar />

      <div style={{ padding: '2.5rem 3rem', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: isRtl ? 'var(--font-arabic)' : 'var(--font-sans)', fontWeight: 700, fontSize: '1.75rem', color: 'var(--color-dark)', marginBottom: '0.25rem' }}>
              {t('rentals.title')}
            </h1>
            <p style={{ fontFamily: isRtl ? 'var(--font-arabic)' : 'var(--font-body)', fontSize: '0.875rem', color: '#888' }}>
              {t('rentals.subtitle_other', { count: rentals.length })}
            </p>
          </div>
          <button
            onClick={() => { setFormData(emptyRental); setShowForm(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: isRtl ? 'var(--font-arabic)' : 'var(--font-body)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: isRtl ? '0' : '0.1em', textTransform: isRtl ? 'none' : 'uppercase', background: '#0d1310', color: 'white', border: 'none', padding: '0.75rem 1.5rem', cursor: 'pointer', borderRadius: '2px' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#1a2a24'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#0d1310'; }}
          >
            <Plus size={16} />
            {t('rentals.newRental')}
          </button>
        </div>

        {/* Status tabs */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '2rem', borderBottom: '1px solid #ddd', overflowX: 'auto' }}>
          {tabValues.map((tab, idx) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{ fontFamily: isRtl ? 'var(--font-arabic)' : 'var(--font-body)', fontSize: '0.8rem', letterSpacing: '0.05em', padding: '0.75rem 1.25rem', background: 'none', border: 'none', borderBottom: isActive ? '2px solid #c9a96e' : '2px solid transparent', color: isActive ? '#c9a96e' : '#888', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: isActive ? 600 : 400, transition: 'color 0.2s', marginBottom: '-1px' }}
              >
                {tabLabels[idx]}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', fontFamily: isRtl ? 'var(--font-arabic)' : 'var(--font-body)', color: '#888' }}>
            {t('rentals.loading')}
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '2px', boxShadow: '0 1px 10px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                  {tableHeaders.map((h) => (
                    <th key={h} style={{ padding: '0.875rem 1.5rem', textAlign: isRtl ? 'right' : 'left', fontFamily: isRtl ? 'var(--font-arabic)' : 'var(--font-body)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: isRtl ? '0' : '0.12em', textTransform: isRtl ? 'none' : 'uppercase', color: '#888', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRentals.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', fontFamily: isRtl ? 'var(--font-arabic)' : 'var(--font-body)', color: '#aaa' }}>
                      {t('rentals.noRentals')}
                    </td>
                  </tr>
                ) : filteredRentals.map((rental, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f9f9f9', transition: 'background 0.15s' }} onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = '#fafafa'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'white'; }}>
                    <td style={{ padding: '1rem 1.5rem', fontFamily: isRtl ? 'var(--font-arabic)' : 'var(--font-body)', fontSize: '0.875rem', color: 'var(--color-dark)', fontWeight: 600 }}>{rental.rental_code}</td>
                    <td style={{ padding: '1rem 1.5rem', fontFamily: isRtl ? 'var(--font-arabic)' : 'var(--font-body)', fontSize: '0.875rem', color: '#555' }}>{rental.customer_name}</td>
                    <td style={{ padding: '1rem 1.5rem', fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: '#c9a96e', fontWeight: 600 }}>{rental.gown_sku}</td>
                    <td style={{ padding: '1rem 1.5rem', fontFamily: isRtl ? 'var(--font-arabic)' : 'var(--font-body)', fontSize: '0.875rem', color: '#555' }}>{formatDate(rental.pickup_date, lang)}</td>
                    <td style={{ padding: '1rem 1.5rem', fontFamily: isRtl ? 'var(--font-arabic)' : 'var(--font-body)', fontSize: '0.875rem', color: '#555' }}>{formatDate(rental.return_date, lang)}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <StatusDropdown current={rental.status} onChange={(s) => handleStatusUpdate(rental, s)} />
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontFamily: isRtl ? 'var(--font-arabic)' : 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-dark)' }}>
                      {formatCurrency(rental.total_amount, lang)}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontFamily: isRtl ? 'var(--font-arabic)' : 'var(--font-body)', fontSize: '0.875rem', color: '#888' }}>
                      {formatCurrency(rental.deposit_amount, lang)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Rental Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '660px', maxHeight: '90vh', overflow: 'auto', borderRadius: '4px', padding: '2.5rem', direction: isRtl ? 'rtl' : 'ltr', fontFamily: isRtl ? 'var(--font-arabic)' : undefined }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontFamily: isRtl ? 'var(--font-arabic)' : 'var(--font-sans)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-dark)' }}>
                {formData.id ? t('rentals.editTitle') : t('rentals.newBookingTitle')}
              </h2>
              <button onClick={() => { setShowForm(false); setFormError(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '4px', padding: '0.75rem 1rem', marginBottom: '1rem', fontFamily: isRtl ? 'var(--font-arabic)' : 'var(--font-body)', fontSize: '0.875rem', color: '#991b1b' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div>
                  <label style={labelStyle}>{t('rentals.rentalCode')}</label>
                  <input type="text" required value={formData.rental_code} onChange={(e) => setFormData((p) => ({ ...p, rental_code: e.target.value }))} style={inputStyle} placeholder={t('rentals.rentalCodePlaceholder')} />
                </div>
                <div>
                  <label style={labelStyle}>{t('rentals.customerName')}</label>
                  <input type="text" required value={formData.customer_name} onChange={(e) => setFormData((p) => ({ ...p, customer_name: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{t('rentals.gownSku')}</label>
                  <input type="text" required value={formData.gown_sku} onChange={(e) => setFormData((p) => ({ ...p, gown_sku: e.target.value }))} style={inputStyle} placeholder={t('rentals.gownSkuPlaceholder')} />
                </div>
                <div>
                  <label style={labelStyle}>{t('rentals.status')}</label>
                  <select value={formData.status} onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value as RentalStatus }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                    {allStatuses.map((s) => <option key={s} value={s}>{t(`status.${s}`, s)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>{t('rentals.pickupDate')}</label>
                  <input type="date" required value={formData.pickup_date} onChange={(e) => setFormData((p) => ({ ...p, pickup_date: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{t('rentals.returnDate')}</label>
                  <input type="date" required value={formData.return_date} onChange={(e) => setFormData((p) => ({ ...p, return_date: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{t('rentals.totalAmount')}</label>
                  <input type="number" min={0} required value={formData.total_amount} onChange={(e) => setFormData((p) => ({ ...p, total_amount: Number(e.target.value) }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{t('rentals.depositAmount')}</label>
                  <input type="number" min={0} value={formData.deposit_amount} onChange={(e) => setFormData((p) => ({ ...p, deposit_amount: Number(e.target.value) }))} style={inputStyle} />
                </div>
              </div>

              <div style={{ marginTop: '1.25rem' }}>
                <label style={labelStyle}>{t('inventory.notes')}</label>
                <textarea value={formData.notes ?? ''} onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder={t('rentals.notesPlaceholder')} />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => { setShowForm(false); setFormError(null); }} style={{ fontFamily: isRtl ? 'var(--font-arabic)' : 'var(--font-body)', fontSize: '0.875rem', padding: '0.75rem 1.5rem', background: 'none', border: '1px solid #ddd', cursor: 'pointer', borderRadius: '2px', color: '#555' }}>
                  {t('rentals.cancel')}
                </button>
                <button type="submit" disabled={saving} style={{ fontFamily: isRtl ? 'var(--font-arabic)' : 'var(--font-body)', fontSize: '0.875rem', fontWeight: 600, padding: '0.75rem 2rem', background: '#0d1310', color: 'white', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', borderRadius: '2px', opacity: saving ? 0.7 : 1 }}>
                  {saving ? t('rentals.saving') : formData.id ? t('rentals.saveChanges') : t('rentals.createRental')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
