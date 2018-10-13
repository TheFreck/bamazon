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
        name: "choice",
        type: "list",
        choices: ["create","read","update","delete"],
        message: "what would you like to do?"
    }]).then(function(choice){
        choice = choice.choice;
        switch(choice){
            case choice = "create":
                work.create();
                break;
            case choice = "read":
                work.read();
                break;
            case choice = "update":
                work.update();
                break;
            case choice = "delete":
                work.del();
                break;
        }
    })
});
