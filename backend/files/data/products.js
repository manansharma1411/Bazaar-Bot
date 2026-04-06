const products = {};

const roundPrice = (value) => Math.max(10, Math.round(value / 5) * 5);

function addProduct(name, price, category) {
  const key = name.toLowerCase().trim();
  if (!products[key]) {
    products[key] = { price: roundPrice(price), category };
  }
}

function addSeed(category, seed) {
  seed.trim().split("\n").forEach((line) => {
    const [name, price] = line.split("|");
    addProduct(name, Number(price), category);
  });
}

function addMeasured(category, seed, variants) {
  seed.trim().split("\n").forEach((line) => {
    const [name, price, unit] = line.split("|");
    variants[unit].forEach((variant) => {
      addProduct(`${name} ${variant.label}`, Number(price) * variant.multiplier, category);
    });
  });
}

function addSized(category, items, sizes, step) {
  items.forEach(([name, price]) => {
    sizes.forEach((size, index) => {
      addProduct(`${name} size ${size}`, price + index * step, category);
    });
  });
}

function addCapacity(category, items, capacities, step) {
  items.forEach(([name, price]) => {
    capacities.forEach((capacity, index) => {
      addProduct(`${name} ${capacity}`, price * (1 + index * step), category);
    });
  });
}

function addMatrix(category, prefixes, middles, suffixes, basePrice, step) {
  prefixes.forEach((prefix, i) => {
    middles.forEach((middle, j) => {
      suffixes.forEach((suffix, k) => {
        addProduct(`${prefix} ${middle} ${suffix}`.trim(), basePrice + (i + j + k) * step, category);
      });
    });
  });
}

const produceUnits = {
  kg: [
    { label: "250g", multiplier: 0.28 },
    { label: "500g", multiplier: 0.55 },
    { label: "1kg", multiplier: 1 },
    { label: "2kg", multiplier: 1.95 },
  ],
  bunch: [
    { label: "1 bunch", multiplier: 1 },
    { label: "2 bunches", multiplier: 1.9 },
    { label: "4 bunches", multiplier: 3.6 },
  ],
  pc: [
    { label: "1pc", multiplier: 1 },
    { label: "2pc", multiplier: 1.9 },
    { label: "4pc", multiplier: 3.6 },
  ],
  dozen: [
    { label: "6pc", multiplier: 0.55 },
    { label: "12pc", multiplier: 1 },
  ],
};

const groceryUnits = {
  g: [
    { label: "200g", multiplier: 0.25 },
    { label: "500g", multiplier: 0.55 },
    { label: "1kg", multiplier: 1 },
  ],
  litre: [
    { label: "500ml", multiplier: 0.55 },
    { label: "1l", multiplier: 1 },
    { label: "5l", multiplier: 4.8 },
  ],
  pack: [
    { label: "1 pack", multiplier: 1 },
    { label: "2 pack", multiplier: 1.95 },
    { label: "family pack", multiplier: 2.8 },
  ],
};

addMeasured("vegetables", `
potato|30|kg
onion|40|kg
tomato|35|kg
carrot|60|kg
beetroot|45|kg
radish|35|kg
cucumber|40|kg
capsicum|80|kg
green chilli|80|kg
garlic|140|kg
ginger|120|kg
peas|90|kg
brinjal|50|kg
okra|55|kg
pumpkin|30|kg
bitter gourd|60|kg
ridge gourd|55|kg
snake gourd|60|kg
ash gourd|35|kg
bottle gourd|35|pc
cauliflower|50|pc
cabbage|45|pc
broccoli|65|pc
sweet corn|25|pc
mushroom|240|kg
drumstick|80|kg
raw banana|45|kg
yam|70|kg
sweet potato|50|kg
turnip|45|kg
zucchini|120|kg
lettuce|90|pc
celery|110|bunch
spring onion|60|bunch
leek|100|kg
baby corn|140|kg
arbi|65|kg
cluster beans|80|kg
broad beans|85|kg
ivy gourd|70|kg
`, produceUnits);

