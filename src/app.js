/**
 * Patas de Elite - Main Application JS
 * Handles chart initialization, polls, and user interactions
 */

// Chart initialization for Follower Growth
function initFollowerChart() {
    const ctx = document.getElementById('followerChart');
    if (!ctx) return;

    const canvasContainer = ctx.parentElement;
    ctx.style.maxHeight = '400px';

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Followers',
                data: [15000, 18500, 24200, 31500, 45800, 67300],
                borderColor: '#D4AF37',
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: '#D4AF37',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        font: { family: "'Playfair Display', serif", size: 14 },
                        color: '#2D2D2D'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#2D2D2D' },
                    grid: { color: 'rgba(0,0,0,0.05)' }
                },
                x: {
                    ticks: { color: '#2D2D2D' },
                    grid: { color: 'rgba(0,0,0,0.05)' }
                }
            }
        }
    });
}

// Chart initialization for Poll Results
function initPollChart() {
    const ctx = document.getElementById('pollChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Sachê Gourmet', 'Standard', 'No Opinion'],
            datasets: [{
                data: [65, 25, 10],
                backgroundColor: ['#FF69B4', '#D4AF37', '#E0E0E0'],
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        font: { family: "'Playfair Display', serif", size: 12 },
                        color: '#2D2D2D'
                    }
                }
            }
        }
    });
}

// Render comments
function renderComments() {
    const comments = [
        { user: 'Lady Whiskers', time: '2h', text: 'This is absolutely unacceptable! My darling refuses anything but the Gourmet sachê.' },
        { user: 'Sir Fluffy', time: '4h', text: 'The marketing scheme is genius. Bravo!' },
        { user: 'Princess Paws', time: '6h', text: 'I need answers. Where are the receipts?' }
    ];

    const container = document.getElementById('comments');
    if (!container) return;

    container.innerHTML = comments.map(c => `
        <div class="flex items-start space-x-3 bg-white p-3 rounded-lg shadow-sm">
            <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                ${c.user[0]}
            </div>
            <div class="flex-1">
                <div class="flex justify-between items-baseline">
                    <span class="text-xs font-bold text-gray-800">${c.user}</span>
                    <span class="text-[10px] text-gray-400">${c.time}</span>
                </div>
                <p class="text-xs text-gray-600 mt-1">${c.text}</p>
            </div>
        </div>
    `).join('');
}

// Initialize Service Worker
async function initServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('src/sw.js', {
                scope: '/'
            });
            console.log('✓ Service Worker registrado:', registration);
        } catch (error) {
            console.error('Erro ao registrar Service Worker:', error);
        }
    }
}

// Initialize Store
async function initStore() {
    try {
        await store.loadProducts();
        console.log('✓ Loja carregada com', store.products.length, 'produtos');
    } catch (error) {
        console.error('Erro ao carregar loja:', error);
    }
}

// Check Authentication
async function checkAuth() {
    if (api.isAuthenticated()) {
        const user = await api.getCurrentUser();
        if (user) {
            console.log('✓ Usuário autenticado:', user.name);
            return true;
        }
    }
    return false;
}

// DOMContentLoaded Event Handler
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🐾 Iniciando Patas de Elite...');
    
    // Initialize all systems
    initFollowerChart();
    initPollChart();
    renderComments();
    initServiceWorker();
    
    // Initialize e-commerce
    await initStore();
    await checkAuth();
    
    console.log('✅ Aplicação pronta!');
});
