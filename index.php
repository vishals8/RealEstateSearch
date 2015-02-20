
<?php 
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');

function call_Zillow(){


        $ServiceURL="http://www.zillow.com/webservice/GetDeepSearchResults.htm?zws-id=X1-ZWz1b2g3jya80b_ac8os&address=".urlencode($_GET["address"])."&citystatezip=".urlencode($_GET["city"]." ".$_GET["state"])."&rentzestimate=true";
      
    return simplexml_load_file($ServiceURL);


}
function render_Listings($xml){

if($xml->message->code==508){   
        echo  "{\"errorcode\":\"508\",\"errormsg\":\"No exact match found--Verify that the given address is correct.\"}";       
    return;
}
if($xml->message->code!=0){
    echo  "{\"errorcode\":\"".$xml->message->code."\",\"errormsg\":\"".$xml->message->text."\"}";       
    return;
 }
    
   $res=$xml->response->results->result;
$estimateS="";
    $restimateS="";
    if(isset($res->zestimate->valueChange))
    {
       $estimateS= $res->zestimate->valueChange>0?"+":"-";
    }  
    if(isset($res->rentzestimate->valueChange)){
      $restimateS=  $res->rentzestimate->valueChange>0?"+":"-";
    }
    
    $data=array("result"=>
        array(
            "homedetails"=>(string)$res->links->homedetails,
        "useCode"=>(string)$res->useCode,
            "street"=> (string)$res->address->street,
            "city"=>(string)$res->address->city,
            "state"=>(string)$res->address->state,
            "zipcode"=>(string)$res->address->zipcode,
            "useCode"=>(string)$res->useCode,
            "yearBuilt"=>(string)$res->yearBuilt,
            "lotSizeSqFt"=>(string)$res->lotSizeSqFt,
            "finishedSqFt"=>(string)$res->finishedSqFt,
            "bathrooms"=>(string)$res->bathrooms,
            "bedrooms"=>(string)$res->bedrooms,
            "taxAssessmentYear"=>(string)$res->taxAssessmentYear,
            "taxAssessment"=>(string)$res->taxAssessment,
            "lastSoldPrice"=>(string)$res->lastSoldPrice,
            "lastSoldDate"=>isset($res->lastSoldDate)? (string) date_format(date_create($res->lastSoldDate ,timezone_open("America/Los_Angeles")),"d-M-Y"):"",
            "estimateLastUpdate"=>$res->zestimate->{'last-updated'}?(string) date_format(date_create($res->zestimate->{'last-updated'},timezone_open("America/Los_Angeles")),"d-M-Y") :"",
        "estimateAmount"=>isset($res->zestimate->amount)?(string)$res->zestimate->amount:"",
        "estimateValueChange"=>isset($res->zestimate->valueChange)?(string)$res->zestimate->valueChange:"",
            "estimateValueChangeSign"=>$estimateS,
        "estimateValuationRangeLow"=>isset($res->zestimate->valuationRange->low)?(string)$res->zestimate->valuationRange->low:"",
        "estimateValuationRangeHigh"=>isset($res->zestimate->valuationRange->high)?(string)$res->zestimate->valuationRange->high:"",
        "restimateLastUpdate"=>isset($res->rentzestimate->{'last-updated'})?(string) date_format(date_create( $res->rentzestimate->{'last-updated'},timezone_open("America/Los_Angeles")),"d-M-Y"):"",
        "restimateAmount"=>isset($res->rentzestimate->amount)?(string)$res->rentzestimate->amount:"",
        "restimateValueChange"=>isset($res->rentzestimate->valueChange)?(string)$res->rentzestimate->valueChange:"",
            "restimateValueChangeSign"=>$restimateS,
        "restimateValuationRangeLow"=>isset($res->rentzestimate->valuationRange->low)?(string)$res->rentzestimate->valuationRange->low:"",
        "restimateValuationRangeHigh"=>isset($res->rentzestimate->valuationRange->high)?(string)$res->rentzestimate->valuationRange->high:"",
            "imgu"=>"http://www-scf.usc.edu/~csci571/2014Spring/hw6/up_g.gif",
            "imgn"=>"http://www-scf.usc.edu/~csci571/2014Spring/hw6/down_r.gif",
            "chart"=>array(
            "1year"=>array(
            "url"=>"http://www.zillow.com/app?chartType=partner&height=300&page=webservice%2FGetChart&service=chart&showPercent=true&width=600&zpid=".$res->zpid."&chartDuration=1year"),
                 "5year"=>array(
            "url"=>"http://www.zillow.com/app?chartType=partner&height=300&page=webservice%2FGetChart&service=chart&showPercent=true&width=600&chartDuration=5years&zpid=".$res->zpid),
                             "10year"=>array(
            "url"=>"http://www.zillow.com/app?chartType=partner&height=300&page=webservice%2FGetChart&service=chart&showPercent=true&width=600&zpid=".$res->zpid."&chartDuration=10years")
            )
        )
        
    );
        
    
        
    echo json_encode($data);
    
  
    
}

    
$xml= call_Zillow();
render_Listings($xml);


?> 