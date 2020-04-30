# sdvx-tracker-backend

### connectionString.json
This file needs to be in the /queries folder. It contains a few key points to communicate with the database. Keep in mind the database is a PostgreSQL db

```
{
  "host": "..." // This should be your host, usually this is just "localhost"
  "port": # // Whatever your postgres port is, by default this should be 5432 if memory serves me right.
  "database": "..." // The name for your database, you make this yourself when you create the database.
  "user": "..." // By default this is just "postgres"
  "password:" "..." // The password you gave to your database
}

``` 
