var fs = require('fs');
var currentdate = new Date();
var datetime = currentdate.getDate() + "/" +
    (currentdate.getMonth() + 1) + "/" +
    currentdate.getFullYear() + " - " +
    currentdate.getHours() + ":" +
    currentdate.getMinutes() + ":" +
    currentdate.getSeconds();

module.exports = {
    systemLog: function(error) {
        var envLogFile = fs.createWriteStream('./logs/EnvLog.txt', { flags: 'a' });
        envLogFile.write(datetime + ":" + error + "\n");
        envLogFile.end();
    },
    errorLog: function(user,error) {
        var userErrorLogFile = fs.createWriteStream('./logs/ErrorLog.txt', { flags: 'a' });
        userErrorLogFile.write(datetime + "@" + user + ":"  + error + "\n");
        userErrorLogFile.end();
    }
}
