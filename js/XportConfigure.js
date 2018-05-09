let extensionSettings;

$(document).ready(function() {
    tableau.extensions.initializeDialogAsync().then(function(openPayload) {
        // Get all Extension Settings
        let settings = tableau.extensions.settings.get('xpanditWritebackSettings');
        extensionSettings = settings ? JSON.parse(settings) : {};

        console.log("Settings: "+extensionSettings);
        
        if(extensionSettings.configured===undefined){clearSettings();}

        //let xportExtractAllData = tableau.extensions.settings.get('xportExtractAllData') == "true";
        let xportExtractAllData = extensionSettings.xportExtractAllData;

        if(xportExtractAllData){
            $('#extract_all_data').prop("checked", xportExtractAllData);
        }
        
        $('[data-toggle="tooltip"]').tooltip();
        populateSheetList();
        setDefaultGoogleSheet();
        setWorkSheet();
        console.log("Writeback Settings");
        console.log(extensionSettings);
    });
    $("#newEndpointURL").on('input',function(e){
      setEndpointURL();
      validateConfiguration();
    });

    $("#wgooglesheetselect").focusout('input',function(e){
      setGoogleSheet();
    });

    updateOnResize();
    window.onresize = function(event) {
        updateOnResize();
    };
});

function updateOnResize(){
    var top = $('#config-top').height();
    var bottom = $('#config-bottom').height();
    var height = $(document).height() - top - bottom - 5;
    document.getElementById('config-container').style.height = height+"px";
    document.getElementById('config-container').style.marginTop = top+"px";
}

// Gets list of worksheets in workbook and populates dropdown
function populateSheetList() {
    console.log('Populating workSheet list.');
    document.getElementById('divWorksheetSelector').style.display = "flex";

    let options = "";
    let t = 0;
    for (ws of tableau.extensions.dashboardContent.dashboard.worksheets) {
        console.log("Sheet Name: "+ws.name);
        let sheet = extensionSettings.sheet //tableau.extensions.settings.get('sheet');
        if(sheet === ws.name){
            options += "<option value='" + ws.name + "' selected='selected'>" + ws.name + "</option>";
        }else{
            options += "<option value='" + ws.name + "'>" + ws.name + "</option>";
        }
        t++
    }
    if (t == 0) {
        document.getElementById('wsheetselect').innerHTML = "<option value='' disabled>No fields found</option>";
    } else {
        document.getElementById('wsheetselect').innerHTML = options;
        document.getElementById('wsheetselect').disabled = false;
    }
}

function setWorkSheet(){
    let sheet = document.getElementById('wsheetselect').value;
    console.log('Setting sheet to ' + sheet + '.');

    //tableau.extensions.settings.set('sheet', sheet);
    extensionSettings.sheet = sheet;

    validateConfiguration();
}

function setExtractType(){
    let xportExtractAllData = $('#extract_all_data').is(":checked");
    console.log("Extract check: " + xportExtractAllData);
    //tableau.extensions.settings.set('xportExtractAllData', xportExtractAllData);
    extensionSettings.xportExtractAllData = xportExtractAllData;
}

function setNewColumn() {
    let column = document.getElementById('newColumnInsert').value;

    if(column.length > 0){
      // UI Changes
      let form = $("#0.add-form").clone();
      $("#0.add-form").children("#newColumnInsert").text('');
      let max = 0;
      $('.add-form').each(function() {
        max = Math.max(this.id, max);
      });
      let newid = max+1;
      form.attr("id",newid);
      form.children(":input[value='Add']").hide();
      form.children(":input[value='Remove']").show();
      form.children("#newColumnInsert").prop("disabled",true);
      form.appendTo(".add-form-horizontal");

      console.log('Adding new Column ' + column);
      console.log('Adding to Settings... ');
      var xportColumns = extensionSettings.xportColumns; //tableau.extensions.settings.get('xportColumns');
      console.log('Columns in Settings: '+ xportColumns);
      if(xportColumns === undefined){
          xportColumns = [];
          extensionSettings.xportColumns=xportColumns;
      }
    //   }else{
    //       xportColumns = JSON.parse(xportColumns);
    //   }
      xportColumns.push(column);
      extensionSettings.xportColumns=xportColumns;
    //   tableau.extensions.settings.set('xportColumns',JSON.stringify(xportColumns));
    //   tableau.extensions.settings.saveAsync().then(result => {
    //       console.log('Added to Settings... ');
    //       $('#newColumns').append(`<li>${column}</li>`)
    //       document.getElementById('newColumnInsert').value = "";
    //   });
    }
}

function removeColumn(){

    var xportColumns =  extensionSettings.xportColumns;//tableau.extensions.settings.get('xportColumns');
    if(xportColumns != undefined){
        //xportColumns = JSON.parse(xportColumns);
        let column = this.event.currentTarget.parentNode.getElementsByTagName('input')[0].value;
        this.event.currentTarget.parentNode.remove();
        console.log('Removing Column ' + column);
        console.log('Columns in Settings: '+ xportColumns);
        var index = xportColumns.indexOf(column);
        if (index > -1) {
            xportColumns.splice(index, 1);
        }
        extensionSettings.xportColumns=xportColumns;
        // tableau.extensions.settings.set('xportColumns',JSON.stringify(xportColumns));
        // tableau.extensions.settings.saveAsync().then(result => {
        //   console.log('Removed Column');
        // });
    }
}

