import { Connection } from 'mongoose';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { EmailService } from '../../../src/modules/notifications/application/email.service';
import { getConnectionToken } from '@nestjs/mongoose';
import { appSetup } from '../../../src/setup/app.setup';
import { deleteAllData } from './delete-all-data';
import { UsersTestManager } from './users-test-manager';
import { MockedEmailService } from '../../mock/email-service-mock';
import { CommentsTestManager } from './comments-test-manager';
import { PostsTestManager } from './posts-test-manager';
import { BlogsTestManager } from './blogs-test-manager';

export const initSettings = async (
  //передаем callback, который получает ModuleBuilder, если хотим изменить настройку тестового модуля
  addSettingsToModuleBuilder?: (moduleBuilder: TestingModuleBuilder) => void,
) => {
  const testingModuleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(EmailService)
    .useClass(MockedEmailService);

  if (addSettingsToModuleBuilder) {
    addSettingsToModuleBuilder(testingModuleBuilder);
  }

  const testingAppModule = await testingModuleBuilder.compile();

  const app = testingAppModule.createNestApplication();

  appSetup(app);

  await app.init();

  const databaseConnection = app.get<Connection>(getConnectionToken());
  const httpServer = app.getHttpServer();
  const userTestManger = new UsersTestManager(app);
  const commentsTestManager = new CommentsTestManager(app)
  const postsTestManager = new PostsTestManager(app)
  const blogsTestManager = new BlogsTestManager(app)

  await deleteAllData(app);

  return {
    app,
    databaseConnection,
    httpServer,
    userTestManger,
    commentsTestManager,
    postsTestManager,
    blogsTestManager,
  };
};
