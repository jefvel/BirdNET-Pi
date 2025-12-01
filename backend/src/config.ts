export type Config = ReturnType<typeof getConfig>;
export const getConfig = () => {
  const env = process.env;
  console.log(process.env);

  return {
    SITE_NAME: env.SITE_NAME,
    LATITUDE: env.LATITUDE,
    LONGITUDE: env.LONGITUDE,

    MODEL: env.MODEL,
    SF_THRESH: env.SF_THRESH,
    DATA_MODEL_VERSION: env.DATA_MODEL_VERSION,

    BIRDWEATHER_ID: env.BIRDWEATHER_ID,

    CADDY_PWD: env.CADDY_PWD,

    ICE_PWD: env.ICE_PWD,

    BIRDNETPI_URL: env.BIRDNETPI_URL,

    // If RTSP_STREAM is set, the system will use the RTSP stream as its audio
    // source instead of recording its own audio. If this variable is kept empty,
    // BirdNET-Pi will default to recording its own audio.

    RTSP_STREAM: env.RTSP_STREAM,

    // RTSP_STREAM_TO_LIVESTREAM is the index, so 0 means the first stream
    RTSP_STREAM_TO_LIVESTREAM: env.RTSP_STREAM_TO_LIVESTREAM,

    // -----------------------  Apprise Miscellanous Configuration -------------------#

    APPRISE_NOTIFICATION_TITLE: env.APPRISE_NOTIFICATION_TITLE,
    APPRISE_NOTIFY_EACH_DETECTION: env.APPRISE_NOTIFY_EACH_DETECTION,
    APPRISE_NOTIFY_NEW_SPECIES: env.APPRISE_NOTIFY_NEW_SPECIES,
    APPRISE_WEEKLY_REPORT: env.APPRISE_WEEKLY_REPORT,
    APPRISE_NOTIFY_NEW_SPECIES_EACH_DAY:
      env.APPRISE_NOTIFY_NEW_SPECIES_EACH_DAY,
    APPRISE_MINIMUM_SECONDS_BETWEEN_NOTIFICATIONS_PER_SPECIES:
      env.APPRISE_MINIMUM_SECONDS_BETWEEN_NOTIFICATIONS_PER_SPECIES,
    APPRISE_ONLY_NOTIFY_SPECIES_NAMES: env.APPRISE_ONLY_NOTIFY_SPECIES_NAMES,
    APPRISE_ONLY_NOTIFY_SPECIES_NAMES_2:
      env.APPRISE_ONLY_NOTIFY_SPECIES_NAMES_2,

    //----------------------  Image Provider Configuration ------------------------#
    // WIKIPEDIA or FLICKR (Flickr requires API key)
    IMAGE_PROVIDER: env.IMAGE_PROVIDER,

    //#----------------------  Flickr Images API Configuration -----------------------#
    //## If FLICKR_API_KEY is set, the web interface will try and display bird images
    //## for each detection. If FLICKR_FILTER_EMAIL is set, the images will only be
    //## displayed from a particular Flickr user (e.g. yourself).

    FLICKR_API_KEY: env.FLICKR_API_KEY,
    FLICKR_FILTER_EMAIL: env.FLICKR_FILTER_EMAIL,

    INFO_SITE: env.INFO_SITE,

    COLOR_SCHEME: env.COLOR_SCHEME,

    FULL_DISK: env.FULL_DISK,

    PURGE_THRESHOLD: env.PURGE_THRESHOLD,

    MAX_FILES_SPECIES: env.MAX_FILES_SPECIES,

    BIRDNET_USER: env.BIRDNET_USER,

    RECS_DIR: env.RECS_DIR,

    REC_CARD: env.REC_CARD,

    PROCESSED: env.PROCESSED,

    EXTRACTED: env.EXTRACTED,

    OVERLAP: env.OVERLAP,

    CONFIDENCE: env.CONFIDENCE,

    SENSITIVITY: env.SENSITIVITY,

    FREQSHIFT_TOOL: env.FREQSHIFT_TOOL,

    FREQSHIFT_HI: env.FREQSHIFT_HI,
    FREQSHIFT_LO: env.FREQSHIFT_LO,

    FREQSHIFT_RECONNECT_DELAY: env.FREQSHIFT_RECONNECT_DELAY,

    FREQSHIFT_PITCH: env.FREQSHIFT_PITCH,

    CHANNELS: env.CHANNELS,

    PRIVACY_THRESHOLD: env.PRIVACY_THRESHOLD,

    RECORDING_LENGTH: env.RECORDING_LENGTH,

    EXTRACTION_LENGTH: env.EXTRACTION_LENGTH,

    AUDIOFMT: env.AUDIOFMT,

    DATABASE_LANG: env.DATABASE_LANG,

    HEARTBEAT_URL: env.HEARTBEAT_URL,

    SILENCE_UPDATE_INDICATOR: env.SILENCE_UPDATE_INDICATOR,

    AUTOMATIC_UPDATE: env.AUTOMATIC_UPDATE,

    RAW_SPECTROGRAM: env.RAW_SPECTROGRAM,

    CUSTOM_IMAGE: env.CUSTOM_IMAGE,
    CUSTOM_IMAGE_TITLE: env.CUSTOM_IMAGE_TITLE,

    RARE_SPECIES_THRESHOLD: env.RARE_SPECIES_THRESHOLD,
  };
};
