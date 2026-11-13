/* ============================================================
   SIMULADOR PRESIDENTE DO BRASIL — base de dados (pt-BR)
   Conteúdo 100% fictício: partidos, adversários e personagens.
   ============================================================ */

var GROUPS = ['tr', 'em', 'jo', 'ev'];
var GROUP_NAME = { tr: 'Trabalhadores', em: 'Empresários', jo: 'Jovens', ev: 'Evangélicos' };
var GROUP_WEIGHT = { tr: 0.38, em: 0.16, jo: 0.20, ev: 0.26 };

var PARTIES = [
  {
    id: 'fst', name: 'Frente Social do Trabalho', sigla: 'FST', ide: -1.7, label: 'Esquerda',
    desc: 'Base sindical e movimentos sociais. Muito apoio entre trabalhadores, desconfiança do mercado.',
    mods: { tr: 15, em: -11, jo: 6, ev: -3 }, money: 5.5, color: '#E5484D'
  },
  {
    id: 'mdb', name: 'Movimento Democrático Brasileiro', sigla: 'MDB', ide: 0, label: 'Centro',
    desc: 'Máquina partidária, alianças amplas, eleitorado difuso. Pouco teto, pouco piso.',
    mods: { tr: 4, em: 4, jo: 1, ev: 3 }, money: 8.5, color: '#4C8DFF'
  },
  {
    id: 'plc', name: 'Partido Liberal-Conservador', sigla: 'PLC', ide: 1.8, label: 'Direita',
    desc: 'Pauta econômica liberal e costumes conservadores. Forte com empresários e evangélicos.',
    mods: { tr: -7, em: 15, jo: 3, ev: 12 }, money: 11, color: '#17B26A'
  },
  {
    id: 'psd', name: 'Partido Social Democrata', sigla: 'PSD', ide: 0.6, label: 'Centro-direita',
    desc: 'Gestores, prefeituras e agro. Discurso de eficiência e segurança.',
    mods: { tr: 1, em: 9, jo: -1, ev: 6 }, money: 9, color: '#F5B923'
  },
  {
    id: 'upt', name: 'União Popular Trabalhista', sigla: 'UPT', ide: -0.9, label: 'Centro-esquerda',
    desc: 'Sindicalismo moderado e juventude universitária. Bom alcance nas capitais.',
    mods: { tr: 9, em: -2, jo: 11, ev: -4 }, money: 6.5, color: '#B37BFF'
  }
];

var BACKGROUNDS = [
  {
    id: 'gov', name: 'Governador de estado', desc: 'Gestão comprovada e máquina estadual.',
    money: 7, sup: 7, pol: 8, mods: { tr: 4, em: 4, jo: 0, ev: 2 }
  },
  {
    id: 'sen', name: 'Senador da República', desc: 'Trânsito no Congresso e tempo de TV.',
    money: 8.5, sup: 4, pol: 14, mods: { tr: 2, em: 3, jo: -1, ev: 3 }
  },
  {
    id: 'emp', name: 'Empresário', desc: 'Caixa alto, discurso de mercado, pouca rua.',
    money: 15, sup: 1, pol: 4, mods: { tr: -6, em: 14, jo: 2, ev: 2 }
  },
  {
    id: 'sind', name: 'Líder sindical', desc: 'Base mobilizada e poder de greve.',
    money: 4.5, sup: 10, pol: 7, mods: { tr: 14, em: -9, jo: 4, ev: -2 }
  },
  {
    id: 'pref', name: 'Prefeito de capital', desc: 'Conhecimento de rua e mídia local.',
    money: 6, sup: 8, pol: 6, mods: { tr: 6, em: 2, jo: 5, ev: 1 }
  }
];

var STATES = [
  ['AC', 4, 0], ['AL', 9, 0], ['AP', 4, 0], ['AM', 8, 0], ['BA', 30, 0], ['CE', 22, 0],
  ['DF', 10, 1], ['ES', 10, 1], ['GO', 17, 1], ['MA', 16, 0], ['MT', 11, 1], ['MS', 10, 1],
  ['MG', 55, 1], ['PA', 17, 0], ['PB', 10, 0], ['PR', 30, 2], ['PE', 20, 0], ['PI', 8, 0],
  ['RJ', 46, 1], ['RN', 9, 0], ['RS', 31, 2], ['RO', 8, 0], ['RR', 4, 0], ['SC', 18, 2],
  ['SP', 110, 1], ['SE', 7, 0], ['TO', 6, 0]
].map(function (s) { return { uf: s[0], votes: s[1], reg: s[2] }; });
/* reg: 0=Norte/Nordeste (trabalhadores), 1=Sudeste (geral), 2=Sul/Centro-Oeste (agro/empresários) */

