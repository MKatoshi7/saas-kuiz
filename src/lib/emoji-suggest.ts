/**
 * Mapeamento PT-BR → Emoji para sugestão automática.
 * Chave = palavra-chave em minúsculas (singular/plural normalizado).
 * Valor = array de emojis relevantes (primeiro = mais provável).
 */

const PT_BR_EMOJI_MAP: Record<string, string[]> = {
    // Cores / Natureza
    'vermelho': ['🔴', '❤️'], 'vermelha': ['🔴', '❤️'],
    'azul': ['🔵', '💙'], 'azuis': ['🔵', '💙'],
    'verde': ['🟢', '💚'], 'verdes': ['🟢', '💚'],
    'amarelo': ['🟡', '💛'], 'amarela': ['🟡', '💛'],
    'rosa': ['💗', '🌸'], 'rosas': ['💗', '🌸'],
    'roxo': ['🟣', '💜'], 'roxa': ['🟣', '💜'],
    'laranja': ['🟠', '🧡'], 'preto': ['⚫', '🖤'], 'branco': ['⚪', '🤍'],
    'dourado': ['🥇', '✨'], 'prata': ['🥈', '🪙'],

    // Emoções / Sentimentos
    'feliz': ['😊', '😄'], 'triste': ['😢', '😞'],
    'raiva': ['😡', '🤬'], 'bravo': ['😡', '🤬'],
    'amor': ['❤️', '🥰'], 'amar': ['❤️', '🥰'],
    'coração': ['❤️', '🫀'], 'coracao': ['❤️', '🫀'],
    'alegria': ['😄', '🎉'], 'alegre': ['😄', '🎉'],
    'surpreso': ['😲', '😮'], 'surpresa': ['😲', '😮'],
    'medo': ['😨', '😱'], 'assustado': ['😨', '😱'],
    'cansado': ['😴', '🥱'], 'cansaço': ['😴', '🥱'],
    'sonho': ['💭', '✨'], 'desejo': ['🌟', '✨'],
    'confiança': ['💪', '🤝'], 'confianca': ['💪', '🤝'],
    'coragem': ['💪', '🦁'], 'orgulho': ['😤', '🏆'],
    'calma': ['😌', '🧘'], 'paz': ['☮️', '🕊️'],
    'diversão': ['🎉', '🥳'], 'diversao': ['🎉', '🥳'],

    // Objetos / Itens
    'dinheiro': ['💰', '💵'], 'grana': ['💰', '💵'],
    'milhão': ['💰', '🤑'], 'milhao': ['💰', '🤑'],
    'riqueza': ['💎', '💰'], 'sucesso': ['🏆', '🎯'],
    'tempo': ['⏰', '⏱️'], 'relogio': ['⏰', '⏱️'],
    'velocidade': ['⚡', '🚀'],
    'rápido': ['⚡', '🚀'], 'rapido': ['⚡', '🚀'],
    'devagar': ['🐢', '🐌'], 'lento': ['🐢', '🐌'],
    'comida': ['🍽️', '🍔'], 'comer': ['🍽️', '🍔'],
    'bebida': ['🥤', '☕'], 'beber': ['🥤', '☕'],
    'água': ['💧', '🚿'], 'agua': ['💧', '🚿'],
    'café': ['☕', '🫘'], 'cafe': ['☕', '🫘'],
    'cerveja': ['🍺', '🍻'], 'vinho': ['🍷', '🥂'],
    'fruta': ['🍎', '🍇'], 'maçã': ['🍎', '🍏'], 'maca': ['🍎', '🍏'],
    'banana': ['🍌', '🐒'], 'uva': ['🍇', '🍷'],
    'limão': ['🍋', '💚'],
    'morango': ['🍓', '🍰'], 'abacaxi': ['🍍', '🌴'],
    'chocolate': ['🍫', '😋'], 'bolo': ['🎂', '🍰'],
    'pizza': ['🍕', '😋'], 'hamburger': ['🍔', '🥪'],
    'sorvete': ['🍦', '😋'], 'doce': ['🍬', '🍭'],

    // Natureza / Animais
    'sol': ['☀️', '🌞'], 'lua': ['🌙', '🌙'],
    'estrela': ['⭐', '🌟'], 'estrelas': ['⭐', '🌟'],
    'flor': ['🌸', '🌺'], 'flores': ['🌸', '🌺'],
    'árvore': ['🌳', '🌲'], 'arvore': ['🌳', '🌲'],
    'montanha': ['⛰️', '🏔️'], 'mar': ['🌊', '🏖️'],
    'praia': ['🏖️', '🌊'], 'oceano': ['🌊', '🐋'],
    'rio': ['🏞️', '💧'], 'lago': ['🏞️', '💧'],
    'neve': ['❄️', '⛄'], 'fogo': ['🔥', '🕯️'],
    'ar': ['💨', '🌬️'], 'terra': ['🌍', '🌎'],
    'animal': ['🐾', '🐕'], 'cachorro': ['🐕', '🐶'],
    'gato': ['🐈', '🐱'], 'pássaro': ['🐦', '🦅'],
    'passaro': ['🐦', '🦅'], 'peixe': ['🐟', '🐠'],
    'leão': ['🦁', '👑'], 'leao': ['🦁', '👑'],
    'tigre': ['🐅', '🐯'], 'urso': ['🐻', '🧸'],
    'lobo': ['🐺', '🌙'], 'elefante': ['🐘', '🦣'],
    'borboleta': ['🦋', '🌺'], 'abelha': ['🐝', '🍯'],
    'cavalo': ['🐴', '🐎'], 'coelho': ['🐰', '🐇'],

    // Corpo / Saúde
    'corpo': ['💪', '🏋️'], 'músculo': ['💪', '🏋️'],
    'musculo': ['💪', '🏋️'], 'exercício': ['🏃', '💪'],
    'exercicio': ['🏃', '💪'], 'treino': ['🏋️', '💪'],
    'academia': ['🏋️', '💪'], 'musculação': ['🏋️', '💪'],
    'musculacao': ['🏋️', '💪'],
    'correr': ['🏃', '👟'], 'corrida': ['🏃', '👟'],
    'yoga': ['🧘', '🧘‍♀️'], 'meditação': ['🧘', '🕉️'],
    'meditacao': ['🧘', '🕉️'],
    'saúde': ['💊', '🏥'], 'saude': ['💊', '🏥'],
    'remédio': ['💊', '💉'], 'remedio': ['💊', '💉'],
    'médico': ['👨‍⚕️', '🏥'], 'medico': ['👨‍⚕️', '🏥'],
    'dieta': ['🥗', '⚖️'], 'emagrecer': ['⚖️', '🏃'],
    'perder peso': ['⚖️', '🏃'], 'saudável': ['🥗', '💚'],
    'saudavel': ['🥗', '💚'],

    // Tecnologia / Trabalho
    'computador': ['💻', '🖥️'], 'celular': ['📱', '📲'],
    'telefone': ['📞', '📱'], 'internet': ['🌐', '📶'],
    'site': ['🌐', '💻'], 'app': ['📱', '📲'],
    'programação': ['💻', '👨‍💻'], 'programacao': ['💻', '👨‍💻'],
    'código': ['💻', '🔑'], 'codigo': ['💻', '🔑'],
    'trabalho': ['💼', '🏢'], 'emprego': ['💼', '🏢'],
    'escritório': ['🏢', '💼'], 'escritorio': ['🏢', '💼'],
    'reunião': ['🤝', '📅'], 'reuniao': ['🤝', '📅'],
    'negócio': ['💼', '📊'], 'negocio': ['💼', '📊'],
    'empresa': ['🏢', '💼'],
    'marketing': ['📢', '📣'], 'vendas': ['💰', '🛒'],
    'vender': ['💰', '🛒'], 'comprar': ['🛒', '💳'],
    'loja': ['🛍️', '🏪'], 'comércio': ['🏪', '💼'],
    'comercio': ['🏪', '💼'],

    // Educação / Aprendizado
    'livro': ['📚', '📖'], 'livros': ['📚', '📖'],
    'ler': ['📖', '📚'], 'leitura': ['📖', '📚'],
    'estudar': ['📚', '🎓'], 'estudo': ['📚', '🎓'],
    'escola': ['🏫', '🎓'], 'universidade': ['🎓', '🏛️'],
    'faculdade': ['🎓', '🏛️'], 'curso': ['🎓', '📖'],
    'aula': ['📖', '👨‍🏫'], 'professor': ['👨‍🏫', '👩‍🏫'],
    'conhecimento': ['🧠', '💡'], 'aprender': ['🧠', '📖'],
    'inteligente': ['🧠', '🤓'], 'sabio': ['🧠', '🦉'],

    // Viagem / Lazer
    'viagem': ['✈️', '🌍'], 'viajar': ['✈️', '🌍'],
    'avião': ['✈️', '🛫'], 'aviao': ['✈️', '🛫'],
    'aeroporto': ['✈️', '🛫'], 'passagem': ['✈️', '🎫'],
    'hotel': ['🏨', '🛎️'], 'férias': ['🏖️', '☀️'],
    'ferias': ['🏖️', '☀️'], 'turismo': ['🗺️', '📸'],
    'fotografia': ['📸', '📷'], 'foto': ['📸', '📷'],
    'aventura': ['🗺️', '🧭'], 'explorar': ['🧭', '🗺️'],
    'natureza': ['🌿', '🌳'], 'cachoeira': ['💧', '🏔️'],

    // Música / Arte
    'música': ['🎵', '🎶'], 'musica': ['🎵', '🎶'],
    'cantar': ['🎤', '🎶'], 'dançar': ['💃', '🕺'],
    'dancar': ['💃', '🕺'], 'piano': ['🎹', '🎵'],
    'guitarra': ['🎸', '🎵'], 'violão': ['🎸', '🎵'],
    'violao': ['🎸', '🎵'], 'bateria': ['🥁', '🎵'],
    'banda': ['🎸', '🎤'], 'show': ['🎤', '🎶'],
    'concerto': ['🎵', '🎶'], 'festival': ['🎪', '🎶'],
    'arte': ['🎨', '🖌️'], 'pintura': ['🎨', '🖌️'],
    'desenho': ['✏️', '🎨'],

    // Esportes
    'futebol': ['⚽', '🥅'], 'bola': ['⚽', '🏀'],
    'basquete': ['🏀', '⛹️'], 'tênis': ['🎾', '🏸'],
    'tenis': ['🎾', '🏸'], 'natação': ['🏊', '💧'],
    'natacao': ['🏊', '💧'], 'ciclismo': ['🚴', '🚲'],
    'surf': ['🏄', '🌊'], 'skate': ['🛹', '🛼'],
    'luta': ['🥊', '🥋'], 'boxe': ['🥊', '🥊'],
    'medalha': ['🥇', '🏅'], 'troféu': ['🏆', '🥇'],
    'trofeu': ['🏆', '🥇'], 'campeonato': ['🏆', '🏅'],

    // Casa / Família
    'casa': ['🏠', '🏡'], 'lar': ['🏠', '❤️'],
    'cozinha': ['🍳', '👩‍🍳'], 'quarto': ['🛏️', '🛌'],
    'banheiro': ['🚿', '🛁'], 'sala': ['🛋️', '📺'],
    'jardim': ['🌻', '🌿'], 'porta': ['🚪', '🔒'],
    'janela': ['🪟', '☀️'], 'chave': ['🔑', '🗝️'],
    'família': ['👨‍👩‍👧‍👦', '❤️'], 'familia': ['👨‍👩‍👧‍👦', '❤️'],
    'filho': ['👶', '👦'], 'filha': ['👶', '👧'],
    'pai': ['👨', '👴'], 'mãe': ['👩', '👵'],
    'mae': ['👩', '👵'],
    'irmão': ['👦', '👨'], 'irmao': ['👦', '👨'],
    'irmã': ['👧', '👩'], 'irma': ['👧', '👩'],
    'bebê': ['👶', '🍼'], 'bebe': ['👶', '🍼'],
    'casamento': ['💒', '💍'], 'noivo': ['💑', '💍'],

    // Signos / Zodíaco
    'signo': ['⭐', '🔮'], 'horóscopo': ['🔮', '⭐'],
    'horoscopo': ['🔮', '⭐'], 'zodíaco': ['♈', '♉'],
    'zodiaco': ['♈', '♉'],
    'áries': ['♈', '🐏'], 'aries': ['♈', '🐏'],
    'touro': ['♉', '🐂'], 'gêmeos': ['♊', '👯'],
    'gemeos': ['♊', '👯'], 'câncer': ['♋', '🦀'],
    'cancer': ['♋', '🦀'], 'leão_signo': ['♌', '🦁'],
    'leao_signo': ['♌', '🦁'], 'virgem': ['♍', '🌾'],
    'libra': ['♎', '⚖️'], 'escorpião': ['♏', '🦂'],
    'escorpiao': ['♏', '🦂'], 'sagitário': ['♐', '🏹'],
    'sagitario': ['♐', '🏹'], 'capricórnio': ['♑', '🐐'],
    'capricornio': ['♑', '🐐'], 'aquário': ['♒', '🏺'],
    'aquario': ['♒', '🏺'], 'peixes': ['♓', '🐟'],

    // Comida / Gastronomia
    'café da manhã': ['🍳', '☕'], 'cafe da manha': ['🍳', '☕'],
    'almoco': ['🍽️', '🥗'], 'almoço': ['🍽️', '🥗'],
    'jantar': ['🍽️', '🍷'], 'lanche': ['🍪', '☕'],
    'receita': ['👩‍🍳', '📖'], 'cozinhar': ['🍳', '👩‍🍳'],
    'refrigerante': ['🥤', '🥤'], 'suco': ['🧃', '🍊'],
    'cha': ['🍵', '🫖'], 'chá': ['🍵', '🫖'],

    // Números / Conceitos
    'um': ['1️⃣', '☝️'], 'dois': ['2️⃣', '✌️'],
    'três': ['3️⃣', '🤟'], 'tres': ['3️⃣', '🤟'],
    'quatro': ['4️⃣', '🖖'], 'cinco': ['5️⃣', '🖐️'],
    'dez': ['🔟', '💪'], 'cem': ['💯', '🎯'],
    'mil': ['💰', '🎯'], 'número': ['🔢', '📊'],
    'numero': ['🔢', '📊'],

    // Conceitos abstratos
    'ideia': ['💡', '🧠'], 'criatividade': ['🎨', '💡'],
    'inovação': ['💡', '🚀'], 'inovacao': ['💡', '🚀'],
    'futuro': ['🔮', '🚀'], 'passado': ['📜', '⏪'],
    'presente': ['🎁', '📦'], 'oportunidade': ['🌟', '🚪'],
    'problema': ['⚠️', '🔧'], 'solução': ['✅', '🔧'],
    'solucao': ['✅', '🔧'], 'pergunta': ['❓', '🤔'],
    'resposta': ['✅', '💡'], 'erro': ['❌', '⚠️'],
    'acerto': ['✅', '🎯'], 'certeza': ['💯', '✅'],
    'dúvida': ['🤔', '❓'], 'duvida': ['🤔', '❓'],

    // Objetos do dia a dia
    'senha': ['🔒', '🔑'], 'conta': ['🔢', '💰'],
    'fatura': ['📄', '💰'], 'pagamento': ['💳', '💰'],
    'preço': ['💰', '💲'], 'preco': ['💰', '💲'],
    'desconto': ['🏷️', '💸'], 'oferta': ['🏷️', '🎁'],
    'promoção': ['🏷️', '🎉'], 'promocao': ['🏷️', '🎉'],
    'gratuito': ['🆓', '🎁'], 'gratis': ['🆓', '🎁'],
    'caro': ['💸', '💰'], 'barato': ['💰', '👍'],

    // Cores como tema
    'modo escuro': ['🌙', '⬛'], 'dark mode': ['🌙', '⬛'],
    'modo claro': ['☀️', '⬜'], 'light mode': ['☀️', '⬜'],

    // Ações comuns
    'iniciar': ['🚀', '▶️'], 'começar': ['🚀', '▶️'],
    'comecar': ['🚀', '▶️'], 'parar': ['⏹️', '🛑'],
    'continuar': ['▶️', '⏩'], 'avançar': ['⏩', '▶️'],
    'avancar': ['⏩', '▶️'], 'voltar': ['⏪', '↩️'],
    'salvar': ['💾', '✅'], 'apagar': ['🗑️', '❌'],
    'criar': ['✨', '🆕'], 'editar': ['✏️', '🔧'],
    'configurar': ['⚙️', '🔧'], 'personalizar': ['🎨', '⚙️'],
    'compartilhar': ['🔗', '📤'], 'enviar': ['📤', '✉️'],
    'receber': ['📥', '📬'], 'baixar': ['⬇️', '📥'],
    'upload': ['⬆️', '📤'], 'download': ['⬇️', '📥'],
    'procurar': ['🔍', '🔎'], 'buscar': ['🔍', '🔎'],
    'encontrar': ['🔍', '✅'], 'selecionar': ['☑️', '✅'],
    'escolher': ['☑️', '✅'], 'decidir': ['🤔', '✅'],
    'confirmar': ['✅', '👍'], 'cancelar': ['❌', '🚫'],
    'aceitar': ['✅', '👍'], 'recusar': ['❌', '👎'],
    'concordar': ['👍', '✅'], 'discordar': ['👎', '❌'],
    'gostar': ['❤️', '👍'], 'odiar': ['💔', '👎'],

    // Categorias de quiz
    'personalidade': ['🧬', '🧩'], 'compatibilidade': ['💑', '🧩'],
    'compativel': ['💑', '🧩'], 'relacionamento': ['💑', '❤️'],
    'amizade': ['🤝', '💛'], 'carreira': ['💼', '🚀'],
    'propósito': ['🎯', '🌟'], 'proposito': ['🎯', '🌟'],
    'objetivo': ['🎯', '🏆'], 'meta': ['🎯', '🏆'],
    'estilo de vida': ['🌟', '✨'],
    'rotina': ['📅', '⏰'], 'hábito': ['🔄', '📅'],
    'habito': ['🔄', '📅'],

    // Planetas / Espaço
    'planeta': ['🌍', '🪐'], 'universo': ['🌌', '✨'],
    'espaço': ['🌌', '🚀'], 'espaco': ['🌌', '🚀'],
    'cometa': ['☄️', '💫'], 'meteoro': ['☄️', '💫'],
    'galáxia': ['🌌', '✨'], 'galaxia': ['🌌', '✨'],
    'alien': ['👽', '🛸'], 'ovni': ['🛸', '👽'],

    // Coisas legais
    'incrível': ['🤩', '🔥'], 'incivel': ['🤩', '🔥'],
    'fantástico': ['🤩', '✨'], 'fantastico': ['🤩', '✨'],
    'maravilhoso': ['😍', '🌟'], 'perfeito': ['💯', '✅'],
    'excelente': ['🌟', '👍'], 'bom': ['👍', '😊'],
    'ótimo': ['👍', '🎉'], 'otimo': ['👍', '🎉'],
    'melhor': ['🏆', '🥇'], 'pior': ['👎', '💩'],
    'terrível': ['😱', '💔'], 'terrivel': ['😱', '💔'],

    // Comida brasileira
    'feijão': ['🫘', '🍚'], 'feijao': ['🫘', '🍚'],
    'arroz': ['🍚', '🍽️'], 'churrasco': ['🥩', '🔥'],
    'pão': ['🍞', '🥖'], 'pao': ['🍞', '🥖'],
    'queijo': ['🧀', '🍕'], 'presunto': ['🥓', '🍖'],
    'ovo': ['🥚', '🍳'], 'leite': ['🥛', '🍼'],
    'manteiga': ['🧈', '🍞'], 'açúcar': ['🍬', '🧂'],
    'acucar': ['🍬', '🧂'], 'sal': ['🧂', '🌶️'],
    'pimenta': ['🌶️', '🔥'], 'alho': ['🧄', '🔥'],
    'cebola': ['🧅', '💧'], 'tomate': ['🍅', '🥗'],
    'batata': ['🥔', '🍟'], 'cenoura': ['🥕', '🥗'],
    'brócolis': ['🥦', '🥗'], 'brocolis': ['🥦', '🥗'],
};

