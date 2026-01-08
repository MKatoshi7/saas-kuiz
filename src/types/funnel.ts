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
  | 'audio'
  | 'timer'
  | 'progressbar'
  | 'input'
  | 'slider'
  | 'loading'
  | 'carousel'
  | 'quiz-option'
  | 'alert'
  | 'testimonial'
  | 'pricing'
  | 'spacer'
  | 'code'
  | 'argument'
  | 'faq'
  | 'footer'
  // NEW: Phase 2 Components
  | 'social-share'
  | 'poll'
  | 'notification'
  | 'animated-counter'
  | 'confetti'
  | 'vsl-video';

export type ActionType = 'next_step' | 'jump_to_step' | 'submit_funnel' | 'open_url';

export interface ComponentStyle {
  backgroundColor?: string;
  textColor?: string;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shadowColor?: string;
  animation?: 'none' | 'pulse' | 'bounce' | 'wiggle' | 'glow' | 'pulse-fast';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  border?: string;
  borderColor?: string;
}

// Base component interface
export interface BaseComponent {
  id: string;
  type: ComponentType;
  order: number;
  style?: ComponentStyle;
}

// Headline component
export interface HeadlineComponent extends BaseComponent {
  type: 'headline';
  data: {
    text: string;
    tag?: 'h1' | 'h2' | 'h3' | 'p';
    fontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'small' | 'normal' | 'medium' | 'big' | 'bigger' | 'huge';
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    align?: 'left' | 'center' | 'right' | 'justify';
    color?: string;
    backgroundColor?: string;
    variableName?: string;
    // NEW: Phase 1 Enhancements
    letterSpacing?: 'tighter' | 'tight' | 'normal' | 'wide' | 'wider' | 'widest';
    lineHeight?: 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose';
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    dropShadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    textStroke?: {
      width?: number;
      color?: string;
    };
  };
}

// Paragraph component
export interface ParagraphComponent extends BaseComponent {
  type: 'paragraph';
  data: {
    text: string;
    tag?: 'h1' | 'h2' | 'h3' | 'p';
    fontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'small' | 'normal' | 'medium' | 'big' | 'bigger' | 'huge';
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    align?: 'left' | 'center' | 'right' | 'justify';
    color?: string;
    backgroundColor?: string;
    variableName?: string;
    // NEW: Phase 1 Enhancements
    letterSpacing?: 'tighter' | 'tight' | 'normal' | 'wide' | 'wider' | 'widest';
    lineHeight?: 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose';
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    dropShadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    textStroke?: {
      width?: number;
      color?: string;
    };
  };
}

export interface ButtonComponent extends BaseComponent {
  type: 'button';
  data: {
    text: string;
    action: ActionType;
    targetStepId?: string; // For jump_to_step action
    targetUrl?: string; // For open_url action
    delay?: number; // Delay in seconds before button appears
    styles?: {
      backgroundColor?: string;
      textColor?: string;
      borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
      shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '3d' | 'glow';
      fullWidth?: boolean;
      animation?: 'none' | 'pulse' | 'pop' | 'bounce' | 'gradient' | 'shake';
      animationSpeed?: 'slow' | 'normal' | 'fast';
      variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
      size?: 'sm' | 'md' | 'lg';
    };
    variableName?: string;
  };
}

// Image component
export interface ImageComponent extends BaseComponent {
  type: 'image';
  data: {
    src?: string;
    alt?: string;
    width?: string; // e.g., '100%', '50%', '300px'
    publicId?: string; // Cloudinary public ID
    variableName?: string;
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
    aspectRatio?: '16:9' | '9:16' | '4:3' | '1:1';
    publicId?: string; // Cloudinary public ID
    variableName?: string;
  };
}

// VSL Video component (Video Sales Letter)
export interface VSLVideoComponent extends BaseComponent {
  type: 'vsl-video';
  data: {
    url: string;
    thumbnailUrl?: string;
    autoPlay?: boolean;
    loop?: boolean;
    showProgressBar?: boolean;
    progressBarColor?: string;
    playButtonText?: string;
    playButtonColor?: string;
    restartOnClick?: boolean;
    unmuteOnClick?: boolean;
    fakeProgress?: boolean; // If true, progress bar moves faster to give impression of speed
    fakeProgressDuration?: number; // Duration in seconds for the fake progress
    publicId?: string; // Cloudinary public ID
    variableName?: string;
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
    inputType: 'text' | 'email' | 'tel' | 'number' | 'date' | 'textarea';
    label?: string;
    placeholder?: string;
    required?: boolean;
    variableName: string; // For data collection (e.g., "user_email")
    mask?: string; // For phone/custom masks
  };
}

