CREATE TABLE User(userId INTEGER NOT NULL PRIMARY KEY,
                 username VARCHAR(20) NOT NULL,
                 password VARCHAR(20) NOT NULL,
                 email VARCHAR(20) NOT NULL;
CREATE TABLE Song(songId INTEGER NOT NULL PRIMARY KEY,
                 name VARCHAR(20) NOT NULL,
                 artist VARCHAR(20) NOT NULL,
                 genre VARCHAR(20) NOT NULL;
CREATE TABLE Playlist(playlistId INTEGER NOT NULL PRIMARY KEY,
                 song1Id VARCHAR(20) NOT NULL,
                 song2Id VARCHAR(20) NOT NULL,
                 userId VARCHAR(20) NOT NULL,
CREATE TABLE Listens(playerId VARCHAR(20) NOT NULL,
                       score VARCHAR(20) NOT NULL
                       
CREATE TABLE Favorites(userId VARCHAR(20) NOT NULL REFERENCES User(userId),
                       playlistId VARCHAR(20) NOT NULL REFERENCES Playlist(playlistId),
                       relationType VARCHAR(20),
                       PRIMARY KEY(termId1, termId2));
CREATE TABLE Follows(userId VARCHAR(20) NOT NULL REFERENCES User(userId),
                       TerritoryId VARCHAR(20) NOT NULL REFERENCES Term(territoryId),
                       PRIMARY KEY(playerId1, territoryId2));
