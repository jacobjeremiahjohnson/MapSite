import { useAuth } from "react-oidc-context";

export function useScoreApi(){
    const auth = useAuth();

    const postScore = async (payload: any) => {
        const token = auth.user?.id_token;
        if (!token) throw new Error('Not authenticated');

        const res = await fetch(import.meta.env.VITE_SCORE_API_URL, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            Authorization: token,            // add `Bearer ` prefix for HTTP API JWT authorizers
            },
            body: JSON.stringify(payload),
        });

        // console.log({
        // isLoading: auth.isLoading,
        // isAuthenticated: auth.isAuthenticated,
        // error: auth.error,
        // user: auth.user,
        // });

        if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
        return res.json();
    };

    return { postScore };
};