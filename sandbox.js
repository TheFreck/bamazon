var Work = require("./underTheHood");
var inquirer = require("inquirer");

var work = new Work();
read();
function read(){
    inquirer.prompt([{
        name: "searchTerm",
        type: "list",
        choices: ["product_name","department_name","price range","stock_quantity"],
        message: "how would you like to search for your product?"
    }]).then(function(searchTerm){
        var searchTerm = searchTerm.searchTerm;
        var term;
        switch(searchTerm){
            case searchTerm = "product_name":
                term.product_name = searchTerm;
                console.log("term: ",term);
                break;
            case searchTerm = "department_name":
                inquirer.prompt([{
                    name: "department",
                    type: "list",
                    choices: ["electronics","collectables","housewares","crafts\n"],
                    message: "which department? "
                }]).then(function(department){
                    var department = department.department;
                    term = department;
                    console.log("department: ",department);
                });
                console.log("inside term: ",term);
                break;
            case searchTerm = "price range":
                console.log("price range");
                break;
            case searchTerm = "stock_quantity":
                term.stock_quantity = searchTerm;
                console.log("term: ",term);
        }
        console.log("out term: ",term);
        
    })
    console.log("outside the switch");
}