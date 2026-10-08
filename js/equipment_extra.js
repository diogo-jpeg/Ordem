/* Catálogo de maldições do Livro de Regras v1.3, páginas 144–147.
   Descrições resumidas com linguagem própria; consulte o livro para resolução de efeitos narrativos. */
(() => {
  const D=window.OPR_DATA;
  const c=(type,id,name,element,text,mechanics={})=>({type,id:'curse-'+id,name,element,text,mechanics});
  D.curses=[
    // Armas — p. 145-146
    c('Arma','antielemento','Antielemento','Conhecimento','Defina um elemento. Contra criaturas desse elemento, você pode pagar 2 PE ao atacar; se acertar, causa +4d8 de dano.',{target:true}),
    c('Arma','ritualistica','Ritualística','Conhecimento','Permite gastar PE para armazenar na arma um ritual direcionado a um ser ou área. Ao acertar um ataque, pode liberar o ritual como ação livre, usando o alvo atingido como referência.'),
    c('Arma','senciente','Senciente','Conhecimento','Ação de movimento e 2 PE: a arma passa a flutuar e faz um ataque por rodada ao alcance curto ou alcance da arma. Pague 1 PE no começo de cada turno para mantê-la.'),
    c('Arma','empuxo','Empuxo','Energia','Só para armas corpo a corpo. Permite arremessá-la em alcance curto (ou amplia o alcance de arremesso existente) com +1 dado de dano; ela retorna após o ataque.',{meleeOnly:true}),
    c('Arma','energetica','Energética','Energia','Ao pagar 2 PE por ataque, converte o dano para Energia, fornece +5 no teste de ataque e ignora resistência a dano.'),
    c('Arma','vibrante','Vibrante','Energia','Concede Ataque Extra (operações especiais); se você já possui a habilidade, reduz o custo dela em 1 PE.'),
    c('Arma','consumidora','Consumidora','Morte','Alvos atingidos ficam lentos até o final da cena. Você pode pagar 2 PE ao atacar para deixar o alvo imóvel por uma rodada, se acertar.'),
    c('Arma','erosiva','Erosiva','Morte','Acrescenta +1d8 de dano de Morte. Ao acertar após gastar 2 PE, a vítima também sofre 2d4 de Morte no começo dos dois turnos seguintes.',{damage:'+1d8 Morte'}),
    c('Arma','repulsora','Repulsora','Morte','Enquanto empunhada, fornece +2 em Defesa. Quando bloqueia, você pode pagar 2 PE para receber +5 adicionais na Defesa.',{defense:2}),
    c('Arma','lancinante','Lancinante','Sangue','Acrescenta +1d8 de dano de Sangue, multiplicado junto com os dados da arma em acertos críticos.',{damage:'+1d8 Sangue (multiplica no crítico)'}),
    c('Arma','predadora','Predadora','Sangue','Ignora penalidades de camuflagem e cobertura leves; se for arma à distância, amplia seu alcance em uma categoria. Duplica a margem de ameaça antes de outros aumentos.'),
    c('Arma','sanguinaria','Sanguinária','Sangue','Cada acerto impõe sangramento cumulativo (1d6 por acerto a cada rodada). No crítico, o alvo fica fraco e você recebe 2d10 PV temporários.'),
    // Proteções — p. 146-147
    c('Proteção','abascanta','Abascanta','Conhecimento','Fornece +5 nos testes de resistência contra rituais. Uma vez por cena, pode reagir pagando o custo em PE de um ritual para refleti-lo ao conjurador.',{resistance:'Rituais +5'}),
    c('Proteção','profetica','Profética','Conhecimento','Oferece resistência a Conhecimento 10. Ao fazer um teste de resistência, você pode pagar 2 PE para refazê-lo.',{resistance:'Conhecimento 10'}),
    c('Proteção','sombria','Sombria','Conhecimento','Fornece +5 em Furtividade, ignora a penalidade de carga nessa perícia e pode parecer roupa comum mediante ação de movimento e 1 PE.',{skill:{Furtividade:5}}),
    c('Proteção','cinetica','Cinética','Energia','Fornece +2 de Defesa e RD 2 (leve ou escudo) ou RD 5 (pesada).',{defense:2,rdLight:2,rdHeavy:5}),
    c('Proteção','lepida','Lépida','Energia','Concede +10 em Atletismo e +3 m de deslocamento. Por 2 PE ignora terreno difícil, ganha deslocamento de escalada e ignora dano por queda de até 9 m neste turno.',{skill:{Atletismo:10},speed:3}),
    c('Proteção','voltaica','Voltaica','Energia','Oferece resistência a Energia 10. Com ação de movimento e 2 PE, emite arcos que causam 2d6 de Energia a seres adjacentes ao fim dos seus turnos.',{resistance:'Energia 10'}),
    c('Proteção','letargica','Letárgica','Morte','Fornece +2 na Defesa e chance de negar dano extra de crítico ou ataque furtivo: 25% em leve/escudo; 50% em pesada.',{defense:2}),
    c('Proteção','repulsiva','Repulsiva','Morte','Oferece resistência a Morte 10. Com ação de movimento e 2 PE, cobre o usuário de Lodo; ataques corpo a corpo contra ele causam 2d8 de Morte ao atacante.',{resistance:'Morte 10'}),
    c('Proteção','regenerativa','Regenerativa','Sangue','Oferece resistência a Sangue 10 e permite gastar ação de movimento e 1 PE para recuperar 1d12 PV.',{resistance:'Sangue 10'}),
    c('Proteção','sadica','Sádica','Sangue','No início do turno, recebe +1 nos ataques e danos para cada 10 pontos de dano sofridos desde o fim do turno anterior.'),
    // Acessórios (utensílios/vestimentas) — p. 147
    c('Acessório','carisma','Carisma','Conhecimento','Recebe +1 em Presença, mas esse aumento não concede PE extras.',{attr:'pre'}),
    c('Acessório','conjuracao','Conjuração','Conhecimento','Escolha um ritual de 1º círculo: pode conjurá-lo enquanto empunha o acessório. Se já o conhece, o custo diminui em 1 PE.',{ritual:true}),
    c('Acessório','escudo-mental','Escudo Mental','Conhecimento','Fornece resistência a dano mental 10.',{resistance:'Mental 10'}),
    c('Acessório','reflexao','Reflexão','Conhecimento','Uma vez por rodada, quando um ritual tem você como alvo, pode gastar PE igual ao custo dele para refleti-lo ao conjurador.'),
    c('Acessório','sagacidade','Sagacidade','Conhecimento','Recebe +1 em Intelecto; o bônus não concede perícias treinadas extras nem aumenta graus de treinamento.',{attr:'int'}),
    c('Acessório','defesa','Defesa','Energia','Fornece +5 à Defesa enquanto o acessório estiver sendo usado.',{defense:5}),
    c('Acessório','destreza','Destreza','Energia','Recebe +1 em Agilidade.',{attr:'agi'}),
    c('Acessório','potencia','Potência','Energia','Aumenta em +1 a DT para resistir às suas habilidades, poderes e rituais.',{dt:1}),
    c('Acessório','esforco-adicional','Esforço Adicional','Morte','Fornece +5 PE após pelo menos um dia de uso.',{pe:5,attuneDay:true}),
    c('Acessório','disposicao','Disposição','Sangue','Recebe +1 em Vigor.',{attr:'vig'}),
    c('Acessório','pujanca','Pujança','Sangue','Recebe +1 em Força.',{attr:'for'}),
    c('Acessório','vitalidade','Vitalidade','Sangue','Fornece +15 PV após pelo menos um dia de uso.',{pv:15,attuneDay:true}),
    c('Acessório','protecao-elemental','Proteção Elemental','Variável','Escolha um elemento entre Conhecimento, Energia, Morte e Sangue: fornece resistência 10 a ele e conta como maldição desse elemento.',{target:true,resistance:'Elemento escolhido 10'})
  ];
  // Itens amaldiçoados especiais, p. 148–151. Descrições próprias e condensadas.
  const sp=(id,name,element,desc,category=2,spaces=1)=>({id:'sp-'+id,name,type:'Amaldiçoado especial',element,category,spaces,desc,unique:name==='Jaqueta de Veríssimo'||name==='Relógio de Arnaldo'});
  D.specialCursed=[
    sp('coracao','Coração Pulsante','Sangue','Ao sofrer dano, reaja apertando o coração para reduzir o dano pela metade. Cada uso exige Fortitude crescente e pode destruir o item.'),
    sp('coroa','Coroa de Espinhos','Sangue','Uma vez por rodada, converte dano mental recebido em dano de Sangue. Impede recuperação de SAN por descanso; requer uma semana vestida para funcionar.'),
    sp('frasco-vitalidade','Frasco de Vitalidade','Sangue','Guarda até 20 PV do próprio sangue; beber recupera os PV armazenados, com risco de enjoo (Fortitude DT 20).'),
    sp('perola','Pérola de Sangue','Sangue','Fornece +5 em testes de Agilidade, Força e Vigor até o fim da cena. Depois exige Fortitude; falhar traz fadiga ou consequência mais grave.'),
    sp('punhos','Punhos Enraivecidos','Sangue','Ataques desarmados causam +1d8 de Sangue, tornam-se letais e permitem ataques extras sucessivos com custos crescentes em PE.'),
    sp('seringa','Seringa de Transfiguração','Sangue','Coleta sangue e o injeta em alguém para alterar sua aparência para a do doador por um dia; existe risco de perda permanente de PV.'),
    sp('amarras','Amarras Mortais','Morte','Ação padrão e 2 PE: faz agarrar a distância em alcance curto contra alvo Grande ou menor, com +10 no teste; pode puxá-lo para perto.'),
    sp('casaco','Casaco de Lodo','Morte','Concede RD 5 a corte, impacto, Morte e perfuração, mas vulnerabilidade a dano balístico e Energia.'),
    sp('coletora','Coletora','Morte','Pode executar pessoa morrendo para absorver 1d8 PE, armazenando até 20; portar o item prejudica o descanso e exige adaptação para acessar os PE.'),
    sp('cranio','Crânio Espiral','Morte','Uma vez por rodada, concede ação padrão adicional; uso exige Vontade crescente e pode causar envelhecimento.'),
    sp('frasco-lodo','Frasco de Lodo','Morte','Cura grandes quantidades de PV se aplicado rapidamente a um ferimento. Uso tardio pode funcionar parcialmente ou causar efeito indesejado.'),
    sp('vislumbre','Vislumbre do Fim','Morte','Permite examinar o destino fatal de pessoas ou descobrir a pior resistência e vulnerabilidades de criaturas e Marcados.'),
    sp('aneis','Anéis do Elo Mental','Conhecimento','Após 24 h com dois usuários, cria ligação telepática e compartilhamento de melhores testes de Vontade, mas transmite danos e condições mentais entre eles.'),
    sp('lanterna','Lanterna Reveladora','Conhecimento','Ação padrão e 1 PE: ilumina como Terceiro Olho por uma cena; criaturas de Sangue iluminadas tendem a priorizar o portador.'),
    sp('mascara','Máscara das Pessoas nas Sombras','Conhecimento','Concede resistência a Conhecimento 10 e pode teleportar o usuário entre sombras, mediante 2 PE e ação de movimento.'),
    sp('municao-jurada','Munição Jurada','Conhecimento','Uma bala vinculada ritualmente a uma pessoa específica. Contra esse alvo, +10 para atacar, margem de ameaça dobrada e +6d12 de Conhecimento; fora dele, obsessão causa –2 na Defesa e nos ataques.'),
    sp('pergaminho','Pergaminho da Pertinácia','Conhecimento','Gera 5 PE temporários por uma cena ao ser lido; exige Ocultismo crescente, com chance de se desfazer.'),
    sp('arcabuz','Arcabuz dos Moretti','Energia','Arma de fogo simples de uma mão, alcance curto, crítico x3, +2 no ataque, sem munição; causa dano de Energia com dados variáveis.'),
    sp('bateria','Bateria Reversa','Energia','Paga 2 PE para drenar carga de aparelhos próximos e depois transferi-la a outro equipamento; uso envolve risco crescente.'),
    sp('peitoral','Peitoral da Segunda Chance','Energia','Ao chegar a 0 PV, consome 5 PE para reanimar com 4d10 PV; cada ativação tem risco de morte instantânea.'),
    sp('relogio','Relógio de Arnaldo','Energia','Uma vez por rodada, pode gastar PE para refazer dados que mostraram 1; custo aumenta a cada uso no dia.'),
    sp('talisma','Talismã da Sorte','Energia','Reação e 3 PE ao receber dano: 1d4 define se evita o dano, destrói o item ou sofre dano dobrado.'),
    sp('teclado','Teclado de Conexão Neural','Energia','Permite conexão direta à máquina, +10 para hackear e metade do tempo para buscar arquivos; custa 1d6 dano mental por rodada de uso.'),
    sp('tela','Tela do Pesadelo','Energia','Ação padrão e 2 PE prepara tela que traumatiza quem tocá-la: Vontade para evitar atordoamento e 4d6 de dano mental.'),
    sp('veiculo','Veículo Energizado','Energia','Veículo sem gasto de combustível; reação e Pilotagem DT 25 permitem evitar colisões por meio de fase energética. Consulte o mestre para o transporte físico deste item.'),
    sp('jaqueta','Jaqueta de Veríssimo','Medo','Fornece resistência a dano paranormal 15; reação e 2 PE permitem tomar dano destinado a aliado adjacente. Item único.',4),
    sp('dedo','Dedo Decepado','Variável','Concede poder paranormal do antigo dono; após uma semana de uso. Descansos podem ser perturbados e o uso impõe consequências sociais.'),
    sp('selo','Selo Paranormal','Variável','Consome-se ao conjurar o ritual inscrito. Categoria igual ao círculo do ritual; ativação requer conhecimento do ritual ou teste de Ocultismo.',1)
  ];
  D.equipment.push(...D.specialCursed);
})();
