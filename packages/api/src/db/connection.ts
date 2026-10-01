import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.ts";




//Create a raw tcp conneciton with the database (Postgres )
const client = postgres(process.env.DATABASE_URL!);

//Passing that connection to the drizzle and making the DB object 
export const db = drizzle(client, { schema });



/*

connection is established with the database 

somehow this connection is now also given to drizzle and the schemas we have is also given
to drizzle now it is the work of drizzle to do what it does internalylly ......


*/

/*

also we have this file to server what purpose ??


later when the backend wants to get some data or have to insert stuff 
this db object is what will be used for all such purposes : 





1 ) when query is done , we need strict naming for the column / data we are taking ..
2 ) drizzle has the idea about the schema so we dont have to write complex joins and 
    manual json aggregation
3 )  compile time validation is done so rather than catching the error 
directly from the database at run time , typescript will catch the erro at dev time ...`

*/