# P0 引擎层技术规格：AI-native Reigns

日期：2026-06-26  
范围：只定义引擎逻辑、数据结构和前端调用合约；不包含 React 组件、CSS、HTML 或 UI 布局。  
技术栈目标：Next.js + Supabase + DeepSeek 普通渲染 + Anthropic 高质量渲染可选。  

---

## 0. 设计原则

P0 目标不是把现有线性剧情多写几轮，而是实现一个可测试的短局统治循环：

```text
事件卡 → 二元选择 → 状态变化 → 危机/死亡/继承 → 重开
```

核心原则：

1. 规则先于 LLM。LLM 不能决定数值后果。
2. 普通事件不调用 LLM，用模板和变量填充。
3. 关键危机、NPC 高情绪台词、死亡/结局档案才调用 LLM。
4. 每局目标 15-30 次决策，LLM 调用预算 3-5 次。
5. 前端所有 props 都来自本规格定义的 `RenderedCard`、`GameState`、`GameResult` 和 telemetry payload。

建议代码位置：

```text
src/lib/engine-v3/event.schema.ts
src/lib/engine-v3/events.ts
src/lib/engine-v3/state.ts
src/lib/engine-v3/select-event.ts
src/lib/engine-v3/apply-choice.ts
src/lib/engine-v3/render.ts
src/lib/engine-v3/telemetry.ts
```

---

## 1. 事件池 Schema

### 1.1 TypeScript 类型

```ts
export type EraId = "queen" | "napoleon";

export type LlmRenderMode = "none" | "flavor" | "climax";

export type EventTag =
  | "governance"
  | "court"
  | "military"
  | "treasury"
  | "people"
  | "diplomacy"
  | "religion"
  | "betrayal"
  | "crisis"
  | "npc"
  | "death"
  | "legacy"
  | "rare";

export type StateTrackId =
  | "nobility"
  | "people"
  | "army"
  | "treasury"
  | "diplomacy"
  | "publicSupport";

export interface StateCondition {
  track: StateTrackId;
  operator: "<" | "<=" | ">" | ">=" | "==" | "!=";
  value: number;
}

export interface EventTrigger {
  minRound?: number;
  maxRound?: number;
  any?: StateCondition[];
  all?: StateCondition[];
  none?: StateCondition[];
  requiredFlags?: string[];
  blockedFlags?: string[];
}

export interface EventRequirements {
  events?: string[];
  flags?: string[];
  legacies?: string[];
}

export interface EventExcludes {
  events?: string[];
  flags?: string[];
  legacies?: string[];
}

export interface EventCooldown {
  event: number;
  tags?: Partial<Record<EventTag, number>>;
}

export interface EventChoice {
  id: string;
  labelTemplate: string;
  intent: string;
  previewTracks: StateTrackId[];
}

export interface ChoiceEffect {
  delta: Partial<Record<StateTrackId, number>>;
  addFlags?: string[];
  removeFlags?: string[];
  addLegacy?: LegacySeed;
  keyChoice?: boolean;
  forceOutcome?: TerminalOutcomeSeed;
}

export type ChoiceEffectsById = Record<string, ChoiceEffect>;

export interface EventTemplate {
  title: string;
  body: string;
  npcName?: string;
  npcLine?: string;
}

export interface EngineEvent {
  id: string;
  era: EraId;
  tags: EventTag[];
  trigger: EventTrigger;
  choices: EventChoice[];
  effects: ChoiceEffectsById;
  requires: EventRequirements;
  excludes: EventExcludes;
  cooldown: EventCooldown;
  llmRenderMode: LlmRenderMode;
  weight?: number;
  template: EventTemplate;
}

export interface LegacySeed {
  id: string;
  label: string;
  description: string;
  statBias?: Partial<Record<StateTrackId, number>>;
  expiresAfterGenerations?: number;
}

export interface TerminalOutcomeSeed {
  type: "death" | "abdication" | "victory" | "special";
  id: string;
}
```

### 1.2 JSON Schema 要点

如果使用 JSON 文件维护事件池，字段必须满足：

```ts
export interface EventPoolFile {
  schemaVersion: 3;
  events: EngineEvent[];
}
```

校验规则：

- `id` 全局唯一。
- `choices.length` 必须为 2，P0 不做 3+ 选择。
- 每个 `choice.id` 必须存在于 `effects`。
- `effects[choiceId].delta` 只能引用当前 era 存在的状态条。
- `llmRenderMode: "none"` 的事件必须有完整 `template.body` 和 `choice.labelTemplate`。
- `llmRenderMode: "climax"` 必须带 `tags` 中的 `crisis`、`death` 或 `rare` 至少一个。

### 1.3 示例事件

#### 示例 1：Queen 普通治理事件，none

```ts
export const queenTaxPetition: EngineEvent = {
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
};
```

#### 示例 2：Queen NPC 背叛事件，flavor

