# Content Management System (CMS) [REST API]

This was built using `Express + TypeScript`

**NOTE:** For usage with postman, you can check for `CMS-API.postman_collection.json` file. Import it and get right into business.

## 💻 Installation and Setup

Clone down this repository. You will need `node` and `npm` installed globally on your machine.

Get contents from the schema.sql file and run

```sql
CREATE DATABSE cms;

USE cms;



CREATE  TABLE `post` (

`id`  INT  NOT NULL AUTO_INCREMENT,

`categoryId`  INT  NOT NULL,

`slug`  VARCHAR(255) NOT NULL,

`title`  VARCHAR(255) NOT NULL,

`user_uuid`  VARCHAR(50) NOT NULL,

`featuredImageURL`  VARCHAR(255) NOT NULL,

`body` LONGTEXT NOT NULL,

`updatedAt`  TIMESTAMP  NOT NULL  DEFAULT CURRENT_TIMESTAMP ON  UPDATE CURRENT_TIMESTAMP,

`createdAt`  TIMESTAMP  NOT NULL  DEFAULT CURRENT_TIMESTAMP,

PRIMARY KEY (`id`),

UNIQUE  INDEX  `slug_UNIQUE` (`slug`  ASC) VISIBLE);



CREATE  TABLE `category` (

`id`  INT  NOT NULL AUTO_INCREMENT,

`slug`  VARCHAR(255) NOT NULL,

`name`  VARCHAR(255) NOT NULL,

`updatedAt`  TIMESTAMP  NOT NULL  DEFAULT CURRENT_TIMESTAMP ON  UPDATE CURRENT_TIMESTAMP,

`createdAt`  TIMESTAMP  NOT NULL  DEFAULT CURRENT_TIMESTAMP,

PRIMARY KEY (`id`),

UNIQUE  INDEX  `slug_UNIQUE` (`slug`  ASC) VISIBLE);



CREATE  TABLE `user` (

`id`  INT  NOT NULL AUTO_INCREMENT,

`user_uuid`  VARCHAR(50) NOT NULL,

`emailAddress`  VARCHAR(200) NOT NULL,

`firstName`  VARCHAR(20) NOT NULL,

`lastName`  VARCHAR(20) NOT NULL,

`profileImageURL`  VARCHAR(255) NULL,

`password`  VARCHAR(255) NULL,

`provider` ENUM('google', 'twitter', 'facebook', 'email') NOT NULL  DEFAULT  'email',

`providerUserId`  VARCHAR(255) NULL,

`passwordResetToken`  VARCHAR(20) NULL,

`passwordResetTokenExpiry`  TIMESTAMP  NULL,

`updatedAt`  TIMESTAMP  NOT NULL  DEFAULT CURRENT_TIMESTAMP ON  UPDATE CURRENT_TIMESTAMP,

`createdAt`  TIMESTAMP  NOT NULL  DEFAULT CURRENT_TIMESTAMP,

PRIMARY KEY (`id`),

UNIQUE  INDEX  `user_uuid_UNIQUE` (`user_uuid`  ASC) VISIBLE,

UNIQUE  INDEX  `emailAddress_UNIQUE` (`emailAddress`  ASC) VISIBLE);



CREATE  TABLE `session` (

`id`  INT  NOT NULL AUTO_INCREMENT,

`user_uuid`  VARCHAR(50) NOT NULL,

`userAgent`  VARCHAR(255) NULL,

`updatedAt`  TIMESTAMP  NOT NULL  DEFAULT CURRENT_TIMESTAMP ON  UPDATE CURRENT_TIMESTAMP,

`createdAt`  TIMESTAMP  NOT NULL  DEFAULT CURRENT_TIMESTAMP,

PRIMARY KEY (`id`));



--inserting a default category

INSERT INTO  `cms`.`category` (`id`, `slug`, `name`) VALUES ('1', 'uncategorized', 'Uncategorized');
```

Installation: `npm install`

Dev server command: `npm run dev`

Build command: `npm run build`

