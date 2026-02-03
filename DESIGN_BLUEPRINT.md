# Kuiz Design Blueprint

Este documento descreve o sistema de design utilizado no **Kuiz Admin** e na **Landing Page**. O estilo é caracterizado por uma estética "Premium SaaS", minimalista, com influências do design da Apple (bento grids, glassmorphism, tipografia limpa) e toques futuristas (noise texture, gradientes sutis).

## 1. Fundamentos do Design

### Cores Principais
| Nome | Valor Hex / Tailwind | Uso |
| :--- | :--- | :--- |
| **Background Main** | `#F5F5F7` | Fundo principal de todas as páginas (Admin e Landing). |
| **Surface White** | `#FFFFFF` | Cards, Sidebar, Modais. |
| **Surface Glass** | `bg-white/50` + `backdrop-blur-xl` | Sidebar, Headers flutuantes. |
| **Text Primary** | `#1D1D1F` (ou `text-gray-900`) | Títulos, Texto principal. |
| **Text Secondary** | `#6B7280` (ou `text-gray-500`) | Subtítulos, Legendas, Ícones inativos. |
| **Accent Black** | `#000000` | Botões primários, Logos, Destaques fortes. |
| **Border Subtle** | `border-black/5` | Bordas de cards, separadores (muito sutil). |

### Texturas e Efeitos
- **Noise Overlay**: Uma textura de ruído (noise) com opacidade `0.03` e `mix-blend-multiply` é aplicada sobre o fundo `#F5F5F7` para dar uma textura orgânica e premium.
- **Glassmorphism**: Uso extensivo de `backdrop-blur-xl` ou `backdrop-blur-md` com fundos brancos translúcidos (`bg-white/50` a `bg-white/80`).
- **Sombras**: Sombras suaves e difusas (`shadow-sm`, `shadow-lg shadow-black/10`).

### Tipografia
- **Família**: Sans-serif (Inter, Geist ou similar).
- **Headings**: `font-bold`, `tracking-tight` (ou `tighter` para títulos grandes).
- **Body**: `text-sm` ou `text-base`, `text-gray-500` para descrições.

---

## 2. Componentes do Admin (Dashboard)

### Layout Geral
- **Sidebar**:
  - Largura: `w-72` (288px).
  - Estilo: `fixed`, `h-screen`, `bg-white/50`, `backdrop-blur-xl`, `border-r border-black/5`.
  - **Logo**: Quadrado preto arredondado (`rounded-xl`) com ícone branco.
  - **Item de Menu**:
    - Container: `rounded-xl`, `px-4 py-3.5`.
    - Fonte: `text-sm font-medium`.
    - Estado Normal: `text-gray-600`.
    - Hover: `hover:text-black hover:bg-white hover:shadow-sm hover:ring-1 hover:ring-black/5`.
    - Ícone: `size={20}`, `text-gray-400 group-hover:text-black`.

### Cards de Estatísticas (Stat Cards)
- **Container**: `bg-white` (ou `bg-black` para destaque), `rounded-3xl`, `p-6`, `border border-black/5`, `shadow-sm`.
- **Hover**: `hover:shadow-md transition-all duration-300`.
- **Ícone**: Dentro de um container `w-12 h-12 rounded-2xl` com cor de fundo suave (ex: `bg-blue-50`).
- **Tipografia**:
  - Label: `text-sm font-medium text-gray-500`.
  - Valor: `text-3xl font-bold tracking-tight`.

### Tabelas (Data Tables)
- **Container**: `bg-white`, `border border-black/5`, `rounded-3xl`, `shadow-sm`, `overflow-hidden`.
- **Header**: `bg-gray-50/50`, `border-b border-black/5`, `text-gray-500`, `font-medium`.
- **Células**: Espaçamento generoso (`px-8 py-4` para a primeira coluna, `px-6 py-4` para as demais).
- **Linhas**: `hover:bg-gray-50/80 transition-colors`.
- **Badges de Status**:
  - Estilo: `rounded-full`, `px-2.5 py-0.5`, `text-xs font-medium`, `border`.
  - Exemplo (Pago): `bg-green-50 text-green-700 border-green-100`.
  - Dot indicador: `w-1.5 h-1.5 rounded-full bg-green-500`.

---

## 3. Componentes da Landing Page

### Hero Section
- **Título**: Gigante (`text-5xl` a `text-8xl`), `font-bold`, `tracking-tighter`.
- **Efeito de Texto**: Gradiente vertical (`bg-gradient-to-b from-black via-gray-800 to-gray-500`).
- **Botões (CTA)**:
  - Primário: `rounded-full`, `bg-black`, `text-white`, `shadow-xl shadow-black/20`.
  - Secundário: `rounded-full`, `bg-white`, `border border-black/5`, `text-black`.
  - Hover: `hover:scale-105 transition-transform`.

### Bento Grid (Features)
- **Cards**: `rounded-3xl`, `p-8` ou `p-12`.
- **Cores**: `bg-[#F5F5F7]` (cinza muito claro) ou `bg-black` (destaque escuro).
- **Hover**: `hover:shadow-2xl transition-shadow`.

### Pricing Cards
- **Container**: `rounded-3xl`, `p-8`, `border border-black/5`.
- **Destaque (Pro)**: `bg-black text-white`, `shadow-2xl`.
- **Normal**: `bg-white`, `shadow-lg`.

---

## 4. Código de Referência (Snippets)

### Background com Noise
```jsx
<div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans">
    <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0 mix-blend-multiply"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
    </div>
    {/* Conteúdo */}
</div>
```

### Sidebar Item
```jsx
<Link href={href} className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-gray-600 hover:text-black hover:bg-white hover:shadow-sm hover:ring-1 hover:ring-black/5 transition-all duration-200 group">
    <span className="text-gray-400 group-hover:text-black transition-colors">{icon}</span>
    {label}
</Link>
```

### Tabela Clean
```jsx
<div className="bg-white border border-black/5 rounded-3xl shadow-sm overflow-hidden">
    <table className="w-full text-sm text-left">
        <thead className="bg-gray-50/50 border-b border-black/5 text-gray-500 font-medium">
            <tr>
                <th className="px-8 py-4">Coluna 1</th>
                <th className="px-6 py-4">Coluna 2</th>
            </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
            <tr className="hover:bg-gray-50/80 transition-colors">
                <td className="px-8 py-4">Dado 1</td>
                <td className="px-6 py-4">Dado 2</td>
            </tr>
        </tbody>
    </table>
</div>
```
