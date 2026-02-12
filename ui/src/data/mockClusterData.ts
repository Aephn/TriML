/**
 * Mock cluster metrics and events — varies by cluster for UI testing.
 */

export type ClusterId = 'production' | 'staging' | 'development'

export type ClusterStatus = 'healthy' | 'degraded' | 'warning'

export interface ClusterMetrics {
  nodes: number
  pods: number
  cpuPercent: number
  memoryPercent: number
  status: ClusterStatus
  chartPoints: number[] // 24 points, 0–100 scale (resource usage over 24h)
}

export interface ClusterEvent {
  title: string
  desc: string
  type: 'success' | 'warning' | 'error'
  ago: string
}

export interface ClusterMockData {
  metrics: ClusterMetrics
  events: ClusterEvent[]
}

// --- Cluster topology (nodes + pods) ---

export type NodeStatus = 'Ready' | 'NotReady'
export type PodStatus = 'Running' | 'Pending' | 'CrashLoopBackOff' | 'Succeeded'

export interface TopologyPod {
  name: string
  namespace: string
  status: PodStatus
  containers: number
}

export interface TopologyNode {
  name: string
  role: 'control-plane' | 'worker'
  status: NodeStatus
  cpuPercent: number
  memoryPercent: number
  podCount: number
  pods: TopologyPod[]
}

export interface ClusterTopologyData {
  nodes: TopologyNode[]
}

// Deterministic but varied series per cluster (24 points)
function makeChart(seed: number, base: number, spread: number): number[] {
  const points: number[] = []
  for (let i = 0; i < 24; i++) {
    const t = (i / 23) * Math.PI * 2
    const wave = Math.sin(t + seed) * spread + (i < 12 ? 0 : 8)
    points.push(Math.round(Math.max(10, Math.min(92, base + wave + (i % 5)))))
  }
  return points
}

const MOCK_BY_CLUSTER: Record<ClusterId, ClusterMockData> = {
  production: {
    metrics: {
      nodes: 8,
      pods: 42,
      cpuPercent: 45,
      memoryPercent: 72,
      status: 'healthy',
      chartPoints: makeChart(0, 42, 18),
    },
    events: [
      { title: 'High Memory Usage', desc: 'Node worker-03 exceeded threshold', type: 'warning', ago: '4m ago' },
      { title: 'Scaled Replicas', desc: 'auth-service updated to 5', type: 'success', ago: '12m ago' },
      { title: 'Pod CrashLoopBackOff', desc: 'payment-processor failing', type: 'error', ago: '18m ago' },
    ],
  },
  staging: {
    metrics: {
      nodes: 4,
      pods: 18,
      cpuPercent: 62,
      memoryPercent: 78,
      status: 'degraded',
      chartPoints: makeChart(1.2, 58, 22),
    },
    events: [
      { title: 'Deployment Rollback', desc: 'api-v2 reverted to previous revision', type: 'warning', ago: '2m ago' },
      { title: 'Node NotReady', desc: 'worker-02 temporarily unavailable', type: 'warning', ago: '8m ago' },
      { title: 'HPA Scaled Up', desc: 'frontend replicas 3 → 6', type: 'success', ago: '15m ago' },
      { title: 'OOMKilled', desc: 'cache-pod in default namespace', type: 'error', ago: '22m ago' },
    ],
  },
  development: {
    metrics: {
      nodes: 2,
      pods: 6,
      cpuPercent: 28,
      memoryPercent: 45,
      status: 'healthy',
      chartPoints: makeChart(2.5, 28, 25),
    },
    events: [
      { title: 'ConfigMap Updated', desc: 'app-config in dev namespace', type: 'success', ago: '1m ago' },
      { title: 'Image Pull BackOff', desc: 'local-dev-image not found', type: 'warning', ago: '5m ago' },
      { title: 'Job Completed', desc: 'migration-job finished successfully', type: 'success', ago: '12m ago' },
    ],
  },
}

export function getMockClusterData(clusterId: ClusterId): ClusterMockData {
  return MOCK_BY_CLUSTER[clusterId] ?? MOCK_BY_CLUSTER.production
}

// --- Mock topology per cluster ---

function buildTopologyPod(name: string, namespace: string, status: PodStatus, containers: number): TopologyPod {
  return { name, namespace, status, containers }
}

