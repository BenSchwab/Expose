//jsonString = '{"tables": [{"mapsTo": [], "expose": true, "name": "Bar", "columns": [{"mapsTo": "", "expose": true, "references": "", "name": "name"}, {"mapsTo": "", "expose": true, "references": "", "name": "address"}]}, {"mapsTo": [], "expose": true, "name": "Beer", "columns": [{"mapsTo": "", "expose": true, "references": "", "name": "name"}, {"mapsTo": "", "expose": true, "references": "", "name": "brewer"}]}, {"mapsTo": [], "expose": true, "name": "Drinker", "columns": [{"mapsTo": "", "expose": true, "references": "", "name": "name"}, {"mapsTo": "", "expose": true, "references": "", "name": "address"}]}, {"mapsTo": [], "expose": true, "name": "Frequents", "columns": [{"mapsTo": "", "expose": true, "references": "Drinker.name", "name": "drinker"}, {"mapsTo": "", "expose": true, "references": "Bar.name", "name": "bar"}, {"mapsTo": "", "expose": true, "references": "", "name": "times_a_week"}]}, {"mapsTo": [], "expose": true, "name": "Likes", "columns": [{"mapsTo": "", "expose": true, "references": "Drinker.name", "name": "drinker"}, {"mapsTo": "", "expose": true, "references": "Beer.name", "name": "beer"}]}, {"mapsTo": [], "expose": true, "name": "Serves", "columns": [{"mapsTo": "", "expose": true, "references": "Bar.name", "name": "bar"}, {"mapsTo": "", "expose": true, "references": "Beer.name", "name": "beer"}, {"mapsTo": "", "expose": true, "references": "", "name": "price"}]}]}';

var jsonString = '{"tables":[{"mapsTo":["Bar","Pub","Bars","Pubs"],"wordType":"noun","expose":true,"name":"Bar","columns":[{"mapsTo":[],"expose":true,"references":"","name":"name"},{"mapsTo":[],"expose":true,"references":"","name":"address"}]},{"mapsTo":[],"wordType":"noun","expose":true,"name":"Beer","columns":[{"mapsTo":[],"expose":true,"references":"","name":"name"},{"mapsTo":[],"expose":true,"references":"","name":"brewer"}]},{"mapsTo":[],"wordType":"noun","expose":true,"name":"Drinker","columns":[{"mapsTo":[],"expose":true,"references":"","name":"name"},{"mapsTo":[],"expose":true,"references":"","name":"address"}]},{"mapsTo":[],"wordType":"verb","expose":true,"name":"Frequents","columns":[{"mapsTo":[],"expose":true,"references":"Drinker.name","name":"drinker"},{"mapsTo":[],"expose":true,"references":"Bar.name","name":"bar"},{"mapsTo":[],"expose":true,"references":"","name":"times_a_week"}]},{"mapsTo":[],"wordType":"verb","expose":true,"name":"Likes","columns":[{"mapsTo":[],"expose":true,"references":"Drinker.name","name":"drinker"},{"mapsTo":[],"expose":true,"references":"Beer.name","name":"beer"}]},{"mapsTo":[],"wordType":"verb","expose":true,"name":"Serves","columns":[{"mapsTo":[],"expose":true,"references":"Bar.name","name":"bar"},{"mapsTo":[],"expose":true,"references":"Beer.name","name":"beer"},{"mapsTo":[],"expose":true,"references":"","name":"price"}]}]}';


//replace above with
var myDatabaseConfig = eval('(' + jsonString+ ')');

var SQLBuilder = {

    buildSQLStatement: function(parseTree){

    },
    extractCurrentNode: function(parseTree){

    },
    isValidStatement: function(parseTree){

    },
    joinTables: function(tableList){

    },



};


