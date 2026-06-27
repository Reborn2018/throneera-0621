import React from "react";

// ThroneEra — Art direction components (cinematic CSS/SVG hero scenes)
// Codex: these are atmospheric, asset-free hero scenes built for visual impact.
// The dashed "KEY ART" tag marks where a generated bitmap can later layer behind.

function Icon({ d, size, sw }) {
  return (
    <svg width={size||16} height={size||16} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={sw||1.6} strokeLinecap="round" strokeLinejoin="round">
      {d}
    </svg>
  );
}
var IconCheck = <Icon d={<polyline points="20 6 9 17 4 12"/>} size={18} />;
var IconLock = <Icon d={<g><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></g>} size={14} />;
var IconShield = <Icon d={<path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/>} size={14} />;
var IconNoSub = <Icon d={<g><circle cx="12" cy="12" r="9"/><line x1="5" y1="19" x2="19" y2="5"/></g>} size={14} />;

// drifting embers / dust — pure CSS particles for atmosphere
function Embers({ count, color, className }) {
  var n = count || 14;
  var parts = [];
  for (var i=0;i<n;i++){
    var left = Math.round((i*97+13)%100);
    var dur = 4 + ((i*7)%6);
    var delay = -((i*13)%9);
    var size = 1.5 + ((i*5)%3);
    parts.push(
      <span key={i} className="ember" style={{
        left: left+'%',
        width: size+'px', height: size+'px',
        background: color || 'var(--gold)',
        animationDuration: dur+'s',
        animationDelay: delay+'s'
      }}></span>
    );
  }
  return <div className={'embers '+(className||'')}>{parts}</div>;
}

// ---- QUEEN HERO: a great crown in candlelight ----
function QueenHero() {
  return (
    <div className="land-art hero-queen">
      <div className="hero-vignette"></div>
      <svg className="hero-svg" viewBox="0 0 412 170" preserveAspectRatio="xMidYMax slice">
        <defs>
          <radialGradient id="qGlow" cx="50%" cy="38%" r="60%">
            <stop offset="0%" stopColor="#e8b24a" stopOpacity="0.55"/>
            <stop offset="42%" stopColor="#c4324f" stopOpacity="0.22"/>
            <stop offset="100%" stopColor="#15080e" stopOpacity="0"/>
          </radialGradient>
          <linearGradient id="qGold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f7e29a"/><stop offset="48%" stopColor="#e0a93f"/><stop offset="100%" stopColor="#9c6a1c"/>
          </linearGradient>
          <linearGradient id="qRay" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f4d98a" stopOpacity="0.5"/><stop offset="100%" stopColor="#f4d98a" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="412" height="170" fill="url(#qGlow)"/>
        {/* volumetric light rays */}
        <g style={{mixBlendMode:'screen'}} opacity="0.5">
          <polygon points="206,8 150,170 180,170" fill="url(#qRay)"/>
          <polygon points="206,8 232,170 262,170" fill="url(#qRay)"/>
          <polygon points="206,8 110,170 150,170" fill="url(#qRay)" opacity="0.6"/>
        </g>
        {/* candle flames row */}
        {[44,128,284,368].map(function(x,i){return (
          <g key={i}>
            <ellipse cx={x} cy="120" rx="13" ry="34" fill="#e8b24a" opacity="0.16">
              <animate attributeName="ry" values="34;40;34" dur={(2+i*0.3)+'s'} repeatCount="indefinite"/>
            </ellipse>
            <path d={'M'+x+' 104 q6 11 0 21 q-6 -10 0 -21'} fill="url(#qGold)">
              <animate attributeName="opacity" values="0.85;1;0.85" dur="1.6s" repeatCount="indefinite"/>
            </path>
            <rect x={x-3} y="124" width="6" height="40" fill="#caa24a" opacity="0.45"/>
          </g>
        )})}
        {/* halo behind crown */}
        <circle cx="206" cy="74" r="58" fill="url(#qGlow)" opacity="0.9"/>
        {/* the crown — centerpiece */}
        <g transform="translate(206,78)">
          <path d="M-74 26 L-74 -4 L-50 18 L-26 -22 L0 14 L26 -22 L50 18 L74 -4 L74 26 Z"
            fill="url(#qGold)" stroke="#f7e29a" strokeWidth="1.2"/>
          <rect x="-74" y="26" width="148" height="16" rx="3" fill="url(#qGold)" stroke="#f7e29a" strokeWidth="1"/>
          <rect x="-74" y="30" width="148" height="8" fill="#7d1f33" opacity="0.55"/>
          {/* jewels on the band */}
          <circle cx="0" cy="34" r="5" fill="#c4324f"/>
          <circle cx="-40" cy="34" r="3.5" fill="#2f7d63"/>
          <circle cx="40" cy="34" r="3.5" fill="#2f7d63"/>
          {/* finial jewels on points */}
          <circle cx="-50" cy="18" r="3" fill="#c4324f"/><circle cx="50" cy="18" r="3" fill="#c4324f"/>
          <circle cx="-26" cy="-22" r="3.5" fill="#e8b24a"/><circle cx="26" cy="-22" r="3.5" fill="#e8b24a"/>
          <circle cx="0" cy="14" r="3" fill="#e8b24a"/>
          {/* gleam */}
          <path d="M-74 -4 L-26 -22 L0 14 Z" fill="#fff" opacity="0.12"/>
        </g>
        <rect x="0" y="120" width="412" height="50" fill="#15080e" opacity="0.5"/>
      </svg>
      <Embers count={16} color="rgba(232,178,74,0.9)" />
      <span className="land-art-label">KEY ART: candlelit throne room</span>
    </div>
  );
}

