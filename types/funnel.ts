// Core types for the Funnel Builder system

// ===========================
// Component Types
// ===========================

export type ComponentType =
  | 'headline'
  | 'paragraph'
  | 'button'
  | 'image'
  | 'video'
  | 'timer'
  | 'progressbar'
  | 'input'
  | 'loading'
  | 'carousel';

// Base component interface
export interface BaseComponent {
  id: string;
  type: ComponentType;
  order: number;
}

// Headline component
export interface HeadlineComponent extends BaseComponent {
  type: 'headline';
  data: {
    text: string;
    fontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    bold?: boolean;
    italic?: boolean;
    align?: 'left' | 'center' | 'right';
    color?: string;
  };
}

// Paragraph component
export interface ParagraphComponent extends BaseComponent {
  type: 'paragraph';
  data: {
    text: string;
    fontSize?: 'sm' | 'base' | 'lg';
    align?: 'left' | 'center' | 'right';
    color?: string;
  };
}

// Button component
export interface ButtonComponent extends BaseComponent {
  type: 'button';
  data: {
    text: string;
    action: 'goto_step' | 'submit' | 'external_link';
    targetStepId?: string; // For goto_step action
    targetUrl?: string; // For external_link action
    style?: {
      variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
      size?: 'sm' | 'md' | 'lg';
      fullWidth?: boolean;
      bgColor?: string;
      textColor?: string;
    };
  };
}

// Image component
export interface ImageComponent extends BaseComponent {
  type: 'image';
  data: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    objectFit?: 'cover' | 'contain' | 'fill';
  };
}

// Video component
export interface VideoComponent extends BaseComponent {
  type: 'video';
  data: {
    url: string; // YouTube, Vimeo, or direct video URL
    provider?: 'youtube' | 'vimeo' | 'direct';
    autoplay?: boolean;
    controls?: boolean;
  };
}

// Timer component (for scarcity/urgency)
export interface TimerComponent extends BaseComponent {
  type: 'timer';
  data: {
    duration: number; // in seconds
    format?: 'MM:SS' | 'HH:MM:SS';
    onComplete?: 'goto_step' | 'hide';
    targetStepId?: string;
    label?: string;
  };
}

// Progress Bar component
export interface ProgressBarComponent extends BaseComponent {
  type: 'progressbar';
  data: {
    showPercentage?: boolean;
    color?: string;
    height?: 'sm' | 'md' | 'lg';
  };
}

// Input component
export interface InputComponent extends BaseComponent {
  type: 'input';
  data: {
    inputType: 'text' | 'email' | 'tel' | 'number';
    label?: string;
    placeholder?: string;
    required?: boolean;
    fieldName: string; // For data collection
  };
}

// Loading component (fake loading animation)
export interface LoadingComponent extends BaseComponent {
  type: 'loading';
  data: {
    duration: number; // in seconds
    messages?: string[]; // e.g., ["Analyzing...", "Processing..."]
    targetStepId: string; // Auto-redirect after duration
  };
}

// Carousel component (for multiple choice with images)
export interface CarouselComponent extends BaseComponent {
  type: 'carousel';
  data: {
    options: Array<{
      id: string;
      image: string;
      label: string;
      targetStepId?: string;
    }>;
  };
}

// Union type for all components
export type FunnelComponentData =
  | HeadlineComponent
  | ParagraphComponent
  | ButtonComponent
  | ImageComponent
  | VideoComponent
  | TimerComponent
  | ProgressBarComponent
  | InputComponent
  | LoadingComponent
  | CarouselComponent;

// ===========================
// Funnel & Step Types
// ===========================

export interface FunnelTheme {
  primaryColor: string;
  fontFamily?: string;
  textColor?: string;

  page: {
    type: 'color' | 'image';
    value: string;
    overlayOpacity?: number;
    customCss?: string;
  };

  container: {
    show?: boolean;
    backgroundColor: string;
    opacity?: number;
    blur?: number;
    borderRadius: string;
    shadow: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  };

  progressBar?: {
    show?: boolean;
    color?: string;
  };

  logo?: {
    url?: string;
    height?: number;
  };
}

export interface FunnelSettings {
  showProgressBar?: boolean;
  collectEmail?: boolean;
  redirectOnComplete?: string;
}

export interface StepSettings {
  backgroundColor?: string;
  backgroundImage?: string;
  padding?: 'sm' | 'md' | 'lg';
  maxWidth?: 'sm' | 'md' | 'lg' | 'full';
}

// ===========================
// Visitor & Analytics Types
// ===========================

export interface UTMParams {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
}

export interface VisitorData {
  email?: string;
  name?: string;
  phone?: string;
  [key: string]: any; // Additional custom fields
}

export interface EventData {
  buttonText?: string;
  targetStep?: string;
  fieldName?: string;
  value?: any;
  [key: string]: any;
}

export type EventType = 'view' | 'click' | 'input' | 'submit' | 'complete';

// ===========================
// Builder State Types
// ===========================

export interface BuilderState {
  currentFunnelId: string | null;
  currentStepId: string | null;
  selectedComponentId: string | null;
  components: FunnelComponentData[];
  isDragging: boolean;
  canUndo: boolean;
  canRedo: boolean;
}

// ===========================
// Analytics Types
// ===========================

export interface VisitorRow {
  sessionId: string;
  startedAt: Date;
  isLead: boolean;
  isConverted: boolean;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  steps: Record<string, string>; // stepId -> interaction value
}

export interface FunnelMetrics {
  totalVisits: number;
  totalLeads: number;
  conversionRate: number;
  avgTimeOnFunnel: number;
}
