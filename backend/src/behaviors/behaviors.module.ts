import { Module } from "@nestjs/common";
import { BehaviorManager } from "./services/behavior-manager.service";
import { BlameableBehavior } from "./services/blameable-behavior.service";
import { TimestampableBehavior } from "./services/timestampable-behavior.service";
import { SoftDeletableBehavior } from "./services/soft-deletable-behavior.service";
import { VersionableBehavior } from "./services/versionable-behavior.service";

@Module({
  providers: [
    BehaviorManager,
    BlameableBehavior,
    TimestampableBehavior,
    SoftDeletableBehavior,
    VersionableBehavior,
  ],
  exports: [
    BehaviorManager,
    BlameableBehavior,
    TimestampableBehavior,
    SoftDeletableBehavior,
    VersionableBehavior,
  ],
})
export class BehaviorsModule {}
