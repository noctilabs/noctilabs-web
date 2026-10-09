import { describe, expect, test } from 'vitest';
import { DUR, isOn, nextAct, resumeAdvances, stepAt } from '../src/scripts/montage';

// Lógica pura del montaje del home (spec 010 §3.A y §3.C).

describe('stepAt', () => {
  test('el último estado cuyo ms ≤ t, o p antes del primero', () => {
    const st = '0:run,1900:wait,5400:run,6300:done';
    expect(stepAt('2100:wait,4800:ok', 0)).toBe('p');
    expect(stepAt(st, 0)).toBe('run');
    expect(stepAt(st, 1899)).toBe('run');
    expect(stepAt(st, 1900)).toBe('wait');
    expect(stepAt(st, DUR[2])).toBe('done');
  });
});

describe('isOn', () => {
  test('encendido entre at (incluido) y to (excluido)', () => {
    expect(isOn(2400, 3000, 2399)).toBe(false);
    expect(isOn(2400, 3000, 2400)).toBe(true);
    expect(isOn(2400, 3000, 3000)).toBe(false);
    expect(isOn(8300, undefined, DUR[1])).toBe(true);
  });
});

describe('nextAct', () => {
  test('avanza y, al volver al acto 0, alterna quién pregunta', () => {
    expect(nextAct(0, 0)).toEqual({ act: 1, who: 0 });
    expect(nextAct(1, 0)).toEqual({ act: 2, who: 0 });
    expect(nextAct(2, 0)).toEqual({ act: 0, who: 1 });
    expect(nextAct(2, 1)).toEqual({ act: 0, who: 0 });
  });
});

describe('resumeAdvances', () => {
  test('con una elección terminada, «Reanudar» pasa al acto siguiente', () => {
    expect(resumeAdvances(true, 1, DUR[1])).toBe(true);
  });
  test('con una elección pausada a mitad, sigue el mismo acto', () => {
    expect(resumeAdvances(true, 1, 2000)).toBe(false);
  });
  test('sin elección, sigue desde t', () => {
    expect(resumeAdvances(false, 1, DUR[1])).toBe(false);
  });
});
