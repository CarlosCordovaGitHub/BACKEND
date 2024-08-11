// paypal.config.js
import paypal from 'paypal-rest-sdk';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || 'AQTPuKAgcqRAGvpOSIus6S1UlasvwpB26Vex1RZ_-2wJIrGJ1_9ry6JkLmG9CnEH58JqQafA34T8QlWg';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || 'EH8NNkZu9oA-xGtjjPo_O2sp8x0ItPStPHbaoEnN8Wbm9-qY71Q_o1wW_QG0uX2TqkhFg9DoXTeqWxHX';

paypal.configure({
  mode: 'sandbox', // Cambiar a 'live' para producción
  client_id: PAYPAL_CLIENT_ID,
  client_secret: PAYPAL_CLIENT_SECRET
});


export default paypal;
