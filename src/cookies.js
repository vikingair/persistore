/**
 * This file is part of persistore which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import { Access } from './access';

// it is very important that deleting and setting cookies is performed
// on the same cookie location
const cookieLocation = () =>
    (Access.variables().ci ? '' : 'Secure;') + 'Path=/;SameSite=strict';
const MAX_COOKIE_LENGTH = 4093;

const set = (name: string, value: string): void => {
    const encodedValue = encodeURIComponent(value);
    const cookie = `${name}=${encodedValue};${cookieLocation()}`;
    if (cookie.length > MAX_COOKIE_LENGTH)
        throw new Error(
            `Unable to set cookie. Cookie string is to long (${cookie.length} > ${MAX_COOKIE_LENGTH}).`
        );
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

const get = (name: string): string | void => {
    const foundCookie: CookieNameValuePairs = getAll().filter(
        (cookiePair: [string, string]): boolean => cookiePair[0] === name
    );
    if (foundCookie.length > 0) return foundCookie[0][1];
};

export const Cookies = { set, remove, get, getAll };
