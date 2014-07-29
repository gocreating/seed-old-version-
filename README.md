# Seed
A seed project for building a website using nodejs (back-end), angularjs (front-end) and mysql (database)  
  

## Tutorial

1. Create `config.js` :  

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
2. Install dependencies  

  ```
  $ npm install
  ```

3. Start server  

  ```
  $ node app.js
  ```