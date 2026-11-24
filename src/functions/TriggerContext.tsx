import { useMemo, useState, createContext, useContext } from "react";
import type { ReactNode } from "react";

interface TriggerContextType {
    trigger: boolean;
    toggleTrigger: () => void;
}

const TriggerContext = createContext<TriggerContextType | null>(null);
const FlipProgressContext = createContext<number | null | undefined>(undefined);
const SetFlipProgressContext = createContext<((progress: number | null) => void) | null>(null);

export function TriggerProvider({ children }: { children: ReactNode }) {
    const [trigger, setTrigger] = useState<boolean>(false); 
    const [flipProgress, setFlipProgress] = useState<number | null>(null);

    const toggleTrigger = () => {
        setTrigger((prev) => !prev);
    }
    const value = useMemo(() => ({ trigger, toggleTrigger }), [trigger]);
    return (
        <TriggerContext value={value}>
            <SetFlipProgressContext value={setFlipProgress}>
                <FlipProgressContext value={flipProgress}>{children}</FlipProgressContext>
            </SetFlipProgressContext>
        </TriggerContext>
    );
}

export function useTrigger() {
    const context = useContext(TriggerContext);
    if (!context) throw new Error('useTrigger must be used within a TriggerProvider');
    return context;
}

export function useFlipProgress() {
    const context = useContext(FlipProgressContext);
    if (context === undefined) throw new Error('useFlipProgress must be used within a TriggerProvider');
    return context;
}

export function useSetFlipProgress() {
    const context = useContext(SetFlipProgressContext);
    if (!context) throw new Error('useSetFlipProgress must be used within a TriggerProvider');
    return context;
}