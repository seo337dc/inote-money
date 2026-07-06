export interface Transaction {
  id: string;
  date: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  rawNote: string;
}

export type LoaderStyle = 'glassmorphic' | 'minimal-memo' | 'organic-flow';

export interface LoaderConfig {
  style: LoaderStyle;
  primaryColor: string;
  brandName: string;
  speedMultiplier: number;
  showParticles: boolean;
  autoDismiss: boolean;
  dismissDelay: number;
  customMessages: string[];
}