// ---- NAPOLEON HERO: a war map under brass eagle ----
function NapoleonHero() {
  return (
    <div className="land-art hero-nap">
      <div className="hero-vignette"></div>
      <svg className="hero-svg" viewBox="0 0 412 170" preserveAspectRatio="xMidYMax slice">
        <defs>
          <radialGradient id="nGlow" cx="50%" cy="42%" r="62%">
            <stop offset="0%" stopColor="#d09a3c" stopOpacity="0.42"/>
            <stop offset="52%" stopColor="#3f7f87" stopOpacity="0.16"/>
            <stop offset="100%" stopColor="#0d1f26" stopOpacity="0"/>
          </radialGradient>
          <linearGradient id="nBrass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#eccb80"/><stop offset="50%" stopColor="#c89b3c"/><stop offset="100%" stopColor="#8a6018"/>
          </linearGradient>
        </defs>
        <rect width="412" height="170" fill="url(#nGlow)"/>
        {/* map: contour lines */}
        <g fill="none" stroke="#d09a3c" strokeWidth="0.8" opacity="0.2">
          <path d="M-10 54 Q100 38 200 60 T420 50"/>
          <path d="M-10 78 Q110 62 210 84 T420 74"/>
          <path d="M-10 104 Q120 90 220 110 T420 100"/>
          <path d="M-10 132 Q120 120 230 138 T420 130"/>
        </g>
        {/* coastline + river */}
        <path d="M-10 150 Q80 140 120 150 T230 150 Q300 150 420 140" fill="none" stroke="#3f7f87" strokeWidth="1.4" opacity="0.4"/>
        <path d="M120 170 Q140 130 110 96 Q90 70 130 44" fill="none" stroke="#3f7f87" strokeWidth="1" opacity="0.3"/>
        {/* campaign route */}
        <path d="M56 144 L120 116 L196 128 L276 92 L344 104" fill="none" stroke="url(#nBrass)"
          strokeWidth="2.4" strokeDasharray="2 8" strokeLinecap="round">
          <animate attributeName="stroke-dashoffset" values="0;-100" dur="5s" repeatCount="indefinite"/>
        </path>
        {[[56,144],[196,128],[344,104]].map(function(p,i){return (
          <g key={i}>
            <circle cx={p[0]} cy={p[1]} r="4.5" fill="#a23a2c"/>
            <circle cx={p[0]} cy={p[1]} r="4.5" fill="none" stroke="#d09a3c" strokeWidth="1.2">
              <animate attributeName="r" values="4.5;13;4.5" dur="2.6s" begin={(i*0.5)+'s'} repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.8;0;0.8" dur="2.6s" begin={(i*0.5)+'s'} repeatCount="indefinite"/>
            </circle>
          </g>
        )})}
        {/* compass rose */}
        <g transform="translate(360,40)" opacity="0.5" stroke="#d09a3c" fill="none" strokeWidth="1">
          <circle r="15"/><path d="M0,-15 L4,0 L0,15 L-4,0 Z" fill="#d09a3c" opacity="0.6"/>
          <line x1="-15" y1="0" x2="15" y2="0"/>
        </g>
        {/* laurel medallion with N — centerpiece */}
        <circle cx="206" cy="70" r="46" fill="url(#nGlow)" opacity="0.9"/>
        <g transform="translate(206,70)">
          <circle r="38" fill="#0d1f26" opacity="0.5"/>
          <circle r="38" fill="none" stroke="url(#nBrass)" strokeWidth="2.5"/>
          <circle r="33" fill="none" stroke="url(#nBrass)" strokeWidth="0.8" opacity="0.5"/>
          {/* laurel */}
          {[-1,1].map(function(s){return (
            <g key={s} transform={'scale('+s+',1)'}>
              <path d="M-2 34 Q-30 22 -26 -6" fill="none" stroke="url(#nBrass)" strokeWidth="1.6" opacity="0.85"/>
              {[30,20,8,-4].map(function(y,j){return (
                <ellipse key={j} cx={-13-j} cy={y} rx="4" ry="9" fill="#c89b3c"
                  transform={'rotate('+(-40-j*8)+' '+(-13-j)+' '+y+')'} opacity="0.8"/>
              );})}
            </g>
          );})}
          <text x="0" y="20" textAnchor="middle" fontFamily="Cinzel,serif" fontSize="52" fontWeight="800" fill="url(#nBrass)">N</text>
        </g>
        <rect x="0" y="124" width="412" height="46" fill="#0d1f26" opacity="0.45"/>
      </svg>
      <Embers count={12} color="rgba(208,154,60,0.85)" />
      <span className="land-art-label">KEY ART: campaign war map</span>
    </div>
  );
}

export { Icon, IconCheck, IconLock, IconShield, IconNoSub, Embers, QueenHero, NapoleonHero };
