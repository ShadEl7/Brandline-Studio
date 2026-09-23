/* =========================================================
   Brandline Studio — site scripts
   ========================================================= */

/* ---------- Estimate calculator ---------- */
function updateEstimate(){
  const pkg=document.getElementById('pkg').value;
  let m=399, setup=1750;
  if(pkg==='business'){ m=649; setup=1999; }
  if(pkg==='premium'){ m=999; setup=2500; }
  if(document.getElementById('hosting').checked) m+=149;
  if(document.getElementById('seo').checked) m+=600;
  if(document.getElementById('care').checked) m+=400;
  document.getElementById('est-month').textContent='R'+m.toLocaleString('en-ZA');
  document.getElementById('est-setup').textContent='R'+setup.toLocaleString('en-ZA');
}
['pkg','hosting','seo','care'].forEach(id=>document.getElementById(id).addEventListener('change',updateEstimate));
updateEstimate();
document.getElementById('y').textContent=(new Date()).getFullYear();

/* ---------- Mobile menu ---------- */
const menuToggle=document.getElementById('menuToggle');
const mobilePanel=document.getElementById('mobilePanel');
menuToggle.addEventListener('click',()=>{
  const open=mobilePanel.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded',open?'true':'false');
});
mobilePanel.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
  mobilePanel.classList.remove('open');
  menuToggle.setAttribute('aria-expanded','false');
}));

/* ---------- Intent -> email subject ---------- */
const intentSelect=document.getElementById('intent');
const formSubject=document.getElementById('formSubject');
function syncSubject(){ formSubject.value='New enquiry — '+intentSelect.options[intentSelect.selectedIndex].text; }
intentSelect.addEventListener('change',syncSubject);
syncSubject();

/* ---------- Contact form submit (FormSubmit AJAX, no page reload) ---------- */
const form=document.getElementById('contact-form');
const sendBtn=document.getElementById('sendBtn');
const successBox=document.getElementById('formSuccess');
const errorBox=document.getElementById('formError');
form.addEventListener('submit', async function(e){
  e.preventDefault();
  successBox.style.display='none';
  errorBox.style.display='none';
  sendBtn.disabled=true;
  sendBtn.textContent='Sending…';
  try{
    const data=new FormData(form);
    const res=await fetch('https://formsubmit.co/ajax/brandlinestudio8@gmail.com',{
      method:'POST',
      headers:{'Accept':'application/json'},
      body:data
    });
    if(!res.ok) throw new Error('Request failed');
    form.reset();
    syncSubject();
    successBox.style.display='block';
  }catch(err){
    errorBox.style.display='block';
  }finally{
    sendBtn.disabled=false;
    sendBtn.textContent='Send message';
  }
});

/* =========================================================
   Chatbot
   ---------------------------------------------------------
   Tries the AI backend first (see /api/chat.js). If that
   endpoint isn't deployed, or the request fails for any
   reason (offline, no backend configured, rate limit, etc.),
   it falls back automatically to the built-in FAQ answers
   below — so the chatbot always works, even on a plain
   GitHub Pages deploy with no backend at all.
   ========================================================= */

/* Set to a full URL if the backend is hosted on a different
   domain than this site (e.g. site on GitHub Pages, backend
   on Vercel). Leave as '/api/chat' if both are deployed
   together on Vercel. */
const CHAT_API_ENDPOINT = '/api/chat';

const chatToggle=document.getElementById('chatToggle');
const chatPanel=document.getElementById('chatPanel');
const chatClose=document.getElementById('chatClose');
const chatBody=document.getElementById('chatBody');
const chatChips=document.getElementById('chatChips');
const chatInput=document.getElementById('chatInput');
const chatSend=document.getElementById('chatSend');
const chatModeNote=document.getElementById('chatModeNote');

