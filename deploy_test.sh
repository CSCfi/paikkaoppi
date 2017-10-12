#!/bin/bash

function build {
    echo "Updating dependencies..."
    eval "npm install"

    echo "Building app..."
    eval "ng build --target=production --environment=test"
}

function deploy {
    echo "Deploy app to server."
    
    # send to test server. You need to setup 'paikkaoppi-test' to ssh/config
    eval "scp -r dist paikkaoppi-test:"

    #set jar as executable, move it to /opt/paikkaoppi/, restart service
    eval "ssh paikkaoppi-test 'sudo rm -rf /opt/paikkaoppi/static/*; sudo mv -f ~/dist/* /opt/paikkaoppi/static/'"
}

build && deploy
echo "Done."
exit
