"use client";

/* eslint-disable react/no-unescaped-entities, @typescript-eslint/no-unused-vars */

import { openCheckout } from "@creem_io/react";
import { useState, useEffect, useCallback, useRef } from "react";
import { normalizeCreemCheckoutUrl } from "@/lib/checkout-url";

/* ── Era theme configs ── */
const ERA = {
  queen: {
    id: "queen",
    title: "THRONEERA",
    subtitle: "An Age of Crowns",
    tagline: "Ascend the throne. Every choice costs something.",
    startBtn: "Ascend the Throne →",
    nameInput: true,
    namePlaceholder: "Isolde",
    fixedName: null,
    identityLine: null,
    icon: "♛",
    chronicleTitle: "The Chronicle",
    chronicleSub: "The reigns of your house",
    archiveBtn: "Chronicle ✦",
    transitionLine: "The crown passes",
    transitionClose: "The crown passes to a new ruler. The realm remembers.",
    tracks: [
      { id: "nobility", label: "Noble Loyalty", short: "Nobles", left: "Revolt", right: "Coup" },
      { id: "people", label: "Public Faith", short: "People", left: "Uprising", right: "Zealotry" },
      { id: "army", label: "Military", short: "Army", left: "Invasion", right: "Junta" },
      { id: "treasury", label: "Royal Treasury", short: "Treasury", left: "Bankrupt", right: "Excess" },
    ],
    bg: "radial-gradient(125% 80% at 50% -8%, #1d160c 0%, #0b0806 52%, #070504 100%)",
    accent: "#c8a24c",
    accentLight: "#e6c873",
    accentGrad: "linear-gradient(180deg,#e6c873,#c8a24c 60%,#a07e2e)",
    accentGradHover: "linear-gradient(180deg,#f4df9f,#d4ae54 60%,#b08a34)",
    accentBtnText: "#1a1206",
    cardBg: "linear-gradient(180deg,rgba(29,23,14,.94),rgba(17,12,7,.94))",
    cardBorder: "rgba(201,162,76,.28)",
    choiceBg: "linear-gradient(180deg,rgba(40,32,20,.5),rgba(23,17,10,.5))",
    choiceBgHover: "linear-gradient(180deg,rgba(58,46,27,.7),rgba(33,25,15,.7))",
    choiceBorderHover: "rgba(230,200,115,.85)",
    npcBorder: "rgba(201,162,76,.5)",
    barGrad: "linear-gradient(90deg,#6f1620 0%,#9a6b27 26%,#dab85a 50%,#9a6b27 74%,#6f1620 100%)",
    markerGrad: "linear-gradient(145deg,#ffe9a8,#c8a24c)",
    markerBorder: "#6e5520",
    dangerGlow: "rgba(201,57,43,.75)",
    textPrimary: "#f0e4c4",
    textSecondary: "#cdbf9f",
    textMuted: "#9c8e6e",
    textDim: "#8c7f63",
    textDimmer: "#6b6048",
    divider: "rgba(201,162,76,.18)",
    pillBg: "rgba(201,162,76,.1)",
    pillBorder: "rgba(201,162,76,.3)",
  },
  napoleon: {
    id: "napoleon",
    title: "THRONEERA",
    subtitle: "An Empire of Eagles",
    tagline: "Seize power. Rewrite the map of Europe.",
    startBtn: "Seize Command →",
    nameInput: false,
    namePlaceholder: null,
    fixedName: "Napoleon Bonaparte",
    identityLine: "Emperor of the French · 1804",
    icon: "★",
    chronicleTitle: "The Archive",
    chronicleSub: "Campaigns of the empire",
    archiveBtn: "Records ✦",
    transitionLine: "The eagle passes",
    transitionClose: "One emperor falls; the empire marches on.",
    tracks: [
      { id: "army", label: "Army", short: "Army", left: "Mutiny", right: "Marshal Coup" },
      { id: "treasury", label: "Treasury", short: "Treasury", left: "Bankruptcy", right: "Profiteers" },
      { id: "diplomacy", label: "Diplomacy", short: "Diplo", left: "Coalition", right: "Puppet" },
      { id: "publicSupport", label: "Public Support", short: "People", left: "Abdication", right: "Cult" },
    ],
    bg: "radial-gradient(125% 80% at 50% -8%, #3c1a17 0%, #190d0c 52%, #0a0606 100%)",
    accent: "#c4a265",
    accentLight: "#e2c88f",
    accentGrad: "linear-gradient(180deg,#b34038,#8b2525 60%,#6a1818)",
    accentGradHover: "linear-gradient(180deg,#c4564a,#9c2e2e 60%,#7a2020)",
    accentBtnText: "#f5e9d8",
    cardBg: "linear-gradient(180deg,rgba(34,18,16,.94),rgba(21,11,10,.94))",
    cardBorder: "rgba(196,162,101,.3)",
    choiceBg: "linear-gradient(180deg,rgba(48,24,22,.5),rgba(25,13,12,.5))",
    choiceBgHover: "linear-gradient(180deg,rgba(70,33,29,.72),rgba(36,18,16,.72))",
    choiceBorderHover: "rgba(200,90,82,.9)",
    npcBorder: "rgba(168,56,56,.6)",
    barGrad: "linear-gradient(90deg,#7a141d 0%,#9a5a2c 26%,#cda064 50%,#9a5a2c 74%,#7a141d 100%)",
    markerGrad: "linear-gradient(145deg,#e8cf9a,#c4a265)",
    markerBorder: "#6e4a22",
    dangerGlow: "rgba(214,52,40,.8)",
    textPrimary: "#f0e6d6",
    textSecondary: "#c8b89c",
    textMuted: "#ab9a80",
    textDim: "#9a8a72",
    textDimmer: "#6a5a48",
    divider: "rgba(196,162,101,.2)",
    pillBg: "rgba(196,162,101,.12)",
    pillBorder: "rgba(196,162,101,.32)",
  },
};

