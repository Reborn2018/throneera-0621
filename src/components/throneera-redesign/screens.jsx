import React from "react";
import { IconCheck, IconLock, IconNoSub, IconShield } from "./art";

/* eslint-disable react-hooks/static-components, react-hooks/refs, react-hooks/set-state-in-effect, react-hooks/immutability, react-hooks/exhaustive-deps, @typescript-eslint/no-unused-vars, @next/next/no-img-element */

// ThroneEra — Screen components (config-driven by TE_DATA[campaign])
// Codex form-contract notes are in comments — preserve action/method/field names.

function BrandBar({ d, onImage }) {
  return (
    <div className="brandbar">
      <div className="bb-lockup">
        <img className="bb-logo" src="/throneera-redesign/assets/throne-era-logo.png" alt="Throne Era" />
        <span className="bb-name">Throne Era</span>
      </div>
      <span className="bb-tagline">Ruler Simulator</span>
    </div>
  );
}

function Legal() {
  // Codex: keep these four links present on every screen footer.
  return (
    <div className="legal">
      <a href="/privacy">Privacy</a>
      <a href="/terms">Terms</a>
      <a href="/refunds">Refunds</a>
      <a href="/support">Support</a>
    </div>
  );
}

// ============ LANDING ============
function Landing({ d, onStart }) {
  var L = d.landing;
  var titleLines = L.title.split('\n');
  return (
    <div className="landing screen fadein" data-screen-label="Landing">
      <div className="land-cinema" style={{backgroundImage:"url(/throneera-redesign/assets/"+L.heroImg+")",backgroundPosition:L.heroPos||"50% 28%"}}>
        <div className="land-frame">
          <span className="lf-corner tl">{'♛'}</span><span className="lf-corner tr">{'♛'}</span>
          <span className="lf-corner bl">{'❖'}</span><span className="lf-corner br">{'❖'}</span>
        </div>
        <div className="land-cinema-head">
          <div className="bb-lockup">
            <img className="bb-logo" src="/throneera-redesign/assets/throne-era-logo.png" alt="Throne Era" />
            <span className="bb-name">Throne Era</span>
          </div>
        </div>
        <div className="land-eyebrow"><span>{L.kicker}</span></div>
        <div className="land-cinema-copy stagger">
          <h1 className="land-title">{titleLines.map(function(t,i){return <span key={i}>{t}{i<titleLines.length-1?<br/>:null}</span>;})}</h1>
          <p className="land-tagline">{L.tagline}</p>
          {/* Codex: this CTA links to /{simulator}/start */}
          <button className="btn btn-primary" onClick={onStart}>{L.cta}</button>
          <p className="land-cta-sub">{L.ctaSub}</p>
        </div>
      </div>
      <div className="land-support">
        <div className="land-trust">{L.trust.map(function(t,i){return <span key={i}>{t}</span>;})}</div>
        <p className="land-body">{L.body}</p>
        <Legal />
      </div>
    </div>
  );
}

// ============ START / IDENTITY ============
function Start({ d, onSubmit }) {
  var S = d.start;
  var [name, setName] = React.useState('');
  var [disp, setDisp] = React.useState(null);
  var [orig, setOrig] = React.useState(null);
  var ready = disp && orig;
  function submit(){
    if(!ready) return;
    var dispLabel = (S.dispositions.find(function(x){return x.id===disp;})||{}).label;
    var origLabel = (S.origins.find(function(x){return x.id===orig;})||{}).label;
    onSubmit({ name: (name||S.namePlaceholder), identity: [dispLabel, origLabel], dispositionId: disp, originId: orig });
  }

  function Group({ label, items, val, set }) {
    return (
      <React.Fragment>
        <span className="field-label">{label}</span>
        <div className="choice-cards">
          {items.map(function(it){
            var sel = val === it.id;
            return (
              <button key={it.id} className={'ccard'+(sel?' sel':'')} onClick={function(){set(it.id);}}>
                <span className="ccard-mark">{sel?'\u2713':''}</span>
                <span className="ccard-body">
                  <span className="ccard-label">{it.label}</span>
                  <span className="ccard-desc">{it.desc}</span>
                </span>
              </button>
            );
          })}
        </div>
      </React.Fragment>
    );
  }

  return (
    <div className="screen fadein">
      <BrandBar d={d} />
      {/* Codex form contract: method=post action=/api/runs ; hidden simulator ;
          radio dispositionId ; radio originId. (Name is auto-assigned, no input.) */}
      <div className="pad">
        <h2 className="sec-head">{S.heading}</h2>
        <p className="sec-sub">{S.sub}</p>
        <Group label={S.dispositionLabel} items={S.dispositions} val={disp} set={setDisp} />
        <Group label={S.originLabel} items={S.origins} val={orig} set={setOrig} />
        <div className="start-cta-wrap">
          <button className="btn btn-primary" style={{opacity:ready?1:0.5,pointerEvents:ready?'auto':'none'}}
            onClick={submit}>{ready ? S.cta : 'Choose who you are'}</button>
        </div>
      </div>
      <Legal />
    </div>
  );
}

