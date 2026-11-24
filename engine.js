/* =====================================================================
   Isometric step-through course engine
   Content files register into COURSE; COURSE_BOOT() renders the app.
   ===================================================================== */
window.COURSE = { folders: [], lessons: [], cheat: [], glossary: {}, missionsIntro: '' };

/* ---------- icons (24x24, stroked) ---------- */
const ICON = {
  term:'<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="m7 10 3 2-3 2M12 15h5"/>',
  key:'<circle cx="8" cy="15" r="4"/><path d="m11 12 8-8M16 7l2 2M14 9l2 2"/>',
  server:'<rect x="4" y="4" width="16" height="7" rx="1.5"/><rect x="4" y="13" width="16" height="7" rx="1.5"/><path d="M8 7.5h.01M8 16.5h.01"/>',
  db:'<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
  shield:'<path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z"/><path d="m9 12 2 2 4-4"/>',
  file:'<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
  bot:'<rect x="4" y="7" width="16" height="12" rx="3"/><path d="M12 3v4M9 12h.01M15 12h.01M9 16h6"/>',
  cloud:'<path d="M7 18a4 4 0 0 1-.6-8A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9z"/>',
  plug:'<path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4"/>',
  spark:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  box:'<path d="M12 3 20 7.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5 12 12l8-4.5M12 12v9"/>',
  code:'<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',
  out:'<path d="M4 12h12M12 8l4 4-4 4M20 4v16"/>',
  warn:'<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
  check:'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  book:'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19a2 2 0 0 1 2-2h13"/>',
  bolt:'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  tool:'<path d="M14.5 6.5a4 4 0 0 0-5.3 5.3L4 17l3 3 5.2-5.2a4 4 0 0 0 5.3-5.3l-2.5 2.5-2.5-.5-.5-2.5z"/>',
  chat:'<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
  brain:'<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a2 2 0 0 0-3-1zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1"/>',
  lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  bell:'<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  list:'<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>',
  form:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h4"/>',
  link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  skull:'<circle cx="12" cy="10" r="7"/><path d="M9 21v-4M15 21v-4M9 10h.01M15 10h.01M11 14h2"/>',
  folder:'<path d="M3 6h6l2 2h10v11H3z"/>',
  puzzle:'<path d="M10 4h4v3a2 2 0 1 0 0 4v3h-3a2 2 0 1 0-4 0H4v-4a2 2 0 1 0 0-4V4h4a2 2 0 1 0 2 0z"/>',
};
const iconG=(name,x,y,s=22)=>`<g class="ic" transform="translate(${x-s/2},${y-s/2}) scale(${s/24})">${ICON[name]||''}</g>`;

/* ---------- object helpers for content files ----------
   g = [gx, gy] grid position. Neighbours are usually 5 apart. */
const O = {
  laptop:(g,pill,screen,x={})=>({kind:'laptop',g,pill,screen,...x}),
  box:(g,label,sub,icon,color,x={})=>({kind:'box',g,label,sub,icon,color,...x}),
  small:(g,label,sub,icon,color,x={})=>({kind:'box',g,label,sub,icon,color,w:1.9,h:62,...x}),
  cyl:(g,label,sub,icon,color,x={})=>({kind:'cyl',g,label,sub,icon,color,...x}),
};
const Z = (g,size,label,x={})=>({g,size,label,...x});   // dashed floor zone
const SP = 1.4;                                           // grid spacing factor

/* ---------- state ---------- */
const store = {
  get(k,d){ try{ const v=localStorage.getItem('mcp-course:'+k); return v===null?d:JSON.parse(v);}catch(e){return d;} },
  set(k,v){ try{ localStorage.setItem('mcp-course:'+k, JSON.stringify(v)); }catch(e){} },
};
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let view='learn', li=0, si=0, paused=false, raf=null;
let open, done, quizState, jsonOpen;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function md(s){
  let h=esc(s).replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>');
  h=h.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,(m,t,disp)=>{ const d=COURSE.glossary[t.toLowerCase()]; return d?`<span class="gl" tabindex="0" data-def="${esc(d)}">${disp||t}</span>`:(disp||t); });
  return h;
}
const $=s=>document.querySelector(s);

