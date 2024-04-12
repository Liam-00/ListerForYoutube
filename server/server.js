import express from 'express'

const app = express()
const port = 9191

app.use(express.static('public'))

app.get("/", (req,res) => {
    res.sendFile("./pages/index.html", {root : process.cwd()})
})

app.listen(port, () => {
    console.log("Server Started")
})