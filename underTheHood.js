var inquirer = require("inquirer");
var mysql = require("mysql");
var table = require("console.table");
var Work = function(shoppingCart){
    this.shoppingCart = shoppingCart;
};
var work = new Work();
var shoppingCart = [];

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon"
});
connection.connect(function(err) {
    if (err) throw err;

});
Work.prototype.create = function(){
    inquirer.prompt([{
        name: "name",
        type: "input",
        message: "what is the name of your product?"
    },{
        name: "dept",
        type: "list",
        choices: ["electronics","collectables","housewares","crafts"],
        message: "which department?"
    },{
        name: "price",
        type: "input",
        message: "name your price"
    },{
        name: "qty",
        type: "input",
        message: "how many are available?"
    }

    ]).then(function(response){
        var name = response.name;
        var dept = response.dept;
        var price = response.price;
        var qty = response.qty;
        connection.query("INSERT INTO products SET ?", {
            product_name: name,
            department_name: dept,
            price: price,
            stock_quantity: qty
        }, function(err, res){
            if(err) throw err;
            console.log("affected rows: ",res.affectedRows);
            console.log("changed rows: ",res.changedRows);
        })
})
}

Work.prototype.theReader = function(column,value){
    var columnObj = {};
    switch(column){
        case column = "product_name":
            columnObj.product_name = value;
            break;
        case column = "department_name":
            columnObj.department_name = value;
            break;
        case column = "price":
            columnObj.price = value;
            break;
        case column = "stock_quantity":
            columnObj.stock_quantity = value;
    }
    connection.query(
        "SELECT * FROM products WHERE ?",
        columnObj,
        function(err,res){
            if(err) throw err;
            return res;
        })
}

Work.prototype.readAll = function(credentials){
    connection.query("SELECT * FROM products",
        function(err,res){
            if(err) throw err;
            var customerChoices = [];
            var managerChoices = [];
            var itemID = [];
            var prices = [];
            var quantities = [];
            for(i=0; i<res.length; i++){
                itemID.push(res[i].item_id);
                customerChoices.push(res[i].product_name);
                prices.push(": $" + res[i].price);
                managerChoices.push(res[i].product_name + ", price: $" + res[i].price + ", quantity: " + res[i].stock_quantity);
                quantities.push(res[i].stock_quantity);
            }
            if(credentials==="customer"){
                console.log("customer view");
                var customerView = {
                    name: "items",
                    type: "list",
                    choices: customerChoices,
                    message: "what would you like to buy?"
                };
                view(customerView,"customer");
            }
            if(credentials==="manager"){
                console.log("manager view");
                var managerView = {
                    name: "items",
                    type: "list",
                    choices: managerChoices,
                    message: "what would you like to view?"
                }
                view(managerView,"manager");
            }
            if(credentials==="supervisor"){
                console.log("you're a supervisor. ooh look at you");
            }
            function view(questionObject,credentials){
                inquirer.prompt([
                    questionObject
                ]).then(function(items){
                    // var items = items.items;
                    var itemIndex = managerChoices.indexOf(items.items);
                    console.log("item index: ",itemIndex);
                    console.log("item ID: ",itemID[itemIndex]);
                    console.log("item name: ",customerChoices[itemIndex]);
                    console.log("item price: ",prices[itemIndex]);
                    console.log("item quantity: ",quantities[itemIndex]);
                    // *******************************************************************
                    // CUSTOMER
                    // *******************************************************************
                    if(credentials==="customer"){
                        work.buy(res[0].item_id);
                    }
                    // *******************************************************************
                    // MANAGER
                    // *******************************************************************
                    if(credentials==="manager"){
                        var updateArray = [];
                        inquirer.prompt([{
                            name: "option",
                            type: "list",
                            choices: ["price","quantity","delete"],
                            message: "what would you like to update?"
                        }]).then(function(option){
                            var option = option.option;
                            var whichOne = {};
                            switch(option){
                                case option = "price":
                                    whichOne.value = "price";
                                    break;
                                case option = "quantity":
                                    whichOne.stock_quantity = option;
                                    whichOne.value = "quantity";
                                    break;
                                case option = "delete":
                                    work.del(itemID[itemIndex]);
                            }

                            inquirer.prompt([{
                                name: "newValue",
                                type: "input",
                                message: "new value: "
                            }]).then(function(newValue){
                                var newValue = newValue.newValue;
                                var whichOneIsIt = whichOne.value
                                switch(whichOneIsIt){
                                    case whichOneIsIt = "price":
                                        whichOne.price = newValue;
                                        updateArray.push({
                                            price: whichOne.price
                                        },{
                                            item_id : itemID[itemIndex]
                                        });

                                        console.log("final update array: ",updateArray);
                                        work.theUpdator(updateArray);
                                        break;
                                    case whichOneIsIt = "quantity":
                                        console.log(itemID[itemIndex],newValue);
                                        work.restock(itemID[itemIndex],newValue);                                        
                                }
                            })
                        })
                    }
                    // *******************************************************************
                    // SUPERVISOR
                    // *******************************************************************
                    if(credentials==="supervisor"){
                        console.log("supervisor");
                    }
                })
            }
        });
}
Work.prototype.deptName = function(){
    var temp;
    inquirer.prompt([{
        name: "dept",
        type: "list",
        choices: ["electronics","collectables","housewares","crafts\n"],
        message: "which department?"
    }]).then(function(dept){
        console.log("dept term: ",dept);
        console.log("dept.dept ",dept.dept);
        temp = dept.dept;
    })
    console.log("temp: ",temp);
}
Work.prototype.read = function(credentials){
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
                break
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
                break
            case searchTerm = "price range":
                console.log("price range");
                break
            case searchTerm = "stock_quantity":
                term.stock_quantity = searchTerm;
                console.log("term: ",term);
        }
        console.log("out term: ",term);

        // ***************************************************************************************************************
        // it keeps stopping as soon as the inquirer inside of the switch finishes              /    \
        //                                                                                     | STOP |
        // it doesn't even finish the switch casae                                              \    /
        // ***************************************************************************************************************


        // console.log("final term: ",term);
        // connection.query(
        //     "SELECT * FROM products WHERE ?", term,
        //     function(err,res){
        //         if(err) throw err;
        //         var choices = [];
        //         for(i=0; i<res.length; i++){
        //             choices.push(res[i].product_name + ": $" + res[i].price);
        //         }
        //         if(credentials==="customer"){
        //             inquirer.prompt([{
        //                 name: "items",
        //                 type: "list",
        //                 choices: choices,
        //                 message: "what would you like to buy?"
        //             }]).then(function(items){
        //                 var searchNameIndex = choices.indexOf(items);
        //                 console.log(searchNameIndex);
        //                 var searchName = "";
        //                 var items = items.items;
        //                 console.log("items: ",items);
        //                 console.log("search Name: ",searchName);
        //                 connection.query("SELECT item_id FROM products WHERE ?",{
        //                     product_name: searchName
        //                 },function(err,res){
        //                         if(err) throw err;
        //                         console.log("the new res: ",res);
        //                         work.buy(res[0].item_id);
        //                     });
                        
        //             })
        //         }else if(credentials==="manager"){
        //             console.log("create the manager display including price and quantity");
        //         }
        //     });
    })
}

