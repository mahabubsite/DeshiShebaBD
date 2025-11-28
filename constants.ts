import { Category, CategoryDefinition, ServiceStatus } from './types';

// Firebase Config
export const firebaseConfig = {
  apiKey: "AIzaSyAM7uCsBZiesyHhKxmooqwQNlelrbtEuTs",
  authDomain: "deshisheba-50b52.firebaseapp.com",
  projectId: "deshisheba-50b52",
  storageBucket: "deshisheba-50b52.firebasestorage.app",
  messagingSenderId: "1058371410866",
  appId: "1:1058371410866:web:e8ffe2e8fb0cf4e42d62ab"
};

// Full Location Data from PDF
export const BANGLADESH_LOCATIONS: Record<string, Record<string, string[]>> = {
  'Dhaka Division': {
    'Norshingdi': ['Sadar Upazila', 'Monorhordi Upazila', 'Shibpur Upazila', 'Palash Upazila', 'Belab Upazila', 'Raipura Upazila'],
    'Narayangonj': ['Sadar Upazila', 'Bandor Upazila', 'Sonargaon Upazila', 'Arai Hazar Upazila', 'Rupgonj Upazila'],
    'Munshigonj': ['Sadar Upazila', 'Tungibari Upazila', 'Louhagonj Upazila', 'Sree Nagar Upazila', 'Sirajdi Khan Upazila', 'Gazaria Upazila'],
    'Gazipur': ['Sadar Upazila', 'Tongi Upazila', 'Kaligonj Upazila', 'Kaliakoir Upazila', 'Kapashia Upazila', 'Sreepur Upazila'],
    'Manikgonj': ['Sadar Upazila', 'Singair Upazila', 'Daulatpur Upazila', 'Horirampur Upazila', 'Gheor Upazila', 'Shibaloy Upazila', 'Saturia Upazila'],
    'Dhaka': ['Kotwali Thana', 'Mohammadpur Thana', 'Lalbagh Thana', 'Sutrapur Thana', 'Motijgil Thana', 'Demra Thana', 'Sabujbagh Thana', 'Mirpur Thana', 'Gulshan Thana', 'Uttara Thana', 'Pallabi Thana', 'Cantonment Thana', 'Dhanmondi Thana', 'Tejgaon Thana', 'Ramna Thana', 'Keranigonj Upazila', 'Dohar Upazila', 'Nawabgonj Upazila', 'Savar Upazila', 'Dhamrai Upazila']
  },
  'Faridpur Region': {
    'Faridpur': ['Sadar Upazila', 'Boalmari Upazila', 'Sadarpur Upazila', 'Char Bhadrashon Upazila', 'Bhanga Upazila', 'Nagarkanda Upazila', 'Madhukhali Upazila', 'Alphadanga Upazila', 'Saltha Upazila'],
    'Rajbari': ['Sadar Upazila', 'Pangsha Upazila', 'Goalondo Upazila', 'Kalukhali Upazila', 'Baliakandi Upazila'],
    'Gopalgonj': ['Sadar Upazila', 'Kashiani Upazila', 'Tongipara Upazila', 'Muksudpur Upazila', 'Kotalipara Upazila'],
    'Madaripur': ['Sadar Upazila', 'Kalkini Upazila', 'Rajoir Upazila', 'Shibchar Upazila'],
    'Sariyatpur': ['Sadar Upazila', 'Damudda Upazila', 'Noria Upazila', 'Jagira Upazila', 'Vedorgonj Upazila', 'Goshair Hat Upazila']
  },
  'Barishal Division': {
    'Borguna': ['Sadar Upazila', 'Amtoli Upazila', 'Betagi Upazila', 'Taltoli Upazila', 'Patharghata Upazila', 'Bamna Upazila'],
    'Bhola': ['Sadar Upazila', 'Daulatkhan Upazila', 'Lalmohon Upazila', 'Monpura Upazila', 'Charfassion Upazila', 'Tajumuddin Upazila', 'Borhanuddin Upazila'],
    'Jhalokathi': ['Sadar Upazila', 'Nalchiti Upazila', 'Rajapur Upazila', 'Kathalia Upazila'],
    'Barishal': ['Sadar Upazila', 'Muladi Upazila', 'Gournadi Upazila', 'Agoil Jhora Upazila', 'Hijla Upazila', 'Ujirpur Upazila', 'Mehedigonj Upazila', 'Babugonj Upazila', 'Bakergonj Upazila', 'Banaripara Upazila'],
    'Patuakhali': ['Sadar Upazila', 'Golachipa Upazila', 'Kolapara Upazila', 'Dosmina Upazila', 'Bauphal Upazila', 'Rangabali Upazila', 'Dumki Upazila', 'Mirjagonj Upazila'],
    'Perojpur': ['Sadar Upazila', 'Mothbaria Upazila', 'Nazirpur Upazila', 'Nesarabad Upazila', 'Zianagar Upazila', 'Kaukhali Upazila', 'Bhandaria Upazila']
  },
  'Khulna Division': {
    'Khulna': ['Sadar Thana', 'Sonadanga Thana', 'Daulatpur Thana', 'Phultola Upazila', 'Dumuria Upazila', 'Terokhada Upazila', 'Degholia Upazila', 'Rupsha Upazila', 'Batiaghata Upazila', 'Dakop Upazila', 'Koira Upazila'],
    'Norail': ['Sadar Upazila', 'Kalia Upazila', 'Lohagora Upazila'],
    'Magura': ['Sadar Upazila', 'Sreepur Upazila', 'Salikha Upazila', 'Mohammadpur Upazila'],
    'Satkhira': ['Sadar Upazila', 'Shyam nagar Upazila', 'Assa suni Upazila', 'Tala Upazila', 'Kaligonj Upazila', 'Kolaroa Upazila', 'Debhata Upazila'],
    'Bagerhat': ['Sadar Upazila', 'Kochua Upazila', 'Rampal Upazila', 'Saron Khola Upazila', 'Morolgonj Upazila', 'Mollarhat Upazila', 'Chitolmari Upazila', 'Fakirhat Upazila', 'Mongla Upazila'],
    'Jhenaidah': ['Sadar Upazila', 'Kaligonj Upazila', 'Kot Chandpur Upazila', 'Horina Kundu Upazila', 'Shailkupa Upazila', 'Moheshpur Upazila'],
    'Jessore': ['Sadar Upazila', 'Keshobpur Upazila', 'Jhikorgacha Upazila', 'Monirampur Upazila', 'Bagharpara Upazila', 'Chowgacha Upazila', 'Sharsha Upazila', 'Avoynagar Upazila'],
    'Meherpur': ['Sadar Upazila', 'Gangni Upazila', 'Mujib Nagar Upazila'],
    'Chuadanga': ['Sadar Upazila', 'Jibon Nagar Upazila', 'Damur Huda Upazila', 'Alamdanga Upazila', 'Kushtia'],
    'Kushtia': ['Sadar Upazila', 'Kumarkhali Upazila', 'Daulatpur Upazila', 'Bheramara Upazila', 'Khoksha Upazila', 'Mirpur Upazila']
  },
  'Sylhet Division': {
    'Sylhet': ['Sadar Upazila', 'Gopalgonj Upazila', 'Beanibazar Upazila', 'Jokigonj Upazila', 'Companigonj Upazila', 'Jaintapur Upazila', 'Daxin Surma Upazila', 'Fenchugonj Upazila', 'Bishwanath Upazila', 'Balagonj Upazila', 'Gowainghat Upazila', 'Kanaighat Upazila'],
    'Sunamgonj': ['Sadar Upazila', 'Jamalgonj Upazila', 'Jagannathpur Upazila', 'Sulla Upazila', 'Dharam Pasha Upazila', 'Bishwambharpur Upazila', 'South Sunamgonj Upazila', 'Satok Upazila', 'Doarabazar Upazila', 'Derai Upazila', 'Tahirpur Upazila'],
    'Mowlovibazar': ['Sadar Upazila', 'Rajnagar Upazila', 'Kulaura Upazila', 'Juri Upazila', 'Boro Lekha Upazila', 'Komolgonj Upazila', 'Srimangal Upazila'],
    'Hobigonj': ['Sadar Upazila', 'Bahubal Upazila', 'Lakhai Upazila', 'Nobigonj Upazila', 'Chunarughat Upazila', 'Madhabpur Upazila', 'Baniachong Upazila', 'Ajmirigonj Upazila']
  },
  'Mymensingh Division': {
    'Tangail': ['Sadar Upazila', 'Delduar Upazila', 'Mirjapur Upazila', 'Bhuapur Upazila', 'Ghatail Upazila', 'Basail Upazila', 'Nagorpur Upazila', 'Kalihati Upazila', 'Sakhipur Upazila', 'Gopalpur Upazila', 'Dhanbari Upazila', 'Madhupur Upazila'],
    'Keshoregonj': ['Sadar Upazila', 'Hossainpur Upazila', 'Karimgonj Upazila', 'Pakundia Upazila', 'Nikli Upazila', 'Bajitpur Upazila', 'Kuliarchar Upazila', 'Bhairab Upazila', 'Mithamoin Upazila', 'Itna Upazila', 'Kotiadi Upazila', 'Austagram Upazila', 'Tarail Upazila'],
    'Netrokona': ['Sadar Upazila', 'Atpara Upazila', 'Barhatta Upazila', 'Mohongonj Upazila', 'Kalmakanda Upazila', 'Durgapur Upazila', 'Madan Upazila', 'Kendua Upazila', 'Purbodhola Upazila', 'Khaliajuri Upazila'],
    'Jamalpur': ['Sadar Upazila', 'Islampur Upazila', 'Dewangonj Upazila', 'Sarishabari Upazila', 'Madargonj Upazila', 'Bokshigonj Upazila', 'Melandaha Upazila'],
    'Sherpur': ['Sadar Upazila', 'Nokla Upazila', 'Nalitabari Upazila', 'Jhenaigati Upazila', 'Sribordi Upazila'],
    'Mymensingh': ['Sadar Upazila', 'Muktagacha Upazila', 'Phulbaria Upazila', 'Bhaluka Upazila', 'Trishal Upazila', 'Gafargaon Upazila', 'Nandail Upazila', 'Ishwargonj Upazila', 'Dhobaura Upazila', 'Gouripur Upazila', 'Phulpur Upazila', 'Haluaghat Upazila', 'Tarakanda Upazila']
  },
  'Comilla Division': {
    'Noakhali': ['Sadar Upazila', 'Begumgonj Upazila', 'Companigonj Upazila', 'Subarnachar Upazila', 'Sonaimuri Upazila', 'Chatkhil Upazila', 'Senbagh Upazila', 'Kabirhat Upazila', 'Hatiya Upazila'],
    'Feni': ['Sadar Upazila', 'Daganbhuiyan Upazila', 'Fulgazi Upazila', 'Parshuram Upazila', 'Chhagalnaiya Upazila', 'Sonagazi Upazila'],
    'Laxmipur': ['Sadar Upazila', 'Raipur Upazila', 'Ramgoti Upazila', 'Ramgonj Upazila', 'Kamalnagar Upazila'],
    'Chandpur': ['Sadar Upazila', 'Matlab South Upazila', 'Faridgonj Upazila', 'Hajigonj Upazila', 'Haimchar Upazila', 'Matlab North Upazila', 'Kachua Upazila', 'Shahrasti Upazila'],
    'B. Baria': ['Sadar Upazila', 'Sarail Upazila', 'Kosba Upazila', 'Bancharampur Upazila', 'Nabinagar Upazila', 'Bijoy Nagar Upazila', 'Ashugonj Upazila', 'Akhaura Upazila', 'Nasirnagar Upazila'],
    'Comilla': ['Sadar Adarsho Upazila', 'Sadar South Upazila', 'Brahmanpara Upazila', 'Daudkandi Upazila', 'Burichang Upazila', 'Chauddagram Upazila', 'Laksam Upazila', 'Monohorgonj Upazila', 'Meghna Upazila', 'Homna Upazila', 'Titas Upazila', 'Nangalkot Upazila', 'Muradnagar Upazila', 'Barura Upazila', 'Chandina Upazila', 'Debidwar Upazila']
  },
  'Chittagong Division': {
    'Chittagonj': ['Kotwali Thana', 'Panchlaish Thana', 'Chandgaon Thana', 'Bandor Thana', 'Pahartoli Thana', 'Double Mooring Thana', 'Anwara Upazila', 'Patiya Upazila', 'Boalkhali Upazila', 'Satkania Upazila', 'Chandanaish Upazila', 'Bashkhali Upazila', 'Lohagora Upazila', 'Sandwip Upazila', 'Hathazari Upazila', 'Mirsharai Upazila', 'Fatikchhari Upazila', 'Rangunia Upazila', 'Sitakunda Upazila', 'Raozan Upazila'],
    'Cox\'s Bazar': ['Sadar Upazila', 'Moheshkhali Upazila', 'Kutubdia Upazila', 'Teknaf Upazila', 'Ramu Upazila', 'Ukhia Upazila', 'Chokoria Upazila', 'Pekua Upazila'],
    'Khagrachari': ['Sadar Upazila', 'Panchari Upazila', 'Mohalchari Upazila', 'Dighinala Upazila', 'Matiranga Upazila', 'Laxmichari Upazila', 'Manikchari Upazila', 'Ramgarh Upazila'],
    'Bandarbon': ['Sadar Upazila', 'Thanchi Upazila', 'Ruma Upazila', 'Roangchari Upazila', 'Alikadam Upazila', 'Lama Upazila', 'Naikhangchari Upazila'],
    'Rangamati': ['Sadar Upazila', 'Barkal Upazila', 'Longodu Upazila', 'Baghaichari Upazila', 'Naniarchar Upazila', 'Kaukhali Upazila', 'Rajasthali Upazila', 'Belaichari Upazila', 'Jurachari Upazila', 'Kaptai Upazila']
  },
  'Rajshahi Division': {
    'Bogra': ['Sadar Upazila', 'Shajahanpur Upazila', 'Sariakandi Upazila', 'Shibgonj Upazila', 'Gabtoli Upazila', 'Dhunot Upazila', 'Sonatola Upazila', 'Dupchachia Upazila', 'Adamdighi Upazila', 'Nandigram Upazila', 'Sherpur Upazila', 'Kahalu Upazila'],
    'Pabna': ['Sadar Upazila', 'Atghoria Upazila', 'Ishwardi Upazila', 'Bera Upazila', 'Santhia Upazila', 'Sujanagar Upazila', 'Chatmohor Upazila', 'Bhangura Upazila', 'Faridpur Upazila'],
    'Rajshahi': ['Poba Upazila', 'Putia Upazila', 'Charghat Upazila', 'Tanor Upazila', 'Baghmara Upazila', 'Bagha Upazila', 'Mohonpur Upazila', 'Godagari Upazila', 'Durgapur Upazila', 'Boalia Thana', 'Rajpara Thana'],
    'Natore': ['Sadar Upazila', 'Singra Upazila', 'Bagatipara Upazila', 'Boraigram Upazila', 'Gurudaspur Upazila', 'Lalpur Upazila', 'Naldanga Upazila'],
    'Chapai N. Gonj': ['Sadar Upazila', 'Shibgonj Upazila', 'Gomostapur Upazila', 'Nachol Upazila', 'Bholahat Upazila'],
    'Nogaon': ['Sadar Upazila', 'Raninagar Upazila', 'Atrai Upazila', 'Niamatpur Upazila', 'Porsha Upazila', 'Sapahar Upazila', 'Manda Upazila', 'Dhamoirhat Upazila', 'Badalgachi Upazila', 'Patnitala Upazila', 'Mohadebpur Upazila'],
    'Joipurhat': ['Sadar Upazila', 'Akkelpur Upazila', 'Kalai Upazila', 'Panchbibi Upazila', 'Khetlal Upazila'],
    'Sirajgonj': ['Sadar Upazila', 'Kamarkhand Upazila', 'Belkuchi Upazila', 'Kazipur Upazila', 'Chowhali Upazila', 'Shahjadpur Upazila', 'Tarash Upazila', 'Ullapara Upazila', 'Raigonj Upazila']
  },
  'Rangpur Division': {
    'Nilphamari': ['Sadar Upazila', 'Dimla Upazila', 'Jaldhaka Upazila', 'Domar Upazila', 'Kishoregonj Upazila', 'Saidpur Upazila'],
    'Thakurgaon': ['Sadar Upazila', 'Baliadangi Upazila', 'Pirgonj Upazila', 'Haripur Upazila', 'Ranisankail Upazila'],
    'Gaibandha': ['Sadar Upazila', 'Gobindagonj Upazila', 'Phulchari Upazila', 'Saghata Upazila', 'Sundargonj Upazila', 'Palashbari Upazila', 'Sadullapur Upazila'],
    'Lalmonirhat': ['Sadar Upazila', 'Aditmari Upazila', 'Hatibandha Upazila', 'Kaligonj Upazila', 'Patgram Upazila'],
    'Kurigram': ['Sadar Upazila', 'Rowmari Upazila', 'Rajibpur Upazila', 'Chilmari Upazila', 'Ulipur Upazila', 'Rajarhat Upazila', 'Phulbari Upazila', 'Nageshwori Upazila', 'Bhurungamari Upazila'],
    'Dinajpur': ['Sadar Upazila', 'Parbotipur Upazila', 'Phulbari Upazila', 'Birampur Upazila', 'Hakimpur Upazila', 'Nawabgonj Upazila', 'Ghoraghat Upazila', 'Bochagonj Upazila', 'Birol Upazila', 'Kaharol Upazila', 'Birgonj Upazila', 'Khansama Upazila', 'Chirirbandar Upazila'],
    'Rangpur': ['Sadar Upazila', 'Gongachora Upazila', 'Badargonj Upazila', 'Taragonj Upazila', 'Kaunia Upazila', 'Pirgacha Upazila', 'Mithapukur Upazila', 'Pirgonj Upazila'],
    'Panchagarh': ['Sadar Upazila', 'Atwari Upazila', 'Boda Upazila', 'Debigonj Upazila', 'Tetulia Upazila']
  }
};

