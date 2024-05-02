class Controls {
  constructor() {
    this.expos = [];
  }
  OpenNavbar() {
    if ($("#Phone").hasClass("toggle")) {
      $("#Phone").removeClass("toggle");
      $("body").css("overflow", "scroll");
      $(".hamburger").removeClass("toggle");
    } else {
      $("body").css("overflow", "hidden");
      $("#Phone").addClass("toggle");
      $(".hamburger").addClass("toggle");
    }
  }

  RetrieveUpcommingExpos() {
    $.post("/GetUpcommingExpos", function (data) {
      let html = `
            <section class="expandableMenu toggle">
                <div class="bar">
                    <h2>Geplande Expo's</h2>
                        <span>&#x2771;</span>
                    </div>
                    <div class="dropdown upcomming">`;
      for (let expo of data) {
        let dates = expo.date.split("|");
        let locations = expo.location.split("|");
        let descriptions = expo.description.split("|");
        html += `
                            <div class="upcommingExpo">
                                <img src="./Images/Expos/Upcomming/${expo.imageName}" alt="">
                                <div class="info">
                                    <h2>${expo.name}</h2>
                                    <div class="wrapper">
                                        <img src="https://img.icons8.com/ios-filled/50/null/calendar--v1.png"/>
                                        <div class="datewrapper">`;
        for (let date of dates) html += `<p>${date}</p>`;
        html += `</div>
                                    </div>
                                    <div class="wrapper">
                                        <img src="https://img.icons8.com/ios-filled/50/null/marker.png"/>
                                        <div class="locationwrapper">`;
        for (let location of locations) html += `<p>${location}</p>`;
        html += `</div>
                                    </div>
                                    <div class="wrapper">
                                     <img src="https://img.icons8.com/external-others-inmotus-design/67/null/external-Info-basic-elements-others-inmotus-design.png"/>
                            <div class="locationwrapper">`;
        for (let description of descriptions) {
          if (description.includes('www')) html += `<a href="${description}">${description}</a>`;
          else html += `<p>${description}</p>`;
        
        }
        html += `</div>
                                </div>
                            </div>`;
      }
      html += `</div></section>`;

      $(".expowrapper").prepend(html);
    });
  }

  RetrieveAllExpos() {
    $.post("/GetAllExpos", function (data) {
      data = data.sort((a, b) => new Date(b.date) - new Date(a.date));
      data.forEach(expo => {
        controls.expos.push(expo);
      });

      for (let i = 0; i<data.length; i++) {
        const expo = data[i];

        let html = `
        <section class="expandableMenu" id="expo-${i}">
            <div class="bar">
                <h2>${expo.title}</h2>
                <span>&#x2771;</span>
            </div>
            <div class="dropdown gallery"></div>
        </section>`;
        $(".expowrapper").append(html);
      }
    });
  }
  OpenMenu(index) {
    let imagesHtml = "";
    let expoId = index - 1;
    let expo = this.expos[expoId];
    
    for (let file of expo.files) {
      let ext = file.split(".")[1];
      if (ext == "jpeg" || ext == "jpg" || ext == "png")
      imagesHtml += `<img src="./Images/Expos/${expo.title}/${file}">`;
      if (ext == "mp4")
      imagesHtml += `
                        <video autoplay muted loop>
                            <source src="./Images/Expos/${expo.title}/${file}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video> 
                        `;
    }
    $('#expo-' + expoId + " .dropdown").append(imagesHtml)
  }
}

var controls = new Controls();

$(document).ready(() => {
  controls.RetrieveUpcommingExpos();
  controls.RetrieveAllExpos();

  setTimeout(() => {
    $("section[class^=expandableMenu]").each((index, ele) => {
      
      $(ele).click(() => {
        controls.OpenMenu(index)
        if ($(ele).hasClass("toggle")) $(ele).removeClass("toggle");
        else $(ele).addClass("toggle");
      });
    });
  }, 1200);
});
