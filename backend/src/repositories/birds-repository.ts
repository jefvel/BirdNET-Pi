import { type Database, type Statement } from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import type { LocaleKey } from '../types/types.js';

export type BirdStat = {
  commonName: string;
  sciName: string;
  detections: number;
  maxConfidence: number;
  added: string;
};

export default class BirdRepository {
  private db: Database;
  private localeDir: string;

  constructor(db: Database, localeDir: string) {
    this.db = db;
    this.localeDir = localeDir;
  }

  localeMap: {
    [locale: string]: { [sciName: string]: string };
  } = {};

  getTranslatedName = (sciName: string, locale: LocaleKey) => {
    let cached = this.localeMap[locale];
    if (!cached) {
      const str = readFileSync(`${this.localeDir}/labels_${locale}.json`);
      cached = JSON.parse(str.toString());
      if (!cached) return undefined;

      this.localeMap[locale] = cached;
    }

    return cached[sciName];
  };

  private birdsQuery?: Statement<unknown[], BirdStat>;
  getBirds = (locale: LocaleKey) => {
    this.birdsQuery =
      this.birdsQuery ??
      this.db.prepare(`
				SELECT
					Com_Name commonName,
					Sci_Name sciName,
					COUNT(*) detections,
					MAX(Confidence) maxConfidence,
					MIN(Date) added
				FROM detections 
				GROUP BY Sci_Name
		`);

    return this.birdsQuery.all().map((b) => {
      return { ...b, commonName: this.getTranslatedName(b.sciName, locale) };
    });
  };
}