addMeasured("fruits", `
banana|60|dozen
apple|140|kg
orange|90|kg
mosambi|80|kg
grapes green|110|kg
grapes black|130|kg
pomegranate|180|kg
papaya|50|kg
watermelon|30|kg
muskmelon|45|kg
guava|70|kg
pineapple|60|pc
kiwi|180|kg
pear|140|kg
plum|160|kg
peach|180|kg
litchi|220|kg
strawberry|260|kg
blueberry|520|kg
mango alphonso|260|kg
mango dasheri|180|kg
mango totapuri|120|kg
jackfruit|70|kg
custard apple|140|kg
dragon fruit|220|kg
chikoo|80|kg
jamun|180|kg
dates fresh|260|kg
coconut tender|45|pc
lemon|90|kg
`, produceUnits);

addMeasured("greens", `
spinach|20|bunch
coriander|15|bunch
mint leaves|15|bunch
curry leaves|10|bunch
fenugreek leaves|20|bunch
mustard greens|30|bunch
amaranth greens|25|bunch
dill leaves|25|bunch
parsley|35|bunch
basil|40|bunch
`, produceUnits);

addMeasured("groceries", `
basmati rice premium|140|g
sona masoori rice|85|g
kolam rice|70|g
idli rice|65|g
poha thick|60|g
sabudana|90|g
whole wheat atta|55|g
multigrain atta|70|g
maida|45|g
besan|90|g
rava|55|g
corn flour|95|g
jowar flour|75|g
bajra flour|70|g
ragi flour|80|g
toor dal|140|g
chana dal|115|g
moong dal|130|g
masoor dal|110|g
urad dal|125|g
rajma|150|g
kabuli chana|145|g
black chana|110|g
lobia|120|g
white sugar|50|g
jaggery|65|g
tata salt|25|g
mustard oil|180|litre
sunflower oil|145|litre
groundnut oil|185|litre
rice bran oil|160|litre
olive oil|520|litre
ghee|620|g
butter|480|g
turmeric powder|300|g
red chilli powder|360|g
coriander powder|220|g
cumin seeds|520|g
mustard seeds|170|g
fennel seeds|240|g
ajwain|260|g
black pepper|680|g
cardamom|2200|g
cloves|900|g
garam masala|500|g
sambar powder|360|g
chaat masala|440|g
tea leaf premium|540|g
coffee powder|820|g
green tea|900|g
almonds|900|g
cashews|980|g
raisins|460|g
pistachios|1400|g
walnuts|1200|g
peanuts|180|g
fox nuts|820|g
soya chunks|240|g
vermicelli|90|g
pasta|140|g
corn flakes|260|g
muesli|420|g
honey|360|g
jam mixed fruit|180|g
tomato ketchup|220|g
soy sauce|180|g
vinegar|120|litre
pickle mango|220|g
papad|280|pack
`, groceryUnits);

addMeasured("dairy", `
toned milk|66|litre
full cream milk|72|litre
curd|90|g
greek yogurt|180|g
paneer|380|g
cheddar cheese|520|g
mozzarella cheese|480|g
processed cheese|420|g
fresh cream|220|litre
lassi|90|litre
buttermilk|60|litre
flavored yogurt|160|g
ice cream vanilla|240|pack
ice cream chocolate|260|pack
`, groceryUnits);

addMeasured("bakery", `
white bread|45|pack
brown bread|55|pack
multigrain bread|65|pack
burger bun|40|pack
hot dog bun|45|pack
rusk|80|pack
khari biscuit|90|pack
cupcake|120|pack
tea cake|180|pack
croissant|160|pack
garlic bread|150|pack
pizza base|85|pack
cookies butter|120|pack
cookies chocolate chip|150|pack
`, groceryUnits);

