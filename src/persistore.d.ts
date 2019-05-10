/**
 * This project was created with flow. Flow will ignore the TypeScript types.
 * But you can find a copy of the source code directly next to this file.
 */
type Setter = (name: string, value: string) => undefined;
type Getter = (name: string) => string | undefined;
type Remover = (name: string) => undefined;
type Configure = (configs: { prefix?: string, insecure?: boolean }) => undefined;
export type PersistoreType = {
    set: Setter,
    get: Getter,
    remove: Remover,
    session: {
        set: Setter,
        get: Getter,
        remove: Remover,
    },
    config: Configure,
};
export type CookieUtilType = {
    set: Setter,
    get: Getter,
    remove: Remover,
};
export type useStorageType = (local: boolean) => boolean;
export type useCookiesType = () => boolean;

export const Persistore: PersistoreType;
export const CookieUtil: CookieUtilType;
export const useStorage: useStorageType;
export const useCookies: useCookiesType;