```ts
export const queenDukeWhispers: EngineEvent = {
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
  excludes: {
    flags: ["duke_executed"],
  },
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
};
```

#### 示例 3：Napoleon 普通军事事件，none

```ts
export const napoleonSupplyWagons: EngineEvent = {
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
};
```

#### 示例 4：Napoleon 危机事件，climax

```ts
export const napoleonCoalitionUltimatum: EngineEvent = {
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
  excludes: {
    flags: ["coalition_defeated"],
  },
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
};
```

#### 示例 5：Queen 死亡边缘事件，climax

```ts
export const queenArmyAtTheGate: EngineEvent = {
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
      forceOutcome: {
        type: "death",
        id: "queen_military_regency",
      },
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
};
```

---

## 2. 游戏状态数据结构

### 2.1 GameState

```ts
export type GamePhase = "active" | "terminal";

export interface GameState {
  runId: string;
  era: EraId;
  rulerName: string;
  generation: number;
  phase: GamePhase;
  round: number;
  year: number;
  startedAt: string;
  updatedAt: string;

  bars: Partial<Record<StateTrackId, number>>;
  highestBars: Partial<Record<StateTrackId, number>>;
  lowestBars: Partial<Record<StateTrackId, number>>;

  occurredEventIds: string[];
  lastEventId?: string;
  lastEventTags: EventTag[];
  cooldowns: CooldownState;

  flags: string[];
  inheritedLegacies: Legacy[];
  pendingLegacies: Legacy[];
  dynastyRecords: DynastyRecord[];
  keyChoices: KeyChoiceRecord[];

  llmCallsThisRun: number;
}

export interface CooldownState {
  events: Record<string, number>;
  tags: Partial<Record<EventTag, number>>;
}

export interface Legacy extends LegacySeed {
  gainedAtGeneration: number;
  remainingGenerations?: number;
}

export interface KeyChoiceRecord {
  round: number;
  eventId: string;
  choiceId: string;
  choiceLabel: string;
  summary: string;
  barsAfter: Partial<Record<StateTrackId, number>>;
}
```

### 2.2 DynastyRecord

```ts
export interface DynastyRecord {
  id: string;
  generation: number;
  rulerName: string;
  era: EraId;
  startYear: number;
  endYear: number;
  rulingYears: number;
  terminalType: TerminalType;
  terminalId: string;
  death?: DeathRecord;
  highestBars: Partial<Record<StateTrackId, number>>;
  lowestBars: Partial<Record<StateTrackId, number>>;
  keyChoices: KeyChoiceRecord[];
  inheritedLegacies: Legacy[];
  gainedLegacies: Legacy[];
  createdAt: string;
}

export type TerminalType = "continue" | "death" | "abdication" | "victory" | "special";

export interface DeathRecord {
  id: DeathId;
  label: string;
  causeTrack?: StateTrackId;
  direction?: "too_low" | "too_high" | "forced";
  round: number;
  year: number;
  epitaphTemplate: string;
}
```

### 2.3 Era 状态条配置

```ts
export interface StateTrackConfig {
  id: StateTrackId;
  label: string;
  initial: number;
  min: number;
  max: number;
  lowDeathAt: number;
  highDeathAt: number;
  lowDeathId: DeathId;
  highDeathId: DeathId;
}

export interface EraStateConfig {
  era: EraId;
  startYear: number;
  targetRoundsForVictory: number;
  tracks: StateTrackConfig[];
}

export const QUEEN_STATE_CONFIG: EraStateConfig = {
  era: "queen",
  startYear: 1560,
  targetRoundsForVictory: 30,
  tracks: [
    {
      id: "nobility",
      label: "Nobility",
      initial: 50,
      min: 0,
      max: 100,
      lowDeathAt: 0,
      highDeathAt: 100,
      lowDeathId: "queen_noble_revolt",
      highDeathId: "queen_aristocratic_coup",
    },
    {
      id: "people",
      label: "People",
      initial: 50,
      min: 0,
      max: 100,
      lowDeathAt: 0,
      highDeathAt: 100,
      lowDeathId: "queen_popular_uprising",
      highDeathId: "queen_mob_rule",
    },
    {
      id: "army",
      label: "Army",
      initial: 50,
      min: 0,
      max: 100,
      lowDeathAt: 0,
      highDeathAt: 100,
      lowDeathId: "queen_foreign_occupation",
      highDeathId: "queen_military_regency",
    },
    {
      id: "treasury",
      label: "Treasury",
      initial: 50,
      min: 0,
      max: 100,
      lowDeathAt: 0,
      highDeathAt: 100,
      lowDeathId: "queen_bankruptcy",
      highDeathId: "queen_merchant_oligarchy",
    },
  ],
};

export const NAPOLEON_STATE_CONFIG: EraStateConfig = {
  era: "napoleon",
  startYear: 1796,
  targetRoundsForVictory: 30,
  tracks: [
    {
      id: "army",
      label: "Army",
      initial: 55,
      min: 0,
      max: 100,
      lowDeathAt: 0,
      highDeathAt: 100,
      lowDeathId: "napoleon_army_mutiny",
      highDeathId: "napoleon_marshal_coup",
    },
    {
      id: "treasury",
      label: "Treasury",
      initial: 45,
      min: 0,
      max: 100,
      lowDeathAt: 0,
      highDeathAt: 100,
      lowDeathId: "napoleon_state_bankruptcy",
      highDeathId: "napoleon_profiteer_capture",
    },
    {
      id: "diplomacy",
      label: "Diplomacy",
      initial: 45,
      min: 0,
      max: 100,
      lowDeathAt: 0,
      highDeathAt: 100,
      lowDeathId: "napoleon_coalition_invasion",
      highDeathId: "napoleon_puppet_emperor",
    },
    {
      id: "publicSupport",
      label: "Public Support",
      initial: 50,
      min: 0,
      max: 100,
      lowDeathAt: 0,
      highDeathAt: 100,
      lowDeathId: "napoleon_public_abdication",
      highDeathId: "napoleon_populist_cult",
    },
  ],
};
```

