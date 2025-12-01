import BirdRepository from '@/repositories/birds-repository.js';
import DetectionRepository from '@/repositories/detection-repository.js';
import ConfigRepository from '../repositories/config-repository.js';
import type { Database as DatabaseType } from 'better-sqlite3';
import DetectionsService from './detections-service.js';
import { ImageService } from './image-service.js';
import Database from 'better-sqlite3';
import ConfigService from './config-service.js';
import ImagesRepository from '@/repositories/images-repository.js';
import BirdService from './bird-service.js';

type Repositories = {
  birdsRepository: BirdRepository;
  detectionsRepository: DetectionRepository;
  configRepository: ConfigRepository;
  imageRepository: ImagesRepository;
};

type Services = {
  birdService: BirdService;
  detectionService: DetectionsService;
  configService: ConfigService;
  imageService: ImageService;
};

type Gateway = {
  repositories: Repositories;

  birdsDb: DatabaseType;
  wikipediaDb: DatabaseType;
  flickrDb: DatabaseType;

  close: () => void;
};

export type AppContext = {
  services: Services;
  gateway: Gateway;
};

export class AppContextService {
  private static createGateway(rootDir: string): Gateway {
    const scriptsPath = `${rootDir}/scripts`;
    const localesPath = `${rootDir}/model/l18n`;
    const birdsDbPath = `${scriptsPath}/birds.db`;
    const wikipediaDbPath = `${scriptsPath}/wikipedia.db`;
    const flickrDbPath = `${scriptsPath}/flickr.db`;

    const birdsDb = new Database(birdsDbPath);
    const wikipediaDb = new Database(wikipediaDbPath);
    const flickrDb = new Database(flickrDbPath);

    const repositories: Repositories = {
      birdsRepository: new BirdRepository(birdsDb, localesPath),
      detectionsRepository: new DetectionRepository(birdsDb),
      configRepository: new ConfigRepository(rootDir),
      imageRepository: new ImagesRepository(birdsDb),
    };

    return {
      repositories,
      birdsDb,
      wikipediaDb,
      flickrDb,
      close: () => {
        birdsDb.close();
        flickrDb.close();
        wikipediaDb.close();
      },
    };
  }

  private static createServices(gateway: Gateway): Services {
    const { repositories } = gateway;

    const configService = new ConfigService(repositories.configRepository);
    const imageService = new ImageService(
      repositories.imageRepository,
      configService,
    );

    return {
      configService,
      birdService: new BirdService(
        repositories.birdsRepository,
        configService,
        imageService,
      ),
      detectionService: new DetectionsService(
        repositories.detectionsRepository,
      ),
      imageService,
    };
  }

  static createAppContext(rootDir: string): AppContext {
    const gateway = this.createGateway(rootDir);
    return {
      gateway,
      services: this.createServices(gateway),
    };
  }
}
