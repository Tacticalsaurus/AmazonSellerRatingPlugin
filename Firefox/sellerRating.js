document.body.style.border = "5px solid red" 

/*let tempData = {
    sellerID: "A1V6B6X13IP7" + Math.floor(10 + Math.random() * 90),
    sellerName: "Amazon.com Services LLC",
    sellerLink: "https://www.amazon.in",
    starRating: 4.5,
    countRatings: 1000,    
    percentage1Star: 31,
    percentage2Star: 30,
    percentage3Star: 30,
    percentage4Star: 30,
    percentage5star: 30,
    lastUpdated: new Date()
}
*/
console.log("sellerRating plugin running");
let sellerInfos = document.querySelectorAll("[id='freshShipsFromSoldBy_feature_div']"); //pages on fresh items have this id. But only one of the divs with this id points to the merchant page
let sellerInfo = null;

for(info of sellerInfos){
    anchors = info.getElementsByTagName("a");
    if(anchors === null || anchors.length === 0) { //this div does not point to the merchant page
        continue; //try the next div
    }
    sellerInfo = info;
    break;
}

/*if(sellerInfo === null ) {
    sellerInfo = document.getElementById("fresh-merchant-info")    
}*/
 
if(sellerInfo === null) {
    sellerInfo = document.getElementById("merchant-info");

    if(sellerInfo === null) {
        sellerInfo = document.getElementById("sellerProfileTriggerId");
    }
}


