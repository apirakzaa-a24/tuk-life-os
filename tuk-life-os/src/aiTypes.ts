export type AIModuleTarget =
  | 'dashboard'
  | 'finance'
  | 'health'
  | 'fitness'
  | 'travel'
  | 'vehicle'
  | 'work'
  | 'machine'
  | 'learning'
  | 'home'
  | 'family'
  | 'goals'
  | 'habits'
  | 'winfile'
  | 'notes'
  | 'shopping'
  | 'documents'
  | 'reminders';

export type AIInputType = 'chat' | 'voice' | 'photo' | 'calculator' | 'command';

export type AIRecordKind = 'note' | 'task' | 'goal' | 'transaction' | 'metric' | 'plan' | 'reminder' | 'analysis';

export interface AIEntry {
  id: string;
  createdAt: string;
  updatedAt: string;
  inputType: AIInputType;
  targetModule: AIModuleTarget;
  kind: AIRecordKind;
  title: string;
  originalText: string;
  aiSummary: string;
  suggestedAction: string;
  amount?: number;
  unit?: string;
  tags: string[];
  linkedTo?: string[];
  attachmentName?: string;
  attachmentPreview?: string;
}

export interface AIQuickCommandResult {
  targetModule: AIModuleTarget;
  kind: AIRecordKind;
  title: string;
  summary: string;
  suggestedAction: string;
  amount?: number;
  unit?: string;
  tags: string[];
}
