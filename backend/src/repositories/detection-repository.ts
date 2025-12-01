import { type Database, type Statement } from 'better-sqlite3';
import { format } from 'date-fns';

export type Detection = {
  sciName: string;
  date: string;
  time: string;
  confidence: number;
  fileName: string;
};

export type DetectionStats = Omit<Detection, 'confidence' | 'fileName'> & {
  maxConfidence: number;
  lastSeenDate: string;
  occurrenceCount: number;
};

export default class DetectionRepository {
  private db: Database;
  constructor(db: Database) {
    this.db = db;
  }

  private recentDetectionsQuery?: Statement;
  getRecentDetections(limit: number = 15, offset: number = 0) {
    this.recentDetectionsQuery =
      this.recentDetectionsQuery ??
      this.db.prepare(`
				SELECT
					Com_Name commonName,
					Sci_Name sciName,
					Date date,
					Time time, 
					Confidence confidence, 
					File_Name fileName
				FROM detections 
				ORDER BY 
					Date DESC,
					Time DESC
				LIMIT ? OFFSET ?
		`);

    return this.recentDetectionsQuery.all(limit, offset);
  }

  private detectionsByDayQuery?: Statement<[string], Detection>;
  getDetectionsByDay(date: Date | string | number = new Date()) {
    const dateStr = format(date, 'yyyy-MM-dd');
    this.detectionsByDayQuery =
      this.detectionsByDayQuery ??
      this.db.prepare(`
				SELECT
					Com_Name commonName,
					Sci_Name sciName,
					Date date,
					Time time, 
					Confidence confidence, 
					File_Name fileName
				FROM detections
				WHERE Date = ?
				ORDER BY
					Date DESC,
					Time DESC
		`);

    return this.detectionsByDayQuery.all(dateStr);
  }

  private countDetectionsBySpeciesQuery?: Statement<
    [string],
    { count: number }
  >;
  countDetectionsBySpecies(sciName: string) {
    this.countDetectionsBySpeciesQuery =
      this.countDetectionsBySpeciesQuery ??
      this.db.prepare(`
				SELECT
					COUNT(*) count
				FROM detections
				WHERE Sci_Name = ?
		`);

    return this.countDetectionsBySpeciesQuery.get(sciName)?.count ?? 0;
  }

  private detectionsBySpeciesQuery?: Statement<
    [string, number, number],
    Detection
  >;
  getDetectionsBySpecies(sciName: string, limit: number = 10, offset = 0) {
    this.detectionsBySpeciesQuery =
      this.detectionsBySpeciesQuery ??
      this.db.prepare(`
				SELECT
					Com_Name commonName,
					Sci_Name sciName,
					Date date,
					Time time, 
					Confidence confidence, 
					File_Name fileName
				FROM detections
				WHERE Sci_Name = ?
				ORDER BY
					Date DESC,
					Time DESC
				LIMIT ?
				OFFSET ?
		`);

    return this.detectionsBySpeciesQuery.all(sciName, limit, offset);
  }

  private getSpeciesByDateQuery?: Statement<[string], DetectionStats>;
  getSpeciesByDate(date: string | number | Date = new Date()) {
    const formattedDate = format(date, 'yyyy-MM-dd');
    this.getSpeciesByDateQuery =
      this.getSpeciesByDateQuery ??
      this.db.prepare(`
				SELECT
					d_today.Com_Name commonName,
					d_today.Sci_Name sciName,
					d_today.Date date,
					d_today.Time time,
					MAX(d_today.Confidence) as maxConfidence,
					(SELECT MAX(Date) FROM detections d_prev WHERE d_prev.Sci_Name = d_today.Sci_Name AND d_prev.Date < DATE('now', 'localtime')) as lastSeenDate,
					(SELECT COUNT(*) FROM detections d_occ WHERE d_occ.Sci_Name = d_today.Sci_Name AND d_occ.Date = DATE('now', 'localtime')) as occurrenceCount
				FROM detections d_today
				WHERE d_today.Date = ?
				GROUP BY d_today.Sci_Name
				ORDER BY
					Time DESC
		`);

    return this.getSpeciesByDateQuery.all(formattedDate);
  }

  private deleteDetectionQuery?: Statement<[string]>;
  deleteDetection(recordingName: string) {
    this.deleteDetectionQuery =
      this.deleteDetectionQuery ??
      this.db.prepare(`
				DELETE
				FROM detections
				WHERE File_Name = ?
		`);

    return this.deleteDetectionQuery.run(recordingName);
  }

  private getDetectionQuery?: Statement<[string], Detection>;
  getByRecordingName(recordingName: string) {
    this.getDetectionQuery =
      this.getDetectionQuery ??
      this.db.prepare(`
				SELECT
					Com_Name commonName,
					Sci_Name sciName,
					Date date,
					Time time, 
					Confidence confidence, 
					File_Name fileName
				FROM detections
				WHERE File_Name = ?
		`);

    return this.getDetectionQuery.get(recordingName);
  }

  getStats() {
    const totalCountQ = this.db.prepare<unknown[], { c: number }>(
      'SELECT COUNT(*) c FROM detections',
    );
    const todayCountQ = this.db.prepare<unknown[], { c: number }>(
      `SELECT COUNT(*) c FROM detections WHERE Date == DATE('now', 'localtime')`,
    );
    const hourCountQ = this.db.prepare<unknown[], { c: number }>(
      `SELECT COUNT(*) c FROM detections WHERE Date == Date('now', 'localtime') AND TIME >= TIME('now', 'localtime', '-1 hour')`,
    );
    const speciesTodayQ = this.db.prepare<unknown[], { c: number }>(
      `SELECT COUNT(DISTINCT(Sci_Name)) c FROM detections WHERE Date == Date('now','localtime')`,
    );
    const speciesTotalQ = this.db.prepare<unknown[], { c: number }>(
      'SELECT COUNT(DISTINCT(Sci_Name)) c FROM detections',
    );

    return {
      hourCount: hourCountQ.get()?.c ?? 0,
      todayCount: todayCountQ.get()?.c ?? 0,
      totalCount: totalCountQ.get()?.c ?? 0,

      speciesTally: speciesTodayQ.get()?.c ?? 0,
      totalSpeciesTally: speciesTotalQ.get()?.c ?? 0,
    };
  }
}
