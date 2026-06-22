import type { QueenVariantId, SimulatorConfig, StoryScene } from "@/lib/types";
import { queenConfig } from "@/lib/simulators/queen";
import { QUEEN_EXPERIMENT_ID } from "@/lib/variants";

const crownPrologueScenes: StoryScene[] = [
  {
    id: "crown-stolen",
    title: "Your Sister Wears Your Crown",
    act: "The Usurpation",
    narration: [
      "The king is dead. The bells have not finished tolling when the throne room doors open.",
      "Your younger sister sits beneath the royal canopy, your crown already on her head. The court turns to watch whether you kneel.",
    ],
    dialogue: {
      speaker: "Princess Seraphine",
      text: "Sister, spare us a scandal. Bend the knee, and I may let you keep your rooms.",
    },
    choices: [
      {
        id: "kneel-to-rise",
        label: "Kneel slowly, then kiss the stolen crown.",
        intent: "deception",
        hint: "Humiliation becomes cover.",
        delta: { legitimacy: -4, publicSupport: 4, treasury: 2 },
      },
      {
        id: "name-thief",
        label: "Call her a thief before the entire court.",
        intent: "defiance",
        hint: "The hall chooses sides.",
        delta: { legitimacy: 7, military: 2, publicSupport: -2 },
      },
      {
        id: "demand-charter",
        label: "Demand the coronation charter be read aloud.",
        intent: "law",
        hint: "A legal blade is drawn.",
        delta: { legitimacy: 9, treasury: -2 },
      },
    ],
  },
  {
    id: "court-chooses",
    title: "The Court Chooses Sides",
    act: "The Usurpation",
    narration: [
      "One duke lowers his eyes. Another smiles too quickly. The captain of the guard keeps one hand on his sword.",
      "Seraphine has the chair. You still have the room, if you can make it afraid to move.",
    ],
    choices: [
      {
        id: "count-loyalists",
        label: "Name every noble who owes your father a debt.",
        intent: "claim",
        hint: "Debts become witnesses.",
        delta: { legitimacy: 5, treasury: 3 },
      },
      {
        id: "offer-mercy",
        label: "Offer amnesty to anyone who leaves her side now.",
        intent: "mercy",
        hint: "A door opens.",
        delta: { publicSupport: 7, legitimacy: 2 },
      },
      {
        id: "mark-traitors",
        label: "Order the doors barred and mark traitors by name.",
        intent: "terror",
        hint: "The room remembers fear.",
        delta: { military: 8, publicSupport: -6 },
      },
    ],
    allowCustomCommand: true,
  },
  {
    id: "balcony-humiliation",
    title: "The Balcony Humiliation",
    act: "The Usurpation",
    narration: [
      "By sunset, Seraphine stands on the eastern balcony wearing your jewels.",
      "Below, the capital waits to hear whether the true heir has surrendered or begun a civil war.",
    ],
    letter: {
      from: "A proclamation nailed to your chamber door",
      text: "Princess Isolde will kneel before Her Majesty by moonrise, or be declared false-blooded.",
    },
    choices: [
      {
        id: "speak-to-city",
        label: "Address the crowd before she can finish.",
        intent: "public",
        hint: "The people hear the wound.",
        delta: { publicSupport: 8, legitimacy: 3 },
      },
      {
        id: "tear-proclamation",
        label: "Tear down the proclamation and carry it inside.",
        intent: "insult",
        hint: "A private shame becomes public.",
        delta: { legitimacy: 4, military: 3 },
      },
      {
        id: "summon-spymaster",
        label: "Send for the spymaster who crowned her.",
        intent: "intrigue",
        hint: "A quieter war begins.",
        delta: { treasury: 5, legitimacy: -2 },
      },
    ],
  },
  {
    id: "locked-treasury",
    title: "The Locked Treasury",
    act: "The Usurpation",
    narration: [
      "The royal treasury is sealed. Your sister has moved the keys, the ledgers, and half the palace guard.",
      "Without coin, loyalty becomes poetry. With coin, poetry becomes an army.",
    ],
    choices: [
      {
        id: "break-vault",
        label: "Break the treasury seal in your father's name.",
        intent: "seize",
        hint: "Power leaves fingerprints.",
        delta: { treasury: 10, legitimacy: -4, military: 2 },
      },
      {
        id: "borrow-city",
        label: "Borrow against your claim from the city guilds.",
        intent: "bargain",
        hint: "Merchants smell a future queen.",
        delta: { treasury: 7, publicSupport: 3, legitimacy: 1 },
      },
      {
        id: "empty-her-coffers",
        label: "Plant orders that empty Seraphine's war chest.",
        intent: "sabotage",
        hint: "Her crown grows expensive.",
        delta: { treasury: 4, legitimacy: -3, military: 4 },
      },
    ],
  },
  {
    id: "dawn-kneeling",
    title: "The Dawn Kneeling",
    act: "The Usurpation",
    narration: [
      "At dawn, the court gathers around the throne. A cushion is placed at Seraphine's feet.",
      "If you kneel, her reign begins clean. If you refuse, the first blood of the new kingdom may be yours.",
    ],
    choices: [
      {
        id: "refuse-cushion",
        label: "Step over the cushion and face the throne.",
        intent: "reclaim",
        hint: "The full reckoning waits beyond.",
      },
    ],
  },
];

