/* ============================================================
   FASE 2 — GOVERNO: ministérios, Congresso (513 cadeiras),
   30 eventos/crises do cenário brasileiro.
   ============================================================ */

var MINISTRIES = [
  { id: 'saude', name: 'Saúde', ico: '🏥', def: 26, eff: 55 },
  { id: 'educ', name: 'Educação', ico: '🎓', def: 22, eff: 55 },
  { id: 'infra', name: 'Infraestrutura', ico: '🏗️', def: 18, eff: 55 },
  { id: 'seg', name: 'Segurança', ico: '🚔', def: 20, eff: 55 },
  { id: 'meio', name: 'Meio Ambiente', ico: '🌳', def: 14, eff: 55 }
];

/* 513 cadeiras — 6 blocos fictícios */
var BLOCS = [
  { id: 'fp', name: 'Frente Popular', seats: 95, ide: -2.0, rel: 0.55, greedy: 0.15 },
  { id: 'bt', name: 'Bloco do Trabalho', seats: 88, ide: -1.2, rel: 0.52, greedy: 0.20 },
  { id: 'ce', name: 'Centrão', seats: 145, ide: 0.1, rel: 0.46, greedy: 0.95 },
  { id: 'md', name: 'Movimento Democrático', seats: 82, ide: 0.5, rel: 0.50, greedy: 0.40 },
  { id: 'ag', name: 'Bancada do Agro', seats: 70, ide: 1.5, rel: 0.40, greedy: 0.45 },
  { id: 'lc', name: 'Liberal-Conservador', seats: 33, ide: 2.0, rel: 0.32, greedy: 0.10 }
];

var BILL_RULES = {
  dec: { label: 'Decreto', need: 0, desc: 'Efeito imediato, sem votação. Custo político alto.' },
  mp: { label: 'Medida Provisória', need: 257, desc: 'Vale na hora, mas o Congresso precisa ratificar (maioria simples).' },
  pl: { label: 'Projeto de Lei', need: 257, desc: 'Precisa de maioria simples: 257 dos 513 deputados.' },
  pec: { label: 'PEC', need: 308, desc: 'Precisa de 3/5: 308 dos 513 deputados.' }
};