/* ── Utility: Roman numerals ── */
function toRoman(n) {
  const m = [["M",1000],["CM",900],["D",500],["CD",400],["C",100],["XC",90],["L",50],["XL",40],["X",10],["IX",9],["V",5],["IV",4],["I",1]];
  let r = ""; for (const [s, v] of m) { while (n >= v) { r += s; n -= v; } } return r || "I";
}

/* ── Status Bar ── */
function StatusBar({ trackCfg, value, prevValue, theme }) {
  const pct = Math.max(0, Math.min(100, value));
  const isDanger = pct <= 20 || pct >= 80;
  const leftDanger = pct <= 20;
  const rightDanger = pct >= 80;

  return (
    <div style={{ marginBottom: 11 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
        <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: ".1em", color: theme.accent, textTransform: "uppercase" }}>
          {trackCfg.label}
        </span>
        <span style={{ fontFamily: "'Barlow Semi Condensed',sans-serif", fontSize: 12, color: theme.textMuted }}>
          {pct}
        </span>
      </div>
      <div style={{ position: "relative", height: 9, borderRadius: 6, background: theme.barGrad, boxShadow: "inset 0 1px 2px rgba(0,0,0,.65)" }}>
        {/* center line */}
        <div style={{ position: "absolute", left: "50%", top: -2, bottom: -2, width: 1, background: "rgba(255,245,220,.3)", transform: "translateX(-50%)" }} />
        {/* danger glow */}
        {isDanger && (
          <div style={{
            position: "absolute", top: "50%", left: `${pct}%`,
            width: 24, height: 24, borderRadius: "50%",
            background: `radial-gradient(circle,${theme.dangerGlow},transparent 70%)`,
            animation: "teDanger 1s ease-in-out infinite",
          }} />
        )}
        {/* diamond marker */}
        <div style={{
          position: "absolute", top: "50%", left: `${pct}%`,
          width: 13, height: 13,
          background: theme.markerGrad, border: `1px solid ${theme.markerBorder}`,
          transform: "translate(-50%,-50%) rotate(45deg)",
          transition: "left .5s cubic-bezier(.4,0,.2,1)",
          boxShadow: "0 0 6px rgba(0,0,0,.55)",
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
        <span style={{
          fontFamily: "'Barlow Semi Condensed',sans-serif", fontSize: 9,
          letterSpacing: ".1em", textTransform: "uppercase",
          color: leftDanger ? "#e07060" : theme.textDimmer,
        }}>◂ {trackCfg.left}</span>
        <span style={{
          fontFamily: "'Barlow Semi Condensed',sans-serif", fontSize: 9,
          letterSpacing: ".1em", textTransform: "uppercase",
          color: rightDanger ? "#e07060" : theme.textDimmer,
        }}>{trackCfg.right} ▸</span>
      </div>
    </div>
  );
}

/* ── Delta Popup ── */
function DeltaPopup({ trackId, delta, theme }) {
  if (!delta) return null;
  const color = delta > 0 ? "#9fb185" : "#c98f86";
  return (
    <span style={{
      position: "absolute", top: -18, right: 0,
      fontFamily: "'Barlow Semi Condensed',sans-serif", fontSize: 12, fontWeight: 600,
      color, animation: "teFadeUp .4s ease both",
    }}>
      {delta > 0 ? "+" : ""}{delta}
    </span>
  );
}

/* ── Choice Button ── */
function ChoiceButton({ choice, theme, disabled, onClick, tracks }) {
  const [hovered, setHovered] = useState(false);
  const previewTracks = choice.previewTracks || [];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
        width: "100%", textAlign: "left",
        background: hovered ? theme.choiceBgHover : theme.choiceBg,
        border: `1px solid ${hovered ? theme.choiceBorderHover : theme.pillBorder}`,
        borderRadius: 5, padding: "11px 13px",
        color: theme.textSecondary, cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "all .2s ease",
      }}
    >
      <span style={{ flex: 1 }}>
        <span style={{ display: "block", fontFamily: "'Cinzel',serif", fontSize: 15, color: theme.textPrimary, letterSpacing: ".02em" }}>
          {choice.label}
        </span>
        {choice.intent && (
          <span style={{ display: "block", fontSize: 12.5, color: theme.textMuted, fontStyle: "italic", marginTop: 2 }}>
            {choice.intent}
          </span>
        )}
      </span>
      <span style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "flex-end", minWidth: 64 }}>
        {previewTracks.map((tId) => {
          const t = tracks.find(tr => tr.id === tId);
          return (
            <span key={tId} style={{
              fontFamily: "'Barlow Semi Condensed',sans-serif", fontSize: 10,
              letterSpacing: ".05em", textTransform: "uppercase",
              color: theme.textMuted,
            }}>
              {t ? t.short : tId}
            </span>
          );
        })}
      </span>
    </button>
  );
}

/* ── Screens ── */

