export const SUBGENRES = [
  "Early Synthwave",
  "Outrun",
  "Cyberpunk",
  "Horror Synth Revival",
  "Darksynth",
  "Dreamwave",
  "Retrowave",
  "Vocal Synthwave",
  "Spacewave",
  "Sweatwave",
  "Sexwave",
  "Shredwave",
  "R.E.D.M.",
  "Chipwave",
  "Freshwave / Retro R&B",
  "Yuppiewave",
  "Saxwave",
] as const;

export const MOODS = [
  "Nostalgia",
  "Romance",
  "Euphoria",
  "Dreaminess",
  "Optimism",
  "Melancholy",
  "Loneliness",
  "Contemplation",
  "Cinematic",
  "Tension",
  "Anxiety",
  "Aggression",
  "Gloom",
  "Paranoia",
  "Coldness",
  "Excitement",
  "Sensuality",
  "Vigor",
] as const;

export const VECTORS = ["Bright", "Neutral", "Dark"] as const;

export const KEYS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

export const MODES = [
  "Major",
  "Natural Minor",
  "Harmonic Minor",
  "Phrygian",
  "Dorian",
  "Lydian",
  "Other",
] as const;

// ---- Dynamic questionnaire ----

export type QuestionType = "scale" | "choice2" | "choice3" | "choice4" | "yesno";

export interface DynamicQuestion {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  /** Tags used for deduplication (semantic overlap detection) */
  deduplicationTags: string[];
}

