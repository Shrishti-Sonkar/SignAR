// Sign language video dictionary for ISL
export interface SignClip {
  gloss: string;
  src: string;
}

// Files in frontend/public/ are served from the site root by Vite,
// so "public/sign/X.mp4" must be referenced as "/sign/X.mp4".
const sign = (file: string) => ({ src: `/sign/${file}` });

// Main sign dictionary mapping lowercase glosses to video files.
export const signDictionary: Record<string, { src: string }> = {
  '0': sign('0.mp4'),
  '1': sign('1.mp4'),
  '2': sign('2.mp4'),
  '3': sign('3.mp4'),
  '4': sign('4.mp4'),
  '5': sign('5.mp4'),
  '6': sign('6.mp4'),
  '7': sign('7.mp4'),
  '8': sign('8.mp4'),
  '9': sign('9.mp4'),
  a: sign('A.mp4'),
  after: sign('After.mp4'),
  again: sign('Again.mp4'),
  against: sign('Against.mp4'),
  age: sign('Age.mp4'),
  all: sign('All.mp4'),
  alone: sign('Alone.mp4'),
  also: sign('Also.mp4'),
  and: sign('And.mp4'),
  ask: sign('Ask.mp4'),
  at: sign('At.mp4'),
  b: sign('B.mp4'),
  be: sign('Be.mp4'),
  beautiful: sign('Beautiful.mp4'),
  before: sign('Before.mp4'),
  best: sign('Best.mp4'),
  better: sign('Better.mp4'),
  busy: sign('Busy.mp4'),
  but: sign('But.mp4'),
  bye: sign('Bye.mp4'),
  c: sign('C.mp4'),
  can: sign('Can.mp4'),
  cannot: sign('Cannot.mp4'),
  change: sign('Change.mp4'),
  college: sign('College.mp4'),
  come: sign('Come.mp4'),
  computer: sign('Computer.mp4'),
  d: sign('D.mp4'),
  day: sign('Day.mp4'),
  distance: sign('Distance.mp4'),
  'do not': sign('Do Not.mp4'),
  do: sign('Do.mp4'),
  "don't": sign('Do Not.mp4'),
  'does not': sign('Does Not.mp4'),
  "doesn't": sign('Does Not.mp4'),
  e: sign('E.mp4'),
  eat: sign('Eat.mp4'),
  engineer: sign('Engineer.mp4'),
  f: sign('F.mp4'),
  fight: sign('Fight.mp4'),
  finish: sign('Finish.mp4'),
  from: sign('From.mp4'),
  g: sign('G.mp4'),
  glitter: sign('Glitter.mp4'),
  go: sign('Go.mp4'),
  god: sign('God.mp4'),
  gold: sign('Gold.mp4'),
  good: sign('Good.mp4'),
  great: sign('Great.mp4'),
  h: sign('H.mp4'),
  hand: sign('Hand.mp4'),
  hands: sign('Hands.mp4'),
  happy: sign('Happy.mp4'),
  hello: sign('Hello.mp4'),
  help: sign('Help.mp4'),
  her: sign('Her.mp4'),
  here: sign('Here.mp4'),
  his: sign('His.mp4'),
  home: sign('Home.mp4'),
  homepage: sign('Homepage.mp4'),
  how: sign('How.mp4'),
  i: sign('I.mp4'),
  invent: sign('Invent.mp4'),
  it: sign('It.mp4'),
  j: sign('J.mp4'),
  k: sign('K.mp4'),
  keep: sign('Keep.mp4'),
  l: sign('L.mp4'),
  language: sign('Language.mp4'),
  laugh: sign('Laugh.mp4'),
  learn: sign('Learn.mp4'),
  m: sign('M.mp4'),
  me: sign('ME.mp4'),
  more: sign('More.mp4'),
  my: sign('My.mp4'),
  n: sign('N.mp4'),
  name: sign('Name.mp4'),
  next: sign('Next.mp4'),
  not: sign('Not.mp4'),
  now: sign('Now.mp4'),
  o: sign('O.mp4'),
  of: sign('Of.mp4'),
  on: sign('On.mp4'),
  our: sign('Our.mp4'),
  out: sign('Out.mp4'),
  p: sign('P.mp4'),
  pretty: sign('Pretty.mp4'),
  q: sign('Q.mp4'),
  r: sign('R.mp4'),
  right: sign('Right.mp4'),
  s: sign('S.mp4'),
  sad: sign('Sad.mp4'),
  safe: sign('Safe.mp4'),
  see: sign('See.mp4'),
  self: sign('Self.mp4'),
  sign: sign('Sign.mp4'),
  sing: sign('Sing.mp4'),
  so: sign('So.mp4'),
  sound: sign('Sound.mp4'),
  stay: sign('Stay.mp4'),
  study: sign('Study.mp4'),
  t: sign('T.mp4'),
  talk: sign('Talk.mp4'),
  television: sign('Television.mp4'),
  tv: sign('Television.mp4'),
  'thank you': sign('Thank You.mp4'),
  thank: sign('Thank.mp4'),
  thanks: sign('Thank You.mp4'),
  that: sign('That.mp4'),
  they: sign('They.mp4'),
  this: sign('This.mp4'),
  those: sign('Those.mp4'),
  time: sign('Time.mp4'),
  to: sign('To.mp4'),
  type: sign('Type.mp4'),
  u: sign('U.mp4'),
  us: sign('Us.mp4'),
  v: sign('V.mp4'),
  w: sign('W.mp4'),
  walk: sign('Walk.mp4'),
  wash: sign('Wash.mp4'),
  way: sign('Way.mp4'),
  we: sign('We.mp4'),
  welcome: sign('Welcome.mp4'),
  what: sign('What.mp4'),
  when: sign('When.mp4'),
  where: sign('Where.mp4'),
  which: sign('Which.mp4'),
  who: sign('Who.mp4'),
  whole: sign('Whole.mp4'),
  whose: sign('Whose.mp4'),
  why: sign('Why.mp4'),
  will: sign('Will.mp4'),
  with: sign('With.mp4'),
  without: sign('Without.mp4'),
  words: sign('Words.mp4'),
  word: sign('Words.mp4'),
  work: sign('Work.mp4'),
  world: sign('World.mp4'),
  wrong: sign('Wrong.mp4'),
  x: sign('X.mp4'),
  y: sign('Y.mp4'),
  you: sign('You.mp4'),
  your: sign('Your.mp4'),
  yourself: sign('Yourself.mp4'),
  z: sign('Z.mp4'),
};

