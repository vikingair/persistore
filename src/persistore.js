// @flow

const variables: {
    useLocalStorage?: boolean,
    useCookies?: boolean,
    store: Object,
} = {
    store: {},
};

export const _Persistore = {
    variables: () => variables,
    window: () => window,
};

export const useLocalStorage = (): boolean => {
    const lv = _Persistore.variables();
    if (lv.useLocalStorage === undefined) {
        try {
            const storage = _Persistore.window().localStorage;
            const x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            lv.useLocalStorage = true;
        } catch (e) {
            lv.useLocalStorage = false;
        }
    }
    return lv.useLocalStorage;
};

// it is very important that deleting and setting cookies is performed
// on the same cookie location
const cookieLocation = 'Secure;Path=/;SameSite=strict';

const setCookie = (name: string, value: string): void => {
    const encodedValue = encodeURIComponent(value);
    _Persistore.window().document.cookie = `${name}=${encodedValue};${cookieLocation}`;
};

const removeCookie = (name: string): void => {
    _Persistore.window().document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;${cookieLocation}`;
};

type CookieNameValuePairs = Array<Array<string>>;

const getCookie = (name: string): string | void => {
    const list: Array<string> = _Persistore.window().document.cookie.split(';');
    const pairs: CookieNameValuePairs = list.map((cookie: string): Array<string> => {
        return cookie.split('=');
    });
    const foundCookie: CookieNameValuePairs = pairs.filter((cookiePair: Array<string>): boolean => {
        return cookiePair.length === 2 && cookiePair[0].trim() === name;
    });
    if (foundCookie.length > 0) return decodeURIComponent(foundCookie[0][1]);
};

export const CookieUtil = {
    set: setCookie,
    remove: removeCookie,
    get: getCookie,
};

export const useCookies = (): boolean => {
    const lv = _Persistore.variables();
    if (lv.useCookies === undefined) {
        try {
            const document = _Persistore.window().document;
            const x = '__cookie_test__';
            CookieUtil.set(x, x);
            lv.useCookies = document.cookie.indexOf(x) !== -1;
            CookieUtil.remove(x);
            lv.useCookies = lv.useCookies && document.cookie.indexOf(x) === -1;
        } catch (e) {
            lv.useCookies = false;
        }
    }

    return Boolean(lv.useCookies);
};

const set = (name: string, value: string): void => {
    if (useLocalStorage()) return _Persistore.window().localStorage.setItem(name, value);
    if (useCookies()) return CookieUtil.set(name, value);
    _Persistore.variables().store[name] = value;
};

const get = (name: string): string | void => {
    if (useLocalStorage()) return _Persistore.window().localStorage.getItem(name) || undefined;
    if (useCookies()) return CookieUtil.get(name);
    return _Persistore.variables().store[name];
};

const remove = (name: string): void => {
    if (useLocalStorage()) return _Persistore.window().localStorage.removeItem(name);
    if (useCookies()) return CookieUtil.remove(name);
    delete _Persistore.variables().store[name];
};

export const Persistore = { get, set, remove };
