const NUM_WORDS = [
  "twelve",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
];

function minWord(m: number): string {
  const small = [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
    "twenty",
    "twenty-one",
    "twenty-two",
    "twenty-three",
    "twenty-four",
    "twenty-five",
    "twenty-six",
    "twenty-seven",
    "twenty-eight",
    "twenty-nine",
  ];
  if (m <= 29) return small[m] + (m === 1 ? " minute" : " minutes");
  return m + " minutes";
}

export function timeInWords(h: number, m: number): string {
  const hw = NUM_WORDS[h];
  const nextH = NUM_WORDS[(h % 12) + 1];
  if (m === 0) return hw + " o'clock";
  if (m === 15) return "quarter past " + hw;
  if (m === 30) return "half past " + hw;
  if (m === 45) return "quarter to " + nextH;
  if (m < 30) return minWord(m) + " past " + hw;
  return minWord(60 - m) + " to " + nextH;
}

export function fmtTime(h: number, m: number): string {
  return h + ":" + String(m).padStart(2, "0");
}
