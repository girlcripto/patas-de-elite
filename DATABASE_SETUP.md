# 🐾 Patas de Elite - Loja de Rações com Sistema de Autenticação

Sistema completo de e-commerce para venda de rações premium para gatos, com autenticação de usuários e gerenciamento de pedidos.

## 📋 Funcionalidades

### 🔐 Autenticação & Usuários
- Registro e login de usuários
- Autenticação JWT segura
- Hash de senhas com bcryptjs
- Perfil do usuário com informações do pet

### 🛒 Loja de Rações
- Catálogo de produtos com categorias
- Carrinho de compras persistente (localStorage)
- Sistema de pedidos
- Histórico de compras

### 📊 Banco de Dados
- SQLite para armazenamento local
- 4 tabelas principais: users, products, orders, order_items
- Transações seguras

## 🏗️ Arquitetura

```
patas-de-elite/
├── server/
│   ├── server.js          # API REST com Express
│   └── init-db.js         # Inicialização do banco
├── src/
│   ├── app.js             # App JavaScript principal
│   ├── api-client.js      # Cliente API
│   ├── store.js           # Gerenciador de loja
│   ├── sw.js              # Service Worker
│   └── ui-components.js   # Componentes UI
├── db/
│   └── patas-de-elite.db  # Banco SQLite (criado ao executar)
├── index.html             # Página principal
├── build.js               # Build system
├── package.json           # Dependências
└── .env.example           # Variáveis de ambiente
```

## 🚀 Instalação

### 1. Clonar e instalar dependências
```bash
git clone <seu-repo>
cd patas-de-elite
npm install
```

### 2. Inicializar o banco de dados
```bash
npm run init-db
```

Isso criará:
- Tabelas: `users`, `products`, `orders`, `order_items`
- 6 produtos de exemplo
- Banco SQLite em `db/patas-de-elite.db`

### 3. Configurar variáveis de ambiente (opcional)
```bash
cp .env.example .env
```

Editar `.env` conforme necessário:
```
PORT=5000
JWT_SECRET=sua-chave-secreta
NODE_ENV=development
```

## 🎮 Como Usar

### Iniciar o servidor (modo desenvolvimento)
```bash
npm run server:dev
```

Servidor rodará em: `http://localhost:5000`

### Iniciar com watch mode (recompila no save)
```bash
npm run dev:full
```

Isso inicia simultaneamente:
- Servidor Node.js com nodemon
- Frontend com auto-rebuild

### Build e servir
```bash
npm start
```

## 📡 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Fazer login
- `GET /api/auth/me` - Obter usuário atual

### Produtos
- `GET /api/products` - Listar todos
- `GET /api/products/:id` - Obter por ID
- `POST /api/products` - Criar (requer auth)
- `PUT /api/products/:id` - Atualizar (requer auth)
- `DELETE /api/products/:id` - Deletar (requer auth)

### Pedidos
- `POST /api/orders` - Criar pedido
- `GET /api/orders` - Listar meus pedidos
- `GET /api/orders/:id` - Obter detalhes do pedido

## 💾 Estrutura do Banco de Dados

### users
```sql
id (PK), email (UNIQUE), password, name, pet_name, created_at, updated_at
```

### products
```sql
id (PK), name, description, price, quantity_in_stock, category, image_url, created_at, updated_at
```

### orders
```sql
id (PK), user_id (FK), total_price, status, created_at
```

### order_items
```sql
id (PK), order_id (FK), product_id (FK), quantity, price_at_time
```

## 📦 Dependências Backend

- **express** - Framework web
- **sqlite3** - Banco de dados
- **jsonwebtoken** - Autenticação JWT
- **bcryptjs** - Hash de senhas
- **cors** - Cross-Origin Resource Sharing
- **dotenv** - Variáveis de ambiente

## 🔧 Desenvolvimento

### Estrutura de Pastas
- `server/` - Backend (Express + SQLite)
- `src/` - Frontend (JavaScript, API client, Store, UI)
- `db/` - Banco de dados (criado automaticamente)
- `build.js` - Script de build

### Frontend Files
- `api-client.js` - Cliente HTTP para API
- `store.js` - Gerenciador de carrinho e loja
- `ui-components.js` - Componentes UI React-like
- `app.js` - Aplicação principal
- `sw.js` - Service Worker (offline)

## 🔒 Segurança

- Senhas hashadas com bcryptjs
- Autenticação JWT com expiração (7 dias)
- CORS habilitado
- Transações no banco para operações críticas

## 📝 Exemplos de Uso

### Registrar Usuário
```javascript
await api.register('gato@patas.com', 'senha123', 'Maria', 'Fluffy');
```

### Fazer Login
```javascript
const response = await api.login('gato@patas.com', 'senha123');
console.log(response.token); // Token JWT
```

### Adicionar ao Carrinho
```javascript
store.addToCart(1, 2); // Produto ID 1, quantidade 2
```

### Finalizar Compra
```javascript
const order = await store.checkout();
console.log(order.id); // ID do pedido
```

### Listar Pedidos
```javascript
const orders = await api.getUserOrders();
```

## 🐛 Troubleshooting

### Erro "SQLITE_CANTOPEN"
- Certifique-se que a pasta `db/` existe
- Execute `npm run init-db`

### Erro ao conectar API
- Verifique se o servidor está rodando em `http://localhost:5000`
- Verifique variáveis de ambiente em `.env`

### Token expirado
- Faça login novamente
- O token expira após 7 dias

## 📄 Licença

MIT

## 👥 Contribuições

Faça um fork do projeto e envie suas melhorias!

---

**Patas de Elite - O Escândalo do Sachê Gourmet 🎭**
