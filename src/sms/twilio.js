const accountSid = process.env.ACCOUNT_TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const twilio = require('twilio');

const client = twilio(accountSid, authToken)

exports.enviarSMS = async (mensaje,numero) => {
    try {
        let rta = await client.messages.create({
            body: mensaje,
            from: '+19714071392',
            to: numero
        })
        return rta
    }
    catch(error) {
        return error
    }
}