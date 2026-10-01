import { useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard } from '../components/ChartCard'
import { MapView } from '../components/MapView'
import { PageHeader } from '../components/PageHeader'
import { StatTile } from '../components/StatTile'
import { site } from '../config/site'
import { usePageTitle } from '../hooks/usePageTitle'
import { chartTheme } from '../lib/chartTheme'
import { daysAgo, formatDate, today } from '../lib/date'
import { DEFAULT_GIBS_LAYER, GIBS_LAYERS, GIBS_MIN_DATE, type GibsLayerId } from '../lib/nasa'
import { sampleTimeSeries, summarize } from '../lib/sampleData'

const inputClass =
  'mt-1 block h-10 rounded-lg border border-border bg-surface px-3 text-sm text-fg focus:border-accent'

export default function Explore() {
  const { explore } = site
  usePageTitle(explore.title)

  const [date, setDate] = useState(() => daysAgo(1))
  const [layerId, setLayerId] = useState<GibsLayerId>(DEFAULT_GIBS_LAYER)
  const [opacity, setOpacity] = useState(1)

  // Swap sampleTimeSeries for real data here. Keep the { date, value } shape and the rest just works.
  const series = useMemo(() => sampleTimeSeries(date, 30), [date])
  const stats = summarize(series)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader title={explore.title} intro={explore.intro} />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="mb-3 flex flex-wrap items-end gap-4">
            <label className="text-sm text-fg-2">
              Imagery date
              <input
                type="date"
                value={date}
                min={GIBS_MIN_DATE}
                max={today()}
                // Ignore the empty value some browsers emit while the user is typing.
                onChange={(event) => event.target.value && setDate(event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="text-sm text-fg-2">
              Layer
              <select
                value={layerId}
                onChange={(event) => setLayerId(event.target.value as GibsLayerId)}
                className={inputClass}
              >
                {Object.values(GIBS_LAYERS).map((layer) => (
                  <option key={layer.id} value={layer.id}>
                    {layer.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-fg-2 tabular-nums">
              Opacity {Math.round(opacity * 100)}%
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={opacity}
                onChange={(event) => setOpacity(Number(event.target.value))}
                className="mt-1 block h-10 w-32 accent-accent"
              />
            </label>
          </div>

          <h2 className="sr-only">{explore.mapTitle}</h2>
          <MapView
            center={explore.mapCenter}
            zoom={explore.mapZoom}
            gibsLayer={layerId}
            gibsDate={date}
            gibsOpacity={opacity}
            className="h-[55vh] min-h-80 lg:h-[600px]"
          />
        </div>

        <div className="space-y-4 lg:col-span-2">
          {stats && (
            <div className="grid grid-cols-2 gap-3">
              <StatTile
                label="Latest"
                value={stats.latest}
                unit={explore.unit}
                delta={{ value: stats.change, period: 'vs. 30 days ago' }}
              />
              <StatTile label="30-day mean" value={stats.mean} unit={explore.unit} />
              <StatTile label="Minimum" value={stats.min} unit={explore.unit} />
              <StatTile label="Maximum" value={stats.max} unit={explore.unit} />
            </div>
          )}

          <ChartCard
            title={explore.chartTitle}
            subtitle={`${explore.chartSubtitle} ${formatDate(series[0].date)} to ${formatDate(date)}.`}
            table={{
              columns: ['Date', `Value (${explore.unit})`],
              rows: series.map((point) => [point.date, point.value]),
            }}
          >
            <LineChart data={series} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} stroke={chartTheme.grid} />
              <XAxis
                dataKey="date"
                tickFormatter={(value: string) => formatDate(value, { short: true })}
                tick={chartTheme.tick}
                tickLine={false}
                axisLine={{ stroke: chartTheme.axis }}
                minTickGap={24}
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={chartTheme.tick}
                tickLine={false}
                axisLine={false}
                width={44}
              />
              <Tooltip
                {...chartTheme.tooltip}
                cursor={{ stroke: chartTheme.axis, strokeWidth: 1 }}
                labelFormatter={(value) => formatDate(String(value))}
                formatter={(value) => [`${value} ${explore.unit}`, 'Value']}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={chartTheme.series[0]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: chartTheme.surface, strokeWidth: 2 }}
              />
            </LineChart>
          </ChartCard>
        </div>
      </div>
    </div>
  )
}
