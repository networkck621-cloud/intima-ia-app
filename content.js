// Conteúdo segmentado por persona — usado pelo quiz, reveal, VSL e ideia do dia.

// Convenção de imagens: cada opção pode ter uma foto de fundo em
// /assets/quiz/dor/{id}.jpg ou /assets/quiz/pergunta/{id}.jpg.
// Se o arquivo ainda não existir, o botão cai num fundo sólido (ver quiz.js / preloadImage).

// Sugestões de pergunta do Chat, por userContext ("Masculino" | "Feminino" |
// "Casal" | "Neutro" — o quarto cobre "Prefiro não dizer", que não foi pedido
// explicitamente mas existe como valor real do estado). "quick" são os 3 chips
// fixos, "more" é a lista expandida no "Ver mais sugestões".
const CHAT_SUGGESTIONS = {
  Masculino: {
    quick: ["Como durar mais na cama?", "Como melhorar minha performance?", "Como aumentar minha libido?"],
    more: [
      "Dicas para quem tem pênis pequeno",
      "Como saber se estou fazendo certo?",
      "Como ter mais confiança na hora H?",
      "Como ler os sinais dela sem precisar perguntar?",
      "O que fazer quando bate a ansiedade antes do sexo?",
    ],
  },
  Feminino: {
    quick: ["Como descobrir o que eu gosto?", "Como melhorar a comunicação com meu parceiro?", "Dicas para aumentar minha libido?"],
    more: [
      "Como ter mais orgasmos?",
      "Como pedir o que eu quero sem vergonha?",
      "Como me sentir mais segura na intimidade?",
      "Como explorar novas posições?",
      "O que fazer quando bate a ansiedade antes do sexo?",
    ],
  },
  Casal: {
    quick: ["Como melhorar a comunicação entre nós?", "Como recuperar o desejo um pelo outro?", "Como explorar novas experiências juntos?"],
    more: [
      "Como manter a sintonia no dia a dia?",
      "Como falar de fantasias sem julgamento?",
      "Como reacender o tesão depois de um tempo juntos?",
      "Como sair da mesmice na intimidade?",
      "O que fazer quando a ansiedade atrapalha o momento?",
    ],
  },
  Neutro: {
    quick: ["Como melhorar a comunicação?", "Dicas para aumentar a libido?", "Como posso explorar novas posições?"],
    more: [
      "Como durar mais na intimidade?",
      "Como ter mais confiança na hora H?",
      "Como fazer meu parceiro(a) sentir mais prazer?",
      "Como perder a vergonha na hora H?",
      "O que fazer quando bate a ansiedade antes do sexo?",
    ],
  },
};

function getChatSuggestions(userContext) {
  return CHAT_SUGGESTIONS[userContext] || CHAT_SUGGESTIONS.Neutro;
}

