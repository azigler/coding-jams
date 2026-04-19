import type { Level } from './types';

// Palette references (also defined in CSS custom props). Kept as strings so
// TypeScript can hand them to canvas/inline styles when needed. Values match
// specs/overview.md verbatim.
const COLOR_A = 'oklch(62% 0.17 45)';
const COLOR_B = 'oklch(52% 0.15 240)';
const COLOR_C = 'oklch(60% 0.09 140)';

export const LEVELS: Level[] = [
  {
    id: 1,
    slug: 'hello',
    title: 'Hello?',
    epigraph: 'Every shift begins with the same crossed line.',
    conversations: [
      { id: 'A', label: 'the mother', color: COLOR_A, icon: 'mother' },
      { id: 'B', label: 'the office', color: COLOR_B, icon: 'office' },
    ],
    lines: [
      { id: 1, text: 'Hello? Are you there?', owner: 'A' },
      { id: 2, text: 'The meeting is at three, not four.', owner: 'B' },
      {
        id: 3,
        text: 'I was hoping to catch you before you went out.',
        owner: 'A',
      },
      { id: 4, text: 'Did you bring the contracts?', owner: 'B' },
      {
        id: 5,
        text: 'The forecast says rain — remember the umbrella.',
        owner: 'A',
      },
      {
        id: 6,
        text: "Put them on my desk. I'll sign after lunch.",
        owner: 'B',
      },
      { id: 7, text: 'I love you, dear.', owner: 'A' },
      { id: 8, text: 'Everyone in the room needs to hear this.', owner: 'B' },
    ],
    postamble:
      'The mother hangs up first. The office talks to itself for another twenty minutes. The operator listens and doesn\u2019t say a word.',
  },
  {
    id: 2,
    slug: 'wednesday',
    title: 'Wednesday',
    epigraph: 'Some calls sound the same. They aren\u2019t.',
    conversations: [
      {
        id: 'A',
        label: 'the insurance office',
        color: COLOR_A,
        icon: 'insurance',
      },
      { id: 'B', label: 'the law office', color: COLOR_B, icon: 'law' },
    ],
    lines: [
      {
        id: 1,
        text: "The adjuster's report came through this morning.",
        owner: 'A',
      },
      {
        id: 2,
        text: 'Mrs. Whitaker wants the signing moved to Friday.',
        owner: 'B',
      },
      {
        id: 3,
        text: "The damage exceeds the policy's limit by four hundred.",
        owner: 'A',
      },
      {
        id: 4,
        text: "She's been widowed six months. Be gentle.",
        owner: 'B',
      },
      {
        id: 5,
        text: 'Can we split the payout across two quarters?',
        owner: 'A',
      },
      {
        id: 6,
        text: 'The estate is small — mostly the house on Maple.',
        owner: 'B',
      },
      {
        id: 7,
        text: "I'll need the signature by end of day Thursday.",
        owner: 'A',
      },
      { id: 8, text: 'Her sister is contesting the second page.', owner: 'B' },
      {
        id: 9,
        text: "Tell the client we'll cover half in good faith.",
        owner: 'A',
      },
      {
        id: 10,
        text: "Friday at ten. Don't let her bring the sister.",
        owner: 'B',
      },
    ],
    postamble:
      'Two voices, two desks, one name between them. The operator makes a small note and sets it aside.',
  },
  {
    id: 3,
    slug: 'the-shift',
    title: 'The Shift',
    epigraph: 'Three lines, all ringing at once. All of them matter.',
    conversations: [
      { id: 'A', label: "the doctor's office", color: COLOR_A, icon: 'doctor' },
      { id: 'B', label: 'the school', color: COLOR_B, icon: 'school' },
      { id: 'C', label: 'the neighbor', color: COLOR_C, icon: 'neighbor' },
    ],
    lines: [
      {
        id: 1,
        text: "The results came back this morning. I'm afraid —",
        owner: 'A',
      },
      { id: 2, text: "He's been distracted in class all week.", owner: 'B' },
      {
        id: 3,
        text: '— it\u2019s not what we hoped. Can you come in tomorrow?',
        owner: 'A',
      },
      {
        id: 4,
        text: 'There\u2019s been shouting, late. After ten.',
        owner: 'C',
      },
      {
        id: 5,
        text: "I'd rather discuss it in person. Both of you, if possible.",
        owner: 'B',
      },
      {
        id: 6,
        text: "The Whitaker place. I've called them twice.",
        owner: 'C',
      },
      { id: 7, text: "Ten in the morning. Don't bring him.", owner: 'A' },
      {
        id: 8,
        text: "He's a bright child. We don't want to label anything.",
        owner: 'B',
      },
      {
        id: 9,
        text: "I don't want trouble. I just want to sleep.",
        owner: 'C',
      },
      { id: 10, text: "I know. I know. I'll tell her tonight.", owner: 'A' },
    ],
    postamble:
      'The doctor, the teacher, and the neighbor. Three different rooms in the same town — and the operator hears them layered like a chord.',
  },
  {
    id: 4,
    slug: 'dearest',
    title: 'Dearest',
    epigraph: 'One voice knows it\u2019s being overheard.',
    conversations: [
      { id: 'A', label: 'the grocer', color: COLOR_A, icon: 'grocer' },
      { id: 'B', label: 'the letter', color: COLOR_B, icon: 'letter' },
    ],
    lines: [
      {
        id: 1,
        text: 'Two pounds of flour and a tin of coffee, yes.',
        owner: 'A',
      },
      { id: 2, text: 'The geraniums are blooming by the shed.', owner: 'B' },
      { id: 3, text: 'Can you send it around after four?', owner: 'A' },
      {
        id: 4,
        text: "She said she'd come once the ice breaks.",
        owner: 'B',
      },
      {
        id: 5,
        text: 'The bill with the others — Mrs. Harrow pays monthly.',
        owner: 'A',
      },
      { id: 6, text: "I'll leave the kitchen door unlatched.", owner: 'B' },
      { id: 7, text: "And a pound of sugar if there's any left.", owner: 'A' },
      {
        id: 8,
        text: "The husband travels Thursdays. He's always gone by eight.",
        owner: 'B',
      },
      { id: 9, text: 'Thank you. Tell your wife hello.', owner: 'A' },
      { id: 10, text: "Burn this when you're done.", owner: 'B' },
    ],
    postamble:
      'The grocer orders two pounds of flour. The letter burns in a different fireplace. Ellen Whitaker\u2019s kitchen door will not be locked tonight.',
  },
  {
    id: 5,
    slug: 'dial-tone',
    title: 'Dial Tone',
    epigraph: 'The last call of the shift. Nobody is speaking.',
    conversations: [
      { id: 'A', label: 'the caller', color: COLOR_A, icon: 'caller' },
      { id: 'B', label: 'the dispatcher', color: COLOR_B, icon: 'dispatcher' },
    ],
    lines: [
      { id: 1, text: 'Please — please, there\u2019s been —', owner: 'A' },
      {
        id: 2,
        text: 'Ma\u2019am, I need you to take a breath and tell me the address.',
        owner: 'B',
      },
      { id: 3, text: 'Forty-two Maple. The kitchen. He —', owner: 'A' },
      {
        id: 4,
        text: 'Stay on the line. An ambulance is leaving the station now.',
        owner: 'B',
      },
      {
        id: 5,
        text: 'I thought he had gone. I thought it was Thursday.',
        owner: 'A',
      },
      {
        id: 6,
        text: 'You\u2019re doing fine. Keep talking to me.',
        owner: 'B',
      },
      {
        id: 7,
        text: 'There\u2019s so much blood. It isn\u2019t mine. It isn\u2019t mine.',
        owner: 'A',
      },
      {
        id: 8,
        text: 'Help is three minutes away. Can you tell me your name?',
        owner: 'B',
      },
      { id: 9, text: 'Ellen. Ellen Whitaker.', owner: 'A' },
      {
        id: 10,
        text: 'Ellen, I\u2019m Ruth. I\u2019m not going anywhere. Stay with me.',
        owner: 'B',
      },
    ],
    postamble:
      'The operator is Ruth. The operator has been Ruth all along. This is the shift where Ellen Whitaker\u2019s name stops being just a name on the board.\n\nEvery shift has a last call. Some of them pass through you and leave no mark. This one will not.',
  },
];

export const END_CARD = {
  top: 'Thank you for taking the shift.',
  bottom: '— CROSSED WIRES, LD59',
};
