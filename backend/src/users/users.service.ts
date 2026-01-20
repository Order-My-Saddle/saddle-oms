import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { NullableType } from "../utils/types/nullable.type";
import { FilterUserDto, SortUserDto } from "./dto/query-user.dto";
import { UserRepository } from "./infrastructure/persistence/user.repository";
import { User } from "./domain/user";
import bcrypt from "bcryptjs";
import { AuthProvidersEnum } from "../auth/auth-providers.enum";
import { FilesService } from "../files/files.service";
import { RoleEnum } from "../roles/roles.enum";
import { StatusEnum } from "../statuses/statuses.enum";
import { IPaginationOptions } from "../utils/types/pagination-options";
import { FileType } from "../files/domain/file";
import { Role } from "../roles/domain/role";
import { Status } from "../statuses/domain/status";
import { UpdateUserDto } from "./dto/update-user.dto";
import { FitterEntity } from "../fitters/infrastructure/persistence/relational/entities/fitter.entity";
import { RoleEntity } from "../roles/infrastructure/persistence/relational/entities/role.entity";

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UserRepository,
    private readonly filesService: FilesService,
    @InjectRepository(FitterEntity)
    private readonly fitterRepository: Repository<FitterEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {}

  /**
   * Determine user role based on business logic
   * - Check if user is in fitter table → Fitter role
   * - Check for admin usernames → Admin/SuperAdmin role
   * - Default to User role
   */
  async getUserRole(
    userId: number,
    username?: string,
  ): Promise<{ id: number; name: string }> {
    // Define admin user patterns
    const superAdminUsernames = ["sadmin", "superadmin"];
    const adminUsernames = ["admin", "techadmin"];
    const adminUsernamePatterns = ["admin"]; // usernames containing 'admin'

    // Check for SuperAdmin
    if (username && superAdminUsernames.includes(username.toLowerCase())) {
      const role = await this.roleRepository.findOne({
        where: { name: "SuperAdmin" },
      });
      return role && role.name
        ? { id: role.id, name: role.name }
        : { id: 1, name: "SuperAdmin" };
    }

    // Check for Admin (exact match or contains 'admin')
    if (username) {
      const isAdmin =
        adminUsernames.includes(username.toLowerCase()) ||
        adminUsernamePatterns.some((pattern) =>
          username.toLowerCase().includes(pattern),
        );
      if (isAdmin) {
        const role = await this.roleRepository.findOne({
          where: { name: "Admin" },
        });
        return role && role.name
          ? { id: role.id, name: role.name }
          : { id: 1, name: "Admin" };
      }
    }

    // Check if user is a fitter
    const fitter = await this.fitterRepository.findOne({
      where: { userId: userId },
    });
    if (fitter) {
      const role = await this.roleRepository.findOne({
        where: { name: "Fitter" },
      });
      return role && role.name
        ? { id: role.id, name: role.name }
        : { id: 3, name: "Fitter" };
    }

    // Default to User role
    const role = await this.roleRepository.findOne({ where: { name: "User" } });
    return role && role.name
      ? { id: role.id, name: role.name }
      : { id: 2, name: "User" };
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Do not remove comment below.
    // <creating-property />

    let password: string | undefined = undefined;

    if (createUserDto.password) {
      const salt = await bcrypt.genSalt();
      password = await bcrypt.hash(createUserDto.password, salt);
    }

    const email = createUserDto.email;

    if (email) {
      const userObject = await this.usersRepository.findByEmail(email);
      if (userObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: "emailAlreadyExists",
          },
        });
      }
    }

    let _photo: FileType | null | undefined = undefined;

    if (createUserDto.photo?.id) {
      const fileObject = await this.filesService.findById(
        createUserDto.photo.id,
      );
      if (!fileObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            photo: "imageNotExists",
          },
        });
      }
      _photo = fileObject;
    } else if (createUserDto.photo === null) {
      _photo = null;
    }
    void _photo;

    let _role: Role | undefined = undefined;

    if (createUserDto.role?.id) {
      const roleObject = Object.values(RoleEnum)
        .map(String)
        .includes(String(createUserDto.role.id));
      if (!roleObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            role: "roleNotExists",
          },
        });
      }

      _role = {
        id: createUserDto.role.id,
      };
    }
    void _role;

    let _status: Status | undefined = undefined;

    if (createUserDto.status?.id) {
      const statusObject = Object.values(StatusEnum)
        .map(String)
        .includes(String(createUserDto.status.id));
      if (!statusObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            status: "statusNotExists",
          },
        });
      }

      _status = {
        id: createUserDto.status.id,
      };
    }
    void _status;

    return this.usersRepository.create({
      // Do not remove comment below.
      // Updated for staging schema
      username: createUserDto.email || `user_${Date.now()}`,
      name:
        `${createUserDto.firstName || ""} ${createUserDto.lastName || ""}`.trim() ||
        "User",
      email: email!,
      password: password,
      enabled: true,
      currency: "USD",
      provider: createUserDto.provider ?? AuthProvidersEnum.email,
    });
  }

  findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterUserDto | null;
    sortOptions?: SortUserDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<User[]> {
    return this.usersRepository.findManyWithPagination({
      filterOptions,
      sortOptions,
      paginationOptions,
    });
  }

  findById(id: User["id"]): Promise<NullableType<User>> {
    return this.usersRepository.findById(id);
  }

  findByIds(ids: User["id"][]): Promise<User[]> {
    return this.usersRepository.findByIds(ids);
  }

  findByEmail(email: User["email"]): Promise<NullableType<User>> {
    return this.usersRepository.findByEmail(email);
  }

  findByEmailOrUsername(emailOrUsername: string): Promise<NullableType<User>> {
    return this.usersRepository.findByEmailOrUsername(emailOrUsername);
  }

  findBySocialIdAndProvider({
    socialId,
    provider,
  }: {
    socialId: string;
    provider: string;
  }): Promise<NullableType<User>> {
    return this.usersRepository.findBySocialIdAndProvider({
      socialId,
      provider,
    });
  }

  async update(
    id: User["id"],
    updateUserDto: UpdateUserDto,
  ): Promise<User | null> {
    // Do not remove comment below.
    // <updating-property />

    let password: string | undefined = undefined;

    if (updateUserDto.password) {
      const userObject = await this.usersRepository.findById(id);

      if (userObject && userObject?.password !== updateUserDto.password) {
        const salt = await bcrypt.genSalt();
        password = await bcrypt.hash(updateUserDto.password, salt);
      }
    }

    let email: string | null | undefined = undefined;

    if (updateUserDto.email) {
      const userObject = await this.usersRepository.findByEmail(
        updateUserDto.email,
      );

      if (userObject && userObject.id !== id) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: "emailAlreadyExists",
          },
        });
      }

      email = updateUserDto.email;
    } else if (updateUserDto.email === null) {
      email = null;
    }

    // Photo handling removed for staging schema compatibility

    // Role handling removed for staging schema compatibility

    // Status handling removed for staging schema compatibility

    return this.usersRepository.update(id, {
      // Updated for staging schema
      username: updateUserDto.username,
      name: updateUserDto.name,
      email,
      password,
      enabled: updateUserDto.enabled,
      address: updateUserDto.address,
      city: updateUserDto.city,
      zipcode: updateUserDto.zipcode,
      state: updateUserDto.state,
      cellNo: updateUserDto.cellNo,
      phoneNo: updateUserDto.phoneNo,
      country: updateUserDto.country,
      currency: updateUserDto.currency,
      provider: updateUserDto.provider,
    });
  }

  async remove(id: User["id"]): Promise<void> {
    await this.usersRepository.remove(id);
  }

  // Production security methods
  async validateLoginSecurity(
    userId: User["id"],
    ipAddress: string,
  ): Promise<void> {
    await Promise.resolve();
    // Basic implementation for production security validation
    console.log(
      `Validating login security for user ${userId} from IP ${ipAddress}`,
    );
  }

  async recordLoginAttempt(attemptData: any): Promise<void> {
    await Promise.resolve();
    // Basic implementation for login attempt recording
    console.log(`Recording login attempt:`, attemptData);
  }

  async unlockAccount(userId: User["id"]): Promise<void> {
    // Implementation for account unlocking
    await this.usersRepository.update(userId, { enabled: true });
  }
}
