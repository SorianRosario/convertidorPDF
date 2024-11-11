const express = require('express');
const multer = require('multer');
const mammoth = require('mammoth');
const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));
app.use(express.json());

app.post('/convert', upload.single('file'), async (req, res) => {
    try {
        const inputFilePath = req.file.path;
        const outputFilePath = path.join('uploads', `${req.file.filename}.pdf`);

        const result = await mammoth.convertToHtml({ path: inputFilePath });
        const html = result.value;

        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 800]);
        const { width, height } = page.getSize();

        page.drawText(html, {
            x: 50,
            y: height - 50,
            size: 12,
            color: rgb(0, 0, 0),
        });

        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync(outputFilePath, pdfBytes);

        res.download(outputFilePath, 'document.pdf', (err) => {
            if (err) {
                console.error(err);
            }
            fs.unlinkSync(inputFilePath);
            fs.unlinkSync(outputFilePath);
        });
    } catch (error) {
        res.status(500).send('Error al convertir el archivo');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});