function StartScreen({ theme, onStart }) {
  const [name, setName] = useState("");

  const handleStart = () => {
    const rulerName = theme.nameInput ? (name.trim() || theme.namePlaceholder) : theme.fixedName;
    onStart(rulerName);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", justifyContent: "center", padding: "30px 4px", animation: "teFadeUp .5s ease both" }}>
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <div style={{
          width: 66, height: 66, borderRadius: "50%",
          border: `1px solid ${theme.pillBorder}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
          boxShadow: `inset 0 0 18px ${theme.pillBg}, 0 4px 14px rgba(0,0,0,.4)`,
        }}>
          <span style={{ fontSize: 30, color: theme.accentLight, lineHeight: 1 }}>{theme.icon}</span>
        </div>
        <div style={{ fontFamily: "'Barlow Semi Condensed',sans-serif", fontSize: 11, letterSpacing: ".42em", textTransform: "uppercase", color: theme.textDim, marginBottom: 12 }}>
          {theme.subtitle}
        </div>
        <div style={{
          fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 40, letterSpacing: ".07em", lineHeight: 1,
          background: `linear-gradient(180deg,${theme.accentLight},${theme.accent} 55%,#8c6a23)`,
          WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
        }}>
          {theme.title}
        </div>
        <div style={{ width: 54, height: 1, background: `linear-gradient(90deg,transparent,${theme.accent},transparent)`, margin: "18px auto 14px" }} />
        <div style={{ fontStyle: "italic", fontSize: 16, color: theme.textSecondary, lineHeight: 1.5, maxWidth: 300, margin: "0 auto" }}>
          {theme.tagline}
        </div>
      </div>

      {theme.nameInput ? (
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontFamily: "'Barlow Semi Condensed',sans-serif", fontSize: 10.5, letterSpacing: ".16em", textTransform: "uppercase", color: theme.textMuted, marginBottom: 8 }}>
            Choose your royal name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={theme.namePlaceholder}
            onKeyDown={(e) => e.key === "Enter" && handleStart()}
            style={{
              width: "100%", boxSizing: "border-box",
              background: "rgba(255,255,255,.04)",
              border: `1px solid ${theme.pillBorder}`,
              borderRadius: 5, padding: "12px 14px",
              color: theme.textPrimary,
              fontFamily: "'Cinzel',serif", fontSize: 17, outline: "none",
            }}
          />
        </div>
      ) : (
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 19, color: theme.textPrimary, letterSpacing: ".04em" }}>{theme.fixedName}</div>
          {theme.identityLine && (
            <div style={{ fontFamily: "'Barlow Semi Condensed',sans-serif", fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: theme.textMuted, marginTop: 5 }}>
              {theme.identityLine}
            </div>
          )}
        </div>
      )}

      <button onClick={handleStart} style={{
        width: "100%", background: theme.accentGrad, color: theme.accentBtnText,
        border: "none", borderRadius: 6, padding: 15,
        fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 16, letterSpacing: ".05em",
        cursor: "pointer", boxShadow: "0 6px 20px rgba(0,0,0,.22)",
      }}>
        {theme.startBtn}
      </button>
    </div>
  );
}