Start server command: `npm run start`

Endpoint:`http://localhost:1337 or http://localhost:{SERVER_PORT}`

## 🗺️ \*.env Variables

    #--------------------------

    # MYSQL Variables

    #--------------------------

    #MYSQL databse host name - likely: localhost

    MYSQL_HOST=

    #MYSQL username

    MYSQL_USER=

    #MYSQL password

    MYSQL_PASSWORD=

    #MYSQL database

    MYSQL_DATABASE=



    #--------------------------

    # PassportJS Variables

    #--------------------------

    #Facebook

    FACEBOOK_CLIENT_ID=

    FACEBOOK_CLIENT_SECRET=

    #Google

    GOOGLE_CLIENT_ID=

    GOOGLE_CLIENT_SECRET=

    #X(Formerly Twitter)

    X_CLIENT_ID=

    X_CLIENT_SECRET=



    #--------------------------

    # SMTP Variables

    #--------------------------

    #port

    SMTP_PORT=

    #host

    SMTP_HOST=

    #username

    SMTP_USER=

    #password

    SMTP_PASS=



    #--------------------------

    # Other Variables

    #--------------------------

    #JWT secret token

    JWT_SECRET_TOKEN=

    #API url, e.g: http:localhost:1337

    BASE_SERVER_URL=

    #Client side base URL

    BASE_CLIENT_URL=

## 🔌 WebSocket Connection

```html
<!DOCTYPE html>

<html lang="en">
  <head>
    <meta charset="UTF-8" />

    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <title>Interacting with websocket :-)</title>

    <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
  </head>

  <body>
    <script>
      const socket = io("http://localhost:1337");

      socket.on("connection"); //initiate connection

      socket.on("response", (data) => {
        console.log("Response:", data);
        //Decode the response and do whatever needs to be done
        /**
- response format
- interface  IEmit {

target:  "category"  |  "user"  |  "post"  |  "session";

action:  "create"  |  "update"  |  "delete";

data: {

id?:  number  |  string;

[key:  string]:  any;

};

}
**/
      });
    </script>
  </body>
</html>
```

## 🌎 Endpoints

### ----------- User Endpoint

| Endpoint                                        | Description                              | Method   | req.params                   | req.query                              | req.body                                                                                                                   | Response code(s)        |
| ----------------------------------------------- | ---------------------------------------- | -------- | ---------------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| /api/v1/user/register                           | Create new user account                  | **POST** | null                         | null                                   | `{   emailAddress: string;   firstName: string;   lastName: string;   password: string;   passwordConfirmation: string; }` | 201, 409, 500           |
| /api/v1/user/login                              | login account                            | **POST** | null                         | null                                   | `{   email: string;   password: string; }`                                                                                 | 200, 401, 500           |
| /api/v1/user/login/facebook                     | facebook social login                    | **GET**  | null                         | null                                   | null                                                                                                                       | 200, 401, 500           |
| /api/v1/user/login/twitter                      | twitter social login                     | **GET**  | null                         | null                                   | null                                                                                                                       | 200, 401, 500           |
| /api/v1/user/login/google                       | google social login                      | **GET**  | null                         | null                                   | null                                                                                                                       | 200, 401, 500           |
| /api/v1/user                                    | get all users                            | **GET**  | null                         | `limit: number = 10; page: number = 1` | null                                                                                                                       | 200, 500                |
| /api/v1/user/:user_uuid                         | get info of a particular user            | **GET**  | `user_uuid: string`          | null                                   | null                                                                                                                       | 200, 500                |
| /api/v1/user/edit-user                          | edits the current logged in user info    | **PUT**  | null                         | null                                   | `{   emailAddress: string;   firstName: string;   lastName: string; }`                                                     | 200, 204, 403, 404, 500 |
| /api/v1/user/change-password                    | to change password of the logged in user | **PUT**  | null                         | null                                   | `{   oldPassword: string;   newPassword: string;   newPasswordConfirmation: string; }`                                     | 200, 204, 403, 404, 500 |
| /api/v1/user/forgot-password/:email             | sends a password reset email to user     | **GET**  | `email: string`              | null                                   | null                                                                                                                       | 200, 204, 404, 500      |
| /api/v1/user/reset-password/:passwordResetToken | resets user password                     | **GET**  | `passwordResetToken: string` | null                                   | null                                                                                                                       | 200, 204, 404, 500      |