addMeasured("beverages", `
cola drink|95|litre
orange soda|90|litre
lemon soda|90|litre
mango juice|125|litre
mixed fruit juice|130|litre
apple juice|140|litre
coconut water packaged|90|litre
energy drink|240|litre
protein shake|320|litre
cold coffee|180|litre
`, groceryUnits);

addMeasured("snacks", `
potato chips salted|40|pack
potato chips masala|40|pack
nachos|120|pack
banana chips|110|pack
bhujia|150|pack
mixture namkeen|140|pack
sev|130|pack
khakhra|95|pack
roasted makhana|180|pack
chocolate wafer|80|pack
cream biscuit|60|pack
digestive biscuit|110|pack
protein bar|55|pack
granola bar|45|pack
popcorn caramel|140|pack
popcorn butter|130|pack
`, groceryUnits);

addMeasured("household", `
dishwash liquid|160|litre
dishwash bar|35|pack
floor cleaner|180|litre
toilet cleaner|150|litre
glass cleaner|140|litre
laundry detergent liquid|260|litre
laundry detergent powder|220|g
fabric softener|190|litre
bleach|120|litre
surface disinfectant|240|litre
air freshener|180|pack
mosquito repellent|140|pack
garbage bags|90|pack
aluminium foil|110|pack
cling wrap|95|pack
paper napkins|80|pack
tissue roll|95|pack
toilet paper|180|pack
`, groceryUnits);

addMeasured("personal_care", `
bathing soap|45|pack
moisturizing soap|60|pack
shampoo|320|litre
conditioner|380|litre
hair oil|260|litre
toothpaste|240|g
toothbrush|60|pack
mouthwash|260|litre
face wash|520|litre
face cream|640|g
body lotion|560|litre
sunscreen|1400|g
talcum powder|220|g
hand wash|330|litre
sanitizer|280|litre
shaving cream|420|g
razor|130|pack
deodorant|210|pack
perfume|520|pack
lip balm|160|pack
lipstick|260|pack
kajal|180|pack
foundation|520|pack
`, groceryUnits);

addMeasured("baby_care", `
baby diaper|280|pack
baby wipes|140|pack
baby lotion|520|litre
baby powder|260|g
baby wash|600|litre
baby oil|380|litre
baby rash cream|1600|g
baby cereal|720|g
`, groceryUnits);

addSized("fashion_men", [
  ["men cotton shirt blue", 799],
  ["men cotton shirt white", 799],
  ["men linen shirt beige", 1199],
  ["men check shirt maroon", 899],
  ["men polo t shirt black", 699],
  ["men polo t shirt navy", 699],
  ["men round neck t shirt grey", 449],
  ["men graphic t shirt olive", 499],
  ["men formal trouser charcoal", 1099],
  ["men chino pant khaki", 1199],
  ["men denim jeans dark blue", 1499],
  ["men jogger pant black", 899],
  ["men cargo pant green", 1299],
  ["men kurta solid cream", 999],
  ["men blazer slim fit navy", 3499],
  ["men hoodie grey melange", 1499],
  ["men sweatshirt maroon", 1199],
  ["men track pant navy", 799],
  ["men vest cotton white", 249],
  ["men thermal top", 699],
], ["S", "M", "L", "XL", "XXL"], 40);

addSized("fashion_women", [
  ["women cotton kurti blue", 899],
  ["women rayon kurti pink", 999],
  ["women embroidered kurta green", 1499],
  ["women top floral peach", 699],
  ["women shirt white", 899],
  ["women t shirt lavender", 499],
  ["women jeans skinny blue", 1499],
  ["women palazzo black", 799],
  ["women leggings navy", 399],
  ["women salwar suit mustard", 1999],
  ["women saree printed", 1299],
  ["women saree silk blend", 2499],
  ["women lehenga festive maroon", 3999],
  ["women gown evening teal", 2999],
  ["women dress midi black", 1599],
  ["women cardigan beige", 1299],
  ["women hoodie pink", 1399],
  ["women night suit cotton", 999],
  ["women dupatta chiffon", 599],
  ["women blazer formal tan", 2799],
], ["S", "M", "L", "XL", "XXL"], 45);

