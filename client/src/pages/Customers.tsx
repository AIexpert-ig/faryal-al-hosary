import { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Plus, X, User } from 'lucide-react';
import Navbar from '../components/Navbar';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

interface Measurements {
  bust?: number;
  waist?: number;
  hips?: number;
  hollow_to_hem?: number;
  height?: number;
  shoe_size?: string;
}

interface Customer {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address?: string;
  notes?: string;
  measurements?: Measurements;
}

const emptyCustomer: Customer = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  address: '',
  notes: '',
  measurements: {
    bust: undefined,
    waist: undefined,
    hips: undefined,
    hollow_to_hem: undefined,
    height: undefined,
    shoe_size: '',
  },
};

const demoCustomers: Customer[] = [
  { id: 1, first_name: 'Sarah', last_name: 'Mitchell', email: 'sarah@example.com', phone: '+1 (310) 555-0101', measurements: { bust: 36, waist: 27, hips: 38, hollow_to_hem: 58, height: 65, shoe_size: '7' } },
  { id: 2, first_name: 'Amara', last_name: 'Hassan', email: 'amara@example.com', phone: '+1 (310) 555-0102', measurements: { bust: 34, waist: 25, hips: 36, hollow_to_hem: 60, height: 67, shoe_size: '8' } },
  { id: 3, first_name: 'Elena', last_name: 'Rodriguez', email: 'elena@example.com', phone: '+1 (310) 555-0103', measurements: { bust: 38, waist: 29, hips: 40, hollow_to_hem: 57, height: 63, shoe_size: '7.5' } },
  { id: 4, first_name: 'Fatima', last_name: 'Al-Rashid', email: 'fatima@example.com', phone: '+1 (310) 555-0104', measurements: { bust: 35, waist: 26, hips: 37, hollow_to_hem: 59, height: 66, shoe_size: '6.5' } },
  { id: 5, first_name: 'Maya', last_name: 'Johnson', email: 'maya@example.com', phone: '+1 (310) 555-0105', measurements: { bust: 37, waist: 28, hips: 39, hollow_to_hem: 61, height: 68, shoe_size: '9' } },
];

