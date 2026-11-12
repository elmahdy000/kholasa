import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { getCurriculumScope } from "@/lib/curriculum";
import { isAnyDemoCode } from "@/lib/demo-shared";
import {
  getLandingCurriculumData,
  getStudentContinueStudying,
} from "@/lib/landing-curriculum";
import {
  resolveInitialStudyPreferences,
  STUDY_PREFS_COOKIE,
} from "@/lib/study-preferences";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { LandingExperience } from "@/components/landing/LandingExperience";
import { SiteFooter } from "@/components/landing/SiteFooter";

export const dynamic = "force-dynamic";

interface LandingPageProps {
  searchParams?: Promise<{
    grade?: string;
    category?: string;
  }>;
}

export default async function LandingPage({ searchParams }: LandingPageProps = {}) {
  const [user, cookieStore, resolvedSearchParams] = await Promise.all([
    getCurrentUser(),
    cookies(),
    searchParams ?? Promise.resolve({} as { grade?: string; category?: string }),
  ]);

  const isPermanentLoggedIn = Boolean(user && !isAnyDemoCode(user.loginCode));
  const scope = isPermanentLoggedIn ? getCurriculumScope(user) : null;

  const [curriculum, continueItems] = await Promise.all([
    getLandingCurriculumData(),
    isPermanentLoggedIn && user
      ? getStudentContinueStudying(user.id, scope)
      : Promise.resolve([]),
  ]);

  const initialPrefs = resolveInitialStudyPreferences({
    grades: curriculum.grades,
    queryGrade: resolvedSearchParams?.grade,
    queryCategory: resolvedSearchParams?.category,
    cookieRaw: cookieStore.get(STUDY_PREFS_COOKIE)?.value,
    userGradeId: isPermanentLoggedIn ? user?.gradeId : null,
    userCategory: isPermanentLoggedIn ? user?.schoolCategory : null,
  });

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F172A] text-[#091B40] dark:text-[#F8FAFC]">
      <SiteHeader
        user={
          isPermanentLoggedIn && user
            ? { name: user.name || "حسابي", role: user.role, loginCode: user.loginCode }
            : null
        }
      />
      <LandingExperience
        curriculum={curriculum}
        initialGradeId={initialPrefs.gradeId}
        initialCategory={initialPrefs.schoolCategory}
        continueItems={continueItems}
        loggedInUser={
          isPermanentLoggedIn && user
            ? { name: user.name || "طالبنا", role: user.role }
            : null
        }
      />
      <SiteFooter />
    </div>
  );
}
