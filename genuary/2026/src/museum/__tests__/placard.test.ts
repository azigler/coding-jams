/**
 * Unit tests for the Placard System
 *
 * Tests the dayInfoMap data and getDayInfo function.
 * These are pure data tests that don't require Three.js or DOM mocking.
 */

import { describe, it, expect } from 'vitest';
import { dayInfoMap, getDayInfo, type DayInfo } from '../exhibits/placard';

// ============================================================================
// Tests
// ============================================================================

describe('Placard System - Day Info Map', () => {
  describe('dayInfoMap structure', () => {
    it('should have entries for all 31 days', () => {
      for (let day = 1; day <= 31; day++) {
        expect(dayInfoMap[day]).toBeDefined();
        expect(dayInfoMap[day].dayNumber).toBe(day);
      }
    });

    it('should have required properties for each day', () => {
      for (let day = 1; day <= 31; day++) {
        const info = dayInfoMap[day];
        expect(info).toHaveProperty('dayNumber');
        expect(info).toHaveProperty('title');
        expect(info).toHaveProperty('description');
        expect(typeof info.dayNumber).toBe('number');
        expect(typeof info.title).toBe('string');
        expect(typeof info.description).toBe('string');
      }
    });

    it('should have non-empty titles for all days', () => {
      for (let day = 1; day <= 31; day++) {
        expect(dayInfoMap[day].title.length).toBeGreaterThan(0);
      }
    });

    it('should have non-empty descriptions for all days', () => {
      for (let day = 1; day <= 31; day++) {
        expect(dayInfoMap[day].description.length).toBeGreaterThan(0);
      }
    });

    it('should have credit information for most days', () => {
      let daysWithCredit = 0;
      for (let day = 1; day <= 31; day++) {
        if (dayInfoMap[day].credit) {
          daysWithCredit++;
        }
      }
      // Most days should have credit info
      expect(daysWithCredit).toBeGreaterThan(25);
    });
  });

  describe('Specific day content', () => {
    it('Day 1 should be "One Color, One Shape"', () => {
      const day1 = dayInfoMap[1];
      expect(day1.title).toBe('One Color, One Shape');
      expect(day1.credit).toBe('Piero');
    });

    it('Day 7 should be "Boolean Algebra"', () => {
      const day7 = dayInfoMap[7];
      expect(day7.title).toBe('Boolean Algebra');
      expect(day7.credit).toBe('PaoloCurtoni');
    });

    it('Day 11 should be "Quine"', () => {
      const day11 = dayInfoMap[11];
      expect(day11.title).toBe('Quine');
      expect(day11.description).toContain('source code');
    });

    it('Day 31 should be "GLSL Day"', () => {
      const day31 = dayInfoMap[31];
      expect(day31.title).toBe('GLSL Day');
      expect(day31.description).toContain('shader');
    });
  });

  describe('Title uniqueness', () => {
    it('should have unique titles for each day', () => {
      const titles = new Set<string>();
      for (let day = 1; day <= 31; day++) {
        const title = dayInfoMap[day].title;
        expect(titles.has(title)).toBe(false);
        titles.add(title);
      }
    });
  });

  describe('Day number consistency', () => {
    it('should have matching dayNumber property and key', () => {
      for (const [key, info] of Object.entries(dayInfoMap)) {
        expect(info.dayNumber).toBe(parseInt(key, 10));
      }
    });
  });
});

describe('Placard System - getDayInfo', () => {
  describe('Valid day numbers', () => {
    it('should return day info for valid days', () => {
      for (let day = 1; day <= 31; day++) {
        const info = getDayInfo(day);
        expect(info).toBeDefined();
        expect(info?.dayNumber).toBe(day);
      }
    });

    it('should return the same object as dayInfoMap', () => {
      for (let day = 1; day <= 31; day++) {
        const info = getDayInfo(day);
        expect(info).toBe(dayInfoMap[day]);
      }
    });
  });

  describe('Invalid day numbers', () => {
    it('should return undefined for day 0', () => {
      expect(getDayInfo(0)).toBeUndefined();
    });

    it('should return undefined for negative days', () => {
      expect(getDayInfo(-1)).toBeUndefined();
      expect(getDayInfo(-100)).toBeUndefined();
    });

    it('should return undefined for day 32', () => {
      expect(getDayInfo(32)).toBeUndefined();
    });

    it('should return undefined for very large day numbers', () => {
      expect(getDayInfo(100)).toBeUndefined();
      expect(getDayInfo(999)).toBeUndefined();
    });
  });

  describe('Return type', () => {
    it('should return DayInfo type for valid days', () => {
      const info = getDayInfo(1);
      expect(info).toBeDefined();

      // Type check properties
      const dayInfo = info as DayInfo;
      expect(typeof dayInfo.dayNumber).toBe('number');
      expect(typeof dayInfo.title).toBe('string');
      expect(typeof dayInfo.description).toBe('string');
    });
  });
});

describe('Placard Content Quality', () => {
  describe('Description length', () => {
    it('should have concise descriptions (under 100 characters)', () => {
      for (let day = 1; day <= 31; day++) {
        const desc = dayInfoMap[day].description;
        expect(desc.length).toBeLessThan(100);
      }
    });

    it('should have descriptions of at least 10 characters', () => {
      for (let day = 1; day <= 31; day++) {
        const desc = dayInfoMap[day].description;
        expect(desc.length).toBeGreaterThan(10);
      }
    });
  });

  describe('Title length', () => {
    it('should have titles under 50 characters', () => {
      for (let day = 1; day <= 31; day++) {
        const title = dayInfoMap[day].title;
        expect(title.length).toBeLessThan(50);
      }
    });
  });

  describe('Credit format', () => {
    it('should have credits without URLs or links', () => {
      for (let day = 1; day <= 31; day++) {
        const credit = dayInfoMap[day].credit;
        if (credit) {
          expect(credit).not.toContain('http');
          expect(credit).not.toContain('www.');
          expect(credit).not.toContain('@');
        }
      }
    });
  });
});
