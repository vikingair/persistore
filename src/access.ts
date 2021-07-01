/**
 * This file is part of persistore which is released under MIT license.
 *
 * The LICENSE file can be found in the root directory of this project.
 *
 */

const variables: {
    lsa?: boolean; // local storage available
    ssa?: boolean; // session storage available
    ca?: boolean; // cookies available
    ci?: boolean; // cookies insecure
    store: { [key: string]: string | undefined };
    prefix: string;
} = {
    store: {},
    prefix: '',
};

export const Access = {
    variables: () => variables,
    storage: (local: boolean) => (local ? window.localStorage : window.sessionStorage),
    document: () => window.document,
};