addSized("fashion_kids", [
  ["kids t shirt cartoon yellow", 299],
  ["kids shirt checks blue", 499],
  ["kids frock floral red", 699],
  ["kids jeans stretch blue", 799],
  ["kids track pant black", 499],
  ["kids shorts cotton navy", 349],
  ["kids night suit stars", 699],
  ["kids kurta pajama festive", 999],
  ["kids jacket hooded", 1199],
  ["kids sweater knitted", 899],
], ["2-3Y", "4-5Y", "6-7Y", "8-9Y"], 30);

addSized("footwear", [
  ["men running shoe black", 1999],
  ["men casual sneaker white", 2299],
  ["men formal shoe brown", 2499],
  ["men sandal outdoor", 1199],
  ["men slipper comfort", 499],
  ["women sneaker pastel", 1999],
  ["women flat sandal beige", 999],
  ["women heel sandal nude", 1699],
  ["women belly shoe black", 1199],
  ["women slipper soft sole", 449],
  ["kids school shoe black", 999],
  ["kids sports shoe blue", 1199],
  ["kids sandal velcro", 699],
  ["safety shoe steel toe", 2999],
  ["gumboot waterproof", 1299],
], ["6", "7", "8", "9", "10"], 60);

addSeed("fashion_accessories", `
men leather belt|699
women handbag classic|1699
wallet bi fold brown|799
sling bag compact|999
backpack casual|1499
travel duffel bag|1999
baseball cap black|399
winter cap woolen|349
scarf cotton printed|449
sunglasses aviator|999
watch analog classic|1999
watch digital sports|1499
earrings hoop gold tone|399
necklace fashion pearl|699
bangles set festive|499
hair clip floral|149
hair band padded|199
umbrella folding|499
raincoat unisex|999
shawl embroidered|1299
`);

addCapacity("electronics_mobile", [
  ["iphone 15", 79900],
  ["iphone 15 pro", 134900],
  ["iphone 14", 69900],
  ["samsung galaxy s24", 79999],
  ["samsung galaxy s24 ultra", 129999],
  ["samsung galaxy a54", 37999],
  ["oneplus 12", 64999],
  ["oneplus nord ce 4", 25999],
  ["redmi note 13 pro", 26999],
  ["realme 12 pro", 24999],
  ["vivo v30", 34999],
  ["oppo reno 11", 29999],
  ["motorola edge 50", 28999],
  ["iqoo neo 9 pro", 36999],
  ["google pixel 8", 75999],
], ["128gb", "256gb", "512gb"], 0.16);

addSeed("electronics_computers", `
macbook air m2|114900
macbook pro m3|169900
dell inspiron 15|55990
dell xps 15|149990
hp pavilion 15|52990
lenovo ideapad slim 5|49990
lenovo thinkpad e14|64990
asus vivobook 15|44990
asus rog strix g15|109990
acer aspire 5|42990
ipad air|59900
ipad pro 11|89900
samsung galaxy tab s9|72999
samsung galaxy tab a9|19999
monitor 24 inch ips|9999
monitor 27 inch qhd|18999
mechanical keyboard|5999
wireless keyboard|2499
gaming mouse|1999
productivity mouse|4999
webcam full hd|2499
usb microphone|4499
wifi router dual band|2999
mesh wifi node|4999
ups 600va|3499
external hard disk 1tb|3499
external hard disk 2tb|4999
ssd sata 1tb|5499
ssd nvme 1tb|6999
ram ddr4 16gb|3499
ram ddr5 16gb|5999
graphics card mid range|34999
graphics card entry level|18999
processor desktop i5|18999
motherboard gaming|12999
cabinet atx|4999
`);

