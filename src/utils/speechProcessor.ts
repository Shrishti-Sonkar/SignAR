// Enhanced speech processing utilities to handle merged words and cleanup
export class SpeechProcessor {
  
  // Dictionary of common merged words patterns
  private static mergedWordPatterns: Record<string, string[]> = {
    'HELLOHELLO': ['HELLO', 'HELLO'],
    'GOODMORNING': ['GOOD', 'MORNING'],
    'GOODEVENING': ['GOOD', 'EVENING'],
    'GOODNIGHT': ['GOOD', 'NIGHT'],
    'THANKYOU': ['THANK', 'YOU'],
    'NAMEIS': ['NAME', 'IS'],
    'HOWERE': ['HOW', 'ARE'],
    'WHEREARE': ['WHERE', 'ARE'],
    'WHATARE': ['WHAT', 'ARE'],
    'WHOARE': ['WHO', 'ARE'],
    'CANNOTCANNOT': ['CANNOT'],
    'WILLNOT': ['WILL', 'NOT'],
    'DONOT': ['DO', 'NOT'],
    'IAMIAM': ['I', 'AM']
  };

  // Common words that get incorrectly merged
  private static commonWords = [
    'HELLO', 'GOOD', 'MORNING', 'EVENING', 'NIGHT', 'THANK', 'YOU', 'NAME', 'IS',
    'HOW', 'ARE', 'WHERE', 'WHAT', 'WHO', 'WHEN', 'WHY', 'CAN', 'WILL', 'NOT',
    'DO', 'HAVE', 'GET', 'GO', 'COME', 'SEE', 'HEAR', 'SPEAK', 'UNDERSTAND',
    'KNOW', 'LEARN', 'TEACH', 'HELP', 'WORK', 'PLAY', 'EAT', 'DRINK', 'SLEEP',
    'MY', 'YOUR', 'HIS', 'HER', 'OUR', 'THEIR', 'I', 'WE', 'THEY', 'HE', 'SHE'
  ];

  /**
   * Clean and process speech recognition text
   */
  static processRecognizedText(text: string): string[] {
    if (!text || typeof text !== 'string') return [];

    // Step 1: Convert to uppercase and remove extra whitespace
    let processed = text.toUpperCase().trim();

    // Step 2: Remove punctuation but keep spaces and hyphens
    processed = processed.replace(/[^\\w\\s-]/g, '');

    // Step 3: Handle merged words using pattern matching
    processed = this.splitMergedWords(processed);

    // Step 4: Split into words and filter empty strings
    let words = processed.split(/\s+/).filter(word => word.length > 0);

    // Step 5: Remove duplicate consecutive words
    words = this.removeDuplicateWords(words);

    // Step 6: Convert to lowercase for consistent matching
    words = words.map(word => word.toLowerCase());

    // Step 7: Filter out very short words (likely noise)
    words = words.filter(word => word.length > 1);

    return words;
  }

  /**
   * Split merged words using pattern recognition
   */
  private static splitMergedWords(text: string): string {
    let result = text;

    // First, check for exact pattern matches
    for (const [merged, split] of Object.entries(this.mergedWordPatterns)) {
      const regex = new RegExp(merged, 'gi');
      result = result.replace(regex, split.join(' '));
    }

    // Then, use intelligent word splitting for unrecognized patterns
    result = this.intelligentWordSplit(result);

    return result;
  }

  /**
   * Intelligent word splitting using common word patterns
   */
  private static intelligentWordSplit(text: string): string {
    const words = text.split(/\s+/);
    const splitWords: string[] = [];

    for (const word of words) {
      if (word.length <= 6) {
        // Short words are unlikely to be merged
        splitWords.push(word);
        continue;
      }

      // Try to find known words within the merged word
      const splits = this.findWordSplits(word);
      if (splits.length > 1) {
        splitWords.push(...splits);
      } else {
        splitWords.push(word);
      }
    }

    return splitWords.join(' ');
  }

  /**
   * Find potential word splits within a long word
   */
  private static findWordSplits(word: string): string[] {
    if (word.length <= 4) return [word];

    // Try to split the word by finding common words within it
    for (let i = 3; i <= word.length - 3; i++) {
      const firstPart = word.substring(0, i);
      const secondPart = word.substring(i);

      if (this.commonWords.includes(firstPart) && 
          (this.commonWords.includes(secondPart) || secondPart.length >= 3)) {
        
        // Found a valid split, recursively check the second part
        const secondPartSplits = this.findWordSplits(secondPart);
        return [firstPart, ...secondPartSplits];
      }
    }

    // No valid splits found
    return [word];
  }

  /**
   * Remove duplicate consecutive words
   */
  private static removeDuplicateWords(words: string[]): string[] {
    if (words.length === 0) return [];

    const result: string[] = [words[0]];
    
    for (let i = 1; i < words.length; i++) {
      if (words[i] !== words[i - 1]) {
        result.push(words[i]);
      }
    }

    return result;
  }

  /**
   * Validate if words match available sign videos
   */
  static validateWordsForSigning(words: string[]): { valid: string[], missing: string[] } {
    const signDictionary = [
      'hello', 'good', 'morning', 'evening', 'night', 'thank', 'you', 'name', 'is',
      'how', 'are', 'where', 'what', 'who', 'when', 'why', 'can', 'will', 'not',
      'do', 'have', 'get', 'go', 'come', 'see', 'hear', 'speak', 'understand',
      'know', 'learn', 'teach', 'help', 'work', 'play', 'eat', 'drink', 'sleep',
      'my', 'your', 'his', 'her', 'our', 'their', 'i', 'we', 'they', 'he', 'she',
      'mother', 'father', 'sister', 'brother', 'family', 'friend', 'love', 'like',
      'happy', 'sad', 'angry', 'excited', 'scared', 'surprised', 'tired',
      'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
      'home', 'school', 'hospital', 'water', 'food', 'book', 'car', 'phone'
    ];

    const valid: string[] = [];
    const missing: string[] = [];

    for (const word of words) {
      if (signDictionary.includes(word.toLowerCase())) {
        valid.push(word.toLowerCase());
      } else {
        missing.push(word.toLowerCase());
      }
    }

    return { valid, missing };
  }

  /**
   * Process text for sign language translation
   */
  static prepareForSigning(text: string): {
    originalText: string;
    processedWords: string[];
    availableWords: string[];
    missingWords: string[];
  } {
    const processedWords = this.processRecognizedText(text);
    const validation = this.validateWordsForSigning(processedWords);

    return {
      originalText: text,
      processedWords,
      availableWords: validation.valid,
      missingWords: validation.missing
    };
  }
}

export default SpeechProcessor;
