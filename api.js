import express from 'express';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors()); // liberar CORS para frontend

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Rota para buscar vídeos paginados
app.get('/api/videos', async (req, res) => {
  const { next_cursor } = req.query;

  try {
    const searchBuilder = cloudinary.search
      .expression('resource_type:video')
      .sort_by('created_at', 'desc')
      .max_results(6);

    if (next_cursor) searchBuilder.next_cursor(next_cursor);

    const result = await searchBuilder.execute();

    const videos = result.resources.map(v => v.public_id);

    res.json({
      videos,
      next_cursor: result.next_cursor || null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar vídeos' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
