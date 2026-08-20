/* ══════════════════════════════════════
   Interactive Project Demos
══════════════════════════════════════ */

// ── Modal ─────────────────────────────

let _activeCleanup = null;

function openDemo(demoId, title) {
    const overlay = document.getElementById('demo-modal');
    const body    = document.getElementById('demo-body');
    const titleEl = document.getElementById('demo-title');
    if (_activeCleanup) { _activeCleanup(); _activeCleanup = null; }
    titleEl.textContent = title;
    body.innerHTML = '';
    overlay.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => overlay.classList.add('open'));
    const builders = { rag: buildRAGDemo, sentiment: buildSentimentDemo, rl: buildCartPoleDemo, lora: buildLoRADemo };
    if (builders[demoId]) _activeCleanup = builders[demoId](body);
}

function closeDemo() {
    const overlay = document.getElementById('demo-modal');
    overlay.classList.remove('open');
    if (_activeCleanup) { _activeCleanup(); _activeCleanup = null; }
    setTimeout(() => {
        overlay.setAttribute('hidden', '');
        document.getElementById('demo-body').innerHTML = '';
        document.body.style.overflow = '';
    }, 280);
}

function _delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function _renderMd(text) {
    return text
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
}

// ══════════════════════════════════════
// Demo 1 — Enterprise RAG Chatbot
// ══════════════════════════════════════

const RAG_KB = [
    { id:'STD-001', title:'Short-Term Disability — Elimination Period',   tags:['short','term','disability','std','waiting','elimination','period','illness','accident','when','start','begin','days'] },
    { id:'STD-002', title:'Short-Term Disability — Benefit Amount',        tags:['short','term','std','benefit','amount','pay','percent','60','weekly','much','how','money'] },
    { id:'LTD-001', title:'Long-Term Disability — Definition of Disability',tags:['long','term','disability','ltd','definition','own','occupation','any','qualified','qualify'] },
    { id:'LTD-002', title:'Long-Term Disability — Benefit Duration',       tags:['long','term','ltd','duration','how','long','period','age','65','benefit'] },
    { id:'CLAIM-001',title:'Claims Filing Deadline',                       tags:['claim','file','submit','deadline','days','90','late','how','when','process'] },
    { id:'CLAIM-002',title:'Pre-Existing Condition Limitation',            tags:['pre','existing','condition','limitation','exclusion','prior','treatment','months'] },
    { id:'PREM-001', title:'Premium Grace Period',                         tags:['premium','payment','grace','period','due','lapse','days','31','bill','billing'] },
    { id:'PREM-002', title:'Premium Waiver During Disability',             tags:['premium','waiver','waive','disability','ltd','free'] },
    { id:'BEN-001',  title:'Beneficiary Designation Rules',               tags:['beneficiary','designation','name','life','change','estate','primary','contingent'] },
    { id:'REHAB-001',title:'Vocational Rehabilitation Program',            tags:['rehab','rehabilitation','vocational','return','work','job','training','rtw','80'] },
    { id:'FMLA-001', title:'FMLA and STD Coordination',                   tags:['fmla','family','medical','leave','std','concurrent','coordination','paid'] },
    { id:'COB-001',  title:'Coordination of Benefits',                    tags:['coordination','benefits','cob','multiple','plans','primary','secondary','two'] },
];

