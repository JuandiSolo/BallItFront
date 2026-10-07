import { Rule, Verdict } from './models';

export const VERDICT_LABEL: Record<Verdict, string> = {
  bueno: 'Bueno',
  dudoso: 'Dudoso',
  malo: 'Malo',
};

export function featureLabel(rule: Rule): string {
  if (rule.feature.startsWith('abduction')) return 'Apertura del codo';
  if (rule.feature.startsWith('flare')) return 'Separación del codo y el hombro';
  if (rule.feature.startsWith('elbow_vs_wrist')) return 'Codo respecto a la muñeca';
  return rule.feature;
}

export function fmtValue(value: number | null | undefined, rule: Rule): string {
  if (value == null) return '–';
  return rule.unit === 'grados' ? `${value.toFixed(1)}°` : `${value.toFixed(2)} × hombro`;
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
}
