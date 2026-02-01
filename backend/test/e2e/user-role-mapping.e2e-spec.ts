/**
 * User Role Mapping E2E Tests
 *
 * Validates that user roles are correctly determined from database fields
 * (user_type and supervisor columns) instead of hardcoded username patterns.
 *
 * Expected Behavior:
 * - Users with supervisor=1 → supervisor role (9 users in database)
 * - Users with user_type=2, supervisor=0 → admin role
 * - Users with user_type=3 → factory role
 * - Users with user_type=1 + in fitters table → fitter role
 *
 * Previously Broken (hardcoded logic):
 * - Only 3 usernames were hardcoded as supervisors: sadmin, superadmin, adamwhitehouse
 * - sadmin and superadmin don't exist in database
 * - adamwhitehouse has supervisor=0 (should be admin, not supervisor)
 * - 9 actual supervisors were being assigned wrong roles
 */

import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { ConfigModule } from "@nestjs/config";

import { UserEntity } from "../../src/users/infrastructure/persistence/relational/entities/user.entity";
import { FitterEntity } from "../../src/fitters/infrastructure/persistence/relational/entities/fitter.entity";
import { RoleEntity } from "../../src/roles/infrastructure/persistence/relational/entities/role.entity";
import { UsersService } from "../../src/users/users.service";
import { UserRepository } from "../../src/users/infrastructure/persistence/user.repository";
import { UsersRelationalRepository } from "../../src/users/infrastructure/persistence/relational/repositories/user.repository";
import { FilesService } from "../../src/files/files.service";
import { RoleEnum } from "../../src/roles/roles.enum";

// Expected supervisor usernames from the database (supervisor=1)
const EXPECTED_SUPERVISORS = [
  "betsymadmin",
  "csteenbergen",
  "customcary",
  "henk-jan",
  "karstlok",
  "laurengilbert",
  "mauritsadmin",
  "sarahparker",
  "stephan",
];

// Old hardcoded supervisors (for comparison)
const OLD_HARDCODED_SUPERVISORS = ["sadmin", "superadmin", "adamwhitehouse"];

