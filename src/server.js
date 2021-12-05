const express = require("express");
var exphbs = require("express-handlebars");

const app = express();
const router = express.Router();
const { MONGO_URI, TIEMPO_EXPIRACION } = require("./config/globals");
const { getConnection } = require("./dal/dao/db/connection");
const routes = require("./routes/routes");

const session = require("express-session");
const cookieParser = require("cookie-parser");

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const axios = require('axios');

const { Mongoose } = require("mongoose");
const MongoStore = require("connect-mongo");

//----------------------------------------------------------------------
// NODEMAILER y TWILIO
//----------------------------------------------------------------------
const ethereal = require('./email/nodemailer-ethereal.js');
const gmail  = require('./email/nodemailer-gmail.js');
const twilio = require('./sms/twilio.js');

//----------------------------------------------------------------------
// COMPRESIÓN
//----------------------------------------------------------------------
const compression = require('compression');
app.use(compression())
//----------------------------------------------------------------------

//----------------------------------------------------------------------
// LOGGERS
//----------------------------------------------------------------------
const logger = require('./logs/logger');

const loggerInfo = logger.getLogger('info');
const loggerWarn = logger.getLogger('warn');
const loggerError = logger.getLogger('error');
//----------------------------------------------------------------------

/* -------------- OBJECT PROCESS ----------- */

// -------------- MODO FORK -------------------
//pm2 start src/server.js --name="Server1" --watch -- 8081 fork

// -------------- MODO CLUSTER -------------------
//pm2 start src/server.js --name="Server2" --watch -- 8082 cluster

//pm2 list
//pm2 delete id/name
//pm2 desc name
//pm2 monit
//pm2 --help
//pm2 logs
//pm2 flush

// ------------------ NGINX ----------------------
//cd nginx-1.21.3
//start nginx
//tasklist /fi "imagename eq nginx.exe"
//nginx -s reload
//nginx -s quit

const args = require('yargs').argv;

/**
* Ej.:
* npm run start [--port=9000 --server-mode=cluster --fb-app-id=xxxxxx  --fb-app-secret=xxxxxxxx ]
*/

const PORT = args.port ?? process.env.PORT;
const SERVER_MODE = args.server ?? "fork";
const FACEBOOK_APP_ID = args.fb_app_id ?? process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = args.fb_app_secret ?? process.env.FACEBOOK_APP_SECRET;

const cluster = require("cluster");
const numCpus = require("os").cpus().length;

