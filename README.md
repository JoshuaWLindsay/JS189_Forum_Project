# Holy Conferences for Sunday Sermons

Holy Conferences are a Puritan concept whereby small groups reflect on the Sunday Sermon and discern together whether the sermon is true to the Scriptures and how they can internalize the message into their own lives.

## Software version numbers

* Node: node -v16.17.1
* Browser: Safari Version 15.6.1 (15613.3.9.1.16, 15613)
* Database: PostgreSQL: psql (14.6 (Homebrew))

## How to install dependencies

Access root folder from code editor and command line, then run `npm install` to download all dependencies.

## How to setup database

Using Postgresql@14, `CREATE DATABASE forum_threads;`, change to `forum_threads` database, then create the other tables from `schema.sql`. Insert into the `users` table using the SQL query from `users.sql`. Then insert into the remaining tables the seed data using the SQL queries from `seed-data.sql`.

## npm start

You may use the command `npm start` to connect to localhost, then use the following [link](localhost:3000/) to reach the sign in page.

## Site navigation

1. Sign in page required for access to rest of site; use one of the usernames and passwords below.
2. Once signed you, the "Home Page" represents the churches currently posted.
3. Opening a church page lists the series uploaded.
4. Opening a series page lists the sermons from the series, with embedded YouTube videos.
5. Opening a sermon page lists the threads from the seed data with an option to create your own thread with group name and prompts. The threads represent the collections of objects from the database.
6. Either choose or create a new thread to open the thread page, which includes the thread creator's prompts for discussion. Users may then post their own comment(s).
7. All threads and posts are editable and deletable by their creator.

## Usernames, Passwords for seed data

username, password
1. admin, secret
2. developer, letmein
3. pastorJoe, John316
4. pastorAdam, Psalm1274
5. Melody, John1135
6. Sarah, Hebrews414
