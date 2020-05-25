const express = require('express');
const fs = require('fs');
const morgan = require('morgan'); //HTTP request logger middleware

// app adında ve express'in tüm özelliklerine sahip bir değişken tanımladık
const app = express();

/** 1. MIDDLEWARES *************************************************************************************************/
//3rd party middleware
app.use(morgan('dev')); //dev, tiny, ...

//middleware. request ile response arasında birşeyler yapılacak
app.use(express.json()); //parse data from http body

//genelde iki parametre kullanılır. ilki "req", ikincisi "res". üçüncü bir parametre kullanıldığında
//ismi ne olursa olsun bu middleware tanımladığımız anlamına geliyor. Standart olması ve anlaşılması
//için request(req), response(res), element(el), (next) gibi isimler kullanılıyor.
// GLOBAL MIDDLEWARE
app.use((req, res, next) => {
  console.log('Hello from the middleware :)');
  next(); //eğer bu kullanılmazsa uygulama çakılır (o noktada kalır). Middleware kullanılırsa next() mutlaka olacak
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

/** 2. ROUTE HANDLERS **********************************************************************************************/
const getAllTours = (req, res) => {
  console.log(req.requestTime);

  res.status(200).json({
    status: 'success', //success, fail, error
    requestedAt: req.requestTime,
    results: tours.length, //json standardında bu alan genelde olmaz ama client tarafında işe yarayabilir diye yollanıyor
    data: {
      //tours: tours, //ES6'de aynı isimlileri yazmaya gerek yok ama standart olarak yazılabilir.
      tours,
    },
  });
};

const getTour = (req, res) => {
  //console.log(req.params);

  const id = req.params.id * 1; //string to number işlemi. Burada çoklu parametre olsaydı (x ve y) .x ve .y ile erişecektik
  //const id = Number(req.params);

  //tours dizisinin tüm elemanlarını tek tek "el" içine alır. el.id'si id'ye eşitse o öğeyi döner. Yoksa undefined döner
  const tour = tours.find((el) => el.id === id);

  // burada bu şekilde kullanmak çok sorun değil. Gerçek bir uygulama yapmıyoruz...
  //if (id > tours.length) {
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'invaid ID',
    });
  }

  res.status(200).json({
    status: 'success', //success, fail, error
    // results: tours.length, //json standardında bu alan genelde olmaz ama client tarafında işe yarayabilir diye yollanıyor
    data: {
      tour,
    },
  });
};

//create a new tour (client to server)
const createTour = (req, res) => {
  //console.log(req.body); //middleware'den gelen özellik. Tepeden kapatılırsa "undefined" olarak log'lanır

  const newId = tours[tours.length - 1].id + 1; //tours[8].id alınıp 1 fazlası newId'ye atandı
  const newTour = Object.assign({ id: newId }, req.body); //req.body alınıp içine { id: newId } keyi eklendi

  tours.push(newTour); //newTour tours içine eklendi (push)
  // event loop içinde olduğumuzdan sync versiyon kullanmayacağız. Sadece yukarda top level kodda kullandık
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      // 200 kodu "ok", 201 kodu "created", 404 "not found" demek
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
};

// Update Tour
const updateTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'invaid ID',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>',
    },
  });
};

// Delete Tour
const deleteTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'invaid ID',
    });
  }

  // 204 kodu "no content" demek
  res.status(204).json({
    status: 'success',
    data: null,
  });
};

const getAllUsers = (req, res) => {
  // kod 500 "internal server error" demek
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

const getUser = (req, res) => {
  // kod 500 "internal server error" demek
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

const createUser = (req, res) => {
  // kod 500 "internal server error" demek
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

const updateUser = (req, res) => {
  // kod 500 "internal server error" demek
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

const deleteUser = (req, res) => {
  // kod 500 "internal server error" demek
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

/** 3. ROUTES *****************************************************************************************************/
const tourRouter = express.Router();
tourRouter.route('/').get(getAllTours).post(createTour);
tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

const userRouter = express.Router();
userRouter.route('/').get(getAllUsers).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

//yukarıda tanımlamalar yapıldı. Burada da kullanıldı
app.use('api/v1/tours', tourRouter); //tourRouter middleware'i app'e bağlar. tourRouter sadece "api/v1/tours" isteğinde çalışır
app.use('api/v1/users', userRouter);

/** 4. START SERVER *************************************************************************************************/
const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`); //buradaki tırnak işaretleri Alt Gr ile basılan ;'den geliyor
});
