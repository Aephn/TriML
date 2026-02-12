import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ClusterTopology from './ClusterTopology'

describe('ClusterTopology', () => {
  it('renders topology header for production', () => {
    render(<ClusterTopology clusterId="production" />)
    expect(screen.getByText('Cluster topology')).toBeInTheDocument()
    expect(screen.getByText(/8 node/)).toBeInTheDocument()
  })

  it('renders control plane and worker sections', () => {
    render(<ClusterTopology clusterId="production" />)
    expect(screen.getAllByText('Control plane').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Worker nodes').length).toBeGreaterThan(0)
  })

  it('renders node names', () => {
    render(<ClusterTopology clusterId="production" />)
    expect(screen.getAllByText('control-plane-0').length).toBeGreaterThan(0)
    expect(screen.getAllByText('worker-01').length).toBeGreaterThan(0)
  })

  it('expands node to show pods on click', async () => {
    const user = userEvent.setup()
    render(<ClusterTopology clusterId="production" />)
    const nodeButtons = screen.getAllByRole('button').filter((b) => b.textContent?.includes('control-plane-0'))
    expect(nodeButtons.length).toBeGreaterThan(0)
    await user.click(nodeButtons[0])
    expect(screen.getAllByText('Pods').length).toBeGreaterThan(0)
    expect(screen.getAllByText('kube-apiserver-0').length).toBeGreaterThan(0)
  })

  it('shows different node count for staging', () => {
    render(<ClusterTopology clusterId="staging" />)
    const titles = screen.getAllByText('Cluster topology')
    expect(titles.length).toBeGreaterThan(0)
    expect(screen.getByText(/4 node/)).toBeInTheDocument()
  })
})
