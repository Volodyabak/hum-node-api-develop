  
#!/bin/bash
#source /root/.bash_profile
#source /home/ec2-user/.bash_profile
# This script is executed after the source is copied to the instances
#echo $PATH #
#if [ "$APPLICATION_NAME" == "ArtistAppProductionTest" ]; then
##source /home/ubuntu/.profile
#APP_PATH=/home/ubuntu/hum-node-api/  
#else
#source /home/ec2-user/.bash_profile
#APP_PATH=/usr/hum/
#fi

#make the script play nice with nvm
export NVM_DIR="/home/ubuntu/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm

APP_PATH=/home/ubuntu/hum-node-api/

chown -R ubuntu:ubuntu ${APP_PATH}
cd ${APP_PATH}
npm install

#Build step, if any

#Run Test suite here, if any
#npm test
