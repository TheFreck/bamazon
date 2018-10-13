var inquirer = require("inquirer");

var question = "sup";
var qType = "input";
var qMessage = "What's up?";


addQuestion();
function addQuestion(){
    inquirer.prompt([{
        name: "name",
        type: "input",
        message: "give your data a name"
    },{
        name: "type",
        type: "list",
        choices: ["list","checkbox","input","confirm","password"],
        message: "this will be the type field"
    },{
        name: "message",
        type: "input",
        message: "what are you asking for?"
    }]).then(function(question){
    listArray = [];
    if(question.type==="list"){
        console.log("great! it's a list!")
        function listInput(){
            inquirer.prompt([{
                name: "choices",
                type: "input",
                message: "type your choices and leave it blank when done"
            }]).then(function(list){
                console.log("list choices: ",list.choices);
                if(list.choices != ""){
                    console.log("made it this far");
                    listArray.push(list.choices);
                    listInput();
                }
            })
            // console.log("list array",listArray);
            question.choices = listArray;

            
        }
        listInput();
    }
    console.log("question",question);
    inquirer.prompt([question]).then(function(answer){
        console.log(answer);
    })
})
}

// inquirer.prompt([{
//     type: qType,
//     name: question,
//     message: qMessage
// }]).then(function(question){
//     var question = question.name;
//     console.log(question);
// })