function ActiveGameScreen({ gameState, card, theme, onChoice, onArchive }) {
  const [busy, setBusy] = useState(false);
  const gen = gameState.generation || 1;
  const legacies = gameState.inheritedLegacies || [];

  const handleChoice = async (idx) => {
    if (busy) return;
    setBusy(true);
    await onChoice(idx);
    setBusy(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", animation: "teFadeUp .45s ease both" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0 8px" }}>
        <span style={{ fontFamily: "'Barlow Semi Condensed',sans-serif", fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: theme.textDim, minWidth: 64 }}>
          Gen {toRoman(gen)}
        </span>
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 17, color: theme.textPrimary, letterSpacing: ".03em" }}>{gameState.rulerName}</div>
          <div style={{ fontFamily: "'Barlow Semi Condensed',sans-serif", fontSize: 10.5, letterSpacing: ".18em", color: theme.textMuted, marginTop: 1 }}>{gameState.year} AD</div>
        </div>
        <button onClick={onArchive} style={{
          minWidth: 64, textAlign: "right", background: "none", border: "none", cursor: "pointer",
          fontFamily: "'Barlow Semi Condensed',sans-serif", fontSize: 10.5, letterSpacing: ".12em", textTransform: "uppercase", color: theme.textMuted,
        }}>
          {theme.archiveBtn}
        </button>
      </div>

      {/* Legacy badge */}
      {legacies.length > 0 && (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
          <span style={{
            fontFamily: "'Barlow Semi Condensed',sans-serif", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase",
            color: theme.accent, background: theme.pillBg, border: `1px solid ${theme.pillBorder}`, borderRadius: 20, padding: "3px 13px",
          }}>
            ✦ {legacies[legacies.length - 1]?.label || "Legacy"}
          </span>
        </div>
      )}

      {/* Event card + choices */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 15, padding: "8px 0" }}>
        {card && (
          <div style={{ animation: "teFadeUp .35s ease both" }}>
            <div style={{
              background: theme.cardBg, border: `1px solid ${theme.cardBorder}`,
              borderRadius: 7, padding: "22px 20px",
              boxShadow: "0 12px 32px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,235,190,.06)",
            }}>
              {card.npc?.name && (
                <div style={{ borderLeft: `2px solid ${theme.npcBorder}`, padding: "2px 0 2px 12px", margin: "0 0 15px" }}>
                  <div style={{ fontFamily: "'Barlow Semi Condensed',sans-serif", fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: theme.accent, marginBottom: 4 }}>
                    {card.npc.name}
                  </div>
                  <div style={{ fontStyle: "italic", fontSize: 14, lineHeight: 1.45, color: theme.textSecondary }}>
                    "{card.npc.line}"
                  </div>
                </div>
              )}
              <h2 style={{ fontFamily: "'Cinzel',serif", fontWeight: 600, fontSize: 22, lineHeight: 1.22, color: theme.textPrimary, margin: "0 0 12px" }}>
                {card.title}
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.55, color: theme.textSecondary, margin: 0 }}>
                {card.body}
              </p>
            </div>
          </div>
        )}

        {card?.choices && (
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {card.choices.map((c, i) => (
              <ChoiceButton
                key={c.id || i}
                choice={c}
                theme={theme}
                disabled={busy}
                tracks={theme.tracks}
                onClick={() => handleChoice(i)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Status bars */}
      <div style={{ padding: "6px 0 18px" }}>
        {theme.tracks.map((t) => (
          <StatusBar
            key={t.id}
            trackCfg={t}
            value={gameState.bars?.[t.id] ?? 50}
            theme={theme}
          />
        ))}
      </div>
    </div>
  );
}

function TerminalScreen({ gameState, result, theme, onNext, onArchive }) {
  const death = result?.death;
  const record = result?.dynastyRecord;
  const isVictory = result?.type === "victory";
  const startYear = record?.startYear || gameState.year;
  const endYear = record?.endYear || gameState.year;
  const reignLen = record?.rulingYears || (endYear - startYear);
  const keyChoices = gameState.keyChoices || [];
  const gainedLegacies = record?.gainedLegacies || gameState.pendingLegacies || [];
  const isFirstDeath = gameState.generation === 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", padding: "24px 2px 26px", animation: "teFadeUp .6s ease both" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginTop: 6 }}>
        <div style={{ fontFamily: "'Barlow Semi Condensed',sans-serif", fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", color: theme.textDim }}>
          {isVictory ? "A Reign Triumphant" : "The Reign Has Ended"}
        </div>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 20, color: theme.textPrimary, marginTop: 6 }}>{gameState.rulerName}</div>
        <div style={{ fontFamily: "'Barlow Semi Condensed',sans-serif", fontSize: 11, letterSpacing: ".12em", color: theme.textMuted, marginTop: 3 }}>
          {startYear}–{endYear} AD · {reignLen} years
        </div>
      </div>

      {/* Death name + cause */}
      <div style={{ textAlign: "center", margin: "24px 0 4px", animation: "teSeal .6s ease both" }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 30, letterSpacing: ".03em", color: isVictory ? theme.accentLight : "#e07060", lineHeight: 1.1 }}>
          {death?.label || (isVictory ? "The Long Reign" : "Fallen")}
        </div>
        {death?.causeTrack && (
          <div style={{
            display: "inline-block", marginTop: 11,
            border: "1px solid rgba(192,57,43,.5)", borderRadius: 20, padding: "4px 14px",
            fontFamily: "'Barlow Semi Condensed',sans-serif", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "#e0746a",
          }}>
            {theme.tracks.find(t => t.id === death.causeTrack)?.label || death.causeTrack} — {death.direction === "too_low" ? "Too Low" : "Too High"}
          </div>
        )}
      </div>

      {/* Epitaph */}
      <p style={{ textAlign: "center", fontStyle: "italic", fontSize: 17, lineHeight: 1.6, color: theme.textSecondary, maxWidth: 330, margin: "20px auto 4px" }}>
        "{death?.epitaphTemplate || "History remembers."}"
      </p>

      {/* First death teaching hint */}
      {isFirstDeath && !isVictory && (
        <p style={{ textAlign: "center", fontSize: 13, color: theme.textDim, maxWidth: 300, margin: "8px auto 0", lineHeight: 1.5 }}>
          When any power grows unchecked, it turns against the throne. Keep all four forces in balance to survive.
        </p>
      )}

      {/* Key choices */}
      {keyChoices.length > 0 && (
        <div style={{ borderTop: `1px solid ${theme.divider}`, borderBottom: `1px solid ${theme.divider}`, padding: "14px 4px", margin: "14px 0" }}>
          <div style={{ fontFamily: "'Barlow Semi Condensed',sans-serif", fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: theme.textDim, marginBottom: 9 }}>
            As history records
          </div>
          {keyChoices.slice(-5).map((kc, i) => (
            <div key={i} style={{ display: "flex", gap: 9, fontSize: 13.5, color: theme.textSecondary, lineHeight: 1.5, marginBottom: 6 }}>
              <span style={{ color: theme.accent }}>—</span>
              <span>{kc.summary || kc.choiceLabel}</span>
            </div>
          ))}
        </div>
      )}

      {/* Final status bars */}
      <div style={{ margin: "4px 0 2px" }}>
        {theme.tracks.map((t) => (
          <StatusBar key={t.id} trackCfg={t} value={gameState.bars?.[t.id] ?? 50} theme={theme} />
        ))}
      </div>

      {/* Legacy earned */}
      {gainedLegacies.length > 0 && (
        <div style={{
          display: "flex", alignItems: "center", gap: 11,
          background: `linear-gradient(90deg,${theme.pillBg},transparent)`,
          border: `1px solid ${theme.pillBorder}`, borderRadius: 6, padding: "12px 14px", margin: "14px 0 16px",
        }}>
          <span style={{ fontSize: 22, color: theme.accentLight, lineHeight: 1 }}>✦</span>
          <span style={{ flex: 1 }}>
            <span style={{ display: "block", fontFamily: "'Barlow Semi Condensed',sans-serif", fontSize: 9.5, letterSpacing: ".16em", textTransform: "uppercase", color: theme.textMuted }}>Legacy earned</span>
            <span style={{ display: "block", fontFamily: "'Cinzel',serif", fontSize: 15, color: theme.textPrimary, marginTop: 2 }}>{gainedLegacies[0]?.label}</span>
          </span>
        </div>
      )}

      {/* Fates discovered */}
      {gameState.fatesDiscovered?.length > 0 && (
        <div style={{ textAlign: "center", margin: "4px 0 14px" }}>
          <span style={{ fontFamily: "'Barlow Semi Condensed',sans-serif", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: theme.textDim }}>
            Fates discovered: {gameState.fatesDiscovered.length} / <span style={{ color: theme.textDimmer }}>?</span>
          </span>
        </div>
      )}

      {/* Buttons */}
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
        <button onClick={onNext} style={{
          width: "100%", background: theme.accentGrad, color: theme.accentBtnText,
          border: "none", borderRadius: 6, padding: 15,
          fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 15, letterSpacing: ".04em",
          cursor: "pointer", boxShadow: "0 6px 20px rgba(0,0,0,.22)",
        }}>
          Next Ruler →
        </button>
        <button onClick={onArchive} style={{
          width: "100%", background: "none",
          border: `1px solid ${theme.pillBorder}`, borderRadius: 6, padding: 13,
          fontFamily: "'Cinzel',serif", fontSize: 14, letterSpacing: ".04em", color: theme.accent, cursor: "pointer",
        }}>
          View the {theme.chronicleTitle}
        </button>
      </div>
    </div>
  );
}

function TransitionScreen({ prevRuler, nextRuler, nextGen, nextYear, legacy, theme, onContinue }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "100vh", textAlign: "center", padding: 30, animation: "teFadeUp .6s ease both" }}>
      <div style={{ fontFamily: "'Barlow Semi Condensed',sans-serif", letterSpacing: ".26em", textTransform: "uppercase", fontSize: 11, color: theme.textDim }}>
        {theme.transitionLine}
      </div>
      <div style={{ fontSize: 56, color: theme.accentLight, margin: "22px 0 6px", animation: "teCrown 2.4s ease-in-out infinite" }}>{theme.icon}</div>
      <div style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: 14, color: theme.textMuted, marginTop: 6 }}>
        {prevRuler} has fallen.
      </div>
      <div style={{ width: 40, height: 1, background: `linear-gradient(90deg,transparent,${theme.accent},transparent)`, margin: "22px auto" }} />
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 23, color: theme.textPrimary }}>{nextRuler}</div>
      <div style={{ fontFamily: "'Barlow Semi Condensed',sans-serif", fontSize: 12, letterSpacing: ".18em", color: theme.textMuted, marginTop: 5 }}>{nextYear} AD</div>
      {legacy && (
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 9,
          background: theme.pillBg, border: `1px solid ${theme.pillBorder}`,
          borderRadius: 6, padding: "10px 16px", marginTop: 22,
        }}>
          <span style={{ fontSize: 16, color: theme.accentLight }}>✦</span>
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: 14, color: theme.textPrimary }}>{legacy.label}</span>
        </div>
      )}
      <p style={{ fontStyle: "italic", fontSize: 15, color: theme.textSecondary, lineHeight: 1.6, maxWidth: 280, margin: "26px auto 22px" }}>
        {theme.transitionClose}
      </p>
      <button onClick={onContinue} style={{
        background: "none", border: `1px solid ${theme.pillBorder}`,
        borderRadius: 24, padding: "10px 24px",
        fontFamily: "'Cinzel',serif", fontSize: 14, color: theme.accent, cursor: "pointer", letterSpacing: ".04em",
      }}>
        Continue ›
      </button>
    </div>
  );
}

