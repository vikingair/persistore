/**
 * This file is part of persistore which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 */

import { Spy } from 'spy4js';
import { Persistore, useCookies, useStorage } from '../src/persistore';
import { Access } from '../src/access';
import { CookieUtil } from '../src/cookies';

const Access$Mock = Spy.mock(Access, 'variables', 'storage', 'document');
const CookieUtil$Mock = Spy.mock(CookieUtil, 'get', 'set', 'remove');

describe('Persistore.config', () => {
    it('configures the prefix', () => {
        Access$Mock.variables.transparent();
        expect(Access.variables().prefix).toBe('');
        Persistore.config({ prefix: 'foo-' });
        expect(Access.variables().prefix).toBe('foo-');
        Persistore.config({ prefix: undefined });
        expect(Access.variables().prefix).toBe('foo-');
        Persistore.config({ prefix: '' });
        expect(Access.variables().prefix).toBe('');
    });

    it('configures the insecure cookies', () => {
        Access$Mock.variables.transparent();
        expect(Access.variables().ci).toBe(undefined);
        Persistore.config({ insecure: true });
        expect(Access.variables().ci).toBe(true);
        Persistore.config({ insecure: undefined });
        expect(Access.variables().ci).toBe(true);
        Persistore.config({ insecure: false });
        expect(Access.variables().ci).toBe(false);
    });
});

