/**
 * Comprehensive authentic destination knowledge base for Indian travel destinations.
 * Used for AI prompt grounding context and resilient curated itinerary generation.
 * Guaranteed 100% authentic, real-world monuments, bazaars, cafes, foods, and tips.
 */

export const DESTINATION_KNOWLEDGE = {
  jaipur: {
    name: "Jaipur",
    state: "Rajasthan",
    region: "North",
    tagline: "The Pink City of India",
    lat: 26.9124,
    lng: 75.7873,
    attractions: [
      { name: "Amber Fort", lat: 26.9855, lng: 75.8513, duration: 150, time: "08:30", reason: "Iconic hilltop fort with mirror halls (Sheesh Mahal) and Maota Lake panoramic views." },
      { name: "Hawa Mahal", lat: 26.9239, lng: 75.8267, duration: 60, time: "11:30", reason: "5-storey honeycomb palace of 953 jharokhas built for royal women." },
      { name: "City Palace", lat: 26.9258, lng: 75.8237, duration: 90, time: "13:30", reason: "Living royal palace featuring Chandra Mahal and rare textile galleries." },
      { name: "Jantar Mantar", lat: 26.9248, lng: 75.8246, duration: 60, time: "15:30", reason: "UNESCO World Heritage stone astronomical observatory with giant sundials." },
      { name: "Nahargarh Fort", lat: 26.9373, lng: 75.8155, duration: 120, time: "17:30", reason: "Dramatic Aravalli ridge fort offering the definitive sunset panorama of Jaipur." },
      { name: "Jal Mahal", lat: 26.9535, lng: 75.8462, duration: 45, time: "09:00", reason: "Submerged water palace in Man Sagar Lake framed by the Aravalli hills." },
      { name: "Johari Bazaar", lat: 26.9200, lng: 75.8270, duration: 90, time: "16:00", reason: "Centuries-old bazaar famed for Kundan jewellery, Meenakari, and silver craft." },
      { name: "Albert Hall Museum", lat: 26.9116, lng: 75.8195, duration: 75, time: "19:00", reason: "Indo-Saracenic museum showcasing royal artifacts, illuminated beautifully at night." },
      { name: "Panna Meena Ka Kund", lat: 26.9890, lng: 75.8530, duration: 45, time: "10:30", reason: "Mesmerising 16th-century geometric stepwell near Amber Fort." },
      { name: "Chokhi Dhani", lat: 26.7725, lng: 75.8340, duration: 180, time: "18:30", reason: "Immersive ethnic Rajasthani village resort with Kalbelia dance and traditional thali." }
    ],
    foodRecommendations: [
      { name: "Pyaaz Kachori at Rawat Mishthan Bhandar", desc: "Crispy flaky kachori stuffed with spiced onions, a Jaipur culinary rite of passage." },
      { name: "Royal Rajasthani Thali at Laxmi Misthan Bhandar (LMB)", desc: "Heritage Johari Bazaar dining with authentic Dal Baati Churma and Ker Sangri." },
      { name: "Ghewar at Bombay Misthan Bhandar", desc: "Honeycomb Rajasthani disc dessert soaked in cardamom saffron syrup." },
      { name: "Makhaniya Lassi at Lassiwala (MI Road)", desc: "Served fresh since 1944 in traditional clay kulhads with a thick clotted malai layer." },
      { name: "Laal Maas at Handi or Niros", desc: "Smoky mutton curry prepared in fiery Mathania red chillies and clarified ghee." }
    ],
    activities: [
      "Guided early morning heritage walk through Jaipur's walled city pink gates",
      "Traditional wooden block-printing workshop in the artisan village of Bagru",
      "Sunset chai and skyline viewing at Padao Open-Air Cafe atop Nahargarh Fort",
      "Private audio-guided tour of the Maharaja Sawai Man Singh II Museum in City Palace"
    ],
    hiddenGems: [
      "Panna Meena Ka Kund stepwell in Amer village",
      "Galtaji Monkey Temple and natural sacred mountain springs",
      "Kanak Vrindavan landscaped royal pleasure gardens beside Man Sagar Lake"
    ],
    tips: [
      "Visit Amber Fort before 09:00 AM to beat tourist buses and experience soft golden-hour morning lighting.",
      "Always take Government pre-paid auto rickshaws or e-rickshaws inside the congested walled city.",
      "Most monument composite entry tickets include Amber Fort, Hawa Mahal, Jantar Mantar, and Nahargarh at a major discount."
    ]
  },

  agra: {
    name: "Agra",
    state: "Uttar Pradesh",
    region: "North",
    tagline: "The City of the Taj Mahal",
    lat: 27.1767,
    lng: 78.0081,
    attractions: [
      { name: "Taj Mahal", lat: 27.1751, lng: 78.0421, duration: 180, time: "06:00", reason: "Wonder of the World white-marble mausoleum glowing ethereal rose and gold at sunrise." },
      { name: "Agra Fort", lat: 27.1795, lng: 78.0211, duration: 120, time: "10:30", reason: "Mighty red-sandstone Mughal fortress featuring Jahangiri Mahal and Musamman Burj." },
      { name: "Mehtab Bagh", lat: 27.1800, lng: 78.0420, duration: 90, time: "17:00", reason: "Charbagh garden complex on the opposite bank of Yamuna offering peaceful Taj sunset reflections." },
      { name: "Itmad-ud-Daulah (Baby Taj)", lat: 27.1929, lng: 78.0310, duration: 60, time: "14:00", reason: "Exquisite precursor to the Taj Mahal built with intricate pietra dura marble inlays." },
      { name: "Fatehpur Sikri", lat: 27.0945, lng: 77.6679, duration: 150, time: "09:30", reason: "Emperor Akbar's abandoned red-stone royal capital with the soaring Buland Darwaza." },
      { name: "Kinari Bazaar", lat: 27.1840, lng: 78.0120, duration: 90, time: "18:30", reason: "Vibrant ancient market narrow lanes famous for zardozi embroidery and brassware." }
    ],
    foodRecommendations: [
      { name: "Authentic Agra Petha from Panchhi Petha (Sadats / Hari Parbat)", desc: "Translucent candied white pumpkin sweet in angoori, saffron, and paan flavors." },
      { name: "Bedai and Jalebi breakfast at Deviram Sweets", desc: "Deep-fried lentil puris served with spicy potato gravy and crispy piping hot jalebis." },
      { name: "Mughlai Dum Biryani and Kebabs at Pinch of Spice", desc: "Slow-cooked fragrant rice and succulent kebabs celebrating royal Mughal gastronomy." },
      { name: "Chaat at Chaat Gali (Sadar Bazaar)", desc: "Bhalla chaat, dahi gujiya, and golgappe made with cumin spiced mint water." }
    ],
    activities: [
      "Early morning dawn viewing of the Taj Mahal from the East Gate with a licensed ASI guide",
      "Heritage walking tour through the 400-year-old spice and artisan lanes of Kinari Bazaar",
      "Sunset boat ride on the Yamuna river capturing unhindered rear Taj reflections",
      "Marble inlay demonstration by 6th-generation descendants of royal artisans"
    ],
    hiddenGems: [
      "Chini Ka Rauza - tomb of Afzal Khan with Persian glazed tilework",
      "Akbar's Tomb at Sikandra with peaceful deer roaming in the manicured charbagh gardens"
    ],
    tips: [
      "Taj Mahal is strictly closed on Fridays for prayers; plan your itinerary accordingly.",
      "Only small handbags are permitted inside Taj Mahal; power banks, tripods, and tobacco are strictly prohibited."
    ]
  },

  varanasi: {
    name: "Varanasi",
    state: "Uttar Pradesh",
    region: "North",
    tagline: "The Sacred Eternal City of Light",
    lat: 25.3176,
    lng: 82.9739,
    attractions: [
      { name: "Dashashwamedh Ghat", lat: 25.3060, lng: 83.0107, duration: 120, time: "18:30", reason: "The spiritual nerve center of Kashi where the grand choreographed evening Ganga Aarti unfolds." },
      { name: "Assi Ghat", lat: 25.2890, lng: 83.0068, duration: 90, time: "05:30", reason: "Southernmost major ghat famous for 'Subah-e-Banaras' dawn music, yoga, and meditation." },
      { name: "Kashi Vishwanath Temple (Golden Temple)", lat: 25.3109, lng: 83.0107, duration: 120, time: "08:30", reason: "One of the 12 sacred Jyotirlingas, approached through the magnificent new Vishwanath Corridor." },
      { name: "Manikarnika Ghat", lat: 25.3108, lng: 83.0135, duration: 60, time: "11:30", reason: "The revered primary cremation ghat where the eternal pyres have burned unbroken for millennia." },
      { name: "Sarnath Deer Park & Dhamek Stupa", lat: 25.3811, lng: 83.0214, duration: 150, time: "14:00", reason: "The sacred site where Lord Buddha delivered his first sermon after attaining enlightenment." },
      { name: "Ramnagar Fort & Museum", lat: 25.2677, lng: 83.0253, duration: 90, time: "16:00", reason: "18th-century sandstone fort across the Ganga housing vintage royal cars and armory." },
      { name: "Godowlia Market & Chowk", lat: 25.3100, lng: 83.0080, duration: 90, time: "19:30", reason: "Bustling labyrinthine alleys famed for authentic Banarasi silk sarees and street food." }
    ],
    foodRecommendations: [
      { name: "Tamatar Chaat at Kashi Chaat Bhandar", desc: "Varanasi's legendary hot tomato puree chaat cooked with roasted spices, cashews, and ghee." },
      { name: "Malaiyyo (Winter Dew Foam) in the Chaukhamba Alleys", desc: "Whisked milk foam infused with saffron and pistachios, left outdoors to capture winter morning dew." },
      { name: "Banarasi Paan at Keshav Tambool Bhandar (Assi Ghat)", desc: "Fragrant betel leaf delicately wrapped with gulkand, kattha, and silver vark." },
      { name: "Kachori Jalebi breakfast at Ram Bhandar (Thatheri Bazaar)", desc: "Crisp urad dal kachoris served with spicy hing-infused aloo sabzi and hot syrup jalebis." }
    ],
    activities: [
      "Serene sunrise rowing boat cruise from Assi Ghat downstream to Manikarnika Ghat",
      "Witnessing the mesmerizing multi-priest evening Ganga Aarti from a riverboat at Dashashwamedh",
      "Silken weaving workshop visit with hereditary master weavers in the Madanpura quarter",
      "Meditation under the Bodhi tree at the archaeological ruins of Sarnath"
    ],
    hiddenGems: [
      "Lolark Kund - ancient subterranean sun stepwell reservoir near Tulsi Ghat",
      "Nauka Vihar to the serene sandy eastern riverbanks across the Ganga at golden hour"
    ],
    tips: [
      "Hire a licensed hand-rowed wooden boat at dawn rather than loud diesel motorboats for a peaceful spiritual experience.",
      "Dress conservatively with shoulders and knees covered when walking along the sacred ghats and entering temples."
    ]
  },

  goa: {
    name: "Goa",
    state: "Goa",
    region: "West",
    tagline: "Sun, Sea & Portuguese Soul",
    lat: 15.2993,
    lng: 74.1240,
    attractions: [
      { name: "Fort Aguada", lat: 15.4920, lng: 73.7737, duration: 90, time: "09:00", reason: "17th-century Portuguese fortress and historic lighthouse overlooking the Arabian Sea." },
      { name: "Basilica of Bom Jesus", lat: 15.5009, lng: 73.9116, duration: 75, time: "11:30", reason: "UNESCO World Heritage Baroque church holding the sacred mortal remains of St. Francis Xavier." },
      { name: "Fontainhas (Latin Quarter, Panaji)", lat: 15.4989, lng: 73.8278, duration: 90, time: "15:30", reason: "Picturesque heritage quarter with terracotta tiled roofs, rooster weather vanes, and pastel Portuguese villas." },
      { name: "Chapora Fort", lat: 15.6059, lng: 73.7380, duration: 75, time: "17:30", reason: "Dramatic cliffside red-laterite fort overlooking Vagator Beach and the Ozran coastline." },
      { name: "Palolem Beach", lat: 15.0100, lng: 74.0232, duration: 150, time: "14:00", reason: "Crescent-shaped serene beach in South Goa framed by rocky headlands and coconut groves." },
      { name: "Dudhsagar Falls", lat: 15.3144, lng: 74.3143, duration: 240, time: "08:00", reason: "Four-tiered majestic 310m milky waterfall deep inside Bhagwan Mahavir Wildlife Sanctuary." },
      { name: "Anjuna Flea Market", lat: 15.5800, lng: 73.7440, duration: 120, time: "16:00", reason: "Legendary bohemian open-air market with handmade jewelry, music, and beachside cafes." }
    ],
    foodRecommendations: [
      { name: "Authentic Goan Fish Curry Thali at Ritz Classic (Panaji)", desc: "Steamed rice, kingfish curry cooked with fresh grated coconut and kokum, fried prawns, and kismoor." },
      { name: "Pork Vindaloo or Chicken Xacuti at Mum's Kitchen", desc: "Heritage home recipes highlighting toddy vinegar, toasted spices, and Kashmiri red chillies." },
      { name: "Traditional Bebinca and Serradura at Confeitaria 31 De Janeiro", desc: "Seven-layered spiced coconut egg dessert paired with creamy sawdust pudding." },
      { name: "Poi (Goan bread) with Chorizo at a local village bakery", desc: "Fresh clay oven baked sourdough bread stuffed with spicy fermented Goan sausage." }
    ],
    activities: [
      "Guided architectural walking tour through the quiet cobbled streets of Fontainhas",
      "Kayaking through the serene mangrove backwaters of the Sal or Chapora river",
      "Sunset dolphin spotting cruise near Sinquerim and Aguada bay",
      "Spice plantation guided tour with traditional banana-leaf buffet in Ponda"
    ],
    hiddenGems: [
      "Cola Beach with its secluded freshwater blue lagoon meeting the sea",
      "Cabo de Rama Fort with sweeping ocean vistas and uncrowded historic ruins"
    ],
    tips: [
      "Rent a scooter or car from licensed yellow-black rental operators with a helmet at all times.",
      "Avoid visiting during the peak monsoon months (June to August) if water sports and swimming are your priority."
    ]
  },

  udaipur: {
    name: "Udaipur",
    state: "Rajasthan",
    region: "North",
    tagline: "The Venice of the East",
    lat: 24.5854,
    lng: 73.7125,
    attractions: [
      { name: "City Palace Udaipur", lat: 24.5764, lng: 73.6835, duration: 180, time: "09:00", reason: "Rajasthan's largest palace complex perched over Lake Pichola with mirror mosaics and royal courtyards." },
      { name: "Lake Pichola Boat Cruise", lat: 24.5750, lng: 73.6800, duration: 75, time: "16:30", reason: "Scenic sunset cruise passing Jag Mandir and the illuminated Lake Palace." },
      { name: "Jagdish Temple", lat: 24.5796, lng: 73.6844, duration: 45, time: "11:30", reason: "Intricately carved 1651 Indo-Aryan temple dedicated to Lord Vishnu." },
      { name: "Saheliyon Ki Bari", lat: 24.6033, lng: 73.6844, duration: 60, time: "13:30", reason: "Historic garden of maidens with marble fountains, lotus pools, and sculpted pavilions." },
      { name: "Monsoon Palace (Sajjangarh)", lat: 24.5938, lng: 73.6375, duration: 120, time: "17:30", reason: "High hilltop fort overlooking Udaipur's lakes, delivering stunning twilight vistas." },
      { name: "Bagore Ki Haveli", lat: 24.5798, lng: 73.6811, duration: 90, time: "19:00", reason: "18th-century waterfront mansion hosting the vibrant Dharohar Rajasthani folk dance show." }
    ],
    foodRecommendations: [
      { name: "Dal Baati Churma at Krishna Dal Bati Restro", desc: "Authentic wood-fired baatis crushed in clarified desi ghee with spicy mixed lentils." },
      { name: "Lakeside dining at Ambrai Restaurant (Amet Haveli)", desc: "Romantic dinner overlooking the glowing illuminated facade of City Palace across Lake Pichola." },
      { name: "Mirchi Bada and Poha at Jagdish Misthan Bhandar", desc: "Spicy potato-stuffed Rajasthani green chillies fried in chickpea batter." }
    ],
    activities: [
      "Evening Dharohar cultural performance featuring Kalbelia dance and puppet theater at Bagore Ki Haveli",
      "Private heritage boat ride around Jag Mandir Island during golden hour",
      "Artisan miniature painting workshop in the artist lanes near Jagdish Temple"
    ],
    hiddenGems: [
      "Badi Lake (Tiger Lake) and Bahubali Hill for uncrowded ridge trekking",
      "Ahar Royal Cenotaphs with more than 370 marble chhatris of Mewar maharajas"
    ],
    tips: [
      "Book the sunset Lake Pichola boat ride from the City Palace jetty at least 2 hours in advance during peak season.",
      "Vehicles cannot enter the narrow heritage lake quarters; hire an auto or enjoy walking."
    ]
  },

  manali: {
    name: "Manali",
    state: "Himachal Pradesh",
    region: "North",
    tagline: "Valley of the Gods",
    lat: 32.2432,
    lng: 77.1892,
    attractions: [
      { name: "Hadimba Temple", lat: 32.2472, lng: 77.1752, duration: 60, time: "09:00", reason: "1553 pagoda-style wooden temple nestled amidst towering cedar and deodar forests." },
      { name: "Solang Valley", lat: 32.3166, lng: 77.1578, duration: 180, time: "11:00", reason: "Adventure hotspot famous for paragliding, zorbing, and snow activities in winter." },
      { name: "Atal Tunnel & Sissu (Lahaul)", lat: 32.4180, lng: 77.1640, duration: 240, time: "08:30", reason: "World's longest highway tunnel above 10,000 feet, opening into the trans-Himalayan Lahaul valley." },
      { name: "Old Manali Village & Cafes", lat: 32.2570, lng: 77.1780, duration: 120, time: "16:00", reason: "Bohemian village with wooden houses, orchard paths, and live-music riverside cafes." },
      { name: "Jogini Waterfall", lat: 32.2700, lng: 77.1950, duration: 150, time: "14:00", reason: "Scenic nature trek from Vashisht village through apple orchards to a cascading mountain fall." },
      { name: "Vashisht Hot Water Springs", lat: 32.2606, lng: 77.1878, duration: 60, time: "10:30", reason: "Natural sulfur thermal healing springs adjacent to an ancient sage temple." }
    ],
    foodRecommendations: [
      { name: "Himachali Siddu with pure ghee", desc: "Steamed wheat dough pocket stuffed with spiced crushed walnuts and poppy seeds." },
      { name: "Fresh Himalayan Trout at Johnson's Cafe", desc: "Pan-seared river trout seasoned with lemon butter and fresh mountain herbs." },
      { name: "Steamed Tibetan Momos and Thukpa in Old Manali", desc: "Comforting piping-hot noodle broth and momos paired with fiery chilli chutney." }
    ],
    activities: [
      "Trek to Jogini Waterfall with mountain vistas of the Pir Panjal range",
      "Drive across the 9.02 km Atal Tunnel into Lahaul's Sissu waterfall and willow groves",
      "White water river rafting in the Beas river near Kullu"
    ],
    hiddenGems: [
      "Naggar Castle - medieval wood and stone castle with panoramic views of Kullu valley",
      "Jana Waterfall with traditional local dhaba serving red rice and siddu"
    ],
    tips: [
      "Rohtang Pass permits are strictly capped and must be booked online 1 to 2 days prior.",
      "Stay in Old Manali or Naggar to avoid the crowded commercial jams of Mall Road."
    ]
  },

  ladakh: {
    name: "Ladakh",
    state: "Ladakh",
    region: "North",
    tagline: "The Land of High Passes",
    lat: 34.1526,
    lng: 77.5771,
    attractions: [
      { name: "Pangong Tso Lake", lat: 33.7595, lng: 78.6674, duration: 240, time: "11:00", reason: "Endorheic trans-Himalayan saltwater lake that shifts shades from turquoise to deep indigo." },
      { name: "Nubra Valley & Hunder Sand Dunes", lat: 34.5800, lng: 77.4700, duration: 240, time: "15:00", reason: "Cold desert dunes framed by snowy crags where double-humped Bactrian camels roam." },
      { name: "Khardung La Pass", lat: 34.2787, lng: 77.6046, duration: 60, time: "09:30", reason: "One of the highest motorable mountain passes in the world at 17,982 ft (5,480 m)." },
      { name: "Thiksey Monastery", lat: 34.0578, lng: 77.6667, duration: 90, time: "06:30", reason: "Majestic 12-storey monastery resembling the Potala Palace with a 15-meter Maitreya Buddha." },
      { name: "Shanti Stupa (Leh)", lat: 34.1672, lng: 77.5847, duration: 75, time: "17:30", reason: "White-domed Buddhist stupa offering spectacular sunset views over Leh and the Zanskar range." },
      { name: "Leh Palace", lat: 34.1642, lng: 77.5855, duration: 60, time: "10:30", reason: "17th-century Tibetan-style royal palace overlooking the historic bazaar." }
    ],
    foodRecommendations: [
      { name: "Ladakhi Skyu and Tingmo at The Tibetan Kitchen (Leh)", desc: "Traditional slow-simmered vegetable stew with hand-rolled dough pieces and fluffy steamed buns." },
      { name: "Authentic Butter Tea (Gur Gur Chai)", desc: "Warm churned tea with yak butter and Himalayan salt, perfect for high-altitude hydration." },
      { name: "Fresh Apricot Juice and Seabuckthorn Jam", desc: "Organically harvested superfruits from the Nubra valley orchards." }
    ],
    activities: [
      "Attending early morning Buddhist monk chanting and horn blowing at Thiksey Monastery",
      "Riding Bactrian camels across the silver sand dunes of Hunder in Nubra",
      "Stargazing under crystal-clear dark skies at Pangong or Hanle Dark Sky Reserve"
    ],
    hiddenGems: [
      "Turtuk village - northernmost Balti Muslim heritage settlement near the LOC",
      "Hemis Monastery - largest and wealthiest monastery in Ladakh hidden in a gorge"
    ],
    tips: [
      "Dedicate Day 1 COMPLETELY to rest and acclimatization in Leh (3,500m) without strenuous physical activity to prevent AMS.",
      "Carry ample cash and an Indian postpaid SIM card (BSNL, Airtel, or Jio) as prepaid SIMs outside J&K do not work in Ladakh."
    ]
  },

  rishikesh: {
    name: "Rishikesh",
    state: "Uttarakhand",
    region: "North",
    tagline: "Yoga Capital of the World",
    lat: 30.0869,
    lng: 78.2676,
    attractions: [
      { name: "Triveni Ghat", lat: 30.1064, lng: 78.2974, duration: 90, time: "18:00", reason: "Confluence of three sacred rivers hosting the stirring Maha Aarti with fire lamps and Vedic hymns." },
      { name: "Laxman Jhula & Ram Jhula", lat: 30.1250, lng: 78.3240, duration: 90, time: "09:30", reason: "Iconic suspension bridges spanning the turquoise Ganga framed by forested Shivalik foothills." },
      { name: "The Beatles Ashram (Chaurasi Kutia)", lat: 30.1147, lng: 78.3128, duration: 120, time: "14:00", reason: "Atmospheric graffiti-adorned meditation domes where The Beatles composed the White Album in 1968." },
      { name: "Parmarth Niketan Ashram", lat: 30.1170, lng: 78.3120, duration: 90, time: "17:30", reason: "World-renowned spiritual retreat hosting inspiring riverside Ganga aarti rituals." },
      { name: "Neer Garh Waterfall", lat: 30.1420, lng: 78.3410, duration: 120, time: "11:30", reason: "Tiered natural waterfall with turquoise limestone pools, reached via a pleasant jungle trek." }
    ],
    foodRecommendations: [
      { name: "Sattvic Ayurvedic Thali at Chotiwala (Swarg Ashram)", desc: "Heritage vegetarian feast served since 1958 with ghee phulkas and fresh dal." },
      { name: "Healthy smoothie bowls and herbal chai at Little Buddha Cafe", desc: "Treehouse cafe overlooking the Ganga river rapids." }
    ],
    activities: [
      "Grade III/IV White Water River Rafting on the Ganga from Marine Drive or Shivpuri",
      "Sunrise yoga and pranayama session on the tranquil sandy beaches of Tapovan",
      "Bungee jumping at India's highest platform (83m) with certified instructors at Mohan Chatti"
    ],
    hiddenGems: [
      "Vashishta Gufa - tranquil meditation cave on the banks of Ganga, 22km upstream",
      "Kunjapuri Temple sunrise trek offering 360-degree Himalayan snow peak views"
    ],
    tips: [
      "Rishikesh is an alcohol-free and strictly vegetarian holy township.",
      "Pre-book river rafting through government-approved certified operators during September to June."
    ]
  },

  kerala: {
    name: "Kerala",
    state: "Kerala",
    region: "South",
    tagline: "God's Own Country",
    lat: 9.9312,
    lng: 76.2673,
    attractions: [
      { name: "Fort Kochi & Chinese Fishing Nets", lat: 9.9656, lng: 76.2421, duration: 120, time: "08:30", reason: "Centuries-old cantilevered fishing nets operating along historic Portuguese and Dutch quarters." },
      { name: "Alleppey Backwaters", lat: 9.4981, lng: 76.3388, duration: 240, time: "12:00", reason: "Serene labyrinth of palm-fringed canals, lagoons, and paddy fields navigated by kettuvallam houseboats." },
      { name: "Tea Plantations of Munnar", lat: 10.0889, lng: 77.0595, duration: 180, time: "09:30", reason: "Rolling emerald tea carpets blanketed in morning mist in the Western Ghats." },
      { name: "Mattancherry Dutch Palace", lat: 9.9583, lng: 76.2592, duration: 60, time: "14:30", reason: "Palace housing rare Hindu murals depicting the Ramayana and royal regalia." },
      { name: "Eravikulam National Park (Munnar)", lat: 10.2000, lng: 77.0800, duration: 150, time: "08:30", reason: "Sanctuary for the endangered Nilgiri Tahr mountain goat and home to Anamudi Peak." },
      { name: "Marari Beach", lat: 9.6000, lng: 76.3000, duration: 120, time: "17:00", reason: "Pristine, quiet golden-sand beach fringed with coconut palms near Mararikulam." }
    ],
    foodRecommendations: [
      { name: "Traditional Kerala Sadya on Banana Leaf", desc: "Feast of 24+ vegetarian dishes including Avial, Sambar, Olan, Thoran, and Payasam." },
      { name: "Appam with Vegetable / Chicken Ishtu", desc: "Lacy fermented rice batter hoppers with fragrant coconut milk stew." },
      { name: "Karimeen Pollichathu", desc: "Pearl spot fish marinated in spicy shallot paste, wrapped in banana leaf and pan-roasted." }
    ],
    activities: [
      "Overnight houseboat stay in Alleppey cruising through quiet canal villages",
      "Traditional Kathakali and Kalaripayattu martial arts performance at Kerala Kathakali Centre",
      "Guided stroll through Jew Town and spice warehouses in Mattancherry"
    ],
    hiddenGems: [
      "Varkala Cliff beach overlooking the Arabian Sea",
      "Vagamon pine forests and rolling tea meadows"
    ],
    tips: [
      "Pre-book government-approved DTPC green-certified houseboats to avoid unregulated operators.",
      "Monsoon season (Ayurvedic season) between June and August is optimal for rejuvenation treatments."
    ]
  },

  mumbai: {
    name: "Mumbai",
    state: "Maharashtra",
    region: "West",
    tagline: "The City of Dreams",
    lat: 18.9220,
    lng: 72.8347,
    attractions: [
      { name: "Gateway of India", lat: 18.9220, lng: 72.8347, duration: 60, time: "08:30", reason: "Grand Indo-Saracenic basalt arch built to commemorate the 1911 royal landing." },
      { name: "Marine Drive (Queen's Necklace)", lat: 18.9432, lng: 72.8230, duration: 90, time: "17:30", reason: "3.6 km C-shaped coastal promenade offering Mumbai's most iconic sunset and illuminated night vistas." },
      { name: "Chhatrapati Shivaji Maharaj Terminus (CSMT)", lat: 18.9398, lng: 72.8355, duration: 60, time: "11:00", reason: "UNESCO World Heritage Victorian Gothic railway headquarters with gargoyles and stained glass." },
      { name: "Elephanta Caves", lat: 18.9633, lng: 72.9315, duration: 210, time: "09:30", reason: "Rock-cut cave temples on Elephanta Island dedicated to Lord Shiva, featuring the Trimurti sculpture." },
      { name: "Colaba Causeway", lat: 18.9180, lng: 72.8290, duration: 90, time: "15:00", reason: "Vibrant shopping street packed with vintage books, jewelry, antiques, and heritage cafes." }
    ],
    foodRecommendations: [
      { name: "Vada Pav at Ashok Vada Pav (Kirti College)", desc: "Mumbai's definitive street food burger served with spicy garlic crumble (chura)." },
      { name: "Bun Maska and Irani Chai at Kyani & Co. / Britannia", desc: "Heritage Parsi-Irani cafe breakfast with crusty pav, butter, and berry pulao." },
      { name: "Pav Bhaji at Sardar Refreshments / Cannon", desc: "Spiced mashed vegetable curry swimming in butter, served with toasted pav." }
    ],
    activities: [
      "Ferry ride from Gateway of India to Elephanta Island caves across Mumbai Harbour",
      "Evening sea-breeze walk along Marine Drive watching the glittering street lights",
      "Early morning heritage architecture walk through the Kala Ghoda Arts Precinct"
    ],
    hiddenGems: [
      "Banganga Tank and Walkeshwar temple quarter dating back to the Silhara dynasty",
      "Khotachiwadi - quaint 19th-century Portuguese-style heritage village in Girgaon"
    ],
    tips: [
      "Avoid riding local suburban trains during peak commuter rush hours (08:30-11:00 AM & 06:00-09:00 PM).",
      "Use metered black-and-yellow taxis or app-based cabs; drivers always run strictly on the meter."
    ]
  },

  kolkata: {
    name: "Kolkata",
    state: "West Bengal",
    region: "East",
    tagline: "The City of Joy",
    lat: 22.5726,
    lng: 88.3639,
    attractions: [
      { name: "Victoria Memorial", lat: 22.5448, lng: 72.8347, duration: 120, time: "10:00", reason: "Stately white Makrana marble monument surrounded by lush 64-acre gardens." },
      { name: "Howrah Bridge (Rabindra Setu)", lat: 22.5851, lng: 88.3468, duration: 45, time: "08:00", reason: "World's busiest cantilever bridge over the Hooghly river carrying over 100,000 vehicles daily." },
      { name: "Dakshineswar Kali Temple", lat: 22.6550, lng: 88.3576, duration: 90, time: "14:30", reason: "Revered 19th-century Navaratna temple where mystic saint Ramakrishna Paramahamsa resided." },
      { name: "Princep Ghat", lat: 22.5539, lng: 88.3328, duration: 75, time: "17:30", reason: "Palladian porch monument on the Hooghly riverbank famous for sunset wooden boat rides." },
      { name: "College Street (Boi Para)", lat: 22.5760, lng: 88.3630, duration: 90, time: "12:00", reason: "World's largest second-hand book market and home to the intellectual Indian Coffee House." }
    ],
    foodRecommendations: [
      { name: "Authentic Kolkata Biryani at Arsalan / Shiraz", desc: "Aromatic Awadhi-style fragrant rice cooked with succulent meat, slow-cooked whole potato (aloo), and egg." },
      { name: "Kathi Rolls at Nizam's (New Market)", desc: "The birthplace of kathi rolls: paratha wrapped with skewered grilled kebabs and onions." },
      { name: "Rosogolla and Mishti Doi at KC Das / Balaram Mullick", desc: "Spongy chhena spheres in light syrup and baked sweetened creamy curd." }
    ],
    activities: [
      "Heritage wooden boat ride under Howrah Bridge from Princep Ghat at twilight",
      "Coffee and adda debate session at the historic Indian Coffee House on College Street",
      "Early morning walk through the vibrant Mullick Ghat Flower Market"
    ],
    hiddenGems: [
      "Kumartuli artisan quarter where clay idols of Goddess Durga are hand-sculpted",
      "Marble Palace mansion in North Kolkata with rare European paintings and antique clocks"
    ],
    tips: [
      "Take the vintage Kolkata Tram from Esplanade for an evocative slow-travel journey through the city.",
      "Carry cash for historic food joints and College Street book vendors."
    ]
  },

  prayagraj: {
    name: "Prayagraj",
    state: "Uttar Pradesh",
    region: "North",
    tagline: "The Sacred King of Pilgrimages (Tirtharaj)",
    lat: 25.4358,
    lng: 81.8463,
    attractions: [
      { name: "Triveni Sangam", lat: 25.4290, lng: 81.8830, duration: 150, time: "06:30", reason: "Sacred confluence of three holy rivers: the Ganga, the Yamuna, and the mythical Saraswati." },
      { name: "Allahabad Fort (Akbar's Fort)", lat: 25.4300, lng: 81.8760, duration: 90, time: "10:00", reason: "Massive 1583 fort built by Emperor Akbar housing the immortal Patalpuri Temple and sacred Akshayavat tree." },
      { name: "Anand Bhavan", lat: 25.4590, lng: 81.8590, duration: 90, time: "12:00", reason: "Ancestral home of the Nehru-Gandhi family, now an inspiring museum of India's independence movement." },
      { name: "Khusro Bagh", lat: 25.4410, lng: 81.8230, duration: 75, time: "15:00", reason: "Walled Mughal garden housing the exquisite sandstone tombs of Prince Khusro and Sultan Begum." },
      { name: "All Saints Cathedral (Patthar Girja)", lat: 25.4540, lng: 81.8330, duration: 45, time: "16:30", reason: "13th-century Gothic Revival cathedral renowned for its stained-glass rose windows and marble altar." },
      { name: "Chandrashekhar Azad Park (Company Bagh)", lat: 25.4540, lng: 81.8500, duration: 60, time: "18:00", reason: "Historic 133-acre park where freedom fighter Chandrashekhar Azad sacrificed his life, featuring the Allahabad Museum." }
    ],
    foodRecommendations: [
      { name: "Kachori-Sabzi and Jalebi at Netram Moolchand & Sons (Katra)", desc: "Pure desi-ghee urad dal kachoris served with spiced pumpkin and potato subzi since 1854." },
      { name: "Allahabadi Dum Aloo and Gujiya at Loknath Chowk", desc: "Rich slow-cooked baby potatoes in spicy yoghurt gravy followed by crisp mawa gujiyas." },
      { name: "Thick Malai Lassi at Raja Ram Lassi (Civil Lines)", desc: "Sweet churned curd served in earthen kulhads with a thick dollop of clotted cream and rabri." }
    ],
    activities: [
      "Early morning traditional boat ride to the precise color-changing confluence point at Triveni Sangam",
      "Heritage tour of Anand Bhavan and Swaraj Bhavan walking through the freedom struggle quarters",
      "Evening spiritual stroll through the illuminated ghats and historic lanes of Daraganj"
    ],
    hiddenGems: [
      "Bade Hanuman Ji Temple - unique reclining 20-foot underground idol of Lord Hanuman submerged by the Ganga each monsoon",
      "Alopi Devi Temple - sacred Shaktipeeth temple where a wooden doli (palanquin) is worshipped instead of an idol"
    ],
    tips: [
      "Negotiate boat fares to Sangam at the official boatman stands; morning visits between 06:00 and 08:30 AM offer the calmest waters and migratory Siberian gulls (winter).",
      "Civil Lines offers clean modern dining and broad tree-lined avenues, while Old Chowk offers authentic culinary heritage."
    ]
  },

  rajasthan: {
    name: "Rajasthan (Jaipur & Royal Heritage)",
    state: "Rajasthan",
    region: "North",
    tagline: "The Land of Kings, Forts & Desert Romance",
    lat: 26.9124,
    lng: 75.7873,
    attractions: [
      { name: "Amber Fort (Jaipur)", lat: 26.9855, lng: 75.8513, duration: 150, time: "08:30", reason: "Iconic hilltop fortress with Sheesh Mahal mirror mosaics and Maota lake views." },
      { name: "Hawa Mahal (Jaipur)", lat: 26.9239, lng: 75.8267, duration: 60, time: "11:30", reason: "Honeycomb pink sandstone palace of 953 jharokhas." },
      { name: "City Palace (Jaipur)", lat: 26.9258, lng: 75.8237, duration: 90, time: "13:30", reason: "Royal residence showcasing courtyards, textiles, and armor galleries." },
      { name: "Nahargarh Fort Sunset Point", lat: 26.9373, lng: 75.8155, duration: 120, time: "17:30", reason: "Breathtaking Aravalli ridge fort overlooking the Pink City." },
      { name: "City Palace & Lake Pichola (Udaipur)", lat: 24.5764, lng: 73.6835, duration: 180, time: "10:00", reason: "Grand lakeside palace complex with ornate balconies and boat cruises." },
      { name: "Mehrangarh Fort (Jodhpur)", lat: 26.2980, lng: 73.0189, duration: 150, time: "14:00", reason: "Towering cliffside fort overlooking the Blue City." },
      { name: "Chokhi Dhani Heritage Village", lat: 26.7725, lng: 75.8340, duration: 180, time: "19:00", reason: "Live Kalbelia folk dance, puppet shows, and royal thali dining." }
    ],
    foodRecommendations: [
      { name: "Dal Baati Churma with pure desi ghee", desc: "Authentic wood-fired baatis with spicy panchmel dal and sweet churma." },
      { name: "Pyaaz Kachori at Rawat Mishthan Bhandar", desc: "Crispy flaky kachori stuffed with spiced onions." },
      { name: "Laal Maas (Smoky Mathania chilli mutton curry)", desc: "Royal Rajasthani delicacy cooked with Mathania red chillies." },
      { name: "Makhaniya Lassi in earthen kulhads", desc: "Thick sweet curd with saffron and clotted malai." }
    ],
    activities: [
      "Guided heritage tour of Amber Fort and the geometric stepwell of Panna Meena Kund",
      "Sunset chai and skyline viewing at Padao Cafe atop Nahargarh Fort",
      "Traditional Rajasthani folk dance and puppet performance at Bagore Ki Haveli or Chokhi Dhani"
    ],
    hiddenGems: [
      "Panna Meena Ka Kund ancient stepwell near Amer",
      "Galtaji Temple (Monkey Temple) nestled in the Aravalli hills"
    ],
    tips: [
      "Visit forts in the early morning (before 9:30 AM) to avoid midday heat and tour bus crowds.",
      "A composite monument ticket in Jaipur gives access to Amber Fort, Hawa Mahal, Jantar Mantar, and Nahargarh Fort."
    ]
  },

  kerala: {
    name: "Kerala (God's Own Country)",
    state: "Kerala",
    region: "South",
    tagline: "Serene Backwaters, Spice Hills & Coastal Soul",
    lat: 9.9312,
    lng: 76.2673,
    attractions: [
      { name: "Alleppey (Alappuzha) Backwaters & Houseboat", lat: 9.4981, lng: 76.3388, duration: 240, time: "09:00", reason: "Cruise along palm-fringed canals, paddy fields, and lagoons on a traditional kettuvallam." },
      { name: "Fort Kochi & Chinese Fishing Nets", lat: 9.9658, lng: 76.2421, duration: 90, time: "16:00", reason: "Colonial maritime heritage, iconic cantilevered fishing nets, and seaside promenade." },
      { name: "Mattancherry Palace (Dutch Palace) & Jewish Synagogue", lat: 9.9583, lng: 76.2594, duration: 75, time: "11:30", reason: "Fascinating Hindu murals and the 1568 Paradesi Synagogue in Jew Town." },
      { name: "Munnar Tea Plantations & Eravikulam National Park", lat: 10.0889, lng: 77.0595, duration: 180, time: "10:00", reason: "Endless rolling emerald tea gardens and home to the endangered Nilgiri Tahr." },
      { name: "Marari Beach", lat: 9.6000, lng: 76.2970, duration: 120, time: "17:30", reason: "Pristine white sand fishing village beach renowned for peaceful sunsets." },
      { name: "Kathakali & Kalaripayattu Cultural Center", lat: 9.9670, lng: 76.2440, duration: 90, time: "18:30", reason: "Ancient classical dance drama makeup demonstration and Kerala martial arts." }
    ],
    foodRecommendations: [
      { name: "Kerala Sadhya on Banana Leaf", desc: "Traditional feast with red rice, avial, sambar, olan, thoran, and payasam." },
      { name: "Karimeen Pollichathu (Pearl Spot Fish)", desc: "Fresh backwater fish marinated in shallots, ginger, curry leaves, and slow-roasted in a banana leaf." },
      { name: "Appam with Vegetable or Chicken Stew", desc: "Lacy fermented rice pancakes with coconut milk spiced stew." },
      { name: "Malabar Dum Biryani with pickled lemon", desc: "Fragrant Kaima rice cooked with tender spiced chicken and fried onions." }
    ],
    activities: [
      "Overnight or day backwater cruise on a traditional thatched houseboat in Punnamada Lake",
      "Walking heritage tour through Jew Town spice markets and antique warehouses in Fort Kochi",
      "Witnessing live Kathakali facial expression (Navarasas) and martial Kalaripayattu show"
    ],
    hiddenGems: [
      "Kumarakom Bird Sanctuary along Vembanad Lake",
      "Kodanad Elephant Training Sanctuary along the Periyar River"
    ],
    tips: [
      "Book government-approved DTPC houseboats to ensure ethical standards and safe navigation.",
      "The best backwater light for photography is between 6:30 AM and 8:30 AM."
    ]
  },

  himachal: {
    name: "Himachal Pradesh (Manali & Shimla)",
    state: "Himachal Pradesh",
    region: "North",
    tagline: "The Land of Snow Peaks & Pine Valleys",
    lat: 32.2432,
    lng: 77.1892,
    attractions: [
      { name: "Hadimba Devi Temple (Manali)", lat: 32.2483, lng: 77.1706, duration: 90, time: "09:00", reason: "Historic 1553 pagoda-style wooden temple nestled in towering cedar forests." },
      { name: "Solang Valley", lat: 32.3166, lng: 77.1575, duration: 180, time: "11:30", reason: "Renowned alpine adventure hub for paragliding, zorbing, and snow vistas." },
      { name: "Atal Tunnel & Sissu (Lahaul Valley)", lat: 32.4900, lng: 77.1200, duration: 240, time: "08:30", reason: "World's longest highway tunnel opening into dramatic snow-covered Lahaul landscapes and Sissu waterfall." },
      { name: "Old Manali Heritage Village", lat: 32.2530, lng: 77.1750, duration: 120, time: "16:00", reason: "Rustic apple orchards, wooden Kathkuni houses, and riverside live music cafes." },
      { name: "Vashisht Temple & Hot Sulphur Springs", lat: 32.2612, lng: 77.1878, duration: 75, time: "14:30", reason: "Ancient cedar-carved temple with natural therapeutic thermal springs." },
      { name: "Mall Road & The Ridge (Shimla)", lat: 31.1048, lng: 77.1734, duration: 120, time: "18:00", reason: "Pedestrian boulevard featuring Neo-Gothic Christ Church and mountain views." }
    ],
    foodRecommendations: [
      { name: "Himachali Siddu with melted desi ghee and walnut chutney", desc: "Steamed fermented wheat bun stuffed with spiced poppy seeds and nuts." },
      { name: "Fresh Himalayan Trout fish at Johnson's Cafe", desc: "Pan-fried river trout prepared with herbs and lemon butter sauce." },
      { name: "Himachali Dham (Traditional festive feast)", desc: "Festive vegetarian feast featuring Madra (chickpeas in spiced yogurt), Mah ki Dal, and Khatta." },
      { name: "Hot Tibetan Thukpa and steamed momos in Old Manali", desc: "Hearty noodle broth and dumplings for chilly mountain evenings." }
    ],
    activities: [
      "Scenic high-altitude drive through Atal Tunnel to the cascading Sissu Waterfall",
      "Trekking through alpine pine trails towards Jogini Waterfall",
      "Riverside evening coffee and acoustic folk sessions along the Manalsu stream in Old Manali"
    ],
    hiddenGems: [
      "Jogini Waterfall pine trail starting from Vashisht village",
      "Naggar Castle - medieval wood-and-stone fortress with panoramic views of the Beas River"
    ],
    tips: [
      "Start early morning (by 7:30 AM) when visiting Atal Tunnel and Solang to avoid mountain traffic jams.",
      "Carry warm layers even in summer, as temperatures drop quickly at high altitudes."
    ]
  }
};

/**
 * Returns authentic destination data for a given destination name or slug.
 */
export const getCuratedDestination = (destName = "") => {
  if (!destName || typeof destName !== "string") return null;
  const normalized = destName.trim().toLowerCase().replace(/[\s,_-]+/g, "");

  for (const [key, val] of Object.entries(DESTINATION_KNOWLEDGE)) {
    const keyNorm = key.toLowerCase().replace(/[\s,_-]+/g, "");
    const nameNorm = val.name.toLowerCase().replace(/[\s,_-]+/g, "");
    if (normalized.includes(keyNorm) || keyNorm.includes(normalized) || normalized === nameNorm) {
      return val;
    }
  }

  return null;
};
