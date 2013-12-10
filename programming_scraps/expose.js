var searchbar = $(".expose_search_bar");
var validwords = ["Cat", "Dog", "Mouse"];
var validwordstwo =["Hippo", "Rat", "Horse"];
resetPromptField();

function invalidateSearchField(){
   //show red x
}

searchbar.keyup(function(e){
      var phrase = $(this).val();
      var words = phrase.split(" ");
      for (var i = 0; i < words.length; i++){
         words[i] = words[i].trim();
      }

      var sentence = words.slice(1,words.length).join(" ");
      //var
      //console.log(sentence);
      //words.forEach(function logArrayElements(element, index, array) {console.log("a[" + index + "] = " + element);});
      if(validatePhrase(phrase.trim()) ){
         if(e.keyCode==32&&isExact(phrase)){ //space
            console.log("Setting new phrase");
            stateKeeper.setnewphrase(phrase);
            setPromptSet(stateKeeper.buildValidPhrases());
            setSQL();
         }
         else{
            console.log("This phrase is not safe.");
         }
         console.log(e.keyCode);
      }
      else{
         console.log("failed validation");
      }
      setPromptSet(validPrompts);
 });

function isExact(phrase){
   phrase = phrase.trim();
   console.log("P:"+phrase+"!");
   for (var i=0;i<validPrompts.length;i++)
   {
      console.log("VP:"+validPrompts[i]+"!");
      if(validPrompts[i].trim() === phrase ){
         //console.log("Exact match!");
         return true;
      }
   }
}

function setSQL(){
   var statement = stateKeeper.buildsql();
   $('.sql_query_display').text(statement);
}


function validatePhrase(phrase)
{
   var valid = false;
   for (var i=0;i<validPrompts.length;i++)
   {
      console.log(phrase);
      console.log(validPrompts[i]);
      //console.log(validPrompts[i].indexOf(phrase));
      if(validPrompts[i].indexOf(phrase)===0){
          console.log("valid");
          valid = true;
      }
      else{
         validPrompts.splice(i,1);
         i--;
      }
   }
   //console.log("invalid");
   return valid;
}
var validPrompts = [];
function setPromptSet(prompts){
   $('.expose_search_table').children().remove();
    prompts.forEach(addPromptField);
    validPrompts = prompts;
}


 function addPromptField(text){
   //console.log("Appendig!");
   $('.expose_search_table').append('<tr class="expose_search_option"><td>'+text+'</td></tr>');
 }

 function resetPromptField(){
      searchbar.val("Find: ");
 }
//{

//}



//Methods for database graph

function StateKeeper(nouns, verbs){
   this.nouns = nouns;
   this.verbs = verbs;
   this.nounmap = {};
   this.verbmap = {};
   for(var i = 0; i<nouns.length; i++){
      this.nounmap[nouns[i].displayname] = nouns[i];
   }
   for(i = 0; i<verbs.length; i++){
      this.verbmap[verbs[i].displayname] = verbs[i];
   }

   this.currentPhrase = "Find:";
   this.phrasepieces = []; //maybe use for deletion
   this.cur_state_name = "";
   this.activenode = null;
   this.activeproperty = null;

   this.tables = [];
   this.select = null;
   this.where = [];
   this.partialfilter = "";

   this.getValidNouns = function(){
      var valNouns = [];
      this.nouns.forEach( function(noun){valNouns.push(noun.displayname); console.log(noun.displayname); });
      return valNouns;
   };
   this.buildValidPhrases = function()
   {
      var build = function(noun){
            valPhrases.push(this.currentPhrase.trim().concat(" ", noun.displayname));
            console.log(noun.displayname);
         };
          var buildProp = function(prop){
            valPhrases.push(this.currentPhrase.trim().concat(" ", prop));
            //console.log(noun.displayname);
         };
      var valPhrases = [];
      if(this.activenode === null){
         console.log(this.nouns.length);
         for(var i = 0; i<this.nouns.length; i++){
            var curNoun =  this.nouns[i];
            build.call(this, curNoun);
         }
      }
      else if(this.activenode instanceof Node){

         if(this.activeproperty!==null){
            for(var l = 0; l<this.activeproperty.propertyValues.length; l++){
               console.log("!!!"+this.activeproperty.propertyValues[l]);
               buildProp.call(this,this.activeproperty.propertyValues[l]);
            }
            this.activeproperty = null;

         }
         else{

            console.log(this.activenode.displayname);
            transitions = this.activenode.getAllTransitions();
            transitions.forEach(function logArrayElements(element, index, array) {console.log("a[" + index + "] = " + element.displayname);});
             for(var k = 0; k<transitions.length; k++){
               var curTransition =  transitions[k];
               build.call(this, curTransition);
            }
         }
      }

      return valPhrases;
   };

   this.setnewphrase = function(newphrase){
      if(newphrase.length<this.currentPhrase.length){
         this.currentPhrase = newphrase;
      }
      else if(newphrase.indexOf(this.currentPhrase)===-1){
         this.currentPhrase = newphrase;
      }
      else{
         var index = newphrase.indexOf(this.currentPhrase);
         this.cur_state_name = newphrase.substring(this.currentPhrase.length, newphrase.length);
         this.cur_state_name = this.cur_state_name.replace(/^\s+|\s+$/g,''); //need to set equal?
         this.currentPhrase = newphrase;
         this.movestate(this.cur_state_name);
      }
   };

   this.movestate = function(state_name){
      console.log("Your statename:" + state_name);
        if(this.partialfilter.length!==0){
            this.partialfilter+=" " +state_name;
            this.where.push(this.partialfilter);
            this.partialfileter = "";
            console.log("I created a filter");
         }
         if(this.activenode === null){
            if(state_name in this.nounmap){
               this.activenode = this.nounmap[state_name];
               console.log("We have active node!"+this.nounmap[state_name]);
               this.select = this.activenode;
               this.tables.push(this.activenode.name);
            }
            else{
               console.log("Houston, we have a problem.");
            }
         }
         else{
            var trans = this.activenode.getAllTransitions();
            var element;
            for(var j = 0; j<trans.length; j++){
               if(trans[j].displayname ===state_name ){
                  element = trans[j];
                  console.log("WE FOUND IT!");
               }
            }
            //assert(element!==null);
            //console.log("STATE: "+state_name+element.propertyValues[0]);
            if(element instanceof Edge){
               console.log("EDGE!");
               this.activenode = element.toNode;
               this.tables.push(this.activenode.name);
            }
            else if(element instanceof Property){
               console.log("PROPERTY!");
               this.activeproperty =  element;
               this.partialfilter = this.activenode.name +"."+ this.activeproperty.name + "=";
               //console.log(elemenent.propertValues[0]);
            }
         }
   };

   this.buildsql = function(){
      var select = "";
      for(var i = 0; i<this.select.properties.length; i++){
         select +=this.select.name +"." +this.select.properties[i].name+" ";
      }
      var from = this.tables.join(", ");
      var where = this.where.join(" ");
      var statement = "Select "+ select + " from "+ from;
      if(where.length!==0){
         statement = statement + " where " + where;
      }
      return statement;
   };

}

