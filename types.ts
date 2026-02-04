
export enum SkillLevel {
  BEGINNER = '初級',
  INTERMEDIATE = '中級',
  ADVANCED = '上級',
}

export enum PlayerCount {
  SOLO = '1人 (自主練)',
  PAIR = '2人',
  SMALL_GROUP = '3-4人',
  LARGE_GROUP = '5人以上',
}

export enum FocusArea {
  FOOTWORK = 'フットワーク',
  NET_PLAY = 'ネットプレー',
  SMASH_DRIVE = 'スマッシュ・ドライブ',
  STAMINA = 'スタミナ・体力',
  TACTICS = '戦術・配球',
  ALL_ROUND = '総合練習',
}

export interface Drill {
  name: string;
  duration: number;
  description: string;
  keyPoints: string[];
  category?: FocusArea;
  level?: string; // ドリルごとの推奨レベル
  videoUrl?: string;
}

export interface PracticeMenu {
  title: string;
  level?: string; // メニュー全体の対象レベル
  totalDuration: number;
  intensityScore: number; // 1 to 10
  drills: Drill[];
  coachingAdvice: string;
  intensityDistribution: {
    category: string;
    percentage: number;
  }[];
}

export interface PracticeSettings {
  levels: string[];
  players: number;
  duration: number; // minutes
  focusAreas: FocusArea[];
  courts: number;
}