const DOR_OPTIONS = {
  mulher_solteiro: [
    { id: "descobrir", label: "Não sei o que eu realmente gosto", image: "/assets/quiz/dor/descobrir.jpg" },
    { id: "vergonha_pedir", label: "Vergonha de pedir o que eu quero", image: "/assets/quiz/dor/vergonha_pedir.jpg" },
    { id: "orgasmo", label: "Dificuldade de ter orgasmo", image: "/assets/quiz/dor/orgasmo.jpg" },
    { id: "seguranca", label: "Insegurança com alguém novo", image: "/assets/quiz/dor/seguranca.jpg" },
    { id: "falta_libido", label: "Falta de desejo ou libido", image: "/assets/quiz/dor/falta_libido.jpg" },
  ],
  mulher_relacionamento: [
    { id: "desejo_sumiu", label: "Meu desejo sumiu", image: "/assets/quiz/dor/desejo_sumiu.jpg" },
    { id: "fantasias", label: "Não sei como falar de fantasias com meu parceiro", image: "/assets/quiz/dor/fantasias.jpg" },
    { id: "orgasmo", label: "Dificuldade de ter orgasmo", image: "/assets/quiz/dor/orgasmo.jpg" },
    { id: "fingir", label: "Sinto que devo 'fingir'", image: "/assets/quiz/dor/fingir.jpg" },
    { id: "falta_libido", label: "Falta de desejo ou libido", image: "/assets/quiz/dor/falta_libido.jpg" },
  ],
  homem_solteiro: [
    { id: "performance", label: "Medo de não estar fazendo certo", image: "/assets/quiz/dor/performance.jpg" },
    { id: "duracao", label: "Insegurança com performance/duração", image: "/assets/quiz/dor/duracao.jpg" },
    { id: "ler_sinais", label: "Não sei ler o que ela quer", image: "/assets/quiz/dor/ler_sinais.jpg" },
    { id: "ansiedade", label: "Ansiedade antes de ficar com alguém", image: "/assets/quiz/dor/ansiedade.jpg" },
    { id: "falta_libido", label: "Falta de desejo ou libido", image: "/assets/quiz/dor/falta_libido.jpg" },
  ],
  homem_relacionamento: [
    { id: "desejo_dela", label: "Ela perdeu o desejo", image: "/assets/quiz/dor/desejo_dela.jpg" },
    { id: "fantasias", label: "Não sei como falar de fantasias sem assustar", image: "/assets/quiz/dor/fantasias.jpg" },
    { id: "duracao", label: "Medo de durar pouco", image: "/assets/quiz/dor/duracao.jpg" },
    { id: "rotina", label: "A rotina matou o tesão", image: "/assets/quiz/dor/rotina.jpg" },
    { id: "falta_libido", label: "Falta de desejo ou libido", image: "/assets/quiz/dor/falta_libido.jpg" },
  ],
  neutro_solteiro: [
    { id: "descobrir", label: "Não sei o que eu realmente gosto", image: "/assets/quiz/dor/descobrir.jpg" },
    { id: "vergonha_pedir", label: "Vergonha de pedir o que eu quero", image: "/assets/quiz/dor/vergonha_pedir.jpg" },
    { id: "performance", label: "Insegurança com performance", image: "/assets/quiz/dor/performance.jpg" },
    { id: "seguranca", label: "Insegurança com alguém novo", image: "/assets/quiz/dor/seguranca.jpg" },
    { id: "falta_libido", label: "Falta de desejo ou libido", image: "/assets/quiz/dor/falta_libido.jpg" },
  ],
  neutro_relacionamento: [
    { id: "desejo_sumiu", label: "Meu desejo sumiu", image: "/assets/quiz/dor/desejo_sumiu.jpg" },
    { id: "fantasias", label: "Não sei como falar de fantasias com meu parceiro(a)", image: "/assets/quiz/dor/fantasias.jpg" },
    { id: "orgasmo", label: "Dificuldade de ter orgasmo/prazer", image: "/assets/quiz/dor/orgasmo.jpg" },
    { id: "rotina", label: "A rotina matou o tesão", image: "/assets/quiz/dor/rotina.jpg" },
    { id: "falta_libido", label: "Falta de desejo ou libido", image: "/assets/quiz/dor/falta_libido.jpg" },
  ],
};

