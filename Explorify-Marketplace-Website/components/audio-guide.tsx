"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Sparkles,
  ChevronDown,
  Gauge,
  Radio,
  AudioWaveform,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Trip } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export interface LanguageOption {
  code: string;
  langKey: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const POPULAR_LANGUAGES: LanguageOption[] = [
  { code: "hi-IN", langKey: "hi", name: "Hindi", nativeName: "हिंदी", flag: "🇮🇳" },
  { code: "en-IN", langKey: "en", name: "English (India)", nativeName: "English", flag: "🇮🇳" },
  { code: "bn-IN", langKey: "bn", name: "Bengali", nativeName: "বাংলা", flag: "🇮🇳" },
  { code: "mr-IN", langKey: "mr", name: "Marathi", nativeName: "मराठी", flag: "🇮🇳" },
  { code: "ta-IN", langKey: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳" },
  { code: "te-IN", langKey: "te", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳" },
  { code: "gu-IN", langKey: "gu", name: "Gujarati", nativeName: "ગુજરાતી", flag: "🇮🇳" },
  { code: "kn-IN", langKey: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "ml-IN", langKey: "ml", name: "Malayalam", nativeName: "മലയാളം", flag: "🇮🇳" },
  { code: "pa-IN", langKey: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
  { code: "es-ES", langKey: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "fr-FR", langKey: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "de-DE", langKey: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "ja-JP", langKey: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: "ar-SA", langKey: "en", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { code: "ru-RU", langKey: "en", name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
  { code: "pt-BR", langKey: "en", name: "Portuguese", nativeName: "Português", flag: "🇧🇷" },
  { code: "zh-CN", langKey: "en", name: "Mandarin", nativeName: "中文", flag: "🇨🇳" },
];

interface LocalizedAudioScript {
  en: string;
  hi: string;
  bn: string;
  mr: string;
  ta: string;
  te: string;
  gu: string;
  kn: string;
  ml: string;
  pa: string;
  es: string;
  fr: string;
  de: string;
  ja: string;
}

const TRIP_AUDIO_SCRIPTS: Record<string, LocalizedAudioScript> = {
  "fitoor-e-kashmir": {
    en: "Welcome to Kashmir—the Paradise on Earth. On this 6-day expedition, you will wake up to sunrise on Dal Lake in a luxury cedar houseboat, drift on romantic shikaras past floating gardens, soar on the Gulmarg gondola over snow-dusted pine forests, and walk through Pahalgam's Lidder River valley while tasting authentic Wazwan cuisine.",
    hi: "भारत के स्वर्ग—कश्मीर में आपका स्वागत है। ६ दिनों की इस खूबसूरत यात्रा में आप डल झील के शांत पानी पर बहते हुए देवदार के हाउस बोट में ठहरेंगे। सुबह के समय शिकारे की सवारी, गुलमर्ग गोंडोला से बर्फ से ढकी पहाड़ियों का नज़ारा, पहलगाम के हरे-भरे मैदान और प्रामाणिक कश्मीरी वाज़वान का आनंद लेंगे।",
    bn: "পৃথিবীর স্বর্গ কাশ্মীরে আপনাকে স্বাগতম। ৬ দিনের এই দুর্দান্ত অভিযানে আপনি ডাল লেকের ঐতিহ্যবাহী হাউসবোটে রাত্রিযাপন করবেন, গুলমার্গের গন্ডোলা রাইড এবং পহেলগামের দেবদারু বনের প্রাকৃতিক সৌন্দর্য উপভোগ করবেন।",
    mr: "भारताचे नंदनवन काश्मीरमध्ये आपले स्वागत आहे. ६ दिवसांच्या या सुंदर प्रवासात तुम्ही डल लेकमधील हाऊस बोटमध्ये मुक्काम कराल, गुलमर्ग गोंडोला आणि पहलगामच्या निसर्गरम्य दऱ्यांचा आनंद घ्याल.",
    ta: "பூலோக சொர்க்கமான காஷ்மீருக்கு உங்களை வரவேற்கிறோம். 6 நாட்கள் பயணத்தில் தால் ஏரி படகு இல்ல தங்குதல், குல்மார்க் கேபிள் கார் பயணம் மற்றும் பஹல்காம் பள்ளத்தாக்கு அனுபவங்களை அனுபவியுங்கள்.",
    te: "భూతల స్వర్గం కాశ్మీర్‌కు స్వాగతం. 6 రోజుల ఈ ప్రయాణంలో దాల్ లేక్ హౌస్‌బోట్ స్టే, గుల్మార్గ్ గొండోలా రైడ్ మరియు పహల్గామ్ అందాలను ఆస్వాదించండి.",
    gu: "પૃથ્વીના સ્વર્ગ કાશ્મીરમાં આપનું સ્વાગત છે. ૬ દિવસની આ અદ્ભુત યાત્રામાં તમે દલ લેકની હાઉસબોટ, ગુલમર્ગ ગોંડોલા અને પહેલગામની મનોરમ વાદીઓનો આનંદ માણશો.",
    kn: "ಭೂಲೋಕದ ಸ್ವರ್ಗ ಕಾಶ್ಮೀರಕ್ಕೆ ಸುಸ್ವಾಗತ. ೬ ದಿನಗಳ ಈ ಪ್ರವಾಸದಲ್ಲಿ ದಾಲ್ ಲೇಕ್ ಹೌಸ್‌ಬೋಟ್ ವಾಸ್ತವ್ಯ ಮತ್ತು ಗುಲ್ಮಾರ್ಗ್ ಗೊಂಡೊಲಾ ಅನುಭವ ಪಡೆಯಿರಿ.",
    ml: "ഭൂമിയിലെ സ്വർഗ്ഗമായ കശ്മീരിലേക്ക് സ്വാഗതം. 6 ദിവസത്തെ യാത്രയിൽ ദാൽ തടാകത്തിലെ ഹൗസ് ബോട്ട് സ്റ്റേയും ഗുൽമാർഗ് കാഴ്ചകളും ആസ്വദിക്കാം.",
    pa: "ਧਰਤੀ ਦੇ ਸਵਰਗ ਕਸ਼ਮੀਰ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ। 6 ਦਿਨਾਂ ਦੀ ਇਸ ਯਾਤਰਾ ਵਿੱਚ ਡਲ ਝੀਲ ਦੇ ਹਾਊਸਬੋਟ ਅਤੇ ਗੁਲਮਰਗ ਦੇ ਮੈਦਾਨਾਂ ਦਾ ਅਨੰਦ ਲਓ।",
    es: "Bienvenido a Cachemira, el paraíso en la Tierra. En esta expedición de 6 días, despertarás frente al amanecer en el lago Dal a bordo de una casa flotante de cedro, navegarás en shikaras y volarás en el teleférico de Gulmarg.",
    fr: "Bienvenue au Cachemire, le paradis sur Terre. Durant ce voyage de 6 jours, vous séjournerez sur le lac Dal à bord d'un houseboat traditionnel et survolerez les sommets enneigés de Gulmarg.",
    de: "Willkommen in Kaschmir – dem Paradies auf Erden. Auf dieser 6-tägigen Reise erleben Sie Sonnenaufgänge auf dem Dal-See und die Gondelbahn von Gulmarg.",
    ja: "地上の楽園カシミールへようこそ。6日間の旅でダル湖のハウスボート滞在やグルマルグのゴンドラ体験をお楽しみください。"
  },
  "royal-rajasthan": {
    en: "Welcome to Royal Rajasthan! Experience 8 glorious days exploring the Pink City of Jaipur, the romantic lake palaces of Udaipur, and the golden Thar Desert dunes of Jaisalmer with sunset camel safaris and folk dances under the stars.",
    hi: "रॉयल राजस्थान की राजसी भूमि पर आपका स्वागत है! ८ दिनों की इस भव्य यात्रा में जयपुर का हवा महल, उदयपुर के शांत लेक पैलेस और जैसलमेर के थार रेगिस्तान में ऊंट की सवारी और लोक नृत्य का आनंद लें।",
    bn: "রয়্যাল রাজস্থানে আপনাকে স্বাগতম! ৮ দিনের এই রাজকীয় সফরে জয়পুরের প্রাসাদ, উদয়পুরের হ্রদ এবং জয়সলমীরের মরুভূমির উটের সাফারি উপভোগ করুন।",
    mr: "रॉयल राजस्थानमध्ये आपले स्वागत आहे! ८ दिवसांच्या या प्रवासात जयपूरचे किल्ले, उदयपूरचे लेक पॅलेस आणि जैसलमेरच्या वाळवंटातील उंट सफारीचा आनंद घ्या.",
    ta: "ராஜஸ்தானின் ராயல் பயணத்திற்கு வரவேற்கிறோம்! 8 நாட்கள் பயணத்தில் ஜெய்ப்பூர் அரண்மனைகள், உதய்பூர் ஏரிகள் மற்றும் ஜெய்சால்மர் தார் பாலைவன சஃபாரி அனுபவியுங்கள்.",
    te: "రాయల్ రాజస్థాన్‌కు స్వాగతం! 8 రోజుల ప్రయాణంలో జైపూర్ కోటలు, ఉదయపూర్ సరస్సులు మరియు జైసల్మేర్ ఎడారి సఫారీని ఆస్వాదించండి.",
    gu: "રોયલ રાજસ્થાનમાં આપનું સ્વાગત છે! ૮ દિવસની આ ભવ્ય યાત્રામાં જયપુર, ઉદયપુર અને જૈસલમેરના રણ વિસ્તારનો આનંદ માણો.",
    kn: "ರಾಯಲ್ ರಾಜಸ್ಥಾನಕ್ಕೆ ಸುಸ್ವಾಗತ! ೮ ದಿನಗಳ ಈ ಪ್ರವಾಸದಲ್ಲಿ ಜೈಪುರ ಕೋಟೆಗಳು ಮತ್ತು ಉದಯಪುರ ಸರೋವರಗಳ ಸೌಂದರ್ಯ ಆಸ್ವಾದಿಸಿ.",
    ml: "റോയൽ രാജസ്ഥാനിലേക്ക് സ്വാഗതം! 8 ദിവസത്തെ യാത്രയിൽ ജയ്പൂർ കൊട്ടാരങ്ങളും ഉദയ്പൂർ തടാകങ്ങളും മരുഭൂമി സഫാരിയും ആസ്വദിക്കൂ.",
    pa: "ਰੋਇਲ ਰਾਜਸਥਾਨ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ! 8 ਦਿਨਾਂ ਵਿੱਚ ਜੈਪੁਰ, ਉਦੈਪੁਰ ਅਤੇ ਜੈਸਲਮੇਰ ਦੇ ਰੇਗਿਸਤਾਨੀ ਸਫਾਰੀ ਦਾ ਅਨੰਦ ਲਓ।",
    es: "¡Bienvenido a Rajasthan Real! Vive 8 días explorando la Ciudad Rosa de Jaipur, los palacios sobre lagos de Udaipur y las dunas de Jaisalmer.",
    fr: "Bienvenue dans le Rajasthan Royal! Parcourez les palais de Jaipur, les lacs d'Udaipur et les dunes dorées del désert de Thar à Jaisalmer.",
    de: "Willkommen im königlichen Rajasthan! Erleben Sie 8 Tage voller Paläste in Jaipur, Seen in Udaipur und Wüstensafaris in Jaisalmer.",
    ja: "ロイヤル・ラジャスタンへようこそ！8日間の旅でピンクシティ・ジャイプルやジャイサルメールの砂漠サファリをご堪能ください。"
  },
  "kerala-backwaters": {
    en: "Welcome to Kerala—God's Own Country. Relax on an overnight traditional kettuvallam houseboat cruise through Alleppey's quiet canals, wander through Munnar's emerald tea gardens, and watch Fort Kochi's sunset fishing nets.",
    hi: "ईश्वर के अपने देश—केरल में आपका स्वागत है। अलेप्पी के बैकवाटर्स में पारंपरिक केट्टुवल्लम हाउस बोट में रात बिताएं, मुन्नार के चाय के बागानों की ताज़ा हवा लें और फोर्ट कोच्चि के सूर्यास्त का आनंद लें।",
    bn: "গডস ওন কান্ট্রি কেরলে আপনাকে স্বাগতম। আল্লেপ্পির ব্যাকওয়াটারে হাউস বোট ক্রুজ এবং মুন্নারের চা বাগানের অনবদ্য অনুভূতি উপভোগ করুন।",
    mr: "केरळमध्ये आपले स्वागत आहे. अलेप्पीच्या शांत बॅकवॉटरमध्ये हाऊस बोट सफारी आणि मुन्नारच्या चहाच्या बागांचा आनंद घ्या.",
    ta: "கடவுளின் தேசமான கேரளாவிற்கு வரவேற்கிறோம். ஆலப்புழை படகு இல்ல பயணம் மற்றும் மூணார் தேயிலை தோட்டங்களை அனுபவியுங்கள்.",
    te: "దేవుని సొంత దేశం కేరళకు స్వాగతం. అలప్పి బ్యాక్‌వాటర్స్ హౌస్‌బోట్ మరియు మున్నార్ తేయాకు తోటలను ఆస్వాదించండి.",
    gu: "કેરળમાં આપનું સ્વાગત છે. અલેપ્પીના બેકવોટર્સમાં હાઉસબોટ ક્રૂઝ અને મુન્નારના ચાના બગીચાઓની મુલાકાત લો.",
    kn: "ದೇವರ ಸ್ವಂತ ನಾಡು ಕೇರಳಕ್ಕೆ ಸುಸ್ವಾಗತ. ಅಲೆಪ್ಪಿ ಬ್ಯಾಕ್‌ವಾಟರ್ ಹೌಸ್‌ಬೋಟ್ ಮತ್ತು ಮುನ್ನಾರ್ ಟೀ ತೋಟಗಳ ಸೌಂದರ್ಯ ಅನುಭವಿಸಿ.",
    ml: "ദൈവത്തിന്റെ സ്വന്തം നാടായ കേരളത്തിലേക്ക് സ്വാഗതം. ആലപ്പുഴ ഹൗസ് ബോട്ട് യാത്രയും മൂന്നാർ തേയിലത്തോട്ടങ്ങളും ആസ്വദിക്കൂ.",
    pa: "ਕੇਰਲ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ। ਅਲੇਪੀ ਦੇ ਬੈਕਵਾਟਰਜ਼ ਵਿੱਚ ਹਾਊਸਬੋਟ ਅਤੇ ਮੁੰਨਾਰ ਦੇ ਚਾਹ ਦੇ ਬਾਗਾਂ ਦਾ ਅਨੰਦ ਲਓ।",
    es: "Bienvenido a Kerala, el propio país de Dios. Relájate en un crucero nocturno en casa flotante por las aguas estancadas de Alleppey y pasea por Munnar.",
    fr: "Bienvenue au Kerala, le propre pays de Dieu. Naviguez en houseboat sur les backwaters d'Alleppey et visitez les plantations de thé de Munnar.",
    de: "Willkommen in Kerala – Gottes eigenem Land. Entpannen Sie auf einem Hausboot in Alleppey und erkunden Sie die Teeberge von Munnar.",
    ja: "神々の国ケララへようこそ。アレッピーのハウスボートクルーズやムンナールの紅茶畑をお楽しみください。"
  },
  "ladakh-high-passes": {
    en: "Welcome to Ladakh—Land of High Passes. Embark on a thrilling 7-day high-altitude journey across Khardung La pass, marvel at the cold desert dunes of Hunder with double-humped camels, and camp beside the surreal blue waters of Pangong Tso.",
    hi: "ऊंचे दर्रों की भूमि—लद्दाख में आपका स्वागत है। ७ दिनों की इस रोमांचक यात्रा में खारदुंग ला दर्रा पार करें, हुंडर के ठंडे रेगिस्तान में दो कूबड़ वाले ऊंटों की सवारी करें और पैंगोंग झील के नीले पानी के किनारे कैंपिंग का आनंद लें।",
    bn: "লাদাখে আপনাকে স্বাগতম। ৭ দিনের রোমাঞ্চকর অভিযানে খারদুং লা পাস অতিক্রম করুন এবং প্যাংগং লেকের পারে ক্য্যাম্পিং উপভোগ করুন।",
    mr: "लडाखमध्ये आपले स्वागत आहे. ७ दिवसांच्या या धाडसी प्रवासात खारदुंग ला पास आणि पॅंगॉन्ग लेकच्या किनाऱ्यावर कॅम्पिंगचा आनंद घ्या.",
    ta: "லடாக்கிற்கு வரவேற்கிறோம். 7 நாட்கள் பயணத்தில் கர்துங் லா கணவாய் மற்றும் பாங்காங் ஏரி முகாம் அனுபவங்களை அனுபவியுங்கள்.",
    te: "లడాఖ్‌కు స్వాగతం. 7 రోజుల ప్రయాణంలో ఖార్దుంగ్ లా పాస్ మరియు పాంగోంగ్ సరస్సు క్యాంపింగ్ ఆస్వాదించండి.",
    gu: "લડાખમાં આપનું સ્વાગત છે. ૭ દિવસની સાહસિક યાત્રામાં ખારદુંગ લા પાસ અને પેંગોંગ સરોવરના કિનારે કેમ્પિંગનો આનંદ લો.",
    kn: "ಲಡಾಖ್‌ಗೆ ಸುಸ್ವಾಗತ. ೭ ದಿನಗಳ ಸಾಹಸಮಯ ಪ್ರವಾಸದಲ್ಲಿ ಖಾರ್ದುಂಗ್ ಲಾ ಪಾಸ್ ಮತ್ತು ಪ್ಯಾಂಗಾಂಗ್ ಸರೋವರ ಕ್ಯಾಂಪಿಂಗ್ ಅನುಭವಿಸಿ.",
    ml: "ലഡാക്കിലേക്ക് സ്വാഗതം. 7 ദിവസത്തെ സാഹസിക യാത്രയിൽ ഖാർദുംഗ് ലാ പാസും പാംഗോങ് തടാക ക്യാമ്പിംഗും ആസ്വദിക്കൂ.",
    pa: "ਲਦਾਖ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ। 7 ਦਿਨਾਂ ਦੇ ਸਾਹਸੀ ਸਫਰ ਵਿੱਚ ਖਾਰਦੁੰਗ ਲਾ ਅਤੇ ਪੈਂਗੋਂਗ ਝੀਲ ਦਾ ਅਨੰਦ ਲਓ।",
    es: "Bienvenido a Ladakh, la tierra de los altos pasos. Cruza el pase Khardung La y acampa junto a las azules aguas de Pangong Tso.",
    fr: "Bienvenue au Ladakh. Traverser le col de Khardung La et campez au bord du magnifique lac bleu de Pangong Tso.",
    de: "Willkommen in Ladakh. Überqueren Sie den Khardung La Pass und campen Sie am tiefblauen Pangong Tso See.",
    ja: "ラダックへようこそ。カードゥン・ラ峠を超え、パンゴンツォ湖畔でのキャンプをご体験ください。"
  },
  "goa-coastal-escape": {
    en: "Welcome to Goa! Enjoy a sunny coastal escape with gold sand beaches of Palolem, Portuguese heritage lanes of Fontainhas, vibrant beach shacks, and a dolphin spotting boat cruise.",
    hi: "गोवा के तटीय समुद्र तटों पर आपका स्वागत है! ४ दिनों की इस सुहानी यात्रा में पालोलेम बीच का सूर्यास्त, फोंटेनहास की पुर्तगाली गलियां और डॉलफिन क्रूज़ का आनंद लें।",
    bn: "গোয়ার উপকূলীয় সৈকতে আপনাকে স্বাগতম! পালোলেম বিচের সূর্যাস্ত এবং ফন্টেইনহাসের পর্তুগিজ ঐতিহ্যের আমেজ উপভোগ করুন।",
    mr: "गोव्यात आपले स्वागत आहे! पालोलेम बीचचा सूर्यास्त आणि फॉन्टेनहासच्या पोर्तुगीज गल्ल्यांमध्ये भटकंती करा.",
    ta: "கோவாவிற்கு வரவேற்கிறோம்! பாலோலெம் கடற்கரை மற்றும் பாண்டையின்ஹாஸ் போர்த்துகீசிய பகுதிகளை அனுபவியுங்கள்.",
    te: "గోవాకు స్వాగతం! పాలోలెమ్ బీచ్ మరియు గ్రాండే ఐలాండ్ డాల్ఫిన్ క్రూయిజ్ ఆస్వాదించండి.",
    gu: "ગોવામાં આપનું સ્વાગત છે! પાલોલેમ બીચ અને પોર્ટુગીઝ શેરીઓમાં ફરવાનો આનંદ માણો.",
    kn: "ಗೋವಾಗೆ ಸುಸ್ವಾಗತ! ಪಾಲೋಲೆಮ್ ಬೀಚ್ ಮತ್ತು ಡಾಲ್ಫಿನ್ ಕ್ರೂಸ್ ಅನುಭವಿಸಿ.",
    ml: "ഗോവയിലേക്ക് സ്വാഗതം! പാലോലെം ബീച്ചും ഡോൾഫിൻ ക്രൂയിസും ആസ്വദിക്കൂ.",
    pa: "ਗੋਆ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ! ਪਾਲੋਲੇਮ ਬੀਚ ਅਤੇ ਡਾਲਫਿਨ ਕਰੂਜ਼ ਦਾ ਅਨੰਦ ਲਓ।",
    es: "¡Bienvenido a Goa! Disfruta de las playas doradas de Palolem, las calles portuguesas de Fontainhas y cruceros para ver delfines.",
    fr: "Bienvenue à Goa! Profitez des plages de Palolem, du quartier portugais de Fontainhas et des croisières dauphins.",
    de: "Willkommen in Goa! Genießen Sie die Strände von Palolem und das portugiesische Viertel Fontainhas.",
    ja: "ゴアへようこそ！パロレムビーチやポルトガル風の街並みフォンテインハスをお楽しみください。"
  },
  "spiti-valley-circuit": {
    en: "Welcome to Spiti Valley—the Middle Land. Traverse high Himalayan passes, visit the cliffside Key Monastery, post a letter at Hikkim's highest post office, and stargaze beside the crescent Chandratal Lake.",
    hi: "स्पीति घाटी की रहस्यमयी भूमि पर आपका स्वागत है। ८ दिनों के इस साहसिक अभियान में की मोंक मठ के दर्शन करें, हिक्किम के विश्व के सबसे ऊंचे पोस्ट ऑफिस से चिट्ठी भेजें और चंद्रताल झील के किनारे तारों भरी रात का आनंद लें।",
    bn: "স্পিতি ভ্যালিতে আপনাকে স্বাগতম। ৮ দিনের এই অভিযানে কি মনাস্ট্রি, বিশ্বের সর্বোচ্চ পোস্ট অফিস হিক্কিম এবং চন্দ্রতাল লেকের সৌন্দর্য উপভোগ করুন।",
    mr: "स्पीती व्हॅलीमध्ये आपले स्वागत आहे! की मठाचे दर्शन, हिक्किमचे पोस्ट ऑफिस आणि चंद्रताल तलावाच्या किनाऱ्यावर चांदण्यांचा आनंद घ्या.",
    ta: "ஸ்பிட்டி பள்ளத்தாக்கிற்கு வரவேற்கிறோம்! கீ மடாலயம் மற்றும் சந்திரதால் ஏரி முகாம் அனுபவியுங்கள்.",
    te: "స్పితి వ్యాలీకి స్వాగతం! కీ మొనాస్టరీ మరియు చంద్రతాల్ సరస్సు అందాలను ఆస్వాదించండి.",
    gu: "સ્પિતિ વેલીમાં આપનું સ્વાગત છે! કી મોનાસ્ટ્રી અને ચંદ્રતાલ સરોવરનો સાહસિક અનુભવ લો.",
    kn: "ಸ್ಪಿಟಿ ವ್ಯಾಲಿಗೆ ಸುಸ್ವಾಗತ! ಕೀ ಮಠ ಮತ್ತು ಚಂದ್ರತಾಲ್ ಸರೋವರದ ಸೌಂದರ್ಯ ಆಸ್ವಾದಿಸಿ.",
    ml: "സ്പിതി വാലിയിലേക്ക് സ്വാഗതം! കീ മൊണാസ്ട്രിയും ചന്ദ്രതാൽ തടാകവും ആസ്വദിക്കൂ.",
    pa: "ਸਪੀਤੀ ਵੈਲੀ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ! ਕੀ ਮੱਠ ਅਤੇ ਚੰਦਰਤਾਲ ਝੀਲ ਦਾ ਅਨੰਦ ਲਓ।",
    es: "Bienvenido al Valle de Spiti. Visita el monasterio Key, envía una carta desde la oficina postal más alta en Hikkim y contempla las estrellas en Chandratal.",
    fr: "Bienvenue dans la vallée de Spiti. Visitez le monastère de Key et observez les étoiles au bord du lac Chandratal.",
    de: "Willkommen in der Atmosphäre von Spiti. Besuchen Sie das Key-Kloster und beobachten Sie Sterne am Chandratal-See.",
    ja: "スピティバレーへようこそ。キー寺院や最高所のヒッキム郵便局、チャンドラタール湖をご堪能ください。"
  },
  "varanasi-rishikesh-soul": {
    en: "Welcome to the Spiritual Heart of India! Experience sunrise rowboats along Varanasi's ancient ghats, witness the glowing evening Ganga Aarti, practice Himalayan yoga, and raft down the holy Ganges in Rishikesh.",
    hi: "भारत की आध्यात्मिक आत्मा—वाराणसी और ऋषिकेश में आपका स्वागत है। ६ दिनों की इस पावन यात्रा में गंगा आरती, सुबह की नौका सवारी, हिमालयी योग और ऋषिकेश में रिवर राफ्टिंग का आनंद लें।",
    bn: "বারাণসী এবং ঋষিকেশের আধ্যাত্মিক সফরে আপনাকে স্বাগতম। গঙ্গা আরতি, প্রভাতী নৌকা ভ্রমণ এবং গঙ্গার রিভার রাফটিং উপভোগ করুন।",
    mr: "वाराणसी आणि ऋषिकेशच्या आध्यात्मिक प्रवासात आपले स्वागत आहे. संध्याकाळची गंगा आरती आणि ऋषिकेशमधील रिव्हर राफ्टिंगचा आनंद घ्या.",
    ta: "வாரணாசி மற்றும் ரிஷிகேஷ் ஆன்மீகப் பயணத்திற்கு வரவேற்கிறோம்! கங்கா ஆரத்தி மற்றும் ரிவர் ராஃப்டிங் அனுபவியுங்கள்.",
    te: "వారణాసి మరియు రిషికేష్ ఆ ఆధ్యాత్మిక ప్రయాణానికి స్వాగతం! గంగా హారతి మరియు రివర్ రాఫ్టింగ్ ఆస్వాదించండి.",
    gu: "વારાણસી અને ઋષિકેશની આધ્યત્મિક યાત્રામાં આપનું સ્વાગત છે! ગંગા આરતી અને રિવર રાફ્ટિંગનો આનંદ લો.",
    kn: "ವಾರಣಾಸಿ ಮತ್ತು ಋಷಿಕೇಶ ಆಧ್ಯಾತ್ಮಿಕ ಪ್ರವಾಸಕ್ಕೆ ಸುಸ್ವಾಗತ! ಗಂಗಾ ಆರತಿ ಮತ್ತು ರಿವರ್ ರಾಫ್ಟಿಂಗ್ ಅನುಭವಿಸಿ.",
    ml: "വാരാണസി - ഋഷികേശ് യാത്രയിലേക്ക് സ്വാഗതം! ഗംഗാ ആരതിയും റിവർ റാഫ്റ്റിംഗും ആസ്വദിക്കൂ.",
    pa: "ਵਾਰਾਣਸੀ ਅਤੇ ਰਿਸ਼ੀਕੇਸ਼ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ! ਗੰਗਾ ਆਰਤੀ ਅਤੇ ਰਿਵਰ ਰਾਫਟਿੰਗ ਦਾ ਅਨੰਦ ਲਓ।",
    es: "¡Bienvenido al Corazón Espiritual de la India! Experimenta paseos al amanecer por los ghats de Varanasi, la ceremonia Ganga Aarti y rafting en Rishikesh.",
    fr: "Bienvenue dans le cœur spirituel de l'Inde! Admirez le Ganga Aarti à Varanasi et faites du rafting à Rishikesh.",
    de: "Willkommen im spirituellen Herzen Indiens! Erleben Sie die Ganga Aarti in Varanasi und Rafting in Rishikesh.",
    ja: "バラナシ＆リシケシのスピリチュアル旅へようこそ！ガンガー・アーラティやリシケシのラフティングをお楽しみください。"
  },
  "meghalaya-living-roots": {
    en: "Welcome to Meghalaya—Abode of Clouds. Trek through lush rain forests to the ancient Double Decker Living Root Bridge in Nongriat, glide on crystal-clear Umngot river at Dawki, and explore Nohkalikai Falls.",
    hi: "मेघों के घर—मेघालय में आपका स्वागत है। नोंग्रियाट के डबल डेकर लिविंग रूट ब्रिज की रोमांचक चढ़ाई करें, डावकी की दावकी पारदर्शी नदी में बोटिंग करें और नोहकलिकाई जलप्रपात की सुंदरता देखें।",
    bn: "মেঘালয়ে আপনাকে স্বাগতম। ডাবল ডেকার লিভিং রুট ব্রিজ ট্রেকিং এবং ডাউকির স্ফটিক স্বচ্ছ নদীতে নৌকা ভ্রমণ উপভোগ করুন।",
    mr: "मेघालयमध्ये आपले स्वागत आहे. डबल डेकर लिव्हिंग रूट ब्रिज ट्रेक आणि दावकीच्या स्वच्छ नदीतील बोटिंगचा आनंद घ्या.",
    ta: "மேகாலயாவிற்கு வரவேற்கிறோம்! டபுள் டாக்கர் ரூட் பாலம் மற்றும் டாவ்கி படகுப் பயணத்தை அனுபவியுங்கள்.",
    te: "మేఘాలయకు స్వాగతం! డబుల్ డెక్కర్ లివింగ్ రూట్ బ్రిడ్జ్ మరియు దావ్‌కి బోటింగ్ ఆస్వాదించండి.",
    gu: "મેઘાલયમાં આપનું સ્વાગત છે! ડબલ ડેકર લિવિંગ રૂટ બ્રિજ અને દાવકી નદીમાં બોટિંગનો આનંદ લો.",
    kn: "ಮೇಘಾಲಯಕ್ಕೆ ಸುಸ್ವಾಗತ! ಡಬಲ್ ಡೆಕ್ಕರ್ ಲಿವಿಂಗ್ ರೂಟ್ ಬ್ರಿಡ್ಜ್ ಮತ್ತು ದಾವ್‌ಕಿ ಬೋಟಿಂಗ್ ಅನುಭವಿಸಿ.",
    ml: "മേഘാലയയിലേക്ക് സ്വാഗതം! ലിവിങ് റൂട്ട് ബ്രിഡ്ജ് ട്രെക്കിംഗും ദാവകി ബോട്ടിംഗും ആസ്വദിക്കൂ.",
    pa: "ਮੇਘਾਲਿਆ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ! ਡਬਲ ਡੈਕਰ ਰੂਟ ਬ੍ਰਿਜ ਅਤੇ ਦਾਵਕੀ ਨਦੀ ਦਾ ਅਨੰਦ ਲਓ।",
    es: "Bienvenido a Meghalaya, la morada de las nubes. Camina hacia los puentes de raíces vivas y navega por el río de cristal Umngot en Dawki.",
    fr: "Bienvenue au Meghalaya, la demeure des nuages. Explorez le pont de racines vivantes à Nongriat et le fleuve cristal de Dawki.",
    de: "Willkommen in Meghalaya. Wandern Sie zu den lebenden Wurzelbrücken und fahren Sie auf dem kristallklaren Fluss in Dawki.",
    ja: "メガラヤへようこそ。二重生きた木の根の橋やドーキの透明な川でのボート体験をお楽しみください。"
  },
  "pachmarhi-satpura": {
    en: "Welcome to Pachmarhi—Queen of Satpura. Explore central India's lush hill station, refresh under Bee Falls cascades, discover ancient Pandav Caves, and watch golden sunsets from Dhoopgarh peak.",
    hi: "सतपुड़ा की रानी—पंचमढ़ी में आपका स्वागत है। मध्य प्रदेश के एकमात्र पर्वतीय स्थल पर बी फॉल्स के ठंडे पानी, प्राचीन पांडव गुफाओं और धूपगढ़ से मनमोहक सूर्यास्त का आनंद लें।",
    bn: "পচমড়িতে আপনাকে স্বাগতম। শতপুরা পাহাড়ের প্রাকৃতিক ঝরনা বি ফলস এবং ধূপগড় থেকে সূর্যাস্ত উপভোগ করুন।",
    mr: "सातपुड्याची राणी पंचमढीत आपले स्वागत आहे. बी फॉल्सचे धबधबे आणि धूपगढवरून सूर्यास्ताचा आनंद घ्या.",
    ta: "பச்மடிக்கு வரவேற்கிறோம்! பீ फॉல்ஸ் அருவி மற்றும் தூப்கர் சூரிய அஸ்தமனத்தை அனுபவியுங்கள்.",
    te: "పచ్మఢీకి స్వాగతం! బీ ఫాల్స్ జలపాతం మరియు ధూప్‌గఢ్ సూర్యాస్తమయాన్ని ఆస్వాదించండి.",
    gu: "પંચમઢીમાં આપનું સ્વાગત છે! બી ફોલ્સ ઝરણું અને ધૂપગઢથી સૂર્યાસ્તનો આનંદ માણો.",
    kn: "ಪಚ್‌ಮಢಿಗೆ ಸುಸ್ವಾಗತ! ಬಿ ಫಾಲ್ಸ್ ಜಲಪಾತ ಮತ್ತು ಧೂಪ್‌ಗಢ್‌ ಸೂರ್ಯಾસ્ત ವೀಕ್ಷಿಸಿ.",
    ml: "പഞ്ച്മഡിയിലേക്ക് സ്വാഗതം! ബീ ഫോൾസ് വെള്ളച്ചാട്ടവും ധൂപ്ഗഡ് അസ്തമയവും ആസ്വദിക്കൂ.",
    pa: "ਪਚਮੜੀ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ! ਬੀ ਫਾਲਸ ਅਤੇ ਧੂਪਗੜ੍ਹ ਦੇ ਸੂਰਜ ਛਿਪਣ ਦਾ ਅਨੰਦ ਲਓ।",
    es: "¡Bienvenido a Pachmarhi, la reina de Satpura! Disfruta de la cascada Bee Falls, las cueva Pandav y el atardecer en Dhoopgarh.",
    fr: "Bienvenue à Pachmarhi, la reine de Satpura. Découvrez la cascade Bee Falls et le coucher de soleil depuis le pic Dhoopgarh.",
    de: "Willkommen in Pachmarhi, der Königin von Satpura. Erkunden Sie die Bee Falls und den Sonnenuntergang auf dem Dhoopgarh.",
    ja: "パチマリへようこそ。ビーフォールズの滝やドゥープガル山頂からの夕日をお楽しみください。"
  }
};

interface AudioGuideProps {
  trip: {
    id?: string;
    name: string;
    destination?: string;
    state?: string;
    price: number;
    days: number;
    nights?: number;
    blurb?: string;
    overview?: string;
    highlights?: string[];
  };
  className?: string;
}

export function AudioGuide({ trip, className }: AudioGuideProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedLang, setSelectedLang] = useState<string>("hi-IN");
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load available speech synthesis voices
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };

    updateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Cleanup synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Get authentic trip-specific audio script
  const getPersonalAudioScript = (langCode: string): string => {
    const langObj = POPULAR_LANGUAGES.find((l) => l.code === langCode) || POPULAR_LANGUAGES[0];
    const key = langObj.langKey as keyof LocalizedAudioScript;

    // Check if predefined personal script exists for trip ID
    if (trip.id && TRIP_AUDIO_SCRIPTS[trip.id]) {
      const scriptObj = TRIP_AUDIO_SCRIPTS[trip.id];
      if (scriptObj[key]) {
        return scriptObj[key];
      }
      if (scriptObj.en) return scriptObj.en;
    }

    // Dynamic fall-back localized script for custom trip plans
    const destination = trip.destination || trip.state || trip.name;
    const highlightsText = trip.highlights && trip.highlights.length > 0
      ? trip.highlights.slice(0, 3).join(", ")
      : "Scenic views and local culture";

    if (langCode.startsWith("hi")) {
      return `${trip.name} में आपका स्वागत है। ${destination} की इस ${trip.days} दिनों की शानदार यात्रा का आनंद लें। मुख्य आकर्षण: ${highlightsText}। ${trip.blurb || trip.overview || ""}`;
    }
    if (langCode.startsWith("bn")) {
      return `${trip.name} এ আপনাকে স্বাগতম। ${destination} এর ${trip.days} দিনের চমৎকার ভ্রমণ। প্রধান আকর্ষণ: ${highlightsText}।`;
    }
    if (langCode.startsWith("mr")) {
      return `${trip.name} मध्ये आपले स्वागत आहे. ${destination} ची ${trip.days} दिवसांची सुंदर सफर. प्रमुख आकर्षणे: ${highlightsText}।`;
    }
    if (langCode.startsWith("ta")) {
      return `${trip.name} சுற்றுலாத் திட்டத்திற்கு வரவேற்கிறோம். ${destination} பகுதிக்கு ${trip.days} நாட்கள் பயணம். சிறப்பம்சங்கள்: ${highlightsText}.`;
    }
    if (langCode.startsWith("es")) {
      return `¡Bienvenido a ${trip.name}! Disfruta de una expedición de ${trip.days} días en ${destination}. Lo más destacado: ${highlightsText}.`;
    }
    if (langCode.startsWith("fr")) {
      return `Bienvenue sur ${trip.name}! Profitez d'un voyage de ${trip.days} jours à ${destination}. Points forts: ${highlightsText}.`;
    }

    return `Welcome to ${trip.name}. Enjoy an unforgettable ${trip.days}-day journey in ${destination}. Highlights include: ${highlightsText}. ${trip.blurb || trip.overview || ""}`;
  };

  const handlePlayWithLang = (langCode: string) => {
    setSelectedLang(langCode);
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in your browser.");
      return;
    }

    const synth = window.speechSynthesis;
    synth.cancel();

    const scriptText = getPersonalAudioScript(langCode);
    const utterance = new SpeechSynthesisUtterance(scriptText);
    utteranceRef.current = utterance;

    // Match best voice for selected language
    const matchedVoice = availableVoices.find(
      (v) => v.lang === langCode || v.lang.startsWith(langCode.split("-")[0])
    );
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
    utterance.lang = langCode;
    utterance.rate = playbackRate;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      console.error("SpeechSynthesis error:", e);
      setIsPlaying(false);
      setIsPaused(false);
    };

    synth.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePlayPauseToggle = () => {
    if (isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      return;
    }
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      return;
    }
    handlePlayWithLang(selectedLang);
  };

  const handleStop = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleSpeedToggle = () => {
    const speeds = [1.0, 1.25, 1.5];
    const nextIndex = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const newRate = speeds[nextIndex];
    setPlaybackRate(newRate);

    if (isPlaying) {
      handleStop();
    }
  };

  const currentLangObj = POPULAR_LANGUAGES.find((l) => l.code === selectedLang) || POPULAR_LANGUAGES[0];
  const activeScriptText = getPersonalAudioScript(selectedLang);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-azure/30 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-5 text-white shadow-2xl backdrop-blur-xl",
        className
      )}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left: Speaker Icon Branding & Personal Audio Title */}
        <div className="flex items-center gap-4">
          <div className="relative flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-azure via-sky-400 to-emerald-400 text-slate-950 shadow-lg shadow-azure/40">
            <Volume2 className={cn("size-7 text-slate-950", isPlaying && !isPaused && "animate-bounce")} />
            {isPlaying && !isPaused && (
              <span className="absolute -top-1 -right-1 flex size-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-4 bg-emerald-500" />
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-azure/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-sky-300 border border-sky-400/30">
                <Sparkles className="size-3 text-amber-300" />
                Personalized Audio Narration
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Click Any Language Flag to Listen</span>
            </div>
            <h3 className="font-display text-lg sm:text-xl font-extrabold text-white">
              {trip.name} — Personal Audio Description
            </h3>
          </div>
        </div>

        {/* Right: Quick Language Flag Buttons + Speed Control */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full sm:max-w-md scrollbar-none">
            {POPULAR_LANGUAGES.slice(0, 10).map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => handlePlayWithLang(lang.code)}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all duration-300 border shrink-0",
                  selectedLang === lang.code && isPlaying
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-emerald-400 shadow-md scale-105"
                    : selectedLang === lang.code
                    ? "bg-azure text-white border-azure/50 font-bold"
                    : "bg-white/10 hover:bg-white/20 text-slate-200 border-white/15"
                )}
                title={`Listen in ${lang.name}`}
              >
                <span className="text-sm">{lang.flag}</span>
                <span>{lang.nativeName}</span>
              </button>
            ))}
          </div>

          {/* More Languages Dropdown */}
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="rounded-xl border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs font-medium gap-1 px-2.5 py-1.5"
            >
              <span>+More</span>
              <ChevronDown className="size-3 text-slate-300" />
            </Button>

            {showLangMenu && (
              <div className="absolute right-0 top-full mt-2 z-50 w-56 max-h-60 overflow-y-auto rounded-2xl border border-white/20 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl">
                <p className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Audio Language
                </p>
                <div className="space-y-1 mt-1">
                  {POPULAR_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setShowLangMenu(false);
                        handlePlayWithLang(lang.code);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs text-left transition-colors",
                        selectedLang === lang.code
                          ? "bg-azure text-white font-bold"
                          : "text-slate-200 hover:bg-white/10"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.nativeName}</span>
                      </span>
                      <span className="text-[10px] opacity-70">{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Speed Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSpeedToggle}
            className="rounded-xl border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-2.5 py-1.5 gap-1"
          >
            <Gauge className="size-3.5 text-sky-300" />
            <span>{playbackRate}x</span>
          </Button>

          {/* Master Play/Pause Button */}
          <Button
            type="button"
            size="sm"
            onClick={handlePlayPauseToggle}
            className={cn(
              "rounded-xl font-bold text-xs px-4 py-2 shadow-lg transition-all duration-300 gap-2",
              isPlaying && !isPaused
                ? "bg-amber-500 hover:bg-amber-600 text-slate-950"
                : "bg-gradient-to-r from-azure to-sky-400 hover:from-sky-500 hover:to-azure text-white"
            )}
          >
            {isPlaying ? (
              isPaused ? (
                <>
                  <Play className="size-4 fill-current" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <Pause className="size-4 fill-current" />
                  <span>Pause</span>
                </>
              )
            ) : (
              <>
                <Volume2 className="size-4" />
                <span>Play Audio</span>
              </>
            )}
          </Button>

          {isPlaying && (
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={handleStop}
              className="size-9 rounded-xl border-red-500/40 bg-red-500/20 text-red-300 hover:bg-red-500 hover:text-white"
              title="Stop Narration"
            >
              <Square className="size-4 fill-current" />
            </Button>
          )}
        </div>
      </div>

      {/* Transcript & Equalizer Bar */}
      <div className="mt-4 pt-3 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/5 rounded-2xl p-3">
        <div className="flex items-start gap-2 max-w-3xl">
          <AudioWaveform className="size-4 text-sky-300 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-300 leading-relaxed italic line-clamp-2">
            "{activeScriptText}"
          </p>
        </div>

        {isPlaying && !isPaused && (
          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
            <span className="text-[11px] font-semibold text-emerald-300">
              Speaking in {currentLangObj.nativeName}
            </span>
            <div className="flex items-end gap-1 h-4">
              <span className="w-1 bg-sky-400 rounded-full animate-[bounce_0.6s_infinite_100ms] h-full" />
              <span className="w-1 bg-amber-400 rounded-full animate-[bounce_0.6s_infinite_200ms] h-2/3" />
              <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_0.6s_infinite_300ms] h-full" />
              <span className="w-1 bg-sky-400 rounded-full animate-[bounce_0.6s_infinite_400ms] h-1/2" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
