var table = require("console.table");
var mysql = require("mysql");
var inquirer = require("inquirer");

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

Sales.prototype.cost = function(){

}

Sales.prototype.sales = function(department){
    connection.query(
        "SELECT department_name,SUM(price*quantity_sold) AS total_sales FROM sales WHERE? ",{
            department_name: department
        },function(err,res){
            if(err) throw err;
            console.table("sales totals: ",res);
        }
    )
}

Sales.prototype.allSales = function(){
    connection.query(
        "SELECT department_name,SUM(price*quantity_sold) AS total_sales FROM sales GROUP BY department_name",function(err,res){
            if(err) throw err;
            console.table("total sales: ",res);
        }
    )
}

Sales.prototype.theUpdator = function(unit_id,quantity_sold){
    console.log("sales updator received id: ",unit_id)
    console.log("sales updator received qty: ",quantity_sold);
    connection.query(
        "SELECT department_name,price FROM products WHERE ?",{
            item_id: unit_id
        },function(err,res){
            if(err) throw err;
            console.log("sales updator res: ",res);
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