// ============ PLAY / STORY ============
function statColor(s){
  var v=s.value, inv=s.inverted;
  var good = inv ? v<40 : v>58, bad = inv ? v>66 : v<32;
  return good?'var(--jewel)':bad?'var(--rose)':'var(--gold)';
}

// compact reactive HUD — keeps the stakes ON SCREEN so choices feel weighty
function Hud({ d, stats, deltas }){
  var keys = d.play.hud;
  return (
    <div className="hud">
      {keys.map(function(k){
        var s = stats.find(function(x){return x.key===k;});
        var dv = deltas ? deltas[k] : 0;
        var danger = s.inverted ? s.value>62 : s.value<34;
        return (
          <div className={'hud-stat'+(danger?' alarm':'')} key={k}>
            <div className="hud-meta">
              <span className="hud-name">{s.label}</span>
              <span className="hud-num" style={{color:statColor(s)}}>{s.value}</span>
            </div>
            <div className="hud-bar">
              <div className="hud-fill" style={{width:s.value+'%',background:statColor(s)}}></div>
            </div>
            {dv ? <span className={'hud-delta '+(dv>0?'up':'down')}>{dv>0?'+':''}{dv}</span> : null}
          </div>
        );
      })}
    </div>
  );
}

// situation-change headline derived from the dominant stat swing — works for
// authored AND custom decrees. This is the "局势剧变" big-text moment.
function situationHeadline(d, deltas){
  if(!deltas) return null;
  var bestK=null, bestAbs=0;
  Object.keys(deltas).forEach(function(k){ if(Math.abs(deltas[k])>bestAbs){bestAbs=Math.abs(deltas[k]);bestK=k;} });
  if(!bestK) return null;
  var up = deltas[bestK] > 0;
  var map = d.id==='queen' ? {
    legitimacy:['THE THRONE STANDS FIRM','YOUR CROWN TREMBLES'],
    court:['THE COURT BOWS TO YOU','THE COURT TURNS COLD'],
    treasury:['THE VAULTS OVERFLOW','THE COFFERS RUN DRY'],
    army:['STEEL RALLIES TO YOU','YOUR SWORDS DESERT'],
    people:['THE PEOPLE CHANT YOUR NAME','THE STREETS GROW RESTLESS'],
    danger:['SHADOWS GATHER AGAINST YOU','THE PLOTS UNRAVEL']
  } : {
    army:['THE EAGLES RISE','THE RANKS WAVER'],
    treasury:['THE WAR-CHEST SWELLS','THE WAR-CHEST DRAINS'],
    public:['FRANCE ROARS YOUR NAME','FRANCE GROWS WEARY'],
    elite:['THE MARSHALS SALUTE','THE MARSHALS GRUMBLE'],
    logistics:['THE COLUMNS ROLL ON','THE SUPPLY LINES STRAIN'],
    threat:['THE COALITION CLOSES IN','THE ENEMY FALTERS']
  };
  var inv = (d.play.stats.find(function(s){return s.key===bestK;})||{}).inverted;
  var pair = map[bestK] || ['THE REALM SHIFTS','THE REALM SHIFTS'];
  // for inverted stats (danger/threat) a positive delta is BAD
  var idx = inv ? (up?0:1) : (up?0:1);
  return pair[idx];
}

// 大臣汇报 — the councilor who delivers this scene, with avatar + report
function CouncilCard({ envoy, place, body, recall }){
  if(!envoy) return <p className="scene-text">{body}</p>;
  return (
    <div className="council">
      <div className="council-head">
        <div className="council-portrait">
          <img src={envoy.avatar} alt={envoy.who} className="council-img"
            onError={function(e){e.target.style.display='none';e.target.parentNode.classList.add('noimg');}} />
        </div>
        <div className="council-who">
          <span className="council-name">{envoy.who}</span>
          <span className="council-title">{envoy.title}</span>
        </div>
      </div>
      {recall ? <div className="recall-note"><span className="recall-tag">You remember</span>{recall}</div> : null}
      <div className="council-bubble">
        <p className="council-report">{body}</p>
      </div>
    </div>
  );
}