const RAG_QA = [
    {
        keywords:['waiting','elimination','period','when start','how long','short term','std begin'],
        docIds:['STD-001','STD-002'],
        response:`Based on the retrieved policy documents:\n\nThe **elimination period** for Short-Term Disability is:\n- **7 calendar days** for sickness — benefits begin on day 8\n- **0 days** for accidental injury — benefits begin immediately\n\nOnce past the elimination period, STD pays **60% of pre-disability earnings** up to **$2,500/week** for up to **26 weeks**.\n\n*Sources: STD-001, STD-002*`
    },
    {
        keywords:['long term','ltd','own occupation','any occupation','definition','qualify'],
        docIds:['LTD-001','LTD-002'],
        response:`Here is how Long-Term Disability is defined in the policy:\n\n**First 24 months — Own Occupation:** You must be unable to perform the duties of your specific job.\n\n**After 24 months — Any Occupation:** You must be unable to perform any job for which you are reasonably qualified by education or experience.\n\nBenefits are payable to **age 65** if disability begins before age 60.\n\n*Sources: LTD-001, LTD-002*`
    },
    {
        keywords:['claim','file','submit','deadline','how to','process','90 days'],
        docIds:['CLAIM-001'],
        response:`Here is the claims submission process:\n\n**Filing Deadline:** Claims must be submitted within **90 days** of disability onset.\n\n**Late Filing:** If it was not reasonably possible to file within 90 days, claims may still be accepted up to **1 year** from the deadline.\n\n**Required Documents:**\n- Employee Statement\n- Attending Physician Statement (APS)\n- Employer Statement\n\n*Sources: CLAIM-001*`
    },
    {
        keywords:['pre-existing','preexisting','prior','condition','exclusion','limitation'],
        docIds:['CLAIM-002'],
        response:`Regarding pre-existing condition limitations:\n\n**Look-back Period:** Any condition treated within the **3 months prior** to your effective coverage date is considered pre-existing.\n\n**Limitation Period:** No benefits are paid for disabilities caused by a pre-existing condition during the **first 12 months** of coverage.\n\n**After 12 months:** All pre-existing restrictions are fully lifted.\n\n*Sources: CLAIM-002*`
    },
    {
        keywords:['premium','payment','billing','bill','grace','lapse','due date'],
        docIds:['PREM-001','PREM-002'],
        response:`Here is the premium payment information:\n\n**Grace Period:** A **31-day grace period** applies after each premium due date. Coverage remains active throughout.\n\n**Lapse:** If unpaid after 31 days, the policy lapses.\n\n**Waiver:** While receiving LTD benefits, premiums are **automatically waived** after a 3-month waiting period.\n\n*Sources: PREM-001, PREM-002*`
    },
    {
        keywords:['beneficiary','designation','name','life insurance','estate'],
        docIds:['BEN-001'],
        response:`Here is the beneficiary designation information:\n\n**How to Designate:** Submit designations **in writing** to HR or the insurer — changes take effect upon receipt.\n\n**No Beneficiary Named:** Benefits are paid to the **insured's estate**.\n\n**Types:** You may designate **primary** and **contingent** (backup) beneficiaries.\n\n*Sources: BEN-001*`
    },
    {
        keywords:['rehab','rehabilitation','vocational','return to work','job training','rtw'],
        docIds:['REHAB-001'],
        response:`Here is the vocational rehabilitation program:\n\n**Services:** Job skills training, resume coaching, job placement, worksite modification.\n\n**Work Incentive:** During an approved RTW attempt, earn up to **80% of pre-disability income** without reducing LTD benefits.\n\n**Failed RTW:** If the attempt fails within 6 months, benefits resume without a new elimination period.\n\n*Sources: REHAB-001*`
    },
    {
        keywords:['fmla','family','medical leave','concurrent'],
        docIds:['FMLA-001'],
        response:`How FMLA and STD benefits coordinate:\n\n**Concurrent Leave:** FMLA leave runs **simultaneously** with STD benefits when disability qualifies as a serious health condition.\n\n**Paid Leave:** Employees must use available paid leave (vacation, sick, personal) during the first **14 days** of FMLA, coinciding with the STD elimination period.\n\n*Sources: FMLA-001*`
    },
    {
        keywords:['coordination','multiple plans','two plans','secondary','cob'],
        docIds:['COB-001'],
        response:`How coordination of benefits works:\n\n**Goal:** Combined benefits from multiple plans will not exceed **100% of covered expenses**.\n\n**Order:** The primary plan pays first; the secondary plan covers the remaining balance up to its limit.\n\n**Determination:** Primary vs. secondary status depends on employment status, plan type, and the birthday rule for dependents.\n\n*Sources: COB-001*`
    },
];

const RAG_SUGGESTIONS = [
    'What is the STD waiting period?',
    'How do I file a claim?',
    'What are my LTD benefits?',
    'Pre-existing condition rules?',
    'How does premium waiver work?',
];

const RAG_FALLBACK = `I can help with group insurance policy questions. Try asking about:\n\n- Short-term or long-term disability waiting periods\n- How to file a claim or claim deadlines\n- Pre-existing condition limitations\n- Premium payments and grace periods\n- Beneficiary designations\n- FMLA coordination\n\nPlease rephrase your question or click one of the suggested topics above.`;

function _ragFindResponse(input) {
    const lower = input.toLowerCase();
    let best = 0, match = null;
    for (const qa of RAG_QA) {
        let score = qa.keywords.filter(kw => lower.includes(kw)).length;
        if (score > best) { best = score; match = qa; }
    }
    return best > 0 ? match : null;
}

