// ThroneEra — Redesign content for both campaigns
// Codex: this is design-reference content. Real copy lives in
// src/lib/simulators/queen.ts and napoleon.ts — adapt visuals, keep meaning.
// Each choice carries: fx (stat deltas), result (narrator fallout),
// voice ({who,line} a character reacting to YOU). Ending carries the
// replay engine: earned title, fate collection, social proof.

export const TE_DATA = {
  queen: {
    id: 'queen',
    theme: 'theme-queen',
    name: 'Queen Simulator',
    crest: '\u265B',
    landing: {
      heroImg: 'hero-queen.png',
      heroPos: '50% 24%',
      kicker: "A Unique & Surprisingly Fun Ruler Simulator",
      title: 'Start as a\nForgotten Princess',
      tagline: 'They ignored her. Now she wears the crown, and the nobles who refused to kneel must face her first decree.',
      body: 'Rule a realm of whispers, alliances, and betrayal. Every decree reshapes your throne \u2014 and decides who survives the night.',
      cta: 'Take the Throne',
      ctaSub: 'Free to begin \u00B7 First decree in under a minute',
      trust: ['Court intrigue', 'Hidden fates', 'No sign-up'],
      artLabel: 'KEY ART: candlelit throne room, jewel tones'
    },
    start: {
      heading: 'Who Will You Be?',
      sub: 'Your nature shapes how the court reads you.',
      nameLabel: 'Your regal name',
      namePlaceholder: 'Queen Isabeau',
      dispositionLabel: 'Your temperament',
      dispositions: [
        { id: 'iron', label: 'Iron-willed', desc: 'Rule through fear and resolve.' },
        { id: 'cunning', label: 'Cunning', desc: 'Win the game of whispers.' },
        { id: 'beloved', label: 'Beloved', desc: 'Hold the throne through devotion.' }
      ],
      originLabel: 'Your origin',
      origins: [
        { id: 'bloodline', label: 'Ancient Bloodline', desc: 'Born to rule, watched by all.' },
        { id: 'foreign', label: 'Foreign Bride', desc: 'A crown by marriage, trusted by none.' },
        { id: 'usurper', label: 'The Usurper', desc: 'You took the throne. Now hold it.' }
      ],
      cta: 'Enter the Court'
    },
    coronation: {
      rite: 'By right of blood, by will of steel, and by the silence of your enemies\u2014',
      hail: 'LONG LIVE THE QUEEN',
      courtLine: 'The court kneels as one. The crown is yours.',
      tapHint: 'Tap to enter your reign'
    },
    play: {
      hud: ['legitimacy', 'court', 'danger'],
      stats: [
        { key: 'legitimacy', label: 'Legitimacy', value: 55 },
        { key: 'treasury', label: 'Treasury', value: 40 },
        { key: 'court', label: 'Court Favor', value: 48 },
        { key: 'army', label: 'Army', value: 50 },
        { key: 'people', label: 'The People', value: 60 },
        { key: 'danger', label: 'Court Danger', value: 35, inverted: true }
      ],
      threatThread: [
        'The late king\u2019s brother has not knelt.',
        'The prince is seen courting allies in the north.',
        'The prince\u2019s banners gather along the border.',
        'The prince\u2019s army marches on the capital.',
        'The prince is checked \u2014 but old rivals smell weakness.',
        'A poisoner\u2019s hand reaches into your own chambers.',
        'The pretender\u2019s host forms across the field.',
        'The realm awaits the queen you have become.'
      ],
      recalls: [
        { flag: 'prince_humiliated', turn: 4, line: 'The prince has not forgotten the day you made him kneel before the whole court.' },
        { flag: 'prince_spied', turn: 4, line: 'Your spy in the prince\u2019s household has sent word of his every plan.' },
        { flag: 'prince_outshone', turn: 4, line: 'The people\u2019s love has quietly hollowed the prince\u2019s support from within.' }
      ],
      branchOverrides: [
        { flag: 'prince_humiliated', turn: 4, body: 'Aldric\u2019s gauntlet slams the map. The prince you humiliated has raised the border lords in open revolt \u2014 his wounded pride demands your ruin. Armed columns gather in the passes; within days this becomes war.' },
        { flag: 'prince_spied', turn: 4, body: 'Aldric\u2019s gauntlet slams the map. The prince has raised the border lords \u2014 but the spy you placed buys you priceless warning. You know his strength, his routes, his timing before he moves. Still, steel gathers in the passes.' },
        { flag: 'prince_outshone', turn: 4, body: 'Aldric\u2019s gauntlet slams the map. The prince has called the border lords to arms \u2014 but half have already drifted to the queen the people adore. His revolt is loud, yet hollow. Even so, a sword is a sword.' },
        { flag: 'prince_humiliated', turn: 7, body: 'The prince rides at the head of his host, blazing with the shame you dealt him in open court. This is no longer a war for a throne \u2014 it is personal. He wants your crown and your head upon a spike.' },
        { flag: 'prince_spied', turn: 7, body: 'Thanks to the spy you placed long ago, you know the prince\u2019s battle plan before his own captains do. His host forms across the field, never suspecting how completely you have read him.' },
        { flag: 'prince_outshone', turn: 7, body: 'The prince\u2019s army is a hollow thing. Half his lords have slipped away to your banner, seduced by a queen the people adore. He raises his sword \u2014 and finds it already broken.' }
      ],
      scenes: [
        {
          chapter: 'Chapter I', turn: 1, total: 8,
          place: 'The Coronation Hall',
          envoy: { who: 'Chancellor Vayle', title: 'Lord Chancellor', avatar: '/throneera-redesign/assets/queen_chancellor.jpg' },
          title: 'The First Morning',
          body: 'The crown still feels heavy and cold. Before the incense of your coronation has cleared, the Chancellor leans close: the late king\u2019s brother has not bent the knee. The court watches to see whether you are a ruler \u2014 or merely a girl wearing gold.',
          choices: [
            { id: 'c1', label: 'Summon the prince. Demand his loyalty before the court.', tone: 'Bold', flag: 'prince_humiliated',
              fx: { legitimacy: 11, court: -6, danger: 9, army: 3 },
              voice: { who: 'Chancellor Vayle', line: 'He kneels, Majesty\u2026 but a cornered wolf remembers the hand that caged him.' },
              result: 'The prince kneels before the full court \u2014 but his smile is a drawn blade. They saw your strength today. So did your enemies.' },
            { id: 'c2', label: 'Send a quiet gift and a quieter spy.', tone: 'Cunning', flag: 'prince_spied',
              fx: { court: 8, danger: -6, treasury: -4, legitimacy: 2 },
              voice: { who: 'Your Spymistress', line: 'Already done. By morning his secrets will sleep upon your pillow.' },
              result: 'By nightfall your spy sleeps beneath his roof. He toasts your generosity, never knowing you are already inside his walls.' },
            { id: 'c3', label: 'Win the people first \u2014 let the prince isolate himself.', tone: 'Patient', flag: 'prince_outshone',
              fx: { people: 13, legitimacy: 5, army: -3, danger: -2 },
              voice: { who: 'Lady Mireille', line: 'The streets sing your name, Majesty. The prince hears every note from his cold hall.' },
              result: 'The streets chant your name until dawn. The prince waits in his cold hall, watching his allies drift toward your light.' }
          ]
        },
        {
          chapter: 'Chapter II', turn: 2, total: 8,
          place: 'The Privy Chamber',
          envoy: { who: 'Spymistress Corvane', title: 'Mistress of Whispers', avatar: '/throneera-redesign/assets/queen_spymistress.jpg' },
          title: 'A Letter, Unsigned',
          body: 'A sealed letter arrives without a name. Inside: proof that your spymaster has been selling secrets to a rival house. He has served the crown for thirty years. He kneels before you now, and does not yet know what you hold.',
          choices: [
            { id: 'c4', label: 'Expose him. Let the court see the cost of betrayal.', tone: 'Iron',
              fx: { legitimacy: 9, court: -11, danger: 7 },
              voice: { who: 'Chancellor Vayle', line: 'Thirty years of service, undone in a breath. They will remember this, Majesty.' },
              result: 'Guards drag him out in chains as the court watches in silence. They fear you now \u2014 and fear is a throne of its own.' },
            { id: 'c5', label: 'Turn him. A loyal traitor is worth ten honest men.', tone: 'Cunning',
              fx: { court: 7, danger: -9, treasury: 6 },
              voice: { who: 'The Spymaster', line: 'I am yours, my Queen \u2014 body, blade, and every secret I ever sold.' },
              result: 'He weeps with gratitude and terror, and swears himself to you alone. Now his rivals\u2019 secrets flow into your hand.' },
            { id: 'c6', label: 'Say nothing. Watch where the next thread leads.', tone: 'Patient',
              fx: { danger: 6, court: 3, legitimacy: -2 },
              voice: { who: 'Your handmaiden', line: 'You smile as though you know nothing at all. It is terrifying to watch, Majesty.' },
              result: 'You fold the letter into your sleeve. Somewhere in the palace a larger conspiracy breathes \u2014 and you mean to find its heart.' }
          ]
        },
        {
          chapter: 'Chapter III', turn: 3, total: 8,
          place: 'The Counting House',
          envoy: { who: 'Treasurer Bramwell', title: 'Keeper of the Coin', avatar: '/throneera-redesign/assets/queen_treasurer.jpg' },
          title: 'The Empty Vaults',
          body: 'Bramwell spreads the ledgers with trembling hands. The coronation, the bribes, the standing guard \u2014 all of it has drained the treasury to the dust. A foreign banking house offers gold. The temple offers nothing but prayers, though its vaults are full.',
          choices: [
            { id: 'c7', label: 'Tax the great noble houses. Let the rich bleed first.', tone: 'Bold',
              fx: { treasury: 12, court: -10, danger: 6, legitimacy: 3 },
              voice: { who: 'Treasurer Bramwell', line: 'The coffers fill, Majesty \u2014 and so do the ledgers of those who now hate you.' },
              result: 'The vaults fill with noble gold. The great houses pay, smiling through their teeth \u2014 and begin counting the cost of your reign.' },
            { id: 'c8', label: 'Take the foreign loan. Worry about the price later.', tone: 'Pragmatic',
              fx: { treasury: 14, legitimacy: -6, danger: 4 },
              voice: { who: 'Treasurer Bramwell', line: 'Gold today, Majesty. But foreign creditors have long memories and longer knives.' },
              result: 'Chests of foreign silver roll through the gates. The realm breathes again \u2014 but somewhere, a banker now holds a leash with your name on it.' },
            { id: 'c9', label: 'Seize the temple\u2019s hidden hoard for the crown.', tone: 'Ruthless',
              fx: { treasury: 13, people: -9, danger: 7, court: 2 },
              voice: { who: 'Lady Mireille', line: 'The priests curse your name from every altar, Majesty. The people hear them.' },
              result: 'Your guards strip the temple vaults bare. The crown is rich again \u2014 but the priests have turned their pulpits into weapons.' }
          ]
        },
        {
          chapter: 'Chapter IV', turn: 4, total: 8,
          place: 'The War Room',
          envoy: { who: 'Lord Aldric', title: 'Commander of the Host', avatar: '/throneera-redesign/assets/queen_commander.jpg' },
          title: 'Steel at the Border',
          body: 'Aldric\u2019s gauntlet slams the map. The prince has fled north and raised the border lords against you. Armed columns gather in the passes. Within days, this becomes a war \u2014 and wars crown some queens and bury others.',
          choices: [
            { id: 'c10', label: 'Strike first. March on them before they unite.', tone: 'Martial',
              fx: { army: 12, treasury: -8, danger: -6, legitimacy: 6 },
              voice: { who: 'Lord Aldric', line: 'At last, a ruler who does not flinch. The host marches at dawn, Majesty!' },
              result: 'Your banners pour through the northern passes before the lords can join. The court gasps at your nerve \u2014 the realm holds its breath.' },
            { id: 'c11', label: 'Fortify the capital. Let them break upon your walls.', tone: 'Patient',
              fx: { army: 6, people: -5, danger: 8, treasury: 2 },
              voice: { who: 'Lord Aldric', line: 'We will hold, Majesty\u2026 but a siege starves the loyal alongside the traitor.' },
              result: 'The gates are barred, the walls bristle with steel. You are safe \u2014 for now \u2014 but the people whisper that a caged queen is no queen at all.' },
            { id: 'c12', label: 'Send Mireille to buy the border lords back.', tone: 'Cunning',
              fx: { court: 9, treasury: -7, danger: -7, legitimacy: -2 },
              voice: { who: 'Lady Mireille', line: 'Gold and honeyed words, Majesty. Three lords are already yours again \u2014 for a price.' },
              result: 'Mireille works her quiet magic. One by one the border lords drift back to your side, leaving the prince to rage at an army that melts like spring snow.' }
          ]
        },
        {
          chapter: 'Chapter V', turn: 5, total: 8,
          place: 'The Gilded Salon',
          envoy: { who: 'Lady Mireille', title: 'Confidante to the Crown', avatar: '/throneera-redesign/assets/queen_lady.jpg' },
          title: 'The Marriage Game',
          body: 'Mireille fans three sealed letters across the table. Three suitors seek your hand: a warlord with ten thousand swords, a merchant-king drowning in gold, and a gentle prince who offers only peace. A crown shared is a crown defended \u2014 or a crown in chains.',
          choices: [
            { id: 'c13', label: 'Wed the warlord. Bind his army to your throne.', tone: 'Bold',
              fx: { army: 13, court: -6, danger: -5, legitimacy: 2 },
              voice: { who: 'Lord Aldric', line: 'Ten thousand swords swear to you through him, Majesty. Pray he never turns them.' },
              result: 'The warlord kneels and pledges his host. Your enemies pale at the union \u2014 but a husband with an army is a blade that cuts both ways.' },
            { id: 'c14', label: 'Wed the merchant-king. Drown your debts in his gold.', tone: 'Pragmatic',
              fx: { treasury: 14, legitimacy: -5, court: 4 },
              voice: { who: 'Treasurer Bramwell', line: 'The treasury overflows, Majesty! Though some sniff that you sold the crown for coin.' },
              result: 'His dowry refills your vaults to the brim. The realm prospers \u2014 and the old blood mutters that a queen has married a shopkeeper.' },
            { id: 'c15', label: 'Refuse them all. You answer to no man.', tone: 'Iron',
              fx: { legitimacy: 10, people: 7, court: -8, danger: 5 },
              voice: { who: 'Lady Mireille', line: 'They leave insulted, Majesty \u2014 and a little afraid. The people adore you for it.' },
              result: 'You send all three away. The court reels, the suitors seethe \u2014 but in the streets they sing of the queen who needs no king.' }
          ]
        },
        {
          chapter: 'Chapter VI', turn: 6, total: 8,
          place: 'The Royal Bedchamber',
          envoy: { who: 'Spymistress Corvane', title: 'Mistress of Whispers', avatar: '/throneera-redesign/assets/queen_spymistress.jpg' },
          title: 'The Poisoned Cup',
          body: 'Corvane drags a trembling cupbearer to your feet and sets a silver goblet before you. Poison \u2014 found in your evening wine. The boy weeps that he knew nothing. The trail of the poisoner leads back into the heart of your own court.',
          choices: [
            { id: 'c16', label: 'Execute the plotters publicly. Let terror reign.', tone: 'Iron',
              fx: { legitimacy: 8, court: -10, danger: -8 },
              voice: { who: 'Chancellor Vayle', line: 'Heads upon the gate, Majesty. None will dare lift a cup to you again.' },
              result: 'Heads adorn the palace gates by dawn. The court walks on glass, the poison stops \u2014 and every smile that greets you now hides a held breath.' },
            { id: 'c17', label: 'Feed the plotters false plans. Trap them all.', tone: 'Cunning',
              fx: { danger: -11, court: 6, legitimacy: 3 },
              voice: { who: 'Spymistress Corvane', line: 'They will hang themselves with the rope you handed them, Majesty. Patience.' },
              result: 'You let the poisoners believe they are safe, then close the net at once. The whole nest is taken \u2014 and the court never even saw your hand move.' },
            { id: 'c18', label: 'Pardon the boy. Hunt the master in shadow.', tone: 'Patient',
              fx: { people: 9, danger: 6, court: 2 },
              voice: { who: 'The cupbearer', line: 'I am yours unto death, Majesty. I will find who did this if it costs my life.' },
              result: 'You spare the trembling boy and he becomes your most loyal hound. The people praise your mercy \u2014 but the true poisoner still breathes, and watches.' }
          ]
        },
        {
          chapter: 'Chapter VII', turn: 7, total: 8,
          place: 'The Field of Banners',
          envoy: { who: 'Lord Aldric', title: 'Commander of the Host', avatar: '/throneera-redesign/assets/queen_commander.jpg' },
          title: 'The Pretender\u2019s War',
          body: 'It comes at last. The prince\u2019s host faces yours across a field of mud and banners. Aldric awaits your word. This is the battle that decides whose head wears the crown when the sun goes down.',
          choices: [
            { id: 'c19', label: 'Lead the charge yourself. Let them see their queen.', tone: 'Bold',
              fx: { army: 14, legitimacy: 9, danger: -7, treasury: -5 },
              voice: { who: 'Lord Aldric', line: 'They falter at the sight of you, Majesty! No legend was ever made from behind the lines!' },
              result: 'You ride at the front, crown upon your brow. Your soldiers roar and surge \u2014 and the prince\u2019s men break before a queen who fears nothing.' },
            { id: 'c20', label: 'Let Corvane\u2019s agents unmake them from within.', tone: 'Cunning',
              fx: { danger: -10, court: 7, army: -4 },
              voice: { who: 'Spymistress Corvane', line: 'His captains are already mine, Majesty. The battle is won before the first blade is drawn.' },
              result: 'On the morning of battle, half the prince\u2019s captains defect. His army dissolves in confusion \u2014 you win the war without spending the lives.' },
            { id: 'c21', label: 'Offer a truce. Split the realm and spare the blood.', tone: 'Diplomatic',
              fx: { people: 11, legitimacy: -7, court: -4, danger: -3 },
              voice: { who: 'Chancellor Vayle', line: 'Peace, Majesty \u2014 but a realm divided is a wound that never fully heals.' },
              result: 'You meet the prince beneath a white banner and carve the realm in two. The killing stops, the people weep with relief \u2014 but your crown is now half of what it was.' }
          ]
        },
        {
          chapter: 'Chapter VIII', turn: 8, total: 8,
          place: 'The Throne Room',
          envoy: { who: 'Chancellor Vayle', title: 'Lord Chancellor', avatar: '/throneera-redesign/assets/queen_chancellor.jpg' },
          title: 'The Reckoning',
          body: 'The dust has settled. The court gathers in silence to see what kind of queen the fire has forged. Vayle bows low and waits. Your final decree will echo for a hundred years \u2014 choose the legend they will tell.',
          choices: [
            { id: 'c22', label: 'Crown yourself absolute. The realm is yours alone.', tone: 'Iron',
              fx: { legitimacy: 14, court: -8, people: -6, danger: 6 },
              voice: { who: 'Chancellor Vayle', line: 'Absolute, Majesty. None above you, none beside you \u2014 and none to catch you if you fall.' },
              result: 'You gather every thread of power into your own hand. None may question you now \u2014 you are the state itself, magnificent and utterly alone.' },
            { id: 'c23', label: 'Share power with a council. Build something lasting.', tone: 'Reformer',
              fx: { court: 13, people: 8, legitimacy: -3, danger: -7 },
              voice: { who: 'Chancellor Vayle', line: 'Wisely done, Majesty. A throne shared by many hands is far harder to topple.' },
              result: 'You bind the great houses into a council bound to your crown. The realm steadies into something that may outlast you \u2014 a dynasty, not just a reign.' },
            { id: 'c24', label: 'Pardon every enemy. Rule by love, not fear.', tone: 'Beloved',
              fx: { people: 15, danger: -8, army: -5, court: 3 },
              voice: { who: 'Lady Mireille', line: 'They weep in the streets, Majesty. They will tell their children of the queen who forgave.' },
              result: 'You forgive them all \u2014 plotters, rebels, poisoners. The people fall to their knees in the squares, and your name becomes a blessing spoken for generations.' }
          ]
        }
      ],
      paywallAfter: 4,
      customLabel: 'Or issue your own decree',
      customPlaceholder: 'Speak as the Queen\u2026',
      customResult: 'The court hesitates at your unexpected command \u2014 then bends to obey. Word of the new Queen\u2019s will spreads through every corridor.',
      customVoice: { who: 'The Court', line: 'A command no one foresaw\u2026 and yet, they obey.' }
    },
    paywall: {
      cliff: 'The prince\u2019s banners are massing at the northern gates. By dawn, the court will choose a side \u2014 and so must you.',
      lossLine: 'You’ve come too far to stop now. End it here and your story is lost forever.',
      heading: 'The Crown Is Yours to Keep',
      valueProps: [
        'See your reign through to its fate — every decree, every consequence',
        'Reach the ending your choices have earned',
        'Claim your royal proclamation to keep & share'
      ],
      price: '$4.99',
      priceNote: 'One-time \u00B7 Full campaign \u00B7 No subscription',
      tiers: [
        { id: 'single', name: 'Your Full Reign', price: '$4.99', amount: '4.99', sub: 'Unlock your complete reign + every ending', perks: ['The complete reign, start to finish', 'All 6 endings to collect', 'Your shareable proclamation'] },
        { id: 'season', name: 'The Royal Season', price: '$14.99', amount: '14.99', badge: 'Best Value', best: true, sub: 'Unlimited replays + every new storyline as it releases', perks: ['Everything in Your Full Reign', 'Unlimited replays — chase every fate', 'New storylines & scenarios, free forever', 'Exclusive hidden endings'] }
      ],
      cta: 'Unlock My Reign',
      trust: ['Secure checkout', 'No subscription', 'Refund policy'],
      later: 'Abandon the throne'
    },
    ending: {
      banner: 'THE ROYAL CHRONICLE',
      headline: 'THE QUEEN WHO OUTLASTED THEM ALL',
      sub: 'After a reign of whispers, the throne stands unshaken.',
      body: 'History will record that the court underestimated her once \u2014 and never again. The bloodline endures, and the realm with it.',
      scoreLabel: 'Reign Score',
      score: 78,
      titleReveal: 'Your reign ends as',
      titlesByDisposition: { iron: 'THE IRON QUEEN', cunning: 'THE SHADOW QUEEN', beloved: 'THE BELOVED QUEEN' },
      defaultTitle: 'THE UNBROKEN QUEEN',
      outcomes: [
        { headline: 'THE IRON THRONE STANDS UNCHALLENGED', sub: 'The queen rules absolute; none dare whisper against her.', body: 'She gathered every thread of power into one unbreakable fist. The court obeys, the realm is steady, and her word is the only law — magnificent, feared, and utterly alone at the summit.' },
        { headline: 'THE QUEEN OF WHISPERS', sub: 'She never raised her voice — yet every rival quietly fell.', body: 'No one ever saw her strike. They simply vanished, recanted, or knelt. History will struggle to explain how a forgotten princess outlasted them all — and that is exactly how she wanted it.' },
        { headline: 'A QUEEN THE PEOPLE WOULD DIE FOR', sub: 'Her name is a blessing spoken in every village square.', body: 'She ruled by love where others ruled by fear, and the people answered with a devotion no army could buy. Her reign becomes the golden age that mothers will sing of for a hundred years.' },
        { headline: 'BETRAYED IN THE NIGHT', sub: 'The court she trusted flung open the gates to her enemies.', body: 'In the end it was not an army that undid her, but a smile at her own table. The crown she fought so hard to keep was taken by the very hands that once swore to defend it.' },
        { headline: 'THE QUEEN OVER THE WATER', sub: 'Driven from her throne, she plots her return from exile.', body: 'The realm slipped from her grasp and she fled with little more than her name. Yet across the water she still signs herself Queen — and her enemies sleep poorly, knowing she is not finished.' },
        { headline: 'THE KINGDOM FALLS TO ASHES', sub: 'The realm collapses into ruin and the crown is lost.', body: 'Empty coffers, a shattered army, a furious people — it all came due at once. The throne she inherited is reduced to cinders, and her short reign becomes a cautionary tale.' }
      ],
      fatesLabel: 'Fates Unlocked',
      fates: ['The Iron Throne', 'The Shadow Crown', 'The Beloved', 'The Betrayed', 'The Long Exile', 'The Crown of Ashes'],
      unlockedFate: 0,
      socialProof: 'Only 19% of rulers held the throne this way.',
      replayLine: '5 fates remain. Will the next reign end differently?',
      crossSell: { label: 'Different war, same throne room.', cta: 'Try Napoleon Simulator', to: 'napoleon' },
      again: 'Rewrite Your Reign'
    }
  },

  napoleon: {
    id: 'napoleon',
    theme: 'theme-napoleon',
    name: 'Napoleon Simulator',
    crest: '\u2726',
    landing: {
      heroImg: 'hero-napoleon-c.png',
      heroPos: '50% 16%',
      kicker: "A Unique & Surprisingly Fun Ruler Simulator",
      title: 'You Are Napoleon.\nCan You Save France?',
      tagline: 'France stands at the edge of collapse. Issue decrees, command the empire, and decide whether history can be rewritten.',
      body: 'Command the army, the treasury, and the nation as Europe closes in \u2014 and rewrite how the world remembers Waterloo.',
      cta: 'Take the Throne',
      ctaSub: 'Free to begin \u00B7 First order in under a minute',
      trust: ['Empire at stake', 'Alternate endings', 'No sign-up'],
      artLabel: 'KEY ART: campaign map, brass & parchment'
    },
    start: {
      heading: 'How Will You Rule?',
      sub: 'France will follow the Emperor you choose to be.',
      nameLabel: 'Your title',
      namePlaceholder: 'Emperor Napoleon',
      dispositionLabel: 'Your command style',
      dispositions: [
        { id: 'aggressor', label: 'The Aggressor', desc: 'Strike first. Strike hard.' },
        { id: 'strategist', label: 'The Strategist', desc: 'Win before the battle begins.' },
        { id: 'reformer', label: 'The Reformer', desc: 'A new empire, by the people\u2019s will.' }
      ],
      originLabel: 'Your mandate',
      origins: [
        { id: 'emperor', label: 'Emperor Restored', desc: 'Rule by crown and conquest.' },
        { id: 'republic', label: 'Son of the Republic', desc: 'Power from the nation, not the throne.' },
        { id: 'general', label: 'First Soldier', desc: 'The army is your legitimacy.' }
      ],
      cta: 'March on Paris'
    },
    coronation: {
      rite: 'By the will of the people, by the loyalty of the Guard, and by the eagles of the Grande Arm\u00e9e\u2014',
      hail: "VIVE L'EMPEREUR",
      courtLine: 'Ten thousand voices roar your name. France is yours again.',
      tapHint: 'Tap to begin the Hundred Days'
    },
    play: {
      hud: ['army', 'public', 'threat'],
      stats: [
        { key: 'army', label: 'Army Morale', value: 65 },
        { key: 'treasury', label: 'Treasury', value: 35 },
        { key: 'public', label: 'Public Support', value: 55 },
        { key: 'elite', label: 'Elite Loyalty', value: 40 },
        { key: 'logistics', label: 'Logistics', value: 45 },
        { key: 'threat', label: 'Coalition Threat', value: 70, inverted: true }
      ],
      threatThread: [
        'Across the Rhine, Europe begins to mobilize.',
        'The Coalition pledges six hundred thousand men.',
        'Wellington\u2019s army gathers at Brussels.',
        'The Coalition masses upon the frontier.',
        'The armies of Europe converge on Belgium.',
        'Bl\u00fccher\u2019s Prussians remain unbroken in the field.',
        'Every hour, the Prussians draw nearer to Waterloo.',
        'All Europe waits to see what France becomes.'
      ],
      recalls: [
        { flag: 'mobilized', turn: 5, line: 'The two hundred thousand you called to arms in March now march at your back.' },
        { flag: 'constitution', turn: 5, line: 'The nation you won with the Acte Additionnel follows you willingly to war.' },
        { flag: 'purged', turn: 5, line: 'The ministries you purged are silent and obedient \u2014 and watchful.' }
      ],
      branchOverrides: [
        { flag: 'mobilized', turn: 4, body: 'Talleyrand glides in from Vienna, every syllable measured. The Coalition names you \u2014 not France \u2014 an outlaw. Yet your sudden mobilization has rattled them; two hundred thousand bayonets buy a louder voice at any table. There may be a wedge to drive between Austria and the rest.' },
        { flag: 'constitution', turn: 4, body: 'Talleyrand glides in from Vienna, every syllable measured. The Coalition names you an outlaw \u2014 but the liberal constitution you granted has charmed the courts. Even Austria wonders whether a reformed France is one they might deal with. There may be a wedge to drive.' },
        { flag: 'purged', turn: 4, body: 'Talleyrand glides in from Vienna, every syllable measured. The Coalition names you an outlaw, and word of your brutal purge has reached them \u2014 they see a tyrant, not a partner. The wedge will be harder to drive. But Talleyrand smiles all the same.' },
        { flag: 'mobilized', turn: 7, body: 'The vast army you raised in the spring stands seventy-two thousand strong on the field of Waterloo \u2014 raw recruits beside grizzled veterans, but yours to the last man. Wellington holds the ridge. The Prussians may yet come.' },
        { flag: 'constitution', turn: 7, body: 'The soldiers on this ridge fight not for an emperor alone, but for the France you promised them in the Acte Additionnel. Their morale burns hotter than Wellington can match \u2014 if you spend it before the Prussians arrive.' },
        { flag: 'purged', turn: 7, body: 'Your army is loyal, disciplined, purged of every doubter \u2014 but the ruthless hand that cleansed the ministries has left few who dare tell you hard truths on this fatal, rain-soaked morning.' }
      ],
      scenes: [
        {
          chapter: 'March 20, 1815', turn: 1, total: 8,
          place: 'The Tuileries Palace',
          envoy: { who: 'Marshal Ney', title: 'Bravest of the Brave', avatar: '/throneera-redesign/assets/nap_ney.jpg' },
          title: 'Return to Paris',
          body: 'You return to the Tuileries. The Bourbon king has fled in the night and Paris erupts in celebration \u2014 but across the Rhine, couriers are already racing to London, Vienna, and St. Petersburg. Europe has begun to mobilize against you.',
          choices: [
            { id: 'n1', label: 'Mobilize the army immediately.', tone: 'Martial', flag: 'mobilized',
              fx: { army: 11, treasury: -8, threat: -4, public: 3 },
              voice: { who: 'Marshal Ney', line: 'The eagles fly again, Sire! Two hundred thousand bayonets at your word.' },
              result: 'Drums sound in every province. Two hundred thousand men answer the eagle \u2014 but the treasury bleeds to arm them.' },
            { id: 'n2', label: 'Promise a constitution to rally the nation.', tone: 'Political', flag: 'constitution',
              fx: { public: 13, elite: -5, threat: -3, army: 2 },
              voice: { who: 'Minister Carnot', line: 'Paris is yours once more, Sire. The liberals weep to call you their own.' },
              result: 'Paris roars its approval of the Acte Additionnel. The old marshals grumble \u2014 but the nation is yours again.' },
            { id: 'n3', label: 'Purge the royalists still inside the government.', tone: 'Ruthless', flag: 'purged',
              fx: { elite: -10, army: 5, public: 3, threat: 2 },
              voice: { who: 'Fouch\u00e9, Police', line: 'The ministries are\u2026 cleansed, Sire. They serve you now. They have no choice.' },
              result: 'By morning the ministries are swept clean. The government is loyal now \u2014 loyal through fear.' }
          ]
        },
        {
          chapter: 'April 2, 1815', turn: 2, total: 8,
          place: 'The Ministry of Finance',
          envoy: { who: 'Minister Carnot', title: 'Organizer of Victory', avatar: '/throneera-redesign/assets/nap_carnot.jpg' },
          title: "The Empire\u2019s Purse",
          body: 'Carnot lays the ledgers bare, his voice flat with hard arithmetic. The army needs muskets, boots, and bread \u2014 and the treasury cannot pay for all three. War is coming whether France can afford it or not, Sire.',
          choices: [
            { id: 'n7', label: 'Levy a war tax on Paris and the provinces.', tone: 'Pragmatic',
              fx: { treasury: 13, public: -8, elite: -4 },
              voice: { who: 'Minister Carnot', line: 'The coffers fill, Sire \u2014 but every franc taken is a grumble in the marketplace.' },
              result: 'The tax collectors fan out across France. The war chest swells \u2014 but in every cafe and market square, the muttering grows.' },
            { id: 'n8', label: 'Melt the crown silver. Seize the church gold.', tone: 'Ruthless',
              fx: { treasury: 15, elite: -7, public: -3 },
              voice: { who: 'Fouch\u00e9, Police', line: 'The vaults are emptied into your war chest, Sire. The bishops will not forget this.' },
              result: 'Imperial plate and altar gold pour into the mint. The army will be armed \u2014 and the old powers of France will remember who stripped their treasures.' },
            { id: 'n9', label: 'Issue war bonds. Trust the people to fund France.', tone: 'Reformer',
              fx: { public: 11, treasury: 6, elite: 4 },
              voice: { who: 'Minister Carnot', line: 'They line up to lend, Sire! The nation buys a stake in its own survival.' },
              result: 'Citizens queue to buy bonds for the eagle. The treasury grows slower \u2014 but France now has its own coin riding on your victory.' }
          ]
        },
        {
          chapter: 'April 20, 1815', turn: 3, total: 8,
          place: 'The Police Ministry',
          envoy: { who: 'Joseph Fouch\u00e9', title: 'Minister of Police', avatar: '/throneera-redesign/assets/nap_fouche.jpg' },
          title: 'The Royalist Shadow',
          body: 'Fouch\u00e9 slides a list across the table with a thin smile. Names \u2014 generals, ministers, a marshal\u2019s wife \u2014 all in secret correspondence with Ghent, where the Bourbon king waits for you to stumble. Some of these names you cannot afford to lose.',
          choices: [
            { id: 'n10', label: 'Arrest them all tonight. Make the lesson plain.', tone: 'Ruthless',
              fx: { elite: -9, threat: -6, public: 3 },
              voice: { who: 'Fouch\u00e9, Police', line: 'Done before dawn, Sire. France will know what befalls those who write to Ghent.' },
              result: 'Before dawn the cells are full. The plots wither \u2014 but every officer now wonders whose name sits on the next list, and sleeps with one eye open.' },
            { id: 'n11', label: 'Turn them. A watched traitor is a weapon.', tone: 'Cunning',
              fx: { threat: -11, elite: 4, public: 2 },
              voice: { who: 'Fouch\u00e9, Police', line: 'Let them write their letters, Sire \u2014 I shall hold the pen behind every one.' },
              result: 'You let the traitors keep their secrets, now feeding them yours. Ghent drinks poison disguised as wine, and never tastes your hand in it.' },
            { id: 'n12', label: 'Watch and wait. Let them lead you to the king.', tone: 'Patient',
              fx: { threat: 6, elite: 5, public: -2 },
              voice: { who: 'Fouch\u00e9, Police', line: 'Patience is a blade too, Sire \u2014 though it leaves the wound open longer.' },
              result: 'You let the web grow, watching every thread. The conspiracy deepens \u2014 dangerous, but soon it may lead you straight to the heart of the Bourbon cause.' }
          ]
        },
        {
          chapter: 'May 3, 1815', turn: 4, total: 8,
          place: 'The Diplomatic Cabinet',
          envoy: { who: 'Talleyrand', title: 'The Limping Devil', avatar: '/throneera-redesign/assets/nap_talleyrand.jpg' },
          title: "Vienna\u2019s Answer",
          body: 'Talleyrand glides in with word from Vienna, every syllable measured. The Coalition has declared you \u2014 not France \u2014 an outlaw. There may yet be a wedge to drive between Austria and the rest, he murmurs. For the right price, the alliance against you could crack.',
          choices: [
            { id: 'n13', label: 'Offer Austria secret terms. Split the Coalition.', tone: 'Diplomatic',
              fx: { threat: -12, treasury: -6, elite: 4 },
              voice: { who: 'Talleyrand', line: 'Vienna listens, Sire. Emperors are always for sale \u2014 one need only name the coin.' },
              result: 'Your envoys slip into Vienna by candlelight. The Coalition\u2019s unity begins to fray \u2014 every day Austria hesitates is a day France survives.' },
            { id: 'n14', label: 'Reject all talks. Dare them to march on France.', tone: 'Defiant',
              fx: { army: 9, public: 8, threat: 7 },
              voice: { who: 'Marshal Ney', line: 'Let them come, Sire! France has buried invaders before and will again!' },
              result: 'You send their envoys home empty-handed. France thrills at your defiance \u2014 but every throne in Europe now sharpens its sword for you alone.' },
            { id: 'n15', label: 'Leak their divisions to the French press.', tone: 'Cunning',
              fx: { public: 12, threat: -4, elite: -3 },
              voice: { who: 'Talleyrand', line: 'All Paris reads of the squabbling kings by morning, Sire. Mockery is a kind of armor.' },
              result: 'The papers roar with tales of bickering monarchs. France laughs and rallies \u2014 the Coalition, exposed and embarrassed, closes ranks a little tighter.' }
          ]
        },
        {
          chapter: 'June 12, 1815', turn: 5, total: 8,
          place: 'The Frontier Camp',
          envoy: { who: 'Marshal Ney', title: 'Bravest of the Brave', avatar: '/throneera-redesign/assets/nap_ney.jpg' },
          title: 'March to Belgium',
          body: 'Ney spreads the map by lamplight, eyes blazing. Wellington\u2019s British and Bl\u00fccher\u2019s Prussians lie scattered across Belgium, not yet joined. Strike the gap between them, Sire, and we beat each in turn. Wait \u2014 and they become one army twice our size.',
          choices: [
            { id: 'n16', label: 'Cross the frontier at dawn. Full speed, full surprise.', tone: 'Decisive',
              fx: { army: 10, logistics: -6, threat: -7 },
              voice: { who: 'Marshal Ney', line: 'The columns are moving, Sire! We are over the border before they finish their breakfast!' },
              result: 'Your army pours into Belgium before the enemy can blink. Surprise is total \u2014 but the supply wagons are already falling behind the bayonets.' },
            { id: 'n17', label: 'Advance carefully. Secure the supply lines first.', tone: 'Methodical',
              fx: { logistics: 11, army: -3, threat: 5 },
              voice: { who: 'Marshal Soult', line: 'Wisely cautious, Sire. An army marches on its stomach \u2014 and ours will be full.' },
              result: 'You advance like a tide, deliberate and supplied. The army is steady and fed \u2014 but every careful day lets Wellington and Bl\u00fccher edge closer together.' },
            { id: 'n18', label: 'Feint south, then wheel north and strike.', tone: 'Cunning',
              fx: { threat: -8, elite: 5, logistics: -4 },
              voice: { who: 'Marshal Soult', line: 'They chase a ghost southward, Sire, while your fist falls where they least expect.' },
              result: 'Your feint sends the enemy scrambling the wrong way. You wheel north into the gap \u2014 brilliant, though the maneuver costs you precious days of supply.' }
          ]
        },
        {
          chapter: 'June 16, 1815', turn: 6, total: 8,
          place: 'The Field at Ligny',
          envoy: { who: 'Marshal Soult', title: 'Chief of Staff', avatar: '/throneera-redesign/assets/nap_soult.jpg' },
          title: 'The Prussian Question',
          body: 'Bl\u00fccher is wounded, his army retreating \u2014 but in which direction? If they fall back to Li\u00e8ge, they are out of the war. If they march north to Wavre, they can still reinforce Wellington. Marshal Grouchy awaits your order. This decision will decide everything.',
          choices: [
            { id: 'n4', label: 'Send Grouchy with 33,000 men to destroy them.', tone: 'Decisive',
              fx: { threat: -7, army: -5, logistics: -3 },
              voice: { who: 'Marshal Soult', line: 'Grouchy marches east, Sire. Pray the Prussians stay broken.' },
              result: 'Grouchy marches east in the rain. The Prussians scatter before him \u2014 but your right arm is now a day\u2019s march from Waterloo.' },
            { id: 'n5', label: 'Keep every man concentrated against Wellington.', tone: 'Focused',
              fx: { army: 9, threat: 6 },
              voice: { who: 'Marshal Ney', line: 'Every gun on Wellington, Sire! But Bl\u00fccher\u2019s ghost haunts our right flank.' },
              result: 'Your full strength turns toward the ridge at Mont-Saint-Jean. But Bl\u00fccher\u2019s Prussians vanish north, unwatched and unbroken.' },
            { id: 'n6', label: 'Offer the Prussians terms to withdraw.', tone: 'Diplomatic',
              fx: { threat: -9, army: -6, public: -4 },
              voice: { who: 'General Gourgaud', line: 'Bl\u00fccher burned your letter, Sire. The Prussians come for blood now.' },
              result: 'Bl\u00fccher spits at your envoy and burns the letter. The Prussians will fight on \u2014 and now they know you hesitated.' }
          ]
        },
        {
          chapter: 'June 18, 1815', turn: 7, total: 8,
          place: 'The Ridge at Mont-Saint-Jean',
          envoy: { who: 'Marshal Ney', title: 'Bravest of the Brave', avatar: '/throneera-redesign/assets/nap_ney.jpg' },
          title: 'Waterloo',
          body: 'Rain-soaked dawn. Wellington holds the ridge with sixty-eight thousand men; you face him with seventy-two. Ney\u2019s cavalry stamps and snorts in the mud, the Guard stands ready \u2014 and somewhere to the east, every hour, the Prussians draw nearer. The battle that will decide Europe begins now.',
          choices: [
            { id: 'n19', label: 'Hurl the cavalry at the British squares. Break them now.', tone: 'Bold',
              fx: { army: 9, threat: 7, logistics: -6 },
              voice: { who: 'Marshal Ney', line: 'I will ride through them myself, Sire! The squares cannot hold against such fury!' },
              result: 'Ney leads charge after thunderous charge into the British squares. The valley shakes \u2014 but the redcoats hold, and your horsemen fall in heaps before the bayonets.' },
            { id: 'n20', label: 'Wait for the ground to dry. Then the grand battery.', tone: 'Methodical',
              fx: { army: 6, threat: 10, logistics: 3 },
              voice: { who: 'Marshal Soult', line: 'The guns will be murderous on dry ground, Sire \u2014 if the Prussians grant us the hours.' },
              result: 'You hold for the mud to firm, massing your artillery. The barrage will be devastating \u2014 but the delay is a gift, and far to the east the Prussian columns are marching to spend it.' },
            { id: 'n21', label: 'Commit the Imperial Guard now. Stake it all.', tone: 'All or Nothing',
              fx: { army: 13, threat: -8, elite: -6 },
              voice: { who: 'Marshal Ney', line: 'The Guard has never broken, Sire! Send them in and Wellington is finished before nightfall!' },
              result: 'The Old Guard advances, bearskins high, the army roaring behind them. It is everything you have, thrown at one moment \u2014 history itself holds its breath as they climb the ridge.' }
          ]
        },
        {
          chapter: 'June 22, 1815', turn: 8, total: 8,
          place: 'The Tuileries, Paris',
          envoy: { who: 'Talleyrand', title: 'The Limping Devil', avatar: '/throneera-redesign/assets/nap_talleyrand.jpg' },
          title: 'The Aftermath',
          body: 'The smoke has cleared from Belgium, and Paris waits in fearful silence. Talleyrand stands at your shoulder, as he always does at the end of things. Whatever Waterloo has decided, your final act will write the legend the world remembers. Choose it well, Sire.',
          choices: [
            { id: 'n22', label: 'Fight on. Rally France to the last man.', tone: 'Defiant',
              fx: { army: -5, public: 11, threat: 8 },
              voice: { who: 'Marshal Ney', line: 'France will rise again at your word, Sire! We are not finished while you still breathe!' },
              result: 'You call the nation to total war. The people answer with fierce devotion \u2014 but all of Europe now marches on Paris, and the road ahead is paved with French graves.' },
            { id: 'n23', label: 'Abdicate. Spare France the ruin of a hopeless war.', tone: 'Sacrificial',
              fx: { public: 9, threat: -10, elite: 6 },
              voice: { who: 'Talleyrand', line: 'A noble end, Sire. History is kinder to the emperor who knew when to lay down the crown.' },
              result: 'You set down the crown to save France from herself. The eagles fold their wings \u2014 and a strange, sorrowful peace settles over the nation you would not see destroyed.' },
            { id: 'n24', label: 'Seize total power. Rule France by the sword alone.', tone: 'Iron',
              fx: { army: 8, public: -9, elite: -7, threat: 6 },
              voice: { who: 'Fouch\u00e9, Police', line: 'Martial law is declared, Sire. France obeys \u2014 because France has no other choice.' },
              result: 'You dissolve the chambers and rule by decree and bayonet. France is yours, absolutely \u2014 a silent, watchful empire of one man\u2019s iron will.' }
          ]
        }
      ],
      paywallAfter: 4,
      customLabel: 'Or issue your own order',
      customPlaceholder: 'Command as the Emperor\u2026',
      customResult: 'Your marshals exchange a glance at the unexpected order \u2014 then salute. The Grande Arm\u00e9e moves to your will.',
      customVoice: { who: 'The Marshals', line: 'An order none expected, Sire \u2014 and yet, the army moves.' }
    },
    paywall: {
      cliff: 'Dawn breaks over the mud at Mont-Saint-Jean. Wellington holds the ridge. Somewhere to the east, the Prussians may already be marching. Waterloo begins now.',
      lossLine: 'You’ve come too far to stop now. Walk away and Waterloo is decided without you.',
      heading: 'The Final Campaign Awaits',
      valueProps: [
        'Command your campaign to its fate — every order, every consequence',
        'Reach the ending your strategy has earned',
        'Claim your front-page headline to keep & share'
      ],
      price: '$4.99',
      priceNote: 'One-time \u00B7 Full campaign \u00B7 No subscription',
      tiers: [
        { id: 'single', name: 'The Final Campaign', price: '$4.99', amount: '4.99', sub: 'Unlock your complete campaign + every ending', perks: ['The complete campaign, start to finish', 'All 6 endings to collect', 'Your shareable headline'] },
        { id: 'season', name: "The Emperor's Season", price: '$14.99', amount: '14.99', badge: 'Best Value', best: true, sub: 'Unlimited replays + every new storyline as it releases', perks: ['Everything in The Final Campaign', 'Unlimited replays — rewrite every outcome', 'New storylines & campaigns, free forever', 'Exclusive hidden endings'] }
      ],
      cta: 'Unlock the Final Campaign',
      trust: ['Secure checkout', 'No subscription', 'Refund policy'],
      later: 'Retreat for now'
    },
    ending: {
      banner: 'THE PARIS TIMES',
      headline: 'NAPOLEON VICTORIOUS: EUROPE TREMBLES',
      sub: 'The Emperor breaks the Coalition on the fields of Belgium.',
      body: 'In a stunning reversal of fortune, the Grande Arm\u00e9e has shattered Wellington\u2019s line and the road to Brussels lies open. The powers of Europe scramble to reckon with an Emperor reborn.',
      scoreLabel: 'Campaign Score',
      score: 81,
      titleReveal: 'History remembers you as',
      titlesByDisposition: { aggressor: 'THE CONQUEROR', strategist: 'THE GRAND STRATEGIST', reformer: "THE PEOPLE'S EMPEROR" },
      defaultTitle: 'THE IMMORTAL',
      outcomes: [
        { headline: 'EUROPE KNEELS TO THE EAGLE', sub: 'Wellington broken, the Coalition shattered — the continent is his.', body: 'Against every prophecy of doom, the Grande Armée has remade the map of Europe in a single campaign. The powers that swore to bury him now sue for terms. The eagle flies higher than ever.' },
        { headline: 'THE EMPIRE ENDURES', sub: 'Through nerve and negotiation, France stands restored.', body: 'He could not conquer all of Europe — but he kept France, and that was victory enough. The Coalition, divided and exhausted, signs a peace that leaves the Emperor on his throne.' },
        { headline: 'FRANCE UNDER THE IRON HAND', sub: 'The Emperor rules by bayonet and decree alone.', body: 'The chambers are dissolved, the press silenced, the streets patrolled. France survives as a fortress-state of one man’s will — secure, obedient, and holding its breath.' },
        { headline: 'TREASON FELLS THE EAGLE', sub: 'His own marshals deliver him to the enemy.', body: 'It was not Wellington who ended him, but the men who once carried his eagles. Abandoned by the army he made immortal, the Emperor falls to the knives at his own back.' },
        { headline: 'EXILE ONCE MORE', sub: 'The Emperor surrenders and sails toward a distant rock.', body: 'The dream of the Hundred Days flickers out. He lays down his sword to spare France further ruin and boards an enemy ship — bound for a lonely island at the edge of the world.' },
        { headline: 'THE GRANDE ARM\u00C9E IS NO MORE', sub: 'Coalition banners fly over a fallen Paris.', body: 'The eagles are cast down in the mud. With the army destroyed and the treasury empty, Coalition troops march unopposed down the boulevards of Paris. The empire is finished.' }
      ],
      fatesLabel: 'Fates Unlocked',
      fates: ['Master of Europe', 'The Restored Empire', 'The Iron Dictator', 'The Betrayed Eagle', 'The Second Exile', 'The Fall of France'],
      unlockedFate: 0,
      socialProof: 'Only 14% of commanders rewrote Waterloo like this.',
      replayLine: '5 fates remain. Will the next campaign end differently?',
      crossSell: { label: 'Trade the map room for the throne room.', cta: 'Try Queen Simulator', to: 'queen' },
      again: 'Rewrite History'
    }
  }
};