if(sellerInfo != null) {

    let anchors = sellerInfo.getElementsByTagName("a");
    let links = sellerInfo.getElementsByClassName("a-link-normal")    

    let merchantLinkRelative = null

    if(anchors === null || anchors.length <= 0) {
        if(sellerInfo.tagName.toLowerCase() == "a") {
            anchors = [sellerInfo];
        }
    }
    if(anchors!==null && anchors.length > 0) {
        for(element of anchors) {
            let href = element.attributes["href"]
            if(href!=null) {
                value = href.value
                if(value.includes("marketplaceID=") || value.includes("dp_merchant_link")) {
                    merchantLinkRelative = value
                    break;
                }
            }    
        }
    }

    /*if(links !== null && links.length > 0) {
        for(element of links) {
            let href = element.attributes["href"]
            if(href!=null) {
                value = href.value
                if(value.includes("marketplaceID=")) {
                    merchantLinkRelative = value
                    break;
                }
            }    
        }
    }
    else {
        let element = document.getElementById("sellerProfileTriggerId");
        let href = element.attributes['href']

        if(href!=null) {
            value = href.value
            if(value.includes("marketplaceID=")) {
                merchantLinkRelative = value
            }
        }

    }*/

    if(merchantLinkRelative!=null) {
        let locationSplit = location.href.split("//")
        let hostName0 = locationSplit[0]
        let hostName1 = locationSplit[1].split("/")[0]

        console.log("mer link>>" + merchantLinkRelative);
        let sellerID = merchantLinkRelative.split("seller=")[1];
        sellerID = sellerID.split("&")[0];

        
        getIDCount(sellerID, (count) => {
            if(count > 0) {
                getData(sellerID, (data)=>{
                    let today = new Date();
                    let milliSecondsSinceDataStored = today.getTime() - data.lastUpdated.getTime();
                    let daysSinceDataStored = milliSecondsSinceDataStored / (24 * 60 * 60 * 1000);

                    let bUseCachedData = false;
                    if(data.countRatings <= 10) {
                        loadSellerPage(true)
                    }
                    else if(data.countRatings <= 50) {
                        if(daysSinceDataStored > 5) {
                            loadSellerPage(true);
                        }
                        else{
                            bUseCachedData = true;
                        }
                    }
                    else if(data.countRatings <= 100) {
                        if(daysSinceDataStored > 15) {
                            loadSellerPage(true);
                        }
                        else{
                            bUseCachedData = true;
                        }
                    }
                    else if(data.countRatings <= 500) {
                        if(daysSinceDataStored > 30) {
                            loadSellerPage(true);
                        }
                        else{
                            bUseCachedData = true;
                        }
                    }
                    else {
                        if(daysSinceDataStored > 60) {
                            loadSellerPage(true);
                        }
                        else{
                            bUseCachedData = true;
                        }
                    }
                    //data.lastUpdated
                    if(bUseCachedData) {
                        injectSellerRating(data);
                    }
                });
            }
            else { //no cached data found
                loadSellerPage(false);
            }

            function loadSellerPage(bUpdateData) { //set bUpdateData to true to update the currently stored data because the data is too old

                let hostName = hostName0 + "//"+ hostName1;
                const merchantLinkFull = hostName + merchantLinkRelative

                console.log("full link>>" + merchantLinkFull)

                let xhr = new XMLHttpRequest();

                xhr.onload = function () {
                    console.log(this.responseXML)
                    
                    let countRatings = 0;
                    let starRatingHTML = null;
                        
                    let ratings = this.responseXML.querySelector(`[data-a-state='{"key":"twelveMonthRatingsData"}']`)
                    let ratingsObject = JSON.parse(ratings.innerHTML);

                    countRatings = ratingsObject.ratingCount;//parseInt(ratingPercentageText.split("(")[1].split(" ")[0]);

                    starRatingHTML = this.responseXML.getElementById("effective-timeperiod-rating-year-description");
                    let sellerName = this.responseXML.getElementById("seller-name").innerText;                    
                    let starRating = parseFloat(starRatingHTML.innerHTML);

                    let sellerData = null;
                    
                    if(sellerName !== null) {
                        percentage5Star = ratingsObject.star5;
                        percentage4Star = ratingsObject.star4;
                        percentage3Star = ratingsObject.star3;
                        percentage2Star = ratingsObject.star2;
                        percentage1Star = ratingsObject.star1;
                        
                        sellerData = {
                            sellerID: sellerID,
                            sellerName: sellerName,
                            sellerLink: merchantLinkFull,
                            starRating: starRating,
                            countRatings: countRatings,    
                            percentage1Star: percentage1Star,
                            percentage2Star: percentage2Star,
                            percentage3Star: percentage3Star,
                            percentage4Star: percentage4Star,
                            percentage5Star: percentage5Star,
                            lastUpdated: new Date()
                        }


                        cachedData = sellerData;
                        if(bUpdateData) {
                            updateData(sellerData.sellerID, (data) => {
                                data.sellerID = sellerData.sellerID; //sellerID is unlikely to change. But update it anyway just in case
                                data.sellerName = sellerData.sellerName //sellerName is unlikely to change. But update it anyway just in case
                                data.sellerLink = sellerData.sellerLink //sellerLink is unlikely to change. But update it anyway just in case
                                data.starRating = sellerData.starRating;
                                data.countRatings = sellerData.countRatings;
                                data.percentage1Star = sellerData.percentage1Star;
                                data.percentage2Star = sellerData.percentage2Star;
                                data.percentage3Star = sellerData.percentage3Star;
                                data.percentage4Star = sellerData.percentage4Star;
                                data.percentage5Star = sellerData.percentage5Star;
                                data.lastUpdated = sellerData.lastUpdated;

                            });
                        }
                        else {
                            cacheData(sellerData, (event)=>{
                                console.log("data cached succesfully");
                            });
                        }

                        injectSellerRating(sellerData);
                    }
                }
                
                xhr.onerror = function(e) {
                    console.log("Couldn't fetch merchant page. Status: " + e.target.status);
                }

                xhr.open("GET", merchantLinkFull, true);
                xhr.responseType = "document";
                xhr.send();
            } //count <= 0 end
        }); //getIDCount end

        function injectSellerRating(cachedData){
                        
            let sellerName = cachedData.sellerName;
            let sellerLink = cachedData.sellerLink;
            let countRatings = cachedData.countRatings;
            let starRating = cachedData.starRating;

            if(cachedData === null) {
                fetch(browser.runtime.getURL('html/templateMerchantRatingFail.html'))
                .then(r => r.text())
                .then(html => {
                    shadowDom.innerHTML = html;                    
                });
                return;
            }
                        

            let starOutlineUrl = browser.runtime.getURL('32_greyOutline.png');
            let starUrl = browser.runtime.getURL("32_grey.png")
            let starHalfUrl = browser.runtime.getURL("32_greyHalf.png");

            let starOutlineHtml = `<img width="16" height="16" src='${starOutlineUrl}' />`
            let starHtml = `<img width="16" height="16" src='${starUrl}' />`            
            let starHalfHtml = `<img width="16" height="16" src='${starHalfUrl}' />`

            let divPrevious = document.getElementById("zeitgeistBadge_feature_div"); //best selling rank
            if(divPrevious === null) {
                divPrevious = document.getElementById("ask_feature_div"); //Asked questions div
            }
            if(divPrevious === null) {
                divPrevious = document.getElementById("averageCustomerReviews")
            }
            if(divPrevious === null) {
                divPrevious = document.getElementById("averageCustomerReviews_feature_div");
            }

            let starCountFull = Math.floor(cachedData.starRating);
            let fract = cachedData.starRating - starCountFull;
            let starCountHalf = Math.round(fract/0.5);
            if(starCountHalf > 1) {
                starCountHalf = 0;
                starCountFull++;
            }

            let starHtmlFull = '';
            for(let i=0;i <starCountFull; i++) {
                starHtmlFull += starHtml;
            }
            for(i=0;i<starCountHalf;i++) {
                starHtmlFull += starHalfHtml;
            }
            for(let i=0; i<(5-starCountFull-starCountHalf);i++) {
                starHtmlFull += starOutlineHtml;
            }
            
        
            let shadowRoot = document.createElement("div");
            divPrevious.after(shadowRoot);
            let shadowDom = shadowRoot.attachShadow({mode: "closed"});
            let link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = browser.runtime.getURL("html/main.css")+"?version=" + Date.now();
            shadowDom.appendChild(link);

            fetch(browser.runtime.getURL('html/templateMerchantRating.html'))
            .then(r => r.text())
            .then(html => {
                                
                let countRatingsFormatted = countRatings.toLocaleString();

                let htmlUpdated = html.replace("_placeHolderStars_", starHtmlFull)
                .replace("_placeHolderRatingCount_", countRatingsFormatted)
                .replace("_placeHolderSellerLink_", sellerLink)
                .replace("_placeHolderSellerName_", sellerName);

                createRatingPopupHTML(cachedData, starHtmlFull, sellerName, sellerLink, countRatings, starRating)
                .then(html2 => { 
                    
                    shadowDom.innerHTML += htmlUpdated + html2;
                    
                    let iconPopovers = document.querySelectorAll(".a-icon.a-icon-popover");
                    
                    let style = null;
                    for(icon of iconPopovers) {
                        let defaultView = (icon.ownerDocument || document).defaultView;
                        style = defaultView.getComputedStyle(icon, null); //get a reference to to the computed style of the popover icon
                        let w = style.getPropertyValue("width")
                        w = w.replace("px", "");
                        w = parseInt(w);

                        if(!isNaN(w) && w > 0) { //there are iconpopovers with width 0. We only want the ones with width > 0                                
                            break;
                        }
                    }
                    

                    if (style.cssText !== '') {
                        shadowDom.getElementById("a-icon-popover").style.cssText = style.cssText; //paste the styles into the icon element
                    } else {
                        const cssText = Object.values(style).reduce(
                            (css, propertyName) =>
                                `${css}${propertyName}:${style.getPropertyValue(
                                    propertyName
                                )};`
                        );
                    
                        shadowDom.getElementById("a-icon-popover").style.cssText = cssText //paste the styles into the icon element
                    }

                    
                            
                    setTimeout(() => {

                        function getAbsolutePosition(element) {
                            const r = element.getBoundingClientRect();
                            return {
                                left: r.left + window.scrollX,
                                top: r.top + window.scrollY,
                                right: r.right + window.scrollX,
                                bottom: r.bottom + window.scrollY,
                                originalRect: r                                    
                            };
                        }

                        let ratingStarsElement = shadowDom.getElementById('ratingStars');
                        

                        let merchantRatingPopup = shadowDom.getElementById('merchantRatingPopup');

                        let funcSetPopupPositon = function() {
                            let rect = getAbsolutePosition(ratingStarsElement);                                

                            let rectMerchantPopup = merchantRatingPopup.getBoundingClientRect();

                            let xPosMidElement = rect.left + rect.originalRect.width/2.0;
                            let xPosFinal = xPosMidElement - rectMerchantPopup.width/2.0;
                        
                            merchantRatingPopup.style.left = xPosFinal + "px";
                            merchantRatingPopup.style.top = rect.bottom + "px";
                        };

                        timeoutIDHidePopupOpacity = 0;
                        timeoutIDHidePopupVisibility = 0;

                        
                        let funcShowPopup = function() {
                            clearTimeout(timeoutIDHidePopupOpacity);
                            clearTimeout(timeoutIDHidePopupVisibility);
                            merchantRatingPopup.style.opacity = 1;
                            //merchantRatingPopup.style.display = "block";
                            merchantRatingPopup.style.visibility = "visible"
                            funcSetPopupPositon();
                        }
                        
                        window.onresize = funcSetPopupPositon;

                        ratingStarsElement.onmouseover = funcShowPopup;
                        merchantRatingPopup.onmouseover = funcShowPopup;
                        

                        funcHidePopup = function() {
                            clearTimeout(timeoutIDHidePopupOpacity);
                            clearTimeout(timeoutIDHidePopupVisibility);

                            timeoutIDHidePopupOpacity = setTimeout(() => {
                                //merchantRatingPopup.style.display = "none";                                    
                                merchantRatingPopup.style.opacity = 0;
                            }, 250);
                            timeoutIDHidePopupVisibility = setTimeout(() => {
                                merchantRatingPopup.style.visibility = "hidden";
                                merchantRatingPopup.style.top = "-1000px";
                            }, 500);                                
                        };

                        ratingStarsElement.onmouseleave = funcHidePopup;
                        merchantRatingPopup.onmouseleave = funcHidePopup;

                        
                                            
                    }, 0);
                    
                    
                });                    
                
            });
        }

    } //merchantLinkRelative!=null end
}