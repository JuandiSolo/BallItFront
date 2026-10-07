import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SecureMedia } from '../../shared/secure-media';
import { ScoreRing } from '../../shared/score-ring';
import { VERDICT_LABEL, featureLabel, fmtValue } from '../../core/format';
import { AnalysisResult } from '../../core/models';
import { AngleChart } from './angle-chart';
import { AnalysisVideo } from './analysis-video';
import { ShotProgress } from './shot-progress';
import { BallitApi } from '../../core/ballit-api.service';
import { trainingStreak } from '../../core/streak';

@Component({
  selector: 'app-result-view',
  imports: [RouterLink, SecureMedia, AngleChart, ScoreRing, AnalysisVideo, ShotProgress],
  templateUrl: './result-view.html',
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .training-streak {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .training-streak > span {
        font-size: 1.8rem;
      }
      .training-streak p {
        margin: 0;
      }
      .feedback-shots {
        display: grid;
        gap: 12px;
      }
      .section-title {
        margin: 6px 0 14px;
      }
    `,
  ],
})
export class ResultView {
  result = input.required<AnalysisResult>();
  mediaPending = input(false);

  private api = inject(BallitApi);
  private historyDates = signal<string[] | null>(null);
  protected orderedShots = computed(() =>
    [...this.result().shots].sort((a, b) => a.times_s.release - b.times_s.release),
  );
  protected streak = computed(() => {
    const dates = this.historyDates();
    return dates ? trainingStreak([...dates, this.result().created_at]) : 0;
  });

  constructor() {
    const id = computed(() => this.result().analysis_id);
    effect((cleanup) => {
      id();
      this.historyDates.set(null);
      const sub = this.api.history().subscribe({
        next: (history) => this.historyDates.set(history.map((item) => item.created_at)),
        error: () => this.historyDates.set(null),
      });
      cleanup(() => sub.unsubscribe());
    });
  }

  protected verdictLabel = VERDICT_LABEL;
  protected metric = computed(() => featureLabel(this.result().rule));
  protected topIssue = computed(() => this.result().coach.puedes_mejorar[0] ?? null);

  protected value(v: number | null | undefined): string {
    return fmtValue(v, this.result().rule);
  }
}
