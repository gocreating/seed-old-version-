# Seed
A seed project for building a website using nodejs (back-end), angularjs (front-end) and mysql (database)  
  

## Tutorial

1. Create `config.js` in root folder:  

  ```
  module.exports = {
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

4. Start server  

  ```
  $ node app.js
  ```
