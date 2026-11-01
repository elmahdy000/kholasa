import type { Role } from "@prisma/client";
import type {
  UserFilterParams,
  CreateUserInput,
  UpdateUserInput,
  StudentProfileUpdateInput,
  RegisterStudentInput,
} from "./user/types";
import { UserQueriesService } from "./user/queries";
import { UserMutationsService } from "./user/mutations";

export type {
  UserFilterParams,
  CreateUserInput,
  UpdateUserInput,
  StudentProfileUpdateInput,
  RegisterStudentInput,
};

export class UserService {
  // Queries
  static getUsers = UserQueriesService.getUsers;
  static getUserById = UserQueriesService.getUserById;
  static getUserDetailedProfile = UserQueriesService.getUserDetailedProfile;
  static findByIdentifier = UserQueriesService.findByIdentifier;
  static findByLoginCode = UserQueriesService.findByLoginCode;

  // Mutations
  static createUser = UserMutationsService.createUser;
  static updateUser = UserMutationsService.updateUser;
  static updateUserRole = UserMutationsService.updateUserRole;
  static updateStudentProfile = UserMutationsService.updateStudentProfile;
  static deleteUser = UserMutationsService.deleteUser;
  static registerStudent = UserMutationsService.registerStudent;
  static resetUserDevices = UserMutationsService.resetUserDevices;
}
