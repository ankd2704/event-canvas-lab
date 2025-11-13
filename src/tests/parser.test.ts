import { describe, it, expect } from 'vitest';
import { parseJSON, parseCSV, determineLane } from '../utils/parser';
import { sha256, hashEvent } from '../utils/crypto';

describe('Parser Tests', () => {
  it('should parse JSON events to canonical format', () => {
    const jsonData = [
      {
        timestamp: '2024-01-01T10:00:00Z',
        source: 'System',
        type: 'FileCreated',
        summary: 'Document created'
      }
    ];

    const events = parseJSON(jsonData);
    
    expect(events).toHaveLength(1);
    expect(events[0]).toHaveProperty('id');
    expect(events[0].timestamp).toBe('2024-01-01T10:00:00.000Z');
    expect(events[0].source).toBe('System');
    expect(events[0].type).toBe('FileCreated');
  });

  it('should parse CSV with common headers', () => {
    const csvText = `date,type,description,source
2024-01-01 10:00:00,File Activity,Created document.txt,File System
2024-01-01 10:01:00,Network,HTTP GET /api/data,Network Monitor`;

    const events = parseCSV(csvText);
    
    expect(events).toHaveLength(2);
    expect(events[0]).toHaveProperty('id');
    expect(events[0].type).toBe('File Activity');
    expect(events[0].summary).toContain('Created document.txt');
    expect(events[0].metadata).toHaveProperty('csvRow');
  });

  it('should preserve CSV metadata', () => {
    const csvText = `timestamp,event_type,message
2024-01-01T10:00:00Z,Test,Sample event`;

    const events = parseCSV(csvText);
    
    expect(events[0].metadata).toBeDefined();
    expect(events[0].metadata.csvRow).toBeDefined();
    expect(events[0].metadata.headers).toContain('timestamp');
  });

  it('should determine correct lane for events', () => {
    const memoryEvent = { type: 'Memory', source: 'RAM', summary: 'Memory allocation' } as any;
    const systemEvent = { type: 'System', source: 'Kernel', summary: 'Process started' } as any;
    const userEvent = { type: 'User', source: 'Auth', summary: 'User login' } as any;
    const networkEvent = { type: 'Network', source: 'TCP', summary: 'HTTP request' } as any;

    expect(determineLane(memoryEvent)).toBe(1);
    expect(determineLane(systemEvent)).toBe(2);
    expect(determineLane(userEvent)).toBe(3);
    expect(determineLane(networkEvent)).toBe(4);
  });
});

describe('Crypto Tests', () => {
  it('should calculate SHA-256 hash of string', async () => {
    const message = 'Hello World';
    const hash = await sha256(message);
    
    expect(hash).toHaveLength(64); // SHA-256 is 64 hex chars
    expect(hash).toMatch(/^[a-f0-9]+$/);
  });

  it('should calculate consistent hash for same event', async () => {
    const event = {
      id: 'test-1',
      timestamp: '2024-01-01T10:00:00Z',
      source: 'Test',
      type: 'Test',
      summary: 'Test event'
    };

    const hash1 = await hashEvent(event);
    const hash2 = await hashEvent(event);
    
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });

  it('should produce different hashes for different events', async () => {
    const event1 = { id: '1', timestamp: '2024-01-01', source: 'A', type: 'X', summary: 'Test 1' };
    const event2 = { id: '2', timestamp: '2024-01-02', source: 'B', type: 'Y', summary: 'Test 2' };

    const hash1 = await hashEvent(event1);
    const hash2 = await hashEvent(event2);
    
    expect(hash1).not.toBe(hash2);
  });
});
