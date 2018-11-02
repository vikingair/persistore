// @flow

const variables: {
    lsa?: boolean, // local storage available
    ssa?: boolean, // session storage available
    ca?: boolean, // cookies available
    store: Object,
    prefix: string,
} = {
    store: {},
    prefix: '',
};

export const _Persistore = {
    variables: () => variables,
    storage: (local: boolean) => (local ? window.localStorage : window.sessionStorage),
    document: () => window.document,
};

export const useStorage = (local: boolean): boolean => {
    const lv = _Persistore.variables();
    const isAvailable = local ? 'lsa' : 'ssa';
    if (lv[isAvailable] === undefined) {
        try {
            const storage = _Persistore.storage(local);
            const x = '__test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            lv[isAvailable] = true;
        } catch (e) {
            lv[isAvailable] = false;
        }
    }
    return (lv[isAvailable]: any);
};

// it is very important that deleting and setting cookies is performed
// on the same cookie location
const cookieLocation = 'Secure;Path=/;SameSite=strict';
const MAX_COOKIE_LENGTH = 4093;

const setCookie = (name: string, value: string): void => {
    const encodedValue = encodeURIComponent(value);
    const cookie = `${name}=${encodedValue};${cookieLocation}`;
    if (cookie.length > MAX_COOKIE_LENGTH)
        throw new Error(
            `Unable to set cookie. Cookie string is to long (${cookie.length} > ${MAX_COOKIE_LENGTH}).`
        );
    _Persistore.document().cookie = cookie;
};

const removeCookie = (name: string): void => {
    _Persistore.document().cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;${cookieLocation}`;
};

type CookieNameValuePairs = Array<Array<string>>;

const getCookie = (name: string): string | void => {
    const list: Array<string> = _Persistore.document().cookie.split(';');
    const pairs: CookieNameValuePairs = list.map((cookie: string): Array<string> =>
        cookie.split('=')
    );
    const foundCookie: CookieNameValuePairs = pairs.filter(
        (cookiePair: Array<string>): boolean =>
            cookiePair.length === 2 && cookiePair[0].trim() === name
    );
    if (foundCookie.length > 0) return decodeURIComponent(foundCookie[0][1]);
};

export const CookieUtil = {
    set: setCookie,
    remove: removeCookie,
    get: getCookie,
};

export const useCookies = (): boolean => {
    const lv = _Persistore.variables();
    if (lv.ca === undefined) {
        try {
            const document = _Persistore.document();
            const x = '__test__';
            CookieUtil.set(x, x);
            lv.ca = document.cookie.indexOf(x) !== -1;
            CookieUtil.remove(x);
            lv.ca = lv.ca && document.cookie.indexOf(x) === -1;
        } catch (e) {
            lv.ca = false;
        }
    }
    return (lv.ca: any);
};

const _prefixed = (name: string): string => _Persistore.variables().prefix + name;

const _set = (local: boolean) => (name: string, value: string): void => {
    const key = _prefixed(name);
    if (useStorage(local)) return _Persistore.storage(local).setItem(key, value);
    if (useCookies()) return CookieUtil.set(key, value);
    _Persistore.variables().store[key] = value;
};

const _get = (local: boolean) => (name: string): string | void => {
    const key = _prefixed(name);
    if (useStorage(local)) return _Persistore.storage(local).getItem(key) || undefined;
    if (useCookies()) return CookieUtil.get(key);
    return _Persistore.variables().store[key];
};

const _remove = (local: boolean) => (name: string): void => {
    const key = _prefixed(name);
    if (useStorage(local)) return _Persistore.storage(local).removeItem(key);
    if (useCookies()) return CookieUtil.remove(key);
    delete _Persistore.variables().store[key];
};

const config = ({ prefix }: { prefix: string }) => (variables.prefix = prefix);

export const Persistore = {
    set: _set(true),
    get: _get(true),
    remove: _remove(true),
    session: {
        set: _set(false),
        get: _get(false),
        remove: _remove(false),
    },
    config,
};
