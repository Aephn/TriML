import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Chat from './Chat'

describe('Chat', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders header and initial AI message', () => {
    render(<Chat />)
    expect(screen.getByText('Triage Core')).toBeInTheDocument()
    expect(screen.getByText(/Greetings. I am monitoring your cluster/)).toBeInTheDocument()
  })

  it('renders input and send button', () => {
    render(<Chat />)
    const inputs = screen.getAllByPlaceholderText(/describe the anomaly/i)
    expect(inputs.length).toBeGreaterThan(0)
    const sendButtons = screen.getAllByRole('button')
    expect(sendButtons.some((b) => b.closest('form') || b.type === 'submit' || b.querySelector('svg'))).toBe(true)
  })

  it('renders suggested queries', () => {
    render(<Chat />)
    expect(screen.getAllByText('Analyze crash loops').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Show CPU hotspots').length).toBeGreaterThan(0)
    expect(screen.getAllByText('List failed deployments').length).toBeGreaterThan(0)
  })

  it('adds user message and shows AI response after delay', async () => {
    vi.useRealTimers()
    const user = userEvent.setup()
    render(<Chat />)
    const input = screen.getAllByPlaceholderText(/describe the anomaly/i)[0]
    await user.type(input, 'What is the cluster health?')
    const inputContainer = input.closest('div')
    const sendBtn = inputContainer?.querySelector('button')
    expect(sendBtn).toBeTruthy()
    if (sendBtn) await user.click(sendBtn as HTMLButtonElement)

    expect(screen.getByText('What is the cluster health?')).toBeInTheDocument()
    await vi.waitFor(
      () => {
        expect(screen.getByText(/I've analyzed the recent telemetry/)).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
    vi.useFakeTimers()
  })

  it('send button is disabled when input is empty', () => {
    render(<Chat />)
    const textareas = screen.getAllByPlaceholderText(/describe the anomaly/i)
    expect(textareas[0]).toHaveValue('')
    const buttons = screen.getAllByRole('button')
    const disabledCount = buttons.filter((b) => b.hasAttribute('disabled')).length
    expect(disabledCount).toBeGreaterThanOrEqual(1)
  })
})
