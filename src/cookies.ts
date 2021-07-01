/**
 * This file is part of persistore which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 */

import { Access } from './access';

type SameSite = 'strict' | 'lax' | 'none';
// it is very important that deleting and setting cookies is performed
// on the same cookie location
const cookieLocation = (sameSite: SameSite = 'strict') =>
    `${Access.variables().ci ? '' : 'Secure;'}Path=/;SameSite=${sameSite}`;
const MAX_COOKIE_LENGTH = 4093;

const set = (name: string, value: string, sameSite?: SameSite): void => {
    const encodedValue = encodeURIComponent(value);
    const cookie = `${name}=${encodedValue};${cookieLocation(sameSite)}`;
    if (cookie.length > MAX_COOKIE_LENGTH)
        throw new Error(`Unable to set cookie. Cookie string is to long (${cookie.length} > ${MAX_COOKIE_LENGTH}).`);
    Access.document().cookie = cookie;
};

const remove = (name: string): void => {
    Access.document().cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;${cookieLocation()}`;
};

type CookieNameValuePairs = Array<[string, string]>;

const getAll = (): CookieNameValuePairs => {
    const current = Access.document().cookie;
    return current
        ? current.split(';').map((cookie: string): [string, string] => {
              const split = cookie.split('=');
              return [split[0].trim(), decodeURIComponent(split[1])];
          })
        : [];
};

const get = (name: string): string | undefined => {
    const foundCookie: CookieNameValuePairs = getAll().filter(
        (cookiePair: [string, string]): boolean => cookiePair[0] === name
    );
    if (foundCookie.length > 0) return foundCookie[0][1];
    return undefined;
};

export const CookieUtil = { set, remove, get, getAll };
