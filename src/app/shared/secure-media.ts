import { Component, effect, inject, input, signal } from '@angular/core';
import { BallitApi } from '../core/ballit-api.service';

/**
 * Muestra una imagen o video de /files/... (que exige el header X-User-Id).
 * Descarga el archivo como blob y libera el object URL al destruirse o cambiar de ruta.
 */
@Component({
  selector: 'app-secure-media',
  template: `
    @if (src(); as url) {
      @if (kind() === 'video') {
        <video [src]="url" controls playsinline loop muted preload="metadata"></video>
      } @else {
        <img [src]="url" [alt]="alt()" />
      }
    } @else {
      <div class="media-ph">{{ failed() ? 'No disponible' : 'Cargando…' }}</div>
    }
  `,
})
export class SecureMedia {
  private api = inject(BallitApi);

  path = input<string | null>(null);
  kind = input<'img' | 'video'>('img');
  alt = input('');

  protected src = signal<string | null>(null);
  protected failed = signal(false);

  constructor() {
    effect((onCleanup) => {
      const p = this.path();
      this.src.set(null);
      this.failed.set(false);
      if (!p) return;
      let url: string | null = null;
      const sub = this.api.mediaUrl(p).subscribe({
        next: (u) => {
          url = u;
          this.src.set(u);
        },
        error: () => this.failed.set(true),
      });
      onCleanup(() => {
        sub.unsubscribe();
        if (url) URL.revokeObjectURL(url);
      });
    });
  }
}
