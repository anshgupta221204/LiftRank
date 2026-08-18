// Pool of 45 unique, motivational, funny Hinglish gym greetings
export const HINGLISH_GREETINGS = [
  { icon: "🦁", title: "Welcome Sher!", text: "Aaj gym mein kiski watt lagani hai?" },
  { icon: "🗿", title: "Aaja Baahubali!", text: "Aaj loha todte hain, excuses nahi." },
  { icon: "🔥", title: "Welcome Beast!", text: "Aaj koi bahana nahi, sirf heavy gains." },
  { icon: "💀", title: "Oye Monster!", text: "Kal ka PR yaad hai? Aaj uski aukaat dikhate hain." },
  { icon: "🐂", title: "Welcome Saand!", text: "Aaj weight halka nahi hona chahiye." },
  { icon: "👑", title: "Aaja Raja!", text: "Gym tera hai, ab silent hoke weight utha." },
  { icon: "🦍", title: "Welcome Gorilla!", text: "Aaj plates ko tujhse darr lagna chahiye." },
  { icon: "⚡", title: "Aaja Toofan!", text: "Warm-up ho gaya? Ab asli khel shuru karte hain." },
  { icon: "🏋️", title: "Welcome Ustaad!", text: "Aaj ek aur personal record maarte hain." },
  { icon: "😂", title: "Kya Haal Beast?", text: "Body ban rahi hai ya sirf attendance lag rahi hai?" },
  { icon: "😈", title: "Welcome Monster!", text: "Aaj muscles ko rula rula ke hypertrophy denge." },
  { icon: "🗿", title: "Aaja Titan!", text: "Rest day kal tha, aaj faad workout hoga." },
  { icon: "💪", title: "Welcome Pehelwan!", text: "Aaj iron se direct kushti karni hai." },
  { icon: "😂", title: "Oye 2-Rep King!", text: "Aaj 3 reps ka sapna sach karke jayenge." },
  { icon: "🔥", title: "Aaja Sher!", text: "Tera PR kabse tera intezaar kar raha hai." },
  { icon: "🥊", title: "Welcome Champ!", text: "Rings mein nahi, aaj rack par jeetenge." },
  { icon: "🚀", title: "Aaja Rocket!", text: "Aaj intensity space tak jani chahiye." },
  { icon: "💣", title: "Welcome Dynamo!", text: "Ek aur explosive set maaro aur shor machao." },
  { icon: "🦾", title: "Aaja Iron-Man!", text: "Biceps flex karne ka waqt aa gaya hai." },
  { icon: "🎯", title: "Welcome Target Killer!", text: "Aaj failure tak nahi, failure ke baad tak jayenge." },
  { icon: "🏆", title: "Aaja Leaderboard King!", text: "Rank #1 tera hi hai, bas lift continue rakh." },
  { icon: "🐺", title: "Welcome Alpha Wolf!", text: "Gym tera ilaka hai, aaj shikaar heavy weight ka hoga." },
  { icon: "⚡", title: "Oye Powerhouse!", text: "Aaj pre-workout ki zaroorat nahi, khud hi energy ho." },
  { icon: "💥", title: "Welcome Destroyer!", text: "Plates kam padni chahiye aaj ke leg day par." },
  { icon: "🩸", title: "Aaja Fighter!", text: "Sweat, blood, and heavy iron — yahi apna rasta hai." },
  { icon: "🏋️‍♂️", title: "Welcome Gym Guru!", text: "Chalo aaj naye lifters ko inspire karte hain." },
  { icon: "🤪", title: "Kya Bolte Bantai!", text: "Aaj chest day hai ya bicep ka drama?" },
  { icon: "😎", title: "Welcome Boss!", text: "Loha thanda hai, chal garam karte hain." },
  { icon: "🔥", title: "Aaja Angaar!", text: "Aaj har set mein Aag lagani hai." },
  { icon: "🦾", title: "Welcome Bicep Sultan!", text: "Aaj T-shirt tight honi chahiye." },
  { icon: "👑", title: "Aaja Emperor!", text: "Dumbbell rack tera throne hai." },
  { icon: "🐂", title: "Welcome Heavy Weight Baadshah!", text: "Light weight bolke heavy utha le." },
  { icon: "💀", title: "Aaja PR Crusher!", text: "Aaj purane records ki chhutti hai." },
  { icon: "🦁", title: "Welcome Sultan!", text: "Loha uthana tera shauk nahi, zaroorat hai." },
  { icon: "⚡", title: "Aaja Voltz!", text: "Gym ka music tez karo, Beast aa gaya hai." },
  { icon: "🤩", title: "Welcome Rockstars!", text: "Aaj pump aisa aayega ki mirror bhi dekh ke hasega." },
  { icon: "🔱", title: "Aaja Mahabali!", text: "Warm-up mein hi aadhi duniye darr jaye." },
  { icon: "🥊", title: "Welcome Heavyweight Champion!", text: "Har rep mein conviction hona chahiye." },
  { icon: "🎯", title: "Aaja Sniper!", text: "Target exact muscle group par lagna chahiye." },
  { icon: "🔥", title: "Welcome Thunder!", text: "Chalo aaj gym flooring ko feel karwate hain." },
  { icon: "🗿", title: "Aaja Spartan!", text: "No mercy for weak excuses today." },
  { icon: "🏆", title: "Welcome Legend!", text: "Hard work speaks louder than mirror selfies." },
  { icon: "💪", title: "Aaja Macho!", text: "Aaj ek aur plate add karna padega bar par." },
  { icon: "😎", title: "Welcome Bro!", text: "Chalo dikha do sabko asli pump kya hota hai." },
  { icon: "🚀", title: "Aaja Speedster!", text: "Rest time kam, results zyada." }
];

