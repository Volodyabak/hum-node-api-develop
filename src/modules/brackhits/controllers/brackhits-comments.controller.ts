import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query } from '@nestjs/common';

import {
  BrackhitCommentParamsDto,
  BrackhitCommentRepliesQueryDto,
  BrackhitCommentReplyParamsDto,
  BrackhitCommentsListQueryDto,
  CreateBrackhitCommentDto,
  GetBrackhitCommentRepliesResponseDto,
  GetBrackhitCommentsResponseDto,
  ReplyBrackhitCommentDto,
  ReplyBrackhitCommentResponseDto,
} from '../dto/brackhits-comments.dto';
import {
  BrackhitCommentsFlagsModel,
  BrackhitCommentsLikesModel,
  BrackhitCommentsModel,
  BrackhitRepliesFlagsModel,
  BrackhitRepliesLikesModel,
  BrackhitRepliesModel,
} from '../../../../database/Models';
import { formatBrackhitReplyResponse } from '../utils/brackhits-response.utils';
import { BrackhitsCommentsService } from '../services/brackhits-comments.service';
import { ResCtx, ResponseContext } from '../../../decorators/response-context.decorator';
import { BrackhitIdParamDto } from '../../../Tools/dto/main-api.dto';

@Controller('brackhits')
@ApiTags('Brackhits Comments')
@ApiBearerAuth()
export class BrackhitsCommentsController {
  constructor(private readonly commentsService: BrackhitsCommentsService) {}

  @Get(':brackhitId/comment/list')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get brackhit comments',
    description: 'Get brackhit comments',
  })
  @ApiResponse({ status: 200, type: GetBrackhitCommentsResponseDto })
  getCommentsList(
    @Param() params: BrackhitIdParamDto,
    @Query() query: BrackhitCommentsListQueryDto,
    @ResCtx() resCtx: ResponseContext,
  ): Promise<GetBrackhitCommentsResponseDto> {
    return this.commentsService.getBrackhitCommentsResponse(
      resCtx.userId,
      params.brackhitId,
      query,
    );
  }

  @Get('comment/:commentId')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Get brackhit comment replies',
    description: 'Get brackhit comment replies',
  })
  @ApiResponse({ status: 200, type: GetBrackhitCommentRepliesResponseDto })
  getCommentReplies(
    @Param() params: BrackhitCommentParamsDto,
    @Query() query: BrackhitCommentRepliesQueryDto,
    @ResCtx() resCtx: ResponseContext,
  ): Promise<GetBrackhitCommentRepliesResponseDto> {
    return this.commentsService.getBrackhitCommentRepliesResponse(
      resCtx.userId,
      params.commentId,
      query,
    );
  }

  @Post('comment')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Create brackhit comment',
    description: 'Create brackhit comment',
  })
  @ApiResponse({ status: 200, type: BrackhitCommentsModel })
  async createComment(
    @Body() body: CreateBrackhitCommentDto,
    @ResCtx() resCtx: ResponseContext,
  ): Promise<BrackhitCommentsModel> {
    return this.commentsService.createComment(resCtx.userId, body);
  }

  @Delete('comment/:commentId')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Delete brackhit comment',
    description: 'Delete brackhit comment',
  })
  @ApiResponse({ status: 200, type: BrackhitCommentsModel })
  deleteComment(
    @Param() params: BrackhitCommentParamsDto,
    @ResCtx() resCtx: ResponseContext,
  ): Promise<BrackhitCommentsModel> {
    return this.commentsService.deleteComment(resCtx.userId, params.commentId);
  }

  @Post('comment/:commentId/reply')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Reply brackhit comment',
    description: 'Reply brackhit comment',
  })
  @ApiResponse({ status: 200, type: ReplyBrackhitCommentResponseDto })
  async replyComment(
    @Param() params: BrackhitCommentParamsDto,
    @Body() body: ReplyBrackhitCommentDto,
    @ResCtx() resCtx: ResponseContext,
  ): Promise<ReplyBrackhitCommentResponseDto> {
    const reply = await this.commentsService.replyComment(resCtx.userId, params.commentId, body);
    return formatBrackhitReplyResponse(reply);
  }

  @Delete('comment/reply/:replyId')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Delete brackhit comment reply',
    description: 'Delete brackhit comment reply',
  })
  @ApiResponse({ status: 200, type: BrackhitCommentsModel })
  deleteReply(
    @Param() params: BrackhitCommentReplyParamsDto,
    @ResCtx() resCtx: ResponseContext,
  ): Promise<BrackhitRepliesModel> {
    return this.commentsService.deleteReply(resCtx.userId, params.replyId);
  }

  @Put('comment/:commentId/like')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Like brackhit comment',
    description: 'Like brackhit comment',
  })
  @ApiResponse({ status: 200, type: BrackhitCommentsLikesModel })
  async likeComment(
    @Param() params: BrackhitCommentParamsDto,
    @ResCtx() resCtx: ResponseContext,
  ): Promise<BrackhitCommentsLikesModel> {
    return this.commentsService.likeComment(resCtx.userId, params.commentId);
  }

  @Delete('comment/:commentId/like')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Delete brackhit comment like',
    description: 'Delete brackhit comment like',
  })
  @ApiResponse({ status: 200, type: BrackhitCommentsLikesModel })
  deleteCommentLike(
    @Param() params: BrackhitCommentParamsDto,
    @ResCtx() resCtx: ResponseContext,
  ): Promise<BrackhitCommentsLikesModel> {
    return this.commentsService.deleteCommentLike(resCtx.userId, params.commentId);
  }

  @Put('comment/reply/:replyId/like')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Like brackhit comment reply',
    description: 'Like brackhit comment reply',
  })
  @ApiResponse({ status: 200, type: BrackhitRepliesLikesModel })
  likeCommentReply(
    @Param() params: BrackhitCommentReplyParamsDto,
    @ResCtx() resCtx: ResponseContext,
  ): Promise<BrackhitRepliesLikesModel> {
    return this.commentsService.likeCommentReply(resCtx.userId, params.replyId);
  }

  @Delete('comment/reply/:replyId/like')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Delete brackhit comment reply like',
    description: 'Delete brackhit comment reply like',
  })
  @ApiResponse({ status: 200, type: BrackhitRepliesLikesModel })
  deleteCommentReplyLike(
    @Param() params: BrackhitCommentReplyParamsDto,
    @ResCtx() resCtx: ResponseContext,
  ): Promise<BrackhitRepliesLikesModel> {
    return this.commentsService.deleteCommentReplyLike(resCtx.userId, params.replyId);
  }

  @Put('comment/:commentId/flag')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Flag brackhit comment',
    description: 'Flag brackhit comment',
  })
  @ApiResponse({ status: 200, type: BrackhitCommentsFlagsModel })
  flagComment(
    @Param() params: BrackhitCommentParamsDto,
    @ResCtx() resCtx: ResponseContext,
  ): Promise<BrackhitCommentsFlagsModel> {
    return this.commentsService.flagComment(resCtx.userId, params.commentId);
  }

  @Put('comment/reply/:replyId/flag')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Flag brackhit comment reply',
    description: 'Flag brackhit comment reply',
  })
  @ApiResponse({ status: 200, type: BrackhitRepliesFlagsModel })
  flagCommentRely(
    @Param() params: BrackhitCommentReplyParamsDto,
    @ResCtx() resCtx: ResponseContext,
  ): Promise<BrackhitRepliesFlagsModel> {
    return this.commentsService.flagCommentReply(resCtx.userId, params.replyId);
  }
}
