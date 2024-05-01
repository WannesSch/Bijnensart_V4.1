// ==/UserScript==// ==UserScript==
// @name         Grepolis Unit and Map extender
// @author       Jwakkes
// @description  Grepolis Unit and Map extender by Jwakkes
// @include      http://*.grepolis.com/game/*
// @include      https://*.grepolis.com/game/*
// @exclude      view-source://*
// @exclude      https://classic.grepolis.com/game/*
// @version      2022.2.14.1
// @grant GM_setValue
// @grant GM_getValue
// @grant unsafeWindow
// @require https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js
// ==/UserScript==

var UWGame = unsafeWindow.Game;
unsafeWindow.UWGame = UWGame;

let towns = [];

let availableTowns = [];

let reportOpen = false;
let wallOpen = false;

let rounded = false;
let reportRounded = false;

let allReports = [];

let currentTownId = null;

let once = false;

let private = true;

class Building {
    constructor(_id, _name, _requiredLevel) {
        this.id = _id;
        this.name = _name;
        this.requiredLevel = _requiredLevel;
    }
}

//Unit handler
const CreateButton = () =>  {
    if(document.getElementById('GECBtn') == null){
        var a = document.createElement('div');
        a.id = "GECBtn";
        a.className = 'btn_settings circle_button';
        a.innerHTML = 'E';
        a.style.top = '142.5px';
        a.style.right = '110px';
        a.style.zIndex = '10000';
        a.style.display = 'flex';
        a.style.alignItems = 'center';
        a.style.justifyContent = 'center';
        a.style.color = '#ecb44d';
        a.style.fontWeight = 'bold';
        a.style.fontFamily = "sans-serif"
        document.getElementById('ui_box').appendChild(a);
        $("#GECBtn").click(HandleUnitChange);
    }
}
const HandleUnitChange = () => {
    if (rounded) rounded = false;
    else rounded = true;
}
const HandleUnits = window => {
    if (window == 'report') {
        const reports = document.getElementsByClassName('report_unit');

        for (let i = 0; i<reports.length; i++) {
            let unit = reports[i]

            let unitCount = $(unit).attr("data-unit_count");

            if (!unitCount) {
                if (!$(unit).attr("oldUnitCount")) {
                    $(unit).attr("oldUnitCount", $(unit).children().html())
                }
                unitCount = $(unit).attr("oldUnitCount");
            }

            if (!rounded) {
                $(unit).children().html(unitCount)
                if (unitCount > 10000) $(unit).children().css('font-size', '10px');
            }
            else {
                if (unitCount >= 1000) {
                    let newCount = Math.round(unitCount/100)*100
                    $(unit).children().html(newCount/1000 + "K");
                }
            }
        }


    }
    if (window == 'wall') {
        const unitElements = document.getElementsByClassName('wall_unit_container');

        $(unitElements[0]).attr('id', 'WALL_0');
        $(unitElements[1]).attr('id', 'WALL_1');
        $(unitElements[2]).attr('id', 'WALL_2');
        $(unitElements[3]).attr('id', 'WALL_3');

        for (unitElement of unitElements) {
            let id = $(unitElement).attr("id");
            let unitList = $("#" + id).children().toArray();


            if (rounded) {
                unitList.forEach(unitDiv => {
                    let units = $(unitDiv).children();
                    let unitType = $(units).attr('class').split(" ")[2];

                    let unitCount = $("#" + id + " .grcrt_wall_units ." + unitType + " span").html();
                    if (unitCount >= 1000) {
                        let newCount = Math.round(unitCount/100)*100
                        $("#" + id + " .grcrt_wall_units ." + unitType + " span").attr("UnitAmount", unitCount);
                        $("#" + id + " .grcrt_wall_units ." + unitType + " span").html(newCount/1000 + "K");
                        $("#" + id + " .grcrt_wall_units ." + unitType + " span").css('font-size', '12.5px')
                    }

                })
            }
            else {
                unitList.forEach(unitDiv => {
                    let units = $(unitDiv).children();

                    let unitType = $(units).attr('class').split(" ")[2];

                    let oldUnitCount = $("#" + id + " .grcrt_wall_units ." + unitType).attr("data-unit_count");
                    $("#" + id + " .grcrt_wall_units ." + unitType + " span").html(oldUnitCount);
                    let unitCount = $("#" + id + " .grcrt_wall_units ." + unitType + " span").html();
                    if (unitCount > 10000) $("#" + id + " .grcrt_wall_units ." + unitType + " span").css('font-size', '10px')
                })
            }
        }
    }
}

