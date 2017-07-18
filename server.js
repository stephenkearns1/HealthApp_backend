var express = require('express'); //Express web framework
var bcrypt = require('bcrypt');
var bodyParser = require("body-parser");
var mysql = require("mysql");
var config = require('../sensitive_data/config');
var con = mysql.createConnection({
    host: "localhost",
    user: config.user,
    password: config.password,
    database: config.database
});
console.log(config.user);
var jwt = require("jsonwebtoken");
var app = express(); //express app
var expressSanitizer = require("sanitizer");//sanitizer for input
var server; //the server
var logging = require('./scripts/log.js'); //get config's for use 
var fs = require("fs");
var bodyParserJsonError = require('express-body-parser-json-error');
app.use(bodyParser.json()); // for parsing application/json 
app.use(bodyParser.urlencoded({ extended: false })); // for parsing application/x-www-form-urlencoded 
app.use(bodyParserJsonError());


//variables
const saltRounds = 10;



function CheckAuth(token, callback) {
    if (token === undefined) {
        callback('token unreadable','Failed');
    }
    con.query('SELECT firstname FROM users WHERE token = ?', [token], function (err, data) {
        if (err) throw err;
        else if (data.length === 0) {
            callback('No matchs','Failed');
        }
        //TODO add secret to file and read it in `
        jwt.verify(token, config.secret, function (err, decoded) {
            if (err) {
                callback('invaild', 'Failed');
            } else {
                callback('vaild', "Success");
            }
        });
    });
}
//Make generic if need again
function getSecret(callback){
    var data = fs.readFileSync('../sensitive_data/secret.txt');
    return data;
}

app.get("/", function (req, res) {
    res.send('Welcome to the medicalApp API! - documentation on using the api, can be found at www.');
});

app.post('/api/auth/check', function (req, res, err) {
        var token = req.body.token;
        //verify token sent to server
        console.log(token);
        CheckAuth(token, function (callback, responseStatus) {
            
            res.json({ 'strResponse': callback, "status": responseStatus, 'fName': 'Hassan' });
        });
});

app.post("/api/auth/login", function (req, res) {

    var username = req.body.username;
    var password = req.body.password;

    if (username === undefined || password === undefined) {

        res.json({'strResponse':"Invalid credentials", 'status':'Failed'});
    }

    //sanitize the input to protect agaisnt XSS
    username = expressSanitizer.sanitize(username);
    password = expressSanitizer.sanitize(password);


    con.query('SELECT * FROM users WHERE username = ?', [username], function (err, data) {
        if (err) {
            logging.log(err);
            res.json({'strResponse':"Could not connect to database to validate username", 'status':'Failed'});
        }
        else if (data.length === 0) {
            res.json({'strResponse':'user does not exist','status':'Failed'});
        }
        else {
            //TODO instead of using the password I might generate the token based on the user input
            //compares user sent and stored password
            if (!bcrypt.compareSync(password, data[0].password)) {
                console.log('test: Invalid pasword');
                res.json({'strResponse':'Invalid password','status':'Failed'});
                
            }
            //Generate token
            var payload = {
                id: username,
                password: data[0].password
            };
            
         
            //get secret 
            var secret = getSecret();
               getSecret(function (callback) {
                    secret = callback;
                });

            // Refactor: to read secret from file instead of having it easily readBLE 
            var jwtToken = jwt.sign(payload, secret, { expiresIn: '24h' })

            con.query('UPDATE users SET token = ? WHERE username = ? ', [jwtToken, username], function (err) {
                if (err) throw err;
                //not sure it will continue after exeption is thrown but I will find out eventually 
                res.json({'strResponse':'failed to store token', 'status':'Failed'});
            });

            //return token to user
            //NOTE: Still testing
            //called strResponse (string response) so the client side knows this is not belonging to the object passed back and converted into a java class, in this case the strResponse is the token
            //but in other classes it could be success or something along those lines.  
            res.json({ 'strResponse': jwtToken,'status':'Success', 'fName': 'Hassan' });
            //res.send(jwtToken);


        }


    });



});


//req stands for the request and res for response to the user 

