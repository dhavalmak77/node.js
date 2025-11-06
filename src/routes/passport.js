const express = require('express');
const passport = require('passport');
const { indexController } = require('../controllers/passport');
const router = express.Router();

require('../auth/google');

router.get('/', indexController);

router.get(
	'/auth/google',
	passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/authenticated', (req, res) => {
	if (!req.isAuthenticated()) {
		return res.redirect('/passport');
	}

	res.send(`Hello ${req.user.displayName}, you have been authenticated successfully!
		\nLogout: Click here to <a href="/passport/logout">logout</a>
		\nData: ${JSON.stringify(req.user, null, 4)}`);
});

router.get('/logout', (req, res) => {
	if (!req.isAuthenticated()) {
		return res.redirect('/passport');
	}

	req.logout((err) => {
		if (err) {
			return next(err);
		}
		res.redirect('/passport');
	});
});

router.get(
	'/auth/google/callback',
	passport.authenticate('google', {
		failureRedirect: '/passport',
		successRedirect: '/passport/authenticated',
	})
);

module.exports = router;