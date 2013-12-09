
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

