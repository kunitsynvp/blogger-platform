import { Connection } from 'mongoose';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { EmailService } from '../../../src/modules/notifications/application/email.service';
import { getConnectionToken } from '@nestjs/mongoose';
import { appSetup } from '../../../src/setup/app.setup';
import { deleteAllData } from './delete-all-data';
import { UsersTestManager } from './test-managers/users-test-manager';
import { MockedEmailService } from '../../mock/email-service-mock';
import { CommentsTestManager } from './test-managers/comments-test-manager';
import { PostsTestManager } from './test-managers/posts-test-manager';
import { BlogsTestManager } from './test-managers/blogs-test-manager';
import { initAppModule } from '../../../src/init-app-module';
import { SessionsTestManager } from './test-managers/sessions-test-manager';
import { NestExpressApplication } from '@nestjs/platform-express';

export const initSettings = async (
  //передаем callback, который получает ModuleBuilder, если хотим изменить настройку тестового модуля
  addSettingsToModuleBuilder?: (moduleBuilder: TestingModuleBuilder) => void,
) => {
  const DynamicAppModule = await initAppModule();
  const testingModuleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [DynamicAppModule],
  })
    .overrideProvider(EmailService)
    .useClass(MockedEmailService);

  if (addSettingsToModuleBuilder) {
    addSettingsToModuleBuilder(testingModuleBuilder);
  }

  const testingAppModule = await testingModuleBuilder.compile();

  const app = testingAppModule.createNestApplication();

  appSetup(app as NestExpressApplication);

  await app.init();

  const databaseConnection = app.get<Connection>(getConnectionToken());
  const httpServer = app.getHttpServer();
  const userTestManger = new UsersTestManager(app);
  const commentsTestManager = new CommentsTestManager(app);
  const postsTestManager = new PostsTestManager(app);
  const blogsTestManager = new BlogsTestManager(app);
  const sessionTestManager = new SessionsTestManager(app);

  await deleteAllData(app);

  return {
    app,
    databaseConnection,
    httpServer,
    userTestManger,
    commentsTestManager,
    postsTestManager,
    blogsTestManager,
    sessionTestManager,
  };
};
