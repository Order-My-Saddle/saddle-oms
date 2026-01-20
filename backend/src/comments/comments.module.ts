import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CommentsService } from "./comments.service";
import { CommentsController } from "./comments.controller";
import { CommentEntity } from "./infrastructure/persistence/relational/entities/comment.entity";

/**
 * Comments Module
 *
 * Provides comment management functionality for orders.
 * Supports both internal notes and customer-facing communications.
 */
@Module({
  imports: [TypeOrmModule.forFeature([CommentEntity])],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
