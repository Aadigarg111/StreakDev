export type DailyQuest = {
  id: string;
  description: string;
  target: number;
  currentProgress: number;
  completed: boolean;
  gemsReward: number;
};

export type DailyQuestsState = {
  date: string;
  quests: DailyQuest[];
};

type QuestTemplate = Omit<DailyQuest, "currentProgress" | "completed">;

const questPool: QuestTemplate[] = [
  {
    id: "earn_20_xp",
    description: "Earn 20 XP",
    target: 20,
    gemsReward: 8,
  },
  {
    id: "complete_2_lessons",
    description: "Complete 2 lessons",
    target: 2,
    gemsReward: 10,
  },
  {
    id: "perfect_lesson",
    description: "Complete a perfect lesson",
    target: 1,
    gemsReward: 12,
  },
  {
    id: "five_in_a_row",
    description: "Get 5 correct in a row",
    target: 5,
    gemsReward: 10,
  },
];

export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function generateDailyQuests(date = getLocalDateKey()): DailyQuestsState {
  const dayNumber = Number(date.replaceAll("-", ""));
  const start = dayNumber % questPool.length;
  const selected = Array.from({ length: 3 }, (_, index) => questPool[(start + index) % questPool.length]);

  return {
    date,
    quests: selected.map((quest) => ({
      ...quest,
      currentProgress: 0,
      completed: false,
    })),
  };
}

export function ensureTodaysQuests(current?: DailyQuestsState | null) {
  const today = getLocalDateKey();

  if (!current || current.date !== today) {
    return generateDailyQuests(today);
  }

  return current;
}

export function updateQuestProgress(
  dailyQuests: DailyQuestsState,
  lesson: {
    xpEarned: number;
    perfect: boolean;
    longestCorrectStreak: number;
  },
) {
  let gemsAwarded = 0;
  const completedQuests: DailyQuest[] = [];

  const quests = dailyQuests.quests.map((quest) => {
    if (quest.completed) {
      return quest;
    }

    let progressIncrement = 0;

    if (quest.id === "earn_20_xp") {
      progressIncrement = lesson.xpEarned;
    } else if (quest.id === "complete_2_lessons") {
      progressIncrement = 1;
    } else if (quest.id === "perfect_lesson" && lesson.perfect) {
      progressIncrement = 1;
    } else if (quest.id === "five_in_a_row") {
      progressIncrement = Math.max(0, lesson.longestCorrectStreak);
    }

    const currentProgress = Math.min(quest.target, quest.currentProgress + progressIncrement);
    const completed = currentProgress >= quest.target;
    const nextQuest = { ...quest, currentProgress, completed };

    if (completed && !quest.completed) {
      gemsAwarded += quest.gemsReward;
      completedQuests.push(nextQuest);
    }

    return nextQuest;
  });

  return {
    dailyQuests: { ...dailyQuests, quests },
    completedQuests,
    gemsAwarded,
  };
}
