#!/bin/bash

#this script should be run as root (in the appspec.yml)
# alternative is to specify permissions in the appspec.yml
# https://docs.aws.amazon.com/codedeploy/latest/userguide/reference-appspec-file-structure-permissions.html

yum -y update


APP_PATH=/home/ubuntu/hum-node-api/

export app_root=${APP_PATH}

if [ -d "$app_root" ];then
    rm -rf ${app_root}*
else
    mkdir -p $app_root
fi



# cd /usr/hum
# sudo NODE_ENV=development nohup nodejs index.js > /dev/null 2> /dev/null < /dev/null &
# In the below script, we are changing the ownership of our application folder & starting application process.

# Note: Use “/dev/null 2> /dev/null < /dev/null &” to get out of nohup shell automatically, else your CodeDeploy would stuck at AfterInstall event.

# #!/bin/bash
# cd /home/ubuntu/production/weone-backend
# sudo chown -R ubuntu:ubuntu /home/ubuntu/production
# sudo NODE_ENV=production nohup nodejs app.js > /dev/null 2> /dev/null < /dev/null &