const betrayalPrologueScenes: StoryScene[] = [
  {
    id: "heir-announcement",
    title: "Your Husband Names Another Heir",
    act: "The Betrayal",
    narration: [
      "The dinner hall is full when your husband rises with another woman's hand in his.",
      "He announces that Lady Maribel carries the future king, then lays an abdication paper beside your untouched wine.",
    ],
    dialogue: {
      speaker: "King Consort Rowan",
      text: "Sign tonight, Isolde. Let the realm have a mother it can trust.",
    },
    choices: [
      {
        id: "lift-glass",
        label: "Lift your glass and make him repeat it louder.",
        intent: "control",
        hint: "Shame is turned back on him.",
        delta: { legitimacy: 5, publicSupport: 4 },
      },
      {
        id: "strike-table",
        label: "Strike the table and demand proof of the child.",
        intent: "rage",
        hint: "The marriage cracks in public.",
        delta: { military: 4, legitimacy: 3, publicSupport: -2 },
      },
      {
        id: "smile-signature",
        label: "Smile and ask what your signature is worth.",
        intent: "trap",
        hint: "He mistakes calculation for surrender.",
        delta: { treasury: 6, legitimacy: -2 },
      },
    ],
  },
  {
    id: "marriage-contract",
    title: "The Marriage Contract",
    act: "The Betrayal",
    narration: [
      "A priest produces a contract you have never seen. Its wax seal is old enough to be dangerous.",
      "If the clause is real, Rowan can make your marriage the knife that removes you.",
    ],
    choices: [
      {
        id: "read-law",
        label: "Force the priest to read every line aloud.",
        intent: "law",
        hint: "Private betrayal becomes legal evidence.",
        delta: { legitimacy: 8, publicSupport: 2 },
      },
      {
        id: "buy-witness",
        label: "Buy the witness before Rowan can reach him.",
        intent: "bribe",
        hint: "The truth finds a price.",
        delta: { treasury: -5, legitimacy: 5 },
      },
      {
        id: "threaten-priest",
        label: "Tell the priest false ink still burns.",
        intent: "threat",
        hint: "Holy men also fear dungeons.",
        delta: { military: 5, legitimacy: -3 },
      },
    ],
    allowCustomCommand: true,
  },
  {
    id: "mistress-rooms",
    title: "The Woman Behind the Door",
    act: "The Betrayal",
    narration: [
      "Lady Maribel's rooms are guarded by soldiers who used to salute you.",
      "Inside, servants whisper about silk pillows, a locked cradle, and a physician who will not meet your eyes.",
    ],
    choices: [
      {
        id: "enter-alone",
        label: "Enter alone and make Maribel tell you the truth.",
        intent: "confront",
        hint: "Intimacy can cut deeper than guards.",
        delta: { legitimacy: 3, publicSupport: 4 },
      },
      {
        id: "summon-midwives",
        label: "Summon every royal midwife to examine the claim.",
        intent: "evidence",
        hint: "The heir becomes a public question.",
        delta: { legitimacy: 7, treasury: -2 },
      },
      {
        id: "turn-guards",
        label: "Offer the guards a queen's pardon to change sides.",
        intent: "turncoat",
        hint: "His protection starts to leak.",
        delta: { military: 6, treasury: -3 },
      },
    ],
  },
  {
    id: "abdication-draft",
    title: "The Abdication Draft",
    act: "The Betrayal",
    narration: [
      "The paper waits in your chamber with your name already written beneath the surrender line.",
      "Rowan has left room for a signature. He has not left room for revenge.",
    ],
    choices: [
      {
        id: "burn-draft",
        label: "Burn the draft in the royal lamp.",
        intent: "refuse",
        hint: "Ash is also an answer.",
        delta: { legitimacy: 4, military: 3 },
      },
      {
        id: "rewrite-draft",
        label: "Rewrite it into his confession.",
        intent: "trap",
        hint: "A document can bite.",
        delta: { legitimacy: 6, treasury: 2 },
      },
      {
        id: "sign-false",
        label: "Sign with a false name and send it back.",
        intent: "deceive",
        hint: "He celebrates too early.",
        delta: { treasury: 4, legitimacy: -2, publicSupport: 2 },
      },
    ],
  },
  {
    id: "midnight-signature",
    title: "The Midnight Signature",
    act: "The Betrayal",
    narration: [
      "Near midnight, Rowan assembles the council, Maribel, and the priest beneath the marriage banners.",
      "One chair is left empty for you. One pen waits beside the abdication.",
    ],
    choices: [
      {
        id: "enter-council",
        label: "Enter the council chamber before the ink dries.",
        intent: "revenge",
        hint: "The full counterstroke waits beyond.",
      },
    ],
  },
];

