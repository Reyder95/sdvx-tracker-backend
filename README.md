# sdvx-tracker-backend

# Archive Note
Alongside the front end of this project I will be archiving this repository as well. See the front end here and the note that goes along with it: https://github.com/Reyder95/sdvx-tracker-frontend/settings

### connectionString.json
This file needs to be in the /queries folder. It contains a few key points to communicate with the database. Keep in mind the database is a PostgreSQL db

```
{
  "host": "...",
  "port": #,
  "database": "...",
  "user": "...",
  "password": "..."
}

``` 
**host** is the host IP of the database. Typically this is localhost if you're hosting your db on the same machine as the back end. Otherwise you'll have to allow postgres for outside connections and set this as the IP that postgres is being hosted on  
  
**port** is the port that your postgres is being hosted on. By default this number is 5432, but you can change it during setup so make sure you know the port.  
  
**database** is the database name that you created. Mine is sepia-db, but you can name it anything, as long as this matches the DB you wish to connect to.  
  
**user** is the user that is meant to access the database. By default this is 'postgres' but you can also create an entirely new user if you wish as long as that user is specified here and is able to connect to the specified database.  
  
**password** is the password you gave the user that you specified in **user**.

## .env
This file is what node will use for 3 things: Cookie secret (to hash the cookies), JWT secret (to hash JWTs), and origin (what cors wants as its origin). Just create a file named .env inside the root of the project and give it these values
```
COOKIE_SECRET=anythingyouwanthere
JWT_SECRET=anythingyouwanthere
ORIGIN=http://whereveryourreactappislocated:port
```
