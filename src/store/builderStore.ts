import { create } from 'zustand';
import { FunnelComponentData, ComponentType, FunnelTheme } from '@/types/funnel';

interface Step {
    id: string;
    title: string;
    order: number;
}

interface BuilderStore {
    // Current state
    currentFunnelId: string | null;
    currentFunnel: any | null;
    currentStepId: string | null;
    selectedComponentId: string | null;

    // Theme
    theme: FunnelTheme;

    // Steps management
    steps: Step[];

    // Components per step
    componentsByStep: Record<string, FunnelComponentData[]>;

    isDragging: boolean;

    // History for undo/redo
    history: { steps: Step[]; componentsByStep: Record<string, FunnelComponentData[]> }[];
    historyIndex: number;

    // Funnel Actions
    setCurrentFunnel: (funnelId: string) => void;
    updateTheme: (theme: Partial<FunnelTheme>) => void;

    // Step Actions
    setCurrentStep: (stepId: string) => void;
    addStep: () => void;
    updateStepTitle: (stepId: string, title: string) => void;
    duplicateStep: (stepId: string) => void;
    deleteStep: (stepId: string) => void;
    reorderSteps: (steps: Step[]) => void;

    // Component Actions
    setSelectedComponent: (componentId: string | null) => void;
    addComponent: (type: ComponentType, index?: number) => void;
    updateComponent: (id: string, data: Partial<FunnelComponentData>) => void;
    duplicateComponent: (id: string) => void;
    deleteComponent: (id: string) => void;
    reorderComponents: (components: FunnelComponentData[]) => void;
    setIsDragging: (isDragging: boolean) => void;

    // History Actions
    undo: () => void;
    redo: () => void;

    // Utility
    getCurrentComponents: () => FunnelComponentData[];
    clearSelection: () => void;

    // API Actions
    isLoading: boolean;
    isInitialized: boolean;
    error: string | null;
    loadFunnel: (funnelId: string, options?: { preserveState?: boolean, stepIdMap?: Record<string, string>, silent?: boolean }) => Promise<void>;
    saveFunnel: () => Promise<boolean>;
}

// ... (createDefaultComponent function remains unchanged)

