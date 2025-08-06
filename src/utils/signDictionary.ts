// Sign language dictionary and animation mapping for ISL
export interface SignAnimation {
  id: string;
  name: string;
  glosses: string[];
  animationFile: string;
  duration: number; // in seconds
  difficulty: 'basic' | 'intermediate' | 'advanced';
  category: 'greeting' | 'emotion' | 'question' | 'family' | 'number' | 'action' | 'object';
}

// Main sign dictionary mapping glosses to animation files
export const signDictionary: Record<string, string> = {
  // Greetings and basic interactions
  'HELLO': '/signs/hello.glb',
  'HI': '/signs/hello.glb',
  'GOODBYE': '/signs/goodbye.glb',
  'BYE': '/signs/goodbye.glb',
  'GOOD': '/signs/good.glb',
  'MORNING': '/signs/morning.glb',
  'AFTERNOON': '/signs/afternoon.glb',
  'EVENING': '/signs/evening.glb',
  'NIGHT': '/signs/night.glb',
  'THANK-YOU': '/signs/thank_you.glb',
  'THANK': '/signs/thank_you.glb',
  'PLEASE': '/signs/please.glb',
  'SORRY': '/signs/sorry.glb',
  'EXCUSE-ME': '/signs/excuse_me.glb',

  // Questions and responses
  'YES': '/signs/yes.glb',
  'NO': '/signs/no.glb',
  'MAYBE': '/signs/maybe.glb',
  'HOW': '/signs/how.glb',
  'WHAT': '/signs/what.glb',
  'WHERE': '/signs/where.glb',
  'WHEN': '/signs/when.glb',
  'WHY': '/signs/why.glb',
  'WHO': '/signs/who.glb',
  'WHICH': '/signs/which.glb',

  // Emotions and feelings
  'HAPPY': '/signs/happy.glb',
  'SAD': '/signs/sad.glb',
  'ANGRY': '/signs/angry.glb',
  'EXCITED': '/signs/excited.glb',
  'SCARED': '/signs/scared.glb',
  'SURPRISED': '/signs/surprised.glb',
  'TIRED': '/signs/tired.glb',
  'LOVE': '/signs/love.glb',
  'LIKE': '/signs/like.glb',
  'HATE': '/signs/hate.glb',

  // Family and relationships
  'FAMILY': '/signs/family.glb',
  'MOTHER': '/signs/mother.glb',
  'FATHER': '/signs/father.glb',
  'SISTER': '/signs/sister.glb',
  'BROTHER': '/signs/brother.glb',
  'GRANDMOTHER': '/signs/grandmother.glb',
  'GRANDFATHER': '/signs/grandfather.glb',
  'CHILD': '/signs/child.glb',
  'BABY': '/signs/baby.glb',
  'FRIEND': '/signs/friend.glb',

  // Personal pronouns and basic verbs
  'I': '/signs/i.glb',
  'YOU': '/signs/you.glb',
  'HE': '/signs/he.glb',
  'SHE': '/signs/she.glb',
  'WE': '/signs/we.glb',
  'THEY': '/signs/they.glb',
  'MY': '/signs/my.glb',
  'YOUR': '/signs/your.glb',
  'HIS': '/signs/his.glb',
  'HER': '/signs/her.glb',
  'OUR': '/signs/our.glb',
  'THEIR': '/signs/their.glb',

  // Common verbs
  'GO': '/signs/go.glb',
  'COME': '/signs/come.glb',
  'SEE': '/signs/see.glb',
  'HEAR': '/signs/hear.glb',
  'SPEAK': '/signs/speak.glb',
  'UNDERSTAND': '/signs/understand.glb',
  'KNOW': '/signs/know.glb',
  'LEARN': '/signs/learn.glb',
  'TEACH': '/signs/teach.glb',
  'HELP': '/signs/help.glb',
  'WORK': '/signs/work.glb',
  'PLAY': '/signs/play.glb',
  'EAT': '/signs/eat.glb',
  'DRINK': '/signs/drink.glb',
  'SLEEP': '/signs/sleep.glb',

  // Numbers (1-20)
  'ONE': '/signs/numbers/one.glb',
  'TWO': '/signs/numbers/two.glb',
  'THREE': '/signs/numbers/three.glb',
  'FOUR': '/signs/numbers/four.glb',
  'FIVE': '/signs/numbers/five.glb',
  'SIX': '/signs/numbers/six.glb',
  'SEVEN': '/signs/numbers/seven.glb',
  'EIGHT': '/signs/numbers/eight.glb',
  'NINE': '/signs/numbers/nine.glb',
  'TEN': '/signs/numbers/ten.glb',
  'ELEVEN': '/signs/numbers/eleven.glb',
  'TWELVE': '/signs/numbers/twelve.glb',
  'THIRTEEN': '/signs/numbers/thirteen.glb',
  'FOURTEEN': '/signs/numbers/fourteen.glb',
  'FIFTEEN': '/signs/numbers/fifteen.glb',
  'SIXTEEN': '/signs/numbers/sixteen.glb',
  'SEVENTEEN': '/signs/numbers/seventeen.glb',
  'EIGHTEEN': '/signs/numbers/eighteen.glb',
  'NINETEEN': '/signs/numbers/nineteen.glb',
  'TWENTY': '/signs/numbers/twenty.glb',

  // Common objects and places
  'HOME': '/signs/home.glb',
  'SCHOOL': '/signs/school.glb',
  'HOSPITAL': '/signs/hospital.glb',
  'STORE': '/signs/store.glb',
  'RESTAURANT': '/signs/restaurant.glb',
  'WATER': '/signs/water.glb',
  'FOOD': '/signs/food.glb',
  'BOOK': '/signs/book.glb',
  'CAR': '/signs/car.glb',
  'HOUSE': '/signs/house.glb',
  'PHONE': '/signs/phone.glb',
  'COMPUTER': '/signs/computer.glb',

  // Colors
  'RED': '/signs/colors/red.glb',
  'BLUE': '/signs/colors/blue.glb',
  'GREEN': '/signs/colors/green.glb',
  'YELLOW': '/signs/colors/yellow.glb',
  'BLACK': '/signs/colors/black.glb',
  'WHITE': '/signs/colors/white.glb',
  'ORANGE': '/signs/colors/orange.glb',
  'PURPLE': '/signs/colors/purple.glb',
  'PINK': '/signs/colors/pink.glb',
  'BROWN': '/signs/colors/brown.glb'
};

