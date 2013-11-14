var searchbar = $(".expose_search_bar");
var validwords = ["Cat", "Dog", "Mouse"];
var validwordstwo =["Hippo", "Rat", "Pig"];
resetPromptField();

searchbar.keyup(function(e){
      var phrase = $(this).val();
      var words = phrase.split(" ");
      var sentence = words.slice(1,words.length).join(" ");
      //console.log(sentence);
      //words.forEach(function logArrayElements(element, index, array) {console.log("a[" + index + "] = " + element);});
      var safe = validatePhrase(phrase, validwordstwo);
      if(safe){

      }
      else{
         //resetPromptField();
         //$('.expose_search_table').append('<tr class="expose_search_option"><td>my data</td><td>more data</td></tr>');
      }
      console.log(e.keyCode);
      if(e.keyCode==32){
         $('.expose_search_table').children().remove();
         validwords.forEach(setPromptField);
      }
      else if(e.keyCode==12){ //change to enter keycode
         //
      }
 });

function validatePhrase(phrase, validwords)
{
   for (var i=0;i<validwords.length;i++)
   {
      console.log(validwords[i]);
      console.log(validwords[i].indexOf(phrase));
      if(validwords[i].indexOf(phrase)===0){
          console.log("valid");
         return true;
      }
   }
   console.log("invalid");
   return false;
}


 function setPromptField(text){
   console.log("Appendig!");
   $('.expose_search_table').append('<tr class="expose_search_option"><td>'+text+'</td></tr>');
 }

 function resetPromptField(){
      searchbar.val("Find: ");
 }
//{

//}