// 印玺仪式 — the seal/stamp slams down with a shockwave when a decree is issued
function DecreeRitual({ d, label, onSkip }){
  return (
    <div className="decree-ritual" onClick={onSkip}>
      <div className="dr-scrim"></div>
      <div className="dr-rays"></div>
      <div className="dr-burst"></div>
      <div className="dr-shock"></div>
      <div className="dr-shock dr-shock2"></div>
      <div className="dr-seal">
        <img src="/throneera-redesign/assets/throne-era-logo.png" alt="" className="dr-seal-img" />
      </div>
      <div className="dr-label">{label}</div>
      <div className="dr-skip">Tap to continue</div>
    </div>
  );
}

function Play({ d, mode, initialStats, initialFlags, onReachPaywall, onComplete }) {
  var P = d.play;
  var paywallIdx = (function(){ for(var i=0;i<P.scenes.length;i++){ if(P.scenes[i].turn===(P.paywallAfter||4)) return i; } return Math.min(3, P.scenes.length-1); })();
  var isPaid = mode==='paid';
  var startIdx = isPaid ? paywallIdx+1 : 0;
  var endIdx = isPaid ? P.scenes.length-1 : paywallIdx;
  var [sceneIdx, setSceneIdx] = React.useState(startIdx);
  var [phase, setPhase] = React.useState('choose'); // choose | result
  var [picked, setPicked] = React.useState(null);
  var [chosen, setChosen] = React.useState(null);
  var [resultText, setResultText] = React.useState('');
  var [deltas, setDeltas] = React.useState(null);
  var [showCustom, setShowCustom] = React.useState(false);
  var [custom, setCustom] = React.useState('');
  var [drawer, setDrawer] = React.useState(false);
  var [stats, setStats] = React.useState(function(){ return (initialStats||P.stats).map(function(s){return Object.assign({},s);}); });
  var [flash, setFlash] = React.useState(false);
  var [sealing, setSealing] = React.useState(false);
  var [dangerFlash, setDangerFlash] = React.useState(false);
  var [triumphFlash, setTriumphFlash] = React.useState(false);
  var decisionsRef = React.useRef([]);
  var sealTimer = React.useRef(null);
  var skipRef = React.useRef(null);
  var flagsRef = React.useRef(Object.assign({}, initialFlags||{}));
  var scene = P.scenes[sceneIdx];
  var vpRef = React.useRef(null);

  function applyFx(fx){
    var dd = {};
    setStats(function(prev){
      return prev.map(function(s){
        var ch = fx[s.key] || 0;
        if(ch) dd[s.key] = ch;
        var v = Math.max(4, Math.min(98, s.value + ch));
        return Object.assign({}, s, { value: v });
      });
    });
    return dd;
  }

  function choose(c){
    if(phase!=='choose') return;
    var fx = c.fx || { };
    setPicked(c.id);
    setChosen(c);
    decisionsRef.current = decisionsRef.current.concat([{ tone: c.tone, label: c.label }]);
    if(c.flag){ flagsRef.current[c.flag] = true; }
    // 印玺仪式: seal slams down, then stats swing
    setSealing(true);
    setFlash(true); setTimeout(function(){setFlash(false);}, 420);
    var invStat = P.stats.find(function(s){return s.inverted;});
    if(invStat && (fx[invStat.key]||0) >= 5){
      setDangerFlash(true); setTimeout(function(){setDangerFlash(false);}, 950);
    }
    var maxGain = 0;
    Object.keys(fx).forEach(function(k){
      var st = P.stats.find(function(s){return s.key===k;});
      if(st && !st.inverted && fx[k] > maxGain) maxGain = fx[k];
    });
    // the world reacts after the ritual — or instantly if the player taps to skip
    var done = false;
    function resolve(){
      if(done) return; done = true;
      if(sealTimer.current){ clearTimeout(sealTimer.current); sealTimer.current = null; }
      skipRef.current = null;
      var dd = applyFx(fx);
      setDeltas(dd);
      setResultText(c.result || P.customResult);
      if(maxGain >= 9){
        setTriumphFlash(true); setTimeout(function(){setTriumphFlash(false);}, 1100);
      }
      setSealing(false);
      setPhase('result');
      if(vpRef.current){ var vp=vpRef.current.parentNode; if(vp) vp.scrollTop=0; }
    }
    skipRef.current = resolve;
    sealTimer.current = setTimeout(resolve, 1500);
  }

  function skipSeal(){ if(skipRef.current) skipRef.current(); }

  function next(){
    if(sceneIdx < endIdx){
      setSceneIdx(sceneIdx+1); setPhase('choose'); setPicked(null); setChosen(null);
      setResultText(''); setDeltas(null); setShowCustom(false); setCustom('');
      if(vpRef.current){ var vp=vpRef.current.parentNode; if(vp) vp.scrollTop=0; }
    } else if(isPaid){
      if(onComplete) onComplete(decisionsRef.current, stats, flagsRef.current);
    } else {
      onReachPaywall(decisionsRef.current, stats, flagsRef.current);
    }
  }

  var lastScene = sceneIdx === endIdx;
  var pickedChoice = chosen;
  // A: rising-threat thread · B: recall callback · C: climax branch (all flag/turn driven)
  var threatLine = P.threatThread ? P.threatThread[scene.turn-1] : null;
  var recallLine = null;
  if(P.recalls){ var _rc = P.recalls.find(function(r){ return r.turn===scene.turn && flagsRef.current[r.flag]; }); if(_rc) recallLine = _rc.line; }
  var effBody = scene.body;
  if(P.branchOverrides){ var _bo = P.branchOverrides.find(function(b){ return b.turn===scene.turn && flagsRef.current[b.flag]; }); if(_bo) effBody = _bo.body; }

  return (
    <div className={'screen fadein'+(flash?' fx-flash':'')+(dangerFlash?' fx-danger':'')+(triumphFlash?' fx-triumph':'')} ref={vpRef}>
      {sealing ? <DecreeRitual d={d} label={d.id==='queen'?'DECREE SEALED':'ORDER GIVEN'} onSkip={skipSeal} /> : null}
      {triumphFlash ? <div className="triumph-rays"></div> : null}
      <div className="play-top">
        <span className="turn-pill">
          {scene.chapter}
          <span className="turn-dots">
            {Array.from({length:scene.total}).map(function(_,i){return <i key={i} className={i<scene.turn?'on':''}></i>;})}
          </span>
        </span>
        <button className="realm-btn" onClick={function(){setDrawer(true);}}>
          {d.id==='queen'?'\u265B Realm':'\u2726 Command'}
        </button>
      </div>

      <Hud d={d} stats={stats} deltas={phase==='result'?deltas:null} />
      {phase==='choose' && threatLine ? (
        <div className="threat-strip"><span className="threat-glyph">{'⚠'}</span><span className="threat-text">{threatLine}</span></div>
      ) : null}

      {phase==='choose' ? (
        <div className="play-body stagger" key={'s'+sceneIdx}>
          <p className="scene-place">{scene.place}</p>
          <h2 className="scene-title">{scene.title}</h2>
          <div className="scene-rule"></div>
          <CouncilCard envoy={scene.envoy} place={scene.place} body={effBody} recall={recallLine} />

          {/* Codex form contract: method=post action=/api/runs/{runId}/choice ; input choiceId */}
          <p className="decree-label">{d.id==='queen'?'Issue your decree':'Issue your order'}</p>
          <div className="choices">
            {scene.choices.map(function(c,i){
              return (
                <button key={c.id} className={'choice'+(picked===c.id?' sealed':'')+(picked&&picked!==c.id?' dim':'')}
                  onClick={function(){choose(c);}}>
                  <span className="choice-tone">{c.tone}</span>
                  <span className="choice-num">{i+1}</span>
                  <span className="choice-label">{c.label}</span>
                </button>
              );
            })}
          </div>

          {!showCustom ? (
            <button className="custom-toggle" onClick={function(){setShowCustom(true);}}>
              {'\u270E  '}{P.customLabel}
            </button>
          ) : (
            <div className="custom-box">
              <textarea className="custom-area" rows={3} maxLength={280} value={custom}
                placeholder={P.customPlaceholder} onChange={function(e){setCustom(e.target.value);}} />
              <div className="custom-row">
                <button className="btn-text" onClick={function(){setShowCustom(false);}}>Cancel</button>
                <button className="btn btn-ghost" style={{width:'auto',padding:'10px 18px',minHeight:0}}
                  onClick={function(){choose({id:'custom',fx:{},tone:d.id==='queen'?'Decree':'Order',result:P.customResult,voice:P.customVoice});}}>Issue</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="play-body result-body" key={'r'+sceneIdx}>
          {situationHeadline(d, deltas) ? <div className="situation-headline">{situationHeadline(d, deltas)}</div> : null}
          <div className="result-kicker">{d.id==='queen'?'The court reacts':'The order is carried out'}</div>
          {pickedChoice ? <div className="verdict-stamp">{pickedChoice.tone}</div> : null}
          {pickedChoice ? <p className="result-echo">{'“'}{pickedChoice.label}{'”'}</p> : null}
          {pickedChoice && pickedChoice.voice ? (
            <div className="voice-card">
              <span className="voice-who">{pickedChoice.voice.who}</span>
              <p className="voice-line">{pickedChoice.voice.line}</p>
            </div>
          ) : null}
          <div className="result-card">
            <Typeline text={resultText} />
          </div>
          <div className="result-deltas">
            {deltas && Object.keys(deltas).map(function(k){
              var s = stats.find(function(x){return x.key===k;});
              return (
                <span className={'rd-chip '+(deltas[k]>0?'up':'down')} key={k}>
                  {s.label} {deltas[k]>0?'+':''}{deltas[k]}
                </span>
              );
            })}
          </div>
          <button className="btn btn-primary" onClick={next}>
            {!lastScene ? 'Continue' : isPaid ? 'See Your Legacy' : (d.id==='queen'?'Face What Comes Next':'March On to Waterloo')}
          </button>
          {lastScene && !isPaid ? <p className="result-tension">{d.id==='queen'?'The realm holds its breath\u2026':'The campaign reaches its turning point\u2026'}</p> : null}
        </div>
      )}

      <div className={'drawer-scrim'+(drawer?' open':'')} onClick={function(){setDrawer(false);}}></div>
      <div className={'drawer'+(drawer?' open':'')}>
        <div className="drawer-grab"></div>
        <p className="drawer-title">{d.id==='queen'?'State of the Realm':'State of the Campaign'}</p>
        {stats.map(function(s){
          return (
            <div className="stat-row" key={s.key}>
              <div className="stat-top">
                <span className="stat-name">{s.label}</span>
                <span className="stat-val" style={{color:statColor(s)}}>{s.value}</span>
              </div>
              <div className="stat-track">
                <div className="stat-fill" style={{width:s.value+'%',background:statColor(s)}}></div>
              </div>
            </div>
          );
        })}
        <button className="btn btn-ghost" style={{marginTop:14}} onClick={function(){setDrawer(false);}}>Close</button>
      </div>
    </div>
  );
}

// types a line in, with a skip-on-tap
function Typeline({ text }){
  var [n, setN] = React.useState(0);
  var ref = React.useRef({t:null});
  React.useEffect(function(){
    setN(0); var i=0;
    ref.current.t = setInterval(function(){
      i++; setN(i); if(i>=text.length) clearInterval(ref.current.t);
    }, 16);
    return function(){ clearInterval(ref.current.t); };
  },[text]);
  return (
    <p className="result-text" onClick={function(){clearInterval(ref.current.t); setN(text.length);}}>
      {text.slice(0,n)}{n<text.length?<span className="tw-caret"></span>:null}
    </p>
  );
}

// ============ CORONATION (cinematic power-fantasy beat) ============
function Coronation({ d, run, onEnter }) {
  var C = d.coronation;
  var name = (run && run.name) || d.start.namePlaceholder;
  var [stage, setStage] = React.useState(0);
  var [lit, setLit] = React.useState(false);
  React.useEffect(function(){
    var r = setTimeout(function(){ setLit(true); }, 40);
    var t1 = setTimeout(function(){ setStage(1); }, 1300);
    var t2 = setTimeout(function(){ setStage(2); }, 2800);
    return function(){ clearTimeout(r); clearTimeout(t1); clearTimeout(t2); };
  }, []);
  var tEase = 'opacity .9s ease, transform 1s cubic-bezier(.3,1,.4,1)';
  return (
    <div className="screen coronation" onClick={onEnter}>
      <div className="coro-bg"></div>
      <div className="coro-rays"></div>
      <div className="coro-embers">{Array.from({length:18}).map(function(_,i){
        return <span key={i} className="coro-ember" style={{left:((i*89+7)%100)+'%',animationDelay:(-(i*0.6))+'s',animationDuration:(5+(i%5))+'s'}}></span>;
      })}</div>
      <div className="coro-stack">
        <div className="coro-rite" style={{opacity:lit?1:0,transform:lit?'none':'translateY(6px)',transition:tEase}}>{C.rite}</div>
        <div className="coro-crown" style={{opacity:stage>=1?1:0,transform:stage>=1?'translateY(0) scale(1)':'translateY(-120px) scale(1.25)',transition:'opacity 1s ease, transform 1.1s cubic-bezier(.3,1.2,.4,1)'}}>
          <svg viewBox="0 0 200 120" width="168" height="100">
            <defs>
              <linearGradient id="coroGold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f9e6a8"/><stop offset="48%" stopColor="#e2ad42"/><stop offset="100%" stopColor="#9c6a1c"/>
              </linearGradient>
            </defs>
            <path d="M22 78 L22 26 L60 60 L100 8 L140 60 L178 26 L178 78 Z" fill="url(#coroGold)" stroke="#fbe7ad" strokeWidth="2"/>
            <rect x="22" y="78" width="156" height="20" rx="4" fill="url(#coroGold)" stroke="#fbe7ad" strokeWidth="1.5"/>
            <circle cx="100" cy="88" r="6" fill="#c4324f"/>
            <circle cx="54" cy="88" r="4.5" fill="#2f7d63"/><circle cx="146" cy="88" r="4.5" fill="#2f7d63"/>
            <circle cx="60" cy="60" r="4" fill="#c4324f"/><circle cx="140" cy="60" r="4" fill="#c4324f"/>
            <circle cx="100" cy="8" r="5" fill="#f9e6a8"/>
          </svg>
        </div>
        <div className="coro-name" style={{opacity:stage>=1?1:0,transform:stage>=1?'none':'translateY(14px)',transition:tEase}}>{name}</div>
        <div className="coro-hail" style={{opacity:stage>=2?1:0,transform:stage>=2?'scale(1)':'scale(1.4)',transition:'opacity .9s ease, transform .9s cubic-bezier(.2,.9,.3,1)'}}>{C.hail}</div>
        <div className="coro-court" style={{opacity:stage>=2?1:0,transform:stage>=2?'none':'translateY(8px)',transition:tEase}}>{C.courtLine}</div>
        <div className={'coro-tap'+(stage>=2?' in':'')} style={{opacity:stage>=2?undefined:0}}>{C.tapHint} {'→'}</div>
      </div>
    </div>
  );
}

// ============ PAYWALL ============
function Paywall({ d, run, onUnlock, onLater }) {
  var W = d.paywall;
  var trustIcons = [IconShield, IconNoSub, IconLock];
  run = run || { name:'', identity:[], decisions:[], stats:null };
  var hud = run.stats ? d.play.hud.map(function(k){ return run.stats.find(function(s){return s.key===k;}); }) : [];
  var name = run.name || d.start.namePlaceholder;
  return (
    <div className="paywall screen fadein">
      <div className="pw-cliff"><p>{W.cliff}</p></div>
      <div className="stagger" style={{flex:1}}>
        {/* personalized recap — sunk cost + loss aversion. Shows after real play. */}
        {run.decisions && run.decisions.length ? (
        <div className="recap-card">
          <div className="recap-top">
            <span className="recap-label">{d.id==='queen'?'Your Reign So Far':'Your Campaign So Far'}</span>
            <span className="recap-name">{name}</span>
          </div>
          {run.identity && run.identity.length ?
            <div className="recap-identity">{run.identity.join(' \u00B7 ')}</div> : null}
          {run.decisions && run.decisions.length ? (
            <ul className="recap-decisions">
              {run.decisions.map(function(dec,i){
                return <li key={i}><span className="recap-tone">{dec.tone}</span>{dec.label}</li>;
              })}
            </ul>
          ) : null}
          {hud.length ? (
            <div className="recap-stats">
              {hud.map(function(s){ if(!s) return null; return (
                <div className="recap-stat" key={s.key}>
                  <span className="recap-stat-num" style={{color:statColor(s)}}>{s.value}</span>
                  <span className="recap-stat-name">{s.label}</span>
                </div>
              );})}
            </div>
          ) : null}
        </div>
        ) : null}
        <div className="pw-seal"><img className="pw-seal-logo" src="/throneera-redesign/assets/throne-era-logo.png" alt="" /></div>
        <p className="pw-loss">{W.lossLine}</p>
        <h2 className="pw-head">{W.heading}</h2>
        <div className="pw-props">
          {W.valueProps.map(function(p,i){
            return <div className="pw-prop" key={i}><span style={{color:'var(--gold)'}}>{IconCheck}</span><span>{p}</span></div>;
          })}
        </div>
        <div className="pw-price-card">
          <div className="pw-price">{W.price}</div>
          <div className="pw-price-note">{W.priceNote}</div>
          <div className="pw-trust">
            {W.trust.map(function(t,i){
              return (
                <span className="pw-trust-item" key={i}>
                  <span className="pw-trust-icon">{trustIcons[i]}</span>
                  <span className="pw-trust-label">{t}</span>
                </span>
              );
            })}
          </div>
        </div>
        {/* Codex form contract: method=post action=/api/checkout ; hidden runId. First ask = single $4.99 only. */}
        <button className="btn btn-primary" onClick={onUnlock}>{W.cta}</button>
        <button className="btn-text" style={{display:'block',margin:'14px auto 0'}} onClick={onLater}>{W.later}</button>
      </div>
      <Legal />
    </div>
  );
}

// ============ ENDING ============
// derive the achieved fate from the player's FINAL stats + disposition
function readFinalStat(stats, key){
  if(!stats) return 50;
  if(Array.isArray(stats)){
    var found = stats.find(function(s){ return s && s.key===key; });
    return found && typeof found.value === 'number' ? found.value : 50;
  }
  return typeof stats[key] === 'number' ? stats[key] : 50;
}
function endingScore(d, stats){
  if(!stats) return d.ending.score || 70;
  var total=0,n=0;
  d.play.stats.forEach(function(s){ var v=readFinalStat(stats,s.key); if(s.inverted) v=100-v; total+=v; n++; });
  return Math.round(total/n);
}
function pickFateIndex(d, stats, dispId){
  if(!stats) return d.ending.unlockedFate||0;
  var score=endingScore(d, stats);
  if(d.id==='queen'){
    if(readFinalStat(stats,'danger')>72 || readFinalStat(stats,'legitimacy')<24) return 3;      // Betrayed
    if(score<34) return 5;                                     // Crown of Ashes
    if(score<48) return 4;                                     // Long Exile
    if(readFinalStat(stats,'people')>70 && readFinalStat(stats,'danger')<46) return 2;           // Beloved
    if(readFinalStat(stats,'court')>=60 || dispId==='cunning') return 1;        // Shadow Crown
    return 0;                                                  // Iron Throne
  } else {
    if(readFinalStat(stats,'elite')<22 || readFinalStat(stats,'threat')>82) return 3;            // Betrayed Eagle
    if(score<34) return 5;                                     // Fall of France
    if(score<48) return 4;                                     // Second Exile
    if(readFinalStat(stats,'public')<34 && readFinalStat(stats,'army')>58) return 2;             // Iron Dictator
    if(score>=66 && readFinalStat(stats,'threat')<46) return 0;                 // Master of Europe
    return 1;                                                  // Restored Empire
  }
}

function Ending({ d, run, onAgain, onCross, onUpsell }) {
  var E = d.ending;
  run = run || {};
  var dispId = run.dispositionId;
  var stats = run.stats;
  var fateIdx = pickFateIndex(d, stats, dispId);
  var outcome = (E.outcomes && E.outcomes[fateIdx]) || { headline: E.headline, sub: E.sub, body: E.body };
  var fateTitle = E.fates[fateIdx];
  var rulingStyle = (dispId && E.titlesByDisposition[dispId]) || E.defaultTitle;
  var score = endingScore(d, stats);
  var name = run.name || d.start.namePlaceholder;
  var pct = Math.max(2, Math.min(99, 100 - score));
  // tease a locked fate to drive replay — the "next" one after the achieved one
  var teaseIdx = (fateIdx + 1) % E.fates.length;
  var teaseName = E.fates[teaseIdx];
  var [revealed, setRevealed] = React.useState(false);
  var upsellTiers = (d.paywall && d.paywall.tiers) || [];
  var _defUp = (function(){ for(var i=0;i<upsellTiers.length;i++){ if(upsellTiers[i].best) return i; } return Math.max(0, upsellTiers.length-1); })();
  var [upTier, setUpTier] = React.useState(_defUp);
  var firstDecision = (run.decisions && run.decisions[0]) ? run.decisions[0].label : null;
  var [collected, setCollected] = React.useState(null);
  React.useEffect(function(){
    var key='te_fates_'+d.id, set={};
    try{ var raw=localStorage.getItem(key); if(raw){ JSON.parse(raw).forEach(function(i){ set[i]=true; }); } }catch(e){}
    set[fateIdx]=true;
    try{ localStorage.setItem(key, JSON.stringify(Object.keys(set).map(Number))); }catch(e){}
    setCollected(set);
  },[]);
  var collectedMap = collected || (function(){ var s={}; s[fateIdx]=true; return s; })();
  var collectedCount = Object.keys(collectedMap).length;
  React.useEffect(function(){ var t=setTimeout(function(){setRevealed(true);},400); return function(){clearTimeout(t);}; },[]);
  return (
    <div className="ending screen fadein">
      <div className="ending-rays"></div>
      <div className={'title-reveal'+(revealed?' in':'')}>
        <p className="tr-pre">{E.titleReveal}</p>
        <h1 className="tr-title">{fateTitle}</h1>
        <div className="tr-rank">Top {pct}% of rulers {'\u00b7'} {score}/100 {'\u00b7'} ruled as {rulingStyle}</div>
      </div>
      <p className="eyebrow end-eyebrow">Your story has been written</p>
      <div className="proclaim">
        <div className="proclaim-inner">
          <div className="pc-dbl"></div>
          <div className="pc-banner">{E.banner}</div>
          <div className="pc-meta">{d.id==='queen'?'By Royal Decree \u00B7 Sealed':'Front Page \u00B7 Special Edition'}</div>
          <div className="pc-dbl"></div>
          <div className="pc-headline">{outcome.headline}</div>
          <div className="pc-sub">{outcome.sub}</div>
          <div className="pc-sgl"></div>
          <div className="pc-body">{outcome.body}</div>
          <div className="pc-sgl"></div>
          <div className="pc-foot">
            <span>{name}</span>
            <span className="pc-score">{fateTitle}</span>
          </div>
        </div>
      </div>
      <div className="social-proof">
        <span className="sp-spark">{'\u2726'}</span>{E.socialProof}
      </div>

      <div className="fates">
        <div className="fates-head">
          <span className="fates-label">{E.fatesLabel}</span>
          <span className="fates-count">{collectedCount} / {E.fates.length}</span>
        </div>
        <div className="fates-grid">
          {E.fates.map(function(f,i){
            var isOpen = !!collectedMap[i];
            var isNew = i===fateIdx;
            return (
              <div className={'fate'+(isOpen?' open':' locked')+(isNew?' isnew':'')} key={i}>
                {isNew ? <span className="fate-new">New</span> : null}
                <span className="fate-medal">{isOpen?d.crest:'\u2756'}</span>
                <span className="fate-name">{isOpen?f:'???'}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* replay driver — concrete, curiosity-baited */}
      <div className="replay-cta">
        {firstDecision ? <p className="replay-because">It all turned on one choice: <b>{'\u201c'}{firstDecision}{'\u201d'}</b></p> : null}
        <p className="replay-tease">You hold <b>{collectedCount} of {E.fates.length}</b> fates. A different first decree writes a different destiny.</p>
        <p className="replay-hook">Could you have become <b>{teaseName}</b>?</p>
        <button className="btn btn-primary replay-btn" onClick={onAgain}>{E.again}</button>
        <p className="replay-sub">Same throne. One different decree changes everything.</p>
      </div>

      <div className="end-actions">
        <div className="share-row">
          <button className="btn btn-ghost">Save Image</button>
          <button className="btn btn-ghost">Share Your Fate</button>
        </div>
      </div>
      {/* ending upsell — same-audience offer, no cross-campaign. $4.99 vs $14.99 season. */}
      {upsellTiers.length ? (
        <div className="upsell">
          <p className="upsell-head">{d.id==='queen'?'Keep Your Crown Forever':'The Legend Continues'}</p>
          <div className="tiers">
            {upsellTiers.map(function(t,i){
              var sel = i===upTier;
              return (
                <button key={t.id} className={'tier'+(sel?' sel':'')+(t.best?' best':'')} onClick={function(){setUpTier(i);}}>
                  {t.badge ? <span className="tier-badge">{t.badge}</span> : null}
                  <span className="tier-mark">{sel?'\u25c9':'\u25cb'}</span>
                  <span className="tier-main">
                    <span className="tier-row"><span className="tier-name">{t.name}</span><span className="tier-price">{t.price}</span></span>
                    <span className="tier-sub">{t.sub}</span>
                    <span className="tier-perks">
                      {t.perks.map(function(p,j){ return <span className="tier-perk" key={j}><span className="tier-check">{'\u2713'}</span>{p}</span>; })}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          {/* Codex: each tier = a Creem product; field tierId. */}
          <button className="btn btn-primary pw-buy" onClick={function(){ if(onUpsell){ onUpsell(upsellTiers[upTier]); } }}>
            {d.id==='queen'?'Continue Your Saga':'Continue the Campaign'} {'\u2014'} {upsellTiers[upTier].price}
          </button>
        </div>
      ) : null}
      <Legal />
    </div>
  );
}

export { BrandBar, Legal, Landing, Start, Coronation, Play, Paywall, Ending };
