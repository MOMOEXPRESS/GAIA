/**
 * Timeline routes — GET /timeline with filters + POST /timeline/event for
 * manual entries (Vol 5 §5 API & Interfaces).
 */
import { Router } from 'express';
import type { Response, NextFunction } from 'express';
import { z } from 'zod';
import type { TimelineEventType } from '@gaia/shared-types';
import { ValidationError } from '../../shared/errors';
import type { TimelineService } from '../../modules/timeline/application/timeline-service';
import type { AuthenticatedRequest } from '../middleware/auth';

const addEventSchema = z.object({
  eventType: z.enum(['SYMPTOM_LOG', 'NOTE']),
  timestamp: z.string(),
  data: z.record(z.unknown()),
});

export function createTimelineRoutes(timeline: TimelineService): Router {
  const router = Router();

  router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const events = await timeline.getTimeline({
        userId: req.auth!.userId,
        start: typeof req.query.start === 'string' ? req.query.start : undefined,
        end: typeof req.query.end === 'string' ? req.query.end : undefined,
        before: typeof req.query.before === 'string' ? req.query.before : undefined,
        types:
          typeof req.query.types === 'string'
            ? (req.query.types.split(',') as TimelineEventType[])
            : undefined,
        limit: typeof req.query.limit === 'string' ? Number(req.query.limit) : undefined,
      });
      res.json({ events });
    } catch (error) {
      next(error);
    }
  });

  router.post('/event', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const body = addEventSchema.safeParse(req.body);
      if (!body.success) {
        throw new ValidationError('An event type, timestamp, and data are required.');
      }
      const event = await timeline.addUserEvent(
        req.auth!.userId,
        body.data.eventType,
        body.data.timestamp,
        body.data.data,
      );
      res.status(201).json(event);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
