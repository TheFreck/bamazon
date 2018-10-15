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
    console.log("connected as id " + connection.threadId);

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
                            choices: ["price","quantity"],
                            message: "what would you like to update?"
                        }]).then(function(option){
                            console.log("break 1 ",option);
                            var option = option.option;
                            var whichOne = {};
                            switch(option){
                                case option = "price":
                                    console.log("break 2");
                                    whichOne.price = option;
                                    whichOne.value = "price";
                                    break;
                                case option = "quantity":
                                    console.log("break 3");
                                    whichOne.stock_quantity = option;
                                    whichOne.value = "quantity";
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
                                        })
                                        console.log("final update array: ",updateArray);
                                        work.theUpdator(updateArray);
                                        break;
                                    case whichOneIsIt = "quantity":
                                        console.log(itemID[itemIndex],newValue);
                                        work.restock(itemID[itemIndex],newValue);                                        
                                }
                                console.log("which one is it?",whichOne);
                                updateArray.push({
                                    item_id: itemID[itemIndex]
                                })
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

Work.prototype.read = function(credentials){
    inquirer.prompt([{
        name: "searchTerm",
        type: "list",
        choices: ["product_name","department_name","price range","stock_quantity"],
        message: "how would you like to search for your product?"
    },{
        name: "whichOne",
        type: "input",
        message: "which one?"
    }]).then(function(searchTerm){
        var searchName = searchTerm.whichOne;
        var term = {};
        switch(searchTerm.searchTerm){
            case searchTerm = "product_name":
                term.product_name = searchName;
                break
            case searchTerm = "department_name":
                term.department_name = searchName;
                break
            case searchTerm = "price range":
                console.log("price range");
                break
            case searchTerm = "stock_quantity":
                term.stock_quantity = searchName;
                break
        }
        connection.query("SELECT * FROM products WHERE ?", term,
        function(err,res){
            if(err) throw err;
            var choices = [];
            for(i=0; i<res.length; i++){
                choices.push(res[i].product_name + ": $" + res[i].price);
            }
            if(credentials==="customer"){
                inquirer.prompt([{
                    name: "items",
                    type: "list",
                    choices: choices,
                    message: "what would you like to buy?"
                }]).then(function(items){
                    var items = items.items;
                    console.log("items: ",items);
                    console.log("search Name: ",searchName);
                    connection.query("SELECT item_id FROM products WHERE ?",{
                        product_name: searchName
                    },function(err,res){
                            if(err) throw err;
                            console.log("the new res: ",res[0].item_id);
                            work.buy(res[0].item_id);
                        });
                    
                })
            }else if(credentials==="manager"){
                console.log("create the manager display including price and quantity");
            }
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

Work.prototype.del = function(){
    inquirer.prompt([{
        name: "item",
        type: "input",
        message: "which [item_id] do you want to delete?"
    }]).then(function(item){
        var item = item.item;
        console.log("item: ",item);
        var getOut = {
            product_name: item
        }
        connection.query(
            "DELETE FROM products WHERE ?",getOut,
            function(err,res){
                if(err) throw err;
                console.log("affected rows: ",res.affectedRows);
                console.log("changed rows: ",res.changedRows);
            }
        )
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