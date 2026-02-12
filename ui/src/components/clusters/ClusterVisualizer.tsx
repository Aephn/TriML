import React, { useRef, useState, useCallback, useMemo } from 'react'
import { Cpu, Activity, X } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ClusterId } from '../../data/mockClusterData'
import { getMockTopology, type TopologyNode, type TopologyPod } from '../../data/mockClusterData'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const SVG_WIDTH = 800
const SVG_HEIGHT = 420
const NODE_R = 38
const CONTROL_Y = 72
const WORKER_Y = 320
const WORKER_SPACING = 140

function getNodePositions(nodes: TopologyNode[]) {
  const control = nodes.filter((n) => n.role === 'control-plane')
  const workers = nodes.filter((n) => n.role === 'worker')
  const positions: { node: TopologyNode; x: number; y: number }[] = []

  control.forEach((n, i) => {
    positions.push({ node: n, x: SVG_WIDTH / 2 + (i - (control.length - 1) / 2) * 100, y: CONTROL_Y })
  })
  const span = (workers.length - 1) * Math.min(WORKER_SPACING, (SVG_WIDTH - 160) / Math.max(1, workers.length))
  workers.forEach((n, i) => {
    const x = SVG_WIDTH / 2 - span / 2 + i * Math.min(WORKER_SPACING, (SVG_WIDTH - 160) / Math.max(1, workers.length))
    positions.push({ node: n, x, y: WORKER_Y })
  })
  return positions
}

interface ClusterVisualizerProps {
  clusterId: ClusterId
}