export const CATEGORY_ICONS: Record<string, string> = {
  [Category.POLICE]: '👮',
  [Category.HOSPITAL]: '🏥',
  [Category.HOTEL]: '🏨',
  [Category.BANK]: '🏦',
  [Category.SCHOOL]: '🎓',
  [Category.RESTAURANT]: '🍽️',
  [Category.FIRE_SERVICE]: '🚒',
  [Category.BLOOD_DONATION]: '🩸',
  [Category.LAWYER]: '⚖️',
  [Category.EVENT_MANAGEMENT]: '🎉',
  [Category.TOURIST_SPOT]: '🏖️',
  [Category.GOVT_OFFICE]: '🏢',
  [Category.SUPERSHOP]: '🛒',
  [Category.PHOTOGRAPHER]: '📸',
  [Category.HOTLINE]: '☎️',
  [Category.BUS_STAND]: '🚌',
  [Category.OTHER]: '🔧',
};

// Default Configuration for Categories including new dynamic fields
export const DEFAULT_CATEGORY_DEFINITIONS: CategoryDefinition[] = [
  { id: Category.POLICE, name: 'Police', icon: '👮', fields: [{ id: 'emergency_contact', label: 'Emergency Hotline', type: 'tel', required: true }], isSystem: true },
  { id: Category.HOSPITAL, name: 'Hospital', icon: '🏥', fields: [{ id: 'ambulance_hotline', label: 'Ambulance Hotline', type: 'tel', required: false }, { id: 'visiting_hours', label: 'Visiting Hours', type: 'text', required: false }], isSystem: true },
  { id: Category.HOTEL, name: 'Hotel', icon: '🏨', fields: [{ id: 'price_range', label: 'Price Range', type: 'text', required: false }, { id: 'stars', label: 'Star Rating', type: 'number', required: false }], isSystem: true },
  { id: Category.TOURIST_SPOT, name: 'Tourist Place', icon: '🏖️', fields: [{ id: 'ticket_price', label: 'Ticket Price', type: 'text', required: false }], isSystem: true },
  { id: Category.BANK, name: 'Bank', icon: '🏦', fields: [{ id: 'branch_code', label: 'Branch Code', type: 'text', required: false }], isSystem: true },
  { id: Category.SCHOOL, name: 'School/College', icon: '🎓', fields: [{ id: 'type', label: 'Institution Type', type: 'text', required: true, placeholder: 'School, College, Madrasa' }], isSystem: true },
  { id: Category.SUPERSHOP, name: 'Supershop', icon: '🛒', fields: [{ id: 'delivery_available', label: 'Home Delivery?', type: 'text', required: false }], isSystem: true },
  { id: Category.PHOTOGRAPHER, name: 'Photographer', icon: '📸', fields: [{ id: 'specialty', label: 'Specialty', type: 'text', required: false, placeholder: 'Wedding, Passport, etc.' }], isSystem: true },
  { id: Category.LAWYER, name: 'Lawyer', icon: '⚖️', fields: [{ id: 'specialization', label: 'Specialization', type: 'text', required: false }], isSystem: true },
  { id: Category.BLOOD_DONATION, name: 'Blood/Donation', icon: '🩸', fields: [{ id: 'groups_available', label: 'Groups Available', type: 'text', required: false }], isSystem: true },
  { id: Category.GOVT_OFFICE, name: 'Govt Office', icon: '🏢', fields: [{ id: 'office_head', label: 'Head of Office', type: 'text', required: false }], isSystem: true },
  { id: Category.RESTAURANT, name: 'Restaurant', icon: '🍽️', fields: [{ id: 'cuisine', label: 'Cuisine Type', type: 'text', required: false }], isSystem: true },
  { id: Category.FIRE_SERVICE, name: 'Fire Service', icon: '🚒', fields: [], isSystem: true },
  { id: Category.HOTLINE, name: 'Hotline', icon: '☎️', fields: [{ id: 'service_type', label: 'Service Type', type: 'text', required: true }], isSystem: true },
  { id: Category.BUS_STAND, name: 'Bus Stand', icon: '🚌', fields: [{ id: 'routes', label: 'Major Routes', type: 'text', required: false }], isSystem: true },
  { id: Category.EVENT_MANAGEMENT, name: 'Event Management', icon: '🎉', fields: [], isSystem: true },
  { id: Category.OTHER, name: 'Other', icon: '🔧', fields: [], isSystem: true },
];

