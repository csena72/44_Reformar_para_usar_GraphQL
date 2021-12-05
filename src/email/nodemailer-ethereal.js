const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'reece.king73@ethereal.email',
        pass: '4n7DCvMu6tN84P4thk'
    }
});

exports.enviarMail = (asunto,mensaje,cb) => {
    const mailOptions = {
        from: 'Servidor Node.js',
        to: '',
        subject: asunto,
        html: mensaje
    }

    transporter.sendMail(mailOptions, (err, info) => {
        /*
        if(err) {
            console.log(err)
            //return err
        }
        else console.log(info)
        */
        cb(err,info)
    })
}
