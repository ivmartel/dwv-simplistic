import {describe, test, expect} from 'vitest';
import {getQuantificationGroups} from '../../src/gui/quantification.js';

describe('getQuantificationGroups', () => {
  test('undefined quantification', () => {
    expect(getQuantificationGroups(undefined)).toStrictEqual([]);
  });

  test('empty quantification', () => {
    expect(getQuantificationGroups({})).toStrictEqual([]);
  });

  test('groups, labels, units and order', () => {
    const quantification = {
      mean: {value: 35.4712, unit: 'HU'},
      length: {value: 12.34567, unit: 'unit.mm'},
      stdDev: {value: 0.12345},
      surface: {value: 1.5, unit: 'unit.cm2'},
      angle: {value: 45, unit: 'unit.degree'},
      someKey: {value: 150.25},
      p25: {value: 10, unit: 'HU'},
      width: {value: 10, unit: 'unit.mm'},
      height: {value: 20, unit: 'unit.mm'}
    };
    const groups = getQuantificationGroups(quantification);
    expect(groups.map(group => group.title)).toStrictEqual([
      'Geometry', 'Pixel values'
    ]);
    // geometry (including unknown keys)
    expect(groups[0].items.map(item => item.label)).toStrictEqual([
      'length', 'area', 'angle', 'some key', 'width', 'height'
    ]);
    const values = groups[0].items.map(item => item.value);
    expect(values[0]).toMatch(/^12.35 mm$/);
    expect(values[1]).toMatch(/^1.50 cm²$/);
    expect(values[2]).toMatch(/^45.00°$/);
    // pixel values
    expect(groups[1].items.map(item => item.label)).toStrictEqual([
      'mean', 'standard deviation', '25th percentile'
    ]);
    expect(groups[1].items[0].value).toMatch(/^35.47 HU$/);
    expect(groups[1].items[1].value).toMatch(/^0.123$/);
    expect(groups[0].items[3].value).toMatch(/^150.3$/);
  });

  test('case insensitive keys', () => {
    const quantification = {
      stddev: {value: 1},
      STDDEV: {value: 2},
      Mean: {value: 3}
    };
    const groups = getQuantificationGroups(quantification);
    expect(groups).toHaveLength(1);
    expect(groups[0].title).toBe('Pixel values');
    expect(groups[0].items.map(item => item.label)).toStrictEqual([
      'standard deviation', 'standard deviation', 'mean'
    ]);
  });

  test('skips undefined values and empty groups', () => {
    const quantification = {
      radius: {value: 2, unit: 'unit.mm'},
      surface: undefined
    };
    const groups = getQuantificationGroups(quantification);
    expect(groups).toHaveLength(1);
    expect(groups[0].title).toBe('Geometry');
    expect(groups[0].items).toHaveLength(1);
    expect(groups[0].items[0].label).toBe('radius');
  });
});
