import { describe, it, expect } from 'vitest'
import {
  getMockClusterData,
  getMockTopology,
  type ClusterId,
} from './mockClusterData'

describe('getMockClusterData', () => {
  const clusterIds: ClusterId[] = ['production', 'staging', 'development']

  it('returns data for every known cluster id', () => {
    for (const id of clusterIds) {
      const data = getMockClusterData(id)
      expect(data).toBeDefined()
      expect(data.metrics).toBeDefined()
      expect(data.events).toBeDefined()
    }
  })

  it('returns metrics with required fields', () => {
    const data = getMockClusterData('production')
    expect(data.metrics).toMatchObject({
      nodes: expect.any(Number),
      pods: expect.any(Number),
      cpuPercent: expect.any(Number),
      memoryPercent: expect.any(Number),
      status: expect.any(String),
    })
    expect(Array.isArray(data.metrics.chartPoints)).toBe(true)
    expect(data.metrics.chartPoints).toHaveLength(24)
  })

  it('returns events with title, desc, type, ago', () => {
    const data = getMockClusterData('staging')
    expect(data.events.length).toBeGreaterThan(0)
    for (const event of data.events) {
      expect(event).toHaveProperty('title')
      expect(event).toHaveProperty('desc')
      expect(['success', 'warning', 'error']).toContain(event.type)
      expect(event).toHaveProperty('ago')
    }
  })

  it('falls back to production for unknown cluster id', () => {
    const data = getMockClusterData('unknown' as ClusterId)
    expect(data).toEqual(getMockClusterData('production'))
  })

  it('returns different metrics per cluster', () => {
    const prod = getMockClusterData('production')
    const staging = getMockClusterData('staging')
    const dev = getMockClusterData('development')
    expect(prod.metrics.nodes).not.toBe(dev.metrics.nodes)
    expect(prod.metrics.pods).not.toBe(staging.metrics.pods)
  })
})

describe('getMockTopology', () => {
  it('returns topology for every known cluster id', () => {
    const ids: ClusterId[] = ['production', 'staging', 'development']
    for (const id of ids) {
      const topo = getMockTopology(id)
      expect(topo).toBeDefined()
      expect(Array.isArray(topo.nodes)).toBe(true)
    }
  })

  it('each node has required fields and pods array', () => {
    const topo = getMockTopology('production')
    for (const node of topo.nodes) {
      expect(node).toHaveProperty('name')
      expect(node).toHaveProperty('role')
      expect(['control-plane', 'worker']).toContain(node.role)
      expect(node).toHaveProperty('status')
      expect(node).toHaveProperty('cpuPercent')
      expect(node).toHaveProperty('memoryPercent')
      expect(node).toHaveProperty('podCount')
      expect(Array.isArray(node.pods)).toBe(true)
      for (const pod of node.pods) {
        expect(pod).toHaveProperty('name')
        expect(pod).toHaveProperty('namespace')
        expect(pod).toHaveProperty('status')
        expect(pod).toHaveProperty('containers')
      }
    }
  })

  it('falls back to production for unknown cluster id', () => {
    const topo = getMockTopology('unknown' as ClusterId)
    expect(topo).toEqual(getMockTopology('production'))
  })
})