const FAQ=[
  {q:"What services do you offer?", keys:["service","offer","what do you do"],
   a:"We build websites for South African small businesses, and we also print branded apparel — mugs, shirts and caps — for your team or events."},
  {q:"How much does a website cost?", keys:["price","cost","much","fee","expensive"],
   a:"Website packages start from R399/month for a Starter site, plus a once-off setup fee (R1,750–R2,500 depending on package). Business and Premium plans cost more depending on pages and features. Use the estimate tool on this page, or tap Get a Quote for exact pricing."},
  {q:"Do you print mugs, shirts and caps?", keys:["mug","shirt","cap","apparel","print","merch","merchandise","hoodie"],
   a:"Yes! We design and print branded mugs, shirts and caps. Pricing depends on quantity and design, so we work it out per order — tap Get a Quote and choose \"Mugs, shirts or caps\"."},
  {q:"How long does a website take?", keys:["long","time","turnaround","when","ready","launch"],
   a:"It depends on the package and how quickly we get your content, but most Starter and Business sites launch within a couple of weeks of our first call."},
  {q:"How do I get a quote?", keys:["quote","get started","start"],
   a:"Tap the \"Get a quote\" button anywhere on this page, fill in a few details, and we'll reply within one business day. WhatsApp works too, if that's easier."},
  {q:"Can I chat on WhatsApp?", keys:["whatsapp","message you","contact"],
   a:"Yes — tap the green WhatsApp button on this page, or message us directly on +27 60 264 5118."},
  {q:"Do you offer ongoing support?", keys:["support","maintain","update","care","help after"],
   a:"Yes, our Care Plus add-on covers ongoing updates and support once your site is live. You can add it in the price estimator above."}
];
const FALLBACK_MSG="I'm not totally sure about that one — tap \"Get a quote\" and ask us directly, or WhatsApp us on +27 60 264 5118 for a quick answer.";

function addMsg(text, from){
  const div=document.createElement('div');
  div.className='chat-msg '+from;
  div.textContent=text;
  chatBody.appendChild(div);
  chatBody.scrollTop=chatBody.scrollHeight;
  return div;
}
function addTyping(){
  const div=document.createElement('div');
  div.className='chat-msg bot typing';
  div.innerHTML='<span></span><span></span><span></span>';
  chatBody.appendChild(div);
  chatBody.scrollTop=chatBody.scrollHeight;
  return div;
}

function showChips(){
  chatChips.innerHTML='';
  FAQ.slice(0,4).forEach(item=>{
    const b=document.createElement('button');
    b.className='chat-chip';
    b.type='button';
    b.textContent=item.q;
    b.addEventListener('click',()=>handleUserText(item.q));
    chatChips.appendChild(b);
  });
}

function findAnswer(text){
  const t=text.toLowerCase();
  for(const item of FAQ){
    if(item.keys.some(k=>t.includes(k))) return item;
  }
  return null;
}

/* Rolling conversation history sent to the AI backend for context (kept short) */
let convo=[];
let backendAvailable=true; // flips to false after first failed call, so we stop retrying mid-session

async function getBotReply(userText){
  if(backendAvailable){
    try{
      const res=await fetch(CHAT_API_ENDPOINT,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({message:userText, history:convo.slice(-8)})
      });
      if(!res.ok) throw new Error('backend-error');
      const data=await res.json();
      if(!data || !data.reply) throw new Error('bad-response');
      convo.push({role:'user',content:userText});
      convo.push({role:'assistant',content:data.reply});
      return data.reply;
    }catch(err){
      backendAvailable=false; // stop hitting a backend that isn't there this session
      if(chatModeNote) chatModeNote.textContent='';
    }
  }
  const match=findAnswer(userText);
  return match ? match.a : FALLBACK_MSG;
}

async function handleUserText(text){
  if(!text.trim()) return;
  addMsg(text,'user');
  chatInput.value='';
  chatSend.disabled=true;
  const typingEl=addTyping();
  const reply=await getBotReply(text);
  typingEl.remove();
  addMsg(reply,'bot');
  chatSend.disabled=false;
}

let chatStarted=false;
function openChat(){
  chatPanel.classList.add('open');
  chatToggle.setAttribute('aria-expanded','true');
  if(!chatStarted){
    chatStarted=true;
    addMsg("Hi! I'm the Brandline Studio assistant. Ask me about websites, pricing, or our mugs, shirts and caps — or pick a question below.",'bot');
    showChips();
  }
  chatInput.focus();
}
function closeChat(){
  chatPanel.classList.remove('open');
  chatToggle.setAttribute('aria-expanded','false');
}
chatToggle.addEventListener('click',()=>{
  chatPanel.classList.contains('open') ? closeChat() : openChat();
});
chatClose.addEventListener('click',closeChat);
chatSend.addEventListener('click',()=>handleUserText(chatInput.value));
chatInput.addEventListener('keydown',e=>{ if(e.key==='Enter') handleUserText(chatInput.value); });
