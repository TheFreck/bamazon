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
        name: "action",
        type: "list",
        choices: ["look","buy"],
        message: "what would you like to do?"
    }]).then(function(action){
        var action = action.action;
        if(action==="look"){
            inquirer.prompt([{
                name: "type",
                type: "list",
                choices: ["search for something specific","browse everything"],
                message: "how would you like to see it?"
            }]).then(function(type){
                var type = type.type;
                console.log("type: ",type);
                if(type==="search for something specific"){
                    work.read();
                }else{
                    work.readAll();
                }
            })
        }else{
            work.read();
            work.buy();
        }
    })
});
