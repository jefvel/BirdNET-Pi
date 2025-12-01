import { getConfig, type Config } from '@/config.js';
import type ConfigRepository from '@/repositories/config-repository.js';
import type { LocaleKey } from '@/types/types.js';

type ImageProviderName = 'wikipedia' | 'flickr';

export default class ConfigService {
  private configRepo: ConfigRepository;

  current: Config;
  locale: LocaleKey = 'sv';
  imageProvider: ImageProviderName = 'wikipedia';

  constructor(configRepo: ConfigRepository) {
    this.configRepo = configRepo;
    this.current = getConfig();
  }
}
