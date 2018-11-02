// @flow

import { Spy } from 'spy4js';
import { _Persistore, Persistore, useCookies, useStorage, CookieUtil } from '../src/persistore';

describe('Persistore - VariableProvider', () => {
    it('returns the variables by the provider', () => {
        expect(_Persistore.variables()).toEqual({
            store: {},
            prefix: '',
        });
        expect(_Persistore.document()).toBe(window.document);
        expect(_Persistore.storage(true)).toBe(window.localStorage);
        expect(_Persistore.storage(false)).toBe(window.sessionStorage);
    });
});

describe('Persistore.config', () => {
    it('configures the prefix', () => {
        expect(_Persistore.variables().prefix).toBe('');
        Persistore.config({ prefix: 'foo-' });
        expect(_Persistore.variables().prefix).toBe('foo-');
    });
});

describe('Persistore - localStorageAvailable', () => {
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
    it('sets the localVariables.lsa to true if everything works fine', () => {
        expect(useStorage(true)).toBe(true);

        localStorageMock.getItem.wasNotCalled();
        localStorageMock.setItem.wasCalledWith('__test__', '__test__');
        localStorageMock.removeItem.wasCalledWith('__test__');
        expect(localVariables.lsa).toBe(true);
    });

    it('sets the localVariables.lsa to false if any exception occurs', () => {
        localStorageMock.setItem.throws('no way!');
        expect(useStorage(true)).toBe(false);

        localStorageMock.getItem.wasNotCalled();
        localStorageMock.setItem.wasCalledWith('__test__', '__test__');
        localStorageMock.removeItem.wasNotCalled();
        expect(localVariables.lsa).toBe(false);
    });

    it('does not retest localStorage availability if localVariables.lsa is true/false', () => {
        localVariables.lsa = true;
        expect(useStorage(true)).toBe(true);

        localVariables.lsa = false;
        expect(useStorage(true)).toBe(false);

        localStorageMock.getItem.wasNotCalled();
        localStorageMock.setItem.wasNotCalled();
        localStorageMock.removeItem.wasNotCalled();
    });
});

describe('Persistore - sessionStorageAvailable', () => {
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
    it('sets the localVariables.ssa to true if everything works fine', () => {
        expect(useStorage(false)).toBe(true);

        sessionStorageMock.getItem.wasNotCalled();
        sessionStorageMock.setItem.wasCalledWith('__test__', '__test__');
        sessionStorageMock.removeItem.wasCalledWith('__test__');
        expect(localVariables.ssa).toBe(true);
    });

    it('sets the localVariables.ssa to false if any exception occurs', () => {
        sessionStorageMock.setItem.throws('no way!');
        expect(useStorage(false)).toBe(false);

        sessionStorageMock.getItem.wasNotCalled();
        sessionStorageMock.setItem.wasCalledWith('__test__', '__test__');
        sessionStorageMock.removeItem.wasNotCalled();
        expect(localVariables.ssa).toBe(false);
    });

    it('does not retest sessionStorage availability if localVariables.ssa is true/false', () => {
        localVariables.ssa = true;
        expect(useStorage(false)).toBe(true);

        localVariables.ssa = false;
        expect(useStorage(false)).toBe(false);

        sessionStorageMock.getItem.wasNotCalled();
        sessionStorageMock.setItem.wasNotCalled();
        sessionStorageMock.removeItem.wasNotCalled();
    });
});

