import type { Level } from './types';

const COLOR_A = 'oklch(65% 0.18 40)';
const COLOR_B = 'oklch(55% 0.16 245)';
const COLOR_C = 'oklch(65% 0.13 150)';

/**
 * Lines are authored per-conversation with simulated timestamps, then
 * merged by time. No alternation pattern — calls clump naturally (one
 * caller monologues while the other is silent).
 *
 * A █ block in a line means STATIC eats that word on the wire. The
 * obscured word is usually the TOPIC anchor — so the player can't
 * sort by topic, they have to sort by CADENCE and VOICE.
 */
export const LEVELS: Level[] = [
  {
    id: 1,
    slug: 'hello',
    title: 'Hello?',
    conversations: [
      { id: 'A', label: 'the goat lady', color: COLOR_A, icon: 'neighbor' },
      { id: 'B', label: 'the office', color: COLOR_B, icon: 'office' },
    ],
    lines: [
      { id: 1, text: 'Brighton shipment. Status.', owner: 'B' },
      { id: 2, text: 'Operator \u2014 I simply MUST complain.', owner: 'A' },
      { id: 3, text: 'There is a GOAT on my lawn.', owner: 'A' },
      { id: 4, text: 'A GOAT. Wearing a felt HAT.', owner: 'A' },
      { id: 5, text: 'Loading dock, then. Fine.', owner: 'B' },
      { id: 6, text: 'It is eating my hydrangeas.', owner: 'A' },
      { id: 7, text: 'Signed for by Schneider?', owner: 'B' },
      { id: 8, text: 'Just send SOMEONE. Please.', owner: 'A' },
    ],
  },
  {
    id: 2,
    slug: 'wednesday',
    title: 'Wednesday',
    conversations: [
      {
        id: 'A',
        label: "mr. peck's refund",
        color: COLOR_A,
        icon: 'insurance',
      },
      { id: 'B', label: 'ferret pamphlets', color: COLOR_B, icon: 'letter' },
    ],
    lines: [
      { id: 1, text: 'I never signed up for the ferret series.', owner: 'B' },
      { id: 2, text: 'Volumes one through ELEVEN.', owner: 'B' },
      { id: 3, text: 'I purchased a fainting goat.', owner: 'A' },
      { id: 4, text: 'It did not faint.', owner: 'A' },
      { id: 5, text: 'Three times now. THREE.', owner: 'A' },
      {
        id: 6,
        text: 'A whistle, a saucepan, and a thrown \u2588\u2588\u2588\u2588\u2588.',
        owner: 'A',
      },
      {
        id: 7,
        text: 'My husband thought it was a TUNA subscription.',
        owner: 'B',
      },
      { id: 8, text: 'I want my money back. With postage.', owner: 'A' },
      { id: 9, text: 'He is DEEPLY confused.', owner: 'B' },
      {
        id: 10,
        text: 'I am being HARASSED by \u2588\u2588\u2588\u2588\u2588\u2588\u2588.',
        owner: 'B',
      },
    ],
  },
  {
    id: 3,
    slug: 'the-shift',
    title: 'The Shift',
    conversations: [
      {
        id: 'A',
        label: 'miriam, radio play',
        color: COLOR_A,
        icon: 'dispatcher',
      },
      {
        id: 'B',
        label: 'barry, circus',
        color: COLOR_B,
        icon: 'mother',
      },
      {
        id: 'C',
        label: 'roz, pet psychic',
        color: COLOR_C,
        icon: 'doctor',
      },
    ],
    lines: [
      { id: 1, text: 'The villain shoots. THEN the door slams.', owner: 'A' },
      { id: 2, text: 'I need the chimpanzee by Saturday.', owner: 'B' },
      { id: 3, text: 'Not DURING the kiss. My GOD.', owner: 'A' },
      {
        id: 4,
        text: 'Your canary wishes you to know he forgives you.',
        owner: 'C',
      },
      {
        id: 5,
        text: 'Cue the \u2588\u2588\u2588\u2588\u2588\u2588\u2588 at scene two, line forty.',
        owner: 'A',
      },
      { id: 6, text: 'Tails, yes. With a bow tie.', owner: 'B' },
      {
        id: 7,
        text: 'He says the \u2588\u2588\u2588\u2588\u2588\u2588 was not your fault.',
        owner: 'C',
      },
      { id: 8, text: 'Try to sound MORE SURPRISED this time.', owner: 'A' },
      {
        id: 9,
        text: "He's allergic to \u2588\u2588\u2588\u2588\u2588\u2588\u2588 now.",
        owner: 'B',
      },
      { id: 10, text: 'He is happy in the ethereal plane.', owner: 'C' },
      { id: 11, text: 'And please \u2014 NO raccoons.', owner: 'B' },
      {
        id: 12,
        text: 'He requests you stop singing. You are flat.',
        owner: 'C',
      },
    ],
  },
  {
    id: 4,
    slug: 'thursday',
    title: 'Thursday',
    conversations: [
      {
        id: 'A',
        label: "halling's haunted tv",
        color: COLOR_A,
        icon: 'caller',
      },
      {
        id: 'B',
        label: "okafor's library fine",
        color: COLOR_B,
        icon: 'school',
      },
    ],
    lines: [
      { id: 1, text: 'My television is HAUNTED.', owner: 'A' },
      { id: 2, text: 'I returned the book on TUESDAY.', owner: 'B' },
      { id: 3, text: 'At three in the morning. Every night.', owner: 'A' },
      {
        id: 4,
        text: 'A figure \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588 behind my sofa.',
        owner: 'A',
      },
      { id: 5, text: 'Two years overdue? IMPOSSIBLE.', owner: 'B' },
      {
        id: 6,
        text: 'I have \u2588\u2588\u2588\u2588\u2588\u2588 it off. Multiple times.',
        owner: 'A',
      },
      {
        id: 7,
        text: 'The book is \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588.',
        owner: 'B',
      },
      { id: 8, text: 'I am SEVENTY-TWO years old.', owner: 'B' },
      {
        id: 9,
        text: 'My wife REFUSES to sit alone in there now.',
        owner: 'A',
      },
      {
        id: 10,
        text: 'My \u2588\u2588\u2588\u2588 cannot be seventy-two dollars.',
        owner: 'B',
      },
    ],
  },
  {
    id: 5,
    slug: 'last-call',
    title: 'Last Call',
    conversations: [
      { id: 'A', label: 'the wedding cake', color: COLOR_A, icon: 'grocer' },
      { id: 'B', label: "nugget's funeral", color: COLOR_B, icon: 'law' },
    ],
    lines: [
      {
        id: 1,
        text: 'His name was \u2588\u2588\u2588\u2588\u2588\u2588. He was a hamster.',
        owner: 'B',
      },
      {
        id: 2,
        text: 'The \u2588\u2588\u2588\u2588\u2588 said three tiers, not four.',
        owner: 'A',
      },
      {
        id: 3,
        text: 'Fondant. Not \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588.',
        owner: 'A',
      },
      {
        id: 4,
        text: 'Closed \u2588\u2588\u2588\u2588\u2588\u2588.',
        owner: 'B',
      },
      {
        id: 5,
        text: 'Can we use his \u2588\u2588\u2588\u2588\u2588 as a centerpiece?',
        owner: 'B',
      },
      {
        id: 6,
        text: 'Sixty guests. \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588.',
        owner: 'A',
      },
      {
        id: 7,
        text: 'He loved \u2588\u2588\u2588\u2588\u2588\u2588. Specifically cheddar.',
        owner: 'B',
      },
      { id: 8, text: 'Lilies or roses. Not both.', owner: 'A' },
      {
        id: 9,
        text: 'We want a single lit candle. For \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588.',
        owner: 'B',
      },
      { id: 10, text: 'Just the family. He was our everything.', owner: 'B' },
    ],
  },
];

export const END_CARD = {
  top: "That's the night.",
  bottom: 'CROSSED WIRES \u00B7 LD59',
};
