/**
 * Script para inicializar o banco de dados
 * Execute com: node server/init-db.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../db/patas-de-elite.db'));

db.serialize(() => {
    console.log('🔧 Inicializando banco de dados...\n');

    // Limpar tabelas existentes (opcional)
    db.run('DROP TABLE IF EXISTS order_items');
    db.run('DROP TABLE IF EXISTS orders');
    db.run('DROP TABLE IF EXISTS products');
    db.run('DROP TABLE IF EXISTS users');

    // Criar tabelas
    db.run(`
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            pet_name TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, () => console.log('✓ Tabela "users" criada'));

    db.run(`
        CREATE TABLE products (
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
    `, () => console.log('✓ Tabela "products" criada'));

    db.run(`
        CREATE TABLE orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            total_price REAL NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    `, () => console.log('✓ Tabela "orders" criada'));

    db.run(`
        CREATE TABLE order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            price_at_time REAL NOT NULL,
            FOREIGN KEY(order_id) REFERENCES orders(id),
            FOREIGN KEY(product_id) REFERENCES products(id)
        )
    `, () => console.log('✓ Tabela "order_items" criada'));

    // Inserir produtos de exemplo
    const products = [
        { name: 'Sachê Gourmet Premium', description: 'O sachê exclusivo da Patas de Elite', price: 45.90, quantity: 100, category: 'Premium' },
        { name: 'Ração Royal Canine', description: 'Ração completa e balanceada para gatos', price: 120.00, quantity: 50, category: 'Premium' },
        { name: 'Ração Whiskas Classic', description: 'Ração com frango e legumes', price: 28.50, quantity: 150, category: 'Padrão' },
        { name: 'Petiscos Natural Gourmet', description: 'Petiscos naturais sem aditivos', price: 32.00, quantity: 80, category: 'Petiscos' },
        { name: 'Snack de Frango Desfiado', description: 'Petisco proteico de alta qualidade', price: 24.90, quantity: 120, category: 'Petiscos' },
        { name: 'Ração Special Care', description: 'Para gatos com necessidades especiais', price: 95.00, quantity: 40, category: 'Medicinal' }
    ];

    products.forEach(product => {
        db.run(
            `INSERT INTO products (name, description, price, quantity_in_stock, category) VALUES (?, ?, ?, ?, ?)`,
            [product.name, product.description, product.price, product.quantity, product.category]
        );
    });

    console.log('\n✓ Produtos iniciais inseridos');
    console.log('\n✅ Banco de dados inicializado com sucesso!\n');
});

db.close();