function ArchiveScreen({ dynastyRecords, gameState, theme, onBack }) {
  return (
    <div style={{ minHeight: "100vh", padding: "24px 2px 30px", animation: "teFadeUp .45s ease both" }}>
      <div style={{ textAlign: "center", marginBottom: 6 }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 24, color: theme.textPrimary, letterSpacing: ".04em" }}>{theme.chronicleTitle}</div>
        <div style={{ fontFamily: "'Barlow Semi Condensed',sans-serif", fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: theme.textDim, marginTop: 4 }}>{theme.chronicleSub}</div>
        <div style={{ width: 50, height: 1, background: `linear-gradient(90deg,transparent,${theme.accent},transparent)`, margin: "16px auto 20px" }} />
      </div>
      {(dynastyRecords || []).map((rec, i) => {
        const isCurrent = i === dynastyRecords.length - 1 && gameState?.phase === "active";
        return (
          <div key={rec.id || i} style={{
            border: `1px solid ${isCurrent ? theme.accent : theme.divider}`,
            borderRadius: 6, padding: "13px 15px", marginBottom: 10,
            background: isCurrent ? theme.pillBg : "transparent",
            display: "flex", gap: 13, alignItems: "flex-start",
          }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, color: theme.accent, minWidth: 32, paddingTop: 2 }}>
              {toRoman(rec.generation)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: 16, color: theme.textPrimary }}>{rec.rulerName}</span>
                <span style={{
                  fontFamily: "'Barlow Semi Condensed',sans-serif", fontSize: 9.5, letterSpacing: ".12em", textTransform: "uppercase",
                  color: isCurrent ? theme.accentLight : (rec.terminalType === "victory" ? "#9fb185" : "#e0746a"),
                  whiteSpace: "nowrap",
                }}>
                  {isCurrent ? "Reigning" : rec.terminalType === "victory" ? "Triumphant" : "Fallen"}
                </span>
              </div>
              <div style={{ fontFamily: "'Barlow Semi Condensed',sans-serif", fontSize: 11.5, letterSpacing: ".04em", color: theme.textMuted, marginTop: 3 }}>
                {rec.startYear}–{rec.endYear || "?"} AD · {rec.rulingYears || 0} yrs
              </div>
              {rec.death?.label && (
                <div style={{ fontSize: 13, color: theme.textSecondary, marginTop: 6 }}>{rec.death.label}</div>
              )}
              {rec.gainedLegacies?.length > 0 && (
                <div style={{ fontFamily: "'Barlow Semi Condensed',sans-serif", fontSize: 10.5, letterSpacing: ".06em", textTransform: "uppercase", color: theme.accent, marginTop: 7 }}>
                  ✦ {rec.gainedLegacies[0].label}
                </div>
              )}
            </div>
          </div>
        );
      })}
      <button onClick={onBack} style={{
        width: "100%", background: "none",
        border: `1px solid ${theme.pillBorder}`, borderRadius: 6, padding: 13,
        fontFamily: "'Cinzel',serif", fontSize: 14, letterSpacing: ".04em", color: theme.accent, cursor: "pointer", marginTop: 8,
      }}>
        ← Return
      </button>
    </div>
  );
}

