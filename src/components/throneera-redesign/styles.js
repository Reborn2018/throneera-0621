export const REDESIGN_CSS = String.raw`*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
html,body{height:100%}
body{background:#0a0a0c;font-family:'EB Garamond',Georgia,serif;color:#fff;-webkit-font-smoothing:antialiased;overflow:hidden}

/* ============ PREVIEW HARNESS (not part of product) ============ */
.harness{height:100%;display:flex;flex-direction:column}
.harness-bar{flex-shrink:0;display:flex;align-items:center;gap:14px;padding:10px 16px;background:#111114;border-bottom:1px solid rgba(255,255,255,.08);font-family:'Barlow Condensed',sans-serif;z-index:50}
.harness-brand{font-weight:700;letter-spacing:2px;font-size:14px;color:#c9a44c;text-transform:uppercase}
.harness-tag{font-size:11px;letter-spacing:1px;color:#6a6a72;text-transform:uppercase}
.harness-seg{display:flex;gap:4px;margin-left:auto;background:#080809;border:1px solid rgba(255,255,255,.08);border-radius:7px;padding:3px}
.harness-seg button{font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:600;letter-spacing:1px;text-transform:uppercase;padding:6px 14px;border:none;background:none;color:#8a8a92;border-radius:5px;cursor:pointer;transition:.2s}
.harness-seg button.on{background:#26262c;color:#fff}
.harness-steps{display:flex;gap:2px}
.harness-steps button{font-family:'Barlow Condensed',sans-serif;font-size:12px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;padding:6px 11px;border:none;background:none;color:#6a6a72;border-radius:5px;cursor:pointer;transition:.2s}
.harness-steps button.on{color:#c9a44c}
.harness-steps button:hover{color:#bcbcc4}

/* ============ STAGE — phone-framed mobile-first preview ============ */
.stage{flex:1;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center}
.stage-bg{position:absolute;inset:0;z-index:0;transition:opacity .6s}
.phone{position:relative;z-index:1;width:412px;max-width:100%;height:min(880px,calc(100vh - 124px));border-radius:42px;overflow:hidden;box-shadow:0 40px 120px rgba(0,0,0,.7),0 0 0 10px #141416,0 0 0 12px rgba(255,255,255,.06);background:#000}
@media(max-width:520px){.stage{align-items:stretch;justify-content:stretch}.phone{width:100%;height:100%;max-width:100%;border-radius:0;box-shadow:none}.harness-bar{flex-wrap:wrap;gap:8px}}
.viewport{position:absolute;inset:0;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch}
.viewport::-webkit-scrollbar{width:0}

/* ============ SCREEN BASE ============ */
.screen{min-height:100%;position:relative;isolation:isolate}
.fadein{animation:fadeSlide .5s ease both}
@keyframes fadeSlide{from{transform:translateY(7px)}to{transform:none}}
@keyframes rise{from{transform:translateY(15px)}to{transform:none}}
.stagger>*{animation:rise .55s cubic-bezier(.2,.8,.2,1) both}
.stagger>*:nth-child(1){animation-delay:.05s}
.stagger>*:nth-child(2){animation-delay:.14s}
.stagger>*:nth-child(3){animation-delay:.23s}
.stagger>*:nth-child(4){animation-delay:.32s}
.stagger>*:nth-child(5){animation-delay:.41s}
.stagger>*:nth-child(6){animation-delay:.5s}

/* ===================================================================
   THEME: QUEEN — Candlelit Court (warm, jewel-box, intimate)
   =================================================================== */
.theme-queen{
  --bg:#15080e; --bg2:#250c18; --bg3:#3a1020;
  --ink:#f4e7d6; --ink-soft:#cdb29c; --ink-dim:#9b7d72;
  --gold:#e8b24a; --gold-light:#f4d98a; --gold-deep:#b07c24; --gold-soft:rgba(232,178,74,.16);
  --rose:#c4324f; --rose-deep:#7d1f33;
  --jewel:#2f7d63; --line:rgba(232,178,74,.22);
  --surface:rgba(58,18,34,.55); --surface-2:rgba(74,24,44,.6);
  --display:'Cormorant Garamond',serif; --body:'EB Garamond',serif;
}
.bg-queen{background:
  radial-gradient(120% 80% at 50% -10%,rgba(232,178,74,.16),transparent 55%),
  radial-gradient(90% 60% at 80% 110%,rgba(196,50,79,.18),transparent 60%),
  radial-gradient(70% 50% at 12% 95%,rgba(47,125,99,.12),transparent 60%),
  linear-gradient(165deg,#1c0a12 0%,#11060c 55%,#0a0407 100%);}
.bg-queen::after{content:"";position:absolute;inset:0;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cg fill='none' stroke='%23e8b24a' stroke-width='.6' opacity='.05'%3E%3Cpath d='M90 20c18 22 18 38 0 60-18-22-18-38 0-60zM90 100c18 22 18 38 0 60-18-22-18-38 0-60zM20 90c22-18 38-18 60 0-22 18-38 18-60 0zM100 90c22-18 38-18 60 0-22 18-38 18-60 0z'/%3E%3C/g%3E%3C/svg%3E");opacity:.6;mix-blend-mode:screen}

/* ===================================================================
   THEME: NAPOLEON — Campaign Map Room (cool teal night + parchment)
   =================================================================== */
.theme-napoleon{
  --bg:#0d1f26; --bg2:#123039; --bg3:#1a4350;
  --ink:#ede2c8; --ink-soft:#b9c4bf; --ink-dim:#7d9088;
  --gold:#d09a3c; --gold-light:#e6c074; --gold-deep:#9a6d20; --gold-soft:rgba(208,154,60,.16);
  --rose:#a23a2c; --rose-deep:#6e2418;
  --jewel:#3f7f87; --line:rgba(208,154,60,.22);
  --surface:rgba(20,46,55,.6); --surface-2:rgba(28,60,70,.62);
  --parch:#d9c8a0; --parch-ink:#22160c;
  --display:'Cinzel',serif; --body:'Spectral',serif;
}
.bg-napoleon{background:
  radial-gradient(120% 70% at 50% -10%,rgba(208,154,60,.14),transparent 55%),
  radial-gradient(80% 60% at 15% 100%,rgba(63,127,135,.2),transparent 60%),
  radial-gradient(70% 50% at 90% 90%,rgba(162,58,44,.14),transparent 60%),
  linear-gradient(165deg,#10262e 0%,#0b1c23 60%,#08161b 100%);}
.bg-napoleon::after{content:"";position:absolute;inset:0;
  background-image:linear-gradient(rgba(208,154,60,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(208,154,60,.05) 1px,transparent 1px);
  background-size:46px 46px;mask-image:radial-gradient(circle at 50% 40%,#000,transparent 80%);opacity:.5}

/* shared grain */
.grain{position:absolute;inset:0;pointer-events:none;z-index:5;opacity:.4;mix-blend-mode:overlay;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E")}

/* ============ TYPOGRAPHY / SHARED ATOMS ============ */
.kicker{font-family:var(--body);font-size:12px;letter-spacing:4px;text-transform:uppercase;color:var(--gold);opacity:.85}
.theme-napoleon .kicker{font-family:'Barlow Condensed',sans-serif;font-weight:600;letter-spacing:5px}
.eyebrow{font-family:'Barlow Condensed',sans-serif;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:var(--ink-dim)}

.btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:54px;padding:16px 22px;border:none;border-radius:13px;cursor:pointer;font-size:17px;letter-spacing:.4px;transition:transform .15s,box-shadow .3s,filter .3s;position:relative;overflow:hidden}
.btn-primary{background:linear-gradient(135deg,var(--gold) 0%,var(--gold-deep) 100%);color:#1a0f04;font-weight:700;box-shadow:0 10px 30px var(--gold-soft),inset 0 1px 0 rgba(255,255,255,.3)}
.theme-queen .btn-primary{font-family:var(--display);font-weight:600;font-size:19px;letter-spacing:.6px}
.theme-napoleon .btn-primary{font-family:'Cinzel',serif;font-weight:700;font-size:16px;letter-spacing:1px;text-transform:uppercase;border-radius:8px}
.btn-primary::after{content:"";position:absolute;top:0;left:-60%;width:40%;height:100%;background:linear-gradient(105deg,transparent,rgba(255,255,255,.45),transparent);transform:skewX(-18deg);animation:sheen 4.5s ease-in-out infinite}
@keyframes sheen{0%,72%{left:-60%}88%,100%{left:130%}}
.btn-primary:hover{transform:translateY(-2px);filter:brightness(1.06)}
.btn-primary:active{transform:translateY(0)}
.btn-ghost{background:var(--surface);border:1px solid var(--line);color:var(--ink);font-family:var(--body)}
.theme-napoleon .btn-ghost{border-radius:8px;font-family:'Barlow Condensed',sans-serif;letter-spacing:1px;text-transform:uppercase;font-size:14px}
.btn-ghost:hover{background:var(--surface-2)}
.btn-text{background:none;border:none;color:var(--ink-dim);font-family:var(--body);font-size:15px;cursor:pointer;padding:10px;text-decoration:underline;text-underline-offset:3px}
.btn-text:hover{color:var(--ink-soft)}

.legal{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;padding:18px 0 24px}
.legal a{font-family:'Barlow Condensed',sans-serif;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:var(--ink-dim);text-decoration:none;opacity:.7}
.legal a:hover{opacity:1;color:var(--gold)}

.brandbar{display:flex;align-items:center;justify-content:space-between;padding:16px 22px;position:relative;z-index:6}
.bb-lockup{display:flex;align-items:center;gap:10px}
.bb-logo{width:34px;height:34px;border-radius:50%;box-shadow:0 2px 10px rgba(0,0,0,.5),0 0 0 1px var(--line)}
.bb-name{font-family:'Cinzel',serif;font-size:14px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--gold)}
.bb-tagline{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--ink-dim)}

/* ============ LANDING (cinematic, ad message-match) ============ */
.landing{display:flex;flex-direction:column;min-height:100%;position:relative;z-index:6}
.land-cinema{position:relative;min-height:74vh;display:flex;flex-direction:column;background-size:cover;background-position:50% 28%;background-repeat:no-repeat;overflow:hidden}
.land-cinema::after{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(180deg,rgba(7,7,12,.62) 0%,rgba(7,7,12,.12) 26%,rgba(7,7,12,.20) 52%,rgba(7,7,12,.82) 80%,var(--bg) 100%)}
/* gold ornamental frame + corner motifs (mirrors the ad creative) */
.land-frame{position:absolute;inset:11px;z-index:3;border:1px solid var(--line);pointer-events:none}
.land-frame::before{content:"";position:absolute;inset:3px;border:1px solid rgba(208,154,60,.12)}
.lf-corner{position:absolute;color:var(--gold);font-size:13px;opacity:.7;line-height:1}
.lf-corner.tl{top:-8px;left:-7px}.lf-corner.tr{top:-8px;right:-7px}
.lf-corner.bl{bottom:-9px;left:-6px;font-size:11px}.lf-corner.br{bottom:-9px;right:-6px;font-size:11px}
.land-cinema-head{position:relative;z-index:4;display:flex;align-items:center;justify-content:center;padding:22px 26px 0}
.land-cinema-head .bb-logo{width:40px;height:40px}
.land-cinema-head .bb-name{font-family:'Cinzel',serif;font-size:15px}
.land-eyebrow{position:relative;z-index:4;text-align:center;margin-top:10px}
.land-eyebrow span{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:var(--gold);opacity:.92;position:relative}
.land-eyebrow span::before,.land-eyebrow span::after{content:"\2014";margin:0 9px;opacity:.5}
.land-cinema-copy{position:relative;z-index:4;margin-top:auto;padding:0 26px 30px;text-align:center}
.land-title{font-family:var(--display);font-size:44px;line-height:1.0;font-weight:700;color:var(--ink);letter-spacing:-.3px;text-wrap:balance;margin-bottom:14px;text-shadow:0 3px 24px rgba(0,0,0,.7)}
.theme-queen .land-title{font-style:italic;font-weight:600}
.theme-napoleon .land-title{font-weight:800;text-transform:uppercase;font-size:39px;letter-spacing:.5px;line-height:1.04}
.land-tagline{font-family:var(--body);font-size:16px;line-height:1.5;color:var(--ink-soft);margin:0 auto 20px;max-width:340px;text-wrap:pretty;text-shadow:0 2px 12px rgba(0,0,0,.8)}
.theme-queen .land-tagline{font-style:italic}
.land-cta-sub{font-family:var(--body);font-size:13px;color:var(--ink-soft);margin-top:12px;letter-spacing:.3px;text-shadow:0 1px 8px rgba(0,0,0,.8)}
.land-support{position:relative;z-index:6;padding:24px 26px 4px;text-align:center}
.land-trust{display:flex;gap:0;justify-content:center;margin-bottom:20px}
.land-trust span{font-family:'Barlow Condensed',sans-serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:var(--ink-soft);padding:0 14px;position:relative}
.land-trust span+span::before{content:"";position:absolute;left:0;top:50%;transform:translateY(-50%);width:1px;height:11px;background:var(--line)}
.land-body{font-family:var(--body);font-size:14.5px;line-height:1.55;color:var(--ink-dim);max-width:320px;margin:0 auto 22px;text-wrap:pretty}
.cta-bottom{margin-bottom:6px}

/* ============ START / IDENTITY ============ */
.pad{padding:6px 24px 28px;position:relative;z-index:6}
.sec-head{font-family:var(--display);font-size:34px;font-weight:600;color:var(--ink);text-align:center;margin-bottom:6px}
.theme-queen .sec-head{font-style:italic}
.theme-napoleon .sec-head{text-transform:uppercase;font-size:28px;letter-spacing:.5px}
.sec-sub{font-family:var(--body);font-size:15px;color:var(--ink-dim);text-align:center;margin-bottom:24px;text-wrap:pretty}
.field-label{font-family:'Barlow Condensed',sans-serif;font-size:12px;letter-spacing:2.5px;text-transform:uppercase;color:var(--gold);margin:22px 0 11px;display:block}
.name-input{width:100%;padding:15px 18px;background:var(--surface);border:1px solid var(--line);border-radius:11px;color:var(--ink);font-family:var(--display);font-size:21px;outline:none;transition:.2s}
.theme-queen .name-input{font-style:italic}
.theme-napoleon .name-input{border-radius:7px;font-family:'Spectral',serif}
.name-input::placeholder{color:var(--ink-dim);opacity:.6}
.name-input:focus{border-color:var(--gold);background:var(--surface-2)}
.choice-cards{display:flex;flex-direction:column;gap:10px}
.ccard{display:flex;align-items:center;gap:14px;width:100%;text-align:left;padding:15px 16px;background:var(--surface);border:1px solid var(--line);border-radius:12px;cursor:pointer;transition:.2s;color:var(--ink);position:relative;overflow:hidden}
.theme-napoleon .ccard{border-radius:8px}
.ccard:hover{background:var(--surface-2);border-color:var(--gold-deep)}
.ccard.sel{border-color:var(--gold);background:var(--surface-2);box-shadow:0 0 0 1px var(--gold),0 8px 24px var(--gold-soft)}
.ccard.sel::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--gold)}
.ccard-mark{flex-shrink:0;width:26px;height:26px;border-radius:50%;border:1.5px solid var(--line);display:flex;align-items:center;justify-content:center;color:var(--gold);font-size:13px;transition:.2s}
.ccard.sel .ccard-mark{background:var(--gold);border-color:var(--gold);color:#1a0f04}
.ccard-body{flex:1}
.ccard-label{font-family:var(--display);font-size:19px;font-weight:600;color:var(--ink);line-height:1.1}
.theme-queen .ccard-label{font-style:italic}
.theme-napoleon .ccard-label{font-size:16px;text-transform:uppercase;letter-spacing:.5px;font-weight:700}
.ccard-desc{font-family:var(--body);font-size:14px;color:var(--ink-dim);margin-top:2px}
.start-cta-wrap{margin-top:28px}

/* ============ PLAY / STORY ============ */
.play-top{display:flex;align-items:center;justify-content:space-between;padding:14px 22px;position:relative;z-index:7;border-bottom:1px solid var(--line);background:linear-gradient(180deg,rgba(0,0,0,.25),transparent)}
.turn-pill{font-family:'Barlow Condensed',sans-serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:var(--gold);display:flex;align-items:center;gap:9px}
.turn-dots{display:flex;gap:4px}
.turn-dots i{width:6px;height:6px;border-radius:50%;background:var(--line);display:block}
.turn-dots i.on{background:var(--gold);box-shadow:0 0 6px var(--gold-soft)}
.realm-btn{font-family:'Barlow Condensed',sans-serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:var(--ink-soft);background:var(--surface);border:1px solid var(--line);border-radius:20px;padding:7px 14px;cursor:pointer;display:flex;align-items:center;gap:7px}
.realm-btn:hover{border-color:var(--gold-deep);color:var(--ink)}
.play-body{padding:26px 24px 20px;position:relative;z-index:6}
.scene-place{font-family:'Barlow Condensed',sans-serif;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:var(--ink-dim);text-align:center;margin-bottom:10px}
.scene-place::before,.scene-place::after{content:"\00B7";margin:0 8px;color:var(--gold)}
.scene-title{font-family:var(--display);font-size:33px;font-weight:600;color:var(--ink);text-align:center;line-height:1.05;margin-bottom:20px}
.theme-queen .scene-title{font-style:italic}
.theme-napoleon .scene-title{text-transform:uppercase;font-size:27px;letter-spacing:.5px}
.scene-rule{height:1px;width:64px;margin:0 auto 20px;background:linear-gradient(90deg,transparent,var(--gold),transparent)}
.scene-text{font-family:var(--body);font-size:17.5px;line-height:1.66;color:var(--ink);text-wrap:pretty;margin-bottom:24px}
.theme-queen .scene-text{font-size:18px}
.scene-text::first-letter{font-family:var(--display);font-size:3.4em;float:left;line-height:.74;padding:6px 10px 0 0;color:var(--gold);font-weight:700}
.choices{display:flex;flex-direction:column;gap:11px}
.choice{display:flex;align-items:flex-start;gap:13px;width:100%;text-align:left;padding:16px 16px;background:var(--surface);border:1px solid var(--line);border-radius:13px;cursor:pointer;transition:.22s;color:var(--ink);position:relative;overflow:hidden}
.theme-napoleon .choice{border-radius:8px}
.choice:hover{background:var(--surface-2);border-color:var(--gold);transform:translateX(3px)}
.choice-tone{position:absolute;top:0;right:0;font-family:'Barlow Condensed',sans-serif;font-size:9.5px;letter-spacing:1.5px;text-transform:uppercase;color:var(--gold);background:var(--gold-soft);padding:3px 9px;border-bottom-left-radius:9px}
.choice-num{flex-shrink:0;width:30px;height:30px;border-radius:50%;border:1.5px solid var(--gold-deep);color:var(--gold);font-family:var(--display);font-weight:700;font-size:16px;display:flex;align-items:center;justify-content:center;margin-top:1px}
.theme-napoleon .choice-num{border-radius:6px;font-family:'Cinzel',serif;font-size:14px}
.choice-label{flex:1;font-family:var(--body);font-size:16px;line-height:1.4;padding-right:8px;padding-top:3px}
.custom-toggle{margin-top:14px;width:100%;padding:13px;background:none;border:1px dashed var(--line);border-radius:11px;color:var(--ink-dim);font-family:var(--body);font-size:15px;cursor:pointer;transition:.2s;display:flex;align-items:center;justify-content:center;gap:8px}
.custom-toggle:hover{border-color:var(--gold-deep);color:var(--ink-soft)}
.custom-box{margin-top:14px}
.custom-area{width:100%;padding:14px;background:var(--surface);border:1px solid var(--line);border-radius:11px;color:var(--ink);font-family:var(--body);font-size:16px;resize:none;outline:none;line-height:1.5}
.custom-area:focus{border-color:var(--gold)}
.custom-row{display:flex;justify-content:flex-end;gap:9px;margin-top:9px}

/* ===== HUD: live reactive stakes strip ===== */
.hud{display:flex;gap:10px;padding:13px 22px;position:relative;z-index:7;border-bottom:1px solid var(--line);background:linear-gradient(180deg,rgba(0,0,0,.22),transparent)}
.hud-stat{flex:1;position:relative}
.hud-meta{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:5px}
.hud-name{font-family:'Barlow Condensed',sans-serif;font-size:10.5px;letter-spacing:1px;text-transform:uppercase;color:var(--ink-dim)}
.hud-num{font-family:'Barlow Condensed',sans-serif;font-size:15px;font-weight:700;letter-spacing:.5px;transition:color .4s}
.hud-bar{height:5px;border-radius:4px;background:rgba(255,255,255,.08);overflow:hidden}
.hud-fill{height:100%;border-radius:4px;transition:width .85s cubic-bezier(.2,.9,.25,1),background .5s}
.hud-stat.alarm .hud-name{color:var(--rose)}
.hud-stat.alarm{animation:alarmPulse 1.8s ease-in-out infinite}
@keyframes alarmPulse{0%,100%{filter:none}50%{filter:drop-shadow(0 0 6px var(--rose))}}
.hud-delta{position:absolute;right:0;top:-6px;font-family:'Barlow Condensed',sans-serif;font-size:15px;font-weight:700;animation:floatUp 1.5s cubic-bezier(.2,.8,.2,1) forwards;pointer-events:none}
.hud-delta.up{color:var(--jewel)}
.hud-delta.down{color:var(--rose)}
@keyframes floatUp{0%{opacity:0;transform:translateY(8px) scale(.8)}18%{opacity:1;transform:translateY(0) scale(1.1)}70%{opacity:1}100%{opacity:0;transform:translateY(-18px)}}

/* ===== choice seal + flash ===== */
.choice.dim{opacity:.32;filter:saturate(.5)}
.choice.sealed{border-color:var(--gold)!important;background:var(--surface-2)!important;box-shadow:0 0 0 1px var(--gold),0 10px 30px var(--gold-soft);transform:scale(1.01)}
.choice.sealed .choice-num{background:var(--gold);color:#1a0f04;border-color:var(--gold);transition:.25s}
.fx-flash::before{content:"";position:absolute;inset:0;z-index:30;pointer-events:none;background:radial-gradient(circle at 50% 42%,var(--gold-soft),transparent 60%);animation:flashOut .42s ease-out forwards}
@keyframes flashOut{0%{opacity:.9}100%{opacity:0}}

/* ===== consequence / result beat ===== */
.result-body{display:flex;flex-direction:column;animation:fadeSlide .45s ease both}
.result-kicker{font-family:'Barlow Condensed',sans-serif;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:var(--gold);text-align:center;margin-bottom:14px}
/* verdict stamp — slams in like a wax seal */
.verdict-stamp{align-self:center;font-family:'Cinzel',serif;font-weight:800;font-size:15px;letter-spacing:3px;text-transform:uppercase;color:var(--gold);border:2px solid var(--gold);border-radius:8px;padding:7px 18px;margin-bottom:16px;transform:rotate(-6deg);position:relative;opacity:.92;box-shadow:0 0 0 3px var(--gold-soft);animation:stampIn .5s cubic-bezier(.2,1.4,.4,1) both}
.theme-napoleon .verdict-stamp{border-radius:4px}
@keyframes stampIn{0%{opacity:0;transform:rotate(-6deg) scale(2.2)}60%{opacity:1}100%{opacity:.92;transform:rotate(-6deg) scale(1)}}
/* danger edge flash when an inverted stat spikes */
.fx-danger::after{content:"";position:absolute;inset:0;z-index:29;pointer-events:none;box-shadow:inset 0 0 60px 8px var(--rose);animation:dangerPulse .9s ease-out forwards}
@keyframes dangerPulse{0%{opacity:.85}100%{opacity:0}}
/* triumph burst when a big positive swing lands — matches danger's intensity */
.fx-triumph::after{content:"";position:absolute;inset:0;z-index:29;pointer-events:none;box-shadow:inset 0 0 70px 10px var(--gold);animation:triumphPulse 1.05s ease-out forwards}
@keyframes triumphPulse{0%{opacity:.7}100%{opacity:0}}
.triumph-rays{position:absolute;inset:0;z-index:28;pointer-events:none;background:radial-gradient(circle at 50% 38%, var(--gold-soft) 0%, transparent 52%);animation:rayspin 1.1s ease-out forwards}
@keyframes rayspin{0%{opacity:0;transform:scale(.5)}25%{opacity:.9}100%{opacity:0;transform:scale(1.5)}}
/* ===== A: rising-threat strip (escalates toward the paywall) ===== */
.threat-strip{display:flex;align-items:center;gap:9px;margin:0 22px;padding:8px 13px;background:linear-gradient(90deg,rgba(196,50,79,.14),transparent);border-left:2px solid var(--rose);border-radius:0 8px 8px 0}
.threat-glyph{color:var(--rose);font-size:13px;flex-shrink:0;animation:threatBlink 2.2s ease-in-out infinite}
@keyframes threatBlink{0%,100%{opacity:.6}50%{opacity:1}}
.threat-text{font-family:'Barlow Condensed',sans-serif;font-size:12.5px;letter-spacing:1px;text-transform:uppercase;color:var(--rose);opacity:.92}
.theme-queen .threat-text{font-family:var(--body);font-style:italic;letter-spacing:.3px;text-transform:none;font-size:14px;color:#d98a9a}

/* ===== B: recall note (the world remembers your earlier decree) ===== */
.recall-note{position:relative;margin:0 0 12px;padding:10px 14px 10px 16px;background:rgba(212,168,67,.07);border:1px dashed var(--line);border-radius:10px;font-family:var(--body);font-size:14.5px;font-style:italic;color:var(--ink-soft);line-height:1.45}
.theme-napoleon .recall-note{border-radius:6px}
.recall-tag{display:block;font-family:'Barlow Condensed',sans-serif;font-size:10px;font-style:normal;letter-spacing:2px;text-transform:uppercase;color:var(--gold);margin-bottom:3px}

/* court reaction voice — a character speaks to YOU */
.voice-card{display:flex;flex-direction:column;gap:5px;align-self:stretch;margin-bottom:16px;padding:13px 16px;background:linear-gradient(180deg,var(--surface-2),transparent);border-left:3px solid var(--gold);border-radius:0 10px 10px 0;animation:voiceIn .5s cubic-bezier(.2,.8,.2,1) both}

/* ===== 大臣汇报 council report (avatar + dialogue) ===== */
.council{margin-bottom:20px}
.council-head{display:flex;align-items:center;gap:13px;margin-bottom:12px}
.council-portrait{width:62px;height:62px;border-radius:50%;flex-shrink:0;position:relative;padding:2px;background:linear-gradient(145deg,var(--gold),var(--gold-deep));box-shadow:0 4px 16px rgba(0,0,0,.5),0 0 0 1px var(--line)}
.council-portrait::after{content:"";position:absolute;inset:-3px;border-radius:50%;border:1px solid var(--gold-soft);pointer-events:none}
.council-img{width:100%;height:100%;border-radius:50%;object-fit:cover;object-position:50% 22%;display:block;background:var(--bg2)}
.council-portrait.noimg{background:var(--surface-2)}
.council-who{display:flex;flex-direction:column;gap:2px}
.council-name{font-family:var(--display);font-size:21px;font-weight:600;color:var(--ink);line-height:1}
.theme-queen .council-name{font-style:italic}
.theme-napoleon .council-name{font-family:'Cinzel',serif;font-size:18px;text-transform:uppercase;letter-spacing:.5px}
.council-title{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--gold)}
.council-bubble{position:relative;background:var(--surface);border:1px solid var(--line);border-radius:4px 14px 14px 14px;padding:16px 17px;box-shadow:0 6px 22px rgba(0,0,0,.3)}
.theme-napoleon .council-bubble{border-radius:3px 8px 8px 8px}
.council-bubble::before{content:"";position:absolute;top:-8px;left:20px;width:14px;height:14px;background:var(--surface);border-left:1px solid var(--line);border-top:1px solid var(--line);transform:rotate(45deg)}
.council-report{font-family:var(--body);font-size:17px;line-height:1.6;color:var(--ink);text-wrap:pretty}
.theme-queen .council-report{font-size:17.5px}
.council-report::first-letter{font-family:var(--display);font-size:2.7em;float:left;line-height:.72;padding:5px 8px 0 0;color:var(--gold);font-weight:700}

/* ===== decree label above the choices ===== */
.decree-label{font-family:'Barlow Condensed',sans-serif;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:var(--gold);text-align:center;margin:6px 0 12px;position:relative}
.decree-label::before,.decree-label::after{content:"";position:absolute;top:50%;width:42px;height:1px;background:linear-gradient(90deg,transparent,var(--gold-deep));}
.decree-label::before{left:8px}.decree-label::after{right:8px;transform:scaleX(-1)}

/* ===== 印玺仪式 decree seal ritual — premium slow→fast→settle ===== */
.decree-ritual{position:absolute;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;pointer-events:auto;cursor:pointer;overflow:hidden}
.dr-scrim{position:absolute;inset:0;background:radial-gradient(circle at 50% 44%,rgba(8,6,14,.5),rgba(6,4,10,.86));animation:drScrim .45s ease both}
@keyframes drScrim{from{opacity:0}to{opacity:1}}
/* rotating godrays bloom behind the seal */
.dr-rays{position:absolute;top:44%;left:50%;width:560px;height:560px;transform:translate(-50%,-50%) scale(.4);opacity:0;z-index:1;pointer-events:none;
  background:repeating-conic-gradient(from 0deg at 50% 50%, var(--gold-soft) 0deg 4deg, transparent 4deg 13deg);
  -webkit-mask-image:radial-gradient(circle,#000 8%,transparent 62%);mask-image:radial-gradient(circle,#000 8%,transparent 62%);
  animation:drRaysIn .9s cubic-bezier(.2,.7,.3,1) .5s both, drRaysSpin 9s linear .5s infinite}
@keyframes drRaysIn{from{opacity:0;transform:translate(-50%,-50%) scale(.4)}to{opacity:.55;transform:translate(-50%,-50%) scale(1)}}
@keyframes drRaysSpin{to{transform:translate(-50%,-50%) rotate(360deg) scale(1)}}
/* gold impact bloom */
.dr-burst{position:absolute;top:44%;left:50%;width:240px;height:240px;border-radius:50%;transform:translate(-50%,-50%) scale(.2);opacity:0;z-index:2;pointer-events:none;
  background:radial-gradient(circle,rgba(255,238,190,.95),var(--gold-soft) 40%,transparent 70%);
  animation:drBurst .6s ease-out .66s both}
@keyframes drBurst{0%{opacity:0;transform:translate(-50%,-50%) scale(.2)}30%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(1.9)}}
.dr-seal{position:relative;z-index:4;top:-6%;width:148px;height:148px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  animation:sealDrop .95s both, sealShake .12s ease-in-out .72s 2}
.dr-seal-img{width:100%;height:100%;border-radius:50%;box-shadow:0 0 0 4px var(--gold),0 0 46px 8px var(--gold-soft),0 22px 54px rgba(0,0,0,.75);animation:sealFlash 1s ease-out .66s both}
@keyframes sealDrop{
  0%{transform:translateY(-185px) scale(1.75) rotate(-17deg);opacity:0}
  14%{opacity:1}
  52%{transform:translateY(-120px) scale(1.5) rotate(-12deg)}
  72%{transform:translateY(9px) scale(.82) rotate(3deg)}
  84%{transform:translateY(-5px) scale(1.08) rotate(-1deg)}
  100%{transform:translateY(0) scale(1) rotate(0);opacity:1}}
@keyframes sealFlash{0%{filter:brightness(2.1) saturate(1.3)}26%{filter:brightness(2.1)}100%{filter:brightness(1)}}
@keyframes sealShake{0%,100%{margin-left:0}25%{margin-left:-7px}75%{margin-left:7px}}
.dr-shock{position:absolute;top:44%;left:50%;width:150px;height:150px;border-radius:50%;border:2.5px solid var(--gold);transform:translate(-50%,-50%) scale(.5);opacity:0;z-index:3;animation:shock .85s ease-out .68s both}
.dr-shock2{border-color:var(--gold-light);border-width:1.5px;animation-delay:.82s}
@keyframes shock{0%{opacity:.85;transform:translate(-50%,-50%) scale(.55)}100%{opacity:0;transform:translate(-50%,-50%) scale(3.8)}}
.dr-label{position:absolute;z-index:5;bottom:27%;left:0;right:0;text-align:center;font-family:'Cinzel',serif;font-weight:800;font-size:21px;letter-spacing:3px;text-transform:uppercase;color:var(--gold);text-shadow:0 2px 22px rgba(0,0,0,.95),0 0 18px var(--gold-soft);animation:drLabel .7s cubic-bezier(.2,.8,.3,1) .8s both}
@keyframes drLabel{0%{opacity:0;transform:translateY(16px);letter-spacing:0}100%{opacity:1;transform:none;letter-spacing:7px}}
.dr-skip{position:absolute;z-index:5;bottom:16%;left:0;right:0;text-align:center;font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--ink-dim);opacity:0;animation:drSkip .5s ease 1.15s both}
@keyframes drSkip{to{opacity:.7}}

/* ===== 局势剧变 situation-change headline ===== */
.situation-headline{font-family:'Cinzel',serif;font-weight:800;font-size:26px;line-height:1.05;letter-spacing:1px;text-transform:uppercase;text-align:center;color:var(--gold);margin:4px 0 16px;text-shadow:0 2px 22px var(--gold-soft);animation:sitIn .7s cubic-bezier(.2,.9,.3,1) both}
.theme-queen .situation-headline{font-family:'Cormorant Garamond',serif;font-weight:700;font-size:30px;letter-spacing:.5px}
@keyframes sitIn{0%{opacity:0;transform:scale(1.18)}60%{opacity:1}100%{opacity:1;transform:scale(1)}}
.theme-napoleon .voice-card{border-radius:0 6px 6px 0}
@keyframes voiceIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:none}}
.voice-who{font-family:'Barlow Condensed',sans-serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:var(--gold)}
.voice-line{font-family:var(--display);font-size:18px;font-style:italic;line-height:1.4;color:var(--ink);text-wrap:pretty}
.result-echo{font-family:var(--display);font-size:17px;color:var(--ink-dim);text-align:center;margin-bottom:18px;line-height:1.3}
.theme-queen .result-echo{font-style:italic}
.result-card{background:var(--surface);border:1px solid var(--line);border-left:3px solid var(--gold);border-radius:0 13px 13px 0;padding:20px 18px;margin-bottom:18px;position:relative}
.theme-napoleon .result-card{border-radius:0 8px 8px 0}
.result-text{font-family:var(--body);font-size:18px;line-height:1.62;color:var(--ink);text-wrap:pretty;min-height:1.6em}
.theme-queen .result-text{font-style:italic;font-size:18.5px}
.tw-caret{display:inline-block;width:9px;height:1.05em;vertical-align:-2px;margin-left:1px;background:var(--gold);animation:blink .8s steps(1) infinite}
@keyframes blink{50%{opacity:0}}
.result-deltas{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:22px}
.rd-chip{font-family:'Barlow Condensed',sans-serif;font-size:12.5px;font-weight:600;letter-spacing:.6px;text-transform:uppercase;padding:6px 12px;border-radius:20px;border:1px solid;animation:chipIn .5s cubic-bezier(.2,.8,.2,1) both}
.rd-chip.up{color:var(--jewel);border-color:var(--jewel);background:rgba(47,125,99,.12)}
.rd-chip.down{color:var(--rose);border-color:var(--rose-deep);background:rgba(196,50,79,.1)}
.rd-chip:nth-child(2){animation-delay:.08s}
.rd-chip:nth-child(3){animation-delay:.16s}
.rd-chip:nth-child(4){animation-delay:.24s}
@keyframes chipIn{from{opacity:0;transform:translateY(8px) scale(.9)}to{opacity:1;transform:none}}
.result-tension{font-family:var(--display);font-size:16px;font-style:italic;color:var(--ink-dim);text-align:center;margin-top:14px;animation:fadeSlide 1s ease .4s both}

/* ===== paywall loss line ===== */
.pw-loss{font-family:'Barlow Condensed',sans-serif;font-size:13px;letter-spacing:1px;text-transform:uppercase;color:var(--rose);text-align:center;margin:-6px 0 16px;padding:9px 14px;border:1px solid var(--rose-deep);border-radius:8px;background:rgba(196,50,79,.08)}
.opt-hint{font-size:10px;letter-spacing:1px;color:var(--ink-dim);opacity:.6;text-transform:none}

/* ===== paywall recap (sunk cost) ===== */
.recap-card{background:linear-gradient(180deg,var(--surface-2),var(--surface));border:1px solid var(--line);border-radius:14px;padding:16px 17px;margin-bottom:20px;position:relative;overflow:hidden}
.theme-napoleon .recap-card{border-radius:9px}
.recap-card::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:linear-gradient(180deg,var(--gold),transparent)}
.recap-top{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:3px}
.recap-label{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--gold)}
.recap-name{font-family:var(--display);font-size:21px;color:var(--ink);font-weight:600}
.theme-queen .recap-name{font-style:italic}
.theme-napoleon .recap-name{font-size:18px;text-transform:uppercase;letter-spacing:.5px}
.recap-identity{font-family:var(--body);font-size:13px;color:var(--ink-dim);margin-bottom:12px;letter-spacing:.3px}
.recap-decisions{list-style:none;margin:0 0 14px;padding:0;border-top:1px solid rgba(255,255,255,.07)}
.recap-decisions li{display:flex;align-items:flex-start;gap:9px;font-family:var(--body);font-size:13.5px;line-height:1.35;color:var(--ink-soft);padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05)}
.recap-tone{flex-shrink:0;font-family:'Barlow Condensed',sans-serif;font-size:9.5px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--gold);background:var(--gold-soft);padding:2px 7px;border-radius:10px;margin-top:1px}
.recap-stats{display:flex;gap:14px;justify-content:space-around;padding-top:4px}
.recap-stat{display:flex;flex-direction:column;align-items:center;gap:2px}
.recap-stat-num{font-family:'Barlow Condensed',sans-serif;font-size:24px;font-weight:700;line-height:1}
.recap-stat-name{font-family:'Barlow Condensed',sans-serif;font-size:9.5px;letter-spacing:1px;text-transform:uppercase;color:var(--ink-dim)}

/* realm drawer */
.drawer-scrim{position:absolute;inset:0;background:rgba(0,0,0,.5);z-index:20;opacity:0;pointer-events:none;transition:.3s}
.drawer-scrim.open{opacity:1;pointer-events:auto}
.drawer{position:absolute;left:0;right:0;bottom:0;z-index:21;background:linear-gradient(180deg,var(--bg2),var(--bg));border-top:1px solid var(--gold);border-radius:22px 22px 0 0;padding:8px 22px 26px;transform:translateY(101%);transition:transform .34s cubic-bezier(.3,.9,.3,1);box-shadow:0 -20px 60px rgba(0,0,0,.6)}
.drawer.open{transform:none}
.drawer-grab{width:44px;height:5px;border-radius:3px;background:var(--line);margin:8px auto 16px}
.drawer-title{font-family:'Barlow Condensed',sans-serif;font-size:13px;letter-spacing:3px;text-transform:uppercase;color:var(--gold);text-align:center;margin-bottom:18px}
.stat-row{margin-bottom:13px}
.stat-top{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:5px}
.stat-name{font-family:var(--body);font-size:14px;color:var(--ink-soft)}
.stat-val{font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:600;letter-spacing:.5px}
.stat-track{height:6px;border-radius:4px;background:rgba(255,255,255,.07);overflow:hidden}
.stat-fill{height:100%;border-radius:4px;transition:width .9s cubic-bezier(.2,.9,.3,1)}

/* ============ PAYWALL ============ */
.paywall{position:relative;z-index:6;min-height:100%;display:flex;flex-direction:column;padding:0 24px 26px}
.pw-cliff{margin:0 -24px 26px;padding:30px 26px 28px;background:linear-gradient(180deg,rgba(0,0,0,.5),transparent);border-bottom:1px solid var(--line);position:relative}
.pw-cliff::before{content:"";position:absolute;left:50%;bottom:-1px;transform:translateX(-50%);width:60px;height:1px;background:var(--gold)}
.pw-cliff p{font-family:var(--display);font-size:23px;line-height:1.4;color:var(--ink);text-align:center;text-wrap:pretty}
.theme-queen .pw-cliff p{font-style:italic}
.pw-seal{width:58px;height:58px;margin:0 auto 18px;border-radius:50%;border:1.5px solid var(--gold);display:flex;align-items:center;justify-content:center;color:var(--gold);font-size:26px;box-shadow:0 0 0 6px var(--gold-soft),inset 0 0 20px var(--gold-soft);overflow:hidden}
.pw-seal-logo{width:100%;height:100%;object-fit:cover}
.pw-head{font-family:var(--display);font-size:29px;font-weight:600;color:var(--ink);text-align:center;line-height:1.1;margin-bottom:22px}
.theme-queen .pw-head{font-style:italic}
.theme-napoleon .pw-head{text-transform:uppercase;font-size:24px;letter-spacing:.5px}
.pw-props{display:flex;flex-direction:column;gap:13px;margin-bottom:26px}
.pw-prop{display:flex;align-items:flex-start;gap:12px;font-family:var(--body);font-size:16px;color:var(--ink-soft);line-height:1.4}
.pw-prop svg{flex-shrink:0;margin-top:2px}
.pw-price-card{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:22px;text-align:center;margin-bottom:18px;position:relative;overflow:hidden}
.theme-napoleon .pw-price-card{border-radius:9px}
.pw-price-card::after{content:"";position:absolute;inset:0;background:radial-gradient(80% 60% at 50% 0%,var(--gold-soft),transparent 70%);pointer-events:none}
.pw-price{font-family:var(--display);font-size:52px;font-weight:700;color:var(--gold);line-height:1}
.theme-napoleon .pw-price{font-family:'Cinzel',serif;font-size:46px}
.pw-price-note{font-family:'Barlow Condensed',sans-serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:var(--ink-dim);margin-top:10px}
.pw-trust{display:flex;justify-content:center;gap:16px;margin:16px 0 6px;flex-wrap:wrap}
.pw-trust span{display:flex;align-items:center;gap:6px;font-family:'Barlow Condensed',sans-serif;font-size:11.5px;letter-spacing:1px;text-transform:uppercase;color:var(--ink-dim)}
.pw-trust svg{opacity:.8}
/* ===== tiered offer (AOV ladder) ===== */
.tiers{display:flex;flex-direction:column;gap:11px;margin-bottom:16px}
.tier{position:relative;display:flex;align-items:flex-start;gap:12px;width:100%;text-align:left;padding:15px 15px 14px;background:var(--surface);border:1.5px solid var(--line);border-radius:13px;cursor:pointer;transition:.2s;color:var(--ink)}
.theme-napoleon .tier{border-radius:9px}
.tier:hover{background:var(--surface-2);border-color:var(--gold-deep)}
.tier.sel{border-color:var(--gold);background:var(--surface-2);box-shadow:0 0 0 1px var(--gold),0 10px 30px var(--gold-soft)}
.tier.best{margin-top:8px}
.tier-badge{position:absolute;top:-9px;left:14px;font-family:'Barlow Condensed',sans-serif;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#1a0f04;background:linear-gradient(135deg,var(--gold-light),var(--gold-deep));padding:3px 11px;border-radius:20px;box-shadow:0 3px 10px var(--gold-soft)}
.tier-mark{flex-shrink:0;font-size:18px;color:var(--gold);margin-top:1px;line-height:1}
.tier-main{flex:1;display:flex;flex-direction:column;gap:3px}
.tier-row{display:flex;align-items:baseline;justify-content:space-between;gap:8px}
.tier-name{font-family:var(--display);font-size:20px;font-weight:600;color:var(--ink)}
.theme-queen .tier-name{font-style:italic}
.theme-napoleon .tier-name{font-family:'Cinzel',serif;font-size:16px;text-transform:uppercase;letter-spacing:.4px}
.tier-price{font-family:'Barlow Condensed',sans-serif;font-size:21px;font-weight:700;color:var(--gold);white-space:nowrap}
.tier-sub{font-family:var(--body);font-size:13.5px;color:var(--ink-soft);line-height:1.35}
.tier-perks{display:flex;flex-direction:column;gap:3px;margin-top:7px}
.tier-perk{display:flex;align-items:flex-start;gap:7px;font-family:'Barlow Condensed',sans-serif;font-size:12.5px;letter-spacing:.4px;text-transform:uppercase;color:var(--ink-dim)}
.tier.sel .tier-perk{color:var(--ink-soft)}
.tier-check{color:var(--jewel);font-size:11px;margin-top:1px}
.pw-buy{margin-top:4px}
/* ending upsell wrapper */
.upsell{margin-top:20px;padding-top:20px;border-top:1px solid var(--line)}
.upsell-head{font-family:var(--display);font-size:21px;color:var(--ink);text-align:center;margin-bottom:14px}
.theme-queen .upsell-head{font-style:italic}
.theme-napoleon .upsell-head{font-family:'Cinzel',serif;font-size:17px;text-transform:uppercase;letter-spacing:.5px}

/* ============ ENDING ============ */
.ending{position:relative;z-index:6;padding:24px 22px 28px}
.end-eyebrow{text-align:center;margin-bottom:18px}
.proclaim{background:var(--parch,#f2e6cd);color:var(--parch-ink,#1a0f08);border-radius:5px;padding:4px;box-shadow:0 24px 70px rgba(0,0,0,.55);position:relative}
.theme-queen .proclaim{--parch:#f4e9d2;--parch-ink:#2a1410}
.proclaim-inner{border:2px solid currentColor;padding:22px 18px}
.pc-banner{font-family:'Cinzel',serif;font-weight:900;font-size:26px;text-align:center;letter-spacing:2px;text-transform:uppercase;line-height:1}
.theme-queen .pc-banner{font-family:'Cormorant Garamond',serif;font-weight:700;letter-spacing:3px}
.pc-meta{text-align:center;font-family:'Spectral',serif;font-style:italic;font-size:11px;opacity:.65;margin:5px 0 2px}
.pc-dbl{border-top:3px double currentColor;margin:11px 0}
.pc-sgl{border-top:1px solid currentColor;opacity:.5;margin:13px 0}
.pc-headline{font-family:'Cinzel',serif;font-weight:800;font-size:19px;text-align:center;line-height:1.18;text-transform:uppercase;margin-bottom:7px}
.theme-queen .pc-headline{font-family:'Cormorant Garamond',serif;font-weight:700;font-size:23px}
.pc-sub{font-family:'Spectral',serif;font-style:italic;font-size:14px;text-align:center;opacity:.8;margin-bottom:12px}
.pc-body{font-family:'Spectral',serif;font-size:13.5px;line-height:1.62;text-align:justify;opacity:.9}
.pc-foot{display:flex;justify-content:space-between;align-items:center;margin-top:12px;font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:1px;text-transform:uppercase;opacity:.7}
.pc-score{font-family:'Cinzel',serif;font-weight:700;font-size:15px}
.end-actions{margin-top:22px;display:flex;flex-direction:column;gap:11px}
.share-row{display:flex;gap:10px}
.share-row .btn-ghost{flex:1;min-height:48px;font-size:14px}
.crosssell{margin-top:18px;padding:18px;background:var(--surface);border:1px solid var(--line);border-radius:14px;text-align:center}
.theme-napoleon .crosssell{border-radius:9px}
.cs-label{font-family:var(--body);font-style:italic;font-size:15px;color:var(--ink-soft);margin-bottom:12px}
.cs-cta{font-family:'Barlow Condensed',sans-serif;font-size:14px;letter-spacing:1.5px;text-transform:uppercase;color:var(--gold);background:none;border:1px solid var(--gold-deep);border-radius:9px;padding:11px 18px;cursor:pointer;transition:.2s;width:100%}
.cs-cta:hover{background:var(--gold-soft)}

/* ============ CORONATION (cinematic power-fantasy beat) ============ */
.coronation{position:relative;z-index:6;min-height:100%;display:flex;align-items:center;justify-content:center;overflow:hidden;cursor:pointer;background:radial-gradient(ellipse at 50% 36%,rgba(0,0,0,.2),var(--bg) 72%)}
.coro-bg{position:absolute;inset:0;z-index:0;background:radial-gradient(circle at 50% 34%,var(--gold-soft),transparent 58%)}
.coro-rays{position:absolute;left:50%;top:34%;width:560px;height:560px;transform:translate(-50%,-50%);z-index:1;pointer-events:none;opacity:.45;border-radius:50%;
  background:repeating-conic-gradient(var(--gold-soft) 0deg 6deg, transparent 6deg 14deg);
  -webkit-mask-image:radial-gradient(circle,#000 0%,transparent 62%);mask-image:radial-gradient(circle,#000 0%,transparent 62%);will-change:transform,opacity;animation:coroSpin 60s linear infinite, coroBreath 5s ease-in-out infinite}
@keyframes coroSpin{to{transform:translate(-50%,-50%) rotate(360deg)}}
@keyframes coroBreath{0%,100%{opacity:.3}50%{opacity:.5}}
.coro-embers{position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden}
.coro-ember{position:absolute;bottom:-8px;width:3px;height:3px;border-radius:50%;background:var(--gold);opacity:0;animation-name:coroEmber;animation-timing-function:ease-out;animation-iteration-count:infinite;box-shadow:0 0 6px var(--gold)}
@keyframes coroEmber{0%{opacity:0;transform:translateY(0) scale(.6)}12%{opacity:.95}70%{opacity:.7}100%{opacity:0;transform:translateY(-340px) translateX(16px) scale(1.1)}}
.coro-stack{position:relative;z-index:4;text-align:center;padding:0 30px;max-width:412px}
.coro-rite{font-family:var(--display);font-style:italic;font-size:18px;line-height:1.5;color:var(--ink-soft);opacity:0;max-width:340px;margin:0 auto 26px;text-wrap:pretty;text-shadow:0 2px 14px rgba(0,0,0,.7)}
.coro-rite.in{opacity:1;animation:coroFade 1.1s ease both}
.coro-crown{margin:0 auto 4px;opacity:0;transform:translateY(-140px) scale(1.3);filter:drop-shadow(0 6px 26px var(--gold-soft))}
.coro-crown.drop{opacity:1;transform:none;animation:coroDrop 1.1s cubic-bezier(.3,1.2,.4,1) both}
@keyframes coroDrop{0%{opacity:0;transform:translateY(-140px) scale(1.3)}55%{opacity:1}70%{transform:translateY(8px) scale(.98)}100%{opacity:1;transform:translateY(0) scale(1)}}
.coro-name{font-family:var(--display);font-weight:700;font-size:42px;line-height:1.04;color:var(--ink);letter-spacing:.5px;margin-bottom:14px;opacity:0;text-shadow:0 3px 30px var(--gold-soft)}
.theme-queen .coro-name{font-style:italic}
.theme-napoleon .coro-name{text-transform:uppercase;font-size:34px}
.coro-name.in{opacity:1;animation:coroRise 1s ease .15s both}
.coro-hail{font-family:'Cinzel',serif;font-weight:900;font-size:30px;letter-spacing:5px;color:var(--gold);margin-bottom:14px;opacity:0;text-shadow:0 0 30px var(--gold-soft)}
.theme-napoleon .coro-hail{letter-spacing:3px;font-size:27px}
.coro-hail.in{opacity:1;animation:coroHail 1s cubic-bezier(.2,.9,.3,1) both}
@keyframes coroHail{0%{opacity:0;transform:scale(1.6);letter-spacing:14px}60%{opacity:1}100%{opacity:1;transform:scale(1)}}
.coro-court{font-family:var(--body);font-size:15px;color:var(--ink-soft);margin-bottom:30px;opacity:0;text-shadow:0 1px 10px rgba(0,0,0,.8)}
.coro-court.in{opacity:1;animation:coroFade 1s ease .2s both}
.coro-tap{font-family:'Barlow Condensed',sans-serif;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:var(--gold);opacity:0}
.coro-tap.in{opacity:.7;animation:coroBlink 1.8s ease .4s infinite}
@keyframes coroBlink{0%,100%{opacity:.4}50%{opacity:.9}}
@keyframes coroFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes coroRise{from{opacity:0;transform:translateY(16px) scale(.96)}to{opacity:1;transform:none}}

/* ============ ENDING — earned title + fate collection + social proof ============ */
.ending-rays{position:absolute;left:50%;top:60px;width:520px;height:520px;transform:translateX(-50%);z-index:0;pointer-events:none;opacity:.35;
  background:radial-gradient(circle,var(--gold-soft),transparent 60%);animation:fadeSlide 1.2s ease both}
.title-reveal{position:relative;z-index:2;text-align:center;padding:14px 20px 22px}
.tr-pre{font-family:'Barlow Condensed',sans-serif;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:var(--ink-soft);margin-bottom:8px}
.tr-title{font-family:'Cinzel',serif;font-weight:900;font-size:34px;line-height:1.05;letter-spacing:1px;color:var(--gold);text-transform:uppercase;text-shadow:0 0 34px var(--gold-soft);text-wrap:balance}
.theme-queen .tr-title{font-family:'Cormorant Garamond',serif;font-weight:700;letter-spacing:.5px;font-size:38px}
.title-reveal.in .tr-title{animation:titlePop 1s cubic-bezier(.2,.9,.3,1) both}
@keyframes titlePop{0%{transform:scale(1.35)}55%{transform:scale(.98)}100%{transform:scale(1)}}
.tr-rank{display:inline-block;margin-top:12px;font-family:'Barlow Condensed',sans-serif;font-size:12.5px;letter-spacing:1.5px;text-transform:uppercase;color:var(--ink);background:var(--gold-soft);border:1px solid var(--line);border-radius:20px;padding:6px 14px}
.social-proof{display:flex;align-items:center;justify-content:center;gap:9px;text-align:center;margin:18px 0 6px;font-family:var(--body);font-size:15px;font-style:italic;color:var(--ink-soft)}
.sp-spark{color:var(--gold);font-style:normal}
.fates{margin-top:18px;padding:18px 16px;background:var(--surface);border:1px solid var(--line);border-radius:14px}
.theme-napoleon .fates{border-radius:9px}
.fates-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.fates-label{font-family:'Barlow Condensed',sans-serif;font-size:12px;letter-spacing:2.5px;text-transform:uppercase;color:var(--gold)}
.fates-count{font-family:'Cinzel',serif;font-weight:700;font-size:14px;color:var(--ink)}
.fates-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}
.fate{display:flex;flex-direction:column;align-items:center;gap:7px;padding:14px 6px;border-radius:11px;border:1px solid var(--line);text-align:center}
.theme-napoleon .fate{border-radius:7px}
.fate.open{background:var(--gold-soft);border-color:var(--gold);box-shadow:0 0 0 1px var(--gold),0 8px 22px var(--gold-soft);animation:fateGlow 2.4s ease-in-out infinite}
@keyframes fateGlow{0%,100%{box-shadow:0 0 0 1px var(--gold),0 8px 22px var(--gold-soft)}50%{box-shadow:0 0 0 1px var(--gold),0 8px 30px var(--gold)}}
.fate.locked{opacity:.5;filter:saturate(.4)}
.fate.isnew{position:relative;animation:fatePop .6s cubic-bezier(.2,.9,.3,1) both, fateGlow 2.4s ease-in-out infinite}
@keyframes fatePop{0%{transform:scale(.6);opacity:0}60%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
.fate-new{position:absolute;top:-8px;right:-6px;font-family:'Barlow Condensed',sans-serif;font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#1a0f04;background:linear-gradient(135deg,var(--gold-light),var(--gold-deep));padding:2px 7px;border-radius:20px;box-shadow:0 3px 9px var(--gold-soft);z-index:2}
.fate-medal{width:34px;height:34px;display:flex;align-items:center;justify-content:center;border-radius:50%;border:1.5px solid currentColor;font-size:16px}
.fate.open .fate-medal{color:var(--gold)}
.fate.locked .fate-medal{color:var(--ink-dim);border-style:dashed}
.fate-name{font-family:var(--body);font-size:12px;line-height:1.2;color:var(--ink-soft)}
.fate.open .fate-name{color:var(--ink);font-weight:600}
.fates-foot{text-align:center;margin-top:14px;font-family:var(--display);font-style:italic;font-size:15px;color:var(--gold)}
.theme-napoleon .fates-foot{font-style:normal;font-family:'Barlow Condensed',sans-serif;letter-spacing:.5px}
/* replay driver */
.replay-cta{margin-top:18px;padding:20px 18px;text-align:center;background:radial-gradient(120% 90% at 50% 0%,var(--gold-soft),transparent 70%),var(--surface);border:1px solid var(--line);border-radius:14px}
.theme-napoleon .replay-cta{border-radius:9px}
.replay-tease{font-family:var(--body);font-size:15px;color:var(--ink-soft);margin-bottom:6px}
.replay-because{font-family:var(--body);font-size:14.5px;color:var(--ink-soft);margin-bottom:10px;line-height:1.4}
.replay-because b{color:var(--gold);font-style:italic}
.replay-tease b{color:var(--gold)}
.replay-hook{font-family:var(--display);font-size:22px;color:var(--ink);margin-bottom:16px;line-height:1.2}
.theme-queen .replay-hook{font-style:italic}
.theme-napoleon .replay-hook{font-family:'Cinzel',serif;font-size:18px;text-transform:uppercase;letter-spacing:.5px}
.replay-hook b{color:var(--gold);font-style:normal}
.replay-btn{animation:replayPulse 2.4s ease-in-out infinite}
@keyframes replayPulse{0%,100%{box-shadow:0 10px 30px var(--gold-soft),inset 0 1px 0 rgba(255,255,255,.3)}50%{box-shadow:0 10px 40px var(--gold),inset 0 1px 0 rgba(255,255,255,.3)}}
.replay-sub{margin-top:11px;font-family:'Barlow Condensed',sans-serif;font-size:12.5px;letter-spacing:1.5px;text-transform:uppercase;color:var(--ink-dim)}
/* Production shell: no preview harness, mobile-first full viewport. */
.te-live-page{min-height:100vh;background:#050406;display:flex;justify-content:center;align-items:stretch;overflow:hidden;}
.te-live{position:relative;width:100%;max-width:430px;height:100vh;min-height:100vh;background:#000;overflow:hidden;box-shadow:0 0 80px rgba(0,0,0,.55);}
@supports(height:100dvh){.te-live{height:100dvh;min-height:100dvh;}}
.te-live>.stage-bg{position:absolute;inset:0;z-index:0;}
.te-live>.grain{position:absolute;inset:0;z-index:1;pointer-events:none;}
.te-live>.viewport{z-index:2;}
@media(min-width:700px){.te-live{border-left:1px solid rgba(255,255,255,.08);border-right:1px solid rgba(255,255,255,.08);}}
.checkout-busy{position:absolute;inset:0;z-index:70;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.58);backdrop-filter:blur(4px);font-family:'Barlow Condensed',sans-serif;letter-spacing:2px;text-transform:uppercase;color:var(--gold-light,#f4d98a);}`;

