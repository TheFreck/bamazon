var inquirer = require("inquirer");
var mysql = require("mysql");
var table = require("console.table");
var ShoppingCart = require("./shoppingCart");
var Sales = require("./sales")

// *********************************************************************************************************
// then work on supervisor mode
// *********************************************************************************************************

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon"
});

function Work (shoppingCart){
    this.shoppingCart = shoppingCart;
};

var shoppingCart = new ShoppingCart();
var sales = new Sales();

const departmentNames = ["electronics","collectables","housewares","arts and crafts"];


Work.prototype.byeBye = function(){
    console.log("\n****************\nso long sukka!");
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
            console.table("your product is hitting store shelves as we speak");
            this.managerIn();
        }.bind(this))
    }.bind(this))
}

Work.prototype.readAll = function(credentials){
    var that = this;
    connection.query("SELECT * FROM products",
        function(err,res){
            if(err) throw err;
            var customerChoices = [];
            var managerChoices = [];
            var itemID = [];
            var prices = [];
            var quantities = [];
            var names = [];
            for(i=0; i<res.length; i++){
                itemID.push(res[i].item_id);
                names.push(res[i].product_name);
                prices.push(": $" + res[i].price);
                quantities.push(res[i].stock_quantity);
                customerChoices.push(res[i].product_name + ", price: $" + res[i].price);
                managerChoices.push(res[i].product_name + ", price: $" + res[i].price + ", quantity: " + res[i].stock_quantity);
            }
            if(credentials==="customer"){
                console.table("customer view");
                var customerView = {
                    name: "items",
                    type: "list",
                    choices: customerChoices,
                    message: "what would you like to buy?"
                };
                view(customerView,credentials);
            }
            if(credentials==="manager"){
                console.table("manager view");
                var managerView = {
                    name: "items",
                    type: "list",
                    choices: managerChoices,
                    message: "what would you like to view?"
                }
                view(managerView,credentials);
            }
            if(credentials==="supervisor"){
                console.table("\n***************************\nyou're a supervisor. ooh look at you\n******************************************");
                that.byeBye();
            }
            function view(questionObject,credentials){
                
                console.log("credentials: ",credentials);
                inquirer.prompt([
                    questionObject
                ]).then(function(items){
                    var itemIndex = 0;
                    if(credentials==="manager"){
                        console.log("item.item",items.items);
                        itemIndex = managerChoices.indexOf(items.items);
                    }else{
                        console.log("item.item",items.items);
                        itemIndex = customerChoices.indexOf(items.items);
                    }
                    // *******************************************************************
                    // CUSTOMER
                    // *******************************************************************
                    if(credentials==="customer"){
                        console.log("item_id: ",itemID[itemIndex]);
                        console.log("customer choice: ",customerChoices[itemIndex]);
                        console.log("manager choice: ",managerChoices[itemIndex]);
                        that.buy(itemID[itemIndex]);
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
                                that.del(itemID[itemIndex]);
                            }
                            inquirer.prompt([{
                                name: "newValue",
                                type: "input",
                                message: "new value: "
                            }]).then(function(newValue){
                                var newValue = newValue.newValue;
                                if(option === "price"){
                                    updateArray.push(
                                        {price: newValue},
                                        {item_id : itemID[itemIndex]}
                                        );
                                    that.theUpdator(updateArray,"manager");
                                }else{
                                    console.table("time to restock");
                                    that.restock(itemID[itemIndex],newValue);
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
    var that = this;
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
                    that.buy(itemID[searchNameIndex]);
                })
            });
    });
}

Work.prototype.del = function(itemID){
    inquirer.prompt([{
        name: "yORn",
        type: "confirm",
        message: "are your sure you'd like to delete this item?"
    }]).then(function(yORn){
        yORn = yORn.yORn;
        if(yORn){
            var getOut = {item_id: itemID};
            connection.query(
                "DELETE FROM products WHERE ?",getOut,
                function(err,res){
                    if(err) throw err;
                    console.table("it's gone. don't try to get it back")
                    that.managerIn();
                })
            }else{
                console.table("Which one is it? sheesh!");
                that.managerIn();

        }
    })
}

Work.prototype.buy = function(item){
    var that = this;
    console.log("buy item: ",item);
    inquirer.prompt([{
        name: "qty",
        type: "input",
        message: "how many would you like?"
    }]).then(function(qty){
        var qty = qty.qty;
        connection.query(
            "SELECT item_id,product_name, price FROM products WHERE ?",{
                item_id: item
            },
            function(err,res){
                if(err) throw err;
                console.log("buyers res: ",res);
                console.table(`\n********************************************\n${res[0].product_name} \n     ${qty} * $${res[0].price} = $${res[0].price * qty}\n===============================\n`);
                inquirer.prompt([{
                    name: "yORn",
                    type: "confirm",
                    message: "buy this?"
                }]).then(function(yORn){
                    var yORn = yORn.yORn;
                    if(yORn){
                        var shoppingCartObject = {};
                        shoppingCartObject.qty = qty;
                        shoppingCartObject.price = res[0].price;
                        shoppingCartObject.product_name = res[0].product_name;
                        shoppingCart.addTo(shoppingCartObject,res[0].item_id);
                        console.log("added to your shopping cart");
                        that.customerIn();
                    }else{
                        console.table("maybe next time");
                        that.customerIn();
                    }
                })
            });
    })
}

Work.prototype.theUpdator = function(updateArray,credentials){
    var that = this
    connection.query(
        "UPDATE products SET ? WHERE ?",updateArray,
        function(err,res){
            if(err) throw err;
        }
    )
    // returns updated values for managers
    if(credentials==="manager"){
        connection.query(
            "SELECT * FROM products WHERE ?",updateArray[1],function(err,res){
                if(err) throw err;
                console.table("post update: ",res);
                that.managerIn();
            }
        )
    }else{
        that.customerIn();
    }
}

Work.prototype.restock = function(item_id,qty){
    var that = this;
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
            that.theUpdator(updateArray,"manager");
        }
    )
}