### 2.4 过高也会死的规则

所有状态条低到 `0` 或高到 `100` 都会触发终局。过高不是奖励，而是失衡：

| Era | 状态过低 | 状态过高 |
|---|---|---|
| Queen Nobility | 贵族叛乱 | 贵族架空王权 |
| Queen People | 民众起义 | 群众审判、暴民政治 |
| Queen Army | 外敌入侵/军队溃散 | 军事摄政或将军夺权 |
| Queen Treasury | 国家破产 | 商人财团控制王冠 |
| Napoleon Army | 军队哗变 | 元帅集团政变 |
| Napoleon Treasury | 国家破产 | 战争承包商架空政权 |
| Napoleon Diplomacy | 反法同盟入侵 | 被外交体系软禁为傀儡 |
| Napoleon Public Support | 被迫退位 | 民粹崇拜失控，帝国崩坏 |

---

## 3. 事件抽取算法

### 3.1 函数签名

```ts
export interface SelectEventOptions {
  pool?: EngineEvent[];
  rng?: () => number;
}

export function selectNextEvent(
  gameState: GameState,
  options?: SelectEventOptions,
): EngineEvent;
```

### 3.2 实现

```ts
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
      body: "Before dawn, {{rulerName}} must choose which pressure to steady first.",
    },
  },
};

export function selectNextEvent(
  gameState: GameState,
  options: SelectEventOptions = {},
): EngineEvent {
  const pool = options.pool ?? EVENT_POOL;
  const rng = options.rng ?? Math.random;

  const legalEvents = pool
    .filter((event) => event.era === gameState.era)
    .filter((event) => isEventLegal(event, gameState))
    .map((event) => ({
      event,
      score: scoreEvent(event, gameState),
    }))
    .filter((candidate) => candidate.score > 0);

  if (legalEvents.length === 0) {
    return FALLBACK_EVENT_BY_ERA[gameState.era];
  }

  const total = legalEvents.reduce((sum, candidate) => sum + candidate.score, 0);
  let cursor = rng() * total;

  for (const candidate of legalEvents) {
    cursor -= candidate.score;
    if (cursor <= 0) {
      return candidate.event;
    }
  }

  return legalEvents[legalEvents.length - 1].event;
}

function isEventLegal(event: EngineEvent, gameState: GameState): boolean {
  if (gameState.cooldowns.events[event.id] && gameState.cooldowns.events[event.id] > 0) {
    return false;
  }

  if (event.tags.some((tag) => (gameState.cooldowns.tags[tag] ?? 0) > 0)) {
    return false;
  }

  if (!matchesTrigger(event.trigger, gameState)) {
    return false;
  }

  if (!hasRequirements(event.requires, gameState)) {
    return false;
  }

  if (hasExclusions(event.excludes, gameState)) {
    return false;
  }

  return true;
}

function matchesTrigger(trigger: EventTrigger, gameState: GameState): boolean {
  if (trigger.minRound !== undefined && gameState.round < trigger.minRound) return false;
  if (trigger.maxRound !== undefined && gameState.round > trigger.maxRound) return false;

  if (trigger.requiredFlags?.some((flag) => !gameState.flags.includes(flag))) return false;
  if (trigger.blockedFlags?.some((flag) => gameState.flags.includes(flag))) return false;

  if (trigger.all?.some((condition) => !matchesCondition(condition, gameState))) return false;
  if (trigger.none?.some((condition) => matchesCondition(condition, gameState))) return false;
  if (trigger.any && !trigger.any.some((condition) => matchesCondition(condition, gameState))) {
    return false;
  }

  return true;
}

function matchesCondition(condition: StateCondition, gameState: GameState): boolean {
  const value = gameState.bars[condition.track] ?? 0;
  switch (condition.operator) {
    case "<":
      return value < condition.value;
    case "<=":
      return value <= condition.value;
    case ">":
      return value > condition.value;
    case ">=":
      return value >= condition.value;
    case "==":
      return value === condition.value;
    case "!=":
      return value !== condition.value;
  }
}

function hasRequirements(requires: EventRequirements, gameState: GameState): boolean {
  return (
    (requires.events ?? []).every((id) => gameState.occurredEventIds.includes(id)) &&
    (requires.flags ?? []).every((flag) => gameState.flags.includes(flag)) &&
    (requires.legacies ?? []).every((legacyId) =>
      gameState.inheritedLegacies.some((legacy) => legacy.id === legacyId),
    )
  );
}

function hasExclusions(excludes: EventExcludes, gameState: GameState): boolean {
  return (
    (excludes.events ?? []).some((id) => gameState.occurredEventIds.includes(id)) ||
    (excludes.flags ?? []).some((flag) => gameState.flags.includes(flag)) ||
    (excludes.legacies ?? []).some((legacyId) =>
      gameState.inheritedLegacies.some((legacy) => legacy.id === legacyId),
    )
  );
}

function scoreEvent(event: EngineEvent, gameState: GameState): number {
  let score = event.weight ?? 1;

  const repeatedTagCount = event.tags.filter((tag) => gameState.lastEventTags.includes(tag)).length;
  score *= Math.max(0.2, 1 - repeatedTagCount * 0.35);

  if (event.tags.includes("crisis") && gameState.round < 5) {
    score *= 0.3;
  }

  if (event.tags.includes("rare")) {
    score *= 0.5;
  }

  return score;
}
```

