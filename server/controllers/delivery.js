const JWT = require('jsonwebtoken');
const cloudinary = require("cloudinary");
const Model = require('../models/job-application');


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
  });


module.exports = {

  create: async (req, res, next) => {

    const body = req.body; 
    const model = new Model({
        userId: body.userId,
        name: body.name,
        img: body.img,
        date: body.date,
        isActive: body.isActive
    });

    const img = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";

    cloudinary.uploader.upload(img, 
        function(result) { 

            model.img.url = result.url;
            model.img.id = result.public_id;

            model.save((err, data) => {

                if (err) {
                    return res.status(500).json();
                }        
                res.status(200).json({ data });  
        
            });
        });
  },

  all: async (req, res, next) => {

    const desde = req.query.desde || 0;
    const limite = req.query.limite || 2;

    desde = Number(desde);
    limite = Number(limite);

    Model.find({})
    // .skip(desde)
    // .limit(limite)
    // .sort('category')
    // .populate('user', 'name')
    .exec((err, data) => {

        if (err) {
            return res.status(500).json({ err  });
        }
        res.status(200).json({ data });
    })
  },

  one: async (req, res, next) => {
    const id = req.params.id;

    Model.findById(id, (err, data) => {

        if (err) {
            return res.status(500).json({ err });
        }

        if (!data) {
            return res.status(400).json({ err: 'El ID no es correcto' });
        }

        res.status(200).json({ data });

    });
  },

  update: async (req, res, next) => {

    const id = req.params.id;
    const body = req.body; 

    Model.findByIdAndUpdate(id, body, (err, delivery) => {
        if (err) {
            return res.status(500).json({ err });
        }
        res.status(200).json( {done: true});
    })
  },

  delete: async (req, res, next) => {

    const id = req.params.id;

    Model.findByIdAndRemove(id, (err, data) => {

        if (err) {
            return res.status(500).json({ err });
        }

        if (!data) {
            return res.status(400).json({err: 'El id no existe' });
        }

        res.status(200).json({ done: true });

    });

  }
}