/* ============ 30 EVENTOS DE GOVERNO ============ */
var GOV_EVENTS = [
  {
    id: 'caminhoneiros', t: 'Greve dos caminhoneiros', d: 'Rodovias bloqueadas em 14 estados. Postos sem combustível e prateleiras vazias.',
    opts: [
      { l: 'Tabela de frete obrigatória e auxílio diesel', type: 'mp', cap: 18, e: { pop: 5, infl: 0.5, debt: 0.6, cash: -12 }, r: 'A greve acabou em 4 dias. O custo logístico foi para o consumidor.' },
      { l: 'Intervenção federal e uso de tropas para desbloquear', type: 'dec', cap: 12, e: { pop: 1, infl: 0.2, unemp: 0.1, cash: -4 }, r: 'As rodovias abriram. A categoria promete voltar em 90 dias.' },
      { l: 'Mesa de negociação sem acordo de preço', type: 'dec', cap: 6, e: { pop: -4, infl: 0.9, unemp: 0.3, cash: -2 }, r: 'A greve durou 11 dias. O país parou e a inflação sentiu.' }
    ]
  },
  {
    id: 'dengue', t: 'Surto de dengue', d: '1,9 milhão de casos suspeitos e hospitais infantil lotados em 3 capitais.',
    opts: [
      { l: 'Campanha nacional + R$ 6 bi para estados', type: 'mp', cap: 10, e: { pop: 4, cash: -6, unemp: 0.0 }, r: 'Casos caíram 40% em 8 semanas.' },
      { l: 'Vacina em massa comprada no exterior', type: 'mp', cap: 14, e: { pop: 7, debt: 0.5, cash: -18 }, r: 'A vacinação virou marca do seu governo.' },
      { l: 'Deixar estados resolverem com verba própria', type: 'dec', cap: 0, e: { pop: -6, unemp: 0.1, cash: 0 }, r: 'Governadores foram à TV culpar a União.' }
    ]
  },
  {
    id: 'cambio', t: 'Crise cambial', d: 'Dólar a R$ 6,40 e fuga de capital. O mercado pede sinal fiscal.',
    opts: [
      { l: 'Pacote de corte de gastos de R$ 40 bi', type: 'pl', cap: 22, e: { pop: -7, infl: -0.6, debt: -1.2, cash: 40 }, r: 'Dólar recuou 8% em uma semana. Servidores federais protestam.' },
      { l: 'Elevar juros via Banco Central independente', type: 'dec', cap: 4, e: { pop: -3, infl: -0.4, unemp: 0.4, debt: 0.3 }, r: 'Câmbio estabilizou; o crédito encareceu.' },
      { l: 'Controle de capitais e imposto sobre exportação', type: 'mp', cap: 16, e: { pop: 2, infl: 0.4, debt: -0.4, cash: 25 }, r: 'Reservas subiram, investidor estrangeiro fugiu.' }
    ]
  },
  {
    id: 'escala61', t: 'Fim da escala 6x1', d: 'A PEC que reduz a jornada sem cortar salário tem 340 assinaturas e divide o Congresso.',
    opts: [
      { l: 'Apoiar a PEC com força total', type: 'pec', cap: 26, e: { pop: 9, unemp: 0.5, debt: 0.6, cash: -8 }, r: 'A jornada de 4 dias virou realidade. O comércio gritou.' },
      { l: 'Propor acordo setorial sem mexer na Constituição', type: 'pl', cap: 14, e: { pop: 2, unemp: 0.1, cash: 0 }, r: 'Acordo tímido: sindicatos chamaram de enrolação.' },
      { l: 'Trabalhar contra nos bastidores', type: 'dec', cap: 10, e: { pop: -6, unemp: -0.2, cash: 2 }, r: 'A PEC caiu. A base social cobrou a conta.' }
    ]
  },
  {
    id: 'enchente', t: 'Enchentes no Sul', d: 'Chuvas históricas destroem 40 cidades. 120 mil desabrigados.',
    opts: [
      { l: 'Crédito emergencial de R$ 30 bi e força nacional', type: 'mp', cap: 12, e: { pop: 6, debt: 0.9, unemp: -0.2, cash: -30 }, r: 'Reconstrução reconhecida até pela oposição.' },
      { l: 'Fundo permanente de prevenção a desastres', type: 'pec', cap: 24, e: { pop: 4, debt: 1.1, cash: -20 }, r: 'O país passou a ter política de prevenção.' },
      { l: 'Ajuda pontual e foco em não estourar o teto', type: 'dec', cap: 2, e: { pop: -7, cash: -6, debt: 0.2 }, r: 'Ajuda chegou tarde. As imagens do abandono ficaram.' }
    ]
  },
  {
    id: 'escandalo', t: 'Escândalo em estatal', d: 'Um diretor nomeado por você é filmado recebendo propina de R$ 2 milhões.',
    opts: [
      { l: 'Demitir na hora, expor contratos e devolver o dinheiro', type: 'dec', cap: 8, e: { pop: 3, cash: 2 }, r: 'A reação rápida conteve o desgaste.' },
      { l: 'Abrir CPI para investigar tudo, inclusive aliados', type: 'pl', cap: 20, e: { pop: 5, cash: -3 }, r: 'A CPI virou palco — e o seu nome saiu limpo.' },
      { l: 'Dizer que é perseguição da imprensa', type: 'dec', cap: 0, e: { pop: -9, cash: 0 }, r: 'A base fechou, o centro abriu. Escândalo sem resposta.', scandal: true }
    ]
  },
  {
    id: 'mercado', t: 'Pressão do mercado', d: 'Relatório de banco estrangeiro fala em "risco fiscal" e pede corte de R$ 50 bi.',
    opts: [
      { l: 'Revisar incentivos fiscais e isenções', type: 'pl', cap: 20, e: { pop: -5, debt: -1.4, cash: 35 }, r: 'Nota de crédito melhorou. Setores atingidos reagiram.' },
      { l: 'Aumentar impostos sobre lucros e dividendos', type: 'pl', cap: 22, e: { pop: -3, infl: 0.2, debt: -1.0, cash: 45 }, r: 'Arrecadação subiu, investimento desacelerou.' },
      { l: 'Ignorar e apostar no crescimento', type: 'dec', cap: 0, e: { pop: 1, infl: 0.7, debt: 1.0, cash: -10 }, r: 'O mercado cobrou caro no câmbio.' }
    ]
  },
  {
    id: 'apagao', t: 'Apagão nacional', d: 'Falha em subestação deixa 6 estados sem energia por 9 horas.',
    opts: [
      { l: 'Plano de modernização do setor elétrico', type: 'pl', cap: 16, e: { pop: 3, debt: 0.7, unemp: -0.2, cash: -15 }, r: 'Investimento em rede reduziu risco estrutural.' },
      { l: 'Culpar a privatização anterior e criar estatal de transmissão', type: 'mp', cap: 18, e: { pop: 2, debt: 1.4, cash: -25 }, r: 'Discurso forte, conta alta.' },
      { l: 'Multar a concessionária e seguir', type: 'dec', cap: 3, e: { pop: -3, cash: 3 }, r: 'Multa simbólica. Novos apagões já são esperados.' }
    ]
  },
  {
    id: 'amazonia', t: 'Queimadas na Amazônia', d: 'Imagens de fumaça sobre Manaus circulam no mundo. União Europeia ameaça barrar acordos.',
    opts: [
      { l: 'Operação militar ambiental e embargo de áreas', type: 'dec', cap: 10, e: { pop: 3, unemp: 0.1, cash: -9 }, r: 'Desmatamento caiu 30%. Agro protestou.' },
      { l: 'Programa de pagamento por preservação', type: 'pl', cap: 20, e: { pop: 4, debt: 0.5, cash: -18 }, r: 'Acordo internacional destravado.' },
      { l: 'Defender soberania e criticar pressão externa', type: 'dec', cap: 0, e: { pop: -2, infl: 0.3, cash: 0 }, r: 'Base patriótica animada, exportação travada.' }
    ]
  },
  {
    id: 'professores', t: 'Greve dos professores', d: 'Rede federal parada há 45 dias. Estudantes sem aula e pais irritados.',
    opts: [
      { l: 'Piso nacional com reajuste real de 12%', type: 'pl', cap: 18, e: { pop: 5, debt: 0.8, cash: -22 }, r: 'Aulas retomadas. Custo permanente no orçamento.' },
      { l: 'Acordo com reajuste parcelado em 3 anos', type: 'mp', cap: 10, e: { pop: 1, debt: 0.4, cash: -10 }, r: 'Voltaram às aulas reclamando do acordo.' },
      { l: 'Decretar ponto facultativo e contratar substitutos', type: 'dec', cap: 4, e: { pop: -5, cash: -4 }, r: 'Greve perdeu força, magia da educação também.' }
    ]
  },
  {
    id: 'fila', t: 'Fila de cirurgias explosiva', d: 'Fila de cirurgia eletiva chega a 1,4 milhão de pessoas. Reportagem mostra mortes evitáveis.',
    opts: [
      { l: 'Mutirão nacional com 1 milhão de cirurgias', type: 'mp', cap: 14, e: { pop: 7, cash: -20, debt: 0.5 }, r: 'Metade da fila zerada em 6 meses.' },
      { l: 'Programa de saúde suplementar popular', type: 'pl', cap: 20, e: { pop: 4, cash: -12, debt: 0.3 }, r: 'Plano popular aprovado, cobertura parcial.' },
      { l: 'Repassar aos estados e cobrar resultado', type: 'dec', cap: 2, e: { pop: -6, cash: -6 }, r: 'Ninguém assumiu a fila. A foto do corredor virou símbolo.' }
    ]
  },
  {
    id: 'tributaria', t: 'Reforma tributária em pauta', d: 'Proposta unifica impostos sobre consumo, mas municípios temem perda de arrecadação.',
    opts: [
      { l: 'Aprovar a reforma com fundo de compensação', type: 'pec', cap: 30, e: { pop: 3, infl: -0.3, debt: 0.8, cash: 20 }, r: 'Marco histórico: sistema mais simples, transição longa.' },
      { l: 'Reforma fatiada só sobre renda', type: 'pl', cap: 18, e: { pop: 1, cash: 18, debt: -0.3 }, r: 'Metade da reforma, metade do crédito.' },
      { l: 'Engavetar para não gastar capital', type: 'dec', cap: 0, e: { pop: -2, debt: 0.2, cash: 0 }, r: 'O tema voltará em todo debate eleitoral.' }
    ]
  },
  {
    id: 'combustivel', t: 'Protesto do diesel', d: 'Aumento de 12% no diesel gera bloqueios e caminhoneiros autônomos em Brasília.',
    opts: [
      { l: 'Zerar PIS/Cofins do diesel por 6 meses', type: 'mp', cap: 8, e: { pop: 5, infl: -0.4, cash: -16 }, r: 'Preço caiu na bomba, arrecadação também.' },
      { l: 'Manter o preço e explicar a política da Petrobras', type: 'dec', cap: 0, e: { pop: -5, infl: 0.5, cash: 2 }, r: 'Discurso técnico não segurou a estrada.' },
      { l: 'Subsidiar só o transporte de carga', type: 'mp', cap: 6, e: { pop: 2, infl: -0.1, cash: -8 }, r: 'Solução cirúrgica, sem festa.' }
    ]
  },
  {
    id: 'terra', t: 'Conflito no campo', d: 'Invasão de fazenda no Pará termina em confronto com 4 mortos e pressão dos dois lados.',
    opts: [
      { l: 'Mediação federal e desapropriação para reforma agrária', type: 'dec', cap: 12, e: { pop: 2, unemp: -0.1, cash: -7 }, r: 'Assentamentos criados; bancada do agro furiosa.' },
      { l: 'Garantir direito de propriedade com força policial', type: 'dec', cap: 8, e: { pop: -1, cash: -3 }, r: 'Ordem restaurada, tensão permanente.' },
      { l: 'Enviar projeto de lei de regularização fundiária', type: 'pl', cap: 16, e: { pop: 0, debt: 0.2, cash: -5 }, r: 'Burocracia a mais, conflito congelado.' }
    ]
  },
  {
    id: 'cyber', t: 'Ciberataque ao governo', d: 'Hackers vazam dados de 40 milhões de cidadãos do INSS e pedem resgate em bitcoin.',
    opts: [
      { l: 'Investir R$ 4 bi em cibersegurança e LGPD', type: 'pl', cap: 12, e: { pop: 2, cash: -4, debt: 0.2 }, r: 'Sistema blindado, dados ainda circulando.' },
      { l: 'Não pagar resgate e acionar a PF', type: 'dec', cap: 4, e: { pop: -2, cash: -1 }, r: 'Dados vazados viraram fraude em massa.' },
      { l: 'Pagar o resgate em sigilo', type: 'dec', cap: 0, e: { pop: -4, cash: -3 }, r: 'Vazou o pagamento. Pior dos mundos.', scandal: true }
    ]
  },
  {
    id: 'fronteira', t: 'Crise diplomática', d: 'País vizinho ameaça cortar fornecimento de gás após fala de um ministro seu.',
    opts: [
      { l: 'Pedir desculpas diplomáticas e renegociar contrato', type: 'dec', cap: 6, e: { pop: -1, infl: -0.2, cash: -5 }, r: 'Gás garantido, oposição chamou de submissão.' },
      { l: 'Diversificar fornecedores e acelerar gás nacional', type: 'pl', cap: 18, e: { pop: 2, debt: 0.6, cash: -14 }, r: 'Soberania energética em construção.' },
      { l: 'Romper relações e buscar novo bloco', type: 'dec', cap: 0, e: { pop: 2, infl: 0.8, unemp: 0.3, cash: -6 }, r: 'Discurso forte, conta energética alta.' }
    ]
  },
  {
    id: 'jovem', t: 'Desemprego juvenil em 21%', d: 'Uma geração inteira fora do mercado. Relatório aponta risco social grave.',
    opts: [
      { l: 'Programa nacional de primeiro emprego com subsídio', type: 'pl', cap: 16, e: { pop: 4, unemp: -0.6, cash: -18 }, r: '300 mil jovens contratados no primeiro ano.' },
      { l: 'Desonerar folha para quem contratar até 24 anos', type: 'pl', cap: 14, e: { pop: 2, unemp: -0.4, cash: -12 }, r: 'Contratação subiu, arrecadação caiu.' },
      { l: 'Cursos rápidos e discurso de empreendedorismo', type: 'dec', cap: 3, e: { pop: -2, unemp: 0 }, r: 'Solução cosmética, crítica feroz da imprensa.' }
    ]
  },
  {
    id: 'banco', t: 'Quebra de banco médio', d: 'O 7º maior banco do país pede recuperação judicial. 4 milhões de correntistas em pânico.',
    opts: [
      { l: 'Intervenção do Banco Central e garantia dos depósitos', type: 'mp', cap: 14, e: { pop: 3, debt: 1.0, cash: -25 }, r: 'Corrida bancária contida.' },
      { l: 'Deixar quebrar e cobrir só até o FGC', type: 'dec', cap: 2, e: { pop: -4, unemp: 0.4, debt: 0.2, cash: -5 }, r: 'Contágio atingiu bancos pequenos.' },
      { l: 'Estatizar o banco temporariamente', type: 'mp', cap: 20, e: { pop: 1, debt: 1.6, cash: -40 }, r: 'Socorro caro, chamado de "bolsa-empresário" pela oposição.' }
    ]
  },
  {
    id: 'cpi', t: 'CPI do orçamento', d: 'O Congresso instala CPI para investigar emendas parlamentares e suspeita de desvio.',
    opts: [
      { l: 'Apoiar a CPI e abrir todos os dados', type: 'dec', cap: 10, e: { pop: 5, cash: -2 }, r: 'Transparência fortaleceu seu discurso.' },
      { l: 'Negociar com líderes para esvaziar a CPI', type: 'dec', cap: 22, e: { pop: -5, cash: -6 }, r: 'CPI morreu, a manchete não.', scandal: true },
      { l: 'Criar comissão própria de auditoria', type: 'mp', cap: 8, e: { pop: 1, cash: -3 }, r: 'Comissão morna, assunto desidratado.' }
    ]
  },
  {
    id: 'virus', t: 'Novo vírus respiratório', d: 'Variante desconhecida lota UTIs em 9 capitais. OMS pede resposta imediata.',
    opts: [
      { l: 'Comprar vacinas e montar campanha nacional', type: 'mp', cap: 16, e: { pop: 7, debt: 0.9, cash: -30 }, r: 'Vacinação rápida evitou colapso.' },
      { l: 'Lockdown parcial de 21 dias', type: 'dec', cap: 10, e: { pop: -3, unemp: 0.7, cash: -15 }, r: 'Curva achatada, economia travada.' },
      { l: 'Sem restrições: "a economia não pode parar"', type: 'dec', cap: 0, e: { pop: -8, unemp: 0.2, cash: 0 }, r: 'UTIs estouraram e a imagem do governo queimou.' }
    ]
  },
  {
    id: 'violencia', t: 'Onda de violência', d: 'Três chacinas em uma semana. Polícia militar é acusada de execução.',
    opts: [
      { l: 'Plano de segurança com câmeras e corregedoria', type: 'pl', cap: 18, e: { pop: 4, cash: -14, debt: 0.3 }, r: 'Homicídios caem 11% no ano.' },
      { l: 'Decreto de garantia da lei e da ordem nas capitais', type: 'dec', cap: 8, e: { pop: 2, cash: -8 }, r: 'Tropas nas ruas, violência policial em alta.' },
      { l: 'Reduzir maioridade penal', type: 'pec', cap: 26, e: { pop: 3, debt: 0.2, cash: -6 }, r: 'PEC aprovada com apoio popular e crítica de especialistas.' }
    ]
  },
  {
    id: 'previdencia', t: 'Déficit da Previdência', d: 'Rombo de R$ 320 bi no ano. Sem reforma, o sistema quebra em 8 anos.',
    opts: [
      { l: 'Reforma com idade mínima de 65 anos', type: 'pec', cap: 34, e: { pop: -10, debt: -1.8, cash: 60 }, r: 'Reforma aprovada. Custo político altíssimo, alívio fiscal real.' },
      { l: 'Revisão só dos regimes especiais', type: 'pl', cap: 20, e: { pop: -4, debt: -0.5, cash: 20 }, r: 'Ajuste parcial, rombo continua.' },
      { l: 'Criar imposto sobre grandes fortunas para cobrir', type: 'pl', cap: 18, e: { pop: 1, debt: -0.3, cash: 25 }, r: 'Arrecadação subiu, fuga de patrimônio também.' }
    ]
  },
  {
    id: 'salario', t: 'Reajuste do salário mínimo', d: 'Centrais pedem aumento real de 8%. O mercado alerta para impacto na Previdência.',
    opts: [
      { l: 'Conceder aumento real de 8%', type: 'pl', cap: 14, e: { pop: 6, infl: 0.4, debt: 0.7, cash: -20 }, r: 'Poder de compra subiu, conta previdenciária também.' },
      { l: 'Só a inflação, sem ganho real', type: 'dec', cap: 0, e: { pop: -4, infl: 0, debt: 0.1, cash: -3 }, r: 'Sem aumento real pelo terceiro ano.' },
      { l: 'Aumento real de 2% com regra permanente', type: 'pl', cap: 10, e: { pop: 2, infl: 0.1, debt: 0.3, cash: -8 }, r: 'Equilíbrio técnico, sem brilho político.' }
    ]
  },
  {
    id: 'tarifaco', t: 'Tarifaço externo', d: 'Uma potência impõe tarifa de 50% sobre o aço brasileiro. 200 mil empregos em risco.',
    opts: [
      { l: 'Reciprocidade: taxar produtos importados', type: 'mp', cap: 16, e: { pop: 3, infl: 0.6, unemp: 0.2, cash: 18 }, r: 'Guerra comercial declarada; indústria dividida.' },
      { l: 'Negociar na OMC e diversificar mercados', type: 'dec', cap: 8, e: { pop: 1, unemp: 0.1, cash: -4 }, r: 'Solução lenta, sem estrago imediato.' },
      { l: 'Subsidiar o setor com R$ 15 bi', type: 'mp', cap: 12, e: { pop: 2, unemp: -0.3, cash: -15, debt: 0.4 }, r: 'Empregos mantidos com dinheiro público.' }
    ]
  },
  {
    id: 'costumes', t: 'Pauta de costumes no Congresso', d: 'A bancada evangélica pauta projeto sobre "ideologia de gênero" nas escolas.',
    opts: [
      { l: 'Apoiar o projeto integralmente', type: 'pl', cap: 14, e: { pop: 3, cash: 0 }, r: 'Base religiosa consolidada; jovens e educadores reagiram.' },
      { l: 'Propor texto de consenso com educação sexual técnica', type: 'pl', cap: 20, e: { pop: 0, cash: 0 }, r: 'Ninguém ficou satisfeito, todos ficaram ouvidos.' },
      { l: 'Trabalhar contra e defender Estado laico', type: 'dec', cap: 12, e: { pop: -3, cash: 0 }, r: 'Pauta derrotada; ofensiva religiosa prometida.' }
    ]
  },
  {
    id: 'universidade', t: 'Corte nas universidades', d: 'Reitores denunciam corte de 30% no orçamento. Aulas podem parar em 60 dias.',
    opts: [
      { l: 'Restabelecer 100% do orçamento', type: 'mp', cap: 12, e: { pop: 3, cash: -16, debt: 0.3 }, r: 'Aulas garantidas; ajuste fiscal comprometido.' },
      { l: 'Manter o corte e exigir eficiência das federais', type: 'dec', cap: 2, e: { pop: -4, unemp: 0.2, cash: 16 }, r: 'Economia feita e ocupações estudantis nas reitorias.' },
      { l: 'Corte menor de 10% com revisão de contratos', type: 'pl', cap: 12, e: { pop: -1, cash: 6 }, r: 'Meio-termo aprovado pelo Congresso.' }
    ]
  },
  {
    id: 'barragem', t: 'Rompimento de barragem', d: 'Barragem de mineradora se rompe em Minas. 12 mortos e rio contaminado por 300 km.',
    opts: [
      { l: 'Multa bilionária, indenização e fiscalização total', type: 'pl', cap: 18, e: { pop: 6, cash: -8, debt: 0.3 }, r: 'Mineradora paga R$ 40 bi em acordo histórico.' },
      { l: 'Suspender toda a mineração no estado por 6 meses', type: 'dec', cap: 14, e: { pop: 3, unemp: 0.5, cash: -14 }, r: 'Segurança garantida, milhares de demissões.' },
      { l: 'Aceitar acordo rápido com a empresa', type: 'dec', cap: 0, e: { pop: -7, cash: 6 }, r: 'Acordo barato; movimento social chamou de impunidade.', scandal: true }
    ]
  },
  {
    id: 'obra', t: 'Obra faraônica', d: 'A ponte mais cara do país está 340% acima do orçamento e as obras pararam.',
    opts: [
      { l: 'Auditar e renegociar contrato com corte de 40%', type: 'dec', cap: 12, e: { pop: 4, cash: -4, debt: -0.3 }, r: 'Economia de R$ 3 bi, obra retomada.' },
      { l: 'Inaugurar o que já existe e chamar de vitória', type: 'dec', cap: 4, e: { pop: -2, cash: -6 }, r: 'Corte de fita virado meme nacional.' },
      { l: 'Terminar a qualquer custo', type: 'pl', cap: 10, e: { pop: -1, debt: 1.2, cash: -30 }, r: 'Obra entregue e o dobro do preço previsto.' }
    ]
  },
  {
    id: 'delação', t: 'Delação envolvendo ministro', d: 'Um ministro de confiança é citado em delação premiada de um ex-diretor.',
    opts: [
      { l: 'Afastar o ministro e pedir investigação imediata', type: 'dec', cap: 10, e: { pop: 4, cash: 0 }, r: 'Instituições fortalecidas, base desestabilizada.' },
      { l: 'Defender o ministro publicamente', type: 'dec', cap: 0, e: { pop: -7, cash: 0 }, r: 'A defesa envelheceu em uma semana.', scandal: true },
      { l: 'Substituir sem explicar e seguir o governo', type: 'dec', cap: 6, e: { pop: -1, cash: 0 }, r: 'Crise contida, dúvida instalada.' }
    ]
  },
  {
    id: 'agro', t: 'Conflito comercial com o agro', d: 'Produtores bloqueiam portos exigindo renegociação de dívidas do setor.',
    opts: [
      { l: 'Renegociar R$ 60 bi com descontos', type: 'pl', cap: 16, e: { pop: 1, debt: 0.9, cash: -28 }, r: 'Portos liberados; bancos privados protestam.' },
      { l: 'Manter contratos e oferecer seguro rural', type: 'dec', cap: 8, e: { pop: -1, unemp: 0.1, cash: -8 }, r: 'Sem perdão, com rede de proteção.' },
      { l: 'Não negociar: "contrato é contrato"', type: 'dec', cap: 0, e: { pop: -3, infl: 0.3, cash: 0 }, r: 'Exportação parou 8 dias e o dólar sentiu.' }
    ]
  },
  {
    id: 'midia', t: 'Mídia em confronto', d: 'Uma rede de TV é acusada de distorcer dados do governo. Você exige direito de resposta.',
    opts: [
      { l: 'Abrir os dados em portais e deixar o público julgar', type: 'dec', cap: 6, e: { pop: 3, cash: -2 }, r: 'Transparência venceu a narrativa.' },
      { l: 'Processar a emissora e boicotar entrevistas', type: 'dec', cap: 4, e: { pop: -4, cash: 0 }, r: 'A rede virou oposição declarada.' },
      { l: 'Comprar espaço publicitário pesado', type: 'dec', cap: 2, e: { pop: 1, cash: -12 }, r: 'Marketing forte, credibilidade igual.' }
    ]
  },
  {
    id: 'robos', t: 'Automação e desemprego', d: 'Estudo aponta que 11 milhões de empregos serão substituídos por automação em 5 anos.',
    opts: [
      { l: 'Imposto sobre automação para financiar requalificação', type: 'pl', cap: 20, e: { pop: 3, unemp: -0.2, cash: 22, debt: -0.2 }, r: 'Fundo de requalificação criado; setor de tecnologia furioso.' },
      { l: 'Creditar inovação e deixar o mercado criar empregos', type: 'dec', cap: 4, e: { pop: 0, unemp: 0.3, cash: 0 }, r: 'Produtividade subiu, emprego industrial caiu.' },
      { l: 'Renda básica piloto para 2 milhões', type: 'mp', cap: 16, e: { pop: 6, debt: 0.8, cash: -24 }, r: 'Experimento elogiado e caro.' }
    ]
  }
];
