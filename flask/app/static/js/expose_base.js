
$.getScript("../static/js/expose_library/test.js");
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

makeQuery("SELECT * FROM Bar");

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
});



}
var processQuery = function(query){
   $(".parsed_sql").text("We parsed: "+query);
   if(query!==null){
      makeQuery(query);
   }
};