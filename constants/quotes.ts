export interface DailyQuote {
  text: string;
  author: string;
  category:
    | "consistency"
    | "discipline"
    | "identity"
    | "focus"
    | "resilience"
    | "showing-up";
}

export const DAILY_QUOTES: DailyQuote[] = [
  {
    text: "Every action you take is a vote for the type of person you wish to become.",
    author: "James Clear",
    category: "identity",
  },
  {
    text: "You do not rise to the level of your goals. You fall to the level of your systems.",
    author: "James Clear",
    category: "discipline",
  },
  {
    text: "Small habits don't add up — they compound into remarkable results.",
    author: "James Clear",
    category: "consistency",
  },
  {
    text: "The quality of your habits determines the quality of your life.",
    author: "James Clear",
    category: "discipline",
  },
  {
    text: "Showing up every single day is the most underrated form of excellence.",
    author: "",
    category: "showing-up",
  },
  {
    text: "You don't have to be perfect. You just have to be consistent.",
    author: "",
    category: "consistency",
  },
  {
    text: "The identity of a habit is more powerful than its outcome. Become the person first.",
    author: "James Clear",
    category: "identity",
  },
  {
    text: "Discipline is choosing between what you want now and what you want most.",
    author: "Abraham Lincoln",
    category: "discipline",
  },
  {
    text: "Success is the product of daily habits — not once-in-a-lifetime transformations.",
    author: "James Clear",
    category: "consistency",
  },
  {
    text: "Focus is a force multiplier. What you consistently attend to, grows.",
    author: "",
    category: "focus",
  },
  {
    text: "Fall seven times, stand up eight. Resilience is the habit behind all habits.",
    author: "Japanese Proverb",
    category: "resilience",
  },
  {
    text: "The secret to getting ahead is getting started — even when you don't feel like it.",
    author: "Mark Twain",
    category: "showing-up",
  },
  {
    text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    author: "Aristotle",
    category: "discipline",
  },
  {
    text: "Make the default easy. Friction is the enemy of consistency.",
    author: "James Clear",
    category: "consistency",
  },
  {
    text: "The most practical, beautiful, workable philosophy in the world is one that leads you to daily improvement.",
    author: "Og Mandino",
    category: "showing-up",
  },
  {
    text: "You are the average of the habits you practice most.",
    author: "",
    category: "identity",
  },
  {
    text: "It's not about motivation. It's about building a system you can trust on the hard days.",
    author: "",
    category: "discipline",
  },
  {
    text: "The chains of habit are too light to be felt until they are too heavy to be broken.",
    author: "Warren Buffett",
    category: "consistency",
  },
  {
    text: "Focus on the process, not the outcome. The result takes care of itself.",
    author: "",
    category: "focus",
  },
  {
    text: "Resilience is not about bouncing back. It's about growing through.",
    author: "",
    category: "resilience",
  },
  {
    text: "A 1% improvement every day leads to being 37x better by year's end.",
    author: "James Clear",
    category: "consistency",
  },
  {
    text: "The goal is not to run a marathon. The goal is to become a runner.",
    author: "James Clear",
    category: "identity",
  },
  {
    text: "Habits are the compound interest of self-improvement.",
    author: "James Clear",
    category: "consistency",
  },
  {
    text: "You don't need more motivation. You need a better environment.",
    author: "James Clear",
    category: "discipline",
  },
  {
    text: "Hard work beats talent when talent doesn't work hard — and habits make hard work effortless.",
    author: "",
    category: "discipline",
  },
  {
    text: "Every master was once a beginner. Every pro was once an amateur who just kept showing up.",
    author: "",
    category: "showing-up",
  },
  {
    text: "The present moment always will have been. Each good action is permanent.",
    author: "",
    category: "resilience",
  },
  {
    text: "Clear your mind of can't.",
    author: "Samuel Johnson",
    category: "focus",
  },
  {
    text: "Don't count the days. Make the days count.",
    author: "Muhammad Ali",
    category: "showing-up",
  },
  {
    text: "Motivation gets you started. Habit keeps you going.",
    author: "Jim Ryun",
    category: "consistency",
  },
  {
    text: "One day or day one. You decide.",
    author: "",
    category: "showing-up",
  },
  {
    text: "The pain of discipline is far less than the pain of regret.",
    author: "",
    category: "discipline",
  },
  {
    text: "Build systems, not goals. Systems are what you live in every day.",
    author: "",
    category: "discipline",
  },
  {
    text: "A tiny daily investment in yourself compounds into a life you're proud of.",
    author: "",
    category: "consistency",
  },
  {
    text: "Identity is the seed. Habits are the water. Character is what grows.",
    author: "",
    category: "identity",
  },
];

/** Returns the same quote for an entire calendar day, rotating across the collection. */
export function getDailyQuote(): DailyQuote {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor(
    (now.getTime() - startOfYear.getTime()) / 86_400_000
  );
  return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
}
