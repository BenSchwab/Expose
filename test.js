jsonString = '{"tables": [{"mapsTo": [], "expose": true, "name": "Bar", "columns": [{"mapsTo": "", "expose": true, "references": "", "name": "name"}, {"mapsTo": "", "expose": true, "references": "", "name": "address"}]}, {"mapsTo": [], "expose": true, "name": "Beer", "columns": [{"mapsTo": "", "expose": true, "references": "", "name": "name"}, {"mapsTo": "", "expose": true, "references": "", "name": "brewer"}]}, {"mapsTo": [], "expose": true, "name": "Drinker", "columns": [{"mapsTo": "", "expose": true, "references": "", "name": "name"}, {"mapsTo": "", "expose": true, "references": "", "name": "address"}]}, {"mapsTo": [], "expose": true, "name": "Frequents", "columns": [{"mapsTo": "", "expose": true, "references": "Drinker.name", "name": "drinker"}, {"mapsTo": "", "expose": true, "references": "Bar.name", "name": "bar"}, {"mapsTo": "", "expose": true, "references": "", "name": "times_a_week"}]}, {"mapsTo": [], "expose": true, "name": "Likes", "columns": [{"mapsTo": "", "expose": true, "references": "Drinker.name", "name": "drinker"}, {"mapsTo": "", "expose": true, "references": "Beer.name", "name": "beer"}]}, {"mapsTo": [], "expose": true, "name": "Serves", "columns": [{"mapsTo": "", "expose": true, "references": "Bar.name", "name": "bar"}, {"mapsTo": "", "expose": true, "references": "Beer.name", "name": "beer"}, {"mapsTo": "", "expose": true, "references": "", "name": "price"}]}]}';

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

var NameMapper = {

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
            //console.log(refCol);
        }
        //console.log(refCol);
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
     getTable: function(tableName){
        for(var i = 0; i<myDatabaseConfig.tables.length; i++){
            if(!table.expose) continue;
             var table = myDatabaseConfig.tables[i];
             if(table.name === tableName||contains(table.mapsTo,tableName)){
                return table;
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

function contains(a, obj) {
    var i = a.length;
    while (i--) {
       if (a[i] === obj) {
           return true;
       }
    }
    return false;
}
