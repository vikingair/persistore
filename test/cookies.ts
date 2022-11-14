/**
 * This file is part of persistore which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 */
import { Spy } from 'spy4js';
import { Access } from '../src/access';
import { CookieUtil } from '../src/cookies';

const Access$Mock = Spy.mock(Access, 'document', 'variables');

describe('CookieUtil', () => {
    let documentMock: any = {};
    beforeEach(() => {
        documentMock = { cookie: '' };
        Access$Mock.document.returns(documentMock);
        Access$Mock.variables.returns({ ci: undefined });
    });

    it('sets the cookie with value', () => {
        CookieUtil.set('myCookie', '+myValue?');
        expect(documentMock.cookie).toBe('myCookie=%2BmyValue%3F;Secure;Path=/;SameSite=strict');
    });

    it('sets the cookie with lax SameSite attribute', () => {
        CookieUtil.set('myCookie', '+myValue?', 'lax');
        expect(documentMock.cookie).toBe('myCookie=%2BmyValue%3F;Secure;Path=/;SameSite=lax');
    });

    it('throws an error if cookie is exceeding max cookie length', () => {
        const generate13Digits = () => String([1e12]).replace(/0/g, () => String(Math.floor(Math.random() * 10)));
        const arrayWithNumbers = Array.apply(null, { length: 200 } as any).map(generate13Digits);
        try {
            CookieUtil.set('myCookie', JSON.stringify(arrayWithNumbers));
        } catch (e) {
            expect((e as Error).message).toBe('Unable to set cookie. Cookie string is to long (4442 > 4093).');
            return;
        }
        expect(true).toBe(false); // we do not reach this point
    });

    it('removes the cookie with value', () => {
        Access$Mock.variables.returns({ ci: false }); // will be treated the same like default
        CookieUtil.remove('myCookie');
        expect(documentMock.cookie).toBe(
            'myCookie=; expires=Thu, 01 Jan 1970 00:00:01 GMT;Secure;Path=/;SameSite=strict'
        );
    });

    it('accesses the cookie with value', () => {
        documentMock.cookie = 'someCookieHere=andThisValue; andSoOn=yeah;  myCookie=%2BmyValue%3F;  foo=bar;';
        expect(CookieUtil.get('myCookie')).toBe('+myValue?');
    });

    it('returns undefined if cookie does not exist', () => {
        documentMock.cookie = 'someCookieHere=andThisValue; andSoOn=yeah;  foo=bar;';
        expect(CookieUtil.get('myCookie')).toBe(undefined);
    });

    it('sets insecure cookie with value', () => {
        Access$Mock.variables.returns({ ci: true });
        CookieUtil.set('myCookie', '+myValue?');
        expect(documentMock.cookie).toBe('myCookie=%2BmyValue%3F;Path=/;SameSite=strict');
    });

    it('returns all cookies', () => {
        documentMock.cookie = 'someCookieHere=andThisValue; andSoOn=yeah;  myCookie=%2BmyValue%3F;  foo=bar;';
        expect(CookieUtil.getAll()).toEqual([
            ['someCookieHere', 'andThisValue'],
            ['andSoOn', 'yeah'],
            ['myCookie', '+myValue?'],
            ['foo', 'bar'],
            ['', 'undefined'],
        ]);
    });

    it('returns empty array if cookies are empty', () => {
        documentMock.cookie = '';
        expect(CookieUtil.getAll()).toEqual([]);
    });
});
