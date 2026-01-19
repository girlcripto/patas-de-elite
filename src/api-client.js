/**
 * Cliente API - Patas de Elite
 * Integração com o backend para autenticação e compras
 */

class PatasAPIClient {
    constructor(baseURL = 'http://localhost:5000') {
        this.baseURL = baseURL;
        this.token = localStorage.getItem('patas_token');
    }

    // ===== AUTENTICAÇÃO =====

    async register(email, password, name, petName) {
        try {
            const response = await fetch(`${this.baseURL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name, pet_name: petName })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            return data;
        } catch (error) {
            console.error('Erro ao registrar:', error);
            throw error;
        }
    }

    async login(email, password) {
        try {
            const response = await fetch(`${this.baseURL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            
            // Salvar token
            this.token = data.token;
            localStorage.setItem('patas_token', data.token);
            localStorage.setItem('patas_user', JSON.stringify(data.user));
            
            return data;
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            throw error;
        }
    }

    async getCurrentUser() {
        if (!this.token) return null;
        try {
            const response = await fetch(`${this.baseURL}/api/auth/me`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            return data;
        } catch (error) {
            console.error('Erro ao buscar usuário atual:', error);
            return null;
        }
    }

    logout() {
        this.token = null;
        localStorage.removeItem('patas_token');
        localStorage.removeItem('patas_user');
    }

    // ===== PRODUTOS =====

    async getAllProducts() {
        try {
            const response = await fetch(`${this.baseURL}/api/products`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            return data;
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            return [];
        }
    }

    async getProduct(id) {
        try {
            const response = await fetch(`${this.baseURL}/api/products/${id}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            return data;
        } catch (error) {
            console.error('Erro ao buscar produto:', error);
            return null;
        }
    }

    async createProduct(product) {
        if (!this.token) throw new Error('Não autenticado');
        try {
            const response = await fetch(`${this.baseURL}/api/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(product)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            return data;
        } catch (error) {
            console.error('Erro ao criar produto:', error);
            throw error;
        }
    }

    async updateProduct(id, product) {
        if (!this.token) throw new Error('Não autenticado');
        try {
            const response = await fetch(`${this.baseURL}/api/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(product)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            return data;
        } catch (error) {
            console.error('Erro ao atualizar produto:', error);
            throw error;
        }
    }

    // ===== PEDIDOS =====

    async createOrder(items) {
        if (!this.token) throw new Error('Não autenticado');
        try {
            const response = await fetch(`${this.baseURL}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ items })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            return data;
        } catch (error) {
            console.error('Erro ao criar pedido:', error);
            throw error;
        }
    }

    async getUserOrders() {
        if (!this.token) throw new Error('Não autenticado');
        try {
            const response = await fetch(`${this.baseURL}/api/orders`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            return data;
        } catch (error) {
            console.error('Erro ao buscar pedidos:', error);
            return [];
        }
    }

    async getOrder(id) {
        if (!this.token) throw new Error('Não autenticado');
        try {
            const response = await fetch(`${this.baseURL}/api/orders/${id}`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            return data;
        } catch (error) {
            console.error('Erro ao buscar pedido:', error);
            return null;
        }
    }

    isAuthenticated() {
        return !!this.token;
    }

    getStoredUser() {
        const user = localStorage.getItem('patas_user');
        return user ? JSON.parse(user) : null;
    }
}

// Instância global
const api = new PatasAPIClient();
