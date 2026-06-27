import type {
  ChoiceEffect,
  EngineEvent,
  EraId,
  EventTag,
  GameState,
  ScriptedEvent,
  ScriptedReign,
  StateTrackId,
} from "@/lib/engine-v3/event.schema";

interface ScriptedChoiceSpec {
  label: string;
  intent: string;
  previewTracks: StateTrackId[];
  effect: ChoiceEffect;
}

interface ScriptedEventSpec {
  id: string;
  era: EraId;
  tags: EventTag[];
  title: string;
  body: string;
  npcName: string;
  npcLine: string;
  left: ScriptedChoiceSpec;
  right: ScriptedChoiceSpec;
}

function makeScriptedEvent(spec: ScriptedEventSpec): EngineEvent {
  return {
    id: spec.id,
    era: spec.era,
    tags: spec.tags,
    trigger: {},
    choices: [
      {
        id: "left",
        labelTemplate: spec.left.label,
        intent: spec.left.intent,
        previewTracks: spec.left.previewTracks,
      },
      {
        id: "right",
        labelTemplate: spec.right.label,
        intent: spec.right.intent,
        previewTracks: spec.right.previewTracks,
      },
    ],
    effects: {
      left: spec.left.effect,
      right: spec.right.effect,
    },
    requires: {},
    excludes: {},
    cooldown: { event: 999 },
    llmRenderMode: spec.tags.some((tag) => tag === "crisis" || tag === "death" || tag === "rare")
      ? "climax"
      : spec.tags.includes("npc")
        ? "flavor"
        : "none",
    weight: 1,
    template: {
      title: spec.title,
      body: spec.body,
      npcName: spec.npcName,
      npcLine: spec.npcLine,
    },
  };
}

