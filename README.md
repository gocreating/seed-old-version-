# Seed

A seed project for building a website using nodejs (back-end), angularjs (front-end) and mysql (database)  

## Features

1. NodeJs + Express  
  Back-end

2. Angular  
  Front-end

3. MySQL  
  Database

4. Support HTTPS  
  Server

5. Rendering view on front-end  
  Reduce server overhead

6. Ajax & Json  
  Nothing special :)

7. Support LESS  
  Using less on back-end

8. Global Alert Message  
  Add/Push global messages, and it will stack on top of website

## To Be Build

9. i18n  
  Support multiple languages

10. Open Id  
  Login with Facebook, Twitter, Github, LinkedIn, and etc.

11. Captcha  
  It would be a third party captcha, because a native captcha build with node package requires lots of dependencies to be installed, which is really a bothering thing

12. Socket.io  
  You can build a chat room, broadcast messages from admin dashboard, or just push data from server, it's up to you

13. ng-material design  
  A front-end UI framework based on google material design and angular

14. Google Analysis  

## Tutorial

1. Create `config.js` in root folder:  

  ```javascript
  module.exports = {
    app: {
      port: {
        http: 4000,
        https: 4001
      }
    },
    db: {
      host: 'localhost',
      port: 3306,
      user: 'USERNAME',
      password: 'PASSWORD',
      database: 'DATABASE_NAME',
      timezone: '+00:00'
    },
    email: {
      sender: {
        user: 'USER@gmail.com',
        password: 'PASSWORD'
      },
      carbonCopy: [
        'ANOTHER_USER@gmail.com'
      ]
    },
    secret: {
      passwordSalt: 'saltForPassword',
      sessionSecret: 'saltForSession',
      cookieSecret: 'saltForCookie'
    }
  };
  ```

2. Create SSL files  

  ```
  $ openssl genrsa 1024 > secrets/ssl_key.pem
  $ openssl req -x509 -new -key secrets/ssl_key.pem > secrets/ssl_key_cert.pem
  ```
  In the second command, please fill in your own information

3. Install dependencies  

  ```
  $ npm install
  ```

4. Turn off the force compile option of lessMiddleware in `app.js`  

5. Start server  

  ```
  $ node app.js
  ```
