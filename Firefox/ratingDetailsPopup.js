async function createRatingPopupHTML(cachedData, starHtmlFull, sellerName, sellerLink, countRatings, starRating)
{
    let percentage1Star = 0;
    let percentage2Star = 0;
    let percentage3Star = 0;
    let percentage4Star = 0;
    let percentage5Star = 0;

    let countRatingsFormatted = countRatings.toLocaleString();
    

    percentage1Star = cachedData.percentage1Star;
    percentage2Star = cachedData.percentage2Star;
    percentage3Star = cachedData.percentage3Star;
    percentage4Star = cachedData.percentage4Star;
    percentage5Star = cachedData.percentage5Star;

    let templatePopupURL =  browser.runtime.getURL("html/templateMerchantRatingDetailsPopup.html");
    
    let response = await fetch(templatePopupURL);
    let html = await response.text();
    
    let innerHTML = html.replace("_placeHolderStars_", starHtmlFull)
    .replace("_placeHolderRatingCount_", countRatingsFormatted)
    .replace("_placeHolderStarRating_", starRating)
    .replace("_placeHolderSellerName_", sellerName)
    .replace("_placeHolderSellerLink_", sellerLink);

    innerHTML = innerHTML.replace("_placeHolderBarWidth5_", `${percentage5Star}%`)
        .replace("_placeHolderBarWidth4_", `${percentage4Star}%`)
        .replace("_placeHolderBarWidth3_", `${percentage3Star}%`)
        .replace("_placeHolderBarWidth2_", `${percentage2Star}%`)
        .replace("_placeHolderBarWidth1_", `${percentage1Star}%`);
        
    innerHTML = innerHTML.replace("_placeHolder5StarPercentage_", `${percentage5Star}%`)
        .replace("_placeHolder4StarPercentage_", `${percentage4Star}%`)
        .replace("_placeHolder3StarPercentage_", `${percentage3Star}%`)
        .replace("_placeHolder2StarPercentage_", `${percentage2Star}%`)
        .replace("_placeHolder1StarPercentage_", `${percentage1Star}%`);
        
    
    return  innerHTML;
}