var StateKeeper = {

     getTableReferenceSet: function(table){
            var refCol = [];
            for(var j = 0; j<table.columns.length; j++){
                var col = table.columns[j];
                if(col.references!==""){
                    var ref = col.references;
                    refCol.push(StateKeeper.getRefArray(table, col));
                }
            }
        return refCol;
    },
    getReferenceSet: function(){
          var refCol = [];
          for(var i = 0; i<myDatabaseConfig.tables.length; i++){
            var table = myDatabaseConfig.tables[i];
            var refs = StateKeeper.getTableReferenceSet(table);
            refCol = refCol.concat(refs);
        }
        return refCol;
    },
    isColRef: function(table, column){
        var refSet = StateKeeper.getReferenceSet();
        for(var i = 0; i<refSet; i++){
            var ref = refSet[i];

            if(table === refTable && column == refCol){
                return true;
            }
        }
        return false;

    },
    getRefArray : function(table, refCol){
        var refD = refCol.references.split(".");
        if (refD.length<2){
            return null;
        }
        var fromTable = table.name;
        var refTable = refD[0];
        var refColumn = refD[1];
        return [fromTable, refTable, refColumn];
    },
     getNouns : function(){
        nouns = [];
        for(var i = 0; i<myDatabaseConfig.tables.length; i++){
            var table = myDatabaseConfig.tables[i];
            var name = table.name;
            if(table.mapsTo.length!==0){
                name = table.mapsTo;
            }
            nouns.push(name);
        }
        return nouns;
     },
     isValidTableRef: function(fromTable, toTable){
        for(var i = 0; i<fromTable.columns.length; i++){
            var ref = fromTable.columns[i].references;
            if(ref.length>0){
                table = ref.split(".")[0];
                //console.log(table);
                //console.log(toTable.name)
                if(table === toTable.name){
                    return true;
                }
            }
        }
        return false;
     },
     validNounVerbTransition: function(noun, verb){
        var nounTables = StateKeeper.getNounTables();
        var verbTables = StateKeeper.getVerbTables();
        var nounTable = StateKeeper.getTable(noun,nounTables);
        var verbTable =  StateKeeper.getTable(verb,verbTables);
        if(nounTable===null||verbTable===null){
            console.log("failed to find table");
            return false;
        }
        return (StateKeeper.isValidTableRef(nounTable, verbTable)||StateKeeper.isValidTableRef(verbTable, nounTable));


     },
     getValidStateTransfers : function(tableName){
        var table = StateKeeper.getTable(tableName);
        if(table!==null){
            var refSet = StateKeeper.getTableReferenceSet(table);
            var allRefSet = StateKeeper.getReferenceSet(table);
            for(i = 0; i<allRefSet.length; i++){
                var refArray = allRefSet[i];
                if(refArray[1]===tableName){
                    refSet.push(refArray);
                }
            }
            return refSet;
        }
     },
     getNounTables: function(){
        var nounTables = [];
        for(var i = 0; i<myDatabaseConfig.tables.length; i++){
             var table = myDatabaseConfig.tables[i];
             if(table.wordType==="noun")
             {
                nounTables.push(table);
             }
         }

         return nounTables;
     },
     getVerbTables: function(){
        var verbTables = [];
        for(var i = 0; i<myDatabaseConfig.tables.length; i++){
             var table = myDatabaseConfig.tables[i];
             if(table.wordType==="verb")
             {
                verbTables.push(table);
             }
         }
         return verbTables;
     },
     getTable: function(tableName, tableSet){
       // console.log(tableSet);
        if(typeof tableSet==="undefined"){
            tableSet = myDatabaseConfig.tables;
            //console.log("set variable");
        }
        for(var i = 0; i<tableSet.length; i++){
             var table = tableSet[i];
             if(!table.expose) continue;
             if(table.name === tableName||contains(table.mapsTo,tableName)){
                return table;
             }
        }
        return null;
     },
     getColumn: function(tableName, columnName){
        var table = StateKeeper.getTable(tableName);
        for(var i =0; i<table.columns.length; i++){
            var col = table.columns[i];
            var validNameSet = col.mapsTo.slice(0);
            validNameSet.push(col.name);
            //console.log(validNameSet);
            if(contains(validNameSet,columnName)){
                return col;
            }
        }
        return null;
     },
     getFilterPromptsForTable: function(tableName){
        var table = StateKeeper.getTable(tableName);
        var prompts = [];
        for(var i =0; i<table.columns.length; i++){
            var curCol = table.columns[i];
            if(!curCol.expose){
                continue;
            }
            if(curCol.mapsTo.length!==0)
                prompts = prompts.concat(curCol.mapsTo);
            else
                prompts.push(curCol.name);
        }
        return prompts;

     }

};

function contains(array, obj) {
    var i = array.length;
    while (i--) {
       if (array[i] === obj) {
           return true;
       }
    }
    return false;
}
