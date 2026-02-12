import { useState } from 'react'
import type { ClusterId } from './data/mockClusterData'
import DashboardLayout from './components/layout/DashboardLayout'
import Overview from './components/dashboard/Overview'
import Chat from './components/ai/Chat'
import ClusterTopology from './components/clusters/ClusterTopology'
import ClusterVisualizer from './components/clusters/ClusterVisualizer'

function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [clusterId, setClusterId] = useState<ClusterId>('production')

  return (
    <DashboardLayout
      activePage={activePage}
      onPageChange={setActivePage}
      clusterId={clusterId}
      onClusterChange={setClusterId}
    >
      {activePage === 'dashboard' && <Overview clusterId={clusterId} />}
      {activePage === 'ai-agent' && <Chat />}
      {activePage === 'clusters' && <ClusterTopology clusterId={clusterId} />}
      {activePage === 'visualizer' && <ClusterVisualizer clusterId={clusterId} />}
    </DashboardLayout>
  )
}

export default App
