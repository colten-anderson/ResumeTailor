import { describe, it, expect } from 'vitest';
import { extractKeywords, escapeRegExp } from './keywords';

describe('extractKeywords', () => {
  it('should extract keywords from simple text', () => {
    const text = 'React TypeScript JavaScript Node.js Express PostgreSQL';
    const keywords = extractKeywords(text);

    expect(keywords).toContain('react');
    expect(keywords).toContain('typescript');
    expect(keywords).toContain('javascript');
    expect(keywords).toContain('node');
    expect(keywords).toContain('express');
    expect(keywords).toContain('postgresql');
  });

  it('should filter out stop words', () => {
    const text = 'The candidate should have experience with React and Node.js';
    const keywords = extractKeywords(text);

    expect(keywords).not.toContain('the');
    expect(keywords).not.toContain('should');
    expect(keywords).not.toContain('have');
    expect(keywords).not.toContain('with');
    expect(keywords).not.toContain('and');
    expect(keywords).toContain('candidate');
    expect(keywords).toContain('experience');
    expect(keywords).toContain('react');
    expect(keywords).toContain('node');
  });

  it('should filter out words shorter than 4 characters', () => {
    const text = 'I am a senior developer with CSS and UI design skills';
    const keywords = extractKeywords(text);

    expect(keywords).not.toContain('i');
    expect(keywords).not.toContain('am');
    expect(keywords).not.toContain('css');
    expect(keywords).toContain('senior');
    expect(keywords).toContain('developer');
    expect(keywords).toContain('design');
    expect(keywords).toContain('skills');
  });

  it('should normalize text to lowercase', () => {
    const text = 'JavaScript TYPESCRIPT React NODE.js';
    const keywords = extractKeywords(text);

    expect(keywords).toContain('javascript');
    expect(keywords).toContain('typescript');
    expect(keywords).toContain('react');
    expect(keywords).toContain('node');
  });

  it('should remove duplicates', () => {
    const text = 'React React React TypeScript TypeScript JavaScript';
    const keywords = extractKeywords(text);

    const reactCount = keywords.filter(k => k === 'react').length;
    const tsCount = keywords.filter(k => k === 'typescript').length;

    expect(reactCount).toBe(1);
    expect(tsCount).toBe(1);
  });

  it('should handle empty string', () => {
    const keywords = extractKeywords('');
    expect(keywords).toEqual([]);
  });

  it('should handle text with only stop words', () => {
    const text = 'the and for with that have this from';
    const keywords = extractKeywords(text);
    expect(keywords).toEqual([]);
  });

  it('should handle text with only short words', () => {
    const text = 'a b c is it be do we me';
    const keywords = extractKeywords(text);
    expect(keywords).toEqual([]);
  });

  it('should respect the limit parameter', () => {
    const text = Array(100).fill('keyword').map((word, i) => `${word}${i}`).join(' ');
    const keywords = extractKeywords(text, 10);
    expect(keywords.length).toBeLessThanOrEqual(10);
  });

  it('should use default limit of 40', () => {
    const text = Array(100).fill('keyword').map((word, i) => `${word}${i}`).join(' ');
    const keywords = extractKeywords(text);
    expect(keywords.length).toBeLessThanOrEqual(40);
  });

  it('should handle special characters', () => {
    const text = 'C++ C# React.js Node.js Python™ Java®';
    const keywords = extractKeywords(text);

    // Special characters should be removed/normalized
    expect(keywords.length).toBeGreaterThan(0);
  });

  it('should extract keywords from job description', () => {
    const jobDescription = `
      We are looking for a Senior Full-Stack Engineer with 5+ years of experience.
      Required skills: JavaScript, TypeScript, React, Node.js, PostgreSQL, Docker.
      Nice to have: AWS, Kubernetes, GraphQL, Redis.
    `;
    const keywords = extractKeywords(jobDescription);

    expect(keywords).toContain('senior');
    expect(keywords).toContain('full');
    expect(keywords).toContain('stack');
    expect(keywords).toContain('engineer');
    expect(keywords).toContain('javascript');
    expect(keywords).toContain('typescript');
    expect(keywords).toContain('react');
    expect(keywords).toContain('node');
    expect(keywords).toContain('postgresql');
    expect(keywords).toContain('docker');
    expect(keywords).not.toContain('the');
    expect(keywords).not.toContain('and');
  });

  it('should extract keywords from resume', () => {
    const resume = `
      John Doe - Senior Software Engineer
      Experience: 5 years in full-stack development
      Skills: JavaScript, TypeScript, React, Node.js, Express, MongoDB
      Education: Bachelor of Computer Science
    `;
    const keywords = extractKeywords(resume);

    expect(keywords).toContain('john');
    expect(keywords).toContain('senior');
    expect(keywords).toContain('software');
    expect(keywords).toContain('engineer');
    expect(keywords).toContain('experience');
    expect(keywords).toContain('development');
    expect(keywords).toContain('skills');
    expect(keywords).toContain('javascript');
  });

  it('should handle Unicode characters', () => {
    const text = 'José González résumé café naïve';
    const keywords = extractKeywords(text);

    // Should normalize Unicode characters
    expect(keywords.length).toBeGreaterThan(0);
  });

  it('should handle numbers in keywords', () => {
    const text = 'HTML5 CSS3 ES6 React18 Node16';
    const keywords = extractKeywords(text);

    expect(keywords).toContain('html5');
    expect(keywords).toContain('css3');
    expect(keywords).toContain('react18');
    expect(keywords).toContain('node16');
  });

  it('should handle very long text efficiently', () => {
    const longText = Array(1000).fill('development experience software engineering').join(' ');
    const startTime = Date.now();
    const keywords = extractKeywords(longText);
    const endTime = Date.now();

    expect(keywords.length).toBeGreaterThan(0);
    expect(endTime - startTime).toBeLessThan(100); // Should complete in less than 100ms
  });
});

describe('escapeRegExp', () => {
  it('should escape special regex characters', () => {
    const input = '.+*?^${}()|[]\\';
    const escaped = escapeRegExp(input);

    expect(escaped).toBe('\\.\\+\\*\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\');
  });

  it('should not modify regular characters', () => {
    const input = 'abcABC123';
    const escaped = escapeRegExp(input);

    expect(escaped).toBe('abcABC123');
  });

  it('should escape mixed content', () => {
    const input = 'React.js (v18+)';
    const escaped = escapeRegExp(input);

    expect(escaped).toBe('React\\.js \\(v18\\+\\)');
  });

  it('should handle empty string', () => {
    const escaped = escapeRegExp('');
    expect(escaped).toBe('');
  });

  it('should escape all special characters in a complex string', () => {
    const input = 'function test() { return /[a-z]+/gi; }';
    const escaped = escapeRegExp(input);

    // Should escape all special regex characters
    expect(escaped).toContain('\\(');
    expect(escaped).toContain('\\)');
    expect(escaped).toContain('\\{');
    expect(escaped).toContain('\\}');
    expect(escaped).toContain('\\[');
    expect(escaped).toContain('\\]');
    expect(escaped).toContain('\\+');
  });

  it('should make escaped string safe for use in RegExp', () => {
    const input = 'C++ (version 17+) with [brackets] and $variables';
    const escaped = escapeRegExp(input);

    // Should not throw when creating RegExp
    expect(() => new RegExp(escaped)).not.toThrow();

    const regex = new RegExp(escaped);
    expect(input).toMatch(regex);
  });
});
