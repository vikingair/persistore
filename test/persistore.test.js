// @flow

import { Spy } from 'spy4js';
import {
    _Persistore,
    Persistore,
    useCookies,
    useLocalStorage,
    CookieUtil,
} from '../src/persistore';

describe('Persistore - VariableProvider', () => {
    it('returns the variables by the provider', () => {
        expect(_Persistore.variables()).toEqual({
            store: {},
        });
        expect(_Persistore.window()).toBe(window);
    });
});

describe('Persistore - useLocalStorage', () => {
    let windowMock: Object = {};
    let localVariables: Object = {};
    beforeEach(() => {
        windowMock = {
            localStorage: {
                getItem: new Spy('localStorage.getItem - Spy'),
                setItem: new Spy('localStorage.setItem - Spy'),
                removeItem: new Spy('localStorage.removeItem - Spy'),
            },
        };
        localVariables = { store: {} };
        Spy.on(_Persistore, 'variables').returns(localVariables);
        Spy.on(_Persistore, 'window').returns(windowMock);
    });
    it('sets the localVariables.useLocalStorage to true if everything works fine', () => {
        expect(useLocalStorage()).toBe(true);

        windowMock.localStorage.getItem.wasNotCalled();
        windowMock.localStorage.setItem.wasCalledWith('__storage_test__', '__storage_test__');
        windowMock.localStorage.removeItem.wasCalledWith('__storage_test__');
        expect(localVariables.useLocalStorage).toBe(true);
    });

    it('sets the localVariables.useLocalStorage to false if any exception occurs', () => {
        windowMock.localStorage.setItem.throws('no way!');
        expect(useLocalStorage()).toBe(false);

        windowMock.localStorage.getItem.wasNotCalled();
        windowMock.localStorage.setItem.wasCalledWith('__storage_test__', '__storage_test__');
        windowMock.localStorage.removeItem.wasNotCalled();
        expect(localVariables.useLocalStorage).toBe(false);
    });

    it('does not retest localStorage availability if localVariables.useLocalStorage is true/false', () => {
        localVariables.useLocalStorage = true;
        expect(useLocalStorage()).toBe(true);

        localVariables.useLocalStorage = false;
        expect(useLocalStorage()).toBe(false);

        windowMock.localStorage.getItem.wasNotCalled();
        windowMock.localStorage.setItem.wasNotCalled();
        windowMock.localStorage.removeItem.wasNotCalled();
    });
});

describe('Persistore - useCookies', () => {
    let windowMock: Object = {};
    let localVariables: Object = {};
    let cookieUtilMock: Object = {};
    beforeEach(() => {
        windowMock = { document: { cookie: '' } };
        localVariables = { store: {} };
        Spy.on(_Persistore, 'variables').returns(localVariables);
        Spy.on(_Persistore, 'window').returns(windowMock);
        const [getCookieSpy, setCookieSpy, removeCookieSpy] = Spy.onMany(
            CookieUtil,
            'get',
            'set',
            'remove'
        );
        cookieUtilMock = {
            get: getCookieSpy,
            set: setCookieSpy,
            remove: removeCookieSpy,
        };
    });
    it('sets the localVariables.useCookies to true if everything works fine', () => {
        cookieUtilMock.set.calls((name, val) => {
            windowMock.document.cookie = `${name}=${val}`;
        });
        cookieUtilMock.remove.calls(() => {
            windowMock.document.cookie = '';
        });
        expect(useCookies()).toBe(true);

        cookieUtilMock.set.wasCalled(1);
        cookieUtilMock.set.wasCalledWith('__cookie_test__', '__cookie_test__');
        cookieUtilMock.remove.wasCalled(1);
        cookieUtilMock.remove.wasCalledWith('__cookie_test__');
        cookieUtilMock.get.wasNotCalled();
        expect(localVariables.useCookies).toBe(true);
    });

    it('sets the localVariables.useCookies to false if any exception occurs', () => {
        cookieUtilMock.set.throws('no way!');
        expect(useCookies()).toBe(false);

        cookieUtilMock.set.wasCalled(1);
        cookieUtilMock.set.wasCalledWith('__cookie_test__', '__cookie_test__');
        cookieUtilMock.remove.wasNotCalled();
        cookieUtilMock.get.wasNotCalled();
        expect(localVariables.useCookies).toBe(false);
    });

    it('does not retest cookie availability if localVariables.useCookies is true/false', () => {
        localVariables.useCookies = true;
        expect(useCookies()).toBe(true);

        localVariables.useCookies = false;
        expect(useCookies()).toBe(false);

        cookieUtilMock.set.wasNotCalled();
        cookieUtilMock.remove.wasNotCalled();
        cookieUtilMock.get.wasNotCalled();
    });
});