describe("User Role Mapping E2E Tests", () => {
  let moduleRef: TestingModule;
  let dataSource: DataSource;
  let usersService: UsersService;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ".env",
        }),
        TypeOrmModule.forRoot({
          type: "postgres",
          host: process.env.DATABASE_HOST || "localhost",
          port: parseInt(process.env.DATABASE_PORT || "5432", 10),
          username: process.env.DATABASE_USERNAME || "postgres",
          password: process.env.DATABASE_PASSWORD || "postgres",
          database: process.env.DATABASE_NAME || "oms_nest",
          entities: [UserEntity, FitterEntity, RoleEntity],
          synchronize: false,
        }),
        TypeOrmModule.forFeature([UserEntity, FitterEntity, RoleEntity]),
      ],
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useClass: UsersRelationalRepository,
        },
        {
          provide: FilesService,
          useValue: { findById: jest.fn() },
        },
      ],
    }).compile();

    dataSource = moduleRef.get<DataSource>(DataSource);
    usersService = moduleRef.get<UsersService>(UsersService);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  describe("Database Schema Validation", () => {
    it("should have user_type column in user view", async () => {
      const result = await dataSource.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'user' AND column_name = 'user_type'
      `);
      expect(result.length).toBe(1);
    });

    it("should have is_supervisor column in user view", async () => {
      const result = await dataSource.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'user' AND column_name = 'is_supervisor'
      `);
      expect(result.length).toBe(1);
    });

    it("should have legacy_id column in user view", async () => {
      const result = await dataSource.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'user' AND column_name = 'legacy_id'
      `);
      expect(result.length).toBe(1);
    });
  });

  describe("Supervisor Role Mapping", () => {
    it("should have exactly 9 users with supervisor=1 in database", async () => {
      const supervisors = await dataSource.query(`
        SELECT username, name, user_type, is_supervisor
        FROM "user"
        WHERE is_supervisor = 1
        ORDER BY username
      `);

      expect(supervisors.length).toBe(9);
    });

    it("should recognize all 9 database supervisors", async () => {
      const supervisors = await dataSource.query(`
        SELECT username, name, user_type, is_supervisor, legacy_id
        FROM "user"
        WHERE is_supervisor = 1
        ORDER BY username
      `);

      // Verify all expected supervisors are present
      const supervisorUsernames = supervisors.map(
        (s: { username: string }) => s.username,
      );
      for (const expectedUsername of EXPECTED_SUPERVISORS) {
        expect(supervisorUsernames).toContain(expectedUsername);
      }
    });

    it("should return supervisor role for all users with supervisor=1", async () => {
      const supervisors = await dataSource.query(`
        SELECT username, legacy_id, user_type, is_supervisor
        FROM "user"
        WHERE is_supervisor = 1
      `);

      for (const supervisor of supervisors) {
        const role = await usersService.getUserRole(
          supervisor.legacy_id,
          supervisor.username,
          supervisor.user_type,
          supervisor.is_supervisor,
        );

        expect(role.name).toBe("supervisor");
        expect(role.id).toBe(RoleEnum.supervisor);
      }
    });

    it("should NOT recognize old hardcoded supervisors as supervisors (if they exist)", async () => {
      for (const username of OLD_HARDCODED_SUPERVISORS) {
        const users = await dataSource.query(
          `
          SELECT username, legacy_id, user_type, is_supervisor
          FROM "user"
          WHERE username = $1
        `,
          [username],
        );

        if (users.length > 0) {
          const user = users[0];
          // If they exist but supervisor=0, they should NOT be supervisor
          if (user.is_supervisor !== 1) {
            const role = await usersService.getUserRole(
              user.legacy_id,
              user.username,
              user.user_type,
              user.is_supervisor,
            );
            expect(role.name).not.toBe("supervisor");
          }
        }
      }
    });

    it("should assign admin role to adamwhitehouse, not supervisor (has supervisor=0 in DB)", async () => {
      const users = await dataSource.query(`
        SELECT username, legacy_id, user_type, is_supervisor
        FROM "user"
        WHERE username = 'adamwhitehouse'
      `);

      if (users.length > 0) {
        const user = users[0];
        // adamwhitehouse has user_type=2 (admin) and supervisor=0
        expect(user.is_supervisor).toBe(0);
        expect(user.user_type).toBe(2);

        const role = await usersService.getUserRole(
          user.legacy_id,
          user.username,
          user.user_type,
          user.is_supervisor,
        );

        // Should be admin, not supervisor
        expect(role.name).toBe("admin");
        expect(role.id).toBe(RoleEnum.admin);
      }
    });
  });

  describe("Admin Role Mapping (user_type=2)", () => {
    it("should have 70 users with user_type=2 in database", async () => {
      const admins = await dataSource.query(`
        SELECT COUNT(*) as count FROM "user" WHERE user_type = 2
      `);
      expect(parseInt(admins[0].count, 10)).toBe(70);
    });

    it("should return admin role for users with user_type=2 and supervisor=0", async () => {
      // Get a few admin users who are NOT supervisors
      const admins = await dataSource.query(`
        SELECT username, legacy_id, user_type, is_supervisor
        FROM "user"
        WHERE user_type = 2 AND is_supervisor = 0
        LIMIT 5
      `);

      for (const admin of admins) {
        const role = await usersService.getUserRole(
          admin.legacy_id,
          admin.username,
          admin.user_type,
          admin.is_supervisor,
        );

        expect(role.name).toBe("admin");
        expect(role.id).toBe(RoleEnum.admin);
      }
    });

    it("should give admin role to admins regardless of username pattern", async () => {
      // Find admin users whose username does NOT contain 'admin'
      const adminsWithoutAdminInName = await dataSource.query(`
        SELECT username, legacy_id, user_type, is_supervisor
        FROM "user"
        WHERE user_type = 2
          AND is_supervisor = 0
          AND username NOT LIKE '%admin%'
        LIMIT 5
      `);

      for (const admin of adminsWithoutAdminInName) {
        const role = await usersService.getUserRole(
          admin.legacy_id,
          admin.username,
          admin.user_type,
          admin.is_supervisor,
        );

        // Should be admin based on user_type, not username
        expect(role.name).toBe("admin");
      }
    });
  });

  describe("Factory Role Mapping (user_type=3)", () => {
    it("should have 7 users with user_type=3 in database", async () => {
      const factories = await dataSource.query(`
        SELECT COUNT(*) as count FROM "user" WHERE user_type = 3
      `);
      expect(parseInt(factories[0].count, 10)).toBe(7);
    });

    it("should return factory role for users with user_type=3", async () => {
      const factories = await dataSource.query(`
        SELECT username, legacy_id, user_type, is_supervisor
        FROM "user"
        WHERE user_type = 3
      `);

      for (const factory of factories) {
        const role = await usersService.getUserRole(
          factory.legacy_id,
          factory.username,
          factory.user_type,
          factory.is_supervisor,
        );

        expect(role.name).toBe("factory");
        expect(role.id).toBe(RoleEnum.factory);
      }
    });
  });

  describe("Fitter Role Mapping (user_type=1)", () => {
    it("should have 283 users with user_type=1 in database", async () => {
      const fitters = await dataSource.query(`
        SELECT COUNT(*) as count FROM "user" WHERE user_type = 1
      `);
      expect(parseInt(fitters[0].count, 10)).toBe(283);
    });

    it("should return fitter role for users with user_type=1 who are in fitters table", async () => {
      // Get users with user_type=1 who are also in fitters table
      const fittersWithType1 = await dataSource.query(`
        SELECT u.username, u.legacy_id, u.user_type, u.is_supervisor, f.id as fitter_id
        FROM "user" u
        INNER JOIN fitters f ON f.user_id = u.legacy_id
        WHERE u.user_type = 1
        LIMIT 5
      `);

      for (const fitter of fittersWithType1) {
        const role = await usersService.getUserRole(
          fitter.legacy_id,
          fitter.username,
          fitter.user_type,
          fitter.is_supervisor,
        );

        expect(role.name).toBe("fitter");
        expect(role.id).toBe(RoleEnum.fitter);
      }
    });
  });

  describe("User Type Distribution Summary", () => {
    it("should have correct user_type distribution", async () => {
      const distribution = await dataSource.query(`
        SELECT user_type, COUNT(*) as count
        FROM "user"
        GROUP BY user_type
        ORDER BY user_type
      `);

      const distributionMap = new Map(
        distribution.map((d: { user_type: number; count: string }) => [
          d.user_type,
          parseInt(d.count, 10),
        ]),
      );

      // Expected distribution based on plan
      expect(distributionMap.get(1)).toBe(283); // fitters
      expect(distributionMap.get(2)).toBe(70); // admins
      expect(distributionMap.get(3)).toBe(7); // factories
    });

    it("should have 9 supervisors (supervisor=1)", async () => {
      const supervisors = await dataSource.query(`
        SELECT COUNT(*) as count FROM "user" WHERE is_supervisor = 1
      `);
      expect(parseInt(supervisors[0].count, 10)).toBe(9);
    });
  });

  describe("Role Priority Verification", () => {
    it("should prioritize supervisor flag over user_type", async () => {
      // All 9 supervisors have user_type=2 (admin) but supervisor=1
      // They should get supervisor role, not admin
      const supervisorsWithAdminType = await dataSource.query(`
        SELECT username, legacy_id, user_type, is_supervisor
        FROM "user"
        WHERE is_supervisor = 1 AND user_type = 2
      `);

      expect(supervisorsWithAdminType.length).toBe(9);

      for (const user of supervisorsWithAdminType) {
        const role = await usersService.getUserRole(
          user.legacy_id,
          user.username,
          user.user_type,
          user.is_supervisor,
        );

        // Should be supervisor, not admin
        expect(role.name).toBe("supervisor");
        expect(role.id).toBe(RoleEnum.supervisor);
      }
    });
  });
});
