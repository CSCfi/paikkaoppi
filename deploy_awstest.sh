#!/bin/bash

function build {
    echo "Building app..."
    eval "ng build --target=production --environment=aws-test"
}

function deploy {
    echo "Deploy app to S3."
    eval "aws s3 cp --recursive --profile paikkaoppi-dev ./dist s3://paikkaoppi/app/test"
}

build && deploy
echo "Done."
exit
