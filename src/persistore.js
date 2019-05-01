/**
 * This file is part of persistore which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import { Cookies } from './cookies';
import { Access } from './access';

export const useStorage = (local: boolean): boolean => {
    const lv = Access.variables();
    const isAvailable = local ? 'lsa' : 'ssa';
    if (lv[isAvailable] === undefined) {
        try {
            const storage = Access.storage(local);
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

export const useCookies = (): boolean => {
    const lv = Access.variables();
    if (lv.ca === undefined) {
        try {
            const document = Access.document();
            const x = '__test__';
            Cookies.set(x, x);
            lv.ca = document.cookie.indexOf(x) !== -1;
            Cookies.remove(x);
            lv.ca = lv.ca && document.cookie.indexOf(x) === -1;
        } catch (e) {
            lv.ca = false;
        }
    }
    return (lv.ca: any);
};

const _prefixed = (name: string): string => Access.variables().prefix + name;

const _set = (local: boolean) => (name: string, value: string): void => {
    const key = _prefixed(name);
    if (useStorage(local)) return Access.storage(local).setItem(key, value);
    if (useCookies()) return Cookies.set(key, value);
    Access.variables().store[key] = value;
};

const _get = (local: boolean) => (name: string): string | void => {
    const key = _prefixed(name);
    if (useStorage(local))
        return Access.storage(local).getItem(key) || undefined;
    if (useCookies()) return Cookies.get(key);
    return Access.variables().store[key];
};

const _remove = (local: boolean) => (name: string): void => {
    const key = _prefixed(name);
    if (useStorage(local)) return Access.storage(local).removeItem(key);
    if (useCookies()) return Cookies.remove(key);
    delete Access.variables().store[key];
};

const config = ({
    prefix,
    insecure,
}: {
    prefix?: string,
    insecure?: boolean,
}) => {
    prefix !== undefined && (Access.variables().prefix = prefix);
    insecure !== undefined && (Access.variables().ci = insecure);
};

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

export const CookieUtil = Cookies;