//Event
function HandleEvent() {
    let neededUnits = $('.details .details_description span b').html().toLowerCase();
    let tool = $('.details .details_hint').children()[0].childNodes[1].innerHTML.toLowerCase();
    let materials = $('.details .details_hint').children()[1].childNodes[1].innerHTML
    let totalUnits = $('.details .details_resources .details_resources_right span').html();

    console.log(neededUnits, tool, materials)

    if (!neededUnits || !tool || !materials || !totalUnits) return;

    let unitmultiplier = 0;
    switch(neededUnits) {
        case "panes": unitmultiplier = 1; break;
        case "silens": unitmultiplier = 2; break;
        case "phallophoros": unitmultiplier = 3; break;
        case "kanephoroi": unitmultiplier = 1; break;
        case "dryaden": unitmultiplier = 2; break;
        case "hogepriesters": unitmultiplier = 4; break;
    }

    let unitsAmount = Math.ceil((parseInt(totalUnits) * 0.6) / unitmultiplier);
    console.log(unitsAmount)
    console.log(unitmultiplier)
    let amount = 0;
    let unit;
    switch(tool) {
        case "geiten": {unit = "Kanephoroi"; amount = Math.ceil((unitsAmount + (totalUnits * 0.1))/3)}; break;
        case "luipaarden": {unit = "Dryaden"; amount = Math.ceil((unitsAmount + (totalUnits * 0.1))/8)}; break;
        case "ezels": {unit = "Phallophoros"; amount = Math.ceil((unitsAmount + (totalUnits * 0.1))/15)}; break;
        case "bullock carts": {unit = "Panes"; amount = Math.ceil((unitsAmount + (totalUnits * 0.1))/6)}; break;
        case "penselen": {unit = "Hogepriesters"; amount = Math.ceil((unitsAmount + (totalUnits * 0.1))/20)}; break;
        case "messen": {unit = "Silens"; amount = Math.ceil((unitsAmount + (totalUnits * 0.1))/7)}; break;
    }

    let materialUnit;
    let marterialunitamount = 0;

    materials = materials.split(" ");
    materials[1] = materials[1].toLowerCase()
    switch(materials[1]) {
        case "honingraten": {materialUnit = "Hogepriesters"; marterialunitamount = Math.ceil(parseInt(materials[0])/60)}; break;
        case "vijgen": {materialUnit = "Dryaden"; marterialunitamount = Math.ceil(parseInt(materials[0])/300)}; break;
        case "druiven": {materialUnit = "Phallophoros"; marterialunitamount = Math.ceil(parseInt(materials[0])/300)}; break;
    }


    let info = document.getElementById('JWAX_info');
    let html = `<div id="JWAX_info" style="color: green;">${unitsAmount} ${neededUnits}, ${amount} ${unit}, ${marterialunitamount} ${materialUnit}</div>`
    if(!info) $('.details_hint').append(html);
    
   
    
}

