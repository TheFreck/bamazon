var ShoppingCart = function(cartItems){
    this.cart = cartItems
    this.totalQty = 0;
    this.totalPrice = 0;
    this.productsArray = [];

}

ShoppingCart.prototype.totals = function(){
    var powersCombined = {};
    for(i=0; i<this.cart.length; i++){
        powersCombined.totalPrice += this.cart.price[i];
        powersCombined.totalQty += this.cart.qty[i];
    }
    console.log("powers combined: ",powersCombined);
}

module.exports = ShoppingCart;