### ----------- Category Endpoint

| Endpoint                     | Description                | Method     | req.params                                                | req.query                              | req.body             | Response code(s)        |
| ---------------------------- | -------------------------- | ---------- | --------------------------------------------------------- | -------------------------------------- | -------------------- | ----------------------- |
| /api/v1/category             | creates new category       | **POST**   | null                                                      | null                                   | `{   name: string }` | 201, 500                |
| /api/v1/category             | gets all category          | **GET**    | null                                                      | `limit: number = 10; page: number = 1` | null                 | 200, 500                |
| /api/v1/category/:param      | gets category from id/slug | **GET**    | case: slug `param: string;` case: postId `param: number;` | null                                   | null                 | 200, 404, 500           |
| /api/v1/category/:categoryId | updates a category         | **PUT**    | `categoryId: number;`                                     | null                                   | `{   name: string }` | 204, 400, 404, 409, 500 |
| /api/v1/category/:categoryId | deletes a category         | **DELETE** | `categoryId: number;`                                     | null                                   | null                 | 204, 400, 409, 500      |

### ----------- Post Endpoint

| Endpoint                   | Description                      | Method     | req.params                                                       | req.query                              | req.body                                                                                 | Response code(s)             |
| -------------------------- | -------------------------------- | ---------- | ---------------------------------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------- |
| /api/v1/post               | creates new post                 | **POST**   | null                                                             | null                                   | `{   categoryId: number;   title: string;   featuredImageURL: string;   body: string; }` | 201, 403, 500                |
| /api/v1/post               | gets all posts                   | **GET**    | null                                                             | `limit: number = 10; page: number = 1` | null                                                                                     | 200, 500                     |
| /api/v1/post/:param        | gets posts under a user/category | **GET**    | case: user_uuid `param: string` case: categoryId `param: number` | null                                   | null                                                                                     | 200, 500                     |
| /api/v1/post/single/:param | gets a single post               | **GET**    | case: slug `param: string` case: postId `param: number`          | null                                   | null                                                                                     | 200, 404, 500                |
| /api/v1/post/:postId       | edits post details               | **PUT**    | `postId: number`                                                 | null                                   | `{   categoryId: number;   title: string;   featuredImageURL: string;   body: string; }` | 204, 400, 403, 404, 409, 500 |
| /api/v1/post/:postId       | delete post                      | **DELETE** | `postId: number`                                                 | null                                   | null                                                                                     | 204, 400, 403, 409, 500      |

### ----------- Session Endpoint

| Endpoint        | Description                                      | Method     | req.params | req.query | req.body | Response code(s)   |
| --------------- | ------------------------------------------------ | ---------- | ---------- | --------- | -------- | ------------------ |
| /api/v1/session | gets all sessions of logged in user              | **GET**    | null       | null      | null     | 200, 403, 500      |
| /api/v1/session | delete the current session of the logged in user | **DELETE** | null       | null      | null     | 200, 403, 409, 500 |

## 🔒 Protected Routes

For user to access this routes, they are meant to be logged in and be issued an `accessToken` and `refreshToken`

The `accessToken` should be used in the Authorization header, i.e `Bearer: ${accessToken}`

The `refreshToken` on the other hand, should be set as the value of the `x-refresh` header

1.  /api/v1/user/edit-user
2.  /api/v1/user/change-password
3.  /api/v1/post **(POST)**
4.  /api/v1/post/:postId **(PUT)**
5.  /api/v1/post/:postId **(DELETE)**
6.  /api/v1/session **(GET)**
7.  /api/v1/session **(DELETE)**
