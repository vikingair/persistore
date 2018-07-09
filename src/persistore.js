// @flow

const localVariables: {
    localStorageAvailable?: boolean,
    cookieAvailable?: boolean,
    applicationStorage: Object,
} = {
    applicationStorage: {},
};

export const _VariableProvider = {
    getLocalVariables: () => localVariables,
    getWindow: () => window,
};

export const localStorageAvailable = (): boolean => {
    const lv = _VariableProvider.getLocalVariables();
    if (lv.localStorageAvailable === undefined) {
        try {
            const storage = _VariableProvider.getWindow().localStorage;
            const x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            lv.localStorageAvailable = true;
        } catch (e) {
            lv.localStorageAvailable = false;
        }
    }
    return lv.localStorageAvailable;
};

// it is very important that deleting and setting cookies is performed
// on the same cookie location
const cookieLocation = 'Secure;Path=/';

const setCookie = (name: string, value: string) => {
    const encodedValue = encodeURIComponent(value);
    _VariableProvider.getWindow().document.cookie = `${name}=${encodedValue};${cookieLocation}`;
};

const removeCookie = (name: string) => {
    _VariableProvider.getWindow().document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;${cookieLocation}`;
};

const getCookie = (name: string): string | void => {
    const cookieList: Array<
        string
    > = _VariableProvider.getWindow().document.cookie.split(';');
    const nameValuePairs: Array<
        Array<string>
    > = cookieList.map((cookie: string): Array<string> => {
        return cookie.split('=');
    });
    const foundCookie: Array<
        Array<string>
    > = nameValuePairs.filter((cookiePair: Array<string>): boolean => {
        return cookiePair.length === 2 && cookiePair[0].trim() === name;
    });
    if (foundCookie.length > 0) {
        return decodeURIComponent(foundCookie[0][1]);
    }
};

export const CookieUtil = {
    set: setCookie,
    remove: removeCookie,
    get: getCookie,
};

export const cookieAvailable = (): boolean => {
    const lv = _VariableProvider.getLocalVariables();
    if (lv.cookieAvailable === undefined) {
        try {
            const document = _VariableProvider.getWindow().document;
            const x = '__cookie_test__';
            CookieUtil.set(x, x);
            lv.cookieAvailable = document.cookie.indexOf(x) !== -1;
            CookieUtil.remove(x);
            lv.cookieAvailable =
                lv.cookieAvailable && document.cookie.indexOf(x) === -1;
        } catch (e) {
            lv.cookieAvailable = false;
        }
    }
    return Boolean(lv.cookieAvailable);
};

const set = (name: string, value: string): void => {
    if (localStorageAvailable()) {
        _VariableProvider.getWindow().localStorage.setItem(name, value);
    } else if (cookieAvailable()) {
        CookieUtil.set(name, value);
    } else {
        _VariableProvider.getLocalVariables().applicationStorage[name] = value;
    }
};

const get = (name: string): string | void => {
    if (localStorageAvailable()) {
        return _VariableProvider.getWindow().localStorage.getItem(name);
    } else if (cookieAvailable()) {
        return CookieUtil.get(name);
    } else {
        return _VariableProvider.getLocalVariables().applicationStorage[name];
    }
};

const remove = (name: string) => {
    if (localStorageAvailable()) {
        _VariableProvider.getWindow().localStorage.removeItem(name);
    } else if (cookieAvailable()) {
        CookieUtil.remove(name);
    } else {
        delete _VariableProvider.getLocalVariables().applicationStorage[name];
    }
};

export const Persistore = { get, set, remove };
