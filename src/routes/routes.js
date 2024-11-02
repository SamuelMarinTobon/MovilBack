import { Router } from 'express';
import { methodsallinfo } from '../controllers/banco.controllers.js';
import cors from 'cors';

const router = Router();

router.get('/banco', cors({ origin: 'http://localhost:8081' }), methodsallinfo.getBancoall);
router.post('/login', cors({ origin: 'http://localhost:8081' }), methodsallinfo.loginUser);
router.post('/registro', cors({ origin: 'http://localhost:8081' }), methodsallinfo.registroUsuario);
router.post('/transferir', cors({ origin: 'http://localhost:8081' }), methodsallinfo.transferir);
router.post('/depositar', cors({ origin: 'http://localhost:8081' }), methodsallinfo.depositar);
router.post('/retirar', cors({ origin: 'http://localhost:8081' }), methodsallinfo.retirar);
router.post('/solicitarPrestamo', cors({ origin: 'http://localhost:8081' }), methodsallinfo.solicitarPrestamo);
router.post('/pagarPrestamo', cors({ origin: 'http://localhost:8081' }), methodsallinfo.pagarPrestamo);
router.post('/verPrestamos', cors({ origin: 'http://localhost:8081' }), methodsallinfo.verPrestamos);
router.post('/historicoIngresos', cors({ origin: 'http://localhost:8081' }), methodsallinfo.historicoIngresos);
router.post('/historicoEgresos', cors({ origin: 'http://localhost:8081' }), methodsallinfo.historicoEgresos);
router.post('/historicoDeudas', cors({ origin: 'http://localhost:8081' }), methodsallinfo.historicoDeudas);
router.post('/saldo', cors({ origin: 'http://localhost:8081' }), methodsallinfo.saldo);
router.post(
  '/historicoTransferencias',
  cors({ origin: 'http://localhost:8081' }),
  methodsallinfo.historicoTransferencias
);


export default router;

