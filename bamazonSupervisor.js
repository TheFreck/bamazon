var Work = require("./underTheHood");
var mysql = require("mysql");
var figlet = require("figlet");

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
    console.log('\033[2J');
    figlet("Bamazon Supervisor",function(err,data){
        if(err) throw err;
        console.log(data);
    })
    work.supervisorIn()
})