import type { Level } from './types';

const COLOR_A = 'oklch(58% 0.14 40)';
const COLOR_B = 'oklch(48% 0.12 235)';
const COLOR_C = 'oklch(55% 0.08 135)';

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
      { id: 3, text: "No, it's not MY goat.", owner: 'A' },
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
      { id: 'A', label: 'the theater', color: COLOR_A, icon: 'letter' },
      { id: 'B', label: 'the taxidermist', color: COLOR_B, icon: 'grocer' },
    ],
    lines: [
      { id: 1, text: 'I need the chimpanzee for Saturday.', owner: 'A' },
      { id: 2, text: 'The moose came in Thursday.', owner: 'B' },
      { id: 3, text: 'Tails, yes. With a bow tie.', owner: 'A' },
      { id: 4, text: 'No, the hunter lost the antlers.', owner: 'B' },
      { id: 5, text: "He doesn't have to talk. Just sit.", owner: 'A' },
      {
        id: 6,
        text: 'We can mount it with a surprised expression.',
        owner: 'B',
      },
      { id: 7, text: 'Tell Boris: still no makeup.', owner: 'A' },
      { id: 8, text: 'Pickup is cash only.', owner: 'B' },
      { id: 9, text: "And he's allergic to bananas now.", owner: 'A' },
      { id: 10, text: "Don't ask about the raccoon again.", owner: 'B' },
    ],
  },
  {
    id: 3,
    slug: 'the-shift',
    title: 'The Shift',
    conversations: [
      {
        id: 'A',
        label: 'the radio producer',
        color: COLOR_A,
        icon: 'dispatcher',
      },
      { id: 'B', label: 'the parakeet', color: COLOR_B, icon: 'mother' },
      { id: 'C', label: 'the laundry', color: COLOR_C, icon: 'neighbor' },
    ],
    lines: [
      { id: 1, text: 'Cue the gunshot at scene two.', owner: 'A' },
      { id: 2, text: 'Since Tuesday. Non-stop.', owner: 'B' },
      { id: 3, text: "I didn't even EAT beets that week.", owner: 'C' },
      { id: 4, text: 'Not during the kiss. Please.', owner: 'A' },
      { id: 5, text: "No, it doesn't speak words.", owner: 'B' },
      { id: 6, text: 'The shirt was navy when it came in.', owner: 'C' },
      { id: 7, text: 'Villain gets shot, falls, THEN door slams.', owner: 'A' },
      { id: 8, text: 'It just whistles the same tune.', owner: 'B' },
      { id: 9, text: 'Are you saying the stain is structural?', owner: 'C' },
      { id: 10, text: 'Try to sound more surprised this time.', owner: 'A' },
      { id: 11, text: "I think it's \u201CClair de Lune.\u201D", owner: 'B' },
      { id: 12, text: 'Forget it. Keep the shirt.', owner: 'C' },
    ],
  },
  {
    id: 4,
    slug: 'thursday',
    title: 'Thursday',
    conversations: [
      { id: 'A', label: 'the goat refund', color: COLOR_A, icon: 'insurance' },
      { id: 'B', label: 'the ferret pamphlet', color: COLOR_B, icon: 'letter' },
    ],
    lines: [
      { id: 1, text: "The fainting goat didn't faint.", owner: 'A' },
      { id: 2, text: 'I never signed up for the ferret series.', owner: 'B' },
      { id: 3, text: 'We startled it three separate times.', owner: 'A' },
      { id: 4, text: 'Volumes one THROUGH eleven.', owner: 'B' },
      {
        id: 5,
        text: 'A whistle, a saucepan, AND a thrown glove.',
        owner: 'A',
      },
      {
        id: 6,
        text: 'My husband signed the postcard. He thought it was tuna.',
        owner: 'B',
      },
      {
        id: 7,
        text: 'It looked at us. It did NOT faint.',
        owner: 'A',
      },
      { id: 8, text: 'Just stop sending them. Please.', owner: 'B' },
      { id: 9, text: 'I want the full refund. With the postage.', owner: 'A' },
      { id: 10, text: "I'm BEGGING.", owner: 'B' },
    ],
  },
  {
    id: 5,
    slug: 'last-call',
    title: 'Last Call',
    conversations: [
      { id: 'A', label: 'the wedding cake', color: COLOR_A, icon: 'grocer' },
      { id: 'B', label: 'the stolen mailbox', color: COLOR_B, icon: 'law' },
    ],
    lines: [
      { id: 1, text: 'The groom said three tiers, not four.', owner: 'A' },
      { id: 2, text: 'Someone stole my mailbox.', owner: 'B' },
      { id: 3, text: 'Yes, the fourth tier is in the van.', owner: 'A' },
      { id: 4, text: 'No, the whole post too.', owner: 'B' },
      { id: 5, text: 'We cannot simply un-bake it.', owner: 'A' },
      { id: 6, text: 'Yes, I checked the hedge. Twice.', owner: 'B' },
      {
        id: 7,
        text: "Tell her we'll knock off ten dollars.",
        owner: 'A',
      },
      { id: 8, text: "I don't have enemies. I don't THINK.", owner: 'B' },
      { id: 9, text: 'And a box for the extra tier.', owner: 'A' },
      { id: 10, text: 'Just come look at the hole.', owner: 'B' },
    ],
  },
];

export const END_CARD = {
  top: "That's the night.",
  bottom: 'CROSSED WIRES \u00B7 LD59',
};