// Subgenre questions
export const SUBGENRE_QUESTIONS: Record<string, DynamicQuestion[]> = {
  "Early Synthwave": [
    {
      id: "early_french",
      text: "How prominent is the 'French' electro base?",
      type: "scale",
      deduplicationTags: ["french_electro"],
    },
    {
      id: "early_form",
      text: "Is the track closer to instrumental or pop format?",
      type: "choice2",
      options: ["Instrumental", "Pop format"],
      deduplicationTags: ["instrumental_vs_pop"],
    },
  ],
  "Outrun": [
    {
      id: "outrun_speed",
      text: "How strong is the feeling of speed and motion?",
      type: "scale",
      deduplicationTags: ["speed", "energy"],
    },
    {
      id: "outrun_time",
      text: "Atmosphere: day or night?",
      type: "choice2",
      options: ["Day", "Night"],
      deduplicationTags: ["day_night"],
    },
  ],
  "Cyberpunk": [
    {
      id: "cyber_dystopia",
      text: "How prominent is the dystopian atmosphere?",
      type: "scale",
      deduplicationTags: ["dystopia", "darkness"],
    },
    {
      id: "cyber_character",
      text: "Character: cold mechanics or emotional chaos?",
      type: "choice2",
      options: ["Cold mechanics", "Emotional chaos"],
      deduplicationTags: ["cold_vs_emotional"],
    },
  ],
  "Horror Synth Revival": [
    {
      id: "horror_suspense",
      text: "How strong is the suspense and dread?",
      type: "scale",
      deduplicationTags: ["suspense", "horror", "darkness"],
    },
    {
      id: "horror_type",
      text: "Horror type?",
      type: "choice3",
      options: ["Slasher", "Suspense", "Paranoia"],
      deduplicationTags: ["horror_type", "paranoia"],
    },
    {
      id: "horror_narrative",
      text: "Is there a narrative buildup to a climax?",
      type: "yesno",
      deduplicationTags: ["narrative_buildup"],
    },
  ],
  "Darksynth": [
    {
      id: "dark_aggression",
      text: "How strong is the aggression?",
      type: "scale",
      deduplicationTags: ["aggression"],
    },
    {
      id: "dark_aggression_type",
      text: "Is the aggression cold or hot?",
      type: "choice2",
      options: ["Cold", "Hot"],
      deduplicationTags: ["aggression_type"],
    },
    {
      id: "dark_metal",
      text: "Are there metal elements (guitar, distortion)?",
      type: "yesno",
      deduplicationTags: ["metal_elements", "guitar"],
    },
  ],
  "Dreamwave": [
    {
      id: "dream_dreaminess",
      text: "How strong is the dreaminess?",
      type: "scale",
      deduplicationTags: ["dreaminess"],
    },
    {
      id: "dream_character",
      text: "Does the track lean towards melancholy or romance?",
      type: "choice2",
      options: ["Melancholy", "Romance"],
      deduplicationTags: ["melancholy", "romance"],
    },
  ],
  "Retrowave": [
    {
      id: "retro_80s",
      text: "How strong is the 80s aesthetic reference?",
      type: "scale",
      deduplicationTags: ["80s_aesthetics"],
    },
    {
      id: "retro_time",
      text: "Atmosphere: day or night?",
      type: "choice2",
      options: ["Day", "Night"],
      deduplicationTags: ["day_night"],
    },
  ],
  "Vocal Synthwave": [
    {
      id: "vocal_dominance",
      text: "How much does the vocal dominate the instrumental?",
      type: "scale",
      deduplicationTags: ["vocal_dominance"],
    },
    {
      id: "vocal_type",
      text: "Vocal purpose: meaning/lyrical or instrumental?",
      type: "choice2",
      options: ["Lyrical", "Instrumental"],
      deduplicationTags: ["vocal_type"],
    },
  ],
  "Spacewave": [
    {
      id: "space_scale",
      text: "How prominent is the cosmic scale?",
      type: "scale",
      deduplicationTags: ["cosmic_scale"],
    },
    {
      id: "space_size",
      text: "Sound scale: intimate or epic?",
      type: "choice2",
      options: ["Intimate", "Epic"],
      deduplicationTags: ["scale_size"],
    },
  ],
  "Sweatwave": [
    {
      id: "sweat_energy",
      text: "How strong is the energy and vigor?",
      type: "scale",
      deduplicationTags: ["energy", "vigor"],
    },
    {
      id: "sweat_dynamics",
      text: "Energy dynamics: stable or building up?",
      type: "choice2",
      options: ["Stable", "Building up"],
      deduplicationTags: ["energy_dynamics"],
    },
  ],
  "Sexwave": [
    {
      id: "sex_sensuality",
      text: "How strong is the sensuality?",
      type: "scale",
      deduplicationTags: ["sensuality"],
    },
    {
      id: "sex_type",
      text: "Sensuality character: languid or intense?",
      type: "choice2",
      options: ["Languid", "Intense"],
      deduplicationTags: ["sensuality_type"],
    },
  ],
  "Shredwave": [
    {
      id: "shred_guitar",
      text: "How prominent is the guitar?",
      type: "scale",
      deduplicationTags: ["guitar"],
    },
    {
      id: "shred_role",
      text: "Guitar role: soloing or rhythm?",
      type: "choice2",
      options: ["Soloing", "Rhythm"],
      deduplicationTags: ["guitar_role"],
    },
  ],
  "R.E.D.M.": [
    {
      id: "redm_edm",
      text: "How prominent is the EDM influence?",
      type: "scale",
      deduplicationTags: ["edm_influence"],
    },
    {
      id: "redm_type",
      text: "Which EDM direction is heard?",
      type: "choice4",
      options: ["House", "Electro", "Techno", "Other"],
      deduplicationTags: ["edm_type"],
    },
  ],
  "Chipwave": [
    {
      id: "chip_8bit",
      text: "How strong is the 8-bit sound?",
      type: "scale",
      deduplicationTags: ["8bit_sound"],
    },
    {
      id: "chip_role",
      text: "Chiptune role: dominant or background?",
      type: "choice2",
      options: ["Dominant", "Background"],
      deduplicationTags: ["chiptune_role"],
    },
  ],
  "Freshwave / Retro R&B": [
    {
      id: "fresh_rnb",
      text: "How prominent is the R&B / Funk influence?",
      type: "scale",
      deduplicationTags: ["rnb_funk"],
    },
    {
      id: "fresh_dominance",
      text: "What dominates: rhythm or melody?",
      type: "choice2",
      options: ["Rhythm", "Melody"],
      deduplicationTags: ["rhythm_vs_melody"],
    },
  ],
  "Yuppiewave": [
    {
      id: "yuppie_gloss",
      text: "How strong is the 80s 'business gloss'?",
      type: "scale",
      deduplicationTags: ["80s_gloss"],
    },
    {
      id: "yuppie_mood",
      text: "Mood: triumph or success tension?",
      type: "choice2",
      options: ["Triumph", "Success tension"],
      deduplicationTags: ["triumph_vs_tension"],
    },
  ],
  "Saxwave": [
    {
      id: "sax_intensity",
      text: "How prominent is the saxophone?",
      type: "scale",
      deduplicationTags: ["saxophone"],
    },
    {
      id: "sax_role",
      text: "Saxophone role: soloing or accompaniment?",
      type: "choice2",
      options: ["Soloing", "Accompaniment"],
      deduplicationTags: ["saxophone_role"],
    },
  ],
};

