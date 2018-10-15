var inquirer = require("inquirer");
var mysql = require("mysql");
var table = require("console.table");
var Work = require("./underTheHood");

var work = new Work();

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    inquirer.prompt([{
        name: "type",
        type: "list",
        choices: ["search for something specific","browse everything"],
        message: "how would you like to see it?"
    }]).then(function(type){
        var type = type.type;
        console.log("type: ",type);
        if(type==="search for something specific"){
            console.log("read before");
            work.read("customer");
            console.log("read after");
        }else{
            console.log("all before");
            work.readAll("customer");
            while(work.complete===true){
                console.log("all after");
            }
        }
        console.log("after the whole thing");
        
    }).then(function(){
    })
});
