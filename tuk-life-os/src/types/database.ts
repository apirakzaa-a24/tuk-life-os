export type ModuleKey = 'dashboard'|'finance'|'health'|'travel'|'vehicle'|'fitness'|'work'|'machine'|'learning'|'home'|'family'|'goals'|'habits'|'winfile'|'notes'|'shopping'|'documents'|'reminders';
export type Priority = 'low'|'medium'|'high'|'critical';
export type Status = 'planned'|'active'|'waiting'|'done'|'paused'|'archived';
export type RecordKind = 'transaction'|'goal'|'task'|'log'|'asset'|'document'|'reminder'|'plan'|'metric'|'checklist'|'note';
export interface SubModule { key:string; label:string; description:string; examples:string[]; suggestedFields:string[]; linksTo?:ModuleKey[]; }
export interface ModuleDefinition { key:ModuleKey; label:string; icon:string; purpose:string; color:string; subModules:SubModule[]; }
export interface LifeRecord { id:string; module:ModuleKey; subModule:string; kind:RecordKind; title:string; detail:string; date:string; dueDate?:string; amount?:number; targetAmount?:number; unit?:string; currency?:string; progress?:number; priority:Priority; status:Status; tags:string[]; linkedTo?:{module:ModuleKey; recordId?:string; note?:string}[]; fields:Record<string,string|number|boolean>; createdAt:string; updatedAt:string; }
export interface AppDatabase { version:string; profile:{name:string; owner:string; updatedAt:string}; settings:{theme:'dark'; currency:'THB'; syncReady:boolean; appMode:'local-first-enterprise'}; records:LifeRecord[]; }
export interface DashboardSummary { total:number; active:number; waiting:number; done:number; critical:number; financeNet:number; financeExpense:number; financeIncome:number; healthMetrics:number; travelPlans:number; vehicleItems:number; goals:number; }
