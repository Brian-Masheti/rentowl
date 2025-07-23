import { Request, Response } from 'express';
import Property from '../models/Property';
import { Types } from 'mongoose';

// Create a new property (Landlord only, with image upload)
export const createProperty = async (req: Request, res: Response) => {
  try {
    let { name, address, caretaker, units, description } = req.body;
    // Parse units if sent as JSON string (from FormData)
    if (typeof units === 'string') {
      try {
        units = JSON.parse(units);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid units format.' });
      }
    }
    const landlord = req.user?.id;
    // Handle images
    let profilePic: string | undefined = undefined;
    let gallery: string[] = [];
    if (req.files) {
      // @ts-ignore
      if (req.files.profilePic && req.files.profilePic[0]) {
        // @ts-ignore
        profilePic = req.files.profilePic[0].path.replace(/\\/g, '/');
      }
      // @ts-ignore
      if (req.files.gallery) {
        // @ts-ignore
        gallery = req.files.gallery.map((file: Express.Multer.File) => file.path.replace(/\\/g, '/'));
      }
    }
    // Validate units array
    if (!Array.isArray(units) || units.length === 0) {
      return res.status(400).json({ error: 'Units array is required and must have at least one unit type.' });
    }
    for (const unit of units) {
      if (!unit.type || typeof unit.type !== 'string' || typeof unit.count !== 'number' || typeof unit.rent !== 'number') {
        return res.status(400).json({ error: 'Each unit must have a type (string), count (number), and rent (number).' });
      }
    }
    const property = await Property.create({
      name,
      address,
      landlord,
      caretaker: caretaker || null,
      tenants: [],
      units,
      description,
      profilePic,
      gallery,
    });
    res.status(201).json(property);
  } catch (err) {
    console.error('Error in createProperty:', err);
    res.status(500).json({ error: 'Failed to create property.' });
  }
};

// Get all properties for a landlord (excluding soft-deleted)
export const getLandlordProperties = async (req: Request, res: Response) => {
  try {
    const landlord = req.user?.id;
    const properties = await Property.find({ landlord, isDeleted: { $ne: true } }).populate('caretaker tenants');
    res.json(properties);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch properties.' });
  }
};

// Get a single property (by ID)
export const getPropertyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id).populate('caretaker tenants');
    if (!property) return res.status(404).json({ error: 'Property not found.' });
    res.json(property);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch property.' });
  }
};

// Update a property (Landlord only, with image upload support)
export const updateProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Best practice: explicitly set updatable fields
    const updates: any = {};
    if (typeof req.body.name === 'string') updates.name = req.body.name;
    if (typeof req.body.address === 'string') updates.address = req.body.address;
    // Parse units for update as well
    let updateUnits = req.body.units;
    if (typeof updateUnits === 'string') {
      try {
        updateUnits = JSON.parse(updateUnits);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid units format.' });
      }
    }
    if (Array.isArray(updateUnits)) updates.units = updateUnits;
    if (typeof req.body.description === 'string') updates.description = req.body.description;
    if (typeof req.body.caretaker === 'string') updates.caretaker = req.body.caretaker;

    // Handle images
    if (req.files) {
      // @ts-ignore
      if (req.files.profilePic && req.files.profilePic[0]) {
        // @ts-ignore
        updates.profilePic = req.files.profilePic[0].path.replace(/\\/g, '/');
      }
      // @ts-ignore
      if (req.files.gallery) {
        // @ts-ignore
        updates.gallery = req.files.gallery.map((file: Express.Multer.File) => file.path.replace(/\\/g, '/'));
      }
    }

    // Handle removal of profilePic or gallery images if requested
    if (req.body.removeProfilePic === 'true') {
      updates.profilePic = undefined;
    }
    if (req.body.removeGalleryIndexes) {
      // removeGalleryIndexes should be a comma-separated string of indexes to remove
      const indexes = req.body.removeGalleryIndexes.split(',').map((i: string) => parseInt(i, 10));
      const property = await Property.findById(id);
      if (property && property.gallery) {
        updates.gallery = property.gallery.filter((_: any, idx: number) => !indexes.includes(idx));
      }
    }

    const property = await Property.findByIdAndUpdate(id, updates, { new: true });
    if (!property) return res.status(404).json({ error: 'Property not found.' });
    res.json(property);
  } catch (err) {
    console.error('Error in updateProperty:', err);
    res.status(500).json({ error: 'Failed to update property.' });
  }
};

// Soft delete a property (Landlord only)
export const deleteProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const property = await Property.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!property) return res.status(404).json({ error: 'Property not found.' });
    res.json({ message: 'Property soft deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete property.' });
  }
};
