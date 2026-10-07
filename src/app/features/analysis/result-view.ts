import { Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SecureMedia } from '../../shared/secure-media';
import { ScoreRing } from '../../shared/score-ring';
import { VERDICT_LABEL, featureLabel, fmtValue } from '../../core/format';
import { AnalysisResult } from '../../core/models';
import { AngleChart } from './angle-chart';

type Tab = 'resumen' | 'coach' | 'tiros' | 'grafica';

@Component({
  selector: 'app-result-view',
  imports: [RouterLink, SecureMedia, AngleChart, ScoreRing],
  templateUrl: './result-view.html',
})
export class ResultView {
  result = input.required<AnalysisResult>();
  mediaPending = input(false);

  tab = signal<Tab>('resumen');
  protected tabs: { id: Tab; label: string }[] = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'coach', label: 'Coach' },
    { id: 'tiros', label: 'Tiros' },
    { id: 'grafica', label: 'Gráfica' },
  ];

  protected verdictLabel = VERDICT_LABEL;
  protected metric = computed(() => featureLabel(this.result().rule));
  protected topIssue = computed(() => this.result().coach.puedes_mejorar[0] ?? null);

  protected value(v: number | null | undefined): string {
    return fmtValue(v, this.result().rule);
  }
}
