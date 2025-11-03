const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { verifyToken } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

// Criar diretorio de uploads se nao existir
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configurar multer para armazenar em memoria (para processar com sharp)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Aceitar apenas imagens
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Apenas imagens sao permitidas'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // Limite de 10MB (sera comprimido depois)
  }
});

// Upload de imagem (admin only)
router.post('/image', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem foi enviada' });
    }

    // Gerar nome unico para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + '.jpg'; // Sempre salvar como JPG
    const filePath = path.join(uploadDir, filename);

    // Redimensionar e comprimir a imagem usando sharp
    // Maximo 800px de largura ou altura, mantendo a proporcao
    await sharp(req.file.buffer)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: 85,
        progressive: true
      })
      .toFile(filePath);

    // Retornar apenas o nome do arquivo
    res.json({ imagePath: filename });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Erro ao fazer upload da imagem' });
  }
});

// Deletar imagem (admin only)
router.delete('/image', verifyToken, isAdmin, (req, res) => {
  try {
    const { imagePath } = req.body;

    if (!imagePath) {
      return res.status(400).json({ error: 'Caminho da imagem nao fornecido' });
    }

    // Extrair nome do arquivo
    const filename = path.basename(imagePath);
    const filePath = path.join(uploadDir, filename);

    // Verificar se arquivo existe
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: 'Imagem deletada com sucesso' });
    } else {
      res.status(404).json({ error: 'Imagem nao encontrada' });
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Erro ao deletar imagem' });
  }
});

module.exports = router;
