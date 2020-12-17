#!/bin/bash

function build {
    echo "Updating dependencies..."
    eval "npm install"

    echo "Building app for prod..."
    eval "ng build --target=production --environment=prod --base-href=/app/"
}

function deploy {
    echo "Deploy app to prod server."
    
    # send to test server. You need to setup 'paikkaoppi-prod-front' to ssh/config
    eval "scp -r dist kartta.paikkaoppi.fi:"

    # move static site to /opt/paikkaoppi/
    eval "ssh kartta.paikkaoppi.fi 'sudo rm -rf /opt/paikkaoppi/static/app/*; sudo cp -R ~/dist/* /opt/paikkaoppi/static/app/; sudo chown -R root:root /opt/paikkaoppi/static/app/; sudo rm -rf ~/dist/*;'"
}

build && deploy
echo "Done."
exit
