export interface Detections {
  comName: string;
  confidence: string | null;
  cutoff: string | null;
  date: string | null;
  fileName: string;
  lat: string | null;
  lon: string | null;
  overlap: string | null;
  sciName: string;
  sens: string | null;
  time: string | null;
  week: string | null;

  locked: string | null;
}

export interface DB {
  detections: Detections;
}
