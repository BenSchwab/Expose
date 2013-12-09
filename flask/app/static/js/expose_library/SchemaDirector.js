
var myDatabaseConfig;
$.getJSON('../static/js/music_config.json', function(data){myDatabaseConfig = data;});


var recursionCounter = 0;
function getTableCast(recursionCounter){
    return String.fromCharCode(97 + recursionCounter);
}

var SQLBuilder = {

    buildSQLStatement: function(parseTree, firstParse){
        if (parseTree instanceof Array) {
            parseTree = parseTree[0];
        }
        console.log("I was called!");
        console.log(parseTree.select);
        var from = parseTree.select;

        var filters = parseTree.filters;


        var relation = parseTree.relation;
        var fromTable = StateKeeper.getTable(from);
        console.log(fromTable);


        var selectClause =  "SELECT DISTINCT ";
        var whereClause = "WHERE ";
        var fromClause = "FROM ";



        if(fromTable===null){
            console.log("SQL build failed. " + from +" is not a valid table or mapped table");
            return null; //we failed!
        }
        var tableProjection = StateKeeper.getTableProjection(fromTable);
        if(firstParse){
            selectClause += tableProjection +" ";
        }
        else{
            selectClause += " * ";
        }
        fromClause += fromTable.name+ " ";
        var filterCount = 0;


        for(var f = 0; f<filters.length; f++){
            var filter = filters[f];
            if(filter.type === 'attribute'){
                 var argument = filter.argument;
                 if(!isNumber(argument)){
                    argument = "'"+argument+"'";
                }
                var attribute = filter.attribute;
                var operation = filter.operation;
                if(filterCount>0){
                    whereClause+=" AND ";
                }
                whereClause +=  (attribute +" "+operation +" "+argument);

                filterCount++;
            }
            else if(filter.type ==='relation')
            {
                var subTree = filter.target;
                var to = subTree.select;
                var join = filter.relation;
                var joinTable =  StateKeeper.getTable(join);
                var toTable = StateKeeper.getTable(to);
                 if(to === null){
                    console.log("SQL build failed. " + to +" is not a valid table or mapped table");
                    return null;
                }
                if(!StateKeeper.validNounVerbTransition(from, join)){
                    console.log("SQL build failed. " + from +" joined with " + join +" is not a valid noun-verb pair.");
                    console.log("WARNING UNSAFE");
                }
                if(!StateKeeper.validNounVerbTransition(to, join)){
                    console.log("SQL build failed. " + to +" joined with " + join +" is not a valid noun-verb pair.");
                    console.log("WARNING UNSAFE");
                }
                var fromJoinConstraints = StateKeeper.getContrainsts(fromTable,joinTable);
                var joinFromConstraints = StateKeeper.getContrainsts(joinTable,fromTable);
                var toJoinConstraints = StateKeeper.getContrainsts(toTable,joinTable);
                var joinToConstraints = StateKeeper.getContrainsts(joinTable,toTable);
                var subQuery = SQLBuilder.buildSQLStatement(subTree, false);
                if(subQuery ===null){
                    console.log("invalid parse tree");
                    return null;
                }
                var asCast = getTableCast(recursionCounter);
                recursionCounter++;
                var tSubQuery = "( "+subQuery+" )" + " AS " + asCast;
                var where = "";
                console.log(fromJoinConstraints);
                for(var i = 0; i<fromJoinConstraints.length; i++){
                    var constraint =  fromJoinConstraints[i];
                     if(where.length>0){
                        where+= " AND ";
                    }
                    where += fromTable.name +"."+constraint[0] + " = "+ joinTable.name+"."+constraint[1];
                }
                console.log(joinFromConstraints);
                 for( i = 0; i<joinFromConstraints.length; i++){
                    var fconstraint =  joinFromConstraints[i];
                    if(where.length>0){
                        where+= " AND ";
                    }
                    where += fromTable.name +"."+fconstraint[1] + " = "+ joinTable.name+"."+fconstraint[0];
                }
                 for( i = 0; i<toJoinConstraints.length; i++){
                    var tjconstraint =  toJoinConstraints[i];
                     if(where.length>0){
                        where+= " AND ";
                    }
                    where += joinTable.name +"."+tjconstraint[1] + " = "+ asCast+"."+tjconstraint[0];
                }
                 for( i = 0; i<joinToConstraints.length; i++){
                    var jtconstraint =  joinToConstraints[i];
                     if(where.length>0){
                        where+= " AND ";
                    }
                    where += joinTable.name +"."+jtconstraint[0] + " = "+ asCast+"."+jtconstraint[1];
                }
                    var tProjection = StateKeeper.getTableProjection(fromTable);
                    fromClause +=  (", "+joinTable.name +", " +tSubQuery);
                    if(whereClause.length>6){
                        whereClause+=" AND ";
                    }
                    whereClause += where;
            }
        }

        return (selectClause +" " +fromClause + " "+whereClause);

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
     getTableProjection: function(fromTable){
        var projectionString = "";
        for(var i = 0; i<fromTable.columns.length; i++){
            var col = fromTable.columns[i];
            projectionString += fromTable.name+"."+col.name;
            if(i!=fromTable.columns.length-1){
                projectionString+=", ";
            }
        }
        return projectionString;
     },
     isValidTableRef: function(fromTable, toTable){
        for(var i = 0; i<fromTable.columns.length; i++){
            var ref = fromTable.columns[i].references;
            if(ref.length>0){
                table = ref.split(".")[0];
                if(table === toTable.name){
                    return true;
                }
            }
        }
        return false;
     },
     getContrainsts: function(fromTable, toTable){
        var constraints = [];
        for(var i = 0; i<fromTable.columns.length; i++){
            var fCol = fromTable.columns[i];
            var ref = fCol.references;
            if(ref.length>0){
                var table = ref.split(".")[0];
                var tCol = ref.split(".")[1];
                if(table===toTable.name){
                    constraint = [fCol.name, tCol];
                    constraints.push(constraint);
                }
            }
        }
        return constraints;

     },
     validNounVerbTransition: function(noun, verb){
        var nounTables = StateKeeper.getNounTables();
        var verbTables = StateKeeper.getVerbTables();
        var nounTable = StateKeeper.getTable(noun,nounTables);
        var verbTable =  StateKeeper.getTable(verb,verbTables);
        if(nounTable===null||verbTable===null){
            if(nounTable===null){
                console.log("failed to find "+ noun+ " as noun");
            }
            if(verbTable===null){
                console.log("failed to find "+ verb+ " as verb");
            }
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
             if(table.name.toLowerCase() === tableName.toLowerCase()||contains(table.mapsTo,tableName)){
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

var ParseDirector = {

    parse : function(query, parser, updatefunction){
        try{
            var parseTree = parser.parse(query);
             console.log(parseTree);
             var sqlStatement = SQLBuilder.buildSQLStatement(parseTree,true);
             if(sqlStatement===null){
                console.log("error parsing sql");
             }

             console.log(sqlStatement);
             console.log(updatefunction);
             updatefunction(sqlStatement,true);
        }
        catch(err){
            console.log("Error :(");
            console.log(err);
            updatefunction(err,false);
        }
        recursionCounter = 0;

    }

};

function isNumber(n) {
  return !isNaN(parseFloat(n));
}

function contains(array, str) {
    var i = array.length;
    while (i--) {
       if (array[i].toLowerCase() === str.toLowerCase()) {
           return true;
       }
    }
    return false;
}


