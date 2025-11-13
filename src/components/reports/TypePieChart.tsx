import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

type Props = {
  data: { name: string; value: number }[]
}

const COLORS = [
  'var(--uabc-green)',
  'var(--uabc-ochre)',
  '#00a651',
  '#e69800',
  '#006e29',
  '#b37700',
  '#00c462',
  '#ffb020',
  '#005a22',
  '#996300',
  '#00e873',
  '#ffc640',
]

export default function TypePieChart({ data }: Props) {
  return (
    <div className="rounded-2xl border bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold">Distribución por Tipo</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
