require('dotenv').config();

const express = require('express');
const dbConnection = require('./db');
const controllers = require("./controllers");
const middleware = require('./middleware');

// // * image upload ----------------------
// const multer  = require('multer')
// const upload = multer({ dest: 'uploads/' })
// const fs = require('fs')
// const util = require('util')
// const unlinkFile = util.promisify(fs.unlink)

// const { uploadFile, getFileStream } = require('./s3')
// //* ------------------------------------------

const app = express();

app.use(middleware.CORS);
app.use(express.json());

app.use('/auth', controllers.usercontroller);
app.use("/posts", controllers.postcontroller);
// app.use(middleware.validateSession); //! no need with validateJWT function
app.use("/comments", controllers.commentcontroller);


// //* image upload -----------------------
// app.get('/images/:key', (req, res) => {
//     const key = req.params.key
//     const readStream = getFileStream(key)

//     readStream.pipe(res)
// })

// app.post('/images', upload.single('image'), async (req, res) => {
//     const file = req.file
//     console.log(file)
//     const result = await uploadFile(file)
//     await unlinkFile(file.path)
//     console.log(result)
//     const description = req.body.description
//     res.send({imagePath: `/images/${result.Key}`})
// })
// //* ---------------------------------------

try {
    dbConnection
        .authenticate()
        .then(async () => await dbConnection.sync(/* {force: true} */)) // force: true will drop all tables in pgAdmin and resync them. This is necessary after you make a change to a model, and need to sync any new table headers to the database.
        .then(() => {
            app.listen(process.env.PORT, () => {
                console.log(`[SERVER]: App is listening on ${process.env.PORT}`);
            });
        });
} catch (err) {
    console.log('[SERVER]: Server crashed');
    console.log(err);
}
