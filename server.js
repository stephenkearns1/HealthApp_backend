
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
 
    con.query('SELECT token FROM users WHERE token = ?',[token],function(err, data) {
        if(err)throw err;
        else if(data.length === 0){
            callback('No matchs');
        }
        //TODO add secret to file and read it in `
        jwt.verify(token, config.secret, function(err, decoded) {
            if (err) {
                callback('invaild');
             }
        });
    });
}


app.get("/", function(req, res) {
    res.send('Welcome to the medicalApp API! - documentation on using the api, can be found at www.');
});

app.post('/api/auth/check', function(req, res) {
    
    var token = req.body.token;
    
    CheckAuth(token, function(res){
       res.send(res); 
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
             
            con.query('INSERT INTO users SET token = ?', jwtToken, function(err) {
                if(err)throw err;
                //not sure it will continue after exeption is thrown but I will find out eventually 
                res.send("failed to store token");
            });
            
             //return token to user
             res.send(jwtToken);
         
         
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
   
   /*
    //get the users details 
    var idIn = 4;//req.query.id;
    var firstNameIn = req.query.firstName;
    var secondNameIn = req.query.secondName;
    var usernameIn = req.query.username;
    var passwordIn = req.query.password;
    var emailIn = req.query.email;
    var userGoalIn = req.query.goal;
    //NOTE: the below variables are optional so can be null
    //I will add defaults to them before making a request so it may not matter serverside
    var ageIn = req.query.age;
    var userMedicalConditionIn = req.query.medicalCondition;
    var conditionLevelIn = req.query.level;
    
    
    */
    
       var idIn = 4;//req.query.id;
    var firstNameIn = req.body.firstname;
    var secondNameIn = req.body.secondname;
    var usernameIn = req.body.username;
    var passwordIn = req.body.password;
    var emailIn = req.body.email;
    var userGoalIn = req.body.goal;
    //NOTE: the below variables are optional so can be null
    //I will add defaults to them before making a request so it may not matter serverside
    var ageIn = req.body.age;
    var userMedicalConditionIn = req.body.medicalCondition;
    var conditionLevelIn = req.body.level;
    
    
    console.log(req.body);
    
    
    
    if(idIn === undefined || usernameIn === undefined || passwordIn === undefined 
    || firstNameIn == undefined || secondNameIn == undefined || emailIn == undefined
    || userGoalIn == undefined || ageIn == undefined || userMedicalConditionIn == undefined
    ||conditionLevelIn == undefined)
    {
        res.send("Invalid params!");
    }
    
    
    //santize the user's input to clean up dirt strings and protect agaisnt common attacks such as XSS
    //Good ref for your own info: https://www.owasp.org/index.php/Cross-site_Scripting_(XSS)
    idIn = expressSanitizer.sanitize(idIn);
    usernameIn = expressSanitizer.sanitize(usernameIn);
    passwordIn = expressSanitizer.sanitize(passwordIn);
    firstNameIn = expressSanitizer.sanitize(firstNameIn);
    secondNameIn = expressSanitizer.sanitize(secondNameIn);
    emailIn = expressSanitizer.sanitize(emailIn);
    userGoalIn = expressSanitizer.sanitize(userGoalIn);
    ageIn = expressSanitizer.sanitize(ageIn);
    userMedicalConditionIn = expressSanitizer.sanitize(userMedicalConditionIn);
    conditionLevelIn = expressSanitizer.sanitize(conditionLevelIn);
    
    console.log(idIn, usernameIn, passwordIn);
    passwordIn = bcrypt.hashSync(passwordIn, saltRounds);
    console.log(passwordIn);
    
    if(usernameIn.length < 3){
        res.send('Invaild username');
    }
    
    if(passwordIn.length < 8){
        res.send('Invaild password');
    }
    /*TODO: need to also ensure email is valid*/
    con.query('SELECT username FROM users WHERE username = ?', [usernameIn], function(err, data){
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
    
            var user = {id:idIn, username:usernameIn, password:passwordIn, 
            firstname:firstNameIn, secondname:secondNameIn, age:ageIn, email:emailIn,
            usergoal:userGoalIn, medicalcondition:userMedicalConditionIn, conditionlevel:conditionLevelIn};
            
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

function initServer(){
  //other host 127.0.0.1
  //port 3306
  
     //TODO: Remove cred's from code 
  //creates a connection to the database 
  

  
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