var RIVALS = [
  { id: 'r1', name: 'Coronel Whitaker', party: 'PLC', desc: 'Ex-capitão, pauta de armas e ordem. Discurso duro, base fiel.', base: 26 },
  { id: 'r2', name: 'Helena Duarte', party: 'FST', desc: 'Ex-ministra, professora. Forte nas capitais e entre jovens.', base: 21 },
  { id: 'r3', name: 'Ricardo Sampaio', party: 'MDB', desc: 'Prefeito de capital, sorriso fácil, alianças em todo lugar.', base: 16 },
  { id: 'r4', name: 'Pastor Elias Brandão', party: 'PLC', desc: 'Liderança evangélica, rede de templos e comunicação direta.', base: 13 },
  { id: 'r5', name: 'Marina Tavares', party: 'PSD', desc: 'Empresária do agro, discurso de eficiência e tecnologia.', base: 10 }
];

/* ============================ DEBATES (12) ============================ */
var DEBATES = [
  {
    q: 'O país tem 1,2 milhão de pessoas na fila da cirurgia eletiva. O que o senhor faz?',
    opts: [
      { l: 'Ampliar o SUS com verba permanente e mutirão nacional', g: { tr: 6, em: -2, jo: 4, ev: 1 } },
      { l: 'Comprar leitos na rede privada e zerar a fila em 12 meses', g: { tr: 4, em: 6, jo: 2, ev: 1 } },
      { l: 'Dar vouchers para o cidadão escolher o hospital', g: { tr: -3, em: 5, jo: 2, ev: 0 } }
    ]
  },
  {
    q: 'A dívida pública está em 79% do PIB. Qual é o seu compromisso fiscal?',
    opts: [
      { l: 'Meta de déficit zero e revisão de gastos tributários', g: { tr: -4, em: 9, jo: -1, ev: 1 } },
      { l: 'Nada de corte em saúde e educação: taxar os super-ricos', g: { tr: 7, em: -8, jo: 6, ev: 0 } },
      { l: 'Equilíbrio gradual, sem choque e sem aventura', g: { tr: 2, em: 3, jo: 1, ev: 2 } }
    ]
  },
  {
    q: 'Jovem de 19 anos sem estudo e sem emprego: como sai dessa?',
    opts: [
      { l: 'Bolsa-formação e primeiro emprego com carteira assinada', g: { tr: 5, em: -1, jo: 10, ev: 0 } },
      { l: 'Escola técnica em tempo integral e parceria com a indústria', g: { tr: 3, em: 5, jo: 6, ev: 1 } },
      { l: 'Menos imposto para quem contrata jovem', g: { tr: 0, em: 7, jo: 3, ev: 1 } }
    ]
  },
  {
    q: 'A violência nas periferias cresceu 22%. O que muda?',
    opts: [
      { l: 'Investimento social e policiamento de proximidade', g: { tr: 6, em: -3, jo: 6, ev: -2 } },
      { l: 'Mão dura, pena maior e mais armamento policial', g: { tr: -2, em: 5, jo: -4, ev: 8 } },
      { l: 'Federalizar a segurança com plano nacional integrado', g: { tr: 3, em: 1, jo: 2, ev: 2 } }
    ]
  },
  {
    q: 'A escala 6x1 domina o comércio. O senhor apoia o fim dela?',
    opts: [
      { l: 'Sim. Redução da jornada sem redução de salário', g: { tr: 11, em: -10, jo: 7, ev: -1 } },
      { l: 'Não. Custo do trabalho quebra o pequeno comércio', g: { tr: -7, em: 9, jo: -3, ev: 3 } },
      { l: 'Setorial: acordo por categoria, sem lei geral', g: { tr: 0, em: 4, jo: 0, ev: 1 } }
    ]
  },
  {
    q: 'A taxa de desemprego está em 8,4%. Qual o motor da retomada?',
    opts: [
      { l: 'Obra pública: saneamento, moradia e infraestrutura', g: { tr: 8, em: -2, jo: 3, ev: 1 } },
      { l: 'Desregulamentação e crédito barato para o setor privado', g: { tr: -4, em: 10, jo: 1, ev: 2 } },
      { l: 'Reindustrialização com conteúdo local obrigatório', g: { tr: 5, em: -1, jo: 3, ev: 0 } }
    ]
  },
  {
    q: 'Sobre a corrupção: como o senhor garante que não repete o passado?',
    opts: [
      { l: 'Transparência total: portas giratórias proibidas e dados abertos', g: { tr: 4, em: 2, jo: 6, ev: 1 } },
      { l: 'Tolerância zero com ministros e demissão no primeiro indício', g: { tr: 3, em: 3, jo: 2, ev: 4 } },
      { l: 'O Congresso investiga, não o governo: respeitar as instituições', g: { tr: -2, em: 1, jo: -3, ev: 0 } }
    ]
  },
  {
    q: 'A Amazônia registrou recorde de desmatamento. E agora?',
    opts: [
      { l: 'Fiscalização com satélite e embargo imediato de áreas ilegais', g: { tr: 0, em: -6, jo: 9, ev: -2 } },
      { l: 'Pagamento por preservação para quem produz na floresta', g: { tr: 4, em: 2, jo: 4, ev: 0 } },
      { l: 'Desenvolvimento primeiro: a floresta é recurso estratégico', g: { tr: 1, em: 8, jo: -6, ev: 2 } }
    ]
  },
  {
    q: 'O dólar subiu 18% e a gasolina encareceu. O que fazer?',
    opts: [
      { l: 'Subsidiar combustível e segurar o preço na bomba', g: { tr: 8, em: -6, jo: 2, ev: 1 } },
      { l: 'Deixar o mercado ajustar e cortar gastos para acalmar o câmbio', g: { tr: -7, em: 8, jo: -2, ev: 0 } },
      { l: 'Ampliar etanol e biocombustíveis com crédito subsidiado', g: { tr: 2, em: 4, jo: 2, ev: 0 } }
    ]
  },
  {
    q: 'Escolas sem internet e sem ar-condicionado. Prioridade?',
    opts: [
      { l: 'Conectar todas e pagar piso nacional do professor', g: { tr: 6, em: -2, jo: 5, ev: 1 } },
      { l: 'Escola cívico-militar em área de risco', g: { tr: -1, em: 2, jo: -3, ev: 8 } },
      { l: 'Voucher educacional para o pai escolher', g: { tr: -3, em: 6, jo: 0, ev: 3 } }
    ]
  },
  {
    q: 'A pauta de costumes voltou ao Congresso. Qual o seu papel?',
    opts: [
      { l: 'Não governo moral: o parlamento decide, eu cuido da economia', g: { tr: 1, em: 2, jo: 2, ev: -3 } },
      { l: 'Apoio integral à família tradicional e aos valores cristãos', g: { tr: -2, em: 1, jo: -7, ev: 12 } },
      { l: 'Defendo direitos de minorias e o Estado laico', g: { tr: 3, em: -2, jo: 10, ev: -9 } }
    ]
  },
  {
    q: 'Um prefeito aliado foi preso com dinheiro na cueca. E o senhor?',
    opts: [
      { l: 'Exonero de imediato e devolvo os recursos desviados', g: { tr: 3, em: 1, jo: 5, ev: 2 } },
      { l: 'Espero a Justiça e mantenho a aliança por lealdade', g: { tr: -5, em: 0, jo: -7, ev: -2 } },
      { l: 'Digo que é perseguição política da oposição', g: { tr: -3, em: -2, jo: -4, ev: 3 } }
    ]
  }
];