---

## 4. 选择后果计算函数

### 4.1 函数签名

```ts
export type GameResultType = "continue" | "death" | "abdication" | "victory" | "special";

export interface ApplyChoiceResult {
  gameState: GameState;
  result: GameResult;
}

export interface GameResult {
  type: GameResultType;
  terminalId?: string;
  death?: DeathRecord;
  dynastyRecord?: DynastyRecord;
  nextGenerationState?: GameState;
}

export function applyChoice(
  gameState: GameState,
  event: EngineEvent,
  choiceIndex: number,
  now?: Date,
): ApplyChoiceResult;
```

### 4.2 实现

```ts
export function applyChoice(
  gameState: GameState,
  event: EngineEvent,
  choiceIndex: number,
  now: Date = new Date(),
): ApplyChoiceResult {
  if (gameState.phase !== "active") {
    throw new Error("Cannot apply a choice to a terminal game state");
  }

  const choice = event.choices[choiceIndex];
  if (!choice) {
    throw new Error(`Choice index out of range: ${choiceIndex}`);
  }

  const effect = event.effects[choice.id];
  if (!effect) {
    throw new Error(`Missing effect for choice: ${choice.id}`);
  }

  const nextBars = applyDelta(gameState.bars, effect.delta);
  const nextFlags = applyFlags(gameState.flags, effect.addFlags, effect.removeFlags);
  const nextPendingLegacies = effect.addLegacy
    ? [...gameState.pendingLegacies, toLegacy(effect.addLegacy, gameState.generation)]
    : gameState.pendingLegacies;

  const keyChoice = effect.keyChoice
    ? [
        ...gameState.keyChoices,
        {
          round: gameState.round,
          eventId: event.id,
          choiceId: choice.id,
          choiceLabel: choice.labelTemplate,
          summary: `${event.template.title}: ${choice.intent}`,
          barsAfter: nextBars,
        },
      ]
    : gameState.keyChoices;

  const advancedState: GameState = {
    ...gameState,
    round: gameState.round + 1,
    year: gameState.year + 1,
    updatedAt: now.toISOString(),
    bars: nextBars,
    highestBars: mergeHighs(gameState.highestBars, nextBars),
    lowestBars: mergeLows(gameState.lowestBars, nextBars),
    occurredEventIds: [...gameState.occurredEventIds, event.id],
    lastEventId: event.id,
    lastEventTags: event.tags,
    cooldowns: applyCooldown(tickCooldowns(gameState.cooldowns), event),
    flags: nextFlags,
    pendingLegacies: nextPendingLegacies,
    keyChoices: keyChoice,
  };

  const forced = effect.forceOutcome
    ? outcomeFromForcedSeed(effect.forceOutcome, advancedState, now)
    : null;
  const evaluated = forced ?? evaluateTerminalOutcome(advancedState, now);

  if (evaluated.type === "continue") {
    return {
      gameState: advancedState,
      result: { type: "continue" },
    };
  }

  const terminalState: GameState = {
    ...advancedState,
    phase: "terminal",
    updatedAt: now.toISOString(),
  };

  const dynastyRecord = buildDynastyRecord(terminalState, evaluated, now);
  const nextGenerationState = createNextGenerationState(terminalState, dynastyRecord, now);

  return {
    gameState: {
      ...terminalState,
      dynastyRecords: [...terminalState.dynastyRecords, dynastyRecord],
    },
    result: {
      ...evaluated,
      dynastyRecord,
      nextGenerationState,
    },
  };
}

function applyDelta(
  bars: Partial<Record<StateTrackId, number>>,
  delta: Partial<Record<StateTrackId, number>>,
): Partial<Record<StateTrackId, number>> {
  const next = { ...bars };
  for (const [track, amount] of Object.entries(delta) as [StateTrackId, number][]) {
    next[track] = clamp((next[track] ?? 0) + amount);
  }
  return next;
}

function applyFlags(flags: string[], add: string[] = [], remove: string[] = []): string[] {
  const next = new Set(flags);
  for (const flag of add) next.add(flag);
  for (const flag of remove) next.delete(flag);
  return [...next];
}

function tickCooldowns(cooldowns: CooldownState): CooldownState {
  return {
    events: decrementRecord(cooldowns.events),
    tags: decrementRecord(cooldowns.tags) as Partial<Record<EventTag, number>>,
  };
}

function applyCooldown(cooldowns: CooldownState, event: EngineEvent): CooldownState {
  const events = { ...cooldowns.events, [event.id]: event.cooldown.event };
  const tags = { ...cooldowns.tags };
  for (const [tag, rounds] of Object.entries(event.cooldown.tags ?? {}) as [EventTag, number][]) {
    tags[tag] = Math.max(tags[tag] ?? 0, rounds);
  }
  return { events, tags };
}

function decrementRecord<T extends string>(record: Partial<Record<T, number>>): Partial<Record<T, number>> {
  const next: Partial<Record<T, number>> = {};
  for (const [key, value] of Object.entries(record) as [T, number][]) {
    if (value > 1) next[key] = value - 1;
  }
  return next;
}

function mergeHighs(
  previous: Partial<Record<StateTrackId, number>>,
  current: Partial<Record<StateTrackId, number>>,
): Partial<Record<StateTrackId, number>> {
  const next = { ...previous };
  for (const [track, value] of Object.entries(current) as [StateTrackId, number][]) {
    next[track] = Math.max(next[track] ?? value, value);
  }
  return next;
}

function mergeLows(
  previous: Partial<Record<StateTrackId, number>>,
  current: Partial<Record<StateTrackId, number>>,
): Partial<Record<StateTrackId, number>> {
  const next = { ...previous };
  for (const [track, value] of Object.entries(current) as [StateTrackId, number][]) {
    next[track] = Math.min(next[track] ?? value, value);
  }
  return next;
}

function toLegacy(seed: LegacySeed, generation: number): Legacy {
  return {
    ...seed,
    gainedAtGeneration: generation,
    remainingGenerations: seed.expiresAfterGenerations,
  };
}

function clamp(value: number): number {
  return Math.min(100, Math.max(0, value));
}
```