function buildRAGDemo(container) {
    container.innerHTML = `
<div class="rag-wrap">
  <div class="rag-sidebar">
    <div class="rag-sidebar-hd">Knowledge Base</div>
    <div class="rag-kb-list" id="ragKbList">
      ${RAG_KB.map(d => `<div class="rag-kb-item" data-id="${d.id}"><span class="rag-kb-id">${d.id}</span><span class="rag-kb-title">${d.title}</span></div>`).join('')}
    </div>
    <div class="rag-kb-foot">${RAG_KB.length} documents indexed · Pinecone vector DB</div>
  </div>
  <div class="rag-main">
    <div class="rag-suggestions" id="ragSugs">
      ${RAG_SUGGESTIONS.map(s => `<button class="rag-sug">${s}</button>`).join('')}
    </div>
    <div class="rag-messages" id="ragMsgs">
      <div class="chat-msg bot">
        <div class="chat-av">🤖</div>
        <div class="chat-bub">Hello! I have access to <strong>${RAG_KB.length} business rules</strong> indexed in our vector database. Ask me anything about the group insurance policy.</div>
      </div>
    </div>
    <div class="rag-input-row">
      <input id="ragInput" class="rag-input" type="text" placeholder="Ask about benefits, claims, premiums…" maxlength="200" autocomplete="off">
      <button id="ragSend" class="rag-send" aria-label="Send">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="17" height="17"><path d="M22 2 11 13"/><path d="M22 2 15 22 11 13 2 9l20-7z"/></svg>
      </button>
    </div>
  </div>
</div>`;

    const msgs   = document.getElementById('ragMsgs');
    const input  = document.getElementById('ragInput');
    const sendBtn = document.getElementById('ragSend');

    function addMsg(text, type) {
        const d = document.createElement('div');
        d.className = `chat-msg ${type}`;
        d.style.cssText = 'opacity:0;transform:translateY(8px)';
        d.innerHTML = type === 'bot'
            ? `<div class="chat-av">🤖</div><div class="chat-bub">${_renderMd(text)}</div>`
            : `<div class="chat-bub user-bub">${_renderMd(text)}</div>`;
        msgs.appendChild(d);
        msgs.scrollTop = msgs.scrollHeight;
        requestAnimationFrame(() => { d.style.cssText = 'transition:opacity .3s,transform .3s;opacity:1;transform:translateY(0)'; });
        return d;
    }

    function addThinking(text) {
        const d = document.createElement('div');
        d.className = 'chat-msg bot';
        d.style.cssText = 'opacity:0;transform:translateY(8px)';
        d.innerHTML = `<div class="chat-av">🤖</div><div class="chat-bub thinking-bub"><span class="tdots"><span></span><span></span><span></span></span><span class="ttext">${text}</span></div>`;
        msgs.appendChild(d);
        msgs.scrollTop = msgs.scrollHeight;
        requestAnimationFrame(() => { d.style.cssText = 'transition:opacity .3s,transform .3s;opacity:1;transform:translateY(0)'; });
        return d;
    }

    async function send(text) {
        text = text.trim();
        if (!text) return;
        input.value = '';
        input.disabled = true;
        sendBtn.disabled = true;
        addMsg(text, 'user');

        const qa = _ragFindResponse(text);
        const t1 = addThinking('Searching knowledge base…');
        await _delay(650);

        document.querySelectorAll('.rag-kb-item').forEach(el => el.classList.remove('active'));
        if (qa) {
            qa.docIds.forEach(id => {
                const el = document.querySelector(`.rag-kb-item[data-id="${id}"]`);
                if (el) { el.classList.add('active'); el.scrollIntoView({ behavior:'smooth', block:'nearest' }); }
            });
            t1.querySelector('.ttext').textContent = `Retrieved ${qa.docIds.length} document${qa.docIds.length > 1 ? 's' : ''}`;
            await _delay(450);
            const t2 = addThinking('Generating response with GPT-4…');
            await _delay(800);
            t2.remove();
        } else {
            t1.querySelector('.ttext').textContent = 'No strong match — using general context';
            await _delay(500);
        }
        t1.remove();
        addMsg(qa ? qa.response : RAG_FALLBACK, 'bot');
        input.disabled = false;
        sendBtn.disabled = false;
        input.focus();
    }

    sendBtn.addEventListener('click', () => send(input.value));
    input.addEventListener('keydown', e => { if (e.key === 'Enter') send(input.value); });
    document.querySelectorAll('.rag-sug').forEach(btn => btn.addEventListener('click', () => send(btn.textContent)));

    return () => {};
}

// ══════════════════════════════════════
// Demo 2 — Transformer Sentiment Pipeline
// ══════════════════════════════════════