//VS attack buttons
const CreateGrepolisButton = (text, id, width, marginblock = 0) => {
    return `
    <div id="${id}" class="button_new" data-hascaptain="1" style="width: ${width}; margin-right: .5vw; margin-block: ${marginblock};">
		<div class="left"></div>
		<div class="right"></div>
		<div class="caption js-caption">${text}<div class="effect js-effect"></div></div>
    </div>
    `;
}
function AddButtons() {
    if(document.getElementById('GECAttackBtn10') == null){
        let div = document.createElement('div');
        div.style.marginBlock = '1vh';
        div.style.display = 'flex';
        div.style.alignItems = 'start';
        $($($($('.tab_type_attack').parent()).parent()).parent()).css('height', '500px');

        $(div).append(CreateGrepolisButton("10 vs", "GECAttackBtn10", '80px'));
        $(div).append(CreateGrepolisButton("50 vs", "GECAttackBtn50", '80px'));
        $(div).append(CreateGrepolisButton("100 vs", "GECAttackBtn100", '80px'));
        $(div).append(CreateGrepolisButton("1/2 vs", "GECAttackBtnHalf", '80px'));

        $('.tab_type_attack .town_units_wrapper .town_info_units .unit_wrapper').append(div);

        $("#GECAttackBtn10").click(function(){ AddVs("10"); });
        $("#GECAttackBtn50").click(function(){ AddVs("50"); });
        $("#GECAttackBtn100").click(function(){ AddVs("100"); });
        $("#GECAttackBtnHalf").click(function(){ AddVs("half"); });
    }
}
const AddVs = (unitAmount) => {
    console.log('bruh')
    event.preventDefault();
    $('.unit_type_attack_ship').val("");
    /*if (unitAmount == "half") {
        $('.unit_type_attack_ship').val(Math.floor(parseInt($('.unit_container #attack_ship span').html()) /2))
        return;
    }*/

    if (parseInt($('.unit_container #attack_ship span').html()) < unitAmount) $('.unit_type_attack_ship').val($('.unit_container #attack_ship span').html())
    else if($('.unit_type_attack_ship').val() == "") $('.unit_type_attack_ship').val(unitAmount);
    return false;
}

function CreateEditButton(){
    $(".game_list").each(function( townInfoScreen ) {
	    try{
            	if(this.parentNode.parentNode.id == "towninfo_towninfo"){
                	var entityId;
        	        if(this.children[0].innerHTML.includes("grmh.pl")){
	                    entityId = this.parentElement.children[8].children[1].value.split("]")[1].split("[")[0];
                	}
	                else { entityId = this.children[1].children[2].children[0].value.split("]")[1].split("[")[0]; }
	                var tag = '';
	                if(!this.children[0].innerHTML.includes("JWAX_TAGEDIT") && !this.parentElement.children[8].innerHTML.includes("grmhfix")) {
	                    tag = '<span class="customTag nodisplay customTag_stad' + entityId + '"></span>'
                        if(!this.children[0].innerHTML.includes("grmh.pl") && $(".fa-university").length == 0){
                            this.children[0].innerHTML += CreateGrepolisButton("Tag", "JWAX_TAGEDIT", '20px')
                        }
                        else {
                            $(this).parent().find('.bold').eq(0).append('<span class="grmhfix">'+ tag + '<span class="customTag" id="stad' + entityId + '"><img src="https://gme.cyllos.dev/res/edit.png"></img></span></span>');
                        }

                        $('#stad' + entityId).click( function(data) { console.log("edit tag " + data.currentTarget.id); CreateTagEditor(data.currentTarget.id.substr(4), 'stad') } );
	                }
	            }
	    	}
		catch(ex){ console.log(ex) }
            });



        var eilanden = $(".island_info h4");
        for (var eiland of eilanden){
            entityId = eiland.innerText.split(" ")[1];
            if(!eiland.innerHTML.includes("floatright") ){
                eiland.innerHTML += ' <span class="floatright">'+ tag + '<span class="customTag" id="eila' + entityId + '"><img src="https://gme.cyllos.dev/res/edit.png"></img></span></span>';
                $('#eila' + entityId).click( function(data) { console.log("edit tag eiland " + data.currentTarget.id); getTagEditor(data.currentTarget.id.substr(4), 'eila') } );
            }
        }

        var spelerslinks = $("#towninfo_towninfo .game_border .game_list li div .gp_player_link");
        for (var speler of spelerslinks){
            entityId = JSON.parse(atob(speler.hash.substr(1))).id;
            if(!speler.parentNode.innerHTML.includes("floatright") ){
                tag = "";
                speler.parentNode.innerHTML += ' <span class="floatright">'+ tag + '<span class="customTag" id="spel' + entityId + '"><img src="https://gme.cyllos.dev/res/edit.png"></img></span></span>';
                $('#spel' + entityId).click( function(data) { console.log("edit tag speler " + data.currentTarget.id); getTagEditor(data.currentTarget.id.substr(4), 'spel') } );
            }
        }
}

