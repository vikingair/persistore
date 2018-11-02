[![GitHub license][license-image]][license-url]
[![npm package][npm-image]][npm-url] 
[![Travis][build-image]][build-url]
[![Coverage Status][coveralls-image]][coveralls-url]

# persistore

The `Persistore` is primary designed to use a very easy API (`get`, `set`, `remove`)
to store any string with fallback strategies that apply automatically to each
client browser. So if `localStorage` is not accessible it falls back internally to `cookies`.
And if this would be neither possible, it will just use local variables, which is as
persistent as possible in this situation without any backend support.

### Some aspects
- `flow` support out-of-the-box
- coverage of 100% is mandatory
- < 0.8 kB (gzipped) (see [bundlephobia](https://bundlephobia.com/result?p=persistore))
- any issues will be fixed as soon as possible

### Installation
##### With yarn
```
yarn add persistore
```

### Usage
```js
import { Persistore } from 'persistore';

Persistore.set('my-key', '{"here": "comes your data"}');

console.log(Persistore.get('my-key')); // prints: '{"here": "comes your data"}'

Persistore.remove('my-key');

console.log(Persistore.get('my-key')); // prints: undefined
```
Same is possible for persistence restricted to session lifetime:
```js
import { Persistore } from 'persistore';

Persistore.session.set('my-key', '{"here": "comes your data"}');

console.log(Persistore.session.get('my-key')); // prints: '{"here": "comes your data"}'

Persistore.session.remove('my-key');

console.log(Persistore.session.get('my-key')); // prints: undefined
```
HINT: Since most browsers have a strict cookie size limitation, the Persistore will throw an error if
it would try to insert a cookie which exceeds the maximum size of 4093 bytes (iOS Safari reserves 3 additional bytes).
The actual browser behaviour in that case would be to silently do nothing, what can lead to strange behaviour of your application.
Therefore you should catch the possibly thrown error if you want to store large strings to handle this special case.
Another useful information for you might be: localStorage and sessionStorage are not available on some browsers. The
most common cases are iOS-Safari-Private-Mode users, where the Persistore will always fallback to cookies.

### Configuration
It is also possible to make some configuration. For now it is only the key prefixing.
```js
import { Persistore } from 'persistore';

Persistore.config({ prefix: 'myApp.' });
```
  
[license-image]: https://img.shields.io/badge/license-MIT-blue.svg
[license-url]: https://github.com/fdc-viktor-luft/persistore/blob/master/LICENSE
[build-image]: https://img.shields.io/travis/fdc-viktor-luft/persistore/master.svg?style=flat-square
[build-url]: https://travis-ci.org/fdc-viktor-luft/persistore
[npm-image]: https://img.shields.io/npm/v/persistore.svg?style=flat-square
[npm-url]: https://www.npmjs.org/package/persistore
[coveralls-image]: https://coveralls.io/repos/github/fdc-viktor-luft/persistore/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/fdc-viktor-luft/persistore?branch=master
