// Mock data — will be replaced by live API + AI Agent feeds

type StatCard = {
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
  badge?: { text: string; positive: boolean };
  status?: 'active';
};

type DemandRow = {
  flag: string;
  country: string;
  volume: string;
  growth: string;
  positive: boolean;
  share: number; // % of total, for the progress bar
};

type AlertItem = {
  severity: 'warning' | 'info' | 'success';
  title: string;
  body: string;
  source: string;
  date: string;
};

const STAT_CARDS: StatCard[] = [
  {
    label: 'Global Market Spot Price (Avg)',
    value: '$240 / Kg',
    sub: 'Vanilla Grade B · FOB Surabaya',
    accent: true,
  },
  {
    label: 'Highest Demand Growth',
    value: 'United Kingdom',
    sub: 'Month-over-Month import volume',
    badge: { text: '+14.5% MoM', positive: true },
  },
  {
    label: 'Active Global Buyers (HS 0905)',
    value: '1,240',
    sub: 'Verified leads across 42 countries',
  },
  {
    label: 'AI Agent Status',
    value: 'Active & Monitoring',
    sub: 'Last sync: just now',
    status: 'active',
  },
];

const DEMAND_DATA: DemandRow[] = [
  { flag: '🇺🇸', country: 'United States', volume: '2,840 MT', growth: '+8.2%', positive: true, share: 100 },
  { flag: '🇫🇷', country: 'France', volume: '1,620 MT', growth: '+11.3%', positive: true, share: 57 },
  { flag: '🇩🇪', country: 'Germany', volume: '1,240 MT', growth: '+6.7%', positive: true, share: 44 },
  { flag: '🇯🇵', country: 'Japan', volume: '980 MT', growth: '+9.1%', positive: true, share: 35 },
  { flag: '🇬🇧', country: 'United Kingdom', volume: '760 MT', growth: '+14.5%', positive: true, share: 27 },
];

const AI_ALERTS: AlertItem[] = [
  {
    severity: 'warning',
    title: 'FDA Compliance Update',
    body: 'US Food & Drug Administration tightens compliance on phytosanitary certificates for organic vanilla beans starting next month. Ensure all batch documentation is updated before shipment.',
    source: 'FDA · Federal Register',
    date: 'May 28, 2026',
  },
  {
    severity: 'info',
    title: 'EU Organic Regulation Change',
    body: 'European Commission revised Annex II of Regulation (EC) 834/2007 — new traceability requirements for vanilla derivatives imported from non-EU countries take effect Q3 2026.',
    source: 'EUR-Lex · Official Journal',
    date: 'May 25, 2026',
  },
  {
    severity: 'success',
    title: 'Indonesia MoA Clearance',
    body: 'Indonesian Ministry of Agriculture reissued updated phytosanitary export templates for HS 0905. New documents accepted by US, EU, and Japan customs as of May 2026.',
    source: 'Kementan RI',
    date: 'May 22, 2026',
  },
];

const SEVERITY_CONFIG = {
  warning: {
    dot: 'bg-amber-400',
    badge: 'bg-amber-50 text-amber-700 border border-amber-200',
    label: '⚠ Warning',
  },
  info: {
    dot: 'bg-sky-400',
    badge: 'bg-sky-50 text-sky-700 border border-sky-200',
    label: 'ℹ Info',
  },
  success: {
    dot: 'bg-emerald-400',
    badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    label: '✓ Cleared',
  },
} as const;

// ── Sub-components ──────────────────────────────────────────

function StatCardItem({ card }: { card: StatCard }) {
  return (
    <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-5 flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
        {card.label}
      </p>

      <div className="flex items-end gap-3">
        {card.status === 'active' && (
          <span className="relative flex h-3 w-3 shrink-0 mb-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>
        )}
        <p
          className={`text-2xl font-bold leading-none tracking-tight ${
            card.accent ? 'text-brand' : 'text-zinc-900'
          } ${card.status === 'active' ? 'text-emerald-600 text-lg' : ''}`}
        >
          {card.value}
        </p>
        {card.badge && (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold mb-0.5 ${
              card.badge.positive
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {card.badge.text}
          </span>
        )}
      </div>

      <p className="text-xs text-zinc-500 leading-relaxed">{card.sub}</p>
    </div>
  );
}

function DemandTable() {
  return (
    <div className="bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">Global Demand Analytics</h2>
          <p className="text-xs text-zinc-400 mt-0.5">Top vanilla importers · May 2026</p>
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest text-brand">HS 0905</span>
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-50">
            <th className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Country</th>
            <th className="text-right px-6 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Volume</th>
            <th className="text-right px-6 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Growth</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50">
          {DEMAND_DATA.map((row) => (
            <tr key={row.country} className="hover:bg-zinc-50/60 transition-colors">
              <td className="px-6 py-3.5">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base leading-none">{row.flag}</span>
                    <span className="text-sm font-medium text-zinc-800">{row.country}</span>
                  </div>
                  <div className="h-1 rounded-full bg-zinc-100 overflow-hidden w-full max-w-[180px]">
                    <div
                      className="h-full rounded-full bg-brand/60"
                      style={{ width: `${row.share}%` }}
                    />
                  </div>
                </div>
              </td>
              <td className="px-6 py-3.5 text-right">
                <span className="text-sm font-bold text-zinc-900 tabular-nums">{row.volume}</span>
              </td>
              <td className="px-6 py-3.5 text-right">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                    row.positive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {row.growth}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="px-6 py-3 border-t border-zinc-50 bg-zinc-50/50">
        <p className="text-[10px] text-zinc-400">Source: UN Comtrade · AI-aggregated · Updated hourly</p>
      </div>
    </div>
  );
}

function AlertFeed() {
  return (
    <div className="bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-100">
        <h2 className="text-sm font-semibold text-zinc-900">AI Policy & Regulation Alerts</h2>
        <p className="text-xs text-zinc-400 mt-0.5">Automated extraction by AI Agent · Global regulatory feeds</p>
      </div>

      <ul className="divide-y divide-zinc-50" role="list">
        {AI_ALERTS.map((alert, i) => {
          const cfg = SEVERITY_CONFIG[alert.severity];
          return (
            <li key={i} className="px-6 py-4 flex flex-col gap-2 hover:bg-zinc-50/50 transition-colors">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                  <span className="text-sm font-semibold text-zinc-800">{alert.title}</span>
                </div>
                <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${cfg.badge}`}>
                  {cfg.label}
                </span>
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed pl-4">{alert.body}</p>
              <div className="flex items-center gap-3 pl-4">
                <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wide">{alert.source}</span>
                <span className="text-zinc-300">·</span>
                <span className="text-[10px] text-zinc-400">{alert.date}</span>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="px-6 py-3 border-t border-zinc-50 bg-zinc-50/50">
        <p className="text-[10px] text-zinc-400">AI Agent scanning 240+ regulatory sources across 38 jurisdictions</p>
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6 lg:space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Market Intelligence</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Real-time global vanilla market data and AI-generated insights.
        </p>
      </div>

      {/* Stats grid — 4 columns on xl, 2 on sm */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
        {STAT_CARDS.map((card) => (
          <StatCardItem key={card.label} card={card} />
        ))}
      </div>

      {/* Main content — 2 columns on lg+ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <DemandTable />
        <AlertFeed />
      </div>

      {/* Footer note */}
      <p className="text-[10px] text-zinc-400 text-right pb-2">
        Mock data · Production data powered by LangGraph AI Agent · HS Code 0905
      </p>
    </div>
  );
}
