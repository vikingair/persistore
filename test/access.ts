/**
 * This file is part of persistore which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 */
import { Access } from '../src/access';

describe('Persistore - VariableProvider', () => {
    it('returns the variables by the provider', () => {
        expect(Access.variables()).toEqual({
            store: {},
            prefix: '',
        });
        expect(Access.document()).toBe(window.document);
        expect(Access.storage(true)).toBe(window.localStorage);
        expect(Access.storage(false)).toBe(window.sessionStorage);
    });
});
