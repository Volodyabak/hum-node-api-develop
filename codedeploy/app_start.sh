#!/bin/bash

#make the script play nice with nvm
export NVM_DIR="/home/ubuntu/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm

APP_PATH=/home/ubuntu/hum-node-api/

pm2 stop NodeAPI
pm2 delete NodeAPI
pm2 start ${APP_PATH}index.js -n NodeAPI -f
#node index.js