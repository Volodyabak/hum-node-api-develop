# Environments

## Deploying a new version of the API

Merging code into the `develop` or `production` branch will trigger a new build of the Docker image. The EC2 environments are set to poll the ECR registries every 30 minutes for new images.

## Adding/changing env vars

Each EC2 has a set of environment variables loaded in a .env file in the root of the repo.

To change an env var:
1. SSH into the EC2 instance (PEM key in LP)
2. Change the variable in the .env file in the `hum-node-api` repo
3. Run `docker-compose down && docker-compose up`

This restarts the container configuration with the new environment variables.