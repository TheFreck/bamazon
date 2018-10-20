var table = require("console.table");
var mysql = require("mysql");
var inquirer = require("inquirer");
var Sales = require("./sales");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon"
});

var sales = new Sales();

var ShoppingCart = function(){
    this.totalPrice = 0;
    this.productsArray = [];
    this.idArray = [];
}

ShoppingCart.prototype.totals = function(){
    this.totalPrice = 0;
    for(i=0; i<this.productsArray.length; i++){
        this.totalPrice += this.productsArray[i].price * this.productsArray[i].qty;
    }
    return this.totalPrice;
}


ShoppingCart.prototype.addTo = function(purchase,id){
    console.log("purchase: ",purchase);
    console.log("adding to qty array: ",purchase.qty);
    console.log("adding to price array: ",purchase.price);
    purchase.total = purchase.qty * purchase.price;
    console.log("puchase with total: ",purchase);
    this.productsArray.push(purchase);
    this.idArray.push(id);
    console.log("adding id to the array: ",this.idArray);
    console.log("productsArray after adding: ",this.productsArray);
}

ShoppingCart.prototype.showOff = function(){
    var displayProducts = ["check out","keep shopping"];
    for(i=0; i<this.productsArray.length; i++){
        displayProducts.push(this.productsArray[i].product_name + "; price: $" + this.productsArray[i].price + " * qty: "+ this.productsArray[i].qty + "; total: $" + this.productsArray[i].price * this.productsArray[i].qty);
    }
    var arrayItems = this.productsArray;
    for(i=0; i<arrayItems.length; i++){
    }
    inquirer.prompt([{
        name: "removal",
        type: "checkbox",
        choices: displayProducts,
        message: "check an item if you would like to remove it from your shopping cart"
    }]).then(function(removal){
        var removal = removal.removal;
        switch(removal[0]){
            case "check out":
                this.checkOut();
                break;
            case "keep shopping":
                break;
            default:
                for(i=0; i<removal.length; i++){
                    var index = this.productsArray.indexOf(removal)
                    this.productsArray.splice(index,1);
                    this.idArray.splice(index,1);
                }
                this.showOff();
        }
    }.bind(this))
}

ShoppingCart.prototype.checkOut = function(){
    var that = this;
    console.table("checkout cart items: ",that.productsArray);
    console.table("checkout total price: ",that.totals() + "\n");
    inquirer.prompt([{
        name: "yorn",
        type: "confirm",
        message: "confirm your purchase"
    }]).then(function(yorn){
        var yorn = yorn.yorn;
        if(yorn){
            for(i=0; i<that.productsArray.length; i++){
                var checkOutQty = that.productsArray[i].qty;
                console.log("qty: ",checkOutQty);
                var checkOutId = that.idArray[i];
                console.log("ID: ",checkOutId);
                var passObject1 = {
                    item_id: that.idArray[i]
                }
                connection.query(
                    "SELECT stock_quantity FROM products WHERE ?",{
                        item_id: checkOutId
                    },function(err,res){
                        if(err) throw err;
                        var onHand = res[0].stock_quantity;
                        console.log("current stock on hand: ",onHand);
                        var newOnHand = onHand - checkOutQty;
                        console.log("new stock: ",newOnHand);
                        var newOnHandObj = {stock_quantity: newOnHand};
                        var passArray = [newOnHandObj];
                        passArray.push(passObject1);
                        console.log("pass array: ",passArray);
                        that.theUpdator(passArray);
                        console.log("\n$ $ $$ $$$ $$$$$ $$$$$$$$ $$$$$$$$$$$$$\n\nnow gimme my money and get outa here!\n\n$ $ $$ $$$ $$$$$ $$$$$$$$ $$$$$$$$$$$$$");
                        sales.theUpdator(checkOutId,checkOutQty);
                        console.log("\n****\nnext\n****\n");
                    }
                )
            }
        }
    })
}

ShoppingCart.prototype.theUpdator = function(updateArray){
    console.log("the updator");
    connection.query(
        "UPDATE products SET ? WHERE ?",updateArray,
        function(err,res){
            if(err) throw err;
            console.log("update res: ",res);
        }
    )
}



module.exports = ShoppingCart;