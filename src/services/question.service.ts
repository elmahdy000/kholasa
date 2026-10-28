import type {
  ParsedQuestionImportItem,
  BulkImportMeta,
  QuestionFilterParams,
  QuestionCreateInput,
  QuestionUpdateInput,
} from "./question/types";
import { QuestionQueriesService } from "./question/queries";
import { QuestionMutationsService } from "./question/mutations";

export type {
  ParsedQuestionImportItem,
  BulkImportMeta,
  QuestionFilterParams,
  QuestionCreateInput,
  QuestionUpdateInput,
} from "./question/types";

export class QuestionService {
  static getQuestions = QuestionQueriesService.getQuestions;
  static getQuestionById = QuestionQueriesService.getQuestionById;
  static getQuestionStats = QuestionQueriesService.getQuestionStats;

  static createQuestion = QuestionMutationsService.createQuestion;
  static updateQuestion = QuestionMutationsService.updateQuestion;
  static deleteQuestion = QuestionMutationsService.deleteQuestion;
  static bulkCreateQuestions = QuestionMutationsService.bulkCreateQuestions;
}