---

## 5. LLM 渲染接口

### 5.1 RenderedCard 类型

```ts
export interface RenderedCard {
  eventId: string;
  mode: LlmRenderMode;
  title: string;
  body: string;
  choices: RenderedChoice[];
  npc?: {
    name: string;
    line: string;
  };
  statePreview: StateTrackId[];
  llmUsed: boolean;
}

export interface RenderedChoice {
  id: string;
  label: string;
  intent: string;
  previewTracks: StateTrackId[];
}
```

### 5.2 函数签名

```ts
export interface RenderEventOptions {
  provider?: "template" | "deepseek" | "anthropic";
  maxLlmCallsPerRun?: number;
}

export async function renderEvent(
  event: EngineEvent,
  gameState: GameState,
  mode?: LlmRenderMode,
  options?: RenderEventOptions,
): Promise<RenderedCard>;
```

### 5.3 none 模式：模板 + 变量替换

模板格式：

```text
{{rulerName}}
{{era}}
{{year}}
{{generation}}
{{bar:army}}
{{bar:treasury}}
{{legacy:first_martyr}}
```

实现：

```ts
export async function renderEvent(
  event: EngineEvent,
  gameState: GameState,
  mode: LlmRenderMode = event.llmRenderMode,
  options: RenderEventOptions = {},
): Promise<RenderedCard> {
  if (mode === "none" || !shouldUseLlm(event, gameState, options)) {
    return renderTemplateEvent(event, gameState);
  }

  if (mode === "flavor") {
    return renderFlavorEvent(event, gameState, options);
  }

  return renderClimaxEvent(event, gameState, options);
}

export function renderTemplateEvent(event: EngineEvent, gameState: GameState): RenderedCard {
  return {
    eventId: event.id,
    mode: "none",
    title: fillTemplate(event.template.title, gameState),
    body: fillTemplate(event.template.body, gameState),
    choices: event.choices.map((choice) => ({
      id: choice.id,
      label: fillTemplate(choice.labelTemplate, gameState),
      intent: choice.intent,
      previewTracks: choice.previewTracks,
    })),
    npc:
      event.template.npcName || event.template.npcLine
        ? {
            name: fillTemplate(event.template.npcName ?? "Advisor", gameState),
            line: fillTemplate(event.template.npcLine ?? "", gameState),
          }
        : undefined,
    statePreview: unique(event.choices.flatMap((choice) => choice.previewTracks)),
    llmUsed: false,
  };
}

function fillTemplate(template: string, gameState: GameState): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, rawKey: string) => {
    const key = rawKey.trim();
    if (key === "rulerName") return gameState.rulerName;
    if (key === "era") return gameState.era;
    if (key === "year") return String(gameState.year);
    if (key === "generation") return String(gameState.generation);

    if (key.startsWith("bar:")) {
      const track = key.slice("bar:".length) as StateTrackId;
      return String(gameState.bars[track] ?? 0);
    }

    if (key.startsWith("legacy:")) {
      const legacyId = key.slice("legacy:".length);
      return gameState.inheritedLegacies.find((legacy) => legacy.id === legacyId)?.label ?? "";
    }

    return "";
  });
}

function shouldUseLlm(
  event: EngineEvent,
  gameState: GameState,
  options: RenderEventOptions,
): boolean {
  const max = options.maxLlmCallsPerRun ?? 5;
  if (gameState.llmCallsThisRun >= max) return false;
  return event.llmRenderMode !== "none";
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}
```

