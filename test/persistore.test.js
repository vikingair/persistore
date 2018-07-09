// @flow

import { Spy } from 'spy4js';
import {
    _VariableProvider,
    Persistore,
    cookieAvailable,
    localStorageAvailable,
    CookieUtil,
} from '../src/persistore';

describe('Persistore - VariableProvider', () => {
    it('returns the variables by the provider', () => {
        expect(_VariableProvider.getLocalVariables()).toEqual({
            applicationStorage: {},
        });
        expect(_VariableProvider.getWindow()).toBe(window);
    });
});

describe('Persistore - localStorageAvailable', () => {
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
        localVariables = { applicationStorage: {} };
        Spy.on(_VariableProvider, 'getLocalVariables').returns(localVariables);
        Spy.on(_VariableProvider, 'getWindow').returns(windowMock);
    });
    it('sets the localVariables.localStorageAvailable to true if everything works fine', () => {
        expect(localStorageAvailable()).toBe(true);

        windowMock.localStorage.getItem.wasNotCalled();
        windowMock.localStorage.setItem.wasCalledWith(
            '__storage_test__',
            '__storage_test__'
        );
        windowMock.localStorage.removeItem.wasCalledWith('__storage_test__');
        expect(localVariables.localStorageAvailable).toBe(true);
    });

    it('sets the localVariables.localStorageAvailable to false if any exception occurs', () => {
        windowMock.localStorage.setItem.throws('no way!');
        expect(localStorageAvailable()).toBe(false);

        windowMock.localStorage.getItem.wasNotCalled();
        windowMock.localStorage.setItem.wasCalledWith(
            '__storage_test__',
            '__storage_test__'
        );
        windowMock.localStorage.removeItem.wasNotCalled();
        expect(localVariables.localStorageAvailable).toBe(false);
    });

    it('does not retest localStorage availability if localVariables.localStorageAvailable is true/false', () => {
        localVariables.localStorageAvailable = true;
        expect(localStorageAvailable()).toBe(true);

        localVariables.localStorageAvailable = false;
        expect(localStorageAvailable()).toBe(false);

        windowMock.localStorage.getItem.wasNotCalled();
        windowMock.localStorage.setItem.wasNotCalled();
        windowMock.localStorage.removeItem.wasNotCalled();
    });
});

