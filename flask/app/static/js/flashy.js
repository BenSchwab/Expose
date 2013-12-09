$( document ).ready(
function(){
     $(".expose_logo").hover(function(){
        $(this).css( "opacity", 1);


      },function(){
      $(this).css( "opacity", 0.5);

   });

   $(".expose_search_option").hover(function(){
        $(this).css( "opacity", 1);
      },function(){
      $(this).css( "opacity", 0.5);
   });

   $(document).ready(function(){
    $('#cool_table').dataTable();
});
}




   );