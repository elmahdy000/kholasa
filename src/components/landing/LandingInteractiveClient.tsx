"use client";

import { LandingFeatureShowcase } from "./LandingFeatureShowcase";
import { LandingComparisonTable } from "./LandingComparisonTable";
import { LandingMethodologySection } from "./LandingMethodologySection";
import { LandingFaqAccordion } from "./LandingFaqAccordion";

export function LandingInteractiveClient() {
  return (
    <div className="w-full space-y-24 text-right">
      {/* 1. Interactive Platform Feature Showcase */}
      <LandingFeatureShowcase />

      {/* 2. Comparison Table: Traditional vs El Kholasa */}
      <LandingComparisonTable />

      {/* 3. Three-Step Active Learning Methodology */}
      <LandingMethodologySection />

      {/* 4. Interactive FAQ Accordion */}
      <LandingFaqAccordion />
    </div>
  );
}
