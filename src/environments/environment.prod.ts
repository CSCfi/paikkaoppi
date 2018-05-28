// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

// Oskari-RPC maps need to be created in https://kartta.paikkatietoikkuna.fi/
// mapDomain is the browser https address of this paikkaoppi web site
// mapId is the id of the 'julkaistu kartta' in website: https://kartta.paikkatietoikkuna.fi/
export const environment = {
  production: true,
  mapEnv : 'prod',
  mapDomain : 'https://kartta.paikkatietoikkuna.fi',
  mapId : '',
  mapTools: {markerTool: true, areaTool: true, routeTool: true, trackLocation: true},
  mapHelpVisibleInitially: false,
  apiUri: 'http://localhost:8000/api/v1',
  loginPageUri: 'https://paikkaoppi.csc.fi',
  logoutUri: '/Shibboleth.sso/Logout?return=https://mpass-proxy-test.csc.fi/idp/profile/Logout?return=https://paikkaoppi.csc.fi',
}
