const JWT = require('jsonwebtoken');
const cloudinary = require("cloudinary");
const Service = require('../models/explore-service');
const Store = require('../models/store');
const ServiceImportant = require('../models/explore-service-important');
const appMessages = require('./utils/messages');
const appStatus = require('./utils/app-status');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
  });

uploader = (img) => {
    return new Promise ((resolve, reject) => {
    cloudinary.uploader.upload(img, function(result) { 
        const image = {
            url: result.url,
            id: result.public_id
        };
        resolve(image);
        });
    })   
}

module.exports = {

  create: async (req, res, next) => {

    const body = req.body; 

    const imgs = [];

    Object.keys(body.imgs).forEach( key => {
        imgs.push(body.imgs[key])
    })

    const promises = [];

    for (const img of imgs) {
        promises.push(uploader(img));
      }
    body.created = new Date().getTime();
    let store = await Store.find({userId: req.user._id, isActive: true});
    Promise.all(promises).then( uploads => {

        const uploadsObj = {}

        uploads.forEach((upload, i) => {
            uploadsObj[i] = upload
        })
   
        body.imgs = uploadsObj;
        
        body.store = store._id;
        
        const service = new Service(body);
        
        service.save((err, serviceDB) => {
    
            if (err) {
                return res.status(500).json();
            }        
            res.status(200).json();  
    
        });    

    })
  },

  all: async (req, res, next) => {

    let status        = 200; //server
    let statusApp     = appStatus.status.ok.code;
    let response      = {
      data: [],
      message: appStatus.status.ok.description,
      status: statusApp
    }
    const defaultNumberOfRecords = 20;
    const page          = req.query.page || 0;    
    const records       = req.query.records || defaultNumberOfRecords;
    let pageNumber      = 0;
    let numberOfRecords = defaultNumberOfRecords;
    //check inputs is not numeric
    if(! (/^\d+$/.test(page)) )
    {
      pageNumber        = 0;
      numberOfRecords   = 0;
      response.status   = appStatus.status.bad_request.code;
      response.message  = appMessages.message.general.not_a_number;
    }else
    {
      if(Number(page) > 1)
      {
        pageNumber      = Number(page)*numberOfRecords;
      }
      numberOfRecords   = Number(records);

    }
    console.log(numberOfRecords);
    const data          = await Service.find({isActive:true}).skip(pageNumber).limit(numberOfRecords);
    response.data       = data;
    res.status(status).json(response);
  },

  one: async (req, res, next) => {
    const id = req.params.id;

    Ticket.findById(id, (err, ticketDB) => {

        if (err) {
            return res.status(500).json({ err });
        }

        if (!ticketDB) {
            return res.status(400).json({ err: 'El ID no es correcto' });
        }

        res.status(200).json({ ticketDB });

    });
  },

  update: async (req, res, next) => {

    const id = req.params.id;
    const body = req.body; 

    Ticket.findByIdAndUpdate(id, body, (err, ticketDB) => {
        if (err) {
            return res.status(500).json({ err });
        }
        res.status(200).json( {done: true});
    })
  },

  delete: async (req, res, next) => {

    const id = req.params.id;

    Ticket.findByIdAndRemove(id, (err, ticketDB) => {

        if (err) {
            return res.status(500).json({ err });
        }

        if (!ticketDB) {
            return res.status(400).json({err: 'El id no existe' });
        }

        res.status(200).json({ done: true });

    });

  },
    
    //MANAGE EXPLORE SERVICE

  mark: async (req, res, next) => {

    let status          = 200; //server
    const id            = req.params.id;
    const body          = req.body; 
    let statusApp     = appStatus.status.ok.code;
    let response      = {
      data: [],
      message: appStatus.status.ok.description,
      status: statusApp
    }
    const marked        = {
      exploreService: id,
      created: new Date().getTime(),
      mark: body.mark,
      isActive: body.mark
    }
    const updateServiceExplore = {
      isActive: body.mark,
      mark: body.mark
    }
    formerServiceExplore = await ServiceImportant.findOne({exploreService: id, isActive: true});
    if(! formerServiceExplore){
      console.log("CREAR");
      await ServiceImportant.create(marked);
    }else{
      let responseModel = await ServiceImportant.findOneAndUpdate({exploreService: id,isActive: true}, updateServiceExplore);
      response.data = marked;
    }
    res.status(status).json(response);
  },
  
  important: async (req, res, next) => {

    let status          = 200; //server
    let statusApp       = appStatus.status.ok.code;
    let response        = {
      data: [],
      message: appStatus.status.ok.description,
      status: statusApp
    }
    const defaultNumberOfRecords = 20;
    const page          = req.query.page || 0;    
    const records       = req.query.records || defaultNumberOfRecords;
    const mark       = req.query.mark || true;
    let pageNumber      = 0;
    let numberOfRecords = defaultNumberOfRecords;
    //check inputs is not numeric
    if(! (/^\d+$/.test(page)) )
    {
      pageNumber        = 0;
      numberOfRecords   = 0;
      response.status   = appStatus.status.bad_request.code;
      response.message  = appMessages.message.general.not_a_number;
    }else
    {
      if(Number(page) > 1)
      {
        pageNumber      = Number(page)*numberOfRecords;
      }
      numberOfRecords   = Number(records);

    }
    console.log(mark);
    const data          = await ServiceImportant.find({isActive:true, mark: mark})
              .populate('exploreService','category title description price imgs')
              .skip(pageNumber)
              .limit(numberOfRecords);
    response.data       = data;
    res.status(status).json(response);    
  },

}