/**
 * Servidor Principal - Patas de Elite
 * API REST com Express e SQLite para gerenciar usuários e loja de rações
 */

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'patas-de-elite-secret-key-2026';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Database Setup
const db = new sqlite3.Database(path.join(__dirname, '../db/patas-de-elite.db'), (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco:', err.message);
    } else {
        console.log('✅ Conectado ao banco SQLite');
        initDatabase();
    }
});

// Initialize Database Tables
function initDatabase() {
    db.serialize(() => {
        // Users Table
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                name TEXT NOT NULL,
                pet_name TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) console.error('Erro ao criar tabela users:', err);
            else console.log('✓ Tabela users criada/verificada');
        });

        // Products Table (Rações)
        db.run(`
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                price REAL NOT NULL,
                quantity_in_stock INTEGER DEFAULT 0,
                category TEXT,
                image_url TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) console.error('Erro ao criar tabela products:', err);
            else console.log('✓ Tabela products criada/verificada');
        });

        // Orders Table
        db.run(`
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                total_price REAL NOT NULL,
                status TEXT DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        `, (err) => {
            if (err) console.error('Erro ao criar tabela orders:', err);
            else console.log('✓ Tabela orders criada/verificada');
        });

        // Order Items Table
        db.run(`
            CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                price_at_time REAL NOT NULL,
                FOREIGN KEY(order_id) REFERENCES orders(id),
                FOREIGN KEY(product_id) REFERENCES products(id)
            )
        `, (err) => {
            if (err) console.error('Erro ao criar tabela order_items:', err);
            else console.log('✓ Tabela order_items criada/verificada');
        });

        // Insert sample products
        db.run(`SELECT COUNT(*) as count FROM products`, (err, row) => {
            if (row && row.count === 0) {
                const sampleProducts = [
                    { name: 'Sachê Gourmet Premium', description: 'O sachê exclusivo da Patas de Elite', price: 45.90, quantity: 100, category: 'Premium' },
                    { name: 'Ração Royal Canine', description: 'Ração completa e balanceada', price: 120.00, quantity: 50, category: 'Premium' },
                    { name: 'Ração Whiskas Classic', description: 'Ração com frango e legumes', price: 28.50, quantity: 150, category: 'Padrão' },
                    { name: 'Petiscos Natural Gourmet', description: 'Petiscos naturais sem aditivos', price: 32.00, quantity: 80, category: 'Petiscos' },
                    { name: 'Snack de Frango Desfiado', description: 'Petisco proteico', price: 24.90, quantity: 120, category: 'Petiscos' }
                ];

                sampleProducts.forEach(product => {
                    db.run(
                        `INSERT INTO products (name, description, price, quantity_in_stock, category) VALUES (?, ?, ?, ?, ?)`,
                        [product.name, product.description, product.price, product.quantity, product.category]
                    );
                });
                console.log('✓ Produtos iniciais inseridos');
            }
        });
    });
}

// Auth Middleware
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token não fornecido' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido' });
    }
};

// ===== ROTAS DE AUTENTICAÇÃO =====

// Register
app.post('/api/auth/register', async (req, res) => {
    const { email, password, name, pet_name } = req.body;

    if (!email || !password || !name) {
        return res.status(400).json({ error: 'Email, senha e nome são obrigatórios' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run(
            `INSERT INTO users (email, password, name, pet_name) VALUES (?, ?, ?, ?)`,
            [email, hashedPassword, name, pet_name],
            (err) => {
                if (err) {
                    if (err.message.includes('UNIQUE')) {
                        return res.status(400).json({ error: 'Email já cadastrado' });
                    }
                    return res.status(500).json({ error: 'Erro ao cadastrar usuário' });
                }
                res.status(201).json({ message: 'Usuário cadastrado com sucesso' });
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Erro no servidor' });
    }
});

// Login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Erro no servidor' });
        }

        if (!user) {
            return res.status(401).json({ error: 'Email ou senha inválidos' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Email ou senha inválidos' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login realizado com sucesso',
            token,
            user: { id: user.id, email: user.email, name: user.name, pet_name: user.pet_name }
        });
    });
});

// Get Current User
app.get('/api/auth/me', authMiddleware, (req, res) => {
    db.get('SELECT id, email, name, pet_name FROM users WHERE id = ?', [req.user.id], (err, user) => {
        if (err) return res.status(500).json({ error: 'Erro no servidor' });
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
        res.json(user);
    });
});

// ===== ROTAS DE PRODUTOS =====

// Get All Products
app.get('/api/products', (req, res) => {
    db.all('SELECT * FROM products', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao buscar produtos' });
        }
        res.json(rows);
    });
});

// Get Product by ID
app.get('/api/products/:id', (req, res) => {
    db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao buscar produto' });
        }
        if (!row) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }
        res.json(row);
    });
});

// Create Product (Admin)
app.post('/api/products', authMiddleware, (req, res) => {
    const { name, description, price, quantity_in_stock, category } = req.body;

    if (!name || !price) {
        return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
    }

    db.run(
        `INSERT INTO products (name, description, price, quantity_in_stock, category) VALUES (?, ?, ?, ?, ?)`,
        [name, description, price, quantity_in_stock || 0, category],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Erro ao criar produto' });
            }
            res.status(201).json({ id: this.lastID, message: 'Produto criado com sucesso' });
        }
    );
});

// Update Product (Admin)
app.put('/api/products/:id', authMiddleware, (req, res) => {
    const { name, description, price, quantity_in_stock, category } = req.body;

    db.run(
        `UPDATE products SET name = ?, description = ?, price = ?, quantity_in_stock = ?, category = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [name, description, price, quantity_in_stock, category, req.params.id],
        (err) => {
            if (err) {
                return res.status(500).json({ error: 'Erro ao atualizar produto' });
            }
            res.json({ message: 'Produto atualizado com sucesso' });
        }
    );
});

