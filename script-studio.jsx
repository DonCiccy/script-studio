import { useState, useEffect, useRef, useCallback } from "react";

// ── SCRIPT STUDIO — React Artifact Version ────────────────
// Drop this file into Claude.ai Artifacts (Nuovo artefatto → React)
// Uses Claude Sonnet via the artifact API — no API key needed.
// Storage: window.storage (persists between sessions)

const LANGS=[{k:'it',l:'IT',f:'Italian'},{k:'en',l:'EN',f:'English'},{k:'de',l:'DE',f:'German'}];
const PL=[
  {key:'linkedin',label:'LinkedIn',icon:'💼',tone:'First person, short sentences max 12-15 words. No generic openings. Banned: "innovative","value proposition","synergy".',
   objectives:[
    {key:'pov',label:'Point of view',desc:'Non-obvious take, zero promotion',guide:'Counter-intuitive opening → 2-3 logical steps → open question. ~75 words.'},
    {key:'bts',label:'Behind the scenes',desc:'Real process, decisions',guide:'Specific situation you experienced → what happened → lesson in one sentence. ~75 words.'},
    {key:'case',label:'Case study',desc:'Real result with numbers',guide:'Client situation → approach → measurable result → implication. ~75 words.'},
    {key:'cta_li',label:'Conversion',desc:'Direct CTA',guide:"Target's pain → your product → one proof point → clear CTA. ~60 words."},
  ]},
  {key:'meta',label:'Meta Ads',icon:'📢',tone:'Ultra-short sentences, first three max 8-10 words. Every word earned.',
   objectives:[
    {key:'scroll',label:'Stop the scroll',desc:'Pure hook',guide:'Counter-intuitive statement → one idea developed → leave thinking. ~40 words.'},
    {key:'agitation',label:'Problem agitation',desc:'For viewers who know the pain',guide:'Recognizable situation → problem with detail → gets worse → your product as release. ~50 words.'},
    {key:'story',label:'Story arc',desc:'Mini-story',guide:'Character + situation → complication → resolution with your product. ~50 words.'},
    {key:'offer',label:'Direct offer',desc:'Benefit-first, CTA',guide:'Main benefit → one proof point → remove main objection → specific CTA. ~45 words.'},
  ]},
  {key:'landing',label:'Landing',icon:'🌐',tone:'Product-focused. Logical: problem → solution → how → why → action.',
   objectives:[
    {key:'hero',label:'Hero video',desc:'Right place confirmation',guide:"Target's problem → your product → how it works → reassurance → CTA. ~150 words."},
    {key:'hiw',label:'How it works',desc:'Product mechanics',guide:'Starting situation → 3-4 steps → end state. ~150 words.'},
    {key:'proof',label:'Social proof',desc:'Numbers and cases',guide:'Strongest result → specific case → scale → implication. ~150 words.'},
    {key:'close',label:'Closing',desc:'Final push',guide:'Recap 2 sentences → remove objection → one immediate action. ~75 words.'},
  ]},
  {key:'podcast',label:'Podcast',icon:'🎙️',tone:'Pure spoken language. Like explaining to a colleague over coffee.',
   objectives:[
    {key:'intro',label:'Guest intro',desc:'Who you are',guide:"Interesting background → what you discovered → what you're building and why. ~300 words."},
    {key:'hottake',label:'Hot take',desc:'One idea developed',guide:"Statement → why most disagree → why they're wrong → implication. ~500 words."},
    {key:'keypoints',label:'Key points',desc:'Interview map',guide:'5-7 points with concept + example + bridge. 2 anecdotes. Closing line. ~600 words.'},
    {key:'episode',label:'Full episode',desc:'Thesis + 3 points',guide:'Hook → thesis → 3 points with examples → memorable close. ~2000 words.'},
  ]},
];
const STRUCT={
  pov:[{k:'OPENING',d:'Counter-intuitive statement. Max 15 words.'},{k:'ARGUMENT',d:'2-3 logical steps with one concrete example.'},{k:'CLOSE',d:'Open question or single takeaway.'}],
  bts:[{k:'SITUATION',d:'A specific moment. When, what was at stake.'},{k:'PROCESS',d:'What you did and why.'},{k:'LESSON',d:'What you learned. One sentence.'}],
  case:[{k:'CLIENT',d:"Client's situation before. The specific problem."},{k:'APPROACH',d:'What was done. The mechanism.'},{k:'RESULT',d:'Measurable result with number.'},{k:'IMPLICATION',d:'What this means for others.'}],
  cta_li:[{k:'PROBLEM',d:'Specific pain, second person.'},{k:'SOLUTION',d:'Your product as direct answer.'},{k:'PROOF',d:'One proof point.'},{k:'CTA',d:'The single action.'}],
  scroll:[{k:'HOOK',d:'Max 8 words. Provocation.'},{k:'DEVELOP',d:'One idea, 10-15 seconds.'},{k:'CLOSE',d:'Leave them thinking.'}],
  agitation:[{k:'HOOK',d:'Recognizable situation in max 10 words.'},{k:'PROBLEM',d:'Specific pain with detail.'},{k:'WORSE',d:'A second layer.'},{k:'RELEASE',d:'Your product as the way out.'}],
  story:[{k:'SETUP',d:'Character and situation.'},{k:'COMPLICATION',d:'What went wrong.'},{k:'RESOLUTION',d:'How your product changed it.'}],
  offer:[{k:'BENEFIT',d:'Main outcome. No setup.'},{k:'PROOF',d:'One specific result.'},{k:'OBJECTION',d:'Main reason not to act. Address it.'},{k:'CTA',d:'Specific action.'}],
  hero:[{k:'PROBLEM',d:'Who this is for.'},{k:'SOLUTION',d:'Your product in one sentence.'},{k:'HOW',d:'The mechanism.'},{k:'PROOF',d:'One proof point.'},{k:'CTA',d:'Next step.'}],
  hiw:[{k:'START',d:'Where customer is today.'},{k:'STEP 1',d:'Customer + product action + result.'},{k:'STEP 2',d:'Same.'},{k:'STEP 3',d:'Same.'},{k:'END',d:'The transformation.'}],
  proof:[{k:'CLAIM',d:'Strongest result with number.'},{k:'STORY',d:'Specific case with details.'},{k:'SCALE',d:'How many have seen this.'},{k:'INVITATION',d:'Implication for viewer.'}],
  close:[{k:'RECAP',d:'Two sentences max.'},{k:'OBJECTION',d:'Remove main reason not to act.'},{k:'ACTION',d:'One clear immediate action.'}],
  intro:[{k:'BACKGROUND',d:'Most interesting thing about your path.'},{k:'DISCOVERY',d:'What you found others had not.'},{k:'BUILDING',d:'What you are building and why.'},{k:'RELEVANCE',d:'Why this matters to this audience.'}],
  hottake:[{k:'STATEMENT',d:'The bare take.'},{k:'DISAGREEMENT',d:'Why most think differently.'},{k:'REVERSAL',d:'Why they are wrong.'},{k:'IMPLICATION',d:'What changes.'}],
  keypoints:[{k:'POINT 1',d:'Concept + example + bridge.'},{k:'POINT 2',d:'Same.'},{k:'POINT 3',d:'Same.'},{k:'POINT 4',d:'Same.'},{k:'ANECDOTE 1',d:'A story.'},{k:'ANECDOTE 2',d:'Another story.'},{k:'CLOSE',d:'Closing line.'}],
  episode:[{k:'HOOK',d:'Most interesting thing.'},{k:'THESIS',d:'Central claim.'},{k:'POINT 1',d:'First argument with example.'},{k:'POINT 2',d:'Second argument.'},{k:'POINT 3',d:'Third argument.'},{k:'CLOSE',d:'One thing to remember.'}],
};
const DUR_OPTS={
  pov:[{v:45,l:'45s'},{v:60,l:'60s',s:1},{v:90,l:'90s',s:1},{v:120,l:'2min'}],bts:[{v:45,l:'45s'},{v:60,l:'60s',s:1},{v:90,l:'90s',s:1},{v:120,l:'2min'}],
  case:[{v:45,l:'45s'},{v:60,l:'60s',s:1},{v:90,l:'90s',s:1},{v:120,l:'2min'}],cta_li:[{v:30,l:'30s'},{v:45,l:'45s',s:1},{v:60,l:'60s',s:1},{v:90,l:'90s'}],
  scroll:[{v:10,l:'10s'},{v:15,l:'15s',s:1},{v:20,l:'20s',s:1},{v:30,l:'30s'}],agitation:[{v:15,l:'15s'},{v:20,l:'20s',s:1},{v:30,l:'30s',s:1},{v:45,l:'45s'}],
  story:[{v:20,l:'20s'},{v:30,l:'30s',s:1},{v:45,l:'45s',s:1},{v:60,l:'60s'}],offer:[{v:15,l:'15s'},{v:20,l:'20s',s:1},{v:30,l:'30s',s:1},{v:45,l:'45s'}],
  hero:[{v:45,l:'45s'},{v:60,l:'60s',s:1},{v:90,l:'90s',s:1},{v:120,l:'2min'}],hiw:[{v:45,l:'45s'},{v:60,l:'60s',s:1},{v:90,l:'90s',s:1},{v:120,l:'2min'}],
  proof:[{v:30,l:'30s'},{v:60,l:'60s',s:1},{v:90,l:'90s',s:1},{v:120,l:'2min'}],close:[{v:20,l:'20s'},{v:30,l:'30s',s:1},{v:45,l:'45s',s:1},{v:60,l:'60s'}],
  intro:[{v:120,l:'2min',s:1},{v:180,l:'3min',s:1},{v:300,l:'5min'}],hottake:[{v:120,l:'2min'},{v:180,l:'3min',s:1},{v:300,l:'5min',s:1},{v:600,l:'10min'}],
  keypoints:[{v:120,l:'2min',s:1},{v:180,l:'3min',s:1},{v:300,l:'5min'}],episode:[{v:600,l:'10min'},{v:900,l:'15min',s:1},{v:1200,l:'20min',s:1},{v:1500,l:'25min'}],
};

