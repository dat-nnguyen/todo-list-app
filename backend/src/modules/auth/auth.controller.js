import * as authService from './auth.service.js';

export async function register(req, res, next) {
    try {
        const user = await authService.register(req.body);
        res.status(201).json({ user: toUserResponse(user) });
    } catch (error) {
        next(error);
    }

    //auto login after register
}

export async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        const user = await authService.login(email, password);

        req.session.regenerate((err) => {
            if (err) return next(err);

            req.session.userId = user.id;
            res.status(200).json({ user: toUserResponse(user) });
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
        res.status(200).json({ user: toUserResponse(user) });
    } catch (error) {
        next(error);
    }
}

export async function requestPasswordReset(req, res, next) {
    try {
        await authService.requestPasswordReset(req.body.email);
        res.status(200).json({ message: 'If an account exists for this email, password reset instructions will be sent.' });
    } catch (error) {
        next(error);
    }
}

function toUserResponse(user) {
    return {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
    }
}
