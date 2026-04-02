import { useEffect, useState } from 'react';
import axios from 'axios';
import { Package, Calendar, CheckCircle, TrendingUp, ArrowUp, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import { formatNumber } from '../utils/format';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

interface DashboardStats {
  todayPickups: number;
  todayReturns: number;
  activeRentals: number;
  availableUnits: number;
}

interface ScheduleItem {
  rental_code: string;
  customer_name: string;
  gown_sku: string;
  type: 'pickup' | 'return';
  time?: string;
}

interface RevenueData {
  month: string;
  amount: number;
}

const defaultStats: DashboardStats = { todayPickups: 0, todayReturns: 0, activeRentals: 0, availableUnits: 0 };

function StatCard({ icon, label, value, color, trend }: { icon: React.ReactNode; label: string; value: string; color: string; trend?: string }) {
  return (
    <div
      className="dashboard-stat-card"
      style={{ background: 'white', padding: '1.75rem 2rem', borderRadius: '2px', boxShadow: '0 1px 10px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ width: '44px', height: '44px', background: color, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} aria-hidden="true">
          {icon}
        </div>
        {trend && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#22c55e', fontSize: '0.75rem', fontFamily: 'var(--font-body)' }} aria-label={`Trend: ${trend}`}>
            <ArrowUp size={12} aria-hidden="true" />
            {trend}
          </div>
        )}
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--color-dark)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#888', marginTop: '0.25rem', letterSpacing: '0.05em' }}>{label}</div>
      </div>
    </div>
  );
}

function RevenueBar({ month, amount, maxAmount, lang }: { month: string; amount: number; maxAmount: number; lang: string }) {
  const pct = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: '#888' }}>
        {formatNumber(Math.round(amount / 1000), lang)}k
      </div>
      <div
        style={{ width: '100%', height: '120px', display: 'flex', alignItems: 'flex-end', background: '#f4f4f4', borderRadius: '2px', overflow: 'hidden' }}
        role="img"
        aria-label={`${month}: ${formatNumber(Math.round(amount / 1000), lang)}k`}
      >
        <div style={{ width: '100%', height: `${pct}%`, background: 'linear-gradient(to top, #0d1310, #2a4a3a)', transition: 'height 0.6s ease', borderRadius: '2px 2px 0 0' }} />
      </div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: '#888' }}>{month}</div>
    </div>
  );
}

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const lang = i18n.language;

  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [revenue, setRevenue] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, scheduleRes, revenueRes] = await Promise.allSettled([
          axios.get(`${API_BASE}/api/dashboard/stats`),
          axios.get(`${API_BASE}/api/dashboard/schedule`),
          axios.get(`${API_BASE}/api/dashboard/revenue`),
        ]);
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        if (scheduleRes.status === 'fulfilled') setSchedule(scheduleRes.value.data);
        if (revenueRes.status === 'fulfilled') setRevenue(revenueRes.value.data);
      } catch {
        setStats({ todayPickups: 3, todayReturns: 2, activeRentals: 18, availableUnits: 47 });
        setSchedule([
          { rental_code: 'RNT-001', customer_name: 'Sarah Mitchell', gown_sku: 'VW-KAT-01', type: 'pickup', time: '10:00 AM' },
          { rental_code: 'RNT-002', customer_name: 'Amara Hassan', gown_sku: 'ES-CEL-03', type: 'return', time: '2:00 PM' },
          { rental_code: 'RNT-003', customer_name: 'Elena Rodriguez', gown_sku: 'ZM-AMA-02', type: 'pickup', time: '3:30 PM' },
        ]);
        setRevenue([
          { month: 'Jul', amount: 185000 }, { month: 'Aug', amount: 220000 }, { month: 'Sep', amount: 198000 },
          { month: 'Oct', amount: 285000 }, { month: 'Nov', amount: 240000 }, { month: 'Dec', amount: 320000 },
        ]);
        setError(isRtl ? 'مفيش اتصال بالسيرفر. بيتعرض بيانات تجريبية.' : 'Unable to connect to server. Showing demo data.');
      }
      setLoading(false);
    };
    fetchData();
  }, [isRtl]);

  const maxRevenue = Math.max(...revenue.map((r) => r.amount), 1);

  const statusDistribution = [
    { labelKey: 'dashboard.available', value: stats.availableUnits, color: '#22c55e' },
    { labelKey: 'dashboard.active', value: stats.activeRentals, color: '#c9a96e' },
    { labelKey: 'dashboard.reserved', value: 8, color: '#3b82f6' },
    { labelKey: 'dashboard.cleaning', value: 4, color: '#a855f7' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', direction: isRtl ? 'rtl' : 'ltr', fontFamily: isRtl ? 'var(--font-arabic)' : undefined }}>
      <Navbar />

      <main style={{ padding: 'clamp(1.5rem, 3vw, 2.5rem) var(--section-px)', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontFamily: isRtl ? 'var(--font-arabic)' : 'var(--font-sans)', fontWeight: 700, fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', color: 'var(--color-dark)', marginBottom: '0.25rem' }}>
            {t('dashboard.title')}
          </h1>
          <p style={{ fontFamily: isRtl ? 'var(--font-arabic)' : 'var(--font-body)', fontSize: '0.875rem', color: '#888' }}>
            {new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {error && (
          <div role="alert" style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px', padding: '0.75rem 1rem', marginBottom: '1.5rem', fontFamily: isRtl ? 'var(--font-arabic)' : 'var(--font-body)', fontSize: '0.875rem', color: '#856404' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div role="status" style={{ display: 'flex', justifyContent: 'center', padding: '4rem', fontFamily: isRtl ? 'var(--font-arabic)' : 'var(--font-body)', color: '#888' }}>
            {t('dashboard.loading')}
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div className="dashboard-stats" role="region" aria-label="Key metrics">
              <StatCard icon={<Calendar size={20} color="white" aria-hidden="true" />} label={t('dashboard.todayPickups')} value={formatNumber(stats.todayPickups, lang)} color="#0d1310" trend={t('dashboard.trendVsYesterday')} />
              <StatCard icon={<CheckCircle size={20} color="white" aria-hidden="true" />} label={t('dashboard.todayReturns')} value={formatNumber(stats.todayReturns, lang)} color="#2a6049" trend={t('dashboard.onTrack')} />
              <StatCard icon={<Package size={20} color="white" aria-hidden="true" />} label={t('dashboard.activeRentals')} value={formatNumber(stats.activeRentals, lang)} color="#c9a96e" />
              <StatCard icon={<TrendingUp size={20} color="white" aria-hidden="true" />} label={t('dashboard.availableUnits')} value={formatNumber(stats.availableUnits, lang)} color="#1a4a5a" />
            </div>

            {/* Charts row */}
            <div className="dashboard-charts">
              <div style={{ background: 'white', padding: 'clamp(1.25rem, 3vw, 2rem)', borderRadius: '2px', boxShadow: '0 1px 10px rgba(0,0,0,0.06)' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <h2 style={{ fontFamily: isRtl ? 'var(--font-arabic)' : 'var(--font-sans)', fontWeight: 700, fontSize: '1rem', color: 'var(--color-dark)', marginBottom: '0.25rem' }}>
                    {t('dashboard.monthlyRevenue')}
                  </h2>
                  <p style={{ fontFamily: isRtl ? 'var(--font-arabic)' : 'var(--font-body)', fontSize: '0.8rem', color: '#888' }}>{t('dashboard.last6months')}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', height: '160px' }} role="img" aria-label="Monthly revenue bar chart">
                  {revenue.map((r) => (
                    <RevenueBar key={r.month} month={r.month} amount={r.amount} maxAmount={maxRevenue} lang={lang} />
                  ))}
                </div>
              </div>

              <div style={{ background: 'white', padding: 'clamp(1.25rem, 3vw, 2rem)', borderRadius: '2px', boxShadow: '0 1px 10px rgba(0,0,0,0.06)' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <h2 style={{ fontFamily: isRtl ? 'var(--font-arabic)' : 'var(--font-sans)', fontWeight: 700, fontSize: '1rem', color: 'var(--color-dark)', marginBottom: '0.25rem' }}>
                    {t('dashboard.rentalStatus')}
                  </h2>
                  <p style={{ fontFamily: isRtl ? 'var(--font-arabic)' : 'var(--font-body)', fontSize: '0.8rem', color: '#888' }}>{t('dashboard.distribution')}</p>
                </div>
                {statusDistribution.map((item) => {
                  const total = stats.availableUnits + stats.activeRentals + 12;
                  const pct = Math.round((item.value / total) * 100);
                  return (
                    <div key={item.labelKey} style={{ marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontFamily: isRtl ? 'var(--font-arabic)' : 'var(--font-body)', fontSize: '0.8rem', color: '#555' }}>{t(item.labelKey)}</span>
                        <span style={{ fontFamily: isRtl ? 'var(--font-arabic)' : 'var(--font-sans)', fontWeight: 600, fontSize: '0.8rem', color: 'var(--color-dark)' }}>{formatNumber(item.value, lang)}</span>
                      </div>
                      <div style={{ height: '6px', background: '#f0f0f0', borderRadius: '3px', overflow: 'hidden' }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={t(item.labelKey)}>
                        <div style={{ height: '100%', width: `${pct}%`, background: item.color, borderRadius: '3px', transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Today's schedule */}
            <div style={{ background: 'white', borderRadius: '2px', boxShadow: '0 1px 10px rgba(0,0,0,0.06)' }}>
              <div style={{ padding: '1.5rem clamp(1rem, 3vw, 2rem)', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} color="var(--color-dark)" aria-hidden="true" />
                <h2 style={{ fontFamily: isRtl ? 'var(--font-arabic)' : 'var(--font-sans)', fontWeight: 700, fontSize: '1rem', color: 'var(--color-dark)' }}>
                  {t('dashboard.schedule')}
                </h2>
              </div>
              {schedule.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', fontFamily: isRtl ? 'var(--font-arabic)' : 'var(--font-body)', color: '#888' }}>
                  {t('dashboard.noSchedule')}
                </div>
              ) : (
                <div className="table-scroll-wrap">
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#fafafa' }}>
                        {[t('dashboard.code'), t('dashboard.customer'), t('dashboard.gownSku'), t('dashboard.type'), t('dashboard.time')].map((h) => (
                          <th key={h} style={{ padding: '0.75rem clamp(1rem, 2vw, 2rem)', textAlign: isRtl ? 'right' : 'left', fontFamily: isRtl ? 'var(--font-arabic)' : 'var(--font-body)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: isRtl ? '0' : '0.1em', textTransform: isRtl ? 'none' : 'uppercase', color: '#888', borderBottom: '1px solid #f0f0f0', whiteSpace: 'nowrap' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {schedule.map((item, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f9f9f9', transition: 'background 0.15s' }} onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = '#fafafa'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'white'; }}>
                          <td style={{ padding: '1rem clamp(1rem, 2vw, 2rem)', fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--color-dark)', fontWeight: 600, whiteSpace: 'nowrap' }}>{item.rental_code}</td>
                          <td style={{ padding: '1rem clamp(1rem, 2vw, 2rem)', fontFamily: isRtl ? 'var(--font-arabic)' : 'var(--font-body)', fontSize: '0.875rem', color: '#555' }}>{item.customer_name}</td>
                          <td style={{ padding: '1rem clamp(1rem, 2vw, 2rem)', fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: '#555', whiteSpace: 'nowrap' }}>{item.gown_sku}</td>
                          <td style={{ padding: '1rem clamp(1rem, 2vw, 2rem)' }}>
                            <span style={{ fontFamily: isRtl ? 'var(--font-arabic)' : 'var(--font-body)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: isRtl ? '0' : '0.08em', textTransform: isRtl ? 'none' : 'uppercase', padding: '0.25rem 0.75rem', borderRadius: '2px', background: item.type === 'pickup' ? 'rgba(201,169,110,0.15)' : 'rgba(34,197,94,0.12)', color: item.type === 'pickup' ? '#a07840' : '#166534', whiteSpace: 'nowrap' }}>
                              {item.type === 'pickup' ? t('dashboard.pickup') : t('dashboard.return')}
                            </span>
                          </td>
                          <td style={{ padding: '1rem clamp(1rem, 2vw, 2rem)', fontFamily: isRtl ? 'var(--font-arabic)' : 'var(--font-body)', fontSize: '0.875rem', color: '#888', whiteSpace: 'nowrap' }}>{item.time ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}