// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: true,
  mapEnv : "test",
  mapDomain : "https://kartta.paikkatietoikkuna.fi",
  mapId : "3ccb28fc-2df8-4ad8-b5b2-85d415297882",
  mapTools: {markerTool: true, areaTool: false},
  mapHelpVisibleInitially: true,
};
