#!/bin/bash

if [ $# != 1 ] && [ $# != 8 ] ; then cat << EOM
    This script is used for deploying to blue/green configured environments

    You should build the app before using this script, eg: 'mvn clean package'

    usage: $0 SPACE EMAIL PASSWORD ENDPOINT APP ORG DOMAIN PATH_TO_CF

    where SPACE is one of (staging|production)
      and (optional) PATH_TO_CF is the path to the 'cf' executable
      and (optional) EMAIL and PASSWORD are your CF credentials

    *** if the optional arguments are not passed in, it assumes 'cf'
        is on your path and you are logged in correctly

    *** passing in one optional argument requires all others as well

EOM
    exit
fi

echo ====================================================================================
echo "Starting deployment script"
echo ====================================================================================

SPACE=$1
USER=$2
PASS=$3
ENDPOINT=$4
APP=$5
ORG=$6
DOMAIN=$7
MANIFEST=$8
CF=$9

SCRIPTDIR=$(dirname $0)
CF=cf

echo ====================================================================================
echo Log in to CF Env $ENDPOINT
echo ====================================================================================
$CF logout
$CF api $ENDPOINT --skip-ssl-validation || $CF logout
$CF auth $USER $PASS || echo "Error: User Credentials are wrong"
$CF target -o $ORG -s $SPACE || echo "Error: ORG & SPACE not set"

echo ====================================================================================
echo Deploying $APP
echo ====================================================================================
$CF push $NEXT -f $MANIFEST || exit
