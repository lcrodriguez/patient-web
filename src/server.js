import path from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import expressJwt, { UnauthorizedError as Jwt401Error } from 'express-jwt';
import jwt from 'jsonwebtoken';
import React from 'react';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router';
import ReactDOM from 'react-dom/server';
import PrettyError from 'pretty-error';
import App from './components/App';
import Html from './components/Html';
import ErrorPage from './pages/error/ErrorPage';
import createFetch from './createFetch';
import configureStore from './store/configureStore';
import { receiveLogin, receiveLogout } from './actions/user';
import { changeActiveSidebarItem, openSidebar } from './actions/navigation';
import config from './config';
import assets from './assets.json'; // eslint-disable-line import/no-unresolved
import theme from './styles/theme.scss';

const app = express();

//
// Tell any CSS tooling (such as Material UI) to use all vendor prefixes if the
// user agent is not known.
// -----------------------------------------------------------------------------
global.navigator = global.navigator || {};
global.navigator.userAgent = global.navigator.userAgent || 'all';

//
// Register Node.js middleware
// -----------------------------------------------------------------------------
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'assets')));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//
// Authentication
// -----------------------------------------------------------------------------
app.use(expressJwt({
  secret: config.auth.jwt.secret,
  credentialsRequired: false,
  getToken: req => req.cookies.id_token,
}));
// Error handler for express-jwt
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  if (err instanceof Jwt401Error) {
    console.error('[express-jwt-error]', req.cookies.id_token);
    // `clearCookie`, otherwise user can't use web-app until cookie expires
    res.clearCookie('id_token');
  } else {
    next(err);
  }
});

if (__DEV__) {
  app.enable('trust proxy');
}
app.post('/login', (req, res) => {
  // replace with real database check in production
  // const user = graphql.find(req.login, req.password);
  let user = false;
  const login = req.body.login;
  const password = req.body.password;
  if (login && password) {
    user = { user, login };
  }

  if (user) {
    const expiresIn = 60 * 60 * 24 * 180; // 180 days
    const token = jwt.sign(user, config.auth.jwt.secret, { expiresIn });
    res.cookie('id_token', token, { maxAge: 1000 * expiresIn, httpOnly: false });
    res.json({ id_token: token });
  } else {
    res.status(401).json({ message: 'To login use any user/password combination' });
  }
});


//
// Register server-side rendering middleware
// -----------------------------------------------------------------------------
app.get('*', async (req, res, next) => {
  try {
    const css = new Set();

    const fetch = createFetch({
      baseUrl: config.api.serverUrl,
      cookie: req.headers.cookie,
    });

    const initialState = {
      user: req.user || null,
    };

    const store = configureStore(initialState, {
      fetch,
      // I should not use `history` on server.. but how I do redirection? follow universal-router
    });

    if (req.user && req.user.login) {
      store.dispatch(receiveLogin({
        id_token: req.cookies.id_token,
      }));
    } else {
      store.dispatch(receiveLogout());
    }

    const paths = req.url.split('/');
    paths.pop();

    store.dispatch(changeActiveSidebarItem(paths.join('/')));
    store.dispatch(openSidebar());

    // Global (context) variables that can be easily accessed from any React component
    // https://facebook.github.io/react/docs/context.html
    const context = {
      // Enables critical path CSS rendering
      // https://github.com/kriasoft/isomorphic-style-loader
      insertCss: (...styles) => {
        // eslint-disable-next-line no-underscore-dangle
        styles.forEach(style => css.add(style._getCss()));
      },
      fetch,
      // You can access redux through react-redux connect
      store,
      storeSubscription: null,
    };

      // eslint-disable-next-line no-underscore-dangle
    css.add(theme._getCss());

    const data = {
      title: 'Lyme Web App 1.0.0',
      description: 'Lyme Web App 1.0.0',
    };
    data.styles = [
      { id: 'css', cssText: [...css].join('') },
    ];
    data.scripts = [
      assets.vendor.js,
      assets.client.js,
    ];
    data.app = {
      apiUrl: config.api.clientUrl,
      state: context.store.getState(),
    };

    const html = ReactDOM.renderToString(
      <StaticRouter
        location={req.url}
        context={context}
      >
        <Provider store={store}>
          <App store={store} />
        </Provider>
      </StaticRouter>,
      );

    data.styles = [
        { id: 'css', cssText: [...css].join('') },
    ];

    data.children = html;

    const markup = ReactDOM.renderToString(
      <Html {...data} />,
      );

    res.status(200);
    res.send(`<!doctype html>${markup}`);
  } catch (err) {
    next(err);
  }
});

//
// Error handling
// -----------------------------------------------------------------------------
const pe = new PrettyError();
pe.skipNodeFiles();
pe.skipPackage('express');

app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(pe.render(err));
  const html = ReactDOM.renderToStaticMarkup(
    <Html
      title="Internal Server Error"
      description={err.message}
    >
      {ReactDOM.renderToString(<ErrorPage />)}
    </Html>,
  );
  res.status(err.status || 500);
  res.send(`<!doctype html>${html}`);
});

//
// Launch the server
// -----------------------------------------------------------------------------

app.listen(config.port, () => {
  console.info(`The server is running at http://localhost:${config.port}/`);
});
