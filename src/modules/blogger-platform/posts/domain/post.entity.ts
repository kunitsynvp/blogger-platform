import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model } from 'mongoose';
import { CreatePostDomainDto } from './dto/create-post-domain-dto';
import { CheckExceptionsPostDto } from './dto/check-exceptions-post-dto';
import { UpdatePostDomainDto } from './dto/update-post-domain-dto';
import {
  postConstraints,
  postDBConstraints,
} from './constraints/post-constraints';


@Schema({timestamps:true})
export class Post {
  @Prop({
    type: String,
    required: true,
    minlength: postDBConstraints.minTitleLength,
    maxlength: postDBConstraints.maxTitleLength })
  title: string;
  @Prop({
    type: String,
    required: true,
    minlength: postDBConstraints.minShortDescriptionLength,
    maxlength: postDBConstraints.maxShortDescriptionLength })
  shortDescription: string;
  @Prop({
    type: String,
    required: true,
    minlength: postDBConstraints.minContentLength,
    maxlength: postDBConstraints.maxContentLength })
  content: string;
  @Prop({type: mongoose.Types.ObjectId, required: true})
  blogId: mongoose.Types.ObjectId;
  @Prop({type: String, required: true})
  blogName: string;

  createdAt: Date
  updatedAt: Date
  //TODO
  //likes entity

  static createPost(dto: CreatePostDomainDto
  ): PostDocument {

    const newPost = new this()
    const excDto = new CheckExceptionsPostDto()
    excDto.title = dto.title;
    excDto.content = dto.content;
    excDto.shortDescription = dto.shortDescription;
    newPost.checkPostsExceptions(excDto)

    newPost.title = dto.title
    newPost.shortDescription = dto.shortDescription
    newPost.content = dto.content
    newPost.blogId = new mongoose.Types.ObjectId(dto.blogId)
    newPost.blogName = dto.blogName
    // newPost.likesCount = 0
    // newPost.dislikesCount = 0
    // newPost.newestLikes = []

    return newPost as PostDocument
  }
  updatePost(dto: UpdatePostDomainDto){

    const excDto = new CheckExceptionsPostDto()
    excDto.title = dto.title;
    excDto.content = dto.content;
    excDto.shortDescription = dto.shortDescription;
    this.checkPostsExceptions(excDto)

    this.title = dto.title
    this.shortDescription = dto.shortDescription
    this.content = dto.content
    this.blogId = new mongoose.Types.ObjectId(dto.blogId)
    this.blogName = dto.blogName
  }
  // recalculateLikeStatusesAmount(newLikesCount: number, newDislikesCount: number, newestLikes: LikeDetailsViewModel[] | null){
  //
  //   this.likesCount = newLikesCount
  //   this.dislikesCount = newDislikesCount
  //   this.newestLikes = newestLikes
  // }
  checkPostsExceptions(dto: CheckExceptionsPostDto) {
    if(dto.title.length > postConstraints.maxTitleLength){
      throw new Error("invalid title")
    }
    if(dto.shortDescription.length > postConstraints.maxShortDescriptionLength){
      throw new Error("invalid shortDescription")
    }
    if(dto.content.length > postConstraints.maxContentLength){
      throw new Error("invalid content")
    }
  }

}
export const PostSchema = SchemaFactory.createForClass(Post);

//регистрирует методы сущности в схеме
PostSchema.loadClass(Post);

//Типизация документа
export type PostDocument = HydratedDocument<Post>;

//Типизация модели + статические методы
export type PostModelType = Model<PostDocument> & typeof Post;