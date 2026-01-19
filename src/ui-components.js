/**
 * Componentes UI para a Loja - Patas de Elite
 * Renderiza produtos, carrinho e autenticação
 */

// ===== COMPONENTES DE AUTENTICAÇÃO =====

class AuthUI {
    static renderLoginForm() {
        return `
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" id="authModal">
                <div class="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl">
                    <h2 class="text-2xl font-serif text-gold mb-6">Faça Login</h2>
                    <form id="loginForm" class="space-y-4">
                        <div>
                            <input type="email" id="loginEmail" placeholder="Email" required 
                                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gold">
                        </div>
                        <div>
                            <input type="password" id="loginPassword" placeholder="Senha" required 
                                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gold">
                        </div>
                        <button type="submit" class="w-full bg-gold text-white py-2 rounded-lg font-bold hover:bg-yellow-700">
                            Login
                        </button>
                        <button type="button" onclick="AuthUI.switchToRegister()" class="w-full text-sm text-gold">
                            Não tem conta? Registre-se
                        </button>
                    </form>
                </div>
            </div>
        `;
    }

    static renderRegisterForm() {
        return `
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" id="authModal">
                <div class="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl">
                    <h2 class="text-2xl font-serif text-gold mb-6">Registre-se</h2>
                    <form id="registerForm" class="space-y-4">
                        <div>
                            <input type="text" id="registerName" placeholder="Nome" required 
                                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gold">
                        </div>
                        <div>
                            <input type="email" id="registerEmail" placeholder="Email" required 
                                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gold">
                        </div>
                        <div>
                            <input type="password" id="registerPassword" placeholder="Senha" required 
                                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gold">
                        </div>
                        <div>
                            <input type="text" id="registerPetName" placeholder="Nome do Pet" 
                                   class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gold">
                        </div>
                        <button type="submit" class="w-full bg-pink text-white py-2 rounded-lg font-bold hover:bg-pink-600">
                            Registrar
                        </button>
                        <button type="button" onclick="AuthUI.switchToLogin()" class="w-full text-sm text-gold">
                            Já tem conta? Faça login
                        </button>
                    </form>
                </div>
            </div>
        `;
    }

    static switchToLogin() {
        const modal = document.getElementById('authModal');
        modal.innerHTML = this.renderLoginForm().replace(/<[^>]*>/g, '').replace(/\s+/g, ' ');
        modal.parentElement.innerHTML = this.renderLoginForm();
    }

    static switchToRegister() {
        const modal = document.getElementById('authModal');
        modal.parentElement.innerHTML = this.renderRegisterForm();
    }
}

// ===== COMPONENTES DE PRODUTOS =====

class ProductUI {
    static renderProductCard(product) {
        return `
            <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition p-4">
                <div class="h-40 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                    <span class="text-gray-400 font-serif text-xl">${product.category}</span>
                </div>
                <h3 class="font-serif text-lg text-gold mb-2">${product.name}</h3>
                <p class="text-sm text-gray-600 mb-2 line-clamp-2">${product.description || ''}</p>
                <p class="text-pink font-bold mb-4">R$ ${product.price.toFixed(2)}</p>
                <p class="text-xs text-gray-500 mb-3">Estoque: ${product.quantity_in_stock}</p>
                <button class="w-full bg-gold text-white py-2 rounded-lg hover:bg-yellow-700 font-bold text-sm"
                        onclick="store.addToCart(${product.id}, 1); alert('Adicionado ao carrinho!')">
                    Adicionar ao Carrinho
                </button>
            </div>
        `;
    }

    static renderProductGrid(products) {
        if (!products || products.length === 0) {
            return '<p class="col-span-full text-center text-gray-500">Nenhum produto encontrado</p>';
        }
        return products.map(p => this.renderProductCard(p)).join('');
    }
}

// ===== COMPONENTES DE CARRINHO =====

class CartUI {
    static renderCartSidebar() {
        const cart = store.getCart();
        const total = store.getCartTotal();
        const itemCount = store.getCartItemCount();

        return `
            <div class="bg-white rounded-lg shadow-lg p-6">
                <h2 class="text-2xl font-serif text-gold mb-4">🛒 Carrinho (${itemCount})</h2>
                ${cart.length === 0 ? '<p class="text-gray-500">Carrinho vazio</p>' : `
                    <div class="space-y-3 max-h-60 overflow-y-auto mb-4">
                        ${cart.map(item => `
                            <div class="flex justify-between items-center bg-gray-50 p-3 rounded">
                                <div class="flex-1">
                                    <p class="font-semibold text-sm">${item.name}</p>
                                    <p class="text-xs text-gray-600">x${item.quantity} - R$ ${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                                <button onclick="store.removeFromCart(${item.product_id}); location.reload();" class="text-red-500 text-xs">
                                    ✕
                                </button>
                            </div>
                        `).join('')}
                    </div>
                    <div class="border-t pt-4 mb-4">
                        <p class="flex justify-between font-bold text-lg">
                            <span>Total:</span>
                            <span class="text-pink">R$ ${total.toFixed(2)}</span>
                        </p>
                    </div>
                    <button class="w-full bg-pink text-white py-3 rounded-lg font-bold hover:bg-pink-600"
                            onclick="checkout()">
                        Finalizar Compra
                    </button>
                `}
            </div>
        `;
    }
}

// ===== COMPONENTES DE PERFIL =====

class ProfileUI {
    static renderUserProfile(user) {
        return `
            <div class="bg-white rounded-lg shadow-lg p-6">
                <h2 class="text-2xl font-serif text-gold mb-4">👤 Meu Perfil</h2>
                <div class="space-y-2 mb-4">
                    <p><strong>Nome:</strong> ${user.name}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                    ${user.pet_name ? `<p><strong>Pet:</strong> ${user.pet_name}</p>` : ''}
                </div>
                <button onclick="logout()" class="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600">
                    Sair
                </button>
            </div>
        `;
    }

    static renderOrderHistory(orders) {
        return `
            <div class="bg-white rounded-lg shadow-lg p-6">
                <h2 class="text-2xl font-serif text-gold mb-4">📋 Meus Pedidos</h2>
                ${orders.length === 0 ? '<p class="text-gray-500">Nenhum pedido realizado</p>' : `
                    <div class="space-y-3">
                        ${orders.map(order => `
                            <div class="border rounded-lg p-3 hover:bg-gray-50">
                                <p class="font-semibold">Pedido #${order.id}</p>
                                <p class="text-sm text-gray-600">${new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
                                <p class="text-pink font-bold">R$ ${order.total_price.toFixed(2)}</p>
                                <p class="text-xs text-gray-500">Status: ${order.status}</p>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        `;
    }
}

// ===== FUNÇÕES DE AÇÃO =====

async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        await api.login(email, password);
        document.getElementById('authModal').remove();
        location.reload();
    } catch (error) {
        alert('Erro ao fazer login: ' + error.message);
    }
}

async function register() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const petName = document.getElementById('registerPetName').value;
    
    try {
        await api.register(email, password, name, petName);
        alert('Registro realizado com sucesso! Faça login agora.');
        AuthUI.switchToLogin();
    } catch (error) {
        alert('Erro ao registrar: ' + error.message);
    }
}

async function checkout() {
    if (!api.isAuthenticated()) {
        alert('Por favor, faça login primeiro');
        return;
    }

    try {
        const order = await store.checkout();
        alert(`Pedido criado com sucesso! ID: ${order.id}`);
        location.reload();
    } catch (error) {
        alert('Erro ao finalizar compra: ' + error.message);
    }
}

function logout() {
    api.logout();
    location.reload();
}