### 5.4 flavor 模式：DeepSeek 输入输出

输入 JSON：

```ts
export interface FlavorPromptInput {
  task: "render_event_flavor";
  constraints: {
    language: "en";
    maxBodyWords: 90;
    preserveChoiceCount: 2;
    doNotChangeRules: true;
    noSpoilers: true;
  };
  event: {
    id: string;
    title: string;
    body: string;
    npcName?: string;
    npcLine?: string;
    choices: { id: string; label: string; intent: string }[];
  };
  state: {
    era: EraId;
    rulerName: string;
    generation: number;
    year: number;
    bars: Partial<Record<StateTrackId, number>>;
    inheritedLegacies: string[];
  };
}
```

输出 JSON：

```ts
export interface FlavorPromptOutput {
  title: string;
  body: string;
  npc?: {
    name: string;
    line: string;
  };
  choices: { id: string; label: string }[];
}
```

要求：

- 输出必须是 JSON。
- 不能新增或删除选项。
- 不能暗示隐藏数值。
- 不能改写选择的战略含义。
- DeepSeek 失败时 fallback 到 `renderTemplateEvent`。

### 5.5 climax 模式：注入历史摘要

climax 用于死亡、重大危机、稀有事件。Prompt 额外注入历史：

```ts
export interface ClimaxPromptInput extends FlavorPromptInput {
  task: "render_event_climax";
  historySummary: {
    lastKeyChoices: {
      round: number;
      eventId: string;
      choiceLabel: string;
      summary: string;
    }[];
    dynastyRecords: {
      generation: number;
      terminalId: string;
      rulingYears: number;
    }[];
    strongestLegacy?: string;
    weakestTrack?: StateTrackId;
    strongestTrack?: StateTrackId;
  };
  constraints: FlavorPromptInput["constraints"] & {
    maxBodyWords: 130;
    makeItShareable: true;
  };
}
```

climax provider 优先级：

```text
Anthropic 可用 → Anthropic
否则 → DeepSeek
失败 → 模板 fallback
```

单局预算：

- `flavor` 最多 2 次。
- `climax` 最多 3 次。
- 总 LLM 调用最多 5 次。

---

## 6. 死亡/退位/胜利判定规则

### 6.1 DeathId

```ts
export type DeathId =
  | "queen_noble_revolt"
  | "queen_aristocratic_coup"
  | "queen_popular_uprising"
  | "queen_mob_rule"
  | "queen_foreign_occupation"
  | "queen_military_regency"
  | "queen_bankruptcy"
  | "queen_merchant_oligarchy"
  | "napoleon_army_mutiny"
  | "napoleon_marshal_coup"
  | "napoleon_state_bankruptcy"
  | "napoleon_profiteer_capture"
  | "napoleon_coalition_invasion"
  | "napoleon_puppet_emperor"
  | "napoleon_public_abdication"
  | "napoleon_populist_cult"
  | "scripted_death";
```

### 6.2 判定实现

