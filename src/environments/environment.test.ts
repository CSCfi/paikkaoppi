// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

// Oskari-RPC maps need to be created in https://kartta.paikkatietoikkuna.fi/
// mapDomain is the browser https address of this paikkaoppi web site
// mapId is the id of the 'julkaistu kartta' in website: https://kartta.paikkatietoikkuna.fi/
export const environment = {
  production: true,
  mapEnv : 'test',
  mapDomain : 'https://kartta.paikkatietoikkuna.fi',
  mapId : 'd6524c8e-9e75-45e9-a82c-b9a181bc0206',
  mapTools: {
    markerTool: true, areaTool: true, trackLocation: false,
    measureLineTool: false, measureAreaTool: false,
    centerToLocation: false, changeLayer: false},
  mapHelpVisibleInitially: false,
  apiUri: 'https://ec2-52-48-217-144.eu-west-1.compute.amazonaws.com/api/v1',
}
