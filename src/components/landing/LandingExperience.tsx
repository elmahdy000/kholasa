"use client";

import { useRef, useState } from "react";
import type {
  LandingContinueItem,
  LandingCurriculumPayload,
  LandingGradeItem,
} from "@/components/landing/types";
import {
  saveStudyPreferencesClient,
  type StudySchoolCategory,
} from "@/lib/study-preferences";
import { HeroSection } from "@/components/landing/HeroSection";
import { SubjectsShowcase } from "@/components/landing/SubjectsShowcase";
import { ContinueStudyingSection } from "@/components/landing/ContinueStudyingSection";
import { QuickQuestionPreview } from "@/components/landing/QuickQuestionPreview";
import { FeaturesBento } from "@/components/landing/FeaturesBento";
import { FinalCTA } from "@/components/landing/FinalCTA";

interface LandingExperienceProps {
  curriculum: LandingCurriculumPayload;
  initialGradeId: string | null;
  initialCategory: StudySchoolCategory | null;
  continueItems: LandingContinueItem[];
  loggedInUser: {
    name: string;
    role: string;
  } | null;
}

export function LandingExperience({
  curriculum,
  initialGradeId,
  initialCategory,
  continueItems,
  loggedInUser,
}: LandingExperienceProps) {
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(initialGradeId);
  const [selectedCategory, setSelectedCategory] = useState<StudySchoolCategory | null>(
    initialCategory
  );
  const prefsRef = useRef<{
    gradeId: string | null;
    schoolCategory: StudySchoolCategory | null;
  }>({
    gradeId: initialGradeId,
    schoolCategory: initialCategory,
  });

  const persistChoice = (nextGradeId: string | null, nextCategory: StudySchoolCategory | null) => {
    const matchedGrade = curriculum.grades.find((g) => g.id === nextGradeId) || null;
    saveStudyPreferencesClient(
      {
        gradeId: matchedGrade?.id ?? null,
        gradeCode: matchedGrade?.code ?? null,
        schoolCategory: nextCategory,
      },
      { syncUrl: true }
    );
  };

  const handleSelectGrade = (grade: LandingGradeItem) => {
    prefsRef.current = { ...prefsRef.current, gradeId: grade.id };
    setSelectedGradeId(grade.id);
    persistChoice(grade.id, prefsRef.current.schoolCategory);
  };

  const handleSelectCategory = (cat: StudySchoolCategory) => {
    prefsRef.current = { ...prefsRef.current, schoolCategory: cat };
    setSelectedCategory(cat);
    persistChoice(prefsRef.current.gradeId, cat);
  };

  const handleShowSubjects = () => {
    if (typeof document === "undefined") return;
    const target = document.getElementById("subjects-section");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <main>
      {/* 2. Hero واضح: عنوان قصير واختيار الصف ونوع المدرسة مباشرة */}
      <HeroSection
        grades={curriculum.grades}
        selectedGradeId={selectedGradeId}
        selectedCategory={selectedCategory}
        onSelectGrade={handleSelectGrade}
        onSelectCategory={handleSelectCategory}
        onShowSubjects={handleShowSubjects}
        loggedInUser={loggedInUser}
      />

      {/* 3. المواد الدراسية: تظهر من قاعدة البيانات حسب اختيار الطالب */}
      <SubjectsShowcase
        subjects={curriculum.subjects}
        grades={curriculum.grades}
        selectedGradeId={selectedGradeId}
        selectedCategory={selectedCategory}
      />

      {/* 4. «كمّل مذاكرتك»: يظهر للطالب المسجل فقط إذا كان عنده تقدم محفوظ */}
      <ContinueStudyingSection items={continueItems} />

      {/* 5. «جرّب سؤال»: قسم اختياري صغير بعد المواد */}
      <QuickQuestionPreview
        grades={curriculum.grades}
        sampleQuestionsByBucket={curriculum.sampleQuestionsByBucket}
        selectedGradeId={selectedGradeId}
        selectedCategory={selectedCategory}
      />

      {/* 6. مميزات الخلاصة: شرح مبسط للتعريفات والخرائط الذهنية والاختبارات والتفسيرات */}
      <FeaturesBento sampleProofs={curriculum.sampleProofs} />

      <FinalCTA />
    </main>
  );
}

