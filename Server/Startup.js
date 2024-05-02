const path = require("path");
const express = require("express");
const app = express();
const cors = require("cors");
const fs = require("fs");
const https = require("https");
const bodyParser = require("body-parser");
const multer = require("multer");
const nodeMailer = require("nodemailer");
const proxy = require("html2canvas-proxy");

const { AccountRepository } = require("./Models/AccountRepository");
const { Controls } = require("./Models/Controls");
const { PaintingRepository } = require("./Models/PaintingRepository");

const Port = process.env.PORT || 80;

let tempFileName = "";
let accounts, paintings, controls, grepoTowns, grepoTags;

app.use(express.static(path.join(__dirname, "../public/")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "10000mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "10000mb", extended: true }));
app.use(cors());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/Images/TempFiles"));
  },
  filename: function (req, file, cb) {
    tempFileName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      "-" +
      file.originalname;
    cb(null, tempFileName);
  },
});

var upload = multer({ storage: storage });

app.post("/UPLOADImage", upload.array("files"), uploadFiles);
app.post("/:action", function (req, res) {
  switch (req.param("action")) {
    case "GETPaintings":
      {
        res.send(paintings.paintingArr);
        res.end();
      }
      break;
    case "GETVisits":
      {
        res.send(controls.GetVisits());
        res.end();
      }
      break;
    case "GETAccounts":
      {
      }
      break;
    case "EDITViews":
      {
        var id = req.body.id;
        var painting = paintings.FindPaintingByID(id);
        painting.views++;
        paintings.UpdateJSON();
      }
      break;
    case "GETPrivateCode":
      {
        res.send(controls.GeneratePrivateCode());
        res.end();
      }
      break;
    case "CheckLogin":
      {
        var dataArr = req.body.dataArr;
        var callback = controls.CheckLogin(dataArr[0], dataArr[1]);
        var account = accounts.FindAccountByUsername(dataArr[0]);
        res.send(callback);
        res.end();
      }
      break;
    case "CheckAdmin":
      {
        var dataArr = req.body.dataArr;
        var account = accounts.FindAccountByUsername(dataArr[0]);
        if (account == null) {
          res.send("ERROR");
          return;
        }
        if (account.currentPrivateCode != dataArr[1]) {
          res.send("ERROR");
          return;
        }
        res.send("SUCCESS");
        res.end();
      }
      break;
    case "ADDvisit":
      {
        var dataArr = req.body.dataArr;
        if (dataArr == undefined) return;
        controls.CheckIfVisitExists(dataArr);
      }
      break;
    case "GETTempFiles":
      {
        res.send(controls.TempFiles);
        res.end();
      }
      break;
    case "REMOVEImage":
      {
        var id = req.body.id;
        var file = controls.FindTempFileById(id);
        if (file == null) {
          res.send("ERROR");
          return;
        }

        try {
          fs.unlinkSync(
            path.join(__dirname, "../public/Images/TempFiles/" + file.Filename)
          );
          controls.TempFiles.splice(controls.TempFiles.indexOf(file), 1);
          res.send("SUCCES");
        } catch {
          res.send("ERROR");
        }

        res.end();
      }
      break;
    case "ADDPainting":
      {
        var dataArr = req.body.dataArr;
        paintings.AddPainting(dataArr, controls);
        res.send("SUCCES");
        res.end();
      }
      break;
    case "EDITPainting":
      {
        var editedPainting = req.body.painting;
        var painting = paintings.FindPaintingByID(editedPainting.id);

        var oldDir = path.join(
          __dirname,
          "../public/Images/Gallery/" +
            painting.title.replace(/ /g, "") +
            "-" +
            painting.id
        );
        var newDir = path.join(
          __dirname,
          "../public/Images/Gallery/" +
            editedPainting.title.replace(/ /g, "") +
            "-" +
            editedPainting.id
        );

        fs.rename(oldDir, newDir, (err) => {
          if (err) {
            throw err;
          }
        });

        painting.title = editedPainting.title;
        painting.description = editedPainting.description;
        painting.buystate = editedPainting.buystate;
        painting.price = editedPainting.price;
        painting.type = editedPainting.type;
        painting.uploadDate = new Date();

        for (let i = 0; i < controls.TempFiles.length; i++) {
          file = controls.TempFiles[i];
          file.actualID = painting.paintingamount;
          fs.rename(
            path.join(
              __dirname,
              "../public/Images/TempFiles/" + file.Filename,
              newDir + "/" + file.actualID + ".jpg"
            ),
            function (err) {
              if (err) console.log("ERROR: " + err);
            }
          );
          painting.paintingamount++;
        }
        controls.TempFiles = [];
        controls.EmptyTempFilesDir();
        paintings.UpdateJSON();

        res.send("SUCCESS");
        res.end();
      }
      break;
    case "RESET":
      {
        controls.TempFiles = [];
        controls.EmptyTempFilesDir();
        res.end();
      }
      break;
    case "REMOVEPainting":
      {
        var paintingId = req.body.id;
        var painting = paintings.FindPaintingByID(paintingId);
        paintings.RemovePainting(painting);

        res.send("SUCCESS");
        res.end();
      }
      break;
    case "REFRESHPaintings":
      {
        res.send(paintings.paintingArr);
        res.end();
      }
      break;
    case "REMOVEEditImage":
      {
        var painting = paintings.FindPaintingByID(req.body.painting.id);
        var imageId = req.body.imageId;
        try {
          var dir = path.join(
            __dirname,
            "../public/Images/Gallery/" +
              painting.title.replace(/ /g, "") +
              "-" +
              painting.id +
              "/"
          );
          fs.unlinkSync(dir + imageId + ".jpg");
          painting.paintingamount -= 1;
          res.send("SUCCES");
          res.end();
        } catch {
          res.send("ERROR");
          res.end();
        }
        res.end();
      }
      break;
    case "SENDEmail":
      {
        let mailObject = req.body.mailObject;
        let transporter = nodeMailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          auth: {
            user: "wannes.schillebeeckx@gmail.com",
            pass: "bebaaxedpvuaidfi",
          },
        });

        var msgBuilder = "";
        msgBuilder += '<p style="font-weight: bold">Gegevens:<br>';
        msgBuilder +=
          "Naam: " + mailObject.name + " " + mailObject.prename + "<br>";
        msgBuilder += "Email: " + mailObject.email + "<br>";
        msgBuilder += " Gsm: " + mailObject.phone + "<br>";
        msgBuilder += "-----------</p>";
        msgBuilder +=
          '<article style="font-family: sans-serif">' +
          mailObject.message.replace(/\n/g, "<br>") +
          "</article>";
        msgBuilder += '<br><br><br><img src="cid:image@bijnensart.be"/>';

        let mailOptions = {
          from: "Info@bijnensart.be",
          to: "anja.bijnens@outlook.com",
          cc: mailObject.email,
          subject: mailObject.subject,
          html: msgBuilder,
          attachments: [
            {
              filename: "maskersHome.png",
              path: "../public/Images/Main/imageattachment.png",
              cid: "image@bijnensart.be",
            },
          ],
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            res.send("ERROR");
            res.end();
            console.error(error);
          } else {
            res.send("SUCCESS");
            res.end();
          }
        });
      }
      break;
    case "GetAllExpos":
      {
        let dirs = fs.readdirSync(
          path.join(__dirname, "../public/Images/Expos")
        );

        let data = [];

        for (let dir of dirs) {
          let files = fs.readdirSync(
            path.join(__dirname, `../public/Images/Expos/${dir}`)
          );
          if (dir == "Upcomming") continue;
          data.push({ date: dir.split(" ")[0], title: dir, files: files });
        }

        res.send(data);
        res.end();
      }
      break;
    case "AddUniqueVisit":
      {
        controls.HandleVisit(req.body.data);
        res.end();
      }
      break;
    case "CheckIp":
      {
        res.send(controls.CheckVisit(req.body.ip));
        res.end();
      }
      break;
    case "GetUpcommingExpos":
      {
        let data = JSON.parse(
          fs.readFileSync(
            path.join(
              __dirname,
              "../public/Images/Expos/Upcomming/Content.json"
            )
          )
        );

        res.send(data);
        res.end();
      }
      break;
  }
});

app.listen(Port, function () {
  Log(`App listening at https://localhost:${Port}`);

  accounts = new AccountRepository();
  controls = new Controls(accounts);
  paintings = new PaintingRepository(controls);

  paintings.ReadJSON();
  accounts.ReadJSON();
})

function Log(msg) {
  let date = new Date();
  let currTime =
    ("0" + date.getDate()).slice(-2) +
    "-" +
    ("0" + (date.getMonth() + 1)).slice(-2) +
    "-" +
    date.getFullYear() +
    " | " +
    date.getHours() +
    ":" +
    date.getMinutes() +
    ":" +
    date.getSeconds();
  console.log(`[${currTime}] ${msg}`);
}

//1200x640
function uploadFiles(req, res) {
  req.files.forEach((file) => {
    controls.HandleImage(tempFileName);
    controls.TempFiles.push({
      Filename: tempFileName,
      id: controls.GetID(),
      actualID: null,
    });
  });

  res.send(controls.TempFiles);
  res.end();
}
