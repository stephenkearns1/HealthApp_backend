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
DROP TABLE IF EXISTS Status;

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
    conditionlevel int,
    token VARCHAR(265)
    
   /* PRIMARY KEY(id) */
);


CREATE TABLE Status
(
  
    release_date VARCHAR(15),
    vpod1_4_down  VARCHAR(15),
    /*going to change this to date of birth*/
    vpod1_4_deployed VARCHAR(60),
    vpod1_4_testing VARCHAR(120),
    vpod1_4_up VARCHAR(60),
    /*the below should probably be stored somewhere else 
    but for now here will do for testing purposes*/
    vpod1_4_up_testing VARCHAR(100),
    vpod2_3_down VARCHAR(100),
    vpod2_3_deployment VARCHAR(100),
    vpod2_4_testing VARCHAR(100),
    vpod2_3_up VARCHAR(100),
    final_smoke VARCHAR(100),   
    status VARCHAR(100)
);
/* more fields as we go along */




/* test data */
INSERT INTO users (id,firstname,secondname,age,username,password,email,usergoal,medicalcondition,conditionlevel) VALUES(0,'stephen','k','12','ste','password1','random@fakeemail.com','treat medical condition:','aids','9001');