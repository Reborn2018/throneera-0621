import type { SimulatorConfig } from "@/lib/types";

export const queenConfig: SimulatorConfig = {
  slug: "queen",
  title: "Queen Simulator",
  themeClass: "theme-queen",
  landing: {
    headline: "Queen Simulator",
    subhead:
      "Start as a forgotten princess, claim the crown, and make impossible decrees that decide whether your realm loves you, fears you, or turns on you.",
    cta: "Claim the Throne",
  },
  identity: {
    nameLabel: "Your queen's name",
    defaultName: "Isolde",
    dispositions: [
      {
        id: "merciful",
        label: "Merciful",
        description: "Rule with an open hand. Loyalty is earned.",
      },
      {
        id: "cunning",
        label: "Cunning",
        description: "Win the court before it knows the game began.",
      },
      {
        id: "ruthless",
        label: "Ruthless",
        description: "Fear is the throne's oldest crown.",
      },
    ],
    origins: [
      {
        id: "exile",
        label: "A returning exile",
        description: "The kingdom remembers the child sent away.",
      },
      {
        id: "heir",
        label: "The last true heir",
        description: "Your claim is ancient, wounded, and watched.",
      },
      {
        id: "usurper",
        label: "A bold usurper",
        description: "You took the crown because no one else could hold it.",
      },
    ],
  },
  realmLabels: {
    legitimacy: "Legitimacy",
    treasury: "Treasury",
    military: "Military",
    publicSupport: "Public Support",
  },
  initialRealm: {
    legitimacy: 50,
    treasury: 50,
    military: 50,
    publicSupport: 50,
  },
  prologueScenes: [
    {
      id: "oath",
      title: "The Coronation Oath",
      act: "The Coronation",
      narration: [
        "The great hall falls silent. Every eye watches as you raise the scepter.",
        "Your first words as queen will echo through this kingdom for years.",
      ],
      choices: [
        {
          id: "protect",
          label: "I will protect the people.",
          intent: "protect",
          hint: "The court reads warmth.",
          delta: { publicSupport: 8, legitimacy: 3 },
        },
        {
          id: "authority",
          label: "I will restore the throne's authority.",
          intent: "authority",
          hint: "The court reads order.",
          delta: { legitimacy: 8, military: 3 },
        },
        {
          id: "destroy",
          label: "I will destroy every traitor.",
          intent: "destroy",
          hint: "The court reads fear.",
          delta: { military: 7, publicSupport: -4 },
        },
      ],
    },
    {
      id: "first-decree",
      title: "The First Decree",
      act: "The Coronation",
      narration: [
        "Lord Ashworth stands before you, chains on his wrists, defiance in his eyes.",
        "The court waits in silence. Your first act as queen will define everything that follows.",
      ],
      choices: [
        {
          id: "arrest",
          label: "Order his immediate arrest.",
          intent: "arrest",
          hint: "Swift and decisive.",
          delta: { legitimacy: 5, military: 5, publicSupport: -3 },
        },
        {
          id: "trial",
          label: "Strip his power and put him on public trial.",
          intent: "trial",
          hint: "Lawful and watched.",
          delta: { legitimacy: 7, publicSupport: 4, treasury: -2 },
        },
        {
          id: "bargain",
          label: "Offer him a secret bargain.",
          intent: "bargain",
          hint: "Quiet and dangerous.",
          delta: { treasury: 5, legitimacy: -5, military: 2 },
        },
      ],
      allowCustomCommand: true,
    },
    {
      id: "kingdom-reacts",
      title: "The Kingdom Reacts",
      act: "The Coronation",
      narration: [
        "Word leaves the hall faster than the bell can finish ringing.",
        "By sunset, the capital is not discussing whether you are queen. It is debating what kind of queen has arrived.",
      ],
      letter: {
        from: "A sealed note under your chamber door",
        text: "Your Majesty spoke, and the north listened. They will answer before dawn.",
      },
      callback: "decree",
      choices: [
        {
          id: "read-note",
          label: "Break the seal.",
          intent: "read-note",
          hint: "The world remembers.",
        },
      ],
    },
    {
      id: "private-warning",
      title: "A Private Warning",
      act: "The Coronation",
      narration: [
        "General Aldric finds you alone in the war room. He does not kneel.",
      ],
      dialogue: {
        speaker: "General Aldric",
        text: "The northern garrison has not acknowledged your coronation. That is not protocol. That is a message.",
      },
      choices: [
        {
          id: "take-letter",
          label: "Take the torn envelope.",
          intent: "take-letter",
          hint: "A debt of trust begins.",
        },
      ],
    },
    {
      id: "crown-in-peril",
      title: "The Crown in Peril",
      act: "The Coronation",
      narration: [
        "The regent is gone, but the northern army has raised his banner.",
        "Before dawn, the court will decide whether you are queen or prey.",
      ],
      choices: [
        {
          id: "face-dawn",
          label: "Face the dawn.",
          intent: "face-dawn",
          hint: "The full reign waits beyond.",
        },
      ],
    },
  ],
  paidScenes: [
    {
      id: "war-council",
      title: "The War Council",
      act: "Act II: Betrayal",
      anchor: true,
      callback: "decree",
      narration: [
        "The war council meets at dawn. Three maps are laid before you, each marked with a different enemy position.",
      ],
      dialogue: {
        speaker: "General Aldric",
        text: "We can hold the river crossing, but it will cost us the southern garrison.",
      },
      choices: [
        {
          id: "hold",
          label: "Hold the river. Let the south burn.",
          intent: "hold",
          delta: { military: 8, publicSupport: -7, treasury: -2 },
        },
        {
          id: "pact",
          label: "Make the bargain you swore against.",
          intent: "pact",
          delta: { military: 4, treasury: 5, legitimacy: -6 },
        },
        {
          id: "strike",
          label: "Split the army and strike first.",
          intent: "strike",
          delta: { military: 5, legitimacy: 3, treasury: -5 },
        },
      ],
    },
    {
      id: "river-gate",
      title: "The River Gate",
      act: "Act II: Betrayal",
      narration: [
        "By dusk, refugees crowd the eastern gate. Behind them, smoke turns the river red.",
      ],
      choices: [
        {
          id: "open",
          label: "Open the gates and ration the granaries.",
          intent: "open",
          delta: { publicSupport: 9, treasury: -9 },
        },
        {
          id: "soldiers",
          label: "Admit only those who can fight.",
          intent: "soldiers",
          delta: { military: 8, publicSupport: -6 },
        },
        {
          id: "close",
          label: "Seal the gate until the siege breaks.",
          intent: "close",
          delta: { treasury: 4, publicSupport: -10, legitimacy: -3 },
        },
      ],
    },
    {
      id: "regents-shadow",
      title: "The Regent's Shadow",
      act: "Act II: Betrayal",
      callback: "route",
      narration: [
        "A letter from the north names a traitor inside your own council. The handwriting is familiar enough to wound.",
      ],
      choices: [
        {
          id: "show-court",
          label: "Read the letter before the full court.",
          intent: "show-court",
          delta: { legitimacy: 7, publicSupport: 3 },
        },
        {
          id: "aldric",
          label: "Give it to Aldric and watch who moves.",
          intent: "aldric",
          delta: { military: 5, legitimacy: 2 },
        },
        {
          id: "burn",
          label: "Burn it and send false orders.",
          intent: "burn",
          delta: { treasury: 3, legitimacy: -2, military: 4 },
        },
      ],
    },
    {
      id: "saint-vale",
      title: "The Siege of Saint Vale",
      act: "Act III: The Long Winter",
      anchor: true,
      narration: [
        "The bells of Saint Vale ring through a snowstorm. The cathedral shelters both rebels and children.",
      ],
      choices: [
        {
          id: "storm",
          label: "Storm the cathedral before midnight.",
          intent: "storm",
          delta: { military: 10, publicSupport: -12, legitimacy: -4 },
        },
        {
          id: "corridor",
          label: "Offer safe passage, then take commanders.",
          intent: "corridor",
          delta: { publicSupport: 7, legitimacy: 5, treasury: -4 },
        },
        {
          id: "wait",
          label: "Wait out the siege through winter.",
          intent: "wait",
          delta: { treasury: -8, military: -4, legitimacy: 4 },
        },
      ],
    },
    {
      id: "bread-and-steel",
      title: "Bread and Steel",
      act: "Act III: The Long Winter",
      narration: [
        "Victory reaches the capital before the grain carts do. The market square fills with empty bowls.",
      ],
      choices: [
        {
          id: "plate",
          label: "Melt the coronation gold for bread.",
          intent: "plate",
          delta: { treasury: 5, publicSupport: 10, legitimacy: -2 },
        },
        {
          id: "estates",
          label: "Seize the rebel estates.",
          intent: "estates",
          delta: { treasury: 10, legitimacy: 4, publicSupport: 2 },
        },
        {
          id: "requisition",
          label: "Let the army take what it needs.",
          intent: "requisition",
          delta: { military: 8, publicSupport: -10, treasury: 4 },
        },
      ],
    },
    {
      id: "traitors-name",
      title: "The Traitor's Name",
      act: "Act IV: The Reckoning",
      narration: [
        "The traitor removes his hood before the court. The room changes temperature.",
      ],
      choices: [
        {
          id: "mercy",
          label: "Spare him and bind him publicly.",
          intent: "mercy",
          delta: { publicSupport: 6, legitimacy: -2 },
        },
        {
          id: "judgment",
          label: "Sentence him by royal law.",
          intent: "judgment",
          delta: { legitimacy: 6, military: 2 },
        },
        {
          id: "secret",
          label: "Hide the truth and use his network.",
          intent: "secret",
          delta: { treasury: 6, legitimacy: -5 },
        },
      ],
    },
  ],
  endings: {
    totalSlots: 5,
    titles: [
      "The People's Queen",
      "The Iron Crown",
      "The Queen Without Allies",
      "The Last Light of the Realm",
      "The Crown That Remembered",
    ],
  },
  offer: {
    sku: "complete_current_campaign",
    amountMinor: 599,
    currency: "USD",
    label: "Complete Your Reign",
  },
  crossSell: {
    target: "napoleon",
    headline: "Continue your conquest",
    body: "You held a kingdom through betrayal. Now follow a general who believes Europe itself can be remade.",
  },
};
