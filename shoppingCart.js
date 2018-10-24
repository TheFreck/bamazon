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
    this.finished = false;
}

ShoppingCart.prototype.totals = function(){
    this.totalPrice = 0;
    for(i=0; i<this.productsArray.length; i++){
        this.totalPrice += this.productsArray[i].price * this.productsArray[i].qty;
    }
    console.log("total purchase: ",this.totalPrice);
    return this.totalPrice;
}

ShoppingCart.prototype.addTo = function(purchase,id){
    console.log("id: ",id);
    purchase.total = purchase.qty * purchase.price;
    this.productsArray.push(purchase);
    this.idArray.push(id);
    console.log("id array: ",this.idArray);
}

ShoppingCart.prototype.showOff = function(that){
    if(this.productsArray.length===0){
        that.customerIn("\n*******************************************\nThere's nothing in your cart yet\n*******************************************\n\n");
    }
    var displayProducts = ["check out","keep shopping"];
    for(i=0; i<this.productsArray.length; i++){
        displayProducts.push(this.productsArray[i].product_name + "; price: $" + this.productsArray[i].price + " * qty: "+ this.productsArray[i].qty + "; total: $" + this.productsArray[i].price * this.productsArray[i].qty);
    }
    var arrayItems = this.productsArray;
    inquirer.prompt([{
        name: "removal",
        type: "checkbox",
        choices: displayProducts,
        message: "check an item if you would like to remove it from your shopping cart"
    }]).then(function(removal){
        var removal = removal.removal;
        switch(removal[0]){
            case "check out":
                this.checkOut(that);
                break;
            case "keep shopping":
                that.customerIn(console.log('\033[2J',),"\n*****************************\nwhat else would you like to look at?\n*****************************\n");
                return;
            default:
                for(i=0; i<removal.length; i++){
                    var index = this.productsArray.indexOf(removal)
                    this.productsArray.splice(index,1);
                    this.idArray.splice(index,1);
                }
                this.showOff(that);
        }
    }.bind(this))
}

ShoppingCart.prototype.checkOut = function(these){
    var that = this;
    console.table("checkout cart items: ",that.productsArray);
    that.totals();
    inquirer.prompt([{
        name: "yorn",
        type: "confirm",
        message: "confirm your purchases"
    }]).then(function(yorn){
        var yorn = yorn.yorn;
        if(yorn){
            for(let i=0; i<that.productsArray.length; i++){
                var checkOutQty = that.productsArray[i].qty;
                var checkOutId = that.idArray[i];
                var passObject1 = {
                    item_id: that.idArray[i]
                }
                getQty(checkOutId,checkOutQty,i);
                function getQty(checkOutId,checkOutQty,index){
                    connection.query(
                        "SELECT stock_quantity FROM products WHERE ?",{
                            item_id: checkOutId
                        },function(err,res){
                            if(err) throw err;
                            var onHand = res[0].stock_quantity;
                            var newOnHand = onHand - checkOutQty;
                            var newOnHandObj = {stock_quantity: newOnHand};
                            var passArray = [newOnHandObj];
                            passArray.push(passObject1);
                            that.theUpdator(passArray,these);
                            sales.theUpdator(checkOutId,checkOutQty);
                        }
                    )
                }
            }
            console.table("\n$ $ $$ $$$ $$$$$ $$$$$$$$ $$$$$$$$$$$$$\n\nnow gimme my money and get outa here!\n\n$ $ $$ $$$ $$$$$ $$$$$$$$ $$$$$$$$$$$$$");
        }
    })
}

ShoppingCart.prototype.theUpdator = function(updateArray,these){
    connection.query(
        "UPDATE products SET ? WHERE ?",updateArray,
        function(err,res){
            if(err) throw err;
        }
    )
}



module.exports = ShoppingCart;