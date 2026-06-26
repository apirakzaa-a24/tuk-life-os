export type ModuleKey =
  | 'dashboard'
  | 'life'
  | 'timeline'
  | 'calendar'
  | 'health'
  | 'finance'
  | 'vehicle'
  | 'work'
  | 'ai'
  | 'settings';

export type Metric = {
  label: string;
  value: string;
  helper: string;
  icon: string;
  tone?: 'blue' | 'green' | 'orange' | 'pink' | 'purple' | 'red' | 'cyan';
};

export type TimelineItem = {
  time: string;
  title: string;
  detail: string;
  category: string;
};

export type Vehicle = {
  name: string;
  plate?: string;
  nextService: string;
  costThisMonth: string;
  status: string;
};

export type FinanceItem = {
  name: string;
  amount: string;
  type: 'income' | 'expense' | 'debt' | 'asset';
};

export type WorkItem = {
  title: string;
  machine: string;
  status: string;
  priority: 'สูง' | 'กลาง' | 'ต่ำ';
};
