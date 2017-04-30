  # Implementation Analysis for this backend [Enhancement](https://github.com/stephenkearns1/HealthApp_backend/issues/14)

 #### Two-factor Authentication
 
 First approach 1:
  *Require user to add two-factor authentication code within 21 days of intial login 
 
 Add endpoint for storing the token 
 
 ```javascript
 app.post('/api/auth/save/accessCode', function (req, res) {
    var accessCode = req.body.accessCode;
    var token = req.body.token;
    accessCode = expressSanitizer.sanitize(accessCode);
    token = expressSanitizer.sanitize(token);

    CheckAuth(token, function (callback) {
        res.send(callback);
    });

    con.query("UPDATE users SET accesscode = ?", accessCode, function (err) {
        if (err) {
            logging.log(err);
        } else {
            res.send('updated');
        }
    })
});
```