/* ---------- JSON highlighting ---------- */
function hlJSON(v){
  if(typeof v==='string') return esc(v).replace(/^(#.*)$/gm,'<span class="j-c">$1</span>');
  const s=JSON.stringify(v,null,2);
  return esc(s).replace(/(&quot;(?:\\.|[^&]|&(?!quot;))*?&quot;)(\s*:)?|\b(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)\b|\b(true|false|null)\b/g,(m,str,colon,num,bool)=>{
    if(str) return colon?`<span class="j-k">${str}</span>${colon}`:`<span class="j-s">${str}</span>`;
    if(num) return `<span class="j-n">${num}</span>`;
    return `<span class="j-b">${bool}</span>`;
  });
}

/* ---------- isometric geometry ---------- */
const VW=960, VH=600, OX=480, OY=288, T=40, C30=0.8660254;
const P=(gx,gy,z=0)=>[OX+(gx-gy)*T*C30, OY+(gx+gy)*T*0.5-z];
const gOf=o=>[o.g[0]*SP,o.g[1]*SP];
const pts=a=>a.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');

function gridSVG(){
  let s='';
  for(let i=-24;i<=24;i++){
    const a=P(i,-24), b=P(i,24), c=P(-24,i), d=P(24,i);
    s+=`<line class="gridline" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/><line class="gridline" x1="${c[0]}" y1="${c[1]}" x2="${d[0]}" y2="${d[1]}"/>`;
  }
  return `<defs>
    <marker id="ah" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="var(--ink)"/></marker>
    <marker id="ahr" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="var(--red-ink)"/></marker>
    <marker id="ahg" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="var(--soft)"/></marker></defs>
    <g opacity=".9">${s}</g>`;
}
function boxShape(gx,gy,w,h,col,z0=0){
  const r=w/2;
  const A=P(gx-r,gy-r,z0+h), B=P(gx+r,gy-r,z0+h), C=P(gx+r,gy+r,z0+h), D=P(gx-r,gy+r,z0+h);
  const B0=P(gx+r,gy-r,z0), C0=P(gx+r,gy+r,z0), D0=P(gx-r,gy+r,z0);
  return `<polygon class="edge" fill="var(--${col}-2)" points="${pts([D,C,C0,D0])}"/>
    <polygon class="edge" fill="var(--${col}-3)" points="${pts([C,B,B0,C0])}"/>
    <polygon class="edge" fill="var(--${col}-1)" points="${pts([A,B,C,D])}"/>`;
}
function topIcon(name,x,y){
  return `<g transform="translate(${x},${y}) scale(1,0.58) rotate(45)"><g class="ic" transform="translate(-14,-14) scale(${28/24})">${ICON[name]||''}</g></g>`;
}
function plateSVG(label,sub,x,y){
  const w=Math.max([...label].length*9.6, sub?[...sub].length*7.2:0)+26, h=sub?40:26;
  return `<g class="plate" transform="translate(${x},${y})"><rect x="${-w/2+2}" y="${-h/2+2}" width="${w}" height="${h}" rx="9" fill="var(--shadow)"/>
    <rect x="${-w/2}" y="${-h/2}" width="${w}" height="${h}" rx="9" fill="var(--panel2)" stroke="var(--ink)" stroke-width="2"/>
    <text class="lbl" x="0" y="${sub?-2:4.5}" text-anchor="middle">${esc(label)}</text>
    ${sub?`<text class="sub" x="0" y="13" text-anchor="middle">${esc(sub)}</text>`:''}</g>`;
}
function pillSVG(text,x,y,cls=''){
  const w=Math.max(40,[...text].length*8.5+24);
  return `<g class="pill ${cls}" transform="translate(${x},${y})"><rect class="s" x="${-w/2+2}" y="-11" width="${w}" height="24" rx="12"/><rect class="b" x="${-w/2}" y="-13" width="${w}" height="24" rx="12"/><text x="0" y="3.5" text-anchor="middle">${esc(text)}</text></g>`;
}
function objSVG(id,o){
  const [gx,gy]=gOf(o), col=o.color||'gray';
  if(o.kind==='laptop'){
    const slabH=20, w=3.1; let s=boxShape(gx,gy,w,slabH,'paper');
    const z=slabH, bw=1.9; s+=boxShape(gx+.15,gy+.1,bw,6,'gray',z);
    const z1=z+6, x0=gx+.15-bw/2+.08, x1=gx+.15+bw/2-.08, yb=gy+.1-bw/2+.05;
    const s1=P(x0,yb,z1), s2=P(x1,yb,z1), s3=P(x1,yb-.22,z1+62), s4=P(x0,yb-.22,z1+62);
    s+=`<polygon class="edge" fill="var(--ink)" points="${pts([s1,s2,s3,s4])}"/>`;
    const L=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
    const i1=L(L(s1,s4,.12),L(s2,s3,.12),.07), i2=L(L(s1,s4,.12),L(s2,s3,.12),.93), i3=L(L(s1,s4,.9),L(s2,s3,.9),.93), i4=L(L(s1,s4,.9),L(s2,s3,.9),.07);
    s+=`<polygon fill="var(--paper-1)" points="${pts([i1,i2,i3,i4])}"/>`;
    for(let k=0;k<3;k++){ const t=.68-k*.18; const a=L(L(s1,s4,t),L(s2,s3,t),.14), b=L(L(s1,s4,t),L(s2,s3,t),k===0?.8:.55);
      s+=`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="var(--purple-2)" stroke-width="5" stroke-linecap="round"/>`; }
    for(let a=0;a<3;a++) for(let b=0;b<6;b++){ const p=P(gx+.15-.65+b*.26, gy+.1+.05+a*.22, z1); s+=`<circle cx="${p[0]}" cy="${p[1]}" r="1.4" fill="var(--soft)"/>`; }
    const top=P(gx,gy,z1+62), bot=P(gx+w/2,gy+w/2,0);
    return `<g class="obj" data-id="${id}">${s}${o.screen?pillSVG(o.screen,top[0],top[1]-22):''}${pillSVG('👤 '+(o.pill||'you'),bot[0],bot[1]+24)}</g>`;
  }
  const w=o.w||2.5, h=o.h||80;
  if(o.kind==='cyl'){
    const c=P(gx,gy,0), rx=w*T*0.62, ry=rx*0.5, top=c[1]-h;
    const s=`<path class="edge" fill="var(--${col}-2)" d="M${c[0]-rx},${top} L${c[0]-rx},${c[1]} A${rx},${ry} 0 0 0 ${c[0]+rx},${c[1]} L${c[0]+rx},${top} Z"/>
      <path class="edge" fill="none" d="M${c[0]-rx},${top+h*.5} A${rx},${ry} 0 0 0 ${c[0]+rx},${top+h*.5}"/>
      <ellipse class="edge" fill="var(--${col}-1)" cx="${c[0]}" cy="${top}" rx="${rx}" ry="${ry}"/>`;
    return `<g class="obj" data-id="${id}">${s}${topIcon(o.icon,c[0],top)}${plateSVG(o.label,o.sub,c[0],c[1]-h*0.35+ry*0.5)}</g>`;
  }
  const r=w/2, C0=P(gx+r,gy+r,0), C=P(gx+r,gy+r,h), tc=P(gx,gy,h);
  return `<g class="obj" data-id="${id}">${boxShape(gx,gy,w,h,col)}${topIcon(o.icon,tc[0],tc[1])}${plateSVG(o.label,o.sub,C0[0],(C[1]+C0[1])/2+4)}</g>`;
}
function zoneSVG(id,z){
  const [gx,gy]=[z.g[0]*SP,z.g[1]*SP], [wx,wy]=[z.size[0]*SP,z.size[1]*SP];
  const a=P(gx-wx/2,gy-wy/2), b=P(gx+wx/2,gy-wy/2), c=P(gx+wx/2,gy+wy/2), d=P(gx-wx/2,gy+wy/2);
  const lw=[...z.label].length*8+22, lp=P(gx-wx/2,gy+wy/2);
  return `<g class="obj zonegrp" data-id="zone:${id}"><polygon class="zone" points="${pts([a,b,c,d])}"/>
    <g class="zonelbl" transform="translate(${lp[0]+lw/2+4},${lp[1]-4})"><rect x="${-lw/2}" y="-11" width="${lw}" height="22" rx="6"/><text x="0" y="4" text-anchor="middle">${esc(z.label)}</text></g></g>`;
}
function route(L,f){
  const A=L.objs[f.from], B=L.objs[f.to];
  const [ax,ay]=gOf(A), [bx,by]=gOf(B);
  const rad=o=>o.kind==='laptop'?1.7:(o.w||2.5)/2+.22;
  const ra=rad(A), rb=rad(B);
  const opts=[[[ax,ay],[bx,ay],[bx,by]],[[ax,ay],[ax,by],[bx,by]]];
  const score=p=>{ const s1=Math.hypot(p[1][0]-p[0][0],p[1][1]-p[0][1]), s2=Math.hypot(p[2][0]-p[1][0],p[2][1]-p[1][1]); return Math.min(s1-ra,s2-rb); };
  const others=Object.entries(L.objs).filter(([id])=>id!==f.from&&id!==f.to).map(([,o])=>[gOf(o),(o.kind==='laptop'?1.6:(o.w||2.5)/2+.2)]);
  const segD=(p,a,b)=>{ const dx=b[0]-a[0],dy=b[1]-a[1],l=dx*dx+dy*dy||1; let t=((p[0]-a[0])*dx+(p[1]-a[1])*dy)/l; t=Math.max(0,Math.min(1,t)); return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy); };
  const clear=p=>others.every(([c,r])=>p.slice(1).every((q,i)=>segD(c,p[i],q)>r));
  let ok=opts.filter(o=>score(o)>=0.3&&clear(o)).sort((x,y)=>score(y)-score(x));
  if(f.via==='x') ok=[opts[0]]; else if(f.via==='y') ok=[opts[1]];
  let pth=ok.length?ok[0]:[[ax,ay],[bx,by]];
  const trim=(p,q,d)=>{ const l=Math.hypot(q[0]-p[0],q[1]-p[1])||1; return [p[0]+(q[0]-p[0])*d/l, p[1]+(q[1]-p[1])*d/l]; };
  const pp=pth.filter((p,i,a)=>i===0||Math.hypot(p[0]-a[i-1][0],p[1]-a[i-1][1])>0.01);
  pp[0]=trim(pp[0],pp[1],ra); const n=pp.length-1; pp[n]=trim(pp[n],pp[n-1],rb);
  const sp=pp.map(p=>P(p[0],p[1],3));
  let d='M'+sp[0].join(',');
  for(let i=1;i<sp.length;i++){
    if(i<sp.length-1){ const p=sp[i], a=sp[i-1], b=sp[i+1], k=14;
      const la=Math.hypot(p[0]-a[0],p[1]-a[1]), lb=Math.hypot(b[0]-p[0],b[1]-p[1]);
      const q1=[p[0]-(p[0]-a[0])*Math.min(k,la/2)/la, p[1]-(p[1]-a[1])*Math.min(k,la/2)/la];
      const q2=[p[0]+(b[0]-p[0])*Math.min(k,lb/2)/lb, p[1]+(b[1]-p[1])*Math.min(k,lb/2)/lb];
      d+=` L${q1.join(',')} Q${p.join(',')} ${q2.join(',')}`;
    } else d+=` L${sp[i].join(',')}`;
  }
  return d;
}

/* ---------- shell ---------- */
const L_=()=>COURSE.lessons[li];
function readHash(){
  const m=location.hash.match(/^#\/([\w-]+)(?:\/(\d+))?/);
  if(!m) return;
  if(['play','practice','cheat','glossary'].includes(m[1])){ view=m[1]; return; }
  const i=COURSE.lessons.findIndex(l=>l.id===m[1]); if(i<0) return;
  view='learn'; li=i; si=Math.min(COURSE.lessons[i].steps.length-1, Math.max(0,(+m[2]||1)-1));
}
function writeHash(){ history.replaceState(null,'', view==='learn'?`#/${L_().id}/${si+1}`:`#/${view}`);  remoteReport(); }
/* ---------- remote control: the window that opened this page can move it, and is told where it is ---------- */
const REMOTE=(window.opener&&window.opener!==window)?window.opener:null;
function remoteReport(){ if(REMOTE) try{ REMOTE.postMessage({type:'mcp-course:pos',view,lesson:view==='learn'?L_().id:null,step:si+1},'*'); }catch(e){} }
window.addEventListener('message',e=>{
  if(!REMOTE||e.source!==REMOTE) return;
  const m=e.data||{};
  if(m.type==='mcp-course:hello') return remoteReport();
  if(m.type==='mcp-course:go'){ const i=COURSE.lessons.findIndex(l=>l.id===m.lesson); if(i<0) return;
    const s=Math.min(COURSE.lessons[i].steps.length-1,Math.max(0,(+m.step||1)-1));
    if(view==='learn'&&i===li){ if(s!==si){ si=s; showStep(); } } else { view='learn'; li=i; si=s; renderShell(); } return; }
  if(m.type==='mcp-course:view'&&['play','practice','cheat','glossary'].includes(m.view)){ if(view!==m.view){ view=m.view; renderShell(); } return; }
  if(view!=='learn') return;
  if(m.type==='mcp-course:replay') showStep(); else if(m.type==='mcp-course:json') toggleJSON(); else if(m.type==='mcp-course:pause') togglePause();
});

function leftCol(){
  return `<div class="col left"><div class="card tree" id="tree"></div>
    <div class="card progress"><div class="row"><span>PROGRESS</span><span id="pcount"></span></div><div class="bar"><i id="pbar"></i></div><div class="sub2"><span>quiz</span><span id="qcount"></span></div></div></div>`;
}
function renderShell(){
  if(raf) cancelAnimationFrame(raf), raf=null;
  document.querySelectorAll('.tab').forEach(t=>t.setAttribute('aria-selected', t.dataset.view===view));
  if(view==='play'){ $('#layout').innerHTML=leftCol()+`<div class="pg" id="pg"></div>`; renderTree(); writeHash(); window.PLAYGROUND && PLAYGROUND.render($('#pg')); return; }
  if(view!=='learn'){ $('#layout').innerHTML=leftCol()+`<div class="page card" id="page"></div>`; renderTree(); writeHash();
    ({practice:renderPractice, cheat:renderCheat, glossary:renderGlossary})[view](); markAll(); return; }
  const L=L_();
  $('#layout').innerHTML = leftCol()+`
  <div class="col">
    <div class="card" style="flex:1;min-height:0;display:flex;flex-direction:column">
      <div class="lessonhead">
        <div><div class="crumb">${esc(COURSE.folders.find(f=>f.id===L.folder).title)} / Lesson ${li+1} of ${COURSE.lessons.length}</div>
          <h1>${esc(L.title)}</h1><p>${esc(L.blurb)}</p></div>
        <div class="badges"><span class="badge y">◷ ${L.mins} min</span><span class="badge g">▮▮ ${L.level}</span><span class="badge p">☰ ${L.steps.length} steps</span></div>
      </div>
      <div class="stagewrap">
        <div class="metrics" id="metrics"></div>
        <div class="stagebtns"><button class="sbtn" id="jbtn" title="Show the JSON on the wire (J)">{ } JSON</button><button class="sbtn" id="replay">↻ Replay</button><button class="sbtn" id="pause">❚❚ Pause</button></div>
        <svg class="scene" id="scene" viewBox="0 0 ${VW} ${VH}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Animated diagram: ${esc(L.title)}"></svg>
        <div class="drawer hide" id="drawer" aria-live="polite"></div>
        <div class="legend"><span><i style="background:var(--req)"></i>request</span><span><i style="background:var(--res)"></i>response</span><span><i style="border:1.5px solid var(--ink)"></i>notification / local</span><span><i style="background:var(--red-ink)"></i>error</span></div>
      </div>
    </div>
    <div class="card timeline"><div class="hd"><span>IN THIS LESSON</span><span id="tlpos"></span></div><div class="steps" id="steps"></div></div>
  </div>
  <div class="col"><div class="card stepcard" id="stepcard"></div><div class="card learn" id="learn"></div></div>`;
  renderTree();
  const objs=Object.entries(L.objs).sort((a,b)=>{ const ga=gOf(a[1]), gb=gOf(b[1]); return (ga[0]+ga[1])-(gb[0]+gb[1]); });
  const zones=Object.entries(L.zones||{});
  $('#scene').innerHTML = gridSVG()+`<g id="zones">${zones.map(([id,z])=>zoneSVG(id,z).replace('class="obj zonegrp"',`class="obj zonegrp${(z.appear||0)>si?' hidden':''}"`)).join('')}</g><g id="under"></g><g id="ghosts"></g>
    <g id="objs">${objs.map(([id,o])=>objSVG(id,o).replace('class="obj"',`class="obj${(o.appear||0)>si?' hidden':''}"`)).join('')}</g><g id="flows"></g><g id="fx"></g>`;
  fitScene();
  $('#steps').innerHTML = L.steps.map((s,i)=>`<button class="st" data-i="${i}" title="${esc(s.name)}"><b>${s.quiz?'?':i+1}</b><span>${esc(s.name)}</span></button>`).join('');
  $('#steps').querySelectorAll('.st').forEach(b=>b.onclick=()=>{ si=+b.dataset.i; showStep(); });
  $('#replay').onclick=()=>showStep(); $('#pause').onclick=togglePause; $('#jbtn').onclick=toggleJSON;
  showStep();
}
function fitScene(){
  const svg=$('#scene'), a=$('#objs').getBBox(), z=$('#zones').getBBox();
  let x1=a.x, y1=a.y, x2=a.x+a.width, y2=a.y+a.height;
  if(z.width>0){ x1=Math.min(x1,z.x); y1=Math.min(y1,z.y); x2=Math.max(x2,z.x+z.width); y2=Math.max(y2,z.y+z.height); }
  const padX=34, padTop=84, padBot=28;
  let x=x1-padX, y=y1-padTop, w=(x2-x1)+padX*2, h=(y2-y1)+padTop+padBot;
  const r=svg.getBoundingClientRect(), aspect=r.width/Math.max(1,r.height);
  if(w/h<aspect){ const nw=h*aspect; x-=(nw-w)/2; w=nw; } else { const nh=w/aspect; y-=(nh-h)/2; h=nh; }
  svg.setAttribute('viewBox',`${x} ${y} ${w} ${h}`);
}
function renderTree(){
  const ls=COURSE.lessons, tot=ls.length, d=ls.filter(l=>done.has(l.id)).length;
  $('#tree').innerHTML = `<h3><span>▣ Course</span><small>${tot} lessons</small></h3>` + COURSE.folders.map(f=>{
    const mine=ls.map((l,i)=>[l,i]).filter(([l])=>l.folder===f.id);
    const dn=mine.filter(([l])=>done.has(l.id)).length, isOpen=open.has(f.id);
    return `<button class="folder" data-f="${f.id}" aria-expanded="${isOpen}"><span class="chev">›</span><span class="ficon" style="background:${f.color}"></span>${esc(f.title)}<span class="cnt">${dn}/${mine.length}</span></button>
      ${isOpen?`<div class="lessons">${mine.map(([l,i])=>`<button class="lesson" data-i="${i}" aria-current="${view==='learn'&&i===li}">▢ ${esc(l.title)}${done.has(l.id)?'<span class="ok">✓</span>':''}</button>`).join('')}</div>`:''}`;
  }).join('');
  $('#tree').querySelectorAll('.folder').forEach(b=>b.onclick=()=>{ const f=b.dataset.f; open.has(f)?open.delete(f):open.add(f); store.set('open',[...open]); renderTree(); });
  $('#tree').querySelectorAll('.lesson').forEach(b=>b.onclick=()=>{ li=+b.dataset.i; si=0; view='learn'; renderShell(); });
  $('#pcount').textContent=`${d} / ${tot}`; $('#pbar').style.width=(d/tot*100)+'%';
  const qs=allQuizzes(), right=qs.filter(k=>quizState[k]&&quizState[k].ok).length;
  $('#qcount').textContent=`${right} / ${qs.length} correct`;
}
function allQuizzes(){ const out=[]; COURSE.lessons.forEach(l=>l.steps.forEach((s,i)=>{ if(s.quiz) out.push(l.id+':'+i); })); return out; }
function metricsAt(L,upto){
  const m={}, changed=new Set();
  for(let i=0;i<=upto;i++){ const s=L.steps[i]; if(s.metrics) for(const k in s.metrics){ m[k]=s.metrics[k]; if(i===upto) changed.add(k);} }
  return [m,changed];
}
function renderDrawer(S){
  const d=$('#drawer'), msgs=S.msg||[];
  $('#jbtn').classList.toggle('on', jsonOpen && msgs.length>0);
  $('#jbtn').style.display = msgs.length? '' : 'none';
  const was=!d.classList.contains('hide');
  if(!msgs.length || !jsonOpen){ d.classList.add('hide'); if(was) fitScene(); return; }
  d.classList.remove('hide'); if(!was) fitScene(); markAll();
  d.innerHTML = msgs.map(m=>`<div class="msg"><div class="msghd"><span class="dirchip ${m.kind||'req'}">${esc(m.dir)}</span>${m.note?`<span class="nt">${md(m.note)}</span>`:''}</div><pre class="json">${hlJSON(m.json)}</pre></div>`).join('');
}
function quizHTML(S){
  const key=L_().id+':'+si, st=quizState[key], q=S.quiz;
  return `<div class="quiz"><div class="qh">CHECK YOURSELF</div><div class="qq">${md(q.q)}</div>
    ${q.options.map((o,i)=>{ let c=''; if(st){ if(i===q.answer) c='right'; else if(i===st.pick) c='wrong'; }
      return `<button class="opt ${c}" data-i="${i}" ${st?'disabled':''}>${String.fromCharCode(65+i)}. ${md(o)}</button>`; }).join('')}
    ${st?`<div class="why ${st.ok?'':'bad'}"><b>${st.ok?'Correct.':'Not quite.'}</b> ${md(q.why)}</div>`:''}</div>`;
}
function showStep(){
  const L=L_(), S=L.steps[si];
  if(raf) cancelAnimationFrame(raf), raf=null;
  writeHash(); store.set('pos',{li,si});
  const flows=S.flows||[];
  const active=new Set(); flows.filter(f=>!f.ghost).forEach(f=>{active.add(f.from);active.add(f.to);}); (S.at||[]).forEach(a=>active.add(a.obj));
  document.querySelectorAll('#objs .obj').forEach(g=>{ const o=L.objs[g.dataset.id];
    g.classList.toggle('hidden',(o.appear||0)>si); g.classList.toggle('lift',active.has(g.dataset.id)&&S.tag!=='RECAP'); });
  document.querySelectorAll('#zones .obj').forEach(g=>{ const z=(L.zones||{})[g.dataset.id.slice(5)]; g.classList.toggle('hidden',(z.appear||0)>si); });
  let fl='', ghosts='';
  flows.forEach((f,i)=>{ const d=route(L,f);
    if(f.ghost){ ghosts+=`<path class="flow ghost ${f.kind==='hs'?'hs':''}" d="${d}" marker-end="url(#ahg)"/>`; return; }
    fl+=`<path class="flow ${f.kind==='hs'?'hs':''} ${f.kind==='err'?'err':''}" id="fp${i}" d="${d}" marker-end="url(#${f.kind==='err'?'ahr':'ah'})"/>`; });
  $('#ghosts').innerHTML=ghosts; $('#flows').innerHTML=fl;
  const live=flows.map((f,i)=>[f,document.getElementById('fp'+i)]).filter(x=>x[1]);
  let fx='', under='';
  live.forEach(([f,p],i)=>{ const len=p.getTotalLength(), mid=p.getPointAtLength(len*0.5);
    if(f.label) fx+=pillSVG(f.label,mid.x,mid.y-18-(i%2)*0);
    fx+=`<circle class="dot ${f.kind||'req'}" id="dot${i}" r="${f.kind==='hs'?5.5:6.5}" visibility="hidden"/>`;
    if(!reduced && f.kind!=='hs'){ p.style.strokeDasharray=`${len} ${len}`; p.style.strokeDashoffset=len; } });
  (S.at||[]).forEach((a,i)=>{ const o=L.objs[a.obj], [gx,gy]=gOf(o), w=o.kind==='laptop'?3.1:(o.w||2.5), h=o.kind==='laptop'?90:(o.h||80);
    const base=P(gx,gy,0), top=P(gx-w/2,gy-w/2,h);
    under+=`<ellipse class="ring" id="ring${i}" cx="${base[0]}" cy="${base[1]}" rx="${w*T*0.95}" ry="${w*T*0.5}" opacity="0"/>`;
    fx+=pillSVG(a.label,top[0],top[1]-24-(i%2)*30, a.kind==='err'?'errpill':''); });
  $('#under').innerHTML=under; $('#fx').innerHTML=fx;
  const [m,changed]=metricsAt(L,si);
  $('#metrics').innerHTML=(L.metrics||[]).map(([k,lab,ic])=>`<div class="metric ${changed.has(k)?'changed':''}"><div class="k"><svg width="11" height="11" viewBox="0 0 24 24" class="ic" style="stroke:var(--muted);fill:none;stroke-width:2">${ICON[ic]||''}</svg>${esc(lab)}</div><div class="v">${esc(m[k]||'—')}</div></div>`).join('');
  renderDrawer(S);
  const nx=L.steps[si+1];
  $('#stepcard').innerHTML=`
    <div class="stephd"><span>STEP ${si+1} / ${L.steps.length}</span><span class="tag ${S.tag}">${S.tag}</span></div>
    <h2>${esc(S.title)}</h2>
    <div class="body">
      ${(S.body||[]).map(p=>`<p>${md(p)}</p>`).join('')}
      ${S.quiz?quizHTML(S):''}
      ${S.key?`<div class="key"><div class="ki">✦</div><div><small>KEY IDEA</small>${md(S.key)}</div></div>`:''}
      ${S.changes?`<div class="changes"><h4>WHAT CHANGED</h4><ul>${S.changes.map(([c,t])=>`<li><span class="m ${c==='+'?'p':c==='~'?'t':'x'}">${c==='+'?'+':c==='~'?'~':'!'}</span>${md(t)}</li>`).join('')}</ul></div>`:''}
      ${S.ref?`<div class="ref">Spec: <code>${esc(S.ref)}</code></div>`:''}
    </div>
    <div class="nav"><button class="nbtn" id="back" ${si===0&&li===0?'disabled':''}>←</button>
      <button class="nbtn primary" id="next"><span>${nx?'Next: '+esc(nx.name):(li<COURSE.lessons.length-1?'Next lesson':'Finish')}</span><span>→</span></button></div>
    <div class="hint"><kbd>←</kbd> <kbd>→</kbd> step · <kbd>J</kbd> JSON · <kbd>R</kbd> replay · <kbd>Space</kbd> pause</div>`;
  $('#back').onclick=()=>move(-1); $('#next').onclick=()=>move(1);
  $('#stepcard').querySelectorAll('.opt').forEach(b=>b.onclick=()=>{ const i=+b.dataset.i, key=L.id+':'+si;
    quizState[key]={pick:i, ok:i===S.quiz.answer}; store.set('quiz',quizState); showStep(); renderTree(); });
  $('#learn').innerHTML=`<h4>YOU’LL LEARN</h4>`+L.learn.map(([t,at])=>`<label class="${si>=at?'on':''}"><span class="cb">${si>=at?'✓':''}</span>${md(t)}</label>`).join('');
  document.querySelectorAll('#steps .st').forEach((b,i)=>b.className='st '+(i===si?'on':i<si?'seen':''));
  $('#tlpos').textContent=`Step ${si+1} of ${L.steps.length}`;
  if(si===L.steps.length-1 && !done.has(L.id)){ done.add(L.id); store.set('done',[...done]); renderTree(); }
  const t0=performance.now();
  const tick=now=>{
    const t=now-t0;
    live.forEach(([f,p],i)=>{ const len=p.getTotalLength();
      if(f.kind!=='hs' && !reduced) p.style.strokeDashoffset=Math.max(0,len*(1-Math.min(1,t/650)));
      const dot=document.getElementById('dot'+i); if(!dot) return;
      if(reduced){ const q=p.getPointAtLength(len*.5); dot.setAttribute('cx',q.x); dot.setAttribute('cy',q.y); dot.setAttribute('visibility','visible'); return; }
      const start=350+i*450; if(t<start) return;
      const k=paused?0.55:((t-start)%1900)/1900, e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
      const q=p.getPointAtLength(len*e); dot.setAttribute('cx',q.x); dot.setAttribute('cy',q.y); dot.setAttribute('visibility','visible'); });
    (S.at||[]).forEach((a,i)=>{ const r=document.getElementById('ring'+i); if(!r) return;
      if(reduced){ r.setAttribute('opacity',.8); return; }
      const k=paused?0.3:(t%1400)/1400, o=L.objs[a.obj], w=o.kind==='laptop'?3.1:(o.w||2.5);
      r.setAttribute('rx',w*T*(0.95+k*.45)); r.setAttribute('ry',w*T*(0.5+k*.24)); r.setAttribute('opacity',(1-k)*.9); });
    raf=requestAnimationFrame(tick);
  };
  raf=requestAnimationFrame(tick);
  markAll();
}
function move(d){
  const L=L_();
  if(d>0){ if(si<L.steps.length-1){si++;showStep();} else if(li<COURSE.lessons.length-1){li++;si=0;renderShell();} }
  else { if(si>0){si--;showStep();} else if(li>0){li--;si=COURSE.lessons[li].steps.length-1;renderShell();} }
}
function togglePause(){ paused=!paused; const b=$('#pause'); if(b) b.innerHTML=paused?'▶ Play':'❚❚ Pause'; }
function toggleJSON(){ jsonOpen=!jsonOpen; store.set('json',jsonOpen); if(view==='learn') renderDrawer(L_().steps[si]); }

/* ---------- other views ---------- */
function goPlayground(preset){ view='play'; renderShell(); if(window.PLAYGROUND) PLAYGROUND.preset(preset||{}); }
function renderPractice(){
  $('#page').innerHTML=`<h1>Missions</h1><p class="sub">${md(COURSE.missionsIntro)}</p>
  <div class="grid2">${COURSE.lessons.filter(L=>(L.missions||[]).length||(L.review||[]).length).map(L=>`<div class="pc"><h3>${esc(L.title)}</h3>
    ${(L.missions||[]).map((m,i)=>`<div class="mission"><button data-l="${L.id}" data-m="${i}">▶ try</button><div>${md(m.text)}</div></div>`).join('')}
    ${(L.review||[]).map(q=>`<details><summary>${md(q.q)}</summary><div>${md(q.a)}</div></details>`).join('')}</div>`).join('')}</div>`;
  $('#page').querySelectorAll('.mission button').forEach(b=>b.onclick=()=>{ const L=COURSE.lessons.find(l=>l.id===b.dataset.l); goPlayground(L.missions[+b.dataset.m].preset); });
}
function renderCheat(){
  $('#page').innerHTML=`<h1>Cheatsheet</h1><p class="sub">The whole protocol (2026-07-28) on one page.</p>
  <div class="grid2">${COURSE.cheat.map(c=>`<div class="pc"><h3>${esc(c.title)}</h3><table><tr>${c.head.map(h=>`<th>${esc(h)}</th>`).join('')}</tr>
    ${c.rows.map(r=>`<tr>${r.map((x,i)=>`<td>${i===0?`<code>${esc(x)}</code>`:md(x)}</td>`).join('')}</tr>`).join('')}</table></div>`).join('')}</div>`;
}
function renderGlossary(){
  const terms=Object.keys(COURSE.glossary).sort();
  $('#page').innerHTML=`<h1>Glossary</h1><p class="sub">Every term in the course. Dotted words in lessons show these on hover.</p>
    <dl class="gloss">${terms.map(t=>`<dt>${esc(t)}</dt><dd>${md(COURSE.glossary[t])}</dd>`).join('')}</dl>`;
}


/* ---------- "more below" hints for scroll boxes ---------- */
const SCROLLERS='.tree,.body,.drawer,.page,.pg .card,.learn';
function markMore(el){ if(!el||!el.classList) return; const extra=el.classList.contains('more')?16:0;
  el.classList.toggle('more', el.scrollHeight-el.scrollTop-el.clientHeight-extra>6); }
function markAll(){ requestAnimationFrame(()=>document.querySelectorAll(SCROLLERS).forEach(markMore)); }
document.addEventListener('scroll',e=>{ if(e.target.matches&&e.target.matches(SCROLLERS)) markMore(e.target); },true);
window.addEventListener('resize',markAll);

/* ---------- boot ---------- */
function COURSE_BOOT(){
  open=new Set(store.get('open',COURSE.folders.map(f=>f.id)));
  done=new Set(store.get('done',[])); quizState=store.get('quiz',{}); jsonOpen=store.get('json',true);
  document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{ view=t.dataset.view; renderShell(); });
  document.addEventListener('keydown',e=>{
    if(view!=='learn'||e.metaKey||e.ctrlKey||e.altKey) return;
    if(e.target.closest&&e.target.closest('input,select,textarea')) return;
    if(e.key==='ArrowRight'||e.key==='PageDown'){ move(1); e.preventDefault(); }
    else if(e.key==='ArrowLeft'||e.key==='PageUp'){ move(-1); e.preventDefault(); }
    else if(e.key==='r'||e.key==='R') showStep();
    else if(e.key==='j'||e.key==='J') toggleJSON();
    else if(e.key===' '){ togglePause(); e.preventDefault(); }
  });
  $('#theme').onclick=()=>{ const d=document.documentElement.dataset.theme==='dark'?'light':'dark'; document.documentElement.dataset.theme=d; store.set('theme',d); };
  if(!document.documentElement.dataset.theme) document.documentElement.dataset.theme=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
  const pos=store.get('pos',null); if(pos&&COURSE.lessons[pos.li]){ li=pos.li; si=Math.min(pos.si,COURSE.lessons[li].steps.length-1); }
  readHash();
  window.addEventListener('hashchange',()=>{ readHash(); renderShell(); });
  window.addEventListener('resize',()=>{ if(view==='learn'&&$('#scene')) fitScene(); });
  renderShell();
}
