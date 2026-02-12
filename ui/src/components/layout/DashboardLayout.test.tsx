import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DashboardLayout from './DashboardLayout'

describe('DashboardLayout', () => {
  const defaultProps = {
    activePage: 'dashboard',
    onPageChange: () => {},
    clusterId: 'production' as const,
    onClusterChange: () => {},
  }

  it('renders TriML branding and sidebar', () => {
    render(
      <DashboardLayout {...defaultProps}>
        <div>Page content</div>
      </DashboardLayout>
    )
    expect(screen.getByText('TriML')).toBeInTheDocument()
    expect(screen.getByText('Page content')).toBeInTheDocument()
  })

  it('renders nav items', () => {
    render(
      <DashboardLayout {...defaultProps}>
        <span>Child</span>
      </DashboardLayout>
    )
    expect(screen.getAllByRole('button', { name: /dashboard/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: /live clusters/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: /visualizer/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: /ai triage/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: /system/i }).length).toBeGreaterThan(0)
  })

  it('shows current cluster name', () => {
    render(
      <DashboardLayout {...defaultProps}>
        <span>Child</span>
      </DashboardLayout>
    )
    const productionButtons = screen.getAllByRole('button', { name: 'Production' })
    expect(productionButtons.length).toBeGreaterThan(0)
  })

  it('calls onPageChange when nav item is clicked', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    const { container } = render(
      <DashboardLayout {...defaultProps} onPageChange={onPageChange}>
        <span>Child</span>
      </DashboardLayout>
    )
    const nav = container.querySelector('nav')
    expect(nav).toBeTruthy()
    const buttons = nav!.querySelectorAll('button')
    const aiBtn = Array.from(buttons).find((b) => b.textContent?.includes('AI Triage'))
    expect(aiBtn).toBeTruthy()
    if (aiBtn) await user.click(aiBtn)
    expect(onPageChange).toHaveBeenCalledWith('ai-agent')
  })

  it('opens cluster dropdown and shows cluster options', async () => {
    const user = userEvent.setup()
    render(
      <DashboardLayout {...defaultProps}>
        <span>Child</span>
      </DashboardLayout>
    )
    const clusterButtons = screen.getAllByRole('button', { name: 'Production' })
    await user.click(clusterButtons[0])
    const stagingOptions = await screen.findAllByRole('button', { name: 'Staging' })
    expect(stagingOptions.length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Development' })).toBeInTheDocument()
  })
})
