import { CustomExamCreateInput, RecordAnswerInput } from "./exam/types";
import { ExamCoreService } from "./exam/core";
import { ExamGeneratorService } from "./exam/generator";
import { ExamAttemptService } from "./exam/attempt";

export type { CustomExamCreateInput, RecordAnswerInput } from "./exam/types";
export { ExamCoreService } from "./exam/core";
export { ExamGeneratorService } from "./exam/generator";
export { ExamAttemptService } from "./exam/attempt";

export class ExamService {
  // Core & CRUD
  static getExams = ExamCoreService.getExams;
  static getExamById = ExamCoreService.getExamById;
  static createOfficialExam = ExamCoreService.createOfficialExam;
  static updateExam = ExamCoreService.updateExam;
  static deleteExam = ExamCoreService.deleteExam;
  static getAdminExamsList = ExamCoreService.getAdminExamsList;

  // Generator & Stats
  static createCustomExam = ExamGeneratorService.createCustomExam;
  static getExamBuilderStats = ExamGeneratorService.getExamBuilderStats;

  // Attempts & Scoring
  static recordAnswer = ExamAttemptService.recordAnswer;
  static submitExamAttempt = ExamAttemptService.submitExamAttempt;
  static getAttemptResults = ExamAttemptService.getAttemptResults;
  static getAdminAttemptsList = ExamAttemptService.getAdminAttemptsList;
  static gradeStudentAnswer = ExamAttemptService.gradeStudentAnswer;
}
