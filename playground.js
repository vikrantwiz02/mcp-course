/* =====================================================================
   Playground: a simulated MCP server (modern-only, 2026-07-28).
   It enforces the spec rules taught in the course, so learners can
   break things on purpose and see the exact response.
   ===================================================================== */
(function(){
const SUPPORTED=['2026-07-28'];
const PG = { transport:'http', version:'2026-07-28', meta:true, elicit:false, mismatch:false, tamper:false,
  loc:'Paris', uri:'file:///notes/todo.md', topic:'m', nextId:1, log:[], pending:null, listen:null, report:null, highlight:null };
const SERVER_INFO={name:'playground-server',title:'Playground Server',version:'1.0.0'};
const NOTES={'file:///notes/todo.md':'# Todo\n- learn MCP\n- build a server','file:///notes/ideas.md':'# Ideas\n- weather bot'};
const TOOLS=[
  {name:'get_weather',title:'Weather',description:'Get current weather for a city. Use when the user asks about weather.',
   inputSchema:{type:'object',properties:{location:{type:'string',description:'City name'}},required:['location'],additionalProperties:false},
   outputSchema:{type:'object',properties:{temperature:{type:'number'},conditions:{type:'string'}},required:['temperature','conditions']},
   annotations:{readOnlyHint:true,openWorldHint:true}},
  {name:'book_flight',title:'Book a flight',description:'Book a flight to Tokyo. Asks the user who is flying.',
   inputSchema:{type:'object',properties:{destination:{type:'string'}},required:['destination']},
   annotations:{readOnlyHint:false,destructiveHint:false,idempotentHint:false,openWorldHint:true}},
  {name:'generate_report',title:'Generate report',description:'Slow job that reports progress.',
   inputSchema:{type:'object',additionalProperties:false},annotations:{readOnlyHint:true,openWorldHint:false}},
];
const TOPICS=['mcp','machine learning','marketing','meetings','monitoring','python','privacy'];

/* ---------- helpers ---------- */
const meta=()=>({'io.modelcontextprotocol/protocolVersion':PG.version,'io.modelcontextprotocol/clientInfo':{name:'PlaygroundClient',version:'1.0.0'},
  'io.modelcontextprotocol/clientCapabilities':PG.elicit?{elicitation:{form:{}}}:{}});
function mkReq(method,params={},extraMeta){ const p={...params}; if(PG.meta) p._meta={...(extraMeta||{}),...meta()}; else if(extraMeta) p._meta={...extraMeta};
  return {jsonrpc:'2.0',id:PG.nextId++,method,params:p}; }
const ok=(id,result)=>({jsonrpc:'2.0',id,result:{resultType:'complete',...result,_meta:{...(result._meta||{}),'io.modelcontextprotocol/serverInfo':SERVER_INFO}}});
const err=(id,code,message,data)=>({jsonrpc:'2.0',id,error:data===undefined?{code,message}:{code,message,data}});
const b64=s=>btoa(unescape(encodeURIComponent(s)));
function headersFor(m){
  if(PG.transport!=='http') return null;
  const h=['POST /mcp HTTP/1.1','Content-Type: application/json','Accept: application/json, text/event-stream'];
  if(m.method==='initialize') return h; // a legacy client sends none of the modern headers
  let ver=m.params._meta?m.params._meta['io.modelcontextprotocol/protocolVersion']:PG.version;
  let name=m.params.name||m.params.uri;
  if(PG.mismatch){ if(name) name='delete_file'; else ver='2025-11-25'; }
  h.push('MCP-Protocol-Version: '+ver,'Mcp-Method: '+m.method);
  if(['tools/call','resources/read','prompts/get'].includes(m.method)) h.push('Mcp-Name: '+name);
  return h;
}
function httpLine(status){ return {200:'HTTP/1.1 200 OK',202:'HTTP/1.1 202 Accepted',400:'HTTP/1.1 400 Bad Request',404:'HTTP/1.1 404 Not Found'}[status]; }

/* ---------- the server ---------- */
function serve(m,hdrs){
  const id=m.id, P=m.params||{}, M=P._meta||{};
  if(m.method==='initialize'){
    if(PG.transport==='http') return {status:400, body:err(id,-32020,'Missing required MCP headers',{supported:SUPPORTED}),
      explain:['bad','A legacy client sent `initialize` over HTTP without the modern headers. A modern server rejects it with **400**; a modern-only server SHOULD list its supported versions in any error it returns to initialize. Legacy clients have no way forward.']};
    return {body:err(id,-32601,'Method not found: initialize',{supported:SUPPORTED}),
      explain:['bad','On stdio a modern server rejects `initialize`. The exact code is implementation-defined (this simulator uses -32601 because the method doesn’t exist here) and it lists the supported versions.']};
  }
  if(hdrs && PG.mismatch) return {status:400, body:err(id,-32020,'Header mismatch'),
    explain:['bad','A header disagreed with the body. Servers MUST reject header/body mismatches with **400** and `HeaderMismatch` (-32020), so a gateway can’t approve one call while another runs.']};
  if(!M['io.modelcontextprotocol/protocolVersion']||!M['io.modelcontextprotocol/clientCapabilities'])
    return {status:400, body:err(id,-32602,'Missing required _meta key io.modelcontextprotocol/protocolVersion'),
      explain:['bad','Every 2026-07-28 request must carry `protocolVersion` and `clientCapabilities` in `_meta`. Missing → **-32602** (HTTP 400). There is no handshake to fall back on.']};
  const v=M['io.modelcontextprotocol/protocolVersion'];
  if(!SUPPORTED.includes(v)) return {status:400, body:err(id,-32022,'Unsupported protocol version',{supported:SUPPORTED,requested:v}),
    explain:['bad',`Version **${v}** isn’t supported here. The server MUST answer -32022 with the versions it supports; the client SHOULD retry with one of them or show an error.`]};
  const caps=M['io.modelcontextprotocol/clientCapabilities']||{};
  switch(m.method){
    case 'server/discover': return {body:ok(id,{supportedVersions:SUPPORTED,capabilities:{tools:{listChanged:true},resources:{listChanged:true},prompts:{},completions:{}},
        instructions:'Use get_weather for weather questions. book_flight asks the user who is flying.',ttlMs:3600000,cacheScope:'public'}),
      explain:['good','`server/discover`: supported versions, capabilities, instructions for the model, serverInfo in `_meta`. Cacheable for an hour (`ttlMs`), shareable across users (`public`).']};
    case 'tools/list': return {body:ok(id,{tools:TOOLS,ttlMs:300000,cacheScope:'public'}),
      explain:['good','Three tools, in a stable order. No `nextCursor`, so this is the only page. Note `outputSchema` on get_weather and the annotations.']};
    case 'tools/call': return callTool(m,caps);
    case 'resources/list': return {body:ok(id,{resources:Object.keys(NOTES).map(u=>({uri:u,name:u.split('/').pop(),mimeType:'text/markdown'})),ttlMs:60000,cacheScope:'private'}),
      explain:['good','Resources are user data here, so `cacheScope` is `private`: reuse only within the same authorization context.']};
    case 'resources/templates/list': return {body:ok(id,{resourceTemplates:[{uriTemplate:'file:///notes/{name}',name:'note',mimeType:'text/markdown'}],ttlMs:60000,cacheScope:'private'}),
      explain:['good','An RFC 6570 URI template. Fill `{name}` to build a URI you can read.']};
    case 'resources/read': {
      if(!NOTES[P.uri]) return {status:200, body:err(id,-32602,'Resource not found',{uri:P.uri}),
        explain:['bad','Not found MUST be **-32602** in 2026-07-28 (it used to be -32002). Servers must not return empty contents for something that doesn’t exist.']};
      return {body:ok(id,{contents:[{uri:P.uri,mimeType:'text/markdown',text:NOTES[P.uri]}],ttlMs:60000,cacheScope:'private'}),
        explain:['good','`contents` with `uri`, `mimeType` and `text`. Cacheable, private.']};
    }
    case 'prompts/list': return {body:ok(id,{prompts:[{name:'summarize',title:'Summarize',description:'Summarize a topic in 3 bullets',arguments:[{name:'topic',description:'What to summarize',required:true}]}],ttlMs:300000,cacheScope:'public'}),
      explain:['good','One prompt with one required string argument.']};
    case 'prompts/get': {
      if(P.name!=='summarize') return {body:err(id,-32602,'Unknown prompt: '+P.name),explain:['bad','Unknown prompt → -32602.']};
      if(!P.arguments||!P.arguments.topic) return {body:err(id,-32602,'Missing required argument: topic'),
        explain:['bad','A missing required prompt argument is a protocol error: **-32602**.']};
      return {body:ok(id,{description:'Summarize a topic',messages:[{role:'user',content:{type:'text',text:`Summarize "${P.arguments.topic}" in three bullet points.`}}]}),
        explain:['good','`messages` with a role and one content block — ready to hand to the model.']};
    }
    case 'completion/complete': {
      const val=(P.argument&&P.argument.value||'').toLowerCase(), vals=TOPICS.filter(t=>t.startsWith(val));
      return {body:ok(id,{completion:{values:vals.slice(0,100),total:vals.length,hasMore:false}}),
        explain:['good','Up to 100 suggestions, best first. Real clients debounce typing and cache results.']};
    }
    case 'subscriptions/listen': {
      PG.listen={id};
      return {stream:true, frames:[{dir:'server → client · notification',kind:'note',json:{jsonrpc:'2.0',method:'notifications/subscriptions/acknowledged',params:{_meta:{'io.modelcontextprotocol/subscriptionId':id},notifications:P.notifications}}}],
        explain:['good',`The acknowledgement is the first message for subscription **${id}**. The stream stays open. Now press “Server: change tool list”.`]};
    }
    default: return {status:404, body:err(id,-32601,'Method not found'),
      explain:['bad',`\`${m.method}\` doesn’t exist → **-32601**${PG.transport==='http'?' with HTTP **404**':''}.`]};
  }
}
function callTool(m,caps){
  const id=m.id, P=m.params;
  if(P.name==='get_weather'){
    const loc=(P.arguments&&P.arguments.location||'').trim();
    if(!loc) return {body:ok(id,{content:[{type:'text',text:'location is required: pass a city name such as "Paris".'}],isError:true}),
      explain:['bad','Input validation failed, so this is a **tool execution error**: a normal result with `isError: true` and a message the model can use to fix its call. Not a JSON-RPC error.']};
    const data={temperature:18.5,conditions:'Partly cloudy'};
    return {body:ok(id,{content:[{type:'text',text:JSON.stringify(data)}],structuredContent:data}),
      explain:['good',`Success for **${loc}**: \`content\` for the model, \`structuredContent\` (matching \`outputSchema\`) for programs, and the same JSON as text for older clients.`]};
  }
  if(P.name==='book_flight'){
    if(P.requestState||P.inputResponses){
      const st=P.requestState||'';
      if(PG.tamper||!st.endsWith('.sig')) return {body:err(id,-32602,'Invalid requestState'),
        explain:['bad','The server checked the integrity of `requestState` (HMAC/AEAD) and it failed, so it MUST reject it. The spec requires rejection but doesn’t fix a code; this simulator uses -32602.']};
      const ans=(P.inputResponses||{}).passenger||{};
      if(ans.action!=='accept') return {body:ok(id,{content:[{type:'text',text:`User chose "${ans.action}". Nothing was booked.`}],isError:true}),
        explain:['bad',`The user answered **${ans.action}**. The server ends the call without booking.`]};
      PG.pending=null;
      return {body:ok(id,{content:[{type:'text',text:`Booked a flight to Tokyo for ${ans.content.name}.`}],structuredContent:{confirmation:'TYO-4821',passenger:ans.content.name}}),
        explain:['good',`Round 2 complete. Notice the retry used a **new id** (${id}) and echoed \`requestState\` unchanged.`]};
    }
    if(!caps.elicitation) return {status:400, body:err(id,-32021,'Missing required client capability',{requiredCapabilities:{elicitation:{}}}),
      explain:['bad','This tool must ask the user, but the request didn’t declare `elicitation`. The server MUST NOT send input requests for undeclared capabilities → **-32021** with `data.requiredCapabilities`.']};
    const st=b64(JSON.stringify({tool:'book_flight',dest:'Tokyo',user:'demo-user',exp:Date.now()+600000}))+'.sig';
    PG.pending={method:'tools/call',params:{name:'book_flight',arguments:P.arguments},state:st};
    return {body:{jsonrpc:'2.0',id,result:{resultType:'input_required',inputRequests:{passenger:{method:'elicitation/create',params:{mode:'form',message:'Who is flying to Tokyo?',requestedSchema:{type:'object',properties:{name:{type:'string',title:'Full name',minLength:1}},required:['name']}}}},requestState:st}},
      explain:['good','**input_required**: the server asks a question by answering. Gather the input, then retry with `inputResponses` + the same `requestState` + a **new id**. Use the buttons that just appeared.']};
  }
  if(P.name==='generate_report') return {report:true};
  return {body:err(id,-32602,'Unknown tool: '+P.name),
    explain:['bad','Unknown tool is a **protocol error** (-32602), not a tool execution error.']};
}

/* ---------- client actions ---------- */
function send(m,label){
  const hdrs=headersFor(m), r=serve(m,hdrs);
  const e={title:label, frames:[]};
  e.frames.push({dir:'client → server · '+(m.id!==undefined?'request':'notification'), kind:'req', json:hdrs?hdrs.join('\n')+'\n\n'+JSON.stringify(m,null,2):m});
  if(r.report){ startReport(m,e); return; }
  if(r.stream){ const sse=PG.transport==='http';
    e.frames.push({dir:'server → client'+(sse?' · 200 text/event-stream (stays open)':' · stdout'),kind:'note',json:r.frames[0].json});
    e.explain=r.explain; PG.log.unshift(e); draw(); return; }
  const isErr=!!r.body.error;
  e.frames.push({dir:'server → client · '+(isErr?'error':'result'), kind:isErr?'err':'res',
    json:PG.transport==='http'?httpLine(r.status||200)+'\nContent-Type: application/json\n\n'+JSON.stringify(r.body,null,2):r.body});
  e.explain=r.explain; PG.log.unshift(e); draw();
}
function startReport(m,e){
  const tok='rep-'+m.id, sse=PG.transport==='http';
  e.frames[0].json = PG.transport==='http' ? headersFor(m).join('\n')+'\n\n'+JSON.stringify(m,null,2) : m;
  e.frames.push({dir:sse?'server → client · 200 text/event-stream':'server → client · stdout',kind:'note',json:'(stream open — progress will arrive here)'});
  e.explain=['good','Long job started with `_meta.progressToken`. Progress notifications travel on this request’s own stream. Try **Cancel** while it runs.'];
  PG.log.unshift(e); PG.report={id:m.id,tok,step:0,entry:e,timer:null}; draw();
  const tick=()=>{ const R=PG.report; if(!R) return; R.step++;
    if(R.step<=3){ e.frames.push({dir:'server → client · notification',kind:'note',json:{jsonrpc:'2.0',method:'notifications/progress',params:{progressToken:tok,progress:R.step*25,total:100,message:['Collecting data…','Crunching numbers…','Formatting…'][R.step-1]}}});
      draw(); R.timer=setTimeout(tick,1400); return; }
    e.frames.push({dir:'server → client · result',kind:'res',json:{jsonrpc:'2.0',id:R.id,result:{resultType:'complete',content:[{type:'text',text:'Report ready: 3 sections, 12 charts.'}]}}});
    e.explain=['good','Done. Progress went 25 → 50 → 75 (it MUST increase) and stopped once the result was sent.'];
    PG.report=null; draw(); };
  PG.report.timer=setTimeout(tick,1200);
}
function cancelReport(){
  const R=PG.report; if(!R) return; clearTimeout(R.timer); const e=R.entry;
  if(PG.transport==='http'){ e.frames.push({dir:'client',kind:'http',json:'(client closes the SSE response stream)'});
    e.explain=['bad','Over HTTP, closing the stream **is** the cancellation. The server MUST treat the disconnect as cancellation and send nothing more for this request.']; }
  else { e.frames.push({dir:'client → server · notification',kind:'note',json:{jsonrpc:'2.0',method:'notifications/cancelled',params:{requestId:R.id,reason:'User clicked cancel'}}});
    e.explain=['bad','On stdio the client MUST send `notifications/cancelled` with the request id. The server SHOULD stop and MUST NOT send further messages for it.']; }
  PG.report=null; draw();
}
function answerFlight(action){
  const p=PG.pending; if(!p) return;
  const resp=action==='accept'?{action:'accept',content:{name:'Ada Lovelace'}}:{action};
  let st=p.state; if(PG.tamper) st=st.replace(/^./,'X');
  send(mkReq('tools/call',{...p.params,inputResponses:{passenger:resp},requestState:st}),'Retry book_flight ('+action+')');
  if(action!=='accept') PG.pending=null;
}
function serverChange(){
  if(!PG.listen) return; const e=PG.log.find(x=>x.listenId===PG.listen.id)||PG.log[0];
  const n={jsonrpc:'2.0',method:'notifications/tools/list_changed',params:{_meta:{'io.modelcontextprotocol/subscriptionId':PG.listen.id}}};
  PG.log.unshift({title:'Server changed its tool list',frames:[{dir:'server → client · notification (on the listen stream)',kind:'note',json:n}],
    explain:['good','Tagged with `subscriptionId`, so the client knows which subscription it belongs to. The client should re-fetch `tools/list` (and drop cached copies).']});
  draw();
}
function stopListen(){
  if(!PG.listen) return; const id=PG.listen.id; const fr=[];
  if(PG.transport==='http') fr.push({dir:'client',kind:'http',json:'(client closes the SSE stream)'});
  else fr.push({dir:'client → server · notification',kind:'note',json:{jsonrpc:'2.0',method:'notifications/cancelled',params:{requestId:id}}});
  PG.log.unshift({title:'Stop listening',frames:fr,explain:['good',PG.transport==='http'?'Closing the stream ends the subscription.':'On stdio the client sends `notifications/cancelled` with the listen id. Servers keep no subscription state, so after a reconnect you must listen again.']});
  PG.listen=null; draw();
}
const ACTIONS=[
  {id:'discover',label:'server/discover',small:'what do you support?',run:()=>send(mkReq('server/discover'),'server/discover')},
  {id:'toolsList',label:'tools/list',small:'list tools',run:()=>send(mkReq('tools/list'),'tools/list')},
  {id:'callWeather',label:'tools/call get_weather',small:'uses “location” below',run:()=>send(mkReq('tools/call',{name:'get_weather',arguments:{location:PG.loc}}),'tools/call get_weather')},
  {id:'callFlight',label:'tools/call book_flight',small:'needs the user (MRTR)',run:()=>{PG.pending=null;send(mkReq('tools/call',{name:'book_flight',arguments:{destination:'Tokyo'}}),'tools/call book_flight');}},
  {id:'callReport',label:'tools/call generate_report',small:'slow, with progress',run:()=>{ if(PG.report) return; send(mkReq('tools/call',{name:'generate_report',arguments:{}},{progressToken:'rep-'+PG.nextId}),'tools/call generate_report'); }},
  {id:'callUnknown',label:'tools/call invalid_tool',small:'tool that doesn’t exist',run:()=>send(mkReq('tools/call',{name:'invalid_tool',arguments:{}}),'tools/call invalid_tool')},
  {id:'resList',label:'resources/list',small:'list notes',run:()=>send(mkReq('resources/list'),'resources/list')},
  {id:'resTemplates',label:'resources/templates/list',small:'URI templates',run:()=>send(mkReq('resources/templates/list'),'resources/templates/list')},
  {id:'resRead',label:'resources/read',small:'uses “uri” below',run:()=>send(mkReq('resources/read',{uri:PG.uri}),'resources/read')},
  {id:'promptsList',label:'prompts/list',small:'list prompts',run:()=>send(mkReq('prompts/list'),'prompts/list')},
  {id:'promptsGet',label:'prompts/get summarize',small:'uses “topic” below',run:()=>send(mkReq('prompts/get',{name:'summarize',arguments:PG.topic?{topic:PG.topic}:{}}),'prompts/get summarize')},
  {id:'complete',label:'completion/complete',small:'autocomplete “topic”',run:()=>send(mkReq('completion/complete',{ref:{type:'ref/prompt',name:'summarize'},argument:{name:'topic',value:PG.topic}}),'completion/complete')},
  {id:'listen',label:'subscriptions/listen',small:'tools list changes',run:()=>{ if(PG.listen) return; send(mkReq('subscriptions/listen',{notifications:{toolsListChanged:true}}),'subscriptions/listen'); }},
  {id:'typo',label:'tools/lst',small:'a typo’d method',run:()=>send(mkReq('tools/lst'),'tools/lst (typo)')},
  {id:'initialize',label:'initialize (legacy)',small:'old handshake',wide:true,run:()=>{ const m={jsonrpc:'2.0',id:PG.nextId++,method:'initialize',params:{protocolVersion:'2025-11-25',capabilities:{},clientInfo:{name:'OldClient',version:'0.9'}}}; send(m,'initialize (legacy client)'); }},
];

/* ---------- rendering ---------- */
let root=null;
function draw(){
  if(!root||!document.body.contains(root)) return;
  const hl=PG.highlight;
  const actBtn=a=>`<button class="act ${a.wide?'wide':''} ${hl===a.id?'pulse':''}" data-a="${a.id}">${a.label}<small>${a.small}</small></button>`;
  root.innerHTML=`
  <div class="card">
    <h2>Client settings</h2><p class="lead">You are the client. Change a setting, press a button, read what the server says — and why.</p>
    <fieldset><legend>CONNECTION</legend>
      <label class="row">Transport <select id="pg-tr"><option value="http">Streamable HTTP</option><option value="stdio">stdio</option></select></label>
      <label class="row">protocolVersion <select id="pg-ver"><option>2026-07-28</option><option>2025-11-25</option><option>1900-01-01</option></select></label>
      <label class="row"><input type="checkbox" id="pg-meta"> send required <code>_meta</code></label>
      <label class="row"><input type="checkbox" id="pg-el"> declare <code>elicitation</code> capability</label>
      <label class="row"><input type="checkbox" id="pg-mm" ${PG.transport!=='http'?'disabled':''}> header mismatch (HTTP)</label>
      <label class="row"><input type="checkbox" id="pg-tp"> tamper with <code>requestState</code></label>
    </fieldset>
    <fieldset><legend>ARGUMENTS</legend>
      <label class="row" style="display:block">location<input type="text" id="pg-loc" value="${esc(PG.loc)}"></label>
      <label class="row" style="display:block">uri<input type="text" id="pg-uri" value="${esc(PG.uri)}"></label>
      <label class="row" style="display:block">topic<input type="text" id="pg-topic" value="${esc(PG.topic)}"></label>
    </fieldset>
    <fieldset><legend>SEND</legend><div class="acts">${ACTIONS.map(actBtn).join('')}</div></fieldset>
    <fieldset><legend>FOLLOW-UPS</legend><div class="acts">
      <button class="act" data-x="accept" ${PG.pending?'':'disabled'}>Answer &amp; retry<small>accept the form</small></button>
      <button class="act" data-x="decline" ${PG.pending?'':'disabled'}>Decline<small>retry with decline</small></button>
      <button class="act" data-x="cancel" ${PG.report?'':'disabled'}>Cancel report<small>${PG.transport==='http'?'close the stream':'send notifications/cancelled'}</small></button>
      <button class="act" data-x="change" ${PG.listen?'':'disabled'}>Server: change tool list<small>notify the listener</small></button>
      <button class="act wide" data-x="stop" ${PG.listen?'':'disabled'}>Stop listening<small>end the subscription</small></button>
    </div></fieldset>
    <button class="nbtn" id="pg-reset" style="width:100%;text-align:center;box-sizing:border-box">Reset playground</button>
  </div>
  <div class="card"><h2>Wire log <span style="font-weight:400;color:var(--muted);font-size:12px">(newest first)</span></h2>
    <div class="log">${PG.log.length?PG.log.map(e=>`<div class="entry"><div style="font-weight:800;margin-bottom:6px">${esc(e.title)}</div>
      ${e.explain?`<div class="explain ${e.explain[0]}" style="margin:0 0 10px">${md(e.explain[1])}</div>`:''}
      ${e.frames.map(f=>`<div class="msg"><div class="msghd"><span class="dirchip ${f.kind}">${esc(f.dir)}</span></div><pre class="json">${hlJSON(f.json)}</pre></div>`).join('')}</div>`).join(''):'<div class="empty">Nothing sent yet. Start with <b>server/discover</b>.</div>'}</div></div>`;
  const $$=s=>root.querySelector(s);
  $$('#pg-tr').value=PG.transport; $$('#pg-ver').value=PG.version; $$('#pg-meta').checked=PG.meta; $$('#pg-el').checked=PG.elicit; $$('#pg-mm').checked=PG.mismatch&&PG.transport==='http'; $$('#pg-tp').checked=PG.tamper;
  $$('#pg-tr').onchange=e=>{PG.transport=e.target.value; if(PG.transport!=='http') PG.mismatch=false; draw();};
  $$('#pg-ver').onchange=e=>{PG.version=e.target.value;};
  $$('#pg-meta').onchange=e=>{PG.meta=e.target.checked;};
  $$('#pg-el').onchange=e=>{PG.elicit=e.target.checked;};
  $$('#pg-mm').onchange=e=>{PG.mismatch=e.target.checked;};
  $$('#pg-tp').onchange=e=>{PG.tamper=e.target.checked;};
  $$('#pg-loc').oninput=e=>{PG.loc=e.target.value;}; $$('#pg-uri').oninput=e=>{PG.uri=e.target.value;}; $$('#pg-topic').oninput=e=>{PG.topic=e.target.value;};
  root.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{ if(PG.highlight===b.dataset.a) PG.highlight=null; ACTIONS.find(a=>a.id===b.dataset.a).run(); });
  root.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>{ const x=b.dataset.x;
    if(x==='accept'||x==='decline') answerFlight(x); else if(x==='cancel') cancelReport(); else if(x==='change') serverChange(); else if(x==='stop') stopListen(); });
  if(window.markAll) markAll();
  $$('#pg-reset').onclick=()=>{ if(PG.report) clearTimeout(PG.report.timer); Object.assign(PG,{log:[],pending:null,listen:null,report:null,nextId:1,highlight:null}); draw(); };
}
window.PLAYGROUND={
  render(el){ root=el; draw(); },
  preset(p){ if(PG.report){ clearTimeout(PG.report.timer); PG.report=null; }
    Object.assign(PG,{transport:'http',version:'2026-07-28',meta:true,elicit:false,mismatch:false,tamper:false,loc:'Paris',highlight:null},p);
    if('highlight' in p) PG.highlight=p.highlight; draw(); },
};
})();
