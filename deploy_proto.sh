#!/bin/bash

function deploy {
    echo "Deploy app to S3."
    eval "aws s3 cp --recursive --profile paikkaoppi-dev ./proto s3://paikkaoppi/app/proto"
}

deploy
echo "Done."
exit
