// Tipos del contrato de la API de BallIt (basados en api.py / services.py / example_result.json)

export type Arm = 'right' | 'left';
export type Camera = 'frente' | 'lateral' | 'diagonal';
export type Focus = 'brazo' | 'postura' | 'completo';
export type Verdict = 'bueno' | 'dudoso' | 'malo';

export interface ApiError {
  code: string; // BAD_FORMAT, NO_PERSON, NO_SHOT, VIDEO_TOO_LARGE, ANALYSIS_FAILED, ...
  message: string;
}

export interface AnalyzeParams {
  video: File;
  arm: Arm;
  camera?: Camera;
  focus?: Focus;
  goal?: string;
  trimStartS?: number;
  trimEndS?: number;
}

export interface Shot {
  n: number;
  value: number;
  score: number; // 0-100
  verdict: Verdict;
  has_pause: boolean;
  pause_s: number | null;
  frames: { start: number; set: number; release: number; prep: number; peak: number };
  times_s: { set: number; release: number };
  frame_url: string | null;
  clip_url: string | null; // puede ser null mientras se recodifica
}

export interface Summary {
  n: number;
  mean: number;
  score: number;
  sd: number | null;
  n_bueno: number;
  n_dudoso: number;
  n_malo: number;
  pct_bueno: number;
  pct_pausa: number;
}

export interface Rule {
  feature: string;
  direction: '<' | '>';
  t: number;
  band: number;
  good_mean: number;
  good_sd: number;
  bad_mean: number;
  bad_sd: number;
  angle_name: string;
  unit: string;
}

/** Un frame con 12 puntos normalizados 0..1 (orden de `landmark_names`). Si no hubo detección, p es null. */
export interface PoseFrame {
  i: number;
  t: number;
  ok: boolean;
  p: ([number, number] | null)[] | null;
  angle: number | null;
}

export interface CoachImprovement {
  titulo: string;
  que_pasa: string;
  por_que_importa: string;
  intenta_esto: string;
  prioridad: number;
}

export interface Coach {
  resumen: string;
  lo_hiciste_bien: string[];
  puedes_mejorar: CoachImprovement[];
  sobre_tu_objetivo: string | null;
  progreso: string | null;
  pedir_regrabar: boolean;
}

export interface AnalysisResult {
  analysis_id: string;
  created_at: string;
  config: { arm: Arm; camera: Camera; focus: Focus; goal: string | null };
  video: {
    url: string;
    width: number;
    height: number;
    fps: number;
    n_frames: number;
    duration_s: number;
    available: boolean;
  };
  quality: { detection_rate: number; note: string | null; warnings: string[] };
  rule: Rule;
  shots: Shot[];
  summary: Summary;
  landmark_names: string[];
  frames: PoseFrame[];
  coach: Coach;
}

export interface JobState {
  status: 'processing' | 'done' | 'error';
  progress: number; // 0..1
  step: string;
  media_pending?: boolean; // true mientras se generan los clips
  result?: AnalysisResult;
  error?: ApiError;
}

export interface HistoryItem {
  analysis_id: string;
  created_at: string;
  n: number;
  mean: number;
  score: number;
  pct_bueno: number;
  video: { available: boolean };
}

export interface Comparison {
  before: { mean: number; score: number; pct_bueno: number; n: number };
  after: { mean: number; score: number; pct_bueno: number; n: number };
  delta: { mean: number; score: number; pct_bueno: number };
  verdict: 'mejoro' | 'empeoro' | 'igual';
  min_change: number;
  warnings: string[];
  before_frame_url: string | null;
  after_frame_url: string | null;
}
