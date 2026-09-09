import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { SEVERITIES } from '../../lib/constants';
import { severityMeta } from '../../lib/severity';
import { EmptyState } from '../ui/Feedback';

const FILLS = {
  CONTRAINDICATED: '#9f1239',
  CRITICAL: '#dc2626',
  MAJOR: '#ea580c',
  MODERATE: '#ca8a04',
  MINOR: '#0284c7',
  INFORMATIONAL: '#94a3b8',
};

export function SeverityChart({ data = {} }) {
  const rows = SEVERITIES.map((severity) => ({
    severity,
    label: severityMeta(severity).label,
    count: data[severity] || 0,
  })).filter((row) => row.count > 0);

  if (rows.length === 0) {
    return <EmptyState title="No findings recorded" description="Nothing has been flagged in this window." />;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#94a3b8" />
          <Tooltip cursor={{ fill: '#f1f5f9' }} />
          <Bar dataKey="count" name="Findings" radius={[4, 4, 0, 0]}>
            {rows.map((row) => (
              <Cell key={row.severity} fill={FILLS[row.severity]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
