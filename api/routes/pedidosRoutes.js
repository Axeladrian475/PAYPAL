import express from 'express';
import paypal from '@paypal/checkout-server-sdk';
import paypalClient from '../config/paypal.js';

const router = express.Router();

// Ruta para CREAR una orden de pago
router.post('/create-order', async (req, res) => {
  const { total } = req.body;
  const request = new paypal.orders.OrdersCreateRequest();
  
  request.prefer("return=representation");
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: 'MXN', // Moneda Mexicana
        value: total.toFixed(2), // Asegurarse de que tenga 2 decimales
      },
    }],
  });

  try {
    const order = await paypalClient.execute(request);
    res.json({ id: order.result.id });
  } catch (err) {
    console.error("Error al crear la orden:", err);
    res.status(500).send("Error al crear la orden de pago.");
  }
});

// Ruta para CAPTURAR (finalizar) una orden de pago
router.post('/capture-order', async (req, res) => {
  const { orderID } = req.body;
  const request = new paypal.orders.OrdersCaptureRequest(orderID);
  request.requestBody({});

  try {
    const capture = await paypalClient.execute(request);
    // Aquí es donde guardarías el pedido en tu base de datos
    // como "pagado".
    console.log('Pago capturado:', capture.result);
    res.json(capture.result);
  } catch (err) {
    console.error("Error al capturar la orden:", err);
    res.status(500).send("Error al confirmar el pago.");
  }
});

export default router;