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
    patent:'recruta', inventory:{}, itemBase:{}, nextInstanceId:1, mods:{}, curses:{}, curseOptions:{}, equipped:{}, attuned:{},
    favoriteWeapon:null,
    engineerFavoriteItem:null, utilityItem:null, paranormalToolItem:null, crimeItem:null,
    ritualElement:'', paranormalElement:'', itemType:'', itemWeaponKind:'',
  });
  let state = defaultState();

  // Cada chave do inventário corresponde a uma versão INDEPENDENTE do item.
  // Cópias antigas preservam a chave original (ex.: "a1"); novas versões usam chaves únicas.
  // Todas as configurações (modificações, maldições, opções e uso) são indexadas por essa chave.
  const originalId = x => state.itemBase?.[typeof x==='string'?x:x.id] || (typeof x==='string'?x:(x.baseId||x.id));
  const itemFor = uid => {
    const base=D.equipment.find(x=>x.id===originalId(uid));
    return base ? {...base, id:uid, baseId:base.id} : null;
  };
  const inventoryItems = () => Object.keys(state.inventory).filter(id=>state.inventory[id]>0).map(itemFor).filter(Boolean);
  const itemCopies = id => inventoryItems().filter(it=>originalId(it)===id);
  const inventoryTotal = id => itemCopies(id).reduce((total,it)=>total+(state.inventory[it.id]||0),0);
  const instanceDescription = it => {
    const mods=state.mods[it.id]||[], curses=state.curses[it.id]||[];
    const attrs=[mods.length?`${mods.length} mod.`:'',curses.length?`${curses.length} maldição(ões)`:'' ].filter(Boolean);
    return attrs.length?attrs.join(' • '):'Sem alterações';
  };
  function createItemInstance(baseId, {from=null,quantity=1}={}){
    if(!D.equipment.some(it=>it.id===baseId))return null;
    let uid=baseId;
    if(Object.prototype.hasOwnProperty.call(state.inventory,uid)){
      do {uid=`${baseId}__copia${state.nextInstanceId++}`;} while(Object.prototype.hasOwnProperty.call(state.inventory,uid));
      state.itemBase[uid]=baseId;
    }
    state.inventory[uid]=quantity;
    if(from){
      if(state.mods[from])state.mods[uid]=[...state.mods[from]];
      if(state.curses[from])state.curses[uid]=[...state.curses[from]];
      if(state.curseOptions[from])state.curseOptions[uid]=JSON.parse(JSON.stringify(state.curseOptions[from]));
      if(from in state.equipped)state.equipped[uid]=state.equipped[from];
      if(from in state.attuned)state.attuned[uid]=state.attuned[from];
    }
    return uid;
  }
  function removeItemInstance(uid){
    const baseId=originalId(uid);
    delete state.inventory[uid];delete state.itemBase[uid];delete state.mods[uid];
    delete state.curses[uid];delete state.curseOptions[uid];delete state.equipped[uid];delete state.attuned[uid];
    for(const key of ['engineerFavoriteItem','utilityItem','paranormalToolItem','crimeItem'])if(state[key]===uid)state[key]=null;
    if(state.favoriteWeapon===baseId&&!inventoryItems().some(it=>originalId(it)===baseId))state.favoriteWeapon=null;
  }
  function addPlainItem(baseId){
    const plain=itemCopies(baseId).find(it=>!(state.mods[it.id]||[]).length&&!(state.curses[it.id]||[]).length&&!Object.values(state.curseOptions[it.id]||{}).some(v=>v!==''&&v!==null));
    if(plain)state.inventory[plain.id]++;
    else createItemInstance(baseId);
  }

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
  const hasClassPower = name => allClassPowerObjs().some(p=>p.name===name);
  const paranormalPowerObjs = () => state.paranormal.map(i=>D.paranormalPowers[i]).filter(Boolean);
  const hasParanormalPower = name => paranormalPowerObjs().some(p=>p.name===name);
  const transcenderCount = () => allClassPowerObjs().filter(p=>p.name==='Transcender').length;
  const paranormalSlots = () => transcenderCount() + (state.origin==='cultista-arrependido'?1:0);
  const aprenderRitualCount = () => paranormalPowerObjs().filter(p=>p.name==='Aprender Ritual').length;
  const occultistMaxCircle = () => !state.nex || state.classId!=='ocultista' ? 0 : state.nex>=85?4:state.nex>=55?3:state.nex>=25?2:1;
  const paranormalRitualMaxCircle = () => !state.nex || !aprenderRitualCount() ? 0 : state.nex>=75?3:state.nex>=45?2:1;
  const maxRitualCircle = () => Math.max(occultistMaxCircle(), paranormalRitualMaxCircle(), hasFirstTrail('lamina')?1:0);
  const ritualSlots = () => {
    if(!state.nex) return 0;
    let slots=0;
    if(state.classId==='ocultista'){
      slots=3+nexIndex();
      if(state.trail==='graduado' && state.nex>=10){ slots++; if(state.nex>=25)slots++; if(state.nex>=55)slots++; if(state.nex>=85)slots++; }
    }
    slots+=aprenderRitualCount();
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
    if(state.classId==='combatente')return 2+a.int;
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
      const validVers=new Set(['class',...getClass().trails.filter(t=>t.id!==state.trail).map(t=>'trail:'+t.id)]);
      if(state.versatility && !validVers.has(state.versatility)){state.versatility=null;state.versatilityPower=null;}
      if(state.versatility!=='class')state.versatilityPower=null;
      const valid=new Set(getClass().powers.map(p=>p.id));
      state.classPowers=state.classPowers.filter(x=>valid.has(x)).slice(0,availablePowerSlots());
      const validTrails=new Set(getClass().trails.map(t=>t.id)); if(!validTrails.has(state.trail))state.trail=null;
    } else {state.classPowers=[];state.trail=null;state.versatility=null;state.versatilityPower=null;}
    state.paranormal=state.paranormal.slice(0,paranormalSlots());
    state.skills=state.skills.filter(s=>!skillBaseLocked().has(s)).slice(0,extraSkillLimit());
    state.perito=state.perito.filter(s=>allTrainedSkills().has(s) && !['Luta','Pontaria'].includes(s)).slice(0,2);
    state.rituals=state.rituals.filter(id=>D.rituals.some(r=>r.id===id && r.circle<=maxRitualCircle())).slice(0,ritualSlots());
    const inInv=id=>id && (state.inventory[id]||0)>0;
    if(state.favoriteWeapon && !inventoryItems().some(it=>originalId(it)===state.favoriteWeapon)) state.favoriteWeapon=null;
    if(state.engineerFavoriteItem && !inInv(state.engineerFavoriteItem)) state.engineerFavoriteItem=null;
    if(state.utilityItem && !inInv(state.utilityItem)) state.utilityItem=null;
    if(state.paranormalToolItem && !inInv(state.paranormalToolItem)) state.paranormalToolItem=null;
    if(state.crimeItem && !inInv(state.crimeItem)) state.crimeItem=null;
  }

  function renderNex(){
    const buttons=D.nexLevels.map(n=>`<button class="nex-option ${state.nex===n?'selected':''}" data-nex="${n}">${n}%</button>`).join('');
    $('#nexGrid').innerHTML=buttons; $('#gateNexGrid').innerHTML=buttons;
    const unlock=[];
    if(state.nex){
      unlock.push(`Limite de PE ${D.peRound[state.nex]}`);
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
      const weaponIds=[...new Set(inventoryItems().filter(it=>it.type==='Arma').map(it=>originalId(it)))];
      $('#favoriteWeapon').innerHTML='<option value="">Selecione...</option>'+weaponIds.map(id=>`<option value="${id}" ${state.favoriteWeapon===id?'selected':''}>${D.weapons.find(w=>w.id===id).name}</option>`).join('');
    }
  }

  function powerReqOkay(p){
    const a=effAttrs(); const req=p.req||'';
    const m=req.match(/NEX (\d+)%/); if(m && state.nex<+m[1]) return false;
    const map={Agi:'agi',For:'for',Int:'int',Pre:'pre',Vig:'vig'};
    for(const [lab,key] of Object.entries(map)){ const mm=req.match(new RegExp(lab+'\\s*(\\d+)')); if(mm && a[key]<+mm[1])return false; }
    const trained=allTrainedSkills();
    if(req.includes('treinado em Luta ou Pontaria') && !trained.has('Luta') && !trained.has('Pontaria'))return false;
    for(const sk of ['Iniciativa','Tecnologia','Atletismo','Crime']) if(req.includes(`treinado em ${sk}`)&&!trained.has(sk))return false;
    if(req.includes('treinado em Percepção e Tática')&&(!trained.has('Percepção')||!trained.has('Tática')))return false;
    if(req.includes('treinado em Luta')&&!req.includes('ou Pontaria')&&!trained.has('Luta'))return false;
    if(req.includes('treinado em Pontaria')&&!req.includes('Luta ou')&&!trained.has('Pontaria'))return false;
    if(req==='Proteção Pesada'&&!hasClassPower('Proteção Pesada'))return false;
    if(req.includes('Especialista em Elemento')&&!hasClassPower('Especialista em Elemento'))return false;
    return true;
  }

  function renderPowers(){
    const c=getClass(), slots=availablePowerSlots();
    $('#classPowerCounter').textContent=`${state.classPowers.length} / ${slots}`;
    $('#powerSlots').innerHTML=powerNex.map((n,i)=>`<span class="${state.nex>=n?'on':''}">${n}% ${state.classPowers[i]?`• ${esc(c?.powers.find(p=>p.id===state.classPowers[i])?.name||'')}`:''}</span>`).join('') + (state.nex>=50?`<span class="on">50% Versatilidade${state.versatility==='class'&&state.versatilityPower?` • ${esc(c?.powers.find(p=>p.id===state.versatilityPower)?.name||'')}`:''}</span>`:'');
    if(!c || slots===0) $('#powerGrid').innerHTML='<div class="locked-card">Poderes de classe começam no NEX 15%.</div>';
    else $('#powerGrid').innerHTML=c.powers.map(p=>{ const ok=powerReqOkay(p); return `<button class="option-card ${ok?'':'disabled'}" data-add-power="${p.id}" ${ok?'':'disabled'}><span class="info-corner" data-power-info="${p.id}">i</span><strong>${p.name}</strong><small>${p.req?`Pré-requisito: ${p.req}`:'Sem pré-requisito adicional'}</small><p>${p.text.slice(0,135)}${p.text.length>135?'…':''}</p></button>`; }).join('');
    $('#selectedPowers').innerHTML=state.classPowers.map((id,i)=>{const p=c?.powers.find(x=>x.id===id);return p?`<div class="selected-row"><span><b>NEX ${powerNex[i]}%</b> ${p.name}</span><button data-remove-power="${i}">Remover</button></div>`:''}).join('');
    const vb=$('#versatilityBox');
    if(c && state.nex>=50){
      vb.classList.remove('hidden');
      vb.innerHTML=`<div><strong>Versatilidade — NEX 50%</strong><p>Escolha um poder da própria classe ou a habilidade de NEX 10% de outra trilha da mesma classe.</p></div><div class="versatility-controls"><select id="versatilitySelect"><option value="">Selecione...</option><option value="class" ${state.versatility==='class'?'selected':''}>Poder de ${c.name}</option>${c.trails.filter(t=>t.id!==state.trail).map(t=>`<option value="trail:${t.id}" ${state.versatility===`trail:${t.id}`?'selected':''}>${t.name}: ${t.abilities[0].name}</option>`).join('')}</select>${state.versatility==='class'?`<select id="versatilityPowerSelect"><option value="">Escolha o poder...</option>${c.powers.filter(powerReqOkay).map(p=>`<option value="${p.id}" ${state.versatilityPower===p.id?'selected':''}>${p.name}</option>`).join('')}</select>`:''}</div>`;
    } else vb.classList.add('hidden');

    const ps=paranormalSlots(); $('#paranormalCounter').textContent=`${state.paranormal.length} / ${ps}`;
    $('#elementFilters').innerHTML=['','Conhecimento','Energia','Morte','Sangue','Universal'].map(e=>`<button class="skill-chip ${state.paranormalElement===e?'selected':''}" data-paranormal-element="${e}">${e||'Todos'}</button>`).join('');
    $('#paranormalGrid').innerHTML=ps?D.paranormalPowers.filter(p=>!state.paranormalElement||p.element===state.paranormalElement).map(p=>{ const idx=D.paranormalPowers.indexOf(p); return `<button class="option-card" data-add-paranormal="${idx}"><span class="info-corner" data-paranormal-info="${idx}">i</span><strong>${p.name}</strong><small>${p.element}${p.req?' • '+p.req:''}</small><p>${p.text.slice(0,130)}${p.text.length>130?'…':''}</p></button>`; }).join(''):'<div class="locked-card">Escolha Transcender ou a origem Cultista Arrependido para liberar poderes paranormais.</div>';
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
    const fromOccult=state.classId==='ocultista';
    const fromPower=aprenderRitualCount()>0;
    $('#ritualDesc').textContent=fromOccult||fromPower?`Você pode escolher ${slots} ritual(is) pelas fontes atuais. Círculo máximo disponível: ${maxC}º. A trilha Graduado e Aprender Ritual adicionam escolhas conforme suas próprias regras.`:'Escolha Ocultista ou obtenha Aprender Ritual para liberar escolhas de rituais.';
    $('#circleStrip').innerHTML=[1,2,3,4].map(c=>`<span class="${maxC>=c?'on':''}">${c}º círculo ${maxC>=c?'liberado':'bloqueado'}</span>`).join('');
    const elements=['','Conhecimento','Energia','Morte','Sangue','Medo'];
    $('#ritualFilters').innerHTML=elements.map(e=>`<button class="skill-chip ${state.ritualElement===e?'selected':''}" data-ritual-element="${e}">${e||'Todos'}</button>`).join('');
    const q=$('#ritualSearch').value.trim().toLowerCase();
    const ritualElementMatch=r=>!state.ritualElement || (r.elements||[r.element]).includes(state.ritualElement);
    $('#ritualGrid').innerHTML=D.rituals.filter(r=>r.circle<=maxC && ritualElementMatch(r) && (r.name+' '+r.summary).toLowerCase().includes(q)).map(r=>{
      const selected=state.rituals.includes(r.id); return `<div class="catalog-card ${selected?'selected':''}"><div><span class="type-label">${r.element} • ${r.circle}º círculo</span><strong>${r.name}</strong><p>${r.summary}</p><small>${selected?'Selecionado':'Disponível'}</small></div><div class="qty"><button data-ritual-toggle="${r.id}">${selected?'−':'+'}</button></div><button class="info-corner" data-ritual-info="${r.id}">i</button></div>`;
    }).join('') || '<div class="locked-card">Nenhum ritual disponível com os filtros atuais.</div>';
  }

  // O banco de maldições é carregado em equipment_extra.js (páginas 144–147 do livro).
  const allCurses=D.curses;
  const cursedById=id=>allCurses.find(x=>x.id===id);
  const selectedCurses=item=>(state.curses[item.id]||[]).map(cursedById).filter(Boolean);
  const selectedOptions=(id,curseId)=>state.curseOptions?.[id]?.[curseId]||{};
  const isEquipped=item=>(state.inventory[item.id]||0)>0 && state.equipped?.[item.id]!==false;
  const opponentPairs=[['Sangue','Morte'],['Sangue','Conhecimento'],['Conhecimento','Energia'],['Energia','Morte']];
  const cursesConflict=(a,b)=>a!==b&&opponentPairs.some(p=>p.includes(a)&&p.includes(b));
  const realCurseElement=(it,curse)=>curse.element==='Variável'?(selectedOptions(it.id,curse.id).element||null):curse.element;
  function itemCurses(item){
    if(item.type==='Acessório' && !['g1','g2'].includes(originalId(item)))return [];
    if(!['Arma','Proteção','Acessório'].includes(item.type))return [];
    return allCurses.filter(c=>c.type===item.type && (!c.mechanics.meleeOnly||item.weaponKind==='corpo-a-corpo'));
  }
  function passiveCurses(){return inventoryItems().filter(isEquipped).flatMap(it=>selectedCurses(it).map(c=>({item:it,curse:c})));}
  function gearAttrs(){
    const a=effAttrs(); const found=new Set();
    for(const {curse} of passiveCurses()){
      const key=curse.mechanics.attr;
      if(key && !found.has(curse.id)){a[key]+=1;found.add(curse.id);}
    }
    return a;
  }
  function cursePassiveSummary(){
    const p=passiveCurses(), effects=[], uniq=new Set();
    for(const {item,curse} of p){
      const m=curse.mechanics;
      if(m.resistance&&!uniq.has(curse.id)){effects.push(`${curse.name} (${item.name}): ${m.resistance}`);uniq.add(curse.id);}
      if(m.skill&&!uniq.has('skill-'+curse.id)){effects.push(`${curse.name}: ${Object.entries(m.skill).map(([k,v])=>k+' +'+v).join(', ')}`);uniq.add('skill-'+curse.id);}
      if(m.speed&&!uniq.has('speed-'+curse.id)){effects.push(`${curse.name}: deslocamento +${m.speed}m`);uniq.add('speed-'+curse.id);}
      if(m.dt&&!uniq.has('dt-'+curse.id)){effects.push(`${curse.name}: DT de habilidades/rituais +${m.dt}`);uniq.add('dt-'+curse.id);}
      if(m.pv&&state.attuned[item.id]&&!uniq.has('pv-'+curse.id)){effects.push(`${curse.name}: PV máximo +${m.pv} (1 dia de uso)`);uniq.add('pv-'+curse.id);}
      if(m.pe&&state.attuned[item.id]&&!uniq.has('pe-'+curse.id)){effects.push(`${curse.name}: PE máximo +${m.pe} (1 dia de uso)`);uniq.add('pe-'+curse.id);}
      if(m.damage)effects.push(`${item.name}: ${m.damage}`);
    }
    for(const it of inventoryItems().filter(x=>x.type==='Acessório'&&isEquipped(x))){
      const opts=state.curseOptions?.[it.id]||{};
      const skill=opts['accessory:skill'];
      if(skill){const base=(state.mods[it.id]||[]).includes('am0')?5:2;effects.push(`${it.name}: ${skill} +${base}`);}
      if((state.mods[it.id]||[]).includes('am2')&&opts['accessory:extra'])effects.push(`${it.name}: função adicional ${opts['accessory:extra']} +2`);
      if((state.mods[it.id]||[]).includes('am3')&&opts['accessory:kit'])effects.push(`${it.name}: funciona como kit de ${opts['accessory:kit']}`);
    }
    return effects;
  }
  function itemEffective(item){
    let cat=item.category,spaces=item.spaces,defense=item.defense||0,rd=item.rd||0;
    if(originalId(item)==='sp-selo'){const sr=state.curseOptions?.[item.id]?.special?.ritual;const found=D.rituals.find(r=>r.id===sr);if(found)cat=found.circle;}
    const mods=state.mods[item.id]||[];
    const curses=selectedCurses(item);
    if(curses.length)cat+=1+curses.length; // +II para a primeira, +I para cada posterior.
    if(item.type==='Arma'){
      for(const id of mods){const m=D.weaponMods.find(x=>x.id===id);if(m){cat+=m.categoryDelta??1;spaces+=m.spaceDelta||0;}}
      if(hasFirstTrail('aniquilador')&&state.favoriteWeapon===originalId(item))cat-=state.nex>=99?3:state.nex>=40?2:1;
    }else if(item.type==='Munição'){
      for(const id of mods){const m=D.weaponMods.find(x=>x.id===id);if(m)cat+=m.categoryDelta??1;}
    }else if(item.type==='Proteção'){
      for(const id of mods){const m=D.protectionMods.find(x=>x.id===id);if(m){cat+=m.categoryDelta??1;spaces+=m.spaceDelta||0;defense+=m.defenseDelta||0;if(m.id==='pm1')rd=Math.max(rd,5);}}
    }else if(item.type==='Acessório'){
      for(const id of mods){const m=D.accessoryMods.find(x=>x.id===id);if(m){cat+=m.categoryDelta??1;spaces+=m.spaceDelta||0;}}
    }
    for(const curse of curses){defense+=curse.mechanics.defense||0;if(curse.id==='curse-cinetica')rd+=item.heavy&&item.protectionKind!=='shield'?5:2;}
    const isGeneral=['Acessório','Explosivo','Operacional','Item paranormal'].includes(item.type);
    if(state.trail==='tecnico'&&state.nex>=40&&isGeneral)cat-=1;
    if(state.origin==='engenheiro'&&state.engineerFavoriteItem===item.id&&item.type!=='Arma')cat-=1;
    if(hasClassPower('Mochila de Utilidades')&&state.utilityItem===item.id&&item.type!=='Arma'){cat-=1;spaces-=1;}
    if(hasClassPower('Ferramentas Paranormais')&&state.paranormalToolItem===item.id&&item.type==='Item paranormal')cat-=1;
    return {cat:Math.max(0,cat),spaces:Math.max(0,spaces),defense:Math.max(0,defense),rd:Math.max(0,rd)};
  }
  function weaponEffective(it){
    const mods=state.mods[it.id]||[], curses=selectedCurses(it);
    let bonusHit=0, bonusDamage=0, extraDice=[],threatBonus=0,threatMultiplier=1,reach=it.range||'—';
    const modHas=id=>mods.includes(id),curseHas=id=>curses.some(c=>c.id==='curse-'+id);
    if(modHas('wm0'))bonusHit+=2;if(modHas('wm5'))bonusHit+=2;
    if(modHas('wm1'))bonusDamage+=2;
    if(modHas('wm3'))threatBonus+=2;if(modHas('wm9'))threatBonus+=2;
    if(modHas('wm6'))extraDice.push('mais 1 dado da arma (calibre grosso)');
    if(curseHas('erosiva'))extraDice.push('+1d8 Morte');
    if(curseHas('lancinante'))extraDice.push('+1d8 Sangue (crítico multiplica)');
    if(curseHas('predadora'))threatMultiplier=2;
    const order=['—','Curto','Médio','Longo','Extremo'];
    if(it.weaponKind!=='corpo-a-corpo'&&(modHas('wm10')||curseHas('predadora'))){
      const jumps=(modHas('wm10')?1:0)+(curseHas('predadora')?1:0);
      reach=order[Math.min(order.length-1,Math.max(1,order.indexOf(reach))+jumps)]||reach;
    }
    if(curseHas('empuxo')&&it.weaponKind==='corpo-a-corpo')extraDice.push('arremesso: +1 dado da arma, retorno automático');
    const critInput=String(it.crit||'x2');
    const threatMatch=critInput.match(/(^|\/)1[0-9](?=\/|$)/);
    const threatOriginal=threatMatch?Number(threatMatch[0].replace('/','')):20;
    const margin=21-threatOriginal;
    const threatFinal=Math.max(2,21-(margin*threatMultiplier+threatBonus));
    const multiplierMatch=critInput.match(/x([2-9])/);
    const critFinal=(threatFinal<20?threatFinal+'/':'')+'x'+(multiplierMatch?.[1]||2);
    return {hit:bonusHit,bonusDamage,damage:it.damage,extraDice,crit:critFinal,range:reach};
  }
  function inventorySpace(){ return inventoryItems().reduce((s,it)=>s+(state.inventory[it.id]||0)*itemEffective(it).spaces,0); }
  function carryCapacity(){
    const a=gearAttrs(); let score=a.for;
    if(state.classId==='especialista' && hasFirstTrail('tecnico'))score+=a.int;
    let cap=score<=0?2:score*5;
    cap+=inventoryItems().reduce((sum,it)=>sum+((state.inventory[it.id]||0)*(it.capacityBonus||0)),0);
    return cap;
  }
  function categoryCounts(){
    const c={1:0,2:0,3:0,4:0,over:0};
    inventoryItems().forEach(it=>{
      let q=state.inventory[it.id]||0;if(!q)return;
      if(state.origin==='criminoso' && state.crimeItem===it.id)q=Math.max(0,q-1);
      const cat=itemEffective(it).cat;
      if(cat>=1&&cat<=4)c[cat]+=q;else if(cat>4)c.over+=q;
    });
    return c;
  }
  function inventoryOptionList(filter,selected){
    return inventoryItems().filter(filter).map(it=>`<option value="${it.id}" ${selected===it.id?'selected':''}>${esc(it.name)} — ${esc(instanceDescription(it))}</option>`).join('');
  }
  function renderInventory(){
    $('#patentSelect').innerHTML=Object.entries(D.patent).map(([id,p])=>`<option value="${id}" ${state.patent===id?'selected':''}>${p.name}</option>`).join('');
    const types=[...new Set(D.equipment.map(i=>i.type))]; $('#itemType').innerHTML='<option value="">Todos</option>'+types.map(t=>`<option value="${t}" ${state.itemType===t?'selected':''}>${t}</option>`).join('');
    if($('#itemWeaponKind')) $('#itemWeaponKind').value=state.itemWeaponKind||'';
    const p=D.patent[state.patent], counts=categoryCounts();
    $('#patentLimits').innerHTML=`<div><span>Crédito</span><strong>${p.credit}</strong></div>`+[1,2,3,4].map(c=>`<div class="${counts[c]>p.limits[c]?'over':''}"><span>Categoria ${catRoman(c)}</span><strong>${counts[c]} / ${p.limits[c]}</strong></div>`).join('');

    const effects=[];
    if(state.origin==='engenheiro') effects.push(`<label>Ferramenta Favorita (Engenheiro)<select id="engineerFavoriteItemSelect"><option value="">Selecione...</option>${inventoryOptionList(it=>it.type!=='Arma',state.engineerFavoriteItem)}</select></label>`);
    if(hasClassPower('Mochila de Utilidades')) effects.push(`<label>Mochila de Utilidades<select id="utilityItemSelect"><option value="">Selecione...</option>${inventoryOptionList(it=>it.type!=='Arma',state.utilityItem)}</select></label>`);
    if(hasClassPower('Ferramentas Paranormais')) effects.push(`<label>Ferramentas Paranormais<select id="paranormalToolItemSelect"><option value="">Selecione...</option>${inventoryOptionList(it=>it.type==='Item paranormal',state.paranormalToolItem)}</select></label>`);
    if(state.origin==='criminoso') effects.push(`<label>O Crime Compensa<select id="crimeItemSelect"><option value="">Nenhum item trazido da missão anterior</option>${inventoryOptionList(()=>true,state.crimeItem)}</select></label>`);
    $('#kitFavoriteBox').classList.toggle('hidden',!effects.length);
    if(effects.length) $('#kitFavoriteBox').innerHTML=`<div><strong>Efeitos que alteram o inventário</strong><p>Escolha o item afetado por cada habilidade. Categoria e espaço são recalculados automaticamente.</p></div><div class="inventory-effect-selects">${effects.join('')}</div>`;

    const q=$('#itemSearch').value.trim().toLowerCase();
    const items=D.equipment.filter(i=>(!state.itemType||i.type===state.itemType)&&(!state.itemWeaponKind||(i.type==='Arma'&&i.weaponKind===state.itemWeaponKind))&&(i.name+' '+i.type+' '+i.desc+' '+itemCopies(i.id).flatMap(it=>selectedCurses(it).map(c=>c.name)).join(' ')).toLowerCase().includes(q));
    $('#inventoryCatalog').innerHTML=items.map(base=>{
      const copies=itemCopies(base.id),total=inventoryTotal(base.id),hasConfig=['Arma','Munição','Proteção','Acessório'].includes(base.type)||base.id==='sp-selo';
      const kindLabel=base.type==='Arma'?(base.weaponKind==='corpo-a-corpo'?'Corpo a corpo':base.weaponKind==='fogo'?'Arma de fogo':'Arma de disparo'):base.type;
      const detail=base.type==='Arma'?`${base.damage} • crítico ${base.crit} • ${base.range}`:base.type==='Proteção'?`Defesa base +${base.defense||0}`:base.type;
      const variants=copies.map((it,index)=>{
        const uid=it.id,qty=state.inventory[uid]||0,eff=itemEffective(it);
        const ws=it.type==='Arma'?weaponEffective(it):null;
        const stats=ws?`${ws.damage}${ws.extraDice.length?' ('+ws.extraDice.join('; ')+')':''}${ws.bonusDamage?' • +'+ws.bonusDamage+' dano':''} • crítico ${ws.crit}${ws.hit?' • ataque +'+ws.hit:''}`:it.type==='Proteção'?`Defesa +${eff.defense}${eff.rd?' • RD '+eff.rd:''}`:'';
        const equipped=['Arma','Proteção','Acessório','Amaldiçoado especial'].includes(it.type);
        return `<div class="inventory-variant">
          <div class="variant-header"><strong>Versão ${index+1}</strong><span>${esc(instanceDescription(it))}</span></div>
          <div class="variant-details">Categoria ${catRoman(eff.cat)} • ${eff.spaces} espaço(s)${stats?' • '+esc(stats):''}</div>
          ${selectedCurses(it).length?`<div class="curse-inline">${selectedCurses(it).map(c=>`<span title="${esc(c.text)}">${esc(c.name)}</span>`).join('')}</div>`:''}
          <div class="variant-actions">
            <div class="qty"><button data-item-minus="${uid}" aria-label="Remover uma unidade desta versão">−</button><b>${qty}</b><button data-variant-plus="${uid}" aria-label="Adicionar uma unidade idêntica">+</button></div>
            ${hasConfig?`<button class="mini-config" data-config-item="${uid}">Modificar / amaldiçoar</button>`:''}
            ${qty>1?`<button class="mini-config secondary-config" data-variant-split="${uid}" title="Separar uma unidade em uma versão com configurações independentes">Separar 1 un.</button>`:''}
            ${equipped?`<label class="gear-equipped"><input type="checkbox" data-gear-equipped="${uid}" ${isEquipped(it)?'checked':''}> Em uso</label>`:''}
          </div></div>`;
      }).join('');
      return `<div class="catalog-card ${total?'selected':''} catalog-with-versions"><div class="catalog-heading"><span class="type-label">${kindLabel} • Cat. ${catRoman(base.category)} • ${base.spaces} espaço(s)</span><strong>${esc(base.name)}</strong><p>${esc(detail)}. ${esc(base.desc)}</p><small>${total?`${total} unidade(s) no inventário • ${copies.length} versão(ões)`:'Não selecionado'}</small></div><div class="catalog-add-actions"><button data-item-plus="${base.id}" title="Adicionar uma unidade normal (sem alterações)">+ Adicionar normal</button><button data-item-new="${base.id}" title="Criar outra cópia configurável separadamente">+ Nova versão</button></div><button class="info-corner" data-item-info="${base.id}">i</button>${copies.length?`<div class="variants-list">${variants}</div>`:''}</div>`;
    }).join('') || '<div class="locked-card">Nenhum equipamento encontrado com os filtros atuais.</div>';
  }

  function renderSheet(){
    const a=gearAttrs(), baseA=effAttrs(), c=getClass(), o=getOrigin(), t=getTrail();
    $('#sheetNex').textContent=state.nex?`NEX ${state.nex}%`:'NEX —'; $('#sheetOrigin').textContent=o?.name||'—'; $('#sheetClass').textContent=c?.name||'—'; $('#sheetTrail').textContent=t?.name||'—'; $('#sheetPatent').textContent=D.patent[state.patent].name;
    for(const [k,id] of Object.entries({agi:'#sAgi',for:'#sFor',int:'#sInt',pre:'#sPre',vig:'#sVig'}))$(id).textContent=a[k];
    $('#sheetAttrNote').textContent=boostNex.some(n=>state.nex>=n&&state.boosts[n])?'inclui aumentos de NEX':'iniciais';
    let pv='—',pe='—',san='—';
    if(c&&state.nex){
      const idx=nexIndex();
      pv=c.pvBase+a.vig + idx*(c.pvStep+a.vig);
      pe=c.peBase+baseA.pre + idx*(c.peStep+baseA.pre);
      const initialSan=o?.id==='cultista-arrependido'?Math.floor(c.sanBase/2):c.sanBase;
      san=initialSan+idx*c.sanStep-transcenderCount()*c.sanStep;
      if(o?.id==='desgarrado')pv+=Math.floor(state.nex/5);
      if(hasFirstTrail('tropa'))pv+=Math.floor(state.nex/5);
      if(hasParanormalPower('Sangue de Ferro'))pv+=2*(idx+1);
      if(o?.id==='universitario')pe+=1+Math.floor((state.nex-5)/10);
      if(hasParanormalPower('Potencial Aprimorado'))pe+=idx+1;
      if(o?.id==='vitima')san+=Math.floor(state.nex/5);
      const seen=new Set();for(const {item,curse} of passiveCurses()){
        if(seen.has(curse.id))continue;seen.add(curse.id);
        if(state.attuned?.[item.id]){pv+=curse.mechanics.pv||0;pe+=curse.mechanics.pe||0;}
      }
    }
    $('#sheetPV').textContent=pv; $('#sheetPE').textContent=pe; $('#sheetSAN').textContent=san;
    let def=10+a.agi+(o?.id==='policial'?2:0);
    if(hasClassPower('Reflexos Defensivos'))def+=2;
    if(hasParanormalPower('Precognição'))def+=2;
    const armors=inventoryItems().filter(p=>p.type==='Proteção'&&p.protectionKind==='armor'&&isEquipped(p));
    if(armors.length){
      def+=Math.max(...armors.map(p=>itemEffective(p).defense+(hasClassPower('Tanque de Guerra')&&p.heavy?2:0)));
    }
    const shield=inventoryItems().find(p=>p.type==='Proteção'&&p.protectionKind==='shield'&&isEquipped(p)); if(shield)def+=itemEffective(shield).defense;
    if(passiveCurses().some(({curse})=>curse.id==='curse-defesa'))def+=5;
    for(const it of inventoryItems().filter(it=>it.type==='Arma'&&isEquipped(it)))if(selectedCurses(it).some(c=>c.id==='curse-repulsora')){def+=2;break;}
    $('#sheetDEF').textContent=def;
    const used=inventorySpace(), cap=carryCapacity(), hard=cap*2; const fill=Math.min(100,used/(hard||1)*100);
    $('#loadText').textContent=`${used} / ${cap} normal • máx. ${hard}`;
    const bar=$('#loadFill');bar.style.width=`${fill}%`;bar.className=used>hard?'critical':used>cap?'warn':'';
    const st=$('#loadStatus'); st.className='status-line '+(used>hard?'critical':used>cap?'warn':''); st.textContent=used>hard?'Carga impossível: acima do dobro do limite':used>cap?'Sobrecarregado: –5 Defesa/perícias de carga e –3m deslocamento':'Carga normal';
    const inv=inventoryItems(); $('#sheetInventory').innerHTML=inv.length?inv.map(it=>{
      const copies=itemCopies(originalId(it)),index=copies.findIndex(x=>x.id===it.id)+1;
      const mods=state.mods[it.id]||[];
      const modBank=it.type==='Proteção'?D.protectionMods:it.type==='Acessório'?D.accessoryMods:D.weaponMods;
      const modNames=mods.map(id=>modBank.find(m=>m.id===id)?.name||id);
      return `<div class="sheet-inventory-row"><span>${state.inventory[it.id]}× ${esc(it.name)}${copies.length>1?' (versão '+index+')':''} ${isEquipped(it)&&['Arma','Proteção','Acessório','Amaldiçoado especial'].includes(it.type)?'<small>● Em uso</small>':''}</span><small>Cat. ${catRoman(itemEffective(it).cat)} • ${itemEffective(it).spaces} esp.</small>${modNames.length?`<div class="sheet-item-mods">Modificações: ${esc(modNames.join(', '))}</div>`:''}${selectedCurses(it).length?`<details><summary>Maldições: ${selectedCurses(it).map(c=>esc(c.name)).join(', ')}</summary>${selectedCurses(it).map(c=>`<p><b>${esc(c.name)}</b> (${esc(realCurseElement(it,c)||c.element)}): ${esc(c.text)}${c.mechanics.ritual&&selectedOptions(it.id,c.id).ritual?' • Ritual: '+esc(D.rituals.find(r=>r.id===selectedOptions(it.id,c.id).ritual)?.name||'—'):''}</p>`).join('')}</details>`:''}</div>`;
    }).join(''):'<div class="empty-state">Nenhum item selecionado.</div>';
    const pass=cursePassiveSummary();if(pass.length)$('#sheetInventory').insertAdjacentHTML('beforeend',`<div class="gear-bonus-list"><strong>Efeitos dos itens em uso</strong>${pass.map(x=>`<p>• ${esc(x)}</p>`).join('')}</div>`);
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
    if(state.nex>=50 && !state.versatility)add('warn','Falta escolher a Versatilidade de NEX 50%.');
    if(state.nex>=50 && state.versatility==='class' && !state.versatilityPower)add('warn','Versatilidade: escolha o poder de classe recebido.');
    if(state.skills.length<extraSkillLimit())add('warn',`Faltam ${extraSkillLimit()-state.skills.length} perícia(s) adicional(is).`);
    if(ritualSlots() && state.rituals.length<ritualSlots())add('warn',`Faltam ${ritualSlots()-state.rituals.length} ritual(is) para as fontes atuais.`);
    const used=inventorySpace(),cap=carryCapacity(); if(used>cap*2)add('error','Inventário ultrapassa o dobro da capacidade e não é permitido.'); else if(used>cap)add('warn','Personagem está sobrecarregado.'); else add('ok','Carga dentro do limite normal.');
    const counts=categoryCounts(),limits=D.patent[state.patent].limits; for(let c=1;c<=4;c++)if(counts[c]>limits[c])add('error',`Categoria ${catRoman(c)} excede a patente (${counts[c]}/${limits[c]}).`); if(counts.over)add('error',`${counts.over} item(ns) ficou(ram) acima da categoria IV após modificações/reduções.`);
    const allCurseCount=inventoryItems().reduce((sum,it)=>sum+(state.inventory[it.id]||0)*(selectedCurses(it).length+(it.type==='Amaldiçoado especial'?1:0)),0);
    if(allCurseCount&&!['especial','oficial','elite'].includes(state.patent))add('error','Itens amaldiçoados exigem pelo menos patente Agente Especial (livro, p. 144).');
    for(const it of inventoryItems()){
      const cs=selectedCurses(it);for(let i=0;i<cs.length;i++)for(let j=i+1;j<cs.length;j++){
        const a=realCurseElement(it,cs[i]),b=realCurseElement(it,cs[j]);if(a&&b&&cursesConflict(a,b))add('error',`${it.name}: maldições ${cs[i].name} e ${cs[j].name} possuem elementos opressores.`);
      }
      for(const curse of cs)if(curse.mechanics.target&&!selectedOptions(it.id,curse.id).element)add('warn',`${it.name}: escolha o elemento de ${curse.name}.`);
      for(const curse of cs)if(curse.mechanics.ritual&&!selectedOptions(it.id,curse.id).ritual)add('warn',`${it.name}: escolha o ritual de ${curse.name}.`);
      if(originalId(it)==='sp-selo'&&!state.curseOptions?.['sp-selo']?.special?.ritual)add('warn','Selo Paranormal: escolha o ritual inscrito para determinar sua categoria.');
    }
    if(hasFirstTrail('aniquilador')&&!state.favoriteWeapon)add('warn','Aniquilador: selecione a arma de A Favorita no inventário.');
    if(inventoryItems().filter(it=>originalId(it)==='g2'&&isEquipped(it)).reduce((n,it)=>n+(state.inventory[it.id]||0),0)>2)add('warn','Vestimentas: apenas duas podem fornecer bônus ao mesmo tempo.');
    if(inventoryItems().filter(p=>p.type==='Proteção'&&p.protectionKind==='armor'&&isEquipped(p)).length>1)add('warn','Há mais de uma proteção corporal marcada como em uso: a Defesa aplica somente a melhor.');
    if(state.origin==='engenheiro'&&!state.engineerFavoriteItem)add('warn','Engenheiro: selecione o item de Ferramenta Favorita no inventário.');
    if(hasClassPower('Mochila de Utilidades')&&!state.utilityItem)add('warn','Mochila de Utilidades: selecione o item beneficiado.');
    if(hasClassPower('Ferramentas Paranormais')&&!state.paranormalToolItem)add('warn','Ferramentas Paranormais: selecione o item paranormal beneficiado.');
    $('#validationBox').innerHTML=msgs.map(m=>`<div class="validation ${m.kind}">${m.kind==='ok'?'✓':m.kind==='warn'?'!':'×'} <span>${m.text}</span></div>`).join('');
  }

  function renderAll(){ trimDependentChoices(); renderNex(); renderAttributes(); renderOrigins(); renderClasses(); renderTrails(); renderPowers(); renderSkills(); renderRituals(); renderInventory(); renderSheet(); renderValidation(); }

  function openModal(title,eyebrow,html){ $('#modalTitle').textContent=title; $('#modalEyebrow').textContent=eyebrow; $('#modalBody').innerHTML=html; $('#infoModal').classList.add('open'); $('#infoModal').setAttribute('aria-hidden','false'); }
  function closeModal(){ $('#infoModal').classList.remove('open'); $('#infoModal').setAttribute('aria-hidden','true'); }
  function infoGeneric(type){
    if(type==='nex')openModal('Nível de Exposição Paranormal','Progressão',`<p>O NEX mede quanto do personagem já foi exposto ao Outro Lado. Um agente iniciante começa em 5%. Novos níveis concedem PV, PE, Sanidade e habilidades de classe; na v1.3, o mestre define quando o NEX aumenta (em geral, após missões).</p><p>Na progressão usada pelo livro: trilha em 10%; poderes de classe a partir de 15%; aumento de atributo em 20%, 50%, 80% e 95%; grau de treinamento em 35% e 70%; versatilidade em 50%.</p>`);
    if(type==='attributes')openModal('Atributos','Criação',`<p>Os cinco atributos são Agilidade, Força, Intelecto, Presença e Vigor. Todos começam em 1 e recebem 4 pontos para distribuição. É possível reduzir <b>um</b> atributo a 0 para receber 1 ponto adicional, e o máximo inicial é 3.</p><p>Ao fazer um teste, rola-se uma quantidade de d20 igual ao valor do atributo e usa-se o melhor resultado. Com atributo 0, rolam-se 2d20 e usa-se o pior.</p>`);
    if(type==='classes')openModal('Classes','Criação',`<p><b>Combatente:</b> linha de frente e domínio de armas.</p><p><b>Especialista:</b> versatilidade, perícias e improviso.</p><p><b>Ocultista:</b> estudo do Outro Lado e rituais.</p><p>A classe define recursos, perícias, proficiências, poderes e trilhas.</p>`);
    if(type==='inventory')openModal('Capacidade de Carga','Equipamento',`<p>Por padrão, você carrega 5 espaços por ponto de Força; com Força 0, apenas 2 espaços. Acima do limite normal fica sobrecarregado: –5 em Defesa e testes afetados por carga e –3m de deslocamento. Nunca pode ultrapassar o dobro do limite.</p><p>Armas de duas mãos e proteções leves normalmente ocupam 2 espaços; proteções pesadas, 5. A patente limita a quantidade de itens de cada categoria, enquanto categoria 0 é livre. A Mochila militar adiciona 2 espaços à capacidade e habilidades como Inventário Otimizado recalculam a carga automaticamente.</p>`);
  }
  function openItemConfig(id){
    const it=itemFor(id);if(!it||(state.inventory[id]||0)<1)return;
    const selected=new Set(state.mods[id]||[]);const active=new Set(state.curses[id]||[]);let mods=[];
    if(it.type==='Arma'){
      const autoNow=it.automatic||selected.has('wm8');
      mods=D.weaponMods.filter(m=>m.applies?.includes(it.weaponKind)&&(!m.requiresAutomatic||autoNow));
    }else if(it.type==='Munição')mods=D.weaponMods.filter(m=>m.applies?.includes('municao-balas')&&it.ammoKind==='balas');
    else if(it.type==='Proteção'){
      const kind=it.protectionKind==='shield'?'shield':it.heavy?'heavy':'light';
      mods=D.protectionMods.filter(m=>m.applies?.includes(kind)||(kind==='shield'&&m.id==='pm3'));
    }else if(it.type==='Acessório')mods=D.accessoryMods;
    const curses=itemCurses(it);
    const skillOptions=D.skills?.map(k=>typeof k==='string'?k:k.name)||['Atletismo','Atualidades','Ciências','Crime','Diplomacia','Enganação','Fortitude','Furtividade','Investigação','Medicina','Ocultismo','Percepção','Profissão','Tecnologia','Vontade'];
    const optSelect=(key,values,selectedValue,placeholder)=>`<label class="curse-setting">${placeholder}<select data-item-choice="${it.id}" data-choice-key="${key}"><option value="">Selecione...</option>${values.map(x=>`<option value="${esc(x.value||x)}" ${(x.value||x)===selectedValue?'selected':''}>${esc(x.label||x)}</option>`).join('')}</select></label>`;
    const curseHtml=curses.length?`<h3>Maldições</h3><p>Primeira maldição: +II de categoria; cada posterior: +I. Não podem coexistir elementos opressores. O preço em Sanidade é cumulativo e depende do elemento (livro, p. 145). Itens amaldiçoados são requisitados a partir de Agente Especial.</p><div class="modal-checks curses-editor">${curses.map(c=>{
      const opt=selectedOptions(id,c.id);
      const restrictions=active.has(c.id)?'':'', element=realCurseElement(it,c);
      const incompatible=element&&[...active].some(a=>a!==c.id&&cursesConflict(element,realCurseElement(it,cursedById(a))));
      let inputs='';
      if(active.has(c.id)){
        if(c.mechanics.target)inputs+=optSelect(`${c.id}:element`,['Conhecimento','Energia','Morte','Sangue'],opt.element||'',c.id==='curse-antielemento'?'Elemento das criaturas-alvo':'Elemento da resistência');
        if(c.mechanics.ritual)inputs+=optSelect(`${c.id}:ritual`,D.rituals.filter(r=>r.circle===1).map(r=>({value:r.id,label:r.name+' ('+r.element+')'})),opt.ritual||'','Ritual de 1º círculo');
      }
      return `<div class="curse-option ${incompatible?'curse-conflict':''}"><label><input type="checkbox" data-curse-toggle="${id}" value="${c.id}" ${active.has(c.id)?'checked':''}><span><b>${esc(c.name)}</b> <i>• ${esc(c.element)}</i></span></label><p>${esc(c.text)}</p>${inputs}</div>`;
    }).join('')}</div>`:'<p>Este tipo de item não recebe maldições segundo as regras do livro.</p>';
    const opts=state.curseOptions?.[id]||{};
    const choiceHtml=it.type==='Acessório'?`<h3>Perícia do acessório</h3><p>Configure a perícia usada pelo utensílio ou vestimenta. Luta e Pontaria não são válidas.</p>${optSelect('accessory:skill',skillOptions.filter(x=>!['Luta','Pontaria'].includes(x)),opts['accessory:skill']||'','Perícia principal')}${selected.has('am2')?optSelect('accessory:extra',skillOptions.filter(x=>!['Luta','Pontaria'].includes(x)),opts['accessory:extra']||'','Perícia da função adicional'):''}${selected.has('am3')?optSelect('accessory:kit',skillOptions,opts['accessory:kit']||'','Perícia do kit'):''}`:'';
    const sealHtml=originalId(it)==='sp-selo'?`<h3>Ritual gravado no selo</h3>${optSelect('special:ritual',D.rituals.map(r=>({value:r.id,label:r.name+' • '+r.circle+'º círculo • '+r.element})),opts.special?.ritual||'','Escolha o ritual do selo (categoria = círculo)')}`:'';
    const dayCurses=selectedCurses(it).filter(c=>c.mechanics.attuneDay);
    const dayHtml=dayCurses.length?`<label class="gear-equipped"><input type="checkbox" data-attuned="${it.id}" ${state.attuned?.[it.id]?'checked':''}> Este item já está sendo usado há pelo menos 1 dia (habilita PV/PE extra).</label>`:'';
    const html=`<p>${esc(it.desc)}</p><p><b>Categoria base:</b> ${catRoman(it.category)} • <b>Categoria atual:</b> ${catRoman(itemEffective(it).cat)} • <b>Espaços:</b> ${itemEffective(it).spaces}</p><h3>Modificações</h3><p>Cada modificação aumenta a categoria em I. Modificações iguais não se acumulam.</p><div class="modal-checks">${mods.length?mods.map(m=>`<label><input type="checkbox" data-mod-toggle="${id}" value="${m.id}" ${selected.has(m.id)?'checked':''}> <b>${esc(m.name)}</b><span>${esc(m.text)}</span></label>`).join(''):'<p>Sem modificações aplicáveis.</p>'}</div>${choiceHtml}${curseHtml}${sealHtml}${dayHtml}<div class="curse-rule-note"><b>Preço das maldições:</b> a cada falha em um teste baseado em Intelecto (Conhecimento), Agilidade (Energia), Presença (Morte) ou Força/Vigor (Sangue), perca 2 SAN por maldição desse elemento entre seus itens aceitos. O custo continua entre missões até o afastamento do item. Elementos opressores não podem coexistir <em>no mesmo item</em>.</div>`;
    openModal(it.name,'Configurar equipamento • Ordem Paranormal v1.3',html);
  }

  function save(){ const ok=storageSet('opr-ficha-v2',JSON.stringify(state)); toast(ok?'Ficha salva neste navegador.':'O navegador bloqueou o armazenamento local; use Exportar JSON.'); }
  function exportState(){ const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=(state.name||'ficha-ordem').replace(/[^a-z0-9]+/gi,'-').toLowerCase()+'.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000); }
  function loadState(obj){
    state={...defaultState(),...obj,attrs:{...defaultState().attrs,...obj.attrs},boosts:{...defaultState().boosts,...obj.boosts},inventory:{...(obj.inventory||{})},itemBase:{...(obj.itemBase||{})},nextInstanceId:Math.max(1,Number(obj.nextInstanceId)||1),mods:{...(obj.mods||{})},curses:{...(obj.curses||{})},curseOptions:{...(obj.curseOptions||{})},equipped:{...(obj.equipped||{})},attuned:{...(obj.attuned||{})}};
    // Fichas antigas usam o id original como única versão; nenhuma alteração é necessária.
    // Fichas novas preservam itemBase para recuperar o equipamento de origem.
    // Campos antigos da edição anterior são descartados para evitar aplicar regras incompatíveis.
    if(state.versatility==='paranormal')state.versatility=null;
    delete state.favoriteKit;
    $('#characterName').value=state.name||'Novo Agente'; renderAll();
  }

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
    if(e.target.closest('[data-add-paranormal]')){if(state.paranormal.length>=paranormalSlots())return toast('Sem espaços de poder paranormal disponíveis.');const idx=+e.target.closest('[data-add-paranormal]').dataset.addParanormal;const p=D.paranormalPowers[idx];if(p?.name!=='Aprender Ritual'&&state.paranormal.includes(idx))return toast('Este poder paranormal não pode ser escolhido novamente sem Afinidade.');state.paranormal.push(idx);trimDependentChoices();renderAll();return;}
    if(e.target.closest('[data-remove-paranormal]')){state.paranormal.splice(+e.target.closest('[data-remove-paranormal]').dataset.removeParanormal,1);renderAll();return;}
    if(e.target.closest('[data-perito]')){const sk=e.target.closest('[data-perito]').dataset.perito;if(state.perito.includes(sk))state.perito=state.perito.filter(x=>x!==sk);else if(state.perito.length<2)state.perito.push(sk);else return toast('Perito permite duas perícias.');renderAll();return;}
    if(e.target.closest('[data-skill]')){const s=e.target.closest('[data-skill]').dataset.skill;if(skillBaseLocked().has(s))return;if(state.skills.includes(s))state.skills=state.skills.filter(x=>x!==s);else if(state.skills.length<extraSkillLimit())state.skills.push(s);else return toast('Limite de perícias adicionais atingido.');renderAll();return;}
    if(e.target.closest('[data-train35]')){const s=e.target.closest('[data-train35]').dataset.train35;if(state.train35.includes(s))state.train35=state.train35.filter(x=>x!==s);else if(state.train35.length<classGradeLimit(35))state.train35.push(s);else return toast('Limite de perícias do NEX 35% atingido.');renderAll();return;}
    if(e.target.closest('[data-train70]')){const s=e.target.closest('[data-train70]').dataset.train70;if(state.train70.includes(s))state.train70=state.train70.filter(x=>x!==s);else if(state.train70.length<classGradeLimit(70))state.train70.push(s);else return toast('Limite de perícias do NEX 70% atingido.');renderAll();return;}
    if(e.target.closest('[data-ritual-element]')){state.ritualElement=e.target.closest('[data-ritual-element]').dataset.ritualElement;renderRituals();return;}
    if(e.target.closest('[data-ritual-toggle]')){const id=e.target.closest('[data-ritual-toggle]').dataset.ritualToggle;if(state.rituals.includes(id))state.rituals=state.rituals.filter(x=>x!==id);else if(state.rituals.length<ritualSlots())state.rituals.push(id);else return toast('Limite de rituais da progressão atual atingido.');renderAll();return;}
    if(e.target.closest('[data-ritual-info]')){e.stopPropagation();const r=D.rituals.find(x=>x.id===e.target.closest('[data-ritual-info]').dataset.ritualInfo);return openModal(r.name,`${r.element} • ${r.circle}º círculo`,`<div class="ritual-detail">${esc(r.details||r.summary).replace(/\n/g,'<br>')}</div>${r.page?`<p class="source-note">Livro v1.3 • página ${r.page}.</p>`:''}`);}
    if(e.target.closest('[data-item-info]')){
      e.stopPropagation();const base=D.equipment.find(x=>x.id===e.target.closest('[data-item-info]').dataset.itemInfo);
      return openModal(base.name,base.type,`<p>${esc(base.desc)}</p><dl><dt>Categoria base</dt><dd>${catRoman(base.category)}</dd><dt>Espaço base</dt><dd>${base.spaces}</dd>${base.damage?`<dt>Dano</dt><dd>${base.damage}</dd><dt>Crítico</dt><dd>${base.crit}</dd><dt>Alcance</dt><dd>${base.range}</dd><dt>Tipo de dano</dt><dd>${base.damageType}</dd><dt>Proficiência</dt><dd>${base.proficiency}</dd>`:''}</dl><p>Adicione várias versões do mesmo equipamento e configure cada uma separadamente.</p>`);
    }
    if(e.target.closest('[data-item-plus]')){addPlainItem(e.target.closest('[data-item-plus]').dataset.itemPlus);renderAll();return;}
    if(e.target.closest('[data-item-new]')){createItemInstance(e.target.closest('[data-item-new]').dataset.itemNew);renderAll();return;}
    if(e.target.closest('[data-variant-plus]')){const id=e.target.closest('[data-variant-plus]').dataset.variantPlus;state.inventory[id]++;renderAll();return;}
    if(e.target.closest('[data-variant-split]')){
      const id=e.target.closest('[data-variant-split]').dataset.variantSplit;
      if((state.inventory[id]||0)<=1)return;
      state.inventory[id]--;
      createItemInstance(originalId(id),{from:id});renderAll();return;
    }
    if(e.target.closest('[data-item-minus]')){
      const id=e.target.closest('[data-item-minus]').dataset.itemMinus;
      if((state.inventory[id]||0)>0){state.inventory[id]--;if(state.inventory[id]===0)removeItemInstance(id);renderAll();}return;
    }
    if(e.target.closest('[data-config-item]'))return openItemConfig(e.target.closest('[data-config-item]').dataset.configItem);
  });

  document.addEventListener('change',e=>{
    if(e.target.matches('[data-curse-toggle]')){
      const id=e.target.dataset.curseToggle, it=itemFor(id),curse=cursedById(e.target.value);
      if(!curse||!itemCurses(it).some(c=>c.id===curse.id))return;
      const set=new Set(state.curses[id]||[]);
      if(e.target.checked){
        const elem=realCurseElement(it,curse);
        if(elem&&[...set].some(k=>cursesConflict(elem,realCurseElement(it,cursedById(k))))){toast('Os elementos dessas maldições são opressores e incompatíveis neste item.');openItemConfig(id);return;}
        set.add(curse.id);
      }else{set.delete(curse.id);if(state.curseOptions[id])delete state.curseOptions[id][curse.id];}
      state.curses[id]=[...set];renderAll();openItemConfig(id);return;
    }
    if(e.target.matches('[data-item-choice]')){
      const id=e.target.dataset.itemChoice,key=e.target.dataset.choiceKey,val=e.target.value;
      state.curseOptions[id] ||= {};
      if(key.startsWith('accessory:'))state.curseOptions[id][key]=val;
      else{
        const [curseId,field]=key.split(':');const it=itemFor(id);
        if(field==='element'&&val&&[...(state.curses[id]||[])].some(k=>k!==curseId&&cursesConflict(val,realCurseElement(it,cursedById(k))))){toast('Elemento incompatível com outra maldição escolhida.');openItemConfig(id);return;}
        state.curseOptions[id][curseId] ||= {};state.curseOptions[id][curseId][field]=val;
      }
      renderAll();openItemConfig(id);return;
    }
    if(e.target.matches('[data-attuned]')){state.attuned[e.target.dataset.attuned]=e.target.checked;renderAll();openItemConfig(e.target.dataset.attuned);return;}
    if(e.target.matches('[data-gear-equipped]')){const id=e.target.dataset.gearEquipped;state.equipped[id]=e.target.checked;renderAll();return;}
    if(e.target.matches('[data-mod-toggle]')){const id=e.target.dataset.modToggle;const set=new Set(state.mods[id]||[]);e.target.checked?set.add(e.target.value):set.delete(e.target.value);if(e.target.checked&&e.target.value==='pm2')set.delete('pm3');if(e.target.checked&&e.target.value==='pm3')set.delete('pm2');state.mods[id]=[...set];renderInventory();renderSheet();renderValidation();openItemConfig(id);return;}
    if(e.target.id==='versatilitySelect'){state.versatility=e.target.value||null;if(state.versatility!=='class')state.versatilityPower=null;trimDependentChoices();renderAll();}
    if(e.target.id==='versatilityPowerSelect'){state.versatilityPower=e.target.value||null;trimDependentChoices();renderAll();}
    if(e.target.id==='combatAttackSelect'){state.combatAttack=e.target.value;state.skills=state.skills.filter(s=>!skillBaseLocked().has(s));renderAll();}
    if(e.target.id==='combatResistSelect'){state.combatResist=e.target.value;state.skills=state.skills.filter(s=>!skillBaseLocked().has(s));renderAll();}
    if(e.target.id==='patentSelect'){state.patent=e.target.value;renderAll();}
    if(e.target.id==='itemType'){state.itemType=e.target.value;renderInventory();}
    if(e.target.id==='itemWeaponKind'){state.itemWeaponKind=e.target.value;renderInventory();}
    if(e.target.id==='favoriteWeapon'){state.favoriteWeapon=e.target.value||null;renderAll();}
    if(e.target.id==='engineerFavoriteItemSelect'){state.engineerFavoriteItem=e.target.value||null;renderAll();}
    if(e.target.id==='utilityItemSelect'){state.utilityItem=e.target.value||null;renderAll();}
    if(e.target.id==='paranormalToolItemSelect'){state.paranormalToolItem=e.target.value||null;renderAll();}
    if(e.target.id==='crimeItemSelect'){state.crimeItem=e.target.value||null;renderAll();}
    if(e.target.id==='importFile'&&e.target.files[0]){const fr=new FileReader();fr.onload=()=>{try{loadState(JSON.parse(fr.result));toast('Ficha importada.');}catch{toast('Arquivo JSON inválido.')}};fr.readAsText(e.target.files[0]);}
  });
  $('#originSearch').addEventListener('input',renderOrigins); $('#ritualSearch').addEventListener('input',renderRituals); $('#itemSearch').addEventListener('input',renderInventory);
  $('#characterName').addEventListener('input',e=>{state.name=e.target.value;});
  $('#saveBtn').onclick=save; $('#finalSave').onclick=save; $('#exportBtn').onclick=exportState; $('#finalExport').onclick=exportState; $('#importBtn').onclick=()=>$('#importFile').click(); $('#printBtn').onclick=()=>window.print(); $('#finalPrint').onclick=()=>window.print();
  $('#resetBtn').onclick=()=>{if(confirm('Limpar toda a ficha?')){state=defaultState();storageRemove('opr-ficha-v2');$('#characterName').value=state.name;$('#nexGate').classList.add('open');renderAll();}};
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});

  const saved=storageGet('opr-ficha-v2'); if(saved){try{loadState(JSON.parse(saved));$('#nexGate').classList.toggle('open',!state.nex);}catch{renderAll();}} else renderAll();
})();
