import { useMemo, useState, createContext, useContext } from "react";
import type { ReactNode } from "react";

interface TriggerContextType {
    trigger: boolean;
    toggleTrigger: () => void;
}

const TriggerContext = createContext<TriggerContextType | null>(null);

export function TriggerProvider({ children }: { children: ReactNode }) {
    const [trigger, setTrigger] = useState<boolean>(false); 

    const toggleTrigger = () => {
        setTrigger((prev) => !prev);
    }
    const value = useMemo(() => ({ trigger, toggleTrigger }), [trigger]);
    return <TriggerContext value={value}>{children}</TriggerContext>
}

export function useTrigger() {
    const context = useContext(TriggerContext);
    if (!context) throw new Error('useTrigger must be used within a TriggerProvider');
    return context;
}