/* Modules */
var express = require('express'); //Express web framework
var bcrypt = require('bcrypt');
var bodyParser = require("body-parser");
var mysql = require("mysql");
var config = require('../sensitive_data/config');
var Promise = require("bluebird");
var jwt = require("jsonwebtoken");
var expressSanitizer = require("sanitizer"); //sanitizer for input
var bodyParserJsonError = require('express-body-parser-json-error');
var fs = require("fs");
/* helpers */
var connection = require('./Helpers/DbConnectionManager');
var logging = require('./scripts/log.js'); //get config's for use 
/* Remove after refactor - to use helper */
var con = mysql.createConnection({
    host: "localhost",
    user: config.user,
    password: config.password,
    database: config.database
});

/* Variables */
var app = express(); //express app
var server; //the server
const saltRounds = 10;

app.use(bodyParser.json()); // for parsing application/json 
app.use(bodyParser.urlencoded({ extended: false })); // for parsing application/x-www-form-urlencoded 
app.use(bodyParserJsonError());




app.post('/test2', CheckAuth, function(req, res) {


    res.send('Continue');


});

app.get('/test', function(req, res) {
    var sql = 'SELECT * FROM users';
    connection.query(sql).then(function(rows) {
        res.send(rows);
    }).catch(TypeError, function(e) {
        res.send(e);
    }).catch(ReferenceError, function(e) {
        res.send(e);
    }).catch(function(e) {
        //catch other errors
        res.send(e);
    });



});


function CheckAuth(req, res, next) {
    var token = req.body.token;
    console.log(token)
    if (token === undefined) {
        res.status(400).json({ 'messages': { 'strResponse': "token unreadable", 'status': 'Failed' } });
    }
    connection.query(mysql.format('SELECT username FROM users WHERE token = ?', token)).then(function(result) {
        if (result.length === 0) {
            res.status(401).send("Unauthorized");
        }
        //TODO add secret to file and read it in `
        //The error is here, it seems to claim invalid even if it is valid as it still returns a matching user
        jwt.verify(token, config.secret, function(err, decoded) {
            if (err) {
                res.status(401).send("Unauthorized");
            }
            else {
                next();
            }
        });

    }).catch(function(e) {
        //catch other errors
        res.send(e);
    });


}

function ValidateToken(req, res) {
    var token = req.body.token;
    console.log(token)

    if (token === undefined) {
        res.status(400).json({ 'messages': { 'strResponse': "token unreadable", 'status': 'Failed' } });
    }
    connection.query(mysql.format('SELECT username FROM users WHERE token = ?', token)).then(function(result) {
        if (result.length === 0) {
            res.status(401).send("Unauthorized");
        }
        //TODO add secret to file and read it in `
        //The error is here, it seems to claim invalid even if it is valid as it still returns a matching user
        jwt.verify(token, config.secret, function(err, decoded) {
            if (err) {
                res.status(401).send("Unauthorized");
            }
            else {
                res.status(200).send('Success');
            }
        });

    }).catch(function(e) {
        //catch other errors
        res.send(e);
    });


}


//Make generic if need again
function getSecret(callback) {
    var data = fs.readFileSync('../sensitive_data/secret.txt');
    console.log("The secret is: " + data);
    return data;
}

app.get("/", function(req, res) {
    res.send('Welcome to the medicalApp API! - documentation on using the api, can be found at www.');
});

app.post('/api/auth/check', ValidateToken);

app.post("/api/auth/login", function(req, res) {

    var username = req.body.username;
    var password = req.body.password;

    if (username === undefined || password === undefined) {

        res.json({ "messages": { 'strResponse': "Invalid credentials", 'status': 'Failed' } });
    }

    //sanitize the input to protect agaisnt XSS
    username = expressSanitizer.sanitize(username);
    password = expressSanitizer.sanitize(password);

    connection.query(mysql.format('SELECT * FROM users WHERE username = ?', username)).then(function(result) {
        if (result.length === 0) {
            res.json({ "messages": { 'strResponse': 'user does not exist', 'status': 'Failed' } });
        }
        else {
            //TODO instead of using the password I might generate the token based on the user input
            //compares user sent and stored password
            if (!bcrypt.compareSync(password, result[0].password)) {
                console.log('test: Invalid pasword');
                res.json({ "messages": { 'strResponse': 'Invalid password', 'status': 'Failed' } });

            }
            //Generate token
            var payload = {
                id: username,
                password: result[0].password
            };


            //get secret 
            var secret = config.secret;
            /* getSecret();
                          getSecret(function (callback) {
                                secret = callback;
                            });*/

            // Refactor: to read secret from file instead of having it easily readBLE 
            var jwtToken = jwt.sign(payload, secret, { expiresIn: '24h' })

            con.query('UPDATE users SET token = ? WHERE username = ? ', [jwtToken, username], function(err) {
                if (err) throw err;
                //not sure it will continue after exeption is thrown but I will find out eventually 
                res.json({ "messages": { 'strResponse': 'failed to store token', 'status': 'Failed' } });
            });

            //return token to user
            //NOTE: Still testing
            //called strResponse (string response) so the client side knows this is not belonging to the object passed back and converted into a java class, in this case the strResponse is the token
            //but in other classes it could be success or something along those lines.  
            res.json({ "messages": { 'strResponse': jwtToken, 'status': 'Success' }, "userDetails": { 'fName': 'Hassan' } });
            //res.send(jwtToken);


        }

    }).catch(TypeError, function(e) {
        logging.systemLog(e);
    }).catch(ReferenceError, function(e) {
        logging.systemLog(e);
    }).catch(function(e) {
        //catch other errors
        logging.errorLog(username, e);
        res.json({ "messages": { 'strResponse': "Could not connect to database to validate username", 'status': 'Failed' } });
    });

});


