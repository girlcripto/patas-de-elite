/**
 * Store Management - Gestão da loja de rações
 */

class PatasStore {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('patas_cart')) || [];
        this.loadProducts();
    }

    // Carregar produtos
    async loadProducts() {
        try {
            this.products = await api.getAllProducts();
            console.log('✓ Produtos carregados:', this.products.length);
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            this.products = [];
        }
    }

    // Adicionar ao carrinho
    addToCart(productId, quantity = 1) {
        const product = this.products.find(p => p.id === productId);
        if (!product) {
            console.error('Produto não encontrado');
            return false;
        }

        const cartItem = this.cart.find(item => item.product_id === productId);
        if (cartItem) {
            cartItem.quantity += quantity;
        } else {
            this.cart.push({
                product_id: productId,
                name: product.name,
                price: product.price,
                quantity: quantity
            });
        }

        this.saveCart();
        console.log(`✓ ${product.name} adicionado ao carrinho`);
        return true;
    }

    // Remover do carrinho
    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.product_id !== productId);
        this.saveCart();
    }

    // Atualizar quantidade no carrinho
    updateCartQuantity(productId, quantity) {
        const item = this.cart.find(item => item.product_id === productId);
        if (item) {
            item.quantity = Math.max(1, quantity);
            this.saveCart();
        }
    }

    // Limpar carrinho
    clearCart() {
        this.cart = [];
        this.saveCart();
    }

    // Salvar carrinho no localStorage
    saveCart() {
        localStorage.setItem('patas_cart', JSON.stringify(this.cart));
    }

    // Obter carrinho
    getCart() {
        return this.cart;
    }

    // Calcular total
    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Obter quantidade de itens no carrinho
    getCartItemCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }

    // Confirmar pedido
    async checkout() {
        if (!api.isAuthenticated()) {
            throw new Error('Você precisa estar autenticado');
        }

        if (this.cart.length === 0) {
            throw new Error('Carrinho vazio');
        }

        try {
            const items = this.cart.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity
            }));

            const order = await api.createOrder(items);
            this.clearCart();
            return order;
        } catch (error) {
            throw error;
        }
    }

    // Filtrar produtos por categoria
    filterByCategory(category) {
        return this.products.filter(p => p.category === category);
    }

    // Buscar produtos
    searchProducts(query) {
        const q = query.toLowerCase();
        return this.products.filter(p => 
            p.name.toLowerCase().includes(q) || 
            p.description.toLowerCase().includes(q)
        );
    }

    // Obter categorias únicas
    getCategories() {
        return [...new Set(this.products.map(p => p.category))];
    }
}

// Instância global
const store = new PatasStore();
