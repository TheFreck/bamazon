var inquirer = require("inquirer");
var mysql = require("mysql");
var table = require("console.table");
var Work = function(){};

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

Work.prototype.readAll = function(){
    connection.query("SELECT * FROM products",
        function(err,ret){
            if(err) throw err;
            console.table("return::",ret);
        });
}

Work.prototype.read = function(){
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
        console.log("search Term: ",searchTerm);
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
        console.log("term",term);
        connection.query("SELECT * FROM products WHERE ?", term,
        function(err,ret){
            if(err) throw err;
            console.table("return::",ret);
            return term.product_name;
        });
    })
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
            console.log("departmen update: ",updateArray.department_name);
            console.log("price update: ",updateArray.price);
            console.log("quantity update: ",updateArray.stock_quantity);
            connection.query(
                "UPDATE products SET ? WHERE ?",updateArray,
                function(err,res){
                    if(err) throw err;
                    console.log("affected rows: ",res.affectedRows);
                    console.log("changed rows: ",res.changedRows);
                }
            )
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

Work.prototype.buy = function(){
    inquirer.prompt([{
        name: "item",
        type: "input",
        message: "give me the [item_id], please"
    }]).then(function(item){
        
    })
}

module.exports = Work;