export default function ClusterVisualizer({ clusterId }: ClusterVisualizerProps) {
  const { nodes } = getMockTopology(clusterId)
  const positions = useMemo(() => getNodePositions(nodes), [nodes])
  const controlPositions = positions.filter((p) => p.node.role === 'control-plane')
  const workerPositions = positions.filter((p) => p.node.role === 'worker')

  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [lastPointer, setLastPointer] = useState({ x: 0, y: 0 })
  const [selectedNode, setSelectedNode] = useState<TopologyNode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      const container = containerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      const cursorX = e.clientX - rect.left
      const cursorY = e.clientY - rect.top
      const delta = e.deltaY > 0 ? -0.12 : 0.12
      const newZoom = Math.min(2.5, Math.max(0.35, zoom + delta))
      setZoom(newZoom)
      setPan((p) => ({
        x: cursorX - rect.width / 2 - (cursorX - rect.width / 2 - p.x) * (newZoom / zoom),
        y: cursorY - rect.height / 2 - (cursorY - rect.height / 2 - p.y) * (newZoom / zoom),
      }))
    },
    [zoom, pan]
  )

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as SVGElement).closest('g[data-node]')) return
    setIsPanning(true)
    setLastPointer({ x: e.clientX, y: e.clientY })
  }, [])

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isPanning) return
      setPan((p) => ({
        x: p.x + e.clientX - lastPointer.x,
        y: p.y + e.clientY - lastPointer.y,
      }))
      setLastPointer({ x: e.clientX, y: e.clientY })
    },
    [isPanning, lastPointer]
  )

  const handlePointerUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  const handleNodeClick = useCallback((node: TopologyNode) => {
    setSelectedNode((prev) => (prev?.name === node.name ? null : node))
  }, [])

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] p-6">
      <header className="flex-shrink-0 mb-4">
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">Cluster diagram</h2>
        <p className="text-slate-500 text-sm mt-0.5">
          Pan by dragging; scroll to zoom. Click a node for details.
        </p>
      </header>

      <div className="flex-1 min-h-0 flex gap-4">
        <div
          ref={containerRef}
          className={cn(
            'flex-1 min-h-[380px] min-w-0 rounded-2xl border border-white/[0.06] bg-slate-900/40 overflow-hidden relative',
            isPanning && 'cursor-grabbing'
          )}
          style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          >
            <svg
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              className="overflow-visible"
              style={{ width: SVG_WIDTH, height: SVG_HEIGHT, flexShrink: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Edges: control plane -> workers */}
              {controlPositions.length > 0 &&
                workerPositions.map((wp) => {
                  const cp = controlPositions[0]
                  const fromY = cp.y + NODE_R
                  const toY = wp.y - NODE_R
                  return (
                    <line
                      key={`edge-${cp.node.name}-${wp.node.name}`}
                      x1={cp.x}
                      y1={fromY}
                      x2={wp.x}
                      y2={toY}
                      stroke="rgba(255,255,255,0.12)"
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                  )
                })}

              {/* Nodes */}
              {positions.map(({ node, x, y }) => {
                const isControl = node.role === 'control-plane'
                const isSelected = selectedNode?.name === node.name
                const isReady = node.status === 'Ready'
                return (
                  <g
                    key={node.name}
                    data-node
                    className="cursor-pointer outline-none"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleNodeClick(node)
                    }}
                  >
                    <circle
                      cx={x}
                      cy={y}
                      r={NODE_R}
                      fill={isControl ? 'rgba(30,41,59,0.9)' : 'rgba(15,23,42,0.9)'}
                      stroke={isSelected ? 'rgba(255,255,255,0.35)' : isReady ? 'rgba(22,101,52,0.4)' : 'rgba(153,27,27,0.5)'}
                      strokeWidth={isSelected ? 3 : 2}
                    />
                    <text
                      x={x}
                      y={y - 4}
                      textAnchor="middle"
                      className="fill-slate-200 text-sm font-semibold"
                      style={{ fontSize: 13 }}
                    >
                      {node.name}
                    </text>
                    <text
                      x={x}
                      y={y + 12}
                      textAnchor="middle"
                      className="fill-slate-500"
                      style={{ fontSize: 10 }}
                    >
                      {isReady ? 'Ready' : 'NotReady'} · {node.podCount} pods
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>

        {/* Node detail panel */}
        <div
          className={cn(
            'w-80 flex-shrink-0 rounded-2xl border border-white/[0.06] bg-slate-900/40 flex flex-col overflow-hidden transition-all',
            selectedNode ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
        >
          {selectedNode && (
            <>
              <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-200 truncate">{selectedNode.name}</h3>
                <button
                  type="button"
                  onClick={() => setSelectedNode(null)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.06]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-4">
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Role
                  </p>
                  <p className="text-sm text-slate-200">
                    {selectedNode.role === 'control-plane' ? 'Control plane' : 'Worker'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Status
                  </p>
                  <span
                    className={cn(
                      'inline-block text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded',
                      selectedNode.status === 'Ready'
                        ? 'bg-[#166534]/20 text-[#166534]'
                        : 'bg-[#991b1b]/20 text-[#991b1b]'
                    )}
                  >
                    {selectedNode.status}
                  </span>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-mono text-slate-200 tabular-nums">
                      {selectedNode.cpuPercent}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-mono text-slate-200 tabular-nums">
                      {selectedNode.memoryPercent}%
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Pods ({selectedNode.pods.length})
                  </p>
                  <div className="rounded-xl border border-white/[0.05] divide-y divide-white/[0.05] overflow-hidden">
                    {selectedNode.pods.length === 0 ? (
                      <p className="text-xs text-slate-500 py-3 px-3">No pods</p>
                    ) : (
                      selectedNode.pods.map((pod, i) => (
                        <div
                          key={`${pod.name}-${i}`}
                          className="flex items-center gap-2 py-2 px-3 hover:bg-white/[0.02]"
                        >
                          <div
                            className={cn(
                              'w-1.5 h-1.5 rounded-full flex-shrink-0',
                              pod.status === 'Running' && 'bg-[#166534]',
                              pod.status === 'Pending' && 'bg-[#854d0e]',
                              pod.status === 'CrashLoopBackOff' && 'bg-[#991b1b]',
                              pod.status === 'Succeeded' && 'bg-slate-500'
                            )}
                          />
                          <span className="text-xs font-mono text-slate-300 truncate flex-1">
                            {pod.name}
                          </span>
                          <span className="text-[10px] text-slate-500">{pod.namespace}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
