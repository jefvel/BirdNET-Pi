import type { Database, Statement } from 'better-sqlite3';
import { getFileName } from '@/util.js';
import type BirdRepository from '@/repositories/birds-repository.js';
import type ImagesRepository from '@/repositories/images-repository.js';
import type { ImageResource } from '@/repositories/images-repository.js';
import type ConfigRepository from '@/repositories/config-repository.js';
import type ConfigService from './config-service.js';

export class ImageService {
  imageRepo: ImagesRepository;
  config: ConfigService;

  imageProvider: ImageProvider;

  constructor(imageRepo: ImagesRepository, configService: ConfigService) {
    this.imageRepo = imageRepo;
    this.config = configService;

    this.imageProvider = new WikipediaImageProvider();
  }

  deleteImage(sciName: string) {
    return this.imageRepo.deleteImage(sciName);
  }

  async getImage(sciName: string) {
    const res = this.imageRepo.getImage(sciName);
    if (res) {
      return res;
    }

    const foundImage = await this.imageProvider.getImageFromService(sciName);
    if (!foundImage) return undefined;

    this.saveImage(foundImage);

    return foundImage;
  }

  saveImage(image: Omit<ImageResource, 'id' | 'createdAt'>) {
    this.imageRepo.saveImage(image);
  }
}

abstract class ImageProvider {
  abstract getImageFromService(
    sciName: string,
  ): Promise<
    Omit<ImageResource, 'createdAt' | 'id' | 'commonName'> | undefined
  >;
}

export class WikipediaImageProvider implements ImageProvider {
  constructor() {}

  getImageFromService = async (sciName: string) => {
    const req = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${sciName}`,
    );
    if (!req.ok) return undefined;

    const res = (await req.json()) as {
      originalimage?: { source?: string };
      title: string;
    };
    const imageUrl: string | undefined = res?.originalimage?.source;
    if (!imageUrl) return undefined;

    const title = res.title;

    const imageName = getFileName(imageUrl);

    const metadataReq = await fetch(
      `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${imageName}&prop=imageinfo&iiprop=extmetadata|size&format=json`,
    );

    if (!metadataReq.ok) {
      return undefined;
    }

    const metadata = (await metadataReq.json()) as {
      query?: {
        pages?: {
          [pageId: string]: {
            imageinfo: {
              width: number;
              height: number;
              extmetadata: {
                Artist?: { value: string };
                LicenseUrl?: { value: string };
              };
            }[];
          };
        };
      };
    };

    for (const page of Object.values(metadata.query?.pages ?? {})) {
      const imageinfo = page.imageinfo[0];
      if (!imageinfo) {
        continue;
      }

      const details = imageinfo?.extmetadata;

      const croppedImageUrl =
        imageinfo.width > 1024
          ? `${imageUrl.replace(/\/commons\//, '/commons/thumb/')}/1024px-${imageName}`
          : imageUrl;

      const author = details?.Artist?.value;
      const authorUrl =
        author
          ?.split('href="')[1]
          ?.split('"')[0]
          ?.replace(/^\/\//, 'https://') ?? this.getImageSourceUrl(imageUrl);

      const licenseUrl = details.LicenseUrl?.value ?? authorUrl;

      return {
        sciName,
        url: croppedImageUrl,
        title,
        authorUrl,
        licenseUrl,
        sourceUrl: this.getImageSourceUrl(imageUrl),
      };
    }

    return undefined;
  };

  getImageSourceUrl(url: string): string {
    const decoded = decodeURIComponent(url);
    const fileName =
      decoded.indexOf('/thumb/') === -1
        ? decoded.replace(/^.*[\\/]/, '')
        : decoded.replace(/^.*\/thumb\/\w+\/\w+\//, '').replace(/\/.*/, '');
    return `https://en.wikipedia.org/wiki/File:${fileName}`;
  }
}
