# 🔧 Soluções para Problemas Identificados

## 1. ❌ Problema: Z-index do Editor de Texto

### Causa:
O RichTextEditor e outros componentes de edição estão aparecendo atrás do painel esquerdo.

### Solução:
Adicionar `z-index` mais alto nos componentes de edição e garantir que o PropertiesPanel tenha z-index correto.

**Arquivo:** `src/components/builder/RichTextEditor.tsx`
- Adicionar `relative z-50` no container do editor

**Arquivo:** `src/components/builder/PropertiesPanel.tsx`  
- Já tem `z-20`, mas precisa garantir que elementos internos tenham z-index adequado

---

## 2. 📁 Problema: Upload de Imagens em Produção

### Causa:
As imagens estão sendo salvas como Base64 no banco de dados, o que:
- Aumenta muito o tamanho do banco
- Pode causar erros de limite de tamanho
- Não é escalável

### Solução: Usar Cloudinary (Grátis)

**Cloudinary oferece:**
- ✅ 25GB de armazenamento grátis
- ✅ 25GB de banda mensal grátis
- ✅ Otimização automática de imagens
- ✅ CDN global
- ✅ Transformações de imagem

### Implementação:

#### Passo 1: Criar conta no Cloudinary
1. Acesse: https://cloudinary.com/users/register/free
2. Crie uma conta gratuita
3. Anote suas credenciais:
   - Cloud Name
   - API Key
   - API Secret

#### Passo 2: Adicionar variáveis de ambiente
```env
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret
```

#### Passo 3: Instalar dependência
```bash
npm install cloudinary
```

#### Passo 4: Criar API de Upload
Criar arquivo: `app/api/upload/route.ts`

```typescript
import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Converter para buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload para Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'kuiz-uploads',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return NextResponse.json({ url: (result as any).secure_url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
```

#### Passo 5: Atualizar componente de upload de imagem
Modificar `ImageUploadWithPreview.tsx` para usar a nova API.

---

## 3. ⏱️ Problema: Timer para Botão Aparecer

### Solução:
Adicionar campo "Delay" nas propriedades do botão.

**Arquivo:** `src/components/builder/PropertiesPanel.tsx`

Adicionar no componente de botão:

```typescript
<div>
    <label className="text-xs font-medium text-gray-700 mb-2 block">
        Delay para Aparecer (segundos)
    </label>
    <Input
        type="number"
        min="0"
        value={selectedComponent.data.delay || 0}
        onChange={(e) => handleUpdate('delay', Number(e.target.value))}
        placeholder="0"
    />
    <p className="text-xs text-gray-400 mt-1">
        Tempo em segundos antes do botão aparecer (0 = aparece imediatamente)
    </p>
</div>
```

**Arquivo:** Componente de renderização do botão no funnel

```typescript
const [isVisible, setIsVisible] = useState(false);

useEffect(() => {
    const delay = component.data.delay || 0;
    if (delay > 0) {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, delay * 1000);
        return () => clearTimeout(timer);
    } else {
        setIsVisible(true);
    }
}, [component.data.delay]);

if (!isVisible) return null;
```

---

## 4. 🎯 Problema: Precisão do Drag & Drop

### Solução:
Implementar indicador visual de posição de drop e melhorar a lógica de inserção.

### Funcionalidades:
- ✅ Linha indicadora mostrando onde o elemento será solto
- ✅ Drop acima do meio = insere antes
- ✅ Drop abaixo do meio = insere depois
- ✅ Feedback visual claro

**Arquivo:** `src/components/builder/Canvas.tsx`

Adicionar estados:

```typescript
const [dropIndicator, setDropIndicator] = useState<{
    index: number;
    position: 'before' | 'after';
} | null>(null);
```

Modificar `handleDragOver`:

```typescript
const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const mouseY = e.clientY;
    
    const position = mouseY < midpoint ? 'before' : 'after';
    
    setDropIndicator({ index, position });
};
```

Adicionar indicador visual no render:

```typescript
{components.map((component, index) => (
    <div key={component.id} className="relative">
        {/* Indicador de drop ANTES */}
        {dropIndicator?.index === index && dropIndicator.position === 'before' && (
            <div className="absolute -top-1 left-0 right-0 h-0.5 bg-blue-500 z-50">
                <div className="absolute left-0 -top-1 w-2 h-2 bg-blue-500 rounded-full" />
                <div className="absolute right-0 -top-1 w-2 h-2 bg-blue-500 rounded-full" />
            </div>
        )}
        
        {/* Componente */}
        <div
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={() => setDropIndicator(null)}
        >
            {/* Renderizar componente */}
        </div>
        
        {/* Indicador de drop DEPOIS */}
        {dropIndicator?.index === index && dropIndicator.position === 'after' && (
            <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-500 z-50">
                <div className="absolute left-0 -top-1 w-2 h-2 bg-blue-500 rounded-full" />
                <div className="absolute right-0 -top-1 w-2 h-2 bg-blue-500 rounded-full" />
            </div>
        )}
    </div>
))}
```

Atualizar lógica de drop:

```typescript
const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    
    if (!dropIndicator) return;
    
    const finalIndex = dropIndicator.position === 'before' 
        ? targetIndex 
        : targetIndex + 1;
    
    // Lógica de inserção no índice correto
    // ...
    
    setDropIndicator(null);
};
```

---

## 📋 Checklist de Implementação

### Prioridade Alta:
- [ ] Configurar Cloudinary para upload de imagens
- [ ] Atualizar API de upload para usar Cloudinary
- [ ] Adicionar delay no botão
- [ ] Melhorar drag & drop com indicador visual

### Prioridade Média:
- [ ] Corrigir z-index do editor de texto
- [ ] Testar upload em produção

### Configuração Externa Necessária:
1. **Cloudinary** (Grátis):
   - Criar conta em cloudinary.com
   - Adicionar credenciais no `.env` da Vercel
   - Variáveis: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

---

## 🚀 Próximos Passos

1. **Agora**: Vou implementar todas essas soluções
2. **Você**: Criar conta no Cloudinary e me passar as credenciais
3. **Deploy**: Adicionar variáveis de ambiente na Vercel
4. **Teste**: Verificar upload de imagens em produção

Quer que eu comece a implementar agora?