function PaywallScreen({ paywallData, theme, onPurchase, onExit }) {
  const records = paywallData?.dynastyRecords || [];
  const fates = paywallData?.fatesDiscovered || [];
  const nextGen = paywallData?.nextGeneration || 3;

  const timeline = [
    ...records.map((r) => ({
      genRoman: toRoman(r.generation),
      name: r.rulerName,
      sub: r.death?.label || "Fallen",
      filled: true,
    })),
    { genRoman: toRoman(nextGen), name: "?", sub: "Awaiting the throne", filled: false },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", padding: "28px 4px 22px", animation: "teFadeUp .6s ease both" }}>
      {/* Header */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "'Barlow Semi Condensed',sans-serif", fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", color: theme.textDim }}>Your dynasty endures</div>
        <div style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 25, color: theme.textPrimary, marginTop: 7, letterSpacing: ".02em" }}>The Chronicle Continues</div>
        <div style={{ width: 50, height: 1, background: `linear-gradient(90deg,transparent,${theme.accent},transparent)`, margin: "15px auto 0" }} />
      </div>

      {/* Dynasty timeline */}
      <div style={{ margin: "22px 0 2px" }}>
        {timeline.map((t, i) => (
          <div key={i} style={{ display: "flex", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 14 }}>
              <div style={{
                width: t.filled ? 10 : 10, height: t.filled ? 10 : 10, borderRadius: "50%",
                background: t.filled ? theme.accent : "transparent",
                border: t.filled ? "none" : `1.5px dashed ${theme.textDim}`,
                marginTop: 4,
              }} />
              {i < timeline.length - 1 && (
                <div style={{ flex: 1, width: 1, minHeight: 22, background: `linear-gradient(180deg,${theme.pillBorder},${theme.divider})` }} />
              )}
            </div>
            <div style={{ paddingBottom: 14 }}>
              <div style={{ fontFamily: "'Barlow Semi Condensed',sans-serif", fontSize: 9.5, letterSpacing: ".16em", textTransform: "uppercase", color: theme.textDim }}>
                Generation {t.genRoman}
              </div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 16, color: t.filled ? theme.textPrimary : theme.textDim, marginTop: 1 }}>
                {t.name}
              </div>
              <div style={{ fontSize: 13, fontStyle: "italic", color: t.filled ? theme.textMuted : theme.textDimmer, marginTop: 1 }}>
                {t.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fates discovered */}
      <div style={{ borderTop: `1px solid ${theme.divider}`, borderBottom: `1px solid ${theme.divider}`, padding: "15px 4px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "'Barlow Semi Condensed',sans-serif", fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: theme.textDim }}>Fates discovered</span>
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: 19, color: theme.accentLight }}>
            {fates.length} <span style={{ color: theme.textDimmer }}>/ ?</span>
          </span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 11 }}>
          {fates.map((f, i) => (
            <span key={i} style={{
              fontFamily: "'Barlow Semi Condensed',sans-serif", fontSize: 11, letterSpacing: ".04em",
              color: theme.accent, border: `1px solid ${theme.pillBorder}`, borderRadius: 20, padding: "3px 11px",
            }}>
              {f} ✓
            </span>
          ))}
        </div>
        <div style={{ fontSize: 13, fontStyle: "italic", color: theme.textMuted, marginTop: 11 }}>
          Other fates remain unwritten.
        </div>
      </div>

      {/* CTA */}
      <div style={{ marginTop: "auto", paddingTop: 22 }}>
        <button onClick={onPurchase} style={{
          width: "100%", background: theme.accentGrad, color: theme.accentBtnText,
          border: "none", borderRadius: 6, padding: 15,
          fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 16, letterSpacing: ".03em",
          cursor: "pointer", boxShadow: "0 6px 22px rgba(0,0,0,.26)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
        }}>
          Continue Your Dynasty <span style={{ opacity: 0.55 }}>·</span> $4.99
        </button>
        <div style={{ textAlign: "center", fontSize: 12.5, fontStyle: "italic", color: theme.textMuted, marginTop: 11, lineHeight: 1.5 }}>
          Unlimited reigns · Unwritten fates · Your legacy lives on
        </div>
        <div style={{ textAlign: "center", marginTop: 17 }}>
          <span onClick={onExit} style={{
            fontFamily: "'Barlow Semi Condensed',sans-serif", fontSize: 12, letterSpacing: ".05em",
            color: theme.textDimmer, cursor: "pointer",
            borderBottom: `1px solid ${theme.divider}`, paddingBottom: 1,
          }}>
            End your dynasty here
          </span>
        </div>
        <div style={{ textAlign: "center", fontFamily: "'Barlow Semi Condensed',sans-serif", fontSize: 9.5, letterSpacing: ".1em", textTransform: "uppercase", color: theme.textDimmer, marginTop: 15 }}>
          One-time purchase · No subscription
        </div>
      </div>
    </div>
  );
}

