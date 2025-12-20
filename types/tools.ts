export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
}

export interface ToolCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  tools: Tool[];
}

export type CategoryId = 
  | 'video'
  | 'audio'
  | 'image'
  | 'document-processing'
  | 'document-conversion'
  | 'data-charts'
  | 'smart-text'
  | 'office-assistant'
  | 'text'
  | 'number'
  | 'encryption'
  | 'unit-conversion';
