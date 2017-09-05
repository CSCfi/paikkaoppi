#!/bin/bash

function build {
    echo "Building app..."
    eval "ng build --target=production --environment=prod"
}

function deploy {
    echo "Deploy app to S3."
    eval "aws s3 cp --recursive --profile paikkaoppi-deploy ./proto s3://demo-paikkaoppi/proto/"
}

build && deploy
echo "Done."
exit
