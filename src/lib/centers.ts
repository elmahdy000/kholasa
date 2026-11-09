import { SchoolCategory } from "@prisma/client";

export interface EducationalCenter {
  id: string;
  name: string;
  category: SchoolCategory;
  categoryLabel: string;
  badge: string;
  description: string;
}

/**
 * The authorized educational centers for El Kholasa Platform
 * Grouped strictly into Languages and Arabic curricula.
 */
export const AUTHORIZED_CENTERS: EducationalCenter[] = [
  // 1. سناتر مدارس اللغات (Languages Centers)
  {
    id: "center-eduverse",
    name: "سنتر إديوفيرس لغات",
    category: SchoolCategory.LANGUAGES,
    categoryLabel: "مدارس اللغات (Languages)",
    badge: "لغات 🇬🇧",
    description: "الفرع المعتمد لطلاب مدارس اللغات والتجريبي والمتميز",
  },
  {
    id: "center-elmagd",
    name: "سنتر المجد لغات",
    category: SchoolCategory.LANGUAGES,
    categoryLabel: "مدارس اللغات (Languages)",
    badge: "لغات 🇬🇧",
    description: "الفرع المعتمد لطلاب مدارس اللغات والتجريبي والمتميز",
  },
  {
    id: "center-elhenawy",
    name: "سنتر الحناوي لغات",
    category: SchoolCategory.LANGUAGES,
    categoryLabel: "مدارس اللغات (Languages)",
    badge: "لغات 🇬🇧",
    description: "الفرع المعتمد لطلاب مدارس اللغات والتجريبي والمتميز",
  },

  // 2. سناتر المدارس العامة (Arabic Centers)
  {
    id: "center-rafal",
    name: "سنتر رافال عربي",
    category: SchoolCategory.ARABIC,
    categoryLabel: "المدارس العامة (عربي)",
    badge: "عربي 🇪🇬",
    description: "الفرع المعتمد لطلاب المدارس العامة واللغات المشتركة",
  },
  {
    id: "center-zaj",
    name: "سنتر زاج عربي",
    category: SchoolCategory.ARABIC,
    categoryLabel: "المدارس العامة (عربي)",
    badge: "عربي 🇪🇬",
    description: "الفرع المعتمد لطلاب المدارس العامة واللغات المشتركة",
  },
  {
    id: "center-future",
    name: "سنتر فيوتشر عربي",
    category: SchoolCategory.ARABIC,
    categoryLabel: "المدارس العامة (عربي)",
    badge: "عربي 🇪🇬",
    description: "الفرع المعتمد لطلاب المدارس العامة واللغات المشتركة",
  },
  {
    id: "center-elqanayat",
    name: "سنتر القنايات عربي",
    category: SchoolCategory.ARABIC,
    categoryLabel: "المدارس العامة (عربي)",
    badge: "عربي 🇪🇬",
    description: "الفرع المعتمد لطلاب المدارس العامة بالقنايات والمناطق المجاورة",
  },
];

export const OTHER_CENTER_NAME = "سنتر آخر (أدخل اسم السنتر يدويًا)";

export const LANGUAGES_CENTERS = AUTHORIZED_CENTERS.filter(
  (c) => c.category === SchoolCategory.LANGUAGES
);

export const ARABIC_CENTERS = AUTHORIZED_CENTERS.filter(
  (c) => c.category === SchoolCategory.ARABIC
);

export const ALL_CENTER_NAMES = [
  ...AUTHORIZED_CENTERS.map((c) => c.name),
  OTHER_CENTER_NAME,
];

export function getCentersForCategory(category?: SchoolCategory | null): EducationalCenter[] {
  if (category === SchoolCategory.LANGUAGES) {
    return LANGUAGES_CENTERS;
  }
  if (category === SchoolCategory.ARABIC) {
    return ARABIC_CENTERS;
  }
  return AUTHORIZED_CENTERS;
}

