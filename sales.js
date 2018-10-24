var table = require("console.table");
var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon"
});

var Sales = function(){
    this.idArray = [];
}

Sales.prototype.cost = function(shoppingCart){
    this.shoppingCart = shoppingCart
}

Sales.prototype.deptSales = function(department,that){
    connection.query(
        "SELECT department_name,SUM(price*quantity_sold) AS total_sales FROM sales WHERE? ",{
            department_name: department
        },function(err,res){
            if(err) throw err;
            console.table("sales totals: ",res);
            that.supervisorIn("\n*****************************\nwhat would you like to do now?\n*****************************\n");
        }
    )
}

Sales.prototype.unitSales = function(unit_id,that){
    console.log("unit sales unit id: ",unit_id);
    connection.query(
        "SELECT product_name,SUM(sales.price * quantity_sold) AS unit_sales FROM products JOIN sales ON products.item_id = sales.unit_id WHERE ?",{
            unit_id: unit_id
        },function(err,res){
            if(err) throw err;
            console.table("unit sales: ",res);
            that.supervisorIn();
        }
    )
}

Sales.prototype.allSales = function(that){
    connection.query(
        "SELECT department_name,SUM(price*quantity_sold) AS total_sales FROM sales GROUP BY department_name",function(err,res){
            if(err) throw err;
            console.table("total sales: ",res);
            that.supervisorIn("\n*****************************\nwhat would you like to do now?\n*****************************\n");
        }
    )
}

Sales.prototype.theUpdator = function(unit_id,quantity_sold){
    connection.query(
        "SELECT department_name,price FROM products WHERE ?",{
            item_id: unit_id
        },function(err,res){
            if(err) throw err;
            for(i=0; i<res.length;i++){
                connection.query(
                    "INSERT INTO sales SET ?",{
                        unit_id: unit_id,
                        department_name: res[0].department_name,
                        price: res[0].price, 
                        quantity_sold: quantity_sold
                    },function(err,res){
                        if(err) throw err;
                        console.log("sales table updated");
                    }
                )

            }
        }
    )
}




module.exports = Sales;