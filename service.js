function requestAll(oData, callback, req) {
    console.log(JSON.stringify(oData));
    $.support.cors = true;
    $.ajax({
        url: 'http://localhost/WebAsgn/index.php',
        // this is the parameter list
        data: oData,
        type: 'GET',
        success: function (output) {
            // parse the data here
            try {
                output = $.parseJSON(output.trim());
            } catch (err) {
                output = {
                    "error": "JSON parse error",
                    "errorcode": "10001"
                }
            }
            console.log(output);
            callback(output, req);
        },
        error: function (msg) {
            console.log(msg);
        }
    });

}

function parseValue(val, parseType,up,down) {
    returnValue = "";
    if (val == "" || typeof val == "undefined" || $.isEmptyObject(val)) {
        if (parseType == "Indicator") {
            return "";
        }
        return "N/A";
    }
    if (parseType == "Money" && val == 0) {
        return "N/A";
    }

    // write switch to parse data;
    switch (parseType) {
    case "Indicator":
        if (val == 0) {
            returnValue = "";
            break;
        }
        returnValue = "<img src='" + (val > 0 ? up : down) + "'></img>";
        break;
    case "Date":
            if(val == "01-Jan-1970" || val=="31-Dec-1969")
            {returnValue = "N/A"; }
            else{
                returnValue =val;
            }

        break;
    case "Area":
        returnValue = parseInt(val).toLocaleString('en-US', {
            maximumFractionDigits: 0
        })+ " sq. ft.";

        break;
    case "Money":
        returnValue = (Math.abs(val)).toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
        });;

        break;
    default:
        returnValue = val;
    }
    return returnValue;
}



function shareFB(oList) {
      
 FB.ui({
   display: 'popup',
   method: 'feed',
   href: oList[0],
     picture: oList[1],
     description:oList[2],
     name:oList[3],
     caption:"Property information from Zillow.com"
 }, function(response){
 
 if (response && !response.error_code) {
    alert('Posted Successfully');
   } else {
     alert('Sharing cancelled.');
       console.log(response.error_code)
   }
 });
    
    
}
    
    
    

function renderInfo(oData, request) {

    var dataArray, ds, headerLink, header, displayString = "",
        switchPane = false,
        row = 0,
        fbArray=[];;

    if (oData && oData.errorcode) {
        $("#Error").removeClass("hidden");
        $("#Error div").text(oData.errormsg || "Error Occured. Try again.");
        return;
    }
    $("#DisplaySection").removeClass("hidden");
    ds = oData.result;
    header = ds.street + ", " + ds.city + ", " + ds.state + "-" + ds.zipcode;
    headerLink = ds.homedetails;

    dataArray = [
       ["Property Type:", parseValue(ds.useCode || "")],
        ["Year Built:", parseValue(ds.yearBuilt || "")],
        ["Lot Size:", parseValue(ds.lotSizeSqFt || "", "Area")],
        ["Finished Area:", parseValue(ds.finishedSqFt || "", "Area")],
        ["Bathrooms:", parseValue(ds.bathrooms || "")],
         ["Bedrooms:", parseValue(ds.bedrooms || "")],
            ["Tax Assesment Year:", parseValue(ds.taxAssessmentYear)],
    ["Tax Assesment:", parseValue(ds.taxAssessment, "Money")],
    ["Last Sold Price:", parseValue(ds.lastSoldPrice, "Money")],
    ["Last Sold Date:", parseValue(ds.lastSoldDate, "Date")],
    ["Zestimate <sup>&reg;</sup> Property Estimate as of " + parseValue(ds.estimateLastUpdate, "Date") + ":", parseValue(ds.estimateAmount, "Money")],


        ["30 Days Overall Change " + ":", parseValue(ds.estimateValueChange, 'Indicator',ds.imgu,ds.imgn) + parseValue(ds.estimateValueChange, "Money")],
   ["All Time Property Range:", parseValue(ds.estimateValuationRangeLow, "Money") + " - " + parseValue(ds.estimateValuationRangeHigh, "Money")],
   ["Rent Zestimate <sup>&reg;</sup> Valuation as of " + parseValue(ds.restimateLastUpdate, "Date") + ":", parseValue(ds.restimateAmount, "Money")],
   ["30 Days Rent Change " + ":", parseValue(ds.restimateValueChange, 'Indicator',ds.imgu,ds.imgn) + parseValue(ds.restimateValueChange, "Money")],
   ["All Time Rent Change:", parseValue(ds.restimateValuationRangeLow, "Money") + " - " + parseValue(ds.restimateValuationRangeHigh, "Money")]
    ];
fbArray=[ds.homedetails,ds.chart["1year"].url,"Last Sold Price: "+parseValue(ds.lastSoldPrice, "Money")+", 30 Days Overall Change: "+ds.estimateValueChangeSign+parseValue(ds.estimateValueChange, "Money"),header];
     // Print tablular dataArray
    displayString = "<table class='table ResultTable table-striped'><thead><th colspan=3>See more details for <a class='Hyperink' href='" + headerLink + "'>" + header + "</a> on Zillow</th><th colspan=1 class='text-right'><button class='btn btn-primary btn-sm' onclick='shareFB("+JSON.stringify(fbArray)+")'> Share on <strong>Facebook</strong></button></th></thead><tbody>";

    for (row = 0; row < dataArray.length / 2; row++) {

                displayString += "<tr><td>" + dataArray[row][0] + "</td><td>" + dataArray[row][1] + "</td>" +
                    "<td>" + dataArray[row + dataArray.length / 2][0] + "</td><td>" + dataArray[row + dataArray.length / 2][1] + "</td></tr>";
    }

    displayString += "</tbody></table>";

    $("#img1").attr("src",ds.chart["1year"].url);
    $("#img2").attr("src",ds.chart["5year"].url);
    $("#img3").attr("src",ds.chart["10year"].url);
    $(".CaptionAdress").text(header);
    
    $("#ResultSection").html(displayString);
    // Print tabular dataArray end

}


function validate() {
            var bProceed = true;
            $("#address,#city,#state").each(function () {

                if ($(this).val() == "") {

                    bProceed = false;
                }
            });

            $("#Error").addClass("hidden");
            if (!bProceed) {
                return;
            }
            $(".ResultTable").remove();
            $("#DisplaySection").addClass("hidden");
            requestAll({
                    "address": $("#address").val(),
                    "city": $("#city").val(),
                    "state": $("#state").val()
                },
                renderInfo, ""
            );

}


$(document).ready(function () {


            var oSelect = $("#state"),
                arrStates = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"],
                i, oOption;

            oOption = $("<option>");

            oOption.attr("value", "");
            oOption.attr("text", "");
            oOption.hide();
            oSelect.append(oOption);

            for (i = 0; i < arrStates.length; i++) {
                oOption = $("<option>");
                oOption.attr("value", arrStates[i]);
                oOption.text(arrStates[i]);
                oSelect.append(oOption);
            }
            $("#UserInput").bootstrapValidator();


        });