function setEndpointURL(){
    let endpointURL = document.getElementById('newEndpointURL').value;
    console.log('Setting Endpoint URL to ' + endpointURL + '.');

    extensionSettings.endpointURL = endpointURL;
    //tableau.extensions.settings.set('endpointURL', endpointURL);
    validateConfiguration();
}

function setGoogleSheet(){
    let gglsheet = document.getElementById('wgooglesheetselect').value;
    console.log('Setting Google Sheet to ' + gglsheet + '.');

    extensionSettings.xportGoogleSheet = gglsheet;
    //tableau.extensions.settings.set('xportGoogleSheet', gglsheet);

    document.getElementById('wgooglesheetselect').innerHTML = gglsheet;
    validateConfiguration();
}

function setDefaultGoogleSheet(){
    let gglsheet = extensionSettings.xportGoogleSheet; //tableau.extensions.settings.get('xportGoogleSheet');
    if(gglsheet == undefined){
        extensionSettings.xportGoogleSheet = 'Tableau';
        // gglsheet = 'Tableau';
        // tableau.extensions.settings.set('xportGoogleSheet', gglsheet);
    }

    document.getElementById('wgooglesheetselect').placeholder = gglsheet;
}

function validateConfiguration(){
    var rtn = true;
    let sheet = extensionSettings.sheet;//tableau.extensions.settings.get('sheet');
    if(sheet === undefined){rtn=false;}
    if(rtn){
        document.getElementById('wsheetselect').placeholder = sheet;
    }
    let endpointURL =  extensionSettings.endpointURL;//tableau.extensions.settings.get('endpointURL');
    if(endpointURL === undefined || endpointURL === ""){rtn=false;}
    if(rtn){
        document.getElementById('newEndpointURL').placeholder = endpointURL;
        document.getElementById('submit').disabled = false;
    }
    else{
        document.getElementById('newEndpointURL').placeholder = "";
        document.getElementById('submit').disabled = true;
    }
    redoColumnList();

    return rtn;
}

function redoColumnList(){
    let xportColumns = extensionSettings.xportColumns;//tableau.extensions.settings.get('xportColumns');
    if(xportColumns != undefined){
        //xportColumns = JSON.parse(xportColumns);
        let max = 0;
        if(xportColumns.length > 0){
            $('#newColumns').empty();
            for(c in xportColumns){
                $('#newColumns').append(`<li>${xportColumns[c]}</li>`);
                let form = $("#0.add-form").clone();
                $("#0.add-form").children("#newColumnInsert").text('');
                $('.add-form').each(function() {
                  max = Math.max(this.id, max);
                });
                let newid = max+1;
                form.attr("id",newid);
                form.children("#newColumnInsert").val(xportColumns[c]);
                form.children(":input[value='Add']").hide();
                form.children(":input[value='Remove']").show();
                form.children("#newColumnInsert").prop("disabled",true);
                form.appendTo(".add-form-horizontal");
            }
        }
    }
    else{
      $('#newColumns').empty();
      $('.add-form').each(function() {
        if(this.id>0){this.remove();}
        else{this.children[0].value="";}
      });
    }
}

function submit() {
    setWorkSheet();
    setExtractType();
    extensionSettings.configured = true;
    logSettings();
    tableau.extensions.settings.set('xpanditWritebackSettings',JSON.stringify(extensionSettings));
    //tableau.extensions.settings.set('configured', 'true');
    tableau.extensions.settings.saveAsync().then(result => {
        tableau.extensions.ui.closeDialog("value");
    });
}

function clearSettings() {
    console.log("Clearing settings.");
    extensionSettings.configured = false;
    extensionSettings.xportColumns = undefined;
    extensionSettings.endpointURL = undefined
    extensionSettings.xportGoogleSheet = 'Tableau';
    //extensionSettings.xportGoogleSheet = undefined;
    // tableau.extensions.settings.erase('configured');
    // tableau.extensions.settings.erase('xportColumns');
    // tableau.extensions.settings.erase('endpointURL');
    // tableau.extensions.settings.erase('xportGoogleSheet');
    tableau.extensions.settings.set('xpanditWritebackSettings',JSON.stringify(extensionSettings));
    tableau.extensions.settings.saveAsync();
    document.getElementById('submit').disabled = true;
    document.getElementById("wgooglesheetselect").placeholder="Tableau";
    console.log(tableau.extensions.settings.getAll());
    redoColumnList();
    validateConfiguration();
}

function logSettings(){
    console.log("Settings Stored");
    console.log(tableau.extensions.settings.getAll());
    console.log("Settings to Store");
    console.log(extensionSettings);
};
