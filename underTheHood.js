var inquirer = require("inquirer");
var mysql = require("mysql");
var table = require("console.table");
var ShoppingCart = require("./shoppingCart");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon"
});

var Work = function(shoppingCart){
    this.shoppingCart = shoppingCart;
    this.goingIn = true;
};
var work = new Work();

var shoppingCart = new ShoppingCart();

const departmentNames = ["electronics","collectables","housewares","crafts"];

function connect(){
    connection.connect(function(err){
        if(err) throw err;
    })
}

Work.prototype.byeBye = function(){
    console.log("\n****************\nso long sukka!");
    connection.end();
}

Work.prototype.create = function(){
    inquirer.prompt([{
        name: "name",
        type: "input",
        message: "what is the name of your product?"
    },{
        name: "dept",
        type: "list",
        choices: departmentNames,
        message: "which department?"
    },{
        name: "price",
        type: "input",
        message: "name your price"
    },{
        name: "qty",
        type: "input",
        message: "how many are available?"
    }]).then(function(response){
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
            console.table("your product is hitting store shelves as we speak")
            // work.byeBye();
            console.log("last res",res);
            console.log("line 68 still in");
            
            work.managerIn();
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
                customerChoices.push(res[i].product_name + ", price: $" + res[i].price);
                prices.push(": $" + res[i].price);
                managerChoices.push(res[i].product_name + ", price: $" + res[i].price + ", quantity: " + res[i].stock_quantity);
                quantities.push(res[i].stock_quantity);
            }
            if(credentials==="customer"){
                console.table("customer view");
                var customerView = {
                    name: "items",
                    type: "list",
                    choices: customerChoices,
                    message: "what would you like to buy?"
                };
                view(customerView,"customer");
            }
            if(credentials==="manager"){
                console.table("manager view");
                var managerView = {
                    name: "items",
                    type: "list",
                    choices: managerChoices,
                    message: "what would you like to view?"
                }
                view(managerView,"manager");
            }
            if(credentials==="supervisor"){
                console.table("you're a supervisor. ooh look at you");
                // work.byeBye();
            }
            function view(questionObject,credentials){
                inquirer.prompt([
                    questionObject
                ]).then(function(items){
                    var itemIndex = 0;
                    if(credentials==="manager"){
                        itemIndex = managerChoices.indexOf(items.items);
                    }else{
                        itemIndex = customerChoices.indexOf(items.items);
                    }
                    // *******************************************************************
                    // CUSTOMER
                    // *******************************************************************
                    if(credentials==="customer"){
                        console.log("itemIndex: ",itemIndex);
                        work.buy(itemIndex);
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
                            if(option==="delete"){
                                work.del(itemID[itemIndex]);
                            }
                            inquirer.prompt([{
                                name: "newValue",
                                type: "input",
                                message: "new value: "
                            }]).then(function(newValue){
                                var newValue = newValue.newValue;
                                if(option === "price"){
                                    updateArray.push({
                                        price: newValue
                                    },{
                                        item_id : itemID[itemIndex]
                                    });
                                    work.theUpdator(updateArray);
                                }else{
                                    console.table("time to restock");
                                    work.restock(itemID[itemIndex],newValue);
                                }
                            })
                        })
                    }
                    // *******************************************************************
                    // SUPERVISOR
                    // *******************************************************************
                    if(credentials==="supervisor"){
                        console.table(" you're a supervisor. super you");
                    }
                })
            }
        });
}

Work.prototype.read = function(){
    var term = {}
    term.name = "look";
    term.type = "list";
    term.choices = departmentNames;
    term.message = "which department?";
    inquirer.prompt([term]).then(function(look){
        var look = look.look;
        var select = {};
        select.department_name = look;
        connection.query(
            "SELECT * FROM products WHERE ?", select,
            function(err,res){
                if(err) throw err;
                var choices = [];
                var itemID = [];
                for(i=0; i<res.length; i++){
                    choices.push(res[i].product_name + ": $" + res[i].price);
                    itemID.push(res[i].item_id);
                }
                inquirer.prompt([{
                    name: "items",
                    type: "list",
                    choices: choices,
                    message: "what would you like to buy?"
                }]).then(function(items){
                    var items = items.items;
                    var searchNameIndex = choices.indexOf(items);
                    work.buy(itemID[searchNameIndex]);
                })
            });
    });
}

