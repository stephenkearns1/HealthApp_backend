var fs = require('fs');
var log_file = fs.createWriteStream('./log.txt', {flags : 'w'});


module.exports = {
    log: function(error) { 
      
       // log_file.write(error + '\n');
        //log_file.end();          

        
    }
}

