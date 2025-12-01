import type { Database, Statement } from 'better-sqlite3';

export type ImageResource = {
  id: string;
  title: string;
  sciName: string;
  url: string;
  authorUrl: string;
  licenseUrl: string;
  createdAt: string;

  sourceUrl: string;
};

export default class ImagesRepository {
  db: Database;

  constructor(db: Database) {
    this.db = db;
    this.initDb();
  }

  private initDb() {
    this.db.exec(
      `CREATE TABLE IF NOT EXISTS images (
			sci_name VARCHAR(63) NOT NULL PRIMARY KEY,
			com_en_name VARCHAR(63) NOT NULL,
			image_url TEXT NOT NULL,
			title TEXT NOT NULL,
			id TEXT NOT NULL UNIQUE,
			author_url TEXT NOT NULL,
			license_url TEXT NOT NULL,
			date_created DATE,
			source_url TEXT
		)`,
    );

    this.db.exec(
      `CREATE TABLE IF NOT EXISTS source (
			ID INTEGER PRIMARY KEY,
			email VARCHAR(63),
			uid VARCHAR(63),
			date_created DATE
		)`,
    );
  }

  deleteImage(sciName: string) {
    const statement = this.db.prepare(`DELETE FROM images WHERE sci_name == ?`);
    statement.run(sciName);
  }

  private getImageStatement?: Statement<unknown[], ImageResource>;
  getImage(sciName: string) {
    this.getImageStatement =
      this.getImageStatement ??
      this.db.prepare(
        `SELECT 
					id,
					title,
					sci_name sciName,
					com_en_name commonName,
					image_url url,
					author_url authorUrl,
					license_url licenseUrl,
					date_created createdAt
				FROM images
				WHERE sci_name == ?`,
      );

    return this.getImageStatement.get(sciName);
  }

  private saveImageStatement?: Statement;
  saveImage({
    sciName,
    url,
    title,
    authorUrl,
    licenseUrl,
  }: Omit<ImageResource, 'id' | 'createdAt'>) {
    this.saveImageStatement =
      this.saveImageStatement ??
      this.db.prepare(`
				INSERT OR REPLACE INTO images (
					sci_name,
					com_en_name,
					image_url,
					title,
					id,
					author_url,
					license_url,
					date_created
        )
				VALUES (?, ?, ?, ?, ?, ?, ?, DATE('now'))
			`);

    this.saveImageStatement.run([
      sciName,
      sciName,
      url,
      title,
      sciName,
      authorUrl,
      licenseUrl,
    ]);
  }
}
