import type { Level } from './types';

const COLOR_A = 'oklch(65% 0.18 40)';
const COLOR_B = 'oklch(55% 0.16 245)';
const COLOR_C = 'oklch(65% 0.13 150)';

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
      { id: 1, text: 'There is a goat on my lawn.', owner: 'A' },
      { id: 2, text: "Where's the Brighton shipment?", owner: 'B' },
      { id: 3, text: 'I do NOT own a goat.', owner: 'A' },
      { id: 4, text: 'Nobody signed for it.', owner: 'B' },
      { id: 5, text: "It's eating the rhododendrons.", owner: 'A' },
      { id: 6, text: 'Check the loading dock, not receiving.', owner: 'B' },
      { id: 7, text: 'Just send someone, please.', owner: 'A' },
      { id: 8, text: "Fine. I'll hold.", owner: 'B' },
    ],
  },
  {
    id: 2,
    slug: 'wednesday',
    title: 'Wednesday',
    conversations: [
      { id: 'A', label: 'the goat refund', color: COLOR_A, icon: 'insurance' },
      { id: 'B', label: 'ferret pamphlets', color: COLOR_B, icon: 'letter' },
    ],
    lines: [
      { id: 1, text: "The fainting goat didn't faint.", owner: 'A' },
      { id: 2, text: 'I never signed up for the ferret series.', owner: 'B' },
      { id: 3, text: 'We startled it three times already.', owner: 'A' },
      { id: 4, text: 'Volumes one THROUGH eleven.', owner: 'B' },
      {
        id: 5,
        text: 'A whistle, a saucepan, AND a thrown glove.',
        owner: 'A',
      },
      {
        id: 6,
        text: 'My husband thought it was a tuna subscription.',
        owner: 'B',
      },
      { id: 7, text: 'It stared at us like we were morons.', owner: 'A' },
      { id: 8, text: "I'm being harassed by CONTENT.", owner: 'B' },
      { id: 9, text: 'I want the full refund, with postage.', owner: 'A' },
      { id: 10, text: "I'm BEGGING you.", owner: 'B' },
    ],
  },
  {
    id: 3,
    slug: 'the-shift',
    title: 'The Shift',
    conversations: [
      {
        id: 'A',
        label: 'the radio play',
        color: COLOR_A,
        icon: 'dispatcher',
      },
      { id: 'B', label: 'the chimp act', color: COLOR_B, icon: 'mother' },
      { id: 'C', label: 'the taxidermist', color: COLOR_C, icon: 'neighbor' },
    ],
    lines: [
      { id: 1, text: 'Cue the gunshot at scene two.', owner: 'A' },
      { id: 2, text: 'I need the chimpanzee by Saturday.', owner: 'B' },
      { id: 3, text: 'The moose came in on Thursday.', owner: 'C' },
      { id: 4, text: 'Not during the kiss. Please.', owner: 'A' },
      { id: 5, text: 'Tails. With a bow tie.', owner: 'B' },
      { id: 6, text: 'The hunter lost the antlers somewhere.', owner: 'C' },
      {
        id: 7,
        text: 'Villain gets shot, falls, THEN the door slams.',
        owner: 'A',
      },
      {
        id: 8,
        text: "He doesn't have to talk. He just has to sit.",
        owner: 'B',
      },
      {
        id: 9,
        text: 'Mount it with a surprised expression.',
        owner: 'C',
      },
      { id: 10, text: 'Try to sound more surprised this time.', owner: 'A' },
      { id: 11, text: "And he's allergic to bananas now.", owner: 'B' },
      { id: 12, text: "Don't ask about the raccoon again.", owner: 'C' },
    ],
  },
  {
    id: 4,
    slug: 'thursday',
    title: 'Thursday',
    conversations: [
      { id: 'A', label: 'the UFO report', color: COLOR_A, icon: 'dispatcher' },
      { id: 'B', label: 'the gnomes', color: COLOR_B, icon: 'neighbor' },
    ],
    lines: [
      { id: 1, text: 'Lights. Over the barn. Around two a.m.', owner: 'A' },
      {
        id: 2,
        text: 'The gnome was facing north yesterday.',
        owner: 'B',
      },
      { id: 3, text: 'They hovered. Then they were gone.', owner: 'A' },
      { id: 4, text: 'Now he is facing the pond.', owner: 'B' },
      {
        id: 5,
        text: "I'm not crazy. Come and look.",
        owner: 'A',
      },
      { id: 6, text: 'There are SEVEN of them. SEVEN.', owner: 'B' },
      {
        id: 7,
        text: 'The cows stopped chewing. All at once.',
        owner: 'A',
      },
      {
        id: 8,
        text: 'My wife refuses to go out back anymore.',
        owner: 'B',
      },
      { id: 9, text: 'I have photographs. Blurry ones.', owner: 'A' },
      { id: 10, text: 'One is wearing a different HAT now.', owner: 'B' },
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
      { id: 1, text: 'The groom said three tiers, not four.', owner: 'A' },
      { id: 2, text: 'His name was Nugget. He was a hamster.', owner: 'B' },
      { id: 3, text: 'Fondant. Not buttercream.', owner: 'A' },
      { id: 4, text: 'Closed casket, obviously.', owner: 'B' },
      { id: 5, text: 'Just the family. She was adamant.', owner: 'A' },
      {
        id: 6,
        text: 'Can we use his wheel as a centerpiece?',
        owner: 'B',
      },
      { id: 7, text: 'Sixty guests, approximately.', owner: 'A' },
      { id: 8, text: 'He loved cheese. Specifically cheddar.', owner: 'B' },
      {
        id: 9,
        text: 'Lilies or roses. Definitely not both.',
        owner: 'A',
      },
      {
        id: 10,
        text: 'We want a single lit candle. For dignity.',
        owner: 'B',
      },
    ],
  },
];

export const END_CARD = {
  top: "That's the night.",
  bottom: 'CROSSED WIRES \u00B7 LD59',
};
