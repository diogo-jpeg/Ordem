/* Dados baseados no PDF enviado pelo usuário (versão 0.2 exibida no arquivo). */
window.OPR_DATA = (() => {
  const nexLevels = [5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,99];
  const peRound = Object.fromEntries(nexLevels.map((n,i)=>[n,i+1]));

  const origins = [
    {id:'academico',name:'Acadêmico',skills:['Ciências','Investigação'],power:'Saber é Poder',powerText:'Uma vez por cena, quando fizer um teste usando Intelecto, você pode gastar 2 PE para receber +5 nesse teste.',desc:'Você era pesquisador ou professor universitário e seus estudos tocaram em assuntos misteriosos que chamaram a atenção da Ordo Realitas.'},
    {id:'agente-saude',name:'Agente de Saúde',skills:['Intuição','Medicina'],power:'Técnica Medicinal',powerText:'Sempre que cura um personagem, você adiciona seu Intelecto no total de PV curados.',desc:'Você era um profissional da saúde, como enfermeiro, farmacêutico, médico, psicólogo ou socorrista, e teve contato com um evento paranormal ou com agentes da Ordem.'},
    {id:'amnesico',name:'Amnésico',skills:['À escolha do mestre','À escolha do mestre'],power:'Vislumbres do Passado',powerText:'Uma vez por missão, faça um teste de Intelecto (DT 10) para reconhecer pessoas ou lugares familiares. Se passar, recebe 1d4 PE temporários e, a critério do mestre, uma informação útil.',desc:'Você perdeu a maior parte da memória. A Ordem é a única família que conhece e suas missões podem revelar fragmentos do passado.'},
    {id:'artista',name:'Artista',skills:['Artes','Enganação'],power:'Magnum Opus',powerText:'Uma vez por missão, pode determinar que um personagem envolvido em uma cena de interação reconheça uma de suas obras. Você recebe +5 em Diplomacia, Enganação, Intuição e Intimidação contra ele; o mestre pode aplicar o bônus a outras situações em que sua fama seja relevante.',desc:'Você era ator, músico, escritor, dançarino, influenciador ou outro artista, talvez inspirado por uma experiência paranormal.'},
    {id:'atleta',name:'Atleta',skills:['Acrobacia','Atletismo'],power:'110%',powerText:'Uma vez por cena, ao fazer um teste de perícia usando Força ou Agilidade (exceto testes de ataque), pode gastar 2 PE para receber +5 nesse teste.',desc:'Você competia em algum esporte e seu desempenho ou uma competição acabou aproximando você do Paranormal.'},
    {id:'criminoso',name:'Criminoso',skills:['Crime','Furtividade'],power:'O Crime Compensa',powerText:'No final de uma missão, escolha um item encontrado nela. Na missão seguinte, pode incluir esse item no inventário sem que ele conte em seu limite de itens por Prestígio.',desc:'Você vivia fora da lei e acabou envolvido em um assunto da Ordem. Seus talentos foram considerados mais úteis dentro da organização.'},
    {id:'cultista-arrependido',name:'Cultista Arrependido',skills:['Enganação','Ocultismo'],power:'Traços do Outro Lado',powerText:'Você possui um poder paranormal à sua escolha.',desc:'Você fez parte de um culto paranormal e agora luta do lado da Ordem, embora carregue traços e desconfianças de sua vida pregressa.'},
    {id:'desgarrado',name:'Desgarrado',skills:['Fortitude','Sobrevivência'],power:'Calejado',powerText:'Você recebe +5 pontos de vida.',desc:'Você vivia fora dos padrões da sociedade; a vida sem os confortos modernos tornou você mais resistente.'},
    {id:'engenheiro',name:'Engenheiro',skills:['Profissão','Tecnologia'],power:'Ferramentas Favoritas',powerText:'Escolha um kit de perícia. Para você, a categoria dele é considerada uma abaixo da real (mínimo 0).',desc:'Você é engenheiro, inventor ou alguém acostumado a transformar teoria em soluções práticas.'},
    {id:'executivo',name:'Executivo',skills:['Diplomacia','Profissão'],power:'Processo Otimizado',powerText:'Sempre que faz um teste de perícia durante um teste estendido, pode pagar 2 PE para receber +5 nesse teste.',desc:'Você trabalhava em uma empresa, banco ou corporação e descobriu algo que não devia.'},
    {id:'investigador',name:'Investigador',skills:['Investigação','Percepção'],power:'Faro para Pistas',powerText:'Uma vez por cena, quando fizer um teste para procurar pistas, pode gastar 2 PE para receber +5 nesse teste.',desc:'Você era investigador governamental ou privado e foi recrutado por suas habilidades de resolução de mistérios.'},
    {id:'lutador',name:'Lutador',skills:['Luta','Reflexos'],power:'Mão Pesada',powerText:'Você recebe +1 em rolagens de dano com ataques corpo a corpo.',desc:'Você pratica arte marcial, esporte de luta ou aprendeu a brigar nas ruas.'},
    {id:'magnata',name:'Magnata',skills:['Diplomacia','Pilotagem'],power:'Patrocinador da Ordem',powerText:'Seu limite de crédito é sempre considerado um acima do atual.',desc:'Você possui muito dinheiro ou patrimônio e passou a empregar seus recursos na luta contra o Outro Lado.'},
    {id:'mercenario',name:'Mercenário',skills:['Iniciativa','Intimidação'],power:'Posição de Combate',powerText:'No primeiro turno de cada cena de ação, pode gastar 2 PE para receber uma ação de movimento adicional.',desc:'Você era soldado de aluguel e se envolveu com o Paranormal durante algum serviço.'},
    {id:'militar',name:'Militar',skills:['Pontaria','Tática'],power:'Para Bellum',powerText:'Você recebe +1 em rolagens de dano com armas de fogo.',desc:'Você serviu em uma força militar e está acostumado a missões, ordens e armas de fogo.'},
    {id:'operario',name:'Operário',skills:['Fortitude','Profissão'],power:'Ferramentas da Profissão',powerText:'Escolha uma arma simples ou tática que, a critério do mestre, poderia ser usada como ferramenta na sua profissão. Você sabe usar a arma escolhida e recebe +2 nas rolagens de dano com ela.',desc:'Você trabalhou em atividade braçal ou industrial e desenvolveu uma visão prática e pragmática.'},
    {id:'policial',name:'Policial',skills:['Percepção','Pontaria'],power:'Patrulha',powerText:'Você recebe +1 em Defesa.',desc:'Você pertenceu a uma força de segurança pública e sobreviveu a um caso paranormal.'},
    {id:'religioso',name:'Religioso',skills:['Religião','Vontade'],power:'Acalentar',powerText:'Pode usar Religião no lugar de Diplomacia para a ação acalmar. Quando acalma uma pessoa, ela fica com 1d6 de Sanidade, em vez de 1.',desc:'Você é devoto ou sacerdote e seu trabalho espiritual acabou levando você ao Paranormal.'},
    {id:'servidor-publico',name:'Servidor Público',skills:['Intuição','Vontade'],power:'Espírito Cívico',powerText:'Sempre que faz um teste para prestar ajuda, pode gastar 1 PE para aumentar o bônus concedido em +2.',desc:'Você tinha carreira em um órgão público e encontrou o paranormal por trás da burocracia.'},
    {id:'teorico',name:'Teórico da Conspiração',skills:['Investigação','Ocultismo'],power:'Eu Já Sabia',powerText:'Uma vez por cena, pode gastar 3 PE para ignorar um dano em Sanidade.',desc:'Sua pesquisa de teorias conspiratórias esbarrou no que realmente existe por trás da Realidade.'},
    {id:'ti',name:'T.I.',skills:['Investigação','Tecnologia'],power:'Motor de Busca',powerText:'A critério do mestre, sempre que tiver acesso à internet, pode gastar 2 PE para substituir um teste de perícia qualquer por um teste de Tecnologia.',desc:'Você trabalha com sistemas e informática, e seu talento ou curiosidade chamou a atenção da Ordem.'},
    {id:'rural',name:'Trabalhador Rural',skills:['Adestramento','Sobrevivência'],power:'Desbravador',powerText:'Você não sofre penalidade em deslocamento e Sobrevivência por clima ruim e terreno difícil natural.',desc:'Você trabalhava no campo ou em regiões isoladas e descobriu que algumas histórias ao redor da fogueira eram verdadeiras.'},
    {id:'trambiqueiro',name:'Trambiqueiro',skills:['Crime','Enganação'],power:'Impostor',powerText:'Uma vez por cena, pode gastar 2 PE para substituir um teste de perícia qualquer por um teste de Enganação.',desc:'Você vivia de pequenos golpes e falcatruas antes de acabar servindo à Ordem.'},
    {id:'universitario',name:'Universitário',skills:['Atualidades','Investigação'],power:'Empenho',powerText:'Quando faz um teste de perícia, pode gastar 2 PE para receber +1d6 nesse teste.',desc:'Você era estudante universitário e descobriu o paranormal em meio à rotina acadêmica.'}
  ];

  const commonPowers = {
    combatente:[
      ['Acuidade com Arma','Ao usar arma leve corpo a corpo ou arma de arremesso, pode usar Agilidade no lugar de Força nos testes de ataque e rolagens de dano.','Agi 2'],
      ['Armamento Pesado','Você recebe proficiência com Armas Pesadas.',''],
      ['Ataque de Oportunidade','Quando um inimigo sai voluntariamente de um espaço adjacente, pode gastar uma reação e 1 PE para realizar um ataque contra ele.',''],
      ['Combater com Duas Armas','Ao usar duas armas (ao menos uma leve) e fazer a ação agredir, pode fazer dois ataques, um com cada arma. Sofre –1d nos testes de ataque até o próximo turno.','Agi 3; treinado em Luta ou Pontaria'],
      ['Combate Defensivo','Ao usar a ação agredir, pode sofrer –1d nos testes de ataque até o próximo turno para receber +5 na Defesa.','Int 2'],
      ['Golpe Demolidor','Ao usar a manobra quebrar ou atacar objeto, pode gastar 1 PE para causar dois dados de dano extra do mesmo tipo da arma.','For 2; treinado em Luta'],
      ['Golpe Pesado','O dano de suas armas corpo a corpo aumenta em um passo.',''],
      ['Incansável','Uma vez por cena, pode gastar 2 PE para fazer uma ação de investigação adicional usando Força ou Agilidade como atributo-base.',''],
      ['Presteza Atlética','Ao fazer teste de Facilitar a Investigação, pode gastar 1 PE para usar Força ou Agilidade no lugar do atributo-base. Se passar, o próximo aliado que usar seu bônus também recebe +1d.',''],
      ['Proteção Pesada','Você recebe proficiência com Proteções Pesadas.','NEX 30%'],
      ['Reflexos Defensivos','Você recebe +5 em Defesa e em testes de resistência contra inimigos em alcance curto.','Agi 2'],
      ['Saque Rápido','Pode sacar ou guardar itens como ação livre. A recarga de arma de disparo diminui uma categoria de ação.','treinado em Iniciativa'],
      ['Segurar o Gatilho','Ao acertar ataque com arma de fogo, pode fazer outro no mesmo alvo pagando PE igual ao número de ataques já realizados no turno, repetindo enquanto acertar e houver PE/munição.','NEX 60%'],
      ['Sentido Tático','Pode gastar ação de movimento e 2 PE para analisar o ambiente; recebe +5 em Defesa e testes de resistência até o fim da cena.','treinado em Percepção e Tática'],
      ['Tanque de Guerra','Se estiver usando proteção pesada, a Defesa e a resistência a dano que ela fornece aumentam em +2.','Proteção Pesada'],
      ['Tiro Certeiro','Com arma de disparo, soma Agilidade no dano e ignora a penalidade contra alvos envolvidos em combate corpo a corpo.','treinado em Pontaria'],
      ['Tiro de Cobertura','Ação padrão e 1 PE: teste de Pontaria contra Vontade de alvo no alcance da arma. Se vencer, o alvo não pode sair do lugar e sofre –5 em ataques até seu próximo turno.',''],
      ['Transcender','Escolha um poder paranormal. Você recebe o poder, perdendo Sanidade conforme as regras de Transcender. Pode escolher este poder várias vezes.',''],
      ['Treinamento em Perícia','Escolha duas perícias e torne-se treinado. A partir de NEX 35%, pode elevar treinado para veterano; a partir de NEX 70%, veterano para expert. Pode escolher várias vezes.','']
    ],
    especialista:[
      ['Acuidade com Arma','Ao usar arma leve corpo a corpo ou arma de arremesso, pode usar Agilidade no lugar de Força nos testes de ataque e dano.','Agi 2'],
      ['Balística Avançada','Recebe proficiência com armas táticas de fogo e +2 em rolagens de dano com essas armas.',''],
      ['Conhecimento Aplicado','Ao fazer teste de perícia, exceto Luta e Pontaria, pode gastar 2 PE para mudar o atributo-base para Intelecto.','Int 2'],
      ['Hacker','Recebe +5 em Tecnologia para invadir sistemas e reduz o tempo de hackear qualquer sistema para uma ação completa.','treinado em Tecnologia'],
      ['Mãos Rápidas','Ao fazer um teste de Crime, pode pagar o custo indicado no livro para fazê-lo como ação livre.','Agi 3; treinado em Crime'],
      ['Mochila de Utilidades','Escolha um kit de perícia; ele conta como uma categoria abaixo e ocupa 1 espaço a menos.',''],
      ['Movimento Tático','Pode gastar 1 PE para ignorar penalidade de terreno difícil e receber deslocamento de escalada igual ao seu deslocamento até o fim do turno.','treinado em Atletismo'],
      ['Na Trilha Certa','Ao ter sucesso num teste para procurar pistas durante cena de interação, pode gastar 1 PE para receber +1d no próximo teste. Custos e bônus podem acumular.',''],
      ['Nerd','Uma vez por cena, pode gastar 2 PE e fazer Atualidades DT 20. Se passar, recebe uma informação útil para a cena.',''],
      ['Ninja Urbano','Recebe proficiência com armas táticas corpo a corpo e +2 em rolagens de dano com essas armas.',''],
      ['Pensamento Ágil','Uma vez por rodada, durante cena de investigação, pode gastar 2 PE para fazer uma ação de procurar pistas adicional.',''],
      ['Perito em Explosivos','Soma Intelecto à DT para resistir aos seus explosivos e pode excluir dos efeitos número de alvos igual ao Intelecto.',''],
      ['Primeira Impressão','Recebe +2d no primeiro teste de Diplomacia, Enganação, Intimidação ou Intuição que fizer em uma cena.',''],
      ['Transcender','Escolha um poder paranormal. Você recebe o poder, perdendo Sanidade conforme as regras de Transcender. Pode escolher várias vezes.',''],
      ['Treinamento em Perícia','Escolha duas perícias e torne-se treinado. A partir de NEX 35% pode elevar para veterano; a partir de NEX 70%, para expert. Pode escolher várias vezes.','']
    ],
    ocultista:[
      ['Camuflar Ocultismo','Pode esconder símbolos e sigilos desenhados ou gravados em objetos ou na pele. Ao lançar ritual, pode gastar +2 PE para conjurá-lo sem gesticular/falar; observadores só percebem com Ocultismo DT 20.',''],
      ['Envolto em Mistério','Recebe +5 em Enganação e Intimidação contra pessoas ignorantes ou supersticiosas, a critério do mestre.',''],
      ['Especialista em Elemento','Escolha um Elemento. A DT para resistir aos seus rituais desse Elemento aumenta em +2.',''],
      ['Ferramentas Paranormais','Uma vez por cena, pode ativar um equipamento paranormal sem custo; ainda paga custos por rodada.',''],
      ['Fluxo de Poder','Pode manter dois efeitos sustentados de rituais ativos simultaneamente com uma ação livre, pagando cada custo separadamente.','NEX 60%'],
      ['Guiado pelo Paranormal','Uma vez por cena, pode gastar 2 PE para fazer uma ação de investigação adicional.',''],
      ['Identificação Paranormal','Recebe +10 em Ocultismo para identificar criatura, objeto ou ritual.',''],
      ['Intuição Paranormal','Ao usar facilitar investigação, soma Intelecto ou Presença no teste, à sua escolha.',''],
      ['Mestre em Elemento','Escolha um Elemento. O custo para lançar rituais desse Elemento diminui em –1 PE.','Especialista em Elemento no mesmo Elemento; NEX 45%'],
      ['Ritual Potente','Soma Intelecto nas rolagens de dano ou nos efeitos de cura de seus rituais.','Int 1'],
      ['Ritual Predileto','Escolha um ritual conhecido. Reduz em –1 PE seu custo; acumula com outras reduções.',''],
      ['Tatuagem Ritualística','Símbolos na pele reduzem em –1 PE o custo de rituais de alcance pessoal que tenham você como alvo.',''],
      ['Transcender','Escolha um poder paranormal. Você recebe o poder, perdendo Sanidade conforme as regras de Transcender. Pode escolher várias vezes.',''],
      ['Treinamento em Perícia','Escolha duas perícias e torne-se treinado. A partir de NEX 35% pode elevar para veterano; a partir de NEX 70%, para expert. Pode escolher várias vezes.','']
    ]
  };
  const powerObj = (arr,cls)=>arr.map((p,i)=>({id:`${cls}-p${i}`,name:p[0],text:p[1],req:p[2]||'',class:cls}));

  const trails = {
    combatente:[
      {id:'aniquilador',name:'Aniquilador',desc:'Especialista em abater alvos com eficiência e em cuidar de uma arma favorita.',abilities:[
        {nex:10,name:'A Favorita',text:'Escolha uma arma. A categoria dela é reduzida em I e ela ocupa 1 espaço a menos (mínimo 0). A redução de categoria aumenta para II em NEX 40%, III em 65% e IV em 99%.'},
        {nex:40,name:'Técnica Secreta',text:'Ao atacar com a arma favorita, pode gastar 2 PE para aplicar Amplo (atinge alvo adicional adjacente ao original) ou Destruidor (+1 no multiplicador de crítico). Pode adicionar efeitos por +2 PE cada.'},
        {nex:65,name:'Técnica Sublime',text:'Adiciona Letal (+2 na margem de ameaça; pode escolher duas vezes para total +5) e Perfurante (ignora até 5 pontos de resistência a dano) à Técnica Secreta.'},
        {nex:99,name:'Máquina de Matar',text:'A arma favorita recebe +2 na margem de ameaça e seu dano aumenta em um passo.'}]},
      {id:'comandante',name:'Comandante de Campo',desc:'Coordena aliados e tira melhor proveito do posicionamento da equipe.',abilities:[
        {nex:10,name:'Inspirar Confiança',text:'Reação e 2 PE para fazer um aliado em alcance curto rolar novamente um teste recém-realizado.'},
        {nex:40,name:'Estrategista',text:'Ação padrão e 1 PE por aliado (limitado pelo Intelecto): cada aliado direcionado em alcance curto ganha uma ação de movimento no próximo turno.'},
        {nex:65,name:'Brecha na Guarda',text:'Uma vez por rodada, quando um aliado causa dano a inimigo em alcance curto, reação e 2 PE para você ou outro aliado fazer ataque adicional contra o mesmo inimigo.'},
        {nex:99,name:'Oficial Comandante',text:'Ação completa e 5 PE: cada aliado visível em alcance médio recebe uma ação padrão adicional no próximo turno.'}]},
      {id:'guerreiro',name:'Guerreiro',desc:'Treinamento físico focado em combate corpo a corpo.',abilities:[
        {nex:10,name:'Técnica Letal',text:'+2 na margem de ameaça de todos os ataques corpo a corpo.'},
        {nex:40,name:'Revidar',text:'Sempre que bloquear um ataque, pode gastar reação e 2 PE para fazer ataque corpo a corpo no inimigo.'},
        {nex:65,name:'Força Opressora',text:'Ao acertar ataque corpo a corpo, pode gastar 1 PE para derrubar ou empurrar como ação livre, com benefícios adicionais conforme dano/manobra.'},
        {nex:99,name:'Potência Máxima',text:'Ao usar Ataque Especial com armas corpo a corpo, todos os bônus numéricos escolhidos são dobrados.'}]},
      {id:'operacoes',name:'Operações Especiais',desc:'Combatente otimizado para agir rápido e fazer mais ações.',abilities:[
        {nex:10,name:'Iniciativa Aprimorada',text:'+5 em Iniciativa.'},
        {nex:40,name:'Ataque Extra',text:'Uma vez por rodada, ao fazer um ataque, pode gastar 2 PE para fazer um ataque adicional.'},
        {nex:65,name:'Surto de Adrenalina',text:'Uma vez por rodada, pode gastar 5 PE para realizar uma ação padrão ou de movimento adicional.'},
        {nex:99,name:'Sempre Alerta',text:'Recebe uma ação padrão adicional no início de cada cena de combate.'}]},
      {id:'tropa',name:'Tropa de Choque',desc:'Resiste a traumas e protege aliados na linha de frente.',abilities:[
        {nex:10,name:'Casca Grossa',text:'Recebe +1 PV para cada 5% de NEX e, quando bloqueia, soma Vigor na resistência a dano.'},
        {nex:40,name:'Cai Dentro',text:'Quando oponente em alcance curto ataca um aliado, reação e 1 PE para forçá-lo a testar Vontade (DT Vig); se falhar, deve atacar você se isso for possível.'},
        {nex:65,name:'Duro de Matar',text:'Ao sofrer dano não mágico, reação e 2 PE para reduzir o dano à metade. Em NEX 99%, também funciona contra dano mágico.'},
        {nex:99,name:'Inquebrável',text:'Enquanto machucado, +10 Defesa e RD 5. Enquanto morrendo, não fica indefeso e ainda pode agir, seguindo as regras de morte.'}]}
    ],
    especialista:[
      {id:'atirador',name:'Atirador de Elite',desc:'Neutraliza ameaças à distância com precisão.',abilities:[
        {nex:10,name:'Mira de Elite',text:'Proficiência com armas de fogo longas e soma Intelecto no dano com elas.'},
        {nex:40,name:'Disparo Letal',text:'Ao mirar, pode gastar 1 PE para +2 na margem de ameaça do próximo ataque até o fim do próximo turno.'},
        {nex:65,name:'Disparo Impactante',text:'Com arma de fogo de calibre médio ou grosso, pode gastar 2 PE para fazer manobras derrubar, desarmar, empurrar e quebrar usando ataque à distância.'},
        {nex:99,name:'Atirar para Matar',text:'Ao fazer acerto crítico com arma de fogo, causa dano máximo sem rolar dados.'}]},
      {id:'infiltrador',name:'Infiltrador',desc:'Especialista em infiltração, furtividade e neutralização de alvos desprevenidos.',abilities:[
        {nex:10,name:'Ataque Furtivo',text:'Uma vez por rodada, ao atingir alvo desprevenido/flanqueado com ataque corpo a corpo ou em alcance curto, gaste 1 PE para +1d6 de dano; aumenta para +2d6/+3d6/+4d6 em NEX 40/65/99.'},
        {nex:40,name:'Gatuno',text:'+5 em Atletismo e Crime e pode percorrer deslocamento normal ao se esconder sem penalidade.'},
        {nex:65,name:'Assassinar',text:'Ação de movimento e 3 PE para analisar alvo em alcance curto; o primeiro Ataque Furtivo até fim do próximo turno dobra os dados extras e pode deixar o alvo inconsciente ou morrendo (Fortitude DT Agi evita).'},
        {nex:99,name:'Sombra Fugaz',text:'Ao testar Furtividade após atacar ou fazer ação chamativa, pode gastar 3 PE para não sofrer a penalidade indicada pelo livro.'}]},
      {id:'medico',name:'Médico de Campo',desc:'Primeiros socorros e tratamento de emergência em combate.',req:'Treinado em Medicina',abilities:[
        {nex:10,name:'Paramédico',text:'Ação padrão e 2 PE para curar 2d10 PV de aliado adjacente; +1d10 em NEX 40, 65 e 99, pagando +1 PE por dado adicional.'},
        {nex:40,name:'Equipe de Trauma',text:'Ação padrão e 2 PE para remover uma condição negativa (exceto morrendo) de aliado adjacente.'},
        {nex:65,name:'Resgate',text:'Uma vez por rodada, pode se aproximar livremente de aliado machucado/morrendo em alcance curto. Ao curar/remover condição, ambos recebem +5 Defesa até próximo turno. Carregar personagem ocupa metade dos espaços para você.'},
        {nex:99,name:'Reanimação',text:'Uma vez por cena, ação completa e 10 PE para trazer de volta à vida personagem que morreu na mesma cena, exceto por dano massivo.'}]},
      {id:'negociador',name:'Negociador',desc:'Influência social, diplomacia e manipulação.',abilities:[
        {nex:10,name:'Eloquência',text:'Ação completa e 1 PE por alvo em alcance curto: Diplomacia, Enganação ou Intimidação contra Vontade para fascinar enquanto mantiver concentração.'},
        {nex:40,name:'Discurso Motivador',text:'Ação padrão e 4 PE: você e aliados em alcance curto ganham +1d em testes de perícia até fim da cena; em NEX 65% pode gastar 8 PE para +2d.'},
        {nex:65,name:'Eu Conheço um Cara',text:'Uma vez por missão, ativa rede de contatos para pedir favor relevante; o mestre decide disponibilidade e alcance do favor.'},
        {nex:99,name:'Truque de Mestre',text:'Gaste 5 PE para simular habilidade que viu um aliado usar na cena; ignora pré-requisitos, mas paga custos e usa seus próprios parâmetros.'}]},
      {id:'tecnico',name:'Técnico',desc:'Manutenção, improviso e otimização do equipamento do grupo.',abilities:[
        {nex:10,name:'Inventário Otimizado',text:'Some Intelecto à Força para calcular capacidade de inventário. Ex.: For 1 + Int 3 = 20 espaços.'},
        {nex:40,name:'Remendão',text:'Ação completa e 1 PE para remover quebrado de equipamento adjacente até fim da cena. Equipamentos de investigação têm categoria reduzida em I para você.'},
        {nex:65,name:'Improvisar',text:'Ação completa e 2 PE +2 PE por categoria para improvisar equipamento de investigação funcional até o fim da cena.'},
        {nex:99,name:'Preparado para Tudo',text:'Quando precisar de equipamento de investigação ou combate (não arma) fora do inventário, pode gastar 3 PE por categoria para revelar que o carregava; depois segue regras normais de inventário.'}]}
    ],
    ocultista:[
      {id:'conduite',name:'Conduíte',desc:'Amplia alcance, velocidade e controle sobre rituais.',abilities:[
        {nex:10,name:'Ampliar Ritual',text:'Ao lançar ritual, +2 PE para aumentar alcance em um passo ou dobrar área de efeito.'},
        {nex:40,name:'Acelerar Ritual',text:'Uma vez por rodada, +4 PE para conjurar ritual como ação livre.'},
        {nex:65,name:'Anular Ritual',text:'Quando for alvo de ritual, gaste PE igual ao custo pago e faça teste oposto de Ocultismo; se vencer, anula o ritual.'},
        {nex:99,name:'Canalizar o Medo',text:'Aprende o ritual Canalizar o Medo.'}]},
      {id:'flagelador',name:'Flagelador',desc:'Transforma dor em combustível para rituais.',abilities:[
        {nex:10,name:'Poder do Flagelo',text:'Ao conjurar ritual, pode pagar PE com PV na taxa de 2 PV por 1 PE; PV gastos assim só voltam com descanso.'},
        {nex:40,name:'Abraçar a Dor',text:'Ao sofrer dano não mágico, reação e 2 PE para reduzir o dano à metade.'},
        {nex:65,name:'Absorver Agonia',text:'Ao reduzir inimigos a 0 PV com ritual, recebe PE temporários iguais ao círculo do ritual.'},
        {nex:99,name:'Medo Tangível',text:'Aprende o ritual Medo Tangível.'}]},
      {id:'graduado',name:'Graduado',desc:'Conjurador versátil com repertório ampliado de rituais.',abilities:[
        {nex:10,name:'Saber Ampliado',text:'Aprende um ritual adicional de 1º círculo e, ao ganhar acesso a novo círculo, aprende um ritual adicional desse círculo. Não contam no limite de rituais.'},
        {nex:40,name:'Grimório Ritualístico',text:'Cria grimório e aprende quantidade de rituais igual ao Intelecto, de círculos disponíveis. Para lançar ritual do grimório, gasta uma ação completa para consultá-lo primeiro.'},
        {nex:65,name:'Rituais Eficientes',text:'A DT para resistir a todos os seus rituais aumenta em +5.'},
        {nex:99,name:'Conhecendo o Medo',text:'Aprende o ritual Conhecendo o Medo.'}]},
      {id:'intuitivo',name:'Intuitivo',desc:'Resistência mental e domínio dos efeitos do Outro Lado.',abilities:[
        {nex:10,name:'Mente Sã',text:'Recebe resistência paranormal +5 (+5 em testes de resistência contra efeitos paranormais).'},
        {nex:40,name:'Presença Poderosa',text:'Soma Presença ao limite de PE por rodada, apenas para conjurar rituais.'},
        {nex:65,name:'Inabalável',text:'Recebe resistência a dano mental e paranormal igual à Presença. Se passar em Vontade que reduziria dano paranormal à metade, não sofre dano.'},
        {nex:99,name:'Presença do Medo',text:'Aprende o ritual Presença do Medo.'}]},
      {id:'lamina',name:'Lâmina Paranormal',desc:'Mistura combate e conjuração em uma única técnica.',abilities:[
        {nex:10,name:'Lâmina Maldita',text:'Aprende Amaldiçoar Arma; se já conhecia, reduz custo em –1 PE. Pode usar Ocultismo no lugar de Luta/Pontaria para ataques com a arma amaldiçoada.'},
        {nex:40,name:'Gladiador Paranormal',text:'Ao acertar ataque corpo a corpo, recebe 2 PE temporários, limitado pelo seu limite de PE por rodada por cena.'},
        {nex:65,name:'Conjuração Marcial',text:'Uma vez por rodada, ao lançar ritual com execução padrão, pode gastar 2 PE para fazer ataque corpo a corpo como ação livre.'},
        {nex:99,name:'Lâmina do Medo',text:'Aprende o ritual Lâmina do Medo.'}]}
    ]
  };

  const classes = {
    combatente:{id:'combatente',name:'Combatente',summary:'Perito em armas brancas e de fogo, linha de frente contra o Outro Lado.',pvBase:20,pvStep:4,peBase:2,peStep:2,sanBase:12,sanStep:3,prof:['Armas simples','Armas táticas','Proteções leves'],skillsText:'Luta ou Pontaria; Fortitude ou Reflexos; + (1 + Intelecto) perícias.',powers:powerObj(commonPowers.combatente,'combatente'),trails:trails.combatente,ability:'Ataque Especial',abilityText:'Ao atacar, pode gastar 2 PE para +5 no ataque ou no dano. Em NEX 25%, 55% e 85% aumenta o máximo de PE/bônus conforme a progressão da classe.'},
    especialista:{id:'especialista',name:'Especialista',summary:'Resolve problemas com conhecimento, técnica, improviso e perícias.',pvBase:16,pvStep:3,peBase:3,peStep:3,sanBase:16,sanStep:4,prof:['Armas simples','Proteções leves'],skillsText:'7 + Intelecto perícias à escolha.',powers:powerObj(commonPowers.especialista,'especialista'),trails:trails.especialista,ability:'Eclético e Perito',abilityText:'Eclético: 2 PE para receber benefícios de ser treinado em uma perícia. Perito: escolha duas perícias treinadas (exceto Luta/Pontaria); 2 PE para +1d6, aumentando o dado com NEX.'},
    ocultista:{id:'ocultista',name:'Ocultista',summary:'Estudioso do Outro Lado, capaz de aprender e conjurar rituais.',pvBase:12,pvStep:2,peBase:4,peStep:4,sanBase:20,sanStep:5,prof:['Armas simples'],skillsText:'Ocultismo e Vontade; + (3 + Intelecto) perícias.',powers:powerObj(commonPowers.ocultista,'ocultista'),trails:trails.ocultista,ability:'Escolhido pelo Outro Lado',abilityText:'Começa com três rituais de 1º círculo. A cada avanço de NEX aprende um ritual de círculo disponível. Acesso ao 2º círculo em 25%, 3º em 55% e 4º em 85%.'}
  };

  const skills = [
    ['Acrobacia','Agi','Carga'],['Adestramento','Pre','Treinada'],['Artes','Pre','Treinada'],['Atletismo','For',''],['Atualidades','Int',''],['Ciências','Int','Treinada'],['Crime','Agi','Treinada • Carga'],['Diplomacia','Pre',''],['Enganação','Pre',''],['Fortitude','Vig',''],['Furtividade','Agi','Carga'],['Iniciativa','Agi',''],['Intimidação','Pre',''],['Intuição','Pre',''],['Investigação','Int',''],['Luta','For',''],['Medicina','Int','Treinada'],['Ocultismo','Pre','Treinada'],['Percepção','Pre',''],['Pilotagem','Agi','Treinada'],['Pontaria','Agi',''],['Profissão','Int','Treinada'],['Reflexos','Agi',''],['Religião','Pre','Treinada'],['Sobrevivência','Int',''],['Tática','Int','Treinada'],['Tecnologia','Int','Treinada'],['Vontade','Pre','']
  ].map(([name,attr,flags])=>({name,attr,flags}));

  const paranormalPowers = [
    {element:'Conhecimento',name:'Expansão de Conhecimento',req:'Conhecimento 1',text:'Aprende um poder de classe que não pertence à sua classe. Com afinidade, aprende um segundo poder de classe de outra classe.'},
    {element:'Conhecimento',name:'Percepção Paranormal',text:'Em cenas de investigação, ao Procurar Pistas, pode rolar novamente um dado com resultado abaixo de 5 e deve aceitar a segunda rolagem. Com afinidade, o limite passa a abaixo de 10.'},
    {element:'Conhecimento',name:'Precognição',req:'Conhecimento 1',text:'Recebe +5 em testes de Esquiva contra ataques de personagens em alcance curto ou menor. Com afinidade, vale para qualquer distância e você fica imune a Desprevenido.'},
    {element:'Conhecimento',name:'Resistir ao Conhecimento',text:'Recebe Resistência Paranormal 5 contra efeitos de Conhecimento; com afinidade, aumenta para 10.'},
    {element:'Conhecimento',name:'Sensitivo',text:'Recebe +1d em Diplomacia, Intimidação e Intuição. Com afinidade, em teste resistido usando uma dessas perícias, o oponente rola com –1d.'},
    {element:'Conhecimento',name:'Visão do Oculto',req:'Conhecimento 2',text:'Enxerga no escuro e recebe +1d em Percepção baseada em visão. Com afinidade, trata camuflagem como uma categoria abaixo.'},
    {element:'Energia',name:'Afortunado',text:'Pode rolar novamente resultado 1 em qualquer dado que não seja d20, uma vez por rolagem. Com afinidade, uma vez por cena também pode rolar novamente resultado 1 em d20.'},
    {element:'Energia',name:'Sortudo',text:'Em cenas de investigação, a DT para Procurar Pistas é diminuída em uma categoria até encontrar uma pista. Com afinidade, ela é sempre considerada uma categoria abaixo.'},
    {element:'Energia',name:'Golpe de Sorte',req:'Energia 2',text:'A margem de ameaça de seus ataques é dobrada antes de outros aumentos. Com afinidade, críticos recebem +1 dado de dano.'},
    {element:'Energia',name:'Manipular Entropia',req:'Energia 1',text:'Uma vez por cena, faz um alvo em alcance curto rolar novamente um dado de teste de perícia, antes do resultado ser anunciado. Com afinidade, pode fazer rolar novamente todos os dados do teste.'},
    {element:'Energia',name:'Passou Raspando',req:'Energia 1',text:'Recebe +1d em Reflexos. Com afinidade, +2d e, ao passar em Reflexos que reduziria dano à metade, não recebe dano.'},
    {element:'Energia',name:'Resistir à Energia',text:'Recebe Resistência Paranormal 5 contra Energia; com afinidade, 10.'},
    {element:'Morte',name:'Encarar a Morte',text:'Durante cenas de ação, seu limite de gasto de PE por rodada aumenta em +1; com afinidade, +2.'},
    {element:'Morte',name:'Escapar da Morte',req:'Morte 1',text:'Uma vez por cena, quando dano o deixaria com 0 PV ou menos, fica com 1 PV (não funciona contra Dano Massivo). Com afinidade, evita completamente o dano; contra Dano Massivo fica com 1 PV.'},
    {element:'Morte',name:'Potencial Aprimorado',req:'Morte 1',text:'Recebe +1 PE por avanço de NEX; ao subir NEX, ganha o PE adicional correspondente. Com afinidade, o ganho dobra.'},
    {element:'Morte',name:'Potencial Reaproveitado',text:'Uma vez por rodada, ao passar em teste de resistência, ganha 1 PE temporário até fim da cena. Com afinidade, 2 PE.'},
    {element:'Morte',name:'Resistir à Morte',text:'Recebe Resistência Paranormal 5 contra Morte; com afinidade, 10.'},
    {element:'Morte',name:'Surto Temporal',req:'Morte 2',text:'Uma vez por cena, durante seu turno, realiza uma ação padrão adicional. Com afinidade, realiza um turno inteiro adicional no final do turno.'},
    {element:'Sangue',name:'Anatomia Insana',req:'Sangue 1',text:'Tem 50% de chance de ignorar dano adicional de acerto crítico ou ataque furtivo. Com afinidade, fica imune a esses efeitos.'},
    {element:'Sangue',name:'Arma de Sangue',text:'Pode gastar 2 PV para manifestar uma arma simples leve especial de sangue até o fim da cena; ao atacar, pode gastar 1 PE para um ataque corpo a corpo adicional com ela. Com afinidade, torna-se parte permanente do corpo e causa dano de Sangue.'},
    {element:'Sangue',name:'Resistir ao Sangue',text:'Recebe Resistência Paranormal 5 contra Sangue; com afinidade, 10.'},
    {element:'Sangue',name:'Sangue de Ferro',text:'Recebe +3 PV e +1 PV adicional por avanço de NEX. Com afinidade, torna-se imune a venenos e doenças.'},
    {element:'Sangue',name:'Sangue Fervente',req:'Sangue 2',text:'Enquanto machucado, recebe +1 em Agilidade, Força ou Vigor à escolha. Com afinidade, recebe +1 também nos outros dois atributos físicos.'},
    {element:'Sangue',name:'Sangue Vivo',req:'Sangue 1',text:'Na primeira vez que fica Machucado na cena, recebe Cura Acelerada 2; não cura acima da metade dos PV e encerra ao perder Machucado. Com afinidade, Cura Acelerada 5 e imunidade a traumas físicos enquanto ativo.'},
    {element:'Universal',name:'Aprender Ritual',text:'Aprende um ritual de 1º círculo. Pode escolher várias vezes, respeitando limite de rituais conhecidos. A partir de NEX 45% pode aprender ritual de 2º círculo; a partir de 75%, de 3º. O ritual conta como poder do elemento correspondente.'}
  ];

  const ritualRows = [
    ['Compreensão Paranormal','Conhecimento',1,'Entende qualquer coisa escrita ou falada.'],['Enfeitiçar','Conhecimento',1,'Alvo se torna prestativo e pode realizar um pedido seu.'],['Perturbação','Conhecimento',1,'Força o alvo a obedecer a uma ordem.'],['Ouvir os Sussurros','Conhecimento',1,'Comunica-se com vozes do Outro Lado para receber informações.'],['Terceiro Olho','Conhecimento',1,'Permite ver manifestações paranormais.'],['Tecer Ilusões','Conhecimento',1,'Cria ilusão visual ou sonora.'],
    ['Amaldiçoar Tecnologia','Energia',1,'Amaldiçoa um item para operar acima de suas capacidades.'],['Eletrocussão','Energia',1,'Corrente voltaica eletrocuta o alvo.'],['Embaralhar','Energia',1,'Cria duplicatas para confundir inimigos e melhorar Defesa.'],['Luz','Energia',1,'Faz um objeto brilhar como uma lâmpada.'],['Polarização Caótica','Energia',1,'Atrai ou repele objetos metálicos próximos.'],
    ['Cicatrização','Morte',1,'Acelera a regeneração de um ferimento.'],['Consumir Manancial','Morte',1,'Suga tempo de vida próximo e concede PV temporários.'],['Decadência','Morte',1,'Acelera o envelhecimento dos órgãos internos, causando dano.'],['Definhar','Morte',1,'Deixa o alvo fatigado ou vulnerável.'],['Nuvem de Cinzas','Morte',1,'Invoca nuvem de cinzas que fornece camuflagem.'],['Espirais da Perdição','Morte',1,'Impõe penalidades nos ataques e danos dos inimigos.'],
    ['Armadura de Sangue','Sangue',1,'Recobre o corpo com placas de sangue endurecido para aumentar Defesa.'],['Arma Atroz','Sangue',1,'Arma corpo a corpo passa a causar dano adicional de Sangue.'],['Fortalecimento Sensorial','Sangue',1,'Melhora sentidos e percepção.'],['Ódio Incontrolável','Sangue',1,'Melhora dano corpo a corpo e capacidades físicas, mas prejudica mentais.'],['Distorcer Aparência','Sangue',1,'Muda a aparência de um ou mais alvos.'],['Corpo Adaptado','Sangue',1,'Ignora frio/calor e permite respirar debaixo d’água.'],['Cinerária','Medo',1,'Névoa fortalece rituais conjurados na área.'],
    ['Aprimoramento Mental','Conhecimento',2,'Fornece bônus em Intelecto ou Presença.'],['Detecção de Ameaças','Conhecimento',2,'Detecta personagens hostis e armadilhas na área.'],['Esconder dos Olhos','Conhecimento',2,'Torna o usuário invisível aos olhos comuns por certo tempo.'],['Ligação Telepática','Conhecimento',2,'Permite comunicação telepática com quem for marcado.'],['Localização','Conhecimento',2,'Determina a direção de um objeto ou criatura escolhida.'],
    ['Chamas do Caos','Energia',2,'Faz chamas e calor se comportarem de forma caótica.'],['Coincidência Forçada','Energia',2,'Concede sorte/bônus em testes ligados a um atributo.'],['Contenção Fantasmagórica','Energia',2,'Laços de Energia prendem o alvo.'],['Dissonância Acústica','Energia',2,'Cria área onde sons não podem ser ouvidos.'],['Sopro do Caos','Energia',2,'Manipula o ar de maneiras impossíveis.'],['Tela de Ruído','Energia',2,'Cria película protetora que absorve dano.'],
    ['Eco Espiral','Morte',2,'Repete o dano acumulado pelo alvo durante rodadas de concentração.'],['Desacelerar Impacto','Morte',2,'Dissipa energia potencial e concede resistência contra ataques físicos e balísticos.'],['Paradoxo','Morte',2,'Cria área de tempo paradoxal que envelhece corpo e alma.'],['Miasma','Morte',2,'Nuvem tóxica enjoa e sufoca alvos.'],['Velocidade Mortal','Morte',2,'Acelera o alvo no tempo, concedendo ações adicionais.'],
    ['Descarnar','Sangue',2,'Dilacera a pele do alvo e abre cortes profundos.'],['Transfusão Vital','Sangue',2,'Transfere vida do usuário para curar vários alvos.'],['Físico Aprimorado','Sangue',2,'Fornece bônus em Agilidade ou Força.'],['Hemofagia','Sangue',2,'Absorve sangue do alvo, causando dano e recuperando PV.'],['Rejeitar Névoa','Medo',2,'Concede bônus em testes de resistência contra rituais.'],
    ['Alterar Memória','Conhecimento',3,'Apaga ou modifica memórias recentes do alvo.'],['Contato Paranormal','Conhecimento',3,'Barganha com o Outro Lado para obter auxílio.'],['Mergulho Mental','Conhecimento',3,'Infiltra-se na mente do alvo para vasculhar pensamentos.'],['Vidência','Conhecimento',3,'Permite observar e ouvir um alvo à distância.'],
    ['Convocação Instantânea','Energia',3,'Teletransporta um objeto marcado para suas mãos.'],['Salto Fantasma','Energia',3,'Teletransporta você e outras criaturas para um ponto no alcance.'],['Transfigurar Água','Energia',3,'Faz água e gelo se comportarem de forma caótica.'],['Transfigurar Terra','Energia',3,'Faz rochas, lama e areia se comportarem de forma caótica.'],
    ['Âncora Temporal','Morte',3,'Impede o alvo de se afastar de um ponto.'],['Poeira da Podridão','Morte',3,'Nuvem de poeira apodrece o que toca.'],['Tentáculos de Lodo','Morte',3,'Tentáculos atacam e agarram criaturas na área.'],['Zerar Entropia','Morte',3,'Deixa o alvo lento ou paralisado.'],
    ['Ferver Sangue','Sangue',3,'Faz o sangue entrar em ebulição, causando dano e fraqueza.'],['Forma Monstruosa','Sangue',3,'Faz você assumir forma de criatura monstruosa.'],['Purgatório','Sangue',3,'Área de sangue deixa alvos vulneráveis e causa dor ao tentar sair.'],['Vomitar Pestes','Sangue',3,'Vomita enxame de pequenas criaturas de Sangue.'],['Neutralizar Ritual','Medo',3,'Cancela os efeitos de rituais em um alvo ou área.'],
    ['Controle Mental','Conhecimento',4,'Domina a mente da vítima e a faz obedecer comandos.'],['Possessão','Conhecimento',4,'Transfere sua consciência para o corpo do alvo.'],['Visão da Verdade','Conhecimento',4,'Enxerga através de camuflagem, escuridão, ilusão e transmutação.'],
    ['Alterar Destino','Energia',4,'Enxerga possibilidades do futuro próximo e altera o resultado de um teste.'],['Deflagração de Energia','Energia',4,'Explosão de energia bruta causa dano e afeta rituais/itens amaldiçoados.'],['Teletransporte','Energia',4,'Teletransporta você e outras criaturas.'],
    ['Convocar o Algoz','Morte',4,'Conjura ser cadavérico que persegue e tenta matar o alvo.'],['Distorcer o Tempo','Morte',4,'Desacelera temporalmente alvos, fazendo-os perder rodadas.'],['Fim Inevitável','Morte',4,'Abre ruptura semelhante a buraco negro que suga tudo ao redor.'],
    ['Capturar o Coração','Sangue',4,'Manipula emoções e vontades do alvo, tornando-o aliado.'],['Invólucro de Carne','Sangue',4,'Cria clone de carne e sangue com estatísticas do alvo.'],['Vínculo de Sangue','Sangue',4,'O alvo sofre dano e efeitos negativos que você sofrer.'],
    ['Canalizar o Medo','Medo',4,'Transfere parte de seu poder paranormal para outra criatura.'],['Conhecendo o Medo','Medo',4,'Manifesta medo absoluto na mente do alvo.'],['Presença do Medo','Medo',4,'Você assume forma impossível dentro da Realidade.'],['Medo Tangível','Medo',4,'Concede uma série de imunidades.'],['Lâmina do Medo','Medo',4,'Golpeia o alvo com uma lâmina de medo puro.']
  ];
  const rituals = ritualRows.map(([name,element,circle,summary],i)=>({id:`r${i}`,name,element,circle,summary}));

  const weapons = [
    ['Coronhada',0,'1d4','x2','—','Impacto',0,'Simples','Corpo a corpo','Arma de fogo usada como arma corpo a corpo.'],['Faca',0,'1d4','19','Curto','Corte',1,'Simples','Leve','Pode usar Agilidade no ataque; pode ser arremessada.'],['Martelo',0,'1d6','x2','—','Impacto',1,'Simples','Leve','Ferramenta comum usada como arma.'],['Punhal',0,'1d4','x3','—','Perfuração',1,'Simples','Leve','Faca de lâmina longa e pontiaguda.'],['Bastão',0,'1d6/1d8','x2','—','Impacto',1,'Simples','Uma mão','Pode ser empunhado com uma ou duas mãos.'],['Machete',0,'1d6','19','—','Corte',1,'Simples','Uma mão','Lâmina longa usada para abrir trilhas.'],['Lança',0,'1d6','x2','Curto','Perfuração',1,'Simples','Uma mão','Pode ser arremessada.'],['Cajado',0,'1d6/1d6','x2','—','Impacto',2,'Simples','Duas mãos','Pode funcionar com Combater com Duas Armas como arma de uma mão e arma leve.'],['Arco',0,'1d6','x3','Médio','Perfuração',2,'Simples','Disparo • duas mãos','Arco comum. Requer flechas.'],['Besta',0,'1d8','19','Médio','Perfuração',2,'Simples','Disparo • duas mãos','Exige ação de movimento para recarregar.'],['Pistola',1,'1d12','18','Curto','Balístico',1,'Simples','Fogo • leve','Arma de mão, usa balas leves/curtas.'],['Revólver',1,'2d6','19/x3','Curto','Balístico',1,'Simples','Fogo • leve','Arma de fogo comum e confiável.'],['Fuzil de caça',1,'2d8','19/x3','Médio','Balístico',2,'Simples','Fogo • duas mãos','Arma longa de caça.'],
    ['Machadinha',0,'1d6','x3','Curto','Corte',1,'Tática','Leve','Pode ser arremessada.'],['Nunchaku',0,'1d8','x2','—','Impacto',1,'Tática','Leve','Dois bastões curtos ligados por corrente.'],['Corrente',0,'1d8','x2','—','Impacto',1,'Tática','Uma mão','Fornece +2 em testes para desarmar e derrubar.'],['Espada',1,'1d8/1d10','19','—','Corte',1,'Tática','Uma mão','Pode ser usada com uma ou duas mãos.'],['Florete',1,'1d6','18','—','Corte',1,'Tática','Uma mão','Espada fina de esgrima.'],['Machado',1,'1d8','x3','—','Corte',1,'Tática','Uma mão','Ferramenta/arma de corte pesada.'],['Marreta',1,'2d4','x2','—','Impacto',1,'Tática','Uma mão','Ferramenta pesada de construção.'],['Acha',1,'1d12','x3','—','Corte',2,'Tática','Duas mãos','Machado grande e pesado.'],['Gadanho',1,'2d4','x4','—','Corte',2,'Tática','Duas mãos','Ferramenta agrícola de lâmina longa.'],['Katana',1,'1d10','19','—','Corte',2,'Tática','Duas mãos','Pode usar Agilidade no ataque; veterano em Luta pode usá-la com uma mão.'],['Montante',1,'2d6','19','—','Corte',2,'Tática','Duas mãos','Espada muito grande.'],['Motosserra',1,'3d6','x2','—','Corte',2,'Tática','Duas mãos','Cada 6 em dado de dano gera dado adicional; –2 em ataques; ligar custa ação de movimento.'],['Arco composto',1,'1d10','x3','Médio','Perfuração',2,'Tática','Disparo • duas mãos','Permite somar Força ao dano.'],['Balestra',1,'1d12','19','Médio','Perfuração',2,'Tática','Disparo • duas mãos','Exige ação de movimento para recarregar.'],['Submetralhadora',1,'2d6','19/x3','Curto','Balístico',1,'Tática','Fogo • uma mão','Arma automática.'],['Espingarda',1,'4d6','x3','Curto','Balístico',2,'Tática','Fogo • duas mãos','Causa metade do dano em alcance médio ou maior.'],['Fuzil de assalto',2,'2d10','19/x3','Médio','Balístico',2,'Tática','Fogo • duas mãos','Arma automática.'],['Fuzil de precisão',3,'2d10','19/x3','Longo','Balístico',2,'Tática','Fogo • duas mãos','Veterano em Pontaria, ao mirar, recebe bônus na margem de ameaça conforme o livro.'],['Bazuca',3,'10d8','x2','Médio','Impacto',2,'Pesada','À distância • duas mãos','Explosão em raio de 3m; usa foguete e exige recarga.'],['Lança-chamas',3,'6d6','x2','Curto','Fogo',2,'Pesada','À distância • duas mãos','Atinge linha em alcance curto e pode deixar alvos em chamas.'],['Metralhadora',2,'2d12','19/x3','Médio','Balístico',2,'Pesada','Fogo • duas mãos','For 4 ou apoio para não sofrer –5; automática.']
  ].map((r,i)=>({id:`w${i}`,type:'Arma',name:r[0],category:r[1],damage:r[2],crit:r[3],range:r[4],damageType:r[5],spaces:r[6],proficiency:r[7],grip:r[8],desc:r[9]}));

  const ammo = [
    ['Balas curtas',0,1,'Munição para pistolas, revólveres e submetralhadoras; dura duas cenas.'],['Balas longas',1,1,'Munição para fuzis e metralhadoras; dura uma cena.'],['Cartuchos',1,1,'Munição de espingarda; dura uma cena.'],['Combustível',1,1,'Tanque para lança-chamas; dura uma cena.'],['Flechas',0,1,'Usadas em arcos/bestas e reaproveitáveis; um pacote dura uma missão.'],['Foguete',1,1,'Cada foguete é um único disparo de bazuca.']
  ].map((r,i)=>({id:`a${i}`,type:'Munição',name:r[0],category:r[1],spaces:r[2],desc:r[3]}));

  const protections = [
    {id:'prot-leve',type:'Proteção',name:'Proteção Leve',category:1,spaces:2,defense:5,desc:'Jaqueta reforçada ou colete balístico leve; fornece +5 Defesa.'},
    {id:'prot-pesada',type:'Proteção',name:'Proteção Pesada',category:2,spaces:5,defense:10,desc:'Equipamento tático/militar; +10 Defesa e RD 2; impõe –5 em perícias afetadas por carga.'}
  ];

  const general = [
    ['Kit de perícia',0,1,'Acessório','Ferramentas necessárias para usos de perícias que exigem kit. Sem o kit, normalmente há penalidade de –5.'],['Utensílio',1,1,'Acessório','Item comum que concede +2 em uma perícia definida (exceto Luta/Pontaria), sujeito à aprovação do mestre.'],['Vestimenta',1,1,'Acessório','Peça de vestuário que concede +2 em uma perícia específica; pode receber bônus de até duas vestimentas ao mesmo tempo.'],
    ['Granada de atordoamento',0,1,'Explosivo','Flash-bang; criaturas na área podem ficar atordoadas, com resistência de Fortitude.'],['Granada de fragmentação',1,1,'Explosivo','Espalha fragmentos perfurantes e causa dano em área.'],['Granada de fumaça',0,1,'Explosivo','Cria nuvem de fumaça que fornece camuflagem.'],['Granada incendiária',1,1,'Explosivo','Espalha substância inflamável e pode deixar criaturas em chamas.'],['Mina antipessoal',1,1,'Explosivo','Instalada com Tática e detonada à distância; dispara esferas de aço em cone.'],
    ['Algemas',0,1,'Operacional','Permitem prender os pulsos de um alvo; escapar exige teste difícil de Acrobacia.'],['Bandoleira',0,1,'Operacional','Armazena até quatro itens pequenos; uma vez por rodada pode sacar/guardar um item nela como ação livre.'],['Cicatrizante',1,1,'Operacional','Ação padrão para curar 2d8+2 PV em você ou criatura adjacente; consumível.'],['Lanterna',0,1,'Operacional','Fonte portátil de iluminação.'],['Óculos de visão térmica',1,1,'Operacional','Permitem enxergar diferenças térmicas e ajudam a perceber alvos em certas condições.'],['Pistola de dardos',1,1,'Operacional','Dispara dardos com sonífero capaz de derrubar uma criatura, conforme resistência.'],['Soqueira',0,1,'Operacional','Reforça ataques desarmados.'],['Spray de pimenta',0,1,'Operacional','Pode cegar temporariamente criatura adjacente; carga limitada.'],['Taser',0,1,'Operacional','Dispositivo de eletrochoque capaz de incapacitar ou enfraquecer um alvo; bateria limitada.']
  ].map((r,i)=>({id:`g${i}`,type:r[3],name:r[0],category:r[1],spaces:r[2],desc:r[4]}));

  const weaponMods = [
    ['Certeira','Corpo a corpo/disparo','+2 em testes de ataque.'],['Cruel','Corpo a corpo/disparo','+2 em rolagens de dano.'],['Discreta','Corpo a corpo/disparo','Facilita ocultar; nas armas de fogo também reduz espaço em 1 conforme a regra específica.'],['Perigosa','Corpo a corpo/disparo','+2 na margem de ameaça.'],['Tática','Corpo a corpo/disparo','Pode sacar como ação livre.'],['Alongada','Fogo','+2 em testes de ataque.'],['Calibre Grosso','Fogo','Aumenta o dano em mais um dado do mesmo tipo; exige munição apropriada.'],['Compensador','Fogo automática','Anula penalidade de ataque por rajadas.'],['Ferrolho Automático','Fogo','A arma se torna automática.'],['Mira Laser','Fogo','+2 na margem de ameaça.'],['Mira Telescópica','Fogo','Aumenta alcance em uma categoria e amplia uso de Ataque Furtivo.'],['Silenciador','Fogo','Reduz penalidade de Furtividade após disparar.'],['Visão de Calor','Fogo','Ignora camuflagem do alvo ao disparar.'],['Dum Dum','Munição','+2 no multiplicador de crítico.'],['Explosiva','Munição','+2d6 de dano.']
  ].map((r,i)=>({id:`wm${i}`,name:r[0],applies:r[1],text:r[2],categoryDelta:1}));
  const protectionMods = [
    ['Antibombas','+5 em testes de resistência contra efeitos de área.',0],['Blindada','Proteção pesada: aumenta RD para 5 e espaço em +1.',1],['Discreta','Proteção leve: +5 para ocultar e espaço –1.',-1],['Reforçada','Defesa +2 e espaço +1.',1],['Tática','Uma vez por rodada, sacar/guardar item como ação livre.',0]
  ].map((r,i)=>({id:`pm${i}`,name:r[0],text:r[1],spaceDelta:r[2],categoryDelta:1}));
  const accessoryMods = [
    ['Aprimorado','Aumenta um dos bônus de perícia concedidos pelo acessório para +5.'],['Discreto','+5 em testes para ocultar e reduz espaço em 1.'],['Função adicional','Concede +2 a uma perícia adicional.'],['Instrumental','O acessório funciona como kit de uma perícia específica.']
  ].map((r,i)=>({id:`am${i}`,name:r[0],text:r[1],categoryDelta:1}));

  const patent = {
    recruta:{name:'Recruta',credit:'Baixo',limits:{1:2,2:0,3:0,4:0}},
    operador:{name:'Operador',credit:'Médio',limits:{1:3,2:1,3:0,4:0}},
    especial:{name:'Agente Especial',credit:'Médio',limits:{1:3,2:2,3:1,4:0}},
    oficial:{name:'Oficial de Operações',credit:'Alto',limits:{1:3,2:3,3:2,4:1}},
    elite:{name:'Agente de Elite',credit:'Ilimitado',limits:{1:3,2:3,3:3,4:2}}
  };

  const equipment = [...weapons,...ammo,...protections,...general];
  return {nexLevels,peRound,origins,classes,skills,paranormalPowers,rituals,weapons,ammo,protections,general,equipment,weaponMods,protectionMods,accessoryMods,patent};
})();
