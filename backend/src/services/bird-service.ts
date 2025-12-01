import type BirdRepository from '@/repositories/birds-repository.js';
import type ConfigService from './config-service.js';
import type { ImageService } from './image-service.js';

export default class BirdService {
  imageService: ImageService;
  birdRepo: BirdRepository;
  config: ConfigService;

  constructor(
    birdRepository: BirdRepository,
    config: ConfigService,
    imageService: ImageService,
  ) {
    this.birdRepo = birdRepository;
    this.config = config;
    this.imageService = imageService;
  }

  getBirds = async () => {
    const birds = this.birdRepo.getBirds(this.config.locale);
    const images = await Promise.all(
      birds.map((bird) => this.imageService.getImage(bird.sciName)),
    );

    return birds.map((bird, index) => ({ ...bird, image: images[index] }));
  };
}
