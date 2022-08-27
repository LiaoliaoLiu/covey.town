# Covey.Town with Enhanced Chat Features

Based on the original version, this fork adds necessary functions to the Chat sidebar. In the current iteration, we added:

1. Direct messages
2. Conversation Area messages
3. Image/file sending
4. Advanced Message filtering

![overview](docs/revamped-chat-bar.png)

A [demo](https://voluble-creponne-519431.netlify.app/) was hosted on Heroku (backend) and Netlify (frontend). The build process is mostly the same as the original. But because we used an Amazon S3 instance as the image/file server, you need to follow the extra steps to set up the microservice to get these functions working.

> Because Twilio charges us each connection to the backend by minutes, the current max participant number was set to 2.

# Covey.Town

Covey.Town provides a virtual meeting space where different groups of people can have simultaneous video calls, allowing participants to drift between different conversations, just like in real life.
Covey.Town was built for Northeastern's [Spring 2021 software engineering course](https://neu-se.github.io/CS4530-CS5500-Spring-2021/), and is designed to be reused across semesters.
You can view our reference deployment of the app at [app.covey.town](https://app.covey.town/) - this is the version that students built on, and our [project showcase](https://neu-se.github.io/CS4530-CS5500-Spring-2021/project-showcase) highlights select projects from Spring 2021.

![Covey.Town Architecture](docs/covey-town-architecture.png)

The figure above depicts the high-level architecture of Covey.Town.
The frontend client (in the `frontend` directory of this repository) uses the [PhaserJS Game Library](https://phaser.io) to create a 2D game interface, using tilemaps and sprites.
The frontend implements video chat using the [Twilio Programmable Video](https://www.twilio.com/docs/video) API, and that aspect of the interface relies heavily on [Twilio's React Starter App](https://github.com/twilio/twilio-video-app-react). Twilio's React Starter App is packaged and reused under the Apache License, 2.0.

A backend service (in the `services/townService` directory) implements the application logic: tracking which "towns" are available to be joined, and the state of each of those towns.

## Running this app locally

Running the application locally entails running both the backend service and a frontend.

### Setting up the backend

To run the backend, you will need a Twilio account. Twilio provides new accounts with $15 of credit, which is more than enough to get started.
To create an account and configure your local environment:

1. Go to [Twilio](https://www.twilio.com/) and create an account. You do not need to provide a credit card to create a trial account.
2. Create an API key and secret (select "API Keys" on the left under "Settings")
3. Create a `.env` file in the `services/townService` directory, setting the values as follows:

| Config Value            | Description                               |
| ----------------------- | ----------------------------------------- |
| `TWILIO_ACCOUNT_SID`    | Visible on your twilio account dashboard. |
| `TWILIO_API_KEY_SID`    | The SID of the new API key you created.   |
| `TWILIO_API_KEY_SECRET` | The secret for the API key you created.   |
| `TWILIO_API_AUTH_TOKEN` | Visible on your twilio account dashboard. |

### Starting the backend

Once your backend is configured, you can start it by running `npm start` in the `services/townService` directory (the first time you run it, you will also need to run `npm install`).
The backend will automatically restart if you change any of the files in the `services/townService/src` directory.

### Configuring the frontend

Create a `.env` file in the `frontend` directory, with the line: `REACT_APP_TOWNS_SERVICE_URL=http://localhost:8081` (if you deploy the towns service to another location, put that location here instead)

### Configuring the S3 Bucket

To send image/file messages, you will need an AWS account and its S3 bucket service. S3 bucket provides new accounts with 12 months credit and 5G storage memory, which is enough for us to get started.

To configuring the S3 bucket service, you will need to configure the new bucket firstly:

1. Go to [AWS](https://aws.amazon.com/) and create an account. You may register with your credit card and mail address.
2. Create a S3 bucket with a bucket name and specified storage region. Record the name and region and add them in `.env` file as follows.
3. Find the `Permissions` tab and then:
  
    3.1. Set `Permissions overview` to public.
    
    3.2. Uncheck `Block all public access`.
    
    3.3. Edit the `Bucket Policy` with the following code. Notice to replace `BUCKET_NAME` with your bucket name.

    ```
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "PublicListGet",
                "Effect": "Allow",
                "Principal": "*",
                "Action": [
                    "s3:List*",
                    "s3:Get*"
                ],
                "Resource": [
                    "arn:aws:s3:::{BUCKET_NAME}",
                    "arn:aws:s3:::{BUCKET_NAME}/*"
                ]
            }
        ]
    }
    ```

    3.4. Edit the `CORS policy` with the following code.

    ```
    [
        {
            "AllowedHeaders": [
                "*"
            ],
            "AllowedMethods": [
                "PUT",
                "POST",
                "DELETE",
                "GET"
            ],
            "AllowedOrigins": [
                "*"
            ],
            "ExposeHeaders": []
        }
    ]
    ```
4. Create an `Access Point`.

5. Go to `Security Credentials` from the drop-down menu of your profile and find `Access keys (access key ID and secret access key)`. Create a new Access Key. Remember to memory the Access Key ID and its secret. Then add them in `.env` as follows.

6. Get the file path prefix. In common, the format of the prefix is `https://{BUCKET_NAME}.s3.{REGION}.com/` if you do not create a folder in your bucket.

7. Open the `.env` file in the `frontend` directory, setting the values as follows:

| Config Value                  | Description                             |
| ----------------------------- | --------------------------------------- |
| `REACT_APP_S3_BUCKET`         | Visible on your S3 bucket dashboard.    |
| `REACT_APP_REGION`            | The region of the bucket you specified. |
| `REACT_APP_ACCESSKEY_ID`      | The Access Key ID you created.          |
| `REACT_APP_SECRET_ACCESS_KEY` | The secret of Access Key ID.            |
| `REACT_APP_FILE_PATH_PREFIX`  | The path prefix where files are stored. |

### Running the frontend

In the `frontend` directory, run `npm start` (again, you'll need to run `npm install` the very first time). After several moments (or minutes, depending on the speed of your machine), a browser will open with the frontend running locally.
The frontend will automatically re-compile and reload in your browser if you change any files in the `frontend/src` directory.

## References

- [AutoComplete Component](https://www.npmjs.com/package/chakra-ui-autocomplete)

- [Upload Files to S3 Bucket](https://javascript.plainenglish.io/how-to-upload-files-to-aws-s3-in-react-591e533d615e)
