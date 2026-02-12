import React, { useState } from 'react'
import { Cpu, Database, Activity, Server, RefreshCw, Minus } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { getMockClusterData, type ClusterId, type ClusterStatus } from '../../data/mockClusterData'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const STATUS_STYLES: Record<ClusterStatus, { bg: string; border: string; text: string; dot: string }> = {
  healthy: {
    bg: 'bg-[#166534]/20',
    border: 'border-[#166534]/30',
    text: 'text-[#166534]',
    dot: 'bg-[#166534]',
  },
  degraded: {
    bg: 'bg-[#854d0e]/20',
    border: 'border-[#854d0e]/30',
    text: 'text-[#b45309]',
    dot: 'bg-[#854d0e]',
  },
  warning: {
    bg: 'bg-[#854d0e]/20',
    border: 'border-[#854d0e]/30',
    text: 'text-[#b45309]',
    dot: 'bg-[#854d0e]',
  },
}

interface OverviewProps {
  clusterId: ClusterId
}

export default function Overview({ clusterId }: OverviewProps) {
  const [range, setRange] = useState<'24h' | '7d' | '30d'>('24h')
  const { metrics, events } = getMockClusterData(clusterId)
  const statusStyle = STATUS_STYLES[metrics.status]

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Hero: one line that sets the tone */}
      <header className="flex flex-wrap items-end justify-between gap-6 mb-10 animate-stagger-1">
        <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2">
          <div className="flex items-baseline gap-4">
            <span className="font-mono text-4xl font-semibold tabular-nums text-slate-100">
              {metrics.nodes}
            </span>
            <span className="text-slate-500 text-sm font-medium">Nodes</span>
            <Minus className="w-4 h-4 text-slate-700 rotate-90" />
            <span className="font-mono text-4xl font-semibold tabular-nums text-slate-100">
              {metrics.pods}
            </span>
            <span className="text-slate-500 text-sm font-medium">Pods</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <span className="font-mono text-sm tabular-nums text-slate-400">
              CPU {metrics.cpuPercent}%
            </span>
            <span className="text-slate-700">·</span>
            <span className="font-mono text-sm tabular-nums text-slate-400">
              Mem {metrics.memoryPercent}%
            </span>
          </div>
          <div
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-md border capitalize',
              statusStyle.bg,
              statusStyle.border
            )}
          >
            <div className={cn('w-1.5 h-1.5 rounded-full', statusStyle.dot)} />
            <span className={cn('text-[11px] font-semibold uppercase tracking-wider', statusStyle.text)}>
              {metrics.status}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(['24h', '7d', '30d'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-colors',
                range === r
                  ? 'bg-white/[0.08] text-slate-200'
                  : 'text-slate-500 hover:text-slate-400 hover:bg-white/[0.03]'
              )}
            >
              {r}
            </button>
          ))}
          <button className="p-1.5 rounded-lg text-slate-500 hover:text-slate-400 hover:bg-white/[0.04] transition-colors ml-1">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Bento: main chart + events timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 animate-stagger-2">
          <div className="rounded-2xl border border-white/[0.06] bg-slate-900/40 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.24)]">
            <div className="px-6 py-4 border-b border-white/[0.05] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-200">Resource usage</h2>
              <span className="text-[11px] text-slate-600 font-mono">UTC · {range}</span>
            </div>
            <div className="p-6">
              <div className="h-[280px] flex items-end gap-px">
                {metrics.chartPoints.map((p, i) => (
                  <div
                    key={i}
                    className="flex-1 min-w-0 rounded-t bg-gradient-to-t from-slate-700/80 to-slate-600/50 transition-all duration-300 hover:from-slate-600/90 hover:to-slate-500/60"
                    style={{ height: `${p}%` }}
                    title={`${p}%`}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2 px-0.5">
                <span className="text-[10px] font-mono text-slate-600">00:00</span>
                <span className="text-[10px] font-mono text-slate-600">12:00</span>
                <span className="text-[10px] font-mono text-slate-600">24:00</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 animate-stagger-3">
          <div className="rounded-2xl border border-white/[0.06] bg-slate-900/30 h-full min-h-[320px] flex flex-col">
            <div className="px-5 py-4 border-b border-white/[0.05]">
              <h2 className="text-sm font-semibold text-slate-200">Live events</h2>
            </div>
            <div className="flex-1 p-4">
              <div className="relative pl-4 border-l border-white/[0.06]">
                {events.map((event, i) => (
                  <div
                    key={i}
                    className={cn(
                      'relative pb-6 group cursor-default',
                      i === events.length - 1 && 'pb-0'
                    )}
                  >
                    <div
                      className={cn(
                        'absolute left-0 top-1 w-2 h-2 rounded-full -translate-x-[5px] border-2 border-[#0c1016]',
                        event.type === 'warning' && 'bg-[#854d0e]',
                        event.type === 'success' && 'bg-[#166534]',
                        event.type === 'error' && 'bg-[#991b1b]'
                      )}
                    />
                    <div className="pl-2">
                      <p className="text-[11px] font-mono text-slate-600 mb-0.5">{event.ago}</p>
                      <h3 className="text-sm font-semibold text-slate-200 group-hover:text-slate-100 transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">{event.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary row: compact metric strips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {[
          { label: 'Active pods', value: String(metrics.pods), icon: Database },
          { label: 'Nodes online', value: String(metrics.nodes), icon: Server },
          { label: 'CPU load', value: `${metrics.cpuPercent}%`, icon: Cpu },
          { label: 'Memory', value: `${metrics.memoryPercent}%`, icon: Activity },
        ].map((m, i) => (
          <div
            key={m.label}
            className={cn(
              'rounded-xl border border-white/[0.05] bg-white/[0.02] px-5 py-4 flex items-center gap-4 transition-colors hover:bg-white/[0.04] hover:border-white/[0.07]',
              `animate-stagger-${i + 4}`
            )}
          >
            <div className="w-10 h-10 rounded-lg bg-white/[0.05] flex items-center justify-center text-slate-500">
              <m.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">{m.label}</p>
              <p className="font-mono text-xl font-semibold tabular-nums text-slate-100 mt-0.5">
                {m.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