/**
 * Normalize a raw token (from typed text, speech, or LLM glosses like
 * "THANK-YOU") to a dictionary key.
 */
function normalizeToken(token: string): string {
  return token
    .toLowerCase()
    .replace(/-/g, ' ')          // THANK-YOU -> thank you
    .replace(/[^a-z0-9' ]/g, '') // strip punctuation
    .trim();
}

/**
 * Resolve a single word to sign clips.
 * If the word has a dedicated video it returns one clip. Words without a
 * video are skipped by default; pass fingerspell=true to spell them
 * letter-by-letter with the A–Z / 0–9 clips instead (useful for names).
 */
export function getClipsForWord(word: string, fingerspell = false): SignClip[] {
  const key = normalizeToken(word);
  if (!key) return [];

  const direct = signDictionary[key];
  if (direct) return [{ gloss: key, src: direct.src }];

  if (!fingerspell) return [];

  return key
    .replace(/[^a-z0-9]/g, '')
    .split('')
    .map(ch => ({ gloss: ch, src: signDictionary[ch]?.src || '' }))
    .filter(clip => clip.src);
}

/** Build the full clip sequence for a sentence (word-level videos only). */
export function getSignClipsForSentence(text: string, fingerspell = false): SignClip[] {
  if (!text) return [];
  return text
    .split(/\s+/)
    .flatMap(word => getClipsForWord(word, fingerspell));
}

export default signDictionary;
