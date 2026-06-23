# Queen Simulator v2 · 开发交接

## 1. 产品路径与路由

| 页面 | 建议路由 | 本原型状态 |
|---|---|---|
| Landing | `/queen` | `screen: landing` |
| Claim Your Crown | `/queen/start` | `screen: identity` |
| 序章与付费战役 | `/queen/play/[runId]` | `screen: scene` + `flow` |
| 首购付费墙 | `/queen/unlock/[runId]` | `screen: paywall` |
| 支付返回 | `/queen/return` | `screen: return` |
| 个性化结局 | `/queen/ending/[runId]` | `screen: ending` |

静态原型通过 URL hash 显示上述路径；Next.js 迁移时改为 App Router 页面，并让服务端成为 run 状态的唯一事实来源。

## 2. 转化逻辑

### 首购

- 序章结束前完成四个价值事件：建立身份、不可逆决定、个性化后果、重大危机。
- 付费墙只出售当前 Queen 的完整统治，不出售回合、token、章节碎片或订阅。
- 默认仅展示 `Complete Your Reign — $5.99`。
- 必须回调本场用户的 Queen 名字、统治风格、第一道王命和当前危机。

### 结局升级

顺序固定为：

1. 个性化结局与历史评价。
2. 可分享的统治摘要卡。
3. `Endings unlocked · 1 of 5` 未完成感。
4. New Game+ 个性化文案。
5. `Queen Collection — $14.99`，已付用户仅补 `$9.00`。
6. 可选 Napoleon Simulator 交叉推广。
7. 所有用户可见的重玩入口。

## 3. 关键前端组件

- `LandingHero`
- `IdentityBuilder`
- `BrandHeader`
- `SceneNarration`
- `DialogueBlock`
- `LetterBlock`
- `ChoiceButton`
- `CustomDecreeSheet`
- `CommandEchoBlock`
- `RealmDrawer`
- `ChronicleDrawer`
- `ActTransition`
- `WorldLoadingState`
- `GenerationErrorState`
- `SingleOfferPaywall`
- `CheckoutReturnCard`
- `EndingNarrative`
- `ReignSummaryCard`
- `EndingCollectionProgress`
- `CollectionUpgradeCard`
- `CrossPromoCard`
- `ShareCardExporter`

建议每个组件迁移为独立 React Client Component；场景内容、价格资格与结局结果全部由服务端 payload 决定。

## 4. 建议数据契约

```ts
type RunStatus =
  | 'prologue'
  | 'paywalled'
  | 'checkout_pending'
  | 'paid'
  | 'completed'
  | 'generation_error';

interface RealmState {
  legitimacy: number;
  treasury: number;
  military: number;
  publicSupport: number;
}

interface ScenePayload {
  id: string;
  narration: string[];
  dialogue?: { speaker: string; text: string };
  letter?: { from: string; text: string };
  choices: SceneChoice[];
  allowCustomCommand: boolean;
  isAnchor: boolean;
  isEnding: boolean;
  actTitle?: string;
  echoedQuote?: string;
  progress: { currentScene: number; totalScenes: number };
}

interface SceneChoice {
  id: string;
  label: string;
  intent: string;
  hint?: string;
  disabled?: boolean;
}

interface EndingPayload {
  title: string;
  narration: string;
  reignStyle: string;
  keyDecisions: string[];
  finalState: RealmState;
  epitaph: string;
}

interface EndingsCollection {
  unlocked: number;
  total: number;
  slots: Array<{ title: string; locked: boolean }>;
}

interface UpsellOffer {
  tier: 'collection';
  price: number;
  deltaPrice: number;
  newGamePlusCopy: string;
  eligibleForDelta: boolean;
}
```

## 5. 真实 LLM 接入的最高优先级

场景生成接口必须保留 `echoedQuote`。用户自定义王命的原句应在 Step 4 和至少一个付费场景中回引：

```text
You said: “{exact user decree}.”
The court took you at your word — and the northern lords have not forgotten it.
```

状态变化由受控 intent / 后端规则决定，不能让自由文本直接无约束修改 Realm 数值。低置信度分类必须返回 `interpretation` 让用户确认。

## 6. Creem 支付衔接

1. 点击首购 CTA：服务端将 run 更新为 `checkout_pending`，记录 `checkout_started`。
2. 创建 Creem checkout，并在 metadata 中写入 `runId`、`offerId`、`userEmail?`。
3. Webhook 验证支付后将 run 更新为 `paid`。
4. `/queen/return` 只从服务端重新读取 run，不信任 URL 参数中的支付结果。
5. 升级时服务端计算真实差价资格；前端只展示返回的 `deltaPrice`。
6. 支付取消时不修改选择、不清除 run、不显示羞辱式文案。

## 7. Supabase 恢复策略

- 匿名开始时生成 `runId` 和短期恢复 token；不要求注册。
- 每个完成节点保存 `lastCompletedSceneId`、`runStatus`、`realmState`、`decisions`、`echoedQuote`。
- 浏览器本地仅保存恢复凭据和轻量摘要；服务端为事实来源。
- 邮件恢复链接使用一次性或可轮换 token。
- 生成失败回退到最后完成节点，不要求用户重新选择或重新付款。

## 8. 埋点

本原型已覆盖：

`landing_view` `start_clicked` `identity_chosen` `oath_completed` `critical_choice_made` `custom_command_opened` `custom_command_submitted` `custom_command_confirmed` `custom_command_rephrased` `consequence_viewed` `warning_viewed` `crisis_revealed` `paywall_viewed` `paywall_option_clicked` `checkout_started` `purchase_completed` `save_email_submitted` `paywall_dismissed` `paid_scene_loaded` `state_panel_opened` `scene_choice_made` `anchor_reached` `ending_reached` `ending_card_shared` `upgrade_clicked` `replay_started` `cross_promo_clicked` `retry_clicked` `resume_clicked`。

生产环境应统一附带：`runId`、`anonymousUserId`、`acquisitionCampaign`、`creativeId`、`reignStyle`、`firstDecisionIntent`、`offerId`。

## 9. 第一轮实验建议

先发布稳定基线，再按单变量实验：

- Landing：当前价值主张 vs 更直接的危机版 Hero。
- Paywall：当前“战争决定统治”标题 vs 强回调用户王命的标题。
- Ending：先展示分享卡 vs 先展示结局收集进度。

不要同时测试价格、文案和权益组合；否则无法判断首购或升级变化由何而来。

## 10. 不可触碰的红线

- 不使用假倒计时、库存、名额或虚假折扣。
- 不做订阅默认勾选。
- 不做金币、钥匙、钻石或双货币。
- 首购同屏不超过两个定价选项，MVP 默认一个。
- 不把产品做成聊天窗口、角色头像列表或策略仪表盘。
- 用户界面不出现 AI、model、token 等技术词。
- 没有真实 Collection 内容时关闭升级 feature flag。
