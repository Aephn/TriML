import React, { useState } from 'react'
import { Server, ChevronDown, ChevronRight, Cpu, Activity } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ClusterId } from '../../data/mockClusterData'
import { getMockTopology, type TopologyNode, type TopologyPod, type PodStatus } from '../../data/mockClusterData'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const POD_STATUS_STYLES: Record<PodStatus, { dot: string; text: string }> = {
  Running: { dot: 'bg-[#166534]', text: 'text-slate-300' },
  Pending: { dot: 'bg-[#854d0e]', text: 'text-slate-400' },
  CrashLoopBackOff: { dot: 'bg-[#991b1b]', text: 'text-slate-300' },
  Succeeded: { dot: 'bg-slate-500', text: 'text-slate-500' },
}

function PodRow({ pod }: { pod: TopologyPod }) {
  const style = POD_STATUS_STYLES[pod.status]
  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-white/[0.03]">
      <div className={cn('w-2 h-2 rounded-full flex-shrink-0', style.dot)} />
      <span className={cn('text-sm font-mono truncate flex-1', style.text)}>{pod.name}</span>
      <span className="text-xs text-slate-500 flex-shrink-0">{pod.namespace}</span>
    </div>
  )
}

function NodeCard({
  node,
  isExpanded,
  onToggle,
}: {
  node: TopologyNode
  isExpanded: boolean
  onToggle: () => void
}) {
  const isControlPlane = node.role === 'control-plane'

  return (
    <div
      className={cn(
        'rounded-2xl border overflow-hidden transition-colors',
        isControlPlane
          ? 'border-white/[0.08] bg-slate-800/40'
          : 'border-white/[0.06] bg-slate-900/30 hover:border-white/[0.08]'
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left p-6"
      >
        {/* Row 1: chevron, icon, node name */}
        <div className="flex items-center gap-4 mb-4">
          <span className="text-slate-500 flex-shrink-0">
            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </span>
          <div className="w-12 h-12 rounded-xl bg-white/[0.06] flex items-center justify-center text-slate-400 flex-shrink-0">
            <Server className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold text-slate-100 truncate">{node.name}</p>
            <p className="text-sm text-slate-500 mt-0.5">
              {node.role === 'control-plane' ? 'Control plane' : 'Worker node'}
            </p>
          </div>
        </div>

        {/* Row 2: status badge and metrics — no overlap */}
        <div className="flex flex-wrap items-center justify-between gap-4 pl-[4.25rem]">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg',
                node.status === 'Ready' ? 'bg-[#166534]/20 text-[#166534]' : 'bg-[#991b1b]/20 text-[#991b1b]'
              )}
            >
              {node.status}
            </span>
            <span className="text-sm font-mono text-slate-500 tabular-nums">
              {node.podCount} pod{node.podCount !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-6 text-slate-500">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-mono tabular-nums">{node.cpuPercent}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-mono tabular-nums">{node.memoryPercent}%</span>
            </div>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-white/[0.06] bg-black/20 px-6 pb-5 pt-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Pods</p>
          <div className="rounded-xl border border-white/[0.05] divide-y divide-white/[0.05] overflow-hidden">
            {node.pods.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 px-4">No pods scheduled</p>
            ) : (
              node.pods.map((pod, i) => <PodRow key={`${pod.name}-${i}`} pod={pod} />)
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface ClusterTopologyProps {
  clusterId: ClusterId
}

export default function ClusterTopology({ clusterId }: ClusterTopologyProps) {
  const { nodes } = getMockTopology(clusterId)
  const controlPlaneNodes = nodes.filter((n) => n.role === 'control-plane')
  const workerNodes = nodes.filter((n) => n.role === 'worker')
  const totalPods = nodes.reduce((acc, n) => acc + n.podCount, 0)

  // Only one node expanded at a time; default to first control plane node if present
  const [expandedNodeName, setExpandedNodeName] = useState<string | null>(() =>
    controlPlaneNodes.length > 0 ? controlPlaneNodes[0].name : null
  )

  const handleToggle = (nodeName: string) => {
    setExpandedNodeName((prev) => (prev === nodeName ? null : nodeName))
  }

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <header className="mb-10 animate-stagger-1">
        <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Cluster topology</h2>
        <p className="text-slate-500 text-sm mt-1">
          {nodes.length} node{nodes.length !== 1 ? 's' : ''} · {totalPods} pod{totalPods !== 1 ? 's' : ''}
        </p>
      </header>

      <div className="space-y-10">
        {controlPlaneNodes.length > 0 && (
          <section className="animate-stagger-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Control plane
            </h3>
            <div className="grid grid-cols-1 gap-6">
              {controlPlaneNodes.map((node) => (
                <NodeCard
                  key={node.name}
                  node={node}
                  isExpanded={expandedNodeName === node.name}
                  onToggle={() => handleToggle(node.name)}
                />
              ))}
            </div>
          </section>
        )}

        <section className="animate-stagger-3">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Worker nodes
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {workerNodes.map((node) => (
              <NodeCard
                key={node.name}
                node={node}
                isExpanded={expandedNodeName === node.name}
                onToggle={() => handleToggle(node.name)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
