import type DetectionRepository from "@/repositories/detection-repository.js";

export default class DetectionsService {
	detections: DetectionRepository;
	constructor(detections: DetectionRepository) {
		this.detections = detections;
	}

  getRecentDetections = (limit: number = 15, offset: number = 0) => {
    return this.detections.getRecentDetections(limit, offset);
  }

  getDetectionsByDay = (date: Date | string | number = new Date()) => {
    return this.detections.getDetectionsByDay(date);
  }

  getDetectionsBySpecies = (sciName: string, limit: number = 10, offset = 0) => {
		const total = this.detections.countDetectionsBySpecies(sciName);
    const detections = this.detections.getDetectionsBySpecies(sciName, limit, offset);
		return { detections, total };
  }

  getSpeciesByDate = (date: string | number | Date = new Date()) => {
		return this.detections.getSpeciesByDate(date);
  }

  deleteRecording = (recordingName: string) => {
    return this.detections.deleteDetection(recordingName);
  }

  getByRecordingName = (recordingName: string) => {
    return this.detections.getByRecordingName(recordingName);
  }

  getStats = () => {
		return this.detections.getStats();
  }
}