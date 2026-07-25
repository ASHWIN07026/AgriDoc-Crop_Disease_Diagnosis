-- Fix Tamil Characters in crops table (run this after restarting Spring Boot)
USE agridoc;
ALTER TABLE crops CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE reports CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS=0;
SET NAMES 'utf8mb4';
DELETE FROM reports;
DELETE FROM crops;
SET FOREIGN_KEY_CHECKS=1;
ALTER TABLE crops AUTO_INCREMENT = 1;

INSERT INTO crops (id, name, description, image_url) VALUES
(1,'Apple (ஆப்பிள்)','Apple fruit crop grown in hilly regions.',''),
(2,'Banana (வாழை)','Banana fruit crop, widely cultivated in Tamil Nadu.',''),
(3,'Chilli (மிளகாய்)','Chilli pepper crop, major spice crop.',''),
(4,'Coconut (தேங்காய்)','Coconut tree crop, called the tree of life.',''),
(5,'Coffee (காபி)','Coffee berry plant grown in Western Ghats.',''),
(6,'Corn (சோளம்)','Maize / Corn crop used as food and fodder.',''),
(7,'Cotton (பருத்தி)','Cotton fiber plant, major cash crop.',''),
(8,'Ginger (இஞ்சி)','Ginger root spice crop.',''),
(9,'Grapes (திராட்சை)','Grapes vine fruit crop.',''),
(10,'Groundnut (நிலக்கடலை)','Groundnut legume oilseed crop.','https://images.pexels.com/photos/30107827/pexels-photo-30107827.jpeg?cs=srgb&dl=pexels-guvo59-30107827.jpg&fm=jpg'),
(11,'Mango (மாம்பழம்)','Mango tree, king of fruits in India.','https://wallpapercave.com/wp/wp2221502.jpg'),
(12,'Onion (வெங்காயம்)','Onion bulb vegetable crop.','https://tse4.mm.bing.net/th/id/OIP.QekfxFaXXvJBEI5ffzw0uAHaEK?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'),
(13,'Papaya (பப்பாளி)','Papaya tropical fruit crop.','https://insanelygoodrecipes.com/wp-content/uploads/2023/02/Fresh-Organic-Papaya-Fruit-1024x1024.jpg'),
(14,'Potato (உருளைக்கிழங்கு)','Potato tuber vegetable crop.',''),
(15,'Rice (நெல் / அரிசி)','Rice / Paddy grain crop, staple food of Tamil Nadu.','https://png.pngtree.com/thumb_back/fw800/background/20220318/pngtree-real-photos-of-grain-and-rice-products-image_1018707.jpg'),
(16,'Soybeans (சோயா பீன்ஸ்)','Soybean oilseed protein crop.','https://cdn.businessday.ng/2020/08/soybeans-scaled-1.jpg'),
(17,'Sugarcane (கரும்பு)','Sugarcane grass crop for sugar production.','https://www.cropin.com/wp-content/uploads/2025/10/Sugarcane-cultivation-crop-management-A-complete-guide-to-leveraging-agtech-insights-1.webp'),
(18,'Tomato (தக்காளி)','Tomato fruit vegetable crop.',''),
(19,'Turmeric (மஞ்சள்)','Turmeric rhizome spice and medicinal crop.','https://img.freepik.com/premium-photo/illustration-turmeric-white-background-delight_435599-27683.jpg?w=2000'),
(20,'Wheat (கோதுமை)','Wheat grain grass, staple food crop.','https://images.pexels.com/photos/54084/wheat-grain-agriculture-seed-54084.jpeg?cs=srgb&dl=pexels-pixabay-54084.jpg&fm=jpg'),
(21,'Brinjal (கத்தரிக்காய்)','Brinjal / Eggplant vegetable crop.',''),
(22,'Bitter Gourd (பாகற்காய்)','Bitter gourd medicinal vegetable crop.',''),
(23,'Bottle Gourd (சுரைக்காய்)','Bottle gourd vegetable crop.',''),
(24,'Cardamom (ஏலக்காய்)','Cardamom queen of spices, grown in hill stations.',''),
(25,'Cassava (மரவள்ளி)','Cassava / Tapioca root crop widely grown in Tamil Nadu.',''),
(26,'Cauliflower (காலிஃப்ளவர்)','Cauliflower winter vegetable crop.',''),
(27,'Drumstick (முருங்கை)','Moringa / Drumstick tree, highly nutritious.',''),
(28,'Garlic (பூண்டு)','Garlic bulb spice crop.',''),
(29,'Guava (கொய்யா)','Guava tropical fruit crop rich in Vitamin C.','https://thealthiest.com/uploads/images/202306/image_750x_648e241a49a7e.jpg'),
(30,'Lady''s Finger (வெண்டைக்காய்)','Okra / Lady finger vegetable crop.','https://th.bing.com/th/id/R.154fe436b5688a29f82820107fa723b1?rik=wJOSxtr6N0GoZg&riu=http%3a%2f%2ftips.pk%2fwp-content%2fuploads%2f2015%2f12%2flady-fingers.jpg&ehk=ozFWm79zAZTYEYxdbp0TLRVYsnYNqKZKuzbEdT18Whs%3d&risl=&pid=ImgRaw&r=0'),
(31,'Lemon (எலுமிச்சை)','Lemon citrus fruit crop.','https://pngfre.com/wp-content/uploads/lemon-18.png'),
(32,'Pineapple (அன்னாசி)','Pineapple tropical fruit crop.',''),
(33,'Pomegranate (மாதுளை)','Pomegranate fruit crop rich in antioxidants.','https://static.vecteezy.com/system/resources/previews/029/333/530/large_2x/pomegranate-transparent-background-png.png'),
(34,'Sesame (எள்)','Sesame oilseed crop, one of the oldest cultivated plants.','https://media.istockphoto.com/id/175492267/photo/integral-sesame-seads.jpg?s=612x612&w=0&k=20&c=k0m4X147hLbv4lVmhWU26p9rmqahP3hO-HYoiuOOQFY='),
(35,'Watermelon (தர்பூசணி)','Watermelon summer fruit crop.','https://images2.alphacoders.com/210/thumb-1920-210152.jpg');

SELECT id, name FROM crops ORDER BY id;
