var inquirer = require("inquirer");
var mysql = require("mysql");
var table = require("console.table");
var Work = require("./underTheHood");

var work = new Work();

inquirer.prompt([{
    name: "choice",
    type: "list",
    choices: ["create","read"],
    message: "what would you like to do?"
}]).then(function(choice){
    choice = choice.choice;
    switch(choice){
        case choice = "create":
            work.create();
            break;
        case choice = "read":
            work.readAll("manager");
            break;
    }
})