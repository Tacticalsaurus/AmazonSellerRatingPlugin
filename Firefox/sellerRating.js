document.body.style.border = "5px solid red" 

let tempData = {
    sellerID: "A1V6B6X13IP732",
    sellerName: "Amazon.com Services LLC",
    rating: 4.5,
    ratingCount: 1000,    
    ratingCount1Stars: 31,
    ratingCount2Stars: 30,
    ratingCount3Stars: 30,
    ratingCount4Stars: 30,
    ratingCount5stars: 30,
    lastUpdated: new Date()
}
//tempData = { sellerID: "A1V6B6X13IP445", rating: 4.5, ratingCount: 1000 };

let database = null;
let db = null;
initDatabase((db)=> {
    database = db;
});

setTimeout(() => {
    /*cacheData(database, tempData, (event) => {
        console.log("data cached");
        
    });*/

    /*getData(database, "A1V6B6X13IP732", (event, data) => {
        console.log(data.sellerName);
        data.ratingCount = 2222;
        
    });*/

    updateData(database, "A1V6B6X13IP732", (data)=>{
        data.ratingCount = 2222;
    });
}, 3000);




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
    sellerInfo = document.getElementById("merchant-info")
}

if(sellerInfo != null) {

    let anchors = sellerInfo.getElementsByTagName("a");
    let links = sellerInfo.getElementsByClassName("a-link-normal")    

    let merchantLinkRelative = null

    if(anchors!==null && anchors.length > 0) {
        for(element of anchors) {
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

        let hostName = hostName0 + "//"+ hostName1;
        const merchantLinkFull = hostName + merchantLinkRelative

        console.log("full link>>" + merchantLinkFull)

        let xhr = new XMLHttpRequest();

        xhr.onload = function () {
            console.log(this.responseXML)
            
            let countRatings = 0;
            let starCountHtml = null;
                
            let ratings = this.responseXML.querySelector(`[data-a-state='{"key":"twelveMonthRatingsData"}']`)
            let ratingsObject = JSON.parse(ratings.innerHTML);

            countRatings = ratingsObject.ratingCount;//parseInt(ratingPercentageText.split("(")[1].split(" ")[0]);

            starCountHtml = this.responseXML.getElementById("effective-timeperiod-rating-year-description");
        
            
            
            let sellerName = this.responseXML.getElementById("seller-name").innerText;
            
            let divPrevious = document.getElementById("zeitgeistBadge_feature_div"); //best selling rank
            if(divPrevious == null) {
                divPrevious = document.getElementById("ask_feature_div"); //Asked questions div
            }
            if(divPrevious == null) {
                divPrevious = document.getElementById("averageCustomerReviews")
            }
            if(divPrevious == null) {
                divPrevious = document.getElementById("averageCustomerReviews_feature_div");
            }


            let starOutlineUrl = browser.runtime.getURL('32_greyOutline.png');
            let starUrl = browser.runtime.getURL("32_grey.png")
            let starHalfUrl = browser.runtime.getURL("32_greyHalf.png");

            let starOutlineHtml = `<img width="16" height="16" src='${starOutlineUrl}' />`
            let starHtml = `<img width="16" height="16" src='${starUrl}' />`            
            let starHalfHtml = `<img width="16" height="16" src='${starHalfUrl}' />`

            let starCount = parseFloat(starCountHtml.innerHTML);
            let starCountFull = Math.floor(starCount);
            let fract = starCount - starCountFull;
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

            if(sellerName!=null) {

                fetch(browser.runtime.getURL('html/templateMerchantRating.html'))
                .then(r => r.text())
                .then(html => {
                                      
                    let ratingsFormatted = countRatings.toLocaleString();
                    let htmlUpdated = html.replace("_placeHolderStars_", starHtmlFull)
                    .replace("_placeHolderRatingCount_", ratingsFormatted)
                    .replace("_placeHolderSellerLink_", merchantLinkFull)
                    .replace("_placeHolderSellerName_", sellerName);
                    

                    createRatingPopupHTML(this.responseXML, starHtmlFull, starCount, ratingsFormatted
                        , sellerName, merchantLinkFull)                 
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
            else {

                fetch(browser.runtime.getURL('html/templateMerchantRatingFail.html'))
                .then(r => r.text())
                .then(html => {
                    shadowDom.innerHTML = html;                    
                });
               
            }

            //divPrevious.after(iframeMerchantDetails);
            
        }
        testFunction();
        xhr.onerror = function(e) {
            console.log("Couldn't fetch merchant page. Status: " + e.target.status);
        }

        xhr.open("GET", merchantLinkFull, true);
        xhr.responseType = "document";
        xhr.send();
    }
}