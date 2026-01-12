<p align="center">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
</p>

# 💰 FinWallet

**Aplicativo mobile de controle financeiro pessoal** desenvolvido com React Native e Expo.

Gerencie suas finanças de forma simples e intuitiva: registre despesas, defina metas de economia, acompanhe orçamentos por categoria e visualize relatórios detalhados.

---

## 📱 Screenshots

| Dashboard | Transações | Metas | Orçamentos |
|-----------|------------|-------|------------|
| Resumo financeiro com gráficos | Lista completa de transações | Progresso visual das metas | Controle de gastos por categoria |

---

## ✨ Funcionalidades

### 💳 Gestão de Transações
- Registro rápido de receitas e despesas
- Categorização automática
- Histórico completo com filtros
- Busca por descrição ou categoria

### 🎯 Metas de Economia
- Criação de metas com prazo
- Depósitos parciais
- Progresso visual com anel animado
- Sugestão de depósito mensal

### 📊 Orçamentos
- Limite mensal por categoria
- Alertas ao atingir 80% do limite
- Barra de progresso visual
- Cópia automática do mês anterior

### 📈 Relatórios e Analytics
- Resumo mensal de receitas e despesas
- Comparativo mês a mês
- Top categorias de gastos
- Insights inteligentes

### 🔐 Segurança
- Autenticação biométrica (Face ID / Digital)
- Login seguro ao abrir o app

### 🔔 Notificações
- Lembrete diário às 20:00
- Alertas de metas próximas do vencimento

### 📤 Exportação
- Exportar transações para CSV
- Exportar metas para CSV
- Backup completo em JSON

### 🎨 Interface
- Tema claro e escuro
- Animações suaves
- Haptic feedback
- Design moderno e intuitivo

---

## 🛠️ Tecnologias

| Tecnologia | Descrição |
|------------|-----------|
| **React Native** | Framework para desenvolvimento mobile |
| **Expo** | Plataforma de desenvolvimento |
| **TypeScript** | Tipagem estática |
| **SQLite** | Banco de dados local |
| **NativeWind** | Tailwind CSS para React Native |
| **Zustand** | Gerenciamento de estado |
| **React Query** | Cache e sincronização de dados |
| **Expo Router** | Navegação baseada em arquivos |
| **Reanimated** | Animações fluidas |
| **Lucide Icons** | Biblioteca de ícones |

---

## 📁 Estrutura do Projeto

```
finwallet/
├── app/                    # Telas (Expo Router)
│   ├── (tabs)/             # Navegação por abas
│   │   ├── index.tsx       # Home/Dashboard
│   │   ├── transactions.tsx
│   │   ├── goals.tsx
│   │   └── settings.tsx
│   ├── transaction/        # Telas de transação
│   ├── goal/               # Telas de meta
│   └── budget/             # Telas de orçamento
├── components/             # Componentes reutilizáveis
│   ├── ui/                 # Componentes base (Button, Card, etc)
│   ├── charts/             # Gráficos (PieChart, BarChart)
│   └── AuthGate.tsx        # Autenticação biométrica
├── services/               # Lógica de negócio
│   ├── transactionService.ts
│   ├── goalService.ts
│   ├── budgetService.ts
│   ├── analyticsService.ts
│   └── notificationService.ts
├── stores/                 # Estado global (Zustand)
├── db/                     # Banco de dados SQLite
├── types/                  # Definições TypeScript
├── constants/              # Cores, tipografia, etc
├── providers/              # Contextos React
└── __tests__/              # Testes unitários
```

---

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Expo CLI
- Android Studio (para emulador) ou dispositivo físico

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/finwallet.git

# Entre na pasta
cd finwallet

# Instale as dependências
npm install

# Inicie o projeto
npx expo start
```

### Executando no dispositivo

**Android (Expo Go):**
1. Instale o Expo Go na Play Store
2. Escaneie o QR Code do terminal

**Android (Emulador):**
```bash
npx expo start --android
```

**iOS (Simulator):**
```bash
npx expo start --ios
```

---

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Executar com cobertura
npm run test:coverage
```

### Cobertura de Testes

| Área | Testes |
|------|--------|
| Analytics | Cálculos, formatação, insights |
| Budgets | Status, alertas, resumos |
| Goals | Progresso, dias restantes |
| Utils | Formatação, UUID, datas |

**Total: 56 testes passando ✅**

---

## 📋 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm start` | Inicia o Metro Bundler |
| `npm run android` | Inicia no Android |
| `npm run ios` | Inicia no iOS |
| `npm test` | Executa os testes |
| `npm run test:coverage` | Testes com cobertura |

---

## 🔧 Configuração

### Variáveis de Ambiente

O projeto utiliza configurações locais. Para personalizar:

```typescript
// constants/colors.ts - Cores do tema
// constants/typography.ts - Fontes e tamanhos
```

### Banco de Dados

O SQLite é inicializado automaticamente na primeira execução. O schema inclui:

- `categories` - Categorias de transações
- `transactions` - Receitas e despesas
- `goals` - Metas de economia
- `goal_deposits` - Depósitos nas metas
- `budgets` - Orçamentos mensais

---

## 👨‍💻 Autor

Desenvolvido por **Flauberth Brito Bastos Junior**

---

<p align="center">
  Feito com ❤️ usando React Native + Expo
</p>
