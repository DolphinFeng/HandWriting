import './owl.d.ts';
declare module '@bfe/air-lx' {
    export function pvReport (
        lxMap: Record<string, any>,
        cidKey?: string | null | undefined,
        params?: Record<string, any>): void;
    export function mcReport (bid: string, params?: Record<string, any>): void;
}

declare global {
    interface Window { LXAnalytics: any }
}
