// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

// Oskari-RPC maps need to be created in https://kartta.paikkatietoikkuna.fi/
// mapDomain is the browser https address of this paikkaoppi web site
// mapId is the id of the 'julkaistu kartta' in website: https://kartta.paikkatietoikkuna.fi
export const environment = {
  production: true,
  mapEnv : "aws-test",
  //mapDomain : "https://d9ecs9v95rpj5.cloudfront.net",
  mapDomain : "https://kartta.paikkatietoikkuna.fi",
  mapId : "3ccb28fc-2df8-4ad8-b5b2-85d415297882",
  mapTools: {markerTool: true, areaTool: true},
  mapHelpVisibleInitially: true,
  apiUri: 'https://d2esrtjkfszxd1.cloudfront.net/api/v1',
  apiMock : false,
};