if (SERVER_MODE === "cluster" && cluster.isMaster) {

  loggerInfo.info(`Número de procesadores: ${numCpus}`)
  loggerInfo.info(`PID MASTER ${process.pid}`)

  for (let i = 0; i < numCpus; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker) => {
    loggerInfo.info(
      "Worker",
      worker.process.pid,
      "died",
      new Date().toLocaleString()
    );
    cluster.fork();
  });
} else {

  /* -------------- PASSPORT ----------------- */
  const passport = require("passport");
  const bCrypt = require("bcrypt");
  const LocalStrategy = require("passport-local").Strategy;
//  const FacebookStrategy = require("passport-facebook").Strategy;
  const User = require("./dal/dao/models/usuarios");

/*   loggerInfo.info(FACEBOOK_APP_ID)
  loggerInfo.info(FACEBOOK_APP_SECRET)

  passport.use(
    new FacebookStrategy(
      {
        clientID: FACEBOOK_APP_ID,
        clientSecret: FACEBOOK_APP_SECRET,
        callbackURL: "/auth/facebook/callback",
        profileFields: ["id", "displayName", "photos", "emails"],
      },
      function (accessToken, refreshToken, profile, done) {
        console.log(profile);
        User.findOne(
          {
            facebookId: profile.id,
          },
          (err, user) => {
            if (err) {
              return done(err);
            }

            if (!user) {
              user = new User({
                facebookId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                picture: profile.photos[0].value,
                provider: "facebook",
              });
              user.save((err) => {
                if (err) loggerError.error(err);
                return done(err, user);
              });
            } else {
              return done(err, user);
            }
          }
        );
      }
    )
  );

  app.get("/auth/facebook", passport.authenticate("facebook"));

  app.get(
    "/auth/facebook/callback",
    passport.authenticate("facebook", {
      successRedirect: "/home",
      failureRedirect: "/faillogin",
    })
  ); */

  passport.use(
    "login",
    new LocalStrategy(
      {
        passReqToCallback: true,
      },
      function (req, username, password, done) {
        // check in mongo if a user with username exists or not
        User.findOne({ username: username }, function (err, user) {
          // In case of any error, return using the done method
          if (err) return done(err);
          // Username does not exist, log error & redirect back
          if (!user) {
            loggerWarn.warn("User Not Found with username " + username);
            loggerWarn.warn("message", "User Not found.");
            return done(null, false);
          }
          // User exists but wrong password, log the error
          if (!isValidPassword(user, password)) {
            loggerError.error("Invalid Password");
            loggerError.error("Invalid Password");
            return done(null, false);
          }
          // User and password both match, return user from
          // done method which will be treated like success
          return done(null, user);
        });
      }
    )
  );

  var isValidPassword = function (user, password) {
    return bCrypt.compareSync(password, user.password);
  };

  passport.use(
    "register",
    new LocalStrategy(
      {
        passReqToCallback: true,
      },
      function (req, username, password, done) {
        const findOrCreateUser = function () {
          // find a user in Mongo with provided username
          User.findOne({ username: username }, function (err, user) {
            // In case of any error return
            if (err) {
              loggerError.error("Error in SignUp: " + err);
              return done(err);
            }
            // already exists
            if (user) {
              loggerWarn.warn("User already exists");
              loggerWarn.warn("message", "User Already Exists");
              return done(null, false);
            } else {
              // if there is no user with that email
              // create the user
              var newUser = new User();
              // set the user's local credentials
              newUser.username = username;
              newUser.password = createHash(password);
              newUser.provider = 'Local';

              // save the user
              newUser.save(function (err) {
                if (err) {
                  loggerError.error("Error in Saving user: " + err);
                  throw err;
                }
                loggerInfo.info("User Registration succesful");
                return done(null, newUser);
              });
            }
          });
        };
        // Delay the execution of findOrCreateUser and execute
        // the method in the next tick of the event loop
        process.nextTick(findOrCreateUser);
      }
    )
  );
  // Generates hash using bCrypt
  var createHash = function (password) {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
  };

  // Configure Passport authenticated session persistence.
  //
  // In order to restore authentication state across HTTP requests, Passport needs
  // to serialize users into and deserialize users out of the session.  The
  // typical implementation of this is as simple as supplying the user ID when
  // serializing, and querying the user record by ID from the database when
  // deserializing.
  passport.serializeUser(function (user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });
  /* ----------------------------------------- */

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use("/public", express.static("./src/public"));
  app.use(routes(router));

  app.engine("handlebars", exphbs());
  app.set("views", "./src/views");
  app.set("view engine", "handlebars");

  app.use(
    session({
      store: MongoStore.create({
        mongoUrl: MONGO_URI,
        mongoOptions: {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        },
      }),
      secret: process.env.SECRET_KEY,
      cookie: {
        httpOnly: false,
        secure: false,
        maxAge: 20000,
      },
      rolling: true,
      resave: true,
      saveUninitialized: false,
    })
  );

  app.use(cookieParser());
  app.use(express.json());

  // Initialize Passport and restore authentication state, if any, from the
  // session.
  app.use(passport.initialize());
  app.use(passport.session());

  // ------------------------------------------------------------------------------
  //  ROUTING GET POST
  // ------------------------------------------------------------------------------

  app.get("/home", async (req, res) => {
    if (req.isAuthenticated()) {

/*       let nombre = req.user.displayName
      let foto = 'sinFoto';
      let email = 'example@example.com';
      let asunto = 'logging In';
      let mensaje = 'Ingresó ' + nombre + ' en la fecha ' + new Date().toLocaleString();

      //--------------------------------
      //Registro de ingreso por ethereal
      //--------------------------------
      ethereal.enviarMail(asunto, mensaje, (err, info) => {
        if(err) console.log(err)
        else console.log(info)

        //--------------------------------------
        //Registro de datos de usuario por gmail
        //--------------------------------------
        gmail.enviarMail(asunto, mensaje, foto, email, (err, info) => {
            if(err) console.log(err)
            else console.log(info)
        });
      }); */

      let resProd = await axios.get('http://localhost:8080/api/productos');
      let productos =  resProd.data;

      res.render("home", {
        nombre: req.user.username,
        productos: productos,
      });
    } else {
      res.sendFile(process.cwd() + "/");
    }
  });

  app.post(
    "/login",
    passport.authenticate("login", { failureRedirect: "/faillogin" }),
    (req, res) => {
      res.redirect("/home");
    }
  );

  app.get("/faillogin", (req, res) => {
    res.render("login-error", {});
  });

  app.post(
    "/register",
    passport.authenticate("register", { failureRedirect: "/failregister" }),
    (req, res) => {
      res.redirect("/");
    }
  );

  app.get("/failregister", (req, res) => {
    res.render("register-error", {});
  });

  app.get("/logout", (req, res) => {
    //let nombre = req.user.username;
    req.logout();
    //-------------------------------
    //Registro de egreso por ethereal
    //-------------------------------
/*     let asunto = 'logging Out'
    let mensaje = 'Egresó ' + nombre + ' en la fecha ' + new Date().toLocaleString()
    ethereal.enviarMail(asunto, mensaje, (err, info) => {
        if(err) console.log(err)
        else console.log(info)

        res.render("logout", { nombre });
    }); */
    res.render("logout");
  });

  // ------------------------------------------------------------------------------
  //  socket io
  // ------------------------------------------------------------------------------

  io.on("connection", async (socket) => {

    const responseProducts = await axios.get('http://localhost:8080/api/productos');
    const responseMsg = await axios.get('http://localhost:8080/api/mensajes');

    let productos =  responseProducts.data;
    let mensajes =  responseMsg.data;

    socket.emit("mensajes", {
      mensajes: mensajes,
    });

    socket.on("nuevo-mensaje", async (nuevoMensaje) => {
      const { author, message } = nuevoMensaje;
      const elNuevoMensaje = {
        author,
        message,
      };

      await mensajeService.createMensaje(elNuevoMensaje);

      if(data.text.includes('administrador')) {
        console.log('MENSAJE SMS AL ADMIN')
        let mensaje = 'El usuario ' + data.author.email + ' te envió el mensaje: ' + data.text
        let rta = await twilio.enviarSMS(mensaje, '+54911nnnnnnnn')
        console.log(rta)
      }

      io.sockets.emit("recibir nuevoMensaje", [elNuevoMensaje]);
    });

    io.sockets.emit("productos", productos);

    socket.on("producto-nuevo", async (product) => {
      let res = await axios.post('http://localhost:8080/api/productos', product);
    });
  });

  getConnection().then(() =>
    server.listen(PORT, () => console.log("server's up", PORT))
  );
}
