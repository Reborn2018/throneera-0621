export type SimulatorSlug = "queen" | "napoleon";
export type QueenVariantId = "legacy" | "crown" | "betrayal";
export type SimulatorVariantId = QueenVariantId | "default";

export type RunStatus =
  | "identity"
  | "prologue"
  | "paywalled"
  | "checkout_pending"
  | "paid"
  | "completed"
  | "generation_error"
  | "refunded"
  | "disputed";

export type RealmKey = "legitimacy" | "treasury" | "military" | "publicSupport";

export type RealmState = Record<RealmKey, number>;

export interface IdentityOption {
  id: string;
  label: string;
  description: string;
}

export interface SceneChoice {
  id: string;
  label: string;
  intent: string;
  hint?: string;
  delta?: Partial<RealmState>;
}

export interface StoryScene {
  id: string;
  title: string;
  act: string;
  narration: string[];
  dialogue?: {
    speaker: string;
    text: string;
  };
  letter?: {
    from: string;
    text: string;
  };
  choices: SceneChoice[];
  allowCustomCommand?: boolean;
  anchor?: boolean;
  callback?: "decree" | "oath" | "route";
}

export interface SimulatorOffer {
  sku: "complete_current_campaign";
  amountMinor: number;
  currency: "USD";
  label: string;
}

export interface SimulatorConfig {
  slug: SimulatorSlug;
  variantId?: SimulatorVariantId;
  experimentId?: string;
  title: string;
  themeClass: string;
  landing: {
    headline: string;
    subhead: string;
    cta: string;
  };
  identity: {
    nameLabel: string;
    defaultName: string;
    dispositions: IdentityOption[];
    origins: IdentityOption[];
  };
  identityIntro?: {
    heading: string;
    copy: string;
  };
  realmLabels: Record<RealmKey, string>;
  initialRealm: RealmState;
  prologueScenes: StoryScene[];
  paidScenes: StoryScene[];
  paywall?: {
    crisis: string;
    loss: string;
    cta: string;
  };
  endings: {
    totalSlots: number;
    titles: string[];
  };
  offer: SimulatorOffer;
  crossSell: {
    target: SimulatorSlug;
    headline: string;
    body: string;
  };
}

export interface RunDecision {
  sceneId: string;
  choiceId: string;
  intent: string;
  label: string;
  createdAt: string;
}

export interface RunRecord {
  id: string;
  simulator: SimulatorSlug;
  status: RunStatus;
  currentSceneId: string;
  runType: "first_campaign" | "replay" | "cross_sell";
  sourceRunId?: string;
  identity: {
    name: string;
    dispositionId: string;
    originId: string;
    variantId?: SimulatorVariantId;
  };
  realm: RealmState;
  decisions: RunDecision[];
  echoedQuote?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  completedAt?: string;
}

export interface OrderRecord {
  id: string;
  runId: string;
  sku: SimulatorOffer["sku"];
  amountMinor: number;
  currency: SimulatorOffer["currency"];
  status: "pending" | "completed" | "refunded" | "disputed" | "failed" | "expired";
  provider: "mock" | "creem";
  providerCheckoutId: string;
  providerCheckoutUrl?: string;
  providerOrderId?: string;
  providerProductId: string;
  requestId: string;
  createdAt: string;
  updatedAt: string;
}

export interface EntitlementRecord {
  id: string;
  runId: string;
  orderId: string;
  status: "active" | "revoked" | "consumed";
  grantedAt: string;
  revokedAt?: string;
}

export interface RunEventRecord {
  id: string;
  runId: string;
  eventType: string;
  sceneId?: string;
  choiceId?: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface RestoreTokenRecord {
  id: string;
  runId: string;
  tokenHash: string;
  expiresAt: string;
  usedAt?: string;
  createdAt: string;
}

export interface WebhookEventRecord {
  provider: "mock" | "creem";
  providerEventId: string;
  eventType: string;
  payloadHash: string;
  processedAt?: string;
  receivedAt: string;
}