Work.prototype.theUpdator = function(updateArray){
    connection.query(
        "UPDATE products SET ? WHERE ?",updateArray,
        function(err,res){
            if(err) throw err;
            console.table("it is done")
        }
    )
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
                    console.table("it's gone. don't try to get it back")
                    // work.byeBye();
                })
            }else{
                console.table("Which one is it? sheesh!");
                // work.byeBye();
        }
    })
}

Work.prototype.buy = function(item){
    console.log("buy item: ",item);
    inquirer.prompt([{
        name: "qty",
        type: "input",
        message: "how many would you like?"
    }]).then(function(qty){
        var qty = qty.qty;
        connection.query(
            "SELECT product_name, price FROM products WHERE ?",{
                item_id: item
            },
            function(err,res){
                if(err) throw err;
                console.log("buy res: ",res);
                console.table(`\n********************************************\n${res[0].product_name} \n     ${qty} * $${res[0].price} = $${res[0].price * qty}\n===============================\n`);
                inquirer.prompt([{
                    name: "yORn",
                    type: "confirm",
                    message: "buy this?"
                }]).then(function(yORn){
                    var yORn = yORn.yORn;
                    if(yORn===true){
                        connection.query(
                            "SELECT stock_quantity FROM products WHERE ?",{
                                item_id: item
                            },function(err,res){
                                if(err) throw err;
                                var newQty = res[0].stock_quantity - qty;
                                var updateArray = [
                                    {stock_quantity: newQty},
                                    {item_id: item}
                                ];
                                var shoppingCartObject = {};
                                shoppingCartObject.qty = qty;
                                shoppingCartObject.price = res[0].price;
                                shoppingCartObject.product_name = res[0].product_name;
                                shoppingCart.productsArray.push(shoppingCartObject);
                                console.log("shoppingCart: ",shoppingCart.productsArray);
                                work.theUpdator(updateArray);
                            }
                        )
                    }else{
                        console.table("maybe next time");
                    }
                })
            });
    })
}

Work.prototype.theUpdator = function(updateArray,postUpdate){
    connection.query(
        "UPDATE products SET ? WHERE ?",updateArray,
        function(err,res){
            if(err) throw err;
            console.table("done");
            work.goingIn = true;
        }
    )
    if(postUpdate){
        connection.query(
            "SELECT * FROM products WHERE ?",updateArray[1],function(err,res){
                if(err) throw err;
                console.table("post update: ",res);
            }
        )
    }
    // work.byeBye();
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
            console.table("current inventory: ",currentQty);
            var newQty = parseInt(currentQty) + parseInt(qty);
            console.table("new inventory: ",newQty);
            console.table("item id: ", item_id);
            var updateArray = [
                {stock_quantity: newQty},
                {item_id: item_id}
            ];
            work.theUpdator(updateArray,true);
        }
    )
}

Work.prototype.low = function(){
    connection.query(
        "SELECT * FROM products WHERE stock_quantity < 100",function(err,res){
            if(err) throw err;
            console.table(res);
        }
    )
}

Work.prototype.checkOut = function(){
    console.log(`your shopping cart:\n  ${shoppingCart}\n total: ${shoppingCart.totalPrice}`)
    work.goingIn = false;
    work.byeBye();
}
Work.prototype.salesTotals = function(){

}

Work.prototype.managerIn = function(){
    connect();
    inquirer.prompt([{
        name: "choice",
        type: "list",
        choices: ["create","read","check low inventory","log out"],
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
            case choice = "check low inventory":
                work.low();
                break;
            case choice = "log out":
                // work.byeBye();
        }
    })
}

Work.prototype.customerIn = function(){
    connect();
    inquirer.prompt([{
        name: "type",
        type: "list",
        choices: ["search by department","browse everything","check out"],
        message: "how would you like to see it?"
    }]).then(function(type){
        var type = type.type;
        console.log("type: ",type);
        switch(type){
            case type = "search by department":
                work.read();
                break;
            case type = "browse everything":
                work.readAll("customer");
                break;
            case type = "check out":
                work.checkOut();
        }
    })
};

Work.prototype.supervisorIn = function(){
    connect();
    inquirer.prompt([{
        name: "action",
        type: "list",
        choices: ["browse inventory","check sales"],
        message: "what would you like to do?"
    }]).then(function(action){
        var action = action.action;
        if(action==="browse inventory"){
            work.readAll("supervisor");
        }else{
            work.salesTotals();
        }
    })
}









module.exports = Work;