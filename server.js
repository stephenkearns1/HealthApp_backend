
var express = require('express'); //Express web framework
var bcrypt = require('bcrypt');
var bodyParser = require("body-parser");
var mysql = require("mysql");
var con = mysql.createConnection({
        host: "localhost", 
        user: "stephenkearns1",
        password: "",
        database:"c9"
});
var jwt = require("jsonwebtoken");
var app = express(); //express app
var expressSanitizer = require("sanitizer");//sanitizer for input
var server; //the server
var config = require('./config/config.js'); //get config's for use 
var logging = require('./scripts/log.js'); //get config's for use 
app.use(bodyParser.json()); // for parsing application/json 
app.use(bodyParser.urlencoded({ extended: false })); // for parsing application/x-www-form-urlencoded 

//variables
const saltRounds = 10;



function CheckAuth(token, callback){
    if(token === undefined){
        callback('token unreadable');
    }
    con.query('SELECT token FROM users WHERE token = ?',[token],function(err, data) {
        if(err)throw err;
        else if(data.length === 0){
            callback('No matchs');
        }
        //TODO add secret to file and read it in `
        jwt.verify(token, config.secret, function(err, decoded) {
            if (err) {
                callback('invaild');
             }else{
                 callback('vaild');
             }
        });
    });
}


app.get("/", function(req, res) {
    res.send('Welcome to the medicalApp API! - documentation on using the api, can be found at www.');
});

app.post('/api/auth/check', function(req, res) {
    
    var token = req.body.token;
    
    CheckAuth(token, function(callback){
       res.send(callback); 
    });
    
})

app.post("/api/auth/login", function(req, res){

     var username = req.body.username;
     var password = req.body.password;
     
    
     
     if(username === undefined || password === undefined){
       
        res.send("Invalid credentials");
     }
     
     //sanitize the input to protect agaisnt XSS
     username = expressSanitizer.sanitize(username);
     password = expressSanitizer.sanitize(password);
     
     
     con.query('SELECT * FROM users WHERE username = ?', [username], function(err, data){
       if(err)
       {
         console.log('error occured', err);
         res.send("Could not connect to database to validate username");
       }
       else if(data.length === 0)
       {
         //user does not exist
         console.log('TEST: users does not exist');
         res.send('user does not exist');
       }
        else
        {
            //TODO instead of using the password I might generate the token based on the user input
             //compares user sent and stored password
             if(!bcrypt.compareSync(password,data[0].password))
             {
               console.log('test: Invalid pasword');
               res.send('Invalid password');
             }
               //Generate token
             var payload = {
                    id:username,
                    password:data[0].password
             };
               
            var jwtToken = jwt.sign(payload, config.secret, {expiresIn: '24h' })
             
            con.query('UPDATE users SET token = ? WHERE username = ? ',[jwtToken,username], function(err) {
                if(err)throw err;
                //not sure it will continue after exeption is thrown but I will find out eventually 
                res.send("failed to store token");
            });
            
             //return token to user
             res.json([{'token':jwtToken}]);
         
         
        }

       
     });
     
     
     
});


//req stands for the request and res for response to the user 

app.post('/register', function(req, res){
   
   /*
      Vaildation:
      - checks the length of the of password 
      - checks format 
      - Checks if user name already exists 
   */
   

    
    var id = 4;//req.query.id;
    var firstName = req.body.firstname;
    var secondName= req.body.secondname;
    var username= req.body.username;
    var password= req.body.password;
    var email = req.body.email;
    var userGoal = req.body.goal;
    //NOTE: the below variables are optional so can be null
    //I will add defaults to them before making a request so it may not matter serverside
    var age = req.body.age;
    var userMedicalCondition = req.body.medicalCondition;
    var conditionLevel = req.body.level;
    
    
    console.log(req.body);
    
    
    
    if(id === undefined || username=== undefined ||password=== undefined 
    || firstName == undefined || secondName== undefined || email == undefined
    || userGoal == undefined || age == undefined || userMedicalCondition == undefined
    ||conditionLevel == undefined)
    {
        res.send("Invalid params!");
    }
    
    
    //santize the user's input to clean up dirt strings and protect agaisnt common attacks such as XSS
    //Good ref for your own info: https://www.owasp.org/index.php/Cross-site_Scripting_(XSS)
    id = expressSanitizer.sanitize(id);
    username= expressSanitizer.sanitize(username);
    password = expressSanitizer.sanitize(password);
    firstName = expressSanitizer.sanitize(firstName);
    secondName= expressSanitizer.sanitize(secondName);
    email = expressSanitizer.sanitize(email);
    userGoal = expressSanitizer.sanitize(userGoal);
    age = expressSanitizer.sanitize(age);
    userMedicalCondition = expressSanitizer.sanitize(userMedicalCondition);
    conditionLevel = expressSanitizer.sanitize(conditionLevel);
   
    
    
    if(username.length < 3){
        res.send('Invaild username');
    }
    
    if(password.length < 8){
    
        res.send('Invaild password');
    }
    /*TODO: need to also ensure email is valid*/
    password= bcrypt.hashSync(password, saltRounds);
    con.query('SELECT username FROM users WHERE username = ?', [username], function(err, data){
       if(err)
       {
         logging.log('error occured', err);
         res.send("Could not connect to database to validate username");
       }
       else if(data.length != 0)
       {
         res.send('Already taken');
       }
       else
       {
    
            var user = {id:id, username:username, password:password, 
            firstname:firstName, secondname:secondName, age:age, email:email,
            usergoal:userGoal, medicalcondition:userMedicalCondition, conditionlevel:conditionLevel};
            
            con.query('INSERT INTO users SET ?',user,function(err){
               //if an error occurs throw it 
               if(err){
                   console.log('Error:', err);
                   res.send('failed to store data');
            } 
               else{
                   res.send('success');
               }
       
               //TODO add conditons for if username exist and other vaildation 
            });
       }  
       
    });
    
    
});

app.post('/api/auth/save/accessCode', function(req, res) {
    var accessCode = req.body.accessCode;
    var token = req.body.token;
    accessCode = expressSanitizer.sanitize(accessCode);
    token = expressSanitizer.sanitize(token);
    
    CheckAuth(token, function(callback){
       res.send(callback); 
    });
    
    con.query("UPDATE users SET accesscode = ?", accessCode, function(err) {
        if(err){
            logging.log(err);
        }else{
            res.send('updated');
        }
    })
});

function initServer(){

  //connects to the database 
  con.connect(function(err){
     if(err){
        var currentdate = new Date(); 
        var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
       logging.log(datetime + err)
       return;
     }
     
    logging.log("Connection established");
     
     
  });
  
  
  
  //start the server
  startServer();
  
}

function startServer(){
    
  
server = app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("HealthyLiving server listening @", addr.address + ":" + addr.port);
});


}

//init the server 
initServer();

//export for testing
exports.app = app;

