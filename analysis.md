  # Implementation Analysis for this [Enhancement](https://github.com/stephenkearns1/HealthApp_backend/issues/14)

 #### Two-factor Authentication
 
 First approach 1:
 - Generate 
 
 ```javascript
 con.query('UPDATE users SET token = ? WHERE username = ? ', [jwtToken, username], function (err) {
                if (err) throw err;
                //not sure it will continue after exeption is thrown but I will find out eventually 
                res.send("failed to store token");
            });
```
