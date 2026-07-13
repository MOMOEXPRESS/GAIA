/**
 * FHIR-like REST endpoints wrapped in Gaia's authentication layer
 * (Vol 5 §6: "GET /fhir/Patient/{id}", "POST /fhir/Observation", ...).
 * Users can only access their own resources in Month 1; doctor/caregiver
 * access arrives with the consent layer (Family System).
 */
import { Router } from 'express';
import type { Response, NextFunction } from 'express';
import type { HealthGraphService } from '../../modules/health-graph/application/health-graph-service';
import type { AuthenticatedRequest } from '../middleware/auth';
import type { FhirResourceType } from '@gaia/shared-types';

export function createFhirRoutes(healthGraph: HealthGraphService): Router {
  const router = Router();

  router.post('/:resourceType', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const resource = await healthGraph.createResource(req.auth!.userId, {
        ...req.body,
        resourceType: req.params.resourceType,
      });
      res.status(201).json(resource);
    } catch (error) {
      next(error);
    }
  });

  router.get('/:resourceType', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const resources = await healthGraph.search({
        subject: req.auth!.userId,
        resourceType: req.params.resourceType as FhirResourceType,
        category: typeof req.query.category === 'string' ? req.query.category : undefined,
        since: typeof req.query.since === 'string' ? req.query.since : undefined,
        limit: typeof req.query.limit === 'string' ? Number(req.query.limit) : undefined,
      });
      res.json({ resourceType: 'Bundle', total: resources.length, entry: resources });
    } catch (error) {
      next(error);
    }
  });

  router.get('/:resourceType/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const resource = await healthGraph.getResource(req.params.id as string, req.auth!.userId);
      res.json(resource);
    } catch (error) {
      next(error);
    }
  });

  router.put('/:resourceType/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const resource = await healthGraph.updateResource(
        req.params.id as string,
        req.auth!.userId,
        req.body,
      );
      res.json(resource);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
