const { Painting } = require("./Painting");
const fs = require("fs");

const defaultPath = "../public/";

class PaintingRepository {
  constructor(_controls) {
    this.paintingArr = [];
    this.controls = _controls;
  }
  ReadJSON() {
    var _JSON = fs.readFileSync(defaultPath + "/Data/Paintings.json");
    this.paintingArr = JSON.parse(_JSON);
  }
  UpdateJSON() {
    var data = JSON.stringify(this.paintingArr);
    fs.writeFileSync(defaultPath + "/Data/Paintings.json", data);
    this.ReadJSON();
  }
  FindPaintingByID(id) {
    var painting = null;
    for (let i = 0; i < this.paintingArr.length; i++)
      if (this.paintingArr[i].id == id) painting = this.paintingArr[i];

    return painting;
  }
  GetID() {
    var id = 0;
    var sortedArr = this.paintingArr.sort((a, b) => a.id - b.id);
    for (let i = 0; i < sortedArr.length; i++) {
      if (sortedArr[i].id == id) id++;
    }
    return id;
  }
  AddPainting(arr, controls) {
    var id = this.GetID();
    var painting = new Painting(
      id,
      arr[0],
      arr[1],
      arr[2],
      controls.TempFiles.length,
      arr[3],
      arr[4]
    );
    arr[0] = arr[0].replace(/ /g, "");
    var dir = defaultPath + "/Images/Gallery/" + arr[0] + "-" + id;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    arr[5].forEach((file) => {
      fs.rename(
        defaultPath + "/Images/TempFiles/" + file.Filename,
        dir + "/" + file.actualID + ".jpg",
        function (err) {
          if (err) console.log("ERROR: " + err);
          controls.TempFiles = [];
          controls.EmptyTempFilesDir();
        }
      );
    });

    this.paintingArr.push(painting);
    this.UpdateJSON();
    this.ReadJSON();
  }
  RemovePainting(painting) {
    var path =
      defaultPath +
      "/Images/Gallery/" +
      painting.title.replace(/ /g, "") +
      "-" +
      painting.id +
      "/";
    fs.rmSync(path, { recursive: true, force: true });

    this.paintingArr.splice(this.paintingArr.indexOf(painting), 1);
    this.UpdateJSON();
  }
}

module.exports = { PaintingRepository };
