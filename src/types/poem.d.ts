export interface Sentence {
  senid: number;
  content: string;
}

export interface Poem {
  id: string;
  title: string;
  author: string;
  sentence: Sentence[];
}

export interface TranslatedPoem {
  id: string;
  sentence: Sentence[];
}

export interface PoemOption {
  value: string;
  label: string;
  isCorrect: boolean;
} 