//req stands for the request and res for response to the user 

app.post('/register', function(req, res) {

    /*
       Vaildation:
       - checks the length of the of password 
       - checks format 
       - Checks if user name already exists 
    */



    var id = 4; //req.query.id;
    var firstName = req.body.firstname;
    var secondName = req.body.secondname;
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;
    var userGoal = req.body.goal;
    //NOTE: the below variables are optional so can be null
    //I will add defaults to them before making a request so it may not matter serverside
    var age = req.body.age;
    var userMedicalCondition = req.body.medicalCondition;
    var conditionLevel = req.body.level;


    console.log(req.body);



    if (id === undefined || username === undefined || password === undefined ||
        firstName === undefined || secondName === undefined || email === undefined ||
        userGoal === undefined || age === undefined) {
        console.log("error line 159: Invalid params" + username);
        //keep the commented out console log incase of further errors
        //console.log("id: " + id + "\n" +"username: " + username + "\n" + "password: " + password + "\n" + "firstname: " + firstName + "\n" + "secondname: " + secondName + "\n" + "email: " + email + "\n" + "user goal: " + userGoal + "\n" + "age: " + age);
        res.json({ "messages": { 'strResponse': "Invalid params!", 'status': 'Failed' } });
    }

    if (userGoal == "I wish to improve my medical condition") {
        if (userMedicalCondition === undefined) {
            res.json({ "messages": { 'strResponse': "undefined condition", 'status': 'Failed' } });
        }
        else if ((userMedicalCondition === "High Cholesterol" || userMedicalCondition == "Obesity") && conditionLevel == undefined) {
            res.json({ "messages": { 'strResponse': "conditionLevel empty", 'status': 'Failed' } });
        }
    }

    //santize the user's input to clean up dirt strings and protect agaisnt common attacks such as XSS
    //Good ref for your own info: https://www.owasp.org/index.php/Cross-site_Scripting_(XSS)
    id = expressSanitizer.sanitize(id);
    username = expressSanitizer.sanitize(username);
    password = expressSanitizer.sanitize(password);
    firstName = expressSanitizer.sanitize(firstName);
    secondName = expressSanitizer.sanitize(secondName);
    email = expressSanitizer.sanitize(email);
    userGoal = expressSanitizer.sanitize(userGoal);
    age = expressSanitizer.sanitize(age);
    userMedicalCondition = expressSanitizer.sanitize(userMedicalCondition);
    conditionLevel = expressSanitizer.sanitize(conditionLevel);



    if (username.length < 3) {
        res.json({ "messages": { 'strResponse': 'Invaild username', 'status': 'Failed' } });
    }

    if (password.length < 8) {

        res.json({ "messages": { 'strResponse': 'Invaild password', 'status': 'Failed' } });
    }
    /*TODO: need to also ensure email is valid*/
    password = bcrypt.hashSync(password, saltRounds);
    con.query('SELECT username FROM users WHERE username = ?', [username], function(err, usernameData) {


        if (err) {
            logging.errorLog(username, err);
            res.json({ "messages": { 'strResponse': "Could not connect to database to validate username", 'status': 'Failed' } });
        }
        else if (!(usernameData.length === 0)) {
            res.json({ "messages": { 'strResponse': 'Username Already taken', 'status': 'Failed' } });
        }
        else {
            //node js's way of cheking undefined values is terrible so I had to split up the query into two in order to check both username and email
            //very inefficient hopefully I will find a better way of testing for undefined variables
            //I will see at a later date if a try catch will do the trick for me
            con.query('SELECT email FROM users WHERE email = ?', [email], function(err, emailData) {
                if (err) {
                    logging.errorLog(username, err);
                    res.json({ "messages": { 'strResponse': "Could not connect to database to validate username", 'status': 'Failed' } });
                }
                else if (!(emailData.length === 0)) {
                    res.json({ "messages": { 'strResponse': 'Email Already taken', 'status': 'Failed' } });
                }
                else {

                    var user = {
                        id: id,
                        username: username,
                        password: password,
                        firstname: firstName,
                        secondname: secondName,
                        age: age,
                        email: email,
                        usergoal: userGoal,
                        medicalcondition: userMedicalCondition,
                        conditionlevel: conditionLevel
                    };

                    con.query('INSERT INTO users SET ?', user, function(err) {
                        //if an error occurs throw it 
                        if (err) {
                            console.log('Error:', err);
                            res.json({ "messages": { 'strResponse': 'failed to store data', 'status': 'Failed' } });
                        }
                        else {
                            res.json({ "messages": { 'strResponse': 'Success', 'status': 'Success', } });
                        }

                        //TODO add conditons for if username exist and other vaildation 
                    });
                }
            });
        }
    });


});


app.post('/api/auth/save/accessCode', CheckAuth, function(req, res) {
    var accessCode = req.body.accessCode;
    var token = req.body.token;
    accessCode = expressSanitizer.sanitize(accessCode);
    token = expressSanitizer.sanitize(token);

    connection.query(mysql.format('UPDATE users SET accesscode = ?',accessCode)).then(function(result){
       //do something with results  
    }).catch(function(e){
        logging.errorLog(e);
    })
      
});







function startServer() {


    server = app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
        var addr = server.address();
        console.log("HealthyLiving server listening @", addr.address + ":" + addr.port);
    });


}


//start the server
startServer();

//export for testing
exports.app = app;
