import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateBlogDomainDto } from './dto/create-blog-domain-dto';
import { UpdateBlogDomainDto } from './dto/update-blog-domain-dto';
import { blogConstraints, blogDBConstraints, } from './constraints/blog-constraints';

//флаг timestemp автоматичеки добавляет поля upatedAt и createdAt
/**
 * User Entity Schema
 * This class represents the schema and behavior of a User entity.
 */
@Schema({ timestamps: true })
export class Blog {
  /**
   * Login of the user (must be uniq)
   * @type {string}
   * @required
   */
  @Prop({ type: String, required: true, maxlength: blogConstraints.nameMaxLength })
  name: string;

  /**
   * Password hash for authentication
   * @type {string}
   * @required
   */
  @Prop({ type: String, required: true, maxlength: blogDBConstraints.descriptionMaxLength })
  description: string;

  /**
   * Email of the user
   * @type {string}
   * @required
   */
  @Prop({ type: String, required: true, maxlength: blogDBConstraints.websiteUrlMaxLength })
  websiteUrl: string;

  /**
   * Email confirmation
   * @type {EmailConfirmationSchema}
   * @default false
   */
  @Prop({ type: Boolean, default: false })
  isMembership: boolean;

  /**
   * Creation timestamp
   * Explicitly defined despite timestamps: true
   * properties without @Prop for typescript so that they are in the class instance (or in instance methods)
   * @type {Date}
   */
  createdAt: Date;
  updatedAt: Date;

  static createBlog(dto: CreateBlogDomainDto): BlogDocument {
    const blog = new this();
    blog.checkExceptions(dto);

    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    blog.isMembership = false;

    return blog as BlogDocument;
  }
  checkExceptions(dto: CreateBlogDomainDto) {
    if (dto.name.length > blogConstraints.nameMaxLength) {
      throw new Error('invalid name');
    }
    if (dto.description.length > blogConstraints.descriptionMaxLength) {
      throw new Error('invalid description');
    }
    if (dto.websiteUrl.length > blogConstraints.websiteUrlMaxLength) {
      throw new Error('invalid websiteUrl');
    }
    if (!blogConstraints.webSiteUrlMatch.test(dto.websiteUrl)) {
      throw new Error('invalid websiteUrl');
    }
  }

  /**
   * Updates the user instance with new data
   * Resets email confirmation if email is updated
   * @param {UpdateUserDto} dto - The data transfer object for user updates
   * DDD continue: инкапсуляция (вызываем методы, которые меняют состояние\св-ва) объектов согласно правилам этого объекта
   */
  updateBlog(dto: UpdateBlogDomainDto) {
    this.checkExceptions(dto);

    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

//регистрирует методы сущности в схеме
BlogSchema.loadClass(Blog);

//Типизация документа
export type BlogDocument = HydratedDocument<Blog>;

//Типизация модели + статические методы
export type BlogModelType = Model<BlogDocument> & typeof Blog;