// Normaliza texto: remove acentos, lowercase
function normalize(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

/**
 * Dada a label de uma opção, retorna o emoji mais provável.
 * Busca pela maior palavra-chave correspondente (para "café da manhã" não pegar só "café").
 */
export function suggestEmojiFromText(label: string): string | null {
    const normalized = normalize(label);
    let bestMatch: string | null = null;
    let bestLength = 0;

    for (const [keyword, emojis] of Object.entries(PT_BR_EMOJI_MAP)) {
        const normalizedKeyword = normalize(keyword);
        if (normalized.includes(normalizedKeyword) && normalizedKeyword.length > bestLength) {
            bestLength = normalizedKeyword.length;
            bestMatch = emojis[0];
        }
    }

    return bestMatch;
}

/**
 * Busca emojis por termo PT-BR.
 * Retorna array de { emoji, label } para exibir como sugestões.
 */
export function searchEmojiPT_BR(query: string): { emoji: string; label: string }[] {
    const normalized = normalize(query);
    const results: { emoji: string; label: string; score: number }[] = [];
    const seen = new Set<string>();

    for (const [keyword, emojis] of Object.entries(PT_BR_EMOJI_MAP)) {
        const normalizedKeyword = normalize(keyword);
        if (normalizedKeyword.includes(normalized) || normalized.includes(normalizedKeyword)) {
            for (const emoji of emojis) {
                if (!seen.has(emoji)) {
                    seen.add(emoji);
                    // Score: match exato no início = maior prioridade
                    const score = normalizedKeyword.startsWith(normalized) ? 2 :
                                  normalizedKeyword.includes(normalized) ? 1 : 0.5;
                    results.push({ emoji, label: keyword, score });
                }
            }
        }
    }

    return results
        .sort((a, b) => b.score - a.score)
        .slice(0, 20)
        .map(({ emoji, label }) => ({ emoji, label }));
}

/**
 * Retorna categorias de emojis populares para PT-BR.
 */
export function getPopularEmojiCategories(): { label: string; emojis: string[] }[] {
    return [
        { label: 'Favoritos', emojis: ['😀', '😂', '❤️', '🔥', '👍', '🎉', '💯', '✨', '🌟', '💪', '🏆', '🎯', '🚀', '⭐', '💡', '🎨'] },
        { label: 'Rostos', emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🫡', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐'] },
        { label: 'Mãos', emojis: ['👍', '👎', '👌', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '🫵', '👋', '🤚', '🖐️', '✋', '🖖', '🫱', '🫲', '🫳', '🫴', '🫷', '🫸', '👏', '🙌', '🫶', '👐', '🤲', '🤝', '🙏'] },
        { label: 'Corações', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝'] },
        { label: 'Animais', emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🪱', '🐛', '🦋', '🐌', '🐞'] },
        { label: 'Comida', emojis: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥑', '🫛', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🫘', '🥜', '🫙', '🍯', '🥐', '🍞', '🥖', '🫓', '🥨', '🥯', '🥞', '🧇', '🧀', '🍖', '🍗', '🥩', '🥓', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🫔', '🥙', '🧆', '🥚', '🍳', '🥘', '🍲', '🫕', '🥣', '🥗', '🍿', '🧈', '🧂', '🥫', '🍱', '🍘', '🍙', '🍚', '🍛', '🍜', '🍝', '🍠', '🍢', '🍣', '🍤', '🍥', '🥮', '🍡', '🥟', '🥠', '🥡', '🦀', '🦞', '🦐', '🦑', '🦪', '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🧁', '🥧', '🍫', '🍬', '🍭', '🍮'] },
        { label: 'Viagem', emojis: ['✈️', '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🏍️', '🛵', '🚲', '🛴', '🛹', '🛼', '🚁', '🛸', '🚀', '⛵', '🚤', '🛥️', '🛳️', '⛴️', '🚢', '🗼', '🗽', '🏰', '🏯', '🏟️', '🎡', '🎢', '🎠', '⛲', '⛱️', '🏖️', '🏝️', '🏜️', '🌋', '⛰️', '🏔️', '🗻', '🏕️', '🛖', '🏠', '🏡', '🏘️', '🏚️', '🏗️', '🏭', '🏢', '🏬', '🏣', '🏤', '🏥', '🏦', '🏨', '🏪', '🏫', '🏩', '💒', '🏛️', '⛪', '🕌', '🕍', '🛕', '🕋', '⛩️', '🗾', '🗺️', '🧭'] },
        { label: 'Objetos', emojis: ['⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨', '🖱', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🪫', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💰', '🪙', '💴', '💵', '💶', '💷', '🪪', '💳', '💎', '⚖️', '🪜', '🧰', '🪛', '🔧', '🔩', '⚙️', '⛏️', '🛠️', '⚒️', '🔨', '🪓', '🔗', '🪝', '🧲', '🔫', '💣', '🧨', '🔪', '🗡️', '⚔️', '🛡️', '🚬', '⚰️', '🪦', '⚱️', '🏺', '🔮', '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕳️', '🩹', '🩺', '🩻', '🩼', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪', '🌡️', '🧹', '🪠', '🧺', '🧻', '🚰', '🚿', '🛁', '🛀', '🧼', '🪥', '🪒', '🧽', '🪣', '🧴', '🛎️', '🔑', '🗝️', '🚪', '🪑', '🛋️', '🛏️', '🛌', '🧸', '🪆', '🖼️', '🪞', '🪟', '🛍️', '🛒', '🎁', '🎈', '🎏', '🎀', '🪄', '🪅', '🎊', '🎉', '🎎', '🏮', '🎐', '🧧', '✉️', '📩', '📨', '📧', '💌', '📥', '📤', '📦', '🏷️', '🪧', '📪', '📫', '📬', '📭', '📮', '📯', '📜', '📃', '📄', '📑', '🧾', '📊', '📈', '📉', '🗒️', '🗓️', '📆', '📅', '🗑️', '📇', '🗃️', '🗳️', '🗄️', '📋', '📁', '📂', '🗂️', '🗞️', '📰', '📓', '📔', '📒', '📕', '📖', '📗', '📘', '📙', '📚', '🔀', '🔁', '🔂', '▶️', '⏩', '◀️', '⏪', '🔼', '⏫', '🔽', '⏬', '⏸️', '⏹️', '⏺️', '⏏️', '🎦', '🔅', '🔆', '📶', '🛜', '📳', '📴', '♀️', '♂️', '⚧️', '🔒', '🔓', '🔏', '🔐', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'] },
    ];
}
