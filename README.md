# TodoList FullStack

Aplicação web de gerenciamento de tarefas desenvolvida com **React, TypeScript, Node.js, Express, Prisma e PostgreSQL**. O projeto permite organizar tarefas, acompanhar prazos e visualizar atividades em diferentes áreas da aplicação.

## 📸 Screenshots

### 1. Dashboard

Tela principal da aplicação, com uma visão geral das tarefas e opções de navegação.

![Dashboard](docs/images/1.png)

---

### 2. Upcoming

Tela de tarefas futuras, permitindo visualizar as atividades programadas.

![Upcoming](docs/images/2.png)

---

### 3. Criação de nova tarefa

Tela Upcoming com o modal de criação de uma nova tarefa.

![Modal de criação de tarefa](docs/images/3.png)

---

### 4. Today

Tela dedicada às tarefas do dia, facilitando o acompanhamento das atividades diárias.

![Today](docs/images/4.png)

---

### 5. Calendar

Visualização do calendário para organizar e acompanhar tarefas por data.

![Calendar](docs/images/5.png)

---

### 6. Calendar — Day

Visualização diária do calendário, com foco nas tarefas e atividades de um dia específico.

![Calendar Day](docs/images/6.png)

---

### 7. Calendar — Week

Visualização semanal do calendário para acompanhar as tarefas distribuídas ao longo da semana.

![Calendar Week](docs/images/7.png)

---

### 8. Calendar — Month

Visualização mensal do calendário para consultar e organizar atividades ao longo do mês.

![Calendar Month](docs/images/8.png)

---

### 9. Lists

Área de listas personalizadas para organizar tarefas por categorias.

![Lists](docs/images/9.png)

---

### 10. Priority

Área de organização e visualização das tarefas por nível de prioridade.

![Priority](docs/images/10.png)

---

### 11. Tags

Área de etiquetas para categorizar e identificar tarefas.

![Tags](docs/images/11.png)

---

## 🚀 Tecnologias utilizadas

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS

### Backend
- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT para autenticação
- bcrypt para criptografia de senhas

## ⚙️ Funcionalidades

- Cadastro e login de usuários.
- Autenticação por token JWT.
- Criação, edição e exclusão de tarefas.
- Organização de tarefas por data e prioridade.
- Criação e gerenciamento de listas personalizadas.
- Criação e gerenciamento de tags.
- Visualização de tarefas por períodos e categorias.
- Calendário com visualizações diária, semanal e mensal.
- Persistência dos dados em PostgreSQL.

## 🛠️ Como executar o projeto

### Pré-requisitos

- Node.js e npm.
- PostgreSQL.
- Git.

### 1. Clonar o repositório

```bash
git clone https://github.com/davidsantoszx/to-do-list.git
cd to-do-list
```

### 2. Configurar o backend

```bash
cd backend
npm install
```

Configure o arquivo `.env` do backend com as credenciais do PostgreSQL e as variáveis exigidas pela aplicação, incluindo `DATABASE_URL` e `JWT_SECRET`.

Exemplo ilustrativo:

```env
DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/todolist_db?schema=public"
JWT_SECRET="sua_chave_secreta"
PORT=3000
```

Execute as migrações do Prisma:

```bash
npx prisma migrate deploy
```

Inicie o servidor:

```bash
npm run dev
```

O backend estará disponível em `http://localhost:3000`.

### 3. Configurar o frontend

Em outro terminal:

```bash
cd frontend
npm install
```

Crie o arquivo `.env` na pasta `frontend`:

```env
VITE_API_URL=http://localhost:3000/api
```

Inicie o frontend:

```bash
npm run dev
```

Acesse o endereço exibido pelo Vite, normalmente `http://localhost:5173`.

## 📁 Estrutura do projeto

```text
to-do-list/
├── backend/
│   ├── prisma/
│   └── src/
├── frontend/
│   └── src/
├── docs/
│   └── images/
│       ├── 1.png
│       ├── 2.png
│       ├── ...
│       └── 11.png
└── README.md
```

## 🔐 Segurança

- Senhas armazenadas com hash.
- Rotas protegidas por autenticação JWT.
- Dados associados ao usuário autenticado.
- Configurações e credenciais mantidas em variáveis de ambiente.

## 👨‍💻 Autor

**David Santos**

- GitHub: [@davidsantoszx](https://github.com/davidsantoszx)
