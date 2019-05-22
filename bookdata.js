//ML for malayalam, EN for english
var books = [
    {
    id:1,
    name:"ഭക്ഷണം വിഷമാകുമ്പോൾ",
    author:"ഡോ.സുരേഷ്കുമാർ.സി ",
    price:"180",
    img_url:"Bhakshanam_Cover.jpg",
    lang:"ML"
    },
    {
    id:2,
    name:"ചക്കയുടെ ഔഷധഗുണങ്ങൾ",
    author:"ഡോ.ബി.പദ്മകുമാർ ",
    price:"100",
    img_url:"chakkayude_oushada_gunangal_cover.jpg",
    lang:"ML"
    },
    {
    id:3,
    name:"നാടൻ പശു - പൊരുളും പ്രസക്തിയും ",
    author:"ഡോ.ഇ.കെ.ഈശ്വരൻ",
    price:"100",
    img_url:"nadan_pashu.jpg",
    lang:"ML"
    },
    {
    id:4,
    name:"ചക്ക വിഭവങ്ങൾ - സൂപ്പ് മുതൽ ഡെസ്സേർട് വരെ",
    author:"ഡോ.ബീല.ജി.കെ",
    price:"95",
    img_url:"Chakka_vibhavangal.jpg",
    lang:"ML"
    },
    {
    id:5,
    name:"തേൻ",
    author:"ഡോ.സ്.ദേവനേഷൻ",
    price:"30",
    img_url:"thean.jpg",
    lang:"ML"
    },
    {
    id:6,
    name:"അന്നവിചാരം",
    author:"ഡോ.എൻ.അജിത് കുമാർ",
    price:"95",
    img_url:"anna_vijaram.jpg",
    lang:"ML"
    }, 
    {
    id:7,
    name:"സുരഭി- പാലും നെയ്യും ആയുർവേദത്തിൽ",
    author:"ഡോ.കെ.സ്.വിഷ്ണു നമ്പൂതിരി ",
    price:"50",
    img_url:"",
    lang:"ML"
    },
    {
    id:8,
    name:"വരിക്ക പ്ലാവിനുവേണ്ടി ഒരു വടക്കൻ പാട്ട്",
    author:"ഡോ.സി.ആർ .രാജഗോപാൽ",
    price:"30",
    img_url:"varikaplavinu_vendi_vadakan_pattu.jpg",
    lang:"ML"
    },
    {
    id:9,
    name:"കൃഷിഗീതയും ഭക്ഷ്യ സുരക്ഷയും",
    author:"ഡോ.സി.ആർ .രാജഗോപാൽ",
    price:"30",
    img_url:"",
    lang:"ML"
    },
    {
    id:10,
    name:"അന്നവും ആയൂർവേദവും ",
    author:"ഡോ.എസ്.രാജശേഖരൻ",
    price:"10",
    img_url:"",
    lang:"ML"
    },
    {
    id:11,
    name:"അന്നവും സംസ്കാരവും",
    author:"ഡോ.സി.ആർ .രാജഗോപാലൻ",
    price:"10",
    img_url:"",
    lang:"ML"
    },
    {
    id:12,
    name:"ഇന്ത്യ എന്തുകൊണ്ട് ജി എം വിമുക്തമാക്കണം",
    author:"ഡോ.വി.എസ്.വിജയൻ",
    price:"10",
    img_url:"",
    lang:"ML"
    },
    {
    id:13,
    name:"ആരോഗ്യഭക്ഷണവും ന്യൂട്രാസ്യൂട്ടിക്കലുകളും",
    author:"ഡോ.പി.പുഷ്പാംഗദൻ",
    price:"10",
    img_url:"",
    lang:"ML"
    },
    {
    id:14,
    name:"കിഴങ്ങു വർഗ്ഗങ്ങൾ കൊണ്ടുള്ള വിവിധ പാചകരീതികൾ",
    author:"ഡോ.എസ്.ചെല്ലമ്മാൾ",
    price:"10",
    img_url:"",
    lang:"ML"
    },
    {
    id:15,
    name:"Dye yielding plants",
    author:"Dr.K.Murugan",
    price:"1000",
    img_url:"",
    lang:"EN"
    },
    {
    id:16,
    name:"Dye yielding plants",
    author:"Dr.K.Murugan",
    price:"1000",
    img_url:"Dye_yielding.jpg",
    lang:"EN"
    },
    {
    id:18,
    name:"Jackfruit -Brighter Days Begin",
    author:"(Shree Padre)",
    price:"150",
    img_url:"jackfruit_brighter_days.jpg",
    lang:"EN"
    },
    {
    id:19,
    name:"Lightning - Science and Safety Measurers",
    author:"",
    price:"100",
    img_url:"",
    lang:"EN"
    },
    {
    id:20,
    name:"Summer Rain- The roots of Indigenous Knowledge in Kerala",
    author:"Dr.C.R Rajagopalan",
    price:"90",
    img_url:"summer_rain.jpg",
    lang:"EN"
    },
    {
    id:21,
    name:"Jackfruit Recipes- Soups to Desserts",
    author:"Dr. Beela G .K",
    price:"120",
    img_url:"",
    lang:"EN"
    },
    {
    id:22,
    name:"Traditional kitchen Herbal gardens in South India",
    author:"Dr N.S Pradeep",
    price:"30",
    img_url:"",
    lang:"EN"
    },
    {
    id:23,
    name:"National Banana Festival 2018- Book of Abstracts",
    author:"Dr. C. K Peethambaran",
    price:"100",
    img_url:"NBF_abstract.jpg",
    lang:"EN"
    },
    {
    id:24,
    name:"Perspectives of Biodiversity of India Vol III",
    author:"Dr. P.N. Krishnan",
    price:"1500",
    img_url:"prespective_vol_III.jpg",
    lang:"EN"
    },
    {
    id:25,
    name:"Perspectives of Biodiversity of India Vol II -Part -II",
    author:"Dr. A. Bijukumar",
    price:"1000",
    img_url:"IBC_Part_1.jpg",
    lang:"EN"
    },
    {
    id:26,
    name:"Perspectives of Biodiversity of India Vol II -Part -I",
    author:"Dr. A. Bijukumar",
    price:"1200",
    img_url:"IBC_Part_1.jpg",
    lang:"EN"
    }
    
]

module.exports = books;