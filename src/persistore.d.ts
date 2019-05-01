const Setter = (name: string, value: string) => undefined;
const Getter = (name: string) => string | undefined;
const Remover = (name: string) => undefined;
const Configure = (configs: { prefix?: string, insecure?: boolean }) => undefined;

export const Persistore = {
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

export const CookieUtil = {
    set: Setter,
    get: Getter,
    remove: Remover,
};

export const useStorage = (local: boolean) => boolean;
export const useCookies = () => boolean;
