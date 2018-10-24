var inquirer = require("inquirer");
var mysql = require("mysql");
var table = require("console.table");
var ShoppingCart = require("./shoppingCart");
var Sales = require("./sales")


// *********************************************************************************************************
// then work on supervisor mode
// figure out a way to restart when the custoemr wants to keep shopping from the shopping cart menu seems like a similar thing that we solved last time with that = this
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
    this.sales = sales;
};

var shoppingCart = new ShoppingCart();
var sales = new Sales();

const departmentNames = ["abstract","collectables","tangibles","theoreticals\n\n\n"];


Work.prototype.byeBye = function(){
    console.log("\n****************\nso long sukka!");
}

Work.prototype.create = function(){
    var that = this;
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
        name: "cost",
        type: "input",
        message: "what is the unit cost?"
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
        var cost = response.cost;
        var price = response.price;
        var qty = response.qty;
        connection.query("INSERT INTO products SET ?", {
            product_name: name,
            department_name: dept,
            price: price,
            unit_cost: cost,
            stock_quantity: qty
        }, function(err, res){
            if(err) throw err;
            console.log('\033[2J');
            that.managerIn("your product is hitting store shelves as we speak");
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
            var supervisorChoices = [];
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
                console.log("customer view");
                var customerView = {
                    name: "items",
                    type: "list",
                    choices: customerChoices,
                    message: "what would you like to buy?"
                };
                view(customerView,credentials);
            }
            if(credentials==="manager"){
                console.log("manager view");
                var managerView = {
                    name: "items",
                    type: "list",
                    choices: managerChoices,
                    message: "what would you like to view?"
                }
                view(managerView,credentials);
            }
            if(credentials==="supervisor"){
                console.log("supervisor view");
                var supervisorView = {
                    name: "items",
                    type: "list",
                    choices: managerChoices,
                    message: "which item would you like to view?"
                }
                view(supervisorView,credentials);
            }
            function view(questionObject,credentials){
                inquirer.prompt([
                    questionObject
                ]).then(function(items){
                    var itemIndex = 0;
                    if(credentials==="customer"){
                        itemIndex = customerChoices.indexOf(items.items);
                    }else{
                        itemIndex = managerChoices.indexOf(items.items);
                    }
                    console.log("item index: ",itemIndex);
                    // *******************************************************************
                    // CUSTOMER
                    // *******************************************************************
                    if(credentials==="customer"){
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
                                console.log("before del: ",itemID[itemIndex]);
                                that.del(itemID[itemIndex]);
                            }else{
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
                                }.bind(this))
                            }
                        }.bind(this))
                    }
                    // *******************************************************************
                    // SUPERVISOR
                    // *******************************************************************
                    if(credentials==="supervisor"){
                        sales.unitSales(itemID[itemIndex],that);
                    }
                }.bind(this))
            }
        }.bind(this));
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
                    message: "what would you like to buy?\n"
                }]).then(function(items){
                    var items = items.items;
                    var searchNameIndex = choices.indexOf(items);
                    that.buy(itemID[searchNameIndex]);
                }.bind(this))
            }.bind(this));
    }.bind(this));
}

Work.prototype.del = function(itemID){
    var that = this;
    inquirer.prompt([{
        name: "yORn",
        type: "confirm",
        message: "are your sure you'd like to delete this item?"
    }]).then(function(yORn){
        yORn = yORn.yORn;
        if(yORn){
            console.log("itemID in delete: ",itemID);
            var getOut = {item_id: itemID};
            connection.query(
                "DELETE FROM products WHERE ?",getOut,
                function(err,res){
                    if(err) throw err;
                    console.log("del res: ",res);
                    console.log('\033[2J');
                    that.managerIn("\n********************************\nit's gone. and you're gonna have to live with that\n********************************\n");
                }.bind(this))
            }else{
                console.log('\033[2J');
                that.managerIn("\n********************************\nWhich one is it? sheesh!\n********************************\n");
        }
    }.bind(this))
}

Work.prototype.buy = function(item){
    var that = this;
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
                // print the transaction
                console.table(`${res[0].product_name} \n     ${qty} * $${res[0].price} = $${res[0].price * qty}`);
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
                        connection.query(
                            "SELECT stock_quantity FROM products WHERE ?",{
                                item_id: res[0].item_id
                            },function(err,ret){
                                if(err) throw err;
                                if(ret[0].stock_quantity-qty < 0){
                                    console.log('\033[2J',),
                                    that.customerIn("\n*****************************\nsorry. running low right now.\nwe're down to our last " + ret[0].stock_quantity + "\n*****************************\n");
                                }else{
                                    shoppingCart.addTo(shoppingCartObject,res[0].item_id,that);
                                    console.log('\033[2J');
                                    that.customerIn("\nadded to your shopping cart\n\n*****************************\nwhat else would you like to look at?\n*****************************\n");
                                }
                            }.bind(this)
                        )
                    }else{
                        console.log('\033[2J',);
                        that.customerIn("maybe next time");
                    }
                }.bind(this))
            }.bind(this));
    }.bind(this))
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
                that.managerIn("");
            }.bind(this)
        )
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
            console.log('\033[2J')
            console.table("restock res: ",res);
            var currentQty = res[0].stock_quantity;
            var newQty = parseInt(currentQty) + parseInt(qty);
            console.table("new inventory: ",newQty);
            console.table("item id: ", item_id);
            var updateArray = [
                {stock_quantity: newQty},
                {item_id: item_id}
            ];
            that.theUpdator(updateArray,"manager");
        }.bind(this)
    )
}

Work.prototype.low = function(){
    connection.query(
        "SELECT * FROM products WHERE stock_quantity < 100",function(err,res){
            if(err) throw err;
            console.table(res);
        })
        console.log('\033[2J',);
        this.managerIn("");
}

Work.prototype.customerIn = function(message){
    var that = this;
    if(message){
        console.log(message);
    }
    inquirer.prompt([{
        name: "type",
        type: "list",
        choices: ["search by department","browse everything","shopping cart","log out\n\n\n"],
        message: "what would you like to see?\n"
    }])
    .then(function(type){
        var type = type.type;
        switch(type){
            case "search by department":
                that.read();
                break;
            case "browse everything":
                that.readAll("customer");
                break;
            case "shopping cart":
                shoppingCart.showOff(that);
            case "log out\n\n\n":
                that.byeBye();
        }
    }.bind(this))
};

Work.prototype.managerIn = function(message){
    var that = this;
    if(message){
        console.log(message);
    }
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
    }.bind(this))
}

Work.prototype.supervisorIn = function(message){
    var that = this;
    if(message){
        console.log(message);
    }
    inquirer.prompt([{
        name: "act",
        type: "list",
        choices: ["browse inventory","check sales by department","check total sales","log out\n\n\n"],
        message: "what would you like to do?"
    }]).then(function(act){
        var act = act.act;
        switch(act){
            case "browse inventory":
                that.readAll("supervisor");
                break;
            case "check sales by department":
                inquirer.prompt([{
                    name: "dept",
                    type: "list",
                    choices: departmentNames,
                    message: "which department would you like to see?"
                }]).then(function(dept){
                    var dept = dept.dept;
                    console.log("dept: ",dept);
                    sales.deptSales(dept,that);
                })
                break;
            case "log out\n\n\n":
                console.log('\033[2J',)
                that.byeBye();
                break;
            case "check total sales":
                sales.allSales(that);
                break;
        }
    }.bind(this))
}


module.exports = Work;