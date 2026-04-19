export type ConversationId = 'A' | 'B' | 'C';

export type Line = {
  id: number;
  text: string;
  owner: ConversationId;
};

export type Conversation = {
  id: ConversationId;
  label: string;
  color: string;
  icon?: string;
};

export type Level = {
  id: number;
  slug: string;
  title: string;
  epigraph?: string;
  conversations: Conversation[];
  lines: Line[];
  postamble?: string;
};

export type GameState = {
  levelIndex: number;
  assignments: Map<number, ConversationId | null>;
  solved: boolean;
  muted: boolean;
};

export type Screen = 'menu' | 'level' | 'end';
