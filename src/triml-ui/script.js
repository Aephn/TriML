/**
 * TriML - Kubernetes AI Triage Platform
 * Frontend Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the application
    const app = new TriMLApp();
    app.init();
});

class TriMLApp {
    constructor() {
        // DOM Elements
        this.loadingScreen = document.getElementById('loadingScreen');
        this.navItems = document.querySelectorAll('.nav-item');
        this.pages = document.querySelectorAll('.page');
        this.pageTitle = document.getElementById('pageTitle');
        this.pageSubtitle = document.getElementById('pageSubtitle');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.connectionStatus = document.getElementById('connectionStatus');
        
        // Dashboard Elements
        this.stats = {
            pods: document.getElementById('totalPods'),
            nodes: document.getElementById('activeNodes'),
            cpu: document.getElementById('cpuUsage'),
            memory: document.getElementById('memoryUsage')
        };
        
        // AI Agent Elements
        this.chatInput = document.getElementById('chatInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.chatMessages = document.getElementById('chatMessages');
        this.quickActions = document.querySelectorAll('.quick-action-btn');

        // State
        this.currentPage = 'dashboard';
        this.chart = null;
        this.isAiThinking = false;
        
        // Mock Data Configuration
        this.dataRefreshInterval = 5000; // 5 seconds
    }

    init() {
        this.setupNavigation();
        this.setupDashboard();
        this.setupAIAgent();
        this.setupGlobalEvents();
        
        // Simulate initial data load
        setTimeout(() => {
            this.hideLoadingScreen();
            this.updateDashboardData();
        }, 800);

        // Start periodic updates
        setInterval(() => this.updateDashboardData(), this.dataRefreshInterval);
    }

    setupGlobalEvents() {
        // Refresh button
        this.refreshBtn.addEventListener('click', () => {
            this.refreshBtn.classList.add('rotating');
            this.updateDashboardData();
            setTimeout(() => this.refreshBtn.classList.remove('rotating'), 1000);
        });

        // Add CSS class for rotation animation
        const style = document.createElement('style');
        style.textContent = `
            .rotating svg { animation: spin 1s linear; }
        `;
        document.head.appendChild(style);
    }

    hideLoadingScreen() {
        this.loadingScreen.classList.add('hidden');
        setTimeout(() => {
            this.loadingScreen.style.display = 'none';
        }, 300);
    }

    /* ==============================================
       Navigation Logic
       ============================================== */
    setupNavigation() {
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const pageId = item.dataset.page;
                this.navigateTo(pageId);
            });
        });
    }

    navigateTo(pageId) {
        // Update active nav state
        this.navItems.forEach(item => {
            if (item.dataset.page === pageId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Hide all pages, show target page
        this.pages.forEach(page => {
            if (page.id === `${pageId}-page`) {
                page.classList.remove('hidden');
                // Re-trigger animation
                page.style.animation = 'none';
                page.offsetHeight; /* trigger reflow */
                page.style.animation = 'fadeIn 0.3s ease-in';
            } else {
                page.classList.add('hidden');
            }
        });

        // Update Header
        this.updateHeader(pageId);
        this.currentPage = pageId;
    }

    updateHeader(pageId) {
        const titles = {
            'dashboard': 'Dashboard',
            'clusters': 'Clusters',
            'pods': 'Pods Management',
            'ai-agent': 'AI Triage Agent',
            'analytics': 'Analytics'
        };

        const subtitles = {
            'dashboard': 'Real-time overview of your Kubernetes infrastructure',
            'clusters': 'Manage and monitor your Kubernetes clusters',
            'pods': 'View and manage running pods across namespaces',
            'ai-agent': 'Ask questions and get intelligent infrastructure insights',
            'analytics': 'Deep dive into performance metrics and trends'
        };

        this.pageTitle.textContent = titles[pageId] || 'Page';
        this.pageSubtitle.textContent = subtitles[pageId] || '';
    }

    /* ==============================================
       Dashboard Logic
       ============================================== */
    setupDashboard() {
        this.initChart();
        this.renderActivityList();
    }

    initChart() {
        const ctx = document.getElementById('resourceChart').getContext('2d');
        
        // Gradient for the chart
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
                datasets: [{
                    label: 'CPU Usage',
                    data: [45, 52, 49, 62, 58, 65, 55],
                    borderColor: '#6366f1',
                    backgroundColor: gradient,
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#6366f1',
                    pointBorderColor: '#131827',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: '#1a1f35',
                        titleColor: '#f8fafc',
                        bodyColor: '#94a3b8',
                        borderColor: 'rgba(148, 163, 184, 0.1)',
                        borderWidth: 1,
                        padding: 10,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return context.parsed.y + '% Utilization';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(148, 163, 184, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#94a3b8',
                            font: {
                                family: "'Inter', sans-serif",
                                size: 11
                            },
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            color: '#94a3b8',
                            font: {
                                family: "'Inter', sans-serif",
                                size: 11
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index',
                },
            }
        });
    }

    updateDashboardData() {
        // Simulate live data updates
        const randomChanges = () => {
             // Pods: fluctuate slightly around 42
            const pods = 40 + Math.floor(Math.random() * 5);
             // Nodes: static usually
            const nodes = 8;
             // CPU: fluctuate between 40-70%
            const cpu = 45 + Math.floor(Math.random() * 25);
             // Mem: fluctuate between 50-80%
            const mem = 55 + Math.floor(Math.random() * 25);

            this.stats.pods.textContent = pods;
            this.stats.nodes.textContent = nodes;
            this.stats.cpu.textContent = cpu + '%';
            this.stats.memory.textContent = mem + '%';

            // Pulse connection status to show activity
            this.connectionStatus.style.opacity = '0.5';
            setTimeout(() => this.connectionStatus.style.opacity = '1', 200);

            // Update chart with new data point mock
            if (this.chart && this.currentPage === 'dashboard') {
                const newData = [...this.chart.data.datasets[0].data];
                newData.shift();
                newData.push(cpu);
                this.chart.data.datasets[0].data = newData;
                this.chart.update('none'); // 'none' for no animation on update
            }
        };

        randomChanges();
    }

    renderActivityList() {
        const activities = [
            {
                type: 'warning',
                title: 'High Memory Usage Detected',
                desc: 'Node worker-03 exceeded 85% memory threshold',
                time: '2 mins ago',
                icon: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>'
            },
            {
                type: 'success',
                title: 'Deployment Scaled Successfully',
                desc: 'auth-service scaled to 5 replicas',
                time: '15 mins ago',
                icon: '<polyline points="20 6 9 17 4 12"></polyline>'
            },
            {
                type: 'error',
                title: 'Pod CrashLoopBackOff',
                desc: 'payment-processor-78f detected crash loop',
                time: '1 hour ago',
                icon: '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>'
            }
        ];

        const listContainer = document.getElementById('activityList');
        listContainer.innerHTML = activities.map(item => `
            <div class="activity-item">
                <div class="activity-icon ${item.type}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        ${item.icon}
                    </svg>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${item.title}</div>
                    <div class="activity-description">${item.desc}</div>
                </div>
                <div class="activity-time">${item.time}</div>
            </div>
        `).join('');
    }

    /* ==============================================
       AI Agent Logic
       ============================================== */
    setupAIAgent() {
        // Auto-resize textarea
        this.chatInput.addEventListener('input', () => {
            this.chatInput.style.height = 'auto';
            this.chatInput.style.height = this.chatInput.scrollHeight + 'px';
        });

        // Send on Enter (but Shift+Enter for newline)
        this.chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSendMessage();
            }
        });

        // Send button click
        this.sendBtn.addEventListener('click', () => this.handleSendMessage());

        // Quick actions
        this.quickActions.forEach(btn => {
            btn.addEventListener('click', () => {
                this.chatInput.value = btn.textContent;
                this.handleSendMessage();
            });
        });
    }

    async handleSendMessage() {
        const text = this.chatInput.value.trim();
        if (!text || this.isAiThinking) return;

        // Add user message
        this.addMessage(text, 'user');
        this.chatInput.value = '';
        this.chatInput.style.height = 'auto';

        // Set state to thinking
        this.isAiThinking = true;
        this.sendBtn.disabled = true;
        
        // Add thinking indicator
        const thinkingId = this.addThinkingIndicator();

        // Simulate AI processing delay
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Remove thinking indicator
            this.removeMessage(thinkingId);
            
            // Generate response (Mock)
            const response = this.generateAIResponse(text);
            this.addMessage(response, 'assistant');

        } catch (error) {
            console.error('AI Error:', error);
            this.removeMessage(thinkingId);
            this.addMessage("I apologize, but I encountered an error processing your request. Please try again.", 'assistant');
        } finally {
            this.isAiThinking = false;
            this.sendBtn.disabled = false;
            // Focus back on input
            this.chatInput.focus();
        }
    }

    addMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        const avatar = type === 'user' 
            ? `<div class="message-avatar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>`
            : `<div class="message-avatar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20z"></path><circle cx="9" cy="10" r="1"></circle><circle cx="15" cy="10" r="1"></circle><path d="M9 14s1 1 3 1 3-1 3-1"></path></svg></div>`;

        messageDiv.innerHTML = `
            ${avatar}
            <div class="message-content">
                <p>${text}</p>
            </div>
        `;

        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        return messageDiv.id; // basic ID if needed later
    }

    addThinkingIndicator() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message assistant thinking';
        messageDiv.id = 'thinking-' + Date.now();
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20z"></path>
                    <path d="M12 12v.01"></path>
                </svg>
            </div>
            <div class="message-content">
                <p>Analyzing infrastructure<span class="dots">...</span></p>
            </div>
        `;
        
        // Add styles for the dots animation if not present
        if (!document.getElementById('thinking-style')) {
            const style = document.createElement('style');
            style.id = 'thinking-style';
            style.textContent = `
                @keyframes ellipsis {
                    0% { content: '.'; }
                    33% { content: '..'; }
                    66% { content: '...'; }
                }
                .dots::after {
                    content: '.';
                    animation: ellipsis 1.5s infinite;
                    display: inline-block;
                    width: 1em;
                    text-align: left;
                }
            `;
            document.head.appendChild(style);
        }

        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        return messageDiv.id;
    }

    removeMessage(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    generateAIResponse(query) {
        const lowerQuery = query.toLowerCase();
        
        if (lowerQuery.includes('health') || lowerQuery.includes('status')) {
            return "Based on the metrics, the cluster is generally healthy. However, the <strong>etcd</strong> component is showing high latency (average 45ms). This could be caused by slow disk I/O on the master nodes. I recommend checking the disk performance on node <code>master-01</code>.";
        }
        
        if (lowerQuery.includes('memory') || lowerQuery.includes('pressure')) {
            return "I've detected memory pressure on three worker nodes: <code>worker-03</code>, <code>worker-05</code>, and <code>worker-08</code>. They are consistently operating above 85% capacity. The <code>payment-processor</code> pods are the primary consumers. You might want to consider increasing the node pool size or optimizing the memory limits for these deployments.";
        }

        if (lowerQuery.includes('pod') || lowerQuery.includes('allocation')) {
            return "Pod allocation is currently optimal across availability zones A and B. However, zone C is underutilized with only 12% of pods scheduled there. I suggest reviewing the affinity rules for your deployments to ensure better distribution for high availability.";
        }

        if (lowerQuery.includes('error') || lowerQuery.includes('crash')) {
             return "I found 14 instances of <code>CrashLoopBackOff</code> in the <code>payment-processor-78f</code> pod over the last hour. The logs indicate a <code>ConnectionRefused</code> error when trying to reach the database service. This usually suggests a network policy blocking the connection or the database service being down.";
        }

        return "I can help you with that. I'm currently monitoring 42 pods across 8 nodes. Could you specify which namespace or resource you'd like me to investigate deeper?";
    }
}
