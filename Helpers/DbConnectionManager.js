var mysql = require("mysql");
var Promise = require("bluebird");
var using = Promise.using;
var debug = require('../scripts/log.js');
var config = require('../../sensitive_data/config');
/*
 Promisifies the entire object by going through the object's properties and creating an async equivalent of each function on the object and its prototype chain
 source: http://bluebirdjs.com/docs/api/promise.promisifyall.html
*/
Promise.promisifyAll(mysql);
Promise.promisifyAll(require("../node_modules/mysql/lib/Connection").prototype);
Promise.promisifyAll(require("../node_modules/mysql/lib/Pool").prototype);


var pool = mysql.createPool({
    connectionLimit: 10,
    host: "localhost",
    user: config.user,
    password: config.password,
    database: config.database
});

console.log(config.user);

function getConnection() {
    //acquire a connection from the pool, setting automation resource managment 
    return pool.getConnectionAsync().disposer(function(connection) {
        //return the connection to pool, for further use
        connection.release();
    });
}

function Query(command) {
    return using(getConnection(), function(connection) {
        console.log('Connection established');
        return connection.queryAsync(command);
        //create custom errors for network/timeout
    });

}

module.exports = {
    query: Query,
};