const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const _=require("lodash");
let alert=require("alert");

app.use(bodyParser.urlencoded("{extended:true;}"));
app.use(express.static("public"));
app.set("view engine", "ejs");

//database
const mongoose = require("mongoose");

//express.json

//database
mongoose.connect("mongodb+srv://rajeshpareekdevo:ZtFXTVFswLyOCwxn@cluster0.olrsf8b.mongodb.net/todolistDB", { useNewUrlParser: true });

const itemsSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemsSchema);

/*never use const Item1= new Item({

})

*/
const Item1 = Item({
    name: "Welcome To ToDoList App"
});
const Item2 = Item({
    name: "Hit the + button to add a task"
});
const Item3 = Item({
    name: "<-- Hit this to delete a task"
});

const defaultItems = [Item1, Item2, Item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
    
    Item.find({}).then(function (foundItems) {

        if (foundItems.length === 0) {

            Item.insertMany(defaultItems).then(function (foundItemsDefault) {
                res.render("list", { listTitle: "Today", newItems: foundItemsDefault });
                console.log("Successfully put default items into the list");

            }).catch(function (err) {
                console.log(err);
            });
            res.redirect("/");
        }else{
            console.log("Debugging");
            for(var i=0;i<foundItems.length;i++){
                console.log(foundItems[i].name);
            }
            res.render("list", { listTitle: "Today", newItems: foundItems });
        }
        //res.render("list", { listTitle: "Today", newItems: foundItems });
    }).catch(function (err) {
        console.log("oops error occured");
    });
})

app.post("/delete", function (req, res) {
    var checkedId = req.body.checkbox;
    var listName=req.body.listName;

    if(listName==="Today"){
        Item.findByIdAndRemove(checkedId).then(function (response) {
            console.log("succes");
            res.redirect("/");
        }).catch(function (err) {
            console.log(err);
        });
    }
    else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedId}}}).then(function(result){
            console.log("successfully deleted item.")
        }).catch(function(err){
            console.log(err);
        });
        res.redirect("/"+listName);
    }
    
});

app.post("/compose",function(req,res){
    res.redirect("/"+req.body.inputid);
})


app.get("/:customListName", function (req, res) {
    var customListName = _.capitalize(req.params.customListName);
    
    if(customListName==="Warning"){
        res.render("warning");
    }
    if(customListName==="Home"){
        res.redirect("/");
    }
    

    List.findOne({ name: customListName }).then(function (foundList) {
        if(!foundList){
            const list = List({
                name: customListName,
                items: defaultItems
            });
            list.save();
            res.redirect("/" + customListName);
        }
        else{
            res.render("list", { listTitle: foundList.name, newItems: foundList.items });
        }
        
    })
        .catch(function (err) {
           console.log(err);
           res.redirect("/"); 
        })



})
app.post("/", function (req, res) {

    var itemName = req.body.newItem;
    var listName = req.body.list;

    const item = Item({
        name: itemName
    });

    if (listName === "Today") {
        item.save();
        res.redirect("/");
    }
    else{
        List.findOne({name:listName})
            .then(function(foundList){
                foundList.items.push(item);
                foundList.save();
                res.redirect("/"+listName);
                
            })
            .catch(function(err){
                console.log(err);
            });
    }
});



app.get("/about", function (req, res) {
    res.render("about");
});



app.listen(process.env.PORT||3000, function () {
    console.log("server running at port 3000");
});