const STORAGE_SESSION_KEY = 'liftRank_sessionHinglishGreeting';
const STORAGE_USED_KEY = 'liftRank_usedHinglishIndices';

export const getNextHinglishGreeting = () => {
  try {
    // 1. Check if a greeting is already assigned for the current session (page refresh check)
    const existingSession = sessionStorage.getItem(STORAGE_SESSION_KEY);
    if (existingSession) {
      return JSON.parse(existingSession);
    }

    // 2. No active session greeting found -> select a fresh greeting from pool (no repeat logic)
    let usedIndices = [];
    const storedUsed = localStorage.getItem(STORAGE_USED_KEY);
    if (storedUsed) {
      try {
        usedIndices = JSON.parse(storedUsed);
      } catch (e) {
        usedIndices = [];
      }
    }

    // If all greetings have been used, reset the used cycle
    if (usedIndices.length >= HINGLISH_GREETINGS.length) {
      usedIndices = [];
    }

    // Find all indices that have NOT been used in the current cycle
    const availableIndices = [];
    for (let i = 0; i < HINGLISH_GREETINGS.length; i++) {
      if (!usedIndices.includes(i)) {
        availableIndices.push(i);
      }
    }

    // Randomly pick one index from the available pool
    const selectedIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];

    // Save selected index to used list in localStorage
    usedIndices.push(selectedIndex);
    localStorage.setItem(STORAGE_USED_KEY, JSON.stringify(usedIndices));

    // Store in sessionStorage so page refreshes retain the same greeting
    const selectedGreeting = HINGLISH_GREETINGS[selectedIndex];
    sessionStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(selectedGreeting));

    return selectedGreeting;
  } catch (err) {
    console.error('Error selecting Hinglish greeting:', err);
    return HINGLISH_GREETINGS[0];
  }
};

export const clearSessionGreeting = () => {
  try {
    sessionStorage.removeItem(STORAGE_SESSION_KEY);
  } catch (e) {
    // ignore error
  }
};