export const SCRIPTED_EVENT_POOL: EngineEvent[] = [
  makeScriptedEvent({
    id: "queen_scripted_g1_oath_001",
    era: "queen",
    tags: ["court", "governance"],
    title: "The First Oath",
    body: "{{rulerName}}, the great hall lowers itself into silence. The nobles wait to learn whether your first command will sound merciful or absolute.",
    npcName: "Lord Chancellor",
    npcLine: "Your Majesty, one word from you will teach the court how close to kneel.",
    left: {
      label: "Pardon the late swearers",
      intent: "Begin with mercy",
      previewTracks: ["people", "nobility"],
      effect: { delta: { people: 6, nobility: -3 } },
    },
    right: {
      label: "Fine every late oath",
      intent: "Begin with discipline",
      previewTracks: ["treasury", "nobility"],
      effect: { delta: { treasury: 6, nobility: 3, people: -2 } },
    },
  }),
  makeScriptedEvent({
    id: "queen_scripted_g1_silk_tribute_002",
    era: "queen",
    tags: ["npc", "treasury", "people"],
    title: "Silk at the Gate",
    body: "A caravan master offers a chest of silk if the crown closes the northern tolls to his rivals.",
    npcName: "Master Vey",
    npcLine: "Your Majesty, I beg only for a small monopoly. In return, your vault will hear music.",
    left: {
      label: "Grant the monopoly",
      intent: "Take the easy gold",
      previewTracks: ["treasury", "people"],
      effect: { delta: { treasury: 9, people: -6, nobility: 2 } },
    },
    right: {
      label: "Keep the roads open",
      intent: "Protect the markets",
      previewTracks: ["people", "treasury"],
      effect: { delta: { people: 7, treasury: -4, nobility: -2 } },
    },
  }),
  makeScriptedEvent({
    id: "queen_scripted_g1_grain_decree_003",
    era: "queen",
    tags: ["governance", "people", "treasury"],
    title: "The Winter Granaries",
    body: "Snow seals the roads. The people ask for grain, while your treasurer warns that generosity will empty the winter vault.",
    npcName: "Royal Treasurer",
    npcLine: "Your Majesty, mercy is blessed. It is also expensive.",
    left: {
      label: "Open the granaries",
      intent: "Feed the streets",
      previewTracks: ["people", "treasury"],
      effect: { delta: { people: 15, treasury: -12, nobility: -3 }, keyChoice: true },
    },
    right: {
      label: "Sell grain at crown price",
      intent: "Turn hunger into revenue",
      previewTracks: ["treasury", "people"],
      effect: { delta: { treasury: 15, people: -12, nobility: 4 }, keyChoice: true },
    },
  }),
  makeScriptedEvent({
    id: "queen_scripted_g1_masked_ball_004",
    era: "queen",
    tags: ["court", "betrayal", "npc"],
    title: "Masks in the Gallery",
    body: "During the midnight ball, a masked countess repeats a rumor that one duke has promised your crown to a cousin.",
    npcName: "Countess Mirelle",
    npcLine: "Your Majesty, forgive my trembling. Treason dances better than honesty tonight.",
    left: {
      label: "Expose the duke now",
      intent: "Rule through fear",
      previewTracks: ["nobility", "army", "people"],
      effect: { delta: { nobility: -16, army: 6, people: 4 }, addFlags: ["duke_exposed"], keyChoice: true },
    },
    right: {
      label: "Invite the duke closer",
      intent: "Rule through patience",
      previewTracks: ["nobility", "people"],
      effect: { delta: { nobility: 12, people: -7, treasury: -4 }, addFlags: ["duke_spared"], keyChoice: true },
    },
  }),
  makeScriptedEvent({
    id: "queen_scripted_g1_empty_vault_005",
    era: "queen",
    tags: ["crisis", "treasury", "people"],
    title: "The Vault Echoes",
    body: "The silver ledgers arrive with too many red marks. The realm can survive one more mistake, not two.",
    npcName: "Royal Treasurer",
    npcLine: "Your Majesty, I can hide the numbers from the court. I cannot hide them from arithmetic.",
    left: {
      label: "Seize noble plate",
      intent: "Save the treasury by angering rank",
      previewTracks: ["treasury", "nobility"],
      effect: { delta: { treasury: 18, nobility: -18, army: -3 }, keyChoice: true },
    },
    right: {
      label: "Tax the bread markets",
      intent: "Save the treasury by angering streets",
      previewTracks: ["treasury", "people"],
      effect: { delta: { treasury: 18, people: -18, nobility: 3 }, keyChoice: true },
    },
  }),
  makeScriptedEvent({
    id: "queen_scripted_g1_barracks_whisper_006",
    era: "queen",
    tags: ["military", "crisis"],
    title: "Drums Behind the Chapel",
    body: "Your guard captain reports that soldiers whisper your name with love in the morning and hunger by dusk.",
    npcName: "Captain Elian",
    npcLine: "Your Majesty, say the word and I will make them loyal. But loyalty has a price.",
    left: {
      label: "Pay the guard first",
      intent: "Buy steel with silver",
      previewTracks: ["army", "treasury"],
      effect: { delta: { army: 14, treasury: -18, people: -4 }, keyChoice: true },
    },
    right: {
      label: "Cut the guard ration",
      intent: "Preserve the treasury",
      previewTracks: ["treasury", "army"],
      effect: { delta: { treasury: 10, army: -18, nobility: -4 }, keyChoice: true },
    },
  }),
  makeScriptedEvent({
    id: "queen_scripted_g1_crown_debt_007",
    era: "queen",
    tags: ["death", "crisis", "treasury"],
    title: "The Crown Debt",
    body: "At dawn, the bankers refuse another seal. Every corridor sounds like counting coins.",
    npcName: "Master of Coin",
    npcLine: "Your Majesty, the crown may still shine. The kingdom beneath it is bankrupt.",
    left: {
      label: "Mint debased silver",
      intent: "Break the economy to survive tonight",
      previewTracks: ["treasury", "people"],
      effect: {
        delta: { treasury: -100, people: -16 },
        forceOutcome: { type: "death", id: "queen_bankruptcy" },
        keyChoice: true,
      },
    },
    right: {
      label: "Sell the crown jewels",
      intent: "Sacrifice legitimacy for coin",
      previewTracks: ["treasury", "nobility"],
      effect: {
        delta: { treasury: -100, nobility: -16 },
        forceOutcome: { type: "death", id: "queen_bankruptcy" },
        keyChoice: true,
      },
    },
  }),
  makeScriptedEvent({
    id: "queen_scripted_g2_black_banner_001",
    era: "queen",
    tags: ["military", "legacy"],
    title: "The Black Banner Returns",
    body: "Your heir begins under a banner dyed for mourning. The army salutes too loudly, as if reminding the palace who kept order after the last ruin.",
    npcName: "Marshal Vale",
    npcLine: "Your Majesty, I live to serve the crown. Permit me to decide where the crown is safest.",
    left: {
      label: "Thank the marshal publicly",
      intent: "Reward the army",
      previewTracks: ["army", "nobility"],
      effect: { delta: { army: 12, nobility: -7, people: -2 } },
    },
    right: {
      label: "Dismiss the salute early",
      intent: "Limit military theater",
      previewTracks: ["army", "nobility"],
      effect: { delta: { army: -8, nobility: 6, people: 2 } },
    },
  }),
  makeScriptedEvent({
    id: "queen_scripted_g2_border_heir_002",
    era: "queen",
    tags: ["diplomacy", "court"],
    title: "A Border Prince Kneels",
    body: "A young prince from the border asks to marry into your bloodline, bringing troops no one invited.",
    npcName: "Prince Corvin",
    npcLine: "Your Majesty, I offer devotion, cavalry, and a name your enemies already fear.",
    left: {
      label: "Accept the prince",
      intent: "Gain soldiers through marriage",
      previewTracks: ["army", "nobility"],
      effect: { delta: { army: 14, nobility: -8, people: -3 }, keyChoice: true },
    },
    right: {
      label: "Refuse the prince",
      intent: "Keep bloodline clean",
      previewTracks: ["nobility", "army"],
      effect: { delta: { nobility: 8, army: -12, treasury: -4 }, keyChoice: true },
    },
  }),
  makeScriptedEvent({
    id: "queen_scripted_g2_general_petition_003",
    era: "queen",
    tags: ["military", "npc"],
    title: "The Generals Petition",
    body: "Four generals request permanent seats in council. Their boots leave mud on the throne room marble.",
    npcName: "General Rook",
    npcLine: "Your Majesty, we ask only to protect you from advisors too soft to survive.",
    left: {
      label: "Seat the generals",
      intent: "Share power with steel",
      previewTracks: ["army", "nobility"],
      effect: { delta: { army: 16, nobility: -12, people: -4 }, keyChoice: true },
    },
    right: {
      label: "Keep generals outside",
      intent: "Defend civilian court",
      previewTracks: ["nobility", "army"],
      effect: { delta: { nobility: 8, army: -12, people: 3 }, keyChoice: true },
    },
  }),
  makeScriptedEvent({
    id: "queen_scripted_g2_hostage_duke_004",
    era: "queen",
    tags: ["court", "betrayal", "crisis"],
    title: "The Hostage Duke",
    body: "A duke offers his son as hostage if you promise never to purge his house. The army calls the offer weakness.",
    npcName: "Duke Halvern",
    npcLine: "Your Majesty, take my son and spare my name. I beg this as a loyal man.",
    left: {
      label: "Take the hostage",
      intent: "Bind nobility with fear",
      previewTracks: ["nobility", "army"],
      effect: { delta: { nobility: -14, army: 8, people: -2 }, keyChoice: true },
    },
    right: {
      label: "Refuse the hostage",
      intent: "Stand above noble bargains",
      previewTracks: ["nobility", "army"],
      effect: { delta: { nobility: 10, army: -10, people: 4 }, keyChoice: true },
    },
  }),
  makeScriptedEvent({
    id: "queen_scripted_g2_marshal_crown_005",
    era: "queen",
    tags: ["military", "crisis"],
    title: "A Marshal's Crown",
    body: "The marshal suggests a temporary regency to calm the streets. His soldiers already guard every stair.",
    npcName: "Marshal Vale",
    npcLine: "Your Majesty, let me carry the burden. Your name will remain untouched.",
    left: {
      label: "Name him protector",
      intent: "Survive by surrendering command",
      previewTracks: ["army", "nobility"],
      effect: { delta: { army: 20, nobility: -16, people: -6 }, keyChoice: true },
    },
    right: {
      label: "Order him to kneel",
      intent: "Break military pride",
      previewTracks: ["army", "people"],
      effect: { delta: { army: -18, people: 8, nobility: 4 }, keyChoice: true },
    },
  }),
  makeScriptedEvent({
    id: "queen_scripted_g2_regency_trap_006",
    era: "queen",
    tags: ["death", "military", "crisis"],
    title: "The Regency Trap",
    body: "At midnight, officers ask whether the crown will sign its own protection order. The quills are already laid out.",
    npcName: "Marshal Vale",
    npcLine: "Your Majesty, sign now and history may call this mercy.",
    left: {
      label: "Sign the protection order",
      intent: "Let the army own the crown",
      previewTracks: ["army", "nobility"],
      effect: {
        delta: { army: 100, nobility: -20 },
        forceOutcome: { type: "death", id: "queen_military_regency" },
        keyChoice: true,
      },
    },
    right: {
      label: "Tear the order apart",
      intent: "Die as sovereign",
      previewTracks: ["army", "people"],
      effect: {
        delta: { army: 100, people: 12 },
        forceOutcome: { type: "death", id: "queen_military_regency" },
        keyChoice: true,
      },
    },
  }),
  makeScriptedEvent({
    id: "napoleon_scripted_g1_directory_001",
    era: "napoleon",
    tags: ["governance", "military"],
    title: "The Directory's Errand",
    body: "{{rulerName}} receives a command no older general wants: win quickly, spend little, and look grateful.",
    npcName: "Director Barras",
    npcLine: "General, France trusts your brilliance. France also expects receipts.",
    left: {
      label: "Accept without conditions",
      intent: "Earn political trust",
      previewTracks: ["publicSupport", "treasury"],
      effect: { delta: { publicSupport: 6, treasury: -4, army: 3 } },
    },
    right: {
      label: "Demand independent command",
      intent: "Seize room to move",
      previewTracks: ["army", "diplomacy"],
      effect: { delta: { army: 7, diplomacy: -3, publicSupport: -2 } },
    },
  }),
  makeScriptedEvent({
    id: "napoleon_scripted_g1_bridge_002",
    era: "napoleon",
    tags: ["military", "npc"],
    title: "The Bridge Under Fire",
    body: "A bridge smokes beneath Austrian guns. Your officers look to you before fear becomes arithmetic.",
    npcName: "Marshal Berthier",
    npcLine: "Sire, say the word and the men will learn whether glory can outrun cannon.",
    left: {
      label: "Charge the bridge",
      intent: "Turn courage into legend",
      previewTracks: ["army", "publicSupport"],
      effect: { delta: { army: 12, publicSupport: 8, treasury: -5 }, keyChoice: true },
    },
    right: {
      label: "Circle through marshland",
      intent: "Win with patience",
      previewTracks: ["army", "treasury"],
      effect: { delta: { army: -4, treasury: -8, diplomacy: 4 }, keyChoice: true },
    },
  }),
  makeScriptedEvent({
    id: "napoleon_scripted_g1_requisition_003",
    era: "napoleon",
    tags: ["treasury", "people", "military"],
    title: "Bread for the March",
    body: "The wagons are empty. Villages beyond the road have grain, children, and no soldiers.",
    npcName: "Quartermaster Lannes",
    npcLine: "Sire, the army can forgive many sins. Hunger is not one of them.",
    left: {
      label: "Seize the grain",
      intent: "Feed soldiers at civilian cost",
      previewTracks: ["army", "publicSupport"],
      effect: { delta: { army: 16, publicSupport: -14, diplomacy: -4 }, keyChoice: true },
    },
    right: {
      label: "Pay the villages",
      intent: "Buy loyalty with coin",
      previewTracks: ["treasury", "publicSupport"],
      effect: { delta: { treasury: -16, publicSupport: 10, diplomacy: 4 }, keyChoice: true },
    },
  }),
  makeScriptedEvent({
    id: "napoleon_scripted_g1_paris_paper_004",
    era: "napoleon",
    tags: ["governance", "people", "betrayal"],
    title: "The Paris Paper",
    body: "A Paris newspaper praises your victories so loudly that the Directory begins to hear a crown inside every headline.",
    npcName: "Josephine's Courier",
    npcLine: "Sire, Paris adores you today. That is why Paris fears you tonight.",
    left: {
      label: "Feed the newspapers",
      intent: "Become unavoidable",
      previewTracks: ["publicSupport", "diplomacy"],
      effect: { delta: { publicSupport: 18, diplomacy: -12, treasury: -4 }, keyChoice: true },
    },
    right: {
      label: "Praise the Directory",
      intent: "Hide ambition under loyalty",
      previewTracks: ["diplomacy", "publicSupport"],
      effect: { delta: { diplomacy: 10, publicSupport: -10, army: -3 }, keyChoice: true },
    },
  }),
  makeScriptedEvent({
    id: "napoleon_scripted_g1_coalition_letter_005",
    era: "napoleon",
    tags: ["diplomacy", "crisis"],
    title: "Letters from Vienna",
    body: "Austria offers a pause that smells like a trap. Paris demands victory before the ink dries.",
    npcName: "Foreign Minister",
    npcLine: "Sire, if you refuse peace, every border becomes a witness.",
    left: {
      label: "Reject the pause",
      intent: "Choose tempo over safety",
      previewTracks: ["army", "diplomacy"],
      effect: { delta: { army: 14, diplomacy: -18, treasury: -8 }, keyChoice: true },
    },
    right: {
      label: "Accept the pause",
      intent: "Trade glory for breath",
      previewTracks: ["diplomacy", "publicSupport"],
      effect: { delta: { diplomacy: 16, publicSupport: -16, army: -8 }, keyChoice: true },
    },
  }),
  makeScriptedEvent({
    id: "napoleon_scripted_g1_unpaid_legions_006",
    era: "napoleon",
    tags: ["military", "treasury", "crisis"],
    title: "Unpaid Legions",
    body: "Three regiments refuse to march until arrears are counted. Their drums beat no anthem.",
    npcName: "Marshal Massena",
    npcLine: "Sire, soldiers worship victory. They still count pay.",
    left: {
      label: "Promise them Italy",
      intent: "Pay in future plunder",
      previewTracks: ["army", "treasury"],
      effect: { delta: { army: -18, treasury: 8, publicSupport: -6 }, keyChoice: true },
    },
    right: {
      label: "Empty the war chest",
      intent: "Buy obedience now",
      previewTracks: ["army", "treasury"],
      effect: { delta: { army: 14, treasury: -18, diplomacy: -4 }, keyChoice: true },
    },
  }),
  makeScriptedEvent({
    id: "napoleon_scripted_g1_mutiny_dawn_007",
    era: "napoleon",
    tags: ["death", "military", "crisis"],
    title: "Mutiny at Dawn",
    body: "At dawn, bayonets turn inward. The army asks whether your legend can feed them.",
    npcName: "Marshal Berthier",
    npcLine: "Sire, command them now. If they answer too slowly, it is already over.",
    left: {
      label: "Order the mutineers shot",
      intent: "Rule the army through terror",
      previewTracks: ["army", "publicSupport"],
      effect: {
        delta: { army: -100, publicSupport: -18 },
        forceOutcome: { type: "death", id: "napoleon_army_mutiny" },
        keyChoice: true,
      },
    },
    right: {
      label: "Promise double pay",
      intent: "Buy one more morning",
      previewTracks: ["army", "treasury"],
      effect: {
        delta: { army: -100, treasury: -18 },
        forceOutcome: { type: "death", id: "napoleon_army_mutiny" },
        keyChoice: true,
      },
    },
  }),
  makeScriptedEvent({
    id: "napoleon_scripted_g2_eagle_return_001",
    era: "napoleon",
    tags: ["legacy", "people"],
    title: "The Eagle Returns",
    body: "The next campaign opens under flags copied from your first victories. The crowd chants before the army does.",
    npcName: "Young Aide",
    npcLine: "Sire, they do not ask whether you are lawful. They ask whether you are back.",
    left: {
      label: "Ride before the crowd",
      intent: "Turn devotion into power",
      previewTracks: ["publicSupport", "diplomacy"],
      effect: { delta: { publicSupport: 14, diplomacy: -8, army: 4 }, keyChoice: true },
    },
    right: {
      label: "Ride before the army",
      intent: "Turn soldiers into proof",
      previewTracks: ["army", "publicSupport"],
      effect: { delta: { army: 12, publicSupport: -5, treasury: -4 }, keyChoice: true },
    },
  }),
  makeScriptedEvent({
    id: "napoleon_scripted_g2_marshal_table_002",
    era: "napoleon",
    tags: ["military", "betrayal", "npc"],
    title: "The Marshals' Table",
    body: "Your marshals dine without laughing. Each wants victory, but none wants to be the last loyal man.",
    npcName: "Marshal Ney",
    npcLine: "Sire, give us a road that ends somewhere better than a grave.",
    left: {
      label: "Promise them kingdoms",
      intent: "Buy loyalty with empire",
      previewTracks: ["army", "diplomacy"],
      effect: { delta: { army: 16, diplomacy: -14, treasury: -6 }, keyChoice: true },
    },
    right: {
      label: "Threaten their titles",
      intent: "Bind loyalty through fear",
      previewTracks: ["army", "publicSupport"],
      effect: { delta: { army: -10, publicSupport: 8, diplomacy: -4 }, keyChoice: true },
    },
  }),
  makeScriptedEvent({
    id: "napoleon_scripted_g2_empire_bulletin_003",
    era: "napoleon",
    tags: ["people", "governance"],
    title: "Bulletin of the Empire",
    body: "Printers wait for your version of a battle that was neither defeat nor victory.",
    npcName: "Imperial Secretary",
    npcLine: "Sire, truth is slow. The presses are fast.",
    left: {
      label: "Print a triumph",
      intent: "Feed the myth",
      previewTracks: ["publicSupport", "diplomacy"],
      effect: { delta: { publicSupport: 18, diplomacy: -10, treasury: -4 }, keyChoice: true },
    },
    right: {
      label: "Admit the cost",
      intent: "Preserve credibility",
      previewTracks: ["diplomacy", "publicSupport"],
      effect: { delta: { diplomacy: 8, publicSupport: -14, army: -4 }, keyChoice: true },
    },
  }),
  makeScriptedEvent({
    id: "napoleon_scripted_g2_spanish_flame_004",
    era: "napoleon",
    tags: ["diplomacy", "crisis", "people"],
    title: "Flame in Spain",
    body: "A province rises behind you while Europe watches from the front. Victory now has too many doors.",
    npcName: "Foreign Minister",
    npcLine: "Sire, one rebellion can be crushed. Many rebellions become a weather system.",
    left: {
      label: "Send veterans south",
      intent: "Crush the rebellion",
      previewTracks: ["army", "diplomacy"],
      effect: { delta: { army: -16, diplomacy: -12, publicSupport: 6 }, keyChoice: true },
    },
    right: {
      label: "Install a puppet council",
      intent: "Rule through paperwork",
      previewTracks: ["diplomacy", "publicSupport"],
      effect: { delta: { diplomacy: -18, publicSupport: 10, treasury: -6 }, keyChoice: true },
    },
  }),
  makeScriptedEvent({
    id: "napoleon_scripted_g2_cult_square_005",
    era: "napoleon",
    tags: ["people", "crisis"],
    title: "The Square Will Not Empty",
    body: "The capital refuses to sleep. They chant your name until it stops sounding like support and starts sounding like ownership.",
    npcName: "Police Minister",
    npcLine: "Sire, they adore you beyond obedience. That is a dangerous kind of love.",
    left: {
      label: "Bless the crowd",
      intent: "Let worship rise",
      previewTracks: ["publicSupport", "diplomacy"],
      effect: { delta: { publicSupport: 24, diplomacy: -16, army: 4 }, keyChoice: true },
    },
    right: {
      label: "Clear the square",
      intent: "End the fever",
      previewTracks: ["publicSupport", "army"],
      effect: { delta: { publicSupport: -18, army: 8, diplomacy: -4 }, keyChoice: true },
    },
  }),
  makeScriptedEvent({
    id: "napoleon_scripted_g2_populist_crown_006",
    era: "napoleon",
    tags: ["death", "people", "crisis"],
    title: "The People's Crown",
    body: "By morning, the crowd has built a crown of laurel and rope. They demand you wear both.",
    npcName: "Police Minister",
    npcLine: "Sire, if you step onto that balcony, the people may never let you step down.",
    left: {
      label: "Step onto the balcony",
      intent: "Become the crowd's prisoner",
      previewTracks: ["publicSupport", "diplomacy"],
      effect: {
        delta: { publicSupport: 100, diplomacy: -20 },
        forceOutcome: { type: "death", id: "napoleon_populist_cult" },
        keyChoice: true,
      },
    },
    right: {
      label: "Send the guard ahead",
      intent: "Let steel answer devotion",
      previewTracks: ["publicSupport", "army"],
      effect: {
        delta: { publicSupport: 100, army: -16 },
        forceOutcome: { type: "death", id: "napoleon_populist_cult" },
        keyChoice: true,
      },
    },
  }),
];

