import { User } from "../../../../domain/user";
import { UserEntity } from "../entities/user.entity";

export class UserMapper {
  static toDomain(raw: UserEntity): User {
    const domainEntity = new User();
    domainEntity.id = raw.id;
    domainEntity.lastLogin = raw.lastLogin;
    domainEntity.username = raw.username;
    domainEntity.password = raw.password;
    domainEntity.resetToken = raw.resetToken;
    domainEntity.resetTokenExpiresAt = raw.resetTokenExpiresAt;
    domainEntity.enabled = raw.enabled;
    domainEntity.email = raw.email;
    domainEntity.address = raw.address;
    domainEntity.city = raw.city;
    domainEntity.zipcode = raw.zipcode;
    domainEntity.state = raw.state;
    domainEntity.cellNo = raw.cellNo;
    domainEntity.phoneNo = raw.phoneNo;
    domainEntity.country = raw.country;
    domainEntity.currency = raw.currency;
    domainEntity.name = raw.name;
    domainEntity.provider = raw.provider;
    return domainEntity;
  }

  static toPersistence(domainEntity: User): UserEntity {
    const persistenceEntity = new UserEntity();
    persistenceEntity.id = domainEntity.id;
    persistenceEntity.lastLogin = domainEntity.lastLogin;
    persistenceEntity.username = domainEntity.username;
    persistenceEntity.password = domainEntity.password;
    persistenceEntity.resetToken = domainEntity.resetToken;
    persistenceEntity.resetTokenExpiresAt = domainEntity.resetTokenExpiresAt;
    persistenceEntity.enabled = domainEntity.enabled;
    persistenceEntity.email = domainEntity.email;
    persistenceEntity.address = domainEntity.address;
    persistenceEntity.city = domainEntity.city;
    persistenceEntity.zipcode = domainEntity.zipcode;
    persistenceEntity.state = domainEntity.state;
    persistenceEntity.cellNo = domainEntity.cellNo;
    persistenceEntity.phoneNo = domainEntity.phoneNo;
    persistenceEntity.country = domainEntity.country;
    persistenceEntity.currency = domainEntity.currency;
    persistenceEntity.name = domainEntity.name;
    persistenceEntity.provider = domainEntity.provider;
    return persistenceEntity;
  }
}