// --- DATA GENERATION FOR DEMO ---
// Generating ~150 services to populate the app initially so search always works.

const MOCK_TITLES: Record<string, string[]> = {
  [Category.HOSPITAL]: ['General Hospital', 'Sadar Hospital', 'Medical College', 'Community Clinic', 'Health Complex', 'Eye Hospital', 'Diagnostic Center', 'Red Crescent', 'City Hospital', 'Model Clinic', 'Upazila Health Complex', 'Popular Diagnostic', 'Ibn Sina', 'Labaid', 'Square Clinic'],
  [Category.POLICE]: ['Thana', 'Police Station', 'Police Fari', 'Circle Office', 'Highway Police', 'Metropolitan Police', 'Investigation Center', 'Police Outpost', 'RAB Camp', 'Tourist Police', 'Railway Police', 'Sadar Thana', 'Model Thana', 'Police Lines', 'Range Office'],
  [Category.HOTEL]: ['Hotel Sea Palace', 'Hotel Agrabad', 'Parjatan Motel', 'Guest House', 'Resort & Spa', 'City Inn', 'Hotel Star', 'Grand Hotel', 'Hotel Diamond', 'Royal Palace', 'Green View', 'River View', 'Hotel Razmoni', 'Holiday Inn', 'Rest House'],
  [Category.SCHOOL]: ['Govt High School', 'Pilot School', 'Girls School', 'Zilla School', 'College', 'University College', 'Model School', 'Technical College', 'Public School', 'Primary School', 'Academy', 'Kindergarten', 'Madrasa', 'Polytechnic', 'Womans College'],
  [Category.RESTAURANT]: ['Bhai Bhai Hotel', 'Radhuni', 'Star Kabab', 'Panshi', 'Kutum Bari', 'Sodesh', 'Spicy Corner', 'Food Garden', 'Cafe', 'Birkiyani House', 'Sweets & Bakery', 'Bangla Hotel', 'Chinese Restaurant', 'Fast Food', 'Tea Stall'],
  [Category.BANK]: ['Sonali Bank', 'Rupali Bank', 'Janata Bank', 'Agrani Bank', 'Dutch Bangla Bank', 'Brac Bank', 'Islami Bank', 'Grameen Bank', 'Pubali Bank', 'City Bank', 'Krishi Bank', 'One Bank', 'Prime Bank', 'UCB', 'Eastern Bank'],
  [Category.FIRE_SERVICE]: ['Fire Service Station', 'Civil Defense', 'Fire Station'],
  [Category.BLOOD_DONATION]: ['Blood Bank', 'Sandhani', 'Badhon', 'Red Crescent'],
  [Category.TOURIST_SPOT]: ['Park', 'Museum', 'Sea Beach', 'River Bank', 'Historical Place', 'Zamindar Bari', 'Tea Garden', 'Lake', 'Eco Park', 'Forest'],
  [Category.GOVT_OFFICE]: ['DC Office', 'UNO Office', 'Land Office', 'Election Office', 'Passport Office', 'Sub-Registry Office', 'Municipality Office', 'Union Parishad', 'BADC Office', 'Agriculture Office'],
  [Category.LAWYER]: ['Chamber', 'Notary Public', 'Bar Association', 'Legal Aid'],
  [Category.EVENT_MANAGEMENT]: ['Community Center', 'Convention Hall', 'Wedding Planner', 'Decorator'],
  [Category.SUPERSHOP]: ['Shwapno', 'Agora', 'Meena Bazar', 'Daily Shopping', 'Big Bazar', 'City Mart'],
  [Category.PHOTOGRAPHER]: ['Digital Studio', 'Wedding Photography', 'Color Lab', 'Portrait Studio'],
  [Category.HOTLINE]: ['Emergency Hotline', 'Ambulance Service', 'Women Support', 'Child Help Line', 'Legal Aid Hotline'],
  [Category.BUS_STAND]: ['Bus Terminal', 'Counter', 'Stop', 'Ticket Counter'],
  [Category.OTHER]: ['Service Center', 'Workshop', 'Store', 'Market']
};

