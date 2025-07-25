import { Request, Response } from 'express';
import Property from '../models/Property';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

// CREATE property
export const createProperty = async (req: Request, res: Response) => {
  try {
    console.log('BODY:', req.body);
    console.log('FILES:', req.files);
    let { name, address, units, description } = req.body;
    if (typeof units === 'string') {
      units = JSON.parse(units);
    }
    if (!name || !address || !units) {
      return res.status(400).json({ error: 'Name, address, and units are required.' });
    }
    const landlord = req.user?.id;

    // Handle file uploads and generate thumbnails
    let profilePic, profilePicThumb, gallery = [], galleryThumbs = [];
    const makeThumb = async (origPath: string) => {
      const ext = path.extname(origPath);
      const base = path.basename(origPath, ext);
      const thumbDir = path.join(path.dirname(origPath), 'thumbs');
      if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir, { recursive: true });
      const thumbPath = path.join(thumbDir, `${base}_thumb${ext}`);
      await sharp(origPath)
        .resize(300, 300, { fit: 'inside' })
        .toFile(thumbPath);
      return thumbPath.replace(/\\/g, '/');
    };
    if (req.files && (req.files as any).profilePic) {
      profilePic = (req.files as any).profilePic[0].path.replace(/\\/g, '/');
      profilePicThumb = await makeThumb((req.files as any).profilePic[0].path);
      console.log('PROFILE PIC:', profilePic);
      console.log('PROFILE PIC THUMB:', profilePicThumb);
    }
    if (req.files && (req.files as any).gallery) {
      gallery = (req.files as any).gallery.map((file: any) => file.path.replace(/\\/g, '/'));
      for (const file of (req.files as any).gallery) {
        const thumb = await makeThumb(file.path);
        galleryThumbs.push(thumb);
        console.log('GALLERY IMAGE:', file.path.replace(/\\/g, '/'));
        console.log('GALLERY THUMB:', thumb);
      }
    }

    const property = await Property.create({
      name,
      address,
      landlord,
      units,
      description,
      tenants: [],
      profilePic,
      profilePicThumb,
      gallery,
      galleryThumbs,
    });
    res.status(201).json(property);
  } catch (err) {
    console.error('CREATE PROPERTY ERROR:', err);
    res.status(500).json({ error: 'Failed to create property.', details: err instanceof Error ? err.message : err });
  }
};

// GET all properties for landlord (with populated tenants)
export const getLandlordProperties = async (req: Request, res: Response) => {
  try {
    const landlord = req.user?.id;
    const properties = await Property.find({ landlord, isDeleted: { $ne: true } })
      .populate({
        path: 'tenants.tenant',
        model: 'Tenant',
        select: 'firstName lastName email phone',
      });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch properties.' });
  }
};

// GET property by ID (with populated tenants)
export const getPropertyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id)
      .populate({
        path: 'tenants.tenant',
        model: 'Tenant',
        select: 'firstName lastName email phone',
      });
    if (!property) return res.status(404).json({ error: 'Property not found.' });
    res.json(property);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch property.' });
  }
};

// UPDATE property
export const updateProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const property = await Property.findByIdAndUpdate(id, updates, { new: true })
      .populate({
        path: 'tenants.tenant',
        model: 'Tenant',
        select: 'firstName lastName email phone',
      });
    if (!property) return res.status(404).json({ error: 'Property not found.' });
    res.json(property);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update property.' });
  }
};

// DELETE property (soft delete)
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

// REMOVE tenant from property
export const removeTenantFromProperty = async (req: Request, res: Response) => {
  try {
    const { propertyId, tenantId } = req.params;
    const updated = await Property.findByIdAndUpdate(
      propertyId,
      { $pull: { tenants: { tenant: tenantId } } },
      { new: true }
    ).populate({
      path: 'tenants.tenant',
      model: 'Tenant',
      select: 'firstName lastName email phone',
    });
    if (!updated) return res.status(404).json({ error: 'Property not found.' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove tenant from property.' });
  }
};