// Loading component (fake loading animation)
export interface LoadingComponent extends BaseComponent {
  type: 'loading';
  data: {
    headline?: string; // Texto principal (ex: "Analisando seu perfil...")
    subheadline?: string; // Texto de apoio (ex: "Isso pode levar alguns segundos")
    endText?: string; // Texto quando chega em 100% (ex: "Concluído!")
    duration: number; // Tempo em milissegundos (ex: 3000ms = 3s)
    barColor?: string; // Cor da barra preenchida
    trackColor?: string; // Cor do fundo da barra
    textColor?: string; // Cor dos textos
    height?: 'sm' | 'md' | 'lg'; // Altura da barra
    rounded?: 'none' | 'md' | 'full'; // Arredondamento
    showPercentage?: boolean; // Mostrar porcentagem
    messages?: string[]; // Mensagens dinâmicas (opcional, 3-4 mensagens que aparecem em sequência)
    actionType?: 'next_step' | 'open_url' | 'jump_to_step'; // Ação ao finalizar
    targetUrl?: string; // URL para redirecionar
    nextStepId?: string; // Auto-redirect após finalizar (usado para jump_to_step)
    variableName?: string;
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
    variableName?: string;
  };
}

// Quiz Option component (List of choices with Emoji/Image)
// Quiz Option component (List of choices with Emoji/Image)
export interface QuizOptionItem {
  id: string;
  label: string;
  imageSrc?: string;
  emoji?: string;
  value: string;
  points: number;
  targetStepId: 'next_step' | string;
}

export interface QuizOptionComponent extends BaseComponent {
  type: 'quiz-option';
  data: {
    question?: string;
    layout?: 'list' | 'grid' | 'cards';
    variableName?: string;
    options: QuizOptionItem[];
    allowMultiple?: boolean;
    required?: boolean;
    disableAutoAdvance?: boolean;
    checkPosition?: 'left' | 'right';
    emojiPosition?: 'left' | 'right';
    showCheck?: boolean;
    showEmoji?: boolean;
    buttonStyle?: 'solid' | 'outline' | 'ghost' | '3d' | 'shadow-sm' | 'shadow-md' | 'shadow-lg';
    backgroundColor?: string;
    textColor?: string;
    spacing?: number;
    borderRadius?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    fontSize?: 'sm' | 'md' | 'lg' | 'xl';
  };
}

// Audio component
export interface AudioComponent extends BaseComponent {
  type: 'audio';
  data: {
    url: string;
    autoplay?: boolean;
    loop?: boolean;
    avatarUrl?: string;
    senderName?: string;
    playerStyle?: 'whatsapp' | 'mp3' | 'modern' | 'simple'; // Estilo do player
    variableName?: string;
  };
}

// Slider component (Height, Weight, Level)
export interface SliderComponent extends BaseComponent {
  type: 'slider';
  data: {
    label: string;
    min: number;
    max: number;
    step?: number;
    unit?: string; // "cm", "kg", "%"
    defaultValue?: number;
    variableName: string;
  };
}

// Alert component (Attention/Warning)
export interface AlertComponent extends BaseComponent {
  type: 'alert';
  data: {
    text: string;
    variant: 'warning' | 'danger' | 'info' | 'success';
    type?: 'warning' | 'danger' | 'info' | 'success'; // Alias for variant
    title?: string;
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
    variableName?: string;
    icon?: string; // Emoji or icon name
    iconPosition?: 'left' | 'top';
    animation?: 'none' | 'pulse' | 'shake' | 'bounce';
    style?: 'solid' | 'outline' | 'left-border' | 'subtle';
  };
}

// Testimonial component
export interface TestimonialComponent extends BaseComponent {
  type: 'testimonial';
  data: {
    text: string;
    author: string;
    role?: string;
    avatarUrl?: string;
    stars?: number;
    variableName?: string;
  };
}

// Pricing component
export interface PricingComponent extends BaseComponent {
  type: 'pricing';
  data: {
    title: string;
    price: string;
    originalPrice?: string;
    description?: string;
    features: string[];
    buttonText: string;
    buttonUrl?: string; // URL de redirecionamento ao clicar
    layout?: 'vertical' | 'compact';
    variant?: 'default' | 'minimal' | 'cards' | 'highlight' | 'flat';
    badge?: string;
    discount?: string;
    condition?: string;
    recommended?: boolean;
    highlightColor?: string;
    variableName?: string;
  };
}

// Spacer component
export interface SpacerComponent extends BaseComponent {
  type: 'spacer';
  data: {
    height: number; // pixels
  };
}

// Code component (Script/Pixel)
export interface CodeComponent extends BaseComponent {
  type: 'code';
  data: {
    code: string;
    position?: 'head' | 'body'; // For scripts
  };
}

// Argument component
export interface ArgumentItem {
  id: string;
  title: string;
  description: string;
  imageSrc?: string;
}

