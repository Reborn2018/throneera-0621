import type { SimulatorConfig } from "@/lib/types";

export const napoleonConfig: SimulatorConfig = {
  slug: "napoleon",
  title: "Napoleon Simulator",
  themeClass: "theme-napoleon",
  landing: {
    headline: "Rise from command to legend. Decide what Europe will remember.",
    subhead:
      "Begin free, take the first impossible order, and watch ambition reshape the map.",
    cta: "Begin Free",
  },
  identity: {
    nameLabel: "Your command name",
    defaultName: "Bonaparte",
    dispositions: [
      {
        id: "republic",
        label: "Republic",
        description: "Power must look like service, even when it marches.",
      },
      {
        id: "empire",
        label: "Empire",
        description: "History is written by those willing to crown themselves.",
      },
      {
        id: "diplomacy",
        label: "Diplomacy",
        description: "A treaty can conquer what cannons cannot hold.",
      },
    ],
    origins: [
      {
        id: "corsican",
        label: "A Corsican outsider",
        description: "Paris hears the accent before it hears the genius.",
      },
      {
        id: "artillery",
        label: "An artillery prodigy",
        description: "You see angles where other men see walls.",
      },
      {
        id: "revolutionary",
        label: "A child of revolution",
        description: "The old world fell once. It can fall again.",
      },
    ],
  },
  realmLabels: {
    legitimacy: "Authority",
    treasury: "Supply",
    military: "Army",
    publicSupport: "Public Will",
  },
  initialRealm: {
    legitimacy: 50,
    treasury: 50,
    military: 50,
    publicSupport: 50,
  },
  prologueScenes: [
    {
      id: "commission",
      title: "The First Commission",
      act: "The Republic Watches",
      narration: [
        "Paris has given you a command that more senior men refused. The city expects failure and needs a victory.",
        "Your first words to the officers will decide whether they hear a soldier, a politician, or an emperor in waiting.",
      ],
      choices: [
        {
          id: "serve",
          label: "We serve France before ourselves.",
          intent: "serve",
          delta: { publicSupport: 8, legitimacy: 3 },
        },
        {
          id: "order",
          label: "Discipline will save the Republic.",
          intent: "order",
          delta: { legitimacy: 7, military: 4 },
        },
        {
          id: "glory",
          label: "Victory belongs to those who seize it.",
          intent: "glory",
          delta: { military: 8, publicSupport: -3 },
        },
      ],
    },
    {
      id: "first-order",
      title: "The First Irreversible Order",
      act: "The Republic Watches",
      narration: [
        "A royalist battery blocks the road to Toulon. Your scouts report the position can be taken by dawn if you spend lives freely.",
        "The staff waits. Your first command will travel faster than your army.",
      ],
      choices: [
        {
          id: "assault",
          label: "Take the battery before dawn.",
          intent: "assault",
          delta: { military: 8, publicSupport: -5, treasury: -2 },
        },
        {
          id: "maneuver",
          label: "Turn their flank through the marsh.",
          intent: "maneuver",
          delta: { military: 5, legitimacy: 4, treasury: -4 },
        },
        {
          id: "parley",
          label: "Send an envoy with terms.",
          intent: "parley",
          delta: { publicSupport: 6, legitimacy: 3, military: -2 },
        },
      ],
      allowCustomCommand: true,
    },
    {
      id: "dispatches-arrive",
      title: "Dispatches Arrive",
      act: "The Republic Watches",
      callback: "decree",
      narration: [
        "By evening, your order is being repeated in cafes, barracks, and ministry corridors.",
        "Some hear genius. Some hear danger. None hear obscurity anymore.",
      ],
      letter: {
        from: "A sealed dispatch from Paris",
        text: "Citizen General, your methods have attracted attention. So have your ambitions.",
      },
      choices: [
        {
          id: "pocket-dispatch",
          label: "Pocket the dispatch.",
          intent: "pocket-dispatch",
        },
      ],
    },
    {
      id: "josephine-warning",
      title: "A Private Warning",
      act: "The Republic Watches",
      narration: [
        "At a candlelit salon, Josephine lowers her voice before the room notices.",
      ],
      dialogue: {
        speaker: "Josephine",
        text: "Paris admires useful men until they become necessary. Then it learns to fear them.",
      },
      choices: [
        {
          id: "hear-warning",
          label: "Listen without answering.",
          intent: "hear-warning",
        },
      ],
    },
    {
      id: "republic-in-peril",
      title: "The Republic in Peril",
      act: "The Republic Watches",
      narration: [
        "A courier arrives breathless before dawn. The Directory is divided, the army is hungry, and Austria has moved sooner than expected.",
        "You can remain a general, or become the man every faction must bargain with.",
      ],
      choices: [
        {
          id: "take-command",
          label: "Take command before Paris decides.",
          intent: "take-command",
        },
      ],
    },
  ],
  paidScenes: [
    {
      id: "italian-campaign",
      title: "The Italian Campaign",
      act: "Act II: The Map Opens",
      anchor: true,
      callback: "decree",
      narration: [
        "The army of Italy is barefoot, underfed, and suddenly looking at you as if hunger can be turned into thunder.",
      ],
      choices: [
        {
          id: "promise-riches",
          label: "Promise riches beyond the mountains.",
          intent: "promise-riches",
          delta: { military: 7, publicSupport: -2, treasury: 5 },
        },
        {
          id: "share-rations",
          label: "Share the officers' rations.",
          intent: "share-rations",
          delta: { publicSupport: 7, military: 3, treasury: -4 },
        },
        {
          id: "force-march",
          label: "Force-march before Austria gathers.",
          intent: "force-march",
          delta: { military: 9, publicSupport: -5, treasury: -3 },
        },
      ],
    },
    {
      id: "lodi-bridge",
      title: "The Bridge at Lodi",
      act: "Act II: The Map Opens",
      narration: [
        "A narrow bridge waits under cannon smoke. Beyond it lies the kind of victory newspapers can understand.",
      ],
      choices: [
        {
          id: "lead-charge",
          label: "Lead the charge yourself.",
          intent: "lead-charge",
          delta: { military: 8, legitimacy: 4 },
        },
        {
          id: "artillery-first",
          label: "Break them with artillery first.",
          intent: "artillery-first",
          delta: { military: 5, treasury: -4, publicSupport: 2 },
        },
        {
          id: "feint",
          label: "Feign retreat and split their line.",
          intent: "feint",
          delta: { legitimacy: 4, military: 4, treasury: 2 },
        },
      ],
    },
    {
      id: "directory-letter",
      title: "The Directory's Letter",
      act: "Act II: The Map Opens",
      callback: "route",
      narration: [
        "Paris orders you to send treasure home and obey civilian command. The letter is polite enough to be an insult.",
      ],
      choices: [
        {
          id: "obey",
          label: "Obey publicly, delay privately.",
          intent: "obey",
          delta: { legitimacy: 5, treasury: -3 },
        },
        {
          id: "challenge",
          label: "Challenge the order in dispatches.",
          intent: "challenge",
          delta: { legitimacy: -4, publicSupport: 6 },
        },
        {
          id: "send-gold",
          label: "Send gold and keep the army loyal.",
          intent: "send-gold",
          delta: { treasury: -8, military: 5, legitimacy: 3 },
        },
      ],
    },
    {
      id: "egyptian-gamble",
      title: "The Egyptian Gamble",
      act: "Act III: Empire of Sand",
      anchor: true,
      narration: [
        "The desert does not care about Paris. It offers glory, ruin, and a horizon large enough to hide ambition.",
      ],
      choices: [
        {
          id: "scholars",
          label: "Bring scholars beside the guns.",
          intent: "scholars",
          delta: { legitimacy: 7, treasury: -5 },
        },
        {
          id: "speed",
          label: "Move fast and outrun supply.",
          intent: "speed",
          delta: { military: 7, treasury: -8 },
        },
        {
          id: "local-pact",
          label: "Bargain with local power first.",
          intent: "local-pact",
          delta: { publicSupport: 5, legitimacy: 4, military: -2 },
        },
      ],
    },
    {
      id: "coup-whispers",
      title: "Whispers of Brumaire",
      act: "Act IV: The Door Opens",
      narration: [
        "The Republic is exhausted. Men who once feared your ambition now bring it invitations wrapped as warnings.",
      ],
      choices: [
        {
          id: "refuse-coup",
          label: "Refuse the coup and demand election.",
          intent: "refuse-coup",
          delta: { publicSupport: 8, legitimacy: 4, military: -3 },
        },
        {
          id: "stage-coup",
          label: "Stage the coup before rivals move.",
          intent: "stage-coup",
          delta: { legitimacy: -6, military: 8, publicSupport: -3 },
        },
        {
          id: "broker-coup",
          label: "Broker the factions into dependence.",
          intent: "broker-coup",
          delta: { legitimacy: 3, treasury: 4, publicSupport: 2 },
        },
      ],
    },
    {
      id: "crown-question",
      title: "The Crown Question",
      act: "Act IV: The Door Opens",
      narration: [
        "In a quiet room, the word emperor is spoken as if it is already a fact waiting for ceremony.",
      ],
      choices: [
        {
          id: "crown-self",
          label: "Crown yourself before France.",
          intent: "crown-self",
          delta: { legitimacy: 6, military: 5, publicSupport: -4 },
        },
        {
          id: "decline-crown",
          label: "Decline the crown and keep command.",
          intent: "decline-crown",
          delta: { publicSupport: 7, legitimacy: -2 },
        },
        {
          id: "delay-crown",
          label: "Delay until Europe bends first.",
          intent: "delay-crown",
          delta: { military: 4, legitimacy: 3, treasury: 2 },
        },
      ],
    },
  ],
  endings: {
    totalSlots: 5,
    titles: [
      "The Republic's Sword",
      "The Emperor Before the Crown",
      "The General Who Would Not Kneel",
      "The Treaty Maker",
      "The Map Breaker",
    ],
  },
  offer: {
    sku: "complete_current_campaign",
    amountMinor: 999,
    currency: "USD",
    label: "Complete Your Campaign",
  },
  crossSell: {
    target: "queen",
    headline: "Trade the battlefield for the throne",
    body: "You bent armies to your will. Now decide whether a court can be conquered without cannons.",
  },
};