function CampaignCompleteScreen({ completionData, theme, onReplay, onUnlimited, onExit }) {
  const records = completionData?.dynastyRecords || [];
  const fates = completionData?.fatesDiscovered || [];
  const totalGens = completionData?.totalGenerations || 0;
  const longest = completionData?.longestReign;
  const shortest = completionData?.shortestReign;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", padding: "28px 4px 22px", animation: "teFadeUp .6s ease both" }}>
      {/* Header */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "'Barlow Semi Condensed',sans-serif", fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", color: theme.textDim }}>
          The chronicle is complete
        </div>
        <div style={{ fontSize: 48, color: theme.accentLight, margin: "16px 0 8px", animation: "teCrown 2.4s ease-in-out infinite" }}>{theme.icon}</div>
        <div style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 25, color: theme.textPrimary, letterSpacing: ".02em" }}>
          Your Dynasty Is Complete
        </div>
        <div style={{ width: 50, height: 1, background: `linear-gradient(90deg,transparent,${theme.accent},transparent)`, margin: "15px auto 0" }} />
      </div>

      {/* Stats summary */}
      <div style={{ borderTop: `1px solid ${theme.divider}`, borderBottom: `1px solid ${theme.divider}`, padding: "16px 4px", margin: "22px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontFamily: "'Barlow Semi Condensed',sans-serif", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: theme.textDim }}>Rulers ascended</span>
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: 16, color: theme.textPrimary }}>{totalGens}</span>
        </div>
        {longest && (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontFamily: "'Barlow Semi Condensed',sans-serif", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: theme.textDim }}>Longest reign</span>
            <span style={{ fontSize: 13, color: theme.textSecondary }}>{longest.rulerName} — {longest.years} yrs</span>
          </div>
        )}
        {shortest && (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontFamily: "'Barlow Semi Condensed',sans-serif", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: theme.textDim }}>Shortest reign</span>
            <span style={{ fontSize: 13, color: theme.textSecondary }}>{shortest.rulerName} — {shortest.years} yrs</span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "'Barlow Semi Condensed',sans-serif", fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: theme.textDim }}>Fates discovered</span>
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: 19, color: theme.accentLight }}>
            {fates.length} <span style={{ color: theme.textDimmer }}>/ ?</span>
          </span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 11 }}>
          {fates.map((f, i) => (
            <span key={i} style={{
              fontFamily: "'Barlow Semi Condensed',sans-serif", fontSize: 11, letterSpacing: ".04em",
              color: theme.accent, border: `1px solid ${theme.pillBorder}`, borderRadius: 20, padding: "3px 11px",
            }}>
              {f} ✓
            </span>
          ))}
        </div>
      </div>

      {/* Curiosity hook */}
      <p style={{ textAlign: "center", fontStyle: "italic", fontSize: 16, lineHeight: 1.6, color: theme.textSecondary, maxWidth: 300, margin: "0 auto 24px" }}>
        Different choices forge different histories.
      </p>

      {/* CTA buttons */}
      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
        <button onClick={onReplay} style={{
          width: "100%", background: theme.accentGrad, color: theme.accentBtnText,
          border: "none", borderRadius: 6, padding: 15,
          fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 15, letterSpacing: ".03em",
          cursor: "pointer", boxShadow: "0 6px 22px rgba(0,0,0,.26)",
        }}>
          New Dynasty · New Fates — $4.99
        </button>
        <button onClick={onUnlimited} style={{
          width: "100%", background: "none",
          border: `1px solid ${theme.pillBorder}`, borderRadius: 6, padding: 14,
          fontFamily: "'Cinzel',serif", fontSize: 14, letterSpacing: ".03em", color: theme.accent, cursor: "pointer",
        }}>
          Rule Forever — $14.99
        </button>
        <div style={{ textAlign: "center", fontSize: 12, color: theme.textMuted, fontStyle: "italic", marginTop: 4, lineHeight: 1.5 }}>
          Every dynasty, from now until the end of time.
        </div>
        <div style={{ textAlign: "center", fontFamily: "'Barlow Semi Condensed',sans-serif", fontSize: 9.5, letterSpacing: ".1em", textTransform: "uppercase", color: theme.textDimmer, marginTop: 8 }}>
          One-time purchases · No subscription
        </div>
        <div style={{ textAlign: "center", marginTop: 14 }}>
          <span onClick={onExit} style={{
            fontFamily: "'Barlow Semi Condensed',sans-serif", fontSize: 12, letterSpacing: ".05em",
            color: theme.textDimmer, cursor: "pointer",
            borderBottom: `1px solid ${theme.divider}`, paddingBottom: 1,
          }}>
            You've completed your reign. Thank you for playing.
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Global CSS (injected once) ── */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Barlow+Semi+Condensed:wght@500;600;700&display=swap');
@keyframes teDanger{0%,100%{opacity:.3;transform:translate(-50%,-50%) scale(.7);}50%{opacity:.95;transform:translate(-50%,-50%) scale(1.35);}}
@keyframes teFadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
@keyframes teCrown{0%,100%{text-shadow:0 0 16px rgba(201,162,76,.35);transform:scale(1);}50%{text-shadow:0 0 38px rgba(230,200,115,.9);transform:scale(1.07);}}
@keyframes teSeal{from{opacity:0;transform:scale(.82);}to{opacity:1;transform:scale(1);}}
*{-webkit-tap-highlight-color:transparent; box-sizing:border-box;}
`;

/* ── Main Component ── */
export default function ThroneEraGame({ era = "queen" }) {
  const theme = ERA[era] || ERA.queen;
  const [screen, setScreen] = useState("start"); // start | game | terminal | transition | archive | paywall | campaign_complete
  const [gameState, setGameState] = useState(null);
  const [card, setCard] = useState(null);
  const [result, setResult] = useState(null);
  const [paywallData, setPaywallData] = useState(null);
  const [completionData, setCompletionData] = useState(null);
  const [prevScreen, setPrevScreen] = useState("start");
  const [transitionData, setTransitionData] = useState(null);
  const cssInjected = useRef(false);

  useEffect(() => {
    if (!cssInjected.current) {
      const style = document.createElement("style");
      style.textContent = GLOBAL_CSS;
      document.head.appendChild(style);
      cssInjected.current = true;
    }
  }, []);

  const apiCall = useCallback(async (path, body) => {
    const res = await fetch(`/api/engine-v3/${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.json();
  }, []);

  const handleStart = useCallback(async (rulerName) => {
    const data = await apiCall("start", { era, rulerName });
    setGameState(data.gameState);
    setCard(data.card);
    setScreen("game");
  }, [era, apiCall]);

  const handleChoice = useCallback(async (choiceIndex) => {
    const data = await apiCall("choice", {
      runId: gameState.runId,
      gameState,
      eventId: card.eventId,
      choiceIndex,
    });
    setGameState(data.gameState);
    if (data.result.type === "continue") {
      setCard(data.nextCard);
    } else {
      setResult(data.result);
      setCard(null);
      setTimeout(() => setScreen("terminal"), 600);
    }
  }, [gameState, card, apiCall]);

  const handleRestart = useCallback(async () => {
    const data = await apiCall("restart", {
      runId: gameState.runId,
      terminalState: gameState,
      dynastyRecord: result?.dynastyRecord,
    });
    if (data.status === "ok") {
      const prevName = gameState.rulerName;
      const newState = data.gameState;
      setTransitionData({
        prevRuler: prevName,
        nextRuler: newState.rulerName,
        nextGen: newState.generation,
        nextYear: newState.year,
        legacy: newState.inheritedLegacies?.[newState.inheritedLegacies.length - 1] || null,
        gameState: newState,
        card: data.card,
      });
      setScreen("transition");
    } else if (data.status === "campaign_complete") {
      setCompletionData(data.completionData);
      setScreen("campaign_complete");
    } else {
      setPaywallData(data.paywallData);
      setScreen("paywall");
    }
  }, [gameState, result, apiCall]);

  const handleTransitionContinue = useCallback(() => {
    if (transitionData) {
      setGameState(transitionData.gameState);
      setCard(transitionData.card);
      setResult(null);
      setScreen("game");
    }
  }, [transitionData]);

  const openVerifiedCheckout = useCallback(async (purchaseKind, afterVerifiedPurchase) => {
    const checkoutResponse = await fetch("/api/engine-v3/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        era,
        runId: gameState.runId,
        rulerName: gameState.rulerName,
        purchaseKind,
        campaignNumber: gameState.campaignNumber,
      }),
    });
    const checkout = await checkoutResponse.json();
    if (!checkoutResponse.ok) {
      throw new Error(checkout?.error || "Checkout could not be opened");
    }

    if (checkout.verified) {
      await afterVerifiedPurchase();
      return;
    }

    const verifyAndUnlock = async () => {
      const completionResponse = await fetch("/api/engine-v3/checkout/complete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ checkoutRunId: checkout.checkoutRunId, purchaseKind }),
      });
      const completion = await completionResponse.json();
      if (!completionResponse.ok || !completion.verified) {
        throw new Error(completion?.error || "Payment has not been verified yet");
      }
      await afterVerifiedPurchase();
    };

    const checkoutUrl = normalizeCreemCheckoutUrl(checkout.checkoutUrl || "");
    if (checkoutUrl.startsWith("/api/mock-checkout")) {
      await fetch(checkoutUrl);
      await verifyAndUnlock();
      return;
    }

    openCheckout({
      checkoutUrl,
      theme: "dark",
      onComplete: () => {
        void verifyAndUnlock();
      },
    });
  }, [era, gameState]);

  const handlePurchase = useCallback(async () => {
    await openVerifiedCheckout("campaign", async () => {
      const data = await apiCall("unlock", {
        runId: gameState.runId,
        terminalState: gameState,
        dynastyRecord: result?.dynastyRecord,
      });
      setGameState(data.gameState);
      setCard(data.card);
      setResult(null);
      setPaywallData(null);
      setScreen("game");
    });
  }, [gameState, result, apiCall, openVerifiedCheckout]);

  const handleReplayPurchase = useCallback(async () => {
    await openVerifiedCheckout("replay", async () => {
      const data = await apiCall("unlock-replay", {
        runId: gameState.runId,
        terminalState: gameState,
        dynastyRecord: result?.dynastyRecord,
      });
      setGameState(data.gameState);
      setCard(data.card);
      setResult(null);
      setCompletionData(null);
      setScreen("game");
    });
  }, [gameState, result, apiCall, openVerifiedCheckout]);

  const handleUnlimitedPurchase = useCallback(async () => {
    await openVerifiedCheckout("unlimited", async () => {
      const data = await apiCall("unlock-unlimited", {
        runId: gameState.runId,
        terminalState: gameState,
        dynastyRecord: result?.dynastyRecord,
      });
      setGameState(data.gameState);
      setCard(data.card);
      setResult(null);
      setCompletionData(null);
      setScreen("game");
    });
  }, [gameState, result, apiCall, openVerifiedCheckout]);

  const handleArchive = useCallback(() => {
    setPrevScreen(screen);
    setScreen("archive");
  }, [screen]);

  const handleArchiveBack = useCallback(() => {
    setScreen(prevScreen || "game");
  }, [prevScreen]);

  const handleExit = useCallback(() => {
    setScreen("start");
    setGameState(null);
    setCard(null);
    setResult(null);
    setPaywallData(null);
    setCompletionData(null);
  }, []);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", justifyContent: "center",
      background: theme.bg, fontFamily: "'EB Garamond',serif", color: theme.textSecondary,
    }}>
      <div style={{ width: "100%", maxWidth: 440, minHeight: "100vh", position: "relative", padding: "0 18px" }}>

        {screen === "start" && (
          <StartScreen theme={theme} onStart={handleStart} />
        )}

        {screen === "game" && gameState && card && (
          <ActiveGameScreen
            gameState={gameState} card={card} theme={theme}
            onChoice={handleChoice} onArchive={handleArchive}
          />
        )}

        {screen === "terminal" && gameState && result && (
          <TerminalScreen
            gameState={gameState} result={result} theme={theme}
            onNext={handleRestart} onArchive={handleArchive}
          />
        )}

        {screen === "transition" && transitionData && (
          <TransitionScreen
            prevRuler={transitionData.prevRuler}
            nextRuler={transitionData.nextRuler}
            nextGen={transitionData.nextGen}
            nextYear={transitionData.nextYear}
            legacy={transitionData.legacy}
            theme={theme}
            onContinue={handleTransitionContinue}
          />
        )}

        {screen === "archive" && (
          <ArchiveScreen
            dynastyRecords={gameState?.dynastyRecords || []}
            gameState={gameState}
            theme={theme}
            onBack={handleArchiveBack}
          />
        )}

        {screen === "paywall" && paywallData && (
          <PaywallScreen
            paywallData={paywallData}
            theme={theme}
            onPurchase={handlePurchase}
            onExit={handleExit}
          />
        )}

        {screen === "campaign_complete" && completionData && (
          <CampaignCompleteScreen
            completionData={completionData}
            theme={theme}
            onReplay={handleReplayPurchase}
            onUnlimited={handleUnlimitedPurchase}
            onExit={handleExit}
          />
        )}
      </div>
    </div>
  );
}
