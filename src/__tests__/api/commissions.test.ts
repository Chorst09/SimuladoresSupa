import { NextRequest } from 'next/server';
import { GET, PUT } from '@/app/api/commissions/route';

// Mock do supabase
jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: { id: 1, months_12: 1.2 }, error: null })),
        order: jest.fn(() => Promise.resolve({ data: [{ id: 1, months_12: 1.2 }], error: null }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null }))
      }))
    }))
  }
}));

describe('/api/commissions', () => {
  describe('GET', () => {
    it('should return commission data successfully', async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('channelSeller');
      expect(data).toHaveProperty('channelDirector');
      expect(data).toHaveProperty('seller');
      expect(data).toHaveProperty('channelInfluencer');
      expect(data).toHaveProperty('channelIndicator');
    });
  });

  describe('PUT', () => {
    it('should update commission data successfully', async () => {
      const requestBody = {
        table: 'channel_seller',
        data: { id: 1, months_12: 2.5 }
      };

      const request = new NextRequest('http://localhost:3000/api/commissions', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ success: true });
    });

    it('should return error for missing table', async () => {
      const requestBody = {
        data: { id: 1, months_12: 2.5 }
      };

      const request = new NextRequest('http://localhost:3000/api/commissions', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Tabela e dados são obrigatórios');
    });

    it('should return error for invalid table', async () => {
      const requestBody = {
        table: 'invalid_table',
        data: { id: 1, months_12: 2.5 }
      };

      const request = new NextRequest('http://localhost:3000/api/commissions', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Tabela inválida');
    });
  });
});