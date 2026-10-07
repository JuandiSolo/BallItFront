import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SecureMedia } from '../../shared/secure-media';
import { VERDICT_LABEL, featureLabel, fmtValue } from '../../core/format';
import { AnalysisResult } from '../../core/models';
import { AngleChart } from './angle-chart';

@Component({
  selector: 'app-result-view',
  imports: [RouterLink, SecureMedia, AngleChart],
  templateUrl: './result-view.html',
})
export class ResultView {
  result = input.required<AnalysisResult>();
  mediaPending = input(false);

  protected verdictLabel = VERDICT_LABEL;
  protected metric = computed(() => featureLabel(this.result().rule));

  protected value(v: number | null | undefined): string {
    return fmtValue(v, this.result().rule);
  }

  protected scoreClass = computed(() => {
    const s = this.result().summary.score;
    return s >= 70 ? 'good' : s >= 40 ? 'mid' : 'bad';
  });
}