function CreateTagEditor(entityId, type){
    var windowExists = false;
    var windowItem = null;
    let wnd = null;
    for(var item of document.getElementsByClassName('ui-dialog-title')){ // kijk of er al een scherm is
        if(item.innerHTML == 'Tag ' + entityId){
            windowExists = true;
            windowItem = item;
        }
    }
    if(!windowExists) wnd = Layout.wnd.Create(Layout.wnd.TYPE_DIALOG, 'Tag ' + entityId);
    if(wnd == null) return;
    //wnd.setContent(''); // maak het leeg

    for(item of document.getElementsByClassName('ui-dialog-title')){ // zoek het scherm
        if(item.innerHTML == 'Tag ' + entityId){
            windowItem = item;
        }
    }

    wnd.setHeight('300'); // zet instellingen van het scherm
    wnd.setWidth('400');
    wnd.setTitle('Tag ' + entityId);
    var title = windowItem;
    var frame = title.parentElement.parentElement.children[1].children[4]; // selecteer het frame element
    frame.innerHTML = ''; // maak het leeg en maak een kleine html structuur

    var content = document.createElement('div');
    content.className = "JWAX_towntageditor";

    // var laatsteWijziging = document.createElement('p');
    // laatsteWijziging.style = "margin: 0;font-size: xx-small;text-align: center;";
    // if(taglijst[type + entityId]){
    //     maakTextbox(body, taglijst[type + entityId].tag, "tag_" + type + entityId);
    //     maakKleurKiezer(body, taglijst[type + entityId].kleur || "", "tagKleur_" + type + entityId, 145);
    //     body.appendChild(defaultKleurenKiezer("tagKleur_" + type + entityId));
    //     if(taglijst[type + entityId].date) laatsteWijziging.innerText = "GMT " + taglijst[type + entityId].date;
    // }
    // else {
    //     maakTextbox(body, "", "tag_" + type + entityId);
    //     maakKleurKiezer(body, "", "tagKleur_" + type + entityId, 145);
    //     body.appendChild(defaultKleurenKiezer("tagKleur_" + type + entityId));
    //     laatsteWijziging.innerText = vertaling.nieuwetag;
    // }
    $(content).append(CreateLabel("Tag Name:"));
    $(content).append(CreateTextBox("JWAX_textInput", '300px'));
    $(content).append(CreateLabel("Muurlevel:"));
    $(content).append(CreateTextBox("JWAX_wallInput", '300px'));
    //$(content).append(CreateColorPicker("tagColor_" + entityId));
    $(content).append(defaultColors("tagColor_" + entityId));
    $(content).append(CreateGrepolisButton("Zeus", "JWAX_tag_GOD_ZEUS", '100px', '.5vh'));
    $(content).append(CreateGrepolisButton("Poseidon", "JWAX_tag_GOD_POSEIDON", '100px', '.5vh'));
    $(content).append(CreateGrepolisButton("Hera", "JWAX_tag_GOD_HERA", '100px', '.5vh'));
    $(content).append(CreateGrepolisButton("Athene", "JWAX_tag_GOD_ATHENE", '100px', '.5vh'));
    $(content).append(CreateGrepolisButton("Hades", "JWAX_tag_GOD_HADES", '100px', '.5vh'));
    $(content).append(CreateGrepolisButton("Artemis", "JWAX_tag_GOD_ARTEMIS", '100px', '.5vh'));
    $(content).append(CreateGrepolisButton("Opslaan", "JWAX_tag_Save_" + entityId, '200px', '.2vh'));
    $(content).append(CreateGrepolisButton("Verwijderen", "JWAX_tag_Remove_" + entityId, '200px', '.2vh'));
    frame.appendChild(content);

    // updateCustomTag(entityId, type, wnd);
}
const CreateTextBox = (id, width) => {
    return `
    <div class="JWAX_textbox" style="width: ${width}; margin-block: .5vh;">
        <div class="left"></div>
            <div class="right"></div>
            <div class="middle">
                <div class="ie7fix">
                    <input tabindex="1" id="${id}" style="width: 100%; type="text">
            </div>
        </div>
    </div>
    `;
}
function CreateColorPicker(id){
    return `
    <div style="width: 200px">
        <div class="left"></div>
        <div class="right"></div>
        <div class="middle">
            <div class="ie7fix">
                <input tabindex="1" class="colorPicker" id="${id}" type="color">
            </div>
        </div>
    </div>`;
}
function CreateColor(color, chosenColorId){
    var colorEle = document.createElement('div');
    colorEle.style.width = "100%";
    colorEle.style.height = "12px";
    colorEle.style.backgroundColor = color;
    colorEle.onclick = function(){$("#" + chosenColorId)[0].value = color};
    return colorEle;
}
function defaultColors(chosenColorId){
    var colors = document.createElement('div');
    colors.style.display = "flex";

    colors.appendChild(CreateColor("#43b526", chosenColorId)); //green, bir
    colors.appendChild(CreateColor("#26aeb5", chosenColorId)); //light blue, lt deff
    colors.appendChild(CreateColor("#7e26b5", chosenColorId)); //purple, lt off
    colors.appendChild(CreateColor("#b56b26", chosenColorId)); //orange, kolo
    colors.appendChild(CreateColor("#b52626", chosenColorId)); //red, vuur
    colors.appendChild(CreateColor("#b5ae26", chosenColorId)); //yellow, trir
    colors.appendChild(CreateColor("#3624ab", chosenColorId)); //dark blue, myth
    return colors;
}
function CreateLabel(text) {
    return `<div>${text}</div>`;
}

