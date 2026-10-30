import * as authService from './auth.service.js';

export async function register(req, res, next) {
    try {
        const user = await authService.register(req.body);
        res.status(201).json({ user });
    } catch (error) {
        next(error);
    }
}

export async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        const user = await authService.login(email, password);

        req.session.regenerate((err) => {
            if (err) return next(err);

            req.session.userId = user.id;
            res.status(200).json({ user });
        })

    } catch (error) {
        next(error);
    }
}

export async function logout(req, res, next) {
  try {
    req.session.destroy((err) => {
      if (err) return next(err);
      res.clearCookie('connect.sid');
      res.status(204).send();
    });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res, next) {
    try {
        const user = await authService.getMe(req.session.userId);
        res.status(200).json({ user });
    } catch (error) {
        next(error);
    }
}