describe('Persistore - localStorageAvailable', () => {
    const localStorageMock = {
        getItem: Spy('localStorage.getItem - Spy'),
        setItem: Spy('localStorage.setItem - Spy'),
        removeItem: Spy('localStorage.removeItem - Spy'),
    };
    let localVariables: any = {};
    beforeEach(() => {
        localVariables = { store: {} };
        Access$Mock.variables.returns(localVariables);
        Access$Mock.storage.calls((local: any) => {
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
    const sessionStorageMock = {
        getItem: Spy('sessionStorage.getItem - Spy'),
        setItem: Spy('sessionStorage.setItem - Spy'),
        removeItem: Spy('sessionStorage.removeItem - Spy'),
    };
    let localVariables: any = {};
    beforeEach(() => {
        localVariables = { store: {} };
        Access$Mock.variables.returns(localVariables);
        Access$Mock.storage.calls((local: any) => {
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
    let documentMock: any = {};
    let localVariables: any = {};
    beforeEach(() => {
        documentMock = { cookie: '' };
        localVariables = { store: {} };
        Access$Mock.variables.returns(localVariables);
        Access$Mock.document.returns(documentMock);
    });
    it('sets the localVariables.ca to true if everything works fine', () => {
        CookieUtil$Mock.set.calls((name: any, val: any) => {
            documentMock.cookie = `${name}=${val}`;
        });
        CookieUtil$Mock.remove.calls(() => {
            documentMock.cookie = '';
        });
        expect(useCookies()).toBe(true);

        CookieUtil$Mock.set.wasCalled(1);
        CookieUtil$Mock.set.wasCalledWith('__test__', '__test__');
        CookieUtil$Mock.remove.wasCalled(1);
        CookieUtil$Mock.remove.wasCalledWith('__test__');
        CookieUtil$Mock.get.wasNotCalled();
        expect(localVariables.ca).toBe(true);
    });

    it('sets the localVariables.ca to false if any exception occurs', () => {
        CookieUtil$Mock.set.throws('no way!');
        expect(useCookies()).toBe(false);

        CookieUtil$Mock.set.wasCalled(1);
        CookieUtil$Mock.set.wasCalledWith('__test__', '__test__');
        CookieUtil$Mock.remove.wasNotCalled();
        CookieUtil$Mock.get.wasNotCalled();
        expect(localVariables.ca).toBe(false);
    });

    it('does not retest cookie availability if localVariables.ca is true/false', () => {
        localVariables.ca = true;
        expect(useCookies()).toBe(true);

        localVariables.ca = false;
        expect(useCookies()).toBe(false);

        CookieUtil$Mock.set.wasNotCalled();
        CookieUtil$Mock.remove.wasNotCalled();
        CookieUtil$Mock.get.wasNotCalled();
    });
});

describe('Persistore', () => {
    const localStorageMock = {
        getItem: Spy('localStorage.getItem - Spy'),
        setItem: Spy('localStorage.setItem - Spy'),
        removeItem: Spy('localStorage.removeItem - Spy'),
    };
    let localVariables: any = {};
    beforeEach(() => {
        localVariables = {
            store: {},
            prefix: 'test.',
            lsa: false,
            ssa: false,
            ca: false,
        };
        Access$Mock.variables.returns(localVariables);
        Access$Mock.storage.calls((local: any) => {
            if (local) return localStorageMock;
            throw new Error('Testing local storage');
        });
    });
    it('sets the item to local storage', () => {
        localVariables.lsa = true;
        Persistore.set('myName', 'myValue');
        localStorageMock.setItem.wasCalledWith('test.myName', 'myValue');
        CookieUtil$Mock.set.wasNotCalled();
        expect(localVariables.store['test.myName']).toBe(undefined);
    });
    it('sets the item to cookie', () => {
        localVariables.ca = true;
        Persistore.set('myName', 'myValue');
        localStorageMock.setItem.wasNotCalled();
        CookieUtil$Mock.set.wasCalledWith('test.myName', 'myValue');
        expect(localVariables.store['test.myName']).toBe(undefined);
    });
    it('sets the item to local variable', () => {
        Persistore.set('myName', 'myValue');
        localStorageMock.setItem.wasNotCalled();
        CookieUtil$Mock.set.wasNotCalled();
        expect(localVariables.store['test.myName']).toBe('myValue');
    });
    it('gets the item from local storage', () => {
        localVariables.lsa = true;
        localStorageMock.getItem.returns('myValue', null);

        expect(Persistore.get('myName')).toBe('myValue');
        expect(Persistore.get('myName2')).toBe(undefined);

        localStorageMock.getItem.hasCallHistory('test.myName', 'test.myName2');
        CookieUtil$Mock.get.wasNotCalled();
    });
    it('gets the item from cookie', () => {
        localVariables.ca = true;
        CookieUtil$Mock.get.returns('myValue');

        expect(Persistore.get('myName')).toBe('myValue');

        localStorageMock.getItem.wasNotCalled();
        CookieUtil$Mock.get.wasCalledWith('test.myName');
    });
    it('gets the item from local variable', () => {
        localVariables.store['test.myName'] = 'myValue';

        expect(Persistore.get('myName')).toBe('myValue');

        localStorageMock.getItem.wasNotCalled();
        CookieUtil$Mock.get.wasNotCalled();
    });
    it('removes the item from local storage', () => {
        localVariables.lsa = true;
        localVariables.store['test.myName'] = 'myValue';

        Persistore.remove('myName');

        localStorageMock.removeItem.wasCalledWith('test.myName');
        CookieUtil$Mock.remove.wasNotCalled();
        expect(localVariables.store['test.myName']).toBe('myValue');
    });
    it('removes the item from cookie', () => {
        localVariables.ca = true;
        localVariables.store['test.myName'] = 'myValue';

        Persistore.remove('myName');

        localStorageMock.removeItem.wasNotCalled();
        CookieUtil$Mock.remove.wasCalledWith('test.myName');
        expect(localVariables.store['test.myName']).toBe('myValue');
    });
    it('removes the item from local variable', () => {
        localVariables.store['test.myName'] = 'myValue';

        Persistore.remove('myName');

        localStorageMock.removeItem.wasNotCalled();
        CookieUtil$Mock.remove.wasNotCalled();
        expect(localVariables.store['test.myName']).toBe(undefined);
    });
});

describe('Persistore.session', () => {
    const sessionStorageMock = {
        getItem: Spy('sessionStorage.getItem - Spy'),
        setItem: Spy('sessionStorage.setItem - Spy'),
        removeItem: Spy('sessionStorage.removeItem - Spy'),
    };
    let localVariables: any = {};
    beforeEach(() => {
        localVariables = {
            store: {},
            prefix: '',
            lsa: false,
            ssa: false,
            ca: false,
        };
        Access$Mock.variables.returns(localVariables);
        Access$Mock.storage.calls((local: any) => {
            if (!local) return sessionStorageMock;
            throw new Error('Testing local storage');
        });
    });
    it('sets the item to session storage', () => {
        localVariables.ssa = true;
        Persistore.session.set('myName', 'myValue');
        sessionStorageMock.setItem.wasCalledWith('myName', 'myValue');
        CookieUtil$Mock.set.wasNotCalled();
        expect(localVariables.store.myName).toBe(undefined);
    });
    it('sets the item to cookie', () => {
        localVariables.ca = true;
        Persistore.session.set('myName', 'myValue');
        sessionStorageMock.setItem.wasNotCalled();
        CookieUtil$Mock.set.wasCalledWith('myName', 'myValue');
        expect(localVariables.store.myName).toBe(undefined);
    });
    it('sets the item to local variable', () => {
        Persistore.session.set('myName', 'myValue');
        sessionStorageMock.setItem.wasNotCalled();
        CookieUtil$Mock.set.wasNotCalled();
        expect(localVariables.store.myName).toBe('myValue');
    });
    it('gets the item from session storage', () => {
        localVariables.ssa = true;
        sessionStorageMock.getItem.returns('myValue', null);

        expect(Persistore.session.get('myName')).toBe('myValue');
        expect(Persistore.session.get('myName2')).toBe(undefined);

        sessionStorageMock.getItem.hasCallHistory('myName', 'myName2');
        CookieUtil$Mock.get.wasNotCalled();
    });
    it('gets the item from cookie', () => {
        localVariables.ca = true;
        CookieUtil$Mock.get.returns('myValue');

        expect(Persistore.session.get('myName')).toBe('myValue');

        sessionStorageMock.getItem.wasNotCalled();
        CookieUtil$Mock.get.wasCalledWith('myName');
    });
    it('gets the item from local variable', () => {
        localVariables.store.myName = 'myValue';

        expect(Persistore.session.get('myName')).toBe('myValue');

        sessionStorageMock.getItem.wasNotCalled();
        CookieUtil$Mock.get.wasNotCalled();
    });
    it('removes the item from session storage', () => {
        localVariables.ssa = true;
        localVariables.store.myName = 'myValue';

        Persistore.session.remove('myName');

        sessionStorageMock.removeItem.wasCalledWith('myName');
        CookieUtil$Mock.remove.wasNotCalled();
        expect(localVariables.store.myName).toBe('myValue');
    });
    it('removes the item from cookie', () => {
        localVariables.ca = true;
        localVariables.store.myName = 'myValue';

        Persistore.session.remove('myName');

        sessionStorageMock.removeItem.wasNotCalled();
        CookieUtil$Mock.remove.wasCalledWith('myName');
        expect(localVariables.store.myName).toBe('myValue');
    });
    it('removes the item from local variable', () => {
        localVariables.store.myName = 'myValue';

        Persistore.session.remove('myName');

        sessionStorageMock.removeItem.wasNotCalled();
        CookieUtil$Mock.remove.wasNotCalled();
        expect(localVariables.store.myName).toBe(undefined);
    });
});