describe('Persistore - cookieAvailable', () => {
    let windowMock: Object = {};
    let localVariables: Object = {};
    let cookieUtilMock: Object = {};
    beforeEach(() => {
        windowMock = { document: { cookie: '' } };
        localVariables = { applicationStorage: {} };
        Spy.on(_VariableProvider, 'getLocalVariables').returns(localVariables);
        Spy.on(_VariableProvider, 'getWindow').returns(windowMock);
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
    it('sets the localVariables.cookieAvailable to true if everything works fine', () => {
        cookieUtilMock.set.calls((name, val) => {
            windowMock.document.cookie = `${name}=${val}`;
        });
        cookieUtilMock.remove.calls(() => {
            windowMock.document.cookie = '';
        });
        expect(cookieAvailable()).toBe(true);

        cookieUtilMock.set.wasCalled(1);
        cookieUtilMock.set.wasCalledWith('__cookie_test__', '__cookie_test__');
        cookieUtilMock.remove.wasCalled(1);
        cookieUtilMock.remove.wasCalledWith('__cookie_test__');
        cookieUtilMock.get.wasNotCalled();
        expect(localVariables.cookieAvailable).toBe(true);
    });

    it('sets the localVariables.cookieAvailable to false if any exception occurs', () => {
        cookieUtilMock.set.throws('no way!');
        expect(cookieAvailable()).toBe(false);

        cookieUtilMock.set.wasCalled(1);
        cookieUtilMock.set.wasCalledWith('__cookie_test__', '__cookie_test__');
        cookieUtilMock.remove.wasNotCalled();
        cookieUtilMock.get.wasNotCalled();
        expect(localVariables.cookieAvailable).toBe(false);
    });

    it('does not retest cookie availability if localVariables.cookieAvailable is true/false', () => {
        localVariables.cookieAvailable = true;
        expect(cookieAvailable()).toBe(true);

        localVariables.cookieAvailable = false;
        expect(cookieAvailable()).toBe(false);

        cookieUtilMock.set.wasNotCalled();
        cookieUtilMock.remove.wasNotCalled();
        cookieUtilMock.get.wasNotCalled();
    });
});

describe('Persistore - CookieUtil', () => {
    let windowMock: Object = {};
    beforeEach(() => {
        windowMock = { document: { cookie: '' } };
        Spy.on(_VariableProvider, 'getWindow').returns(windowMock);
    });
    it('sets the cookie with value', () => {
        CookieUtil.set('myCookie', '+myValue?');
        expect(windowMock.document.cookie).toBe(
            'myCookie=%2BmyValue%3F;Secure;Path=/'
        );
    });
    it('removes the cookie with value', () => {
        CookieUtil.remove('myCookie');
        expect(windowMock.document.cookie).toBe(
            'myCookie=; expires=Thu, 01 Jan 1970 00:00:01 GMT;Secure;Path=/'
        );
    });
    it('accesses the cookie with value', () => {
        windowMock.document.cookie =
            'someCookieHere=andThisValue; andSoOn=yeah;  myCookie=%2BmyValue%3F;  foo=bar;';
        expect(CookieUtil.get('myCookie')).toBe('+myValue?');
    });
    it('returns undefined if cookie does not exist', () => {
        windowMock.document.cookie =
            'someCookieHere=andThisValue; andSoOn=yeah;  foo=bar;';
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
            applicationStorage: {},
            localStorageAvailable: false,
            cookieAvailable: false,
        };
        Spy.on(_VariableProvider, 'getLocalVariables').returns(localVariables);
        Spy.on(_VariableProvider, 'getWindow').returns(windowMock);
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
        localVariables.localStorageAvailable = true;
        Persistore.set('myName', 'myValue');
        windowMock.localStorage.setItem.wasCalledWith('myName', 'myValue');
        cookieUtilMock.set.wasNotCalled();
        expect(localVariables.applicationStorage.myName).toBe(undefined);
    });
    it('sets the item to cookie', () => {
        localVariables.cookieAvailable = true;
        Persistore.set('myName', 'myValue');
        windowMock.localStorage.setItem.wasNotCalled();
        cookieUtilMock.set.wasCalledWith('myName', 'myValue');
        expect(localVariables.applicationStorage.myName).toBe(undefined);
    });
    it('sets the item to local variable', () => {
        Persistore.set('myName', 'myValue');
        windowMock.localStorage.setItem.wasNotCalled();
        cookieUtilMock.set.wasNotCalled();
        expect(localVariables.applicationStorage.myName).toBe('myValue');
    });
    it('gets the item from local storage', () => {
        localVariables.localStorageAvailable = true;
        windowMock.localStorage.getItem.returns('myValue');

        expect(Persistore.get('myName')).toBe('myValue');

        windowMock.localStorage.getItem.wasCalledWith('myName');
        cookieUtilMock.get.wasNotCalled();
    });
    it('gets the item from cookie', () => {
        localVariables.cookieAvailable = true;
        cookieUtilMock.get.returns('myValue');

        expect(Persistore.get('myName')).toBe('myValue');

        windowMock.localStorage.getItem.wasNotCalled();
        cookieUtilMock.get.wasCalledWith('myName');
    });
    it('gets the item from local variable', () => {
        localVariables.applicationStorage.myName = 'myValue';

        expect(Persistore.get('myName')).toBe('myValue');

        windowMock.localStorage.getItem.wasNotCalled();
        cookieUtilMock.get.wasNotCalled();
    });
    it('removes the item from local storage', () => {
        localVariables.localStorageAvailable = true;
        localVariables.applicationStorage.myName = 'myValue';

        Persistore.remove('myName');

        windowMock.localStorage.removeItem.wasCalledWith('myName');
        cookieUtilMock.remove.wasNotCalled();
        expect(localVariables.applicationStorage.myName).toBe('myValue');
    });
    it('removes the item from cookie', () => {
        localVariables.cookieAvailable = true;
        localVariables.applicationStorage.myName = 'myValue';

        Persistore.remove('myName');

        windowMock.localStorage.removeItem.wasNotCalled();
        cookieUtilMock.remove.wasCalledWith('myName');
        expect(localVariables.applicationStorage.myName).toBe('myValue');
    });
    it('removes the item from local variable', () => {
        localVariables.applicationStorage.myName = 'myValue';

        Persistore.remove('myName');

        windowMock.localStorage.removeItem.wasNotCalled();
        cookieUtilMock.remove.wasNotCalled();
        expect(localVariables.applicationStorage.myName).toBe(undefined);
    });
});