addCapacity("electronics_accessories", [
  ["power bank", 1299],
  ["phone charger fast", 899],
  ["wireless charger", 1299],
  ["bluetooth speaker", 2499],
  ["smart watch", 2999],
  ["fitness band", 1999],
  ["earbuds", 1499],
  ["headphones wireless", 2999],
  ["data cable usb c", 299],
  ["pendrive", 499],
  ["memory card", 699],
], ["32gb", "64gb", "128gb", "256gb"], 0.22);

addSeed("electronics_home", `
smart tv 32 inch|15999
smart tv 43 inch|28999
smart tv 55 inch 4k|49999
soundbar 2.1|8999
home theater 5.1|19999
streaming stick|3999
cctv camera wifi|2499
video doorbell|6999
digital weighing scale|1199
projector full hd|34999
printer ink tank|12999
printer laser mono|14999
camera mirrorless|64995
action camera|39500
drone compact|96000
gaming console|54990
`);

addSeed("appliances", `
air conditioner 1 ton inverter|32990
air conditioner 1.5 ton inverter|41990
air conditioner 2 ton inverter|52990
washing machine 6.5kg top load|17990
washing machine 8kg front load|44990
refrigerator 185l|13990
refrigerator 260l double door|28990
microwave oven 20l|8990
microwave oven 28l convection|12990
air fryer|6499
mixer grinder|3499
juicer mixer grinder|4499
induction cooktop|2999
water purifier ro|12990
vacuum cleaner|6999
ceiling fan|1999
table fan|1299
room heater|1999
air cooler|8999
electric kettle|1299
sandwich maker|999
gas stove 2 burner|2499
gas stove 3 burner|3999
chimney kitchen|9999
pressure cooker 5l|1499
rice cooker|2999
geyser 15l|5499
hair dryer|1299
hair straightener|1999
electric shaver|5999
trimmer|1299
dishwasher 12 place|32999
`);

addSeed("kitchenware", `
non stick fry pan|899
stainless steel kadai|1299
pressure pan|1599
tawa dosa|799
knife set|999
chopping board|299
mixing bowl set|699
storage container set|1199
water bottle steel|499
lunch box insulated|699
flask 1l|899
dinner set 18 piece|2499
spice rack|799
measuring cup set|249
silicone spatula|199
gas lighter|149
water jug|399
roti box|349
masala dabba|699
idli maker|899
`);

addSeed("furniture", `
plastic chair|1299
office chair ergonomic|8999
gaming chair|12999
study table|3999
computer table|5499
coffee table|2999
bookshelf 5 shelf|5999
wardrobe 2 door|18999
shoe rack|2499
queen size bed|24999
mattress queen 6 inch|14999
sofa 3 seater|24999
dining table 4 seater|18999
tv unit|7999
bedside table|2999
folding table|1999
bean bag|2499
wall shelf set|1499
curtain set|1499
carpet living room|2999
`);

addSeed("stationery", `
notebook ruled|60
register long|120
a4 paper ream|399
ball pen pack|90
gel pen pack|140
marker set|180
highlighter set|220
pencil box|120
drawing book|90
color pencil set|199
crayons|149
eraser pack|30
sharpener pack|35
glue stick|45
scissors|99
calculator scientific|799
whiteboard small|699
sticky notes|80
file folder pack|149
stapler|120
`);

addSeed("toys", `
building blocks set|699
remote car|999
doll house set|1499
soft toy teddy|499
puzzle 500 pieces|399
board game ludo|299
board game chess|499
carrom board|1299
toy kitchen set|899
doctor play set|699
art and craft kit|499
science kit basic|999
water gun|299
badminton toy set|349
baby rattle set|249
`);

addSeed("sports", `
cricket bat|2499
cricket ball leather|299
batting gloves|699
football|899
basketball|999
badminton racket|1999
shuttlecock pack|399
tennis racket|2499
tennis ball can|299
yoga mat|799
dumbbell set 10kg|1499
dumbbell set 20kg|2499
resistance band set|499
skipping rope|299
cycling helmet|999
protein shaker|349
whey protein 1kg|1799
creatine 250g|799
`);