export interface ArgumentComponent extends BaseComponent {
  type: 'argument';
  data: {
    headline?: string;
    items: ArgumentItem[];
    layout?: '2-columns' | '3-columns' | 'list';
    displayMode?: 'text-image' | 'text-only' | 'image-only';
    variableName?: string;
    imagePosition?: 'top' | 'bottom' | 'side' | 'side-right';
    headlineColor?: string;
    textColor?: string;
  };
}

// FAQ component
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface FAQComponent extends BaseComponent {
  type: 'faq';
  data: {
    headline?: string;
    items: FAQItem[];
    layout?: 'accordion' | 'list';
    width?: string;
    variableName?: string;
  };
}

// Footer component
export interface FooterComponent extends BaseComponent {
  type: 'footer';
  data: {
    text: string; // Copyright text
    links?: Array<{ id: string; label: string; url: string }>;
    socialLinks?: Array<{ id: string; platform: 'instagram' | 'facebook' | 'twitter' | 'youtube' | 'linkedin'; url: string }>;
    backgroundColor?: string;
    textColor?: string;
  };
}

// Social Share component
export interface SocialShareComponent extends BaseComponent {
  type: 'social-share';
  data: {
    title?: string;
    description?: string;
    url?: string;
    hashtags?: string[];
    showCounts?: boolean;
    platforms?: ('facebook' | 'twitter' | 'linkedin' | 'whatsapp' | 'email' | 'copy')[];
    layout?: 'horizontal' | 'vertical' | 'grid';
    buttonStyle?: 'solid' | 'outline' | 'minimal';
    size?: 'sm' | 'md' | 'lg';
  };
}

// Interactive Poll component
export interface PollComponent extends BaseComponent {
  type: 'poll';
  data: {
    question: string;
    options: Array<{
      id: string;
      text: string;
      votes?: number;
      color?: string;
    }>;
    allowMultiple?: boolean;
    showResults?: 'always' | 'after-vote' | 'never';
    showPercentages?: boolean;
    showVoteCount?: boolean;
    totalVotes?: number;
    animateResults?: boolean;
    theme?: 'default' | 'gradient' | 'minimal';
  };
}

// Notification component
export interface NotificationComponent extends BaseComponent {
  type: 'notification';
  data: {
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message?: string;
    duration?: number;
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    showCloseButton?: boolean;
    icon?: boolean;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
}

// Animated Counter component
export interface AnimatedCounterComponent extends BaseComponent {
  type: 'animated-counter';
  data: {
    start?: number;
    end: number;
    duration?: number;
    decimals?: number;
    prefix?: string;
    suffix?: string;
    separator?: string;
    formatAsCurrency?: boolean;
    currency?: string;
    fontSize?: 'small' | 'normal' | 'medium' | 'big' | 'bigger' | 'huge';
    align?: 'left' | 'center' | 'right';
    color?: string;
    fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
    animateOnScroll?: boolean;
  };
}

// Confetti component
export interface ConfettiComponent extends BaseComponent {
  type: 'confetti';
  data: {
    trigger?: 'auto' | 'manual' | 'on-scroll';
    duration?: number;
    particleCount?: number;
    colors?: string[];
    spread?: number;
    origin?: {
      x?: number;
      y?: number;
    };
    gravity?: number;
    drift?: number;
    shapes?: ('circle' | 'square' | 'triangle')[];
    size?: 'small' | 'medium' | 'large';
  };
}

// Union type for all components
export type FunnelComponentData =
  | HeadlineComponent
  | ParagraphComponent
  | ButtonComponent
  | ImageComponent
  | VideoComponent
  | AudioComponent
  | TimerComponent
  | ProgressBarComponent
  | InputComponent
  | SliderComponent
  | LoadingComponent
  | CarouselComponent
  | QuizOptionComponent
  | AlertComponent
  | TestimonialComponent
  | PricingComponent
  | SpacerComponent
  | CodeComponent
  | ArgumentComponent
  | FAQComponent
  | FooterComponent
  // NEW: Phase 2 Components
  | SocialShareComponent
  | PollComponent
  | NotificationComponent
  | AnimatedCounterComponent
  | ConfettiComponent
  | VSLVideoComponent;

// ===========================
// Funnel & Step Types
// ===========================

export interface FunnelTheme {
  primaryColor: string;
  textColor?: string;
  fontFamily: string;
  page: {
    type: 'color' | 'gradient' | 'image';
    value: string;
    secondaryColor?: string;
    overlayOpacity?: number;
    publicId?: string; // Cloudinary public ID
    customCss?: string;
  };
  container: {
    show?: boolean;
    backgroundColor: string;
    borderRadius: string;
    shadow: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    opacity: number;
    blur: number;
  };
  logo?: {
    url: string;
    size: 'sm' | 'md' | 'lg';
    height?: number;
    link?: string;
    isSticky?: boolean;
    publicId?: string; // Cloudinary public ID
  };
  progressBar?: {
    show: boolean;
    color?: string;
    isSticky?: boolean;
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
