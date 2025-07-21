import { Request, Response } from 'express';
import MaintenanceRequest from '../models/MaintenanceRequest';
import Property from '../models/Property';

// Create a maintenance request (Tenant)
export const createRequest = async (req: Request, res: Response) => {
  try {
    const { property, description, urgency } = req.body;
    const tenant = req.user?.id;
    // Handle images
    let images: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      images = req.files.map((file: Express.Multer.File) => file.path);
    } else if (req.files && req.files['images']) {
      // @ts-ignore
      images = req.files['images'].map((file: Express.Multer.File) => file.path);
    }
    // Find caretaker for the property
    const prop = await Property.findById(property);
    const caretaker = prop?.caretaker || null;
    const request = await MaintenanceRequest.create({
      property,
      tenant,
      caretaker,
      description,
      urgency,
      images,
      status: 'pending',
    });
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create maintenance request.' });
  }
};

// List requests for a tenant
export const getTenantRequests = async (req: Request, res: Response) => {
  try {
    const tenant = req.user?.id;
    const requests = await MaintenanceRequest.find({ tenant }).populate('property caretaker');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch requests.' });
  }
};

// List requests for a caretaker
export const getCaretakerRequests = async (req: Request, res: Response) => {
  try {
    const caretaker = req.user?.id;
    const requests = await MaintenanceRequest.find({ caretaker }).populate('property tenant');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch requests.' });
  }
};

// Update status and resolution (Caretaker)
export const updateRequestStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes } = req.body;
    let update: any = { status };
    if (resolutionNotes) update.resolutionNotes = resolutionNotes;
    // Optionally handle new images
    if (req.files && req.files['images']) {
      // @ts-ignore
      update.$push = { images: { $each: req.files['images'].map((file: Express.Multer.File) => file.path) } };
    }
    const request = await MaintenanceRequest.findByIdAndUpdate(id, update, { new: true });
    if (!request) return res.status(404).json({ error: 'Request not found.' });
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update request.' });
  }
};

// Escalate unresolved requests (system or admin)
export const escalateUnresolved = async (req: Request, res: Response) => {
  try {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const escalated = await MaintenanceRequest.updateMany(
      { status: { $in: ['pending', 'in_progress'] }, updatedAt: { $lte: fortyEightHoursAgo } },
      { status: 'escalated' }
    );
    res.json({ message: 'Escalation check complete', escalated: escalated.modifiedCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to escalate requests.' });
  }
};
