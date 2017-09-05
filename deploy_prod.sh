#!/bin/bash

function build {
    echo "Building app..."
    eval "ng build --target=production --environment=prod"
}

function deploy {
    echo "Deploy app to S3."
    eval "aws s3 cp --recursive --profile perttvil-personal ./dist s3://demo-paikkaoppi/app/prod"
}

build && deploy
echo "Done."
exit
