
export enum SkillLevel {
  BEGINNER = '初級',
  INTERMEDIATE = '中級',
  ADVANCED = '上級',
}

export enum FocusArea {
  FOOTWORK = 'フットワーク',
  NET_PLAY = 'ネットプレー',
  SMASH_DRIVE = 'スマッシュ・ドライブ',
  STAMINA = 'スタミナ・体力',
  TACTICS = '戦術・配球',
  ALL_ROUND = '総合練習',
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Drill {
  name: string;
  duration: number;
  description: string;
  keyPoints: string[];
  category?: FocusArea;
  level?: string;
  videoUrl?: string;
}

export interface PracticeMenu {
  title: string;
  level?: string;
  totalDuration: number;
  intensityScore: number;
  drills: Drill[];
  coachingAdvice: string;
  intensityDistribution: {
    category: string;
    percentage: number;
  }[];
}

export interface SavedMenu extends PracticeMenu {
  id: string;
  savedAt: number;
}

export interface Friend {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'offline';
}

export interface ChatAttachment {
  type: 'menu' | 'drill';
  data: any;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text?: string;
  attachment?: ChatAttachment;
  timestamp: number;
  isRead: boolean;
}

export interface PracticeSettings {
  levels: string[];
  players: number;
  duration: number;
  focusAreas: FocusArea[];
  courts: number;
}
