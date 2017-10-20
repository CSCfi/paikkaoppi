#!/bin/bash

function build {
    echo "Updating dependencies..."
    eval "npm install"

    echo "Building app..."
    eval "ng build --target=production --environment=test --base-href=/app/"
}

function deploy {
    echo "Deploy app to server."
    
    # send to test server. You need to setup 'paikkaoppi-test-apache' to ssh/config
    eval "scp -r dist paikkaoppi-test-apache:"

    #set jar as executable, move it to /opt/paikkaoppi/, restart service
    eval "ssh paikkaoppi-test-apache 'sudo rm -rf /opt/paikkaoppi/static/app/*; sudo cp -R ~/dist/* /opt/paikkaoppi/static/app/; sudo chown -R root:root /opt/paikkaoppi/static/app/; sudo rm -rf ~/dist/*;'"
}

build && deploy
echo "Done."
exit
