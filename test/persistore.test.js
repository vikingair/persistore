/**
 * This file is part of persistore which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 * @flow
 */

import { Spy } from 'spy4js';
import { Persistore, useCookies, useStorage } from '../src/persistore';
import { Access } from '../src/access';
import { Cookies } from '../src/cookies';

const Access$Mock = Spy.mock(Access, 'variables', 'storage', 'document');
const Cookies$Mock = Spy.mock(Cookies, 'get', 'set', 'remove');

describe('Persistore.config', () => {
    it('configures the prefix', () => {
        Access$Mock.variables.transparent();
        expect(Access.variables().prefix).toBe('');
        Persistore.config({ prefix: 'foo-' });
        expect(Access.variables().prefix).toBe('foo-');
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
        Access$Mock.variables.returns(localVariables);
        Access$Mock.storage.calls(local => {
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
        Access$Mock.variables.returns(localVariables);
        Access$Mock.storage.calls(local => {
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
    beforeEach(() => {
        documentMock = { cookie: '' };
        localVariables = { store: {} };
        Access$Mock.variables.returns(localVariables);
        Access$Mock.document.returns(documentMock);
    });
    it('sets the localVariables.ca to true if everything works fine', () => {
        Cookies$Mock.set.calls((name, val) => {
            documentMock.cookie = `${name}=${val}`;
        });
        Cookies$Mock.remove.calls(() => {
            documentMock.cookie = '';
        });
        expect(useCookies()).toBe(true);

        Cookies$Mock.set.wasCalled(1);
        Cookies$Mock.set.wasCalledWith('__test__', '__test__');
        Cookies$Mock.remove.wasCalled(1);
        Cookies$Mock.remove.wasCalledWith('__test__');
        Cookies$Mock.get.wasNotCalled();
        expect(localVariables.ca).toBe(true);
    });

    it('sets the localVariables.ca to false if any exception occurs', () => {
        Cookies$Mock.set.throws('no way!');
        expect(useCookies()).toBe(false);

        Cookies$Mock.set.wasCalled(1);
        Cookies$Mock.set.wasCalledWith('__test__', '__test__');
        Cookies$Mock.remove.wasNotCalled();
        Cookies$Mock.get.wasNotCalled();
        expect(localVariables.ca).toBe(false);
    });

    it('does not retest cookie availability if localVariables.ca is true/false', () => {
        localVariables.ca = true;
        expect(useCookies()).toBe(true);

        localVariables.ca = false;
        expect(useCookies()).toBe(false);

        Cookies$Mock.set.wasNotCalled();
        Cookies$Mock.remove.wasNotCalled();
        Cookies$Mock.get.wasNotCalled();
    });
});

describe('Persistore', () => {
    let localStorageMock: Object = {};
    let localVariables: Object = {};
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
        Access$Mock.variables.returns(localVariables);
        Access$Mock.storage.calls(local => {
            if (local) return localStorageMock;
            throw new Error('Testing local storage');
        });
    });
    it('sets the item to local storage', () => {
        localVariables.lsa = true;
        Persistore.set('myName', 'myValue');
        localStorageMock.setItem.wasCalledWith('test.myName', 'myValue');
        Cookies$Mock.set.wasNotCalled();
        expect(localVariables.store['test.myName']).toBe(undefined);
    });
    it('sets the item to cookie', () => {
        localVariables.ca = true;
        Persistore.set('myName', 'myValue');
        localStorageMock.setItem.wasNotCalled();
        Cookies$Mock.set.wasCalledWith('test.myName', 'myValue');
        expect(localVariables.store['test.myName']).toBe(undefined);
    });
    it('sets the item to local variable', () => {
        Persistore.set('myName', 'myValue');
        localStorageMock.setItem.wasNotCalled();
        Cookies$Mock.set.wasNotCalled();
        expect(localVariables.store['test.myName']).toBe('myValue');
    });
    it('gets the item from local storage', () => {
        localVariables.lsa = true;
        localStorageMock.getItem.returns('myValue', null);

        expect(Persistore.get('myName')).toBe('myValue');
        expect(Persistore.get('myName2')).toBe(undefined);

        localStorageMock.getItem.hasCallHistory('test.myName', 'test.myName2');
        Cookies$Mock.get.wasNotCalled();
    });
    it('gets the item from cookie', () => {
        localVariables.ca = true;
        Cookies$Mock.get.returns('myValue');

        expect(Persistore.get('myName')).toBe('myValue');

        localStorageMock.getItem.wasNotCalled();
        Cookies$Mock.get.wasCalledWith('test.myName');
    });
    it('gets the item from local variable', () => {
        localVariables.store['test.myName'] = 'myValue';

        expect(Persistore.get('myName')).toBe('myValue');

        localStorageMock.getItem.wasNotCalled();
        Cookies$Mock.get.wasNotCalled();
    });
    it('removes the item from local storage', () => {
        localVariables.lsa = true;
        localVariables.store['test.myName'] = 'myValue';

        Persistore.remove('myName');

        localStorageMock.removeItem.wasCalledWith('test.myName');
        Cookies$Mock.remove.wasNotCalled();
        expect(localVariables.store['test.myName']).toBe('myValue');
    });
    it('removes the item from cookie', () => {
        localVariables.ca = true;
        localVariables.store['test.myName'] = 'myValue';

        Persistore.remove('myName');

        localStorageMock.removeItem.wasNotCalled();
        Cookies$Mock.remove.wasCalledWith('test.myName');
        expect(localVariables.store['test.myName']).toBe('myValue');
    });
    it('removes the item from local variable', () => {
        localVariables.store['test.myName'] = 'myValue';

        Persistore.remove('myName');

        localStorageMock.removeItem.wasNotCalled();
        Cookies$Mock.remove.wasNotCalled();
        expect(localVariables.store['test.myName']).toBe(undefined);
    });
});

describe('Persistore.session', () => {
    let sessionStorageMock: Object = {};
    let localVariables: Object = {};
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
        Access$Mock.variables.returns(localVariables);
        Access$Mock.storage.calls(local => {
            if (!local) return sessionStorageMock;
            throw new Error('Testing local storage');
        });
    });
    it('sets the item to session storage', () => {
        localVariables.ssa = true;
        Persistore.session.set('myName', 'myValue');
        sessionStorageMock.setItem.wasCalledWith('myName', 'myValue');
        Cookies$Mock.set.wasNotCalled();
        expect(localVariables.store.myName).toBe(undefined);
    });
    it('sets the item to cookie', () => {
        localVariables.ca = true;
        Persistore.session.set('myName', 'myValue');
        sessionStorageMock.setItem.wasNotCalled();
        Cookies$Mock.set.wasCalledWith('myName', 'myValue');
        expect(localVariables.store.myName).toBe(undefined);
    });
    it('sets the item to local variable', () => {
        Persistore.session.set('myName', 'myValue');
        sessionStorageMock.setItem.wasNotCalled();
        Cookies$Mock.set.wasNotCalled();
        expect(localVariables.store.myName).toBe('myValue');
    });
    it('gets the item from session storage', () => {
        localVariables.ssa = true;
        sessionStorageMock.getItem.returns('myValue', null);

        expect(Persistore.session.get('myName')).toBe('myValue');
        expect(Persistore.session.get('myName2')).toBe(undefined);

        sessionStorageMock.getItem.hasCallHistory('myName', 'myName2');
        Cookies$Mock.get.wasNotCalled();
    });
    it('gets the item from cookie', () => {
        localVariables.ca = true;
        Cookies$Mock.get.returns('myValue');

        expect(Persistore.session.get('myName')).toBe('myValue');

        sessionStorageMock.getItem.wasNotCalled();
        Cookies$Mock.get.wasCalledWith('myName');
    });
    it('gets the item from local variable', () => {
        localVariables.store.myName = 'myValue';

        expect(Persistore.session.get('myName')).toBe('myValue');

        sessionStorageMock.getItem.wasNotCalled();
        Cookies$Mock.get.wasNotCalled();
    });
    it('removes the item from session storage', () => {
        localVariables.ssa = true;
        localVariables.store.myName = 'myValue';

        Persistore.session.remove('myName');

        sessionStorageMock.removeItem.wasCalledWith('myName');
        Cookies$Mock.remove.wasNotCalled();
        expect(localVariables.store.myName).toBe('myValue');
    });
    it('removes the item from cookie', () => {
        localVariables.ca = true;
        localVariables.store.myName = 'myValue';

        Persistore.session.remove('myName');

        sessionStorageMock.removeItem.wasNotCalled();
        Cookies$Mock.remove.wasCalledWith('myName');
        expect(localVariables.store.myName).toBe('myValue');
    });
    it('removes the item from local variable', () => {
        localVariables.store.myName = 'myValue';

        Persistore.session.remove('myName');

        sessionStorageMock.removeItem.wasNotCalled();
        Cookies$Mock.remove.wasNotCalled();
        expect(localVariables.store.myName).toBe(undefined);
    });
});
