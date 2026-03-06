const express = require('express');
const { listar } = require('../data/logs');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { limite, offset, tipo } = req.query;
    const lista = await listar({ limite, offset, tipo });
    res.json(lista);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