const PERGUNTA_OPTIONS = {
  mulher_solteiro: [
    { id: "descobrir", label: "Como descobrir o que eu gosto", image: "/assets/quiz/pergunta/descobrir.jpg" },
    { id: "pedir", label: "Como pedir o que eu quero sem vergonha", image: "/assets/quiz/pergunta/pedir.jpg" },
    { id: "orgasmo", label: "Como ter orgasmo", image: "/assets/quiz/pergunta/orgasmo.jpg" },
    { id: "seguranca", label: "Como me sentir segura com alguém novo", image: "/assets/quiz/pergunta/seguranca.jpg" },
  ],
  mulher_relacionamento: [
    { id: "recuperar_desejo", label: "Como recuperar meu desejo", image: "/assets/quiz/pergunta/recuperar_desejo.jpg" },
    { id: "fantasias", label: "Como falar de fantasias com meu parceiro", image: "/assets/quiz/pergunta/fantasias.jpg" },
    { id: "orgasmo", label: "Como ter orgasmo", image: "/assets/quiz/pergunta/orgasmo.jpg" },
    { id: "desejada", label: "Como me sentir desejada de novo", image: "/assets/quiz/pergunta/desejada.jpg" },
  ],
  homem_solteiro: [
    { id: "durar", label: "Como durar mais", image: "/assets/quiz/pergunta/durar.jpg" },
    { id: "certo", label: "Como saber se estou fazendo certo", image: "/assets/quiz/pergunta/certo.jpg" },
    { id: "confianca", label: "Como ter mais confiança", image: "/assets/quiz/pergunta/confianca.jpg" },
    { id: "ler", label: "Como ler o que ela quer sem perguntar direto", image: "/assets/quiz/pergunta/ler.jpg" },
  ],
  homem_relacionamento: [
    { id: "recuperar_desejo_dela", label: "Como recuperar o desejo dela", image: "/assets/quiz/pergunta/recuperar_desejo_dela.jpg" },
    { id: "fantasias", label: "Como falar de fantasias sem assustar", image: "/assets/quiz/pergunta/fantasias.jpg" },
    { id: "durar", label: "Como durar mais", image: "/assets/quiz/pergunta/durar.jpg" },
    { id: "orgasmo_dela", label: "Por que ela não tem orgasmo comigo", image: "/assets/quiz/pergunta/orgasmo_dela.jpg" },
  ],
  neutro_solteiro: [
    { id: "descobrir", label: "Como descobrir o que eu gosto", image: "/assets/quiz/pergunta/descobrir.jpg" },
    { id: "pedir", label: "Como pedir o que eu quero sem vergonha", image: "/assets/quiz/pergunta/pedir.jpg" },
    { id: "confianca", label: "Como ter mais confiança", image: "/assets/quiz/pergunta/confianca.jpg" },
    { id: "seguranca", label: "Como me sentir seguro(a) com alguém novo", image: "/assets/quiz/pergunta/seguranca.jpg" },
  ],
  neutro_relacionamento: [
    { id: "recuperar_desejo", label: "Como recuperar o desejo", image: "/assets/quiz/pergunta/recuperar_desejo.jpg" },
    { id: "fantasias", label: "Como falar de fantasias com meu parceiro(a)", image: "/assets/quiz/pergunta/fantasias.jpg" },
    { id: "orgasmo", label: "Como ter mais prazer", image: "/assets/quiz/pergunta/orgasmo.jpg" },
    { id: "desejada", label: "Como sentir desejo de novo", image: "/assets/quiz/pergunta/desejada.jpg" },
  ],
};

// Banco exclusivo pra quem responde "Eu e meu parceiro(a)" — pula a pergunta de
// gênero e usa linguagem plural ("vocês"). Não reaproveita os arrays individuais acima.
const DOR_OPTIONS_CASAL = [
  { id: "desejo_sumiu", label: "O desejo entre vocês diminuiu" },
  { id: "comunicacao", label: "Vocês têm dificuldade de falar sobre fantasias" },
  { id: "orgasmo", label: "Um de vocês (ou os dois) tem dificuldade de chegar ao orgasmo" },
  { id: "rotina", label: "A rotina tomou conta e o tesão ficou de lado" },
  { id: "falta_libido", label: "Vocês sentem falta de desejo ou libido" },
];

const PERGUNTA_OPTIONS_CASAL = [
  { id: "recuperar_desejo", label: "Como vocês podem recuperar o desejo" },
  { id: "fantasias", label: "Como vocês podem falar de fantasias sem julgamento" },
  { id: "orgasmo", label: "Como vocês podem ter mais prazer juntos" },
  { id: "conexao", label: "Como vocês podem se sentir mais conectados" },
];

