/* Cheatsheet + missions intro (spec 2026-07-28) */
COURSE.missionsIntro = 'Each mission opens the **Playground** with the right settings and highlights the button to press. Before you press it, say what you expect to come back.';

COURSE.cheat.push(
  {title:'Client → server requests', head:['Method','Purpose'], rows:[
    ['server/discover','versions, capabilities, instructions, serverInfo (MUST implement)'],
    ['tools/list','list tools (paginated, cacheable)'],
    ['tools/call','run a tool (may return input_required)'],
    ['resources/list','list resources'],
    ['resources/templates/list','list URI templates'],
    ['resources/read','read a resource (may return input_required)'],
    ['prompts/list','list prompts'],
    ['prompts/get','render a prompt (may return input_required)'],
    ['completion/complete','autocomplete an argument'],
    ['subscriptions/listen','long-lived stream of change notifications'],
  ]},
  {title:'Notifications', head:['Method','Direction / use'], rows:[
    ['notifications/cancelled','client → server on stdio; server only to end a listen stream'],
    ['notifications/progress','server → client, for a progressToken'],
    ['notifications/message','server → client log line (deprecated logging)'],
    ['notifications/subscriptions/acknowledged','first message on a subscription'],
    ['notifications/tools/list_changed','via listen (toolsListChanged)'],
    ['notifications/prompts/list_changed','via listen (promptsListChanged)'],
    ['notifications/resources/list_changed','via listen (resourcesListChanged)'],
    ['notifications/resources/updated','via listen (resourceSubscriptions)'],
  ]},
  {title:'Error codes', head:['Code','Meaning'], rows:[
    ['-32700','parse error'],['-32600','invalid request'],['-32601','method not found / capability not advertised (HTTP 404)'],
    ['-32602','invalid params · unknown tool/prompt · resource not found · bad cursor · missing _meta'],['-32603','internal error'],
    ['-32020','HeaderMismatch (HTTP 400)'],['-32021','MissingRequiredClientCapability · data.requiredCapabilities'],
    ['-32022','UnsupportedProtocolVersion · data.supported, data.requested'],['-32002','retired: old "resource not found" (accept, don’t send)'],
  ]},
  {title:'Required _meta keys', head:['Key','Rule'], rows:[
    ['io.modelcontextprotocol/protocolVersion','required on every request'],
    ['io.modelcontextprotocol/clientCapabilities','required on every request'],
    ['io.modelcontextprotocol/clientInfo','SHOULD send; self-reported'],
    ['io.modelcontextprotocol/serverInfo','in result _meta; SHOULD send'],
    ['io.modelcontextprotocol/subscriptionId','MUST be on listen-stream notifications'],
    ['progressToken','opt into progress for a request'],
    ['traceparent / tracestate / baggage','OpenTelemetry trace context'],
  ]},
  {title:'Streamable HTTP headers', head:['Header','When'], rows:[
    ['MCP-Protocol-Version','every POST; equals _meta version'],
    ['Mcp-Method','every request'],
    ['Mcp-Name','tools/call, resources/read, prompts/get'],
    ['Mcp-Param-{name}','tool args marked x-mcp-header'],
    ['Accept','application/json, text/event-stream'],
    ['Authorization','Bearer token on every request (if using auth)'],
    ['Origin','server MUST validate → 403 if invalid'],
  ]},
  {title:'Capabilities', head:['Side','Keys'], rows:[
    ['server','tools{listChanged} · resources{subscribe,listChanged} · prompts{listChanged} · completions · logging (dep.) · extensions · experimental'],
    ['client','elicitation{form,url} · extensions · experimental · roots (dep.) · sampling{context,tools} (dep.)'],
  ]},
  {title:'resultType values', head:['Value','Meaning'], rows:[
    ['complete','final result (also assumed when missing)'],
    ['input_required','MRTR: inputRequests and/or requestState'],
    ['task','Tasks extension: a CreateTaskResult'],
  ]},
  {title:'Tool annotation defaults', head:['Hint','Default'], rows:[
    ['readOnlyHint','false'],['destructiveHint','true'],['idempotentHint','false'],['openWorldHint','true'],
  ]},
  {title:'Deprecated', head:['Feature','Since → use instead'], rows:[
    ['Roots','2026-07-28 → tool params / URIs / config'],['Sampling','2026-07-28 → call LLM APIs directly'],
    ['Logging','2026-07-28 → stderr or OpenTelemetry'],['Dynamic Client Registration','2026-07-28 → CIMD'],
    ['includeContext thisServer/allServers','2025-11-25 → omit or "none"'],['HTTP+SSE transport','2025-03-26 → Streamable HTTP'],
  ]},
  {title:'Versions', head:['Version','Headline'], rows:[
    ['2024-11-05','first release · stdio + HTTP with SSE'],
    ['2025-03-26','OAuth 2.1 · Streamable HTTP · batching · tool annotations'],
    ['2025-06-18','no batching · structured output · resource servers + RFC 8707 · elicitation · resource links'],
    ['2025-11-25','OIDC discovery · icons · URL elicitation · sampling tools · CIMD · experimental tasks'],
    ['2026-07-28','stateless · server/discover · MRTR · subscriptions/listen · caching · tasks → extension'],
  ]},
);