describe('Persistore - cookiesAvailable', () => {
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
    it('sets the localVariables.ca to true if everything works fine', () => {
        cookieUtilMock.set.calls((name, val) => {
            documentMock.cookie = `${name}=${val}`;
        });
        cookieUtilMock.remove.calls(() => {
            documentMock.cookie = '';
        });
        expect(useCookies()).toBe(true);

        cookieUtilMock.set.wasCalled(1);
        cookieUtilMock.set.wasCalledWith('__test__', '__test__');
        cookieUtilMock.remove.wasCalled(1);
        cookieUtilMock.remove.wasCalledWith('__test__');
        cookieUtilMock.get.wasNotCalled();
        expect(localVariables.ca).toBe(true);
    });

    it('sets the localVariables.ca to false if any exception occurs', () => {
        cookieUtilMock.set.throws('no way!');
        expect(useCookies()).toBe(false);

        cookieUtilMock.set.wasCalled(1);
        cookieUtilMock.set.wasCalledWith('__test__', '__test__');
        cookieUtilMock.remove.wasNotCalled();
        cookieUtilMock.get.wasNotCalled();
        expect(localVariables.ca).toBe(false);
    });

    it('does not retest cookie availability if localVariables.ca is true/false', () => {
        localVariables.ca = true;
        expect(useCookies()).toBe(true);

        localVariables.ca = false;
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
            prefix: 'test.',
            lsa: false,
            ssa: false,
            ca: false,
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
        localVariables.lsa = true;
        Persistore.set('myName', 'myValue');
        localStorageMock.setItem.wasCalledWith('test.myName', 'myValue');
        cookieUtilMock.set.wasNotCalled();
        expect(localVariables.store['test.myName']).toBe(undefined);
    });
    it('sets the item to cookie', () => {
        localVariables.ca = true;
        Persistore.set('myName', 'myValue');
        localStorageMock.setItem.wasNotCalled();
        cookieUtilMock.set.wasCalledWith('test.myName', 'myValue');
        expect(localVariables.store['test.myName']).toBe(undefined);
    });
    it('sets the item to local variable', () => {
        Persistore.set('myName', 'myValue');
        localStorageMock.setItem.wasNotCalled();
        cookieUtilMock.set.wasNotCalled();
        expect(localVariables.store['test.myName']).toBe('myValue');
    });
    it('gets the item from local storage', () => {
        localVariables.lsa = true;
        localStorageMock.getItem.returns('myValue', null);

        expect(Persistore.get('myName')).toBe('myValue');
        expect(Persistore.get('myName2')).toBe(undefined);

        localStorageMock.getItem.hasCallHistory('test.myName', 'test.myName2');
        cookieUtilMock.get.wasNotCalled();
    });
    it('gets the item from cookie', () => {
        localVariables.ca = true;
        cookieUtilMock.get.returns('myValue');

        expect(Persistore.get('myName')).toBe('myValue');

        localStorageMock.getItem.wasNotCalled();
        cookieUtilMock.get.wasCalledWith('test.myName');
    });
    it('gets the item from local variable', () => {
        localVariables.store['test.myName'] = 'myValue';

        expect(Persistore.get('myName')).toBe('myValue');

        localStorageMock.getItem.wasNotCalled();
        cookieUtilMock.get.wasNotCalled();
    });
    it('removes the item from local storage', () => {
        localVariables.lsa = true;
        localVariables.store['test.myName'] = 'myValue';

        Persistore.remove('myName');

        localStorageMock.removeItem.wasCalledWith('test.myName');
        cookieUtilMock.remove.wasNotCalled();
        expect(localVariables.store['test.myName']).toBe('myValue');
    });
    it('removes the item from cookie', () => {
        localVariables.ca = true;
        localVariables.store['test.myName'] = 'myValue';

        Persistore.remove('myName');

        localStorageMock.removeItem.wasNotCalled();
        cookieUtilMock.remove.wasCalledWith('test.myName');
        expect(localVariables.store['test.myName']).toBe('myValue');
    });
    it('removes the item from local variable', () => {
        localVariables.store['test.myName'] = 'myValue';

        Persistore.remove('myName');

        localStorageMock.removeItem.wasNotCalled();
        cookieUtilMock.remove.wasNotCalled();
        expect(localVariables.store['test.myName']).toBe(undefined);
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
            prefix: '',
            lsa: false,
            ssa: false,
            ca: false,
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
    it('sets the item to session storage', () => {
        localVariables.ssa = true;
        Persistore.session.set('myName', 'myValue');
        sessionStorageMock.setItem.wasCalledWith('myName', 'myValue');
        cookieUtilMock.set.wasNotCalled();
        expect(localVariables.store.myName).toBe(undefined);
    });
    it('sets the item to cookie', () => {
        localVariables.ca = true;
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
    it('gets the item from session storage', () => {
        localVariables.ssa = true;
        sessionStorageMock.getItem.returns('myValue', null);

        expect(Persistore.session.get('myName')).toBe('myValue');
        expect(Persistore.session.get('myName2')).toBe(undefined);

        sessionStorageMock.getItem.hasCallHistory('myName', 'myName2');
        cookieUtilMock.get.wasNotCalled();
    });
    it('gets the item from cookie', () => {
        localVariables.ca = true;
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
    it('removes the item from session storage', () => {
        localVariables.ssa = true;
        localVariables.store.myName = 'myValue';

        Persistore.session.remove('myName');

        sessionStorageMock.removeItem.wasCalledWith('myName');
        cookieUtilMock.remove.wasNotCalled();
        expect(localVariables.store.myName).toBe('myValue');
    });
    it('removes the item from cookie', () => {
        localVariables.ca = true;
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
