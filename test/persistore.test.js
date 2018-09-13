// @flow

import { Spy } from 'spy4js';
import { _Persistore, Persistore, useCookies, useStorage, CookieUtil } from '../src/persistore';

describe('Persistore - VariableProvider', () => {
    it('returns the variables by the provider', () => {
        expect(_Persistore.variables()).toEqual({
            store: {},
        });
        expect(_Persistore.document()).toBe(window.document);
        expect(_Persistore.storage(true)).toBe(window.localStorage);
        expect(_Persistore.storage(false)).toBe(window.sessionStorage);
    });
});

describe('Persistore - useLocalStorage', () => {
    let localStorageMock: Object = {};
    let localVariables: Object = {};
    beforeEach(() => {
        localStorageMock = {
            getItem: new Spy('localStorage.getItem - Spy'),
            setItem: new Spy('localStorage.setItem - Spy'),
            removeItem: new Spy('localStorage.removeItem - Spy'),
        };
        localVariables = { store: {} };
        Spy.on(_Persistore, 'variables').returns(localVariables);
        Spy.on(_Persistore, 'storage').calls(local => {
            if (local) return localStorageMock;
            throw new Error('Testing local storage');
        });
    });
    it('sets the localVariables.useLocalStorage to true if everything works fine', () => {
        expect(useStorage(true)).toBe(true);

        localStorageMock.getItem.wasNotCalled();
        localStorageMock.setItem.wasCalledWith('__storage_test__', '__storage_test__');
        localStorageMock.removeItem.wasCalledWith('__storage_test__');
        expect(localVariables.useLocalStorage).toBe(true);
    });

    it('sets the localVariables.useLocalStorage to false if any exception occurs', () => {
        localStorageMock.setItem.throws('no way!');
        expect(useStorage(true)).toBe(false);

        localStorageMock.getItem.wasNotCalled();
        localStorageMock.setItem.wasCalledWith('__storage_test__', '__storage_test__');
        localStorageMock.removeItem.wasNotCalled();
        expect(localVariables.useLocalStorage).toBe(false);
    });

    it('does not retest localStorage availability if localVariables.useLocalStorage is true/false', () => {
        localVariables.useLocalStorage = true;
        expect(useStorage(true)).toBe(true);

        localVariables.useLocalStorage = false;
        expect(useStorage(true)).toBe(false);

        localStorageMock.getItem.wasNotCalled();
        localStorageMock.setItem.wasNotCalled();
        localStorageMock.removeItem.wasNotCalled();
    });
});

describe('Persistore - useSessionStorage', () => {
    let sessionStorageMock: Object = {};
    let localVariables: Object = {};
    beforeEach(() => {
        sessionStorageMock = {
            getItem: new Spy('sessionStorage.getItem - Spy'),
            setItem: new Spy('sessionStorage.setItem - Spy'),
            removeItem: new Spy('sessionStorage.removeItem - Spy'),
        };
        localVariables = { store: {} };
        Spy.on(_Persistore, 'variables').returns(localVariables);
        Spy.on(_Persistore, 'storage').calls(local => {
            if (!local) return sessionStorageMock;
            throw new Error('Testing local storage');
        });
    });
    it('sets the localVariables.useLocalStorage to true if everything works fine', () => {
        expect(useStorage(false)).toBe(true);

        sessionStorageMock.getItem.wasNotCalled();
        sessionStorageMock.setItem.wasCalledWith('__storage_test__', '__storage_test__');
        sessionStorageMock.removeItem.wasCalledWith('__storage_test__');
        expect(localVariables.useSessionStorage).toBe(true);
    });

    it('sets the localVariables.useSessionStorage to false if any exception occurs', () => {
        sessionStorageMock.setItem.throws('no way!');
        expect(useStorage(false)).toBe(false);

        sessionStorageMock.getItem.wasNotCalled();
        sessionStorageMock.setItem.wasCalledWith('__storage_test__', '__storage_test__');
        sessionStorageMock.removeItem.wasNotCalled();
        expect(localVariables.useSessionStorage).toBe(false);
    });

    it('does not retest sessionStorage availability if localVariables.useSessionStorage is true/false', () => {
        localVariables.useSessionStorage = true;
        expect(useStorage(false)).toBe(true);

        localVariables.useSessionStorage = false;
        expect(useStorage(false)).toBe(false);

        sessionStorageMock.getItem.wasNotCalled();
        sessionStorageMock.setItem.wasNotCalled();
        sessionStorageMock.removeItem.wasNotCalled();
    });
});

