#!/bin/bash

function build {
    echo "Updating dependencies..."
    eval "npm install"

    echo "Building app for test..."
    eval "ng build --target=production --environment=test --base-href=/app/"
}

function deploy {
    echo "Deploy app to test server."
    
    # send to test server. You need to setup 'paikkaoppi-dev-front' to ssh/config
    eval "scp -r dist paikkaoppi-dev-front:"

    # move static site to /opt/paikkaoppi/
    eval "ssh paikkaoppi-dev-front 'sudo rm -rf /opt/paikkaoppi/static/app/*; sudo cp -R ~/dist/* /opt/paikkaoppi/static/app/; sudo chown -R root:root /opt/paikkaoppi/static/app/; sudo rm -rf ~/dist/*;'"
}

build && deploy
echo "Done."
exit