function MeasurementField({ label, value, unit, icon, onChange }: { label: string; value: number | string | undefined; unit: string; icon: string; onChange: (v: string) => void }) {
  return (
    <div
      style={{
        background: '#f9f9f9',
        borderRadius: '8px',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        border: '1px solid #f0f0f0',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888' }}>
          {label}
        </span>
        <span style={{ fontSize: '1.2rem' }}>{icon}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <input
          type={unit === 'size' ? 'text' : 'number'}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          step="0.5"
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 700,
            fontSize: '1.25rem',
            color: 'var(--color-dark)',
            background: 'none',
            border: 'none',
            outline: 'none',
            width: '80px',
          }}
          placeholder="—"
        />
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#aaa' }}>{unit !== 'size' ? unit : ''}</span>
      </div>
    </div>
  );
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Customer>(emptyCustomer);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/customers`);
      setCustomers(res.data);
    } catch {
      setCustomers(demoCustomers);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCustomers(); }, []);

  const filteredCustomers = customers.filter((c) => {
    if (!search) return true;
    const full = `${c.first_name} ${c.last_name} ${c.email} ${c.phone}`.toLowerCase();
    return full.includes(search.toLowerCase());
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      if (formData.id) {
        await axios.put(`${API_BASE}/api/customers/${formData.id}`, formData);
      } else {
        await axios.post(`${API_BASE}/api/customers`, formData);
      }
      setShowForm(false);
      setFormData(emptyCustomer);
      await fetchCustomers();
    } catch {
      setFormError('Failed to save customer. Please try again.');
    }
    setSaving(false);
  };

  const updateMeasurement = (key: keyof Measurements, value: string) => {
    setFormData((prev) => ({
      ...prev,
      measurements: {
        ...prev.measurements,
        [key]: key === 'shoe_size' ? value : value === '' ? undefined : Number(value),
      },
    }));
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
    textTransform: 'uppercase' as const,
    color: '#888',
    display: 'block',
    marginBottom: '0.375rem',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Main content */}
        <div style={{ flex: 1, padding: '2.5rem 3rem', maxWidth: selectedCustomer ? '65%' : '1400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1.75rem', color: 'var(--color-dark)', marginBottom: '0.25rem' }}>
                Customers
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: '#888' }}>
                {customers.length} total customers
              </p>
            </div>
            <button
              onClick={() => { setFormData(emptyCustomer); setShowForm(true); }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-body)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', background: '#0d1310', color: 'white', border: 'none', padding: '0.75rem 1.5rem', cursor: 'pointer', borderRadius: '2px' }}
            >
              <Plus size={16} />
              Add Customer
            </button>
          </div>

          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <Search size={16} color="#aaa" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...inputStyle, paddingLeft: '2.5rem' }}
            />
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', fontFamily: 'var(--font-body)', color: '#888' }}>
              Loading customers...
            </div>
          ) : (
            <div style={{ background: 'white', borderRadius: '2px', boxShadow: '0 1px 10px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                    {['Customer', 'Email', 'Phone', 'Measurements'].map((h) => (
                      <th key={h} style={{ padding: '0.875rem 1.5rem', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => {
                    const isSelected = selectedCustomer?.id === customer.id;
                    const m = customer.measurements;
                    const hasMeasurements = m && (m.bust || m.waist || m.hips);
                    return (
                      <tr
                        key={customer.id}
                        onClick={() => setSelectedCustomer(isSelected ? null : customer)}
                        style={{ borderBottom: '1px solid #f9f9f9', cursor: 'pointer', background: isSelected ? '#fffbf5' : 'white', transition: 'background 0.15s' }}
                        onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLTableRowElement).style.background = '#fafafa'; }}
                        onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLTableRowElement).style.background = 'white'; }}
                      >
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #c9a96e 0%, #a07840 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.75rem', color: 'white' }}>
                                {customer.first_name?.[0] ?? '?'}{customer.last_name?.[0] ?? ''}
                              </span>
                            </div>
                            <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-dark)' }}>
                              {customer.first_name} {customer.last_name}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '1rem 1.5rem', fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: '#555' }}>
                          {customer.email}
                        </td>
                        <td style={{ padding: '1rem 1.5rem', fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: '#555' }}>
                          {customer.phone}
                        </td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          {hasMeasurements ? (
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#22c55e', fontWeight: 600, letterSpacing: '0.05em' }}>
                              ✓ On file
                            </span>
                          ) : (
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#aaa' }}>
                              Not recorded
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selectedCustomer && (
          <div
            style={{
              width: '380px',
              background: 'white',
              borderLeft: '1px solid #e5e5e5',
              padding: '2rem',
              overflow: 'auto',
              position: 'sticky',
              top: '64px',
              height: 'calc(100vh - 64px)',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-dark)' }}>
                Customer Profile
              </h3>
              <button onClick={() => setSelectedCustomer(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                <X size={18} />
              </button>
            </div>

            {/* Avatar */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #c9a96e 0%, #a07840 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <User size={28} color="white" />
              </div>
              <h4 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-dark)' }}>
                {selectedCustomer.first_name} {selectedCustomer.last_name}
              </h4>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: '#888' }}>{selectedCustomer.email}</p>
            </div>

            {/* Contact info */}
            <div style={{ marginBottom: '2rem' }}>
              <h5 style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#aaa', marginBottom: '1rem' }}>
                Contact
              </h5>
              {[
                { label: 'Email', value: selectedCustomer.email },
                { label: 'Phone', value: selectedCustomer.phone },
                { label: 'Address', value: selectedCustomer.address },
              ].filter((i) => i.value).map((item) => (
                <div key={item.label} style={{ marginBottom: '0.75rem' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>{item.label}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: '#555' }}>{item.value}</span>
                </div>
              ))}
            </div>

            {/* Measurement vault */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ width: '24px', height: '1px', background: '#c9a96e' }} />
                <h5 style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c9a96e' }}>
                  Measurement Vault
                </h5>
                <div style={{ flex: 1, height: '1px', background: '#c9a96e', opacity: 0.3 }} />
              </div>

              {selectedCustomer.measurements ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {[
                    { label: 'Bust', key: 'bust', unit: 'in', icon: '👗' },
                    { label: 'Waist', key: 'waist', unit: 'in', icon: '📏' },
                    { label: 'Hips', key: 'hips', unit: 'in', icon: '📐' },
                    { label: 'H-to-H', key: 'hollow_to_hem', unit: 'in', icon: '↕️' },
                    { label: 'Height', key: 'height', unit: 'in', icon: '📊' },
                    { label: 'Shoe', key: 'shoe_size', unit: 'size', icon: '👠' },
                  ].map((m) => {
                    const val = selectedCustomer.measurements![m.key as keyof Measurements];
                    return (
                      <div key={m.key} style={{ background: '#f9f9f9', borderRadius: '8px', padding: '0.875rem', border: '1px solid #f0f0f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#aaa' }}>{m.label}</span>
                          <span style={{ fontSize: '0.9rem' }}>{m.icon}</span>
                        </div>
                        <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1.1rem', color: val ? 'var(--color-dark)' : '#ccc', marginTop: '0.25rem' }}>
                          {val ?? '—'}{val && m.unit !== 'size' ? `"` : ''}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: '#aaa', textAlign: 'center', padding: '1.5rem 0' }}>
                  No measurements on file.
                </p>
              )}
            </div>

            <button
              onClick={() => { setFormData(selectedCustomer); setShowForm(true); }}
              style={{ marginTop: '2rem', width: '100%', fontFamily: 'var(--font-body)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', background: '#0d1310', color: 'white', border: 'none', padding: '0.875rem', cursor: 'pointer', borderRadius: '2px' }}
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ background: 'white', width: '100%', maxWidth: '760px', maxHeight: '90vh', overflow: 'auto', borderRadius: '4px', padding: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-dark)' }}>
                {formData.id ? 'Edit Customer' : 'Add New Customer'}
              </h2>
              <button onClick={() => { setShowForm(false); setFormError(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '4px', padding: '0.75rem 1rem', marginBottom: '1rem', fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: '#991b1b' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Basic info */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#aaa', marginBottom: '1rem' }}>
                  Basic Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div>
                    <label style={labelStyle}>First Name</label>
                    <input type="text" required value={formData.first_name} onChange={(e) => setFormData((p) => ({ ...p, first_name: e.target.value }))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Last Name</label>
                    <input type="text" required value={formData.last_name} onChange={(e) => setFormData((p) => ({ ...p, last_name: e.target.value }))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input type="email" required value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))} style={inputStyle} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Address</label>
                    <input type="text" value={formData.address ?? ''} onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))} style={inputStyle} />
                  </div>
                </div>
              </div>

              {/* Measurements vault */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ width: '24px', height: '2px', background: '#c9a96e' }} />
                  <h3 style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c9a96e' }}>
                    Measurement Vault
                  </h3>
                  <div style={{ flex: 1, height: '1px', background: '#e5e5e5' }} />
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#aaa', marginBottom: '1.25rem' }}>
                  All measurements in inches unless noted.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  {[
                    { label: 'Bust', key: 'bust' as keyof Measurements, unit: 'in', icon: '👗' },
                    { label: 'Waist', key: 'waist' as keyof Measurements, unit: 'in', icon: '📏' },
                    { label: 'Hips', key: 'hips' as keyof Measurements, unit: 'in', icon: '📐' },
                    { label: 'Hollow to Hem', key: 'hollow_to_hem' as keyof Measurements, unit: 'in', icon: '↕️' },
                    { label: 'Height', key: 'height' as keyof Measurements, unit: 'in', icon: '📊' },
                    { label: 'Shoe Size', key: 'shoe_size' as keyof Measurements, unit: 'size', icon: '👠' },
                  ].map((m) => (
                    <MeasurementField
                      key={m.key}
                      label={m.label}
                      value={formData.measurements?.[m.key]}
                      unit={m.unit}
                      icon={m.icon}
                      onChange={(v) => updateMeasurement(m.key, v)}
                    />
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={labelStyle}>Notes</label>
                <textarea value={formData.notes ?? ''} onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Any relevant notes..." />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => { setShowForm(false); setFormError(null); }} style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', padding: '0.75rem 1.5rem', background: 'none', border: '1px solid #ddd', cursor: 'pointer', borderRadius: '2px', color: '#555' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 600, padding: '0.75rem 2rem', background: '#0d1310', color: 'white', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', borderRadius: '2px', opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Saving...' : formData.id ? 'Save Changes' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