// Structured sign animations with metadata
export const signAnimations: SignAnimation[] = [
  {
    id: 'hello',
    name: 'Hello',
    glosses: ['HELLO', 'HI'],
    animationFile: '/signs/hello.glb',
    duration: 2.0,
    difficulty: 'basic',
    category: 'greeting'
  },
  {
    id: 'thank_you',
    name: 'Thank You',
    glosses: ['THANK-YOU', 'THANK'],
    animationFile: '/signs/thank_you.glb',
    duration: 2.5,
    difficulty: 'basic',
    category: 'greeting'
  },
  {
    id: 'happy',
    name: 'Happy',
    glosses: ['HAPPY'],
    animationFile: '/signs/happy.glb',
    duration: 3.0,
    difficulty: 'basic',
    category: 'emotion'
  },
  {
    id: 'family',
    name: 'Family',
    glosses: ['FAMILY'],
    animationFile: '/signs/family.glb',
    duration: 2.8,
    difficulty: 'intermediate',
    category: 'family'
  }
];

// Get sign animation file path for a given text/gloss
export function getSignClip(text: string): string | null {
  if (!text) return null;
  
  // Normalize input: uppercase, remove punctuation, handle multiple words
  const normalizedText = text
    .toUpperCase()
    .replace(/[^\w\s-]/g, '')
    .trim();

  // Direct lookup for single words
  if (signDictionary[normalizedText]) {
    return signDictionary[normalizedText];
  }

  // Handle multi-word phrases
  const words = normalizedText.split(/\s+/);
  if (words.length > 1) {
    // Try compound words with hyphen
    const compoundWord = words.join('-');
    if (signDictionary[compoundWord]) {
      return signDictionary[compoundWord];
    }

    // Try first word if compound not found
    if (signDictionary[words[0]]) {
      return signDictionary[words[0]];
    }
  }

  // Handle common variations and synonyms
  const synonymMap: Record<string, string> = {
    'HI': 'HELLO',
    'BYE': 'GOODBYE',
    'THANKS': 'THANK-YOU',
    'THX': 'THANK-YOU',
    'OK': 'YES',
    'OKAY': 'YES',
    'NAH': 'NO',
    'NOPE': 'NO',
    'MOM': 'MOTHER',
    'DAD': 'FATHER',
    'SIS': 'SISTER',
    'BRO': 'BROTHER',
    'GRANDMA': 'GRANDMOTHER',
    'GRANDPA': 'GRANDFATHER'
  };

  const synonym = synonymMap[normalizedText];
  if (synonym && signDictionary[synonym]) {
    return signDictionary[synonym];
  }

  return null;
}

// Get multiple sign clips for a sentence
export function getSignClipsForSentence(text: string): Array<{ gloss: string; clipPath: string | null; duration: number }> {
  if (!text) return [];

  // Split into words and normalize
  const words = text
    .toUpperCase()
    .replace(/[^\w\s-]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 0);

  return words.map(word => {
    const clipPath = getSignClip(word);
    const animation = signAnimations.find(anim => anim.glosses.includes(word));
    
    return {
      gloss: word,
      clipPath,
      duration: animation?.duration || 2.0 // Default duration
    };
  });
}

// Get signs by category
export function getSignsByCategory(category: SignAnimation['category']): SignAnimation[] {
  return signAnimations.filter(sign => sign.category === category);
}

// Get signs by difficulty
export function getSignsByDifficulty(difficulty: SignAnimation['difficulty']): SignAnimation[] {
  return signAnimations.filter(sign => sign.difficulty === difficulty);
}

// Search signs by partial match
export function searchSigns(query: string): SignAnimation[] {
  if (!query) return [];
  
  const searchTerm = query.toLowerCase();
  
  return signAnimations.filter(sign => 
    sign.name.toLowerCase().includes(searchTerm) ||
    sign.glosses.some(gloss => gloss.toLowerCase().includes(searchTerm))
  );
}

// Validate if a sign animation file exists (mock implementation)
export function validateSignFile(filePath: string): Promise<boolean> {
  return new Promise((resolve) => {
    // In a real implementation, this would check if the .glb file exists
    // For now, we'll simulate validation
    setTimeout(() => {
      resolve(true); // Assume all files exist for demo
    }, 100);
  });
}

// Get random sign for practice
export function getRandomSign(difficulty?: SignAnimation['difficulty']): SignAnimation | null {
  let availableSigns = signAnimations;
  
  if (difficulty) {
    availableSigns = getSignsByDifficulty(difficulty);
  }
  
  if (availableSigns.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * availableSigns.length);
  return availableSigns[randomIndex];
}

export default signDictionary;