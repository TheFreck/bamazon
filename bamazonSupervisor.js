var Work = require("./underTheHood");
var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon"
});

var work = new Work();
connection.connect(function(err){
    if(err) throw err;
    work.supervisorIn()
})