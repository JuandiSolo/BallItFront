import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EMPTY, catchError, map, switchMap, tap } from 'rxjs';
import { BallitApi } from '../../core/ballit-api.service';
import { toApiError } from '../../core/error.util';
import { ApiError, JobState } from '../../core/models';
import { ResultView } from './result-view';

@Component({
  selector: 'app-analysis',
  imports: [RouterLink, ResultView],
  templateUrl: './analysis.html',
})
export class AnalysisPage {
  private route = inject(ActivatedRoute);
  private api = inject(BallitApi);

  job = signal<JobState | null>(null);
  httpError = signal<ApiError | null>(null);

  /** Error del job (NO_PERSON, NO_SHOT...) o de la red/HTTP. */
  error = computed<ApiError | null>(() => this.httpError() ?? this.job()?.error ?? null);
  percent = computed(() => Math.round((this.job()?.progress ?? 0) * 100));

  constructor() {
    this.route.paramMap
      .pipe(
        map((p) => p.get('id') ?? ''),
        tap(() => {
          this.job.set(null);
          this.httpError.set(null);
        }),
        switchMap((id) =>
          this.api.watch(id).pipe(
            catchError((e) => {
              this.httpError.set(toApiError(e));
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((j) => this.job.set(j));
  }

  isRecordingIssue(code: string): boolean {
    return code === 'NO_PERSON' || code === 'NO_SHOT';
  }
}
