import type { EngineEvent, EraId } from "@/lib/engine-v3/event.schema";
import { SCRIPTED_EVENT_POOL } from "@/lib/engine-v3/scripted";

export const FALLBACK_EVENT_BY_ERA: Record<EraId, EngineEvent> = {
  queen: {
    id: "queen_fallback_court_murmur",
    era: "queen",
    tags: ["governance", "court"],
    trigger: {},
    choices: [
      {
        id: "listen",
        labelTemplate: "Hear the petition",
        intent: "Delay judgment",
        previewTracks: ["people"],
      },
      {
        id: "dismiss",
        labelTemplate: "Dismiss the court",
        intent: "Preserve authority",
        previewTracks: ["nobility"],
      },
    ],
    effects: {
      listen: { delta: { people: 2, nobility: -1 } },
      dismiss: { delta: { nobility: 2, people: -1 } },
    },
    requires: {},
    excludes: {},
    cooldown: { event: 1 },
    llmRenderMode: "none",
    weight: 0,
    template: {
      title: "A Small Petition",
      body: "The court produces one more matter for {{rulerName}} before the candles burn out.",
    },
  },
  napoleon: {
    id: "napoleon_fallback_dispatch",
    era: "napoleon",
    tags: ["governance", "military"],
    trigger: {},
    choices: [
      {
        id: "inspect_lines",
        labelTemplate: "Inspect the lines",
        intent: "Stabilize the army",
        previewTracks: ["army"],
      },
      {
        id: "write_paris",
        labelTemplate: "Write to Paris",
        intent: "Stabilize public opinion",
        previewTracks: ["publicSupport"],
      },
    ],
    effects: {
      inspect_lines: { delta: { army: 2, treasury: -1 } },
      write_paris: { delta: { publicSupport: 2, diplomacy: -1 } },
    },
    requires: {},
    excludes: {},
    cooldown: { event: 1 },
    llmRenderMode: "none",
    weight: 0,
    template: {
      title: "A Quiet Dispatch",
      body: "{{rulerName}} receives one more dispatch before the camp sleeps.",
    },
  },
};

