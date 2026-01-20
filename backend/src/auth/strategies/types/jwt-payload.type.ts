import { User } from "../../../users/domain/user";

export type JwtPayloadType = Pick<User, "id"> & {
  role: { id: number; name: string };
  sessionId?: number;
  username?: string;
  enabled?: boolean;
  iat: number;
  exp: number;
};
