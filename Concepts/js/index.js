const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const path = require('path')
const PORT = 3000

app.use(express.json())
app.use(express.static(path.join(__dirname, '..', 'public')))

const users = []

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views/index.html'))
})

app.get('/users', (req, res) => {
    res.json(users)
})

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views/login.html'))
})

app.post('/users', async (req, res) => {
    try {
        const pwrd = await bcrypt.hash(req.body.password, 10)
        const user = { username: req.body.username, password: pwrd }
        users.push(user)
        res.status(201).send()
    } catch {
        res.status(500).send()
    }
})

app.post('/users/login', async (req, res) => {
    const user = users.find(user => user.username === req.body.username)
    if (user == null) {
        return res.status(400).send('Cannot find user')
    }
    try {
        if (await bcrypt.compare(req.body.password, user.password)) {
            res.send('Login successful')
        } else {
            res.send('Login failed')
        }
    } catch {
        res.status(500).send()
    }
})

app.listen(process.env.PORT || PORT, console.log(`Listening on port ${PORT}`))