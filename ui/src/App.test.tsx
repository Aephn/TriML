import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App', () => {
  it('renders and shows dashboard by default', () => {
    render(<App />)
    expect(screen.getByText('Resource usage')).toBeInTheDocument()
    expect(screen.getByText('Nodes')).toBeInTheDocument()
    expect(screen.getByText('Pods')).toBeInTheDocument()
  })

  it('shows Overview metrics for production cluster', () => {
    render(<App />)
    expect(screen.getAllByText(/CPU 45%/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Mem 72%/).length).toBeGreaterThan(0)
  })

  it('can switch to AI Triage page', async () => {
    const user = userEvent.setup()
    render(<App />)
    const aiNavButtons = screen.getAllByRole('button', { name: /ai triage/i })
    await user.click(aiNavButtons[0])
    expect(screen.getByText(/Triage Core/i)).toBeInTheDocument()
    expect(screen.getAllByPlaceholderText(/describe the anomaly/i)[0]).toBeInTheDocument()
  })

  it('can switch to Live Clusters page', async () => {
    const user = userEvent.setup()
    render(<App />)
    const clustersNav = screen.getAllByRole('button', { name: /live clusters/i })[0]
    await user.click(clustersNav)
    expect(screen.getByText(/cluster topology/i)).toBeInTheDocument()
  })

  it('can switch to Visualizer page', async () => {
    const user = userEvent.setup()
    render(<App />)
    const vizNav = screen.getAllByRole('button', { name: /visualizer/i })[0]
    await user.click(vizNav)
    expect(screen.getByText(/cluster diagram/i)).toBeInTheDocument()
  })
})
