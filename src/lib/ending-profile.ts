import type { RealmKey, RunRecord, SimulatorConfig } from "@/lib/types";
import { normalizeQueenVariant } from "@/lib/variants";

export interface EndingRouteTeaser {
  title: string;
  body: string;
}

export interface EndingProfile {
  title: string;
  routeLabel: string;
  routeStatLabel: string;
  verdict: string;
  missedPath: string;
  replayPrompt: string;
  replayCta: string;
  replayRoutes: EndingRouteTeaser[];
}

type EndingRouteProfile = {
  titleIndex: number;
  routeLabel: string;
  statFrame: string;
};

const realmPriority: RealmKey[] = ["legitimacy", "publicSupport", "military", "treasury"];

const crownRoutes: Record<RealmKey, EndingRouteProfile> = {
  legitimacy: {
    titleIndex: 1,
    routeLabel: "lawful restoration",
    statFrame: "proof, bloodline, and the law",
  },
  publicSupport: {
    titleIndex: 0,
    routeLabel: "public reversal",
    statFrame: "the room's shame turning against your sister",
  },
  military: {
    titleIndex: 3,
    routeLabel: "fearful seizure",
    statFrame: "guards, doors, and open force",
  },
  treasury: {
    titleIndex: 2,
    routeLabel: "bloodline fire",
    statFrame: "coin, secrets, and a sister's weakness",
  },
};

const betrayalRoutes: Record<RealmKey, EndingRouteProfile> = {
  legitimacy: {
    titleIndex: 3,
    routeLabel: "public exposure",
    statFrame: "evidence, law, and witnesses",
  },
  publicSupport: {
    titleIndex: 0,
    routeLabel: "wounded sovereignty",
    statFrame: "the hall seeing who was truly betrayed",
  },
  military: {
    titleIndex: 1,
    routeLabel: "counterstrike",
    statFrame: "guards, arrests, and a husband forced backward",
  },
  treasury: {
    titleIndex: 4,
    routeLabel: "marriage trap",
    statFrame: "contracts, leverage, and a smile held too long",
  },
};

const legacyRoutes: Record<RealmKey, EndingRouteProfile> = {
  legitimacy: {
    titleIndex: 4,
    routeLabel: "remembered crown",
    statFrame: "law, ritual, and a throne that still knows your name",
  },
  publicSupport: {
    titleIndex: 0,
    routeLabel: "people's mandate",
    statFrame: "mercy, bread, and a public that chose you back",
  },
  military: {
    titleIndex: 1,
    routeLabel: "iron rule",
    statFrame: "soldiers, siege lines, and fear made useful",
  },
  treasury: {
    titleIndex: 2,
    routeLabel: "shadow crown",
    statFrame: "bargains, ledgers, and allies nobody saw",
  },
};

const napoleonRoutes: Record<RealmKey, EndingRouteProfile> = {
  legitimacy: {
    titleIndex: 0,
    routeLabel: "republican authority",
    statFrame: "law, mandate, and the language of service",
  },
  publicSupport: {
    titleIndex: 3,
    routeLabel: "popular legend",
    statFrame: "crowds, newspapers, and the myth around your name",
  },
  military: {
    titleIndex: 4,
    routeLabel: "map breaker",
    statFrame: "speed, guns, and the nerve to move first",
  },
  treasury: {
    titleIndex: 1,
    routeLabel: "imperial engine",
    statFrame: "supply, treasure, and the machinery of power",
  },
};

const replayRoutesByVariant = {
  legacy: [
    {
      title: "Win the People",
      body: "Rule through mercy and make the kingdom defend the crown for you.",
    },
    {
      title: "Forge the Iron Crown",
      body: "Choose force, fear, and military certainty when the realm hesitates.",
    },
    {
      title: "Rule From the Shadows",
      body: "Trade purity for leverage and discover who still bends in secret.",
    },
  ],
  crown: [
    {
      title: "Make Her Kneel Publicly",
      body: "Turn Seraphine's throne room into the stage for her humiliation.",
    },
    {
      title: "Restore the Lawful Crown",
      body: "Win by charter, proof, and a court that cannot deny the bloodline.",
    },
    {
      title: "Burn the Bloodline",
      body: "Stop playing sister and leave no rival strong enough to rise again.",
    },
  ],
  betrayal: [
    {
      title: "Make Rowan Sign First",
      body: "Force your husband to become the one begging under the banners.",
    },
    {
      title: "Expose the False Heir",
      body: "Turn the pregnancy claim into the question that breaks the plot.",
    },
    {
      title: "Become the Wife They Fear",
      body: "Let every witness learn that public shame has a price.",
    },
  ],
  napoleon: [
    {
      title: "Serve the Republic",
      body: "Win without admitting the crown already tempts you.",
    },
    {
      title: "Crown the Ambition",
      body: "Move faster, risk more, and turn command into destiny.",
    },
    {
      title: "Break the Map",
      body: "Choose the campaign route where Europe reacts too late.",
    },
  ],
} satisfies Record<string, EndingRouteTeaser[]>;

