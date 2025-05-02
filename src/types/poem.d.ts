export interface Poem {
  id: string;
  title: string;
  author: string;
  content: string[];
  translation?: {
    english?: string[];
    french?: string[];
    german?: string[];
    japanese?: string[];
    spanish?: string[];
  };
}

export interface PoemOption {
  value: string;
  label: string;
  isCorrect: boolean;
} 