// Mood questions
export const MOOD_QUESTIONS: Record<string, DynamicQuestion[]> = {
  "Nostalgia": [
    {
      id: "nostalgia_intensity",
      text: "How strong is the nostalgia?",
      type: "scale",
      deduplicationTags: ["nostalgia"],
    },
    {
      id: "nostalgia_target",
      text: "What does it refer to?",
      type: "choice4",
      options: ["Childhood", "Youth", "Place", "Era"],
      deduplicationTags: ["nostalgia_target"],
    },
  ],
  "Romance": [
    {
      id: "romance_intensity",
      text: "How strong is the romance?",
      type: "scale",
      deduplicationTags: ["romance"],
    },
    {
      id: "romance_character",
      text: "Romance character?",
      type: "choice3",
      options: ["Solitary", "Dialogue", "Lost"],
      deduplicationTags: ["romance_type"],
    },
  ],
  "Euphoria": [
    {
      id: "euphoria_intensity",
      text: "How prominent is the euphoria?",
      type: "scale",
      deduplicationTags: ["euphoria"],
    },
    {
      id: "euphoria_dynamics",
      text: "Is euphoria building up or stable?",
      type: "choice2",
      options: ["Building up", "Stable"],
      deduplicationTags: ["euphoria_dynamics"],
    },
  ],
  "Dreaminess": [
    {
      id: "dream_mood_intensity",
      text: "How prominent is the dreaminess?",
      type: "scale",
      deduplicationTags: ["dreaminess"],
    },
    {
      id: "dream_mood_character",
      text: "Dream character: bright or tinged with sadness?",
      type: "choice2",
      options: ["Bright", "Tinged with sadness"],
      deduplicationTags: ["dreaminess_character"],
    },
  ],
  "Optimism": [
    {
      id: "optimism_intensity",
      text: "How prominent is the optimism?",
      type: "scale",
      deduplicationTags: ["optimism"],
    },
  ],
  "Melancholy": [
    {
      id: "melancholy_intensity",
      text: "How prominent is the melancholy?",
      type: "scale",
      deduplicationTags: ["melancholy"],
    },
    {
      id: "melancholy_hope",
      text: "Is there a moment of hope inside the track?",
      type: "yesno",
      deduplicationTags: ["melancholy_hope"],
    },
  ],
  "Loneliness": [
    {
      id: "loneliness_intensity",
      text: "How prominent is the loneliness?",
      type: "scale",
      deduplicationTags: ["loneliness"],
    },
    {
      id: "loneliness_character",
      text: "Character: contemplative or oppressive?",
      type: "choice2",
      options: ["Contemplative", "Oppressive"],
      deduplicationTags: ["loneliness_character"],
    },
  ],
  "Contemplation": [
    {
      id: "contemplation_intensity",
      text: "How prominent is the contemplation?",
      type: "scale",
      deduplicationTags: ["contemplation"],
    },
  ],
  "Cinematic": [
    {
      id: "cinematic_intensity",
      text: "How prominent is the cinematic feel?",
      type: "scale",
      deduplicationTags: ["cinematic"],
    },
    {
      id: "cinematic_genre",
      text: "Genre of the image?",
      type: "choice4",
      options: ["Action", "Thriller", "Melodrama", "Sci-fi"],
      deduplicationTags: ["cinematic_genre"],
    },
  ],
  "Tension": [
    {
      id: "tension_intensity",
      text: "How prominent is the tension?",
      type: "scale",
      deduplicationTags: ["tension", "suspense"],
    },
    {
      id: "tension_resolution",
      text: "Does resolution occur or does it stay suspended?",
      type: "choice2",
      options: ["Resolution occurs", "Stays suspended"],
      deduplicationTags: ["tension_resolution"],
    },
  ],
  "Anxiety": [
    {
      id: "anxiety_intensity",
      text: "How prominent is the anxiety?",
      type: "scale",
      deduplicationTags: ["anxiety"],
    },
    {
      id: "anxiety_source",
      text: "Source of anxiety: external or internal?",
      type: "choice2",
      options: ["External", "Internal"],
      deduplicationTags: ["anxiety_source"],
    },
  ],
  "Aggression": [
    {
      id: "aggression_mood_intensity",
      text: "How prominent is the aggression?",
      type: "scale",
      deduplicationTags: ["aggression"],
    },
    {
      id: "aggression_mood_type",
      text: "Aggression: cold or hot?",
      type: "choice2",
      options: ["Cold", "Hot"],
      deduplicationTags: ["aggression_type"],
    },
  ],
  "Gloom": [
    {
      id: "gloom_intensity",
      text: "How prominent is the gloom?",
      type: "scale",
      deduplicationTags: ["gloom", "darkness"],
    },
    {
      id: "gloom_character",
      text: "Character: cold or oppressive?",
      type: "choice2",
      options: ["Cold", "Oppressive"],
      deduplicationTags: ["gloom_character"],
    },
  ],
  "Paranoia": [
    {
      id: "paranoia_intensity",
      text: "How prominent is the paranoia?",
      type: "scale",
      deduplicationTags: ["paranoia"],
    },
    {
      id: "paranoia_dynamics",
      text: "Dynamics: building up to the end or stable?",
      type: "choice2",
      options: ["Building up", "Stable"],
      deduplicationTags: ["paranoia_dynamics"],
    },
  ],
  "Coldness": [
    {
      id: "coldness_intensity",
      text: "How prominent is the coldness?",
      type: "scale",
      deduplicationTags: ["coldness"],
    },
  ],
  "Excitement": [
    {
      id: "excitement_intensity",
      text: "How prominent is the excitement?",
      type: "scale",
      deduplicationTags: ["excitement"],
    },
    {
      id: "excitement_dynamics",
      text: "Excitement: building up or stable?",
      type: "choice2",
      options: ["Building up", "Stable"],
      deduplicationTags: ["excitement_dynamics"],
    },
  ],
  "Sensuality": [
    {
      id: "sensuality_mood_intensity",
      text: "How prominent is the sensuality?",
      type: "scale",
      deduplicationTags: ["sensuality"],
    },
    {
      id: "sensuality_mood_type",
      text: "Character: languid or intense?",
      type: "choice2",
      options: ["Languid", "Intense"],
      deduplicationTags: ["sensuality_type"],
    },
  ],
  "Vigor": [
    {
      id: "vigor_intensity",
      text: "How prominent is the vigor / energy?",
      type: "scale",
      deduplicationTags: ["vigor", "energy"],
    },
    {
      id: "vigor_dynamics",
      text: "Dynamics: building up or stable?",
      type: "choice2",
      options: ["Building up", "Stable"],
      deduplicationTags: ["vigor_dynamics"],
    },
  ],
};

