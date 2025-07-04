// pages/api/protected/profile.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { authenticateToken, AuthenticatedRequest } from '../../../lib/auth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Use authentication middleware
  authenticateToken(req as AuthenticatedRequest, res, () => {
    const authenticatedReq = req as AuthenticatedRequest;
    
    // If we reach here, user is authenticated
    res.status(200).json({
      message: 'Profile data accessed successfully',
      user: authenticatedReq.user
    });
  });
}