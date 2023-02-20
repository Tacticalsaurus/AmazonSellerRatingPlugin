async function createRatingPopupHTML(sellerPageXML, starHtmlFull, numericalRating, countRatings)
{
    let innerHTML = "";

    let templatePopupURL =  chrome.runtime.getURL("html/templateMerchantRatingDetailsPopup.html");
    
    let response = await fetch(templatePopupURL);
    let html = await response.text();
        
    innerHTML = html.replace("_placeHolderStars_", starHtmlFull)
    .replace("_placeHolderRatingCount_", countRatings)
    .replace("_placeHolderNumericalRating_", numericalRating);     
    
    let percentage5Star = parseInt(sellerPageXML.getElementById("percentFiveStar").innerHTML.replace("%", ""));
    let percentage4Star = parseInt(sellerPageXML.getElementById("percentFourStar").innerHTML.replace("%", ""));
    let percentage3Star = parseInt(sellerPageXML.getElementById("percentThreeStar").innerHTML.replace("%", ""));
    let percentage2Star = parseInt(sellerPageXML.getElementById("percentTwoStar").innerHTML.replace("%", ""));
    let percentage1Star = parseInt(sellerPageXML.getElementById("percentOneStar").innerHTML.replace("%", ""));

    innerHTML = innerHTML.replace("_placeHolderBarWidth5_", `${percentage5Star}%`)
        .replace("_placeHolderBarWidth4_", `"${percentage4Star}%`)
        .replace("_placeHolderBarWidth3_", `"${percentage3Star}%`)
        .replace("_placeHolderBarWidth2_", `"${percentage2Star}%`)
        .replace("_placeHolderBarWidth1_", `"${percentage1Star}%`);
        
    innerHTML = innerHTML.replace("_placeHolder5StarPercentage_", `${percentage5Star}%`)
        .replace("_placeHolder4StarPercentage_", `${percentage4Star}%`)
        .replace("_placeHolder3StarPercentage_", `${percentage3Star}%`)
        .replace("_placeHolder2StarPercentage_", `${percentage2Star}%`)
        .replace("_placeHolder1StarPercentage_", `${percentage1Star}%`);
        

    return  innerHTML;
}

function testFunction(){
    console.log("test func called");
}