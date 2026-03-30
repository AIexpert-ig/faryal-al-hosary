import { useEffect, useState } from 'react';
import axios from 'axios';
import { TrendingUp, Package, Calendar } from 'lucide-react';
import Navbar from '../components/Navbar';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

interface RevenueData {
  month: string;
  amount: number;
  rentals: number;
}

interface PopularGown {
  rank: number;
  gown_name: string;
  sku: string;
  designer: string;
  total_rentals: number;
  revenue: number;
}

interface ScheduledEvent {
  rental_code: string;
  customer_name: string;
  gown_sku: string;
  time?: string;
}

const demoRevenue: RevenueData[] = [
  { month: 'Jan', amount: 12500, rentals: 10 },
  { month: 'Feb', amount: 14200, rentals: 12 },
  { month: 'Mar', amount: 18800, rentals: 16 },
  { month: 'Apr', amount: 22100, rentals: 19 },
  { month: 'May', amount: 28500, rentals: 24 },
  { month: 'Jun', amount: 31200, rentals: 27 },
  { month: 'Jul', amount: 26400, rentals: 22 },
  { month: 'Aug', amount: 29800, rentals: 25 },
  { month: 'Sep', amount: 24600, rentals: 21 },
  { month: 'Oct', amount: 32000, rentals: 28 },
  { month: 'Nov', amount: 27500, rentals: 23 },
  { month: 'Dec', amount: 35000, rentals: 30 },
];

const demoPopularGowns: PopularGown[] = [
  { rank: 1, gown_name: 'Katherine A-Line', sku: 'VW-KAT-01', designer: 'Vera Wang', total_rentals: 28, revenue: 33600 },
  { rank: 2, gown_name: 'Amara Ball Gown', sku: 'ZM-AMA-02', designer: 'Zuhair Murad', total_rentals: 24, revenue: 36000 },
  { rank: 3, gown_name: 'Celeste Evening', sku: 'ES-CEL-03', designer: 'Elie Saab', total_rentals: 21, revenue: 20580 },
  { rank: 4, gown_name: 'Elegance Column', sku: 'ML-ELG-04', designer: 'Monique Lhuillier', total_rentals: 19, revenue: 20900 },
  { rank: 5, gown_name: 'Isabella Cocktail', sku: 'OLR-ISA-01', designer: 'Oscar de la Renta', total_rentals: 17, revenue: 12750 },
];

const demoPickups: ScheduledEvent[] = [
  { rental_code: 'RNT-001', customer_name: 'Sarah Mitchell', gown_sku: 'VW-KAT-01', time: '10:00 AM' },
  { rental_code: 'RNT-003', customer_name: 'Elena Rodriguez', gown_sku: 'ZM-AMA-02', time: '3:30 PM' },
];

const demoReturns: ScheduledEvent[] = [
  { rental_code: 'RNT-002', customer_name: 'Amara Hassan', gown_sku: 'ES-CEL-03', time: '2:00 PM' },
];

