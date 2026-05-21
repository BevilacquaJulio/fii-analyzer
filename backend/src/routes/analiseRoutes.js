const express = require('express');
const AnaliseController = require('../controllers/AnaliseController');

const router = express.Router();

router.post('/', AnaliseController.salvar);
router.get('/', AnaliseController.listar);
router.get('/:id', AnaliseController.buscar);

module.exports = router;
