(() => {
  const D = window.OPR_DATA;
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const attrNames = {agi:'Agilidade',for:'Força',int:'Intelecto',pre:'Presença',vig:'Vigor'};
  const storageGet = k => { try { return localStorage.getItem(k); } catch { return null; } };
  const storageSet = (k,v) => { try { localStorage.setItem(k,v); return true; } catch { return false; } };
  const storageRemove = k => { try { localStorage.removeItem(k); } catch {} };
  const attrAbbr = {agi:'AGI',for:'FOR',int:'INT',pre:'PRE',vig:'VIG'};
  const powerNex = [15,30,45,60,75,90];
  const boostNex = [20,50,80,95];

  const defaultState = () => ({
    name:'Novo Agente',nex:null,
    attrs:{agi:1,for:1,int:1,pre:1,vig:1}, boosts:{20:null,50:null,80:null,95:null},
    origin:null,classId:null,trail:null,
    classPowers:[], paranormal:[], versatility:null, versatilityPower:null, perito:[],
    skills:[], combatAttack:'Luta', combatResist:'Fortitude',
    train35:[], train70:[],
    rituals:[],
    patent:'recruta', inventory:{}, mods:{},
    favoriteWeapon:null, favoriteKit:null,
    ritualElement:'', paranormalElement:'', itemType:'',
  });
  let state = defaultState();

  const toast = msg => { const t=$('#toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toast.t); toast.t=setTimeout(()=>t.classList.remove('show'),1800); };
  const esc = s => String(s ?? '').replace(/[&<>"]/g,m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[m]));
  const catRoman = n => ['0','I','II','III','IV','V','VI','VII','VIII'][n] ?? String(n);
  const getClass = () => state.classId ? D.classes[state.classId] : null;
  const getOrigin = () => D.origins.find(o=>o.id===state.origin);
  const getTrail = () => { const c=getClass(); return c?.trails.find(t=>t.id===state.trail); };
  const hasFirstTrail = id => (state.trail===id && state.nex>=10) || (state.nex>=50 && state.versatility===`trail:${id}`);
  const nexIndex = () => state.nex ? D.nexLevels.indexOf(state.nex) : 0;
  const availablePowerSlots = () => state.nex ? powerNex.filter(n=>n<=state.nex).length : 0;
  const effAttrs = () => {
    const a={...state.attrs};
    if(state.nex) for(const n of boostNex) if(n<=state.nex && state.boosts[n]) a[state.boosts[n]]++;
    return a;
  };
  const initialSpent = () => Object.values(state.attrs).reduce((s,v)=>s+Math.max(0,v-1),0);
  const zeroCount = () => Object.values(state.attrs).filter(v=>v===0).length;
  const attrRemaining = () => 4 + zeroCount() - initialSpent();
  const selectedClassPowerObjs = () => state.classPowers.map(id=>getClass()?.powers.find(p=>p.id===id)).filter(Boolean);
  const versatilityPowerObj = () => state.versatilityPower ? getClass()?.powers.find(p=>p.id===state.versatilityPower) : null;
  const allClassPowerObjs = () => [...selectedClassPowerObjs(), ...(versatilityPowerObj()?[versatilityPowerObj()]:[])];
  const transcenderCount = () => allClassPowerObjs().filter(p=>p.name==='Transcender').length;
  const paranormalSlots = () => transcenderCount() + (state.origin==='cultista-arrependido'?1:0) + (state.nex>=50 && state.versatility==='paranormal'?1:0);
  const maxRitualCircle = () => !state.nex?0: state.nex>=85?4:state.nex>=55?3:state.nex>=25?2:1;
  const ritualSlots = () => {
    if(state.classId!=='ocultista' || !state.nex) return 0;
    let slots=3+nexIndex();
    if(state.trail==='graduado' && state.nex>=10){ slots++; if(state.nex>=25)slots++; if(state.nex>=55)slots++; if(state.nex>=85)slots++; }
    return slots;
  };
  const skillBaseLocked = () => {
    const set=new Set();
    const o=getOrigin(); if(o) o.skills.filter(s=>!s.startsWith('À escolha')).forEach(s=>set.add(s));
    if(state.classId==='ocultista'){set.add('Ocultismo');set.add('Vontade');}
    if(state.classId==='combatente'){set.add(state.combatAttack);set.add(state.combatResist);}
    return set;
  };
  const extraSkillLimit = () => {
    const a=effAttrs();
    const originFree=state.origin==='amnesico'?2:0;
    if(state.classId==='combatente') return 1+a.int+originFree;
    if(state.classId==='especialista') return 7+a.int+originFree;
    if(state.classId==='ocultista') return 3+a.int+originFree;
    return originFree;
  };
  const allTrainedSkills = () => new Set([...skillBaseLocked(),...state.skills]);
  const selectedRanks = () => {
    const m={}; allTrainedSkills().forEach(s=>m[s]='Treinado');
    state.train35.forEach(s=>{if(m[s])m[s]='Veterano';});
    state.train70.forEach(s=>{if(m[s])m[s]=state.train35.includes(s)?'Expert':'Veterano';});
    return m;
  };
  const classGradeLimit = at => {
    const a=effAttrs();
    if(state.classId==='combatente')return 1+a.int;
    if(state.classId==='especialista')return 5+a.int;
    if(state.classId==='ocultista')return 3+a.int;
    return 0;
  };

  function setNex(n){
    state.nex=n;
    for(const b of boostNex) if(b>n) state.boosts[b]=null;
    const pslots=availablePowerSlots(); if(state.classPowers.length>pslots) state.classPowers=state.classPowers.slice(0,pslots);
    if(n<10) state.trail=null; if(n<50){state.versatility=null;state.versatilityPower=null;}
    if(state.train35 && n<35) state.train35=[];
    if(state.train70 && n<70) state.train70=[];
    trimDependentChoices();
    $('#nexGate').classList.remove('open');
    renderAll();
  }

  function trimDependentChoices(){
    if(state.classId){
      if(state.nex<50){state.versatility=null;state.versatilityPower=null;}
      const validVers=new Set(['class','paranormal',...getClass().trails.filter(t=>t.id!==state.trail).map(t=>'trail:'+t.id)]); if(state.versatility && !validVers.has(state.versatility)){state.versatility=null;state.versatilityPower=null;} if(state.versatility!=='class')state.versatilityPower=null;
      const valid=new Set(getClass().powers.map(p=>p.id)); state.classPowers=state.classPowers.filter(x=>valid.has(x)).slice(0,availablePowerSlots());
      const validTrails=new Set(getClass().trails.map(t=>t.id)); if(!validTrails.has(state.trail))state.trail=null;
    } else {state.classPowers=[];state.trail=null;}
    state.paranormal=state.paranormal.slice(0,paranormalSlots());
    state.skills=state.skills.filter(s=>!skillBaseLocked().has(s)).slice(0,extraSkillLimit()); state.perito=state.perito.filter(s=>allTrainedSkills().has(s) && !['Luta','Pontaria'].includes(s)).slice(0,2);
    state.rituals=state.rituals.filter(id=>D.rituals.some(r=>r.id===id && r.circle<=maxRitualCircle())).slice(0,ritualSlots());
    if(state.favoriteWeapon && !(state.inventory[state.favoriteWeapon]>0)) state.favoriteWeapon=null;
  }

  function renderNex(){
    const buttons=D.nexLevels.map(n=>`<button class="nex-option ${state.nex===n?'selected':''}" data-nex="${n}">${n}%</button>`).join('');
    $('#nexGrid').innerHTML=buttons; $('#gateNexGrid').innerHTML=buttons;
    const unlock=[];
    if(state.nex){
      unlock.push(`PE/rodada ${D.peRound[state.nex]}`);
      if(state.nex>=10)unlock.push('Trilha'); if(state.nex>=15)unlock.push(`${availablePowerSlots()} poder(es) de classe`);
      boostNex.filter(n=>n<=state.nex).forEach(n=>unlock.push(`+1 atributo @${n}%`));
      if(state.nex>=35)unlock.push('Grau de treinamento');
      if(state.classId==='ocultista')unlock.push(`Rituais até ${maxRitualCircle()}º círculo`);
    }
    $('#unlockStrip').innerHTML=unlock.length?unlock.map(x=>`<span>${esc(x)}</span>`).join(''):'<span>Selecione um NEX para liberar a progressão.</span>';
  }

  function renderAttributes(){
    const remaining=attrRemaining();
    $('#attrCounter').textContent=`${remaining} ponto${Math.abs(remaining)===1?'':'s'} restante${Math.abs(remaining)===1?'':'s'}`;
    $('#attrCounter').classList.toggle('bad',remaining<0);
    $('#attributeEditor').innerHTML=Object.keys(attrNames).map(k=>{
      const v=state.attrs[k];
      const canMinus=v>0 || (v===1 && zeroCount()===0);
      const canPlus=v<3 && remaining>0;
      return `<div class="attr-edit"><button data-attr-minus="${k}" ${v<=0?'disabled':''}>−</button><div><strong>${attrNames[k]}</strong><span>${attrAbbr[k]}</span></div><b>${v}</b><button data-attr-plus="${k}" ${!canPlus?'disabled':''}>+</button></div>`;
    }).join('');
    $('#boostList').innerHTML=boostNex.map(n=>{
      const unlocked=state.nex>=n; const cur=state.boosts[n]; const a=effAttrs();
      return `<div class="boost-card ${unlocked?'':'locked-boost'}"><div><h3>NEX ${n}% — Aumento de Atributo</h3><small>${unlocked?'Escolha um atributo para receber +1 (máximo final 5).':'Bloqueado pelo NEX atual.'}</small></div><div class="boost-choices">${Object.keys(attrNames).map(k=>`<button data-boost="${n}" data-key="${k}" class="${cur===k?'selected':''}" ${!unlocked || (a[k]>=5 && cur!==k)?'disabled':''}>${attrAbbr[k]}</button>`).join('')}</div></div>`;
    }).join('');
  }

  function originCard(o){ return `<button class="option-card ${state.origin===o.id?'selected':''}" data-origin="${o.id}"><span class="info-corner" data-origin-info="${o.id}">i</span><strong>${esc(o.name)}</strong><small>${esc(o.skills.join(' • '))}</small><p><b>${esc(o.power)}</b><br>${esc(o.powerText.slice(0,120))}${o.powerText.length>120?'…':''}</p></button>`; }
  function renderOrigins(){ const q=$('#originSearch').value.trim().toLowerCase(); $('#originGrid').innerHTML=D.origins.filter(o=>(o.name+' '+o.power+' '+o.skills.join(' ')).toLowerCase().includes(q)).map(originCard).join(''); }

  function renderClasses(){
    $('#classGrid').innerHTML=Object.values(D.classes).map(c=>`<button class="option-card ${state.classId===c.id?'selected':''}" data-class="${c.id}"><span class="info-corner" data-class-info="${c.id}">i</span><strong>${c.name}</strong><small>${c.prof.join(' • ')}</small><p>${c.summary}</p></button>`).join('');
  }

  function renderTrails(){
    const c=getClass(); const lock=$('#trailLock'); const grid=$('#trailGrid');
    if(!state.nex || !c){ lock.textContent='Escolha NEX e classe.'; grid.innerHTML='<div class="locked-card">A trilha depende de NEX 10% e de uma classe.</div>'; }
    else if(state.nex<10){ lock.textContent='Bloqueada até NEX 10%.'; grid.innerHTML='<div class="locked-card">A primeira habilidade de trilha é recebida em NEX 10%.</div>'; }
    else { lock.textContent='Disponível'; grid.innerHTML=c.trails.map(t=>`<button class="option-card ${state.trail===t.id?'selected':''}" data-trail="${t.id}"><span class="info-corner" data-trail-info="${t.id}">i</span><strong>${t.name}</strong><small>${t.req?`Pré-requisito: ${t.req}`:'NEX 10% • 40% • 65% • 99%'}</small><p>${t.desc}</p></button>`).join(''); }
    const fav = hasFirstTrail('aniquilador');
    $('#favoriteBox').classList.toggle('hidden',!fav);
    if(fav){
      const weaponIds=Object.keys(state.inventory).filter(id=>state.inventory[id]>0 && D.weapons.some(w=>w.id===id));
      $('#favoriteWeapon').innerHTML='<option value="">Selecione...</option>'+weaponIds.map(id=>`<option value="${id}" ${state.favoriteWeapon===id?'selected':''}>${D.weapons.find(w=>w.id===id).name}</option>`).join('');
    }
  }

  function powerReqOkay(p){
    const a=effAttrs(); const req=p.req||'';
    const m=req.match(/NEX (\d+)%/); if(m && state.nex<+m[1]) return false;
    const map={Agi:'agi',For:'for',Int:'int',Pre:'pre',Vig:'vig'};
    for(const [lab,key] of Object.entries(map)){ const mm=req.match(new RegExp(lab+'\\s*(\\d+)')); if(mm && a[key]<+mm[1])return false; }
    if(req.includes('treinado em Iniciativa')&&!allTrainedSkills().has('Iniciativa'))return false;
    if(req.includes('treinado em Tecnologia')&&!allTrainedSkills().has('Tecnologia'))return false;
    if(req.includes('treinado em Atletismo')&&!allTrainedSkills().has('Atletismo'))return false;
    if(req.includes('treinado em Crime')&&!allTrainedSkills().has('Crime'))return false;
    if(req.includes('treinado em Percepção')&&!allTrainedSkills().has('Percepção'))return false;
    if(req.includes('Tática')&&!allTrainedSkills().has('Tática'))return false;
    if(req.includes('Pontaria')&&!allTrainedSkills().has('Pontaria') && !allTrainedSkills().has('Luta'))return false;
    return true;
  }
  function renderPowers(){
    const c=getClass(), slots=availablePowerSlots();
    $('#classPowerCounter').textContent=`${state.classPowers.length} / ${slots}`;
    $('#powerSlots').innerHTML=powerNex.map((n,i)=>`<span class="${state.nex>=n?'on':''}">${n}% ${state.classPowers[i]?`• ${esc(c?.powers.find(p=>p.id===state.classPowers[i])?.name||'')}`:''}</span>`).join('') + (state.nex>=50?`<span class="on">50% Versatilidade${state.versatility==='class'&&state.versatilityPower?` • ${esc(c?.powers.find(p=>p.id===state.versatilityPower)?.name||'')}`:''}</span>`:'');
    if(!c || slots===0) $('#powerGrid').innerHTML='<div class="locked-card">Poderes de classe começam no NEX 15%.</div>';
    else $('#powerGrid').innerHTML=c.powers.map(p=>{ const ok=powerReqOkay(p); return `<button class="option-card ${ok?'':'disabled'}" data-add-power="${p.id}" ${ok?'':'disabled'}><span class="info-corner" data-power-info="${p.id}">i</span><strong>${p.name}</strong><small>${p.req?`Pré-requisito: ${p.req}`:'Sem pré-requisito adicional'}</small><p>${p.text.slice(0,135)}${p.text.length>135?'…':''}</p></button>`; }).join('');
    $('#selectedPowers').innerHTML=state.classPowers.map((id,i)=>{const p=c?.powers.find(x=>x.id===id);return p?`<div class="selected-row"><span><b>NEX ${powerNex[i]}%</b> ${p.name}</span><button data-remove-power="${i}">Remover</button></div>`:''}).join('');
    const vb=$('#versatilityBox'); if(c && state.nex>=50){vb.classList.remove('hidden');vb.innerHTML=`<div><strong>Versatilidade — NEX 50%</strong><p>Escolha um poder da própria classe, um poder paranormal ou a habilidade de NEX 10% de outra trilha da mesma classe.</p></div><div class="versatility-controls"><select id="versatilitySelect"><option value="">Selecione...</option><option value="class" ${state.versatility==='class'?'selected':''}>Poder de ${c.name}</option><option value="paranormal" ${state.versatility==='paranormal'?'selected':''}>Poder paranormal</option>${c.trails.filter(t=>t.id!==state.trail).map(t=>`<option value="trail:${t.id}" ${state.versatility===`trail:${t.id}`?'selected':''}>${t.name}: ${t.abilities[0].name}</option>`).join('')}</select>${state.versatility==='class'?`<select id="versatilityPowerSelect"><option value="">Escolha o poder...</option>${c.powers.map(p=>`<option value="${p.id}" ${state.versatilityPower===p.id?'selected':''}>${p.name}</option>`).join('')}</select>`:''}</div>`;}else vb.classList.add('hidden');

    const ps=paranormalSlots(); $('#paranormalCounter').textContent=`${state.paranormal.length} / ${ps}`;
    $('#elementFilters').innerHTML=['','Conhecimento','Energia','Morte','Sangue','Universal'].map(e=>`<button class="skill-chip ${state.paranormalElement===e?'selected':''}" data-paranormal-element="${e}">${e||'Todos'}</button>`).join('');
    $('#paranormalGrid').innerHTML=ps?D.paranormalPowers.filter(p=>!state.paranormalElement||p.element===state.paranormalElement).map((p,i)=>`<button class="option-card" data-add-paranormal="${D.paranormalPowers.indexOf(p)}"><span class="info-corner" data-paranormal-info="${D.paranormalPowers.indexOf(p)}">i</span><strong>${p.name}</strong><small>${p.element}${p.req?' • '+p.req:''}</small><p>${p.text.slice(0,130)}${p.text.length>130?'…':''}</p></button>`).join(''):'<div class="locked-card">Escolha Transcender ou a origem Cultista Arrependido para liberar poderes paranormais.</div>';
    $('#selectedParanormal').innerHTML=state.paranormal.map((idx,i)=>{const p=D.paranormalPowers[idx];return `<div class="selected-row"><span><b>${p.element}</b> ${p.name}</span><button data-remove-paranormal="${i}">Remover</button></div>`}).join('');
  }

  function renderSkills(){
    document.querySelectorAll('.perito-select').forEach(x=>x.remove()); const locked=skillBaseLocked(); const limit=extraSkillLimit();
    $('#skillCounter').textContent=`${state.skills.length} / ${limit} escolhas livres`;
    if(state.classId==='combatente'){
      $('#combatSkillChoices').classList.remove('hidden');
      $('#combatSkillChoices').innerHTML=`<div><strong>Escolhas obrigatórias do Combatente</strong><p>Escolha uma perícia ofensiva e uma defensiva.</p></div><div class="inline-selects"><select id="combatAttackSelect"><option ${state.combatAttack==='Luta'?'selected':''}>Luta</option><option ${state.combatAttack==='Pontaria'?'selected':''}>Pontaria</option></select><select id="combatResistSelect"><option ${state.combatResist==='Fortitude'?'selected':''}>Fortitude</option><option ${state.combatResist==='Reflexos'?'selected':''}>Reflexos</option></select></div>`;
    } else $('#combatSkillChoices').classList.add('hidden');
    $('#skillsGrid').innerHTML=D.skills.map(s=>{
      const isLocked=locked.has(s.name), sel=state.skills.includes(s.name);
      return `<button class="skill-chip ${isLocked?'locked':sel?'selected':''}" data-skill="${s.name}" ${isLocked?'disabled':''}>${s.name} <small>${s.attr}</small></button>`;
    }).join('');
    if(state.classId==='especialista'){const trained=[...allTrainedSkills()].filter(x=>!['Luta','Pontaria'].includes(x)); const box=document.createElement('div'); box.className='subcard perito-select'; box.innerHTML=`<div class="subcard-head"><div><h3>Perito</h3><p>Escolha duas perícias treinadas (exceto Luta e Pontaria).</p></div><span class="counter">${state.perito.length} / 2</span></div><div class="skills-grid">${trained.map(s=>`<button class="skill-chip ${state.perito.includes(s)?'selected':''}" data-perito="${s}">${s}</button>`).join('')}</div>`; $('#skillsGrid').after(box); }
    renderTraining();
  }

  function renderTraining(){
    const ranks=selectedRanks(), trained=Object.keys(ranks);
    if(!state.nex || state.nex<35 || !state.classId){ $('#trainingPanel').innerHTML='<div class="locked-card">Grau de treinamento é liberado no NEX 35%.</div>'; return; }
    const lim35=classGradeLimit(35), lim70=classGradeLimit(70);
    const sec35=`<div class="subcard"><div class="subcard-head"><div><h3>NEX 35% — Veterano</h3><p>Eleve perícias treinadas em um grau.</p></div><span class="counter">${state.train35.length} / ${lim35}</span></div><div class="skills-grid">${trained.map(s=>`<button class="skill-chip ${state.train35.includes(s)?'selected':''}" data-train35="${s}">${s}</button>`).join('')}</div></div>`;
    const sec70=state.nex>=70?`<div class="subcard"><div class="subcard-head"><div><h3>NEX 70% — Novo aumento</h3><p>Perícias escolhidas novamente podem chegar a Expert.</p></div><span class="counter">${state.train70.length} / ${lim70}</span></div><div class="skills-grid">${trained.map(s=>`<button class="skill-chip ${state.train70.includes(s)?'selected':''}" data-train70="${s}">${s}${state.train35.includes(s)?' • pode virar Expert':''}</button>`).join('')}</div></div>`:'';
    $('#trainingPanel').innerHTML=sec35+sec70;
  }

  function renderRituals(){
    const slots=ritualSlots(), maxC=maxRitualCircle();
    $('#ritualCountLabel').textContent=`${state.rituals.length} / ${slots}`;
    $('#ritualDesc').textContent=state.classId==='ocultista'?`Você pode escolher ${slots} ritual(is) pelo progresso atual. Círculo máximo: ${maxC}º. A trilha Graduado adiciona rituais extras fora do limite padrão.`:'A progressão automática é da classe Ocultista. Rituais também podem ser obtidos por poderes específicos, conforme o livro.';
    $('#circleStrip').innerHTML=[1,2,3,4].map(c=>`<span class="${maxC>=c?'on':''}">${c}º círculo ${maxC>=c?'liberado':'bloqueado'}</span>`).join('');
    const elements=['','Conhecimento','Energia','Morte','Sangue','Medo'];
    $('#ritualFilters').innerHTML=elements.map(e=>`<button class="skill-chip ${state.ritualElement===e?'selected':''}" data-ritual-element="${e}">${e||'Todos'}</button>`).join('');
    const q=$('#ritualSearch').value.trim().toLowerCase();
    $('#ritualGrid').innerHTML=D.rituals.filter(r=>r.circle<=maxC && (!state.ritualElement||r.element===state.ritualElement) && (r.name+' '+r.summary).toLowerCase().includes(q)).map(r=>{
      const selected=state.rituals.includes(r.id); return `<div class="catalog-card ${selected?'selected':''}"><div><span class="type-label">${r.element} • ${r.circle}º círculo</span><strong>${r.name}</strong><p>${r.summary}</p><small>${selected?'Selecionado':'Disponível'}</small></div><div class="qty"><button data-ritual-toggle="${r.id}">${selected?'−':'+'}</button></div><button class="info-corner" data-ritual-info="${r.id}">i</button></div>`;
    }).join('') || '<div class="locked-card">Nenhum ritual disponível com os filtros atuais.</div>';
  }

  function itemEffective(item){
    let cat=item.category, spaces=item.spaces;
    const mods=state.mods[item.id]||[];
    if(item.type==='Arma'){
      cat+=mods.length;
      if(mods.some(id=>D.weaponMods.find(m=>m.id===id)?.name==='Discreta')) spaces=Math.max(0,spaces-1);
      if(hasFirstTrail('aniquilador') && state.favoriteWeapon===item.id){
        const red=state.nex>=99?4:state.nex>=65?3:state.nex>=40?2:1; cat=Math.max(0,cat-red); spaces=Math.max(0,spaces-1);
      }
    } else if(item.type==='Munição'){ cat+=mods.length; } else if(item.type==='Proteção'){
      cat+=mods.length; for(const id of mods) spaces+=D.protectionMods.find(m=>m.id===id)?.spaceDelta||0; spaces=Math.max(0,spaces);
    } else if(['Acessório'].includes(item.type)){
      cat+=mods.length; if(mods.some(id=>D.accessoryMods.find(m=>m.id===id)?.name==='Discreto'))spaces=Math.max(0,spaces-1);
    }
    if(item.name==='Kit de perícia'){
      if(state.origin==='engenheiro' && state.favoriteKit==='engenheiro')cat=Math.max(0,cat-1);
      if(allClassPowerObjs().some(p=>p.name==='Mochila de Utilidades') && state.favoriteKit==='mochila'){cat=Math.max(0,cat-1);spaces=Math.max(0,spaces-1);}
    }
    return {cat,spaces};
  }
  function inventorySpace(){ return D.equipment.reduce((s,it)=>s+(state.inventory[it.id]||0)*itemEffective(it).spaces,0); }
  function carryCapacity(){ const a=effAttrs(); let score=a.for; if(state.classId==='especialista' && hasFirstTrail('tecnico'))score+=a.int; return score<=0?2:score*5; }
  function categoryCounts(){ const c={1:0,2:0,3:0,4:0,over:0}; D.equipment.forEach(it=>{const q=state.inventory[it.id]||0;if(!q)return;const cat=itemEffective(it).cat;if(cat>=1&&cat<=4)c[cat]+=q;else if(cat>4)c.over+=q;});return c; }
  function renderInventory(){
    $('#patentSelect').innerHTML=Object.entries(D.patent).map(([id,p])=>`<option value="${id}" ${state.patent===id?'selected':''}>${p.name}</option>`).join('');
    const types=[...new Set(D.equipment.map(i=>i.type))]; $('#itemType').innerHTML='<option value="">Todos</option>'+types.map(t=>`<option value="${t}" ${state.itemType===t?'selected':''}>${t}</option>`).join('');
    const p=D.patent[state.patent], counts=categoryCounts();
    $('#patentLimits').innerHTML=`<div><span>Crédito</span><strong>${p.credit}</strong></div>`+[1,2,3,4].map(c=>`<div class="${counts[c]>p.limits[c]?'over':''}"><span>Categoria ${catRoman(c)}</span><strong>${counts[c]} / ${p.limits[c]}</strong></div>`).join('');
    const kitNeeded=state.origin==='engenheiro'||allClassPowerObjs().some(x=>x.name==='Mochila de Utilidades');
    $('#kitFavoriteBox').classList.toggle('hidden',!kitNeeded);
    if(kitNeeded){ $('#kitFavoriteBox').innerHTML=`<div><strong>Reduções em Kit de Perícia</strong><p>Defina qual efeito está sendo aplicado ao kit genérico do inventário.</p></div><select id="favoriteKitSelect"><option value="">Nenhum</option>${state.origin==='engenheiro'?`<option value="engenheiro" ${state.favoriteKit==='engenheiro'?'selected':''}>Ferramentas Favoritas (Engenheiro)</option>`:''}${allClassPowerObjs().some(x=>x.name==='Mochila de Utilidades')?`<option value="mochila" ${state.favoriteKit==='mochila'?'selected':''}>Mochila de Utilidades</option>`:''}</select>`; }
    const q=$('#itemSearch').value.trim().toLowerCase();
    const items=D.equipment.filter(i=>(!state.itemType||i.type===state.itemType)&&(i.name+' '+i.type+' '+i.desc).toLowerCase().includes(q));
    $('#inventoryCatalog').innerHTML=items.map(it=>{
      const qty=state.inventory[it.id]||0, eff=itemEffective(it);
      const sub=it.type==='Arma'?`${it.damage} • crítico ${it.crit} • ${it.range}`:it.type==='Proteção'?`Defesa +${it.defense}`:it.type;
      const hasConfig=it.type==='Arma'||it.type==='Munição'||it.type==='Proteção'||it.type==='Acessório';
      return `<div class="catalog-card ${qty?'selected':''}"><div><span class="type-label">${it.type} • Cat. ${catRoman(eff.cat)} • ${eff.spaces} espaço(s)</span><strong>${it.name}</strong><p>${sub}. ${it.desc}</p><small>${qty?`${qty} no inventário`:'Não selecionado'}</small>${hasConfig&&qty?`<button class="mini-config" data-config-item="${it.id}">Modificar</button>`:''}</div><div class="qty"><button data-item-minus="${it.id}" ${qty<=0?'disabled':''}>−</button><b>${qty}</b><button data-item-plus="${it.id}">+</button></div><button class="info-corner" data-item-info="${it.id}">i</button></div>`;
    }).join('');
  }

  function renderSheet(){
    const a=effAttrs(), c=getClass(), o=getOrigin(), t=getTrail();
    $('#sheetNex').textContent=state.nex?`NEX ${state.nex}%`:'NEX —'; $('#sheetOrigin').textContent=o?.name||'—'; $('#sheetClass').textContent=c?.name||'—'; $('#sheetTrail').textContent=t?.name||'—'; $('#sheetPatent').textContent=D.patent[state.patent].name;
    for(const [k,id] of Object.entries({agi:'#sAgi',for:'#sFor',int:'#sInt',pre:'#sPre',vig:'#sVig'}))$(id).textContent=a[k];
    $('#sheetAttrNote').textContent=boostNex.some(n=>state.nex>=n&&state.boosts[n])?'inclui aumentos de NEX':'iniciais';
    let pv='—',pe='—',san='—';
    if(c&&state.nex){ const idx=nexIndex(); pv=c.pvBase+a.vig + idx*(c.pvStep+a.vig); pe=c.peBase+a.pre + idx*(c.peStep+a.pre); san=c.sanBase+idx*c.sanStep-transcenderCount()*c.sanStep;
      if(o?.id==='desgarrado')pv+=5;
      if(state.trail==='tropa'&&state.nex>=10)pv+=Math.floor(state.nex/5);
      const sf=state.paranormal.map(i=>D.paranormalPowers[i]?.name).filter(Boolean); if(sf.includes('Sangue de Ferro'))pv+=3+Math.floor(state.nex/5);
    }
    $('#sheetPV').textContent=pv; $('#sheetPE').textContent=pe; $('#sheetSAN').textContent=san;
    let def=10+a.agi+(o?.id==='policial'?1:0); const prots=D.protections.filter(p=>(state.inventory[p.id]||0)>0); if(prots.length)def+=Math.max(...prots.map(p=>p.defense)); $('#sheetDEF').textContent=def;
    const used=inventorySpace(), cap=carryCapacity(), hard=cap*2; const fill=Math.min(100,used/(hard||1)*100); $('#loadText').textContent=`${used} / ${cap} normal • máx. ${hard}`; const bar=$('#loadFill');bar.style.width=`${fill}%`;bar.className=used>hard?'critical':used>cap?'warn':''; const st=$('#loadStatus'); st.className='status-line '+(used>hard?'critical':used>cap?'warn':''); st.textContent=used>hard?'Carga impossível: acima do dobro do limite':used>cap?'Sobrecarregado: –5 Defesa/perícias de carga e –3m deslocamento':'Carga normal';
    const inv=D.equipment.filter(it=>(state.inventory[it.id]||0)>0); $('#sheetInventory').innerHTML=inv.length?inv.map(it=>`<div><span>${state.inventory[it.id]}× ${it.name}</span><small>Cat. ${catRoman(itemEffective(it).cat)} • ${itemEffective(it).spaces} esp.</small></div>`).join(''):'<div class="empty-state">Nenhum item selecionado.</div>';
    const pows=[]; if(o)pows.push([o.power,'Origem']); if(c)pows.push([c.ability,'Classe']); if(t)t.abilities.filter(x=>x.nex<=state.nex).forEach(x=>pows.push([x.name,`Trilha ${x.nex}%`])); if(state.nex>=50 && state.versatility?.startsWith('trail:')){const vt=c?.trails.find(x=>x.id===state.versatility.split(':')[1]); if(vt)pows.push([vt.abilities[0].name,'Versatilidade']);} selectedClassPowerObjs().forEach(x=>pows.push([x.name,'Poder de classe'])); if(versatilityPowerObj())pows.push([versatilityPowerObj().name,'Versatilidade']); state.paranormal.forEach(i=>{const p=D.paranormalPowers[i]; if(p)pows.push([p.name,p.element]);}); $('#sheetPowers').innerHTML=pows.length?pows.map(([n,s])=>`<div><span>${n}</span><small>${s}</small></div>`).join(''):'<div class="empty-state">Nenhuma habilidade escolhida.</div>'; $('#powerCountLabel').textContent=`${pows.length} registradas`;
    const ranks=selectedRanks(); $('#sheetSkills').innerHTML=Object.keys(ranks).length?Object.entries(ranks).sort().map(([n,r])=>`<span>${n}${r==='Treinado'?'':` • ${r}`}</span>`).join(''):'<span>—</span>';
    const rs=state.rituals.map(id=>D.rituals.find(r=>r.id===id)).filter(Boolean); $('#sheetRituals').innerHTML=rs.length?rs.map(r=>`<div><span>${r.name}</span><small>${r.element} ${r.circle}º</small></div>`).join(''):'<div class="empty-state">Nenhum ritual.</div>';
  }

  function renderValidation(){
    const msgs=[]; const add=(kind,text)=>msgs.push({kind,text});
    if(!state.nex)add('error','Escolha o NEX.'); else add('ok',`NEX ${state.nex}% selecionado.`);
    if(attrRemaining()!==0)add('error',`Distribuição inicial de atributos incompleta (${attrRemaining()} ponto(s) restante(s)).`); else add('ok','Atributos iniciais fecham corretamente.');
    if(!state.origin)add('error','Escolha uma origem.'); if(!state.classId)add('error','Escolha uma classe.');
    if(state.nex>=10&&!state.trail)add('error','Escolha uma trilha para o NEX atual.');
    if(state.classPowers.length<availablePowerSlots())add('warn',`Faltam ${availablePowerSlots()-state.classPowers.length} poder(es) de classe.`);
    if(state.classId==='especialista'&&state.perito.length<2)add('warn',`Faltam ${2-state.perito.length} perícia(s) da habilidade Perito.`);
    if(state.nex>=50 && state.versatility==='class' && !state.versatilityPower)add('warn','Versatilidade: escolha o poder de classe recebido.');
    if(state.skills.length<extraSkillLimit())add('warn',`Faltam ${extraSkillLimit()-state.skills.length} perícia(s) adicional(is).`);
    if(state.classId==='ocultista'&&state.rituals.length<ritualSlots())add('warn',`Faltam ${ritualSlots()-state.rituals.length} ritual(is) para a progressão atual.`);
    const used=inventorySpace(),cap=carryCapacity(); if(used>cap*2)add('error','Inventário ultrapassa o dobro da capacidade e não é permitido.'); else if(used>cap)add('warn','Personagem está sobrecarregado.'); else add('ok','Carga dentro do limite normal.');
    const counts=categoryCounts(),limits=D.patent[state.patent].limits; for(let c=1;c<=4;c++)if(counts[c]>limits[c])add('error',`Categoria ${catRoman(c)} excede a patente (${counts[c]}/${limits[c]}).`); if(counts.over)add('error',`${counts.over} item(ns) ficou(ram) acima da categoria IV após modificações/reduções.`);
    if(hasFirstTrail('aniquilador')&&!state.favoriteWeapon)add('warn','Aniquilador: selecione a arma de A Favorita no inventário.');
    $('#validationBox').innerHTML=msgs.map(m=>`<div class="validation ${m.kind}">${m.kind==='ok'?'✓':m.kind==='warn'?'!':'×'} <span>${m.text}</span></div>`).join('');
  }

  function renderAll(){ trimDependentChoices(); renderNex(); renderAttributes(); renderOrigins(); renderClasses(); renderTrails(); renderPowers(); renderSkills(); renderRituals(); renderInventory(); renderSheet(); renderValidation(); }

  function openModal(title,eyebrow,html){ $('#modalTitle').textContent=title; $('#modalEyebrow').textContent=eyebrow; $('#modalBody').innerHTML=html; $('#infoModal').classList.add('open'); $('#infoModal').setAttribute('aria-hidden','false'); }
  function closeModal(){ $('#infoModal').classList.remove('open'); $('#infoModal').setAttribute('aria-hidden','true'); }
  function infoGeneric(type){
    if(type==='nex')openModal('Nível de Exposição Paranormal','Progressão',`<p>O NEX mede quanto do personagem já foi exposto ao Outro Lado. Um agente iniciante começa em 5%. Novos níveis concedem PV, PE, Sanidade e habilidades de classe durante um Interlúdio.</p><p>Na progressão usada pelo livro: trilha em 10%; poderes de classe a partir de 15%; aumento de atributo em 20%, 50%, 80% e 95%; grau de treinamento em 35% e 70%; versatilidade em 50%.</p>`);
    if(type==='attributes')openModal('Atributos','Criação',`<p>Os cinco atributos são Agilidade, Força, Intelecto, Presença e Vigor. Todos começam em 1 e recebem 4 pontos para distribuição. É possível reduzir <b>um</b> atributo a 0 para receber 1 ponto adicional, e o máximo inicial é 3.</p><p>Ao fazer um teste, rola-se uma quantidade de d20 igual ao valor do atributo e usa-se o melhor resultado. Com atributo 0, rolam-se 2d20 e usa-se o pior.</p>`);
    if(type==='classes')openModal('Classes','Criação',`<p><b>Combatente:</b> linha de frente e domínio de armas.</p><p><b>Especialista:</b> versatilidade, perícias e improviso.</p><p><b>Ocultista:</b> estudo do Outro Lado e rituais.</p><p>A classe define recursos, perícias, proficiências, poderes e trilhas.</p>`);
    if(type==='inventory')openModal('Capacidade de Carga','Equipamento',`<p>Por padrão, você carrega 5 espaços por ponto de Força; com Força 0, apenas 2 espaços. Acima do limite normal fica sobrecarregado: –5 em Defesa e testes afetados por carga e –3m de deslocamento. Nunca pode ultrapassar o dobro do limite.</p><p>Armas de duas mãos e proteções leves normalmente ocupam 2 espaços; proteções pesadas, 5. A patente limita a quantidade de itens de cada categoria, enquanto categoria 0 é livre.</p>`);
  }
  function openItemConfig(id){
    const it=D.equipment.find(x=>x.id===id); if(!it)return;
    const selected=new Set(state.mods[id]||[]); let mods=[];
    if(it.type==='Arma')mods=D.weaponMods.filter(m=>!['Dum Dum','Explosiva'].includes(m.name)); else if(it.type==='Munição')mods=D.weaponMods.filter(m=>['Dum Dum','Explosiva'].includes(m.name)); else if(it.type==='Proteção')mods=D.protectionMods; else if(it.type==='Acessório')mods=D.accessoryMods;
    const html=`<p>${esc(it.desc)}</p><p><b>Categoria base:</b> ${catRoman(it.category)} • <b>Espaço base:</b> ${it.spaces}</p><h3>Modificações</h3><p>Cada modificação aumenta a categoria em I. As alterações de espaço são calculadas automaticamente quando descritas.</p><div class="modal-checks">${mods.map(m=>`<label><input type="checkbox" data-mod-toggle="${id}" value="${m.id}" ${selected.has(m.id)?'checked':''}> <b>${m.name}</b><span>${m.text}</span></label>`).join('')}</div>`;
    openModal(it.name,'Configurar equipamento',html);
  }

  function save(){ const ok=storageSet('opr-ficha-v2',JSON.stringify(state)); toast(ok?'Ficha salva neste navegador.':'O navegador bloqueou o armazenamento local; use Exportar JSON.'); }
  function exportState(){ const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=(state.name||'ficha-ordem').replace(/[^a-z0-9]+/gi,'-').toLowerCase()+'.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000); }
  function loadState(obj){ state={...defaultState(),...obj,attrs:{...defaultState().attrs,...obj.attrs},boosts:{...defaultState().boosts,...obj.boosts},inventory:{...obj.inventory},mods:{...obj.mods}}; $('#characterName').value=state.name||'Novo Agente'; renderAll(); }

  document.addEventListener('click',e=>{
    const b=e.target.closest('button,a,span,input,label');
    if(e.target.matches('[data-close-modal]'))return closeModal();
    if(e.target.closest('[data-nex]'))return setNex(+e.target.closest('[data-nex]').dataset.nex);
    if(e.target.closest('[data-info]'))return infoGeneric(e.target.closest('[data-info]').dataset.info);
    if(e.target.closest('[data-attr-minus]')){const k=e.target.closest('[data-attr-minus]').dataset.attrMinus;if(state.attrs[k]>0){ if(state.attrs[k]===1&&zeroCount()>=1)return toast('Apenas um atributo pode ser reduzido a 0.'); state.attrs[k]--;renderAll(); }return;}
    if(e.target.closest('[data-attr-plus]')){const k=e.target.closest('[data-attr-plus]').dataset.attrPlus;if(state.attrs[k]<3&&attrRemaining()>0){state.attrs[k]++;renderAll();}return;}
    if(e.target.closest('[data-boost]')){const el=e.target.closest('[data-boost]'); const n=+el.dataset.boost,k=el.dataset.key; state.boosts[n]=state.boosts[n]===k?null:k;renderAll();return;}
    if(e.target.closest('[data-origin-info]')){e.stopPropagation(); const o=D.origins.find(x=>x.id===e.target.closest('[data-origin-info]').dataset.originInfo); return openModal(o.name,'Origem',`<p>${o.desc}</p><dl><dt>Perícias treinadas</dt><dd>${o.skills.join(', ')}</dd><dt>Poder</dt><dd><b>${o.power}</b></dd></dl><div class="modal-ability"><b>${o.power}</b><p>${o.powerText}</p></div>`);}
    if(e.target.closest('[data-origin]')){state.origin=e.target.closest('[data-origin]').dataset.origin; trimDependentChoices();renderAll();return;}
    if(e.target.closest('[data-class-info]')){e.stopPropagation();const c=D.classes[e.target.closest('[data-class-info]').dataset.classInfo];return openModal(c.name,'Classe',`<p>${c.summary}</p><dl><dt>PV iniciais</dt><dd>${c.pvBase}+Vigor</dd><dt>PV por avanço</dt><dd>${c.pvStep}+Vigor</dd><dt>PE iniciais</dt><dd>${c.peBase}+Presença</dd><dt>PE por avanço</dt><dd>${c.peStep}+Presença</dd><dt>SAN inicial</dt><dd>${c.sanBase}</dd><dt>SAN por avanço</dt><dd>${c.sanStep}</dd><dt>Perícias</dt><dd>${c.skillsText}</dd><dt>Proficiências</dt><dd>${c.prof.join(', ')}</dd></dl><div class="modal-ability"><b>${c.ability}</b><p>${c.abilityText}</p></div>`);}
    if(e.target.closest('[data-class]')){state.classId=e.target.closest('[data-class]').dataset.class;state.trail=null;state.classPowers=[];state.versatility=null;state.versatilityPower=null;state.perito=[];state.skills=[];state.train35=[];state.train70=[];state.rituals=[];trimDependentChoices();renderAll();return;}
    if(e.target.closest('[data-trail-info]')){e.stopPropagation();const t=getClass()?.trails.find(x=>x.id===e.target.closest('[data-trail-info]').dataset.trailInfo);return openModal(t.name,'Trilha',`<p>${t.desc}</p>${t.req?`<p><b>Pré-requisito:</b> ${t.req}</p>`:''}${t.abilities.map(a=>`<div class="modal-ability"><b>NEX ${a.nex}% — ${a.name}</b><p>${a.text}</p></div>`).join('')}`);}
    if(e.target.closest('[data-trail]')){state.trail=e.target.closest('[data-trail]').dataset.trail;if(state.versatility===`trail:${state.trail}`)state.versatility=null;renderAll();return;}
    if(e.target.closest('[data-power-info]')){e.stopPropagation();const p=getClass()?.powers.find(x=>x.id===e.target.closest('[data-power-info]').dataset.powerInfo);return openModal(p.name,'Poder de '+getClass().name,`${p.req?`<p><b>Pré-requisito:</b> ${p.req}</p>`:''}<p>${p.text}</p>`);}
    if(e.target.closest('[data-add-power]')){const id=e.target.closest('[data-add-power]').dataset.addPower;if(state.classPowers.length>=availablePowerSlots())return toast('Todos os espaços de poder deste NEX já foram preenchidos.');const p=getClass().powers.find(x=>x.id===id); const repeat=['Transcender','Treinamento em Perícia'].includes(p.name);if(!repeat&&state.classPowers.includes(id))return toast('Este poder não pode ser escolhido novamente.');state.classPowers.push(id);trimDependentChoices();renderAll();return;}
    if(e.target.closest('[data-remove-power]')){state.classPowers.splice(+e.target.closest('[data-remove-power]').dataset.removePower,1);trimDependentChoices();renderAll();return;}
    if(e.target.closest('[data-paranormal-element]')){state.paranormalElement=e.target.closest('[data-paranormal-element]').dataset.paranormalElement;renderPowers();return;}
    if(e.target.closest('[data-paranormal-info]')){e.stopPropagation();const p=D.paranormalPowers[+e.target.closest('[data-paranormal-info]').dataset.paranormalInfo];return openModal(p.name,`Poder de ${p.element}`,`${p.req?`<p><b>Pré-requisito:</b> ${p.req}</p>`:''}<p>${p.text}</p>`);}
    if(e.target.closest('[data-add-paranormal]')){if(state.paranormal.length>=paranormalSlots())return toast('Sem espaços de poder paranormal disponíveis.');state.paranormal.push(+e.target.closest('[data-add-paranormal]').dataset.addParanormal);renderAll();return;}
    if(e.target.closest('[data-remove-paranormal]')){state.paranormal.splice(+e.target.closest('[data-remove-paranormal]').dataset.removeParanormal,1);renderAll();return;}
    if(e.target.closest('[data-perito]')){const sk=e.target.closest('[data-perito]').dataset.perito;if(state.perito.includes(sk))state.perito=state.perito.filter(x=>x!==sk);else if(state.perito.length<2)state.perito.push(sk);else return toast('Perito permite duas perícias.');renderAll();return;}
    if(e.target.closest('[data-skill]')){const s=e.target.closest('[data-skill]').dataset.skill;if(skillBaseLocked().has(s))return;if(state.skills.includes(s))state.skills=state.skills.filter(x=>x!==s);else if(state.skills.length<extraSkillLimit())state.skills.push(s);else return toast('Limite de perícias adicionais atingido.');renderAll();return;}
    if(e.target.closest('[data-train35]')){const s=e.target.closest('[data-train35]').dataset.train35;if(state.train35.includes(s))state.train35=state.train35.filter(x=>x!==s);else if(state.train35.length<classGradeLimit(35))state.train35.push(s);else return toast('Limite de perícias do NEX 35% atingido.');renderAll();return;}
    if(e.target.closest('[data-train70]')){const s=e.target.closest('[data-train70]').dataset.train70;if(state.train70.includes(s))state.train70=state.train70.filter(x=>x!==s);else if(state.train70.length<classGradeLimit(70))state.train70.push(s);else return toast('Limite de perícias do NEX 70% atingido.');renderAll();return;}
    if(e.target.closest('[data-ritual-element]')){state.ritualElement=e.target.closest('[data-ritual-element]').dataset.ritualElement;renderRituals();return;}
    if(e.target.closest('[data-ritual-toggle]')){const id=e.target.closest('[data-ritual-toggle]').dataset.ritualToggle;if(state.rituals.includes(id))state.rituals=state.rituals.filter(x=>x!==id);else if(state.rituals.length<ritualSlots())state.rituals.push(id);else return toast('Limite de rituais da progressão atual atingido.');renderAll();return;}
    if(e.target.closest('[data-ritual-info]')){e.stopPropagation();const r=D.rituals.find(x=>x.id===e.target.closest('[data-ritual-info]').dataset.ritualInfo);return openModal(r.name,`${r.element} • ${r.circle}º círculo`,`<p>${esc(r.details||r.summary)}</p>${r.page?`<p class="source-note">Descrição extraída da página ${r.page} do PDF enviado.</p>`:''}`);}
    if(e.target.closest('[data-item-info]')){e.stopPropagation();const it=D.equipment.find(x=>x.id===e.target.closest('[data-item-info]').dataset.itemInfo);const eff=itemEffective(it);return openModal(it.name,it.type,`<p>${it.desc}</p><dl><dt>Categoria base</dt><dd>${catRoman(it.category)}</dd><dt>Categoria atual</dt><dd>${catRoman(eff.cat)}</dd><dt>Espaço atual</dt><dd>${eff.spaces}</dd>${it.damage?`<dt>Dano</dt><dd>${it.damage}</dd><dt>Crítico</dt><dd>${it.crit}</dd><dt>Alcance</dt><dd>${it.range}</dd><dt>Tipo de dano</dt><dd>${it.damageType}</dd><dt>Proficiência</dt><dd>${it.proficiency}</dd>`:''}</dl>`);}
    if(e.target.closest('[data-item-plus]')){const id=e.target.closest('[data-item-plus]').dataset.itemPlus;state.inventory[id]=(state.inventory[id]||0)+1;renderAll();return;}
    if(e.target.closest('[data-item-minus]')){const id=e.target.closest('[data-item-minus]').dataset.itemMinus;state.inventory[id]=Math.max(0,(state.inventory[id]||0)-1);if(!state.inventory[id]){delete state.inventory[id];delete state.mods[id];if(state.favoriteWeapon===id)state.favoriteWeapon=null;}renderAll();return;}
    if(e.target.closest('[data-config-item]'))return openItemConfig(e.target.closest('[data-config-item]').dataset.configItem);
  });

  document.addEventListener('change',e=>{
    if(e.target.matches('[data-mod-toggle]')){const id=e.target.dataset.modToggle;const set=new Set(state.mods[id]||[]);e.target.checked?set.add(e.target.value):set.delete(e.target.value);state.mods[id]=[...set];renderInventory();renderSheet();renderValidation();return;}
    if(e.target.id==='versatilitySelect'){state.versatility=e.target.value||null;if(state.versatility!=='class')state.versatilityPower=null;trimDependentChoices();renderAll();}
    if(e.target.id==='versatilityPowerSelect'){state.versatilityPower=e.target.value||null;trimDependentChoices();renderAll();}
    if(e.target.id==='combatAttackSelect'){state.combatAttack=e.target.value;state.skills=state.skills.filter(s=>!skillBaseLocked().has(s));renderAll();}
    if(e.target.id==='combatResistSelect'){state.combatResist=e.target.value;state.skills=state.skills.filter(s=>!skillBaseLocked().has(s));renderAll();}
    if(e.target.id==='patentSelect'){state.patent=e.target.value;renderAll();}
    if(e.target.id==='itemType'){state.itemType=e.target.value;renderInventory();}
    if(e.target.id==='favoriteWeapon'){state.favoriteWeapon=e.target.value||null;renderAll();}
    if(e.target.id==='favoriteKitSelect'){state.favoriteKit=e.target.value||null;renderAll();}
    if(e.target.id==='importFile'&&e.target.files[0]){const fr=new FileReader();fr.onload=()=>{try{loadState(JSON.parse(fr.result));toast('Ficha importada.');}catch{toast('Arquivo JSON inválido.')}};fr.readAsText(e.target.files[0]);}
  });
  $('#originSearch').addEventListener('input',renderOrigins); $('#ritualSearch').addEventListener('input',renderRituals); $('#itemSearch').addEventListener('input',renderInventory);
  $('#characterName').addEventListener('input',e=>{state.name=e.target.value;});
  $('#saveBtn').onclick=save; $('#finalSave').onclick=save; $('#exportBtn').onclick=exportState; $('#finalExport').onclick=exportState; $('#importBtn').onclick=()=>$('#importFile').click(); $('#printBtn').onclick=()=>window.print(); $('#finalPrint').onclick=()=>window.print();
  $('#resetBtn').onclick=()=>{if(confirm('Limpar toda a ficha?')){state=defaultState();storageRemove('opr-ficha-v2');$('#characterName').value=state.name;$('#nexGate').classList.add('open');renderAll();}};
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});

  const saved=storageGet('opr-ficha-v2'); if(saved){try{loadState(JSON.parse(saved));$('#nexGate').classList.toggle('open',!state.nex);}catch{renderAll();}} else renderAll();
})();
