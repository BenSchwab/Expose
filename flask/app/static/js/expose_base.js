
$.getScript("../static/js/expose_library/SchemaDirector.js");
$.getScript("../static/js/expose_library/parser.js");


var makeQuery = function(query){

  var url = "http://localhost:5001/query_row/" + query;

  $.getJSON(url , function(data) {
    console.log(data);
      var tbl_body = "";
      var header = true;
      $.each(data, function() {
          var tbl_row = "";
          var tbl_h = "";
          $.each(this, function(k , v) {
              tbl_row += "<td>"+v+"</td>";
              tbl_h += "<th class='t_head'>"+k+"</th>";
          });
          if(header===true){
            header=false;
            tbl_body += "<tr>"+tbl_h+"</tr>";
          }
          tbl_body += "<tr class = 't_row'>"+tbl_row+"</tr>";
      });
      $("#table_result tbody").html(tbl_body);

  });
};




$( document ).ready(function() {
   doExpose();
});

function doExpose(){
   $(".expose_search_list").hide();
   $(".expose_search_bar").keyup(function(event){
    if(event.keyCode == 13){
      var query = $(".expose_search_bar").val();
      console.log(query);
      console.log(window.parser);
      ParseDirector.parse(query, window.parser, window.processQuery);
    }
    if (event.keyCode === 32) {
            var word = $(".expose_search_bar").val();
            words = word.split(" ");
            console.log(words);
            fillTablePrompts(words);
      }
});

function fillTablePrompts(words){
  // $(".filter_prompts").text("BOOO!");
   for(var j = words.length-2; j>=0; j--)
   {
     var table =  StateKeeper.getTable(words[j]);
      if(table!==null){
         console.log(table);
         var trans = StateKeeper.getValidStateTransfers(table.name);
         //console.log(trans);
         var transString = "";
         for(var i = 0; i<trans.length; i++){
            //console.log(trans[i]);
            transString+= (trans[i][0] +" " +trans[i][1]+" ");
         }

         var filters = StateKeeper.getFilterPromptsForTable(table.name);
         var filterString = "";
         for(i =0; i<filters.length; i++){
            filterString += (filters[i] + " ");
         }
         $(".filter_prompts").text(filterString);
         $(".table_prompts").text(transString);
         break;
      }
   }
}



}
var processQuery = function(query, goodParseTree){
   if(!goodParseTree){
      $(".parsed_sql").text("We failed to generate a good parse tree");
   }
   $(".parsed_sql").text("We parsed: "+query);
   if(query!==null){
      makeQuery(query);
   }
};