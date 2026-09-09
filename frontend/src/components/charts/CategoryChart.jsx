import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { FINDING_CATEGORIES } from '../../lib/constants';
import { EmptyState } from '../ui/Feedback';

const COLORS = ['#087991', '#0e94ac', '#2db2c4', '#ca8a04', '#94a3b8'];

export function CategoryChart({ data = {} }) {
  const rows = Object.entries(data)
    .filter(([, count]) => count > 0)
    .map(([category, count]) => ({ name: FINDING_CATEGORIES[category] || category, value: count }));

  if (rows.length === 0) {
    return <EmptyState title="No findings recorded" description="Nothing has been flagged in this window." />;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={rows} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
            {rows.map((row, index) => (
              <Cell key={row.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
