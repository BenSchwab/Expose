CREATE TABLE Player(playerId INTEGER NOT NULL PRIMARY KEY,
                 username VARCHAR(20) NOT NULL,
                 password VARCHAR(20) NOT NULL,
                 email VARCHAR(20) NOT NULL;
CREATE TABLE Continent(continentId INTEGER NOT NULL PRIMARY KEY,
                 name VARCHAR(20) NOT NULL,
CREATE TABLE Territory(territoryId INTEGER NOT NULL PRIMARY KEY,
                 name VARCHAR(20) NOT NULL,
CREATE TABLE Scores(playerId VARCHAR(20) NOT NULL PRIMARY KEY REFERENCES Player(playerId),
                       score VARCHAR(20) NOT NULL,
CREATE TABLE Attack(termId1 VARCHAR(20) NOT NULL REFERENCES Term(termId),
                       termId2 VARCHAR(20) NOT NULL REFERENCES Term(termId),
                       relationType VARCHAR(20),
                       PRIMARY KEY(termId1, termId2));
CREATE TABLE Fortify(playerId VARCHAR(20) NOT NULL REFERENCES Player(playerId),
                       TerritoryId VARCHAR(20) NOT NULL REFERENCES Term(territoryId),
                       PRIMARY KEY(playerId1, territoryId2));