const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

const generateMockData = () => {
  const services = [];
  const divisions = Object.keys(BANGLADESH_LOCATIONS);

  for (const category of Object.values(Category)) {
    const titles = MOCK_TITLES[category as string] || ['Service'];
    // Generate 12 per category as requested (Default services)
    for (let i = 0; i < 12; i++) {
      const div = getRandom(divisions);
      const districts = Object.keys(BANGLADESH_LOCATIONS[div]);
      const dist = getRandom(districts);
      const upazilas = BANGLADESH_LOCATIONS[div][dist];
      const upa = getRandom(upazilas);
      const title = getRandom(titles);

      // Deterministic ID for default services so they can be managed/restored
      const deterministicId = `default-${category.toLowerCase().replace(/\s+/g, '-')}-${i + 1}`;

      services.push({
        id: deterministicId,
        name: `${dist} ${title}`,
        category: category,
        description: `Reliable ${category} located in ${upa}. Open for service.`,
        phone: `017${Math.floor(10000000 + Math.random() * 90000000)}`,
        address: { division: div, district: dist, upazila: upa, village: 'Sadar Area' },
        status: ServiceStatus.APPROVED,
        submittedBy: 'admin',
        submitterName: 'System Admin',
        submittedAt: Date.now() - Math.floor(Math.random() * 1000000000),
        likes: Math.floor(Math.random() * 100),
        tags: [category.toLowerCase(), upa.toLowerCase(), 'service', 'bd']
      });
    }
  }
  return services;
};

export const MOCK_SERVICES = generateMockData();

// Mock Users for Demo
export const MOCK_USERS = [
  { uid: 'u1', email: 'rahim@example.com', displayName: 'Rahim Uddin', role: 'user', isBanned: false, createdAt: Date.now() - 10000000, lastLogin: Date.now() },
  { uid: 'u2', email: 'karim@example.com', displayName: 'Karim Hasan', role: 'user', isBanned: true, createdAt: Date.now() - 5000000, lastLogin: Date.now() - 100000 },
  { uid: 'u3', email: 'admin@deshisheba.com', displayName: 'System Admin', role: 'admin', isBanned: false, createdAt: Date.now() - 99999999, lastLogin: Date.now() },
];