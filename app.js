const express = require("express");
const bodyParser = require("body-parser");
const date=require(__dirname +"/date.js");
const _=require("lodash");
const mongoose=require("mongoose");
//console.log(date);
//mongooose connecction
mongoose.set('strictQuery', false);

 mongoose.connect("mongodb+srv://saimadala1872:Madala187@cluster0.wyspesa.mongodb.net/todolistDB",{ useNewUrlParser: true });


const itemsSchema=mongoose.Schema({
  name: String
});

const Item=mongoose.model("Item",itemsSchema)

const  item1=new Item({
  name:"Welcome to your todolist!"
});

const  item2=new Item({
  name:"Hit + Button to add new list item."
});
const  item3=new Item({
  name:"<--Hit this to delete the item."
});
const defaultItems=[item1,item2,item3];

const listschema=new mongoose.Schema({
  name:String,
  items:[itemsSchema]
});
const List =mongoose.model("List",listschema);

///Completed db insertion //

const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
var day=date.getDay();
app.set("view engine", 'ejs');
//const items=["buy food", "eat food"];
const workitems=[];
///home page call
app.get("/", function(req, res) {

  Item.find().then(function(itemslist){
    if(itemslist.length==0){  ///inserting default values by checking if values are there or not
      Item.insertMany(defaultItems).then(function(){
        console.log("Successfully inserted");
      }).catch(function(err){
        console.log(err);
      });
      res.redirect("/");
    }
    else{
    res.render("list", {daylist: day, newlist: itemslist });
  }
      //console.log(itemslist);

  }).catch(function(err){
    console.log(err);
  });
});


app.get("/:customeListname",function(req,res){
  const customListName=_.capitalize(req.params.customeListname);

  List.findOne({name:customListName}).then(function(doc){
  if(doc){
    //console.log("list already existed");
      res.render("list", {daylist: doc.name, newlist: doc.items });}
    else{
      //console.log("not existed");
      const list=new List({
        name:customListName,
        items:defaultItems
      });
      list.save();
      res.redirect("/"+customListName);
    }
  }).catch(function(er){
    console.log(er);
  })

});

app.get("/work",function(req,res){
  res.render("list",{daylist:"WorkList",newlist:workitems})
});

app.get("/about",function(req,res){
  res.render("about");
});

app.post("/",function(req,res){
    newitem=req.body.newtodo;
    const listname=req.body.add;
    const newone=new Item({
      name: newitem
    });
    //console.log(day,listname);
    if (listname===day){
    newone.save();
    res.redirect("/");}
    else{
      List.findOne({name: listname}).then(function(foundList){
        foundList.items.push(newone);
        foundList.save();
        res.redirect("/"+listname);
      })
    }


})

app.post("/delete",function(req,res){
  const itemId=req.body.checkbox;
  const listName=req.body.listName;
  //console.log(listName);
  if(listName==day){
  Item.deleteOne({_id:itemId}).then(function(){  /// or we can use findByIdAndRemove function also
res.redirect("/");
  }).catch(function(er){
    console.log("del erro",er);
  });
}
else{
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:itemId}}}).then(function(Listitems){
    console.log("deleted item successfully from list");
    res.redirect("/"+listName);
  }).catch(function(err){
    console.log(err);
  })
}

})

let port=process.env.PORT;
if(port==null || port==""){
  port=3000;
}
app.listen(port, function() {
  console.log("server running successfully");
});
