import sqlite3
import json
import en, sys


#TODO: read a database - parse out the structure return a config.json file

def parseDatabase(filename):
   conn = sqlite3.connect(filename)
   conn.row_factory = sqlite3.Row
   c = conn.cursor();
   tables = list()

   #c.execute("SELECT * FROM BEER, LIKES, DRINKER WHERE DRINKER.name = 'Ben';")
   #row = c.fetchOne()

   for row in c.execute("SELECT * FROM sqlite_master WHERE type='table';"):
      tables.append(Table(row[1]))
   myDatabase = Database(tables)

   for table in tables:
      for row in c.execute("PRAGMA table_info("+table.name+");"):
         col = Column(row[1])
         table.columns.append(col)

   #TODO: Clean up variables names and logic
   for row in c.execute("SELECT * FROM sqlite_master WHERE type='table';"):
         fTable = row[1]
         fromTable = myDatabase.getTable(fTable)
         createStatement = row[4]
         stats = createStatement.split(",")
         for s in stats:
            if not "REFERENCES" in s: continue
            ref = s.split("REFERENCES")
            p = ref[0]
            print(p)
            q = p.strip().split("(")
            l = 0
            ind = 0
            if q[0].split(" ")[0] == "CREATE":
               l = 1
               ind = 0
               print "found create"
            fColumn = q[l].split(" ")[ind]
            #print(q[0] +" "+ q[1])
            print ind
            print l
            print(q[l].split(" "))
            print(q)
            print(q[0])
            fromColumn = fromTable.getColumn(fColumn)

            p = ref[1].split("(")
            table = p[0].strip()
            oColumn = p[1].replace(")", "").strip()
            otherTable = myDatabase.getTable(table)
            otherColumn = otherTable.getColumn(oColumn)
            fromColumn.references = otherTable.name+"."+otherColumn.name

            #print "Table: "+table+", Column: "+column
   config = open('config.json', 'w')
   j = json.dumps(myDatabase, default=lambda o: o.__dict__)
   print >> config, j
   config.close();

def CreateConfigJson():
   return

class Database:
   tables = []
   def __init__(self, tables):
      self.tables = tables

   def getTable(self, tableName):
      #print "Looking for "+tableName
      for t in self.tables:
         if t.name == tableName:
            return t
      return None

class Column:
    """A simple example class"""
    name = ""
    mapsTo = []
    reference = None
    expose = True
    def __init__(self, columnName):
      self.name = columnName
      self.references = ""
      self.mapsTo = []
      self.expose = True

class Table:
   """A simple example class"""
   columns = []
   name = ""
   mapsTo = []
   expose = True
   wordType = "noun"
   def __init__(self, tableName):
        self.name = tableName
        tableName = tableName.lower()

        if(en.is_noun(tableName)):
          self.wordType = "noun"
          self.mapsTo = [en.noun.plural(tableName), en.noun.singular(tableName)]
        else:
          self.wordType = "verb"
          self.mapsTo = [en.verb.infinitive(tableName), en.verb.present(tableName, person=3, negate=False), en.verb.past(tableName), en.verb.present_participle(tableName)]

        self.columns = []
        self.expose = True;

   def getReferences(self):
      return
   def getColumn(self, columnName):
      for c in self.columns:
         if c.name == columnName:
            return c
      return None


if __name__ == '__main__':
  parseDatabase(sys.argv[1])