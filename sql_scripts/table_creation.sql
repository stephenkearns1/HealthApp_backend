/* 
    for using sql through bash
    
    mysql-ctl cli 
    //run your script as follows    
    source ~/workspace/sql_scripts/table_creation.sql
*/

/* use the c9 db */
USE c9;

/* DROP TABLES if exist - only use if restarting fresh */
DROP TABLE IF EXISTS users;

/* more fields as we go along */
CREATE TABLE users 
(
   /* id int AUTO_INCREMENT, */
    id int,
    firstname VARCHAR(15),
    secondname  VARCHAR(15),
    /*going to change this to date of birth*/
    age int,
    username VARCHAR(60),
    password VARCHAR(120),
    email VARCHAR(60),
    /*the below should probably be stored somewhere else 
    but for now here will do for testing purposes*/
    usergoal VARCHAR(100),
    medicalcondition VARCHAR(100),
    conditionlevel int
   /* PRIMARY KEY(id) */
);

/* test data */
INSERT INTO users (id,firstname,secondname,age,username,password,email,usergoal,medicalcondition,conditionlevel) VALUES(0,'stephen','k','12','ste','password1','random@fakeemail.com','treat medical condition:','aids','9001');