import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

const KEY = 'ballit_user_id';

/** UUID por instalación: se crea una vez y se conserva (la API lo exige en X-User-Id). */
export function getUserId(): string {
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

export const userIdInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiBase)) return next(req);
  return next(req.clone({ setHeaders: { 'X-User-Id': getUserId() } }));
};
