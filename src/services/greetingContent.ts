export interface GreetingContentInput {
  name: string;
  sender: string;
  occasion: string;
  message?: string;
}

export interface GreetingContent {
  heading: string;
  message: string;
  closing: string;
}

export function buildGreetingContent({
  name,
  sender,
  occasion,
  message = '',
}: GreetingContentInput): GreetingContent {
  const occ = occasion.trim().toLowerCase();
  const receiver = name || 'Friend';
  const from = sender || 'Naresh';

  if (occ.includes('birthday')) {
    return {
      heading: `Happy Birthday ${receiver}`,
      message:
        message ||
        'May God bless you with joy, good health, and great success in all that you do.',
      closing: `Warm wishes from ${from}`,
    };
  }
  if (occ.includes('promotion')) {
    return {
      heading: 'Congratulations on Your Promotion',
      message:
        message ||
        'Your dedication, hard work, and talent have truly paid off. Wishing you continued growth and success in your new role.',
      closing: `Best wishes from ${from}`,
    };
  }
  if (occ.includes('festival')) {
    return {
      heading: 'Warm Festival Wishes',
      message:
        message ||
        'May this festive season fill your life with happiness, peace, and prosperity.',
      closing: `With warm regards from ${from}`,
    };
  }
  if (occ.includes('newyear') || occ.includes('new year')) {
    return {
      heading: 'Happy New Year 2026',
      message:
        message ||
        'May the new year bring new opportunities, good health, happiness, and success in every step of your journey.',
      closing: `Best wishes from ${from}`,
    };
  }
  if (occ.includes('christmas')) {
    return {
      heading: 'Merry Christmas',
      message:
        message ||
        'May this Christmas bring you joy, peace, love, and beautiful moments with your loved ones.',
      closing: `Warm wishes from ${from}`,
    };
  }
  if (occ.includes('anniversary')) {
    return {
      heading: 'Happy Anniversary',
      message:
        message ||
        'Wishing you both a lifetime of love, understanding, and beautiful memories together.',
      closing: `Warm wishes from ${from}`,
    };
  }
  if (occ.includes('congratulations') || occ.includes('congrats')) {
    return {
      heading: 'Congratulations',
      message:
        message ||
        'Your achievement is a result of your dedication and perseverance. Wishing you continued success ahead.',
      closing: `Best wishes from ${from}`,
    };
  }

  return {
    heading: `Greetings, ${receiver}`,
    message: message || 'Warm wishes to you.',
    closing: `Best wishes from ${from}`,
  };
}

export function buildGreetingPrompt(input: GreetingContentInput): string {
  const { heading, message, closing } = buildGreetingContent(input);
  const occ = input.occasion.trim().toLowerCase() || 'a special occasion';

  return (
    `Add elegant greeting text for ${occ} to the existing image without altering the background or layout. ` +
    `Main heading text: “${heading}” — styled in a classy, celebratory font with a refined and modern look. ` +
    `Subtext message: “${message}” ` +
    `Closing line: “${closing}” — placed neatly below the message in a subtle yet readable font. ` +
    `Ensure the text is well-aligned, visually balanced, and blends naturally with the image. ` +
    `Maintain high readability, professional spacing, and do not modify or replace the original background.`
  );
}
