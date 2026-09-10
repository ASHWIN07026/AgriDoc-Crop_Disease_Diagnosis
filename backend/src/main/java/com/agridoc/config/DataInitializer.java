package com.agridoc.config;

import com.agridoc.entity.Crop;
import com.agridoc.entity.User;
import com.agridoc.repository.CropRepository;
import com.agridoc.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@Order(2)
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CropRepository cropRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUsers();
        seedCrops();
    }

    private void seedUsers() {
        if (userRepository.count() == 0) {
            log.info("No users found in database. Seeding default demo accounts (admin, farmer, expert)...");

            List<User> users = List.of(
                User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .email("admin@agridoc.com")
                    .phone("+1234567890")
                    .region("Central Region")
                    .role("ADMIN")
                    .fullName("AgriDoc Administrator")
                    .build(),
                User.builder()
                    .username("farmer")
                    .password(passwordEncoder.encode("password123"))
                    .email("farmer@agridoc.com")
                    .phone("+919876543210")
                    .region("Southern Valley")
                    .role("FARMER")
                    .fullName("Hari Kumar")
                    .build(),
                User.builder()
                    .username("expert")
                    .password(passwordEncoder.encode("password123"))
                    .email("expert@agridoc.com")
                    .phone("+918765432109")
                    .region("Western Ghats")
                    .role("EXPERT")
                    .fullName("Dr. Ramesh Swaminathan")
                    .build()
            );

            userRepository.saveAll(users);
            log.info("Successfully seeded 3 default users (admin, farmer, expert).");
        }
    }

    private void seedCrops() {
        if (cropRepository.count() == 0) {
            log.info("No crops found in database. Seeding all 35 crops with bilingual names and images...");

            List<Crop> crops = new ArrayList<>();
            crops.add(new Crop(1L, "Apple (ஆப்பிள்)", "Apple fruit crop grown in hilly regions.", "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&auto=format&fit=crop"));
            crops.add(new Crop(2L, "Banana (வாழை)", "Banana fruit crop, widely cultivated in Tamil Nadu.", "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&auto=format&fit=crop"));
            crops.add(new Crop(3L, "Chilli (மிளகாய்)", "Chilli pepper crop, major spice crop.", "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=400&auto=format&fit=crop"));
            crops.add(new Crop(4L, "Coconut (தேங்காய்)", "Coconut tree crop, called the tree of life.", "https://static.independent.co.uk/2022/09/02/09/11181047-27ecb272-8177-4b3a-bb72-2f12a0a11a3a.jpg"));
            crops.add(new Crop(5L, "Coffee (காபி)", "Coffee berry plant grown in Western Ghats.", "https://images.pexels.com/photos/1695052/pexels-photo-1695052.jpeg?cs=srgb&dl=pexels-igor-haritanovich-1695052.jpg&fm=jpg"));
            crops.add(new Crop(6L, "Corn (சோளம்)", "Maize / Corn crop used as food and fodder.", "https://rare-gallery.com/uploads/posts/576903-corn.jpg"));
            crops.add(new Crop(7L, "Cotton (பருத்தி)", "Cotton fiber plant, major cash crop.", "https://images.ctfassets.net/3s5io6mnxfqz/4TV7YTCO1DJuMhhn7RD1Ol/b5a6c12340e6529a86bc1b557ed2d8f8/AdobeStock_136921602.jpeg"));
            crops.add(new Crop(8L, "Ginger (இஞ்சி)", "Ginger root spice crop.", "https://static.vecteezy.com/system/resources/thumbnails/026/656/343/small_2x/ai-generated-ai-generative-ginger-root-vegetable-organic-eco-food-nutrition-culinary-spicy-healthy-fresh-herb-graphic-art-photo.jpg"));
            crops.add(new Crop(9L, "Grapes (திராட்சை)", "Grapes vine fruit crop.", "https://images.pexels.com/photos/45209/purple-grapes-vineyard-napa-valley-napa-vineyard-45209.jpeg?cs=srgb&dl=pexels-pixabay-45209.jpg&fm=jpg"));
            crops.add(new Crop(10L, "Groundnut (நிலக்கடலை)", "Groundnut legume oilseed crop.", "https://images.pexels.com/photos/30107827/pexels-photo-30107827.jpeg?cs=srgb&dl=pexels-guvo59-30107827.jpg&fm=jpg"));
            crops.add(new Crop(11L, "Mango (மாம்பழம்)", "Mango tree, king of fruits in India.", "https://wallpapercave.com/wp/wp2221502.jpg"));
            crops.add(new Crop(12L, "Onion (வெங்காயம்)", "Onion bulb vegetable crop.", "https://tse4.mm.bing.net/th/id/OIP.QekfxFaXXvJBEI5ffzw0uAHaEK?r=0&rs=1&pid=ImgDetMain&o=7&rm=3"));
            crops.add(new Crop(13L, "Papaya (பப்பாளி)", "Papaya tropical fruit crop.", "https://insanelygoodrecipes.com/wp-content/uploads/2023/02/Fresh-Organic-Papaya-Fruit-1024x1024.jpg"));
            crops.add(new Crop(14L, "Potato (உருளைக்கிழங்கு)", "Potato tuber vegetable crop.", "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&auto=format&fit=crop"));
            crops.add(new Crop(15L, "Rice (நெல் / அரிசி)", "Rice / Paddy grain crop, staple food of Tamil Nadu.", "https://png.pngtree.com/thumb_back/fw800/background/20220318/pngtree-real-photos-of-grain-and-rice-products-image_1018707.jpg"));
            crops.add(new Crop(16L, "Soybeans (சோயா பீன்ஸ்)", "Soybean oilseed protein crop.", "https://cdn.businessday.ng/2020/08/soybeans-scaled-1.jpg"));
            crops.add(new Crop(17L, "Sugarcane (கரும்பு)", "Sugarcane grass crop for sugar production.", "https://www.cropin.com/wp-content/uploads/2025/10/Sugarcane-cultivation-crop-management-A-complete-guide-to-leveraging-agtech-insights-1.webp"));
            crops.add(new Crop(18L, "Tomato (தக்காளி)", "Tomato fruit vegetable crop.", "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop"));
            crops.add(new Crop(19L, "Turmeric (மஞ்சள்)", "Turmeric rhizome spice and medicinal crop.", "https://img.freepik.com/premium-photo/illustration-turmeric-white-background-delight_435599-27683.jpg?w=2000"));
            crops.add(new Crop(20L, "Wheat (கோதுமை)", "Wheat grain grass, staple food crop.", "https://images.pexels.com/photos/54084/wheat-grain-agriculture-seed-54084.jpeg?cs=srgb&dl=pexels-pixabay-54084.jpg&fm=jpg"));
            crops.add(new Crop(21L, "Brinjal (கத்தரிக்காய்)", "Brinjal / Eggplant vegetable crop.", "https://tiimg.tistatic.com/fp/1/007/587/100-percent-natural-fresh-healthy-purple-brinjal-rich-in-many-nutrients-236.jpg"));
            crops.add(new Crop(22L, "Bitter Gourd (பாகற்காய்)", "Bitter gourd medicinal vegetable crop.", "https://th.bing.com/th/id/R.7b9801acf6830bd088957631175f36ed?rik=sgfxV17oNDRAXA&riu=http%3a%2f%2fnaturebring.com%2fwp-content%2fuploads%2f2017%2f02%2fBitter-Gourd-nb-02-1024x768.jpg&ehk=ml%2fySGvYUH7FU9zOAXSzYgS3rJ%2f3%2flcqL6hivXHudk0%3d&risl=&pid=ImgRaw&r=0"));
            crops.add(new Crop(23L, "Bottle Gourd (சுரைக்காய்)", "Bottle gourd vegetable crop.", "https://facts.net/wp-content/uploads/2023/11/10-bottle-gourd-nutrition-facts-1700401363.jpg"));
            crops.add(new Crop(24L, "Cardamom (ஏலக்காய்)", "Cardamom queen of spices, grown in hill stations.", "https://www.allrecipes.com/thmb/k9Lz3cPTurD2mL5gliy7hF54SBY=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/GettyImages-1134929438-2000-6ed05c6782a74f82b7229fc0de6254ec.jpg"));
            crops.add(new Crop(25L, "Cassava (மரவள்ளி)", "Cassava / Tapioca root crop widely grown in Tamil Nadu.", "https://images.pexels.com/photos/7543155/pexels-photo-7543155.jpeg?cs=srgb&dl=pexels-daniel-dan-47825192-7543155.jpg&fm=jpg"));
            crops.add(new Crop(26L, "Cauliflower (காலிஃப்ளவர்)", "Cauliflower winter vegetable crop.", "https://www.thespruce.com/thmb/3xv-bplva31jK5D9fYL0_5c9UB0=/4696x0/filters:no_upscale():max_bytes(150000):strip_icc()/how-to-grow-cauliflower-1403494-hero-76cf5f524a564adabb1ac6adfa311482.jpg"));
            crops.add(new Crop(27L, "Drumstick (முருங்கை)", "Moringa / Drumstick tree, highly nutritious.", "https://5.imimg.com/data5/SELLER/Default/2023/12/369136084/LG/RH/CL/182645017/organic-green-drumsticks-1000x1000.jpg"));
            crops.add(new Crop(28L, "Garlic (பூண்டு)", "Garlic bulb spice crop.", "https://images.pexels.com/photos/19127227/pexels-photo-19127227/free-photo-of-close-up-of-garlic.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"));
            crops.add(new Crop(29L, "Guava (கொய்யா)", "Guava tropical fruit crop rich in Vitamin C.", "https://thealthiest.com/uploads/images/202306/image_750x_648e241a49a7e.jpg"));
            crops.add(new Crop(30L, "Lady's Finger (வெண்டைக்காய்)", "Okra / Lady's finger vegetable crop.", "https://th.bing.com/th/id/R.154fe436b5688a29f82820107fa723b1?rik=wJOSxtr6N0GoZg&riu=http%3a%2f%2ftips.pk%2fwp-content%2fuploads%2f2015%2f12%2flady-fingers.jpg&ehk=ozFWm79zAZTYEYxdbp0TLRVYsnYNqKZKuzbEdT18Whs%3d&risl=&pid=ImgRaw&r=0"));
            crops.add(new Crop(31L, "Lemon (எலுமிச்சை)", "Lemon citrus fruit crop.", "https://pngfre.com/wp-content/uploads/lemon-18.png"));
            crops.add(new Crop(32L, "Pineapple (அன்னாசி)", "Pineapple tropical fruit crop.", "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400&auto=format&fit=crop"));
            crops.add(new Crop(33L, "Pomegranate (மாதுளை)", "Pomegranate fruit crop rich in antioxidants.", "https://static.vecteezy.com/system/resources/previews/029/333/530/large_2x/pomegranate-transparent-background-png.png"));
            crops.add(new Crop(34L, "Sesame (எள்)", "Sesame oilseed crop, one of the oldest cultivated plants.", "https://media.istockphoto.com/id/175492267/photo/integral-sesame-seads.jpg?s=612x612&w=0&k=20&c=k0m4X147hLbv4lVmhWU26p9rmqahP3hO-HYoiuOOQFY="));
            crops.add(new Crop(35L, "Watermelon (தர்பூசணி)", "Watermelon summer fruit crop.", "https://images2.alphacoders.com/210/thumb-1920-210152.jpg"));

            cropRepository.saveAll(crops);
            log.info("Successfully seeded all 35 crops with verified image links.");
        }
    }
}
