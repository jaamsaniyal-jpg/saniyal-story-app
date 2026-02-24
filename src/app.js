import { useState, useEffect } from "react";

// ── FONTS ─────────────────────────────────────────────────────────────────────
const _fl = document.createElement("link");
_fl.rel = "stylesheet";
_fl.href = "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=DM+Sans:wght@300;400;500;600&display=swap";
document.head.appendChild(_fl);

// ── CSS ───────────────────────────────────────────────────────────────────────
const _st = document.createElement("style");
_st.textContent = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  html,body{min-height:100%;background:#04020a;font-family:'DM Sans',sans-serif;color:#ede0c4;}
  ::-webkit-scrollbar{width:4px;}
  ::-webkit-scrollbar-thumb{background:rgba(200,148,63,.3);border-radius:99px;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes glow{0%,100%{text-shadow:0 0 20px rgba(200,148,63,.3)}50%{text-shadow:0 0 60px rgba(200,148,63,.8)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
  @keyframes badgePulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
  @keyframes shimmer{0%{opacity:.4}50%{opacity:1}100%{opacity:.4}}
  .fu{animation:fadeUp .45s cubic-bezier(.16,1,.3,1) both;}
  .glow{animation:glow 3s ease-in-out infinite;}
  .float{animation:float 4s ease-in-out infinite;}
  .spin{animation:spin 1s linear infinite;display:inline-block;}
  .shim{animation:shimmer 1.8s ease infinite;}
  .hov{transition:all .2s;cursor:pointer;}
  .hov:hover{opacity:.82;transform:translateY(-1px);}
  .card-hov{transition:all .25s;cursor:pointer;}
  .card-hov:hover{border-color:rgba(200,148,63,.55)!important;transform:translateY(-3px);box-shadow:0 24px 60px rgba(0,0,0,.6)!important;}
  .sb{transition:all .18s;cursor:pointer;border-left:3px solid transparent;}
  .sb:hover{background:rgba(200,148,63,.09)!important;color:#c8943f!important;}
  .sb.on{background:rgba(200,148,63,.14)!important;color:#c8943f!important;border-left-color:#c8943f!important;}
  .asb{transition:all .18s;cursor:pointer;border-left:3px solid transparent;}
  .asb:hover{background:rgba(64,128,224,.09)!important;color:#4080e0!important;}
  .asb.on{background:rgba(64,128,224,.14)!important;color:#4080e0!important;border-left-color:#4080e0!important;}
  input,textarea,button,select{outline:none!important;font-family:'DM Sans',sans-serif;}
  select{appearance:none;-webkit-appearance:none;}
  pre{white-space:pre-wrap;word-break:break-word;font-family:'DM Sans',sans-serif;line-height:1.85;}
  @media(max-width:700px){.hide-mobile{display:none!important;}.main-pad{margin-left:0!important;padding:14px!important;}}
`;
document.head.appendChild(_st);

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
const C = {
  bg:"#04020a", card:"rgba(8,4,14,.98)", border:"rgba(120,20,35,.32)",
  gold:"#c8943f", text:"#ede0c4", muted:"#7a5040", dim:"#3a2028",
};
const WA = "+923278445763";
const BASE = 5000;
const ADMIN_EMAIL = "admin@saniyal.com";
const ADMIN_PASS  = "Saniyal@Admin2024";

const PLANS = [
  { id:"m1", name:"1 Month",  months:1, discount:0,   badge:null,                color:"#7a1525" },
  { id:"m2", name:"2 Months", months:2, discount:10,  badge:"10% OFF",           color:"#a03020" },
  { id:"m3", name:"3 Months", months:3, discount:20,  badge:"⭐ 20% OFF",        color:"#c8943f" },
  { id:"m6", name:"6 Months", months:6, discount:30,  badge:"🏆 BEST 30% OFF",  color:"#c8943f" },
];

// ✅ 23 Universal Niches — har category!
const NICHES = [
  "Mafia Romance","Dark Romance","CEO Romance","Billionaire Romance",
  "Revenge Story","Forbidden Love","Royal Romance","Supernatural",
  "Crime Documentary","True Crime","Historical Documentary",
  "Tech & AI","Finance & Money","Luxury Lifestyle","Motivation",
  "Biography","Mystery & Thriller","Horror Stories","Comedy",
  "Travel & Adventure","Health & Fitness","Science & Nature","Politics",
];

const LENGTHS = [
  { l:"Short (8–12 min)",       v:"Short (8-12 min)" },
  { l:"Medium (12–25 min)",     v:"Medium (12-25 min)" },
  { l:"Long (25–60 min)",       v:"Long (25-60 min)" },
  { l:"Ultra Long (60–120 min)",v:"Ultra Long (60-120 min)" },
];
const COUNTRIES = ["USA","UK","Global","Pakistan","India","Canada","Australia"];

const TOOLS = [
  { id:"full",      icon:"🎬", label:"Complete Package",   desc:"Sab 11 sections ek saath" },
  { id:"titles",    icon:"🎯", label:"Viral Titles",       desc:"10 clickbait titles" },
  { id:"script",    icon:"🎙️", label:"Script Writer",      desc:"Full cinematic script" },
  { id:"thumbnail", icon:"🖼️", label:"Thumbnail Strategy", desc:"5 options + scene" },
  { id:"seo",       icon:"📝", label:"SEO Package",        desc:"Description + 30 tags" },
  { id:"guide",     icon:"📋", label:"Production Guide",   desc:"Voice + Visual + Music" },
];

// ── MOCK USERS (Demo — Supabase lagane ke baad real hoga) ─────────────────────
const initUsers = () => {
  try { return JSON.parse(localStorage.getItem("saniyal_users")||"[]"); } catch{ return []; }
};
const saveUsers = (u) => localStorage.setItem("saniyal_users", JSON.stringify(u));

const calcPrice = p => { const b=BASE*p.months,d=Math.round(b*p.discount/100); return{original:b,final:b-d,saved:d}; };
const fmt = n => `PKR ${n.toLocaleString()}`;

// ── GOD PROMPT (Hidden — user dekh nahi sakta) ────────────────────────────────
const buildPrompt = (topic, niche, length, country) => `
You are a world-class YouTube creator, elite documentary filmmaker, viral content strategist, cinematic storyteller, SEO expert, and full video production director with decades of experience creating viral videos for ${country} audiences.

Your content must feel natural, emotional, intelligent, and premium — never AI-generated.

TOPIC: ${topic}
NICHE: ${niche}
VIDEO LENGTH: ${length}
TARGET: ${country}

Generate ALL sections below completely:

━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 1 — 🎯 VIRAL TITLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━
10 highly clickable curiosity-driven titles. Number them 1-10.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 2 — 🖼️ THUMBNAIL STRATEGY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5 thumbnail text options (bold, emotional, short).
1 detailed cinematic thumbnail scene description.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 3 — 🎙️ FULL CINEMATIC SCRIPT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Complete ${length} script. Hook first 30 seconds. Cinematic narration. Natural human tone. Netflix documentary feel. Strong ending with CTA.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 4 — 🔊 VOICE GUIDE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Voice gender, tone, emotion, pacing, accent for ${country}.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 5 — 🎥 VISUAL GUIDE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Scene by scene: what to show, camera style, mood, lighting, b-roll, color grading.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 6 — 🎵 MUSIC GUIDE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Music genre, emotional tone, intensity changes, royalty-free recommendations.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 7 — 📝 SEO DESCRIPTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Full YouTube description 400-600 words. Engaging, natural keywords, chapters, CTA.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 8 — 🏷️ SEO TAGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
30 optimized tags, comma separated.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 9 — 📌 PINNED COMMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Perfect pinned comment — creates discussion, increases watch time, feels authentic.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 10 — 📊 UPLOAD STRATEGY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Best upload time for ${country}, thumbnail strategy, first 48hr engagement plan.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 11 — 📈 GROWTH STRATEGY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3 follow-up video ideas as a series.

Quality: Human-written, emotionally engaging, premium, cinematic. Ready for immediate use — no editing required.
`;

// ── HELPERS ───────────────────────────────────────────────────────────────────
function Ambient({ blue }) {
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}>
      <div style={{position:"absolute",top:"-20%",left:"-10%",width:"60%",height:"60%",
        background:blue?"radial-gradient(ellipse,rgba(30,80,160,.1) 0%,transparent 70%)":"radial-gradient(ellipse,rgba(120,20,35,.15) 0%,transparent 70%)"}}/>
      <div style={{position:"absolute",bottom:"-20%",right:"-10%",width:"50%",height:"50%",
        background:blue?"radial-gradient(ellipse,rgba(80,30,160,.08) 0%,transparent 70%)":"radial-gradient(ellipse,rgba(200,148,63,.08) 0%,transparent 70%)"}}/>
    </div>
  );
}

function Toast({ msg, type, onClose }) {
  useEffect(()=>{ const t=setTimeout(onClose,3000); return()=>clearTimeout(t); },[]);
  return (
    <div className="fu" style={{position:"fixed",top:20,right:20,zIndex:9999,maxWidth:320,
      background:type==="error"?"rgba(120,10,20,.97)":"rgba(10,60,25,.97)",
      border:`1px solid ${type==="error"?"rgba(255,80,80,.3)":"rgba(40,200,80,.3)"}`,
      borderRadius:12,padding:"12px 20px",color:type==="error"?"#ffa0a0":"#90f0b0",
      fontSize:13,backdropFilter:"blur(20px)",boxShadow:"0 8px 40px rgba(0,0,0,.6)"}}>
      {type==="error"?"⚠️ ":"✓ "}{msg}
    </div>
  );
}

function Btn({ children, onClick, disabled, variant="primary", style={}, full }) {
  const v = {
    primary:{background:disabled?"rgba(120,20,35,.2)":"linear-gradient(135deg,#7a1525,#b83030 55%,#c8943f)",color:disabled?"#3a2028":"#fff",border:"none",boxShadow:disabled?"none":"0 4px 24px rgba(120,20,35,.38)",cursor:disabled?"not-allowed":"pointer"},
    ghost:{background:"transparent",color:C.muted,border:`1px solid ${C.border}`,cursor:"pointer"},
    gold:{background:"rgba(200,148,63,.12)",color:C.gold,border:"1px solid rgba(200,148,63,.32)",cursor:"pointer"},
    green:{background:"rgba(30,160,70,.15)",color:"#60e090",border:"1px solid rgba(30,160,70,.3)",cursor:"pointer"},
    red:{background:"rgba(180,20,20,.15)",color:"#f08080",border:"1px solid rgba(180,20,20,.3)",cursor:"pointer"},
    wa:{background:"rgba(30,180,60,.15)",color:"#50e080",border:"1px solid rgba(30,180,60,.3)",cursor:"pointer"},
    blue:{background:"rgba(30,80,200,.18)",color:"#80b0ff",border:"1px solid rgba(30,80,200,.3)",cursor:"pointer"},
  };
  return (
    <button onClick={disabled?undefined:onClick} disabled={!!disabled} className="hov"
      style={{borderRadius:11,padding:"11px 24px",fontSize:13,fontWeight:500,letterSpacing:.3,
              display:"inline-flex",alignItems:"center",gap:8,
              width:full?"100%":"auto",justifyContent:full?"center":"flex-start",...v[variant],...style}}>
      {children}
    </button>
  );
}

function Inp({ label, type="text", value, onChange, placeholder, icon }) {
  const [f,setF]=useState(false);
  return (
    <div style={{marginBottom:16}}>
      {label&&<label style={{display:"block",color:C.dim,fontSize:10,letterSpacing:2,textTransform:"uppercase",marginBottom:7}}>{label}</label>}
      <div style={{position:"relative"}}>
        {icon&&<span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:15}}>{icon}</span>}
        <input type={type} value={value} onChange={onChange} placeholder={placeholder}
          onFocus={()=>setF(true)} onBlur={()=>setF(false)}
          style={{width:"100%",padding:icon?"12px 14px 12px 40px":"12px 16px",
                  background:"rgba(120,20,35,.1)",border:`1px solid ${f?C.gold:"rgba(120,20,35,.35)"}`,
                  borderRadius:10,color:C.text,fontSize:14,transition:"border-color .2s"}}/>
      </div>
    </div>
  );
}

function Sel({ label, value, onChange, options }) {
  return (
    <div style={{marginBottom:16}}>
      {label&&<label style={{display:"block",color:C.dim,fontSize:10,letterSpacing:2,textTransform:"uppercase",marginBottom:7}}>{label}</label>}
      <div style={{position:"relative"}}>
        <select value={value} onChange={e=>onChange(e.target.value)}
          style={{width:"100%",padding:"12px 36px 12px 14px",background:"rgba(120,20,35,.1)",
                  border:"1px solid rgba(120,20,35,.35)",borderRadius:10,color:C.text,fontSize:14,cursor:"pointer"}}>
          {options.map(o=><option key={typeof o==="string"?o:o.v} value={typeof o==="string"?o:o.v}
            style={{background:"#1a0a10",color:C.text}}>{typeof o==="string"?o:o.l}</option>)}
        </select>
        <span style={{position:"absolute",right:13,top:"50%",transform:"translateY(-50%)",color:C.gold,pointerEvents:"none"}}>▾</span>
      </div>
    </div>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin, onSignup, onPricing }) {
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  const login = () => {
    if(!email||!pass){setError("Email aur password zaruri hain");return;}
    setLoading(true); setError("");
    setTimeout(()=>{
      // Admin check
      if(email===ADMIN_EMAIL && pass===ADMIN_PASS){
        onLogin({role:"admin",name:"Saniyal Admin",email});
        return;
      }
      // User check
      const users = initUsers();
      const user = users.find(u=>u.email===email && u.pass===pass);
      if(user){
        onLogin({role:"user",...user});
      } else {
        setError("Email ya password galat hai");
        setLoading(false);
      }
    },1000);
  };

  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:20,position:"relative"}}>
      <Ambient/>
      <div style={{position:"relative",zIndex:1,width:"100%",maxWidth:420}}>
        <div className="fu" style={{textAlign:"center",marginBottom:28}}>
          <div className="float" style={{fontSize:52,marginBottom:10,filter:"drop-shadow(0 0 20px rgba(200,148,63,.4))"}}>🎬</div>
          <div className="glow" style={{fontFamily:"'Cinzel',serif",fontSize:22,color:C.gold,letterSpacing:4}}>SANIYAL</div>
          <div style={{color:C.dim,fontSize:10,letterSpacing:4,textTransform:"uppercase",marginTop:4}}>STORY TOOLS PRO</div>
          <div style={{width:50,height:1,background:`linear-gradient(90deg,transparent,${C.gold},transparent)`,margin:"10px auto 0"}}/>
        </div>

        <div className="fu" style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:"32px 32px",backdropFilter:"blur(24px)",boxShadow:"0 40px 100px rgba(0,0,0,.8)"}}>
          <h2 style={{fontFamily:"'Cinzel',serif",color:C.gold,fontSize:17,marginBottom:5,textAlign:"center"}}>Welcome Back</h2>
          <p style={{color:C.muted,fontSize:12,textAlign:"center",marginBottom:22,fontStyle:"italic"}}>Login karo aur shuru ho jao</p>

          <Inp label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="aapka@gmail.com" icon="📧"/>
          <Inp label="Password" type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" icon="🔒"/>

          {error&&<div style={{color:"#f08080",fontSize:12,marginBottom:14,padding:"10px 14px",background:"rgba(200,50,50,.1)",borderRadius:8,border:"1px solid rgba(200,50,50,.2)"}}>⚠️ {error}</div>}

          <Btn onClick={login} disabled={loading} full style={{padding:"14px",fontSize:14,marginBottom:14}}>
            {loading?<><span className="spin">⏳</span> Login ho raha hai...</>:"🚀 Login Karo"}
          </Btn>

          <div style={{textAlign:"center",color:C.muted,fontSize:13,marginBottom:14}}>
            Account nahi hai?{" "}<span onClick={onSignup} style={{color:C.gold,cursor:"pointer",fontWeight:600}}>Signup Karo</span>
          </div>

          <div style={{borderTop:`1px solid ${C.border}`,paddingTop:14,textAlign:"center"}}>
            <Btn variant="gold" onClick={onPricing} style={{fontSize:12,padding:"8px 18px",margin:"0 auto"}}>💎 Pricing Plans Dekhein</Btn>
          </div>

          <div style={{marginTop:16,padding:"11px 14px",background:"rgba(30,180,60,.07)",border:"1px solid rgba(30,180,60,.18)",borderRadius:9,display:"flex",gap:9,alignItems:"center"}}>
            <span style={{fontSize:17}}>💬</span>
            <div>
              <div style={{color:"#60e090",fontSize:11,fontWeight:600}}>Help chahiye?</div>
              <a href={`https://wa.me/${WA.replace("+","")}`} target="_blank" rel="noreferrer"
                style={{color:"#40c070",fontSize:11,textDecoration:"none"}}>WhatsApp: {WA}</a>
            </div>
          </div>
        </div>

        <div style={{textAlign:"center",marginTop:16,color:C.dim,fontSize:10,letterSpacing:2}}>
          MADE WITH 🎬 BY <span style={{color:C.gold,fontFamily:"'Cinzel',serif"}}>SANIYAL</span>
        </div>
      </div>
    </div>
  );
}

// ── SIGNUP ────────────────────────────────────────────────────────────────────
function SignupScreen({ onLogin }) {
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [niche,setNiche]=useState("Mafia Romance");
  const [loading,setLoading]=useState(false);
  const [done,setDone]=useState(false);
  const [error,setError]=useState("");

  const signup = () => {
    if(!name||!email||!pass){setError("Sab fields fill karo");return;}
    if(pass.length<6){setError("Password minimum 6 characters");return;}
    if(!email.includes("@")){setError("Sahi email likho");return;}
    setLoading(true); setError("");
    setTimeout(()=>{
      const users = initUsers();
      if(users.find(u=>u.email===email)){setError("Ye email pehle se exist karti hai");setLoading(false);return;}
      const newUser = {name,email,pass,niche,planActive:false,plan:"none",storiesCount:0,joinedDate:new Date().toLocaleDateString()};
      users.push(newUser);
      saveUsers(users);
      setLoading(false);
      setDone(true);
    },1000);
  };

  if(done) return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:20,position:"relative"}}>
      <Ambient/>
      <div style={{position:"relative",zIndex:1,width:"100%",maxWidth:400,textAlign:"center"}}>
        <div className="fu" style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:"44px 32px",boxShadow:"0 40px 100px rgba(0,0,0,.8)"}}>
          <div style={{fontSize:52,marginBottom:14}}>🎉</div>
          <h2 style={{fontFamily:"'Cinzel',serif",color:C.gold,fontSize:20,marginBottom:8}}>Account Ban Gaya!</h2>
          <p style={{color:C.muted,fontSize:13,marginBottom:8,lineHeight:1.7}}>
            Ab admin ko WhatsApp karo plan activate karwao:
          </p>
          <a href={`https://wa.me/${WA.replace("+","")}?text=Salam! Mera account ban gaya hai. Email: ${email} — Plan activate karna hai.`}
            target="_blank" rel="noreferrer" style={{textDecoration:"none",display:"block",marginBottom:14}}>
            <Btn variant="wa" full style={{padding:"13px",fontSize:14}}>💬 Admin ko WhatsApp Karo</Btn>
          </a>
          <Btn onClick={onLogin} full style={{padding:"12px",fontSize:13}}>🚀 Login Karo</Btn>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:20,position:"relative"}}>
      <Ambient/>
      <div style={{position:"relative",zIndex:1,width:"100%",maxWidth:420}}>
        <div className="fu" style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:44,marginBottom:8}}>🎬</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:17,color:C.gold,letterSpacing:3}}>SANIYAL</div>
          <div style={{color:C.dim,fontSize:10,letterSpacing:3,textTransform:"uppercase",marginTop:3}}>Naya Account Banao</div>
        </div>
        <div className="fu" style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:20,padding:"30px 32px",boxShadow:"0 40px 100px rgba(0,0,0,.8)"}}>
          <Inp label="Aapka Naam" value={name} onChange={e=>setName(e.target.value)} placeholder="Full Name" icon="👤"/>
          <Inp label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="aapka@gmail.com" icon="📧"/>
          <Inp label="Password" type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Min 6 characters" icon="🔒"/>
          <Sel label="Aapka Main Niche" value={niche} onChange={setNiche} options={NICHES}/>
          {error&&<div style={{color:"#f08080",fontSize:12,marginBottom:12,padding:"9px 13px",background:"rgba(200,50,50,.1)",borderRadius:8,border:"1px solid rgba(200,50,50,.2)"}}>⚠️ {error}</div>}
          <Btn onClick={signup} disabled={loading} full style={{padding:"13px",fontSize:14,marginBottom:12}}>
            {loading?<><span className="spin">⏳</span> Account ban raha hai...</>:"✨ Account Banao"}
          </Btn>
          <div style={{textAlign:"center",color:C.muted,fontSize:12}}>
            Pehle se account hai?{" "}<span onClick={onLogin} style={{color:C.gold,cursor:"pointer",fontWeight:600}}>Login Karo</span>
          </div>
        </div>
        <div style={{textAlign:"center",marginTop:14,color:C.dim,fontSize:10}}>Made by <span style={{color:C.gold}}>Saniyal</span></div>
      </div>
    </div>
  );
}

