import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Overview from './Overview'
describe('Overview', () => {
  it('renders metrics for production cluster', () => {
    render(<Overview clusterId="production" />)
    expect(screen.getByText(/CPU 45%/)).toBeInTheDocument()
    expect(screen.getByText(/Mem 72%/)).toBeInTheDocument()
    expect(screen.getByText(/healthy/i)).toBeInTheDocument()
    expect(screen.getByText('Nodes')).toBeInTheDocument()
    expect(screen.getByText('Pods')).toBeInTheDocument()
  })

  it('renders metrics for staging cluster', () => {
    render(<Overview clusterId="staging" />)
    expect(screen.getByText(/CPU 62%/)).toBeInTheDocument()
    expect(screen.getByText(/Mem 78%/)).toBeInTheDocument()
    expect(screen.getByText(/degraded/i)).toBeInTheDocument()
  })

  it('renders events list', () => {
    render(<Overview clusterId="production" />)
    expect(screen.getAllByText('High Memory Usage').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/worker-03 exceeded/).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Scaled Replicas').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Pod CrashLoopBackOff').length).toBeGreaterThan(0)
  })

  it('renders time range buttons', () => {
    render(<Overview clusterId="production" />)
    expect(screen.getAllByRole('button', { name: '24h' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: '7d' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: '30d' }).length).toBeGreaterThan(0)
  })

  it('renders resource usage and live events sections', () => {
    render(<Overview clusterId="production" />)
    expect(screen.getAllByText('Resource usage').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Live events').length).toBeGreaterThan(0)
  })
})
