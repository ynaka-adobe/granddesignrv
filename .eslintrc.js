module.exports = {
  root: true,
  extends: 'airbnb-base',
  env: {
    browser: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    allowImportExportEverywhere: true,
    sourceType: 'module',
    requireConfigFile: false,
  },
  rules: {
    'import/extensions': ['error', { js: 'always' }], // require js file extensions in imports
    'linebreak-style': ['error', 'unix'], // enforce unix linebreaks
    'no-param-reassign': [2, { props: false }], // allow modifying properties of param
    'import/no-cycle': 0, // Allow modules to use each other
    // Names we don't control: DM/Scene7 dispatcher hook, Adobe I/O Runtime web-action
    // params, and fields from the Adobe Target / Workfront API payloads.
    'no-underscore-dangle': ['error', {
      allow: [
        '__dmRender__',
        '__ow_method',
        '__ow_body',
        '__ow_headers',
        '__ow_path',
        '__ow_query',
        '_activity',
        '_linkedCampaignId',
      ],
    }],
  },
  overrides: [
    {
      // tools/ holds standalone DA-hosted apps rather than site runtime code. They load
      // ES modules from https:// URLs, speak OAuth/Workfront payloads verbatim, and are
      // written as one file of hoisted handlers, so a few airbnb style rules don't apply.
      files: ['tools/**/*.js'],
      rules: {
        'import/no-unresolved': ['error', { ignore: ['^https?://'] }],
        camelcase: 0, // access_token, refresh_token, expires_in, ... come from the APIs
        'max-len': 0,
        'no-use-before-define': ['error', { functions: false, variables: false }],
        'no-nested-ternary': 0,
        'no-inner-declarations': 0,
        'no-promise-executor-return': 0,
        'no-restricted-syntax': 0,
      },
    },
  ],
};
