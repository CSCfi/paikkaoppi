# Paikkaoppi UI

This project was generated with [Angular CLI](https://github.com/angular/angular-cli)

## Environment
### Ubuntu
1. Install node and npm:
- `curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -`
- `sudo apt-get install -y nodejs`

2. Install @angular/cli globally
- `npm install -g @angular/cli`

3. Upgrade @angular/cli (optional)
- `sudo npm uninstall -g angular-cli`
- `sudo npm install -g @angular/cli`

4. Test your environment
- `node --version`
- `npm --version`
- `ng version`

## Development server

1. Run development server locally
- `npm install`
- `ng serve`
- Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Deployment

First add following to your .ssh/config -file:

`
Host paikkaoppi-prod-front
  HostName paikkaoppi.csc.fi
  IdentityFile ~/.ssh/id_rsa_paikkaoppi
  User mkettunen

Host paikkaoppi-prod-be-1
  HostName paikkaoppibe1.csc.fi
  ProxyCommand ssh -q paikkaoppi-prod-front -W %h:%p
  IdentityFile ~/.ssh/id_rsa_paikkaoppi
  User mkettunen

Host paikkaoppi-prod-be-2
  HostName paikkaoppibe2.csc.fi
  ProxyCommand ssh -q paikkaoppi-prod-front -W %h:%p
  IdentityFile ~/.ssh/id_rsa_paikkaoppi
  User mkettunen

Host paikkaoppi-prod-db
  HostName paikkaoppidb.csc.fi
  ProxyCommand ssh -q paikkaoppi-prod-front -W %h:%p
  IdentityFile ~/.ssh/id_rsa_paikkaoppi
  User mkettunen

Host paikkaoppi-dev-front
  HostName paikkaoppidev.csc.fi
  IdentityFile ~/.ssh/id_rsa_paikkaoppi
  User mkettunen

Host paikkaoppi-dev-be-1
  HostName paikkaoppidevbe1.csc.fi
  ProxyCommand ssh -q paikkaoppi-dev-front -W %h:%p
  IdentityFile ~/.ssh/id_rsa_paikkaoppi
  User mkettunen

Host paikkaoppi-dev-be-2
  HostName paikkaoppidevbe2.csc.fi
  ProxyCommand ssh -q paikkaoppi-dev-front -W %h:%p
  IdentityFile ~/.ssh/id_rsa_paikkaoppi
  User mkettunen

Host paikkaoppi-dev-db
  HostName paikkaoppidevdb.csc.fi
  ProxyCommand ssh -q paikkaoppi-dev-front -W %h:%p
  IdentityFile ~/.ssh/id_rsa_paikkaoppi
  User mkettunen
`

by changing user to your own and possible rename identity file.

### Test (CSC)

`./deploy_test.sh`

### Production (CSC)

`./deploy_prod.sh`

## kartta.paikkatietoikkuna.fi

- paikkaoppi-projekti@affecto.flowdock.com
- paikkaoppi
- dir45!e84ER