describe('Persistore - useCookies', () => {
    let documentMock: Object = {};
    let localVariables: Object = {};
    let cookieUtilMock: Object = {};
    beforeEach(() => {
        documentMock = { cookie: '' };
        localVariables = { store: {} };
        Spy.on(_Persistore, 'variables').returns(localVariables);
        Spy.on(_Persistore, 'document').returns(documentMock);
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
            documentMock.cookie = `${name}=${val}`;
        });
        cookieUtilMock.remove.calls(() => {
            documentMock.cookie = '';
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
    let documentMock: Object = {};
    beforeEach(() => {
        documentMock = { cookie: '' };
        Spy.on(_Persistore, 'document').returns(documentMock);
    });
    it('sets the cookie with value', () => {
        CookieUtil.set('myCookie', '+myValue?');
        expect(documentMock.cookie).toBe('myCookie=%2BmyValue%3F;Secure;Path=/;SameSite=strict');
    });
    it('throws an error if cookie is exceeding max cookie length', () => {
        const generate13Digits = () =>
            String([1e12]).replace(/0/g, () => String(Math.floor(Math.random() * 10)));
        const arrayWithNumbers = Array.apply(null, ({ length: 200 }: any)).map(generate13Digits);
        try {
            CookieUtil.set('myCookie', JSON.stringify(arrayWithNumbers));
        } catch (e) {
            expect(e.message).toBe('Unable to set cookie. Cookie string is to long (4442 > 4093).');
            return;
        }
        expect(true).toBe(false); // we do not reach this point
    });
    it('removes the cookie with value', () => {
        CookieUtil.remove('myCookie');
        expect(documentMock.cookie).toBe(
            'myCookie=; expires=Thu, 01 Jan 1970 00:00:01 GMT;Secure;Path=/;SameSite=strict'
        );
    });
    it('accesses the cookie with value', () => {
        documentMock.cookie =
            'someCookieHere=andThisValue; andSoOn=yeah;  myCookie=%2BmyValue%3F;  foo=bar;';
        expect(CookieUtil.get('myCookie')).toBe('+myValue?');
    });
    it('returns undefined if cookie does not exist', () => {
        documentMock.cookie = 'someCookieHere=andThisValue; andSoOn=yeah;  foo=bar;';
        expect(CookieUtil.get('myCookie')).toBe(undefined);
    });
});

describe('Persistore', () => {
    let localStorageMock: Object = {};
    let localVariables: Object = {};
    let cookieUtilMock: Object = {};
    beforeEach(() => {
        localStorageMock = {
            getItem: new Spy('localStorage.getItem - Spy'),
            setItem: new Spy('localStorage.setItem - Spy'),
            removeItem: new Spy('localStorage.removeItem - Spy'),
        };
        localVariables = {
            store: {},
            useLocalStorage: false,
            useSessionStorage: false,
            useCookies: false,
        };
        Spy.on(_Persistore, 'variables').returns(localVariables);
        Spy.on(_Persistore, 'storage').calls(local => {
            if (local) return localStorageMock;
            throw new Error('Testing local storage');
        });
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
        localStorageMock.setItem.wasCalledWith('myName', 'myValue');
        cookieUtilMock.set.wasNotCalled();
        expect(localVariables.store.myName).toBe(undefined);
    });
    it('sets the item to cookie', () => {
        localVariables.useCookies = true;
        Persistore.set('myName', 'myValue');
        localStorageMock.setItem.wasNotCalled();
        cookieUtilMock.set.wasCalledWith('myName', 'myValue');
        expect(localVariables.store.myName).toBe(undefined);
    });
    it('sets the item to local variable', () => {
        Persistore.set('myName', 'myValue');
        localStorageMock.setItem.wasNotCalled();
        cookieUtilMock.set.wasNotCalled();
        expect(localVariables.store.myName).toBe('myValue');
    });
    it('gets the item from local storage', () => {
        localVariables.useLocalStorage = true;
        localStorageMock.getItem.returns('myValue', null);

        expect(Persistore.get('myName')).toBe('myValue');
        expect(Persistore.get('myName2')).toBe(undefined);

        localStorageMock.getItem.hasCallHistory([['myName'], ['myName2']]);
        cookieUtilMock.get.wasNotCalled();
    });
    it('gets the item from cookie', () => {
        localVariables.useCookies = true;
        cookieUtilMock.get.returns('myValue');

        expect(Persistore.get('myName')).toBe('myValue');

        localStorageMock.getItem.wasNotCalled();
        cookieUtilMock.get.wasCalledWith('myName');
    });
    it('gets the item from local variable', () => {
        localVariables.store.myName = 'myValue';

        expect(Persistore.get('myName')).toBe('myValue');

        localStorageMock.getItem.wasNotCalled();
        cookieUtilMock.get.wasNotCalled();
    });
    it('removes the item from local storage', () => {
        localVariables.useLocalStorage = true;
        localVariables.store.myName = 'myValue';

        Persistore.remove('myName');

        localStorageMock.removeItem.wasCalledWith('myName');
        cookieUtilMock.remove.wasNotCalled();
        expect(localVariables.store.myName).toBe('myValue');
    });
    it('removes the item from cookie', () => {
        localVariables.useCookies = true;
        localVariables.store.myName = 'myValue';

        Persistore.remove('myName');

        localStorageMock.removeItem.wasNotCalled();
        cookieUtilMock.remove.wasCalledWith('myName');
        expect(localVariables.store.myName).toBe('myValue');
    });
    it('removes the item from local variable', () => {
        localVariables.store.myName = 'myValue';

        Persistore.remove('myName');

        localStorageMock.removeItem.wasNotCalled();
        cookieUtilMock.remove.wasNotCalled();
        expect(localVariables.store.myName).toBe(undefined);
    });
});

describe('Persistore.session', () => {
    let sessionStorageMock: Object = {};
    let localVariables: Object = {};
    let cookieUtilMock: Object = {};
    beforeEach(() => {
        sessionStorageMock = {
            getItem: new Spy('sessionStorage.getItem - Spy'),
            setItem: new Spy('sessionStorage.setItem - Spy'),
            removeItem: new Spy('sessionStorage.removeItem - Spy'),
        };
        localVariables = {
            store: {},
            useLocalStorage: false,
            useSessionStorage: false,
            useCookies: false,
        };
        Spy.on(_Persistore, 'variables').returns(localVariables);
        Spy.on(_Persistore, 'storage').calls(local => {
            if (!local) return sessionStorageMock;
            throw new Error('Testing local storage');
        });
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
        localVariables.useSessionStorage = true;
        Persistore.session.set('myName', 'myValue');
        sessionStorageMock.setItem.wasCalledWith('myName', 'myValue');
        cookieUtilMock.set.wasNotCalled();
        expect(localVariables.store.myName).toBe(undefined);
    });
    it('sets the item to cookie', () => {
        localVariables.useCookies = true;
        Persistore.session.set('myName', 'myValue');
        sessionStorageMock.setItem.wasNotCalled();
        cookieUtilMock.set.wasCalledWith('myName', 'myValue');
        expect(localVariables.store.myName).toBe(undefined);
    });
    it('sets the item to local variable', () => {
        Persistore.session.set('myName', 'myValue');
        sessionStorageMock.setItem.wasNotCalled();
        cookieUtilMock.set.wasNotCalled();
        expect(localVariables.store.myName).toBe('myValue');
    });
    it('gets the item from local storage', () => {
        localVariables.useSessionStorage = true;
        sessionStorageMock.getItem.returns('myValue', null);

        expect(Persistore.session.get('myName')).toBe('myValue');
        expect(Persistore.session.get('myName2')).toBe(undefined);

        sessionStorageMock.getItem.hasCallHistory([['myName'], ['myName2']]);
        cookieUtilMock.get.wasNotCalled();
    });
    it('gets the item from cookie', () => {
        localVariables.useCookies = true;
        cookieUtilMock.get.returns('myValue');

        expect(Persistore.session.get('myName')).toBe('myValue');

        sessionStorageMock.getItem.wasNotCalled();
        cookieUtilMock.get.wasCalledWith('myName');
    });
    it('gets the item from local variable', () => {
        localVariables.store.myName = 'myValue';

        expect(Persistore.session.get('myName')).toBe('myValue');

        sessionStorageMock.getItem.wasNotCalled();
        cookieUtilMock.get.wasNotCalled();
    });
    it('removes the item from local storage', () => {
        localVariables.useSessionStorage = true;
        localVariables.store.myName = 'myValue';

        Persistore.session.remove('myName');

        sessionStorageMock.removeItem.wasCalledWith('myName');
        cookieUtilMock.remove.wasNotCalled();
        expect(localVariables.store.myName).toBe('myValue');
    });
    it('removes the item from cookie', () => {
        localVariables.useCookies = true;
        localVariables.store.myName = 'myValue';

        Persistore.session.remove('myName');

        sessionStorageMock.removeItem.wasNotCalled();
        cookieUtilMock.remove.wasCalledWith('myName');
        expect(localVariables.store.myName).toBe('myValue');
    });
    it('removes the item from local variable', () => {
        localVariables.store.myName = 'myValue';

        Persistore.session.remove('myName');

        sessionStorageMock.removeItem.wasNotCalled();
        cookieUtilMock.remove.wasNotCalled();
        expect(localVariables.store.myName).toBe(undefined);
    });
});
