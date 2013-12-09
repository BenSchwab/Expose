DELETE FROM User;
DELETE FROM Song;
DELETE FROM Playlist;
DELETE FROM Listens;
DELETE FROM Favorites;
DELETE FROM Follows;
\COPY User(username, password, email) FROM 'data/User.dat' WITH DELIMITER ',' NULL '' CSV
\COPY Song(name, artist, genre) FROM 'data/Song.dat' WITH DELIMITER ',' NULL '' CSV
\COPY Playlist(name, song, private) FROM 'data/Playlist.dat' WITH DELIMITER ',' NULL '' CSV
\COPY Listens(user, song, count) FROM 'data/Listens.dat' WITH DELIMITER ',' NULL '' CSV
\COPY Favorites(user, playlist) FROM 'data/Favorites.dat' WITH DELIMITER ',' NULL '' CSV
\COPY Follows(user1, user2) FROM 'data/Follows.dat' WITH DELIMITER ',' NULL '' CSV