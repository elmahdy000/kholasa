import { LessonCreateInput, LessonUpdateInput } from "./curriculum/types";
import { CurriculumHierarchyService } from "./curriculum/hierarchy";
import { CurriculumUnitsService } from "./curriculum/units";
import { CurriculumLessonsService } from "./curriculum/lessons";

export type { LessonCreateInput, LessonUpdateInput } from "./curriculum/types";
export { CurriculumHierarchyService } from "./curriculum/hierarchy";
export { CurriculumUnitsService } from "./curriculum/units";
export { CurriculumLessonsService } from "./curriculum/lessons";

export class CurriculumService {
  // Hierarchy & Academic Systems
  static getSystems = CurriculumHierarchyService.getSystems;
  static getPublicSystems = CurriculumHierarchyService.getPublicSystems;
  static getSystemById = CurriculumHierarchyService.getSystemById;
  static getGrades = CurriculumHierarchyService.getGrades;
  static getSubjects = CurriculumHierarchyService.getSubjects;
  static getSubjectDetails = CurriculumHierarchyService.getSubjectDetails;
  static getStructureTree = CurriculumHierarchyService.getStructureTree;
  static createSystem = CurriculumHierarchyService.createSystem;
  static updateSystem = CurriculumHierarchyService.updateSystem;
  static deleteSystem = CurriculumHierarchyService.deleteSystem;
  static createGrade = CurriculumHierarchyService.createGrade;
  static updateGrade = CurriculumHierarchyService.updateGrade;
  static deleteGrade = CurriculumHierarchyService.deleteGrade;
  static createSubject = CurriculumHierarchyService.createSubject;
  static updateSubject = CurriculumHierarchyService.updateSubject;
  static deleteSubject = CurriculumHierarchyService.deleteSubject;

  // Units
  static getUnits = CurriculumUnitsService.getUnits;
  static getUnitDetails = CurriculumUnitsService.getUnitDetails;
  static createUnit = CurriculumUnitsService.createUnit;
  static updateUnit = CurriculumUnitsService.updateUnit;
  static deleteUnit = CurriculumUnitsService.deleteUnit;
  static reorderUnits = CurriculumUnitsService.reorderUnits;

  // Lessons
  static getLesson = CurriculumLessonsService.getLesson;
  static getLessonsList = CurriculumLessonsService.getLessonsList;
  static createLesson = CurriculumLessonsService.createLesson;
  static updateLesson = CurriculumLessonsService.updateLesson;
  static deleteLesson = CurriculumLessonsService.deleteLesson;
  static reorderLessons = CurriculumLessonsService.reorderLessons;
  static toggleLessonPublish = CurriculumLessonsService.toggleLessonPublish;
  static toggleEntityPublish = CurriculumLessonsService.toggleEntityPublish;
}
