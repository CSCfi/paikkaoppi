#!/bin/bash

function deploy {
    echo "Deploy app to S3."
    eval "aws s3 cp --recursive --profile paikkaoppi-deploy ./proto s3://demo-paikkaoppi/proto/"
}

deploy
echo "Done."
exit