app.post('/register', function (req, res) {

    /*
       Vaildation:
       - checks the length of the of password 
       - checks format 
       - Checks if user name already exists 
    */



    var id = 4;//req.query.id;
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



    if (id === undefined || username === undefined || password === undefined
        || firstName === undefined || secondName === undefined || email === undefined
        || userGoal === undefined || age === undefined) {
        console.log("error line 159: Invalid params" + username);
        //keep the commented out console log incase of further errors
       //console.log("id: " + id + "\n" +"username: " + username + "\n" + "password: " + password + "\n" + "firstname: " + firstName + "\n" + "secondname: " + secondName + "\n" + "email: " + email + "\n" + "user goal: " + userGoal + "\n" + "age: " + age);
        res.json({'strResponse':"Invalid params!", 'status':'Failed'});
    }
    
    if(userGoal == "I wish to improve my medical condition"){
        if(userMedicalCondition === undefined){
            res.json({'strResponse':"undefined condition", 'status':'Failed'});
        }else if((userMedicalCondition === "High Cholesterol" || userMedicalCondition == "Obesity") && conditionLevel == undefined){
            res.json({'strResponse':"conditionLevel empty", 'status':'Failed'});
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
        res.json({'strResponse':'Invaild username','status':'Failed'});
    }

    if (password.length < 8) {

        res.json({'strResponse':'Invaild password','status':'Failed'});
    }
    /*TODO: need to also ensure email is valid*/
    password = bcrypt.hashSync(password, saltRounds);
    con.query('SELECT username, email FROM users WHERE username = ? AND email = ?', [username, email], function (err, chkUsername,chkEmail) {
        if (err) {
            logging.log('error occured', err);
            res.json({'strResponse':"Could not connect to database to validate username",'status':'Failed'});
        }
        else if (chkUsername.length != 0) {
            res.json({'strResponse':'Username Already taken','status':'Failed'});
        }
        else if (chkEmail.length != 0) {
            res.json({'strResponse':'Email Already taken','status':'Failed'});
        }
        else {

            var user = {
                id: id, username: username, password: password,
                firstname: firstName, secondname: secondName, age: age, email: email,
                usergoal: userGoal, medicalcondition: userMedicalCondition, conditionlevel: conditionLevel
            };

            con.query('INSERT INTO users SET ?', user, function (err) {
                //if an error occurs throw it 
                if (err) {
                    console.log('Error:', err);
                    res.json({'strResponse':'failed to store data','status':'Failed'});
                }
                else {
                    res.json({'status':'Success'});
                }

                //TODO add conditons for if username exist and other vaildation 
            });
        }

    });


});

app.get('/test', function (req, res){
    
});

app.post('/api/auth/save/accessCode', function (req, res) {
    var accessCode = req.body.accessCode;
    var token = req.body.token;
    accessCode = expressSanitizer.sanitize(accessCode);
    token = expressSanitizer.sanitize(token);

    CheckAuth(token, function (callback, responseStatus) {
        res.json({'strResponse':callback, 'status':responseStatus});
    });

    con.query("UPDATE users SET accesscode = ?", accessCode, function (err) {
        if (err) {
            logging.log(err);
        } else {
            res.json({'strResponse':'updated','status':'Success'});
        }
    })
});

/* 


*********** Two below functions being used for internal hackaton, please dont delete yet
*/ /*
app.post('/dellhack/status',function (req, res) {
    
    var release = req.body.release;
    con.query('SELECT * FROM Status WHERE release_date = ? ', [release], function (err, data) {
        if (err) {
            logging.log(err);
        }
        //return token to user
        //res.json({ 'token': jwtToken });
        
    res.json(data);
    });

});
app.post('/dellhack/status/update',function (req, res){
    console.log('Made it');
    var releaseNum = req.body.releaseDate;
    var vpod14_down = req.body.vpod14_down;
    var vpod14_deployed = req.body.vpod14_deployment;
    var vpod14_down_test = req.body.vpod14_down_test;
    var vpod14_up = req.body.vpod14_up;
    var vpod14_test_up = req.body.vpod14_test_up;
    var vpod23_down = req.body.vpod23_down;
    var vpod23_deployment = req.body.vpod23_deployment;
    var vpod23_testing = req.body.vpod23_testing;
    var vpod23_up = req.body.vpod23_up;
    var final_smoke = req.body.final_smoke;
    var final_status = req.body.final_status;


    console.log(req.body);


            var status = {
                release_date: releaseNum, vpod1_4_down: vpod14_down, vpod1_4_deployed: vpod14_deployed,
                vpod1_4_testing: vpod14_down_test, 	vpod1_4_up: vpod14_up, 	vpod1_4_up_testing: vpod14_test_up, vpod2_3_down: vpod23_down,
                vpod2_3_deployment: vpod23_deployment, vpod2_4_testing: vpod23_testing, vpod2_3_up: vpod23_up,
                final_smoke: final_smoke, status: final_status
            };

            con.query('INSERT INTO Status SET ?', status, function (err) {
                //if an error occurs throw it 
                if (err) {
                    console.log('Error:', err);
                    res.send('failed to store data');
                }
                else {
                    res.send('success');
                }

                //TODO add conditons for if username exist and other vaildation 
            });
        });

 */ 

function initServer() {
    con.connect(function (err) {
        if (err) {
            var currentdate = new Date();
            var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth() + 1) + "/"
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

function startServer() {


    server = app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function () {
        var addr = server.address();
        console.log("HealthyLiving server listening @", addr.address + ":" + addr.port);
    });


}

//init the server 
initServer();

//export for testing
exports.app = app;

