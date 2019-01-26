const axios = require('axios');
const bcrypt = require('bcryptjs');
const { authenticate, generateToken } = require('../auth/authenticate');

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

function register(req, res) {
  // implement user registration
  const {username, password} = req.body;
	const hash = bcrypt.hashSync(password, 14);
  const userInfo = {
    username, password: hash
  }
	userDb('users')
		.insert(userInfo)
		.then(ids => {
			res.status(201).json(ids);
		})
		.catch(err => res.status(500).json({errorMessage: err}));
}

function login(req, res) {
  const { username, password } = req.body;

	userDb('users')
		.where({ username })
		.first()
		.then(user => {
			if (user && bcrypt.compareSync(password, user.password)) {

				const token = generateToken(user);

				res.status(200).json({ message: `hello ${user.name}`, token });
			} else {
				res.status(401).json({ you: 'you are not allowed' });
			}
		})
		.catch(err => res.status(500).json({errorMessage: err}));
}

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: 'application/json' },
  };

  axios
    .get('https://icanhazdadjoke.com/search', requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}