export const EVENT_POOL: EngineEvent[] = [
  {
    id: "queen_tax_petition_001",
    era: "queen",
    tags: ["governance", "treasury", "people"],
    trigger: {
      minRound: 1,
      none: [{ track: "treasury", operator: ">=", value: 90 }],
    },
    choices: [
      {
        id: "raise_tax",
        labelTemplate: "Raise the tax",
        intent: "Extract money from the realm",
        previewTracks: ["treasury", "people"],
      },
      {
        id: "refuse_tax",
        labelTemplate: "Spare the market",
        intent: "Protect public goodwill",
        previewTracks: ["treasury", "people"],
      },
    ],
    effects: {
      raise_tax: {
        delta: { treasury: 12, people: -10, nobility: 4 },
        keyChoice: false,
      },
      refuse_tax: {
        delta: { treasury: -8, people: 8, nobility: -2 },
        keyChoice: false,
      },
    },
    requires: {},
    excludes: {},
    cooldown: {
      event: 8,
      tags: { treasury: 2 },
    },
    llmRenderMode: "none",
    weight: 1,
    template: {
      title: "The Market Petition",
      body: "{{rulerName}}, the guildmasters kneel before the throne. They ask whether the market tax will rise before winter.",
      npcName: "Royal Treasurer",
      npcLine: "A full vault buys obedience, but hungry streets remember.",
    },
  },
  {
    id: "queen_duke_whispers_001",
    era: "queen",
    tags: ["court", "npc", "betrayal"],
    trigger: {
      minRound: 4,
      any: [
        { track: "nobility", operator: "<=", value: 35 },
        { track: "people", operator: ">=", value: 75 },
      ],
    },
    choices: [
      {
        id: "invite_duke",
        labelTemplate: "Invite him closer",
        intent: "Turn a rival into a court asset",
        previewTracks: ["nobility", "people"],
      },
      {
        id: "humiliate_duke",
        labelTemplate: "Humiliate him publicly",
        intent: "Assert royal dominance",
        previewTracks: ["nobility", "people", "army"],
      },
    ],
    effects: {
      invite_duke: {
        delta: { nobility: 10, people: -4 },
        addFlags: ["duke_invited"],
        keyChoice: true,
      },
      humiliate_duke: {
        delta: { nobility: -14, people: 6, army: 4 },
        addFlags: ["duke_humiliated"],
        keyChoice: true,
      },
    },
    requires: {},
    excludes: { flags: ["duke_executed"] },
    cooldown: {
      event: 999,
      tags: { court: 2, npc: 3 },
    },
    llmRenderMode: "flavor",
    weight: 0.8,
    template: {
      title: "Whispers in the Gallery",
      body: "A duke with too many friends lingers beneath the painted saints. The court waits to see whether you fear him.",
      npcName: "Duke Armand",
      npcLine: "Your Majesty, I only gather friends because enemies are so unfashionable.",
    },
  },
  {
    id: "queen_army_at_gate_001",
    era: "queen",
    tags: ["military", "crisis", "death"],
    trigger: {
      minRound: 6,
      all: [{ track: "army", operator: ">=", value: 88 }],
    },
    choices: [
      {
        id: "dismiss_generals",
        labelTemplate: "Dismiss the generals",
        intent: "Break the army's power",
        previewTracks: ["army", "nobility"],
      },
      {
        id: "crown_marshal",
        labelTemplate: "Crown the marshal as protector",
        intent: "Appease the army with legitimacy",
        previewTracks: ["army", "people", "nobility"],
      },
    ],
    effects: {
      dismiss_generals: {
        delta: { army: -24, nobility: -8, people: 4 },
        addFlags: ["generals_dismissed"],
        keyChoice: true,
      },
      crown_marshal: {
        delta: { army: 16, people: -6, nobility: -10 },
        addFlags: ["marshal_protector"],
        keyChoice: true,
        forceOutcome: { type: "death", id: "queen_military_regency" },
      },
    },
    requires: {},
    excludes: {},
    cooldown: {
      event: 999,
      tags: { crisis: 4, military: 3 },
    },
    llmRenderMode: "climax",
    weight: 1,
    template: {
      title: "Boots Below the Balcony",
      body: "At midnight, regimental drums roll beneath your balcony. The army has come to save the crown from its queen.",
      npcName: "Marshal Vale",
      npcLine: "Majesty, the realm needs your name. It no longer needs your command.",
    },
  },
  {
    id: "napoleon_supply_wagons_001",
    era: "napoleon",
    tags: ["military", "treasury"],
    trigger: {
      minRound: 1,
      none: [{ track: "army", operator: "<=", value: 15 }],
    },
    choices: [
      {
        id: "seize_grain",
        labelTemplate: "Seize grain for the army",
        intent: "Feed the army at civilian cost",
        previewTracks: ["army", "publicSupport"],
      },
      {
        id: "pay_locals",
        labelTemplate: "Pay the villages",
        intent: "Preserve loyalty with money",
        previewTracks: ["treasury", "publicSupport"],
      },
    ],
    effects: {
      seize_grain: {
        delta: { army: 10, publicSupport: -10, diplomacy: -4 },
      },
      pay_locals: {
        delta: { treasury: -12, publicSupport: 8, diplomacy: 3 },
      },
    },
    requires: {},
    excludes: {},
    cooldown: {
      event: 6,
      tags: { military: 2 },
    },
    llmRenderMode: "none",
    weight: 1.1,
    template: {
      title: "Empty Wagons",
      body: "The supply wagons arrive light. Your soldiers stare at the villages beyond the road.",
      npcName: "Marshal Berthier",
      npcLine: "An army can march without songs, Sire. It cannot march without bread.",
    },
  },
  {
    id: "napoleon_coalition_ultimatum_001",
    era: "napoleon",
    tags: ["diplomacy", "crisis", "rare"],
    trigger: {
      minRound: 8,
      any: [
        { track: "diplomacy", operator: "<=", value: 25 },
        { track: "army", operator: ">=", value: 82 },
      ],
    },
    choices: [
      {
        id: "defy_coalition",
        labelTemplate: "Defy the coalition",
        intent: "Choose glory over restraint",
        previewTracks: ["army", "diplomacy", "treasury"],
      },
      {
        id: "negotiate_peace",
        labelTemplate: "Offer a humiliating peace",
        intent: "Trade pride for survival",
        previewTracks: ["army", "diplomacy", "publicSupport"],
      },
    ],
    effects: {
      defy_coalition: {
        delta: { army: 8, diplomacy: -18, treasury: -10, publicSupport: 6 },
        addFlags: ["coalition_defied"],
        keyChoice: true,
      },
      negotiate_peace: {
        delta: { army: -12, diplomacy: 18, publicSupport: -12, treasury: 4 },
        addFlags: ["humiliating_peace"],
        keyChoice: true,
      },
    },
    requires: {},
    excludes: { flags: ["coalition_defeated"] },
    cooldown: {
      event: 999,
      tags: { crisis: 4, diplomacy: 3 },
    },
    llmRenderMode: "climax",
    weight: 0.6,
    template: {
      title: "The Coalition's Ultimatum",
      body: "Envoys from Europe arrive under white flags and hard eyes. They offer peace only if you agree to shrink your empire before dawn.",
      npcName: "Foreign Minister",
      npcLine: "If you refuse, Sire, every border becomes a fuse.",
    },
  },
  ...SCRIPTED_EVENT_POOL,
];

export function findEventById(eventId: string, pool: EngineEvent[] = EVENT_POOL): EngineEvent | null {
  return (
    pool.find((event) => event.id === eventId) ??
    Object.values(FALLBACK_EVENT_BY_ERA).find((event) => event.id === eventId) ??
    null
  );
}
