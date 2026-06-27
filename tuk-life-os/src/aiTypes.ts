import type { ModuleKey, RecordKind } from './types/database';

export type AIModuleTarget = Exclude<ModuleKey, 'dashboard'>;

export type AIInputType =
  | 'chat'
  | 'voice'
  | 'camera'
  | 'photo'
  | 'file'
  | 'scan'
  | 'vision'
  | 'calculator'
  | 'command'
  | 'quick-action';

export type AIRecordKind = RecordKind | 'analysis';

export type AttachmentKind = 'image' | 'document' | 'text' | 'other';

export interface AIAttachment {
  id: string;
  name: string;
  type: string;
  kind: AttachmentKind;
  size: number;
  originalSize?: number;
  compressedSize?: number;
  compressionRatio?: number;
  dataUrl?: string;
  thumbnail?: string;
  textContent?: string;
  createdAt: string;
}

export interface AIExtractionField {
  key: string;
  label: string;
  value: string | number;
  confidence: number;
}

export interface AIAnalysisResult {
  targetModule: AIModuleTarget;
  kind: AIRecordKind;
  title: string;
  summary: string;
  aiSummary: string;
  suggestedAction: string;
  amount?: number;
  unit?: string;
  tags: string[];
  confidence: number;
  extractedFields: AIExtractionField[];
}

export interface AIEntry extends AIAnalysisResult {
  id: string;
  createdAt: string;
  updatedAt: string;
  inputType: AIInputType;
  originalText: string;
  linkedTo?: string[];
  attachments: AIAttachment[];
  attachmentName?: string;
  attachmentPreview?: string;
  savedToModule?: AIModuleTarget;
  savedRecordId?: string;
}

export interface AIQuickCommandResult extends AIAnalysisResult {}
