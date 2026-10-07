import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, switchMap, takeWhile, timer } from 'rxjs';
import { environment } from '../../environments/environment';
import { AnalysisResult, AnalyzeParams, Comparison, HistoryItem, JobState } from './models';
import { getUserId } from './user-id.interceptor';

@Injectable({ providedIn: 'root' })
export class BallitApi {
  private http = inject(HttpClient);
  private base = environment.apiBase;

  /** Sube el video y devuelve el id del análisis (respuesta 202). */
  analyze(p: AnalyzeParams): Observable<{ analysis_id: string; status: string }> {
    const body = new FormData();
    body.append('video', p.video);
    body.append('arm', p.arm);
    body.append('camera', p.camera ?? 'frente');
    body.append('focus', p.focus ?? 'completo');
    if (p.goal) body.append('goal', p.goal);
    if (p.trimStartS != null) body.append('trim_start_s', String(p.trimStartS));
    if (p.trimEndS != null) body.append('trim_end_s', String(p.trimEndS));
    return this.http.post<{ analysis_id: string; status: string }>(`${this.base}/analyze`, body);
  }

  getJob(id: string): Observable<JobState> {
    return this.http.get<JobState>(`${this.base}/analyze/${id}`);
  }

  /**
   * Consulta cada 1.5 s hasta terminar. Sigue emitiendo después de "done" mientras
   * `media_pending` sea true, porque los clips (clip_url) llegan después del análisis.
   */
  watch(id: string): Observable<JobState> {
    return timer(0, 1500).pipe(
      switchMap(() => this.getJob(id)),
      takeWhile((s) => s.status === 'processing' || s.media_pending === true, true),
    );
  }

  history(): Observable<HistoryItem[]> {
    return this.http.get<HistoryItem[]>(`${this.base}/history`);
  }

  historyItem(id: string): Observable<AnalysisResult> {
    return this.http.get<AnalysisResult>(`${this.base}/history/${id}`);
  }

  compare(beforeId: string, afterId: string, minChange?: number): Observable<Comparison> {
    return this.http.post<Comparison>(`${this.base}/compare`, {
      before_id: beforeId,
      after_id: afterId,
      min_change: minChange ?? null,
    });
  }

  remove(id: string): Observable<{ deleted: boolean }> {
    return this.http.delete<{ deleted: boolean }>(`${this.base}/history/${id}`);
  }

  /**
   * /files/... exige el header X-User-Id, y <img>/<video> no pueden enviarlo.
   * Se descarga como blob (el interceptor agrega el header) y se usa un object URL.
   * Acuérdate de llamar URL.revokeObjectURL cuando ya no lo uses.
   */
  mediaUrl(path: string): Observable<string> {
    return this.http
      .get(`${this.base}${path}`, { responseType: 'blob' })
      .pipe(map((blob) => URL.createObjectURL(blob)));
  }

  get userId(): string {
    return getUserId();
  }
}
