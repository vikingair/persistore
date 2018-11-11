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
const cookieLocation = 'Secure;Path=/;SameSite=strict';
const MAX_COOKIE_LENGTH = 4093;

const set = (name: string, value: string): void => {
    const encodedValue = encodeURIComponent(value);
    const cookie = `${name}=${encodedValue};${cookieLocation}`;
    if (cookie.length > MAX_COOKIE_LENGTH)
        throw new Error(
            `Unable to set cookie. Cookie string is to long (${cookie.length} > ${MAX_COOKIE_LENGTH}).`
        );
    Access.document().cookie = cookie;
};

const remove = (name: string): void => {
    Access.document().cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT;${cookieLocation}`;
};

type CookieNameValuePairs = Array<Array<string>>;

const get = (name: string): string | void => {
    const list: Array<string> = Access.document().cookie.split(';');
    const pairs: CookieNameValuePairs = list.map((cookie: string): Array<string> =>
        cookie.split('=')
    );
    const foundCookie: CookieNameValuePairs = pairs.filter(
        (cookiePair: Array<string>): boolean =>
            cookiePair.length === 2 && cookiePair[0].trim() === name
    );
    if (foundCookie.length > 0) return decodeURIComponent(foundCookie[0][1]);
};

export const Cookies = { set, remove, get };