// Delete Product (Admin)
app.delete('/api/products/:id', authMiddleware, (req, res) => {
    db.run('DELETE FROM products WHERE id = ?', [req.params.id], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao deletar produto' });
        }
        res.json({ message: 'Produto deletado com sucesso' });
    });
});

// ===== ROTAS DE PEDIDOS =====

// Create Order
app.post('/api/orders', authMiddleware, (req, res) => {
    const { items } = req.body; // items: [{ product_id, quantity }]

    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Pedido deve conter itens' });
    }

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        let totalPrice = 0;
        let processedItems = 0;

        items.forEach((item, index) => {
            db.get('SELECT price FROM products WHERE id = ?', [item.product_id], (err, product) => {
                if (err || !product) {
                    db.run('ROLLBACK');
                    return res.status(400).json({ error: 'Produto não encontrado' });
                }

                totalPrice += product.price * item.quantity;
                processedItems++;

                if (processedItems === items.length) {
                    db.run(
                        'INSERT INTO orders (user_id, total_price) VALUES (?, ?)',
                        [req.user.id, totalPrice],
                        function(err) {
                            if (err) {
                                db.run('ROLLBACK');
                                return res.status(500).json({ error: 'Erro ao criar pedido' });
                            }

                            const orderId = this.lastID;

                            items.forEach((item) => {
                                db.run(
                                    'INSERT INTO order_items (order_id, product_id, quantity, price_at_time) VALUES (?, ?, ?, ?)',
                                    [orderId, item.product_id, item.quantity, product.price]
                                );
                            });

                            db.run('COMMIT', (err) => {
                                if (err) {
                                    return res.status(500).json({ error: 'Erro ao confirmar pedido' });
                                }
                                res.status(201).json({ id: orderId, total_price: totalPrice, message: 'Pedido criado com sucesso' });
                            });
                        }
                    );
                }
            });
        });
    });
});

// Get User Orders
app.get('/api/orders', authMiddleware, (req, res) => {
    db.all(
        `SELECT o.*, 
                (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
         FROM orders o WHERE user_id = ? ORDER BY o.created_at DESC`,
        [req.user.id],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: 'Erro ao buscar pedidos' });
            }
            res.json(rows);
        }
    );
});

// Get Order Details
app.get('/api/orders/:id', authMiddleware, (req, res) => {
    db.get('SELECT * FROM orders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], (err, order) => {
        if (err) return res.status(500).json({ error: 'Erro ao buscar pedido' });
        if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });

        db.all('SELECT oi.*, p.name, p.category FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?', [req.params.id], (err, items) => {
            if (err) return res.status(500).json({ error: 'Erro ao buscar itens' });
            res.json({ ...order, items });
        });
    });
});

// Server Start
app.listen(PORT, () => {
    console.log(`
🐾 Servidor Patas de Elite rodando em: http://localhost:${PORT}
📊 Banco de Dados: SQLite
🔐 Autenticação: JWT
🛒 Loja de Rações: Ativa
    `);
});

module.exports = app;
