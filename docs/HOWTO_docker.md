# Developing with Docker containers

First time using docker? See [environment setup](#environment-setup).

## Running Hum API containers
- The node image we're using is Alpine Linux, so use `sh` instead of `bash` and the apk package installer

#### Useful commands
- Build/start: `docker-compose up -d`
    - the `-d` flags run the container in the background, remove to see output in the terminal
- You can check `localhost:8080/heath`, if it says `is healthy` then your API is running!
- Stopping containers:
    - `docker-compose down`
    - Also you can stop a container gracefully with: `docker stop {CONTAINER NAME}`
    - If something is not responding, you can stop immediately: `docker kill {CONTAINER NAME}`
- Clear images (useful for freeing up memory): `docker image prune`

#### Troubleshooting
- Find the container name using `docker ps`:
    ```
    user@machine:~/artistory/hum-node-api$ docker ps
    CONTAINER ID   IMAGE     COMMAND                  CREATED         STATUS         PORTS                    NAMES
    fe8be14ede28   hum-api   "docker-entrypoint.s…"   9 seconds ago   Up 7 seconds   0.0.0.0:8080->8080/tcp   suspicious_carson << {CONTAINER NAME; this changes each time}
    ```

- To run a command in container:  `docker exec -it {CONTAINER NAME} {COMMAND}`
    - In our case, `docker exec -it suspicious_carson sh`

- You can also see logs outside of the container: `docker logs {CONTAINER NAME}`

- To see stopped containers: `docker ps -a`

#### Container configuration
The Docker configuration is outlined in the `docker-compose.yml`. The `hum-api` container is defined in the `Dockerfile` at the root of this repo. This is the container that is built/deployed to AWS, so testing with this container will be closer to production conditions than using your local machine. There is an addition container in the deploy config called `watchtower`; this is set to poll AWS ECR repo for the API every 30 minutes to check for a new image, which is built/loaded to ECR (`hum-api-registry`) every time a branch is merged to develop or production and tagged as such.

The `.env` variables are filled in in the `docker-compose` at build time:
```
DB_HOST={URI for database}
DB_PASSWORD={Database user password}
DB_NAME={Name of the database}
DB_USER={Username for database}
DB_PORT={Database port}
SPOTIFY_SECRET={Secret for spotify API}
ONE_SIGNAL_API_KEY: {API key for OneSignal}
ONE_SIGNAL_APP_ID: {OneSignal internal app id}
ONE_SIGNAL_API_BASE_URL: {Root url for OneSignal}
S3_REGION: ${Region for profile photo bucket}
S3_ACCESS_KEY: ${AWS access key for s3 bucket access}
S3_SECRET_KEY: ${AWS secret for s3 bucket access}
S3_BUCKET_NAME: ${Bucket for profile photos}
```

All of these values should be available in LastPass. You also need to set a `DEV_ENV` variable in the `.env` to specify `develop` or `production`.

## Environment Setup

#### Install Docker
Tutorial: https://docs.docker.com/get-started/

#### Install docker-compose
Tutorial: https://docs.docker.com/compose/install/

#### Repo file structure
Much like a `.gitignore` and `.dockerignore` contains all the files we _don't_ want to copy into the container. This should generaly be any build artifacts, data, or other bulky files that are not crucial to the running of the app.

#### User security
You don't want the root user to run all container commands, so we make a user named `node` to run commands

## Further Reading
- [Using PM2 inside containers](https://pm2.keymetrics.io/docs/usage/docker-pm2-nodejs/)
- [NodeJS docker tutorial](https://www.digitalocean.com/community/tutorials/how-to-build-a-node-js-application-with-docker-on-ubuntu-20-04)
