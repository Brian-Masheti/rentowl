import { Request, Response } from 'express';
import Property from '../models/Property';
import { Types } from 'mongoose';

// Create a new property (Landlord only, with image upload)
export const createProperty = async (req: Request, res: Response) => {
  try {
    const { name, address, caretaker, rentAmount, description } = req.body;
    const landlord = req.user?.id;
    // Handle images
    let profilePic: string | undefined = undefined;
    let gallery: string[] = [];
    if (req.files) {
      // @ts-ignore
      if (req.files.profilePic && req.files.profilePic[0]) {
        // @ts-ignore
        profilePic = req.files.profilePic[0].path;
      }
      // @ts-ignore
      if (req.files.gallery) {
        // @ts-ignore
        gallery = req.files.gallery.map((file: Express.Multer.File) => file.path);
      }
    }
    const property = await Property.create({
      name,
      address,
      landlord,
      caretaker: caretaker || null,
      tenants: [],
      rentAmount,
      description,
      profilePic,
      gallery,
    });
    res.status(201).json(property);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create property.' });
  }
};

// Get all properties for a landlord
export const getLandlordProperties = async (req: Request, res: Response) => {
  try {
    const landlord = req.user?.id;
    const properties = await Property.find({ landlord }).populate('caretaker tenants');
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

// Update a property (Landlord only)
export const updateProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const property = await Property.findByIdAndUpdate(id, updates, { new: true });
    if (!property) return res.status(404).json({ error: 'Property not found.' });
    res.json(property);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update property.' });
  }
};

// Delete a property (Landlord only)
export const deleteProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const property = await Property.findByIdAndDelete(id);
    if (!property) return res.status(404).json({ error: 'Property not found.' });
    res.json({ message: 'Property deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete property.' });
  }
};
