INSERT INTO churches (name)
VALUES ('Mosaic Church'),
       ('The Austin Stone');

INSERT INTO sermons (name, date, series, youtube_id, church_id)
VALUES ('Defeating Darkness', '2022-12-04', 'REVERSAL', 'UUWr0JgDP28', 1),
       ('Banqueting', '2022-11-27', 'REVERSAL', 'JdLr8ngrPzM', 1),
       ('Contrasting', '2022-11-20', 'REVERSAL', '8D58bsqbiuc', 1),
       ('Treasuring', '2022-11-13', 'REVERSAL', '6mb9UdaOElg', 1),
       ('Being Rich Towards God', '2022-11-06', 'REVERSAL', '2viZOJBQz30', 1),
       ('The Miracle of Joy', '2023-01-08', 'MIRACLES', 'bv1bYDgAxlo', 1),
       ('Imago Dei', '2023-01-15', 'Word & Prayer', '7V-Zvldcv3E', 2),
       ('Pray Thy Kingdom Come', '2023-01-08', 'Word & Prayer', 
       '_y-68dU943A', 2),
       ('Turning Eyes into Ears', '2023-01-01', 'Word & Prayer', 
       'BNThT8JyohY', 2),
       ('God.With.Us (Part Three: Us)', '2022-12-24', 
       'Christmas at The Austin Stone', 'TyNoMMLnksI', 2),
       ('God.With.Us (Part Two: With)', '2022-12-18', 
       'Christmas at The Austin Stone', '3Npo4LDrwrc', 2),
       ('God.With.Us (Part One: God)', '2022-12-11', 
       'Christmas at The Austin Stone', 'lKAI27fSfjQ', 2);

INSERT INTO threads (prompt, group_name, username, sermon_id)
VALUES ('Hello', 'Allandale', 'admin', 1),
       ('Hi', 'Balcones Woods', 'developer', 6),
       ('Hi', 'Barrington Oaks', 'admin', 5),
       ('Hi', 'North Lamar', 'admin', 2),
       ('Hi', 'Great Hills/Arboretum', 'admin', 3),
       ('Hi', 'Windsor Park', 'developer', 3),
       ('Hi', 'Red River Cultural District', 'pastorAdam', 7),
       ('Hi', 'Judges Hill', 'pastorJoe', 7),
       ('Hi', 'Bremond Block Historic District', 'pastorAdam', 7),
       ('Hi', 'Seaholm District', 'pastorAdam', 7),
       ('Hi', 'West End/Market District', 'pastorJoe', 7),
       ('Hi', 'Rainey Street', 'pastorAdam', 7),
       ('Hi', 'Sixth Street', 'Melody', 8),
       ('Hi', 'Second Street District', 'Sarah', 8),
       ('Hi', 'Congress Avenue', 'pastorJoe', 8),
       ('Hi', 'Red River Cultural District', 'pastorAdam', 9),
       ('Hi', 'Judges Hill', 'pastorJoe', 9),
       ('Hi', 'Bremond Block Historic District', 'pastorAdam', 9),
       ('Hi', 'Red River Cultural District', 'pastorAdam', 11),
       ('Hi', 'Judges Hill', 'pastorJoe', 11),
       ('Hi', 'Bremond Block Historic District', 'pastorAdam', 11),
       ('Hi', 'Sixth Street', 'Melody', 11),
       ('Hi', 'Second Street District', 'Sarah', 11),
       ('Hi', 'Congress Avenue', 'pastorJoe', 11),
       ('Hi', 'Seaholm District', 'pastorAdam', 12),
       ('Hi', 'West End/Market District', 'pastorJoe', 12),
       ('Hi', 'Rainey Street', 'pastorAdam', 12);

INSERT INTO posts (username, content, thread_id)
VALUES ('admin', 'Goodbye', 1),
       ('admin', 'Hello', 2),
       ('admin', 'Hello', 3),
       ('admin', 'Hello', 6),
       ('admin', 'Hello', 9),
       ('admin', 'Hello', 12),
       ('admin', 'Hello', 15),
       ('admin', 'Hello', 18),
       ('admin', 'Hello', 21),
       ('admin', 'Hello', 24),
       ('admin', 'Hello', 27),
       ('developer', 'Hello Again', 3),
       ('developer', 'Hello Again', 6),
       ('developer', 'Hello Again', 9),
       ('developer', 'Hello Again', 12),
       ('developer', 'Hello Again', 15),
       ('developer', 'Hello Again', 18),
       ('developer', 'Hello Again', 21),
       ('developer', 'Hello Again', 24),
       ('developer', 'Hello Again', 27),
       ('pastorJoe', 'Hello', 3),
       ('pastorAdam', 'Hello', 3),
       ('Melody', 'Hello', 3),
       ('Sarah', 'Hello', 3),
       ('admin', 'Hello Again', 3),
       ('pastorJoe', 'Goodbye', 6),
       ('pastorJoe', 'Goodbye', 9),
       ('pastorJoe', 'Goodbye', 12),
       ('pastorJoe', 'Goodbye', 15),
       ('pastorJoe', 'Goodbye', 18),
       ('pastorJoe', 'Goodbye', 21),
       ('pastorJoe', 'Goodbye', 24),
       ('pastorJoe', 'Goodbye', 27);