export const SCRIPTED_REIGNS: Record<EraId, Record<1 | 2, ScriptedReign>> = {
  queen: {
    1: {
      generation: 1,
      forcedDeathAfter: 7,
      events: [
        { eventId: "queen_scripted_g1_oath_001" },
        { eventId: "queen_scripted_g1_silk_tribute_002" },
        { eventId: "queen_scripted_g1_grain_decree_003" },
        { eventId: "queen_scripted_g1_masked_ball_004" },
        { eventId: "queen_scripted_g1_empty_vault_005" },
        { eventId: "queen_scripted_g1_barracks_whisper_006" },
        { eventId: "queen_scripted_g1_crown_debt_007" },
      ],
    },
    2: {
      generation: 2,
      forcedDeathAfter: 6,
      events: [
        { eventId: "queen_scripted_g2_black_banner_001" },
        { eventId: "queen_scripted_g2_border_heir_002" },
        { eventId: "queen_scripted_g2_general_petition_003" },
        { eventId: "queen_scripted_g2_hostage_duke_004" },
        { eventId: "queen_scripted_g2_marshal_crown_005" },
        { eventId: "queen_scripted_g2_regency_trap_006" },
      ],
    },
  },
  napoleon: {
    1: {
      generation: 1,
      forcedDeathAfter: 7,
      events: [
        { eventId: "napoleon_scripted_g1_directory_001" },
        { eventId: "napoleon_scripted_g1_bridge_002" },
        { eventId: "napoleon_scripted_g1_requisition_003" },
        { eventId: "napoleon_scripted_g1_paris_paper_004" },
        { eventId: "napoleon_scripted_g1_coalition_letter_005" },
        { eventId: "napoleon_scripted_g1_unpaid_legions_006" },
        { eventId: "napoleon_scripted_g1_mutiny_dawn_007" },
      ],
    },
    2: {
      generation: 2,
      forcedDeathAfter: 6,
      events: [
        { eventId: "napoleon_scripted_g2_eagle_return_001" },
        { eventId: "napoleon_scripted_g2_marshal_table_002" },
        { eventId: "napoleon_scripted_g2_empire_bulletin_003" },
        { eventId: "napoleon_scripted_g2_spanish_flame_004" },
        { eventId: "napoleon_scripted_g2_cult_square_005" },
        { eventId: "napoleon_scripted_g2_populist_crown_006" },
      ],
    },
  },
};

const SCRIPTED_EVENT_IDS = new Set(SCRIPTED_EVENT_POOL.map((event) => event.id));

export function isScriptedEventId(eventId: string): boolean {
  return SCRIPTED_EVENT_IDS.has(eventId);
}

export function getScriptedEntryForState(gameState: GameState): ScriptedEvent | null {
  if (gameState.mode !== "scripted" || gameState.isPaid) {
    return null;
  }
  if (gameState.generation !== 1 && gameState.generation !== 2) {
    return null;
  }

  const reign = SCRIPTED_REIGNS[gameState.era][gameState.generation];
  return reign.events[Math.min(gameState.round, reign.events.length - 1)] ?? null;
}

export function applyScriptedOverrides(event: EngineEvent, scriptedEvent: ScriptedEvent): EngineEvent {
  if (!scriptedEvent.overrideEffects) {
    return event;
  }

  const effects = { ...event.effects };
  for (const [choiceId, override] of Object.entries(scriptedEvent.overrideEffects)) {
    const base = effects[choiceId];
    if (!override) {
      continue;
    }
    if (base) {
      effects[choiceId] = {
        ...base,
        ...override,
        delta: override.delta ?? base.delta,
      };
    }
  }

  return { ...event, effects };
}