const store={
  async get(k){try{const r=await window.storage.get(k);return r?JSON.parse(r.value):null;}catch{return null;}},
  async set(k,v){try{await window.storage.set(k,JSON.stringify(v));}catch{}}
};
async function callClaude(system,user,maxTokens=2000){
  const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:maxTokens,system,messages:[{role:"user",content:user}]})});
  if(!res.ok){const e=await res.json().catch(()=>({}));throw new Error(e?.error?.message||"Error "+res.status);}
  const d=await res.json();return d.content.filter(b=>b.type==='text').map(b=>b.text).join('');
}

function uid(){return Math.random().toString(36).slice(2);}
function plOf(k){return PL.find(p=>p.key===k);}
function objOf(pk,ok){const p=plOf(pk);return p?.objectives.find(o=>o.key===ok);}
function durDefault(ok){const o=DUR_OPTS[ok]||[];return(o.find(x=>x.s)||o[0])?.v||60;}
function durWords(s){return Math.round(s/60*150);}
function durLabel(s){if(s<60)return s+'s';const m=Math.floor(s/60);return m+'min'+(s%60?(s%60)+'s':'');}
function kbStr(kb,conf){
  const c=conf||{};const s=[];
  s.push((c.creator||'Creator')+'\n'+(kb.about||''));
  s.push((c.brand||'Brand')+'\n'+(kb.brand||''));
  if(kb.proofPoints?.length)s.push('PROOF POINTS\n'+kb.proofPoints.map(p=>'• '+p.t).join('\n'));
  if(kb.pillars?.length)s.push('CONTENT PILLARS\n'+kb.pillars.map(p=>'• '+p.t+(p.d?': '+p.d:'')).join('\n'));
  if(kb.styleExamples?.length)s.push('REFERENCE SCRIPTS — match this voice closely:\n'+kb.styleExamples.map(e=>'['+e.title+']\n'+e.text).join('\n\n'));
  return s.join('\n\n');
}
function buildSys(pl,obj,lang,nv,dur,kb,conf){
  const lf=(LANGS.find(l=>l.k===lang)||{f:'English'}).f;
  const d=dur||durDefault(obj.key);
  const secs=STRUCT[obj.key]||[];
  const struct=secs.length?'\n\nOUTPUT STRUCTURE:\n'+secs.map(s=>'['+s.k+']\n('+s.d+')').join('\n\n')+'\n\nWrite real script content under each label.':'';
  const vb=nv>1?'\n\nPRODUCE EXACTLY '+nv+' VARIANTS. Separate with "---". Label VARIANT 1, VARIANT 2'+(nv===3?', VARIANT 3':''):'';
  return `You write word-for-word scripts for ${conf?.creator||'a founder'} filming alone on camera.\n\n${kbStr(kb,conf)}\n\nDURATION: ${durLabel(d)} — ~${durWords(d)} words. Hard constraint.\n\nFORMAT: Pure spoken text. No asterisks, markdown, bullets. Complete sentences.\n\nQUALITY: Write like ${conf?.creator||'the creator'} actually speaks — not generated copy. One specific tension with real detail. Use concrete data from the KB. No generic pain-point lists.\n${struct}\nPLATFORM — ${pl.label}\n${pl.tone}\n\nOBJECTIVE — ${obj.label}\n${obj.guide}\n\nLanguage: ${lf}. Output only the script.${vb}`;
}
function cleanScript(text){return text.replace(/^\[[^\]]+\]\s*\n?/gm,'').replace(/\n{3,}/g,'\n\n').trim();}
function parseSections(text){
  const re=/\[([^\]]+)\]\n?((?:(?!\n\[)[\s\S])*)/g;const secs=[];let m;
  while((m=re.exec(text))!==null){const c=m[2].trim();if(c)secs.push({k:m[1].trim(),text:c});}
  return secs.length>=2?secs:null;
}