export function getEndingProfile(config: SimulatorConfig, run: RunRecord): EndingProfile {
  const strongestKey = strongestRealmKey(run);
  const route = getRouteProfile(config, strongestKey);
  const title = config.endings.titles[route.titleIndex] ?? config.endings.titles[0] ?? "A Reign Remembered";
  const routeStatLabel = config.realmLabels[strongestKey];

  return {
    title,
    routeLabel: route.routeLabel,
    routeStatLabel,
    verdict: buildVerdict(config, run, route, routeStatLabel),
    missedPath: buildMissedPath(config),
    replayPrompt: buildReplayPrompt(config),
    replayCta: buildReplayCta(config),
    replayRoutes: buildReplayRoutes(config),
  };
}

function strongestRealmKey(run: RunRecord): RealmKey {
  return realmPriority.reduce((winner, candidate) => {
    const winnerScore = run.realm[winner];
    const candidateScore = run.realm[candidate];
    return candidateScore > winnerScore ? candidate : winner;
  }, realmPriority[0]);
}

function getRouteProfile(config: SimulatorConfig, key: RealmKey): EndingRouteProfile {
  if (config.slug === "napoleon") {
    return napoleonRoutes[key];
  }

  const variantId = normalizeQueenVariant(config.variantId);
  if (variantId === "crown") {
    return crownRoutes[key];
  }

  if (variantId === "betrayal") {
    return betrayalRoutes[key];
  }

  return legacyRoutes[key];
}

function buildVerdict(
  config: SimulatorConfig,
  run: RunRecord,
  route: EndingRouteProfile,
  routeStatLabel: string,
): string {
  const name = run.identity.name;

  if (config.slug === "napoleon") {
    return `${name}'s campaign was decided through ${route.statFrame}. The same map can still reward a colder order, a cleaner myth, or a faster gamble.`;
  }

  const variantId = normalizeQueenVariant(config.variantId);
  if (variantId === "crown") {
    return `${name}'s ${route.routeLabel} path won through ${route.statFrame}. The same court could still bow, riot, or watch your sister kneel under a different command.`;
  }

  if (variantId === "betrayal") {
    return `${name}'s ${route.routeLabel} path turned the same betrayal through ${route.statFrame}. The marriage can still end as exposure, arrest, mercy, or a crown nobody can take from you.`;
  }

  return `${name}'s ${route.routeLabel} path leaned hardest on ${routeStatLabel.toLowerCase()}. The same throne can still remember a softer queen, a sharper queen, or a queen nobody survives crossing.`;
}

function buildMissedPath(config: SimulatorConfig): string {
  if (config.slug === "napoleon") {
    return "Other campaigns are still waiting behind the orders you did not give.";
  }

  const variantId = normalizeQueenVariant(config.variantId);
  if (variantId === "crown") {
    return "Seraphine has not shown you every way she can fall.";
  }

  if (variantId === "betrayal") {
    return "Rowan has not shown you every way he can lose.";
  }

  return "The crown has not shown you every version of your reign.";
}

function buildReplayPrompt(config: SimulatorConfig): string {
  if (config.slug === "napoleon") {
    return "One legend is sealed. The next campaign can make the map remember another man.";
  }

  const variantId = normalizeQueenVariant(config.variantId);
  if (variantId === "crown") {
    return "One crown is sealed. The next route can make your sister break in a different way.";
  }

  if (variantId === "betrayal") {
    return "One revenge is sealed. The next route can make your husband pay a different price.";
  }

  return "One reign is sealed. The next route can reveal the queen this court never met.";
}

function buildReplayCta(config: SimulatorConfig): string {
  if (config.slug === "napoleon") {
    return "Begin another campaign";
  }

  const variantId = normalizeQueenVariant(config.variantId);
  if (variantId === "crown") {
    return "Reclaim another crown";
  }

  if (variantId === "betrayal") {
    return "Rewrite the betrayal";
  }

  return "Rule another fate";
}

function buildReplayRoutes(config: SimulatorConfig): EndingRouteTeaser[] {
  if (config.slug === "napoleon") {
    return replayRoutesByVariant.napoleon;
  }

  return replayRoutesByVariant[normalizeQueenVariant(config.variantId)];
}