```ts
export function evaluateTerminalOutcome(gameState: GameState, now: Date = new Date()): GameResult {
  const config = getEraStateConfig(gameState.era);

  for (const track of config.tracks) {
    const value = gameState.bars[track.id] ?? track.initial;

    if (value <= track.lowDeathAt) {
      return {
        type: "death",
        terminalId: track.lowDeathId,
        death: buildDeathRecord(track.lowDeathId, track.id, "too_low", gameState),
      };
    }

    if (value >= track.highDeathAt) {
      return {
        type: "death",
        terminalId: track.highDeathId,
        death: buildDeathRecord(track.highDeathId, track.id, "too_high", gameState),
      };
    }
  }

  if (gameState.round >= config.targetRoundsForVictory) {
    return {
      type: "victory",
      terminalId: `${gameState.era}_stable_reign`,
    };
  }

  return { type: "continue" };
}

function outcomeFromForcedSeed(
  seed: TerminalOutcomeSeed,
  gameState: GameState,
  now: Date,
): GameResult {
  if (seed.type === "death") {
    return {
      type: "death",
      terminalId: seed.id,
      death: buildDeathRecord(seed.id as DeathId, undefined, "forced", gameState),
    };
  }

  return {
    type: seed.type,
    terminalId: seed.id,
  };
}

function buildDeathRecord(
  id: DeathId,
  causeTrack: StateTrackId | undefined,
  direction: DeathRecord["direction"],
  gameState: GameState,
): DeathRecord {
  return {
    id,
    label: DEATH_LABELS[id] ?? id,
    causeTrack,
    direction,
    round: gameState.round,
    year: gameState.year,
    epitaphTemplate: DEATH_EPITAPHS[id] ?? "{{rulerName}} vanished into a disputed chronicle.",
  };
}
```

### 6.3 王朝档案字段

`DynastyRecord` 必须记录：

- `generation`
- `rulerName`
- `era`
- `startYear`
- `endYear`
- `rulingYears`
- `terminalType`
- `terminalId`
- `death`
- `highestBars`
- `lowestBars`
- `keyChoices`
- `inheritedLegacies`
- `gainedLegacies`

### 6.4 继承机制

下一代继承：

1. 上一代 `pendingLegacies` 中未过期的 legacy。
2. 根据死法生成 1 个可选 legacy。
3. 初始状态 = era 默认初始值 + legacy statBias。
4. 继承 legacy 的 `remainingGenerations` 每代递减，归零删除。

```ts
export function createNextGenerationState(
  terminalState: GameState,
  record: DynastyRecord,
  now: Date = new Date(),
): GameState {
  const config = getEraStateConfig(terminalState.era);
  const inherited = decayLegacies([
    ...terminalState.inheritedLegacies,
    ...terminalState.pendingLegacies,
    ...legacyFromTerminal(record),
  ]);

  const baseBars = Object.fromEntries(
    config.tracks.map((track) => [track.id, track.initial]),
  ) as Partial<Record<StateTrackId, number>>;

  const biasedBars = inherited.reduce((bars, legacy) => {
    return applyDelta(bars, legacy.statBias ?? {});
  }, baseBars);

  return {
    runId: terminalState.runId,
    era: terminalState.era,
    rulerName: terminalState.rulerName,
    generation: terminalState.generation + 1,
    phase: "active",
    round: 0,
    year: terminalState.year + 1,
    startedAt: now.toISOString(),
    updatedAt: now.toISOString(),
    bars: biasedBars,
    highestBars: biasedBars,
    lowestBars: biasedBars,
    occurredEventIds: [],
    lastEventTags: [],
    cooldowns: { events: {}, tags: {} },
    flags: [],
    inheritedLegacies: inherited,
    pendingLegacies: [],
    dynastyRecords: [...terminalState.dynastyRecords, record],
    keyChoices: [],
    llmCallsThisRun: 0,
  };
}

function decayLegacies(legacies: Legacy[]): Legacy[] {
  return legacies
    .map((legacy) => ({
      ...legacy,
      remainingGenerations:
        legacy.remainingGenerations === undefined ? undefined : legacy.remainingGenerations - 1,
    }))
    .filter((legacy) => legacy.remainingGenerations === undefined || legacy.remainingGenerations > 0);
}

function legacyFromTerminal(record: DynastyRecord): Legacy[] {
  if (!record.death) return [];
  return [
    {
      id: `legacy_${record.death.id}`,
      label: record.death.label,
      description: `The next ruler inherits the shadow of ${record.death.label}.`,
      gainedAtGeneration: record.generation,
      remainingGenerations: 2,
      statBias: record.death.causeTrack
        ? { [record.death.causeTrack]: record.death.direction === "too_high" ? -6 : 6 }
        : {},
    },
  ];
}
```

---

## 7. 核心 API 总览

这些函数构成 UI 层开发合约。

| 函数 | 输入 | 输出 | 调用时机 |
|---|---|---|---|
| `createInitialGameState(input)` | era, rulerName, runId | `GameState` | 用户开始 P0 引擎模式 |
| `selectNextEvent(gameState)` | `GameState` | `EngineEvent` | 前端需要展示下一张卡前 |
| `renderEvent(event, gameState, mode)` | `EngineEvent`, `GameState`, mode | `Promise<RenderedCard>` | 拿到事件后，渲染卡片 props 前 |
| `applyChoice(gameState, event, choiceIndex)` | `GameState`, `EngineEvent`, number | `ApplyChoiceResult` | 用户点击选项后 |
| `evaluateTerminalOutcome(gameState)` | `GameState` | `GameResult` | `applyChoice` 内部，或恢复存档时校验 |
| `createNextGenerationState(terminalState, record)` | terminal `GameState`, `DynastyRecord` | `GameState` | 用户点击重开/下一代 |
| `buildDynastyRecord(state, result)` | terminal `GameState`, `GameResult` | `DynastyRecord` | 终局发生时 |
| `recordTelemetry(event)` | telemetry payload | `Promise<void>` | 每个关键交互节点 |