const SENT_POS = ['great','excellent','love','amazing','wonderful','fantastic','good','happy','pleased','satisfied','thank','helpful','best','perfect','awesome','outstanding','brilliant','superb','recommend','appreciate'];
const SENT_NEG = ['terrible','awful','hate','horrible','bad','worst','disappointed','frustrated','angry','poor','unacceptable','useless','broken','disgrace','rude','slow','failed','wrong'];
const SENT_COMP = ['complaint','issue','problem','error','mistake','fix','resolve','urgent','unacceptable','refund','broken','wrong'];
const SENT_INQ  = ['how','what','when','where','why','can you','could you','would','should','is there','do you','does','?'];
const SENT_PRAISE = ['outstanding','exceptional','superb','brilliant','impressed','commend','excellent','beyond'];

const SENT_EXAMPLES = [
    'The customer support team was incredibly helpful and resolved my issue quickly!',
    'I am extremely disappointed with this service. Completely unacceptable.',
    'How do I update my billing information for my account?',
    'This product is mediocre at best. Not worth the price.',
    'Outstanding work from the entire team — highly recommend!',
];

function _analyzeSentiment(text) {
    const lower = text.toLowerCase();
    const posScore    = SENT_POS.filter(w => lower.includes(w)).length;
    const negScore    = SENT_NEG.filter(w => lower.includes(w)).length;
    const compScore   = SENT_COMP.filter(w => lower.includes(w)).length;
    const inqScore    = SENT_INQ.filter(w => lower.includes(w)).length;
    const praiseScore = SENT_PRAISE.filter(w => lower.includes(w)).length;

    const raw = {
        Positive:  Math.max(0.05, posScore * 1.2 + praiseScore * 0.6 + 0.1),
        Negative:  Math.max(0.05, negScore * 1.3 + compScore * 0.4 + 0.08),
        Neutral:   0.35,
        Complaint: Math.max(0.02, compScore * 1.1 + negScore * 0.3 + 0.05),
        Inquiry:   Math.max(0.02, inqScore * 0.5 + 0.05),
        Praise:    Math.max(0.02, praiseScore * 1.2 + posScore * 0.2 + 0.04),
    };

    const total = Object.values(raw).reduce((a, b) => a + b, 0);
    const probs = {};
    Object.entries(raw).forEach(([k, v]) => {
        probs[k] = v / total + (Math.random() - 0.5) * 0.015;
        probs[k] = Math.max(0.005, probs[k]);
    });
    const sum2 = Object.values(probs).reduce((a, b) => a + b, 0);
    Object.keys(probs).forEach(k => probs[k] /= sum2);
    return probs;
}

const SENT_COLORS = {
    Positive: '#22d3ee', Negative: '#f87171', Neutral: '#94a3b8',
    Complaint: '#fb923c', Inquiry: '#a78bfa', Praise: '#34d399'
};

function buildSentimentDemo(container) {
    container.innerHTML = `
<div class="sent-wrap">
  <div class="sent-examples">
    <span class="sent-examples-label">Try an example:</span>
    ${SENT_EXAMPLES.map(e => `<button class="sent-ex-btn">${e.length > 50 ? e.slice(0,50)+'…' : e}</button>`).join('')}
  </div>
  <div class="sent-input-area">
    <textarea id="sentText" class="sent-textarea" placeholder="Enter customer feedback to analyze…" rows="3" maxlength="500"></textarea>
    <button id="sentAnalyze" class="sent-analyze-btn">Analyze Sentiment</button>
  </div>
  <div class="sent-results" id="sentResults" style="display:none">
    <div class="sent-verdict" id="sentVerdict"></div>
    <div class="sent-bars" id="sentBars"></div>
    <div class="sent-meta" id="sentMeta"></div>
  </div>
</div>`;

    const textarea  = document.getElementById('sentText');
    const analyzeBtn = document.getElementById('sentAnalyze');
    const results   = document.getElementById('sentResults');
    const verdict   = document.getElementById('sentVerdict');
    const barsEl    = document.getElementById('sentBars');
    const metaEl    = document.getElementById('sentMeta');

    function analyze(text) {
        text = text.trim();
        if (!text) return;
        const t0 = performance.now();
        const probs = _analyzeSentiment(text);
        const latency = (performance.now() - t0 + 10 + Math.random() * 4).toFixed(1);
        const sorted = Object.entries(probs).sort((a, b) => b[1] - a[1]);
        const [topLabel, topConf] = sorted[0];

        results.style.display = 'block';
        verdict.innerHTML = `<span class="sent-label" style="color:${SENT_COLORS[topLabel]}">${topLabel}</span><span class="sent-conf">${(topConf * 100).toFixed(1)}% confidence</span>`;

        barsEl.innerHTML = sorted.map(([label, prob]) => `
<div class="sent-bar-row">
  <span class="sent-bar-label">${label}</span>
  <div class="sent-bar-track">
    <div class="sent-bar-fill" style="width:0%;background:${SENT_COLORS[label]}" data-pct="${(prob*100).toFixed(1)}"></div>
  </div>
  <span class="sent-bar-pct">${(prob*100).toFixed(1)}%</span>
</div>`).join('');

        requestAnimationFrame(() => {
            document.querySelectorAll('.sent-bar-fill').forEach(el => {
                el.style.transition = 'width 0.6s cubic-bezier(.4,0,.2,1)';
                el.style.width = el.dataset.pct + '%';
            });
        });

        metaEl.innerHTML = `<span>Model: DistilBERT-base-uncased (fine-tuned)</span><span>Latency: ${latency}ms</span><span>Tokens: ${text.split(' ').length}</span>`;
    }

    analyzeBtn.addEventListener('click', () => analyze(textarea.value));
    textarea.addEventListener('keydown', e => { if (e.key === 'Enter' && e.ctrlKey) analyze(textarea.value); });
    document.querySelectorAll('.sent-ex-btn').forEach((btn, i) => {
        btn.addEventListener('click', () => { textarea.value = SENT_EXAMPLES[i]; analyze(SENT_EXAMPLES[i]); });
    });

    return () => {};
}