// ── PRICING ───────────────────────────────────────────────────────────────────
function PricingScreen({ onLogin }) {
  const [sel,setSel]=useState(null);
  const [toast,setToast]=useState(null);

  return (
    <div style={{minHeight:"100vh",background:C.bg,position:"relative"}}>
      <Ambient/>
      {toast&&<Toast {...toast} onClose={()=>setToast(null)}/>}
      <div style={{position:"relative",zIndex:1,maxWidth:980,margin:"0 auto",padding:"44px 18px"}}>
        <div className="fu" style={{textAlign:"center",marginBottom:44}}>
          <div className="float" style={{fontSize:46,marginBottom:10}}>💎</div>
          <h1 className="glow" style={{fontFamily:"'Cinzel',serif",fontSize:"clamp(22px,4vw,36px)",color:C.gold,marginBottom:10,letterSpacing:2}}>Plans & Pricing</h1>
          <p style={{color:C.muted,fontSize:14,marginBottom:14}}>Jitnaa lamba plan — utna zyada bachao!</p>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(200,148,63,.07)",border:"1px solid rgba(200,148,63,.2)",borderRadius:99,padding:"7px 16px"}}>
            <span>💡</span><span style={{color:C.gold,fontSize:12}}>Base: {fmt(BASE)}/month</span>
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16,marginBottom:40}}>
          {PLANS.map(plan=>{
            const price=calcPrice(plan); const isSel=sel===plan.id; const isBest=plan.months===3;
            return (
              <div key={plan.id} className="card-hov"
                onClick={()=>{setSel(plan.id);setToast({msg:`${plan.name} select kiya! Admin ko WhatsApp karo 💬`,type:"success"});}}
                style={{background:C.card,border:`2px solid ${isSel?C.gold:isBest?"rgba(200,148,63,.42)":C.border}`,
                        borderRadius:20,padding:"24px 20px",cursor:"pointer",position:"relative",
                        boxShadow:isSel?"0 0 40px rgba(200,148,63,.25)":isBest?"0 0 16px rgba(200,148,63,.1)":"none",transition:"all .25s"}}>
                {plan.badge&&<div style={{position:"absolute",top:-11,left:"50%",transform:"translateX(-50%)",
                  background:`linear-gradient(135deg,${plan.color},#c8943f)`,borderRadius:99,
                  padding:"3px 11px",fontSize:10,color:"#fff",fontWeight:700,whiteSpace:"nowrap",
                  animation:"badgePulse 2s ease infinite"}}>{plan.badge}</div>}
                {isSel&&<div style={{position:"absolute",top:11,right:11,width:20,height:20,borderRadius:"50%",background:C.gold,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#fff"}}>✓</div>}
                <div style={{fontFamily:"'Cinzel',serif",color:C.gold,fontSize:16,marginBottom:4}}>{plan.name}</div>
                <div style={{color:C.muted,fontSize:11,marginBottom:16}}>{plan.months} month{plan.months>1?"s":""} access</div>
                {plan.discount>0&&<div style={{color:C.dim,fontSize:12,textDecoration:"line-through",marginBottom:2}}>{fmt(price.original)}</div>}
                <div style={{fontFamily:"'Cinzel',serif",fontSize:26,color:"#fff",marginBottom:3}}>{fmt(price.final)}</div>
                {plan.discount>0&&<div style={{color:"#60e090",fontSize:11,marginBottom:12}}>Save {fmt(price.saved)} 🎉</div>}
                <div style={{borderTop:`1px solid ${C.border}`,paddingTop:12,marginTop:plan.discount?0:12}}>
                  {["23 Niches Support","11-Section Package","Unlimited Use","Script + SEO + Guide","WhatsApp Support"].map(f=>(
                    <div key={f} style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                      <span style={{color:"#60e090",fontSize:10}}>✓</span>
                      <span style={{color:C.text,fontSize:11}}>{f}</span>
                    </div>
                  ))}
                </div>
                <div style={{marginTop:14,padding:"8px",background:isSel?"rgba(200,148,63,.14)":"rgba(120,20,35,.1)",borderRadius:8,textAlign:"center",color:isSel?C.gold:C.muted,fontSize:11,fontWeight:500}}>
                  {isSel?"✅ Selected!":"Select Karo →"}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:"24px 28px",marginBottom:20}}>
          <h3 style={{fontFamily:"'Cinzel',serif",color:C.gold,fontSize:14,marginBottom:18,textAlign:"center"}}>💳 Payment Process</h3>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:14,marginBottom:20}}>
            {[{n:"1",i:"💎",t:"Plan Chunein",d:"Upar se plan select karo"},
              {n:"2",i:"💬",t:"WhatsApp Karo",d:WA},
              {n:"3",i:"💰",t:"Payment Bhejo",d:"JazzCash / EasyPaisa"},
              {n:"4",i:"✅",t:"Activate!",d:"24hr mein full access"}].map(s=>(
              <div key={s.n} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                <div style={{width:24,height:24,borderRadius:"50%",background:"rgba(200,148,63,.16)",display:"flex",alignItems:"center",justifyContent:"center",color:C.gold,fontSize:11,fontWeight:700,flexShrink:0}}>{s.n}</div>
                <div><div style={{fontSize:18,marginBottom:3}}>{s.i}</div><div style={{color:C.text,fontSize:12,fontWeight:600,marginBottom:2}}>{s.t}</div><div style={{color:C.muted,fontSize:11}}>{s.d}</div></div>
              </div>
            ))}
          </div>
          <div style={{textAlign:"center"}}>
            <a href={`https://wa.me/${WA.replace("+","")}`} target="_blank" rel="noreferrer" style={{textDecoration:"none"}}>
              <Btn variant="wa" style={{padding:"12px 28px",fontSize:13}}>💬 WhatsApp: {WA}</Btn>
            </a>
          </div>
        </div>

        <div style={{textAlign:"center"}}>
          <span onClick={onLogin} style={{color:C.gold,cursor:"pointer",fontSize:13}}>← Login / Signup</span>
          <div style={{color:C.dim,fontSize:10,marginTop:14}}>Made by <span style={{color:C.gold}}>Saniyal</span></div>
        </div>
      </div>
    </div>
  );
}

// ── AI GENERATOR (God Prompt hidden hai yahan) ────────────────────────────────
function Generator({ user, mode="full" }) {
  const [topic,setTopic]=useState("");
  const [niche,setNiche]=useState(user.niche||"Mafia Romance");
  const [length,setLength]=useState("Medium (12-25 min)");
  const [country,setCountry]=useState("USA");
  const [loading,setLoading]=useState(false);
  const [result,setResult]=useState("");
  const [copied,setCopied]=useState(false);
  const [error,setError]=useState("");

  const LABELS = {
    full:"🎬 Complete Package — Sab 11 Sections",
    titles:"🎯 Viral Title Generator",
    script:"🎙️ Full Cinematic Script",
    thumbnail:"🖼️ Thumbnail Strategy",
    seo:"📝 SEO Package",
    guide:"📋 Voice + Visual + Music Guide",
  };

  const SECTION_FILTER = {
    full:"",
    titles:"Generate ONLY Section 1 (Viral Titles). 10 titles only.",
    script:"Generate ONLY Section 3 (Full Script). Complete script only.",
    thumbnail:"Generate ONLY Section 2 (Thumbnail Strategy). 5 text options + scene description only.",
    seo:"Generate ONLY Sections 7 and 8 (SEO Description + Tags). Only these two sections.",
    guide:"Generate ONLY Sections 4, 5 and 6 (Voice + Visual + Music Guide). Only these three sections.",
  };

  const generate = async () => {
    if(!topic.trim()){setError("Topic likho — phir generate karo!");return;}
    if(!user.planActive){setError("Plan active nahi! Admin ko WhatsApp karo.");return;}
    setLoading(true);setResult("");setError("");

    const prompt = buildPrompt(topic,niche,length,country);
    const finalMsg = SECTION_FILTER[mode]
      ? `${SECTION_FILTER[mode]}\n\nTOPIC: ${topic}\nNICHE: ${niche}\nLENGTH: ${length}\nCOUNTRY: ${country}\n\n${prompt}`
      : prompt;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens: mode==="script"||mode==="full" ? 8000 : 2000,
          messages:[{role:"user",content:finalMsg}]
        })
      });
      const data = await res.json();
      const text = data.content?.map(c=>c.text||"").join("\n")||"Error aaya — dobara try karo";
      setResult(text);
      // Stories count update
      const users=initUsers();
      const idx=users.findIndex(u=>u.email===user.email);
      if(idx>-1){users[idx].storiesCount=(users[idx].storiesCount||0)+1;saveUsers(users);}
    } catch(e){
      setError("Connection error — internet check karo ya dobara try karo");
    }
    setLoading(false);
  };

  const copy=()=>{navigator.clipboard?.writeText(result);setCopied(true);setTimeout(()=>setCopied(false),2000);};

  return (
    <div>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:"26px",marginBottom:20}}>
        <h3 style={{fontFamily:"'Cinzel',serif",color:C.gold,fontSize:14,marginBottom:18}}>{LABELS[mode]}</h3>
        <Inp label="Video Topic *" value={topic} onChange={e=>setTopic(e.target.value)} placeholder="Masalan: Why Rolls Royce Is So Expensive" icon="🎯"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Sel label="Niche" value={niche} onChange={setNiche} options={NICHES}/>
          <Sel label="Country" value={country} onChange={setCountry} options={COUNTRIES}/>
        </div>
        <Sel label="Video Length" value={length} onChange={setLength} options={LENGTHS}/>

        {!user.planActive&&(
          <div style={{marginBottom:14,padding:"12px 16px",background:"rgba(200,148,63,.07)",border:"1px solid rgba(200,148,63,.22)",borderRadius:10}}>
            <div style={{color:C.gold,fontSize:12,fontWeight:600,marginBottom:4}}>⚠️ Plan Active Nahi</div>
            <a href={`https://wa.me/${WA.replace("+","")}`} target="_blank" rel="noreferrer" style={{color:"#40c070",fontSize:11,textDecoration:"none"}}>
              Admin ko WhatsApp karo → {WA}
            </a>
          </div>
        )}

        {error&&<div style={{color:"#f08080",fontSize:12,marginBottom:14,padding:"10px 14px",background:"rgba(200,50,50,.1)",borderRadius:8,border:"1px solid rgba(200,50,50,.2)"}}>⚠️ {error}</div>}

        <Btn onClick={generate} disabled={loading||!user.planActive} full style={{padding:"13px",fontSize:14}}>
          {loading?<><span className="spin">⏳</span> Generate ho raha hai... (30-60 sec)</>:"🚀 Generate Karo"}
        </Btn>
        {loading&&<div style={{marginTop:12,textAlign:"center",color:C.muted,fontSize:12}} className="shim">✨ AI content bana raha hai...</div>}
      </div>

      {result&&(
        <div className="fu">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <h3 style={{fontFamily:"'Cinzel',serif",color:C.gold,fontSize:14}}>✅ Package Ready!</h3>
            <Btn variant="gold" onClick={copy} style={{fontSize:11,padding:"7px 14px"}}>{copied?"✓ Copied!":"📋 Copy All"}</Btn>
          </div>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"22px",maxHeight:"65vh",overflowY:"auto"}}>
            <pre style={{color:C.text,fontSize:13.5}}>{result}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