//Private
async function HandleBuildings() {
    $("#GECsaveGroupButton").click(function() { SaveCityGroup(); });

    once = true;
    $.get({
        url: `https://www.bijnensart.be/GetTowns`,
    }).done(function (data) {
            let currentTown = null;

            for (let town of data) {
                if (town.townId == UWGame.townId) currentTown = town;
            }

            if (currentTown != null) {
                $("div[id^=cityBuilding]").remove();
                let parent = document.getElementById("buildings");
                for (var i = 0; i < parent.children.length; i++) {
                    let child = parent.children[i];
                    let id = $(child).attr('id');

                    let currentLevel = parseInt($(`#${id} .building .image .level`).html());

                    for (let building of GetBuildings(currentTown.cityGroup)) {
                        let color;

                        if (currentLevel > building.requiredLevel) color = "#2019d4";
                        if (currentLevel < building.requiredLevel) color = "#de1d1d";
                        if (currentLevel == building.requiredLevel) color = "#0e9e13";

                        if (building.id == id) {
                            $('#' + id + ' .building .name').append(`<div id="cityBuilding" style="color: ${color}">${building.requiredLevel}</div>`);
                        }
                    }
                }
            }

            if (document.getElementById('GECcityGroupSelect') == null) {
                let html = `<select id="GECcityGroupSelect">`;
                if (currentTown != null && currentTown.cityGroup == "Bir") html += `<option selected>Bir</option>`;
                else html += `<option>Bir</option>`;

                if (currentTown != null && currentTown.cityGroup == "Kolo") html += `<option selected>Kolo</option>`;
                else html += `<option>Kolo</option>`;

                if (currentTown != null && currentTown.cityGroup == "Vuur") html += `<option selected>Vuur</option>`;
                else html += `<option>Vuur</option>`;

                if (currentTown != null && currentTown.cityGroup == "Land Deff") html += `<option selected>Land Deff</option>`;
                else html += `<option>Land Deff</option>`;

                if (currentTown != null && currentTown.cityGroup == "Trir") html += `<option selected>Trir</option>`;
                else html += `<option>Trir</option>`;

                if (currentTown != null && currentTown.cityGroup == "Land Off") html += `<option selected>Land Off</option>`;
                else html += `<option>Land Off</option>`;

                if (currentTown != null && currentTown.cityGroup == "Myth") html += `<option selected>Myth</option>`;
                else html += `<option>Myth</option>`;

                html += `</select>`;

                if (document.getElementById('GECcityGroupSelect') == null) {
                    $('#main_tasks').append(html);
                    $('#main_tasks').append(CreateGrepolisButton('Opslaan', 'GECsaveGroupButton', 'auto'));
                }

            }
    });
}
function SaveCityGroup() {
    var e = document.getElementById("GECcityGroupSelect");
    var text = e.options[e.selectedIndex].text;

    $.get({
        url: `https://www.bijnensart.be/SaveTown?id=${UWGame.townId}&cityGroup=${text}`,
    }).done(function (data) {
        HandleBuildings();
    });
}
function GetBuildings(cityGroup) {
    let buildings = [];
    switch(cityGroup) {
            case "Bir": {
                buildings = [
                    new Building("building_main_main", "Senaat", 10),
                    new Building("building_main_lumber", "Houthakkerskamp", 40),
                    new Building("building_main_ironer", "ZilverMijn", 30),
                    new Building("building_main_stoner", "Steengroeve", 40),
                    new Building("building_main_farm", "Boerderij", 45),
                    new Building("building_main_storage", "Pakhuis", 35),
                    new Building("building_main_barracks", "Kazerne", 1),
                    new Building("building_main_temple", "Tempel", 1),
                    new Building("building_main_market", "Marktplaats", 30),
                    new Building("building_main_docks", "Haven", 20),
                    new Building("building_main_academy", "Academie", 30),
                    new Building("building_main_wall", "Stadsmuur", 0),
                    new Building("building_main_hide", "Grot", 10)
                ]
            } break;
            case "Kolo": {
                buildings = [
                    new Building("building_main_main", "Senaat", 10),
                    new Building("building_main_lumber", "Houthakkerskamp", 40),
                    new Building("building_main_ironer", "ZilverMijn", 40),
                    new Building("building_main_stoner", "Steengroeve", 40),
                    new Building("building_main_farm", "Boerderij", 45),
                    new Building("building_main_storage", "Pakhuis", 35),
                    new Building("building_main_barracks", "Kazerne", 30),
                    new Building("building_main_temple", "Tempel", 20),
                    new Building("building_main_market", "Marktplaats", 30),
                    new Building("building_main_docks", "Haven", 30),
                    new Building("building_main_academy", "Academie", 36),
                    new Building("building_main_wall", "Stadsmuur", 25),
                    new Building("building_main_hide", "Grot", 10)
                ]
            } break;
            case "Vuur": {
                buildings = [
                    new Building("building_main_main", "Senaat", 10),
                    new Building("building_main_lumber", "Houthakkerskamp", 40),
                    new Building("building_main_ironer", "ZilverMijn", 40),
                    new Building("building_main_stoner", "Steengroeve", 30),
                    new Building("building_main_farm", "Boerderij", 45),
                    new Building("building_main_storage", "Pakhuis", 35),
                    new Building("building_main_barracks", "Kazerne", 1),
                    new Building("building_main_temple", "Tempel", 1),
                    new Building("building_main_market", "Marktplaats", 1),
                    new Building("building_main_docks", "Haven", 20),
                    new Building("building_main_academy", "Academie", 30),
                    new Building("building_main_wall", "Stadsmuur", 0),
                    new Building("building_main_hide", "Grot", 10)
                ]
            } break;
            case "Land Deff": {
                buildings = [
                    new Building("building_main_main", "Senaat", 10),
                    new Building("building_main_lumber", "Houthakkerskamp", 40),
                    new Building("building_main_ironer", "ZilverMijn", 40),
                    new Building("building_main_stoner", "Steengroeve", 40),
                    new Building("building_main_farm", "Boerderij", 45),
                    new Building("building_main_storage", "Pakhuis", 35),
                    new Building("building_main_barracks", "Kazerne", 19),
                    new Building("building_main_temple", "Tempel", 20),
                    new Building("building_main_market", "Marktplaats", 30),
                    new Building("building_main_docks", "Haven", 20),
                    new Building("building_main_academy", "Academie", 36),
                    new Building("building_main_wall", "Stadsmuur", 25),
                    new Building("building_main_hide", "Grot", 10)
                ]
            } break;
            case "Trir": {
                buildings = [
                    new Building("building_main_main", "Senaat", 10),
                    new Building("building_main_lumber", "Houthakkerskamp", 40),
                    new Building("building_main_ironer", "ZilverMijn", 40),
                    new Building("building_main_stoner", "Steengroeve", 40),
                    new Building("building_main_farm", "Boerderij", 45),
                    new Building("building_main_storage", "Pakhuis", 35),
                    new Building("building_main_barracks", "Kazerne", 1),
                    new Building("building_main_temple", "Tempel", 20),
                    new Building("building_main_market", "Marktplaats", 1),
                    new Building("building_main_docks", "Haven", 20),
                    new Building("building_main_academy", "Academie", 36),
                    new Building("building_main_wall", "Stadsmuur", 0),
                    new Building("building_main_hide", "Grot", 10)
                ]
            } break;
            case "Land Off": {
                buildings = [
                    new Building("building_main_main", "Senaat", 10),
                    new Building("building_main_lumber", "Houthakkerskamp", 40),
                    new Building("building_main_ironer", "ZilverMijn", 40),
                    new Building("building_main_stoner", "Steengroeve", 40),
                    new Building("building_main_farm", "Boerderij", 45),
                    new Building("building_main_storage", "Pakhuis", 35),
                    new Building("building_main_barracks", "Kazerne", 20),
                    new Building("building_main_temple", "Tempel", 10),
                    new Building("building_main_market", "Marktplaats", 1),
                    new Building("building_main_docks", "Haven", 10),
                    new Building("building_main_academy", "Academie", 30),
                    new Building("building_main_wall", "Stadsmuur", 25),
                    new Building("building_main_hide", "Grot", 10)
                ]
            } break;
            case "Myth": {
                buildings = [
                    new Building("building_main_main", "Senaat", 10),
                    new Building("building_main_lumber", "Houthakkerskamp", 30),
                    new Building("building_main_ironer", "ZilverMijn", 30),
                    new Building("building_main_stoner", "Steengroeve", 30),
                    new Building("building_main_farm", "Boerderij", 45),
                    new Building("building_main_storage", "Pakhuis", 35),
                    new Building("building_main_barracks", "Kazerne", 13),
                    new Building("building_main_temple", "Tempel", 22),
                    new Building("building_main_market", "Marktplaats", 1),
                    new Building("building_main_docks", "Haven", 1),
                    new Building("building_main_academy", "Academie", 35),
                    new Building("building_main_wall", "Stadsmuur", 0),
                    new Building("building_main_hide", "Grot", 10)
                ]
            } break;
    }
    return buildings;
}
//Private

//Window hondler

function CheckForWindows() {
  var interval = setInterval(function() {
    if(document.readyState === 'complete' && $(".hides_overview_wrapper")) {
        //if($(".gpwindow_content")) CreateEditButton();
        const report = document.getElementsByClassName('report_unit');
        const wall = document.getElementById('building_wall');
        const attackWindow = document.getElementsByClassName('attack_support_window');
        const buildingWindow = document.getElementById('buildings');
        const eventWindow = document.getElementsByClassName('details');
        


        if (report.length > 0) HandleUnits('report');
        if (wall) HandleUnits('wall');
        if (attackWindow) AddButtons();

        if (buildingWindow && private) HandleBuildings();

        if (eventWindow) HandleEvent();
    }
  }, 1000);
}

(function() {
    'use strict';

    CheckForWindows();
    CreateButton();
})();

const sleep = ms => new Promise(r => setTimeout(r, ms));