describe('Persistore - CookieUtil', () => {
    let windowMock: Object = {};
    beforeEach(() => {
        windowMock = { document: { cookie: '' } };
        Spy.on(_Persistore, 'window').returns(windowMock);
    });
    it('sets the cookie with value', () => {
        CookieUtil.set('myCookie', '+myValue?');
        expect(windowMock.document.cookie).toBe(
            'myCookie=%2BmyValue%3F;Secure;Path=/;SameSite=strict'
        );
    });
    it('removes the cookie with value', () => {
        CookieUtil.remove('myCookie');
        expect(windowMock.document.cookie).toBe(
            'myCookie=; expires=Thu, 01 Jan 1970 00:00:01 GMT;Secure;Path=/;SameSite=strict'
        );
    });
    it('accesses the cookie with value', () => {
        windowMock.document.cookie =
            'someCookieHere=andThisValue; andSoOn=yeah;  myCookie=%2BmyValue%3F;  foo=bar;';
        expect(CookieUtil.get('myCookie')).toBe('+myValue?');
    });
    it('returns undefined if cookie does not exist', () => {
        windowMock.document.cookie = 'someCookieHere=andThisValue; andSoOn=yeah;  foo=bar;';
        expect(CookieUtil.get('myCookie')).toBe(undefined);
    });
});

describe('Persistore', () => {
    let windowMock: Object = {};
    let localVariables: Object = {};
    let cookieUtilMock: Object = {};
    beforeEach(() => {
        windowMock = {
            localStorage: {
                getItem: new Spy('localStorage.getItem - Spy'),
                setItem: new Spy('localStorage.setItem - Spy'),
                removeItem: new Spy('localStorage.removeItem - Spy'),
            },
        };
        localVariables = {
            store: {},
            useLocalStorage: false,
            useCookies: false,
        };
        Spy.on(_Persistore, 'variables').returns(localVariables);
        Spy.on(_Persistore, 'window').returns(windowMock);
        const [getCookieSpy, setCookieSpy, removeCookieSpy] = Spy.onMany(
            CookieUtil,
            'get',
            'set',
            'remove'
        );
        cookieUtilMock = {
            get: getCookieSpy,
            set: setCookieSpy,
            remove: removeCookieSpy,
        };
    });
    it('sets the item to local storage', () => {
        localVariables.useLocalStorage = true;
        Persistore.set('myName', 'myValue');
        windowMock.localStorage.setItem.wasCalledWith('myName', 'myValue');
        cookieUtilMock.set.wasNotCalled();
        expect(localVariables.store.myName).toBe(undefined);
    });
    it('sets the item to cookie', () => {
        localVariables.useCookies = true;
        Persistore.set('myName', 'myValue');
        windowMock.localStorage.setItem.wasNotCalled();
        cookieUtilMock.set.wasCalledWith('myName', 'myValue');
        expect(localVariables.store.myName).toBe(undefined);
    });
    it('sets the item to local variable', () => {
        Persistore.set('myName', 'myValue');
        windowMock.localStorage.setItem.wasNotCalled();
        cookieUtilMock.set.wasNotCalled();
        expect(localVariables.store.myName).toBe('myValue');
    });
    it('gets the item from local storage', () => {
        localVariables.useLocalStorage = true;
        windowMock.localStorage.getItem.returns('myValue', null);

        expect(Persistore.get('myName')).toBe('myValue');
        expect(Persistore.get('myName2')).toBe(undefined);

        windowMock.localStorage.getItem.hasCallHistory([['myName'], ['myName2']]);
        cookieUtilMock.get.wasNotCalled();
    });
    it('gets the item from cookie', () => {
        localVariables.useCookies = true;
        cookieUtilMock.get.returns('myValue');

        expect(Persistore.get('myName')).toBe('myValue');

        windowMock.localStorage.getItem.wasNotCalled();
        cookieUtilMock.get.wasCalledWith('myName');
    });
    it('gets the item from local variable', () => {
        localVariables.store.myName = 'myValue';

        expect(Persistore.get('myName')).toBe('myValue');

        windowMock.localStorage.getItem.wasNotCalled();
        cookieUtilMock.get.wasNotCalled();
    });
    it('removes the item from local storage', () => {
        localVariables.useLocalStorage = true;
        localVariables.store.myName = 'myValue';

        Persistore.remove('myName');

        windowMock.localStorage.removeItem.wasCalledWith('myName');
        cookieUtilMock.remove.wasNotCalled();
        expect(localVariables.store.myName).toBe('myValue');
    });
    it('removes the item from cookie', () => {
        localVariables.useCookies = true;
        localVariables.store.myName = 'myValue';

        Persistore.remove('myName');

        windowMock.localStorage.removeItem.wasNotCalled();
        cookieUtilMock.remove.wasCalledWith('myName');
        expect(localVariables.store.myName).toBe('myValue');
    });
    it('removes the item from local variable', () => {
        localVariables.store.myName = 'myValue';

        Persistore.remove('myName');

        windowMock.localStorage.removeItem.wasNotCalled();
        cookieUtilMock.remove.wasNotCalled();
        expect(localVariables.store.myName).toBe(undefined);
    });
});
