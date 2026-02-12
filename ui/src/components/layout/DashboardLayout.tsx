import React, { useState, useRef, useEffect } from 'react'
import { LayoutDashboard, Radio, Network, Settings, Search, Terminal, ChevronRight, ChevronDown } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ClusterId } from '../../data/mockClusterData'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const CLUSTERS: { id: ClusterId; name: string; region: string }[] = [
  { id: 'production', name: 'Production', region: 'us-east-1' },
  { id: 'staging', name: 'Staging', region: 'us-east-1' },
  { id: 'development', name: 'Development', region: 'us-west-2' },
]

interface SidebarItemProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick: () => void
}

const SidebarItem = ({ icon, label, active, onClick }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all duration-200 text-left group',
      active
        ? 'bg-white/[0.07] text-slate-100'
        : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]'
    )}
  >
    <span className={cn('w-5 h-5 flex-shrink-0', active ? 'text-slate-300' : 'text-slate-500 group-hover:text-slate-400')}>
      {icon}
    </span>
    <span className="text-sm font-medium truncate">{label}</span>
    {active && <ChevronRight className="w-4 h-4 ml-auto text-slate-500 flex-shrink-0" />}
  </button>
)

interface DashboardLayoutProps {
  children: React.ReactNode
  activePage: string
  onPageChange: (page: string) => void
  clusterId: ClusterId
  onClusterChange: (id: ClusterId) => void
}

export default function DashboardLayout({ children, activePage, onPageChange, clusterId, onClusterChange }: DashboardLayoutProps) {
  const [clusterDropdownOpen, setClusterDropdownOpen] = useState(false)
  const clusterDropdownRef = useRef<HTMLDivElement>(null)
  const currentCluster = CLUSTERS.find((c) => c.id === clusterId) ?? CLUSTERS[0]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (clusterDropdownRef.current && !clusterDropdownRef.current.contains(event.target as Node)) {
        setClusterDropdownOpen(false)
      }
    }
    if (clusterDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [clusterDropdownOpen])

  return (
    <div className="flex h-screen w-full bg-[#070a0f] text-slate-200 overflow-hidden font-outfit">
      {/* Sidebar — compact, clear hierarchy */}
      <aside className="w-[200px] border-r border-white/[0.05] flex flex-col flex-shrink-0 bg-[#070a0f]/80 backdrop-blur-xl">
        <div className="p-5 border-b border-white/[0.05]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-white/[0.06]">
              <div className="w-3.5 h-3.5 border-2 border-slate-500 rounded-sm rotate-45" />
            </div>
            <span className="text-base font-semibold tracking-tight text-slate-100">TriML</span>
          </div>
        </div>

        {/* Cluster selector — custom grey dropdown above nav */}
        <div className="px-2.5 pt-4 pb-2" ref={clusterDropdownRef}>
          <label className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider block mb-2">
            Cluster
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setClusterDropdownOpen((o) => !o)}
              className="w-full flex items-center justify-between gap-2 bg-slate-800/80 text-slate-300 border border-slate-600/60 rounded-lg py-2 pl-3 pr-2.5 text-sm font-medium hover:border-slate-500/80 hover:bg-slate-800 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500/30 cursor-pointer transition-colors"
            >
              <span className="truncate">{currentCluster.name}</span>
              <ChevronDown
                className={cn('w-4 h-4 text-slate-500 flex-shrink-0 transition-transform', clusterDropdownOpen && 'rotate-180')}
              />
            </button>
            {clusterDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 py-1 bg-slate-800 border border-slate-600/60 rounded-lg shadow-xl shadow-black/40 z-50 overflow-hidden">
                {CLUSTERS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onClusterChange(c.id)
                      setClusterDropdownOpen(false)
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2 text-sm font-medium transition-colors',
                      c.id === clusterId
                        ? 'bg-slate-700/80 text-slate-100'
                        : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                    )}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 py-2 px-2.5 flex flex-col gap-0.5">
          <SidebarItem
            icon={<LayoutDashboard className="w-[18px] h-[18px]" />}
            label="Dashboard"
            active={activePage === 'dashboard'}
            onClick={() => onPageChange('dashboard')}
          />
          <SidebarItem
            icon={<Radio className="w-[18px] h-[18px]" />}
            label="Live Clusters"
            active={activePage === 'clusters'}
            onClick={() => onPageChange('clusters')}
          />
          <SidebarItem
            icon={<Network className="w-[18px] h-[18px]" />}
            label="Visualizer"
            active={activePage === 'visualizer'}
            onClick={() => onPageChange('visualizer')}
          />
          <SidebarItem
            icon={<Terminal className="w-[18px] h-[18px]" />}
            label="AI Triage"
            active={activePage === 'ai-agent'}
            onClick={() => onPageChange('ai-agent')}
          />
          <SidebarItem
            icon={<Settings className="w-[18px] h-[18px]" />}
            label="System"
            active={activePage === 'settings'}
            onClick={() => onPageChange('settings')}
          />
        </nav>

        <div className="p-2.5 border-t border-white/[0.05]">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-white/[0.02]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#166534] shadow-[0_0_6px_rgba(22,101,52,0.6)] animate-pulse" />
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Online</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-14 flex-shrink-0 border-b border-white/[0.05] flex items-center justify-between px-6 bg-[#070a0f]/60 backdrop-blur-md">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-500 font-medium">{currentCluster.name}</span>
            <span className="text-slate-700">·</span>
            <span className="text-slate-400">{currentCluster.region}</span>
            <span className="text-slate-700">/</span>
            <span className="text-slate-200 capitalize">{activePage.replace('-', ' ')}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-600 font-mono">Last sync 2m ago</span>
            <div className="w-px h-4 bg-white/[0.08]" />
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-white/[0.04] border border-white/[0.06] rounded-lg py-1.5 pl-8 pr-3 text-[13px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-white/15 w-44 transition-colors"
              />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  )
}