/*var StateKeeper = {
   buildsql: function() {}
} */

function Node() {
   var commonNode = getNewNode();
   for (var prop in commonNode) {
      this.prop = commonNode[prop];
   }
}

function Property(propertyname, displayname, propertyValues){
   this.propertyValues = propertyValues;
   this.propertyname = propertyname;
   this.displayname =  displayname;

}

function StringProperty(propertyname, displayname, propertyValues){
   this.propertyValues = propertyValues;
   this.name = propertyname;
   this.displayname =  displayname;

}
StringProperty.prototype = new Property();

function NumericProperty(){

}
/*
function getNewNode(foo, bar) {
   var args = Array.prototype.slice.call(arguments);
   return {
      foo: args[1]
   }
}

typeof getNewNode().foo === 'undefined' */


function NounNode(name, displayname){
   this.name = name;
   this.displayname = displayname;
   this.properties = [];
   this.edges = [];


}
NounNode.prototype = new Node();

function VerbNode(name,displayname){
   this.name = name;
   this.displayname = displayname;
   this.properties =[];
   this.edges = [];

}

VerbNode.prototype = new Node();

function Node() {
  //this.edges = [];
  this.getAllTransitions = function(){
      return this.edges.concat(this.properties);
  };

}

function Edge(from, to, displayname){
   this.fromNode = from;
   this.toNode = to;
   this.displayname = displayname;

}

//Testing the api: Next step generate this from a preferences files/autogenerate from create Schema
drinkerNames = ["Ben", "James", "Jesse"];
drinkerAddress = ["Central Campus, West Campus, West Campus"];

barNames = ["Satisifactions", "Shooters"];

beerNames = ["Corona", "Bud Light", "Blue Moon"];

var drinkerNameProp = new StringProperty("name", "named", drinkerNames);
var drinkerAddressProp = new StringProperty("address", "who live", drinkerAddress);

var barNameProp = new StringProperty("bar_name", "named", barNames);
var beerNameProp = new StringProperty("beer_name", "named", beerNames);




drinkerNode = new  NounNode("Drinker", "Drinkers");
drinkerNode.properties.push(drinkerNameProp);
drinkerNode.properties.push(drinkerAddressProp);

barNode = new NounNode("Bar", "Bars");
barNode.properties.push(barNameProp);

beerNode =  new NounNode("Beer", "Beers");
beerNode.properties.push(beerNameProp);

likesNode = new VerbNode("Like", "Likes");
frequentsNode = new VerbNode("Frequents", "Frequents");
servesNode = new VerbNode("Serves", "Serves");

barToFrequents = new Edge(barNode, frequentsNode, "with frequenters");
frequentsToBar = new Edge(frequentsNode, barNode, "bars");

barToServes = new Edge(barNode, servesNode, "that serves ");
servesToBar = new Edge(servesNode, barNode,  "bars");

drinkerToLikes = new Edge(drinkerNode, likesNode, "who likes");
likesToDrinker = new Edge(likesNode, drinkerNode, "drinkers");

drinkersToFrequents = new Edge(drinkerNode, frequentsNode, "who frequent");
frequentsToDrinkers =  new Edge(frequentsNode, drinkerNode, "who"); //nameless node that just opens up other options

beerToLikes = new Edge(beerNode, likesNode, "liked by");
likesToBeer = new Edge(likesNode, beerNode, "beers");

beerToServes = new Edge(beerNode, servesNode, "served by");
servesToBeer = new Edge(servesNode, beerNode, "beers");

drinkerNode.edges.push(drinkerToLikes);
drinkerNode.edges.push(drinkersToFrequents);

barNode.edges.push(barToFrequents);
barNode.edges.push(barToServes);

beerNode.edges.push(beerToLikes);
beerNode.edges.push(beerToServes);

likesNode.edges.push(likesToBeer);
likesNode.edges.push(likesToDrinker);

servesNode.edges.push(servesToBar);
servesNode.edges.push(servesToBeer);

frequentsNode.edges.push(frequentsToDrinkers);
frequentsNode.edges.push(frequentsToBar);




var nouns = [drinkerNode, barNode, beerNode];
var verbs = [likesNode, frequentsNode, servesNode];

stateKeeper = new StateKeeper(nouns, verbs);

setPromptSet(stateKeeper.buildValidPhrases());