/* ====================== EVENTOS DE CAMPANHA (20) ====================== */
var CAMPAIGN_EVENTS = [
  {
    t: 'Vazamento de áudio', d: 'Um áudio seu irritado com "gente que não quer trabalhar" vazou e domina as redes.',
    opts: [
      { l: 'Pedir desculpas em vídeo, olhando na câmera', r: 'O tom humano ajudou a conter o dano.', g: { tr: 3, em: 1, jo: 4, ev: 0 } },
      { l: 'Dizer que foi recorte de contexto e ir ao ataque', r: 'A base gostou. O meio do eleitorado não.', g: { tr: 1, em: -2, jo: -3, ev: 1 } },
      { l: 'Ignorar e falar de economia na TV', r: 'O assunto morreu em 3 dias, mas a rejeição grudou.', g: { tr: -3, em: 2, jo: -2, ev: 0 } }
    ]
  },
  {
    t: 'Apoio de celebridade', d: 'Um cantor de 40 milhões de seguidores quer ir ao palco com você.',
    opts: [
      { l: 'Aceitar o palco conjunto (custa R$ 0,9 mi)', r: 'Multidão e engajamento digital explosivo.', g: { tr: 2, em: 0, jo: 8, ev: -1 }, m: -0.9 },
      { l: 'Aceitar só um vídeo de apoio', r: 'Menos brilho, menos risco.', g: { tr: 1, em: 0, jo: 4, ev: 0 } },
      { l: 'Recusar e criticar o "showmício"', r: 'Passou imagem de seriedade.', g: { tr: 1, em: 3, jo: -4, ev: 2 } }
    ]
  },
  {
    t: 'Fake news contra você', d: 'Circula áudio falso dizendo que você vai taxar o Pix e o celular.',
    opts: [
      { l: 'Campanha de esclarecimento com checagem paga', r: 'Mentira contida, mas custou caixa.', g: { tr: 3, em: 1, jo: 1, ev: 1 }, m: -0.7 },
      { l: 'Processar os perfis e ir à Polícia Federal', r: 'Os perfis apagaram. O assunto durou.', g: { tr: 1, em: 2, jo: -2, ev: 0 } },
      { l: 'Virar meme e rir de si mesmo', r: 'A internet adorou; o eleitor sério torceu o nariz.', g: { tr: -2, em: -2, jo: 7, ev: 0 } }
    ]
  },
  {
    t: 'Greve na sua base', d: 'Metalúrgicos entram em greve e cobram você publicamente.',
    opts: [
      { l: 'Ir ao portão da fábrica e apoiar a pauta', r: 'Base animada, mercado em alerta.', g: { tr: 10, em: -7, jo: 2, ev: 0 } },
      { l: 'Pressionar por acordo e manter neutralidade', r: 'Solução discreta, ninguém perdeu nem ganhou.', g: { tr: 2, em: 2, jo: 0, ev: 0 } },
      { l: 'Criticar a greve e falar em "refém da economia"', r: 'Empresários aplaudiram de pé.', g: { tr: -8, em: 8, jo: -1, ev: 2 } }
    ]
  },
  {
    t: 'Pesquisa ruim', d: 'Você caiu 4 pontos e a imprensa já fala em "derrota antecipada".',
    opts: [
      { l: 'Mudar o tom: discurso mais técnico e calmo', r: 'Recuperou credibilidade no meio.', g: { tr: 2, em: 4, jo: -1, ev: 2 }, m: 0 },
      { l: 'Radicalizar para mobilizar a militância', r: 'A base acordou. O centro se afastou.', g: { tr: 4, em: -4, jo: -3, ev: -1 } },
      { l: 'Comprar pesquisa interna favorável e divulgar', r: 'A imprensa desmontou em horas.', g: { tr: -3, em: -1, jo: -2, ev: -1 } }
    ]
  },
  {
    t: 'Convite para debate decisivo', d: 'A emissora oferece 40 minutos de sabatina sozinho, sem adversários.',
    opts: [
      { l: 'Aceitar — é vitrine nacional', r: 'Falou por 40 minutos para o país inteiro.', g: { tr: 3, em: 3, jo: 2, ev: 2 }, ap: -1 },
      { l: 'Aceitar, mas levando propostas escritas e números', r: 'Impressionou quem entende de economia.', g: { tr: 2, em: 5, jo: 1, ev: 1 }, ap: -1 },
      { l: 'Recusar e mandar o vice', r: 'Foi lido como fuga.', g: { tr: -2, em: -2, jo: -2, ev: -1 } }
    ]
  },
  {
    t: 'Foto polêmica', d: 'Uma foto sua de 12 anos atrás em festa com um empresário condenado reaparece.',
    opts: [
      { l: 'Explicar o contexto e seguir', r: 'Assunto cansou rápido.', g: { tr: 0, em: 1, jo: 0, ev: 0 } },
      { l: 'Acusar vazamento orquestrado pela oposição', r: 'Ficou dois dias na manchete.', g: { tr: -2, em: -1, jo: -2, ev: -1 } },
      { l: 'Discussão judicial e silêncio absoluto', r: 'Silêncio virou suspeita.', g: { tr: -3, em: -2, jo: -1, ev: -2 } }
    ]
  },
  {
    t: 'Apoio de prefeito popular', d: 'O prefeito mais bem avaliado do país quer entrar no palanque.',
    opts: [
      { l: 'Aliança formal e palanque conjunto', r: 'Transferência de voto direta naquele estado.', g: { tr: 3, em: 2, jo: 1, ev: 3 }, m: -1.2 },
      { l: 'Apoio discreto, sem palanque', r: 'Ajudou pouco, sem contaminar.', g: { tr: 1, em: 1, jo: 0, ev: 1 } },
      { l: 'Recusar: aliança com a velha política', r: 'Discurso antipolítica funcionou com jovens.', g: { tr: -3, em: -1, jo: 6, ev: -2 } }
    ]
  },
  {
    t: 'Crise econômica no meio da campanha', d: 'O dólar dispara e o desemprego sobe. O país quer respostas.',
    opts: [
      { l: 'Propor choque de investimento público', r: 'Falou a língua de quem perdeu o emprego.', g: { tr: 8, em: -6, jo: 3, ev: 1 } },
      { l: 'Propor ajuste fiscal imediato', r: 'Mercado aplaudiu; a rua esfriou.', g: { tr: -6, em: 9, jo: -2, ev: 1 } },
      { l: 'Prometer renda básica emergencial', r: 'Todo mundo gostou — e ninguém acreditou no custo.', g: { tr: 6, em: -3, jo: 5, ev: 2 } }
    ]
  },
  {
    t: 'Desastre natural', d: 'Enchentes destroem três cidades. Você é chamado a agir.',
    opts: [
      { l: 'Ir para o local e coordenar a ajuda (custa R$ 0,5 mi)', r: 'Imagens fortes e humanas na TV.', g: { tr: 4, em: 2, jo: 3, ev: 3 }, m: -0.5 },
      { l: 'Doar metade do fundo de campanha para as vítimas', r: 'Gestão cara, mas memorável.', g: { tr: 5, em: 3, jo: 4, ev: 4 }, m: -1.5 },
      { l: 'Cobrar o governo federal pela omissão', r: 'Política pura. Funcionou com parte do eleitorado.', g: { tr: 0, em: -1, jo: -2, ev: 0 } }
    ]
  },
  {
    t: 'Entrevista agressiva', d: 'O entrevistador te pressiona por 20 minutos sobre números que não fecham.',
    opts: [
      { l: 'Manter a calma e admitir o que não sabe', r: 'Raro e bem recebido.', g: { tr: 2, em: 2, jo: 2, ev: 1 } },
      { l: 'Devolver a pergunta com ironia', r: 'Corte viral, mas o eleitor mais velho detestou.', g: { tr: -2, em: 0, jo: 6, ev: -3 } },
      { l: 'Encerrar a entrevista ao vivo', r: 'Gestão de crise ruim.', g: { tr: -4, em: -3, jo: -1, ev: -3 } }
    ]
  },
  {
    t: 'Manifestação contra você', d: 'Grupo de 20 mil pessoas protesta na porta do seu comitê.',
    opts: [
      { l: 'Receber uma comissão e ouvir por duas horas', r: 'O protesto virou diálogo.', g: { tr: 3, em: 0, jo: 3, ev: 0 } },
      { l: 'Ignorar e seguir com a agenda', r: 'Seguiu o dia, a imagem ficou.', g: { tr: -2, em: 1, jo: -2, ev: 1 } },
      { l: 'Pedir que a polícia desmobilize', r: 'Cena desgastante na TV.', g: { tr: -5, em: 0, jo: -5, ev: 1 } }
    ]
  },
  {
    t: 'Sindicato quer compromisso assinado', d: 'A central sindical oferece apoio em troca de um compromisso de piso salarial.',
    opts: [
      { l: 'Assinar o compromisso em cartório', r: 'Apoio massivo e organizado.', g: { tr: 9, em: -6, jo: 2, ev: -1 } },
      { l: 'Prometer estudar o tema', r: 'Ninguém se comprometeu com ninguém.', g: { tr: 1, em: 1, jo: 0, ev: 0 } },
      { l: 'Recusar e propor produtividade', r: 'Discurso moderno, base fria.', g: { tr: -5, em: 6, jo: 1, ev: 2 } }
    ]
  },
  {
    t: 'Comício vazio', d: 'Sua equipe montou um palco para 30 mil e apareceram 3 mil pessoas.',
    opts: [
      { l: 'Assumir o erro da equipe publicamente', r: 'Transparência virou conteúdo.', g: { tr: 2, em: 1, jo: 4, ev: 1 } },
      { l: 'Dizer que a foto foi tirada antes do público chegar', r: 'A mentira durou 6 horas.', g: { tr: -3, em: -2, jo: -2, ev: -1 } },
      { l: 'Transformar em comício intimista e falar de perto', r: 'Virou um bom vídeo.', g: { tr: 2, em: 0, jo: 3, ev: 1 } }
    ]
  },
  {
    t: 'Grupo evangélico exige pauta', d: 'Uma frente de pastores quer compromisso com pauta de costumes.',
    opts: [
      { l: 'Assinar carta de compromisso', r: 'Rede de templos mobilizada.', g: { tr: -2, em: 1, jo: -5, ev: 11 } },
      { l: 'Prometer diálogo sem assinar nada', r: 'Ficou no morno.', g: { tr: 1, em: 1, jo: 1, ev: 2 } },
      { l: 'Recusar e defender Estado laico', r: 'Princípio firme, custo eleitoral.', g: { tr: 2, em: -1, jo: 6, ev: -8 } }
    ]
  },
  {
    t: 'Debate entre os adversários', d: 'Seus cinco adversários se atacam entre si. Você é ignorado.',
    opts: [
      { l: 'Entrar na briga e atacar o líder das pesquisas', r: 'Ganhou tempo de tela e risco.', g: { tr: 0, em: 0, jo: 3, ev: 0 } },
      { l: 'Ficar acima da briga e apresentar propostas', r: 'Passou imagem presidencial.', g: { tr: 2, em: 4, jo: 1, ev: 2 } },
      { l: 'Provocar os dois favoritos ao mesmo tempo', r: 'Memorável. Perigoso.', g: { tr: 1, em: -1, jo: 5, ev: -1 } }
    ]
  },
  {
    t: 'Processo na Justiça Eleitoral', d: 'A oposição pede sua cassação por suposta compra de votos.',
    opts: [
      { l: 'Apresentar todas as contas e notas fiscais', r: 'Transparência encerrou o caso.', g: { tr: 2, em: 3, jo: 1, ev: 1 } },
      { l: 'Atacar o Judiciário publicamente', r: 'Base radicalizou, instituições reagiram.', g: { tr: 2, em: -4, jo: 3, ev: 1 } },
      { l: 'Silêncio e trabalho de bastidor', r: 'Caso arquivado, sem glória.', g: { tr: 0, em: 1, jo: -1, ev: 0 } }
    ]
  },
  {
    t: 'Banqueiros querem conversa', d: 'A FEBRABAN pede reunião reservada com você.',
    opts: [
      { l: 'Reunião reservada com compromisso fiscal', r: 'Crédito e doações apareceram.', g: { tr: -3, em: 9, jo: 0, ev: 1 }, m: 2.5 },
      { l: 'Reunião pública e transparente', r: 'Nada de acordos escondidos.', g: { tr: 3, em: -2, jo: 4, ev: 0 }, m: 0.5 },
      { l: 'Recusar o encontro', r: 'Mercado abriu spread contra você.', g: { tr: 2, em: -7, jo: 3, ev: 0 }, m: -1 }
    ]
  },
  {
    t: 'Eleitor sem resposta', d: 'Na feira, uma senhora diz: "meu filho não consegue consulta, e aí?"',
    opts: [
      { l: 'Parar a agenda e ouvir por 20 minutos', r: 'O vídeo correu o país.', g: { tr: 6, em: 1, jo: 3, ev: 3 } },
      { l: 'Prometer consulta em 30 dias', r: 'Promessa perigosa, mas eficaz.', g: { tr: 4, em: 0, jo: 1, ev: 2 } },
      { l: 'Explicar a complexidade do SUS', r: 'Tecnicamente correto, politicamente frio.', g: { tr: -2, em: 1, jo: -1, ev: 0 } }
    ]
  },
  {
    t: 'Boato de desistência', d: 'Circula que você abandonaria a candidatura para apoiar outro nome.',
    opts: [
      { l: 'Vídeo curto e direto: "eu estou aqui até o fim"', r: 'Cortou o boato na raiz.', g: { tr: 3, em: 2, jo: 2, ev: 3 } },
      { l: 'Coletiva de imprensa completa', r: 'Resolveu, com desgaste.', g: { tr: 1, em: 1, jo: 0, ev: 1 }, ap: -1 },
      { l: 'Aproveitar para negociar apoio em troca de espaço', r: 'Virou notícia de bastidor.', g: { tr: -3, em: 0, jo: -3, ev: -1 } }
    ]
  }
];
