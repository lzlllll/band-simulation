export interface CharacterCreationData {
  bandName: string;
  bandStyle: string;
  bandMotto: string;
  bandHistory: string;
  playerName: string;
  playerAge: number;
  playerGender: string;
  playerRole: string;
  playerAvatar: string;
  playerAppearance: string;
  playerPersonality: string;
  playerBackground: string;
  playerSkills: { name: string; level: number; description?: string }[];
  members: {
    name: string;
    role: string;
    age: number;
    avatar: string;
    skills: { name: string; level: number; description?: string }[];
    personality?: string;
    signature?: string;
    bio?: string;
  }[];
  customPrompt: string;
}

export interface GeneratedOpening {
  bandName: string;
  motto: string;
  styles: { style: string; level: number; color: string }[];
  player: {
    name: string;
    age: number;
    gender: string;
    role: string;
    avatar: string;
    bio: string;
    appearance: string;
    personality: string;
    skills: { name: string; level: number; description?: string }[];
    mood: number;
  };
  members: {
    name: string;
    age: number;
    role: string;
    avatar: string;
    skills: { name: string; level: number; description?: string }[];
    cohesion: number;
    mood: number;
    salary: number;
    bio: string;
    signature: string;
    personality?: string;
  }[];
  openingNarrative: string;
}
