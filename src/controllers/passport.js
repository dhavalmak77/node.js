const indexController = (req, res) => {
	res.send(`<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Document</title>
		</head>
		<body>
			<a href="/passport/auth/google">Login with Google</a>
		</body>
	</html>`)
}

module.exports = { indexController };