export default function Reports() {
  const [revenue, setRevenue] = useState<RevenueData[]>([]);
  const [popularGowns, setPopularGowns] = useState<PopularGown[]>([]);
  const [pickups, setPickups] = useState<ScheduledEvent[]>([]);
  const [returns, setReturns] = useState<ScheduledEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [revRes, gownsRes, schedRes] = await Promise.allSettled([
          axios.get(`${API_BASE}/api/reports/revenue`),
          axios.get(`${API_BASE}/api/reports/popular-gowns`),
          axios.get(`${API_BASE}/api/dashboard/schedule`),
        ]);
        if (revRes.status === 'fulfilled') setRevenue(revRes.value.data);
        else setRevenue(demoRevenue);
        if (gownsRes.status === 'fulfilled') setPopularGowns(gownsRes.value.data);
        else setPopularGowns(demoPopularGowns);
        if (schedRes.status === 'fulfilled') {
          const data = schedRes.value.data as Array<ScheduledEvent & { type: string }>;
          setPickups(data.filter((d) => d.type === 'pickup'));
          setReturns(data.filter((d) => d.type === 'return'));
        } else {
          setPickups(demoPickups);
          setReturns(demoReturns);
        }
      } catch {
        setRevenue(demoRevenue);
        setPopularGowns(demoPopularGowns);
        setPickups(demoPickups);
        setReturns(demoReturns);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const maxRevenue = Math.max(...revenue.map((r) => r.amount), 1);
  const totalRevenue = revenue.reduce((sum, r) => sum + r.amount, 0);
  const totalRentals = revenue.reduce((sum, r) => sum + r.rentals, 0);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Navbar />

      <div style={{ padding: '2.5rem 3rem', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1.75rem', color: 'var(--color-dark)', marginBottom: '0.25rem' }}>
            Reports
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: '#888' }}>
            Business overview and analytics
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', fontFamily: 'var(--font-body)', color: '#888' }}>
            Loading reports...
          </div>
        ) : (
          <>
            {/* Summary stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
              {[
                { icon: <TrendingUp size={20} color="white" />, label: 'Annual Revenue', value: `$${(totalRevenue / 1000).toFixed(0)}k`, color: '#0d1310' },
                { icon: <Package size={20} color="white" />, label: 'Total Rentals', value: totalRentals, color: '#2a6049' },
                { icon: <Calendar size={20} color="white" />, label: "Today's Events", value: pickups.length + returns.length, color: '#c9a96e' },
              ].map((item) => (
                <div key={item.label} style={{ background: 'white', padding: '1.75rem 2rem', borderRadius: '2px', boxShadow: '0 1px 10px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ width: '44px', height: '44px', background: item.color, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: '1.75rem', color: 'var(--color-dark)', lineHeight: 1 }}>{item.value}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>{item.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Revenue chart */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: '2px', boxShadow: '0 1px 10px rgba(0,0,0,0.06)', marginBottom: '2.5rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-dark)', marginBottom: '0.25rem' }}>
                  Monthly Revenue — {new Date().getFullYear()}
                </h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#888' }}>
                  Revenue and rental volume by month
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', height: '200px', paddingBottom: '0.5rem' }}>
                {revenue.map((r) => {
                  const pct = (r.amount / maxRevenue) * 100;
                  return (
                    <div key={r.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem', color: '#888' }}>${(r.amount / 1000).toFixed(0)}k</span>
                      <div
                        style={{
                          width: '100%',
                          height: `${pct}%`,
                          background: 'linear-gradient(to top, #0d1310, #2a5040)',
                          borderRadius: '3px 3px 0 0',
                          minHeight: '4px',
                          transition: 'height 0.5s ease',
                          position: 'relative',
                        }}
                        title={`${r.month}: $${r.amount.toLocaleString()}`}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: `${Math.min((r.rentals / 30) * 100, 100)}%`,
                            background: 'rgba(201,169,110,0.3)',
                            borderRadius: '3px 3px 0 0',
                          }}
                        />
                      </div>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem', color: '#aaa' }}>{r.month}</span>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', background: '#0d1310', borderRadius: '2px' }} />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#888' }}>Revenue</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '12px', height: '12px', background: 'rgba(201,169,110,0.6)', borderRadius: '2px' }} />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#888' }}>Rental Volume</span>
                </div>
              </div>
            </div>

            {/* Popular Gowns + Today's Schedule */}
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '2rem' }}>
              {/* Popular gowns table */}
              <div style={{ background: 'white', borderRadius: '2px', boxShadow: '0 1px 10px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f0f0f0' }}>
                  <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1rem', color: 'var(--color-dark)' }}>
                    Most Popular Gowns
                  </h3>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                      {['#', 'Gown', 'Designer', 'Rentals', 'Revenue'].map((h) => (
                        <th key={h} style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {popularGowns.map((gown) => (
                      <tr key={gown.rank} style={{ borderBottom: '1px solid #f9f9f9' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = '#fafafa'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'white'; }}
                      >
                        <td style={{ padding: '0.875rem 1.25rem', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.875rem', color: gown.rank <= 3 ? '#c9a96e' : '#ccc' }}>
                          {gown.rank}
                        </td>
                        <td style={{ padding: '0.875rem 1.25rem' }}>
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--color-dark)', fontWeight: 600 }}>{gown.gown_name}</div>
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: '#c9a96e' }}>{gown.sku}</div>
                        </td>
                        <td style={{ padding: '0.875rem 1.25rem', fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#888' }}>{gown.designer}</td>
                        <td style={{ padding: '0.875rem 1.25rem', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-dark)' }}>{gown.total_rentals}</td>
                        <td style={{ padding: '0.875rem 1.25rem', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.875rem', color: '#22c55e' }}>
                          ${gown.revenue.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Today's schedule */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Pickups */}
                <div style={{ background: 'white', borderRadius: '2px', boxShadow: '0 1px 10px rgba(0,0,0,0.06)', overflow: 'hidden', flex: 1 }}>
                  <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f0f0f0', background: 'rgba(201,169,110,0.06)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#c9a96e' }} />
                    <h4 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-dark)' }}>
                      Today's Pickups ({pickups.length})
                    </h4>
                  </div>
                  {pickups.length === 0 ? (
                    <div style={{ padding: '1.5rem', fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: '#aaa', textAlign: 'center' }}>None today</div>
                  ) : pickups.map((p, i) => (
                    <div key={i} style={{ padding: '0.875rem 1.5rem', borderBottom: i < pickups.length - 1 ? '1px solid #f9f9f9' : 'none' }}>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--color-dark)', fontWeight: 600 }}>{p.customer_name}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#c9a96e' }}>{p.gown_sku}</span>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#888' }}>{p.time}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Returns */}
                <div style={{ background: 'white', borderRadius: '2px', boxShadow: '0 1px 10px rgba(0,0,0,0.06)', overflow: 'hidden', flex: 1 }}>
                  <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f0f0f0', background: 'rgba(34,197,94,0.06)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
                    <h4 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-dark)' }}>
                      Today's Returns ({returns.length})
                    </h4>
                  </div>
                  {returns.length === 0 ? (
                    <div style={{ padding: '1.5rem', fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: '#aaa', textAlign: 'center' }}>None today</div>
                  ) : returns.map((r, i) => (
                    <div key={i} style={{ padding: '0.875rem 1.5rem', borderBottom: i < returns.length - 1 ? '1px solid #f9f9f9' : 'none' }}>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--color-dark)', fontWeight: 600 }}>{r.customer_name}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#22c55e' }}>{r.gown_sku}</span>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: '#888' }}>{r.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