addSeed("hardware", `
hammer|299
screwdriver set|499
adjustable wrench|399
measuring tape 5m|199
drill machine|2499
drill bit set|499
wall plug pack|79
nails assorted pack|99
screws assorted pack|119
led bulb 9w|99
extension board 4 socket|349
switch board modular|199
water pipe 10m|499
garden hose spray gun|699
paint brush set|249
paint roller|199
door lock|599
padlock|299
`);

addSeed("automotive", `
engine oil 1l|450
bike engine oil 1l|380
car shampoo|280
dashboard polish|240
microfiber cloth pack|199
car perfume|199
tyre inflator portable|1799
jumper cable|999
bike cover|499
car cover|1499
helmet full face|2499
helmet half face|1299
riding gloves|699
seat cover set|1999
phone holder car|499
`);

addSeed("pet_supplies", `
dog food adult|899
dog food puppy|999
cat food adult|799
cat litter|499
pet bowl steel|299
pet leash|399
pet collar|249
pet shampoo|299
dog treat biscuits|199
cat treat creamy|149
pet bed small|999
pet toy chew bone|199
`);

addSeed("religious", `
agarbatti sandal|60
camphor tablets|80
cotton wicks|40
puja oil|140
ghee diya|120
kumkum|35
turmeric whole|55
puja thali set|499
bell brass|299
incense holder|149
`);

addMatrix("fashion_local", ["men", "women", "kids"], ["cotton", "linen", "denim", "printed", "festive", "casual"], ["shirt", "kurta", "t shirt", "jacket", "pant", "set"], 699, 60);
addMatrix("home_decor", ["cotton", "velvet", "woven", "printed", "handmade"], ["cushion cover", "table runner", "bedsheet", "wall hanging", "door mat"], ["single", "double", "premium", "classic"], 299, 35);
addMatrix("local_vendor", ["fresh farm", "village select", "daily mandi", "urban basket", "prime local"], ["pickle", "khakhra", "masala peanuts", "cold pressed oil", "handmade soap", "artisan candle"], ["classic", "premium", "special"], 120, 25);
addMatrix("fashion_premium", ["men", "women", "unisex", "kids"], ["ethnic", "formal", "street", "party", "winter", "summer", "sports", "lounge"], ["coord set", "overshirt", "trouser", "dress", "hoodie", "jogger", "kurta", "jacket"], 899, 55);
addMatrix("grocery_local", ["organic", "farm fresh", "daily use", "value", "premium", "select"], ["rice", "atta", "dal", "spice mix", "dry fruit", "pickle", "tea", "snack"], ["mini pack", "regular pack", "family pack", "bulk pack", "festival pack"], 95, 18);
addMatrix("footwear_local", ["men", "women", "kids", "unisex"], ["running", "walking", "casual", "formal", "sports", "outdoor"], ["shoe", "sandal", "slipper", "sneaker", "clog"], 699, 45);
addMatrix("electronics_market", ["smart", "wireless", "portable", "gaming", "pro"], ["speaker", "earbuds", "keyboard", "mouse", "charger", "router", "camera", "light"], ["mini", "standard", "plus", "max"], 799, 85);
addMatrix("kitchen_market", ["steel", "non stick", "glass", "ceramic", "wooden"], ["pan", "pot", "container", "bottle", "jar", "rack", "plate"], ["small", "medium", "large", "set"], 249, 30);
addMatrix("household_market", ["eco", "fresh", "classic", "power", "safe"], ["cleaner", "detergent", "freshener", "soap", "tissue", "wipe", "disinfectant", "foil"], ["small", "regular", "large", "value", "jumbo"], 75, 16);
addMatrix("furnishing_market", ["cotton", "woven", "soft", "printed", "luxury"], ["curtain", "bedsheet", "blanket", "rug", "cover", "mat"], ["single", "double", "queen", "king", "set"], 399, 28);

module.exports = products;
