// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

// Oskari-RPC maps need to be created in https://kartta.paikkatietoikkuna.fi/
// mapDomain is the browser https address of this paikkaoppi web site
// mapId is the id of the 'julkaistu kartta' in website: https://kartta.paikkatietoikkuna.fi/
export const environment = {
  production: false,
  mapEnv : "dev",
  mapDomain : "https://kartta.paikkatietoikkuna.fi",
  mapId : "87e9ad3a-a91f-4888-8262-4fc625102ee1",
  mapTools: {markerTool: true, areaTool: true},
  mapHelpVisibleInitially: false,
  apiUri: 'http://localhost:8000/api/v1',
};
