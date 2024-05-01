var ispArr = ["Telenet", "Proximus", "Scarlet", "KPN"];

let exists = false;

let ip;
$.get('https://api.ipify.org?format=json', function(data) {
    ip = data.ip
    
}).then(() => {
    $.post("/CheckIp", {ip: ip}, function(data) { exists = data })
    .then(() => {
        if (!exists) {
            fetch(`https://ipapi.co/${ip}/json/`)
            .then((response) => response.json())
            .then((data) => {
                for (let isp of ispArr) {
                    if (data.org.indexOf(isp) >= 0) $.post("/AddUniqueVisit", {data: data}, function(data){});
                }
            });
        }
    })
});