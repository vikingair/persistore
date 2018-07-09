// @flow

import { Spy } from 'spy4js';

const oldDescribe = describe;
window.describe = (string, func) =>
    oldDescribe(string, () => {
        afterEach(Spy.restoreAll);
        return func();
    });
