import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';

export default [
	js.configs.recommended,
	...tseslint.configs.recommended,
	eslintConfigPrettier,
	{
		plugins: {
			prettier: eslintPluginPrettier,
		},
		files: ['**/*.js', '**/*.ts'],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'module',
			globals: {
				console: 'readonly',
				process: 'readonly',
				Buffer: 'readonly',
				__dirname: 'readonly',
				__filename: 'readonly',
				require: 'readonly',
				module: 'readonly',
				exports: 'readonly',
			},
		},
		rules: {
			'prettier/prettier': 'error',
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
			'no-console': 'off',
		},
	},
	{
		ignores: ['node_modules/', 'dist/', 'coverage/'],
	},
];
