const nodemailer = require('nodemailer');
const config = require('./CONFIG');

const user = config.user;
const pass = config.pass;

const transport = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: user,
    pass: pass,
  },
});

module.exports.sendResetPsswEmail = (name, email, token) => {
  //console.log('Check');
  transport
    .sendMail({
      from: user,
      to: email,
      subject: 'myGAMES PASSWORD RESET',
      html: `<h1>Password reset</h1>
          <h2>Hello ${name}</h2>
          <p>If you have requested to reset your password, click the following button or copy and paste following link</p>
          <button><a href=http://localhost:3000/newpssw/${token}> Click here</a></button></ br></ br>
          <p>You can also copy and paste following link into your browser</p></ br></ br>
          http://localhost:3000/newpssw/${token}
          </div>`,
    })
    .catch((err) => console.log(err));
};