Work.prototype.theUpdator = function(updateArray){
    connection.query(
        "UPDATE products SET ? WHERE ?",updateArray,
        function(err,res){
            if(err) throw err;
            console.log("affected rows: ",res.affectedRows);
            console.log("changed rows: ",res.changedRows);
        }
    )
}

Work.prototype.update = function(){
    inquirer.prompt([{
        name: "product",
        type: "input",
        message: "which product would you like to update?"
    }]).then(function(product){
        var product = product.product;
        console.log("product: ",product);
        inquirer.prompt([{
            name: "department_name",
            type: "list",
            choices: ["electronics","collectables","housewares","crafts"],
            message: "update department: "
        },{
            name: "price",
            type: "input",
            message: "update price: "
        },{
            name: "stock_quantity",
            type: "input",
            message: "update quantity: "
        }]).then(function(update){
            var updateArray = [update,{product_name: product}];
            work.theUpdator(updateArray);
        })
    })
}

Work.prototype.del = function(itemID){
    inquirer.prompt([{
        name: "yORn",
        type: "confirm",
        message: "are your sure you'd like to delete this item?"
    }]).then(function(yORn){
        yORn = yORn.yORn;
        if(yORn){
            var getOut = {
                item_id: itemID
            }
            connection.query(
                "DELETE FROM products WHERE ?",getOut,
                function(err,res){
                    if(err) throw err;
                    console.log("affected rows: ",res.affectedRows);
                    console.log("changed rows: ",res.changedRows);
                }
            )
        }else{
            console.log("Which one is it?");
        }
    })
}

Work.prototype.buy = function(item_id){
    inquirer.prompt([{
        name: "qty",
        type: "input",
        message: "how many would you like?"
    }]).then(function(qty){
        var item = item_id
        var qty = qty.qty;
        console.log("buy item_id",item);
        console.log("how many? ",qty);
        connection.query(
            "SELECT product_name, price FROM products WHERE ?",{
                item_id: item
            },
            function(err,res){
                if(err) throw err;
                console.log(`for ${qty} of ${res[0].product_name} will cost $${res[0].price * qty}`);
                inquirer.prompt([{
                    name: "yORn",
                    type: "confirm",
                    message: "buy this?"
                }]).then(function(yORn){
                    var yORn = yORn.yORn;
                    console.log("yes or no? ",yORn);
                    if(yORn===true){
                        connection.query(
                            "SELECT stock_quantity FROM products WHERE ?",{
                                item_id: item
                            },function(err,res){
                                if(err) throw err;
                                console.log("current qty: ",res[0].stock_quantity);
                                var newQTY = res[0].stock_quantity - qty;
                                console.log("new quantity: ",newQTY);
                                
                                var updateArray = [
                                    {stock_quantity: newQTY},
                                    {item_id: item}
                                ];
                                work.theUpdator(updateArray);
                            }
                        )
                    }else{
                        console.log("maybe next time");
                    }
                })
            });
        
    })
}

Work.prototype.theUpdator = function(updateArray){
    connection.query(
        "UPDATE products SET ? WHERE ?",updateArray,
        function(err,res){
            if(err) throw err;
            console.log("affected rows: ",res.affectedRows);
            console.log("changed rows: ",res.changedRows);
        }
    )
}

Work.prototype.restock = function(item_id,qty){
    connection.query(
        "SELECT * FROM products WHERE ?",
        {
            item_id: item_id
        },
        function(err,res){
            if(err) throw err;
            var currentQty = res[0].stock_quantity;
            console.log(currentQty);
            var newQty = parseInt(currentQty) + parseInt(qty);
            console.log(" new quantity: ",newQty);
            console.log("item id: ", item_id);
            var updateArray = [
                {stock_quantity: newQty},
                {item_id: item_id}
            ];
            work.theUpdator(updateArray);
        }
    )
    // work.theReader(column,value);
}















module.exports = Work;