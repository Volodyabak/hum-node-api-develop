#!/bin/bash

#make the script play nice with nvm
export NVM_DIR="/home/ubuntu/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm

APP_PATH=/home/ubuntu/hum-node-api/

# This script is used to stop application
cd ${APP_PATH} 
pm2 stop www || true