export const useBuilderStore = create<BuilderStore>((set, get) => ({
    // Initial state
    currentFunnelId: null,
    currentFunnel: null,
    currentStepId: 'step_1',
    selectedComponentId: null,
    theme: {
        primaryColor: '#2563EB',
        fontFamily: 'Inter',
        page: { type: 'color', value: '#f3f4f6' },
        container: {
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            shadow: 'xl',
            opacity: 1,
            blur: 0
        }
    },
    steps: [
        { id: 'step_1', title: 'Etapa 1 - Introdução', order: 0 },
        { id: 'step_2', title: 'Etapa 2 - Pergunta', order: 1 },
    ],
    componentsByStep: {
        step_1: [],
        step_2: [],
    },
    isDragging: false,
    history: [],
    historyIndex: -1,
    isLoading: true,
    isInitialized: false,
    error: null,

    // Funnel Actions
    setCurrentFunnel: (funnelId) => {
        set({ currentFunnelId: funnelId });
    },

    updateTheme: (themeUpdate) => {
        set((state) => {
            const newState = {
                ...state,
                theme: { ...state.theme, ...themeUpdate }
            };
            // Add to history
            const history = state.history.slice(0, state.historyIndex + 1);
            history.push({ steps: state.steps, componentsByStep: state.componentsByStep });
            if (history.length > 50) history.shift();

            return {
                ...newState,
                history,
                historyIndex: history.length - 1
            };
        });
    },

    // Step Actions
    setCurrentStep: (stepId) => {
        set({ currentStepId: stepId, selectedComponentId: null });
    },

    addStep: () => {
        const { steps, componentsByStep, history, historyIndex } = get();
        const newStep: Step = {
            id: `step_${Date.now()}`,
            title: `Etapa ${steps.length + 1}`,
            order: steps.length
        };

        const newSteps = [...steps, newStep];
        const newComponentsByStep = { ...componentsByStep, [newStep.id]: [] };

        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({ steps, componentsByStep });
        if (newHistory.length > 50) newHistory.shift();

        set({
            steps: newSteps,
            componentsByStep: newComponentsByStep,
            history: newHistory,
            historyIndex: newHistory.length - 1
        });
    },

    updateStepTitle: (stepId, title) => {
        set((state) => ({
            steps: state.steps.map(s => s.id === stepId ? { ...s, title } : s)
        }));
    },

    duplicateStep: (stepId) => {
        const { steps, componentsByStep, history, historyIndex } = get();
        const stepToDuplicate = steps.find(s => s.id === stepId);
        if (!stepToDuplicate) return;

        const newStep: Step = {
            id: `step_${Date.now()}`,
            title: `${stepToDuplicate.title} (Cópia)`,
            order: steps.length
        };

        // Deep copy components to ensure no reference sharing
        const duplicatedComponents = (componentsByStep[stepId] || []).map(c => ({
            ...c,
            id: `${c.type}_${Date.now()}_${Math.random()}`,
            data: JSON.parse(JSON.stringify(c.data)) // Deep copy of data
        }));

        const newSteps = [...steps, newStep];
        const newComponentsByStep = { ...componentsByStep, [newStep.id]: duplicatedComponents };

        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({ steps, componentsByStep });
        if (newHistory.length > 50) newHistory.shift();

        set({
            steps: newSteps,
            componentsByStep: newComponentsByStep,
            history: newHistory,
            historyIndex: newHistory.length - 1
        });
    },

    deleteStep: (stepId) => {
        const { steps, componentsByStep, currentStepId } = get();
        if (steps.length <= 1) return;

        const newSteps = steps.filter(s => s.id !== stepId);
        const newComponentsByStep = { ...componentsByStep };
        delete newComponentsByStep[stepId];

        set({
            steps: newSteps,
            componentsByStep: newComponentsByStep,
            currentStepId: currentStepId === stepId ? newSteps[0]?.id : currentStepId
        });
    },

    reorderSteps: (newSteps) => {
        set({ steps: newSteps });
    },

    // Component Actions
    setSelectedComponent: (componentId) => {
        set({ selectedComponentId: componentId });
    },

    addComponent: (type, index) => {
        const { currentStepId, componentsByStep, steps, history, historyIndex } = get();
        if (!currentStepId) return;

        const currentComponents = componentsByStep[currentStepId] || [];

        // Create component with proper type-specific data
        const newComponent = {
            id: `${type}_${Date.now()}`,
            type,
            order: index !== undefined ? index : currentComponents.length,
            data: type === 'quiz-option' ? {
                options: [
                    {
                        id: crypto.randomUUID(),
                        label: 'Opção 1',
                        value: 'A',
                        emoji: '😀',
                        points: 0,
                        targetStepId: 'next_step'
                    },
                    {
                        id: crypto.randomUUID(),
                        label: 'Opção 2',
                        value: 'B',
                        emoji: '🤔',
                        points: 0,
                        targetStepId: 'next_step'
                    }
                ]
            } : {}
        } as FunnelComponentData;

        const newComponents = [...currentComponents];
        if (index !== undefined) {
            newComponents.splice(index, 0, newComponent);
        } else {
            newComponents.push(newComponent);
        }

        const newComponentsByStep = {
            ...componentsByStep,
            [currentStepId]: newComponents.map((c, i) => ({ ...c, order: i }))
        };

        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({ steps, componentsByStep });
        if (newHistory.length > 50) newHistory.shift();

        set({
            componentsByStep: newComponentsByStep,
            selectedComponentId: newComponent.id,
            history: newHistory,
            historyIndex: newHistory.length - 1
        });
    },

    updateComponent: (id, updates) => {
        const { currentStepId, componentsByStep, steps, history, historyIndex } = get();
        if (!currentStepId) return;

        const newComponentsByStep = {
            ...componentsByStep,
            [currentStepId]: (componentsByStep[currentStepId] || []).map(c =>
                c.id === id ? { ...c, ...updates } as FunnelComponentData : c
            )
        };

        // Only add to history if it's not a "frequent" update (like typing)
        // For now, we add everything, but we could debounce this
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({ steps, componentsByStep });
        if (newHistory.length > 50) newHistory.shift();

        set({
            componentsByStep: newComponentsByStep,
            history: newHistory,
            historyIndex: newHistory.length - 1
        });
    },

    duplicateComponent: (id) => {
        const { currentStepId, componentsByStep, steps, history, historyIndex } = get();
        if (!currentStepId) return;

        const components = componentsByStep[currentStepId] || [];
        const componentToDuplicate = components.find(c => c.id === id);
        if (!componentToDuplicate) return;

        const newComponent: FunnelComponentData = {
            ...componentToDuplicate,
            id: `${componentToDuplicate.type}_${Date.now()}`,
            order: componentToDuplicate.order + 1
        };

        const newComponents = [...components];
        const insertIndex = components.findIndex(c => c.id === id) + 1;
        newComponents.splice(insertIndex, 0, newComponent);

        const newComponentsByStep = {
            ...componentsByStep,
            [currentStepId]: newComponents.map((c, i) => ({ ...c, order: i }))
        };

        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({ steps, componentsByStep });
        if (newHistory.length > 50) newHistory.shift();

        set({
            componentsByStep: newComponentsByStep,
            history: newHistory,
            historyIndex: newHistory.length - 1
        });
    },

    deleteComponent: (id) => {
        const { currentStepId, componentsByStep, selectedComponentId, steps, history, historyIndex } = get();
        if (!currentStepId) return;

        const newComponentsByStep = {
            ...componentsByStep,
            [currentStepId]: (componentsByStep[currentStepId] || [])
                .filter(c => c.id !== id)
                .map((c, i) => ({ ...c, order: i }))
        };

        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({ steps, componentsByStep });
        if (newHistory.length > 50) newHistory.shift();

        set({
            componentsByStep: newComponentsByStep,
            selectedComponentId: selectedComponentId === id ? null : selectedComponentId,
            history: newHistory,
            historyIndex: newHistory.length - 1
        });
    },

    reorderComponents: (components) => {
        const { currentStepId } = get();
        if (!currentStepId) return;

        set((state) => ({
            componentsByStep: {
                ...state.componentsByStep,
                [currentStepId]: components
            }
        }));
    },

    setIsDragging: (isDragging) => {
        set({ isDragging });
    },

    // History Actions
    undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex <= 0) return;

        const newIndex = historyIndex - 1;
        const snapshot = history[newIndex];

        set({
            steps: snapshot.steps,
            componentsByStep: snapshot.componentsByStep,
            historyIndex: newIndex
        });
    },

    redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex >= history.length - 1) return;

        const newIndex = historyIndex + 1;
        const snapshot = history[newIndex];

        set({
            steps: snapshot.steps,
            componentsByStep: snapshot.componentsByStep,
            historyIndex: newIndex
        });
    },

    // Utility
    getCurrentComponents: () => {
        const { currentStepId, componentsByStep } = get();
        return currentStepId ? componentsByStep[currentStepId] || [] : [];
    },

    clearSelection: () => {
        set({ selectedComponentId: null });
    },
    loadFunnel: async (funnelId, options) => {
        console.log('🔄 Loading funnel:', funnelId);
        if (!options?.silent) {
            set({ isLoading: true, isInitialized: false, error: null });
        }

        try {
            // 1. Try to load from API
            const response = await fetch(`/api/funnels/${funnelId}`, {
                cache: 'no-store',
                headers: {
                    'Pragma': 'no-cache',
                    'Cache-Control': 'no-cache'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to load funnel: ${response.statusText}`);
            }

            const funnel = await response.json();
            set({ currentFunnel: funnel });

            // ... (rest of the logic)

            // Load theme if exists
            if (funnel.themeConfig) {
                set({ theme: funnel.themeConfig });
            }

            // If no steps, handle based on funnel age
            if (!funnel.steps || funnel.steps.length === 0) {
                const createdAt = new Date(funnel.createdAt).getTime();
                const now = Date.now();
                const isNewFunnel = (now - createdAt) < 5 * 60 * 1000; // 5 minutes

                if (isNewFunnel) {
                    const defaultSteps = [
                        { id: 'step_1', title: 'Etapa 1 - Introdução', order: 0 },
                        { id: 'step_2', title: 'Etapa 2 - Pergunta', order: 1 },
                    ];
                    const defaultComponents = {
                        step_1: [],
                        step_2: [],
                    };
                    set({
                        steps: defaultSteps,
                        componentsByStep: defaultComponents,
                        currentStepId: 'step_1',
                        isLoading: false,
                        isInitialized: true,
                        history: [{ steps: defaultSteps, componentsByStep: defaultComponents }],
                        historyIndex: 0,
                        error: null
                    });
                } else {
                    set({
                        steps: [],
                        componentsByStep: {},
                        currentStepId: null,
                        isLoading: false,
                        isInitialized: true,
                        history: [{ steps: [], componentsByStep: {} }],
                        historyIndex: 0,
                        error: null
                    });
                }
                return;
            }

            // Map DB steps to store steps
            const storeSteps: Step[] = funnel.steps.map((s: any) => ({
                id: s.id,
                title: s.title,
                order: s.order
            }));

            // Map DB components to store componentsByStep
            const storeComponentsByStep: Record<string, FunnelComponentData[]> = {};
            funnel.steps.forEach((s: any) => {
                storeComponentsByStep[s.id] = s.components.map((c: any) => ({
                    id: c.id,
                    type: c.type,
                    order: c.order,
                    data: c.data
                }));
            });

            // Determine new current step ID
            let newCurrentStepId = storeSteps[0]?.id || null;
            if (options?.preserveState) {
                const { currentStepId } = get();
                if (currentStepId) {
                    const mappedId = options.stepIdMap ? options.stepIdMap[currentStepId] : null;
                    if (mappedId && storeSteps.find(s => s.id === mappedId)) {
                        newCurrentStepId = mappedId;
                    } else if (storeSteps.find(s => s.id === currentStepId)) {
                        newCurrentStepId = currentStepId;
                    }
                }
            }

            // Preserve history if requested, otherwise reset
            const history = options?.preserveState ? get().history : [{ steps: storeSteps, componentsByStep: storeComponentsByStep }];
            const historyIndex = options?.preserveState ? get().historyIndex : 0;

            set({
                steps: storeSteps,
                componentsByStep: storeComponentsByStep,
                currentStepId: newCurrentStepId,
                isLoading: false,
                isInitialized: true,
                history,
                historyIndex,
                error: null
            });

        } catch (error) {
            console.error('❌ Error loading funnel:', error);
            set({
                isLoading: false,
                isInitialized: false,
                error: error instanceof Error ? error.message : 'Unknown error loading funnel'
            });
        }
    },

    saveFunnel: async () => {
        const { currentFunnelId, steps, componentsByStep, theme, isLoading, isInitialized } = get();

        if (!currentFunnelId || isLoading || !isInitialized || get().error) {
            return false;
        }

        try {
            const payload = {
                steps,
                componentsByStep,
                themeConfig: theme
            };

            const response = await fetch(`/api/funnels/${currentFunnelId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.details || responseData.error || 'Failed to save to API');
            }

            // CRITICAL: Reload from API to sync IDs and ensure persistence
            // Pass stepIdMap to preserve current step selection even if ID changed
            // Use silent: true to prevent UI flash
            /* 
            await get().loadFunnel(currentFunnelId, {
                preserveState: true,
                stepIdMap: responseData.stepIdMap,
                silent: true
            });
            */

            return true;
        } catch (error) {
            console.error('❌ Error saving to API:', error);
            return false;
        }
    },
}));