// ── USER DASHBOARD ────────────────────────────────────────────────────────────
function UserDash({ user, onLogout }) {
  const [active,setActive]=useState("home");
  const [toast,setToast]=useState(null);
  const u = {...user,...(initUsers().find(x=>x.email===user.email)||{})};

  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",position:"relative"}}>
      <Ambient/>
      {toast&&<Toast {...toast} onClose={()=>setToast(null)}/>}

      {/* Sidebar */}
      <div className="hide-mobile" style={{width:232,background:"rgba(5,2,10,.98)",borderRight:`1px solid ${C.border}`,
                   position:"fixed",top:0,bottom:0,left:0,zIndex:50,display:"flex",flexDirection:"column",backdropFilter:"blur(24px)"}}>
        <div style={{padding:"20px 16px",borderBottom:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <span style={{fontSize:20,filter:"drop-shadow(0 0 8px rgba(200,148,63,.4))"}}>🎬</span>
            <div>
              <div style={{fontFamily:"'Cinzel',serif",color:C.gold,fontSize:11,letterSpacing:2}}>SANIYAL TOOLS</div>
              <div style={{color:C.dim,fontSize:9,letterSpacing:1}}>YouTube Automation Pro</div>
            </div>
          </div>
        </div>

        <div style={{padding:"13px 16px",borderBottom:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#7a1525,#c8943f)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontFamily:"'Cinzel',serif",color:"#fff",fontWeight:700}}>
              {u.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{color:C.text,fontSize:12,fontWeight:600}}>{u.name}</div>
              <div style={{color:u.planActive?"#60e090":"#f08080",fontSize:10}}>{u.planActive?`${u.plan} ✅`:"Plan Active Nahi ⚠️"}</div>
            </div>
          </div>
        </div>

        <nav style={{flex:1,padding:"10px",overflowY:"auto"}}>
          <div className={`sb ${active==="home"?"on":""}`} onClick={()=>setActive("home")}
            style={{display:"flex",alignItems:"center",gap:9,padding:"10px 12px",borderRadius:9,marginBottom:2,color:active==="home"?C.gold:C.muted}}>
            <span>🏠</span><span style={{fontSize:12}}>Dashboard</span>
          </div>
          <div style={{color:C.dim,fontSize:9,letterSpacing:2,textTransform:"uppercase",padding:"11px 12px 4px"}}>Tools</div>
          {TOOLS.map(t=>(
            <div key={t.id} className={`sb ${active===t.id?"on":""}`} onClick={()=>setActive(t.id)}
              style={{display:"flex",alignItems:"center",gap:9,padding:"10px 12px",borderRadius:9,marginBottom:2,color:active===t.id?C.gold:C.muted}}>
              <span style={{fontSize:15}}>{t.icon}</span>
              <div><div style={{fontSize:12}}>{t.label}</div><div style={{fontSize:10,opacity:.6}}>{t.desc}</div></div>
            </div>
          ))}
        </nav>

        <div style={{padding:"13px 16px",borderTop:`1px solid ${C.border}`}}>
          <a href={`https://wa.me/${WA.replace("+","")}`} target="_blank" rel="noreferrer" style={{textDecoration:"none"}}>
            <div style={{display:"flex",alignItems:"center",gap:7,padding:"8px 11px",borderRadius:8,background:"rgba(30,180,60,.07)",border:"1px solid rgba(30,180,60,.16)",marginBottom:6,cursor:"pointer"}}>
              <span style={{fontSize:13}}>💬</span><span style={{color:"#50e080",fontSize:11}}>WhatsApp Support</span>
            </div>
          </a>
          <div onClick={onLogout} style={{display:"flex",alignItems:"center",gap:7,padding:"8px 11px",borderRadius:8,cursor:"pointer",color:C.muted,fontSize:12,transition:"color .2s"}}
            onMouseEnter={e=>e.currentTarget.style.color="#f08080"} onMouseLeave={e=>e.currentTarget.style.color=C.muted}>
            <span>🚪</span> Logout
          </div>
          <div style={{color:C.dim,fontSize:9,textAlign:"center",marginTop:8,letterSpacing:1}}>BY <span style={{color:C.gold}}>SANIYAL</span></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-pad" style={{marginLeft:232,flex:1,padding:"24px",overflowY:"auto"}}>

        {/* Mobile header */}
        <div style={{display:"none"}} className="show-mobile">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <div style={{fontFamily:"'Cinzel',serif",color:C.gold,fontSize:14}}>🎬 SANIYAL</div>
            <Btn variant="ghost" onClick={onLogout} style={{fontSize:11,padding:"6px 12px"}}>🚪 Logout</Btn>
          </div>
        </div>

        {active==="home"&&(
          <div className="fu">
            <h1 style={{fontFamily:"'Cinzel',serif",color:C.gold,fontSize:19,marginBottom:3}}>Welcome, {u.name}! 🎬</h1>
            <p style={{color:C.muted,fontSize:13,marginBottom:24}}>Aaj kaunsa video banana hai?</p>

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))",gap:12,marginBottom:26}}>
              {[
                {icon:"📊",label:"Generated",value:u.storiesCount||0,color:C.gold},
                {icon:"💎",label:"Plan",value:u.planActive?u.plan:"Inactive",color:u.planActive?"#60e090":"#f08080"},
                {icon:"🎯",label:"Niche",value:u.niche,color:"#e080c0"},
                {icon:"📅",label:"Joined",value:u.joinedDate||"Today",color:"#80b0ff"},
              ].map(s=>(
                <div key={s.label} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:13,padding:"17px 18px"}}>
                  <div style={{fontSize:24,marginBottom:6}}>{s.icon}</div>
                  <div style={{color:s.color,fontSize:15,fontFamily:"'Cinzel',serif",marginBottom:3,wordBreak:"break-word"}}>{s.value}</div>
                  <div style={{color:C.dim,fontSize:10}}>{s.label}</div>
                </div>
              ))}
            </div>

            {!u.planActive&&(
              <div style={{marginBottom:22,padding:"18px 20px",background:"rgba(200,148,63,.07)",border:`1px solid rgba(200,148,63,.25)`,borderRadius:14,display:"flex",gap:14,alignItems:"center",flexWrap:"wrap"}}>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"'Cinzel',serif",color:C.gold,fontSize:13,marginBottom:4}}>⚠️ Plan Active Nahi Hai</div>
                  <div style={{color:C.muted,fontSize:12}}>Tools use karne ke liye plan activate karo — Admin ko WhatsApp karo</div>
                </div>
                <a href={`https://wa.me/${WA.replace("+","")}?text=Salam! Mera account hai: ${u.email} — Plan activate karna hai`} target="_blank" rel="noreferrer" style={{textDecoration:"none"}}>
                  <Btn variant="wa" style={{padding:"10px 18px",fontSize:12}}>💬 WhatsApp Karo</Btn>
                </a>
              </div>
            )}

            <h2 style={{fontFamily:"'Cinzel',serif",color:C.gold,fontSize:13,marginBottom:12}}>🚀 Tools</h2>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:10}}>
              {TOOLS.map(t=>(
                <div key={t.id} className="card-hov" onClick={()=>setActive(t.id)}
                  style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:13,padding:"18px 16px",cursor:"pointer",textAlign:"center"}}>
                  <div style={{fontSize:30,marginBottom:8}}>{t.icon}</div>
                  <div style={{fontFamily:"'Cinzel',serif",color:C.gold,fontSize:12,marginBottom:4}}>{t.label}</div>
                  <div style={{color:C.muted,fontSize:10}}>{t.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {TOOLS.map(t=>active===t.id&&(
          <div key={t.id} className="fu">
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
              <span onClick={()=>setActive("home")} style={{cursor:"pointer",color:C.muted,fontSize:12}}>← Dashboard</span>
              <span style={{color:C.dim}}>/</span>
              <span style={{color:C.gold,fontFamily:"'Cinzel',serif",fontSize:13}}>{t.label}</span>
            </div>
            <Generator user={u} mode={t.id}/>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ADMIN PANEL ───────────────────────────────────────────────────────────────
function AdminPanel({ onLogout }) {
  const [active,setActive]=useState("dashboard");
  const [users,setUsers]=useState(initUsers());
  const [toast,setToast]=useState(null);
  const showToast=(msg,type="success")=>{setToast({msg,type});};

  const refresh=()=>setUsers(initUsers());

  const activate=(email,plan,months)=>{
    const all=initUsers();
    const expires=new Date();expires.setMonth(expires.getMonth()+months);
    const idx=all.findIndex(u=>u.email===email);
    if(idx>-1){
      all[idx]={...all[idx],plan,planActive:true,planExpires:expires.toLocaleDateString()};
      saveUsers(all);refresh();
      showToast(`${all[idx].name} — ${plan} activate! ✅`);
    }
  };

  const deactivate=(email)=>{
    const all=initUsers();
    const idx=all.findIndex(u=>u.email===email);
    if(idx>-1){all[idx]={...all[idx],planActive:false,plan:"none"};saveUsers(all);refresh();showToast("User deactivated","error");}
  };

  const aC="#4080e0";
  const stats={
    total:users.length,
    active:users.filter(u=>u.planActive).length,
    pending:users.filter(u=>!u.planActive).length,
    revenue:users.filter(u=>u.planActive).reduce((s,u)=>{const p=PLANS.find(p=>p.name===u.plan);return s+(p?calcPrice(p).final:0);},0)
  };

  return (
    <div style={{minHeight:"100vh",background:"#03050f",display:"flex"}}>
      {toast&&<Toast {...toast} onClose={()=>setToast(null)}/>}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}>
        <div style={{position:"absolute",top:"-20%",left:"-10%",width:"60%",height:"60%",background:"radial-gradient(ellipse,rgba(30,60,160,.1) 0%,transparent 70%)"}}/>
      </div>

      {/* Admin Sidebar */}
      <div style={{width:210,background:"rgba(3,5,18,.98)",borderRight:"1px solid rgba(30,60,160,.22)",position:"fixed",top:0,bottom:0,left:0,zIndex:50,display:"flex",flexDirection:"column"}}>
        <div style={{padding:"20px 16px",borderBottom:"1px solid rgba(30,60,160,.2)"}}>
          <div style={{fontFamily:"'Cinzel',serif",color:aC,fontSize:12,letterSpacing:2}}>ADMIN PANEL</div>
          <div style={{color:"#2a4060",fontSize:10,marginTop:3}}>Saniyal Story Tools</div>
        </div>
        <nav style={{flex:1,padding:"10px"}}>
          {[{id:"dashboard",i:"📊",l:"Dashboard"},{id:"users",i:"👥",l:"Users"},{id:"revenue",i:"💰",l:"Revenue"}].map(n=>(
            <div key={n.id} className={`asb ${active===n.id?"on":""}`} onClick={()=>setActive(n.id)}
              style={{display:"flex",alignItems:"center",gap:9,padding:"10px 12px",borderRadius:9,marginBottom:2,
                color:active===n.id?aC:"#2a4060",background:active===n.id?"rgba(30,80,200,.12)":"transparent"}}>
              <span>{n.i}</span><span style={{fontSize:12}}>{n.l}</span>
            </div>
          ))}
        </nav>
        <div style={{padding:"13px 16px",borderTop:"1px solid rgba(30,60,160,.2)"}}>
          <div onClick={onLogout} style={{display:"flex",alignItems:"center",gap:7,padding:"8px 11px",borderRadius:8,cursor:"pointer",color:"#2a4060",fontSize:12,transition:"color .2s"}}
            onMouseEnter={e=>e.currentTarget.style.color="#f08080"} onMouseLeave={e=>e.currentTarget.style.color="#2a4060"}>
            <span>🚪</span> Logout
          </div>
        </div>
      </div>

      {/* Admin Main */}
      <div style={{marginLeft:210,flex:1,padding:"26px",overflowY:"auto",position:"relative",zIndex:1}}>

        {active==="dashboard"&&(
          <div className="fu">
            <h1 style={{fontFamily:"'Cinzel',serif",color:aC,fontSize:18,marginBottom:3}}>📊 Dashboard</h1>
            <p style={{color:"#2a4060",fontSize:12,marginBottom:22}}>Saniyal Story Tools — Overview</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))",gap:14,marginBottom:24}}>
              {[{i:"👥",l:"Total Users",v:stats.total,c:aC},{i:"✅",l:"Active",v:stats.active,c:"#60e090"},{i:"⏳",l:"Pending",v:stats.pending,c:C.gold},{i:"💰",l:"Revenue",v:fmt(stats.revenue),c:"#f0c060"}].map(s=>(
                <div key={s.l} style={{background:"rgba(4,6,18,.98)",border:"1px solid rgba(30,60,160,.2)",borderRadius:13,padding:"18px 20px"}}>
                  <div style={{fontSize:24,marginBottom:6}}>{s.i}</div>
                  <div style={{color:s.c,fontSize:18,fontFamily:"'Cinzel',serif",marginBottom:3}}>{s.v}</div>
                  <div style={{color:"#2a4060",fontSize:11}}>{s.l}</div>
                </div>
              ))}
            </div>

            <div style={{background:"rgba(4,6,18,.98)",border:"1px solid rgba(30,60,160,.2)",borderRadius:13,padding:"20px 22px"}}>
              <h3 style={{fontFamily:"'Cinzel',serif",color:aC,fontSize:13,marginBottom:14}}>⏳ Pending Users — Activate Karo</h3>
              {users.filter(u=>!u.planActive).length===0?(
                <div style={{color:"#2a4060",textAlign:"center",padding:"20px",fontSize:12}}>Koi pending user nahi ✅</div>
              ):(
                users.filter(u=>!u.planActive).map(u=>(
                  <div key={u.email} style={{background:"rgba(200,148,63,.05)",border:"1px solid rgba(200,148,63,.13)",borderRadius:9,padding:"12px 14px",marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
                      <div>
                        <div style={{color:C.text,fontSize:13,fontWeight:600}}>{u.name}</div>
                        <div style={{color:"#2a4060",fontSize:11}}>{u.email} · {u.niche}</div>
                        <a href={`https://wa.me/${WA.replace("+","")}?text=Salam ${u.name}! Aapka plan activate ho gaya hai. Login karo: https://saniyal-story-app.vercel.app`}
                          target="_blank" rel="noreferrer" style={{color:"#40c070",fontSize:11,textDecoration:"none"}}>💬 WhatsApp karo</a>
                      </div>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                        {PLANS.map(p=>(
                          <Btn key={p.id} variant="green" onClick={()=>activate(u.email,p.name,p.months)} style={{fontSize:10,padding:"5px 10px"}}>
                            ✅ {p.name}
                          </Btn>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {active==="users"&&(
          <div className="fu">
            <h1 style={{fontFamily:"'Cinzel',serif",color:aC,fontSize:18,marginBottom:3}}>👥 All Users ({users.length})</h1>
            <p style={{color:"#2a4060",fontSize:12,marginBottom:20}}>Sab registered users</p>
            {users.length===0?(
              <div style={{background:"rgba(4,6,18,.98)",border:"1px solid rgba(30,60,160,.2)",borderRadius:13,padding:"40px",textAlign:"center",color:"#2a4060"}}>
                Abhi koi user nahi — jab signup karein ge yahan dikhein ge
              </div>
            ):(
              users.map(u=>(
                <div key={u.email} style={{background:"rgba(4,6,18,.98)",border:`1px solid ${u.planActive?"rgba(30,160,70,.22)":"rgba(30,60,160,.18)"}`,borderRadius:13,padding:"16px 20px",marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
                    <div>
                      <div style={{color:C.text,fontSize:13,fontWeight:600,marginBottom:2}}>{u.name}</div>
                      <div style={{color:"#2a4060",fontSize:11,marginBottom:2}}>{u.email}</div>
                      <div style={{color:"#2a4060",fontSize:11,marginBottom:6}}>Niche: {u.niche} · Generated: {u.storiesCount||0}</div>
                      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                        <span style={{fontSize:10,padding:"3px 9px",borderRadius:99,fontWeight:600,
                          background:u.planActive?"rgba(30,160,70,.18)":"rgba(120,80,20,.18)",
                          color:u.planActive?"#60e090":C.gold}}>
                          {u.planActive?`✅ ${u.plan}`:"⏳ Pending"}
                        </span>
                        {u.planActive&&u.planExpires&&<span style={{color:"#2a4060",fontSize:10}}>Expires: {u.planExpires}</span>}
                      </div>
                    </div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {!u.planActive&&PLANS.map(p=>(
                        <Btn key={p.id} variant="green" onClick={()=>activate(u.email,p.name,p.months)} style={{fontSize:10,padding:"5px 10px"}}>✅ {p.name}</Btn>
                      ))}
                      {u.planActive&&<Btn variant="red" onClick={()=>deactivate(u.email)} style={{fontSize:10,padding:"5px 10px"}}>❌ Deactivate</Btn>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {active==="revenue"&&(
          <div className="fu">
            <h1 style={{fontFamily:"'Cinzel',serif",color:aC,fontSize:18,marginBottom:3}}>💰 Revenue</h1>
            <p style={{color:"#2a4060",fontSize:12,marginBottom:22}}>Plan-wise breakdown</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(185px,1fr))",gap:14,marginBottom:22}}>
              {PLANS.map(plan=>{
                const count=users.filter(u=>u.plan===plan.name&&u.planActive).length;
                const price=calcPrice(plan);
                return(
                  <div key={plan.id} style={{background:"rgba(4,6,18,.98)",border:"1px solid rgba(30,60,160,.2)",borderRadius:13,padding:"18px 20px"}}>
                    <div style={{fontFamily:"'Cinzel',serif",color:C.gold,fontSize:14,marginBottom:3}}>{plan.name}</div>
                    <div style={{color:aC,fontSize:19,marginBottom:3}}>{fmt(price.final)}</div>
                    {plan.discount>0&&<div style={{color:"#60e090",fontSize:10,marginBottom:8}}>{plan.discount}% OFF</div>}
                    <div style={{color:"#2a4060",fontSize:11}}>Active: <span style={{color:C.text}}>{count}</span></div>
                    <div style={{color:"#2a4060",fontSize:11,marginTop:3}}>Revenue: <span style={{color:C.gold}}>{fmt(price.final*count)}</span></div>
                  </div>
                );
              })}
            </div>
            <div style={{background:"rgba(4,6,18,.98)",border:"1px solid rgba(30,60,160,.2)",borderRadius:13,padding:"20px 24px"}}>
              <h3 style={{fontFamily:"'Cinzel',serif",color:aC,fontSize:13,marginBottom:14}}>💰 Total Summary</h3>
              <div style={{display:"flex",gap:28,flexWrap:"wrap"}}>
                <div><div style={{color:C.gold,fontFamily:"'Cinzel',serif",fontSize:22}}>{fmt(stats.revenue)}</div><div style={{color:"#2a4060",fontSize:11}}>Total Revenue</div></div>
                <div><div style={{color:"#60e090",fontFamily:"'Cinzel',serif",fontSize:22}}>{stats.active}</div><div style={{color:"#2a4060",fontSize:11}}>Active Users</div></div>
                <div><div style={{color:"#f08080",fontFamily:"'Cinzel',serif",fontSize:22}}>{stats.pending}</div><div style={{color:"#2a4060",fontSize:11}}>Pending</div></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [screen,setScreen]=useState("login");
  const [user,setUser]=useState(null);
  const [toast,setToast]=useState(null);
  const showToast=(msg,type="success")=>{setToast({msg,type});};

  const login=(u)=>{
    setUser(u);
    setScreen(u.role==="admin"?"admin":"user");
    showToast(`Welcome, ${u.name}! 🎬`);
  };

  const logout=()=>{setUser(null);setScreen("login");};

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:C.bg,minHeight:"100vh"}}>
      {toast&&<Toast {...toast} onClose={()=>setToast(null)}/>}
      {screen==="login"   &&<LoginScreen onLogin={login} onSignup={()=>setScreen("signup")} onPricing={()=>setScreen("pricing")}/>}
      {screen==="signup"  &&<SignupScreen onLogin={()=>setScreen("login")}/>}
      {screen==="pricing" &&<PricingScreen onLogin={()=>setScreen("login")}/>}
      {screen==="user"    &&user&&<UserDash user={user} onLogout={logout}/>}
      {screen==="admin"   &&<AdminPanel onLogout={logout}/>}
    </div>
  );
}