Work.prototype.low = function(){
    connection.query(
        "SELECT * FROM products WHERE stock_quantity < 100",function(err,res){
            if(err) throw err;
            console.table(res);
        })
        this.managerIn();
}

// Work.prototype.checkOut = function(){
//     console.log(`your shopping cart:\n  ${shoppingCart.productsArray}\n total: ${shoppingCart.totalPrice}`)
//     inquirer.prompt([{
//         name: "yorn",
//         type: "confirm",
//         message: "confirm your purchase"
//     }]).then(function(yorn){
//         var yorn = yorn.yorn;
//         if(yorn){
//             that.theUpdator();
//             this.byeBye();
            
//             console.log("now gimme my money and get outa here!");
//         }
//     })
// }

Work.prototype.managerIn = function(){
    var that = this;
    console.log('\033[2J');
    inquirer.prompt([{
        name: "choice",
        type: "list",
        choices: ["create","read","check low inventory","log out"],
        message: "what would you like to do?"
    }]).then(function(choice){
        choice = choice.choice;
        switch(choice){
            case choice = "create":
                that.create();
                break;
            case choice = "read":
                that.readAll("manager");
                break;
            case choice = "check low inventory":
                that.low();
                break;
            case choice = "log out":
                that.byeBye();
        }
    })
}

Work.prototype.customerIn = function(){
    var that = this;
    console.log('\033[2J');
    inquirer.prompt([{
        name: "type",
        type: "list",
        choices: ["search by department","browse everything","shopping cart"],
        message: "how would you like to see it?"
    }])
    .then(function(type){
        var type = type.type;
        console.log("type: ",type);
        switch(type){
            case "search by department":
                that.read();
                break;
            case "browse everything":
                that.readAll("customer");
                break;
            case "shopping cart":
                shoppingCart.showOff();
                // console.log("post showoff pre customerIn");
                // that.customerIn();
        }
    })
};

Work.prototype.supervisorIn = function(){
    var that = this;
    console.log('\033[2J');
    inquirer.prompt([{
        name: "act",
        type: "list",
        choices: ["browse inventory","check sales"],
        message: "what would you like to do?"
    }]).then(function(act){
        var act = act.act;
        if(act==="browse inventory"){
            that.readAll("supervisor");
        }else{
            inquirer.prompt([{
                name: "dept",
                type: "list",
                choices: departmentNames,
                message: "which department would you like to see?"
            }]).then(function(dept){
                var dept = dept.dept;
                console.log(dept);
                sales.sales(dept);
            })
        }
    })
}


module.exports = Work;