建议 API Route：

```ts
// POST /api/engine-v3/start
export interface StartGameRequest {
  era: EraId;
  rulerName: string;
}

export interface StartGameResponse {
  gameState: GameState;
  card: RenderedCard;
}

// POST /api/engine-v3/choice
export interface SubmitChoiceRequest {
  runId: string;
  gameState: GameState;
  eventId: string;
  choiceIndex: number;
}

export interface SubmitChoiceResponse {
  gameState: GameState;
  result: GameResult;
  nextCard?: RenderedCard;
}

// POST /api/engine-v3/restart
export interface RestartDynastyRequest {
  runId: string;
  terminalState: GameState;
  dynastyRecord: DynastyRecord;
}

export interface RestartDynastyResponse {
  gameState: GameState;
  card: RenderedCard;
}
```

---

## 8. Telemetry 事件定义

### 8.1 事件类型

```ts
export type EngineTelemetryEventName =
  | "engine_v3_first_run_started"
  | "engine_v3_run_started"
  | "engine_v3_card_viewed"
  | "engine_v3_choice_submitted"
  | "engine_v3_terminal_reached"
  | "engine_v3_death_reached"
  | "engine_v3_victory_reached"
  | "engine_v3_restart_clicked"
  | "engine_v3_next_generation_started"
  | "engine_v3_run_completed"
  | "engine_v3_share_clicked"
  | "engine_v3_llm_rendered"
  | "engine_v3_llm_fallback";

export interface EngineTelemetryPayload {
  runId: string;
  era: EraId;
  generation: number;
  round: number;
  eventId?: string;
  choiceId?: string;
  eventTags?: EventTag[];
  terminalType?: TerminalType;
  terminalId?: string;
  deathId?: DeathId;
  decisionCount?: number;
  runDurationMs?: number;
  llmCallsThisRun?: number;
  llmProvider?: "deepseek" | "anthropic";
  llmMode?: LlmRenderMode;
  shareSurface?: "ending_card" | "death_record" | "dynasty_archive";
  bars?: Partial<Record<StateTrackId, number>>;
}
```

### 8.2 埋点清单

| 事件名 | 字段 | 触发时机 |
|---|---|---|
| `engine_v3_first_run_started` | runId, era, generation=1 | 用户第一次进入 P0 引擎模式 |
| `engine_v3_run_started` | runId, era, generation | 每一代开始，包括第 N 局 |
| `engine_v3_card_viewed` | runId, eventId, eventTags, round | 卡片成功返回给前端 |
| `engine_v3_choice_submitted` | runId, eventId, choiceId, bars, round | 用户点击选项并完成结算 |
| `engine_v3_terminal_reached` | terminalType, terminalId, decisionCount, runDurationMs, llmCallsThisRun | 任意终局 |
| `engine_v3_death_reached` | deathId, terminalId, bars | 死亡终局 |
| `engine_v3_victory_reached` | terminalId, decisionCount | 胜利终局 |
| `engine_v3_restart_clicked` | terminalType, terminalId, deathId | 用户点击再来一代 |
| `engine_v3_next_generation_started` | generation, inherited legacy ids | 新一代生成 |
| `engine_v3_run_completed` | decisionCount, runDurationMs, llmCallsThisRun | 一局归档完成 |
| `engine_v3_share_clicked` | shareSurface, terminalId, deathId | 结局/死法分享点击 |
| `engine_v3_llm_rendered` | llmProvider, llmMode, eventId | LLM 渲染成功 |
| `engine_v3_llm_fallback` | llmProvider, llmMode, eventId | LLM 失败 fallback 到模板 |

### 8.3 P0 必看指标

1. 首局完成率。
2. 首局时长，目标 3-8 分钟。
3. 死亡后重开率，目标 30%-50%。
4. 10 分钟内决策数，目标 15-30 次。
5. 第 2 局 vs 第 1 局平均时长差异。
6. 每局 LLM 调用次数，目标 3-5 次。
7. 每局 LLM 成本。
8. 用户是否知道自己为什么死：用 death view 后的 restart click 和反馈问卷验证。

---

## 9. P0 非目标

P0 不做：

- Choice Pass。
- 虚拟货币。
- VIP/订阅。
- 大社交。
- UGC 剧本市场。
- 复杂视觉小说系统。
- 让 LLM 自行生成数值后果。

P0 只验证：

```text
玩家是否愿意在 5 分钟内死一次，并立刻想再开一代。
```

