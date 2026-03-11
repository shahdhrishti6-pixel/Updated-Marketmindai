
// Fix: Added React import to resolve the 'Cannot find namespace React' error
import React from 'react';

export interface MarketingTool {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
}

export interface Template {
  id: string;
  title: string;
  category: 'Copywriting' | 'Strategy' | 'Design & Content' | 'Client Management';
  content: string;
}

export interface InsightMetric {
  name: string;
  fullName: string;
  description: string;
  value: string;
  trend: string;
  visualData: number[];
}