const VSL_HOOKS = {
  mulher_solteiro:
    "Se você nunca teve coragem de perguntar o que realmente te dá prazer — nem pra você mesma — eu preciso te contar uma coisa.",
  mulher_relacionamento:
    "Se seu desejo sumiu e você não sabe como falar isso com seu parceiro sem se sentir culpada, eu preciso te contar uma coisa.",
  homem_solteiro:
    "Se você já ficou se perguntando se está fazendo certo na cama — ou tem medo de perguntar isso pra alguém — eu preciso te contar uma coisa.",
  homem_relacionamento:
    "Se você sente que perdeu o jeito de fazer sua parceira te querer do jeito que ela queria antes, eu preciso te contar uma coisa.",
  neutro_solteiro:
    "Se você já teve vergonha de perguntar algo sobre sexo pra alguém, eu preciso te contar uma coisa.",
  neutro_relacionamento:
    "Se a rotina apagou o desejo de vocês e ninguém fala sobre isso em voz alta, eu preciso te contar uma coisa.",
  casal:
    "Se vocês sentem que o desejo mudou e nenhum dos dois sabe como trazer isso à tona sem mágoa, eu preciso contar uma coisa pra vocês.",
};

const VSL_VILAO = {
  homem: "A gente aprende sexo vendo pornô — que não ensina nada sobre comunicação real, nem sobre o que sua parceira de fato sente. E isso não é falta de informação, é falta de alguém pra te ensinar sem te fazer sentir mal por perguntar.",
  mulher: "A gente aprende que prazer feminino é tabu, que pedir o que quer é 'pedir demais' — e por isso a maioria nunca teve um espaço seguro pra perguntar o que realmente importa.",
  neutro: "Quase ninguém aprende sexo de verdade. A gente aprende vendo pornô, perguntando pro Google, ou simplesmente engole a dúvida e fica calado com vergonha. Isso não é falha sua — é porque nunca existiu um lugar seguro pra perguntar.",
};

const DAILY_TIPS = {
  mulher_solteiro: [
    "Antes de pensar em agradar alguém, descubra sozinha o que te dá prazer — isso não é egoísmo, é a base de tudo.",
    "Da próxima vez que ficar com alguém novo, tente dizer uma frase simples: 'eu gosto quando...'. Treinar isso sozinha facilita na hora real.",
  ],
  mulher_relacionamento: [
    "Separe 10 minutos fora do quarto pra falar sobre desejo com seu parceiro — fora do momento, sem pressão, é mais fácil abrir essa conversa.",
    "Desejo baixo quase nunca é só físico. Pergunte a si mesma: o que mudou na rotina de vocês nos últimos meses?",
  ],
  homem_solteiro: [
    "Confiança na cama vem de comunicação, não de performance. Perguntar 'tá bom assim?' já muda o jogo.",
    "Antes de se preocupar em durar mais, preste atenção no ritmo dela — isso já resolve metade da ansiedade.",
  ],
  homem_relacionamento: [
    "Se ela perdeu o desejo, pergunte sobre o dia dela antes de pensar em sexo — conexão emocional vem antes da física.",
    "Fantasias se abrem com curiosidade, não com cobrança. Pergunte 'o que você já quis tentar?' num momento leve.",
  ],
  neutro_solteiro: [
    "Conhecer o próprio corpo sem pressa é o primeiro passo pra qualquer coisa boa acontecer com outra pessoa.",
  ],
  neutro_relacionamento: [
    "Rotina mata desejo. Mudar um detalhe pequeno (horário, lugar, conversa) já reabre espaço pra tesão.",
  ],
  casal: [
    "Separem 10 minutos fora do quarto pra falar sobre desejo — fora do momento, sem pressão, fica mais fácil abrir essa conversa.",
    "Perguntem um pro outro: 'o que você já quis tentar e nunca falou?'. Curiosidade funciona melhor que cobrança.",
  ],
};

function getSegmentBaseGender(segment) {
  if (segment.startsWith("homem")) return "homem";
  if (segment.startsWith("mulher")) return "mulher";
  return "neutro";
}

// Testa se uma imagem existe/carrega antes de usá-la como fundo —
// evita card quebrado/vazio enquanto as fotos reais não foram enviadas pro servidor.
function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}
