import mongoose from 'mongoose';

export const mongoConnection = mongoose.createConnection(
  'mongodb+srv://admin:admin@development.laf7z.mongodb.net/artistory',
);
