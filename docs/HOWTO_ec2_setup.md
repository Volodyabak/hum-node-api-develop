## EC2 environment

### Setup
1. Start EC2
    - Image: `t3a.medium` (AMI ID: `ami-09e67e426f25ce0d7`)
    - VPC: `vpc-5b86e03e` (default)
    - SSH Key (create and put in LP)
    - IAM Role: `mys3role` (role to give S3/Cloudwatch)
    - `hum` security group

2. Install things

```
export DOCKER_COMPOSE_VERSION=1.29.2
export AWS_ACCESS_KEY={Value in LP}
export AWS_ACCESS_KEY_SECRET={Value in LP}
export AWS_REGION=us-east-1

sudo apt-get update

# install latest docker using convenience script
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# install docker-compose
sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# aws cli
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
sudo apt install unzip
unzip awscliv2.zip
sudo ./aws/install

# add aws profile
mkdir .aws/
touch credentials
# this is for user ec2-user in IAM
echo -e "[default]\naws_access_key_id=${AWS_ACCESS_KEY}\naws_secret_access_key=${AWS_ACCESS_KEY_SECRET}\naws_region=${AWS_REGION}" >> .aws/credentials

# add git/ssh key to access repo
sudo apt install git-all
ssh-keygen -t ed25519 -C "dev@artistory.net"

# this allows docker to be run not as sudo
# need to reset connection for it to take effect
sudo groupadd docker
sudo usermod -aG docker $USER

# install ECR cred helper
sudo apt install amazon-ecr-credential-helper
```

3. Set up creds/env vars
    - ec2-user for AWS access keys
    - github ssh key for dev/prod in ArtistoryDev account (using email: ssh-keygen -t ed25519 -C "dev@artistory.net" / no passphrase)
    - SSH key for access (in lastpass)

4. Clone this repo
    - Create a `.env` file in the `hum-node-api` repo with required credentials and also a `DEV_ENV` (production or develop)
    - Make sure the repo is on the correct branch matching the environment of the server

5. Watchtower setup
To use Watchtower with AWS ECR, we also need to install a helper to log in to ECR before pulling a new version of the container. [Guide available here](https://containrrr.dev/watchtower/private-registries/)

High level:
- Build Go credential helper (NB - Need to use image in this repo `ecr-cred.dockerfile` because it doesn't work with Go over v. 1.15)
    - `docker build -t aws-ecr-dock-cred-helper --file ecr-cred.dockerfile .`
- Store cred helper command in volume to be attached to Watchtower container
- Edit docker config with AWS account number
- AWS creds should be in the directory above ^^ or else the cred helper won't be able to login to ECR; need to use the `default` profile also


6. `docker-compose pull && docker-compose up` from inside the `hum-node-api` repo

7. Assign instance IP to URL in Route 53; create a corresponding stage in Route 53 or load the `api_spec.yml` to create a new API