/**
 * Get deduplicated questions for given subgenre and moods.
 * If a subgenre question and a mood question share a deduplication tag,
 * only the subgenre version is shown (as it's more specific).
 */
export function getDynamicQuestions(
  mainSubgenre: string,
  mainMood: string,
  secondaryMoods: string[]
): DynamicQuestion[] {
  const subgenreQs = SUBGENRE_QUESTIONS[mainSubgenre] || [];
  
  // Gather all mood questions
  const allMoods = [mainMood, ...secondaryMoods];
  const moodQs: DynamicQuestion[] = [];
  const seenMoodIds = new Set<string>();
  
  for (const mood of allMoods) {
    const qs = MOOD_QUESTIONS[mood] || [];
    for (const q of qs) {
      if (!seenMoodIds.has(q.id)) {
        seenMoodIds.add(q.id);
        moodQs.push(q);
      }
    }
  }

  // Collect all dedup tags from subgenre questions
  const subgenreTags = new Set<string>();
  for (const q of subgenreQs) {
    for (const tag of q.deduplicationTags) {
      subgenreTags.add(tag);
    }
  }

  // Filter mood questions: remove those whose tags overlap with subgenre tags
  const filteredMoodQs = moodQs.filter((mq) => {
    return !mq.deduplicationTags.some((tag) => subgenreTags.has(tag));
  });

  return [...subgenreQs, ...filteredMoodQs];
}
