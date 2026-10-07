import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { BallitApi } from '../../core/ballit-api.service';
import { AnalysisResult, Shot } from '../../core/models';
import { ResultView } from './result-view';

describe('unified feedback', () => {
  const shot = (n: number): Shot => ({
    n,
    value: 20,
    score: 80,
    verdict: 'bueno',
    has_pause: false,
    pause_s: null,
    frames: { start: 0, set: 1, release: 2, prep: 1, peak: 2 },
    times_s: { set: n - 0.1, release: n },
    frame_url: null,
    clip_url: null,
  });
  const result = (count: number): AnalysisResult => ({
    analysis_id: 'test',
    created_at: new Date().toISOString(),
    config: { arm: 'right', camera: 'frente', focus: 'completo', goal: null },
    video: {
      available: false,
      url: '',
      width: 640,
      height: 480,
      fps: 25,
      n_frames: 0,
      duration_s: 0,
    },
    quality: { detection_rate: 0, note: null, warnings: [] },
    rule: {
      feature: 'abduction',
      unit: 'grados',
      direction: '<',
      t: 26,
      band: 4,
      good_mean: 16,
      good_sd: 4,
      bad_mean: 44,
      bad_sd: 10,
      angle_name: 'right_shoulder_angle',
    },
    shots: Array.from({ length: count }, (_, i) => shot(i + 1)),
    summary: {
      n: count,
      mean: 20,
      score: 80,
      sd: null,
      n_bueno: count,
      n_dudoso: 0,
      n_malo: 0,
      pct_bueno: 100,
      pct_pausa: 0,
    },
    frames: [],
    landmark_names: [],
    coach: {
      resumen: 'Mantén el control',
      lo_hiciste_bien: ['Buen ritmo'],
      puedes_mejorar: [],
      sobre_tu_objetivo: null,
      progreso: null,
      pedir_regrabar: false,
    },
  });
  const api = {
    history: jasmine.createSpy().and.returnValue(of([])),
    mediaUrl: jasmine.createSpy(),
  };
  beforeEach(() => {
    api.history.and.returnValue(of([]));
    TestBed.configureTestingModule({
      imports: [ResultView],
      providers: [provideRouter([]), { provide: BallitApi, useValue: api }],
    });
  });
  it('keeps coach and angle chart visible with no feedback tabs; only charts progress for multiple shots', () => {
    const fixture = TestBed.createComponent(ResultView);
    fixture.componentRef.setInput('result', result(1));
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('[role="tablist"]')).toBeNull();
    expect(el.querySelector('app-shot-progress')).toBeNull();
    expect(el.querySelector('app-angle-chart')).not.toBeNull();
    expect(el.textContent).toContain('Buen ritmo');
    expect(el.textContent).not.toContain('Tiro 1');
    fixture.componentRef.setInput('result', result(2));
    fixture.detectChanges();
    expect(el.querySelector('app-shot-progress')).not.toBeNull();
    expect(
      el.querySelector('app-result-view > :first-child')?.tagName ?? el.firstElementChild?.tagName,
    ).toBe('APP-ANALYSIS-VIDEO');
  });
  it('keeps feedback available when history cannot load and does not invent a streak', () => {
    api.history.and.returnValue(throwError(() => new Error('offline')));
    const fixture = TestBed.createComponent(ResultView);
    fixture.componentRef.setInput('result', result(1));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.training-streak')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Mantén el control');
  });
});