const crownPaidScenes: StoryScene[] = [
  {
    id: "trial-of-crown",
    title: "The Trial of the Crown",
    act: "Act II: Reclamation",
    anchor: true,
    callback: "decree",
    narration: [
      "You stand before the throne with the cushion still behind you. Seraphine grips your crown hard enough to whiten her knuckles.",
      "The court demands proof. The guards demand orders. Your sister demands your silence.",
    ],
    choices: [
      {
        id: "summon-charter",
        label: "Summon the charter and expose the false coronation.",
        intent: "proof",
        delta: { legitimacy: 10, treasury: -3 },
      },
      {
        id: "seize-throne",
        label: "Order loyal guards to seize the dais.",
        intent: "force",
        delta: { military: 10, legitimacy: -4, publicSupport: -3 },
      },
      {
        id: "make-sister-kneel",
        label: "Offer Seraphine one chance to kneel to you.",
        intent: "vengeance",
        delta: { legitimacy: 4, publicSupport: 4, military: 2 },
      },
    ],
  },
  ...queenConfig.paidScenes.slice(1),
];

const betrayalPaidScenes: StoryScene[] = [
  {
    id: "council-of-marriage",
    title: "The Council of Marriage",
    act: "Act II: Counterstroke",
    anchor: true,
    callback: "decree",
    narration: [
      "Every candle in the council chamber burns low. Rowan offers you the pen as if mercy were his to grant.",
      "Maribel watches your hand. The priest watches your mouth. The realm watches whether you are wife, queen, or executioner.",
    ],
    choices: [
      {
        id: "accuse-rowan",
        label: "Accuse Rowan of forging the abdication clause.",
        intent: "accuse",
        delta: { legitimacy: 9, publicSupport: 4 },
      },
      {
        id: "question-maribel",
        label: "Question Maribel before the council can protect her.",
        intent: "expose",
        delta: { legitimacy: 5, treasury: 2, publicSupport: 2 },
      },
      {
        id: "arrest-husband",
        label: "Order your husband's arrest under the marriage banners.",
        intent: "arrest",
        delta: { military: 9, legitimacy: -2, publicSupport: -3 },
      },
    ],
  },
  ...queenConfig.paidScenes.slice(1),
];

function queenVariantBase(
  variantId: QueenVariantId,
  overrides: Pick<
    SimulatorConfig,
    "landing" | "identity" | "identityIntro" | "prologueScenes" | "paidScenes" | "paywall" | "endings"
  >,
): SimulatorConfig {
  return {
    ...queenConfig,
    variantId,
    experimentId: QUEEN_EXPERIMENT_ID,
    ...overrides,
    offer: queenConfig.offer,
    crossSell: queenConfig.crossSell,
  };
}

