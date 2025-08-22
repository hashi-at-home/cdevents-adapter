import { describe, it, expect } from 'vitest'
import app from '../index'

describe('Hono App', () => {
  describe('GET /', () => {
    it('should return 200 status', async () => {
      const req = new Request('http://localhost/')
      const res = await app.request(req)

      expect(res.status).toBe(200)
    })

    it('should return HTML content', async () => {
      const req = new Request('http://localhost/')
      const res = await app.request(req)

      expect(res.headers.get('Content-Type')).toContain('text/html')
    })

    it('should contain Hello text', async () => {
      const req = new Request('http://localhost/')
      const res = await app.request(req)
      const html = await res.text()

      expect(html).toContain('Hello!')
    })
  })

  describe('404 handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const req = new Request('http://localhost/non-existent')
      const res = await app.request(req)

      expect(res.status).toBe(404)
    })
  })
})
