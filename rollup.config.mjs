import babel from '@rollup/plugin-babel';
import typescript from 'rollup-plugin-typescript2';

export default {
    input: 'src/index.ts',
    plugins: [
        typescript(),
        babel({
            babelHelpers: 'bundled',
            exclude: 'node_modules/**',
            presets: [
                [
                    '@babel/preset-env',
                    { modules: false, targets: { node: '14' } },
                ],
            ],
        }),
    ],
    output: [{
        dir: 'dist/cjs',
        format: 'cjs'
    }, {
        dir: 'dist/esm',
        format: 'esm'
    }]
};