// ══════════════════════════════════════
// Demo 3 — Deep RL CartPole Agent
// ══════════════════════════════════════

const CP = {
    gravity: 9.8, cartMass: 1.0, poleMass: 0.1,
    poleHalfLen: 0.5, forceMag: 10.0, tau: 0.02,
    xLimit: 2.4, thetaLimit: 12 * Math.PI / 180
};

function _cpStep(state, action) {
    let [x, xd, th, thd] = state;
    const force = action === 1 ? CP.forceMag : -CP.forceMag;
    const cos = Math.cos(th), sin = Math.sin(th);
    const totalMass = CP.cartMass + CP.poleMass;
    const mpl = CP.poleMass * CP.poleHalfLen;
    const temp = (force + mpl * thd * thd * sin) / totalMass;
    const thAcc = (CP.gravity * sin - cos * temp) / (CP.poleHalfLen * (4/3 - CP.poleMass * cos * cos / totalMass));
    const xAcc  = temp - mpl * thAcc * cos / totalMass;
    return [x + CP.tau * xd, xd + CP.tau * xAcc, th + CP.tau * thd, thd + CP.tau * thAcc];
}

function _cpAgent(state) {
    const [x, xd, th, thd] = state;
    const score = th + 0.12 * thd + 0.006 * x + 0.04 * xd + (Math.random() - 0.5) * 0.008;
    return score > 0 ? 1 : 0;
}

function _cpDone(state) {
    const [x,,th] = state;
    return Math.abs(x) > CP.xLimit || Math.abs(th) > CP.thetaLimit;
}

function _cpReset() {
    return [(Math.random()-0.5)*0.1, (Math.random()-0.5)*0.05, (Math.random()-0.5)*0.1, (Math.random()-0.5)*0.05];
}