const DEFAULT_KB={about:'',brand:'',proofPoints:[],pillars:[],styleExamples:[],documents:[]};
const DEFAULT_CONF={creator:'',brand:''};
const kb_ref={current:DEFAULT_KB};
const conf_ref={current:DEFAULT_CONF};

export default function App(){
  const [conf,setConf]=useState(DEFAULT_CONF);
  const [confSaved,setConfSaved]=useState(false);
  const [kb,setKb]=useState(DEFAULT_KB);
  const [ideas,setIdeas]=useState([]);
  const [hist,setHist]=useState([]);
  const [tab,setTab]=useState('studio');
  const [selPl,setSelPl]=useState(null);
  const [selObj,setSelObj]=useState(null);
  const [dur,setDur]=useState(null);
  const [topic,setTopic]=useState('');
  const [notes,setNotes]=useState('');
  const [lang,setLang]=useState('en');
  const [nv,setNv]=useState(1);
  const [genIdeas,setGenIdeas]=useState([]);
  const [genLoading,setGenLoading]=useState(false);
  const [genErr,setGenErr]=useState(null);
  const [selIdx,setSelIdx]=useState(null);
  const [prevT,setPrevT]=useState([]);
  const [gen,setGen]=useState(false);
  const [results,setResults]=useState([]);
  const [sErr,setSErr]=useState(null);
  const [copied,setCopied]=useState(null);
  const [savedH,setSavedH]=useState(false);
  const [showTP,setShowTP]=useState(false);
  const [tpIdx,setTpIdx]=useState(0);
  const [tpOn,setTpOn]=useState(false);
  const [tpSpd,setTpSpd]=useState(3);
  const [kbOk,setKbOk]=useState(false);
  const [nP,setNP]=useState('');
  const [pT,setPT]=useState('');const[pD,setPD]=useState('');
  const [eT,setET]=useState('');const[eX,setEX]=useState('');
  const rafRef=useRef(null);const ltRef=useRef(null);const ovRef=useRef(null);
  const SPEEDS=[25,45,70,100,140];

  useEffect(()=>{kb_ref.current=kb;},[kb]);
  useEffect(()=>{conf_ref.current=conf;},[conf]);

  useEffect(()=>{
    (async()=>{
      const sc=await store.get('ss-conf');if(sc)setConf({...DEFAULT_CONF,...sc});
      const sk=await store.get('ss-kb');if(sk)setKb({...DEFAULT_KB,...sk});
      const si=await store.get('ss-ideas');if(si)setIdeas(si);
      const sh=await store.get('ss-hist');if(sh)setHist(sh);
    })();
  },[]);

  const pl=plOf(selPl),obj=pl&&objOf(selPl,selObj);
  const needsSetup=!conf.creator&&!conf.brand;

  const tpFrame=useCallback((ts)=>{
    if(!tpOn)return;const el=ovRef.current;if(!el)return;
    if(ltRef.current){const dt=Math.min((ts-ltRef.current)/1000,.05);el.scrollTop+=SPEEDS[tpSpd-1]*dt;if(el.scrollTop+el.clientHeight>=el.scrollHeight-30){setTpOn(false);return;}}
    ltRef.current=ts;rafRef.current=requestAnimationFrame(tpFrame);
  },[tpOn,tpSpd]);

  useEffect(()=>{
    if(tpOn){ltRef.current=null;rafRef.current=requestAnimationFrame(tpFrame);}
    else{if(rafRef.current)cancelAnimationFrame(rafRef.current);}
    return()=>{if(rafRef.current)cancelAnimationFrame(rafRef.current);};
  },[tpOn,tpFrame]);

  useEffect(()=>{
    if(!showTP)return;
    const h=(e)=>{
      if(e.key===' '){e.preventDefault();setTpOn(a=>!a);}
      if(e.key==='Escape'){setShowTP(false);setTpOn(false);}
      if(e.key==='ArrowLeft')setTpSpd(s=>Math.max(1,s-1));
      if(e.key==='ArrowRight')setTpSpd(s=>Math.min(5,s+1));
      if(e.key==='r'||e.key==='R'){if(ovRef.current)ovRef.current.scrollTop=0;setTpOn(false);}
    };
    window.addEventListener('keydown',h);return()=>window.removeEventListener('keydown',h);
  },[showTP]);

  async function genIdeasFn(){
    setGenLoading(true);setGenErr(null);setGenIdeas([]);setSelIdx(null);
    try{
      const avoid=prevT.length?'\n\nDo NOT regenerate:\n'+prevT.map(t=>'- '+t).join('\n'):'';
      const seed=Math.random().toString(36).slice(2,7);
      let instr,okeys;
      if(pl&&obj){instr=`Generate ALL 8 ideas for ${pl.label} × "${obj.label}" ONLY.`;okeys=obj.key;}
      else if(pl){instr=`Generate ALL 8 ideas for ${pl.label} ONLY.`;okeys=pl.objectives.map(o=>o.key).join('|');}
      else{instr='Generate ideas across all platforms.';okeys='pov|bts|case|cta_li|scroll|agitation|story|offer|hero|hiw|proof|close|intro|hottake|keypoints|episode';}
      const raw=await callClaude('You generate specific video script ideas grounded in this knowledge base.\n\n'+kbStr(kb_ref.current,conf_ref.current)+avoid+'\n[seed:'+seed+']',
        instr+'\nReturn ONLY JSON array:\n[{"title":"...","platform":"linkedin|meta|landing|podcast","objective":"'+okeys+'","angle":"one sentence"}]',800);
      const si=raw.indexOf('['),ei=raw.lastIndexOf(']');
      if(si===-1)throw new Error('Bad response');
      const parsed=JSON.parse(raw.slice(si,ei+1));
      const valid=parsed.filter(x=>{if(!x.title)return false;if(selPl&&x.platform!==selPl)return false;if(selObj&&x.objective!==selObj)return false;return PL.some(p=>p.key===x.platform&&p.objectives.some(o=>o.key===x.objective));}).slice(0,8);
      for(let i=valid.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[valid[i],valid[j]]=[valid[j],valid[i]];}
      if(!valid.length)throw new Error('No valid ideas');
      setGenIdeas(valid);setPrevT(p=>[...p,...valid.map(x=>x.title)].slice(-24));
    }catch(e){setGenErr(e.message);}
    finally{setGenLoading(false);}
  }

  async function genScript(){
    if(!pl||!obj||!topic.trim()||gen)return;
    setGen(true);setSErr(null);setResults([]);setSavedH(false);setCopied(null);
    try{
      const raw=await callClaude(buildSys(pl,obj,lang,nv,dur,kb_ref.current,conf_ref.current),'Topic: '+topic.trim()+(notes.trim()?'\n\nNotes: '+notes.trim():'')+'\n[seed:'+Math.random().toString(36).slice(2,7)+']',2000);
      if(!raw)throw new Error('Empty');
      if(nv>1){const parts=raw.split(/\n---\n|---\n|\n---/).map(p=>p.replace(/^VARIANT\s*\d+[\s\S]{0,4}\n/i,'').trim()).filter(p=>p.length>30);setResults(parts.length?parts.slice(0,nv):[raw]);}
      else setResults([raw]);
    }catch(e){setSErr(e.message);}
    finally{setGen(false);}
  }

  async function copy(i){try{await navigator.clipboard.writeText(cleanScript(results[i]||''));setCopied(i);setTimeout(()=>setCopied(null),2000);}catch{}}
  async function saveH(){if(!results.length)return;const e={id:uid(),platform:selPl,objective:selObj,lang,topic:topic.trim(),ts:Date.now(),variants:results};const nh=[...hist,e];setHist(nh);await store.set('ss-hist',nh);setSavedH(true);setTimeout(()=>setSavedH(false),2000);}
  async function delH(id){const nh=hist.filter(h=>h.id!==id);setHist(nh);await store.set('ss-hist',nh);}

  const c={
    inp:'w-full border border-zinc-700 rounded-md bg-zinc-900 text-zinc-100 text-sm px-3 py-2 transition-colors placeholder:text-zinc-600 focus:border-amber-500',
    ta:'w-full border border-zinc-700 rounded-md bg-zinc-900 text-zinc-100 text-sm px-3 py-2 transition-colors resize-none placeholder:text-zinc-600 focus:border-amber-500',
    btnP:'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-amber-500 text-zinc-950 font-semibold text-sm hover:bg-amber-400 transition-colors disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed',
    btnO:'inline-flex items-center gap-2 px-4 py-2 border border-zinc-700 rounded-md bg-zinc-900 text-zinc-300 text-sm hover:bg-zinc-800 transition-colors disabled:opacity-40',
    btnG:'font-mono text-xs uppercase tracking-wide text-zinc-500 hover:text-amber-500 transition-colors',
    chip:'font-mono text-xs px-3 py-1 rounded-full border border-zinc-700 text-zinc-300 hover:border-amber-500 hover:text-amber-400 transition-all cursor-pointer',
    chipOn:'font-mono text-xs px-3 py-1 rounded-full border border-amber-500 text-amber-400 bg-amber-950 cursor-pointer',
    sec:'font-mono text-xs uppercase tracking-widest text-zinc-400 flex items-center gap-3 mb-4',
  };
  const SH=({l})=><div className={c.sec}><span>{l}</span><div className="flex-1 h-px bg-zinc-800"/></div>;
  const Chip=({on,onClick,children})=><button onClick={onClick} className={on?c.chipOn:c.chip}>{children}</button>;

  // Setup screen
  const [setupCreator,setSetupCreator]=useState('');
  const [setupBrand,setSetupBrand]=useState('');
  const Setup=<div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
    <div className="w-full max-w-md">
      <p className="font-mono text-xs text-amber-500 uppercase tracking-widest mb-2">Script Studio</p>
      <h1 className="text-3xl font-bold text-zinc-100 mb-2" style={{fontFamily:'Georgia,serif'}}>Let's get you set up</h1>
      <p className="text-sm text-zinc-400 mb-8">Takes 30 seconds. You can change this anytime in Settings.</p>
      <div className="space-y-4">
        <div><label className="font-mono text-xs text-zinc-400 uppercase tracking-widest block mb-2">Your name or alias</label>
          <input value={setupCreator} onChange={e=>setSetupCreator(e.target.value)} placeholder="Marco, Sarah, The Team…" className={c.inp}/></div>
        <div><label className="font-mono text-xs text-zinc-400 uppercase tracking-widest block mb-2">Brand / Product</label>
          <input value={setupBrand} onChange={e=>setSetupBrand(e.target.value)} placeholder="Acme SaaS, Marco's Agency…" className={c.inp}/></div>
        <button onClick={async()=>{const nc={creator:setupCreator.trim(),brand:setupBrand.trim()};setConf(nc);conf_ref.current=nc;await store.set('ss-conf',nc);}} disabled={!setupCreator.trim()&&!setupBrand.trim()} className={c.btnP+' w-full mt-2'}>Start →</button>
      </div>
    </div>
  </div>;

  const tpText=cleanScript(results[tpIdx]||'');
  const tpW=tpText.split(/\s+/).filter(Boolean).length;
  const dots='●'.repeat(tpSpd)+'○'.repeat(5-tpSpd);

  const Teleprompter=showTP?<div ref={ovRef} onClick={()=>setTpOn(a=>!a)} style={{position:'fixed',inset:0,background:'#000',zIndex:9999,overflowY:'auto',cursor:'pointer'}}>
    <p style={{position:'fixed',top:14,left:'50%',transform:'translateX(-50%)',fontFamily:'monospace',fontSize:11,color:'#3f3f46',pointerEvents:'none',whiteSpace:'nowrap'}}>{tpW} words · ~{Math.round(tpW/150*10)/10} min</p>
    <div style={{maxWidth:800,margin:'0 auto',padding:'80px 40px 0',cursor:'default'}} onClick={e=>e.stopPropagation()}>
      <p style={{fontSize:'clamp(22px,3vw,40px)',lineHeight:1.9,color:'#f0f0f0',whiteSpace:'pre-wrap',textAlign:'center'}}>{tpText}</p>
      <div style={{height:'50vh'}}/>
    </div>
    {!tpOn&&<p style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',fontFamily:'monospace',fontSize:13,color:'#52525b',pointerEvents:'none',textAlign:'center'}}>Tap or Space to start</p>}
    <div onClick={e=>e.stopPropagation()} style={{position:'fixed',bottom:0,left:0,right:0,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 24px',background:'rgba(0,0,0,.9)',zIndex:10000}}>
      <button onClick={()=>{setShowTP(false);setTpOn(false);}} style={{fontFamily:'monospace',fontSize:14,color:'#a1a1aa',background:'none',border:'1px solid #3f3f46',borderRadius:6,padding:'7px 14px',cursor:'pointer'}}>✕</button>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <button onClick={()=>setTpSpd(s=>Math.max(1,s-1))} style={{fontFamily:'monospace',fontSize:14,color:'#a1a1aa',background:'none',border:'1px solid #3f3f46',borderRadius:6,padding:'7px 14px',cursor:'pointer'}}>−</button>
        <span style={{fontFamily:'monospace',fontSize:14,color:'#f59e0b',letterSpacing:2,minWidth:64,textAlign:'center'}}>{dots}</span>
        <button onClick={()=>setTpSpd(s=>Math.min(5,s+1))} style={{fontFamily:'monospace',fontSize:14,color:'#a1a1aa',background:'none',border:'1px solid #3f3f46',borderRadius:6,padding:'7px 14px',cursor:'pointer'}}>+</button>
      </div>
      <button onClick={()=>setTpOn(a=>!a)} style={{width:44,height:44,fontSize:18,color:'#f59e0b',background:'none',border:'1.5px solid #f59e0b',borderRadius:6,cursor:'pointer'}}>{tpOn?'⏸':'▶'}</button>
    </div>
  </div>:null;

  // Results JSX
  const Results=results.length>0?<div className="space-y-3">
    <div className="flex justify-between items-center">
      <p className="font-mono text-xs text-zinc-500 uppercase">{pl?.label} × {obj?.label}</p>
      <div className="flex gap-4">
        <button onClick={genScript} disabled={gen} className={c.btnG}>↻ Regenerate</button>
        <button onClick={saveH} className={c.btnG}>{savedH?'✓ Saved':'+ History'}</button>
      </div>
    </div>
    {results.map((text,i)=>{const secs=parseSections(text);return <div key={i} className="border border-zinc-800 rounded-lg bg-zinc-900 overflow-hidden">
      {results.length>1&&<div className="px-4 py-2 border-b border-zinc-800 bg-zinc-950"><span className="font-mono text-xs text-amber-500 uppercase">Variant {i+1}</span></div>}
      <div className="p-4">{secs?secs.map(sec=><div key={sec.k} className="mb-4 last:mb-0">
        <p className="font-mono text-xs text-amber-500 uppercase tracking-widest mb-1.5">{sec.k}</p>
        <textarea value={sec.text} onChange={e=>{const ns=secs.map(s=>s.k===sec.k?{...s,text:e.target.value}:s);const nr=[...results];nr[i]=ns.map(s=>'['+s.k+']\n'+s.text).join('\n\n');setResults(nr);}} rows={Math.max(2,sec.text.split('\n').length+1)} className="w-full bg-transparent border-b border-zinc-800 focus:border-amber-500 text-sm text-zinc-100 leading-relaxed resize-none pb-1 transition-colors"/>
      </div>):<textarea value={text} onChange={e=>{const nr=[...results];nr[i]=e.target.value;setResults(nr);}} rows={8} className="w-full bg-transparent text-sm text-zinc-100 leading-relaxed resize-none whitespace-pre-wrap"/>}</div>
      <div className="px-4 py-2 border-t border-zinc-800 flex justify-end">
        <button onClick={()=>copy(i)} className="font-mono text-xs text-zinc-500 hover:text-zinc-200">{copied===i?'✓ Copied':'⧉ Copy'}</button>
      </div>
    </div>;})}
    <div className="text-center py-5 border border-dashed border-zinc-700 rounded-lg">
      <p className="text-xs text-zinc-500 mb-3">Edit sections above — then open fullscreen to record.</p>
      <button onClick={()=>{setTpIdx(0);setShowTP(true);setTpOn(false);}} className={c.btnP}>⛶ Open Teleprompter</button>
      {results.length>1&&<div className="flex gap-2 justify-center mt-3">{results.map((_,i)=><button key={i} onClick={()=>{setTpIdx(i);setShowTP(true);setTpOn(false);}} className={c.chip}>Variant {i+1}</button>)}</div>}
    </div>
  </div>:null;

  if(needsSetup)return Setup;

  return <div className="min-h-screen bg-zinc-950 text-zinc-100">
    {Teleprompter}
    <div className="max-w-3xl mx-auto px-6 py-10">
      <header className="mb-10 flex justify-between items-start">
        <div>
          <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-1">{conf.brand||'Script Studio'}</p>
          <h1 className="text-4xl font-bold tracking-tight mb-2" style={{fontFamily:'Georgia,serif'}}>Script Studio</h1>
          <p className="text-sm text-zinc-400">Platform → objective → ideas → script · Claude Sonnet</p>
        </div>
        <button onClick={()=>setTab('settings')} className="font-mono text-xs text-zinc-500 hover:text-zinc-300 transition-colors mt-2">⚙ Settings</button>
      </header>
      <nav className="flex gap-1 border-b border-zinc-800 mb-8">
        {[{id:'studio',l:'Studio'},{id:'kb',l:'Knowledge Base'},{id:'history',l:'History'}].map(t=><button key={t.id} onClick={()=>setTab(t.id)} className={`px-4 py-2.5 font-mono text-xs uppercase tracking-wide border-b-2 transition-all ${tab===t.id?'border-amber-500 text-zinc-100':'-mb-px border-transparent text-zinc-500 hover:text-zinc-300'}`}>{t.l}</button>)}
      </nav>

      {tab==='studio'&&<div className="space-y-8">
        <div><SH l="Platform"/>
          <div className="grid grid-cols-4 gap-2">{PL.map(p=><button key={p.key} onClick={()=>{setSelPl(p.key);setSelObj(null);setDur(null);setGenIdeas([]);setResults([]);setSErr(null);}} className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border text-sm transition-all ${selPl===p.key?'border-amber-500 bg-amber-950 text-amber-400':'border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'}`}><span className="text-xl">{p.icon}</span><span className="font-mono text-xs uppercase tracking-wide">{p.label}</span></button>)}</div>
        </div>
        {pl&&<div><SH l="Objective"/>
          <div className="grid grid-cols-2 gap-2">{pl.objectives.map(o=><button key={o.key} onClick={()=>{setSelObj(o.key);setDur(durDefault(o.key));setResults([]);setSErr(null);}} className={`text-left p-3 rounded-lg border transition-all ${selObj===o.key?'border-amber-500 bg-amber-950':'border-zinc-800 bg-zinc-900 hover:border-zinc-700'}`}><p className={`text-sm font-medium mb-0.5 ${selObj===o.key?'text-amber-400':'text-zinc-200'}`}>{o.label}</p><p className="text-xs text-zinc-500">{o.desc}</p></button>)}</div>
        </div>}
        {selObj&&<div><SH l="Duration"/>
          <div className="flex flex-wrap gap-2 mb-1.5">{(DUR_OPTS[selObj]||[]).map(d=><button key={d.v} onClick={()=>setDur(d.v)} className={d.v===(dur||durDefault(selObj))?c.chipOn:c.chip}>{d.l}</button>)}</div>
          <p className="font-mono text-xs text-zinc-500">≈ {durWords(dur||durDefault(selObj))} words · best practice for {pl?.label} {obj?.label}</p>
        </div>}
        <div><SH l="Generate ideas"/>
          <button onClick={genIdeasFn} disabled={genLoading} className={c.btnO}>{genLoading?'Generating…':'✦ '+(selPl&&selObj?`Generate ${pl.label} × ${obj.label} ideas`:selPl?`Generate ${pl.label} ideas`:'Generate ideas')}</button>
          {genErr&&<p className="text-xs text-red-400 mt-2">⚠ {genErr}</p>}
          {genIdeas.length>0&&<div className="grid grid-cols-2 gap-2 mt-3">{genIdeas.map((idea,i)=>{const ip=plOf(idea.platform),io=ip?.objectives.find(o=>o.key===idea.objective);const sv=ideas.some(s=>s.title===idea.title);return <div key={i} onClick={()=>{setTopic(idea.title);setSelPl(idea.platform);setSelObj(idea.objective);setDur(durDefault(idea.objective));setSelIdx(i);setResults([]);setSErr(null);}} className={`p-3 rounded-lg border cursor-pointer transition-all ${selIdx===i?'border-amber-500 bg-amber-950':'border-zinc-800 bg-zinc-900 hover:border-zinc-700'}`}><p className={`text-sm font-medium mb-2 leading-snug ${selIdx===i?'text-amber-400':'text-zinc-100'}`}>{idea.title}</p><div className="flex flex-wrap gap-1 mb-2">{ip&&<span className="font-mono text-xs px-1.5 py-0.5 bg-zinc-800 text-amber-400 rounded">{ip.label}</span>}{io&&<span className="font-mono text-xs px-1.5 py-0.5 bg-zinc-800 text-teal-400 rounded">{io.label}</span>}</div>{idea.angle&&<p className="text-xs text-zinc-500 mb-2">{idea.angle}</p>}<div className="flex justify-between items-center"><span className="font-mono text-xs text-zinc-500">{selIdx===i?'✓ Selected':'Use →'}</span><button onClick={e=>{e.stopPropagation();if(!sv){const ni=[...ideas,{id:uid(),title:idea.title}];setIdeas(ni);store.set('ss-ideas',ni);}}} className={`font-mono text-xs ${sv?'text-amber-500':'text-zinc-600 hover:text-zinc-400'}`}>{sv?'✓ Saved':'Save'}</button></div></div>;})}</div>}
        </div>
        <div><SH l="Topic"/>
          {ideas.length>0&&<div className="flex flex-wrap gap-2 mb-3">{ideas.map(idea=><button key={idea.id} onClick={()=>setTopic(idea.title)} className={topic===idea.title?c.chipOn:c.chip}>{idea.title}</button>)}</div>}
          <textarea value={topic} onChange={e=>setTopic(e.target.value)} rows={2} placeholder="What is this script about?" className={c.ta}/>
        </div>
        {selObj&&<div className="space-y-4">
          <div className="flex flex-wrap gap-6 items-center">
            <div className="flex gap-2 items-center"><span className="font-mono text-xs text-zinc-500 uppercase">Variants</span><div className="flex gap-1">{[1,2,3].map(n=><button key={n} onClick={()=>setNv(n)} className={`w-8 h-8 text-sm font-semibold rounded border transition-all ${nv===n?'bg-zinc-100 border-zinc-100 text-zinc-900':'border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}>{n}</button>)}</div></div>
            <div className="flex gap-2 items-center"><span className="font-mono text-xs text-zinc-500 uppercase">Language</span><div className="flex gap-1">{LANGS.map(l=><Chip key={l.k} on={lang===l.k} onClick={()=>setLang(l.k)}>{l.l}</Chip>)}</div></div>
          </div>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder="Notes: max length, references, things to avoid…" className={c.ta}/>
          <button onClick={genScript} disabled={!topic.trim()||gen} className={c.btnP}>{gen?'Generating…':'✦ Generate script'+(nv>1?` (${nv} variants)`:'')}</button>
          {sErr&&<p className="text-xs text-red-400">⚠ {sErr}</p>}
        </div>}
        {Results}
      </div>}

      {tab==='kb'&&<div className="space-y-10 max-w-2xl">
        <div><SH l="Core information"/>
          <div className="space-y-4">
            <div><label className="text-sm font-semibold block mb-1">About {conf.creator||'you'}</label><p className="text-xs text-zinc-500 mb-2">Background, how you think and talk, what you stand for, phrases you use — and never use.</p><textarea value={kb.about} onChange={e=>setKb(k=>({...k,about:e.target.value}))} rows={5} className={c.ta}/></div>
            <div><label className="text-sm font-semibold block mb-1">{conf.brand||'Brand / Product'}</label><p className="text-xs text-zinc-500 mb-2">What your product or service does, who it's for, and what makes it different.</p><textarea value={kb.brand} onChange={e=>setKb(k=>({...k,brand:e.target.value}))} rows={4} className={c.ta}/></div>
            <div className="flex gap-3 items-center"><button onClick={async()=>{kb_ref.current=kb;await store.set('ss-kb',kb);setKbOk(true);setTimeout(()=>setKbOk(false),2000);}} className={c.btnP}>Save</button>{kbOk&&<span className="text-sm text-zinc-400">Saved ✓</span>}</div>
          </div>
        </div>
        <div><SH l="Proof points"/><p className="text-xs text-zinc-500 mb-4">Specific numbers, results, client wins.</p>
          {kb.proofPoints.length>0&&<div className="space-y-2 mb-3">{kb.proofPoints.map(p=><div key={p.id} className="flex items-start justify-between gap-3 px-3 py-2 border border-zinc-800 rounded-md bg-zinc-900"><p className="text-sm text-zinc-200">{p.t}</p><button onClick={async()=>{const nk={...kb,proofPoints:kb.proofPoints.filter(x=>x.id!==p.id)};setKb(nk);await store.set('ss-kb',nk);}} className="text-zinc-600 hover:text-red-400 text-xs">✕</button></div>)}</div>}
          <div className="flex gap-2"><input value={nP} onChange={e=>setNP(e.target.value)} onKeyDown={async e=>{if(e.key==='Enter'&&nP.trim()){const nk={...kb,proofPoints:[...kb.proofPoints,{id:uid(),t:nP.trim()}]};setKb(nk);setNP('');await store.set('ss-kb',nk);}}} placeholder='"30% faster reporting after switching"' className={c.inp+' flex-1'}/><button onClick={async()=>{if(!nP.trim())return;const nk={...kb,proofPoints:[...kb.proofPoints,{id:uid(),t:nP.trim()}]};setKb(nk);setNP('');await store.set('ss-kb',nk);}} className={c.btnO}>+</button></div>
        </div>
        <div><SH l="Content pillars"/><p className="text-xs text-zinc-500 mb-4">Recurring themes that guide idea generation.</p>
          {kb.pillars.length>0&&<div className="space-y-2 mb-3">{kb.pillars.map(p=><div key={p.id} className="flex items-start justify-between gap-3 px-3 py-2 border border-zinc-800 rounded-md bg-zinc-900"><div><p className="text-sm font-semibold text-zinc-200">{p.t}</p>{p.d&&<p className="text-xs text-zinc-500 mt-0.5">{p.d}</p>}</div><button onClick={async()=>{const nk={...kb,pillars:kb.pillars.filter(x=>x.id!==p.id)};setKb(nk);await store.set('ss-kb',nk);}} className="text-zinc-600 hover:text-red-400 text-xs">✕</button></div>)}</div>}
          <div className="border border-zinc-800 rounded-lg p-3 space-y-2"><input value={pT} onChange={e=>setPT(e.target.value)} placeholder='e.g. "Why most BI migrations fail"' className={c.inp}/><input value={pD} onChange={e=>setPD(e.target.value)} placeholder="Optional one-liner" className={c.inp}/><button onClick={async()=>{if(!pT.trim())return;const nk={...kb,pillars:[...kb.pillars,{id:uid(),t:pT.trim(),d:pD.trim()}]};setKb(nk);setPT('');setPD('');await store.set('ss-kb',nk);}} className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors">+ Add pillar</button></div>
        </div>
        <div><SH l="My style"/><p className="text-xs text-zinc-500 mb-4">Paste your best scripts — the AI will match your voice.</p>
          {kb.styleExamples.length>0&&<div className="space-y-2 mb-4">{kb.styleExamples.map(e=><div key={e.id} className="flex items-start justify-between gap-3 px-3 py-2 border border-zinc-800 rounded-md bg-zinc-900"><div><p className="text-sm font-semibold truncate">{e.title}</p><p className="text-xs text-zinc-500">{e.text.length.toLocaleString()} chars</p></div><button onClick={async()=>{const nk={...kb,styleExamples:kb.styleExamples.filter(x=>x.id!==e.id)};setKb(nk);await store.set('ss-kb',nk);}} className="text-zinc-600 hover:text-red-400 text-xs">✕</button></div>)}</div>}
          <div className="border border-zinc-800 rounded-lg p-3 space-y-2"><input value={eT} onChange={e=>setET(e.target.value)} placeholder='e.g. "LinkedIn POV — best performing"' className={c.inp}/><textarea value={eX} onChange={e=>setEX(e.target.value)} rows={4} placeholder="Paste the full script text…" className={c.ta}/><button onClick={async()=>{if(!eT.trim()||!eX.trim())return;const nk={...kb,styleExamples:[...kb.styleExamples,{id:uid(),title:eT.trim(),text:eX.trim()}]};setKb(nk);setET('');setEX('');await store.set('ss-kb',nk);}} className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors">+ Add script</button></div>
        </div>
      </div>}

      {tab==='history'&&(hist.length===0
        ?<div className="text-center py-12 border border-dashed border-zinc-800 rounded-lg"><p className="text-sm text-zinc-500">No scripts saved yet</p></div>
        :<div className="space-y-2">{hist.slice().reverse().map(item=>{const p=plOf(item.platform),o=p?.objectives.find(x=>x.key===item.objective);const vars=item.variants||[];return <details key={item.id} className="border border-zinc-800 rounded-lg"><summary className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer list-none"><span className="font-mono text-xs text-zinc-400">{p?.label||item.platform} × {o?.label||item.objective} · {(item.lang||'en').toUpperCase()} · {new Date(item.ts).toLocaleDateString('en-GB')}</span><button onClick={e=>{e.stopPropagation();delH(item.id);}} className="text-zinc-600 hover:text-red-400 text-xs">✕</button></summary><div className="px-4 pb-4">{item.topic&&<p className="font-mono text-xs text-zinc-500 mb-3">"{item.topic}"</p>}<div className="space-y-4">{vars.map((v,i)=><p key={i} className="text-sm text-zinc-400 whitespace-pre-wrap leading-relaxed">{cleanScript(v)}</p>)}</div></div></details>;})}
        </div>
      )}

      {tab==='settings'&&<div className="max-w-md space-y-6">
        <SH l="Settings"/>
        <div className="space-y-4">
          <div><label className="font-mono text-xs text-zinc-400 uppercase tracking-widest block mb-2">Your name</label><input value={conf.creator} onChange={e=>setConf(c=>({...c,creator:e.target.value}))} className={c.inp}/></div>
          <div><label className="font-mono text-xs text-zinc-400 uppercase tracking-widest block mb-2">Brand / Product</label><input value={conf.brand} onChange={e=>setConf(c=>({...c,brand:e.target.value}))} className={c.inp}/></div>
          <div className="flex gap-3 items-center">
            <button onClick={async()=>{conf_ref.current=conf;await store.set('ss-conf',conf);setConfSaved(true);setTimeout(()=>setConfSaved(false),2000);setTab('studio');}} className={c.btnP}>Save</button>
            {confSaved&&<span className="text-sm text-zinc-400">Saved ✓</span>}
          </div>
        </div>
      </div>}
    </div>
  </div>;
}
