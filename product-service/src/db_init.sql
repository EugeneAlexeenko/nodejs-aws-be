CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE product (
	id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	title text NOT NULL,
	description text,
	price integer,
	photo text
);


CREATE TABLE stock (
	id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	product_id uuid,
	count integer,
	FOREIGN KEY ("product_id") REFERENCES "product" ("id")
);

INSERT INTO
    product (title, description, price, photo)
VALUES
    ('Car', 'JEYPOD Remote Control Car, 2.4 GHZ High Speed Racing Car with 4 Batteries', 24.99, 'https://images-na.ssl-images-amazon.com/images/I/61s5bPvYJfL._AC_SX679_.jpg'),
    ('Monster Truck', 'Holyton RC Cars, 4WD Remote Control Car, 1:16 Scale Off Road Monster Trucks 30+ MPH Speed 2.4GHz All Terrain, 2 Rechargeable Batteries Toy Crawlers Vehicles for Boys and Adults, 40+ Min Play, Blue', 44.99, 'https://images-na.ssl-images-amazon.com/images/I/71zfESWrXTL._AC_SX679_.jpg'),
    ('Stunt Motorcycle', 'Click N Play Cross Country High Speed RC Remote Control Stunt Motorcycle with Riding Figure (Red)', 17.99, 'https://images-na.ssl-images-amazon.com/images/I/71LLlwrs7LL._AC_SX679_.jpg'),
    ('Helicopter', 'DEERC DE51 Remote Control Helicopter Altitude Hold RC Helicopters with Gyro for Adult Kid Beginner, 2.4GHz Aircraft Indoor Flying Toy with 3.5 Channel,High&Low Speed,LED Light,2 Battery for 20 Min Play', 17.99, 'https://images-na.ssl-images-amazon.com/images/I/71XPSMN8PwL._AC_SX679_.jpg'),
    ('Drone', 'SYMA X500 4K Drone with UHD Camera for Adults, Easy GPS Quadcopter for Beginner with 56mins Flight Time, Brush Motor, 5GHz FPV Transmission, Auto Return Home, Follow Me, Light Positioning, 2 Batteries', 34.99, 'https://images-na.ssl-images-amazon.com/images/I/715Hp%2BgEO9L._AC_SX679_.jpg');

INSERT INTO
    stock (product_id, count)
VALUES
    ((SELECT id FROM product WHERE title = 'Car'), 15),
    ((SELECT id FROM product WHERE title = 'Monster Truck'), 5),
    ((SELECT id FROM product WHERE title = 'Stunt Motorcycle'), 8),
    ((SELECT id FROM product WHERE title = 'Helicopter'), 10),
    ((SELECT id FROM product WHERE title = 'Drone'), 3);