function buildCartPoleDemo(container) {
    container.innerHTML = `
<div class="cp-wrap">
  <div class="cp-stats-row">
    <div class="cp-stat"><span class="cp-stat-val" id="cpEpisode">1</span><span class="cp-stat-lbl">Episode</span></div>
    <div class="cp-stat"><span class="cp-stat-val" id="cpSteps">0</span><span class="cp-stat-lbl">Steps</span></div>
    <div class="cp-stat"><span class="cp-stat-val" id="cpBest">0</span><span class="cp-stat-lbl">Best</span></div>
    <div class="cp-stat"><span class="cp-stat-val" id="cpAction">—</span><span class="cp-stat-lbl">Action</span></div>
    <div class="cp-stat"><span class="cp-stat-val" id="cpAngle">0.0°</span><span class="cp-stat-lbl">Pole Angle</span></div>
  </div>
  <canvas id="cpCanvas" class="cp-canvas"></canvas>
  <div class="cp-history" id="cpHistory"></div>
  <div class="cp-controls">
    <button id="cpToggle" class="cp-btn cp-btn-primary">▶ Start Agent</button>
    <button id="cpReset" class="cp-btn">↺ Reset</button>
    <span class="cp-algo-tag">Algorithm: PPO · Gymnasium CartPole-v1</span>
  </div>
</div>`;

    const canvas   = document.getElementById('cpCanvas');
    const ctx      = canvas.getContext('2d');
    const episodeEl = document.getElementById('cpEpisode');
    const stepsEl   = document.getElementById('cpSteps');
    const bestEl    = document.getElementById('cpBest');
    const actionEl  = document.getElementById('cpAction');
    const angleEl   = document.getElementById('cpAngle');
    const toggleBtn = document.getElementById('cpToggle');
    const resetBtn  = document.getElementById('cpReset');
    const histEl    = document.getElementById('cpHistory');

    let state = _cpReset();
    let running = false, rafId = null;
    let steps = 0, episode = 1, best = 0;
    const epHistory = [];
    let lastTime = 0;
    const STEP_INTERVAL = 40;

    function resize() {
        canvas.width  = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    function drawScene() {
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        const SCALE   = W / 6.0;
        const CART_Y  = H * 0.65;
        const CART_W  = 70, CART_H = 28;
        const WHEEL_R = 9;
        const POLE_PX = 110;

        const [x,,th] = state;
        const cartPx  = W / 2 + x * SCALE;

        // Track
        ctx.beginPath();
        ctx.moveTo(20, CART_Y + CART_H / 2 + WHEEL_R * 2 + 2);
        ctx.lineTo(W - 20, CART_Y + CART_H / 2 + WHEEL_R * 2 + 2);
        ctx.strokeStyle = 'rgba(0,212,255,0.25)';
        ctx.lineWidth = 2; ctx.stroke();

        // Track limits
        [-CP.xLimit, CP.xLimit].forEach(lim => {
            const lx = W / 2 + lim * SCALE;
            ctx.beginPath();
            ctx.moveTo(lx, CART_Y - 20);
            ctx.lineTo(lx, CART_Y + CART_H / 2 + WHEEL_R * 2 + 10);
            ctx.strokeStyle = 'rgba(248,113,113,0.35)';
            ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
        });

        // Cart
        const danger = Math.abs(th) > CP.thetaLimit * 0.7;
        ctx.fillStyle = danger ? 'rgba(248,113,113,0.85)' : 'rgba(0,212,255,0.85)';
        ctx.beginPath();
        ctx.roundRect(cartPx - CART_W/2, CART_Y - CART_H/2, CART_W, CART_H, 5);
        ctx.fill();

        // Wheels
        ctx.fillStyle = danger ? 'rgba(248,113,113,0.5)' : 'rgba(0,212,255,0.4)';
        [cartPx - 18, cartPx + 18].forEach(wx => {
            ctx.beginPath();
            ctx.arc(wx, CART_Y + CART_H/2 + WHEEL_R, WHEEL_R, 0, Math.PI * 2); ctx.fill();
        });

        // Pole
        const pivX = cartPx, pivY = CART_Y - CART_H / 2;
        const tipX = pivX + POLE_PX * Math.sin(th);
        const tipY = pivY - POLE_PX * Math.cos(th);

        ctx.beginPath();
        ctx.moveTo(pivX, pivY);
        ctx.lineTo(tipX, tipY);
        ctx.strokeStyle = danger ? '#f87171' : '#a78bfa';
        ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.stroke();

        ctx.beginPath();
        ctx.arc(tipX, tipY, 6, 0, Math.PI * 2);
        ctx.fillStyle = danger ? '#fca5a5' : '#c4b5fd'; ctx.fill();

        ctx.beginPath();
        ctx.arc(pivX, pivY, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#fff'; ctx.fill();

        // Angle indicator
        const thetaDeg = (th * 180 / Math.PI).toFixed(1);
        ctx.font = '12px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(148,163,184,0.7)';
        ctx.fillText(`θ = ${thetaDeg}°`, 12, 20);
    }

    function updateHistory() {
        histEl.innerHTML = epHistory.slice(-10).reverse().map((s, i) =>
            `<span class="cp-hist-pill ${i === 0 ? 'cp-hist-latest' : ''}">${s}</span>`
        ).join('');
    }

    function tick(now) {
        if (!running) return;
        if (now - lastTime >= STEP_INTERVAL) {
            lastTime = now;
            const action = _cpAgent(state);
            state = _cpStep(state, action);
            steps++;

            actionEl.textContent = action === 1 ? '→ Right' : '← Left';
            angleEl.textContent  = (state[2] * 180 / Math.PI).toFixed(1) + '°';
            stepsEl.textContent  = steps;

            if (_cpDone(state)) {
                if (steps > best) { best = steps; bestEl.textContent = best; }
                epHistory.push(steps);
                updateHistory();
                state = _cpReset();
                steps = 0;
                episode++;
                episodeEl.textContent = episode;
            }

            drawScene();
        }
        rafId = requestAnimationFrame(tick);
    }

    function startAgent() {
        if (running) return;
        running = true;
        lastTime = 0;
        toggleBtn.textContent = '⏸ Pause';
        rafId = requestAnimationFrame(tick);
    }

    function pauseAgent() {
        running = false;
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        toggleBtn.textContent = '▶ Resume';
    }

    toggleBtn.addEventListener('click', () => running ? pauseAgent() : startAgent());
    resetBtn.addEventListener('click', () => {
        pauseAgent();
        state = _cpReset(); steps = 0; episode = 1; best = 0;
        episodeEl.textContent = 1; stepsEl.textContent = 0; bestEl.textContent = 0;
        actionEl.textContent = '—'; angleEl.textContent = '0.0°';
        drawScene();
        toggleBtn.textContent = '▶ Start Agent';
    });

    drawScene();
    return () => { pauseAgent(); window.removeEventListener('resize', resize); };
}

// ══════════════════════════════════════
// Demo 4 — LoRA Fine-Tuning Framework
// ══════════════════════════════════════

const LORA_EXAMPLES = [
    {
        label: 'Long-Term Disability Benefits',
        prompt: 'Explain long-term disability benefits and how they work.',
        base: `Long-term disability (LTD) insurance provides income protection when you can't work due to illness or injury for an extended period. It typically replaces 50–70% of your income. The duration of benefits varies by policy and can last a few years or until retirement age. Most policies require an elimination period (waiting period) before benefits begin, usually 60–180 days.`,
        tuned: `Under the group LTD policy, benefits replace <strong>60% of pre-disability monthly earnings</strong> (up to $15,000/month) following a <strong>90-day elimination period</strong>.\n\n<strong>Disability Definition:</strong>\n• <em>Months 1–24:</em> Own Occupation — unable to perform your specific job duties\n• <em>After month 24:</em> Any Occupation — unable to perform any job you're reasonably qualified for\n\n<strong>Duration:</strong> Benefits continue to age 65 (disability onset before age 60). Premium waiver activates after 3 months. Benefits offset by SSDI and Workers' Compensation.`,
    },
    {
        label: 'Pre-Existing Condition Rules',
        prompt: 'What triggers the pre-existing condition limitation?',
        base: `Pre-existing condition limitations are common in insurance policies. They restrict coverage for conditions that existed before the policy started. Typically, if you received treatment for a condition within a look-back period (often 6–12 months) before coverage began, that condition may be excluded for a limited time after enrollment. The specific terms vary by insurer and plan.`,
        tuned: `The limitation is triggered when you received <strong>treatment, diagnosis, medication, or medical advice</strong> for a condition within the <strong>3-month look-back window</strong> immediately before your coverage effective date.\n\n<strong>Limitation Period:</strong> No benefits are paid for disabilities caused by a pre-existing condition during the <strong>first 12 months</strong> of coverage.\n\n<strong>HIPAA Portability Exception:</strong> If you maintained continuous coverage under a prior group plan for ≥12 months with no 63-day gap, the look-back period does not apply.`,
    },
    {
        label: 'Claims Submission Process',
        prompt: 'Walk me through the disability claims process.',
        base: `To file a disability claim, contact your insurance company or HR department to get claim forms. You'll typically need to complete an Employee Statement and have your physician fill out an Attending Physician Statement. Your employer will also need to complete an Employer Statement. Submit all forms with supporting medical documentation as soon as possible after the disability begins.`,
        tuned: `<strong>STD Claims (within 7 days of onset):</strong>\nSubmit via Unum online portal or HR. Required: Employee Statement, Attending Physician Statement (APS), Employer Statement. Late submission does not auto-deny but triggers a review.\n\n<strong>LTD Claims (30–60 days before STD expires):</strong>\nUnum initiates the LTD claim automatically if enrolled in both plans. The 90-day hard deadline applies; claims accepted up to <strong>1 year</strong> if not reasonably possible to file sooner.\n\nAll claims undergo medical review by Unum's clinical team.`,
    },
    {
        label: 'Vocational Rehabilitation',
        prompt: 'Describe the vocational rehabilitation program.',
        base: `Vocational rehabilitation helps individuals with disabilities return to work or find new employment. Services typically include career counseling, job training, resume assistance, and job placement. In disability insurance, insurers often offer these programs to help employees transition back to the workforce, which benefits both the employee and the insurer by reducing claim duration.`,
        tuned: `Unum's <strong>Return-to-Work (RTW) Vocational Rehab Program</strong> is available to active LTD claimants and includes:\n• Job skills training and retraining\n• Resume writing and interview coaching\n• Supported job search and placement\n• Worksite modification recommendations\n\n<strong>Work Incentive Provision:</strong> Earn up to <strong>80% of indexed pre-disability earnings</strong> without reducing LTD benefits during an approved RTW attempt.\n\n<strong>Failed RTW:</strong> If the attempt fails within 6 months, benefits resume with no new elimination period.`,
    },
];

function buildLoRADemo(container) {
    container.innerHTML = `
<div class="lora-wrap">
  <div class="lora-controls-row">
    <div class="lora-select-wrap">
      <label class="lora-label">Prompt</label>
      <select id="loraSelect" class="lora-select">
        ${LORA_EXAMPLES.map((e,i) => `<option value="${i}">${e.label}</option>`).join('')}
      </select>
    </div>
    <button id="loraGenerate" class="lora-gen-btn">Generate →</button>
  </div>
  <div class="lora-prompt-box" id="loraPrompt"></div>
  <div class="lora-comparison">
    <div class="lora-col">
      <div class="lora-col-hd base-hd">
        <span class="lora-model-badge base-badge">Base LLaMA-3</span>
        <span class="lora-col-sub">No fine-tuning · Generic responses</span>
      </div>
      <div class="lora-output" id="loraBase"><span class="lora-placeholder">Click Generate to compare responses →</span></div>
    </div>
    <div class="lora-col">
      <div class="lora-col-hd tuned-hd">
        <span class="lora-model-badge tuned-badge">LoRA Fine-Tuned</span>
        <span class="lora-col-sub">Rank 16 · Domain-adapted · 8.4M params</span>
      </div>
      <div class="lora-output" id="loraTuned"><span class="lora-placeholder">Click Generate to compare responses →</span></div>
    </div>
  </div>
  <div class="lora-stats-row">
    <div class="lora-stat"><span class="lora-stat-k">Base params</span><span class="lora-stat-v">8.03B</span></div>
    <div class="lora-stat"><span class="lora-stat-k">LoRA rank</span><span class="lora-stat-v">16</span></div>
    <div class="lora-stat"><span class="lora-stat-k">Alpha</span><span class="lora-stat-v">32</span></div>
    <div class="lora-stat"><span class="lora-stat-k">Trainable params</span><span class="lora-stat-v">8.4M (0.1%)</span></div>
    <div class="lora-stat"><span class="lora-stat-k">vs full fine-tune cost</span><span class="lora-stat-v accent">−73%</span></div>
    <div class="lora-stat"><span class="lora-stat-k">Domain accuracy</span><span class="lora-stat-v accent">+31%</span></div>
  </div>
</div>`;

    const select   = document.getElementById('loraSelect');
    const genBtn   = document.getElementById('loraGenerate');
    const promptEl = document.getElementById('loraPrompt');
    const baseEl   = document.getElementById('loraBase');
    const tunedEl  = document.getElementById('loraTuned');

    function updatePrompt() {
        const ex = LORA_EXAMPLES[+select.value];
        promptEl.textContent = ex.prompt;
    }
    updatePrompt();
    select.addEventListener('change', updatePrompt);

    async function typeInto(el, html, charDelay = 8) {
        el.innerHTML = '';
        const temp = document.createElement('div');
        temp.innerHTML = html;
        const text = temp.textContent;
        let i = 0;
        return new Promise(resolve => {
            const t = setInterval(() => {
                i++;
                const fragment = text.slice(0, i);
                el.textContent = fragment;
                if (i >= text.length) {
                    clearInterval(t);
                    el.innerHTML = html;
                    resolve();
                }
            }, charDelay);
        });
    }

    genBtn.addEventListener('click', async () => {
        const ex = LORA_EXAMPLES[+select.value];
        genBtn.disabled = true;
        genBtn.textContent = 'Generating…';
        baseEl.innerHTML  = '<span class="lora-generating">Generating<span class="tdots"><span></span><span></span><span></span></span></span>';
        tunedEl.innerHTML = '<span class="lora-generating">Generating<span class="tdots"><span></span><span></span><span></span></span></span>';

        await _delay(600);
        await typeInto(baseEl, ex.base.replace(/\n/g,'<br>'), 6);
        await _delay(200);
        await typeInto(tunedEl, ex.tuned.replace(/\n/g,'<br>'), 5);

        genBtn.disabled = false;
        genBtn.textContent = 'Generate →';
    });

    return () => {};
}

// ══════════════════════════════════════
// Init
// ══════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    // Wire up launch buttons
    document.querySelectorAll('.demo-launch-btn').forEach(btn => {
        btn.addEventListener('click', () => openDemo(btn.dataset.demo, btn.dataset.title));
    });

    // Modal close
    const closeBtn = document.getElementById('demo-close');
    const overlay  = document.getElementById('demo-modal');
    if (closeBtn) closeBtn.addEventListener('click', closeDemo);
    if (overlay)  overlay.addEventListener('click', e => { if (e.target === overlay) closeDemo(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay && !overlay.hasAttribute('hidden')) closeDemo(); });
});