const TOPOLOGY_BY_CLUSTER: Record<ClusterId, ClusterTopologyData> = {
  production: {
    nodes: [
      {
        name: 'control-plane-0',
        role: 'control-plane',
        status: 'Ready',
        cpuPercent: 12,
        memoryPercent: 28,
        podCount: 8,
        pods: [
          buildTopologyPod('kube-apiserver-0', 'kube-system', 'Running', 1),
          buildTopologyPod('kube-controller-0', 'kube-system', 'Running', 1),
          buildTopologyPod('etcd-0', 'kube-system', 'Running', 1),
          buildTopologyPod('coredns-0', 'kube-system', 'Running', 1),
          buildTopologyPod('coredns-1', 'kube-system', 'Running', 1),
          buildTopologyPod('kube-proxy-0', 'kube-system', 'Running', 1),
          buildTopologyPod('metrics-server-0', 'kube-system', 'Running', 1),
          buildTopologyPod('triage-agent-0', 'triml', 'Running', 2),
        ],
      },
      {
        name: 'worker-01',
        role: 'worker',
        status: 'Ready',
        cpuPercent: 52,
        memoryPercent: 68,
        podCount: 6,
        pods: [
          buildTopologyPod('auth-service-7f8b-xyz', 'production', 'Running', 2),
          buildTopologyPod('auth-service-7f8b-abc', 'production', 'Running', 2),
          buildTopologyPod('frontend-4a2c', 'production', 'Running', 1),
          buildTopologyPod('frontend-4a2d', 'production', 'Running', 1),
          buildTopologyPod('payment-processor-1', 'production', 'CrashLoopBackOff', 1),
          buildTopologyPod('redis-0', 'production', 'Running', 1),
        ],
      },
      {
        name: 'worker-02',
        role: 'worker',
        status: 'Ready',
        cpuPercent: 48,
        memoryPercent: 71,
        podCount: 6,
        pods: [
          buildTopologyPod('auth-service-7f8b-def', 'production', 'Running', 2),
          buildTopologyPod('api-gateway-2b1', 'production', 'Running', 1),
          buildTopologyPod('api-gateway-2b2', 'production', 'Running', 1),
          buildTopologyPod('frontend-4a2e', 'production', 'Running', 1),
          buildTopologyPod('worker-03', 'production', 'Running', 1),
          buildTopologyPod('queue-worker-0', 'production', 'Running', 1),
        ],
      },
      {
        name: 'worker-03',
        role: 'worker',
        status: 'Ready',
        cpuPercent: 58,
        memoryPercent: 82,
        podCount: 6,
        pods: [
          buildTopologyPod('frontend-4a2f', 'production', 'Running', 1),
          buildTopologyPod('frontend-4a30', 'production', 'Running', 1),
          buildTopologyPod('cache-0', 'production', 'Running', 1),
          buildTopologyPod('db-proxy-0', 'production', 'Running', 1),
          buildTopologyPod('analytics-0', 'production', 'Running', 2),
          buildTopologyPod('analytics-1', 'production', 'Running', 2),
        ],
      },
      {
        name: 'worker-04',
        role: 'worker',
        status: 'Ready',
        cpuPercent: 41,
        memoryPercent: 55,
        podCount: 5,
        pods: [
          buildTopologyPod('auth-service-7f8b-ghi', 'production', 'Running', 2),
          buildTopologyPod('auth-service-7f8b-jkl', 'production', 'Running', 2),
          buildTopologyPod('api-gateway-2b3', 'production', 'Running', 1),
          buildTopologyPod('notifier-0', 'production', 'Running', 1),
          buildTopologyPod('cron-sync-0', 'production', 'Succeeded', 1),
        ],
      },
      {
        name: 'worker-05',
        role: 'worker',
        status: 'Ready',
        cpuPercent: 38,
        memoryPercent: 62,
        podCount: 5,
        pods: [
          buildTopologyPod('frontend-4a31', 'production', 'Running', 1),
          buildTopologyPod('frontend-4a32', 'production', 'Running', 1),
          buildTopologyPod('ingress-0', 'production', 'Running', 1),
          buildTopologyPod('log-shipper-0', 'production', 'Running', 1),
          buildTopologyPod('log-shipper-1', 'production', 'Running', 1),
        ],
      },
      {
        name: 'worker-06',
        role: 'worker',
        status: 'Ready',
        cpuPercent: 44,
        memoryPercent: 59,
        podCount: 3,
        pods: [
          buildTopologyPod('backup-job-0', 'production', 'Succeeded', 1),
          buildTopologyPod('migration-0', 'production', 'Pending', 1),
          buildTopologyPod('db-primary-0', 'production', 'Running', 2),
        ],
      },
      {
        name: 'worker-07',
        role: 'worker',
        status: 'Ready',
        cpuPercent: 35,
        memoryPercent: 48,
        podCount: 3,
        pods: [
          buildTopologyPod('search-indexer-0', 'production', 'Running', 1),
          buildTopologyPod('search-indexer-1', 'production', 'Running', 1),
          buildTopologyPod('search-indexer-2', 'production', 'Running', 1),
        ],
      },
    ],
  },
  staging: {
    nodes: [
      {
        name: 'control-plane-0',
        role: 'control-plane',
        status: 'Ready',
        cpuPercent: 18,
        memoryPercent: 35,
        podCount: 6,
        pods: [
          buildTopologyPod('kube-apiserver-0', 'kube-system', 'Running', 1),
          buildTopologyPod('coredns-0', 'kube-system', 'Running', 1),
          buildTopologyPod('coredns-1', 'kube-system', 'Running', 1),
          buildTopologyPod('kube-proxy-0', 'kube-system', 'Running', 1),
          buildTopologyPod('triage-agent-0', 'triml', 'Running', 2),
          buildTopologyPod('metrics-server-0', 'kube-system', 'Running', 1),
        ],
      },
      {
        name: 'worker-01',
        role: 'worker',
        status: 'Ready',
        cpuPercent: 68,
        memoryPercent: 85,
        podCount: 5,
        pods: [
          buildTopologyPod('api-v2-rollback-0', 'staging', 'Running', 1),
          buildTopologyPod('api-v2-rollback-1', 'staging', 'Running', 1),
          buildTopologyPod('frontend-staging-0', 'staging', 'Running', 1),
          buildTopologyPod('frontend-staging-1', 'staging', 'Running', 1),
          buildTopologyPod('cache-pod-0', 'default', 'CrashLoopBackOff', 1),
        ],
      },
      {
        name: 'worker-02',
        role: 'worker',
        status: 'NotReady',
        cpuPercent: 0,
        memoryPercent: 0,
        podCount: 4,
        pods: [
          buildTopologyPod('api-v2-rollback-2', 'staging', 'Pending', 1),
          buildTopologyPod('worker-staging-0', 'staging', 'Pending', 1),
          buildTopologyPod('worker-staging-1', 'staging', 'Pending', 1),
          buildTopologyPod('test-runner-0', 'staging', 'Pending', 1),
        ],
      },
      {
        name: 'worker-03',
        role: 'worker',
        status: 'Ready',
        cpuPercent: 72,
        memoryPercent: 78,
        podCount: 3,
        pods: [
          buildTopologyPod('frontend-staging-2', 'staging', 'Running', 1),
          buildTopologyPod('frontend-staging-3', 'staging', 'Running', 1),
          buildTopologyPod('frontend-staging-4', 'staging', 'Running', 1),
        ],
      },
    ],
  },
  development: {
    nodes: [
      {
        name: 'control-plane-0',
        role: 'control-plane',
        status: 'Ready',
        cpuPercent: 22,
        memoryPercent: 40,
        podCount: 4,
        pods: [
          buildTopologyPod('kube-apiserver-0', 'kube-system', 'Running', 1),
          buildTopologyPod('coredns-0', 'kube-system', 'Running', 1),
          buildTopologyPod('triage-agent-0', 'triml', 'Running', 2),
          buildTopologyPod('kube-proxy-0', 'kube-system', 'Running', 1),
        ],
      },
      {
        name: 'worker-01',
        role: 'worker',
        status: 'Ready',
        cpuPercent: 28,
        memoryPercent: 48,
        podCount: 2,
        pods: [
          buildTopologyPod('app-config-0', 'dev', 'Running', 1),
          buildTopologyPod('local-dev-image-0', 'dev', 'CrashLoopBackOff', 1),
        ],
      },
    ],
  },
}

export function getMockTopology(clusterId: ClusterId): ClusterTopologyData {
  return TOPOLOGY_BY_CLUSTER[clusterId] ?? TOPOLOGY_BY_CLUSTER.production
}