export const queenVariantConfigs: Record<QueenVariantId, SimulatorConfig> = {
  legacy: {
    ...queenConfig,
    variantId: "legacy",
    experimentId: QUEEN_EXPERIMENT_ID,
  },
  crown: queenVariantBase("crown", {
    landing: {
      headline: "Your Sister Stole Your Crown",
      subhead:
        "The king is dead. Your younger sister is already on your throne wearing your crown. Walk into court, decide whether to kneel, and take back power before dawn.",
      cta: "Take Back the Crown",
    },
    identityIntro: {
      heading: "Enter the court before your sister writes history.",
      copy:
        "Your first posture decides whether the court sees a humiliated princess, a lawful heir, or a queen sharpening revenge.",
    },
    identity: {
      ...queenConfig.identity,
      nameLabel: "Your rightful queen's name",
      defaultName: "Isolde",
      dispositions: [
        {
          id: "lawful",
          label: "Lawful Heir",
          description: "Use proof, charter, and bloodline to make the stolen crown look cheap.",
        },
        {
          id: "humiliated",
          label: "Publicly Shamed",
          description: "Let the court see the wound before you make it fear the answer.",
        },
        {
          id: "vengeful",
          label: "Vengeful Sister",
          description: "Your mercy ended the moment she sat beneath your canopy.",
        },
      ],
      origins: [
        {
          id: "true-heir",
          label: "Named in the king's final will",
          description: "A sealed document says the crown was yours before he died.",
        },
        {
          id: "beloved-capital",
          label: "Loved by the capital",
          description: "The city remembers who fed it during winter.",
        },
        {
          id: "exiled-spare",
          label: "The spare they sent away",
          description: "Your absence made your sister bold. It also made you dangerous.",
        },
      ],
    },
    prologueScenes: crownPrologueScenes,
    paidScenes: crownPaidScenes,
    paywall: {
      crisis:
        "Your sister has placed a kneeling cushion at her feet. The court is seconds away from making your humiliation permanent.",
      loss: "Leave now and Seraphine keeps the crown, the court, and the story.",
      cta: "Reclaim My Crown",
    },
    endings: {
      totalSlots: queenConfig.endings.totalSlots,
      titles: [
        "The Sister Who Made Her Kneel",
        "The Lawful Crown Restored",
        "The Queen Who Burned Her Bloodline",
        "The Throne That Chose Fear",
        "The Crown No Sister Could Steal",
      ],
    },
  }),
  betrayal: queenVariantBase("betrayal", {
    landing: {
      headline: "Your Husband Just Replaced You",
      subhead:
        "At dinner, he announces another woman carries the heir and orders you to sign away your throne tonight. Stay wife, become widow, or turn betrayal into a crown.",
      cta: "Refuse the Abdication",
    },
    identityIntro: {
      heading: "Enter the hall before your marriage becomes your cage.",
      copy:
        "Your first answer decides whether the court sees a discarded wife, a betrayed queen, or the woman who turns the trap around.",
    },
    identity: {
      ...queenConfig.identity,
      nameLabel: "Your queen's name",
      defaultName: "Isolde",
      dispositions: [
        {
          id: "wounded",
          label: "Wounded but Still",
          description: "Make betrayal look small by refusing to let your hand shake.",
        },
        {
          id: "furious",
          label: "Furious Queen",
          description: "Let the hall feel exactly what it costs to shame you.",
        },
        {
          id: "calculating",
          label: "Calculating Wife",
          description: "Smile until every traitor walks into the trap.",
        },
      ],
      origins: [
        {
          id: "royal-blood",
          label: "Queen by blood before marriage",
          description: "He married the throne. He did not create it.",
        },
        {
          id: "people-mother",
          label: "Mother of the realm",
          description: "The people know who answered when plague came.",
        },
        {
          id: "foreign-match",
          label: "The foreign match he underestimated",
          description: "They called you an alliance. You became a sovereign.",
        },
      ],
    },
    prologueScenes: betrayalPrologueScenes,
    paidScenes: betrayalPaidScenes,
    paywall: {
      crisis:
        "The abdication paper is on the council table. Your husband, his mistress, and the priest are waiting for your signature.",
      loss: "Leave now and Rowan writes you out of your marriage, your crown, and the succession.",
      cta: "Turn the Betrayal Back",
    },
    endings: {
      totalSlots: queenConfig.endings.totalSlots,
      titles: [
        "The Wife Who Kept the Crown",
        "The Husband Who Signed First",
        "The Heir That Broke a Kingdom",
        "The Queen Who Made Betrayal Kneel",
        "The Marriage That Became a Throne",
      ],
    },
  }),
};
