import { defineConfig } from "drizzle-kit";


import { config } from 'dotenv';

/*
This is the basic configuration for drizzle file 

1) dialect =  means the database we are using 
2) schema = where is the actual drizzle stuff present that will be converted to sql 
3 ) out = where shoudl i keep the output sql generated from the schema.ts
4 ) credentials = info related to how to connect to the actual database(postgres)

*/


config({ path: "../../.env" });


export default defineConfig({
    dialect: "postgresql",
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    dbCredentials: {
        url: process.env.DATABASE_URL!
    }
});


/* 

Things to know : 


when we run the drizzle migration code what are the things that are getting generated and 
how does it help ??


1 ) 0000_flaky_maggott.sql =  this is the file that will be executed in the sql database

2 ) meta/_journal.json = the metadata file that keeps track of all the migrations that have been executed in the database 

3 ) meta /0000_snapshot.json =  this is the snapshot of the last state of the database before the migration was executed


Now how does this works very roughly : 

we write the sql in schema.ts  -> now generate the sql file -> some meta data is there
-> now take the snapshot of the code when you run it 


later you change the schema.ts -> old snapshot is compared with this and now 
changes happen


*/